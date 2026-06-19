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
        for (let i = DropState.dropScore = 0; i < DropState.dropCount; i++ ) 
            DropState.dropScore += 7 * DropState.dropType[i] + 3 * DropState.dropValue[i] + 11 * DropState.dropMeta[i];
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
    for (let i = DropState.dropScore = 0; i < DropState.dropCount; i++) 
        DropState.dropScore += 7 * DropState.dropType[i] + 3 * DropState.dropValue[i] + 11 * DropState.dropMeta[i]
}


export function isDropTypeAbsent(typeIdx) { // dl
    if (2 == typeIdx) return true;
    for (let b = 0; b < DropState.dropCount; b++)
        if (DropState.dropType[b] == typeIdx) return false;
    return true
}


export function updateDrops() { // zg
    // another anti-tampering code
    // b = 0;
    // for (let a = 0; a < DropState.dropCount; a++)
    //     b += 7 * DropState.dropType[a] + 3 * DropState.dropValue[a] + 11 * DropState.dropMeta[a];
    // if (dropScore != b) {
    //     frameBufferArray = null;
    // }
    for (let i = 0; i < DropState.dropCount; i++) {
        DropState.dropVel[i].y += .04;
        RMath.Vec2Scale(DropState.dropVel[i], .98);
        let c = RMath.clamp(DropState.dropPos[i].y + DropState.dropVel[i].y, 8, 8 * StageState.stageHeight + 16 - 1);
        let b = getStageTileAt(DropState.dropPos[i].x, c);
        if (!(0 <= b && 23 >= b || 24 <= b && 26 >= b && 0 < DropState.dropVel[i].y)) {
            DropState.dropPos[i].y = c
        }
        if (c > 8 * StageState.stageHeight + 12) {
            if (isBadgeIncompleteForCurrentStage(29)) {
                if (2 == DropState.dropType[i]) {
                    IncrementBadgeCount(29);
                }
            }
            removeDrop(i--);
        } else {
            let newX = RMath.clamp(DropState.dropPos[i].x + DropState.dropVel[i].x, 16, 623);
            let b = getStageTileAt(newX, DropState.dropPos[i].y);

            if (!(0 <= b && 23 >= b)) 
                DropState.dropPos[i].x = newX;
            if (100 > DropState.dropState[i]) {
                DropState.dropState[i]++;
            } else if (-1 != findNearestPartyMemberInRect(DropState.dropPos[i].x, DropState.dropPos[i].y - 6, 12, 12, 1)) {
                if (2 == DropState.dropType[i]) {
                    PartyState.partyGold = RMath.clamp(PartyState.partyGold + DropState.dropValue[i], 0, 9999999);
                    spawnPopup(DropState.dropPos[i].x, DropState.dropPos[i].y, 0, DropState.dropValue[i], 60, 16776960);
                } else if (3 == DropState.dropType[i]) {
                    StageState.stageEventFlagArray[DropState.dropValue[i]] = 1;
                    PartyState.collectedStageFlagsCount++;
                } else if (PartyState.itemForgeLvls[DropState.dropType[i]] < DropState.dropValue[i]) {
                    PartyState.itemForgeLvls[DropState.dropType[i]] = DropState.dropValue[i];
                    PartyState.itemIsNew[DropState.dropType[i]] = 1;
                }
                if (isBadgeIncompleteForCurrentStage(24)) {
                    if (2 == DropState.dropType[i] && 225 <= DropState.dropValue[i]) {
                        IncrementBadgeCount(24);
                    }
                }
                removeDrop(i--);
            }
        }
    }
}

export function drawDrops() { // Dg
    RenderingState.spriteAltRenderFlag = 2;
    for (let a = 0; a < DropState.dropCount; a++) {

        if (100 == DropState.dropState[a] || DropState.dropState[a] & 6)
            drawSpriteSheetPart(LoadedSprites.droppedItemSpriteSheet,
                DropState.dropPos[a].x - 6, DropState.dropPos[a].y - 12,
                12, 12,
                12 * itemList[DropState.dropType[a]][ItemProps.DropIconCol], 0,
                12, 12,
                itemList[DropState.dropType[a]][ItemProps.SpriteSourceX]
            );
        }
    RenderingState.spriteAltRenderFlag = 0
}