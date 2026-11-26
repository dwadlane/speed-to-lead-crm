import { defineApplication } from 'twenty-sdk/define';

import {
  ANTHROPIC_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  BUSINESS_CONTEXT_VARIABLE_UNIVERSAL_IDENTIFIER,
  INTAKE_SECRET_VARIABLE_UNIVERSAL_IDENTIFIER,
  OVERDUE_MINUTES_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  applicationVariables: {
    ANTHROPIC_API_KEY: {
      universalIdentifier: ANTHROPIC_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
      description: 'Used to draft first replies. Without it, inquiries still save.',
      isSecret: true,
    },
    INTAKE_SECRET: {
      universalIdentifier: INTAKE_SECRET_VARIABLE_UNIVERSAL_IDENTIFIER,
      description: 'Shared secret sent in the x-intake-secret header.',
      isSecret: true,
    },
    BUSINESS_CONTEXT: {
      universalIdentifier: BUSINESS_CONTEXT_VARIABLE_UNIVERSAL_IDENTIFIER,
      description: 'Facts the draft may use: services, area, hours, booking link.',
      value: '',
    },
    OVERDUE_MINUTES: {
      universalIdentifier: OVERDUE_MINUTES_VARIABLE_UNIVERSAL_IDENTIFIER,
      description: 'Minutes without a reply before an inquiry is overdue.',
      value: '15',
    },
  },
});
