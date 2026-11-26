import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { FLAG_OVERDUE_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type Client, sweepOverdue } from 'src/logic-functions/utils/inquiry-flow.util';
import { parseOverdueMinutes } from 'src/logic-functions/utils/inquiry.util';

const handler = async () => {
  const client = new CoreApiClient() as unknown as Client;

  return sweepOverdue(client, new Date(), parseOverdueMinutes(process.env.OVERDUE_MINUTES));
};

export default defineLogicFunction({
  universalIdentifier: FLAG_OVERDUE_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'flag-overdue',
  description: 'Marks inquiries overdue when nobody has replied in time.',
  timeoutSeconds: 60,
  handler,
  cronTriggerSettings: { pattern: '*/5 * * * *' },
});
