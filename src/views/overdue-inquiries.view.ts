import {
  defineView,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-sdk/define';

import {
  DRAFT_REPLY_FIELD_UNIVERSAL_IDENTIFIER,
  INQUIRY_OBJECT_UNIVERSAL_IDENTIFIER,
  IS_OVERDUE_FIELD_UNIVERSAL_IDENTIFIER,
  MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  NAME_FIELD_UNIVERSAL_IDENTIFIER,
  OVERDUE_VIEW_DRAFT_UNIVERSAL_IDENTIFIER,
  OVERDUE_VIEW_FILTER_GROUP_UNIVERSAL_IDENTIFIER,
  OVERDUE_VIEW_FILTER_UNIVERSAL_IDENTIFIER,
  OVERDUE_VIEW_MESSAGE_UNIVERSAL_IDENTIFIER,
  OVERDUE_VIEW_NAME_UNIVERSAL_IDENTIFIER,
  OVERDUE_VIEW_PHONE_UNIVERSAL_IDENTIFIER,
  OVERDUE_VIEW_RECEIVED_AT_UNIVERSAL_IDENTIFIER,
  OVERDUE_VIEW_SORT_UNIVERSAL_IDENTIFIER,
  OVERDUE_VIEW_UNIVERSAL_IDENTIFIER,
  PHONE_FIELD_UNIVERSAL_IDENTIFIER,
  RECEIVED_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: OVERDUE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Still waiting',
  objectUniversalIdentifier: INQUIRY_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconAlertTriangle',
  position: 1,
  fields: [
    { universalIdentifier: OVERDUE_VIEW_NAME_UNIVERSAL_IDENTIFIER, fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 200 },
    { universalIdentifier: OVERDUE_VIEW_PHONE_UNIVERSAL_IDENTIFIER, fieldMetadataUniversalIdentifier: PHONE_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 140 },
    { universalIdentifier: OVERDUE_VIEW_RECEIVED_AT_UNIVERSAL_IDENTIFIER, fieldMetadataUniversalIdentifier: RECEIVED_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 150 },
    { universalIdentifier: OVERDUE_VIEW_MESSAGE_UNIVERSAL_IDENTIFIER, fieldMetadataUniversalIdentifier: MESSAGE_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 280 },
    { universalIdentifier: OVERDUE_VIEW_DRAFT_UNIVERSAL_IDENTIFIER, fieldMetadataUniversalIdentifier: DRAFT_REPLY_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 280 },
  ],
  filterGroups: [
    { universalIdentifier: OVERDUE_VIEW_FILTER_GROUP_UNIVERSAL_IDENTIFIER, logicalOperator: 'AND' },
  ],
  filters: [
    {
      universalIdentifier: OVERDUE_VIEW_FILTER_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: IS_OVERDUE_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: 'true',
      viewFilterGroupUniversalIdentifier: OVERDUE_VIEW_FILTER_GROUP_UNIVERSAL_IDENTIFIER,
      positionInViewFilterGroup: 0,
    },
  ],
  sorts: [
    { universalIdentifier: OVERDUE_VIEW_SORT_UNIVERSAL_IDENTIFIER, fieldMetadataUniversalIdentifier: RECEIVED_AT_FIELD_UNIVERSAL_IDENTIFIER, direction: ViewSortDirection.ASC },
  ],
});
