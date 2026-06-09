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


export function clearPopups() { // wm
    PopupState.popupCount = 0
}


export function spawnPopup(x, y, vx, vy, life, color) { // Lg
    if (1E3 != PopupState.popupCount) {
        x = RMath.clamp(x, 16, 623);
        y = RMath.clamp(y, 8, 351);
        RMath.Vec2Set(PopupState.popupPos[PopupState.popupCount], x, y);
        RMath.Vec2Set(PopupState.popupVel[PopupState.popupCount], vx, -2);
        if (0 != vx) {
            PopupState.popupVel[PopupState.popupCount].x += RMath.randFloatRange(-.2, .2);
            if (PopupState.popupVel[PopupState.popupCount].y += RMath.randFloatRange(-.2, .2)) {

                PopupState.popupValue[PopupState.popupCount] = vy;
                PopupState.popupLife[PopupState.popupCount] = life;
                PopupState.popupColor[PopupState.popupCount] = color;
                PopupState.popupCount++;
            }
        }
    }

}


export function removePopup(idx) { // xm
    PopupState.popupPos[idx].set(PopupState.popupPos[PopupState.popupCount - 1]);
    PopupState.popupVel[idx].set(PopupState.popupVel[PopupState.popupCount - 1]);
    PopupState.popupValue[idx] = PopupState.popupValue[PopupState.popupCount - 1];
    PopupState.popupLife[idx] = PopupState.popupLife[PopupState.popupCount - 1];
    PopupState.popupColor[idx] = PopupState.popupColor[PopupState.popupCount - 1];
    PopupState.popupCount--
}


export function updatePopups() { // Ag
    let a;
    for (a = 0; a < PopupState.popupCount; a++) {
        if (0 == PopupState.popupVel[a].x) {
            var b = PopupState.popupPos[a],
                c = PopupState.popupVel[a];
            c.y += 0;
            RMath.Vec2Scale(c, .95);
        } else {
            b = PopupState.popupPos[a];
            c = PopupState.popupVel[a];
            c.y += .05;
            RMath.Vec2Scale(c, .99);
        }
        b.add(c);
        PopupState.popupPos[a].x = RMath.clamp(PopupState.popupPos[a].x, 16, 623);
        PopupState.popupPos[a].y = RMath.clamp(PopupState.popupPos[a].y, 8, 351);
        PopupState.popupLife[a]--;
        if (0 >= PopupState.popupLife[a]) {
            removePopup(a--);
        }
    }
}


export function drawPopups() { // Fg
    let a, b, c, d, f;
    for (a = 0; a < PopupState.popupCount; a++)
        if (20 <= PopupState.popupLife[a]) {
            drawTextCentered(LoadedFonts.gameFontSmall, ~~PopupState.popupPos[a].x, ~~PopupState.popupPos[a].y, "" + PopupState.popupValue[a], PopupState.popupColor[a], 0);
        } else {
            b = PopupState.popupColor[a] >> 16 & 255;
            c = PopupState.popupColor[a] >> 8 & 255;
            d = PopupState.popupColor[a] & 255;
            f = RMath.floor(255 * RMath.min(PopupState.popupLife[a], 20) / 20);
            drawScaledTintedTextCentered(LoadedFonts.gameFontSmall, ~~PopupState.popupPos[a].x, ~~PopupState.popupPos[a].y, "" + PopupState.popupValue[a], b, c, d, f, 0, 0, 0, f, 5, 7);
        }

}