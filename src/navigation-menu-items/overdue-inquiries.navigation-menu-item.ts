import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  OVERDUE_NAVIGATION_ITEM_UNIVERSAL_IDENTIFIER,
  OVERDUE_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: OVERDUE_NAVIGATION_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Still waiting',
  icon: 'IconAlertTriangle',
  position: -1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: OVERDUE_VIEW_UNIVERSAL_IDENTIFIER,
});
