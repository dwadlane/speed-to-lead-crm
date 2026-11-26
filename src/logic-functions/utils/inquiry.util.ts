import { createHash, timingSafeEqual } from 'node:crypto';

export const INQUIRY_SOURCES = ['WEB_FORM', 'MISSED_CALL', 'EMAIL', 'OTHER'] as const;
export const AWAITING_REPLY_STATUSES = ['NEW', 'DRAFTED'];
export const REPLIED_STATUSES = ['REPLIED', 'BOOKED'];

const MAX_MESSAGE_LENGTH = 4000;
const MAX_FIELD_LENGTH = 200;
const DEFAULT_OVERDUE_MINUTES = 15;

export type InquiryInput = {
  externalId: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  message: string;
  source: (typeof INQUIRY_SOURCES)[number];
};

type ParseResult =
  | { ok: true; value: InquiryInput }
  | { ok: false; error: string };

const cleanText = (value: unknown, maxLength: number): string =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

// Names and ids sit inside prompts and lists, so they never carry line breaks.
const oneLine = (value: string): string => value.replace(/\s+/g, ' ').trim();

const looksLikeEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

const looksLikePhone = (value: string): boolean => {
  const digits = value.replace(/\D/g, '');

  return /^[\d\s()+.\-x]+$/i.test(value) && digits.length >= 7 && digits.length <= 15;
};

export const parseInquiry = (body: unknown): ParseResult => {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Body must be a JSON object' };
  }

  const fields = body as Record<string, unknown>;
  const rawEmail = oneLine(cleanText(fields.email, MAX_FIELD_LENGTH));
  const rawPhone = oneLine(cleanText(fields.phone, MAX_FIELD_LENGTH));

  // A bad value is dropped rather than saved, so a lead with one good way to reply is kept.
  const contactEmail = looksLikeEmail(rawEmail) ? rawEmail : '';
  const contactPhone = looksLikePhone(rawPhone) ? rawPhone : '';

  if (contactEmail === '' && contactPhone === '') {
    return {
      ok: false,
      error:
        rawEmail !== '' || rawPhone !== ''
          ? 'The email or phone number does not look valid'
          : 'An email or phone number is required',
    };
  }

  const source = INQUIRY_SOURCES.find((option) => option === fields.source);

  return {
    ok: true,
    value: {
      externalId: oneLine(cleanText(fields.externalId, MAX_FIELD_LENGTH)),
      name: oneLine(cleanText(fields.name, MAX_FIELD_LENGTH)) || contactEmail || contactPhone,
      contactEmail,
      contactPhone,
      message: cleanText(fields.message, MAX_MESSAGE_LENGTH),
      source: source ?? 'OTHER',
    },
  };
};

export const secretsMatch = (provided: unknown, expected: string): boolean => {
  if (typeof provided !== 'string' || provided === '' || expected === '') {
    return false;
  }

  const hash = (value: string) => createHash('sha256').update(value).digest();

  return timingSafeEqual(hash(provided), hash(expected));
};

export const minutesBetween = (from: string, to: Date): number =>
  Math.max(0, Math.round((to.getTime() - new Date(from).getTime()) / 60000));

export const parseOverdueMinutes = (value: string | undefined): number => {
  const minutes = Number(value);

  return Number.isFinite(minutes) && minutes > 0
    ? minutes
    : DEFAULT_OVERDUE_MINUTES;
};

export const isInquiryOverdue = (
  inquiry: { status: string; receivedAt: string | null; createdAt?: string | null },
  now: Date,
  overdueMinutes: number,
): boolean => {
  // Inquiries added by hand have no receivedAt, so fall back on when the record was created.
  const since = inquiry.receivedAt ?? inquiry.createdAt ?? null;

  return (
    since !== null &&
    AWAITING_REPLY_STATUSES.includes(inquiry.status) &&
    Math.floor((now.getTime() - new Date(since).getTime()) / 60000) >= overdueMinutes
  );
};
