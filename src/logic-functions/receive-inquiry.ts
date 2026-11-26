import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { Response, type RoutePayload } from 'twenty-sdk/logic-function';

import { RECEIVE_INQUIRY_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { draftReply } from 'src/logic-functions/utils/draft-reply.util';
import {
  type Client,
  findByExternalId,
  saveDraft,
} from 'src/logic-functions/utils/inquiry-flow.util';
import {
  parseInquiry,
  secretsMatch,
} from 'src/logic-functions/utils/inquiry.util';

const json = (body: object, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// The inquiry is saved before drafting, so a failed draft never loses a lead.
const handler = async (event: RoutePayload): Promise<Response> => {
  if (
    !secretsMatch(
      event.headers['x-intake-secret'],
      process.env.INTAKE_SECRET ?? '',
    )
  ) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  const parsed = parseInquiry(event.body);

  if (!parsed.ok) {
    return json({ success: false, error: parsed.error }, 400);
  }

  const client = new CoreApiClient() as unknown as Client;
  const existingId = await findByExternalId(client, parsed.value.externalId);

  if (existingId) {
    return json({ success: true, inquiryId: existingId, duplicate: true }, 200);
  }

  const created = await client.mutation({
    createInquiry: {
      __args: {
        data: {
          ...parsed.value,
          externalId: parsed.value.externalId || undefined,
          status: 'NEW',
          receivedAt: new Date().toISOString(),
        },
      },
      id: true,
    },
  });
  const inquiryId = created.createInquiry?.id;

  if (!inquiryId) {
    throw new Error('Inquiry was not created');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return json({ success: true, inquiryId, drafted: false }, 201);
  }

  try {
    const draft = await draftReply(
      parsed.value,
      apiKey,
      process.env.BUSINESS_CONTEXT ?? '',
    );

    const saved = await saveDraft(client, inquiryId, draft);

    return json({ success: true, inquiryId, drafted: saved }, 201);
  } catch (error) {
    console.error('Draft failed, inquiry kept', error);

    return json({ success: true, inquiryId, drafted: false }, 201);
  }
};

export default defineLogicFunction({
  universalIdentifier: RECEIVE_INQUIRY_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'receive-inquiry',
  description: 'Saves an inquiry and drafts a first reply for a person to send.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/inquiries',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['x-intake-secret'],
  },
});
