import { ItemProps, ModifierColumns, AccessoryPrefixes, AccessoryProps } from "./item_enums.js";
import { enemyCatalog, enemyDispatchTable, enemyHitboxHalfHeightByBehavior, enemyHitboxHalfWidthByBehavior, enemySpriteAnchorYBySpriteIndex, enemyTypeCount } from "./enemy_list.js";
import { EnemyProps, BehaviorTypes } from "./enemy_enums.js";
import { itemList } from "./item_list.js";
import * as RMath from "./math.js";
import { badgeCount, badgeList, stageBadgeRewardItemIdxByStage } from "./badge_list.js";
import { StageProps } from "./stage_enums.js";
import { bestiaryPageItems, stageCount, stageIndexOrder, stageListArray } from "./stage_data.js";
import { loadSprite, Sprite, spriteCreateBuffer, uncheckedSpriteCount } from "./sprite.js";
import { GameFont } from "./font.js";
import { BadgeState, BestiaryState, CanvasState, GameState, GameStateChecksum, GUIState, KeyboardState, MouseState, RenderingState, SaveState } from "./global_states.js";
import * as Consts from "./consts.js"
import { LoadedSprites } from "./game_sprites.js";
import { charKerningAfter, charKerningBefore, LoadedFonts } from "./game_fonts.js";
import { inventoryItemLists, PartyState } from "./party_state.js";
import { shrineRewardClaimed, shrineRewardClaimSlotCount, shrineRewardOptions } from "./shrine_data.js";
import { GameplayState, HeroesState } from "./heroes.js";
import { StageState } from "./stages.js";
import { EnemyState } from "./enemy_state.js";
import { ProjectileState } from "./projectile_state.js";
import { PopupState } from "./popup_state.js";
import { DropState } from "./drop_state.js";


export function isBadgeIncompleteForCurrentStage(badgeIdx) { // A
    return GUIState.currentStage == badgeList[badgeIdx][2] && BadgeState.badgeCounterArray[badgeIdx] != badgeList[badgeIdx][4] ? true : false
}


export function IncrementBadgeCount(badgeIndex) {
    BadgeState.badgeCounterArray[badgeIndex]++;
    if (BadgeState.badgeCounterArray[badgeIndex] == badgeList[badgeIndex][4]) {
        BadgeState.lastCompletedBadgeIdx = badgeIndex;
        BadgeState.badgePopupTimer = 120;
        var b = 0;
        badgeIndex = badgeList[badgeIndex][2];
        for (var c = 0; c < badgeList.length; c++) {
            if (
                badgeList[c] &&
                badgeIndex == badgeList[c][2] &&
                BadgeState.badgeCounterArray[c] == badgeList[c][4]
            ) {
                b++;
            }
        }
        if (5 == b) {
            PartyState.itemForgeLvls[stageBadgeRewardItemIdxByStage[badgeIndex]] = 1;
            PartyState.itemIsNew[stageBadgeRewardItemIdxByStage[badgeIndex]] = 1;
        }
    }
}