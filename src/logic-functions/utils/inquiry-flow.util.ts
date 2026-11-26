import {
  AWAITING_REPLY_STATUSES,
  isInquiryOverdue,
  minutesBetween,
  REPLIED_STATUSES,
} from 'src/logic-functions/utils/inquiry.util';

// The three handlers keep their logic here so it can be tested with a stand in client.
// The real client is CoreApiClient from twenty-client-sdk.
export type Client = {
  query: (query: any) => Promise<any>;
  mutation: (mutation: any) => Promise<any>;
};

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

const update = (client: Client, id: string, data: Record<string, unknown>) =>
  client.mutation({ updateInquiry: { __args: { id, data }, id: true } });

export type InquiryAfter = {
  status: string;
  receivedAt: string | null;
  createdAt?: string | null;
  firstReplyAt: string | null;
  isOverdue?: boolean | null;
};

/**
 * Runs when an inquiry's status changes.
 * - Any status that is no longer "waiting" (replied, booked, lost) clears the overdue flag.
 * - The first move to replied or booked also stamps the reply time, once.
 */
export const recordStatusChange = async (
  client: Client,
  recordId: string,
  after: InquiryAfter,
  now: Date,
): Promise<{ recorded: boolean }> => {
  if (AWAITING_REPLY_STATUSES.includes(after.status)) {
    return { recorded: false };
  }

  const data: Record<string, unknown> = {};
  const since = after.receivedAt ?? after.createdAt ?? null;

  if (after.isOverdue !== false) {
    data.isOverdue = false;
  }

  if (REPLIED_STATUSES.includes(after.status) && after.firstReplyAt === null && since !== null) {
    data.firstReplyAt = now.toISOString();
    data.minutesToFirstReply = minutesBetween(since, now);
  }

  if (Object.keys(data).length === 0) {
    return { recorded: false };
  }

  await update(client, recordId, data);

  return { recorded: 'firstReplyAt' in data };
};

type Node = { id: string; status: string; receivedAt: string | null; createdAt: string | null };

const fetchPages = async (client: Client, filter: Record<string, unknown>): Promise<Node[]> => {
  const nodes: Node[] = [];
  let after: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await client.query({
      inquiries: {
        __args: {
          first: PAGE_SIZE,
          filter,
          orderBy: [{ createdAt: 'AscNullsFirst' }],
          ...(after ? { after } : {}),
        },
        edges: { node: { id: true, status: true, receivedAt: true, createdAt: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });
    const connection = result.inquiries;

    nodes.push(...((connection?.edges ?? []) as { node: Node }[]).map((edge) => edge.node));

    if (!connection?.pageInfo?.hasNextPage || !connection.pageInfo.endCursor) {
      break;
    }

    after = connection.pageInfo.endCursor;
  }

  return nodes;
};

/**
 * Runs on a timer.
 * 1. Flags waiting inquiries that are past the limit. Each one is read again just before the
 *    write, so a reply recorded a moment ago is not undone.
 * 2. Clears the flag on anything that is flagged but no longer waiting (heals any race).
 */
export const sweepOverdue = async (
  client: Client,
  now: Date,
  overdueMinutes: number,
): Promise<{ flagged: number; cleared: number }> => {
  const waiting = await fetchPages(client, {
    isOverdue: { eq: false },
    status: { in: AWAITING_REPLY_STATUSES },
  });
  const due = waiting.filter((inquiry) => isInquiryOverdue(inquiry, now, overdueMinutes));
  let flagged = 0;

  for (const inquiry of due) {
    const fresh = await client.query({
      inquiries: {
        __args: { first: 1, filter: { id: { eq: inquiry.id }, status: { in: AWAITING_REPLY_STATUSES } } },
        edges: { node: { id: true } },
      },
    });

    if ((fresh.inquiries?.edges ?? []).length === 0) {
      continue;
    }

    await update(client, inquiry.id, { isOverdue: true });
    flagged += 1;
  }

  const stale = await fetchPages(client, {
    isOverdue: { eq: true },
    status: { in: ['REPLIED', 'BOOKED', 'LOST'] },
  });

  for (const inquiry of stale) {
    await update(client, inquiry.id, { isOverdue: false });
  }

  return { flagged, cleared: stale.length };
};

/** Finds an inquiry the same sender already created, so a retried request makes no second one. */
export const findByExternalId = async (client: Client, externalId: string): Promise<string | null> => {
  if (externalId === '') {
    return null;
  }

  const result = await client.query({
    inquiries: {
      __args: { first: 1, filter: { externalId: { eq: externalId } } },
      edges: { node: { id: true } },
    },
  });

  return result.inquiries?.edges?.[0]?.node?.id ?? null;
};

/**
 * Saves a draft only if it has text and the inquiry is still new.
 * Drafting can take several seconds; a person may have replied in the meantime.
 */
export const saveDraft = async (client: Client, id: string, draft: string): Promise<boolean> => {
  if (draft.trim() === '') {
    return false;
  }

  const current = await client.query({
    inquiries: {
      __args: { first: 1, filter: { id: { eq: id }, status: { eq: 'NEW' } } },
      edges: { node: { id: true } },
    },
  });

  if ((current.inquiries?.edges ?? []).length === 0) {
    return false;
  }

  await update(client, id, { draftReply: draft, status: 'DRAFTED' });

  return true;
};
