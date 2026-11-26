import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type DatabaseEventPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/logic-function';

import { RECORD_FIRST_REPLY_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  type Client,
  type InquiryAfter,
  recordStatusChange,
} from 'src/logic-functions/utils/inquiry-flow.util';

type Inquiry = InquiryAfter;

const handler = async (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<Inquiry>>,
) =>
  recordStatusChange(
    new CoreApiClient() as unknown as Client,
    event.recordId,
    event.properties.after,
    new Date(),
  );

export default defineLogicFunction({
  universalIdentifier: RECORD_FIRST_REPLY_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'record-first-reply',
  description: 'Stamps the first reply time and clears the overdue flag when an inquiry leaves the waiting list.',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'inquiry.updated',
    updatedFields: ['status'],
  },
});
