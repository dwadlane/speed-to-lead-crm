import { defineView, ViewType } from 'twenty-sdk/define';

import {
  BOARD_VIEW_IS_OVERDUE_UNIVERSAL_IDENTIFIER,
  BOARD_VIEW_NAME_UNIVERSAL_IDENTIFIER,
  BOARD_VIEW_RECEIVED_AT_UNIVERSAL_IDENTIFIER,
  BOARD_VIEW_SOURCE_UNIVERSAL_IDENTIFIER,
  BOARD_VIEW_UNIVERSAL_IDENTIFIER,
  INQUIRY_OBJECT_UNIVERSAL_IDENTIFIER,
  IS_OVERDUE_FIELD_UNIVERSAL_IDENTIFIER,
  NAME_FIELD_UNIVERSAL_IDENTIFIER,
  RECEIVED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: BOARD_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Inquiry board',
  objectUniversalIdentifier: INQUIRY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.KANBAN,
  icon: 'IconLayoutKanban',
  position: 0,
  mainGroupByFieldMetadataUniversalIdentifier: STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  shouldHideEmptyGroups: false,
  fields: [
    { universalIdentifier: BOARD_VIEW_NAME_UNIVERSAL_IDENTIFIER, fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 200 },
    { universalIdentifier: BOARD_VIEW_SOURCE_UNIVERSAL_IDENTIFIER, fieldMetadataUniversalIdentifier: SOURCE_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 120 },
    { universalIdentifier: BOARD_VIEW_RECEIVED_AT_UNIVERSAL_IDENTIFIER, fieldMetadataUniversalIdentifier: RECEIVED_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 150 },
    { universalIdentifier: BOARD_VIEW_IS_OVERDUE_UNIVERSAL_IDENTIFIER, fieldMetadataUniversalIdentifier: IS_OVERDUE_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 100 },
  ],
});
