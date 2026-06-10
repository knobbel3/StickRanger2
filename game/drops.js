import { ItemProps } from "./item_enums.js";
import { itemList } from "./item_list.js";
import * as RMath from "./math.js";
import { MouseState, RenderingState } from "./global_states.js";
import { LoadedSprites } from "./game_sprites.js"
import { PartyState } from "./party_state.js";
import { StageState } from "./stages.js";
import { DropState } from "./drop_state.js";
import { getStageTileAt } from "./stage.js";
import { IncrementBadgeCount, isBadgeIncompleteForCurrentStage } from "./badges.js"
import { findNearestPartyMemberInRect } from "./party.js";
import { spawnPopup } from "./popups.js";
import { drawSpriteSheetPart } from "./render.js";


export function clearDrops() { // bj
    DropState.dropScore = DropState.dropCount = 0
}


export function spawnDrop(_x, _y, _tidx, _val, _meta) { // Gh
    if (100 != DropState.dropCount) {
        _x = RMath.clamp(_x, 16, 623);
        _y = RMath.clamp(_y, 8, 351);
        RMath.Vec2Set(DropState.dropPos[DropState.dropCount], _x, _y);
        DropState.dropVel[DropState.dropCount].x = MouseState.mouseXCurrent < _x ?
            RMath.randFloatRange(-.5, -1) :
            RMath.randFloatRange(.5, 1);
        DropState.dropVel[DropState.dropCount].y = RMath.randFloatRange(-1, -2);
        DropState.dropType[DropState.dropCount] = _tidx;
        DropState.dropValue[DropState.dropCount] = _val;
        DropState.dropMeta[DropState.dropCount] = _meta;
        DropState.dropState[DropState.dropCount] = 0;
        DropState.dropCount++;
        for (
            _tidx = DropState.dropScore = 0; // end initialization
            _tidx < DropState.dropCount; // condition
            _tidx++ // repeat
        ) DropState.dropScore += 7 * DropState.dropType[_tidx] + 3 * DropState.dropValue[_tidx] + 11 * DropState.dropMeta[_tidx];
    }
}


export function removeDrop(a) { // Gm
    DropState.dropCount--;
    DropState.dropPos[a].set(DropState.dropPos[DropState.dropCount]);
    DropState.dropVel[a].set(DropState.dropVel[DropState.dropCount]);
    DropState.dropType[a] = DropState.dropType[DropState.dropCount];
    DropState.dropValue[a] = DropState.dropValue[DropState.dropCount];
    DropState.dropMeta[a] = DropState.dropMeta[DropState.dropCount];
    DropState.dropState[a] = DropState.dropState[DropState.dropCount];
    for (a = DropState.dropScore = 0; a < DropState.dropCount; a++) DropState.dropScore += 7 * DropState.dropType[a] + 3 * DropState.dropValue[a] + 11 * DropState.dropMeta[a]
}


export function isDropTypeAbsent(typeIdx) { // dl
    if (2 == typeIdx) return true;
    let b;
    for (b = 0; b < DropState.dropCount; b++)
        if (DropState.dropType[b] == typeIdx) return false;
    return true
}


export function updateDrops() { // zg
    let a, b, c;
    for (a = b = 0; a < DropState.dropCount; a++)
        b += 7 * DropState.dropType[a] + 3 * DropState.dropValue[a] + 11 * DropState.dropMeta[a];
    
    // if (dropScore != b) {
    //     frameBufferArray = null;
    // }
    for (a = 0; a < DropState.dropCount; a++) {
        DropState.dropVel[a].y += .04;
        RMath.Vec2Scale(DropState.dropVel[a], .98);
        c = RMath.clamp(DropState.dropPos[a].y + DropState.dropVel[a].y, 8, 8 * StageState.stageHeight + 16 - 1);
        b = getStageTileAt(DropState.dropPos[a].x, c);
        if (!(0 <= b && 23 >= b || 24 <= b && 26 >= b && 0 < DropState.dropVel[a].y)) {
            DropState.dropPos[a].y = c
        }
        if (c > 8 * StageState.stageHeight + 12) {
            if (isBadgeIncompleteForCurrentStage(29)) {
                if (2 == DropState.dropType[a]) {
                    IncrementBadgeCount(29);
                }
            }
            removeDrop(a--);
        } else {
            c = RMath.clamp(DropState.dropPos[a].x + DropState.dropVel[a].x, 16, 623);
            b = getStageTileAt(c, DropState.dropPos[a].y);
            0 <= b && 23 >= b || (DropState.dropPos[a].x = c);
            if (100 > DropState.dropState[a]) {
                DropState.dropState[a]++;
            } else if (-1 != findNearestPartyMemberInRect(DropState.dropPos[a].x, DropState.dropPos[a].y - 6, 12, 12, 1)) {
                if (2 == DropState.dropType[a]) {
                    PartyState.partyGold = RMath.clamp(PartyState.partyGold + DropState.dropValue[a], 0, 9999999);
                    spawnPopup(DropState.dropPos[a].x, DropState.dropPos[a].y, 0, DropState.dropValue[a], 60, 16776960);
                } else if (3 == DropState.dropType[a]) {
                    StageState.stageEventFlagArray[DropState.dropValue[a]] = 1;
                    PartyState.collectedStageFlagsCount++;
                } else if (PartyState.itemForgeLvls[DropState.dropType[a]] < DropState.dropValue[a]) {
                    PartyState.itemForgeLvls[DropState.dropType[a]] = DropState.dropValue[a];
                    PartyState.itemIsNew[DropState.dropType[a]] = 1;
                }
                if (isBadgeIncompleteForCurrentStage(24)) {
                    if (2 == DropState.dropType[a] && 225 <= DropState.dropValue[a]) {
                        IncrementBadgeCount(24);
                    }
                }
                removeDrop(a--);
            }
        }
    }
}

export function drawDrops() { // Dg
    let a;
    RenderingState.spriteAltRenderFlag = 2;
    for (a = 0; a < DropState.dropCount; a++)
        (100 == DropState.dropState[a] || DropState.dropState[a] & 6) &&
            drawSpriteSheetPart(LoadedSprites.droppedItemSpriteSheet,
                DropState.dropPos[a].x - 6, DropState.dropPos[a].y - 12,
                12, 12,
                12 * itemList[DropState.dropType[a]][ItemProps.DropIconCol], 0,
                12, 12,
                itemList[DropState.dropType[a]][ItemProps.SpriteSourceX]
            );
    RenderingState.spriteAltRenderFlag = 0
}