import { describe, expect, it } from 'vitest';

import { buildDraftRequest } from 'src/logic-functions/utils/draft-reply.util';
import {
  isInquiryOverdue,
  minutesBetween,
  parseInquiry,
  parseOverdueMinutes,
  secretsMatch,
} from 'src/logic-functions/utils/inquiry.util';

describe('parseInquiry', () => {
  it('rejects an inquiry with no way to reply', () => {
    expect(parseInquiry({ name: 'Sam', message: 'Hi' }).ok).toBe(false);
    expect(parseInquiry(null).ok).toBe(false);
  });

  it('accepts a phone only inquiry and falls back on the name', () => {
    const result = parseInquiry({ phone: ' +1 555 0100 ', source: 'MISSED_CALL' });

    expect(result).toMatchObject({
      ok: true,
      value: { name: '+1 555 0100', source: 'MISSED_CALL', message: '' },
    });
  });

  it('turns an unknown source into OTHER and caps long messages', () => {
    const result = parseInquiry({
      email: 'a@example.com',
      source: 'FAX',
      message: 'x'.repeat(5000),
    });

    expect(result.ok && result.value.source).toBe('OTHER');
    expect(result.ok && result.value.message.length).toBe(4000);
  });
});

describe('secretsMatch', () => {
  it('only accepts the exact secret', () => {
    expect(secretsMatch('abc', 'abc')).toBe(true);
    expect(secretsMatch('abd', 'abc')).toBe(false);
    expect(secretsMatch(undefined, 'abc')).toBe(false);
  });

  it('fails closed when no secret is configured', () => {
    expect(secretsMatch('', '')).toBe(false);
  });
});

describe('timing', () => {
  const now = new Date('2026-11-07T10:00:00Z');

  it('counts whole minutes and never goes negative', () => {
    expect(minutesBetween('2026-11-07T09:45:00Z', now)).toBe(15);
    expect(minutesBetween('2026-11-07T10:05:00Z', now)).toBe(0);
  });

  it('flags only unanswered inquiries past the limit', () => {
    const receivedAt = '2026-11-07T09:45:00Z';

    expect(isInquiryOverdue({ status: 'NEW', receivedAt }, now, 15)).toBe(true);
    expect(isInquiryOverdue({ status: 'DRAFTED', receivedAt }, now, 15)).toBe(true);
    expect(isInquiryOverdue({ status: 'REPLIED', receivedAt }, now, 15)).toBe(false);
    expect(isInquiryOverdue({ status: 'NEW', receivedAt }, now, 16)).toBe(false);
    expect(isInquiryOverdue({ status: 'NEW', receivedAt: null }, now, 15)).toBe(false);
  });

  it('falls back to 15 minutes on a bad setting', () => {
    expect(parseOverdueMinutes('30')).toBe(30);
    expect(parseOverdueMinutes('soon')).toBe(15);
    expect(parseOverdueMinutes(undefined)).toBe(15);
    expect(parseOverdueMinutes('0')).toBe(15);
  });
});

describe('buildDraftRequest', () => {
  it('forbids invented facts and carries the business facts', () => {
    const request = buildDraftRequest(
      { externalId: '', name: 'Sam', contactEmail: 'a@example.com', contactPhone: '', message: 'Quote?', source: 'WEB_FORM' },
      'Open 8 to 5.',
    );

    expect(request.system).toContain('Never invent');
    expect(request.messages[0].content).toContain('Open 8 to 5.');
  });
});
