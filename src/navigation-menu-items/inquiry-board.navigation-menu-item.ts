import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  BOARD_NAVIGATION_ITEM_UNIVERSAL_IDENTIFIER,
  BOARD_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: BOARD_NAVIGATION_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Inquiry board',
  icon: 'IconLayoutKanban',
  position: -2,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: BOARD_VIEW_UNIVERSAL_IDENTIFIER,
});
