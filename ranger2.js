/*
 The games source code use is permission :-)
*/

import { ItemProps, ModifierColumns, AccessoryPrefixes, AccessoryProps } from "./game/item_enums.js";
import { enemyCatalog, enemyDispatchTable, enemyHitboxHalfHeightByBehavior, enemyHitboxHalfWidthByBehavior, enemySpriteAnchorYBySpriteIndex, enemyTypeCount } from "./game/enemy_list.js";
import { EnemyProps, BehaviorTypes } from "./game/enemy_enums.js";
import { itemList } from "./game/item_list.js";
import * as RMath from "./game/math.js";
import { badgeCount, badgeList, stageBadgeRewardItemIdxByStage } from "./game/badge_list.js";
import { StageProps } from "./game/stage_enums.js";
import { bestiaryPageItems, stageCount, stageIndexOrder, stageListArray } from "./game/stage_data.js";
import { loadSprite, Sprite, spriteCreateBuffer, uncheckedSpriteCount } from "./game/sprite.js";
import { GameFont } from "./game/font.js";
import { BadgeState, BestiaryState, CanvasState, GameState, GameStateChecksum, GUIState, RenderingState, SaveState } from "./game/global_states.js";
import * as Consts from "./game/consts.js"
import { LoadedSprites } from "./game/game_sprites.js";
import { charKerningAfter, charKerningBefore, LoadedFonts } from "./game/game_fonts.js";
import { inventoryItemLists, PartyState } from "./game/party_state.js";
import { shrineRewardClaimed, shrineRewardClaimSlotCount, shrineRewardOptions } from "./game/shrine_data.js";
import { GameplayState, HeroesState } from "./game/heroes.js";
import { StageState } from "./game/stages.js";
import { EnemyState } from "./game/enemy_state.js";
import { ProjectileState } from "./game/projectile_state.js";
import { PopupState } from "./game/popup_state.js";
import { DropState } from "./game/drop_state.js";


export {gameInit as Init, toggleFullscreen as full_screen};
// mainWindow.Init = gameInit;
// mainWindow.full_screen = toggleFullscreen;

document.onmousemove = onMouseMove;
document.onmousedown = onMouseDown;
document.onmouseup = onMouseUp;
document.oncontextmenu = onContextMenu;
CanvasState.element.ontouchstart = onTouchStart;
CanvasState.element.ontouchmove = onTouchMove;
CanvasState.element.ontouchend = onTouchEnd;
CanvasState.element.ontouchcancel = onTouchCancel;
document.onkeydown = onKeyDown;
document.onkeyup = onKeyUp;

// vector math stuff
var scratchVec2 = new RMath.Vec2; // nn, temporary Vec2 scratch used by separation/step helpers.

// mouse input
let isMouseClicked = false,
    isMouseReleased = false,
    wasMouseDown = false,
    isMouseDown = false,
    mouseHoldFrames = 0, // bn, frames mouse has been continuously held down (hold-duration counter).
    mouseXCurrent = 0,
    mouseYCurrent = 0,
    mouseXRel = 0,
    mouseYRel = 0,
    activeTouchCount = 0;


// keyboard input
let keyJustPressed = Array(256), // Jf
    keyPressPending = Array(256), // Kf
    keyHeld = Array(256), // Lf
    keyMapNoShift = Array(256), // Mf
    keyMapShift = Array(256); // Nf


export function resetGameProgress() { // bc
    let a, b;
    resetUIStates();
    PartyState.partyLevel = PartyState.partyMemberCount = 1;
    for (a = PartyState.partyGold = PartyState.partyEXPAccum = 0; 4 > a; a++) 
        PartyState.partySP[a] = 0, 
        PartyState.partyLP[a] = 50, 
        PartyState.partyMaxLP[a] = 50, 
        PartyState.heroEmitCurrent[a] = 0;
    for (a = 0; 9 > a; a++) PartyState.stageEventFlags[a] = 0;
    for (b = PartyState.stageFlagsSetCount = PartyState.collectedStageFlagsCount = 0; b < PartyState.partyStats.length; b++)
        for (a = 0; 4 > a; a++) PartyState.partyStats[b][a] = 0;
    for (a = 0; 4 > a; a++)
        for (b = 0; 8 > b; b++) PartyState.partyEquipmentTable[a][b] = 0;
    for (a = 0; 256 > a; a++) PartyState.itemForgeLvls[a] = 0, PartyState.itemIsNew[a] = 0;
    for (a = 0; a < stageCount; a++) StageState.isStageReachedArray[a] = 0;
    for (a = 0; a < enemyTypeCount; a++) BestiaryState.bestiaryEntryState[a] = 0;
    for (a = 0; a < badgeCount; a++) BadgeState.badgeCounterArray[a] = 0;
    for (a = 0; a < shrineRewardClaimSlotCount; a++) shrineRewardClaimed[a] = 0;
    for (a = 0; 4 > a; a++) PartyState.autoMoveEnabled[a] = 0;
    PartyState.cliffStopEnabled = 0
}


export function resetUIStates() {
    GUIState.screenStateTimer = 0;
    GUIState.memberUIVisibleBackup = GUIState.inventoryUIVisibleBackup = GUIState.bestiaryUIVisibleBackup = GUIState.badgesUIVisibleBackup = GUIState.optionsUIVisibleBackup = GUIState.shrineUIVisibleBackup = GUIState.clickInUI = GUIState.memberUIVisible = GUIState.inventoryUIVisible = GUIState.bestiaryUIVisible = GUIState.badgesUIVisible = GUIState.optionsUIVisible = GUIState.shrineUIVisible = false;
    GameplayState.comboMultBonus = GameplayState.comboCount = GameplayState.comboWindowTimer = GUIState.selectingHero = GUIState.selectedStatIndex = GUIState.inventoryTabIdx = GUIState.inventoryPageIdx = GUIState.inventorySlotIdx  = 0
}

export function getItemModifierAmount(itemIdx, columnIdx) { // Ue
    for (var c = 0; 6 > c; c += 2)
        if (itemList[itemIdx][ItemProps.StatModifyingBase + c] == columnIdx) return itemList[itemIdx][ItemProps.StatModifyingBase + c + 1];
    return 0
}

export function getItemStatWithForge(_itemIdx, _columnIdx) { // Ve
    var c = 0;
    if (0 == _columnIdx) {
        c = 0;
    } else {
        if (_columnIdx == itemList[_itemIdx][ItemProps.StatModifyingBase + 0]) {
            c = itemList[_itemIdx][ItemProps.StatModifyingBase + 1];
        } else if (_columnIdx == itemList[_itemIdx][ItemProps.StatModifyingBase + 2]) {
            c = itemList[_itemIdx][ItemProps.StatModifyingBase + 3];
        } else {
            _columnIdx == itemList[_itemIdx][ItemProps.StatModifyingBase + 4] && (c = itemList[_itemIdx][ItemProps.StatModifyingBase + 5]);
        }
        
    }
    if (0 != c) {
        var d = PartyState.itemForgeLvls[_itemIdx] - 1;
        _itemIdx == PartyState.forgePreviewItemIdx && d++;
        return itemList[_itemIdx][_columnIdx] + RMath.floor(itemList[_itemIdx][_columnIdx] * d * c / 100);
    }
    return itemList[_itemIdx][_columnIdx];
}


export function getItemForgeMultiplier(_itemIdx, _columnIdx) { // Xe
    var c = 0;
    if (0 == _columnIdx) {
        c = 0;
    } else if (_columnIdx == itemList[_itemIdx][ItemProps.StatModifyingBase + 0]) {
        c = itemList[_itemIdx][ItemProps.StatModifyingBase + 1];
    } else if (_columnIdx == itemList[_itemIdx][ItemProps.StatModifyingBase + 2]) {
        c = itemList[_itemIdx][ItemProps.StatModifyingBase + 3];
    } else {
        _columnIdx == itemList[_itemIdx][ItemProps.StatModifyingBase + 4] && (c = itemList[_itemIdx][ItemProps.StatModifyingBase + 5]);
    }
    
    if (0 != c) {
        var d = PartyState.itemForgeLvls[_itemIdx] - 1;
        _itemIdx == PartyState.forgePreviewItemIdx && d++;
        return d * c;
    }
    return -1;
}


export function getModifiedStatVal(heroIdx, itemIdx, columnIdx) {
    let d = 0;
    // it goes like this...
    //       +0     +2     +4          | itemStatModifingCol + *
    // [..., c0,b0, c1,b1, c2,b2, ...] | itemList[itemIdx]
    //          *      *      *        | d
    if (columnIdx == 0) {
        d = 0;
    } else if (columnIdx == itemList[itemIdx][ItemProps.StatModifyingBase + 0]) {
        d = itemList[itemIdx][ItemProps.StatModifyingBase + 1];
    } else if (columnIdx == itemList[itemIdx][ItemProps.StatModifyingBase + 2]) {
        d = itemList[itemIdx][ItemProps.StatModifyingBase + 3];
    } else if (columnIdx == itemList[itemIdx][ItemProps.StatModifyingBase + 4]) {
        d = itemList[itemIdx][ItemProps.StatModifyingBase + 5];
    }

    if (0 != d) {
        let f = PartyState.itemForgeLvls[itemIdx] - 1; // $b
        if (heroHasAccessoryEffect(heroIdx, AccessoryProps.ArmsBonus0) && 3 == itemList[itemIdx][ItemProps.DropIconCol])
            f += countAccessoryLvlBonuses(heroIdx, AccessoryProps.ArmsBonus0);

        if (heroHasAccessoryEffect(heroIdx, AccessoryProps.ChargeBonus) && 4 == itemList[itemIdx][ItemProps.DropIconCol])
            f += countAccessoryLvlBonuses(heroIdx, AccessoryProps.ChargeBonus);

        if (heroHasAccessoryEffect(heroIdx, AccessoryProps.ArmsBonus1) && 3 == itemList[itemIdx][ItemProps.DropIconCol])
            f += countAccessoryLvlBonuses(heroIdx, AccessoryProps.ArmsBonus1);

        if (heroHasAccessoryEffect(heroIdx, AccessoryProps.ArmsBonus1) && 4 == itemList[itemIdx][ItemProps.DropIconCol])
            f += sumAccessorySecondaryValues(heroIdx, AccessoryProps.ArmsBonus1);

        return itemList[itemIdx][columnIdx] + RMath.floor(itemList[itemIdx][columnIdx] * f * d / 100)
    }
    return itemList[itemIdx][columnIdx]
}


export function heroHasAccessoryEffect(partyIdx, accessoryIdx) {
    return itemList[PartyState.partyEquipmentTable[partyIdx][3]][AccessoryPrefixes.TempIdx] == accessoryIdx ||
        itemList[PartyState.partyEquipmentTable[partyIdx][4]][AccessoryPrefixes.TempIdx] == accessoryIdx
        ? true
        : false
}


export function countAccessoryLvlBonuses(partyIdx, accessoryIdx) {
    var c = 0;
    itemList[PartyState.partyEquipmentTable[partyIdx][3]][AccessoryPrefixes.TempIdx] == accessoryIdx && (c += itemList[PartyState.partyEquipmentTable[partyIdx][3]][AccessoryPrefixes.PrimaryValue]);
    itemList[PartyState.partyEquipmentTable[partyIdx][4]][AccessoryPrefixes.TempIdx] == accessoryIdx && (c += itemList[PartyState.partyEquipmentTable[partyIdx][4]][AccessoryPrefixes.PrimaryValue]);
    return c
}


export function sumAccessorySecondaryValues(partyIdx, accessoryIdx) {
    var c = 0;
    itemList[PartyState.partyEquipmentTable[partyIdx][3]][AccessoryPrefixes.TempIdx] == accessoryIdx && (c += itemList[PartyState.partyEquipmentTable[partyIdx][3]][AccessoryPrefixes.SecondaryValue]);
    itemList[PartyState.partyEquipmentTable[partyIdx][4]][AccessoryPrefixes.TempIdx] == accessoryIdx && (c += itemList[PartyState.partyEquipmentTable[partyIdx][4]][AccessoryPrefixes.SecondaryValue]);
    return c
}


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



export function saveGame() {
    let b, c;
    let a = 0;
    SaveState.gameSaveBuffer[a++] = 1;
    SaveState.gameSaveBuffer[a++] = 0;
    SaveState.gameSaveBuffer[a++] = 0;
    SaveState.gameSaveBuffer[a++] = RMath.randInt(64);
    SaveState.gameSaveBuffer[a++] = RMath.randInt(64);
    for (b = 0; 8 > b; b++) SaveState.gameSaveBuffer[a++] = GameState.userSaveKey[b];
    SaveState.gameSaveBuffer[a++] = 0;
    SaveState.gameSaveBuffer[a++] = GUIState.currentStage >> 6 & 63;
    SaveState.gameSaveBuffer[a++] = GUIState.currentStage >> 0 & 63;
    for (b = 0; 4 > b; b++) {
        SaveState.gameSaveBuffer[a++] = 0;
        SaveState.gameSaveBuffer[a++] = 0;
        SaveState.gameSaveBuffer[a++] = 0;
    }
    SaveState.gameSaveBuffer[a++] = PartyState.partyMemberCount;
    SaveState.gameSaveBuffer[a++] = PartyState.partyLevel >> 6 & 63;
    SaveState.gameSaveBuffer[a++] = PartyState.partyLevel >> 0 & 63;
    SaveState.gameSaveBuffer[a++] = PartyState.partyEXPAccum >> 18 & 63;
    SaveState.gameSaveBuffer[a++] = PartyState.partyEXPAccum >> 12 & 63;
    SaveState.gameSaveBuffer[a++] = PartyState.partyEXPAccum >> 6 & 63;
    SaveState.gameSaveBuffer[a++] = PartyState.partyEXPAccum >> 0 & 63;
    SaveState.gameSaveBuffer[a++] = PartyState.partyGold >> 18 & 63;
    SaveState.gameSaveBuffer[a++] = PartyState.partyGold >> 12 & 63;
    SaveState.gameSaveBuffer[a++] = PartyState.partyGold >> 6 & 63;
    SaveState.gameSaveBuffer[a++] = PartyState.partyGold >> 0 & 63;
    for (b = 0; 4 > b; b++) {
        SaveState.gameSaveBuffer[a++] = PartyState.partySP[b] >> 6 & 63;
        SaveState.gameSaveBuffer[a++] = PartyState.partySP[b] >> 0 & 63;
    }
    for (b = 0; 4 > b; b++) {
        SaveState.gameSaveBuffer[a++] = PartyState.partyLP[b] >> 12 & 63;
        SaveState.gameSaveBuffer[a++] = PartyState.partyLP[b] >> 6 & 63;
        SaveState.gameSaveBuffer[a++] = PartyState.partyLP[b] >> 0 & 63;
    }
    for (b = 0; 4 > b; b++)
        for (c = 0; c < PartyState.partyStats.length; c++) {
            SaveState.gameSaveBuffer[a++] = PartyState.partyStats[c][b] >> 6 & 63;
            SaveState.gameSaveBuffer[a++] = PartyState.partyStats[c][b] >> 0 & 63;
        }
    for (b = 0; 4 > b; b++)
        for (c = 0; 8 > c; c++) {
            SaveState.gameSaveBuffer[a++] = PartyState.partyEquipmentTable[b][c] >> 6 & 63;
            SaveState.gameSaveBuffer[a++] = PartyState.partyEquipmentTable[b][c] >> 0 & 63;
        }

    SaveState.gameSaveBuffer[a++] = 4;
    for (b = SaveState.gameSaveBuffer[a++] = 0; 256 > b; b++) SaveState.gameSaveBuffer[a++] = PartyState.itemForgeLvls[b];
    SaveState.gameSaveBuffer[a++] = 0;
    SaveState.gameSaveBuffer[a++] = 10;
    for (b = 0; 9 > b; b++) SaveState.gameSaveBuffer[a++] = PartyState.stageEventFlags[b];
    SaveState.gameSaveBuffer[a++] = PartyState.collectedStageFlagsCount;
    SaveState.gameSaveBuffer[a++] = stageCount >> 6 & 63;
    SaveState.gameSaveBuffer[a++] = stageCount >> 0 & 63;
    for (b = 0; b < stageCount; b++) SaveState.gameSaveBuffer[a++] = StageState.isStageReachedArray[b];
    SaveState.gameSaveBuffer[a++] = enemyTypeCount >> 6 & 63;
    SaveState.gameSaveBuffer[a++] = enemyTypeCount >> 0 & 63;
    for (b = 0; b < enemyTypeCount; b++) SaveState.gameSaveBuffer[a++] = BestiaryState.bestiaryEntryState[b];

    let f = 5;
    SaveState.gameSaveBuffer[a++] = f >> 6 & 63;
    SaveState.gameSaveBuffer[a++] = f >> 0 & 63;
    for (b = 0; 4 > b; b++)
        SaveState.gameSaveBuffer[a++] = PartyState.autoMoveEnabled[b];
    SaveState.gameSaveBuffer[a++] = PartyState.cliffStopEnabled;
    SaveState.gameSaveBuffer[a++] = badgeCount >> 6 & 63;
    SaveState.gameSaveBuffer[a++] = badgeCount >> 0 & 63;
    for (b = 0; b < badgeCount; b++) SaveState.gameSaveBuffer[a++] = BadgeState.badgeCounterArray[b];
    SaveState.gameSaveBuffer[a++] = shrineRewardClaimSlotCount >> 6 & 63;
    SaveState.gameSaveBuffer[a++] = shrineRewardClaimSlotCount >> 0 & 63;
    for (b = 0; b < shrineRewardClaimSlotCount; b++) SaveState.gameSaveBuffer[a++] = shrineRewardClaimed[b];
    f = 4;
    SaveState.gameSaveBuffer[a++] = f >> 6 & 63;
    SaveState.gameSaveBuffer[a++] = f >> 0 & 63;
    for (b = 0; b < f; b++) SaveState.gameSaveBuffer[a++] = PartyState.stageEventFlags[b];

    let gameSaveHash = 0;
    for (b = 3; b < a; b++) gameSaveHash += SaveState.gameSaveBuffer[b];

    SaveState.gameSaveBuffer[1] = gameSaveHash >> 6 & 63;
    SaveState.gameSaveBuffer[2] = gameSaveHash >> 0 & 63;
    for (b = gameSaveHash = 0; b < a;)
        if (c = SaveState.gameSaveBuffer[b++], SaveState.saveLoadCodecScratchBuffer[gameSaveHash++] = c, 1 >= c) {
            for (f = 0; b < a && 63 != f && c == SaveState.gameSaveBuffer[b]; b++) f++;
            SaveState.saveLoadCodecScratchBuffer[gameSaveHash++] = f
        }
    a = RMath.randInt(64);
    f = RMath.randInt(64);
    SaveState.gameSaveString = "";
    c = a + gameSaveHash & 63;
    for (b = 0; b < gameSaveHash; b++) {
        SaveState.gameSaveString += Consts.encodingCharTable[SaveState.saveLoadCodecScratchBuffer[b] + c & 63];
        c = (c * c >> 4) + SaveState.saveLoadCodecScratchBuffer[b] + b + f & 65535;
    }
    SaveState.gameSaveString += Consts.encodingCharTable[a];
    SaveState.gameSaveString += Consts.encodingCharTable[f];
    SaveState.gameSaveString += Consts.encodingCharTable[c >> 6 & 63];
    let saveItem = SaveState.gameSaveString += Consts.encodingCharTable[c >> 0 & 63];
    if (window.localStorage) {
        if ("" != saveItem) {
            window.localStorage.setItem("ranger2", saveItem);
        } else {
            window.localStorage.removeItem("ranger2");
        }
    }
    SaveState.gameSaveStatusDuration = 50
}


export function loadGame(saveString) {

    let d = saveString.length - 4;
    if (0 >= d) return 1; // invalid length
    if (null == saveString.match(/^[0-9A-Za-z.*]+$/)) return 2; // str err
    if (10 > d || 5E3 < d) return 3; // len err
    let b = Consts.inverseCodingCharTable[saveString[d + 0]];
    let f = Consts.inverseCodingCharTable[saveString[d + 1]];
    let c = b + d & 63;
    for (b = 0; b < d; b++) {
        SaveState.saveLoadCodecScratchBuffer[b] = Consts.inverseCodingCharTable[saveString[b]] - c & 63;
        c = (c * c >> 4) + SaveState.saveLoadCodecScratchBuffer[b] + b + f & 65535;
    }
    if (Consts.inverseCodingCharTable[saveString[d + 2]] != (c >> 6 & 63) || Consts.inverseCodingCharTable[saveString[d + 3]] != (c >> 0 & 63)) return 4; // load err

    let i = 0;
    for (c = 0; i < d;)
        if (f = SaveState.saveLoadCodecScratchBuffer[i++], SaveState.gameSaveBuffer[c++] = f, 1 >= f)
            for (let g = SaveState.saveLoadCodecScratchBuffer[i++], b = 0; b < g; b++) SaveState.gameSaveBuffer[c++] = f;
    d = 0;
    for (b = 3; b < c; b++) d += SaveState.gameSaveBuffer[b];
    if (SaveState.gameSaveBuffer[1] != (d >> 6 & 63) || SaveState.gameSaveBuffer[2] != (d >> 0 & 63)) return 4; // load err
    for (b = 0; 8 > b; b++)
        if (SaveState.gameSaveBuffer[b + 5] != GameState.userSaveKey[b]) return 5; // user err
    resetGameProgress();

    let p = 16 + 3*4;
    b = 4;

    PartyState.partyMemberCount = SaveState.gameSaveBuffer[p++];
    PartyState.partyLevel = (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    PartyState.partyEXPAccum = (SaveState.gameSaveBuffer[p++] << 18) + (SaveState.gameSaveBuffer[p++] << 12) + (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    PartyState.partyGold = (SaveState.gameSaveBuffer[p++] << 18) + (SaveState.gameSaveBuffer[p++] << 12) + (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    for (b = 0; 4 > b; b++) PartyState.partySP[b] = (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    for (b = 0; 4 > b; b++) PartyState.partyLP[b] = (SaveState.gameSaveBuffer[p++] << 12) + (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    for (b = 0; 4 > b; b++)
        for (c = 0; c < PartyState.partyStats.length; c++) PartyState.partyStats[c][b] = (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    for (b = 0; 4 > b; b++)
        for (c = 0; 8 > c; c++) PartyState.partyEquipmentTable[b][c] = (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];

    let g = (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    for (b = 0; b < g; b++) PartyState.itemForgeLvls[b] = SaveState.gameSaveBuffer[p++];

    g = (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    if (!g) return 0;
    for (b = 0; 9 > b; b++) PartyState.stageEventFlags[b] = SaveState.gameSaveBuffer[p++];
    PartyState.collectedStageFlagsCount = SaveState.gameSaveBuffer[p++];
    g = (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    if (!g) return 0;
    for (b = 0; b < g; b++) StageState.isStageReachedArray[b] = SaveState.gameSaveBuffer[p++];
    g = (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    for (b = 0; b < g; b++) BestiaryState.bestiaryEntryState[b] = SaveState.gameSaveBuffer[p++];
    g = (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    if (!g) return 0;
    if (5 <= g) {
        for (b = 0; 4 > b; b++) PartyState.autoMoveEnabled[b] = SaveState.gameSaveBuffer[p++];
        PartyState.cliffStopEnabled = SaveState.gameSaveBuffer[p++];
    }
    g = (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    if (!g) return 0;
    for (b = 0; b < g; b++) BadgeState.badgeCounterArray[b] = SaveState.gameSaveBuffer[p++];
    g = (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    if (!g) return 0;
    for (b = 0; b < g; b++) shrineRewardClaimed[b] = SaveState.gameSaveBuffer[p++];
    g = (SaveState.gameSaveBuffer[p++] << 6) + SaveState.gameSaveBuffer[p++];
    if (!g) return 0;
    for (b = 0; b < g; b++) PartyState.stageEventFlags[b] = SaveState.gameSaveBuffer[p++];
    return 0;
}


export function hashAdjust(a, b) {
    a += (b | 1) * (a & 255 | 1);
    return (a >> 16) + (a & 65535)
}

export function updatePartyChecksum() {
    var a, b, c;
    GameStateChecksum.basePartyChecksum = c = RMath.floor(RMath.randFloat(1024));
    c = hashAdjust(c, 0);
    c = hashAdjust(c, GUIState.currentStage);
    c = hashAdjust(c, PartyState.partyMemberCount);
    c = hashAdjust(c, PartyState.partyLevel);
    c = hashAdjust(c, PartyState.partyEXPAccum);
    c = hashAdjust(c, PartyState.partyGold);
    for (a = 0; 4 > a; a++)
        c = hashAdjust(c, PartyState.partySP[a]),
            c = hashAdjust(c, PartyState.partyLP[a]),
            c = hashAdjust(c, PartyState.partyMaxLP[a]),
            c = hashAdjust(c, PartyState.heroEmitCurrent[a]),
            c = hashAdjust(c, PartyState.heroEmitValues[a]),
            c = hashAdjust(c, PartyState.heroChargeValues[a]),
            c = hashAdjust(c, PartyState.partyHealthLvls[a]),
            c = hashAdjust(c, PartyState.partyShortAtkLvls[a]),
            c = hashAdjust(c, PartyState.partyMidAtkLvls[a]),
            c = hashAdjust(c, PartyState.partyLongAtkLvls[a]),
            c = hashAdjust(c, PartyState.partyPhysLvls[a]),
            c = hashAdjust(c, PartyState.partyElemLvls[a]),
            c = hashAdjust(c, PartyState.partyDodgeLvls[a]);
    for (a = 0; 4 > a; a++)
        for (b = 0; 8 > b; b++)
            c = hashAdjust(c, PartyState.partyEquipmentTable[a][b]);

    for (a = 0; 256 > a; a++) c = hashAdjust(c, PartyState.itemForgeLvls[a]);
    for (a = 0; 9 > a; a++) c = hashAdjust(c, PartyState.stageEventFlags[a]);
    c = hashAdjust(c, PartyState.collectedStageFlagsCount);
    for (a = 0; a < stageCount; a++) c = hashAdjust(c, StageState.isStageReachedArray[a]);
    for (a = 0; a < enemyTypeCount; a++) c = hashAdjust(c, BestiaryState.bestiaryEntryState[a]);
    for (a = 0; a < badgeCount; a++) c = hashAdjust(c, BadgeState.badgeCounterArray[a]);
    for (a = 0; a < shrineRewardClaimSlotCount; a++) c = hashAdjust(c, shrineRewardClaimed[a]);
    GameStateChecksum.partyChecksum = c ^ 16777215
}


export function gameInit(a, b) {
    let _t0;
    console.log(`gameInit(${a}, ${b}) ${GameState.gameInitStage}`);
    if (0 == GameState.gameInitStage) {
        if (a != null) {
            GameState.userSaveCode = a;
        } else {
            GameState.userSaveCode = "";
        }
        GameState.isMinimalTitleMode = "0" == b ? true : false;
        if (8 == GameState.userSaveCode.length)
            for (_t0 = 0; 8 > _t0; _t0++) GameState.userSaveKey[_t0] = Consts.inverseCodingCharTable[GameState.userSaveCode[_t0]];
        console.log(Consts.copyrightText2); // Copyright text
        CanvasState.element.width = 640;
        CanvasState.element.height = 432;

        for (_t0 = 0; 256 > _t0; _t0++) {
            keyJustPressed[_t0] = false;
            keyPressPending[_t0] = false;
            keyHeld[_t0] = false;
            keyMapNoShift[_t0] = 0;
            keyMapShift[_t0] = 0;
        }
        for (_t0 = 0; 10 > _t0; _t0++) keyMapNoShift[48 + _t0] = 48 + _t0;
        for (_t0 = 0; 9 > _t0; _t0++) keyMapShift[49 + _t0] = 33 + _t0;
        for (_t0 = 0; 4 > _t0; _t0++) keyMapNoShift[37 + _t0] = 37 + _t0;
        for (_t0 = 0; 4 > _t0; _t0++) keyMapShift[37 + _t0] = 37 + _t0;
        keyMapNoShift[13] = keyMapShift[13] = 13;
        keyMapNoShift[16] = keyMapShift[16] = 16;
        keyMapNoShift[17] = keyMapShift[17] = 17;
        keyMapNoShift[18] = keyMapShift[18] = 18;
        keyMapNoShift[32] = keyMapShift[32] = 32;
        keyMapNoShift[186] = 58;
        keyMapShift[186] = 42;
        keyMapNoShift[187] = 59;
        keyMapShift[187] = 43;
        keyMapNoShift[188] = 44;
        keyMapShift[188] = 60;
        keyMapNoShift[189] = 45;
        keyMapShift[189] = 61;
        keyMapNoShift[190] = 46;
        keyMapShift[190] = 62;
        keyMapNoShift[191] = 47;
        keyMapShift[191] = 63;
        keyMapNoShift[192] = 64;
        keyMapShift[192] = 96;
        keyMapNoShift[219] = 91;
        keyMapShift[219] = 123;
        keyMapNoShift[220] = 92;
        keyMapShift[220] = 124;
        keyMapNoShift[221] = 93;
        keyMapShift[221] = 125;
        keyMapNoShift[222] = 94;
        keyMapShift[222] = 126;
        keyMapNoShift[226] = 92;
        keyMapShift[226] = 95;
        keyMapNoShift[58] = 58;
        keyMapShift[58] = 42;
        keyMapNoShift[59] = 59;
        keyMapShift[59] = 43;
        keyMapNoShift[173] = 45;
        keyMapShift[173] = 61;
        keyMapNoShift[64] = 64;
        keyMapShift[64] = 96;
        keyMapNoShift[160] = 94;
        keyMapShift[160] = 126;
        let _t2;
        for (_t0 = 0; 276480 > _t0; _t0++) 
            RenderingState.frameBufferArray[_t0] = 0;
        
        // uncheckedSpriteCount is incremented
        RMath.InitStates();
        RMath.setRandSeed(RMath.floor(1024 * RMath.rand()) & 1023);
        RMath.setRandSeedStep(RMath.floor(512 * RMath.rand()) | 1);
        // clear frame buffer
        LoadedFonts.gameFont.f("font.png", 8, 12);
        LoadedFonts.gameFontSmall.f("font_s.png", 5, 7);
        LoadedFonts.gameFontMed.f("font_m.png", 6, 8);
        LoadedSprites.titleSprite.f("title.png");
        LoadedSprites.iconSpriteSheet.f("b.png");
        for (_t0 = 0; 3 > _t0; _t0++) LoadedSprites.tilesetSprites[_t0].f("g" + _t0 + ".png");
        LoadedSprites.enemySpriteSheet.f("en.png");
        LoadedSprites.droppedItemSpriteSheet.f("icon.png");
        LoadedSprites.itemsSpriteSheet.f("item.png");
        LoadedSprites.effectSpriteSheet.f("ef.png");
        LoadedSprites.medalSpriteSheet.f("medal.png");
        // hostnameCheck();
        // iterIdxTemp_3 = 0;
        // hostnameCheckIdx = hostname.length;
        // if (hostnameCheck()) {
        //     gameInitStage--;
        // } else {
        //     gameInitStage++;
        // }
        GameState.gameInitStage++;
    }
    if (1 == GameState.gameInitStage) { // uncheckedSpriteCount is decremented on each successful drawSprite call
        loadSprite(LoadedFonts.gameFont.i);
        loadSprite(LoadedFonts.gameFontSmall.i);
        loadSprite(LoadedFonts.gameFontMed.i);
        loadSprite(LoadedSprites.titleSprite);
        loadSprite(LoadedSprites.iconSpriteSheet);
        for (_t0 = 0; 3 > _t0; _t0++) loadSprite(LoadedSprites.tilesetSprites[_t0]);
        loadSprite(LoadedSprites.enemySpriteSheet);
        loadSprite(LoadedSprites.droppedItemSpriteSheet);
        loadSprite(LoadedSprites.itemsSpriteSheet);
        loadSprite(LoadedSprites.effectSpriteSheet);
        loadSprite(LoadedSprites.medalSpriteSheet);
        if (uncheckedSpriteCount.value > 0) { // restart
            setTimeout(gameInit, computeFrameDelay());
        } else {
            GameState.gameInitStage++;
        }
    }
    if (2 == GameState.gameInitStage) {
        if (window.localStorage) {
            _t0 = window.localStorage.getItem("ranger2");
            SaveState.gameSaveString = _t0 ?? "";
        } else {
            SaveState.gameSaveString = "";
        }
        SaveState.gameLoadStatusCode = loadGame(SaveState.gameSaveString);
        SaveState.statusDuration = 100;

        let _t1;
        GameStateChecksum.itemHashTable = Array(256);
        for (_t0 = 0; 256 > _t0; _t0++) {
            GameStateChecksum.itemHashTable[_t0] = 0;
            if (itemList[_t0]) {
                for (_t1 = 1; _t1 < itemList[_t0].length; _t1++) {
                    GameStateChecksum.itemHashTable[_t0] = hashAdjust(GameStateChecksum.itemHashTable[_t0], itemList[_t0][_t1]);
                }
            }
        }

        GameStateChecksum.levelHashTable = Array(stageListArray.length);
        for (_t0 = 0; _t0 < stageListArray.length; _t0++) {
            GameStateChecksum.levelHashTable[_t0] = 0;
            if (stageListArray[_t0]) {
                for (_t1 = 2; _t1 < stageListArray[_t0].length; _t1++) {
                    GameStateChecksum.levelHashTable[_t0] = hashAdjust(GameStateChecksum.levelHashTable[_t0], stageListArray[_t0][_t1]);
                }
            }
        }

        GameStateChecksum.itemCatalogHashTable = Array(enemyCatalog.length);
        for (_t0 = 0; _t0 < enemyCatalog.length; _t0++) {
            GameStateChecksum.itemCatalogHashTable[_t0] = 0;
            if (enemyCatalog[_t0]) {
                for (_t1 = 0; _t1 < enemyCatalog[_t0].length; _t1++) {
                    GameStateChecksum.itemCatalogHashTable[_t0] = hashAdjust(GameStateChecksum.itemCatalogHashTable[_t0], enemyCatalog[_t0][_t1]);
                }
            }
        }

        for (_t0 = GameStateChecksum.inventoryItemListsChecksum = 0; _t0 < inventoryItemLists.length; _t0++) {
            for (_t1 = 0; _t1 < inventoryItemLists[_t0].length; _t1++) {
                GameStateChecksum.inventoryItemListsChecksum = hashAdjust(GameStateChecksum.inventoryItemListsChecksum, inventoryItemLists[_t0][_t1]);
            }
        }

        // updatePartyChecksum();
        // spriteCreateBuffer(canvasImageBuffer, 640, 432);
        setupAnimRequest();
    }
}


export function drawCanvas() {

    var a, b, c, d;
    for (let a = Consts.CANVAS_WIDTH * Consts.CANVAS_HEIGHT - 1; 0 <= a; a--) RenderingState.frameBufferArray[a] = 0; // clear buffer
    var d;

    GameStateChecksum.tamperCheckScanOffset = GameStateChecksum.tamperCheckScanOffset + 1 & 63;
    if (!GUIState.gameScreenState) {
        GUIState.currentStage = 0;
        StageState.partySpawnXByHero[0] = 20;
        StageState.partySpawnXByHero[1] = 28;
        StageState.partySpawnXByHero[2] = 36;
        StageState.partySpawnXByHero[3] = 44;
        StageState.partySpawnYByHero[0] = 45;
        StageState.partySpawnYByHero[1] = 45;
        StageState.partySpawnYByHero[2] = 45;
        StageState.partySpawnYByHero[3] = 45;
        GUIState.gameScreenState++;
    } else if (1 == GUIState.gameScreenState) {
        if (loadLevelData(0)) {
            GUIState.gameScreenState++;
        }
    } else if (2 == GUIState.gameScreenState || 3 == GUIState.gameScreenState) { // title menu
        GUIState.clickInUI = false;
        updatePlayerParty();
        drawGameStage();
        drawPlayerParty();
        let a = 145;
        let b = 26;
        let d = 350;
        let f = 125;
        let h = (GameState.isMinimalTitleMode ? 0 : 125) << 8 + ((b < 0) ? h += ~~(p * -b) : 0);
        let k = ~~(89600 / d);
        let p = ~~(32E3 / f);
        let g = (a < 0) ? ~~(k * -a) : 0;

        d = (640 < a + d) ? 640 : ~~(a + d);
        f = (432 < b + f) ? 432 : ~~(b + f);

        a = 0 > a ? 0 : ~~a;
        b = 0 > b ? 0 : ~~b;
        let n = 640 * b + a;
        let titleSpriteData = LoadedSprites.titleSprite.g;
        for (let w = 640 - (d - a); b < f; b++, n += w, h += p) { // draw title
            let idxmask = ((h >> 8) * LoadedSprites.titleSprite.h << 8) + g; 
            let _dx = a;
            while (_dx < d) {
                let _px = titleSpriteData[idxmask >> 8];
                if (-1 != _px) {
                    RenderingState.frameBufferArray[n] = _px;
                }
                _dx++; 
                n++; 
                idxmask += k;
            }
        }

        if (2 == GUIState.gameScreenState) {
            drawTextCentered(LoadedFonts.gameFont, 320, 220, "NEW GAME", 16777215, 10053171);
            if (buttonCheckCentered(320, 220, 128, 24)) {
                if (isMouseClicked) {
                    GUIState.gameScreenState = 0 == SaveState.gameLoadStatusCode ? 3 : 4;
                }
                drawLine(256, 228, 384, 228, 11141120);
            }
            if (0 == SaveState.gameLoadStatusCode) {
                drawTextCentered(LoadedFonts.gameFont, 320, 260, "LOAD GAME", 16777215, 10053171);
                if (buttonCheckCentered(320, 260, 128, 24)) {
                    if (isMouseClicked) {
                        GUIState.gameScreenState = 5;
                    }
                    drawLine(256, 268, 384, 268, 11141120);
                }
            }
        } else if (3 == GUIState.gameScreenState) {
            drawTextCentered(LoadedFonts.gameFont, 320, 220, "DELETE SAVED AND CREATE NEW GAME", 16777215, 10053171);
            if (buttonCheckCentered(320, 220, 128, 24)) {
                if (isMouseClicked) {
                    GUIState.gameScreenState = 4;
                }
                drawLine(192, 228, 448, 228, 11141120);
            }

            drawTextCentered(LoadedFonts.gameFont, 320, 260, "CANCEL", 16777215, 10053171);
            if (buttonCheckCentered(320, 260, 128, 24)) {
                if (isMouseClicked) {
                    GUIState.gameScreenState = 2;
                }
                drawLine(256, 268, 384, 268, 11141120);
            }
        }
        
        if (drawIconButton(608, 312, 8, "IMPORT", 16777215)) {
            if (8 != GameState.userSaveCode.length) {
                drawText(LoadedFonts.gameFont, mouseXCurrent - 72, mouseYCurrent - 6, "User only", 16777215, 13158);
            } else if (isMouseClicked) {
                if (a = promptInput("Import Game Data", "")) {
                    SaveState.gameLoadStatusCode = loadGame(a);
                    SaveState.statusDuration = 100;
                }
            }
        }
        if (drawIconButton(608, 352, 9, "EXPORT", 16777215)) {
            if (8 != GameState.userSaveCode.length) {
                drawText(LoadedFonts.gameFont, mouseXCurrent - 72, mouseYCurrent - 6, "User only", 16777215, 13158);
            } else if (isMouseClicked) {
                promptInput("Export Game Data", SaveState.gameSaveString);
            }
        }
        drawRect(0, 408, 640, 16, 0);
        drawTextCentered(LoadedFonts.gameFont, 320, 417, Consts.copyrightText2, -1, 6697728);

    } else if (4 == GUIState.gameScreenState || 5 == GUIState.gameScreenState) {
        if (4 == GUIState.gameScreenState) {
            resetGameProgress();
            PartyState.partyEquipmentTable[0][0] = 4;
            GUIState.currentStage = PartyState.itemForgeLvls[4] = 1;
            StageState.partySpawnXByHero[0] = 20;
            StageState.partySpawnXByHero[1] = 28;
            StageState.partySpawnXByHero[2] = 36;
            StageState.partySpawnXByHero[3] = 44;
            StageState.partySpawnYByHero[0] = 40;
            StageState.partySpawnYByHero[1] = 40;
            StageState.partySpawnYByHero[2] = 40;
            StageState.partySpawnYByHero[3] = 40;
            updatePartyStats();
        } else if (5 == GUIState.gameScreenState) {
            resetUIStates();
            GUIState.currentStage = 1;
            StageState.partySpawnXByHero[0] = 20;
            StageState.partySpawnXByHero[1] = 28;
            StageState.partySpawnXByHero[2] = 36;
            StageState.partySpawnXByHero[3] = 44;
            StageState.partySpawnYByHero[0] = 40;
            StageState.partySpawnYByHero[1] = 40;
            StageState.partySpawnYByHero[2] = 40;
            StageState.partySpawnYByHero[3] = 40;
        }
        
        RenderingState.screenFadeFactor = 0;
        GUIState.gameScreenState = 10;
    } else if (10 == GUIState.gameScreenState) {
        if (loadLevelData(GUIState.currentStage)) {
            if (1 == GUIState.currentStage) {
                GameplayState.comboMultBonus >>= 1;
            }
            GUIState.screenStateTimer = 0;
            GUIState.gameScreenState++;
        }
    } else if (11 == GUIState.gameScreenState || 12 == GUIState.gameScreenState || 13 == GUIState.gameScreenState || 30 == GUIState.gameScreenState) {
        if (isMouseClicked) {
            GUIState.clickInUI = false;
            if (360 <= mouseYCurrent) GUIState.clickInUI = true;

            if (GUIState.memberUIVisible)
                if (buttonCheck(8, 8, 204, 196)) GUIState.clickInUI = true;

            if (GUIState.inventoryUIVisible)
                if (buttonCheck(218, 8, 204, 260)) GUIState.clickInUI = true;

            if (GUIState.bestiaryUIVisible)
                if (buttonCheck(428, 8, 204, 180)) GUIState.clickInUI = true;

            if (GUIState.badgesUIVisible)
                if (buttonCheck(428, 8, 204, 180)) GUIState.clickInUI = true;

            if (GUIState.optionsUIVisible)
                if (buttonCheck(428, 196, 204, 148)) GUIState.clickInUI = true;

            if (GUIState.shrineUIVisible)
                if (buttonCheck(218, 8, 204, 180)) GUIState.clickInUI = true;
        }

        updatePartyStats();
        updateStageEdgeSpawns();
        updateStageTick();
        drawGameStage();
        updatePlayerParty();
        updateEnemies();
        updateDrops();
        updatePopups();
        updateProjectiles();
        drawEnemies();
        drawDrops();
        drawPlayerParty();
        drawProjectiles();
        drawPopups();

        // display current stage name
        RenderingState.isSolidRender = 1;
        drawRect(4, 4, 8 * stageListArray[GUIState.currentStage][StageProps.stageNameCol].length + 8, 20, 2151694400); // background
        RenderingState.isSolidRender = 0;
        drawText(LoadedFonts.gameFont, 8, 8, stageListArray[GUIState.currentStage][StageProps.stageNameCol], 16777215, 0);
        drawGameUI();
        if (11 == GUIState.gameScreenState) {
            c = 255;
            if (50 < GUIState.screenStateTimer) {
                c = 255 - RMath.floor(255 * (GUIState.screenStateTimer - 50) / 20);
            }
            drawScaledTintedTextCentered(LoadedFonts.gameFont, 320, 180, stageListArray[GUIState.currentStage][StageProps.stageNameCol], 255, 255, 255, c, 64, 64, 64, c, 16, 24);
            a = -1E3 + RMath.floor(500 * GUIState.screenStateTimer / 20);
            drawLine(a, 164, a + 1E3, 164, 8421504);
            a = 640 - RMath.floor(500 * GUIState.screenStateTimer / 20);
            drawLine(a, 193, a + 1E3, 193, 8421504);
            GUIState.screenStateTimer++;
            RenderingState.screenFadeFactor = RMath.clamp(GUIState.screenStateTimer / 30, 0, 1);
            if (70 <= GUIState.screenStateTimer) {
                RenderingState.screenFadeFactor = 1;
                GUIState.screenStateTimer = 0;
                GUIState.gameScreenState++;
            }
        } else if (12 == GUIState.gameScreenState) {
            for (a = b = 0; a < PartyState.partyMemberCount; a++)
                b += PartyState.partyLP[a];
            if (0 == b) {
                GUIState.screenStateTimer = 0;
                GUIState.gameScreenState = 30;
                GameplayState.comboMultBonus = GameplayState.comboCount = GameplayState.comboWindowTimer = 0;
                c = RMath.floor(PartyState.partyGold / 10 / PartyState.partyMemberCount);
                if (0 < c) {
                    for (a = 0; a < PartyState.partyMemberCount; a++)
                        spawnPopup(HeroesState.heroJointPositionsByHero[a][0].x, HeroesState.heroJointPositionsByHero[a][0].y, 0, -c, 60, 16776960);
                    PartyState.partyGold = RMath.clamp(PartyState.partyGold - c * PartyState.partyMemberCount, 0, 9999999);
                }
                for (a = 0; a < PartyState.partyMemberCount; a++) {
                    PartyState.partyLP[a] = 1;
                    PartyState.heroEmitCurrent[a] = 0;
                }
                saveGame();
                for (a = 0; a < PartyState.partyMemberCount; a++)
                    PartyState.partyLP[a] = 0;
            } else if (GUIState.currentStage != StageState.lastStageIdx) {
                GUIState.screenStateTimer = 0;
                GUIState.gameScreenState = 13;
                if (isBadgeIncompleteForCurrentStage(6)) {
                    if ((2 == StageState.lastClearedStageIdx && 4 == StageState.lastStageIdx || 4 == StageState.lastClearedStageIdx && 2 == StageState.lastStageIdx) &&
                        0 == StageState.stage_partyDamageTaken &&
                        0 == StageState.stage_totalDamageDealt
                    ) {
                        IncrementBadgeCount(6);
                    }
                }
                if (isBadgeIncompleteForCurrentStage(51)) {
                    if ((13 == StageState.lastClearedStageIdx && 15 == StageState.lastStageIdx || 15 == StageState.lastClearedStageIdx && 13 == StageState.lastStageIdx) && 
                        0 == StageState.stage_partyDamageTaken &&
                        0 == StageState.stage_totalDamageDealt
                    ) {
                        IncrementBadgeCount(51);
                    }
                }
            }

        } else if (13 == GUIState.gameScreenState) {
            GUIState.screenStateTimer++;
            RenderingState.screenFadeFactor = RMath.clamp(1 - GUIState.screenStateTimer / 20, 0, 1);
            if (20 == GUIState.screenStateTimer) {
                RenderingState.screenFadeFactor = 0;
                GUIState.gameScreenState = 10;
                StageState.lastClearedStageIdx = GUIState.currentStage;
                GUIState.currentStage = StageState.lastStageIdx;
                saveGame();
            }
        } else if (30 == GUIState.gameScreenState) {
            100 > GUIState.screenStateTimer && GUIState.screenStateTimer++;
            c = RMath.floor(255 * GUIState.screenStateTimer / 100);
            drawScaledTintedTextCentered(LoadedFonts.gameFont, 320, 180, "GAME OVER", 100, 20, 10, c, 200, 0, 0, c, 16, 24);
            if (100 == GUIState.screenStateTimer && isMouseClicked) {
                for (a = 0; 4 > a; a++) {
                    PartyState.partyLP[a] = 1;
                    PartyState.heroEmitCurrent[a] = 0;
                }
                RenderingState.screenFadeFactor = 0;
                GUIState.gameScreenState = 10;
                GUIState.currentStage = 1;
                StageState.partySpawnXByHero[0] = 20;
                StageState.partySpawnXByHero[1] = 28;
                StageState.partySpawnXByHero[2] = 36;
                StageState.partySpawnXByHero[3] = 44;
                StageState.partySpawnYByHero[0] = 40;
                StageState.partySpawnYByHero[1] = 40;
                StageState.partySpawnYByHero[2] = 40;
                StageState.partySpawnYByHero[3] = 40;
                saveGame();
            }
        }
    }
    // updatePartyChecksum();
    if (0 < BadgeState.badgePopupTimer) {
        BadgeState.badgePopupTimer--;
        a = badgeList[BadgeState.lastCompletedBadgeIdx][3];
        drawSpriteSheetPartTintedScaled(LoadedSprites.medalSpriteSheet, 420, 341, 18, 19, a % 5 * 20 + 1, 20 * ~~(a / 5), 18, 19, 14540253, 2236962, true);
        b = 440;
        a = RMath.min(120 - BadgeState.badgePopupTimer - 0, 4);
        if (0 < a) {
            drawText(LoadedFonts.gameFontMed, b + 0, 342 + 2 * a, "G", 16777215, 0);
        }
        a = RMath.min(120 - BadgeState.badgePopupTimer - 2, 4);
        if (0 < a) {
            drawText(LoadedFonts.gameFontMed, b + 5, 342 + 2 * a, "E", 16777215, 0);
        }
        a = RMath.min(120 - BadgeState.badgePopupTimer - 4, 4);
        if (0 < a) {
            drawText(LoadedFonts.gameFontMed, b + 10, 342 + 2 * a, "T", 16777215, 0);
        }
        b = 438;
        a = RMath.min(120 - BadgeState.badgePopupTimer - 6, 4);
        if (0 < a) {
            drawText(LoadedFonts.gameFontMed, b + 20, 342 + 2 * a, "M", 16777215, 0);
        }
        a = RMath.min(120 - BadgeState.badgePopupTimer - 8, 4);
        if (0 < a) {
            drawText(LoadedFonts.gameFontMed, b + 25, 342 + 2 * a, "E", 16777215, 0);
        }
        a = RMath.min(120 - BadgeState.badgePopupTimer - 10, 4);
        if (0 < a) {
            drawText(LoadedFonts.gameFontMed, b + 30, 342 + 2 * a, "D", 16777215, 0);
        }
        a = RMath.min(120 - BadgeState.badgePopupTimer - 12, 4);
        if (0 < a) {
            drawText(LoadedFonts.gameFontMed, b + 35, 342 + 2 * a, "A", 16777215, 0);
        }
        a = RMath.min(120 - BadgeState.badgePopupTimer - 14, 4);
        if (0 < a) {
            drawText(LoadedFonts.gameFontMed, b + 40, 342 + 2 * a, "L", 16777215, 0);
        }
    }


    if (SaveState.statusDuration > 0) {
        SaveState.statusDuration--;
        if (10 > SaveState.statusDuration)
            c = RMath.floor(255 * SaveState.statusDuration / 10);
        else {
            c = 255;
            drawScaledTintedText(LoadedFonts.gameFont, 568, 398, " LOAD OK;; str err; len err;load err;user err".split(";")[SaveState.gameLoadStatusCode], 0, 0, 0, 0, 140, 0, 0, c, 8, 12);
        }
    } else if (SaveState.gameSaveStatusDuration > 0) {
        SaveState.gameSaveStatusDuration--;
        if (10 > SaveState.gameSaveStatusDuration)
            c = RMath.floor(255 * SaveState.gameSaveStatusDuration / 10);
        else {
            c = 255;
            drawScaledTintedText(LoadedFonts.gameFont, 568, 398, " SAVE OK", 0, 0, 0, 0, 102, 0, 0, c, 8, 12);
        }
    }


}


export function updatePartyStats() {
    for (let hidx = 0; 4 > hidx; hidx++) {
        PartyState.partyMaxLPBonus_vals[hidx] = 10 * PartyState.partyHealthLvls[hidx];
        PartyState.partyShortAtk_vals[hidx] = 5 * PartyState.partyShortAtkLvls[hidx];
        PartyState.partyMidAtk_vals[hidx] = 5 * PartyState.partyMidAtkLvls[hidx];
        PartyState.partyLongAtk_vals[hidx] = 5 * PartyState.partyLongAtkLvls[hidx];
        PartyState.partyPhys_vals[hidx] = 5 * PartyState.partyPhysLvls[hidx];
        PartyState.partyElem_vals[hidx] = 5 * PartyState.partyElemLvls[hidx];
        PartyState.partyDodge_vals[hidx] = 2 * PartyState.partyDodgeLvls[hidx];
        // from headwear
        let headgearHpPercent = getModifiedStatVal(hidx, PartyState.partyEquipmentTable[hidx][2], ModifierColumns.heroHealthModifier); // armor health modifier %
        let headgearFlatDefense = getModifiedStatVal(hidx, PartyState.partyEquipmentTable[hidx][2], ModifierColumns.heroDefenseModifier);
        let headgearMagicResistPercent = getModifiedStatVal(hidx, PartyState.partyEquipmentTable[hidx][2], ModifierColumns.heroMagicDefModifier);
        let headgearDodgeBonus = getModifiedStatVal(hidx, PartyState.partyEquipmentTable[hidx][2], ModifierColumns.heroDodgeModifier);

        PartyState.heroMeleeDefensesFlatArray[hidx] = headgearFlatDefense;
        if (heroHasAccessoryEffect(hidx, AccessoryProps.MeleeDefence))
            PartyState.heroMeleeDefensesFlatArray[hidx] += countAccessoryLvlBonuses(hidx, AccessoryProps.MeleeDefence);

        PartyState.heroProjDefenseFlatArray[hidx] = headgearFlatDefense;
        if (heroHasAccessoryEffect(hidx, AccessoryProps.MeleeDefence))
            PartyState.heroProjDefenseFlatArray[hidx] += countAccessoryLvlBonuses(hidx, AccessoryProps.MeleeDefence);

        PartyState.heroMagicDefenseFlatArray[hidx] = headgearMagicResistPercent;
        if (heroHasAccessoryEffect(hidx, AccessoryProps.MagicDefense))
            PartyState.heroMagicDefenseFlatArray[hidx] += countAccessoryLvlBonuses(hidx, AccessoryProps.MagicDefense);

        PartyState.heroDodgeChanceArray[hidx] = PartyState.partyDodge_vals[hidx] + headgearDodgeBonus;
        if (heroHasAccessoryEffect(hidx, AccessoryProps.DodgeChance))
            PartyState.heroDodgeChanceArray[hidx] += countAccessoryLvlBonuses(hidx, AccessoryProps.DodgeChance);

        PartyState.physAtkBonusPercent[hidx] = PartyState.partyPhys_vals[hidx];
        PartyState.fireAtkBonusPercent[hidx] = PartyState.partyElem_vals[hidx];
        PartyState.iceAtkBonusPercent[hidx] = PartyState.partyElem_vals[hidx];
        PartyState.lightningAtkBonusPercent[hidx] = PartyState.partyElem_vals[hidx];
        PartyState.poisonAtkBonusPercent[hidx] = PartyState.partyElem_vals[hidx];
        PartyState.partyMaxLP[hidx] = RMath.floor((50 + headgearHpPercent) * (100 + PartyState.partyMaxLPBonus_vals[hidx]) / 100);

        if (heroHasAccessoryEffect(hidx, AccessoryProps.HealthBonus))
            PartyState.partyMaxLP[hidx] = RMath.floor(PartyState.partyMaxLP[hidx] * (100 + countAccessoryLvlBonuses(hidx, AccessoryProps.HealthBonus)) / 100);

        PartyState.partyLP[hidx] = RMath.clamp(PartyState.partyLP[hidx], 0, PartyState.partyMaxLP[hidx]);

        PartyState.heroChargeValues[hidx] = getModifiedStatVal(hidx, PartyState.partyEquipmentTable[hidx][0], ItemProps.ChargeEmitValue);
        if (heroHasAccessoryEffect(hidx, AccessoryProps.ChargeValueBonus) && 0 < PartyState.heroChargeValues[hidx])
            PartyState.heroChargeValues[hidx] = RMath.max(PartyState.heroChargeValues[hidx] + countAccessoryLvlBonuses(hidx, AccessoryProps.ChargeValueBonus), 1);

        PartyState.heroEmitValues[hidx] = getModifiedStatVal(hidx, PartyState.partyEquipmentTable[hidx][1], ItemProps.ChargeEmitValue);
        if (heroHasAccessoryEffect(hidx, AccessoryProps.EffectEmitMaxReduction) && 0 < PartyState.heroEmitValues[hidx])
            PartyState.heroEmitValues[hidx] = RMath.max(PartyState.heroEmitValues[hidx] - countAccessoryLvlBonuses(hidx, AccessoryProps.EffectEmitMaxReduction), 1);

        PartyState.heroEmitCurrent[hidx] = RMath.clamp(PartyState.heroEmitCurrent[hidx], 0, PartyState.heroEmitValues[hidx]);
    }

    // weapons 
    for (let heroItem = 0; 2 > heroItem; heroItem++)
        for (let hidx = 0; 4 > hidx; hidx++) {
            let itemIdx = PartyState.partyEquipmentTable[hidx][heroItem];
            if (0 != itemIdx) {
                let f = getModifiedStatVal(hidx, itemIdx, ItemProps.RangeType);
                let g = getModifiedStatVal(hidx, itemIdx, ItemProps.ElementType);
                let c = 4 * heroItem + hidx;
                PartyState.minAtkArray[c] = getModifiedStatVal(hidx, itemIdx, ItemProps.AtkMin);
                PartyState.maxAtkArray[c] = getModifiedStatVal(hidx, itemIdx, ItemProps.AtkMax);
                PartyState.minAtkArray[c] = RMath.floor(PartyState.minAtkArray[c] * (100 + PartyState.partyPhysAtkStats[f][hidx]) / 100);
                PartyState.maxAtkArray[c] = RMath.floor(PartyState.maxAtkArray[c] * (100 + PartyState.partyPhysAtkStats[f][hidx]) / 100);
                PartyState.minAtkArray[c] = RMath.floor(PartyState.minAtkArray[c] * (100 + PartyState.atkBonusPercentByElement[g][hidx]) / 100);
                PartyState.maxAtkArray[c] = RMath.floor(PartyState.maxAtkArray[c] * (100 + PartyState.atkBonusPercentByElement[g][hidx]) / 100);

                if (heroHasAccessoryEffect(hidx, AccessoryProps.EffectAtkBonus)) {
                    PartyState.minAtkArray[c] = RMath.floor(PartyState.minAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, AccessoryProps.EffectAtkBonus)) / 100);
                    PartyState.maxAtkArray[c] = RMath.floor(PartyState.maxAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, AccessoryProps.EffectAtkBonus)) / 100);
                }
                if (heroHasAccessoryEffect(hidx, AccessoryProps.FireAtkPercent) && 1 == g) {
                    PartyState.minAtkArray[c] = RMath.floor(PartyState.minAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, AccessoryProps.FireAtkPercent)) / 100);
                    PartyState.maxAtkArray[c] = RMath.floor(PartyState.maxAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, AccessoryProps.FireAtkPercent)) / 100);
                }
                if (heroHasAccessoryEffect(hidx, AccessoryProps.IceAtkPercent) && 2 == g) {
                    PartyState.minAtkArray[c] = RMath.floor(PartyState.minAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, AccessoryProps.IceAtkPercent)) / 100);
                    PartyState.maxAtkArray[c] = RMath.floor(PartyState.maxAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, AccessoryProps.IceAtkPercent)) / 100);
                }

                if (heroHasAccessoryEffect(hidx, AccessoryProps.EffectLightningMaxAtkPercent) && 3 == g)
                    PartyState.maxAtkArray[c] = RMath.floor(PartyState.maxAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, AccessoryProps.EffectLightningMaxAtkPercent)) / 100);

                if (heroHasAccessoryEffect(hidx, AccessoryProps.EffectPoisonAtkPercent) && 4 == g) {
                    PartyState.minAtkArray[c] = RMath.floor(PartyState.minAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, AccessoryProps.EffectPoisonAtkPercent)) / 100);
                    PartyState.maxAtkArray[c] = RMath.floor(PartyState.maxAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, AccessoryProps.EffectPoisonAtkPercent)) / 100);
                }

                PartyState.atkCountArray[c] = getModifiedStatVal(hidx, itemIdx, ItemProps.ProjectileCount);
                if (heroHasAccessoryEffect(hidx, AccessoryProps.EffectMultiShotIncrease) && 1 < PartyState.atkCountArray[c])
                    PartyState.atkCountArray[c] += countAccessoryLvlBonuses(hidx, AccessoryProps.EffectMultiShotIncrease);

                heroItem || (
                    PartyState.heroAgiValues[hidx] = getModifiedStatVal(hidx, itemIdx, ItemProps.Agility),
                    heroHasAccessoryEffect(hidx, AccessoryProps.EffectAgiPenalty) && (PartyState.heroAgiValues[hidx] -= countAccessoryLvlBonuses(hidx, AccessoryProps.EffectAgiPenalty)),
                    PartyState.heroRangeValues[hidx] = getModifiedStatVal(hidx, itemIdx, ItemProps.Range),
                    !heroHasAccessoryEffect(hidx, AccessoryProps.EffectRangeAndCount) || 4 != itemList[itemIdx][ItemProps.Appearance] && 5 != itemList[itemIdx][ItemProps.Appearance] || (PartyState.heroRangeValues[hidx] += countAccessoryLvlBonuses(hidx, AccessoryProps.EffectRangeAndCount))
                )
            }
        }
    PartyState.partyEnemyHpBonusPercent = PartyState.partyDropChanceBonusPercent = PartyState.partyRewardValueBonusPercent = 0;
    GameplayState.comboWindowMaxFrames = 180;
    for (let hidx = 0; 4 > hidx; hidx++)
        heroHasAccessoryEffect(hidx, AccessoryProps.RewardValueBonus) && (PartyState.partyRewardValueBonusPercent += countAccessoryLvlBonuses(hidx, AccessoryProps.RewardValueBonus)),
            heroHasAccessoryEffect(hidx, AccessoryProps.DropChanceBonus) && (PartyState.partyDropChanceBonusPercent += countAccessoryLvlBonuses(hidx, AccessoryProps.DropChanceBonus)),
            heroHasAccessoryEffect(hidx, AccessoryProps.EnemyHpBonus) && (PartyState.partyEnemyHpBonusPercent += countAccessoryLvlBonuses(hidx, AccessoryProps.EnemyHpBonus)),
            heroHasAccessoryEffect(hidx, AccessoryProps.ComboMaxIncrease) && (GameplayState.comboWindowMaxFrames += 60 * countAccessoryLvlBonuses(hidx, AccessoryProps.ComboMaxIncrease));
    GameplayState.comboWindowTimer = RMath.clamp(GameplayState.comboWindowTimer, 0, GameplayState.comboWindowMaxFrames);
    for (let hidx = PartyState.stageFlagsSetCount = 0; 9 > hidx; hidx++) 1 == PartyState.stageEventFlags[hidx] && PartyState.stageFlagsSetCount++
}


export function handleInventoryButton(_x, _y, _width, _height, _itemId, _pageIdx) { // Wg
    var h;
    if (buttonCheck(_x, _y, _width, _height))
        if (fillEmptyPixelsRect(_x, _y, _width, _height, 6684672), isMouseClicked && 0 != _itemId) {
            if (GUIState.inventoryUIVisible = GUIState.inventoryUIVisible && inventoryItemLists[GUIState.inventoryTabIdx][28 * GUIState.inventoryPageIdx + GUIState.inventorySlotIdx] == _itemId ? false : true) {
                GUIState.shrineUIVisible = false;
            }
            for (_x = 0; _x < inventoryItemLists.length; _x++) {
                for (h = 0; h < inventoryItemLists[_x].length && inventoryItemLists[_x][h] != _itemId; h++);
                if (inventoryItemLists[_x][h] == _itemId) break;
            }
            if (_x != inventoryItemLists.length) {
                GUIState.inventoryTabIdx = _x;
                GUIState.inventoryPageIdx = RMath.floor(h / 28);
                GUIState.inventorySlotIdx = h % 28;
            }
        } else if (isMouseClicked) {
        if (GUIState.inventoryUIVisible = GUIState.inventoryUIVisible && GUIState.inventoryTabIdx == _pageIdx ? false : true) {
            GUIState.shrineUIVisible = false;
        }
        GUIState.inventoryTabIdx = _pageIdx;
        GUIState.inventorySlotIdx = GUIState.inventoryPageIdx = 0;
    }
}


export function drawGameUI() {
    var hidx, b, c, d, f, g, h, k;
    if (keyJustPressed[32]) {
        if (GUIState.memberUIVisible ||
            GUIState.inventoryUIVisible ||
            GUIState.bestiaryUIVisible ||
            GUIState.badgesUIVisible ||
            GUIState.optionsUIVisible ||
            GUIState.shrineUIVisible
        ) {
            GUIState.memberUIVisibleBackup = GUIState.memberUIVisible;
            GUIState.inventoryUIVisibleBackup = GUIState.inventoryUIVisible;
            GUIState.bestiaryUIVisibleBackup = GUIState.bestiaryUIVisible;
            GUIState.badgesUIVisibleBackup = GUIState.badgesUIVisible;
            GUIState.optionsUIVisibleBackup = GUIState.optionsUIVisible;
            GUIState.shrineUIVisibleBackup = GUIState.shrineUIVisible;
            GUIState.memberUIVisible = GUIState.inventoryUIVisible = GUIState.bestiaryUIVisible = GUIState.badgesUIVisible = GUIState.optionsUIVisible = GUIState.shrineUIVisible = false;
        } else {
            GUIState.memberUIVisible = GUIState.memberUIVisibleBackup;
            GUIState.inventoryUIVisible = GUIState.inventoryUIVisibleBackup;
            GUIState.bestiaryUIVisible = GUIState.bestiaryUIVisibleBackup;
            GUIState.badgesUIVisible = GUIState.badgesUIVisibleBackup;
            GUIState.optionsUIVisible = GUIState.optionsUIVisibleBackup;
            GUIState.shrineUIVisible = GUIState.shrineUIVisibleBackup;
        }
    }


    drawRect(0, 361, 640, 70, stageListArray[GUIState.currentStage][StageProps.stageUIBgColorCol]);
    f = 8;
    g = 348;
    drawText(LoadedFonts.gameFont, f, g, "LV " + PartyState.partyLevel, 16777215, 0);
    if (99 > PartyState.partyLevel) {
        var p = GUIState.LevelExpThresholds[PartyState.partyLevel - 1];
        drawText(LoadedFonts.gameFont, f + 48, g, "EXP " + PartyState.partyEXPAccum + "(" + RMath.floor(100 * (PartyState.partyEXPAccum - p) / (GUIState.LevelExpThresholds[PartyState.partyLevel] - p)) + "%)", 16777215, 0);
    } else drawText(LoadedFonts.gameFont, f + 48, g, "EXP " + PartyState.partyEXPAccum + "(MAX)", 16777215, 0);
    drawText(LoadedFonts.gameFont, f + 184, g, "G " + PartyState.partyGold, 16777215, 0);

    drawRect(f + 264, g, 90, 11, 2236962); // combo bar bg
    drawRect(f + 264, g, RMath.floor(90 * GameplayState.comboWindowTimer / GameplayState.comboWindowMaxFrames), 11, 12281344); // combo bar fg
    p = 10 + RMath.floor(GameplayState.comboCount / 10);
    h = "CB " + GameplayState.comboCount;
    LoadedFonts.gameFontMed.a = 4;
    drawText(LoadedFonts.gameFontMed, f + 265, g + 2, h, 12281344, 0); // combo count 
    if (GameplayState.comboCount >= 10) {
        LoadedFonts.gameFontMed.a = 4;
        drawText(LoadedFonts.gameFontMed, f + 265 + 6 * h.length + 0, g + 2, "*" + p / 10, 12281344, 0);
    }
    // 0 < Ic && (Ic--, 0 == Ic && (4 <= Hc && (Zg = 60, $g = floor((Hc * p / 10 + partyMemberCount - 1) / partyMemberCount), partyGold = clamp(partyGold + $g * partyMemberCount, 0, 9999999), A(1) && 100 <= Hc && IncrementBadgeCount(1), A(26) && 300 <= Hc && IncrementBadgeCount(26), A(36) && 500 <= Hc && IncrementBadgeCount(36), A(56) && 600 <= Hc && IncrementBadgeCount(56)), Hc = 0));
    if (GameplayState.comboWindowTimer > 0) {
        GameplayState.comboWindowTimer--;
        if (GameplayState.comboWindowTimer == 0) {
            if (GameplayState.comboCount >= 4) {
                GameplayState.comboPopupTimer = 60;
                GameplayState.comboGoldPayoutPerHero = RMath.floor((GameplayState.comboCount * p / 10 + PartyState.partyMemberCount - 1) / PartyState.partyMemberCount);
                PartyState.partyGold = RMath.clamp(PartyState.partyGold + GameplayState.comboGoldPayoutPerHero * PartyState.partyMemberCount, 0, 9999999);
                if (isBadgeIncompleteForCurrentStage(1) && 100 <= GameplayState.comboCount) {
                    IncrementBadgeCount(1);
                }
                if (isBadgeIncompleteForCurrentStage(26) && 300 <= GameplayState.comboCount) {
                    IncrementBadgeCount(26);
                }
                if (isBadgeIncompleteForCurrentStage(36) && 500 <= GameplayState.comboCount) {
                    IncrementBadgeCount(36);
                }
                if (isBadgeIncompleteForCurrentStage(56) && 600 <= GameplayState.comboCount) {
                    IncrementBadgeCount(56);
                }
            }
            GameplayState.comboCount = 0;
        }
    }
    p = 100 + GameplayState.comboMultBonus;
    LoadedFonts.gameFontMed.a = 4;
    drawText(LoadedFonts.gameFontMed, f + 356, g + 2, "CB *" + p / 100, 16777215, 0); // combo multiplier
    f = 8;
    g = 364;
    d = 80;
    var p = [12, 12, 12, 8, 16, 5, 19, 9, 14, 9, 14],
        t = [6, 10, 14, 13, 13, 13, 13, 18, 17, 21, 21],
        l = Array(11);
    for (let _i = 0; 11 > _i; _i++)
        l[_i] = new RMath.Vec2();

    for (hidx = 0; hidx < PartyState.partyMemberCount; hidx++) { // draw party
        drawRect(f + hidx * d, g, 24, 24, 0); // bg behind hero
        drawLine(f + hidx * d + 7, g + 22, f + hidx * d + 16, g + 22, 15908203);
        drawLine(f + hidx * d + 6, g + 23, f + hidx * d + 17, g + 23, 15908203);

        for (b = 0; 11 > b; b++) {
            l[b].x = f + hidx * d + p[b];
            l[b].y = g + t[b];
        }

        c = 16777215;
        if (0 < HeroesState.heroStatusTintTimer[hidx]) {
            c = 5934817;
        } else if (0 < HeroesState.heroSkipTimer[hidx]) {
            c = 1989840;
        } else if (0 < HeroesState.heroTimedDamageTimer[hidx]) {
            c = 3407616;
        }
        drawHero(hidx, l, 0, 1, 15908203, c, 2);

        drawText(LoadedFonts.gameFontSmall, f + hidx * d + 28, g, "P" + (hidx + 1), 3355443, -1);
        drawRect(f + hidx * d + 28, g + 8, 48, 7, 1114112);
        drawRect(f + hidx * d + 28, g + 8, RMath.floor(48 * PartyState.partyLP[hidx] / PartyState.partyMaxLP[hidx]), 7, 10027008);
        drawText(LoadedFonts.gameFontSmall, f + hidx * d + 28, g + 8, "" + PartyState.partyLP[hidx], 16764108, -1);
        drawRect(f + hidx * d + 28, g + 17, 48, 5, 17);
        drawRect(f + hidx * d + 28, g + 17, 48 * PartyState.heroEmitCurrent[hidx] / RMath.max(PartyState.heroEmitValues[hidx], 1), 5, 221);
        if (buttonCheck(f + hidx * d, g, 24, 24)) {
            fillEmptyPixelsRect(f + hidx * d, g, 24, 24, 8388608);

            if (isMouseClicked && GUIState.selectingHero == hidx) {
                GUIState.memberUIVisible = !GUIState.memberUIVisible;
            }

            if (isMouseClicked) {
                GUIState.selectingHero = hidx;
            }
        }
        for (b = 0; 5 > b; b++) {
            c = PartyState.partyEquipmentTable[hidx][b];
            k = f + hidx * d + b % 3 * 20;
            var n = g + 28 + 20 * RMath.floor(b / 3);
            drawRect(k, n, 16, 16, 0);
            if (0 != c) {
                RenderingState.spriteAltRenderFlag = 2;
                h = itemList[c][ItemProps.HeadwearType];
                if (2 == b) {
                    drawSpriteSheetPartTintedScaled(LoadedSprites.itemsSpriteSheet, k, n, 16, 16, 16 * (h & 15), 16 * (h >> 4), 16, 16, itemList[c][ItemProps.SpriteSourceX], itemList[c][ModifierColumns.itemSpriteLocY], true);
                } else if (3 == b || 4 == b) {
                    drawItemSpriteTinted(k, n, 16 * (h & 15), 16 * (h >> 4), itemList[c][ItemProps.SpriteSourceX], itemList[c][ModifierColumns.itemSpriteLocY]);
                } else {
                    drawSpriteSheetPart(LoadedSprites.itemsSpriteSheet, k, n, 16, 16, 16 * (h & 15), 16 * (h >> 4), 16, 16, itemList[c][ItemProps.SpriteSourceX]);
                }
                RenderingState.spriteAltRenderFlag = 0;
            }
            handleInventoryButton(k, n, 16, 16, c, b);
            if (buttonCheck(k, n, 16, 16) && isMouseClicked && 0 != c) {
                GUIState.selectingHero = hidx;
            }
        }
    }
    drawRectOutline(f + GUIState.selectingHero * d - 1, g - 1, 26, 26, 16711680);
    f = 472;
    g = 379;
    d = 36;
    if (drawIconButton(f + -1 * d, g, 13, "" + PartyState.collectedStageFlagsCount + "/" + PartyState.stageFlagsSetCount, 16777215) && isMouseClicked) {
        for (hidx = c = 0; hidx < PartyState.partyMemberCount; hidx++) c += PartyState.partyMaxLP[hidx] - PartyState.partyLP[hidx];
        if (0 < c && 0 < PartyState.collectedStageFlagsCount) {
            for (hidx = 0; hidx < PartyState.partyMemberCount; hidx++) {
                if (PartyState.partyLP[hidx] != PartyState.partyMaxLP[hidx]) {
                    spawnPopup(HeroesState.heroJointPositionsByHero[hidx][0].x, HeroesState.heroJointPositionsByHero[hidx][0].y, 0, PartyState.partyMaxLP[hidx] - PartyState.partyLP[hidx], 60, 65280);
                }
                PartyState.partyLP[hidx] = PartyState.partyMaxLP[hidx];
            }
            PartyState.collectedStageFlagsCount--;
            StageState.stageFlagUseCount++;
        }
    }
    if (drawIconButton(f + 0 * d, g, 1, "STATUS", GUIState.memberUIVisible ? 16750950 : 16777215)) {
        if (isMouseClicked) {
            GUIState.memberUIVisible = !GUIState.memberUIVisible;
        }
    }

    if (drawIconButton(f + 1 * d, g, 2, "ITEM", GUIState.inventoryUIVisible ? 16750950 : 16777215)) {
        if (isMouseClicked && (GUIState.inventoryUIVisible = !GUIState.inventoryUIVisible)) {
            GUIState.shrineUIVisible = false;
        }
    }

    if (drawIconButton(f + 2 * d, g, 3, "MONSTER", GUIState.bestiaryUIVisible ? 16750950 : 16777215)) {
        if (isMouseClicked && (GUIState.bestiaryUIVisible = !GUIState.bestiaryUIVisible)) {
            GUIState.badgesUIVisible = false;
        }
    }

    if (drawIconButton(f + 3 * d, g, 4, "MEDAL", GUIState.badgesUIVisible ? 16750950 : 16777215)) {
        if (isMouseClicked && (GUIState.badgesUIVisible = !GUIState.badgesUIVisible)) {
            GUIState.bestiaryUIVisible = false;
        }
    }

    if (drawIconButton(f + 4 * d, g, 5, "OPTION", GUIState.optionsUIVisible ? 16750950 : 16777215)) {
        if (isMouseClicked) {
            GUIState.optionsUIVisible = !GUIState.optionsUIVisible;
        }
    }
    c = 0;
    for (b = PartyState.itemIsNew.length - 1; 0 <= b; b--) c += PartyState.itemIsNew[b];
    if (0 < c) {
        drawText(LoadedFonts.gameFontSmall, f + 1 * d - 16, g - 16, "NEW", 16776960, -1);
    }
    if (1 == GUIState.currentStage) {
        LoadedFonts.gameFont.a = 1;
        drawTextCentered(LoadedFonts.gameFont, 530, 168, "INN", 16777215, 8409120);
        if (buttonCheckCentered(528, 180, 48, 40)) {
            for (hidx = c = 0; hidx < PartyState.partyMemberCount; hidx++)
                c += PartyState.partyMaxLP[hidx] - PartyState.partyLP[hidx];
            if (0 < c) {
                c = 10;
            }
            c += 10 * (PartyState.stageFlagsSetCount - PartyState.collectedStageFlagsCount);
            LoadedFonts.gameFont.a = 1;
            drawTextCentered(LoadedFonts.gameFont, 530, 168, "INN", 15908203, 8409120);
            drawTextCentered(LoadedFonts.gameFont, 528, 187, "G " + c, 16777215, 8409120);
            if (0 < c && c <= PartyState.partyGold && isMouseClicked && !GUIState.clickInUI) {
                for (hidx = 0; hidx < PartyState.partyMemberCount; hidx++) {
                    if (PartyState.partyLP[hidx] != PartyState.partyMaxLP[hidx]) {
                        spawnPopup(HeroesState.heroJointPositionsByHero[hidx][0].x, HeroesState.heroJointPositionsByHero[hidx][0].y, 0, PartyState.partyMaxLP[hidx] - PartyState.partyLP[hidx], 60, 65280);
                    }
                    PartyState.partyLP[hidx] = PartyState.partyMaxLP[hidx];
                }
                if (PartyState.collectedStageFlagsCount != PartyState.stageFlagsSetCount) {
                    spawnPopup(436, 380, 0, PartyState.stageFlagsSetCount - PartyState.collectedStageFlagsCount, 60, 65280);
                }
                PartyState.collectedStageFlagsCount = PartyState.stageFlagsSetCount;
                PartyState.partyGold = RMath.clamp(PartyState.partyGold - c, 0, 9999999);
            }
        }
        LoadedFonts.gameFont.a = 1;
        drawTextCentered(LoadedFonts.gameFont, 54, 296, "SMITH", 16777215, 8409120);
        if (buttonCheckCentered(52, 308, 56, 40)) {
            LoadedFonts.gameFont.a = 1;
            drawTextCentered(LoadedFonts.gameFont, 54, 296, "SMITH", 15908203, 8409120);
            if (isMouseClicked && !GUIState.clickInUI) {
                if (GUIState.inventoryUIVisible = !GUIState.inventoryUIVisible) {
                    GUIState.shrineUIVisible = false;
                }
            }
        }
    } else if (12 == GUIState.currentStage) {
        LoadedFonts.gameFont.a = 1;
        drawTextCentered(LoadedFonts.gameFont, 418, 104, "SHRINE", 16777215, 8409120);
        if (buttonCheckCentered(416, 108, 48, 40)) {
            LoadedFonts.gameFont.a = 1;
            drawTextCentered(LoadedFonts.gameFont, 418, 104, "SHRINE", 15908203, 8409120);
            if (isMouseClicked && !GUIState.clickInUI && (GUIState.shrineUIVisible = !GUIState.shrineUIVisible)) {
                GUIState.inventoryUIVisible = false;
            }
        }
    };

    if (GUIState.memberUIVisible) {
        g = f = 14;
        drawRect(f - 6, g - 6, 204, 196, stageListArray[GUIState.currentStage][StageProps.stageUIBgColorCol]);
        LoadedFonts.gameFont.a = 1;
        drawText(LoadedFonts.gameFont, f, g, "LP " + PartyState.partyLP[GUIState.selectingHero] + "/" + PartyState.partyMaxLP[GUIState.selectingHero] + " SP (" + PartyState.partySP[GUIState.selectingHero] + ")", 16777215, 0);
        let k = "LP +10%;Short Attack +5%;Middle Attack +5%;Long Attack +5%;Physical +5%;Elemental +5%;Dodge +2%".split(";");
        LoadedFonts.gameFont.a = 1;
        drawText(LoadedFonts.gameFont, f, g + 20, k[GUIState.selectedStatIndex], 16777215, 0);
        let statXs = [9, 0, 20, 21, 17, 22, 23];
        let maxStats = [999, 999, 999, 999, 999, 999, 25];

        // draw each hero stat
        for (let _statIdx = 0; 7 > _statIdx; _statIdx++) {
            let _clicked = drawMenuButton(
                f + 12 + _statIdx % 7 * 28, g + 46 + 28 * ~~(_statIdx / 7),
                statXs[_statIdx],
                "" + PartyState.partyStats[_statIdx][GUIState.selectingHero],
                GUIState.selectedStatIndex == _statIdx ? 16737894 : 16777215
            );
            if (_clicked) {
                if (GUIState.selectedStatIndex != _statIdx) {
                    // mouse button is held, but the cursor is hovering over another icon
                    if (isMouseReleased) GUIState.selectedStatIndex = _statIdx;
                } else if (0 < PartyState.partySP[GUIState.selectingHero] && PartyState.partyStats[GUIState.selectedStatIndex][GUIState.selectingHero] < maxStats[GUIState.selectedStatIndex]) {
                    drawText(LoadedFonts.gameFontSmall, mouseXCurrent - 5, mouseYCurrent - 8, "UP", 16776960, 1118481);
                    if (isMouseReleased) {
                        PartyState.partyStats[GUIState.selectedStatIndex][GUIState.selectingHero]++;
                        PartyState.partySP[GUIState.selectingHero]--;
                    }
                }
            }
        }

        if (drawCancelButton(f + 188, g + 4) && isMouseClicked) {
            GUIState.memberUIVisible = false;
        }

        g += 64;
        // show stats
        for (let _slotIdx = 0; 2 > _slotIdx; _slotIdx++) { // loop over primary and secondary
            let _equipmentIdx = PartyState.partyEquipmentTable[GUIState.selectingHero][_slotIdx];
            if (0 != itemList[_equipmentIdx][ItemProps.Appearance]) { // is it empty
                if (10 > itemList[_equipmentIdx][ItemProps.Appearance]) {
                    LoadedFonts.gameFontMed.a = 4;
                    let accessoryLevel = PartyState.itemForgeLvls[_equipmentIdx];
                    if (heroHasAccessoryEffect(GUIState.selectingHero, AccessoryProps.ArmsBonus0) && 3 == itemList[_equipmentIdx][ItemProps.DropIconCol]) {
                        accessoryLevel += countAccessoryLvlBonuses(GUIState.selectingHero, AccessoryProps.ArmsBonus0);
                    }
                    if (heroHasAccessoryEffect(GUIState.selectingHero, AccessoryProps.ChargeBonus) && 4 == itemList[_equipmentIdx][ItemProps.DropIconCol]) {
                        accessoryLevel += countAccessoryLvlBonuses(GUIState.selectingHero, AccessoryProps.ChargeBonus);
                    }
                    if (heroHasAccessoryEffect(GUIState.selectingHero, AccessoryProps.ArmsBonus1) && 3 == itemList[_equipmentIdx][ItemProps.DropIconCol]) {
                        accessoryLevel += countAccessoryLvlBonuses(GUIState.selectingHero, AccessoryProps.ArmsBonus1);
                    }
                    if (heroHasAccessoryEffect(GUIState.selectingHero, AccessoryProps.ArmsBonus1) && 4 == itemList[_equipmentIdx][ItemProps.DropIconCol]) {
                        accessoryLevel += sumAccessorySecondaryValues(GUIState.selectingHero, AccessoryProps.ArmsBonus1);
                    }

                    drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 0, "" + itemList[_equipmentIdx][ItemProps.Name] + " " + accessoryLevel, -1, 0);

                    let atkRangeTxt = "AT " + PartyState.minAtkArray[4 * _slotIdx + GUIState.selectingHero] + "-" + PartyState.maxAtkArray[4 * _slotIdx + GUIState.selectingHero];

                    if (itemList[_equipmentIdx][ItemProps.AttackMode] === 10 ||
                        itemList[_equipmentIdx][ItemProps.AttackMode] === 11) {
                        atkRangeTxt += " *" + PartyState.atkCountArray[4 * _slotIdx + GUIState.selectingHero] + ">" + ~~(getModifiedStatVal(GUIState.selectingHero, _equipmentIdx, ItemProps.AttackCooldown) * getModifiedStatVal(GUIState.selectingHero, _equipmentIdx, ItemProps.AttackPower) / 60);
                    } else if (0 != itemList[_equipmentIdx][ItemProps.AttackMode]) {
                        let b = getModifiedStatVal(GUIState.selectingHero, _equipmentIdx, ItemProps.AttackPower);
                        if (heroHasAccessoryEffect(GUIState.selectingHero, AccessoryProps.EffectLightningElemBonus) && 3 == itemList[_equipmentIdx][ItemProps.ElementType] && 20 == itemList[_equipmentIdx][ItemProps.AttackMode]) {
                            b += countAccessoryLvlBonuses(GUIState.selectingHero, AccessoryProps.EffectLightningElemBonus);
                        }
                        atkRangeTxt += " *" + PartyState.atkCountArray[4 * _slotIdx + GUIState.selectingHero] + ">" + b;
                    } else {
                        if (1 < PartyState.atkCountArray[4 * _slotIdx + GUIState.selectingHero]) {
                            atkRangeTxt += " *" + PartyState.atkCountArray[4 * _slotIdx + GUIState.selectingHero];
                        }
                        if (99 == getModifiedStatVal(GUIState.selectingHero, _equipmentIdx, ItemProps.HitCountStat)) {
                            atkRangeTxt += " all";
                        } else if (1 < getModifiedStatVal(GUIState.selectingHero, _equipmentIdx, ItemProps.HitCountStat)) {
                            atkRangeTxt += " " + getModifiedStatVal(GUIState.selectingHero, _equipmentIdx, ItemProps.HitCountStat) + "hit";
                        }
                        drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 12, atkRangeTxt, 16777215, 0);
                        if (!_slotIdx) {
                            drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 24, "AGI " + PartyState.heroAgiValues[GUIState.selectingHero], 16777215, 0);
                            drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 36, "RANGE " + PartyState.heroRangeValues[GUIState.selectingHero], 16777215, 0);
                        }
                        if (_slotIdx) {
                            if (-1 == PartyState.heroEmitValues[GUIState.selectingHero]) {
                                drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 48, "EMIT passive", 16777215, 0);
                            } else {
                                drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 48, "EMIT " + PartyState.heroEmitValues[GUIState.selectingHero], 16777215, 0);
                            }
                        } else {
                            drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 48, "CHARGE +" + PartyState.heroChargeValues[GUIState.selectingHero], 16777215, 0);
                            drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 60, "SML", 16777215, 0);
                            if (0 == itemList[_equipmentIdx][ItemProps.RangeType]) {
                                drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 60, "    short", 16764057, 0);
                            }
                            if (1 == itemList[_equipmentIdx][ItemProps.RangeType]) {
                                drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 60, "    middle", 16764057, 0);
                            }
                            if (2 == itemList[_equipmentIdx][ItemProps.RangeType]) {
                                drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 60, "    long", 16764057, 0);
                            }
                            drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 72, "ATR", 16777215, 0);
                            if (0 == itemList[_equipmentIdx][ItemProps.ElementType]) {
                                drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 72, "    physical", 10066329, 0);
                            }
                            if (1 == itemList[_equipmentIdx][ItemProps.ElementType]) {
                                drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 72, "    fire", 16724736, 0);
                            }
                            if (2 == itemList[_equipmentIdx][ItemProps.ElementType]) {
                                let iceVal = getModifiedStatVal(GUIState.selectingHero, _equipmentIdx, ItemProps.IceBonusPercent);
                                if (heroHasAccessoryEffect(GUIState.selectingHero, AccessoryProps.EffectIceStatBonus)) {
                                    iceVal += countAccessoryLvlBonuses(GUIState.selectingHero, AccessoryProps.EffectIceStatBonus);
                                }
                                drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 72, "    ice " + iceVal + "%", 10070783, 0);
                            }
                            if (3 == itemList[_equipmentIdx][ItemProps.ElementType]) {
                                drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 72, "    lightning", 15658496, 0);
                            }
                            if (4 == itemList[_equipmentIdx][ItemProps.ElementType]) {
                                drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 72, "    poison", 52224, 0);
                            }
                        }
                    }
                } else {
                    LoadedFonts.gameFontMed.a = 4;
                    drawText(LoadedFonts.gameFontMed, f + 96 * _slotIdx, g + 0, "" + itemList[_equipmentIdx][ItemProps.Name] + " Lv" + PartyState.itemForgeLvls[_equipmentIdx], 16777215, 0);
                }
            };
        }
        g += 96;
        k = ["ARMS", "CHARGE"];
        for (hidx = 0; 2 > hidx; hidx++) {
            c = PartyState.partyEquipmentTable[GUIState.selectingHero][hidx];
            b = f + 28 * hidx;
            d = g;
            drawRect(b, d, 24, 24, 0);
            RenderingState.spriteAltRenderFlag = 2;
            h = itemList[c][ItemProps.HeadwearType];
            drawSpriteSheetPart(LoadedSprites.itemsSpriteSheet, b + 4, d + 4, 16, 16, 16 * (h & 15), 16 * (h >> 4), 16, 16, itemList[c][ItemProps.SpriteSourceX]);
            RenderingState.spriteAltRenderFlag = 0;
            
            drawTextCentered(LoadedFonts.gameFontSmall, b + 12, d + 0, k[hidx], 16777215, 0);
            handleInventoryButton(b, d, 24, 24, c, hidx);
            
        }
    }

    if (GUIState.inventoryUIVisible) {
        let _ox = 224;
        let _oy = 14;
        drawRect(_ox - 6, _oy - 6, 204, 260, stageListArray[GUIState.currentStage][StageProps.stageUIBgColorCol]);
        let c = inventoryItemLists[GUIState.inventoryTabIdx][28 * GUIState.inventoryPageIdx + GUIState.inventorySlotIdx];

        if (0 != PartyState.itemForgeLvls[c] && 1 == GUIState.currentStage && 2 >= GUIState.inventoryTabIdx) { // item upgrade panel
            drawTextCentered(LoadedFonts.gameFontMed, _ox + 138, _oy + 28, "Lv UP", 16777215, 0);
            hidx = getItemStatWithForge(c, ItemProps.ForgeMaxLevel);
            if (0 == hidx)
                drawButtonBoldedText(_ox + 138, _oy + 48 - 2, 80, 24, "---");
            else if (PartyState.itemForgeLvls[c] < hidx) {
                PartyState.forgePreviewItemIdx = -1;
                h = getItemStatWithForge(c, ItemProps.ForgeCostPerLevel) * PartyState.itemForgeLvls[c];
                if (drawButtonBoldedText(_ox + 138, _oy + 48 - 2, 80, 24, "G " + h) && h <= PartyState.partyGold) {
                    PartyState.forgePreviewItemIdx = c;
                    if (isMouseClicked) {
                        PartyState.forgePreviewItemIdx = -1;
                        PartyState.partyGold = RMath.clamp(PartyState.partyGold - h, 0, 9999999);
                        PartyState.itemForgeLvls[c]++;
                    }
                }
            } else {
                drawButtonBoldedText(_ox + 138, _oy + 48 - 2, 80, 24, "MAX");
            }
        }

        if (0 != PartyState.itemForgeLvls[c]) {
            if (10 > itemList[c][ItemProps.Appearance]) {
                LoadedFonts.gameFontMed.a = 4;
                drawText(LoadedFonts.gameFontMed, _ox, _oy + 0, "" + itemList[c][ItemProps.Name] + " Lv" + PartyState.itemForgeLvls[c], -1, 0);
                h = "AT " + getItemStatWithForge(c, ItemProps.AtkMin) + "-" + getItemStatWithForge(c, ItemProps.AtkMax);
                if (10 <= getItemStatWithForge(c, ItemProps.AttackMode) && 11 >= getItemStatWithForge(c, ItemProps.AttackMode)) {
                    h += " *" + getItemStatWithForge(c, ItemProps.ProjectileCount) + ">" + ~~(getItemStatWithForge(c, ItemProps.AttackCooldown) * getItemStatWithForge(c, ItemProps.AttackPower) / 60);
                } else if (0 != getItemStatWithForge(c, ItemProps.AttackMode)) {
                    h += " *" + getItemStatWithForge(c, ItemProps.ProjectileCount) + ">" + getItemStatWithForge(c, ItemProps.AttackPower);
                } else {
                    if (1 < getItemStatWithForge(c, ItemProps.ProjectileCount)) {
                        h += " *" + getItemStatWithForge(c, ItemProps.ProjectileCount);
                    }
                    if (99 == getItemStatWithForge(c, ItemProps.HitCountStat)) {
                        h += " all";
                    } else {
                        if (1 < getItemStatWithForge(c, ItemProps.HitCountStat)) {
                            h += " " + getItemStatWithForge(c, ItemProps.HitCountStat) + "hit";
                        }
                        drawText(LoadedFonts.gameFontMed, _ox, _oy + 12, h, 16777215, 0);
                        if (                    0 == GUIState.inventoryTabIdx) {
                            drawText(LoadedFonts.gameFontMed, _ox, _oy + 24, "AGI " + getItemStatWithForge(c, ItemProps.Agility), 16777215, 0);
                        }
                        if (0 == GUIState.inventoryTabIdx) {
                            drawText(LoadedFonts.gameFontMed, _ox, _oy + 36, "RANGE " + getItemStatWithForge(c, ItemProps.Range), 16777215, 0);
                        }
                        if (0 == GUIState.inventoryTabIdx) {
                            drawText(LoadedFonts.gameFontMed, _ox, _oy + 48, "CHARGE +" + getItemStatWithForge(c, ItemProps.ChargeEmitValue), 16777215, 0);
                        } else {
                            if (-1 == getItemStatWithForge(c, ItemProps.ChargeEmitValue)) {
                                drawText(LoadedFonts.gameFontMed, _ox, _oy + 48, "EMIT passive", 16777215, 0);
                            } else {
                                drawText(LoadedFonts.gameFontMed, _ox, _oy + 48, "EMIT " + getItemStatWithForge(c, ItemProps.ChargeEmitValue), 16777215, 0);
                                drawText(LoadedFonts.gameFontMed, _ox, _oy + 60, "SML", 16777215, 0);
                                if (0 == itemList[c][ItemProps.RangeType]) {
                                    drawText(LoadedFonts.gameFontMed, _ox, _oy + 60, "    short", 16764057, 0);
                                }
                                if (1 == itemList[c][ItemProps.RangeType]) {
                                    drawText(LoadedFonts.gameFontMed, _ox, _oy + 60, "    middle", 16764057, 0);
                                }
                                if (2 == itemList[c][ItemProps.RangeType]) {
                                    drawText(LoadedFonts.gameFontMed, _ox, _oy + 60, "    long", 16764057, 0);
                                }
                                drawText(LoadedFonts.gameFontMed, _ox, _oy + 72, "ATR", 16777215, 0);
                                if (0 == itemList[c][ItemProps.ElementType]) {
                                    drawText(LoadedFonts.gameFontMed, _ox, _oy + 72, "    physical", 10066329, 0);
                                }
                                if (1 == itemList[c][ItemProps.ElementType]) {
                                    drawText(LoadedFonts.gameFontMed, _ox, _oy + 72, "    fire", 16724736, 0);
                                }
                                if (2 == itemList[c][ItemProps.ElementType]) {
                                    drawText(LoadedFonts.gameFontMed, _ox, _oy + 72, "    ice " + getItemStatWithForge(c, ItemProps.IceBonusPercent) + "%", 10070783, 0);
                                }
                                if (3 == itemList[c][ItemProps.ElementType]) {
                                    drawText(LoadedFonts.gameFontMed, _ox, _oy + 72, "    lightning", 15658496, 0);
                                }
                                if (4 == itemList[c][ItemProps.ElementType]) {
                                    drawText(LoadedFonts.gameFontMed, _ox, _oy + 72, "    poison", 52224, 0);
                                }
                                hidx = getItemForgeMultiplier(c, ItemProps.ProjectileAcceleration);
                                if (-1 != hidx) {
                                    drawText(LoadedFonts.gameFontMed, _ox + 84, _oy + 72, "RANGE +" + hidx + "%", 16777215, 0);
                                }
                                hidx = getItemForgeMultiplier(c, ItemProps.AttackCooldown);
                                if (-1 != hidx) {
                                    drawText(LoadedFonts.gameFontMed, _ox + 84, _oy + 72, "COUNT +" + hidx + "%", 16777215, 0);
                                }
                                hidx = getItemForgeMultiplier(c, ItemProps.StatA);
                                if (-1 != hidx) {
                                    drawText(LoadedFonts.gameFontMed, _ox + 84, _oy + 72, "COUNT +" + hidx + "%", 16777215, 0);
                                }
                            }
                        }
                    }
                }

            } else if (20 > itemList[c][ItemProps.Appearance]) {
                if (LoadedFonts.gameFontMed.a = 4, 0 == itemList[c][ItemProps.ForgeMaxLevel]) {
                    drawText(LoadedFonts.gameFontMed, _ox, _oy + 0, "" + itemList[c][ItemProps.Name], -1, 0);
                } else {
                    drawText(LoadedFonts.gameFontMed, _ox, _oy + 0, "" + itemList[c][ItemProps.Name] + " Lv" + PartyState.itemForgeLvls[c], -1, 0);
                    d = 1;
                    {
                        hidx = getItemStatWithForge(c, ModifierColumns.heroHealthModifier);
                        if (0 < hidx) {
                            drawText(LoadedFonts.gameFontMed, _ox, _oy + 12 * d, "LP +" + hidx, 16777215, 0);
                            d++;
                        }
                    }
                    hidx = getItemStatWithForge(c, ModifierColumns.heroDefenseModifier);
                    if (0 < hidx) {
                        drawText(LoadedFonts.gameFontMed, _ox, _oy + 12 * d, "DF +" + hidx, 16777215, 0);
                        d++;
                    }
                    hidx = getItemStatWithForge(c, ModifierColumns.heroMagicDefModifier);
                    if (0 < hidx) {
                        drawText(LoadedFonts.gameFontMed, _ox, _oy + 12 * d, "MAGIC DF " + hidx + "%", 16777215, 0);
                        d++;
                    }
                    hidx = getItemStatWithForge(c, ModifierColumns.heroDodgeModifier);
                    if (0 < hidx) {
                        drawText(LoadedFonts.gameFontMed, _ox, _oy + 12 * d, "DODGE +" + hidx, 16777215, 0);
                    }
                }
            
            } else {
                LoadedFonts.gameFontMed.a = 4;
                drawText(LoadedFonts.gameFontMed, _ox, _oy + 0, "" + itemList[c][ItemProps.Name], -1, 0);
                if (0 != itemList[c][AccessoryPrefixes.PrimaryValue]) {
                    drawText(LoadedFonts.gameFontMed, _ox, _oy + 12, itemList[c][AccessoryPrefixes.PrimaryPrefix] + itemList[c][AccessoryPrefixes.PrimaryValue] + itemList[c][AccessoryPrefixes.PrimarySuffix], 16777215, 0);
                }
                if (0 != itemList[c][AccessoryPrefixes.SecondaryValue]) {
                    drawText(LoadedFonts.gameFontMed, _ox, _oy + 24, itemList[c][AccessoryPrefixes.SecondaryLabelPrefix] + itemList[c][AccessoryPrefixes.SecondaryValue] + itemList[c][AccessoryPrefixes.SecondaryLabelSuffix], 16777215, 0);
                }
            }
            
        }

        PartyState.forgePreviewItemIdx = -1;
        k = GUIState.inventoryTabIdx;
        if (drawCancelButton(_ox + 188, _oy + 4) && isMouseClicked) {
            GUIState.inventoryUIVisible = false;
        }
        for (hidx = 0; 28 > hidx; hidx++) {
            c = inventoryItemLists[GUIState.inventoryTabIdx][28 * GUIState.inventoryPageIdx + hidx];
            b = _ox + hidx % 7 * 28;
            d = _oy + 84 + 28 * ~~(hidx / 7);
            drawRect(b, d, 24, 24, 0);
            if (0 < PartyState.itemForgeLvls[c]) {
                RenderingState.spriteAltRenderFlag = 2;
                h = itemList[c][ItemProps.HeadwearType];
                if (2 == GUIState.inventoryTabIdx) {
                    drawSpriteSheetPartTintedScaled(LoadedSprites.itemsSpriteSheet, b + 4, d + 4, 16, 16, 16 * (h & 15), 16 * (h >> 4), 16, 16, itemList[c][ItemProps.SpriteSourceX], itemList[c][ModifierColumns.itemSpriteLocY], true);
                } else if (3 == GUIState.inventoryTabIdx || 4 == GUIState.inventoryTabIdx) {
                    drawItemSpriteTinted(b + 4, d + 4, 16 * (h & 15), 16 * (h >> 4), itemList[c][ItemProps.SpriteSourceX], itemList[c][ModifierColumns.itemSpriteLocY]);
                } else {
                    drawSpriteSheetPart(LoadedSprites.itemsSpriteSheet, b + 4, d + 4, 16, 16, 16 * (h & 15), 16 * (h >> 4), 16, 16, itemList[c][ItemProps.SpriteSourceX]);
                }
                
                RenderingState.spriteAltRenderFlag = 0;
            }
            if (hidx == GUIState.inventorySlotIdx) {
                drawRectOutline(b, d, 24, 24, 16711680);
            }
            if (buttonCheck(b, d, 24, 24)) {
                fillEmptyPixelsRect(b, d, 24, 24, 6684672);
                if (GUIState.inventorySlotIdx != hidx) {
                    if (isMouseReleased) {
                        GUIState.inventorySlotIdx = hidx;
                    }
                } else {
                    h = -1;
                    if (PartyState.partyEquipmentTable[0][k] == c) {
                        h = 0;
                    } else if (PartyState.partyEquipmentTable[1][k] == c) {
                        h = 1;
                    } else if (PartyState.partyEquipmentTable[2][k] == c) {
                        h = 2;
                    } else if (PartyState.partyEquipmentTable[3][k] == c) {
                        h = 3;
                    }

                    if (0 != PartyState.itemForgeLvls[c]) {
                        if (-1 == h) {
                            drawText(LoadedFonts.gameFontSmall, mouseXCurrent - 20, mouseYCurrent - 8, "EQUIP", 16777215, 1118481);
                            if (isMouseReleased) {
                                PartyState.partyEquipmentTable[GUIState.selectingHero][k] = c;
                            }
                        } else if (h == GUIState.selectingHero) {
                            drawText(LoadedFonts.gameFontSmall, mouseXCurrent - 25, mouseYCurrent - 8, "REMOVE", 16777215,
                                0);
                            if (isMouseReleased) {
                                PartyState.partyEquipmentTable[GUIState.selectingHero][k] = 0;
                            }
                        } else {
                            drawText(LoadedFonts.gameFontSmall, mouseXCurrent - 25, mouseYCurrent - 16, "REMOVE", 16777215, 0);
                            drawText(LoadedFonts.gameFontSmall, mouseXCurrent - 20, mouseYCurrent - 8, "EQUIP", 16777215, 1118481);
                            if (isMouseReleased) {
                                PartyState.partyEquipmentTable[h][k] = 0;
                                PartyState.partyEquipmentTable[GUIState.selectingHero][k] = c;
                            }
                        }
                        
                    }
                }
                if (isMouseReleased) {
                    PartyState.itemIsNew[c] = 0;
                }
            }
            if (0 < PartyState.itemIsNew[c]) {
                drawText(LoadedFonts.gameFontSmall, b, d, "NEW", 16776960, -1);
            }
            if (0 != c) {
                if (PartyState.partyEquipmentTable[0][k] == c) {
                    drawText(LoadedFonts.gameFontSmall, b + 14, d + 17, "E1", 16777215, -1);
                } else if (PartyState.partyEquipmentTable[1][k] == c) {
                    drawText(LoadedFonts.gameFontSmall, b + 14, d + 17, "E2", 16777215, -1);
                } else if (PartyState.partyEquipmentTable[2][k] == c) {
                    drawText(LoadedFonts.gameFontSmall, b + 14, d + 17, "E3", 16777215, -1);
                } else if (PartyState.partyEquipmentTable[3][k] == c) {
                    drawText(LoadedFonts.gameFontSmall, b + 14, d + 17, "E4", 16777215, -1);
                }
            }
        }
        k = ["ARMS", "CHARGE", "HEAD", "RING", "AMULET"];
        for (hidx = 0; 5 > hidx; hidx++) {
            if (drawMenuButton(_ox + 12 + 28 * hidx, _oy + 238, hidx, k[hidx], GUIState.inventoryTabIdx == hidx ? 16737894 : 16777215)) {
                if (isMouseClicked) {
                    GUIState.inventoryTabIdx = hidx;
                }
            }
            c = 0;
            for (b = inventoryItemLists[hidx].length - 1; 0 <= b; b--) c += PartyState.itemIsNew[inventoryItemLists[hidx][b]];
            if (0 < c) {
                drawText(LoadedFonts.gameFontSmall, _ox + 12 + 28 * hidx - 12, _oy + 238 - 12, "NEW", 16776960, -1);
            }
        }
        if (drawMenuButton(_ox + 96 - 42, _oy + 209, 7, "PREV", 16777215) && isMouseClicked) {
            GUIState.inventoryPageIdx--;
        }
        if (drawMenuButton(_ox + 138, _oy + 209, 8, "NEXT", 16777215) && isMouseClicked) {
            GUIState.inventoryPageIdx++;
        }
        h = ~~(inventoryItemLists[GUIState.inventoryTabIdx].length / 28);
        GUIState.inventoryPageIdx = RMath.clamp(GUIState.inventoryPageIdx, 0, h - 1);
        drawTextCentered(LoadedFonts.gameFontSmall, _ox + 96, _oy + 209, "" + (GUIState.inventoryPageIdx + 1) + "/" + h, 3355443, -1);
    }

    if (GUIState.bestiaryUIVisible) {
        let f = 434;
        let g = 14;
        drawRect(f - 6, g - 6, 204, 180, stageListArray[GUIState.currentStage][StageProps.stageUIBgColorCol]);
        if (drawCancelButton(f + 188, g + 4) && isMouseClicked) {
            GUIState.bestiaryUIVisible = false;
        }
        GUIState.bestiaryEnemySelection = RMath.clamp(GUIState.bestiaryEnemySelection, 0, bestiaryPageItems[GUIState.currentBestiaryPage].length - 1);
        let c = bestiaryPageItems[GUIState.currentBestiaryPage][GUIState.bestiaryEnemySelection];

        if (0 == StageState.isStageReachedArray[stageIndexOrder[GUIState.currentBestiaryPage]]) {
            drawTextCentered(LoadedFonts.gameFont, f + 96, g + 48, "Not reached", -1, 0);
        } else {
            if (0 == BestiaryState.bestiaryEntryState[c]) {
                h = enemyCatalog[c][EnemyProps.BestiaryUnlockCost];
                if (drawButtonBoldedText(f + 96, g + 48, 96, 24, "G " + h) && h <= PartyState.partyGold && isMouseClicked) {
                    PartyState.partyGold = RMath.clamp(PartyState.partyGold - h, 0, 9999999);
                    BestiaryState.bestiaryEntryState[c] = 1;
                }
            } else {
                drawText(LoadedFonts.gameFontMed, f, g + 0, "LV " + enemyCatalog[c][EnemyProps.Level], 16777215, 0);
                drawText(LoadedFonts.gameFontMed, f, g + 12, "LP " + enemyCatalog[c][EnemyProps.Health], 16777215, 0);
                drawText(LoadedFonts.gameFontMed, f, g + 24, "GOLD " + enemyCatalog[c][EnemyProps.GoldReward], 16777215, 0);
                drawText(LoadedFonts.gameFontMed, f, g + 36, "EXP " + enemyCatalog[c][EnemyProps.ExpReward], 16777215, 0);
                b = 0;
                if (0 != enemyCatalog[c][EnemyProps.PhysResistPct]) {
                    drawMedTextNoOutline(f + 22 + b, g + 48, "ph", 10066329);
                    b += 13;
                }
                if (0 != enemyCatalog[c][EnemyProps.FireResistPct]) {
                    drawMedTextNoOutline(f + 22 + b, g + 48, "fi", 16724736);
                    b += 10;
                }
                if (0 != enemyCatalog[c][EnemyProps.IceResistPct]) {
                    drawMedTextNoOutline(f + 22 + b, g + 48, "ic", 10070783);
                    b += 10;
                }
                if (0 != enemyCatalog[c][EnemyProps.LightResistPct]) {
                    drawMedTextNoOutline(f + 22 + b, g + 48, "li", 15658496);
                    b += 7;
                }
                if (0 != enemyCatalog[c][EnemyProps.PoisonResistPct]) {
                    drawMedTextNoOutline(f + 22 + b, g + 48, "po", 52224);
                    b += 13;
                }
                if (0 < b) {
                    drawText(LoadedFonts.gameFontMed, f, g + 48, "RES ", 16777215, 0);
                }
                drawText(LoadedFonts.gameFontMed, f + 80, g + 0, "DROP ITEM", 16777215, 0);
                if (1 == BestiaryState.bestiaryEntryState[c]) {
                    h = enemyCatalog[c][EnemyProps.BestiaryUnlockCost];
                    if (drawButtonBoldedText(f + 120, g + 48 - 8, 80, 56, "G " + h) && h <= PartyState.partyGold && isMouseClicked) {
                        PartyState.partyGold = RMath.clamp(PartyState.partyGold - h, 0, 9999999);
                        BestiaryState.bestiaryEntryState[c] = 2;
                    }
                } else {
                    for (d = b = 0; 4 > b; b++) {
                        hidx = enemyCatalog[c][EnemyProps.DropTableStartIdx + 2 * b];
                        if (hidx <= 2) {
                            continue;
                        }
                        drawRect(f + 80, g + 12 + 20 * d, 16, 16, 0);
                        RenderingState.spriteAltRenderFlag = 2;
                        h = itemList[hidx][ItemProps.HeadwearType];
                        if (10 == itemList[hidx][ItemProps.Appearance]) {
                            drawSpriteSheetPartTintedScaled(LoadedSprites.itemsSpriteSheet,
                                f + 80, g + 12 + 20 * d,
                                16, 16,
                                16 * (h & 15), 16 * (h >> 4),
                                16, 16,
                                itemList[hidx][ItemProps.SpriteSourceX],
                                itemList[hidx][ModifierColumns.itemSpriteLocY],
                                true
                            );
                        } else {
                            if (20 == itemList[hidx][ItemProps.Appearance] || 30 == itemList[hidx][ItemProps.Appearance]) {
                                drawItemSpriteTinted(f + 80, g + 12 + 20 * d,
                                    16 * (h & 15), 16 * (h >> 4),
                                    itemList[hidx][ItemProps.SpriteSourceX],
                                    itemList[hidx][ModifierColumns.itemSpriteLocY]
                                );
                            } else {
                                drawSpriteSheetPart(LoadedSprites.itemsSpriteSheet,
                                    f + 80, g + 12 + 20 * d,
                                    16, 16, 16 * (h & 15), 16 * (h >> 4), 16, 16, itemList[hidx][ItemProps.SpriteSourceX]);
                                RenderingState.spriteAltRenderFlag = 0;
                                LoadedFonts.gameFontMed.a = 4;
                                drawText(LoadedFonts.gameFontMed, f + 100, g + 12 + 20 * d + 4, itemList[hidx][ItemProps.Name], -1, 0);
                                if (0 < PartyState.itemForgeLvls[hidx]) {
                                    drawRect(f + 80 - 6, g + 12 + 20 * d + 6, 4, 4, 0);
                                    drawRect(f + 80 - 5, g + 12 + 20 * d + 7, 2, 2, 39168);
                                    handleInventoryButton(f + 80, g + 12 + 20 * d, 16, 16, hidx, 0);
                                }
                                d++;
                            }
                        }
                    }
                }
            }
            for (hidx = 0; hidx < bestiaryPageItems[GUIState.currentBestiaryPage].length; hidx++) {
                let c = bestiaryPageItems[GUIState.currentBestiaryPage][hidx];
                let b = f + hidx % 7 * 28;
                d = g + 96 + 28 * ~~(hidx / 7);
                drawRect(b, d, 24, 24, 0);
                if (hidx == GUIState.bestiaryEnemySelection) {
                    drawRectOutline(b, d, 24, 24, 16711680);
                }
                if (buttonCheck(b, d, 24, 24)) {
                    fillEmptyPixelsRect(b, d, 24, 24, 6684672);
                    if (isMouseClicked) {
                        GUIState.bestiaryEnemySelection = hidx;
                    }
                }
                drawEnemyStatic(c, b + 12, d + 20, 2);
            }
        }
        if (drawMenuButton(f + 96 - 42, g + 156, 7, "PREV", 16777215) && isMouseClicked) {
            GUIState.currentBestiaryPage--;
        }
        if (drawMenuButton(f + 138, g + 156, 8, "NEXT", 16777215) && isMouseClicked) {
            GUIState.currentBestiaryPage++;    
        }
        GUIState.currentBestiaryPage = wrapStageIndex(GUIState.currentBestiaryPage);
        drawTextCentered(LoadedFonts.gameFontSmall, f + 96, g + 156, "" + (GUIState.currentBestiaryPage + 1) + "/" + stageIndexOrder.length, 3355443, -1);
        if (1 == StageState.isStageReachedArray[stageIndexOrder[GUIState.currentBestiaryPage]]) {
            drawTextCentered(LoadedFonts.gameFontMed, f + 96, g + 156 - 20, stageListArray[stageIndexOrder[GUIState.currentBestiaryPage]][StageProps.stageNameCol], -1, 0);
        }
    }
    if (GUIState.badgesUIVisible) {
        let f = 434;
        let g = 14;
        drawRect(f - 6, g - 6, 204, 180, stageListArray[GUIState.currentStage][StageProps.stageUIBgColorCol]);
        if (drawCancelButton(f + 188, g + 4) && isMouseClicked) {
            GUIState.badgesUIVisible = false;
        }
        if (0 == StageState.isStageReachedArray[stageIndexOrder[GUIState.badgesUIStageIdx]]) 
            drawTextCentered(LoadedFonts.gameFont, f + 96, g + 48, "Not reached", -1, 0);
        else for (hidx = 0; hidx < BadgeState.badgeIndicesByStage[GUIState.badgesUIStageIdx].length; hidx++) {
                c = BadgeState.badgeIndicesByStage[GUIState.badgesUIStageIdx][hidx];
                if (badgeList[c]) {
                    b = f + 6;
                    d = g + 6 + 24 * hidx;
                    drawRect(b - 1, d + 5, 10, 10, 0);
                    drawRect(b + 14, d, 20, 20, 0);
                    h = badgeList[c][3];
                    if (BadgeState.badgeCounterArray[c] == badgeList[c][4]) {
                        drawSpriteSheetPart(LoadedSprites.iconSpriteSheet, b, d + 6, 8, 8, 272, 8, 8, 8, 39168);
                        drawSpriteSheetPartTintedScaled(LoadedSprites.medalSpriteSheet, b + 14, d + 0, 20, 20, h % 5 * 20, 20 * ~~(h / 5), 20, 20, 14540253, 2236962, true);
                    } else {
                        drawSpriteSheetPart(LoadedSprites.medalSpriteSheet, b + 14, d + 0, 20, 20, h % 5 * 20, 20 * ~~(h / 5), 20, 20, 4473924);
                        if (0 < BadgeState.badgeCounterArray[c]) {
                            LoadedFonts.gameFontMed.b = -1;
                            drawTextCentered(LoadedFonts.gameFontMed, b + 3, d + 10, "" + BadgeState.badgeCounterArray[c], 16777215, -1);
                        }
                    }
                    LoadedFonts.gameFontMed.a = 3;
                    if (0 == badgeList[c][1].length) {
                        drawText(LoadedFonts.gameFontMed, b + 40, d + 6, badgeList[c][0], 16777215, 0);
                    } else {
                        drawText(LoadedFonts.gameFontMed, b + 40, d + 1, badgeList[c][0], 16777215, 0);
                        LoadedFonts.gameFontMed.a = 3;
                        drawText(LoadedFonts.gameFontMed, b + 40, d + 11, badgeList[c][1], 16777215, 0);
                    }
                }
            }
        if (drawMenuButton(f + 96 - 42, g + 156, 7, "PREV", 16777215) && isMouseClicked) {
            GUIState.badgesUIStageIdx--;
        }
        if (drawMenuButton(f + 138, g + 156, 8, "NEXT", 16777215) && isMouseClicked) {
            GUIState.badgesUIStageIdx++;
        }
        GUIState.badgesUIStageIdx = wrapStageIndex(GUIState.badgesUIStageIdx);
        drawTextCentered(LoadedFonts.gameFontSmall, f + 96, g + 156, "" + (GUIState.badgesUIStageIdx + 1) + "/" + stageIndexOrder.length, 3355443, -1);
        if (1 == StageState.isStageReachedArray[stageIndexOrder[GUIState.badgesUIStageIdx]]) {
            drawTextCentered(LoadedFonts.gameFontMed, f + 96, g + 156 - 20, stageListArray[stageIndexOrder[GUIState.badgesUIStageIdx]][StageProps.stageNameCol], -1, 0);
        }
    }
    if (GUIState.optionsUIVisible) {
        let f = 434;
        let g = 202;
        d = 32;
        drawRect(f - 6, g - 6, 204, 148, stageListArray[GUIState.currentStage][StageProps.stageUIBgColorCol]);
        if (drawCancelButton(f + 188, g + 4) && isMouseClicked) {
            GUIState.optionsUIVisible = false;
        }
        c = ["ON", "OFF"];
        drawText(LoadedFonts.gameFontMed, f + 0, g + 48, "Auto move", 16777215, 0);
        for (hidx = 0; hidx < PartyState.partyMemberCount; hidx++) {
            drawRect(f + 72 + hidx * d, g + 20, 24, 24, 0);
            drawLine(f + 72 + hidx * d + 7, g + 42, f + 72 + hidx * d + 16, g + 42, 15908203);
            drawLine(f + 72 + hidx * d + 6, g + 43, f + 72 + hidx * d + 17, g + 43, 15908203);
            for (b = 0; 11 > b; b++) {
                l[b].x = f + 72 + hidx * d + p[b];
                l[b].y = g + 20 + t[b];
            }
            drawHero(hidx, l, 0, 1, 15908203, 16777215, 2);
            drawTextCentered(LoadedFonts.gameFontMed, f + 84 + hidx * d, g + 52, c[PartyState.autoMoveEnabled[hidx]], 16777215, 0);
            if (buttonCheckCentered(f + 84 + hidx * d, g + 40, 32, 40)) {
                fillEmptyPixelsRect(f + 72 + hidx * d, g + 20, 24, 24, 8388608);
                drawTextCentered(LoadedFonts.gameFontMed, f + 84 + hidx * d, g + 52, c[PartyState.autoMoveEnabled[hidx]], 16711680, 0);
                if (isMouseClicked) {
                    PartyState.autoMoveEnabled[hidx] = 1 - PartyState.autoMoveEnabled[hidx];
                }
            }
        }
        drawText(LoadedFonts.gameFontMed, f + 0, g + 64, "Cliff stop :", 16777215, 0);
        drawText(LoadedFonts.gameFontMed, f + 78, g + 64, c[PartyState.cliffStopEnabled], 16777215, 0);
        if (buttonCheck(f + 0, g + 64 - 2, 192, 12)) {
            drawText(LoadedFonts.gameFontMed, f + 78, g + 64, c[PartyState.cliffStopEnabled], 16711680, 0);
            if (isMouseClicked) {
                PartyState.cliffStopEnabled = 1 - PartyState.cliffStopEnabled;
            }
        }
        if (1 == GUIState.currentStage) {
            drawTextCentered(LoadedFonts.gameFontMed, f + 96, g + 100, "Return to TITLE", -1, 0);
        } else {
            drawTextCentered(LoadedFonts.gameFontMed, f + 96, g + 100, "Return to Village",
                -1, 0);
        }
        h = stageListArray[GUIState.currentStage][StageProps.stageReturnCost];
        if (drawButtonBoldedText(f + 96, g + 120, 96, 24, "G " + h)) {
            if (h <= PartyState.partyGold && isMouseClicked) {
                PartyState.partyGold = RMath.clamp(PartyState.partyGold - h, 0, 9999999);
                if (1 == GUIState.currentStage) {
                    GUIState.gameScreenState = 0;
                } else {
                    RenderingState.screenFadeFactor = 0;
                    GUIState.gameScreenState = 10;
                    GUIState.currentStage = 1;
                    StageState.partySpawnXByHero[0] = 20;
                    StageState.partySpawnXByHero[1] = 28;
                    StageState.partySpawnXByHero[2] = 36;
                    StageState.partySpawnXByHero[3] = 44;
                    StageState.partySpawnYByHero[0] = 40;
                    StageState.partySpawnYByHero[1] = 40;
                    StageState.partySpawnYByHero[2] = 40;
                    StageState.partySpawnYByHero[3] = 40;
                }
                saveGame();
                GUIState.optionsUIVisible = false;
            }
        }
    }
    if (GUIState.shrineUIVisible) {
        f = 224;
        g = 14;
        drawRect(f - 6, g - 6, 204, 180, stageListArray[GUIState.currentStage][StageProps.stageUIBgColorCol]);
        if (drawCancelButton(f + 188, g + 4) && isMouseClicked) {
            GUIState.shrineUIVisible = false;
        }
        for (hidx = h = 0; hidx < badgeList.length; hidx++)
            if (badgeList[hidx] && BadgeState.badgeCounterArray[hidx] == badgeList[hidx][4]) {
                h++;
            }
        LoadedFonts.gameFontMed.a = 3;
        drawText(LoadedFonts.gameFontMed, f + 27, g + 6, "Achievement Medal", 16777215, 0);
        LoadedFonts.gameFont.a = 1;
        drawText(LoadedFonts.gameFont, f + 129, g + 6 - 3, "" + h, 16777215, 0);
        c = -1;
        for (hidx = 0; hidx < shrineRewardOptions.length; hidx++) {
            b = f + 6;
            d = g + 26 + 24 * hidx;
            drawRect(b + 14, d, 20, 20, 0);
            if (100 > shrineRewardOptions[hidx][1]) {
                LoadedFonts.gameFontSmall.b = -2;
                drawScaledTintedTextCentered(LoadedFonts.gameFontSmall,
                    b + 23, d + 10, "" + shrineRewardOptions[hidx][1], 255, 255, 255, 255, 0, 0, 0, 0, 10, 14);
            } else {
                LoadedFonts.gameFontSmall.a = 3;
                LoadedFonts.gameFontSmall.b = -3;
                drawScaledTintedTextCentered(LoadedFonts.gameFontSmall, b + 25, d + 10, "" + shrineRewardOptions[hidx][1], 255, 255, 255, 255, 0, 0, 0, 0, 10, 14);
            }
            if (1 == shrineRewardClaimed[hidx]) {
                drawRect(b - 1, d + 5, 10, 10, 0);
                drawSpriteSheetPart(LoadedSprites.iconSpriteSheet, b, d + 6, 8, 8, 272, 8, 8, 8, 39168);
            } else if (buttonCheck(b + 14, d, 20, 20)) {
                fillEmptyPixelsRect(b + 14, d, 20, 20, 6684672);
                if (shrineRewardOptions[hidx][1] <= h && isMouseClicked) {
                    c = hidx;
                }
            }
            
            LoadedFonts.gameFontMed.a = 3;
            LoadedFonts.gameFontMed.b = 1;
            drawText(LoadedFonts.gameFontMed, b + 40, d + 6, shrineRewardOptions[hidx][0], 16777215, 0);
        }
        if (!c)
            for (shrineRewardClaimed[c] = 1, GUIState.shrineUIVisible = false, hidx = 0; 100 > hidx;) {
                f = RMath.randIntRange(2, 78);
                g = RMath.randIntRange(1, 44);
                25 >= StageState.stageTileData[g][f] || (h = RMath.floor(100 * (100 + PartyState.partyRewardValueBonusPercent) / 100), spawnDrop(8 * f + 4, 8 * g + 4, 2, h, 0), hidx++);
        } else if (1 == c)
            for (shrineRewardClaimed[c] = 1, hidx = 0; 4 > hidx; hidx++)
                for (b = 0; b < PartyState.partyStats.length; b++) {
                    PartyState.partySP[hidx] += PartyState.partyStats[b][hidx];
                    PartyState.partyStats[b][hidx] = 0;
        } else if (2 == c) {
            shrineRewardClaimed[c] = 1;
            PartyState.stageEventFlags[3] = 1;
            PartyState.collectedStageFlagsCount++;
        } else if (3 == c){
            for (shrineRewardClaimed[c] = 1, hidx = 0; 2 > hidx; hidx++){
                if (99 > PartyState.partyLevel) {
                    PartyState.partyEXPAccum = GUIState.LevelExpThresholds[PartyState.partyLevel];
                    PartyState.partyLevel++;
                    for (b = 0; 4 > b; b++) PartyState.partySP[b] += 2;
                    GameplayState.levelUpPopupTimer = 60;
                }
            }
        }
    }
    LoadedFonts.gameFontSmall.a = 2;
    drawScaledTintedText(LoadedFonts.gameFontSmall, 476, 421, Consts.copyrightText1, 0, 0, 0, 0, 0, 0, 0, 128, 5, 7);
    drawScaledTintedText(LoadedFonts.gameFontSmall, 607, 421, "" + GameState.currentFPS + Consts.fpsName, 0, 0, 0, 0, 0, 0, 0, 128, 5, 7);
}



export function resetDragSelection() { // ki
    GameplayState.draggedHeroIndex = -1;
    GameplayState.draggedJointIndex = 0
}


export function resetHeroPose(heroIdx, spawnX, spawnY) { // li(a, b, c)
    spawnX *= 8;
    spawnY *= 8;
    for (let d = 0; 21 > d; d++) {
        RMath.Vec2Set(HeroesState.heroJointPositionsByHero[heroIdx][d], spawnX + RMath.randFloat(4), spawnY + RMath.randFloat(4));
        HeroesState.heroJointPrevPositionsByHero[heroIdx][d].set(HeroesState.heroJointPositionsByHero[heroIdx][d]);
    }
    for (let d = 0; 16 > d; d++) { 
        HeroesState.heroJoint5HistoryByHero[heroIdx][d].set(HeroesState.heroJointPositionsByHero[heroIdx][5]);
        HeroesState.heroJoint3HistoryByHero[heroIdx][d].set(HeroesState.heroJointPositionsByHero[heroIdx][3]);
        HeroesState.heroJoint6HistoryByHero[heroIdx][d].set(HeroesState.heroJointPositionsByHero[heroIdx][6]);
        HeroesState.heroJoint4HistoryByHero[heroIdx][d].set(HeroesState.heroJointPositionsByHero[heroIdx][4]);
    }
    HeroesState.heroPoseTrailWriteIdxByHero[heroIdx] = 0;
    HeroesState.heroAttackTrailTimerByHero[heroIdx] = 0;
    RMath.Vec2Set(HeroesState.heroAimPosByHero[heroIdx], 320, 240);
    HeroesState.heroAttackLineTimer[heroIdx] = 0;
    HeroesState.heroUpperJointMode[heroIdx] = 0;
    HeroesState.heroPoseAgeFrames[heroIdx] = 0;
    HeroesState.heroTileContactFlags[heroIdx] = 0;
    HeroesState.heroAttackCooldownFrames[heroIdx] = 0;
    HeroesState.heroHitFlashTimer[heroIdx] = 0;
    HeroesState.heroEnemySeekTimer[heroIdx] = 0;
    HeroesState.attackTrailSideIdx[heroIdx] = 0;
    HeroesState.attackWeaponSlotIdx[heroIdx] = 0;
    HeroesState.heroSkipTimer[heroIdx] = 0;
    HeroesState.heroSkipChancePercent[heroIdx] = 0;
    HeroesState.heroTimedDamageTimer[heroIdx] = 0;
    HeroesState.heroTimedDamageAmount[heroIdx] = 0;
    HeroesState.heroStatusTintTimer[heroIdx] = 0;
    HeroesState.heroTileEffectLatch[heroIdx] = 0
}


export function moveJointWithCollisions(_entityIdx, _jointIdx) { // ni
    var c = new RMath.Vec2();
    RMath.Vec2Sub(c, HeroesState.heroJointPositionsByHero[_entityIdx][_jointIdx], HeroesState.heroJointPrevPositionsByHero[_entityIdx][_jointIdx]);
    HeroesState.heroJointPositionsByHero[_entityIdx][_jointIdx].set(HeroesState.heroJointPrevPositionsByHero[_entityIdx][_jointIdx]);
    var d = (RMath.Vec2Mag(c) >> 2) + 1;
    RMath.Vec2Scale(c, 1 / d);
    var f, g;
    g = getStageTileAt(HeroesState.heroJointPositionsByHero[_entityIdx][_jointIdx].x, HeroesState.heroJointPositionsByHero[_entityIdx][_jointIdx].y);
    if (31 == g) {
        RMath.Vec2Scale(c, .95);
        HeroesState.heroTileContactFlags[_entityIdx] |= 2;
    }
    for (var h = 0; h < d; h++) {
        f = HeroesState.heroJointPositionsByHero[_entityIdx][_jointIdx].y + c.y;
        g = getStageTileAt(HeroesState.heroJointPositionsByHero[_entityIdx][_jointIdx].x, f);
        if (!(0 > f || 8 * StageState.stageHeight <= f)) {
            if (0 <= g && 23 >= g) {
                c.x *= .5;
                c.y = -c.y;
                HeroesState.heroTileContactFlags[_entityIdx] |= 1;
            } else if (24 <= g && 26 >= g && 0 < c.y && GameplayState.draggedHeroIndex != _entityIdx) {
                c.x *= .5;
                c.y = -c.y;
                HeroesState.heroTileContactFlags[_entityIdx] |= 1;
            } else {
                HeroesState.heroJointPositionsByHero[_entityIdx][_jointIdx].y = f;
            }
        }
        f = HeroesState.heroJointPositionsByHero[_entityIdx][_jointIdx].x + c.x;
        g = getStageTileAt(f, HeroesState.heroJointPositionsByHero[_entityIdx][_jointIdx].y);
        if (!(0 > f || 640 <= f)) {
            if (0 <= g && 23 >= g) {
                c.y *= .5;
                c.x = -c.x;
                HeroesState.heroTileContactFlags[_entityIdx] |= 1;
            } else {
                HeroesState.heroJointPositionsByHero[_entityIdx][_jointIdx].x = f;
            }
        }
    }
}


export function findNearestPartyMemberInRect(_cx, _cy, _halfW, _halfH, _modelFlag) { // ti
    var g = _cx - _halfW - 5,
        h = _cy - _halfH - 10;
    _halfW = _cx + _halfW + 5;
    _halfH = _cy + _halfH + 10;
    var k, p = new RMath.Vec2(),
        t = new RMath.Vec2(),
        l, n, w = 1E3,
        B = -1;
    _modelFlag = 0 == _modelFlag ? 29 : 23;
    for (var M = 0; M < PartyState.partyMemberCount; M++) {
        if (HeroesState.heroUpperJointMode[M] != HeroesState.areUpperJointsDisabled) {
            k = HeroesState.heroJointPositionsByHero[M][2];
            if (!(k.x > _halfW || k.x < g || k.y > _halfH || k.y < h)) {
                t.x = k.x - _cx;
                t.y = k.y - _cy;
                l = RMath.Vec2Mag(t);
                k = (l >> 3) + 1;
                RMath.Vec2Scale(t, 1 / k);
                RMath.Vec2Set(p, _cx, _cy);
                for (var J = 0; J <= k; J++) {
                    n = getStageTileAt(p.x, p.y);
                    if (0 <= n && n <= _modelFlag) break;
                    p.add(t);
                }
                if (J > k && l < w) {
                    w = l;
                    B = M;
                }
            }
        } 
    }
    return B;
}


/**
*  Purpose: Finds party members inside a rectangular area, checks line-of-sight, and applies an area hit/effect (damage/status); returns the affected party index or -1.
*/
export function damagePartyMemberInArea(__unused, stopOnHit, attackType, auxValue, dmgMin, dmgMax, _cy, _cx, _w, _h) { // ui
    _w *= .5;
    _h *= .5;
    __unused = _cy - _w - 5;
    var l = _cx - _h - 10;
    _w = _cy + _w + 5;
    _h = _cx + _h + 10;
    for (var n, w = new RMath.Vec2(), B = new RMath.Vec2(), M, J, y = -1, x = 0; x < PartyState.partyMemberCount; x++) {
        if (HeroesState.heroUpperJointMode[x] != HeroesState.areUpperJointsDisabled) {
            n = HeroesState.heroJointPositionsByHero[x][2];
            if (!(n.x > _w || n.x < __unused || n.y > _h || n.y < l)) {
                B.x = n.x - _cy;
                B.y = n.y - _cx;
                n = RMath.Vec2Mag(B);
                M = (n >> 3) + 1;
                RMath.Vec2Scale(B, 1 / M);
                RMath.Vec2Set(w, _cy, _cx);
                for (n = 0; n <= M; n++) {
                    J = getStageTileAt(w.x, w.y);
                    if (0 <= J && 29 >= J) break;
                    w.add(B);
                }
                if (!(n <= M)) {
                    y = dmgMin + RMath.floor(RMath.randFloat(dmgMax - dmgMin + 1));
                    M = 0 == HeroesState.heroBodyDrawStateByHero[x][2] ? 1 : -1;
                    J = 16711680;
                    HeroesState.heroHitFlashTimer[x] = 2;
                    if (0 == attackType) {
                        y = RMath.max(y - PartyState.heroMeleeDefensesFlatArray[x], 1);
                    } else {
                        if (6 == attackType) {
                            y = RMath.max(y - PartyState.heroProjDefenseFlatArray[x], 1);
                        } else {
                            if (1 <= attackType) {
                                y = RMath.max(RMath.floor(y * (100 - PartyState.heroMagicDefenseFlatArray[x]) / 100), 1);
                            }
                        }
                    }
                    if (RMath.randFloat(100) < PartyState.heroDodgeChanceArray[x]) {
                        y = 0;
                        J = 16744576;
                        HeroesState.heroHitFlashTimer[x] = 0;
                    }
                    if (1 == attackType) {
                        if (heroHasAccessoryEffect(x,
                                AccessoryProps.MagicDamageReduction)) {
                            y = RMath.max(y - countAccessoryLvlBonuses(x, AccessoryProps.MagicDamageReduction), 1);
                        }
                    }
                    if (2 == attackType) {
                        HeroesState.heroSkipTimer[x] = 120;
                        HeroesState.heroSkipChancePercent[x] = auxValue;
                        if (heroHasAccessoryEffect(x, AccessoryProps.StunChanceReduction)) {
                            HeroesState.heroSkipChancePercent[x] = RMath.max(RMath.floor(HeroesState.heroSkipChancePercent[x] * (100 - countAccessoryLvlBonuses(x, AccessoryProps.StunChanceReduction)) / 100), 0);
                        }
                    } else
                    if (3 == attackType) {
                        if (heroHasAccessoryEffect(x, AccessoryProps.DamageNegationChance)) {
                            if (RMath.randFloat(100) < countAccessoryLvlBonuses(x, AccessoryProps.DamageNegationChance)) {
                                y = 0;
                                J = 16744576;
                                HeroesState.heroHitFlashTimer[x] = 0;
                            }
                        }
                    } else
                    if (4 == attackType) {
                        HeroesState.heroTimedDamageTimer[x] = auxValue;
                        HeroesState.heroTimedDamageAmount[x] = y;
                        if (heroHasAccessoryEffect(x, AccessoryProps.DebuffDurationReduction)) {
                            HeroesState.heroTimedDamageTimer[x] = RMath.max(HeroesState.heroTimedDamageTimer[x] - 60 * countAccessoryLvlBonuses(x, AccessoryProps.DebuffDurationReduction), 0);
                        }
                        y = x;
                        continue;
                    } else if (5 == attackType) {
                        HeroesState.heroStatusTintTimer[x] = RMath.floor(auxValue / 10);
                    }
                    if (isBadgeIncompleteForCurrentStage(43)) {
                        if (1 == attackType) {
                            if (0 < HeroesState.heroSkipTimer[x]) {
                                if (0 < HeroesState.heroTimedDamageTimer[x]) {
                                    IncrementBadgeCount(43);
                                }
                            }
                        }
                    }
                    PartyState.partyLP[x] -= y;
                    spawnPopup(HeroesState.heroJointPositionsByHero[x][0].x, HeroesState.heroJointPositionsByHero[x][0].y, M, y, 60, J);
                    StageState.stage_partyDamageTaken += y;
                    if (0 > PartyState.partyLP[x])
                        for (y = RMath.max(~~-PartyState.partyLP[x], 1), n = PartyState.partyLP[x] = 0; n < PartyState.partyMemberCount; n++)
                            if (x != n) {
                                PartyState.partyLP[n] = RMath.clamp(PartyState.partyLP[n] - y, 0, PartyState.partyMaxLP[n]);
                                spawnPopup(HeroesState.heroJointPositionsByHero[n][0].x, HeroesState.heroJointPositionsByHero[n][0].y, M, y, 60, J);
                                StageState.stage_partyDamageTaken += y;
                            }
                    y = x;
                    if (0 == stopOnHit) break;
                }
            }
        }
        return y;
    }
}


export function pickHeroJointUnderMouse() { // vi
    var a = new RMath.Vec2(),
        b, c;
    if (-1 == GameplayState.draggedHeroIndex) {
        if (isMouseClicked && !GUIState.clickInUI) {
            b = 20;
            a.x = mouseXCurrent - HeroesState.heroJointPrevPositionsByHero[GUIState.selectingHero][0].x;
            a.y = mouseYCurrent - (HeroesState.heroJointPrevPositionsByHero[GUIState.selectingHero][0].y - 8);
            c = RMath.Vec2Mag(a);
            if (20 > c) {
                if (c < b) {
                    b = c;
                    GameplayState.draggedHeroIndex = GUIState.selectingHero;
                    GameplayState.draggedJointIndex = 0;
                }
            }
            for (var d = 0; d < PartyState.partyMemberCount; d++)
                if (HeroesState.heroUpperJointMode[d] != HeroesState.areUpperJointsDisabled)
                    for (var f = 0; 10 > f; f++) {
                        a.x = mouseXCurrent - HeroesState.heroJointPrevPositionsByHero[d][f].x;
                        a.y = mouseYCurrent - HeroesState.heroJointPrevPositionsByHero[d][f].y;
                        c = RMath.Vec2Mag(a);
                        if (20 > c) {
                            if (c < b) {
                                b = c;
                                GameplayState.draggedHeroIndex = d;
                                GameplayState.draggedJointIndex = f;
                                GUIState.selectingHero = d;
                            }
                        }
                    }
        }
    } else if (!wasMouseDown) {
        GameplayState.draggedHeroIndex = -1; 
        GameplayState.draggedJointIndex = 0;
    }
}



export function spawnHeroAttackPattern(heroIdx, limbDesc, itemSlot, originX, originY, targetEnemyIdx) { // xi
    console.log(`spawnHeroAttackPattern(${heroIdx}, ${limbDesc}, ${itemSlot}, ${originX}, ${originY}, ${targetEnemyIdx})`);
    let projDir = new RMath.Vec2(),
        selectedItemIdx = PartyState.partyEquipmentTable[heroIdx][itemSlot],
        selectedItem = itemList[selectedItemIdx],
        limbSel = selectedItem[ItemProps.LimbSelection];
    switch (limbSel) {
        case 0:
            limbSel = -1;
            break;
        case 1:
            limbSel = limbDesc;
            break;
        case 2:
            limbSel = limbDesc & 65280 | 1;
            break;
        case 3:
            limbSel = limbDesc & 65280 | limbDesc >> 8;
            break;
        case 5:
            limbSel = 257;
            break;
    }
    let pwidth = selectedItem[ItemProps.ProjectileDrawWidth],
        pheight = selectedItem[ItemProps.ProjectileDrawHeight],
        pshape = selectedItem[ItemProps.ProjectileShapeMode],
        pewidth = selectedItem[ItemProps.ProjectileEffectWidth],
        peheight = selectedItem[ItemProps.ProjectileEffectHeight],
        pdelr = selectedItem[ItemProps.ProjectileDelayRange],
        pnodmg = selectedItem[ItemProps.ProjectileNoDamageFrames],
        panim = selectedItem[ItemProps.ProjectileStartAnimFrame],
        plife = selectedItem[ItemProps.ProjectileLifetime],
        ptarg = selectedItem[ItemProps.ProjectileTargetIndex],
        pacelMod = getModifiedStatVal(heroIdx, selectedItemIdx, ItemProps.ProjectileAcceleration),
        pspdMod = getModifiedStatVal(heroIdx, selectedItemIdx, ItemProps.ProjectileSpeedScale),
        pauxMod = getModifiedStatVal(heroIdx, selectedItemIdx, ItemProps.ProjectileAuxStat),
        pcol = selectedItem[ItemProps.ProjectileCollisionMode],
        pcdMod = getModifiedStatVal(heroIdx, selectedItemIdx, ItemProps.AttackCooldown);

    if (heroHasAccessoryEffect(heroIdx, AccessoryProps.EffectRangeAndCount) && (4 == selectedItem[ItemProps.Appearance] || 5 == selectedItem[ItemProps.Appearance])) {
        pcdMod += sumAccessorySecondaryValues(heroIdx, AccessoryProps.EffectRangeAndCount);
    }
    let paux = selectedItem[ItemProps.ProjectileAuxParam],
        pmaxtarg = selectedItem[ItemProps.ItemProjectileMaxTargets];
    if (2 == pmaxtarg) {
        pmaxtarg = limbDesc >> 8;
    }
    limbDesc = selectedItem[ItemProps.ItemProjectileDamageMin];

    let itemdmgMax = selectedItem[ItemProps.ItemProjectileDamageMax],
        itempEffect = selectedItem[ItemProps.ItemProjectileEffectType],
        projEffect = selectedItem[ItemProps.ProjectileEffectType],
        projEffectDur = selectedItem[ItemProps.ProjectileEffectDuration],
        itemHitCountMod = getModifiedStatVal(heroIdx, selectedItemIdx, ItemProps.HitCountStat),
        minAtk = PartyState.minAtkArray[4 * itemSlot + heroIdx],
        maxAtk = PartyState.maxAtkArray[4 * itemSlot + heroIdx];
    if (heroHasAccessoryEffect(heroIdx, AccessoryProps.EffectPhysicalProcChance) && 0 == selectedItem[ItemProps.ElementType] && RMath.randFloat(100) < countAccessoryLvlBonuses(heroIdx, AccessoryProps.EffectPhysicalProcChance)) {
        minAtk = RMath.floor(minAtk * (100 + sumAccessorySecondaryValues(heroIdx, AccessoryProps.EffectPhysicalProcChance)) / 100);
        maxAtk = RMath.floor(maxAtk * (100 + sumAccessorySecondaryValues(heroIdx, AccessoryProps.EffectPhysicalProcChance)) / 100);
    }
    itemSlot = PartyState.atkCountArray[4 * itemSlot + heroIdx];
    let itemProjSpd = selectedItem[ItemProps.ProjectileSpeed],
        itemEType = selectedItem[ItemProps.ElementType],
        itemBonus = getModifiedStatVal(heroIdx, selectedItemIdx, ItemProps.IceBonusPercent);
    if (heroHasAccessoryEffect(heroIdx, AccessoryProps.EffectFireStatBonus)) {
        if (1 == selectedItem[ItemProps.ElementType]) {
            itemBonus += countAccessoryLvlBonuses(heroIdx, AccessoryProps.EffectFireStatBonus);
        }
    }
    if (heroHasAccessoryEffect(heroIdx, AccessoryProps.EffectIceStatBonus)) {
        if (2 == selectedItem[ItemProps.ElementType]) {
            itemBonus += countAccessoryLvlBonuses(heroIdx, AccessoryProps.EffectIceStatBonus);
        }
    }
    if (heroHasAccessoryEffect(heroIdx, AccessoryProps.EffectPoisonStatBonus)) {
        if (4 == selectedItem[ItemProps.ElementType]) {
            itemBonus += 60 * countAccessoryLvlBonuses(heroIdx, AccessoryProps.EffectPoisonStatBonus);
        }
    }
    let itemProjParam1 = selectedItem[ItemProps.ProjectileParam1],
        itemAtkMode = selectedItem[ItemProps.AttackMode],
        itemProjParam2 = selectedItem[ItemProps.ProjectileParam2],
        itemProjAux1 = selectedItem[ItemProps.ProjectileAux1],
        itemProjAux2 = selectedItem[ItemProps.ProjectileAux2],
        itemAuxA = selectedItem[ItemProps.AuxValueA],
        itemAuxB = selectedItem[ItemProps.AuxValueB],
        itemAuxC = selectedItem[ItemProps.AuxValueC],
        itemDispA = selectedItem[ItemProps.DisplayStatA],
        itemAuxD = selectedItem[ItemProps.AuxValueD],
        itemProjFlag = selectedItem[ItemProps.ProjectileFlag],
        itemProjParamTime = selectedItem[ItemProps.ProjectileParamTime],
        itemHCount = selectedItem[ItemProps.HitCount],
        itemProjEffect = selectedItem[ItemProps.ProjectileEffectMode],
        itemStatAMod = getModifiedStatVal(heroIdx, selectedItemIdx, ItemProps.StatA),
        itemExt1 = selectedItem[ItemProps.ExtraStat1],
        itemExt2 = selectedItem[ItemProps.ExtraStat2],
        itemSpwnRange = selectedItem[ItemProps.SpawnTargetRange],
        itemExtA = selectedItem[ItemProps.ExtraParamA],
        itemExtB = selectedItem[ItemProps.ExtraParamB],
        itemExtC = selectedItem[ItemProps.ExtraParamC],
        itemProjParam3 = selectedItem[ItemProps.ProjectileParam3];

    selectedItemIdx = getModifiedStatVal(heroIdx, selectedItemIdx, ItemProps.AttackPower);
    if (heroHasAccessoryEffect(heroIdx, AccessoryProps.EffectLightningElemBonus)) {
        if (3 == selectedItem[ItemProps.ElementType] && 20 == selectedItem[ItemProps.AttackMode]) {
            selectedItemIdx += countAccessoryLvlBonuses(heroIdx, AccessoryProps.EffectLightningElemBonus);    
        }
    }

    selectedItem = selectedItem[ItemProps.ProjectileTemplate];
    let jointX = EnemyState.enemyJointPosArray[targetEnemyIdx][EnemyState.enemyTargetJointIdx].x;
    let jointY = EnemyState.enemyJointPosArray[targetEnemyIdx][EnemyState.enemyTargetJointIdx].y;

    if (pwidth == 0) return;
    if (1 == pwidth) {
        for (pwidth = 0; pwidth < itemSlot; pwidth++) {
            let spawnX = RMath.randFloatRange(-pheight, pheight);
            let spawnY = -pshape,
                velX = 0,
                velY = -.1 * itemProjSpd;
            spawnProjectile(heroIdx, limbSel, spawnX, spawnY, velX, velY, pewidth, peheight, pdelr, pnodmg, panim, plife, ptarg, pacelMod, pspdMod, pauxMod, pcol, pcdMod,
                paux, pmaxtarg, limbDesc, itemdmgMax, itempEffect, projEffect, projEffectDur, 0, itemHitCountMod, minAtk, maxAtk, itemEType, itemBonus, itemProjParam1, itemAtkMode, itemProjParam2,
                itemProjAux1, itemProjAux2, itemAuxA, itemAuxB, itemAuxC, itemDispA, itemAuxD, itemProjFlag, itemProjParamTime, itemHCount, itemProjEffect, itemStatAMod, itemExt1, itemExt2, itemSpwnRange, itemExtA,
                itemExtB, itemExtC, itemProjParam3, selectedItemIdx, selectedItem
            );
        }
    } else if (2 == pwidth) {
        let dirX = jointX - originX;
        dirX /= RMath.abs(dirX);
        for (pwidth = 0; pwidth < itemSlot; pwidth++) {
            let spawnX = originX + dirX * pheight;
            let spawn = originY + RMath.randFloatRange(-pshape, pshape);
            let velX = dirX * itemProjSpd * .1;
            spawnProjectile(heroIdx, limbSel, spawnX, spawn, velX, 0, pewidth, peheight, pdelr, pnodmg, panim, plife, ptarg, pacelMod, pspdMod, pauxMod, pcol, pcdMod,
                paux, pmaxtarg, limbDesc, itemdmgMax, itempEffect, projEffect, projEffectDur, 0, itemHitCountMod, minAtk, maxAtk, itemEType, itemBonus, itemProjParam1, itemAtkMode,
                itemProjParam2, itemProjAux1, itemProjAux2, itemAuxA, itemAuxB, itemAuxC, itemDispA, itemAuxD, itemProjFlag, itemProjParamTime, itemHCount, itemProjEffect, itemStatAMod, itemExt1, itemExt2,
                itemSpwnRange, itemExtA, itemExtB, itemExtC, itemProjParam3, selectedItemIdx, selectedItem
            );
        }
    } else if (3 == pwidth) {
        RMath.Vec2Set(projDir, jointX - originX, jointY - originY);
        let We = 0 < pheight ? pheight - 1 : 16;
        if (heroHasAccessoryEffect(heroIdx, AccessoryProps.MultiShotSpreadDivisor)) {
            We = RMath.floor(We / countAccessoryLvlBonuses(heroIdx, AccessoryProps.MultiShotSpreadDivisor));
        }
        jointX = RMath.floor(512 * RMath.Vec2Angle(projDir) / RMath.TAU);
        jointX -= RMath.floor((itemSlot - 1) * We / 2);
        for (pwidth = 0; pwidth < itemSlot; pwidth++) {
            projDir.x = RMath.rotationLUT[jointX & 511][0];
            projDir.y = -RMath.rotationLUT[jointX & 511][1];
            let spawnX = originX + projDir.x * pshape;
            let spawnY = originY + projDir.y * pshape;
            let velX = projDir.x * itemProjSpd * .1;
            let velY = projDir.y * itemProjSpd * .1;
            spawnProjectile(heroIdx, limbSel, spawnX, spawnY, velX, velY, pewidth, peheight, pdelr, pnodmg, panim, plife, ptarg, pacelMod, pspdMod, pauxMod, pcol, pcdMod,
                paux, pmaxtarg, limbDesc, itemdmgMax, itempEffect, projEffect, projEffectDur, 0, itemHitCountMod, minAtk, maxAtk, itemEType, itemBonus, itemProjParam1, itemAtkMode, itemProjParam2,
                itemProjAux1, itemProjAux2, itemAuxA, itemAuxB, itemAuxC, itemDispA, itemAuxD, itemProjFlag, itemProjParamTime, itemHCount, itemProjEffect, itemStatAMod, itemExt1, itemExt2, itemSpwnRange, itemExtA,
                itemExtB, itemExtC, itemProjParam3, selectedItemIdx, selectedItem
            );
            jointX += We;
        }
    } else if (4 == pwidth) {
        RMath.Vec2Set(projDir, jointX - originX, jointY - originY - 5);
        itemProjSpd = RMath.Vec2Mag(projDir) / (.1 * itemProjSpd);
        limbDesc = 2E4 / (itemProjSpd * itemProjSpd);
        for (pwidth = 0; pwidth < itemSlot; pwidth++) {
            RMath.Vec2Set(projDir, jointX - originX, jointY - 5 - originY);
            if (1 < itemSlot) {
                let _a = 0 < pheight ? pheight : itemSlot + 4;
                pshape = RMath.randInt(512);
                let spawnX = RMath.randFloat(_a);
                projDir.x += RMath.rotationLUT[pshape][0] * spawnX;
                projDir.y += RMath.rotationLUT[pshape][1] * spawnX;
            };
            let spawnX = originX;
            let spawnY = originY;
            let velX = projDir.x / itemProjSpd;
            let velY = (projDir.y - .5 * itemProjSpd * itemProjSpd * limbDesc * .01) / itemProjSpd;
            spawnProjectile(heroIdx, limbSel, spawnX, spawnY, velX, velY, pewidth, peheight, pdelr, pnodmg, panim, plife, ptarg, pacelMod, pspdMod,
                pauxMod, pcol, pcdMod, paux, pmaxtarg, limbDesc, itemdmgMax, itempEffect, projEffect, projEffectDur, 0, itemHitCountMod, minAtk,
                maxAtk, itemEType, itemBonus, itemProjParam1, itemAtkMode, itemProjParam2, itemProjAux1, itemProjAux2, itemAuxA, itemAuxB, itemAuxC, itemDispA, itemAuxD,
                itemProjFlag, itemProjParamTime, itemHCount, itemProjEffect, itemStatAMod, itemExt1, itemExt2, itemSpwnRange, itemExtA, itemExtB, itemExtC, itemProjParam3, selectedItemIdx, selectedItem
            );
        }
    } else if (5 == pwidth) {
        jointX = 256 + 256 * HeroesState.heroBodyDrawStateByHero[heroIdx][2];
        let _a = RMath.floor(512 / itemSlot);
        for (pwidth = 0; pwidth < itemSlot; pwidth++) {
            projDir.x = RMath.rotationLUT[jointX & 511][0];
            projDir.y = -RMath.rotationLUT[jointX & 511][1];
            let spawnX = 0 + projDir.x * pheight;
            let spawnY = 0 + projDir.y * pheight;
            if (-1 == limbSel) {
                spawnX += originX;
                spawnY += originY;
            }
            pshape = Math.sqrt(pheight * itemProjSpd * .01);
            let velX = projDir.y * pshape,
                velY = -projDir.x * pshape;
            spawnProjectile(heroIdx, limbSel, spawnX, spawnY, velX, velY, pewidth, peheight, pdelr, pnodmg, panim, plife,
                ptarg, pacelMod, pspdMod, pauxMod, pcol, pcdMod, paux, pmaxtarg, limbDesc, itemdmgMax, itempEffect,
                projEffect, projEffectDur, 0, itemHitCountMod, minAtk, maxAtk, itemEType, itemBonus, itemProjParam1, itemAtkMode, itemProjParam2,
                itemProjAux1, itemProjAux2, itemAuxA, itemAuxB, itemAuxC, itemDispA, itemAuxD, itemProjFlag, itemProjParamTime, itemHCount, itemProjEffect,
                itemStatAMod, itemExt1, itemExt2, itemSpwnRange, itemExtA, itemExtB, itemExtC, itemProjParam3, selectedItemIdx, selectedItem
            );
            jointX += _a;
        }
    } else if (6 == pwidth) {
        originX = RMath.floor(512 / itemSlot);
        pshape = RMath.floor(RMath.randFloat(originX));
        for (pwidth = 0; pwidth < itemSlot; pwidth++) {
            let spawnX = jointX + RMath.rotationLUT[pshape][0] * pheight;
            let spawnY = jointY + RMath.rotationLUT[pshape][1] * pheight;
            let velX = RMath.rotationLUT[pshape][0] * itemProjSpd * .1;
            let velY = RMath.rotationLUT[pshape][1] * itemProjSpd * .1;
            spawnProjectile(heroIdx, limbSel, spawnX, spawnY, velX, velY, pewidth, peheight, pdelr, pnodmg, panim, plife, ptarg, pacelMod, pspdMod, pauxMod, pcol,
                pcdMod, paux, pmaxtarg, limbDesc, itemdmgMax, itempEffect, projEffect, projEffectDur, 0, itemHitCountMod, minAtk, maxAtk, itemEType, itemBonus, itemProjParam1,
                itemAtkMode, itemProjParam2, itemProjAux1, itemProjAux2, itemAuxA, itemAuxB, itemAuxC, itemDispA, itemAuxD, itemProjFlag, itemProjParamTime, itemHCount, itemProjEffect, itemStatAMod, itemExt1,
                itemExt2, itemSpwnRange, itemExtA, itemExtB, itemExtC, itemProjParam3, selectedItemIdx, selectedItem
            );
            pshape += originX;
        }
    }
}


export function updatePartyMemberAI(memberIdx) { // Di
    let b = HeroesState.heroJointPositionsByHero[memberIdx][2].x,
        c = HeroesState.heroJointPositionsByHero[memberIdx][2].y;
    
    if (PartyState.autoMoveEnabled[memberIdx] == 1)
        return;
    let nearestEnem = findEnemyInArea(HeroesState.heroJointPositionsByHero[memberIdx][0].x, HeroesState.heroJointPositionsByHero[memberIdx][0].y, 200, 50);

    if (!(-1 != nearestEnem && 0 != HeroesState.heroTileContactFlags[memberIdx]))
        return;

    if (0 < HeroesState.heroEnemySeekTimer[memberIdx]) {
        HeroesState.heroEnemySeekTimer[memberIdx]--;
    } else {
        HeroesState.heroEnemySeekTimer[memberIdx] = 15;
        let f = b > EnemyState.enemyJointPosArray[nearestEnem][EnemyState.enemyTargetJointIdx].x ? -1 : 1;
        let g = .6;
        let h = getStageTileAt(b + 14 * f, c + 4);
        if (0 <= h && 26 >= h) {
            g = 2;    
        }
        h = getStageTileAt(b + 14 * f, c - 3);
        if (0 <= h && 26 >= h) {
            g = 4;
        }
        let k;
        if (1 == f) {
            k = HeroesState.heroJointPositionsByHero[memberIdx][9].x < HeroesState.heroJointPositionsByHero[memberIdx][10].x ? 7 : 8;
            HeroesState.heroBodyDrawStateByHero[memberIdx][2] = 1;
        } else {
            k = HeroesState.heroJointPositionsByHero[memberIdx][9].x > HeroesState.heroJointPositionsByHero[memberIdx][10].x ? 7 : 8;
            HeroesState.heroBodyDrawStateByHero[memberIdx][2] = 0;
        }
        if (!PartyState.cliffStopEnabled) {
            h = getStageTileAt(b + 20 * f, c + 8 + 0);
            let p = getStageTileAt(b + 20 * f, c + 8 + 8),
                t = getStageTileAt(b + 20 * f, c + 8 + 16),
                l = getStageTileAt(b + 20 * f, c + 8 + 24);
            if (30 <= h && 30 <= p && 30 <= t && 30 <= l) {
                k = (k = 7, 8);
                f *= -1;
            }
        }
        HeroesState.heroJointPositionsByHero[memberIdx][k].x += 4 * f;
        HeroesState.heroJointPositionsByHero[memberIdx][k].y -= 3 * g;
    }
    if (2 == HeroesState.heroTileContactFlags[memberIdx]) {
        if (b < EnemyState.enemyJointPosArray[nearestEnem][EnemyState.enemyTargetJointIdx].x) {
            HeroesState.heroJointPositionsByHero[memberIdx][0].x += .25;
            HeroesState.heroJointPositionsByHero[memberIdx][1].x += .25;
            HeroesState.heroBodyDrawStateByHero[memberIdx][2] = 1;
        } else {
            HeroesState.heroJointPositionsByHero[memberIdx][0].x -= .25;
            HeroesState.heroJointPositionsByHero[memberIdx][1].x -= .25;
            HeroesState.heroBodyDrawStateByHero[memberIdx][2] = 0;
        }
        if (c < EnemyState.enemyJointPosArray[nearestEnem][EnemyState.enemyTargetJointIdx].y) {
            HeroesState.heroJointPositionsByHero[memberIdx][0].y += .25;
            HeroesState.heroJointPositionsByHero[memberIdx][1].y += .25;
        } else {
            HeroesState.heroJointPositionsByHero[memberIdx][0].y -= .25;
            HeroesState.heroJointPositionsByHero[memberIdx][1].y -= .25;
        }
        HeroesState.heroJointPositionsByHero[memberIdx][0].x += RMath.randFloatRange(-.25, .25);
        HeroesState.heroJointPositionsByHero[memberIdx][0].y += RMath.randFloatRange(-.25, .25);
        HeroesState.heroJointPositionsByHero[memberIdx][1].x += RMath.randFloatRange(-.25, .25);
        HeroesState.heroJointPositionsByHero[memberIdx][1].y += RMath.randFloatRange(-.25, .25);
    }
}


export function updatePlayerParty() {
    var a, b, c, d, f = new RMath.Vec2(),
        g = new RMath.Vec2(),
        h = new RMath.Vec2();
    pickHeroJointUnderMouse();
    for (a = 0; a < PartyState.partyMemberCount; a++) {
        if (0 < HeroesState.heroTimedDamageTimer[a] && (HeroesState.heroTimedDamageTimer[a]--, d = RMath.floor(HeroesState.heroTimedDamageAmount[a] / 60), b = HeroesState.heroTimedDamageAmount[a] - 60 * d, RMath.randFloat(60) < b && (d += 1), PartyState.partyLP[a] -= d, StageState.stage_partyDamageTaken += d, 0 > PartyState.partyLP[a]))
            for (c = 0 == HeroesState.heroBodyDrawStateByHero[a][2] ? 1 : -1, d = RMath.max(~~-PartyState.partyLP[a], 1), b = PartyState.partyLP[a] = 0; b < PartyState.partyMemberCount; b++)
                if (a != b) {
                    PartyState.partyLP[b] = RMath.clamp(PartyState.partyLP[b] - d, 0, PartyState.partyMaxLP[b]);
                    spawnPopup(HeroesState.heroJointPositionsByHero[b][0].x, HeroesState.heroJointPositionsByHero[b][0].y, c, d, 60, 16711680);
                    StageState.stage_partyDamageTaken += d;
                }


        if (0 < HeroesState.heroStatusTintTimer[a]) HeroesState.heroStatusTintTimer[a]--;
        else {
            if (0 < HeroesState.heroSkipTimer[a] && (HeroesState.heroSkipTimer[a]--, RMath.randFloat(100) < HeroesState.heroSkipChancePercent[a])) continue;
            HeroesState.heroPoseAgeFrames[a]++;
            if (HeroesState.heroUpperJointMode[a] == HeroesState.areUpperJointsDisabled)
                for (b = 0; 11 > b; b++) stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][b], HeroesState.heroJointPrevPositionsByHero[a][b], .05, .99);
            else if (2 == HeroesState.heroTileContactFlags[a])
                for (b = 0; 11 > b; b++) stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][b], HeroesState.heroJointPrevPositionsByHero[a][b], .01, .99);
            else if (20 > HeroesState.heroPoseAgeFrames[a]) {
                stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][0], HeroesState.heroJointPrevPositionsByHero[a][0], -.2, .99);
                stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][1], HeroesState.heroJointPrevPositionsByHero[a][1], 0, .99);
                stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][2], HeroesState.heroJointPrevPositionsByHero[a][2], -.1, .99);
                stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][3], HeroesState.heroJointPrevPositionsByHero[a][3], 0, .99);
                stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][4], HeroesState.heroJointPrevPositionsByHero[a][4], 0, .99);
                stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][5], HeroesState.heroJointPrevPositionsByHero[a][5], 0, .99);
                stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][6], HeroesState.heroJointPrevPositionsByHero[a][6], 0, .99);
                stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][7], HeroesState.heroJointPrevPositionsByHero[a][7], 0, .99);
                stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][8], HeroesState.heroJointPrevPositionsByHero[a][8], 0, .99);
                stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][9], HeroesState.heroJointPrevPositionsByHero[a][9], .3, .99);
                stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][10], HeroesState.heroJointPrevPositionsByHero[a][10], .3, .99);
            } else for (b = 0; 11 > b; b++)
                if (heroHasAccessoryEffect(a, AccessoryProps.JointStepDivider)) {
                    stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][b], HeroesState.heroJointPrevPositionsByHero[a][b], .05 / countAccessoryLvlBonuses(a, AccessoryProps.JointStepDivider), .99);
                } else {
                    stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][b], HeroesState.heroJointPrevPositionsByHero[a][b], .05, .99);
                }
            for (b = d = 0; b < PartyState.partyMemberCount; b++) d += PartyState.partyLP[b];
            if (0 == d && HeroesState.heroUpperJointMode[a] != HeroesState.areUpperJointsDisabled)
                for (HeroesState.heroUpperJointMode[a] = HeroesState.areUpperJointsDisabled, b = HeroesState.heroAttackCooldownFrames[a] = 0; 11 > b; b++) {
                    HeroesState.heroJointPositionsByHero[a][b].x += RMath.randFloatRange(-2, 2);
                    HeroesState.heroJointPositionsByHero[a][b].y +=
                        RMath.randFloatRange(-1, -3);
                }
            if (HeroesState.heroUpperJointMode[a] != HeroesState.areUpperJointsDisabled) {
                if (1 == GUIState.currentStage) {
                    if (PartyState.partyLP[a] < PartyState.partyMaxLP[a]) {
                        if (1 > RMath.randFloat(100)) {
                            PartyState.partyLP[a] = RMath.clamp(PartyState.partyLP[a] + 5, 0, PartyState.partyMaxLP[a]);
                            spawnPopup(HeroesState.heroJointPositionsByHero[a][0].x, HeroesState.heroJointPositionsByHero[a][0].y, 0, 5, 60, 65280);
                        }
                    }
                }
                if (GameplayState.draggedHeroIndex == a) {
                    HeroesState.heroJointPositionsByHero[GameplayState.draggedHeroIndex][GameplayState.draggedJointIndex].x += .2 * (mouseXCurrent - HeroesState.heroJointPositionsByHero[GameplayState.draggedHeroIndex][GameplayState.draggedJointIndex].x);
                    HeroesState.heroJointPositionsByHero[GameplayState.draggedHeroIndex][GameplayState.draggedJointIndex].y += .2 * (mouseYCurrent - HeroesState.heroJointPositionsByHero[GameplayState.draggedHeroIndex][GameplayState.draggedJointIndex].y);
                }
                b = itemList[PartyState.partyEquipmentTable[a][0]][ItemProps.Appearance];
                c = PartyState.heroRangeValues[a];
                d = HeroesState.heroJointPositionsByHero[a][1].x;
                var k = HeroesState.heroJointPositionsByHero[a][1].y;
                c = findEnemyInArea(d, k, c, c);
                if (-1 == PartyState.heroEmitValues[a]) {
                    if (0 < PartyState.heroEmitCooldown[a]) {
                        PartyState.heroEmitCooldown[a]--;
                    }
                    if (0 == PartyState.heroEmitCooldown[a]) {
                        k = findEnemyInArea(d, k, 999, 999);
                        if (-1 != k) {
                            spawnHeroAttackPattern(a, 1540, 1, HeroesState.heroJointPositionsByHero[a][6].x, HeroesState.heroJointPositionsByHero[a][6].y, k);
                            PartyState.heroEmitCooldown[a] = itemList[PartyState.partyEquipmentTable[a][1]][ItemProps.AttackCooldown];
                        }
                    }
                }
                if (0 < HeroesState.heroAttackCooldownFrames[a]) HeroesState.heroAttackCooldownFrames[a]--;
                else if (GameplayState.draggedHeroIndex != a && 0 != b && -1 != c) {
                    HeroesState.heroAttackCooldownFrames[a] = PartyState.heroAgiValues[a] + RMath.randIntRange(-1, 1);
                    HeroesState.heroBodyDrawStateByHero[a][2] = d < EnemyState.enemyJointPosArray[c][EnemyState.enemyTargetJointIdx].x ? 1 : 0;
                    k = 0;
                    if (-1 == PartyState.heroEmitValues[a]) {
                        PartyState.heroEmitCurrent[a] =
                            0;
                        HeroesState.attackWeaponSlotIdx[a] = 0;
                    } else {
                        if (PartyState.heroEmitCurrent[a] < PartyState.heroEmitValues[a] || 0 == PartyState.heroEmitValues[a]) {
                            PartyState.heroEmitCurrent[a] = RMath.clamp(PartyState.heroEmitCurrent[a] + PartyState.heroChargeValues[a], 0, PartyState.heroEmitValues[a]);
                            HeroesState.attackWeaponSlotIdx[a] = 0;
                            if (heroHasAccessoryEffect(a, AccessoryProps.EffectEmitFullChargeChance_duringCharge)) {
                                if (100 * RMath.rand() < countAccessoryLvlBonuses(a, AccessoryProps.EffectEmitFullChargeChance_duringCharge)) {
                                    PartyState.heroEmitCurrent[a] = PartyState.heroEmitValues[a];
                                }
                            }
                        } else {
                            PartyState.heroEmitCurrent[a] = 0;
                            HeroesState.attackWeaponSlotIdx[a] = 1;
                            b = itemList[PartyState.partyEquipmentTable[a][1]][ItemProps.Appearance];
                            if (heroHasAccessoryEffect(a, AccessoryProps.EffectEmitFullChargeChance_onFire)) {
                                if (100 * RMath.rand() < countAccessoryLvlBonuses(a, AccessoryProps.EffectEmitFullChargeChance_onFire)) {
                                    PartyState.heroEmitCurrent[a] = PartyState.heroEmitValues[a];
                                }
                            }
                        }
                    }
                    if (0 != b)
                        if (3 == b) {
                            RMath.Vec2Sub(g, EnemyState.enemyJointPosArray[c][EnemyState.enemyTargetJointIdx], HeroesState.heroJointPositionsByHero[a][5]);
                            RMath.Vec2Sub(h, EnemyState.enemyJointPosArray[c][EnemyState.enemyTargetJointIdx], HeroesState.heroJointPositionsByHero[a][6]);
                            if (g.x * g.x + g.y * g.y >= h.x * h.x + h.y * h.y) {
                                RMath.Vec2Norm(g);
                                RMath.Vec2Scale(g, 3);
                                HeroesState.heroJointPositionsByHero[a][5].add(g);
                                HeroesState.heroJointPositionsByHero[a][4].sub(g);
                                f.set(HeroesState.heroJointPositionsByHero[a][5]);
                                k = 1283;
                                HeroesState.attackTrailSideIdx[a] = 0;
                            } else {
                                RMath.Vec2Norm(h);
                                RMath.Vec2Scale(h, 3);
                                HeroesState.heroJointPositionsByHero[a][6].add(h);
                                HeroesState.heroJointPositionsByHero[a][3].sub(h);
                                f.set(HeroesState.heroJointPositionsByHero[a][6]);
                                k = 1540;
                                HeroesState.attackTrailSideIdx[a] = 1;
                            }
                            HeroesState.heroAimPosByHero[a].set(EnemyState.enemyJointPosArray[c][EnemyState.enemyTargetJointIdx]);
                            HeroesState.heroAttackLineTimer[a] = 5;
                        } else
                    if (4 == b) {
                        var k = 5 + HeroesState.attackWeaponSlotIdx[a],
                            p = 3 +
                            HeroesState.attackWeaponSlotIdx[a],
                            t = 4 - HeroesState.attackWeaponSlotIdx[a];
                        if (
                            d < EnemyState.enemyJointPosArray[c][EnemyState.enemyTargetJointIdx].x) {
                            HeroesState.heroJointPositionsByHero[a][k].x += .5;
                            HeroesState.heroJointPositionsByHero[a][p].x += .5;
                            --HeroesState.heroJointPositionsByHero[a][t].x;
                        } else {
                            HeroesState.heroJointPositionsByHero[a][k].x -= .5;
                            HeroesState.heroJointPositionsByHero[a][p].x -= .5;
                            HeroesState.heroJointPositionsByHero[a][t].x += 1;
                        }
                        f.set(HeroesState.heroJointPositionsByHero[a][k]);
                        k = k << 8 | 3;
                        HeroesState.attackTrailSideIdx[a] = HeroesState.attackWeaponSlotIdx[a];
                    } else if (5 == b) {
                        if (d < EnemyState.enemyJointPosArray[c][EnemyState.enemyTargetJointIdx].x) {
                            HeroesState.heroJointPositionsByHero[a][5].x += 1;
                            HeroesState.heroJointPositionsByHero[a][6].x += 1;
                            HeroesState.heroJointPositionsByHero[a][1].x -= 2;
                        } else {
                            --HeroesState.heroJointPositionsByHero[a][5].x;
                            --HeroesState.heroJointPositionsByHero[a][6].x;
                            HeroesState.heroJointPositionsByHero[a][1].x += 2;
                        }
                        if (HeroesState.heroJointPositionsByHero[a][5].y < HeroesState.heroJointPositionsByHero[a][6].y) {
                            f.set(HeroesState.heroJointPositionsByHero[a][5]);
                            k = 1283;
                            HeroesState.attackTrailSideIdx[a] = 0;
                        } else {
                            f.set(HeroesState.heroJointPositionsByHero[a][6]);
                            k = 1540;
                            HeroesState.attackTrailSideIdx[a] = 1;
                        }
                        applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][5], HeroesState.heroJointPositionsByHero[a][6], 5, .1, .1);
                    } else {
                        if (d < EnemyState.enemyJointPosArray[c][EnemyState.enemyTargetJointIdx].x) {
                            if (HeroesState.heroJointPositionsByHero[a][5].x < HeroesState.heroJointPositionsByHero[a][6].x) {
                                HeroesState.heroJointPositionsByHero[a][5].x += 4;
                                HeroesState.heroJointPositionsByHero[a][4].x -= 4;
                                f.set(HeroesState.heroJointPositionsByHero[a][5]);
                                k = 1283;
                                HeroesState.attackTrailSideIdx[a] = 0;
                            } else {
                                HeroesState.heroJointPositionsByHero[a][6].x += 4;
                                HeroesState.heroJointPositionsByHero[a][3].x -= 4;
                                f.set(HeroesState.heroJointPositionsByHero[a][6]);
                                k =
                                    1540;
                                HeroesState.attackTrailSideIdx[a] = 1;
                            }
                        } else {
                            if (HeroesState.heroJointPositionsByHero[a][5].x > HeroesState.heroJointPositionsByHero[a][6].x) {
                                HeroesState.heroJointPositionsByHero[a][5].x -= 4;
                                HeroesState.heroJointPositionsByHero[a][4].x += 4;
                                f.set(HeroesState.heroJointPositionsByHero[a][5]);
                                k = 1283;
                                HeroesState.attackTrailSideIdx[a] = 0;
                            } else {
                                HeroesState.heroJointPositionsByHero[a][6].x -= 4;
                                HeroesState.heroJointPositionsByHero[a][3].x += 4;
                                f.set(HeroesState.heroJointPositionsByHero[a][6]);
                                k = 1540;
                                HeroesState.attackTrailSideIdx[a] = 1;
                            }
                        }
                    }
                    if (2 == b) {
                        HeroesState.heroAttackTrailTimerByHero[a] = 30;
                    }
                    HeroesState.heroBodyDrawStateByHero[a][HeroesState.attackTrailSideIdx[a]] = HeroesState.attackWeaponSlotIdx[a];
                    spawnHeroAttackPattern(a, k, HeroesState.attackWeaponSlotIdx[a], f.x, f.y, c);
                }
                if (GameplayState.draggedHeroIndex != a) {
                    if (0 != b) {
                        if (-1 == c) {
                            updatePartyMemberAI(a);
                        }
                    }
                }
            }
            if (
                HeroesState.heroUpperJointMode[a] == HeroesState.areUpperJointsDisabled) {
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][1], HeroesState.heroJointPositionsByHero[a][2], 3.6, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][3], HeroesState.heroJointPositionsByHero[a][5], 4.8, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][4], HeroesState.heroJointPositionsByHero[a][6], 4.8, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][7], HeroesState.heroJointPositionsByHero[a][9], 4.8, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][8], HeroesState.heroJointPositionsByHero[a][10], 4.8, .5, .5);
            } else {
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][0], HeroesState.heroJointPositionsByHero[a][1], 3.6, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][1], HeroesState.heroJointPositionsByHero[a][2], 3.6, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][1], HeroesState.heroJointPositionsByHero[a][3], 4.8, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][1], HeroesState.heroJointPositionsByHero[a][4], 4.8, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][3], HeroesState.heroJointPositionsByHero[a][5], 4.8, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][4], HeroesState.heroJointPositionsByHero[a][6], 4.8, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][2], HeroesState.heroJointPositionsByHero[a][7], 4.8, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][2], HeroesState.heroJointPositionsByHero[a][8], 4.8, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][7], HeroesState.heroJointPositionsByHero[a][9], 4.8, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][8], HeroesState.heroJointPositionsByHero[a][10], 4.8, .5, .5);
                applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][7], HeroesState.heroJointPositionsByHero[a][8], 6, .1, .1);
            }
            if (0 < (HeroesState.heroTileContactFlags[a] & 1)) {
                HeroesState.heroPoseAgeFrames[a] = 0;
            }
            for (b = HeroesState.heroTileContactFlags[a] = 0; 11 > b; b++) moveJointWithCollisions(a, b);
            HeroesState.heroPoseTrailWriteIdxByHero[a] = HeroesState.heroPoseTrailWriteIdxByHero[a] + 1 & 15;
            HeroesState.heroJoint5HistoryByHero[a][HeroesState.heroPoseTrailWriteIdxByHero[a]].set(HeroesState.heroJointPositionsByHero[a][5]);
            HeroesState.heroJoint3HistoryByHero[a][HeroesState.heroPoseTrailWriteIdxByHero[a]].set(HeroesState.heroJointPositionsByHero[a][3]);
            HeroesState.heroJoint6HistoryByHero[a][HeroesState.heroPoseTrailWriteIdxByHero[a]].set(HeroesState.heroJointPositionsByHero[a][6]);
            HeroesState.heroJoint4HistoryByHero[a][HeroesState.heroPoseTrailWriteIdxByHero[a]].set(HeroesState.heroJointPositionsByHero[a][4]);
            if (0 < HeroesState.heroAttackTrailTimerByHero[a]) {
                HeroesState.heroAttackTrailTimerByHero[a]--;
                b = itemList[PartyState.partyEquipmentTable[a][HeroesState.attackWeaponSlotIdx[a]]][ItemProps.Appearance];
                if (2 != b) {
                    HeroesState.heroAttackTrailTimerByHero[a] = 0;
                }
            }
            if (0 == HeroesState.heroAttackCooldownFrames[a]) {
                f.set(HeroesState.heroJointPositionsByHero[a][1]);
                f.x += 0 == HeroesState.heroBodyDrawStateByHero[a][2] ? -50 : 50;
                RMath.Vec2Scale(f, .1);
                RMath.Vec2Scale(HeroesState.heroAimPosByHero[a], .9);
                HeroesState.heroAimPosByHero[a].add(f);
            }
            if (0 < HeroesState.heroAttackLineTimer[a]) {
                HeroesState.heroAttackLineTimer[a]--;
            }
            if (HeroesState.heroTileContactFlags[a] & 2) {
                if (0 == HeroesState.heroTileEffectLatch[a])
                    for (HeroesState.heroTileEffectLatch[a] = 1, b = 0; 11 > b; b++) {
                        d = RMath.clamp(HeroesState.heroJointPositionsByHero[a][b].x, 0, 8 * StageState.stageWidth - 1) >> 3;
                        c = RMath.clamp(HeroesState.heroJointPositionsByHero[a][b].y, 0, 8 * StageState.stageHeight - 1) >> 3;
                        if (30 == StageState.stageTileData[c][d]) {
                            spawnProjectile(a, -1, HeroesState.heroJointPositionsByHero[a][b].x, HeroesState.heroJointPositionsByHero[a][b].y, 0, -.8, 0, 29, 4284900966, 2, 16, 16, 0, 0, 0, 0, 1E3, 30, 20, 0, 1, 90, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                        }
                    }
                d = RMath.clamp(HeroesState.heroJointPositionsByHero[a][0].x, 0, 8 * StageState.stageWidth - 1) >> 3;
                c = RMath.clamp(HeroesState.heroJointPositionsByHero[a][0].y, 0, 8 * StageState.stageHeight - 1) >> 3;
                if (31 == StageState.stageTileData[c][d]) {
                    if (1 > RMath.randFloat(50)) {
                        b = RMath.randFloatRange(-1, 2);
                        spawnProjectile(a, -1, HeroesState.heroJointPositionsByHero[a][0].x + b, HeroesState.heroJointPositionsByHero[a][0].y, 0, 0, 0, 2, 4281545523, 2, 8, 8, 0, 0, 0, 0, 1E3, 50, 5, 0, -1, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                    }
                }
            } else HeroesState.heroTileEffectLatch[a] = 0;
            if (5 == GUIState.currentStage) {
                if (HeroesState.heroTileContactFlags[a] & 1) {
                    StageState.stageConditionMask |= 1;
                }
            }
            if (5 == GUIState.currentStage) {
                if (HeroesState.heroTileContactFlags[a] & 2) {
                    StageState.stageConditionMask |= 2;
                }
            }
            if (16 == GUIState.currentStage) {
                if (HeroesState.heroTileContactFlags[a] & 1) {
                    StageState.stageConditionMask |= 1;
                }
            }
            if (16 == GUIState.currentStage) {
                if (HeroesState.heroTileContactFlags[a] & 2) {
                    StageState.stageConditionMask |= 2;
                }
            }
            if (18 == GUIState.currentStage) {
                if (HeroesState.heroTileContactFlags[a] & 1) {
                    StageState.stageConditionMask |= 1;
                }
            }
            if (18 == GUIState.currentStage) {
                if (HeroesState.heroTileContactFlags[a] & 2) {
                    StageState.stageConditionMask |= 2;
                }
            }
        }
    }
}



export function drawPlayerParty() {
    var a, b, c, d, f, g, h = new RMath.Vec2(),
        k = new RMath.Vec2();
    for (a = 0; a < PartyState.partyMemberCount; a++) {
        d = 15908203;
        f = 16777215;
        if (0 < HeroesState.heroStatusTintTimer[a]) {
            d = 1989840;
            f = 5934817;
        } else {
            if (0 < HeroesState.heroSkipTimer[a]) {
                d = 9840;
                f = 1989840;
            } else {
                if (0 < HeroesState.heroTimedDamageTimer[a]) {
                    d = 3381504;
                    f = 3407616;
                }
            }
        }
        if (0 < HeroesState.heroHitFlashTimer[a]) {
            HeroesState.heroHitFlashTimer[a]--;
            f = 16711680;
        }
        RenderingState.spriteAltRenderFlag = RenderingState.isSolidRender = 1;
        for (c = 0; 11 > c; c++) drawSpriteSheetPartCentered(LoadedSprites.effectSpriteSheet, RMath.floor(HeroesState.heroJointPositionsByHero[a][c].x), RMath.floor(HeroesState.heroJointPositionsByHero[a][c].y), 16, 16, 0, 0, 16, 16, 1073741824);
        RenderingState.isSolidRender = RenderingState.spriteAltRenderFlag = 0;
        drawHero(a, HeroesState.heroJointPositionsByHero[a], HeroesState.heroBodyDrawStateByHero[a][0], HeroesState.heroBodyDrawStateByHero[a][1], d, f, HeroesState.heroUpperJointMode[a]);
        if (0 < HeroesState.heroAttackTrailTimerByHero[a]) {
            b = PartyState.partyEquipmentTable[a][HeroesState.attackWeaponSlotIdx[a]];
            c = itemList[b][ItemProps.ProjectileSpeedScale];
            d = itemList[b][ItemProps.ProjectileDelayRange];
            f = d >> 24 & 255;
            var p = itemList[b][ItemProps.ProjectileNoDamageFrames];
            d &= 16777215;
            for (b = 0; 10 > b; b++) {
                var t, l, n;
                t = HeroesState.heroAttackTrailHistorySets[0 + HeroesState.attackTrailSideIdx[a]];
                g = HeroesState.heroAttackTrailHistorySets[2 + HeroesState.attackTrailSideIdx[a]];
                l = HeroesState.heroPoseTrailWriteIdxByHero[a] - b - 0 & 15;
                n = HeroesState.heroPoseTrailWriteIdxByHero[a] -
                    b - 1 & 15;
                h.x = t[a][l].x - g[a][l].x;
                h.y = t[a][l].y - g[a][l].y;
                RMath.Vec2Norm(h);
                RMath.Vec2Scale(h, c);
                k.x = t[a][n].x - g[a][n].x;
                k.y = t[a][n].y - g[a][n].y;
                RMath.Vec2Norm(k);
                RMath.Vec2Scale(k, c);
                g = RMath.floor(f * (12 - b) / 12);
                RenderingState.isSolidRender = p;
                var w = t[a][l].x + h.x,
                    B = t[a][l].y + h.y,
                    M = t[a][n].x + k.x,
                    J = t[a][n].y + k.y,
                    y = t[a][n].x + (b + 1) / 10 * k.x,
                    x = t[a][n].y + (b + 1) / 10 * k.y,
                    K = t[a][l].x + (b + 0) / 10 * h.x,
                    ba = t[a][l].y + (b + 0) / 10 * h.y;
                t = g << 24 | d;
                var U, w = w << 16,
                    B = B << 16,
                    M = M << 16,
                    J = J << 16,
                    y = y << 16,
                    x = x << 16,
                    K = K << 16,
                    ba = ba << 16;
                U = 28311552;
                n = 0;
                if (U > B) {
                    U = B;
                }
                if (U > J) {
                    U = J;
                }
                if (U > x) {
                    U = x;
                }
                if (U > ba) {
                    U = ba;
                }
                if (n < B) {
                    n = B;
                }
                if (n < J) {
                    n = J;
                }
                if (n < x) {
                    n = x;
                }
                if (n < ba) {
                    n = ba;
                }
                U >>= 16;
                n >>= 16;
                if (0 > U) {
                    U = 0;
                }
                if (432 <= n) {
                    n = 431;
                }
                for (l = U; l <= n; l++) {
                    RenderingState.scanlineMinX[l] = 640;
                    RenderingState.scanlineMaxX[l] = -1;
                }
                updateScanlineBoundsFromLine(w, B, M, J);
                updateScanlineBoundsFromLine(M, J, y, x);
                updateScanlineBoundsFromLine(K, ba, y, x);
                updateScanlineBoundsFromLine(w, B, K, ba);
                w = t >> 24 & 255;
                B = t >> 16 & 255;
                M = t >> 8 & 255;
                J = t & 255;
                for (l = U; l < n; l++)
                    for (0 > RenderingState.scanlineMinX[l] && (RenderingState.scanlineMinX[l] = 0), 640 <= RenderingState.scanlineMaxX[l] && (RenderingState.scanlineMaxX[l] = 639), U = 640 * l + RenderingState.scanlineMinX[l], y = U + (RenderingState.scanlineMaxX[l] - RenderingState.scanlineMinX[l]), x = 640 * l + RenderingState.scanlineMinX[l + 1], K = x + (RenderingState.scanlineMaxX[l + 1] - RenderingState.scanlineMinX[l + 1]), U < x && (U = x), y >= K && (y = RMath.min(y - 1, K)); U <= y; U++)
                        if (0 == RenderingState.isSolidRender) {
                            RenderingState.frameBufferArray[U] = t;
                        } else {
                            if (1 == RenderingState.isSolidRender) {
                                x = RenderingState.frameBufferArray[U] >> 16 & 255;
                                x = ((B - x) * w >> 8) + x;
                                K = RenderingState.frameBufferArray[U] >> 8 & 255;
                                K = ((M - K) * w >> 8) + K;
                                ba = RenderingState.frameBufferArray[U] & 255;
                                ba = ((J - ba) * w >> 8) + ba;
                                RenderingState.frameBufferArray[U] = x << 16 | K << 8 | ba;
                            } else {
                                if (2 == RenderingState.isSolidRender) {
                                    x = (RenderingState.frameBufferArray[U] >>
                                        16 & 255) + (B * w >> 8);
                                    if (255 < x) {
                                        x = 255;
                                    }
                                    K = (RenderingState.frameBufferArray[U] >> 8 & 255) + (M * w >> 8);
                                    if (255 < K) {
                                        K = 255;
                                    }
                                    ba = (RenderingState.frameBufferArray[U] & 255) + (J * w >> 8);
                                    if (255 < ba) {
                                        ba = 255;
                                    }
                                    RenderingState.frameBufferArray[U] = x << 16 | K << 8 | ba;
                                }
                            }
                        }
                RenderingState.isSolidRender = 0;
            }
        }
        if (0 < GameplayState.levelUpPopupTimer) {
            d = ~~HeroesState.heroJointPositionsByHero[a][0].x + 0;
            f = ~~HeroesState.heroJointPositionsByHero[a][0].y - 7;
            if (5 > GameplayState.levelUpPopupTimer) {
                g = RMath.floor(255 * GameplayState.levelUpPopupTimer / 5);
            } else {
                g = 255;
            }
            c = RMath.min(60 - GameplayState.levelUpPopupTimer - 0, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d - 16, f - 2 * c, "L", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.levelUpPopupTimer - 3, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d - 12, f - 2 * c, "E", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.levelUpPopupTimer - 6, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d - 8, f - 2 * c, "V", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.levelUpPopupTimer - 9, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d - 4, f - 2 * c, "E", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.levelUpPopupTimer - 12, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d + 0, f - 2 * c, "L", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.levelUpPopupTimer - 15, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d + 8, f - 2 * c, "U", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.levelUpPopupTimer - 18, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d + 12, f - 2 * c, "P", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
        }
        if (
            0 < GameplayState.stageClearPopupTimer) {
            d = ~~HeroesState.heroJointPositionsByHero[a][0].x + 0 - 2;
            f = ~~HeroesState.heroJointPositionsByHero[a][0].y - 7;
            if (5 > GameplayState.stageClearPopupTimer) {
                g = RMath.floor(255 * GameplayState.stageClearPopupTimer / 5);
            } else {
                g = 255;
            }
            c = RMath.min(60 - GameplayState.stageClearPopupTimer - 0, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d - 8, f - 2 * c, "C", 255, 255, 255, g, 34, 34, 34, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.stageClearPopupTimer - 3, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d - 4, f - 2 * c, "L", 255, 255, 255, g, 34, 34, 34, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.stageClearPopupTimer - 6, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d + 0, f - 2 * c, "E", 255, 255, 255, g, 34, 34, 34, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.stageClearPopupTimer - 9, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d + 4, f -
                    2 * c, "A", 255, 255, 255, g, 34, 34, 34, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.stageClearPopupTimer - 12, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d + 8, f - 2 * c, "R", 255, 255, 255, g, 34, 34, 34, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.stageClearPopupTimer - 15, 4);
            if (0 < c) {
                LoadedFonts.gameFontSmall.b = -1;
                drawScaledTintedTextCentered(LoadedFonts.gameFontSmall, d + 2, f - 2 * c + 9, "+" + StageState.stageClearBaseGoldPerHero, 255, 255, 255, g, 34, 34, 34, g, 5, 7);
            }
        }
        if (0 < GameplayState.comboPopupTimer) {
            d = ~~HeroesState.heroJointPositionsByHero[a][0].x + 0 - 2;
            f = ~~HeroesState.heroJointPositionsByHero[a][0].y - 7;
            if (5 > GameplayState.comboPopupTimer) {
                g = RMath.floor(255 * GameplayState.comboPopupTimer / 5);
            } else {
                g = 255;
            }
            c = RMath.min(60 - GameplayState.comboPopupTimer - 0, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d - 8, f - 2 * c, "C", 255, 128, 0, g, 48, 24, 0, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.comboPopupTimer - 3, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d - 4, f - 2 * c, "O", 255, 128, 0, g, 48, 24, 0, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.comboPopupTimer - 6, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d + 0, f - 2 * c, "M", 255, 128, 0, g, 48, 24, 0, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.comboPopupTimer - 9, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d + 4, f -
                    2 * c, "B", 255, 128, 0, g, 48, 24, 0, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.comboPopupTimer - 12, 4);
            if (0 < c) {
                drawScaledTintedText(LoadedFonts.gameFontSmall, d + 8, f - 2 * c, "O", 255, 128, 0, g, 48, 24, 0, g, 5, 7);
            }
            c = RMath.min(60 - GameplayState.comboPopupTimer - 15, 4);
            if (0 < c) {
                LoadedFonts.gameFontSmall.b = -1;
                drawScaledTintedTextCentered(LoadedFonts.gameFontSmall, d + 2, f - 2 * c + 9, "+" + GameplayState.comboGoldPayoutPerHero, 255, 128, 0, g, 48, 24, 0, g, 5, 7);
            }
        }
    }
    if (0 < GameplayState.levelUpPopupTimer) {
        GameplayState.levelUpPopupTimer--;
    } else {
        if (0 < GameplayState.stageClearPopupTimer) {
            GameplayState.stageClearPopupTimer--;
        } else {
            if (0 < GameplayState.comboPopupTimer) {
                GameplayState.comboPopupTimer--;
            }
        }
    }
}


/**     ANATOMY OF A STICKMAN
            
             J0 - (2,2)
             v   5px
             |--------| 
             |        |
             |   J0   |  5px
             |        |
             |--------|  

          J4-----J1-----J3
          |      |       |
          |      |       |
          J6     J2      J5
                /  \
               /    \
              /      \
             J8       J7
             |        |
             |        |
             |        |
             J10      J9
              
*/
export function drawHero(heroIdx, joints, c, d, headColor, bodyColor, noUpperJoints) {
    //*
    // torso
    drawLine(joints[1].x, joints[1].y, joints[2].x, joints[2].y, bodyColor);

    // upper arms
    if (noUpperJoints != HeroesState.areUpperJointsDisabled) {
        drawLine(joints[1].x, joints[1].y, joints[3].x, joints[3].y, bodyColor);
        drawLine(joints[1].x, joints[1].y, joints[4].x, joints[4].y, bodyColor);
    }

    // lower arms
    drawLine(joints[3].x, joints[3].y, joints[5].x, joints[5].y, bodyColor);
    drawLine(joints[4].x, joints[4].y, joints[6].x, joints[6].y, bodyColor);

    // upper legs
    if (noUpperJoints != HeroesState.areUpperJointsDisabled) {
        drawLine(joints[2].x, joints[2].y, joints[7].x, joints[7].y, bodyColor);
        drawLine(joints[2].x, joints[2].y, joints[8].x, joints[8].y, bodyColor);
    }
    // lower legs
    drawLine(joints[7].x, joints[7].y, joints[9].x, joints[9].y, bodyColor);
    drawLine(joints[8].x, joints[8].y, joints[10].x, joints[10].y, bodyColor);

    // head
    // drawLine(joints[0].x, joints[0].y, joints[1].x, joints[1].y, bodyColor);
    drawRectOutline(~~joints[0].x - 2, ~~joints[0].y - 2, 5, 5, headColor);
    //*/
    // draw items/accessories
    let headwearType = itemList[PartyState.partyEquipmentTable[heroIdx][2]][ItemProps.HeadwearType]; // headwear type
    if (headwearType != 0) {
        if (HeroesState.heroBodyDrawStateByHero[heroIdx][2] == 0)
            drawSpriteSheetPartTintedScaled(
                LoadedSprites.itemsSpriteSheet,
                ~~joints[0].x - 8, ~~joints[0].y - 8,
                16, 16,
                16 * (headwearType & 15) + 0, 16 * (headwearType >> 4),
                16, 16,
                itemList[PartyState.partyEquipmentTable[heroIdx][2]][ItemProps.SpriteSourceX], itemList[PartyState.partyEquipmentTable[heroIdx][2]][ModifierColumns.itemSpriteLocY],
                false
            );
        else

            drawSpriteSheetPartTintedScaled(
                LoadedSprites.itemsSpriteSheet,
                ~~joints[0].x - 8, ~~joints[0].y - 8,
                16, 16,
                16 * (headwearType & 15) + 16, 16 * (headwearType >> 4),
                -16, 16,
                itemList[PartyState.partyEquipmentTable[heroIdx][2]][ItemProps.SpriteSourceX], itemList[PartyState.partyEquipmentTable[heroIdx][2]][ModifierColumns.itemSpriteLocY],
                false
            );
    }

    var baseDrawPos = new RMath.Vec2();

    for (let toolIdx = 0; toolIdx < 2; toolIdx++) {
        let p = PartyState.partyEquipmentTable[heroIdx][toolIdx ? d : c];
        let appearanceType = itemList[p][ItemProps.Appearance];
        p = itemList[p][ItemProps.SpriteSourceX];
        let t = joints[5 + toolIdx];
        let l = joints[3 + toolIdx];

        switch (appearanceType) {
            case 1:
                drawRectCentered(t.x, t.y, 3, 3, p);
                break;
            case 2:
                RMath.Vec2Sub(baseDrawPos, t, l);
                RMath.Vec2Norm(baseDrawPos);
                if (noUpperJoints == 2) {
                    drawLine(l.x + 2 * baseDrawPos.x, l.y + 2 * baseDrawPos.y, l.x + 7 * baseDrawPos.x, l.y + 7 * baseDrawPos.y, p);
                } else {
                    drawLine(l.x + 2 * baseDrawPos.x, l.y + 2 * baseDrawPos.y, l.x + 10 * baseDrawPos.x, l.y + 10 * baseDrawPos.y, p);
                }
                RMath.Vec2Rotate(baseDrawPos);
                drawLine(t.x - 2 * baseDrawPos.x, t.y - 2 * baseDrawPos.y, t.x + 2 * baseDrawPos.x, t.y + 2 * baseDrawPos.y, p);
                
                break;
            case 3:
                if (noUpperJoints == 2) {
                    if (toolIdx) {
                        drawLine(t.x - 3, t.y + 3, t.x + 9, t.y - 9, p);
                    } else {
                        drawLine(t.x + 3, t.y + 3, t.x - 9, t.y - 9, p);
                    }
                } else {
                    RMath.Vec2Sub(baseDrawPos, HeroesState.heroAimPosByHero[heroIdx], t);
                    RMath.Vec2Norm(baseDrawPos);
                    if (0 < HeroesState.heroAttackLineTimer[heroIdx] && HeroesState.attackTrailSideIdx[heroIdx] == toolIdx) {
                        drawLine(t.x - 5 * baseDrawPos.x, t.y - 5 * baseDrawPos.y, HeroesState.heroAimPosByHero[heroIdx].x, HeroesState.heroAimPosByHero[heroIdx].y, p);
                    } else {
                        drawLine(t.x - 5 * baseDrawPos.x, t.y - 5 * baseDrawPos.y, t.x + 20 * baseDrawPos.x, t.y + 20 * baseDrawPos.y, p);
                    }
                }
                break;
            case 4:
                RMath.Vec2Sub(baseDrawPos, t, l);
                RMath.Vec2Norm(baseDrawPos);
                if (2 == noUpperJoints) {
                    drawLine(l.x, l.y, l.x + 4 * baseDrawPos.x, l.y + 4 * baseDrawPos.y, p);
                } else {
                    drawLine(l.x, l.y, l.x + 8 * baseDrawPos.x, l.y + 8 * baseDrawPos.y, p);
                }
                drawLine(t.x, t.y, t.x - 2 * baseDrawPos.x + 4 * baseDrawPos.y, t.y - 2 * baseDrawPos.y - 4 * baseDrawPos.x, 8421504);
                drawLine(t.x, t.y, t.x - 2 * baseDrawPos.x - 4 * baseDrawPos.y, t.y - 2 * baseDrawPos.y + 4 * baseDrawPos.x, 8421504);
                break;
            case 5:
                RenderingState.isSolidRender = 2;
                RenderingState.spriteAltRenderFlag = 1;
                drawSpriteSheetPartCentered(LoadedSprites.effectSpriteSheet, t.x, t.y, 16, 16, 0, 0, 16, 16, 3422552064 | p);
                RenderingState.isSolidRender = RenderingState.spriteAltRenderFlag = 0;
                break;

        }
    }
}


export function loadLevelData(a) {
    if (StageState.loadedLevelIndex != a) {
        StageState.loadedLevelIndex = a;
        LoadedSprites.currentLevelSprite = new Sprite;
        LoadedSprites.currentLevelSprite.f("m" + a + ".png");
    }
    loadSprite(LoadedSprites.currentLevelSprite); // check if loaded sprite is valid
    if (uncheckedSpriteCount.value) return false;
    StageState.lastStageIdx = GUIState.currentStage;
    StageState.isStageReachedArray[GUIState.currentStage] = 1;
    StageState.stageHeight = LoadedSprites.currentLevelSprite.i;
    let d = 0;
    let spriteData = LoadedSprites.currentLevelSprite.g;
    for (let b = 0; b < StageState.stageHeight; b++) {
        for (let a = 0; a < StageState.stageWidth; a++, d++) {
            let pu = (b > 0) ? (d - StageState.stageWidth) : d; // up
            let pd = (b == StageState.stageHeight - 1) ? d : d + StageState.stageWidth; // down
            let pl = (a > 0) ? d - 1 : d; // left 
            let pr = (a == StageState.stageWidth - 1) ? d : d + 1; // right

            StageState.stageTileData[b][a] = 64; // default
            const _isPixelSolid = (i) => {
                let _a, _b, _c;
                _a = spriteData[i] >> 16 & 255;
                _b = spriteData[i] >> 8 & 255;
                _c = spriteData[i] & 255;
                return (_a == _c && _b == _c && _c) ? 1 : 0;
            };

            if (0xffffff == spriteData[d]) {
                const solidUp = _isPixelSolid(pu);
                const solidDown = _isPixelSolid(pd);
                const solidLeft = _isPixelSolid(pl);
                const solidRight = _isPixelSolid(pr);

                const adjacencyMask = (solidUp ? 1 : 0) | (solidDown ? 2 : 0) | (solidLeft ? 4 : 0) | (solidRight ? 8 : 0);

                switch (adjacencyMask) {
                    case 0:
                        StageState.stageTileData[b][a] = 3;
                        break;
                    case 1:
                        StageState.stageTileData[b][a] = 5;
                        break;
                    case 2:
                        StageState.stageTileData[b][a] = 4;
                        break;
                    case 3:
                        StageState.stageTileData[b][a] = 19;
                        break;
                    case 4:
                        StageState.stageTileData[b][a] = 7;
                        break;
                    case 5:
                        StageState.stageTileData[b][a] = 18;
                        break;
                    case 6:
                        StageState.stageTileData[b][a] = 2;
                        break;
                    case 7:
                        StageState.stageTileData[b][a] = 10;
                        break;
                    case 8:
                        StageState.stageTileData[b][a] = 6;
                        break;
                    case 9:
                        StageState.stageTileData[b][a] = 16;
                        break;
                    case 10:
                        StageState.stageTileData[b][a] = 0;
                        break;
                    case 11:
                        StageState.stageTileData[b][a] = 8;
                        break;
                    case 12:
                        StageState.stageTileData[b][a] = 11;
                        break;
                    case 13:
                        StageState.stageTileData[b][a] = 17;
                        break;
                    case 14:
                        StageState.stageTileData[b][a] = 1;
                        break;
                    case 15:
                        StageState.stageTileData[b][a] = 9;
                        break;
                }
            } else {
                const tileColor = spriteData[d];
                if (tileColor === 12303291) {
                    StageState.stageTileData[b][a] = 12;
                } else if (tileColor === 11184810) {
                    StageState.stageTileData[b][a] = 13;
                } else if (tileColor === 10066329) {
                    StageState.stageTileData[b][a] = 14;
                } else if (tileColor === 6684774) {
                    StageState.stageTileData[b][a] = 20;
                } else if (tileColor === 6697728) {
                    StageState.stageTileData[b][a] = 24;
                } else if (tileColor === 10053171) {
                    StageState.stageTileData[b][a] = 25;
                } else if (tileColor === 13408614) {
                    StageState.stageTileData[b][a] = 26;
                } else if (tileColor === 16764057 && spriteData[pl] === 0) {
                    StageState.stageTileData[b][a] = 27;
                } else if (tileColor === 16764057 && spriteData[pl] === 21913) {
                    StageState.stageTileData[b][a] = 29;
                } else if (tileColor === 16764057 && spriteData[pl] !== 0) {
                    StageState.stageTileData[b][a] = 28;
                } else if (tileColor === 21913 && spriteData[pu] === 0) {
                    StageState.stageTileData[b][a] = 30;
                } else if (tileColor === 21913 && spriteData[pu] !== 0) {
                    StageState.stageTileData[b][a] = 31;
                } else if (tileColor === 3355392) {
                    StageState.stageTileData[b][a] = 32;
                } else if (tileColor === 6710835) {
                    StageState.stageTileData[b][a] = 33;
                } else if (tileColor === 10066278) {
                    StageState.stageTileData[b][a] = 34;
                } else if (tileColor === 13421721) {
                    StageState.stageTileData[b][a] = 35;
                } else if (tileColor === 10053120 && spriteData[pd] === 10053120) {
                    StageState.stageTileData[b][a] = 36;
                } else if (tileColor === 16724736 && spriteData[pu] !== 16724736) {
                    StageState.stageTileData[b][a] = 37;
                } else if (tileColor === 3355494 && spriteData[pu] !== 3355494) {
                    StageState.stageTileData[b][a] = 38;
                } else if (tileColor === 16776960) {
                    StageState.stageTileData[b][a] = 39;
                } else if (tileColor === 3368448) {
                    StageState.stageTileData[b][a] = 40;
                } else if (tileColor === 6723891) {
                    StageState.stageTileData[b][a] = 41;
                } else if (tileColor === 10079334) {
                    StageState.stageTileData[b][a] = 42;
                } else if (tileColor === 10053120 && spriteData[pd] !== 10053120) {
                    StageState.stageTileData[b][a] = 44;
                } else if (tileColor === 16724736 && spriteData[pu] === 16724736) {
                    StageState.stageTileData[b][a] = 45;
                } else if (tileColor === 3355494 && spriteData[pu] === 3355494) {
                    StageState.stageTileData[b][a] = 46;
                } else if (tileColor === 6710784) {
                    StageState.stageTileData[b][a] = 47;
                } else if (tileColor === 16724940) {
                    StageState.stageTileData[b][a] = 48;
                } else if (tileColor === 13056) {
                    StageState.stageTileData[b][a] = 49;
                } else if (tileColor === 51) {
                    StageState.stageTileData[b][a] = 50;
                } else if (tileColor === 10040064) {
                    StageState.stageTileData[b][a] = 51;
                } else if (tileColor === 10066431 && spriteData[pd] === 10066431) {
                    StageState.stageTileData[b][a] = 52;
                } else if (tileColor === 16737792 && spriteData[pu] !== 16737792) {
                    StageState.stageTileData[b][a] = 53;
                } else if (tileColor === 16763904) {
                    StageState.stageTileData[b][a] = 55;
                } else if (tileColor === 10066431 && spriteData[pu] === 10066431) {
                    StageState.stageTileData[b][a] = 60;
                } else if (tileColor === 16737792 && spriteData[pu] === 16737792) {
                    StageState.stageTileData[b][a] = 61;
                }
            }
        }
    }

    for (let a = 0; 4 > a; a++) PartyState.heroEmitCooldown[a] = 0;
    resetDragSelection();
    for (let a = 0; 4 > a; a++) resetHeroPose(a, StageState.partySpawnXByHero[a], StageState.partySpawnYByHero[a]);
    for (let a = 0; 20 > a; a++) {
        StageState.activeSpawnCountByGroup[a] = 0;
        StageState.totalSpawnedCountByGroup[a] = 0;
    }
    StageState.stageClearBaseGoldPerHero = 0;
    clearEnemies();
    for (let a = StageProps.stageSpawnGroupsStartIdx; a < stageListArray[GUIState.currentStage].length; a += 7) {
        let c = stageListArray[GUIState.currentStage][a + 0];
        let d = stageListArray[GUIState.currentStage][a + 1];
        let k = stageListArray[GUIState.currentStage][a + 3];
        let f = stageListArray[GUIState.currentStage][a + 4];
        let p = stageListArray[GUIState.currentStage][a + 5];
        let t = stageListArray[GUIState.currentStage][a + 6];
        for (let b = 0; b < d; b++) {
            let h = RMath.randIntRange(k, p + 1);
            let g = RMath.randIntRange(f, t + 1);

            if (StageState.stageTileData[g][h] > 25) {
                spawnEnemy(h, g, c, (a - StageProps.stageSpawnGroupsStartIdx) / 7);
                StageState.activeSpawnCountByGroup[(a - StageProps.stageSpawnGroupsStartIdx) / 7]++;
                StageState.totalSpawnedCountByGroup[(a - StageProps.stageSpawnGroupsStartIdx) / 7]++;
            };
        }
        let b = enemyCatalog[c][EnemyProps.Level];
        if (EnemyState.stageMaxEnemyLevel < b) EnemyState.stageMaxEnemyLevel = b;
    }
    PopupState.popupCount = ProjectileState.projectileCount = 0;
    clearDrops();
    initStageState();
    return true
}


export function getStageTileAt(x, y) { // ri
    x = RMath.clamp(x, 0, 8 * StageState.stageWidth - 1) >> 3; // divide by 8
    y = RMath.clamp(y, 0, 8 * StageState.stageHeight - 1) >> 3;
    return StageState.stageTileData[y][x]
}


export function fillStageTilesRect(_tx0, _ty0, _tx1, _ty1, _tid) { // dj
    let _row;
    for (_row = _ty0; _row <= _ty1; _row++)
        for (_ty0 = _tx0; _ty0 <= _tx1; _ty0++) StageState.stageTileData[_row][_ty0] = _tid
}


export function updateStageEdgeSpawns() { // wg
    var a;
    if (12 == GUIState.gameScreenState)
        for (a = 0; a < PartyState.partyMemberCount; a++)
            if (HeroesState.heroUpperJointMode[a] != HeroesState.areUpperJointsDisabled) {
                var b = HeroesState.heroJointPositionsByHero[a][1].x,
                    c = HeroesState.heroJointPositionsByHero[a][1].y;
                if (4 > b && 0 < stageListArray[GUIState.currentStage][StageProps.stageExitLeftIdx]) {
                    StageState.lastStageIdx = stageListArray[GUIState.currentStage][StageProps.stageExitLeftIdx];
                    for (var d = 0; 4 > d; d++) {
                        StageState.partySpawnXByHero[d] = 77;
                        StageState.partySpawnYByHero[d] = c >> 3;
                    }
                } else if (636 <= b && 0 < stageListArray[GUIState.currentStage][StageProps.stageExitRightIdx])
                    for (StageState.lastStageIdx = stageListArray[GUIState.currentStage][StageProps.stageExitRightIdx], d = 0; 4 > d; d++) {
                        StageState.partySpawnXByHero[d] = 2;
                        StageState.partySpawnYByHero[d] = c >> 3;
                    }
                if (4 > c && 0 < stageListArray[GUIState.currentStage][StageProps.stageExitTopIdx])
                    for (StageState.lastStageIdx = stageListArray[GUIState.currentStage][StageProps.stageExitTopIdx], d = 0; 4 > d; d++) {
                        StageState.partySpawnXByHero[d] = b >> 3;
                        StageState.partySpawnYByHero[d] = 42;
                    } else
                if (356 <= c && 0 < stageListArray[GUIState.currentStage][StageProps.stageExitBottomIdx])
                    for (StageState.lastStageIdx = stageListArray[GUIState.currentStage][StageProps.stageExitBottomIdx], d = 0; 4 > d; d++) {
                        StageState.partySpawnXByHero[d] = b >> 3;
                        StageState.partySpawnYByHero[d] = 2;
                    }
            } for (a = 0; 20 > a; a++) StageState.activeSpawnCountByGroup[a] = 0;
    for (a = 0; a < EnemyState.enemyCount; a++) StageState.activeSpawnCountByGroup[EnemyState.enemySpawnGroupIdxArray[a]]++;
    for (b = StageProps.stageSpawnGroupsStartIdx; b < stageListArray[GUIState.currentStage].length; b += 7) {
        a = stageListArray[GUIState.currentStage][b + 0];
        var f = stageListArray[GUIState.currentStage][b + 1],
            c = stageListArray[GUIState.currentStage][b + 2],
            g = stageListArray[GUIState.currentStage][b + 3],
            d = stageListArray[GUIState.currentStage][b + 4],
            h = stageListArray[GUIState.currentStage][b + 5],
            k = stageListArray[GUIState.currentStage][b + 6];
        if (!(c <= StageState.totalSpawnedCountByGroup[(b - StageProps.stageSpawnGroupsStartIdx) / 7])) {
            if (StageState.activeSpawnCountByGroup[(b - StageProps.stageSpawnGroupsStartIdx) / 7] < f) {
                if (1E3 * RMath.rand() < stageListArray[GUIState.currentStage][StageProps.stageSpawnChance]) {
                    c = RMath.randIntRange(g, h + 1);
                    d = RMath.randIntRange(d, k + 1);
                    if (!25 >= StageState.stageTileData[d][c]) {
                        spawnEnemy(c, d, a, (b - StageProps.stageSpawnGroupsStartIdx) / 7);
                        StageState.activeSpawnCountByGroup[(b - StageProps.stageSpawnGroupsStartIdx) / 7]++;
                        StageState.totalSpawnedCountByGroup[(b - StageProps.stageSpawnGroupsStartIdx) / 7]++;
                    }
                }
            }
        }


    }
    a = d = 0;
    for (b = StageProps.stageSpawnGroupsStartIdx; b < stageListArray[GUIState.currentStage].length; b += 7) {
        a = (b - StageProps.stageSpawnGroupsStartIdx) / 7;
        c = stageListArray[GUIState.currentStage][b + 2];
        if (0 != StageState.activeSpawnCountByGroup[a] || StageState.totalSpawnedCountByGroup[a] < c) {
            d++;
        }
    }
    for (; 20 > a; a++)
        if (0 != StageState.activeSpawnCountByGroup[a]) {
            d++;
        }
    if (!d && 0 == StageState.stageClearBaseGoldPerHero) {
        for (a = 0; 20 > a; a++) StageState.stageClearBaseGoldPerHero += StageState.totalSpawnedCountByGroup[a];
        StageState.stageClearBaseGoldPerHero = RMath.floor((StageState.stageClearBaseGoldPerHero + PartyState.partyMemberCount - 1) / PartyState.partyMemberCount);
        if (0 < StageState.stageClearBaseGoldPerHero) {
            b = 100 + GameplayState.comboMultBonus;
            GameplayState.comboMultBonus += StageState.stageClearBaseGoldPerHero;
            StageState.stageClearBaseGoldPerHero = RMath.floor(StageState.stageClearBaseGoldPerHero * b / 100);
            GameplayState.stageClearPopupTimer = 60;
            PartyState.partyGold = RMath.clamp(PartyState.partyGold + StageState.stageClearBaseGoldPerHero * PartyState.partyMemberCount, 0, 9999999);
            if (isBadgeIncompleteForCurrentStage(0)) {
                IncrementBadgeCount(0);
            }
            if (isBadgeIncompleteForCurrentStage(10)) {
                if (3600 > StageState.gameFrameCounter) {
                    IncrementBadgeCount(10);
                }
            }
            if (isBadgeIncompleteForCurrentStage(15)) {
                if (!StageState.stageFlagUseCount) {
                    IncrementBadgeCount(15);
                }
            }
            if (isBadgeIncompleteForCurrentStage(20)) {
                if (87 <= GameplayState.comboCount) {
                    IncrementBadgeCount(20);
                }
            }
            if (isBadgeIncompleteForCurrentStage(25)) {
                if (100 <= GameplayState.comboMultBonus) {
                    IncrementBadgeCount(25);
                }
            }
            if (isBadgeIncompleteForCurrentStage(30)) {
                if (111 <= GameplayState.comboCount) {
                    IncrementBadgeCount(30);
                }
            }
            if (isBadgeIncompleteForCurrentStage(35)) {
                if (!StageState.stageFlagUseCount) {
                    IncrementBadgeCount(35);
                }
            }
            if (isBadgeIncompleteForCurrentStage(40)) {
                if (3600 > StageState.gameFrameCounter) {
                    IncrementBadgeCount(40);
                }
            }
            if (isBadgeIncompleteForCurrentStage(45)) {
                if (7200 > StageState.gameFrameCounter) {
                    IncrementBadgeCount(45);
                }
            }
            if (isBadgeIncompleteForCurrentStage(50)) {
                if (!StageState.stageFlagUseCount) {
                    IncrementBadgeCount(50);
                }
            }
            if (isBadgeIncompleteForCurrentStage(55)) {
                if (227 <= GameplayState.comboCount) {
                    IncrementBadgeCount(55);
                }
            }
            if (isBadgeIncompleteForCurrentStage(60)) {
                IncrementBadgeCount(60);
            }
            if (isBadgeIncompleteForCurrentStage(65)) {
                if (!StageState.stageFlagUseCount) {
                    IncrementBadgeCount(65);
                }
            }
            if (isBadgeIncompleteForCurrentStage(70)) {
                if (9E3 > StageState.gameFrameCounter) {
                    IncrementBadgeCount(70);
                }
            }
            if (19 == GUIState.currentStage) {
                if (0 == PartyState.stageEventFlags[1]) {
                    PartyState.stageEventFlags[1] = 1;
                }
            }
            spawnPopup(320, 213, 0, "STAGE CLEAR", 300, 16777215);
            let popupText = RMath.floor(StageState.gameFrameCounter / 3600) + ":" + RMath.floor(StageState.gameFrameCounter % 3600 / 60) + "." + StageState.gameFrameCounter % 60;
            if (3600 > StageState.gameFrameCounter) {
                popupText = RMath.floor(StageState.gameFrameCounter / 60) + "." + StageState.gameFrameCounter % 60;
            }
            spawnPopup(320, 223, 0, popupText, 300, 16777215);
        }
    }
}


export function drawGameStage() {
    var a, b, c, d;
    a = stageListArray[GUIState.currentStage][StageProps.stageTilesetIdxCol];
    for (c = 0; c < StageState.stageHeight; c++)
        for (b = 0; b < StageState.stageWidth; b++)
            if (d = StageState.stageTileData[c][b], 64 == d) drawRect(8 * b, 8 * c, 8, 8, 0);
            else {
                var f = LoadedSprites.tilesetSprites[a],
                    g = 8,
                    h = 8,
                    k, p, t, l;
                k = 5120 * c + 8 * b;
                p = 640 - g;
                d = 8 * (d >> 3) * f.h + 8 * (d & 7);
                t = f.h - g;
                g = k + g;
                for (h = k + 640 * h; k < h; k += p, g += 640, d += t)
                    for (; k < g; k++, d++) {
                        l = f.g[d];
                        if (-1 != l) {
                            RenderingState.frameBufferArray[k] = l;
                        }
                    }
            } for (c = 0; c < StageState.stageHeight; c++)
        for (b = 1; b < StageState.stageWidth - 1; b++)
            if (30 == StageState.stageTileData[c][b]) {
                if (30 != StageState.stageTileData[c][b - 1]) {
                    fillEmptyPixelsRect(8 * b - 2, 8 * c + 6, 2, 2, 21913);
                }
                if (30 != StageState.stageTileData[c][b + 1]) {
                    fillEmptyPixelsRect(8 * b + 8, 8 * c + 6, 2, 2, 21913);
                }
            } else {
                if (31 == StageState.stageTileData[c][b]) {
                    if (31 != StageState.stageTileData[c][b - 1]) {
                        fillEmptyPixelsRect(8 * b - 2, 8 * c, 2, 8, 21913);
                    }
                    if (31 != StageState.stageTileData[c][b + 1]) {
                        fillEmptyPixelsRect(8 * b + 8, 8 * c, 2, 8, 21913);
                    }
                }
            }
    if (1 == GUIState.currentStage) {
        if (1 == StageState.isStageReachedArray[6]) {
            b = 184 + RMath.randFloatRange(4, 28);
            c = 192 + RMath.randFloatRange(3, 7);
            spawnProjectile(0, -1, b, c, 0, 0, 0, 35, 1080465868, 2, 32, 10, 0, 0, 0, 0, 1E3, 30, 5, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
    } else
    if (6 == GUIState.currentStage) {
        b = 304 + RMath.randFloatRange(4, 28);
        c = 192 + RMath.randFloatRange(3, 7);
        spawnProjectile(0, -1, b, c, 0, 0, 0, 35, 1080465868, 2, 32, 10, 0, 0, 0, 0, 1E3, 30, 5, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    } else
    if (14 == GUIState.currentStage) {
        b = 2 * RMath.rotationLUT[StageState.gameFrameCounter >> 2 & 511][0];
        c = 2 * RMath.rotationLUT[StageState.gameFrameCounter >> 2 & 511][1];
        spawnProjectile(-1, -1, 180, 180, b, c, 0, 0, 4294927889, 2, 16, 16, 0, 8, 8, 0, 0, 78, 5, 0, 0, 100, 0, 2, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    } else
    if (17 == GUIState.currentStage) {
        if (70 == StageState.gameFrameCounter % 360) {
            spawnProjectile(-1, -1, 551, 179, -.5, 0, 0, 35, 4279365137, 2, 8, 48, 0, 4, 48, 0, 0, 910, 5, 0, 0, 100, 0, 0, 0, 0, 0, 6, 6, 4, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
    } else
    if (18 == GUIState.currentStage)
        for (f = [29, 44, 59], g = [35, 34, 33], a = 0; 3 > a; a++) {
            for (h = 0; h < PartyState.partyMemberCount && !(b = RMath.clamp(HeroesState.heroJointPositionsByHero[h][2].x, 0, 8 * StageState.stageWidth - 1) >> 3, c = RMath.clamp(HeroesState.heroJointPositionsByHero[h][2].y, 0, 8 * StageState.stageHeight - 1) >> 3, f[a] - 2 <= b && b <= f[a] + 2 && g[a] <= c && c <= g[a] + 9); h++);
            h == PartyState.partyMemberCount || StageState.gameFrameCounter % 8 || spawnProjectile(-1, -1, 8 * f[a] + 4, 8 * g[a] + 8, 0, 1, 0, 35, 4294967057, 2, 16, 12, 0, 8, 12, 0, 0, 80, 0, 0, 0, 100, 0, 0, 0, 0, 0, 1, 9, 3, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
}



export function initStageState() { // cj
    StageState.stageFlagUseCount = StageState.stageConditionMask = StageState.stageEncounterCounter = StageState.consecutiveConditionFrameCount = StageState.gameFrameCounter = StageState.stage_totalDamageDealt = StageState.stage_partyDamageTaken = 0;
    let a, b, c, d;
    if (17 == GUIState.currentStage) {
        b = PartyState.partyGold % 100;
        for (a = 0; a < b;) {
            c = ~~RMath.randFloatRange(27, 70);
            d = RMath.randFloat(2.1);
            d = 3 + ~~(d * d * d);
            if (32 == StageState.stageTileData[d][c]) {
                fillStageTilesRect(c, d, c, d, 39);
                a++;
            }
        }
        if (isBadgeIncompleteForCurrentStage(67)) {
            if (99 == b) {
                IncrementBadgeCount(67);
            }
        }
    } else if (19 == GUIState.currentStage) {
        let b = [14, 13, 13, 13, 13, 14, 14, 14, 15, 15, 16, 16, 16, 17, 18, 18, 19, 19, 19, 20, 20, 20, 19, 19, 19, 17, 17, 17, 0, 0, 0, 0, 17, 17, 17, 19, 19, 19, 20];
        for (a = 0; 39 > a; a++) {
            if (0 != b[a]) {
                spawnEnemy(19 + a, b[a], 88, 6);
                StageState.activeSpawnCountByGroup[6]++;
                StageState.totalSpawnedCountByGroup[6]++;
            }
        }
    }
}


export function updateStageTick() { // xg
    var a, b, c, d, f = b = 0,
        g, h, k = 79,
        p = 0,
        t = 59,
        l = 0;
    StageState.gameFrameCounter++;
    if (-1 != GameplayState.draggedHeroIndex) {
        b = RMath.clamp(HeroesState.heroJointPositionsByHero[GameplayState.draggedHeroIndex][2].x, 0, 8 * StageState.stageWidth - 1) >> 3;
        f = RMath.clamp(HeroesState.heroJointPositionsByHero[GameplayState.draggedHeroIndex][2].y, 0, 8 * StageState.stageHeight - 1) >> 3;
    }

    g = RMath.clamp(HeroesState.heroJointPositionsByHero[GUIState.selectingHero][2].x, 0, 8 * StageState.stageWidth - 1) >> 3;
    h = RMath.clamp(HeroesState.heroJointPositionsByHero[GUIState.selectingHero][2].y, 0, 8 * StageState.stageHeight - 1) >> 3;
    for (a = 0; a < PartyState.partyMemberCount; a++) {
        c = RMath.clamp(HeroesState.heroJointPositionsByHero[a][2].x, 0, 8 * StageState.stageWidth - 1) >> 3;
        d = RMath.clamp(HeroesState.heroJointPositionsByHero[a][2].y, 0, 8 * StageState.stageHeight - 1) >> 3;
        if (k > c) {
            k = c;
        }
        if (p < c) {
            p = c;
        }
        if (t > d) {
            t = d;
        }
        if (l < d) {
            l = d;
        }
    }
    c = [0, -4, 4, 4, -4];
    d = [0, -4, -4, 4, 4];
    for (a = 0; 5 > a; a++) {
        var n = RMath.clamp(mouseXCurrent + c[a] >> 3, 0, StageState.stageWidth - 1),
            w = RMath.clamp(mouseYCurrent + d[a] >> 3, 0, StageState.stageHeight - 1);
        if (isMouseClicked) {
            if (39 == StageState.stageTileData[w][n]) {
                fillStageTilesRect(n, w, n, w, 32);
                a = 1;
                if (1 > RMath.randFloat(200)) {
                    a = 100;
                } else if (1 > RMath.randFloat(14)) {
                    a = 7;
                }
                a = RMath.floor(a * (100 + PartyState.partyRewardValueBonusPercent) / 100);
                spawnDrop(8 * n +
                    4, 8 * w + 4, 2, a, 0);
                if (isBadgeIncompleteForCurrentStage(3)) {
                    IncrementBadgeCount(3);
                }
                if (13 == GUIState.currentStage)
                    for (a = 0; 15 > a; a++) {
                        spawnEnemy(n, w, 48, 6);
                        StageState.activeSpawnCountByGroup[6]++;
                        StageState.totalSpawnedCountByGroup[6]++;
                    }
                if (19 == GUIState.currentStage) {
                    spawnEnemy(n, w, 87, 5);
                    StageState.activeSpawnCountByGroup[5]++;
                    StageState.totalSpawnedCountByGroup[5]++;
                }
                break;
            }
            if (47 == StageState.stageTileData[w][n]) {
                if (2 == GUIState.currentStage) {
                    if (isBadgeIncompleteForCurrentStage(4)) {
                        IncrementBadgeCount(4);
                    }
                }
                if (11 == GUIState.currentStage) {
                    c = 8 * n + 4 - mouseXCurrent;
                    d = 8 * w + 4 - mouseYCurrent;
                    if (RMath.abs(c) >= RMath.abs(d)) {
                        if (0 < c && 32 == StageState.stageTileData[w][n + 1]) {
                            fillStageTilesRect(n + 1, w, n + 1, w, 47);
                            fillStageTilesRect(n, w, n, w, 32);
                            n += 1;
                        } else if (0 > c && 32 == StageState.stageTileData[w][n - 1]) {
                            fillStageTilesRect(n - 1, w, n - 1, w, 47);
                            fillStageTilesRect(n, w, n, w, 32);
                            --n;
                        }
                    } else if (0 < d && 32 == StageState.stageTileData[w + 1][n]) {
                        fillStageTilesRect(n, w + 1, n, w + 1, 47);
                        fillStageTilesRect(n, w, n, w, 32);
                        w += 1;
                    } else if (0 > d && 32 == StageState.stageTileData[w - 1][n]) {
                        fillStageTilesRect(n, w - 1, n, w - 1, 47);
                        fillStageTilesRect(n, w, n, w, 32);
                        --w;
                    }
                    if (isBadgeIncompleteForCurrentStage(44)) {
                        c = RMath.abs(64 - n);
                        d = RMath.abs(11 - w);
                        spawnPopup(mouseXCurrent, mouseYCurrent, 0, "" + c + d, 30, 10066431);
                        if (0 ==
                            c && 0 == d) {
                            IncrementBadgeCount(44);
                        }
                    }
                }
                break;
            }
        }
    }
    if (1 == GUIState.currentStage) {
        if (12 == GUIState.gameScreenState && 1 == StageState.isStageReachedArray[6] && 23 <= g && 26 >= g && 24 <= h && 24 >= h) {
            StageState.lastStageIdx = 6;
            StageState.partySpawnXByHero[0] = 33;
            StageState.partySpawnYByHero[0] = 24;
            StageState.partySpawnXByHero[1] = 35;
            StageState.partySpawnYByHero[1] = 24;
            StageState.partySpawnXByHero[2] = 44;
            StageState.partySpawnYByHero[2] = 24;
            StageState.partySpawnXByHero[3] = 46;
            StageState.partySpawnYByHero[3] = 24;
        }
        if (12 == GUIState.gameScreenState && 1 == StageState.isStageReachedArray[12] && 1 > h) {
            StageState.lastStageIdx = 12;
            StageState.partySpawnXByHero[0] = 67;
            StageState.partySpawnYByHero[0] = 42;
            StageState.partySpawnXByHero[1] = 69;
            StageState.partySpawnYByHero[1] = 42;
            StageState.partySpawnXByHero[2] = 71;
            StageState.partySpawnYByHero[2] = 42;
            StageState.partySpawnXByHero[3] = 73;
            StageState.partySpawnYByHero[3] = 42;
        }
    } else if (2 != GUIState.currentStage)
        if (3 == GUIState.currentStage) {
            if (1 == PartyState.partyMemberCount && 0 == StageState.activeSpawnCountByGroup[0]) {
                resetHeroPose(PartyState.partyMemberCount, 25, 14);
                PartyState.partyMemberCount++;
            }
            if (2 <= PartyState.partyMemberCount) {
                fillStageTilesRect(25, 13, 25, 14, 64);
                fillStageTilesRect(31, 11, 31, 14, 64);
            }
            if (1 == StageState.stageEventFlagArray[0]) {
                fillStageTilesRect(11, 30, 11, 30, 63);
            } else if (32 == StageState.stageTileData[30][11]) {
                if (0 == StageState.activeSpawnCountByGroup[1]) {
                    fillStageTilesRect(11, 30, 11, 30, 55);
                }
            } else if (55 == StageState.stageTileData[30][11] && 10 <= b && 12 >= b && 29 <= f && 31 >= f) {
                fillStageTilesRect(11, 30, 11, 30, 63);
                spawnDrop(92,
                    244, 3, 0, 0);
            }
            if (0 == StageState.totalSpawnedCountByGroup[2] && 10 <= b && 20 >= b && 34 <= f && 41 >= f) {
                spawnEnemy(14, 41, 15, 2);
                spawnEnemy(16, 41, 15, 2);
                spawnEnemy(18, 41, 15, 2);
                StageState.activeSpawnCountByGroup[2] = 3;
                StageState.totalSpawnedCountByGroup[2] = 3;
            }
            if (1 == StageState.stageEventFlagArray[1]) {
                fillStageTilesRect(16, 41, 16, 41, 63);
            } else if (32 == StageState.stageTileData[41][16]) {
                if (0 == StageState.activeSpawnCountByGroup[2] && 0 != StageState.totalSpawnedCountByGroup[2]) {
                    fillStageTilesRect(16, 41, 16, 41, 55);
                }
            } else if (55 == StageState.stageTileData[41][16] && 15 <= b && 17 >= b && 40 <= f && 42 >= f) {
                fillStageTilesRect(16, 41, 16, 41, 63);
                spawnDrop(132, 332, 3, 1, 0);
            }
            if (isBadgeIncompleteForCurrentStage(7)) {
                for (a = b = 0; a < PartyState.partyMemberCount; a++) {
                    c = RMath.clamp(HeroesState.heroJointPositionsByHero[a][2].x, 0, 8 * StageState.stageWidth - 1) >> 3;
                    d = RMath.clamp(HeroesState.heroJointPositionsByHero[a][2].y, 0, 8 * StageState.stageHeight - 1) >> 3;
                    if (8 <= c && 15 >= c && 19 <= d && 21 >= d) {
                        b |= 1;
                    }
                    if (19 <= c && 26 >= c && 18 <= d && 20 >= d) {
                        b |= 2;
                    }
                }
                if (3 == b) {
                    IncrementBadgeCount(7);
                }
            }
            if (0 != StageState.totalSpawnedCountByGroup[2]) {
                StageState.consecutiveConditionFrameCount++;
            }
        } else if (4 == GUIState.currentStage) {
        if (2 == PartyState.partyMemberCount && 0 == StageState.activeSpawnCountByGroup[1] && 0 != StageState.totalSpawnedCountByGroup[1]) {
            resetHeroPose(PartyState.partyMemberCount, 55, 40);
            PartyState.partyMemberCount++;
        }
        if (3 <= PartyState.partyMemberCount) {
            fillStageTilesRect(55, 39, 55, 40, 32);
            fillStageTilesRect(77, 38, 77, 41, 32);
        }
        if (2 == PartyState.partyMemberCount && 0 == StageState.totalSpawnedCountByGroup[0] && 54 <= g && 76 >= g && 38 <= h && 41 >= h)
            for (a = 0; 20 > a; a++) {
                spawnEnemy(RMath.randIntRange(56, 76), RMath.randIntRange(33, 38), 5, 0);
                StageState.activeSpawnCountByGroup[0]++;
                StageState.totalSpawnedCountByGroup[0]++;
            }
        if ((3 <= PartyState.partyMemberCount || 0 == StageState.activeSpawnCountByGroup[0] && 0 != StageState.totalSpawnedCountByGroup[0]) && 0 == StageState.totalSpawnedCountByGroup[1]) {
            spawnEnemy(65, 35, 16, 1);
            StageState.activeSpawnCountByGroup[1] = 1;
            StageState.totalSpawnedCountByGroup[1] = 1;
        }
        if (isBadgeIncompleteForCurrentStage(11)) {
            if (0 == StageState.activeSpawnCountByGroup[6] && 20 == StageState.totalSpawnedCountByGroup[6] && !StageState.stageConditionMask) {
                IncrementBadgeCount(11);
            }
        }
        if (isBadgeIncompleteForCurrentStage(12)) {
            if (0 == StageState.activeSpawnCountByGroup[4] && 3 == StageState.totalSpawnedCountByGroup[4] && 8 == StageState.activeSpawnCountByGroup[3]) {
                IncrementBadgeCount(12);
            }
        }
        if (isBadgeIncompleteForCurrentStage(13)) {
            if (0 == StageState.activeSpawnCountByGroup[1] && 1 == StageState.totalSpawnedCountByGroup[1] && 0 == StageState.stage_partyDamageTaken) {
                IncrementBadgeCount(13);
            }
        }
        if (isBadgeIncompleteForCurrentStage(14)) {
            if (9 == StageState.lastClearedStageIdx) {
                IncrementBadgeCount(14);
            }
        }
    } else if (5 == GUIState.currentStage) {
        if (3 == PartyState.partyMemberCount && 0 == StageState.activeSpawnCountByGroup[0] && 0 == StageState.activeSpawnCountByGroup[1] && (resetHeroPose(PartyState.partyMemberCount, 17, 5), PartyState.partyMemberCount++), 4 == PartyState.partyMemberCount && (fillStageTilesRect(17, 4, 17, 5, 64), fillStageTilesRect(77, 20, 77, 24, 64)), !isBadgeIncompleteForCurrentStage(16) || 0 != StageState.activeSpawnCountByGroup[0] || 0 != StageState.activeSpawnCountByGroup[1] || StageState.stageConditionMask & 2 || IncrementBadgeCount(16),
            !isBadgeIncompleteForCurrentStage(17) || 0 != StageState.activeSpawnCountByGroup[0] || 0 != StageState.activeSpawnCountByGroup[1] || StageState.stageConditionMask & 1 || IncrementBadgeCount(17), isBadgeIncompleteForCurrentStage(19)) {
            for (a = b = 0; a < PartyState.partyMemberCount; a++) {
                c = RMath.clamp(HeroesState.heroJointPositionsByHero[a][2].x, 0, 8 * StageState.stageWidth - 1) >> 3;
                d = RMath.clamp(HeroesState.heroJointPositionsByHero[a][2].y, 0, 8 * StageState.stageHeight - 1) >> 3;
                if (56 <= c && 59 >= c && 39 <= d && 41 >= d) {
                    b++;
                }
            }
            if (4 == b) {
                IncrementBadgeCount(19);
            }
        }
    } else if (6 == GUIState.currentStage) {
        if (12 == GUIState.gameScreenState && 38 <= g && 41 >= g && 24 <= h && 24 >= h) {
            StageState.lastStageIdx = 1;
            StageState.partySpawnXByHero[0] = 18;
            StageState.partySpawnYByHero[0] = 24;
            StageState.partySpawnXByHero[1] = 20;
            StageState.partySpawnYByHero[1] = 24;
            StageState.partySpawnXByHero[2] = 29;
            StageState.partySpawnYByHero[2] = 24;
            StageState.partySpawnXByHero[3] = 31;
            StageState.partySpawnYByHero[3] = 24;
        }
    } else if (7 == GUIState.currentStage) {
        if (0 == StageState.totalSpawnedCountByGroup[1] && 73 <= g && 76 >= g && 34 <= h && 39 >= h)
            if (c = 0, 39 == StageState.stageTileData[34][75] && c++, 39 == StageState.stageTileData[35][72] && c++, 39 == StageState.stageTileData[35][74] && c++, 39 == StageState.stageTileData[36][75] && c++, 39 == StageState.stageTileData[38][76] && c++, 1 == c || 2 == c) {
                spawnEnemy(66, 42, 24, 1);
                StageState.activeSpawnCountByGroup[1]++;
                StageState.totalSpawnedCountByGroup[1]++;
            } else {
                for (5 == c ? c = 12 : 4 == c ? c = 13 : 3 == c ? c = 14 : c || (c = 20), a = 0; 15 > a; a++) {
                    spawnEnemy(RMath.randIntRange(56, 69), RMath.randIntRange(42, 43), c, 1);
                    StageState.activeSpawnCountByGroup[1]++;
                    StageState.totalSpawnedCountByGroup[1]++;
                }
            }
        c = 43;
        d = 30;
        if (1 == StageState.stageEventFlagArray[2]) {
            fillStageTilesRect(c, d, c, d, 63);
        } else if (32 == StageState.stageTileData[d][c]) {
            if (0 == StageState.activeSpawnCountByGroup[2]) {
                fillStageTilesRect(c, d, c, d, 55);
            }
        } else if (55 == StageState.stageTileData[d][c] && c - 1 <= b && b <= c + 1 && d - 1 <= f && f <= d + 1) {
            fillStageTilesRect(c, d, c, d, 63);
            spawnDrop(8 * c + 4, 8 * d + 4, 3, 2, 0);
        }
        if (1 == StageState.totalSpawnedCountByGroup[9] && 40 <= k && 72 >= p && 23 <= t && 30 >= l)
            for (a = 0; 15 > a; a++) {
                spawnEnemy(RMath.randIntRange(61, 76), 21, 28, 9);
                StageState.activeSpawnCountByGroup[9]++;
                StageState.totalSpawnedCountByGroup[9]++;
            }
        if (isBadgeIncompleteForCurrentStage(21)) {
            if (0 == StageState.activeSpawnCountByGroup[2] && 0 == StageState.stage_partyDamageTaken) {
                IncrementBadgeCount(21);
            }
        }
        if (isBadgeIncompleteForCurrentStage(23)) {
            for (a = b = 0; a < PartyState.partyMemberCount; a++)
                if (0 < HeroesState.heroSkipTimer[a]) {
                    b++;
                } if (4 == b) {
                IncrementBadgeCount(23);
            }
        }
    } else if (8 == GUIState.currentStage) {
        if (30 > StageState.totalSpawnedCountByGroup[3] && 2 <= g && 20 >= g && 20 <= h && 27 >= h && 4 > RMath.randFloat(60)) {
            a = [5, 18, 3, 20];
            g = [18, 16, 21, 22];
            b = RMath.randInt(4);
            spawnEnemy(a[b], g[b], 32, 3);
            StageState.activeSpawnCountByGroup[3]++;
            StageState.totalSpawnedCountByGroup[3]++;
        }
        if (isBadgeIncompleteForCurrentStage(27)) {
            for (a = 0; a < PartyState.partyMemberCount; a++) {
                c = RMath.clamp(HeroesState.heroJointPositionsByHero[a][2].x, 0, 8 * StageState.stageWidth - 1) >> 3;
                d = RMath.clamp(HeroesState.heroJointPositionsByHero[a][2].y, 0, 8 * StageState.stageHeight - 1) >> 3;
                if (2 <= c && 15 >= c && 29 <= d && 36 >= d) {
                    StageState.stageConditionMask = 1;
                }
            }
            0 != StageState.activeSpawnCountByGroup[4] || StageState.stageConditionMask || IncrementBadgeCount(27);
        }
        if (isBadgeIncompleteForCurrentStage(28)) {
            for (a = 0; a < PartyState.partyMemberCount && 0 == HeroesState.heroTileContactFlags[a]; a++);
            if (a == PartyState.partyMemberCount) {
                StageState.consecutiveConditionFrameCount++;
            } else {
                StageState.consecutiveConditionFrameCount = 0;
            }
            if (300 <= StageState.consecutiveConditionFrameCount) {
                IncrementBadgeCount(28);
            }
        }
    } else if (9 == GUIState.currentStage) {
        b = -1;
        for (a = 0; a < EnemyState.enemyCount; a++)
            if (36 == EnemyState.enemyTypeArray[a] && 0 != EnemyState.enemyHealthArray[a]) {
                b = a;
            }
        if (-1 != b && 10 < EnemyState.enemyPoseTrailWriteIdxArray[b] && 500 > EnemyState.enemyHealthArray[b])
            for (EnemyState.enemyHealthArray[b] += 1500, EnemyState.enemyPoseTrailWriteIdxArray[b]--, c = 2 * (19 - EnemyState.enemyPoseTrailWriteIdxArray[b] + 1), a = 0; a < c; a++) {
                spawnEnemy(RMath.randIntRange(25, 57), RMath.randIntRange(25, 39), 35, 1);
                StageState.activeSpawnCountByGroup[1]++;
                StageState.totalSpawnedCountByGroup[1]++;
            }
        if (isBadgeIncompleteForCurrentStage(31)) {
            if (0 == StageState.activeSpawnCountByGroup[3] && 2 == StageState.totalSpawnedCountByGroup[1]) {
                IncrementBadgeCount(31);
            }
        }
        if (isBadgeIncompleteForCurrentStage(32)) {
            if (100 <= EnemyState.enemyCount) {
                IncrementBadgeCount(32);
            }
        }
        if (isBadgeIncompleteForCurrentStage(33)) {
            for (a =
                b = 0; a < PartyState.partyMemberCount; a++) {
                c = RMath.clamp(HeroesState.heroJointPositionsByHero[a][2].x, 0, 8 * StageState.stageWidth - 1) >> 3;
                d = RMath.clamp(HeroesState.heroJointPositionsByHero[a][2].y, 0, 8 * StageState.stageHeight - 1) >> 3;
                if (26 == StageState.stageTileData[d][c]) {
                    b++;
                }
            }
            if (4 == b) {
                IncrementBadgeCount(33);
            }
        }
        if (isBadgeIncompleteForCurrentStage(34)) {
            if (10 == StageState.lastStageIdx && 1 >= g && 41 <= h) {
                IncrementBadgeCount(34);
            }
        }
    } else if (10 == GUIState.currentStage) {
        if (25 >= StageState.totalSpawnedCountByGroup[0] && 4 <= g && 21 >= g && 34 <= h && 40 >= h)
            for (a = 0; 15 > a; a++) {
                spawnEnemy(RMath.randIntRange(32, 53), RMath.randIntRange(33, 34), 37, 0);
                StageState.activeSpawnCountByGroup[0]++;
                StageState.totalSpawnedCountByGroup[0]++;
            }
        if (40 > StageState.totalSpawnedCountByGroup[4] && 8 <= g && 38 >= g && 0 <= h && 7 >= h && 10 > RMath.randFloat(60)) {
            a = [24, 25, 29, 30];
            g = [4, 4, 3, 3];
            b = RMath.randInt(4);
            spawnEnemy(a[b], g[b], 41, 4);
            StageState.activeSpawnCountByGroup[4]++;
            StageState.totalSpawnedCountByGroup[4]++;
        }
        if (isBadgeIncompleteForCurrentStage(37)) {
            if (0 == StageState.activeSpawnCountByGroup[1] && StageState.activeSpawnCountByGroup[0] == StageState.totalSpawnedCountByGroup[0]) {
                IncrementBadgeCount(37);
            }
        }
        if (isBadgeIncompleteForCurrentStage(38)) {
            if (0 == StageState.activeSpawnCountByGroup[3] && 0 == StageState.stage_partyDamageTaken) {
                IncrementBadgeCount(38);
            }
        }
        if (isBadgeIncompleteForCurrentStage(39)) {
            for (a = b = 0; a < PartyState.partyMemberCount; a++)
                if (0 < HeroesState.heroTimedDamageTimer[a]) {
                    b++;
                } if (4 == b) {
                IncrementBadgeCount(39);
            }
        }
    } else if (11 == GUIState.currentStage) {
        if (isBadgeIncompleteForCurrentStage(41)) {
            if (0 == StageState.activeSpawnCountByGroup[3] && !StageState.stageConditionMask) {
                IncrementBadgeCount(41);
            }
        }
        if (isBadgeIncompleteForCurrentStage(42)) {
            if (0 == StageState.activeSpawnCountByGroup[4] && 0 == StageState.stage_partyDamageTaken) {
                IncrementBadgeCount(42);
            }
        }
    } else if (13 == GUIState.currentStage) {
        if (1 == StageState.stageEventFlagArray[0]) {
            fillStageTilesRect(77, 20, 77, 24, 31);
        }
        if (isBadgeIncompleteForCurrentStage(46)) {
            if (0 == StageState.activeSpawnCountByGroup[1] && 45 == StageState.totalSpawnedCountByGroup[1] && 0 == StageState.activeSpawnCountByGroup[6] && 45 == StageState.totalSpawnedCountByGroup[6]) {
                IncrementBadgeCount(46);
            }
        }
        if (isBadgeIncompleteForCurrentStage(48)) {
            if (0 == StageState.activeSpawnCountByGroup[5] && 0 == StageState.stage_partyDamageTaken) {
                IncrementBadgeCount(48);
            }
        }
    } else if (14 == GUIState.currentStage) {
        if (isBadgeIncompleteForCurrentStage(53)) {
            for (a = 0; a < PartyState.partyMemberCount && 2 == HeroesState.heroTileContactFlags[a]; a++);
            if (a == PartyState.partyMemberCount) {
                StageState.consecutiveConditionFrameCount++;
            } else {
                StageState.consecutiveConditionFrameCount = 0;
            }
            if (1800 <= StageState.consecutiveConditionFrameCount) {
                IncrementBadgeCount(53);
            }
        }
        if (isBadgeIncompleteForCurrentStage(54)) {
            if (39 == StageState.stageTileData[12][44] && 39 == StageState.stageTileData[12][45] && 39 == StageState.stageTileData[13][43] && 39 != StageState.stageTileData[13][44] && 39 != StageState.stageTileData[13][45] && 39 == StageState.stageTileData[13][46] && 39 == StageState.stageTileData[14][43] && 39 != StageState.stageTileData[14][44] && 39 != StageState.stageTileData[14][45] && 39 == StageState.stageTileData[14][46] && 39 != StageState.stageTileData[15][43] && 39 == StageState.stageTileData[15][44] && 39 == StageState.stageTileData[15][45]) {
                IncrementBadgeCount(54);
            }
        }
    } else if (15 == GUIState.currentStage) {
        if (60 > StageState.totalSpawnedCountByGroup[1] && 42 <= g && 67 >= g &&
            18 <= h && 24 >= h && 4 > RMath.randFloat(60)) {
            a = [44, 45, 46, 66];
            g = [24, 24, 24, 24];
            b = RMath.randInt(4);
            spawnEnemy(a[b], g[b], 60, 1);
            StageState.activeSpawnCountByGroup[1]++;
            StageState.totalSpawnedCountByGroup[1]++;
        }
        if (0 == StageState.activeSpawnCountByGroup[5] && StageState.totalSpawnedCountByGroup[6] < 150 - (StageState.totalSpawnedCountByGroup[0] - StageState.activeSpawnCountByGroup[0])) {
            c = RMath.randIntRange(15, 65);
            d = RMath.randIntRange(1, 18);
            if (25 < StageState.stageTileData[d][c]) {
                spawnEnemy(c, d, 59, 6);
                StageState.activeSpawnCountByGroup[6]++;
                StageState.totalSpawnedCountByGroup[6]++;
            }
        }
        if (isBadgeIncompleteForCurrentStage(57)) {
            if (0 == StageState.activeSpawnCountByGroup[3] && 0 == StageState.stage_partyDamageTaken) {
                IncrementBadgeCount(57);
            }
        }
        if (isBadgeIncompleteForCurrentStage(59)) {
            if (198 <= StageState.activeSpawnCountByGroup[0] + StageState.activeSpawnCountByGroup[6]) {
                IncrementBadgeCount(59);
            }
        }
    } else if (16 == GUIState.currentStage) {
        f = StageState.activeSpawnCountByGroup[0] + StageState.activeSpawnCountByGroup[1];
        k = StageState.activeSpawnCountByGroup[2] + StageState.activeSpawnCountByGroup[3];
        p = StageState.activeSpawnCountByGroup[4] + StageState.activeSpawnCountByGroup[5] + StageState.activeSpawnCountByGroup[6] + StageState.activeSpawnCountByGroup[7];
        b = 0;
        if (0 == f && 0 < k && 0 < p) {
            b = 65;
        }
        if (0 == k && 0 < f && 0 < p) {
            b = 66;
        }
        if (0 == p && 0 < f && 0 < k) {
            b = 67;
        }
        if (0 < b && 100 > StageState.totalSpawnedCountByGroup[11]) {
            c = RMath.randIntRange(4, 59);
            d = RMath.randIntRange(30, 33);
            if (25 < StageState.stageTileData[d][c]) {
                spawnEnemy(c, d, b, 11);
                StageState.activeSpawnCountByGroup[11]++;
                StageState.totalSpawnedCountByGroup[11]++;
            }
        }
        if (60 > StageState.totalSpawnedCountByGroup[12] && 70 <= g && 76 >= g &&
            34 <= h && 41 >= h) {
            c = RMath.randIntRange(5, 70);
            d = RMath.randIntRange(42, 43);
            if (25 < StageState.stageTileData[d][c]) {
                spawnEnemy(c, d, 68, 12);
                StageState.activeSpawnCountByGroup[12]++;
                StageState.totalSpawnedCountByGroup[12]++;
            }
        }
        b = -1;
        for (a = 0; a < EnemyState.enemyCount; a++)
            if (70 == EnemyState.enemyTypeArray[a] && 0 != EnemyState.enemyHealthArray[a]) {
                b = a;
            }
        if (-1 != b && 10 < EnemyState.enemyPoseTrailWriteIdxArray[b] && EnemyState.enemyHealthArray[b] < 1E4 * (EnemyState.enemyPoseTrailWriteIdxArray[b] - 10) - 5E3)
            for (EnemyState.enemyPoseTrailWriteIdxArray[b]--, t = RMath.min(256, 1 << 20 - EnemyState.enemyPoseTrailWriteIdxArray[b]), a = 0; a < t; a++) {
                g = EnemyState.enemyJointPosArray[b][EnemyState.enemyPoseTrailWriteIdxArray[b]].x;
                h = EnemyState.enemyJointPosArray[b][EnemyState.enemyPoseTrailWriteIdxArray[b]].y;
                c = .5 * RMath.rotationLUT[512 * a / t][0];
                d = .5 * -RMath.rotationLUT[512 * a / t][1];
                spawnProjectile(-1, -1, g, h, c, d, 0, 26, 4294910481, 1, 16, 16, 0, 8, 8, 0, 200, 300, 10, 0, 0, 100, 0, 3, 0, 0, 0, 33, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            }
        if (0 == StageState.stageEventFlagArray[0] && 0 == StageState.activeSpawnCountByGroup[10]) {
            StageState.stageEventFlagArray[0] = 1;
        }
        if (1 == StageState.stageEventFlagArray[0]) {
            fillStageTilesRect(2, 20, 2, 24, 31);
        }
        if (isBadgeIncompleteForCurrentStage(61)) {
            if (0 == StageState.activeSpawnCountByGroup[10] && !StageState.stageFlagUseCount) {
                IncrementBadgeCount(61);
            }
        }
        !isBadgeIncompleteForCurrentStage(62) || 0 != StageState.activeSpawnCountByGroup[10] || StageState.stageConditionMask & 1 || IncrementBadgeCount(62);
        if (isBadgeIncompleteForCurrentStage(63)) {
            for (a = 0; a < PartyState.partyMemberCount; a++) {
                c = RMath.clamp(HeroesState.heroJointPositionsByHero[a][2].x, 0, 8 * StageState.stageWidth - 1) >> 3;
                d = RMath.clamp(HeroesState.heroJointPositionsByHero[a][2].y, 0, 8 * StageState.stageHeight - 1) >> 3;
                if (58 <= c && 76 >= c && 36 <= d && 42 >= d) {
                    StageState.stageEncounterCounter = 1;
                }
            }
            0 != StageState.activeSpawnCountByGroup[9] || StageState.stageEncounterCounter || IncrementBadgeCount(63);
        }
        if (isBadgeIncompleteForCurrentStage(64)) {
            if (0 == p && 0 < f && 0 < k && 100 == StageState.activeSpawnCountByGroup[11]) {
                IncrementBadgeCount(64);
            }
        }
    } else if (17 == GUIState.currentStage) {
        for (a = 0; a < PartyState.partyMemberCount; a++) {
            if (0 < HeroesState.heroTimedDamageTimer[a]) {
                StageState.stageConditionMask = 1;
            } 
            if (isBadgeIncompleteForCurrentStage(66)) {
                if (0 == StageState.activeSpawnCountByGroup[0] && !StageState.stageConditionMask) {
                    IncrementBadgeCount(66);
                }
            }
        }
        if (isBadgeIncompleteForCurrentStage(68)) {
            if (0 == StageState.activeSpawnCountByGroup[6] && 5 == StageState.activeSpawnCountByGroup[5]) {
                IncrementBadgeCount(68);
            }
        }
    } else if (18 == GUIState.currentStage) {
        if (6 > StageState.totalSpawnedCountByGroup[9] && 68 <= g && 70 >= g && 33 <= h && 40 >= h) {
            a = [29, 44, 59];
            b = RMath.randInt(3);
            spawnEnemy(a[b], 42, 83, 9);
            StageState.activeSpawnCountByGroup[9]++;
            StageState.totalSpawnedCountByGroup[9]++;
        }
        if (9 > StageState.totalSpawnedCountByGroup[10] && 3 <= g && 4 >= g && 5 <= h && 9 >= h && 10 > RMath.randFloat(60)) {
            c = RMath.randIntRange(8, 23);
            spawnEnemy(c, 10, 83, 10);
            StageState.activeSpawnCountByGroup[10]++;
            StageState.totalSpawnedCountByGroup[10]++;
        }!isBadgeIncompleteForCurrentStage(71) || 0 != StageState.activeSpawnCountByGroup[7] || 0 != StageState.activeSpawnCountByGroup[8] || StageState.stageConditionMask & 2 || IncrementBadgeCount(71);
        !isBadgeIncompleteForCurrentStage(72) || 0 != StageState.activeSpawnCountByGroup[7] || 0 != StageState.activeSpawnCountByGroup[8] || StageState.stageConditionMask & 1 || IncrementBadgeCount(72);
    } else if (19 == GUIState.currentStage) {
        if (StageState.totalSpawnedCountByGroup[7] < 20 * (35 - StageState.activeSpawnCountByGroup[6]) && 15 > RMath.randFloat(60)) {
            c = RMath.randIntRange(19, 59);
            d = RMath.randIntRange(26, 33);
            if (33 == StageState.stageTileData[d][c]) {
                if (19 == StageState.totalSpawnedCountByGroup[7] % 20) {
                    spawnEnemy(c, d, 89, 7);
                } else {
                    spawnEnemy(c, d, 84, 7);
                }
                StageState.activeSpawnCountByGroup[7]++;
                StageState.totalSpawnedCountByGroup[7]++;
            }
        }
        if (1 > StageState.totalSpawnedCountByGroup[4] && 5 <= g && 12 >= g && 24 <= h && 26 >= h) {
            spawnEnemy(8, 26, 86, 4);
            StageState.activeSpawnCountByGroup[4]++;
            StageState.totalSpawnedCountByGroup[4]++;
        }
        if (1 == StageState.stageEventFlagArray[1]) {
            fillStageTilesRect(47, 15, 50, 15, 24);
            fillStageTilesRect(1, 31, 1, 35, 32);
        }
    } else if (20 == GUIState.currentStage) {
        if (1 == StageState.stageEventFlagArray[4]) {
            fillStageTilesRect(70, 34, 70, 34, 63);
        } else if (55 == StageState.stageTileData[34][70] && 69 <= b && 71 >= b && 33 <= f && 35 >= f) {
            fillStageTilesRect(70, 34, 70, 34, 63);
            spawnDrop(564, 276, 3, 4, 0);
        }
    }
}



export function clearEnemies() {
    EnemyState.stageMaxEnemyLevel = EnemyState.enemyCount = 0
}


/** spawns an enemy at coordinates (8 * gridX, 8 * gridY) */
export function spawnEnemy(gridX, gridY, enemyType, d) {
    if (999 != EnemyState.enemyCount) {
        gridX *= 8;
        gridY *= 8;
        for (var f = 0; 21 > f; f++)
            RMath.Vec2Set(EnemyState.enemyJointPosArray[EnemyState.enemyCount][f], gridX + RMath.randFloat(1), gridY + RMath.randFloat(1)),
                EnemyState.enemyPrevJointPosArray[EnemyState.enemyCount][f].set(EnemyState.enemyJointPosArray[EnemyState.enemyCount][f]);

        EnemyState.enemyTypeArray[EnemyState.enemyCount] = enemyType;
        EnemyState.enemyUpdateFuncIdxArray[EnemyState.enemyCount] = enemyCatalog[enemyType][EnemyProps.BehaviorIdx];
        EnemyState.enemyPoseTrailWriteIdxArray[EnemyState.enemyCount] = 0;
        EnemyState.enemyDeathTimerArray[EnemyState.enemyCount] = 0;
        EnemyState.enemyTileContactFlagsArray[EnemyState.enemyCount] = 0;
        EnemyState.enemySpawnGroupIdxArray[EnemyState.enemyCount] = d;
        EnemyState.enemyHealthArray[EnemyState.enemyCount] = enemyCatalog[enemyType][EnemyProps.Health];
        EnemyState.enemyAuxStateArray[EnemyState.enemyCount] = 0;
        EnemyState.enemyActionCooldownTimerArray[EnemyState.enemyCount] = enemyCatalog[enemyType][EnemyProps.PArg22];
        EnemyState.enemySkipDurationLeftArray[EnemyState.enemyCount] = 0;
        EnemyState.enemyUpdateSkipProbArray[EnemyState.enemyCount] = 0;
        EnemyState.enemyDmgDurationLeftArray[EnemyState.enemyCount] = 0;
        EnemyState.enemyDmgPerFrameArray[EnemyState.enemyCount] = 0;
        EnemyState.enemyFreezeTimerArray[EnemyState.enemyCount] = 0;
        EnemyState.enemyCount++
    }
}


// swaps the last enemy entry with the selected one
// and decrements the enemyCount variable to invalidate it
export function deleteEnemy(enemyIdx) {
    for (var b = 0; 21 > b; b++)
        EnemyState.enemyJointPosArray[enemyIdx][b].set(EnemyState.enemyJointPosArray[EnemyState.enemyCount - 1][b]),
            EnemyState.enemyPrevJointPosArray[enemyIdx][b].set(EnemyState.enemyPrevJointPosArray[EnemyState.enemyCount - 1][b]);
    EnemyState.enemyTypeArray[enemyIdx] = EnemyState.enemyTypeArray[EnemyState.enemyCount - 1];
    EnemyState.enemyUpdateFuncIdxArray[enemyIdx] = EnemyState.enemyUpdateFuncIdxArray[EnemyState.enemyCount - 1];
    EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = EnemyState.enemyPoseTrailWriteIdxArray[EnemyState.enemyCount - 1];
    EnemyState.enemyDeathTimerArray[enemyIdx] = EnemyState.enemyDeathTimerArray[EnemyState.enemyCount - 1];
    EnemyState.enemyTileContactFlagsArray[enemyIdx] = EnemyState.enemyTileContactFlagsArray[EnemyState.enemyCount - 1];
    EnemyState.enemySpawnGroupIdxArray[enemyIdx] = EnemyState.enemySpawnGroupIdxArray[EnemyState.enemyCount - 1];
    EnemyState.enemyHealthArray[enemyIdx] = EnemyState.enemyHealthArray[EnemyState.enemyCount - 1];
    EnemyState.enemyAuxStateArray[enemyIdx] = EnemyState.enemyAuxStateArray[EnemyState.enemyCount - 1];
    EnemyState.enemyActionCooldownTimerArray[enemyIdx] = EnemyState.enemyActionCooldownTimerArray[EnemyState.enemyCount - 1];
    EnemyState.enemySkipDurationLeftArray[enemyIdx] = EnemyState.enemySkipDurationLeftArray[EnemyState.enemyCount - 1];
    EnemyState.enemyUpdateSkipProbArray[enemyIdx] = EnemyState.enemyUpdateSkipProbArray[EnemyState.enemyCount - 1];
    EnemyState.enemyDmgDurationLeftArray[enemyIdx] = EnemyState.enemyDmgDurationLeftArray[EnemyState.enemyCount - 1];
    EnemyState.enemyDmgPerFrameArray[enemyIdx] = EnemyState.enemyDmgPerFrameArray[EnemyState.enemyCount - 1];
    EnemyState.enemyFreezeTimerArray[enemyIdx] = EnemyState.enemyFreezeTimerArray[EnemyState.enemyCount - 1];
    EnemyState.enemyCount--
}


export function moveEnemyJointWithTileCollision(enemyIdx, jointIdx, bounceScale) { // $k
    let d = new RMath.Vec2();
    RMath.Vec2Sub(d, EnemyState.enemyJointPosArray[enemyIdx][jointIdx], EnemyState.enemyPrevJointPosArray[enemyIdx][jointIdx]);
    EnemyState.enemyJointPosArray[enemyIdx][jointIdx].set(EnemyState.enemyPrevJointPosArray[enemyIdx][jointIdx]);
    let f = (RMath.Vec2Mag(d) >> 2) + 1;
    RMath.Vec2Scale(d, 1 / f);
    for (let g, h, k = 0; k < f; k++) {
        g = EnemyState.enemyJointPosArray[enemyIdx][jointIdx].y + d.y;
        h = getStageTileAt(EnemyState.enemyJointPosArray[enemyIdx][jointIdx].x, g);
        if (0 > g || 8 * StageState.stageHeight <= g) {
            EnemyState.enemyTileContactFlagsArray[enemyIdx] |= 2;
        } else if (0 <= h && 25 >= h) {
            if (0 < d.y) {
                EnemyState.enemyTileContactFlagsArray[enemyIdx] |= 2;
            }
            d.x *= bounceScale;
            d.y = -d.y;
        } else if (26 <= h && 26 >= h && 0 < d.y) {
            EnemyState.enemyTileContactFlagsArray[enemyIdx] |= 2;
            d.x *= bounceScale;
            d.y = -d.y;
        } else {
            EnemyState.enemyJointPosArray[enemyIdx][jointIdx].y = g;
        }
        g = EnemyState.enemyJointPosArray[enemyIdx][jointIdx].x + d.x;
        h = getStageTileAt(g, EnemyState.enemyJointPosArray[enemyIdx][jointIdx].y);
        if (0 > g || 640 <= g) {
            EnemyState.enemyTileContactFlagsArray[enemyIdx] |= 1;
        } else if (0 <= h && 25 >= h) {
            d.y *= bounceScale;
            d.x = -d.x;
            EnemyState.enemyTileContactFlagsArray[enemyIdx] |= 1;
        } else if (27 <= h && 29 >= h) {
            d.y *= bounceScale;
            d.x = -d.x;
            EnemyState.enemyTileContactFlagsArray[enemyIdx] |= 1;
        } else {
            EnemyState.enemyJointPosArray[enemyIdx][jointIdx].x = g;
        }
    }
}


/**
 * finds the closest living enemy to a center point inside an axis-aligned rectangle that is not blocked by stage tiles (ray-stepped line-of-sight check). Returns the index of that enemy or -1 if none found.
 */
export function findEnemyInArea(cx, cy, rx, ry) { // Ei
    let f = cx - rx,
        g = cy - ry;
    rx = cx + rx;
    ry = cy + ry; 
    let t = new RMath.Vec2();
    let l = new RMath.Vec2();
    let n = 1E3;
    let w = -1;
    for (let _i = 0; _i < EnemyState.enemyCount; _i++)
        if (0 != EnemyState.enemyHealthArray[_i]) {
            let h = enemyHitboxHalfWidthByBehavior[enemyCatalog[EnemyState.enemyTypeArray[_i]][EnemyProps.BehaviorIdx]] * enemyCatalog[EnemyState.enemyTypeArray[_i]][EnemyProps.DrawScale];
            let k = enemyHitboxHalfHeightByBehavior[enemyCatalog[EnemyState.enemyTypeArray[_i]][EnemyProps.BehaviorIdx]] * enemyCatalog[EnemyState.enemyTypeArray[_i]][EnemyProps.DrawScale];
            if (EnemyState.enemyUpdateFuncIdxArray[_i] == BehaviorTypes.TreeLeft || EnemyState.enemyUpdateFuncIdxArray[_i] == BehaviorTypes.TreeRight)
                k = 3 * EnemyState.enemyPoseTrailWriteIdxArray[_i] + 5 * enemyCatalog[EnemyState.enemyTypeArray[_i]][EnemyProps.DrawScale];
            let p = EnemyState.enemyJointPosArray[_i][EnemyState.enemyTargetJointIdx];
            if (!(p.x - h > rx || p.x + h < f || p.y - k > ry || p.y + k < g)) {
                l.x = p.x - cx;
                l.y = p.y - cy;
                k = RMath.Vec2Mag(l);
                h = (k >> 3) + 1;
                RMath.Vec2Scale(l, 1 / h);
                RMath.Vec2Set(t, cx, cy);
                for (var M = 0; M <= h; M++) {
                    p = getStageTileAt(t.x, t.y);
                    if (0 <= p && 29 >= p) break;
                    t.add(l);
                }
                if (M > h && k < n) {
                    n = k;
                    w = _i;
                }
            }
        } return w;
}


// effects
/**
 * applyEffectToEnemies(applyFlag, shapeMode, maxTargets, effectType, effectDuration,
 *                     damageMin, damageMax, centerPos, directionVec, width, height)
 *
 * Params:
 * - applyFlag (int): 0 = actually apply damage/status; non-zero alters behaviour (keeps probing).
 * - shapeMode (int): 0 = axis-aligned box centered at `centerPos`; 1 = directional sweep using `directionVec`.
 * - maxTargets (int): maximum number of enemies to affect (decremented per hit).
 * - effectType (int): effect/damage mode:
 *     0 = normal damage (flat reduction by enemyAttr39),
 *     1 = percent-adjusted damage (uses enemyAttr40),
 *     2 = skip/stun (sets skip duration/probability using enemyAttr41),
 *     3 = percent-adjusted damage (uses enemyAttr42),
 *     4 = damage-per-frame / DoT (uses enemyAttr43),
 *     5 = freeze (uses enemyAttr44).
 * - effectDuration (int): duration value used for status effects (frames).
 * - damageMin (int): minimum damage (inclusive).
 * - damageMax (int): maximum damage (inclusive).
 * - centerPos (Vec2): effect origin / center position.
 * - directionVec (Vec2): normalized direction for `shapeMode == 1` (sweep vector).
 * - width (number): full effect width (function halves it internally).
 * - height (number): full effect height (function halves it internally).
 *
 * Notes:
 * - Performs per-enemy bounding checks, stepwise tile line-of-sight checks via `getStageTileAt`,
 *   and skips enemies blocked by tiles.
 * - Spawns damage popups, updates enemy health/status arrays, badge counters, and global damage totals.
 *
 * Returns:
 * - (int) index of the last enemy hit, or -1 if none were hit.
 */
export function applyEffectToEnemies(applyFlag, shapeMode, maxTargets, effectType, effectDuration, damageMin, damageMax, centerPos, directionVec, width, height) { // al
    let n = -1,
        w, B, M, J, y, x, K = new RMath.Vec2(),
        ba = new RMath.Vec2(),
        U, na;
    width *= .5;
    height *= .5;
    if (0 == shapeMode) {
        w = centerPos.x - width;
        B = centerPos.y - height;
        M = centerPos.x + width;
        J = centerPos.y + height;
    } else if (1 == shapeMode) {
        RMath.Vec2Norm(directionVec);
        RMath.Vec2Scale(directionVec, height);
        w = RMath.min(centerPos.x - directionVec.x, centerPos.x + directionVec.x);
        B = RMath.min(centerPos.y - directionVec.y, centerPos.y + directionVec.y);
        M = RMath.max(centerPos.x - directionVec.x, centerPos.x + directionVec.x);
        J = RMath.max(centerPos.y - directionVec.y, centerPos.y + directionVec.y);
    }
    

    for (height = 0; height < EnemyState.enemyCount; height++)
        if (0 != EnemyState.enemyHealthArray[height]) {
            x = EnemyState.enemyJointPosArray[height][EnemyState.enemyTargetJointIdx];
            y = enemyHitboxHalfWidthByBehavior[EnemyState.enemyUpdateFuncIdxArray[height]] * enemyCatalog[EnemyState.enemyTypeArray[height]][EnemyProps.DrawScale];
            width = enemyHitboxHalfHeightByBehavior[EnemyState.enemyUpdateFuncIdxArray[height]] * enemyCatalog[EnemyState.enemyTypeArray[height]][EnemyProps.DrawScale];
            if (EnemyState.enemyUpdateFuncIdxArray[height] == BehaviorTypes.TreeLeft || EnemyState.enemyUpdateFuncIdxArray[height] == BehaviorTypes.TreeRight)
                width = 3 * EnemyState.enemyPoseTrailWriteIdxArray[height] + 5 * enemyCatalog[EnemyState.enemyTypeArray[height]][EnemyProps.DrawScale];
            if (!(x.x - y > M || x.x + y < w || x.y - width > J || x.y + width < B)) {
                if (0 == shapeMode) {
                    ba.x = x.x - centerPos.x;
                    ba.y = x.y - centerPos.y;
                    U = RMath.Vec2Mag(ba);
                    U = (U >> 3) + 1;
                    RMath.Vec2Scale(ba, 1 / U);
                    K.set(centerPos);
                    for (var Fa = 0; Fa <= U; Fa++) {
                        na = getStageTileAt(K.x, K.y);
                        if (0 <= na && 29 >= na) break;
                        K.add(ba);
                    }
                    if (Fa <= U) continue;
                } else if (1 == shapeMode) {
                    ba.x = 2 * directionVec.x;
                    ba.y = 2 * directionVec.y;
                    U = RMath.Vec2Mag(ba);
                    U = (U >> 3) + 1;
                    RMath.Vec2Scale(ba, 1 / U);
                    RMath.Vec2Sub(K, centerPos, directionVec);
                    for (Fa = 0; Fa <= U; Fa++) {
                        na = getStageTileAt(K.x, K.y);
                        if (0 <= na && 29 >= na) break;
                        if (x.x - y < K.x && x.x + y > K.x && x.y - width < K.y && x.y + width > K.y) {
                            Fa = U + 2;
                            break;
                        }
                        K.add(ba);
                    }
                    if (Fa < U + 2) continue;
                }
                if (0 == applyFlag) {
                    n = damageMin + RMath.floor(RMath.randFloat(damageMax - damageMin + 1));
                    if (4 == effectType) {
                        EnemyState.enemyDmgPerFrameArray[height] = RMath.max(
                            EnemyState.enemyDmgPerFrameArray[height],
                            RMath.max(1, n - RMath.floor(n * enemyCatalog[EnemyState.enemyTypeArray[height]][EnemyProps.PoisonResistPct] / 100))
                        );
                        EnemyState.enemyDmgDurationLeftArray[height] = RMath.max(
                            EnemyState.enemyDmgDurationLeftArray[height],
                            effectDuration - RMath.floor(effectDuration * enemyCatalog[EnemyState.enemyTypeArray[height]][EnemyProps.PoisonResistPct] / 100)
                        );
                    } else {
                        if (0 == effectType) {
                            n = RMath.max(1, n - enemyCatalog[EnemyState.enemyTypeArray[height]][EnemyProps.PhysResistPct]);
                        } else if (1 == effectType) {
                            n = RMath.max(1, n - RMath.floor(n * enemyCatalog[EnemyState.enemyTypeArray[height]][EnemyProps.FireResistPct] / 100));
                        } else if (2 == effectType) {
                            n = RMath.max(1, n - RMath.floor(n * enemyCatalog[EnemyState.enemyTypeArray[height]][EnemyProps.IceResistPct] / 100));
                        } else {
                            3 == effectType && (n = RMath.max(1, n - RMath.floor(n * enemyCatalog[EnemyState.enemyTypeArray[height]][EnemyProps.LightResistPct] / 100)));
                        }
                        EnemyState.enemyHealthArray[height] = RMath.max(EnemyState.enemyHealthArray[height] - n, 0);
                        spawnPopup(EnemyState.enemyJointPosArray[height][EnemyState.enemyTargetJointIdx].x, EnemyState.enemyJointPosArray[height][EnemyState.enemyTargetJointIdx].y - width, 0 > ba.x ? -1 : 1, n, 60, 12632256);
                        StageState.stage_totalDamageDealt += n;
                    }
                    if (2 == effectType) {
                        EnemyState.enemySkipDurationLeftArray[height] = 120 - RMath.floor(120 * enemyCatalog[EnemyState.enemyTypeArray[height]][EnemyProps.IceResistPct] / 100);
                        EnemyState.enemyUpdateSkipProbArray[height] = effectDuration - RMath.floor(effectDuration * enemyCatalog[EnemyState.enemyTypeArray[height]][EnemyProps.IceResistPct] / 100);
                    } else {
                        5 == effectType && (EnemyState.enemyFreezeTimerArray[height] = effectDuration - RMath.floor(effectDuration * enemyCatalog[EnemyState.enemyTypeArray[height]][EnemyProps.FreezeResistPct] / 100));
                    }

                    EnemyState.enemyAuxStateArray[height] = 120;
                    30 != GUIState.gameScreenState && (GameplayState.comboWindowTimer = GameplayState.comboWindowMaxFrames);
                    isBadgeIncompleteForCurrentStage(11) && 17 == EnemyState.enemyTypeArray[height] && 0 != effectType && StageState.stageConditionMask++;
                    isBadgeIncompleteForCurrentStage(41) && 45 == EnemyState.enemyTypeArray[height] && 0 == effectType && StageState.stageConditionMask++;
                }

                n = height;
                maxTargets--;
                if (0 >= maxTargets) break;
            }
        } return n; // index of a hit enemy (last one hit), or -1 if none.
}


export function spawnEnemyLoot(enemyIdx, lootVariant, _px, _py) { // bl
    let itemPos = new RMath.Vec2(),
        itemIdx = EnemyState.enemyTypeArray[enemyIdx] + lootVariant,
        selectedItem = enemyCatalog[itemIdx];
    lootVariant = -enemyIdx - 1;
    let k = selectedItem[EnemyProps.ProjectileAttachMode];
    if (0 == k) {
        k = -1;
    } else if (1 == k) {
        k = 0;
    } else if (2 == k) {
        k = 1;
    }
    
    let _s0 = selectedItem[EnemyProps.ProjectileVisualPack] % 100,
        _s1 = RMath.floor(selectedItem[EnemyProps.ProjectileVisualPack] / 100),
        _p0 = selectedItem[EnemyProps.PArg0],
        _p1 = selectedItem[EnemyProps.PArg1],
        _p2 = selectedItem[EnemyProps.PArg2],
        _p3 = selectedItem[EnemyProps.PArg3],
        _p4 = selectedItem[EnemyProps.PArg4],
        _p5 = selectedItem[EnemyProps.PArg5],
        _p6 = selectedItem[EnemyProps.PArg6],
        _p7 = selectedItem[EnemyProps.PArg7],
        _p8 = selectedItem[EnemyProps.PArg8],
        _p9 = selectedItem[EnemyProps.PArg9],
        _p10 = selectedItem[EnemyProps.PArg10],
        _p11 = selectedItem[EnemyProps.PArg11],
        _p12 = selectedItem[EnemyProps.PArg12],
        _p13 = selectedItem[EnemyProps.PArg13],
        _p14 = selectedItem[EnemyProps.PArg14],
        _p15 = selectedItem[EnemyProps.PArg15],
        _p16 = selectedItem[EnemyProps.PArg16],
        _p17 = selectedItem[EnemyProps.PArg17],
        _p18 = selectedItem[EnemyProps.PArg18],
        _p19 = selectedItem[EnemyProps.PArg19],
        _p20 = selectedItem[EnemyProps.PArg20],
        _p21 = selectedItem[EnemyProps.PArg21],
        _p22 = selectedItem[EnemyProps.PArg22],
        _p23 = selectedItem[EnemyProps.PArg23],
        _p24 = selectedItem[EnemyProps.PArg24],
        _p25 = selectedItem[EnemyProps.PArg25],
        _p26 = selectedItem[EnemyProps.PArg26],
        _p27 = selectedItem[EnemyProps.PArg27],
        _p28 = selectedItem[EnemyProps.PArg28],
        _p29 = selectedItem[EnemyProps.PArg29],
        _p30 = selectedItem[EnemyProps.PArg30],
        _p31 = selectedItem[EnemyProps.PArg31],
        _p32 = selectedItem[EnemyProps.PArg32],
        _p33 = selectedItem[EnemyProps.PArg33],
        _p34 = selectedItem[EnemyProps.PArg34],
        _p35 = selectedItem[EnemyProps.PArg35],
        _p36 = selectedItem[EnemyProps.PArg36],
        _p37 = selectedItem[EnemyProps.PArg37],
        _p38 = selectedItem[EnemyProps.PArg38],
        _p39 = selectedItem[EnemyProps.PArg39],
        _p40 = selectedItem[EnemyProps.PArg40],
        _p41 = selectedItem[EnemyProps.PArg41],
        _p42 = selectedItem[EnemyProps.PArg42],
        _p43 = selectedItem[EnemyProps.PArg43],
        _p44 = selectedItem[EnemyProps.PArg44];

    let _foundHero = findNearestPartyMemberInRect(_px, _py, _p24, _p24, 0);
    if (_foundHero == -1)
        return;
    
    if (0 < EnemyState.enemyActionCooldownTimerArray[enemyIdx]) {
        EnemyState.enemyActionCooldownTimerArray[enemyIdx]--;
    } else if (!(RMath.randFloat(1E3) >= _p23)) {
        EnemyState.enemyActionCooldownTimerArray[enemyIdx] = _p22;
        let pVelY;
        if (0 == _s0) {
            spawnProjectile(
                lootVariant, k, 0, 0, 0, 0, _p0, _p1, _p2, _p3, _p4, _p5, 0, _p6, _p7, _p8, _p9, _p10, _p11, 0, _p12, 
                _p13, _p14, _p15, _p16, 0, _p17, _p18, _p19, _p25, _p26, 0, _p27, 0, _p28, _p29, _p30, _p31, 
                _p32, _p33, 0, _p34, _p35, 0, 0, _p36, _p37, 0, _p38, _p39, _p40, _p41, _p42, _p43, _p44
            );
        } else if (1 == _s0) {
            spawnProjectile(
                lootVariant, k, _px, _py, 0, 0, _p0, _p1, _p2, _p3, _p4, _p5, 0, _p6, _p7, _p8, _p9, _p10, _p11, 0, _p12, 
                _p13, _p14, _p15, _p16, 0, _p17, _p18, _p19, _p25, _p26, 0, _p27, 0, _p28, _p29, _p30, _p31,
                 _p32, _p33, 0, _p34, _p35, 0, 0, _p36, _p37, 0, _p38, _p39, _p40, _p41, _p42, _p43, _p44
            );
        } else if (2 == _s0) {
            _p22 = _px;
            _p23 = _py;
            _p24 = _p22 < HeroesState.heroJointPositionsByHero[_foundHero][2].x ? .1 * _p21 : -.1 * _p21;
            for (_s0 = 0; _s0 < _p20; _s0++) {
                spawnProjectile(
                    lootVariant, k, _p22, _p23, _p24, 0, _p0, _p1, _p2, _p3, _p4, _p5, 0, _p6, _p7, _p8, _p9, _p10, _p11, 
                    0, _p12, _p13, _p14, _p15, _p16, 0, _p17, _p18, _p19, _p25, _p26, 0, _p27, 0, _p28, _p29, _p30, 
                    _p31, _p32, _p33, 0, _p34, _p35, 0, 0, _p36, _p37, 0, _p38, _p39, _p40, _p41, _p42, _p43, _p44
                );
            }
        } else if (3 == _s0 || 6 == _s0) {
            if (3 == _s0) {
                RMath.Vec2Set(itemPos, HeroesState.heroJointPositionsByHero[_foundHero][2].x - EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].x, HeroesState.heroJointPositionsByHero[_foundHero][2].y - EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].y);
            } else if (6 == _s0) {
                RMath.Vec2Set(itemPos, 0, -1);
            }
            itemIdx = (0 < _s1) ? _s1 : 16;
            enemyIdx = RMath.floor(512 * RMath.Vec2Angle(itemPos) / RMath.TAU);
            enemyIdx -= RMath.floor((_p20 - 1) * itemIdx / 2);
            for (_s0 = 0; _s0 < _p20; _s0++) {
                itemPos.x = RMath.rotationLUT[enemyIdx & 511][0];
                itemPos.y = -RMath.rotationLUT[enemyIdx & 511][1];
                _p22 = _px + 10 * itemPos.x;
                _p23 = _py + 10 * itemPos.y;
                _p24 = itemPos.x * _p21 * .1;
                pVelY = itemPos.y * _p21 * .1;
                spawnProjectile(
                    lootVariant, k, _p22, _p23, _p24, pVelY, _p0, _p1, _p2, _p3, _p4, _p5, 0, _p6, _p7, _p8, _p9, _p10, _p11, 
                    0, _p12, _p13, _p14, _p15, _p16, 0, _p17, _p18, _p19, _p25, _p26, 0, _p27, 0, _p28, _p29, _p30, 
                    _p31, _p32, _p33, 0, _p34, _p35, 0, 0, _p36, _p37, 0, _p38, _p39, _p40, _p41, _p42, _p43, _p44
                );
                enemyIdx += itemIdx;
            } 
        } else if (4 == _s0) {
            for (_s0 = 0; _s0 < _p20; _s0++) {
                RMath.Vec2Set(itemPos, HeroesState.heroJointPositionsByHero[_foundHero][2].x - EnemyState.enemyJointPosArray[enemyIdx][0].x, HeroesState.heroJointPositionsByHero[_foundHero][2].y - EnemyState.enemyJointPosArray[enemyIdx][0].y);
                itemIdx = 0 < _s1 ? _s1 - 1 : _p20;
                if (0 < _p20) {
                    _p24 = RMath.floor(RMath.randFloat(512));
                    itemIdx = RMath.randFloat(10) * itemIdx;
                    itemPos.x += RMath.rotationLUT[_p24][0] * itemIdx;
                    itemPos.y += RMath.rotationLUT[_p24][1] * itemIdx;
                }
                _p22 = _px;
                _p23 = _py;
                _p24 = itemPos.x / _p21;
                pVelY = (itemPos.y - .5 * _p21 * _p21 * _p12 * .01) / _p21;
                spawnProjectile(
                    lootVariant, k, _p22, _p23, _p24, pVelY, _p0, _p1, _p2, _p3, _p4, _p5, 0, _p6, _p7, _p8, _p9, _p10, _p11, 
                    0, _p12, _p13, _p14, _p15, _p16, 0, _p17, _p18, _p19, _p25, _p26, 0, _p27, 0, _p28, _p29, _p30, 
                    _p31, _p32, _p33, 0, _p34, _p35, 0, 0, _p36, _p37, 0, _p38, _p39, _p40, _p41, _p42, _p43, _p44
                );
            } 
        } else if (5 == _s0) {
            for (_s0 = 0; _s0 < _p20; _s0++) {
                _p22 = _px + RMath.randFloatRange(-_p24, _p24);
                _p23 = _py + RMath.randFloatRange(-_p24, 0);
                spawnProjectile(
                    lootVariant, k, _p22, _p23, 0, 0, _p0, _p1, _p2, _p3, _p4, _p5, 0, _p6, _p7, _p8, _p9, _p10, _p11, 
                    0, _p12, _p13, _p14, _p15, _p16, 0, _p17, _p18, _p19, _p25, _p26, 0, _p27, 0, _p28, _p29, 
                    _p30, _p31, _p32, _p33, 0, _p34, _p35, 0, 0, _p36, _p37, 0, _p38, _p39, _p40, _p41, _p42, 
                    _p43, _p44
                );
            } 
        } else if (7 == _s0) {
            for (_s0 = 0; _s0 < _p20; _s0++) {
                _p22 = RMath.floor(_px / 8);
                _p23 = RMath.floor(_py / 8);
                spawnEnemy(_p22, _p23, itemIdx + _p18, 0);
            }
        }
    }
    
}


export function onEnemyDeath(_enemyIdx) { // cl
    let lvlDiff = RMath.abs(enemyCatalog[EnemyState.enemyTypeArray[_enemyIdx]][EnemyProps.Level] - PartyState.partyLevel);
    let expRewardValue = RMath.floor(enemyCatalog[EnemyState.enemyTypeArray[_enemyIdx]][EnemyProps.ExpReward] * (100 + PartyState.partyEnemyHpBonusPercent) / 100);
    if (EnemyState.stageMaxEnemyLevel + 10 <= PartyState.partyLevel) {
        expRewardValue = 0;
    } else if (10 > lvlDiff) {
        expRewardValue = RMath.floor(expRewardValue * (10 - lvlDiff) / 10);
    } else {
        expRewardValue = 1;
    }

    PartyState.partyEXPAccum = RMath.clamp(PartyState.partyEXPAccum + expRewardValue, 0, 9999999);
    if (GUIState.LevelExpThresholds[PartyState.partyLevel] <= PartyState.partyEXPAccum && 99 > PartyState.partyLevel) {
        PartyState.partyLevel++;
        for (let _i = 0; 4 > _i; _i++) PartyState.partySP[_i] += 2;
        GameplayState.levelUpPopupTimer = 60;
    }
    for (let _dropIdx = EnemyProps.DropTableStartIdx; _dropIdx < EnemyProps.DropTableStartIdx + 8; _dropIdx += 2) {
        let itemIdx = enemyCatalog[EnemyState.enemyTypeArray[_enemyIdx]][_dropIdx];
        if (0 != itemIdx) {
            let randComp = RMath.floor(100 * (100 + PartyState.partyDropChanceBonusPercent) / 100);
            if (2 == itemIdx) {
                itemIdx = RMath.floor(enemyCatalog[EnemyState.enemyTypeArray[_enemyIdx]][_dropIdx + 1] * (100 + PartyState.partyRewardValueBonusPercent) / 100);
                spawnDrop(EnemyState.enemyJointPosArray[_enemyIdx][0].x, EnemyState.enemyJointPosArray[_enemyIdx][0].y, 2, itemIdx, 0);
            } else if (RMath.rand() * enemyCatalog[EnemyState.enemyTypeArray[_enemyIdx]][_dropIdx + 1] * 100 < randComp) {
                if (1 > PartyState.itemForgeLvls[itemIdx] && isDropTypeAbsent(itemIdx)) {
                    spawnDrop(EnemyState.enemyJointPosArray[_enemyIdx][0].x, EnemyState.enemyJointPosArray[_enemyIdx][0].y, itemIdx, 1, 0);    
                }
            }
        }
    }
    let val = RMath.floor(enemyCatalog[EnemyState.enemyTypeArray[_enemyIdx]][EnemyProps.GoldReward] * (100 + PartyState.partyRewardValueBonusPercent) / 100);
    if (1 > 3 * RMath.rand()) {
        spawnDrop(EnemyState.enemyJointPosArray[_enemyIdx][0].x, EnemyState.enemyJointPosArray[_enemyIdx][0].y, 2, val, 0);
    }
    if (30 != GUIState.gameScreenState) {
        GameplayState.comboCount++;
    }
    if (isBadgeIncompleteForCurrentStage(2) && 3 == EnemyState.enemyTypeArray[_enemyIdx]) {
        IncrementBadgeCount(2);
    }
    if (isBadgeIncompleteForCurrentStage(5) && 4 == EnemyState.enemyTypeArray[_enemyIdx]) {
        IncrementBadgeCount(5);
    }
    if (3 == GUIState.currentStage) {
        if (8 == EnemyState.enemyTypeArray[_enemyIdx]) {
            if (isBadgeIncompleteForCurrentStage(8) && 1800 > StageState.gameFrameCounter) {
                IncrementBadgeCount(8);
            }
            spawnPopup(EnemyState.enemyJointPosArray[_enemyIdx][0].x, EnemyState.enemyJointPosArray[_enemyIdx][0].y, 0, RMath.floor(StageState.gameFrameCounter / 60) + "SEC", 120, 10066431);
        }

        if (15 == EnemyState.enemyTypeArray[_enemyIdx]) {
            StageState.stageEncounterCounter++;
            if (3 == StageState.stageEncounterCounter) {
                if (isBadgeIncompleteForCurrentStage(9) && 600 > StageState.consecutiveConditionFrameCount) {
                    IncrementBadgeCount(9);    
                }
                spawnPopup(EnemyState.enemyJointPosArray[_enemyIdx][0].x, EnemyState.enemyJointPosArray[_enemyIdx][0].y, 0, "" + RMath.floor(StageState.consecutiveConditionFrameCount / 60) + "SEC", 120, 10066431);
            }
        }
    }
    if (5 == GUIState.currentStage) {
        if (22 == EnemyState.enemyTypeArray[_enemyIdx]) {
            if (isBadgeIncompleteForCurrentStage(18) && 1200 > StageState.gameFrameCounter) {
                IncrementBadgeCount(18);
            }
            spawnPopup(EnemyState.enemyJointPosArray[_enemyIdx][0].x, EnemyState.enemyJointPosArray[_enemyIdx][0].y, 0, RMath.floor(StageState.gameFrameCounter / 60) + "SEC", 120, 10066431);
        }
    }
    if (isBadgeIncompleteForCurrentStage(22) && 28 == EnemyState.enemyTypeArray[_enemyIdx]) {
        IncrementBadgeCount(22);    
    }
    if (isBadgeIncompleteForCurrentStage(47) && !(50 != EnemyState.enemyTypeArray[_enemyIdx] && 52 != EnemyState.enemyTypeArray[_enemyIdx])) {
        IncrementBadgeCount(47);
    }
    if (51 == EnemyState.enemyTypeArray[_enemyIdx]) {
        if (isBadgeIncompleteForCurrentStage(49) && 1500 > StageState.gameFrameCounter) {
            IncrementBadgeCount(49);    
        }
        spawnPopup(EnemyState.enemyJointPosArray[_enemyIdx][0].x, EnemyState.enemyJointPosArray[_enemyIdx][0].y, 0, RMath.floor(StageState.gameFrameCounter / 60) + "SEC", 120, 10066431);
    }
    !isBadgeIncompleteForCurrentStage(52) || 56 != EnemyState.enemyTypeArray[_enemyIdx] && 57 != EnemyState.enemyTypeArray[_enemyIdx] && 58 != EnemyState.enemyTypeArray[_enemyIdx] || IncrementBadgeCount(52);
    if (63 == EnemyState.enemyTypeArray[_enemyIdx]) {
        if (isBadgeIncompleteForCurrentStage(58) && 3600 > StageState.gameFrameCounter) {
            IncrementBadgeCount(58);
        }
        spawnPopup(EnemyState.enemyJointPosArray[_enemyIdx][0].x, EnemyState.enemyJointPosArray[_enemyIdx][0].y, 0, RMath.floor(StageState.gameFrameCounter / 60) + "SEC", 120, 10066431);
    }
    if (isBadgeIncompleteForCurrentStage(69) && 72 == EnemyState.enemyTypeArray[_enemyIdx]) {
        IncrementBadgeCount(69);
    }
}


export function updateEnemies() {
    var enemyIdx;
    for (enemyIdx = 0; enemyIdx < EnemyState.enemyCount; enemyIdx++) {
        if (0 < EnemyState.enemyDmgDurationLeftArray[enemyIdx] && 0 < EnemyState.enemyHealthArray[enemyIdx]) {
            EnemyState.enemyDmgDurationLeftArray[enemyIdx]--;
            var b = RMath.floor(EnemyState.enemyDmgPerFrameArray[enemyIdx] / 60),
                c = EnemyState.enemyDmgPerFrameArray[enemyIdx] - 60 * b;
            RMath.randFloat(60) < c && (b += 1);
            EnemyState.enemyHealthArray[enemyIdx] = RMath.max(EnemyState.enemyHealthArray[enemyIdx] - b, 0);
            StageState.stage_totalDamageDealt += b
        }
        if (0 < EnemyState.enemyFreezeTimerArray[enemyIdx] && 0 < EnemyState.enemyHealthArray[enemyIdx]) // effect type 5 in al
            EnemyState.enemyFreezeTimerArray[enemyIdx]--;
        else {
            // if (0 < Gk[enemyIdx] && 0 < enemyHealthArray[enemyIdx] && (Gk[enemyIdx]--, randFloat(100) < Hk[enemyIdx])) continue;
            if (0 < EnemyState.enemySkipDurationLeftArray[enemyIdx] && 0 < EnemyState.enemyHealthArray[enemyIdx]) { // effect type 2
                EnemyState.enemySkipDurationLeftArray[enemyIdx]--;
                if (RMath.randFloat(100) < EnemyState.enemyUpdateSkipProbArray[enemyIdx])
                    continue;
            }
            enemyIdx = enemyDispatchTable[EnemyState.enemyUpdateFuncIdxArray[enemyIdx]](enemyIdx)
        }
    }
}


export function enemySlimeBehavior(enemyIdx) {

    var b, c = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.DrawScale];
    if (0 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        EnemyState.enemyJointPosArray[enemyIdx][0].x += 4;
        EnemyState.enemyJointPosArray[enemyIdx][0].y += 6;
        for (b = 0; 1 > b; b++) EnemyState.enemyPrevJointPosArray[enemyIdx][b].set(EnemyState.enemyJointPosArray[enemyIdx][b]);
        EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = RMath.randSelect(1, 2);
    } else if (1 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], .03, .99);
        if (0 < (EnemyState.enemyTileContactFlagsArray[enemyIdx] & 2) && 5 > RMath.randFloat(100)) {
            EnemyState.enemyJointPosArray[enemyIdx][0].x += RMath.randFloat(1 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] ? -.2 : .2);
            if (EnemyState.enemyJointPosArray[enemyIdx][0].y -= RMath.randFloat(.5)) {
                if (1 > RMath.randFloat(100)) {
                    EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = RMath.randSelect(1, 2);
                }
            }
        }
        var d = enemySpriteAnchorYBySpriteIndex[enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.SpriteIndex]];
        spawnEnemyLoot(enemyIdx, 0, EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y - d * c + 1);
        EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0;
        if (0 >= EnemyState.enemyHealthArray[enemyIdx])
            for (b = 0; 1 > b; b++) {
                EnemyState.enemyJointPosArray[enemyIdx][b].x += RMath.randFloatRange(-.3, .3);
                EnemyState.enemyJointPosArray[enemyIdx][b].y -= RMath.randFloatRange(1, 2);
            }
        for (b = 0; 1 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].x = EnemyState.enemyJointPosArray[enemyIdx][0].x;
        EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].y = EnemyState.enemyJointPosArray[enemyIdx][0].y - d * c + 1;
        if (0 >= EnemyState.enemyHealthArray[enemyIdx]) {
            EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 3;
            onEnemyDeath(enemyIdx);
        }
    } else {
        for (b = 0; 1 > b; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; 1 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        if (50 <= EnemyState.enemyDeathTimerArray[enemyIdx]++) {
            deleteEnemy(enemyIdx--);
        }
    }
    return enemyIdx;
}


export function enemyBoxSnakeBehavior(enemyIdx) {
    var b, c = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.DrawScale];
    if (0 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        EnemyState.enemyJointPosArray[enemyIdx][0].x += 2;
        EnemyState.enemyJointPosArray[enemyIdx][1].x += 3;
        EnemyState.enemyJointPosArray[enemyIdx][2].x += 4;
        for (b = 0; 3 > b; b++) EnemyState.enemyPrevJointPosArray[enemyIdx][b].set(EnemyState.enemyJointPosArray[enemyIdx][b]);
        EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 1;
    } else if (1 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], .05, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyPrevJointPosArray[enemyIdx][1], .05, .9);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyPrevJointPosArray[enemyIdx][2], .05, .9);
        var d = findNearestPartyMemberInRect(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, 200, 50, 0);
        if (-1 != d) {
            EnemyState.enemyJointPosArray[enemyIdx][0].x += HeroesState.heroJointPositionsByHero[d][2].x < EnemyState.enemyJointPosArray[enemyIdx][0].x ? -.001 : .001;
        }
        if (0 < (EnemyState.enemyTileContactFlagsArray[enemyIdx] & 2)) {
            b = 0;
            if (-1 != d) {
                b = HeroesState.heroJointPositionsByHero[d][2].x < EnemyState.enemyJointPosArray[enemyIdx][0].x ? -1 : 1;
            } else {
                b = RMath.randSelect(-1, 1);
            }
            if (10 > RMath.randFloat(100)) {
                EnemyState.enemyJointPosArray[enemyIdx][0].x += RMath.randFloatRange(.4, .6) * b;
                EnemyState.enemyJointPosArray[enemyIdx][0].y += RMath.randFloatRange(-1.5, -2);
            }
        }
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 0, 0, .01);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 0, 0, .01);
        d = enemySpriteAnchorYBySpriteIndex[enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.SpriteIndex]];
        spawnEnemyLoot(enemyIdx, 0, EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y - d * c + 1);
        EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0;
        if (0 >= EnemyState.enemyHealthArray[enemyIdx])
            for (b = 0; 3 > b; b++) {
                EnemyState.enemyJointPosArray[enemyIdx][b].x += RMath.randFloatRange(-.5, .5);
                EnemyState.enemyJointPosArray[enemyIdx][b].y -= RMath.randFloatRange(2, 3);
            }
        moveEnemyJointWithTileCollision(enemyIdx, 0, .5);
        b = EnemyState.enemyTileContactFlagsArray[enemyIdx];
        moveEnemyJointWithTileCollision(enemyIdx, 1, .5);
        moveEnemyJointWithTileCollision(enemyIdx, 2, .5);
        EnemyState.enemyTileContactFlagsArray[enemyIdx] = b;
        EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].x = EnemyState.enemyJointPosArray[enemyIdx][0].x;
        EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].y = EnemyState.enemyJointPosArray[enemyIdx][0].y - d * c + 1;
        if (0 >= EnemyState.enemyHealthArray[enemyIdx]) {
            EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 3;
            onEnemyDeath(enemyIdx);
        }
    } else {
        for (b = 0; 3 > b; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; 3 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        if (150 < EnemyState.enemyDeathTimerArray[enemyIdx]++) {
            deleteEnemy(enemyIdx--);
        }
    }
    return enemyIdx;
}


export function enemyBatBehavior(enemyIdx) {
    var b, c = new RMath.Vec2();
    b = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.DrawScale];
    if (0 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        EnemyState.enemyJointPosArray[enemyIdx][0].x += 4;
        EnemyState.enemyJointPosArray[enemyIdx][0].y += 4;
        EnemyState.enemyJointPosArray[enemyIdx][1].x += 4;
        EnemyState.enemyJointPosArray[enemyIdx][1].y += 4;
        EnemyState.enemyJointPosArray[enemyIdx][2].x += 2;
        EnemyState.enemyJointPosArray[enemyIdx][2].y += 2;
        EnemyState.enemyJointPosArray[enemyIdx][3].x += 2;
        EnemyState.enemyJointPosArray[enemyIdx][3].y += 6;
        EnemyState.enemyJointPosArray[enemyIdx][4].x += 4;
        EnemyState.enemyJointPosArray[enemyIdx][4].y += 4;
        EnemyState.enemyJointPosArray[enemyIdx][5].x += 6;
        EnemyState.enemyJointPosArray[enemyIdx][5].y += 2;
        EnemyState.enemyJointPosArray[enemyIdx][6].x += 6;
        EnemyState.enemyJointPosArray[enemyIdx][6].y += 6;
        for (b = 0; 7 > b; b++) EnemyState.enemyPrevJointPosArray[enemyIdx][b].set(EnemyState.enemyJointPosArray[enemyIdx][b]);
        EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 1;
    } else if (1 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], 0, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyPrevJointPosArray[enemyIdx][1], 0, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyPrevJointPosArray[enemyIdx][2], 0, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyPrevJointPosArray[enemyIdx][3], 0, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyPrevJointPosArray[enemyIdx][4], 0, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyPrevJointPosArray[enemyIdx][5], 0, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][6], EnemyState.enemyPrevJointPosArray[enemyIdx][6], 0, .99);
        RMath.Vec2Set(c, 0, 0);
        var d = findNearestPartyMemberInRect(EnemyState.enemyJointPosArray[enemyIdx][0].x,
            EnemyState.enemyJointPosArray[enemyIdx][0].y, 150, 150, 0);
        if (-1 != d) {
            RMath.Vec2Sub(c, HeroesState.heroJointPositionsByHero[d][2], EnemyState.enemyJointPosArray[enemyIdx][0]);
            d = RMath.Vec2Norm(c);
            d -= enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.PArg24] - 10;
            if (0 > d) {
                RMath.Vec2Scale(c, -.05);
            } else {
                RMath.Vec2Scale(c, .05);
            }
        }
        EnemyState.enemyJointPosArray[enemyIdx][0].add(c);
        if (10 > RMath.randFloat(100)) {
            EnemyState.enemyJointPosArray[enemyIdx][0].x += RMath.randFloatRange(-1, 1);
            EnemyState.enemyJointPosArray[enemyIdx][0].y += RMath.randFloatRange(-1, 1);
        }
        EnemyState.enemyJointPosArray[enemyIdx][2].x += RMath.randFloatRange(0, -.1);
        EnemyState.enemyJointPosArray[enemyIdx][3].x += RMath.randFloatRange(0, -.1);
        EnemyState.enemyJointPosArray[enemyIdx][5].x += RMath.randFloatRange(0, .1);
        EnemyState.enemyJointPosArray[enemyIdx][6].x += RMath.randFloatRange(0, .1);
        c = .5;
        d = 6 * b;
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 3 * b, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][4], 3 * b, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][3], d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][3], d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyJointPosArray[enemyIdx][5], d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyJointPosArray[enemyIdx][6], d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyJointPosArray[enemyIdx][6], d, c, c);
        spawnEnemyLoot(enemyIdx, 0, EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y);
        EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0;
        if (0 >= EnemyState.enemyHealthArray[enemyIdx])
            for (b = 0; 7 > b; b++) {
                EnemyState.enemyJointPosArray[enemyIdx][b].x += RMath.randFloatRange(-1, 1);
                EnemyState.enemyJointPosArray[enemyIdx][b].y -= RMath.randFloatRange(1, 2);
            }
        for (b = 0; 7 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, 1);
        EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].set(EnemyState.enemyJointPosArray[enemyIdx][0]);
        if (0 >= EnemyState.enemyHealthArray[enemyIdx]) {
            EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 3;
            onEnemyDeath(enemyIdx);
        }
    } else {
        for (b = 0; 8 > b; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        c = .5;
        d = 6 * (150 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 150;
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][3], d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][3], d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyJointPosArray[enemyIdx][5], d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyJointPosArray[enemyIdx][6], d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyJointPosArray[enemyIdx][6], d, c, c);
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; 7 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        if (150 < EnemyState.enemyDeathTimerArray[enemyIdx]++) {
            deleteEnemy(enemyIdx--);
        }
    }
    return enemyIdx;
}


export function enemyDragonBehavior(enemyIdx) {
    var b, c, d, f = new RMath.Vec2();
    if (0 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) 
        EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.ShapeParamA];
    else if (20 >= EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], 0, .99);
        for (b = 1; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], 0, .9);
        RMath.Vec2Sub(f, EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0]);
        RMath.Vec2Norm(f);
        RMath.Vec2Scale(f, .008);
        b = EnemyState.enemyJointPosArray[enemyIdx][0].x;
        c = EnemyState.enemyJointPosArray[enemyIdx][0].y;
        d = getStageTileAt(b - 24, c);
        if (28 >= d || 24 > b) f.x += .03;
        d = getStageTileAt(b + 24, c);
        if (28 >= d || b > 8 * StageState.stageWidth - 24) f.x -= .03;
        d = getStageTileAt(b, c - 24);
        if (28 >= d || 24 > c) f.y += .03;
        d = getStageTileAt(b, c + 24);
        if (28 >= d || c > 8 * StageState.stageHeight - 24) f.y -= .03;
        if (3 > RMath.randFloat(100)) {
            f.x += RMath.randFloatRange(-.1, .1);
            f.y += RMath.randFloatRange(-.1, .1);
        }
        EnemyState.enemyJointPosArray[enemyIdx][0].add(f);
        f = .013;
        c = 5;
        for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 1; b++) applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][b + 1], c, 0, f);
        spawnEnemyLoot(enemyIdx, 0, EnemyState.enemyJointPosArray[enemyIdx][0].x,
            EnemyState.enemyJointPosArray[enemyIdx][0].y);
        EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0;
        if (0 >= EnemyState.enemyHealthArray[enemyIdx])
            for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]; b++) {
                EnemyState.enemyJointPosArray[enemyIdx][b].x += RMath.randFloatRange(-1, 1);
                EnemyState.enemyJointPosArray[enemyIdx][b].y -= RMath.randFloatRange(1, 2);
            }
        for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].set(EnemyState.enemyJointPosArray[enemyIdx][0]);
        if (0 >= EnemyState.enemyHealthArray[enemyIdx]) {
            EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] += 20;
            EnemyState.enemyDeathTimerArray[enemyIdx] = 0;
            onEnemyDeath(enemyIdx);
        }
    } else {
        for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 20; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        f = .5;
        c = 10 * (150 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 150;
        for (b = 1; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 21; b++) applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][b + 1], c, f, f);
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 20; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        if (150 < EnemyState.enemyDeathTimerArray[enemyIdx]++) {
            deleteEnemy(enemyIdx--);
        }
    }
    return enemyIdx;
}


export function enemyStickmanBehavior(enemyIdx) {
    var b;
    b = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.DrawScale];
    if (0 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 1;
    else
    if (1 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.Stickman) {
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], -.2, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyPrevJointPosArray[enemyIdx][1], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyPrevJointPosArray[enemyIdx][2], -.1, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyPrevJointPosArray[enemyIdx][3], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyPrevJointPosArray[enemyIdx][4], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyPrevJointPosArray[enemyIdx][5], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][6], EnemyState.enemyPrevJointPosArray[enemyIdx][6], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyPrevJointPosArray[enemyIdx][7], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][8], EnemyState.enemyPrevJointPosArray[enemyIdx][8], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][9], EnemyState.enemyPrevJointPosArray[enemyIdx][9], .3, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][10], EnemyState.enemyPrevJointPosArray[enemyIdx][10], .3, .99);
        } else if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.StickmanAlt) {
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], -.02, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyPrevJointPosArray[enemyIdx][1], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyPrevJointPosArray[enemyIdx][2], -.01, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyPrevJointPosArray[enemyIdx][3], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][4],
                EnemyState.enemyPrevJointPosArray[enemyIdx][4], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyPrevJointPosArray[enemyIdx][5], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][6], EnemyState.enemyPrevJointPosArray[enemyIdx][6], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyPrevJointPosArray[enemyIdx][7], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][8], EnemyState.enemyPrevJointPosArray[enemyIdx][8], 0, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][9], EnemyState.enemyPrevJointPosArray[enemyIdx][9], .1, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][10], EnemyState.enemyPrevJointPosArray[enemyIdx][10], .1, .99);
        }
        if (50 > RMath.randFloat(100) && 0 < (EnemyState.enemyTileContactFlagsArray[enemyIdx] & 2)) {
            var c = findNearestPartyMemberInRect(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, 200, 50, 0);
            if (-1 != c) {
                EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = HeroesState.heroJointPositionsByHero[c][2].x < EnemyState.enemyJointPosArray[enemyIdx][0].x ? 1 : 2;
            } else if (10 > RMath.randFloat(100)) {
                EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = RMath.randSelect(1, 2);
            }
            var d = c = 1,
                f = 0;
            if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.StickmanAlt) {
                c = .25;
                d = .3;
                f = .25;
            }
            if (1 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
                if (EnemyState.enemyJointPosArray[enemyIdx][9].x < EnemyState.enemyJointPosArray[enemyIdx][10].x) {
                    EnemyState.enemyJointPosArray[enemyIdx][10].x += RMath.randFloat(-c);
                    EnemyState.enemyJointPosArray[enemyIdx][10].y += -d;
                } else {
                    EnemyState.enemyJointPosArray[enemyIdx][9].x += RMath.randFloat(-c);
                    EnemyState.enemyJointPosArray[enemyIdx][9].y += -d;
                }
                EnemyState.enemyJointPosArray[enemyIdx][5].x += RMath.randFloat(-f);
                EnemyState.enemyJointPosArray[enemyIdx][6].x += RMath.randFloat(-f);
            } else {
                if (EnemyState.enemyJointPosArray[enemyIdx][9].x < EnemyState.enemyJointPosArray[enemyIdx][10].x) {
                    EnemyState.enemyJointPosArray[enemyIdx][9].x +=
                        RMath.randFloat(c);
                    EnemyState.enemyJointPosArray[enemyIdx][9].y += -d;
                } else {
                    EnemyState.enemyJointPosArray[enemyIdx][10].x += RMath.randFloat(c);
                    EnemyState.enemyJointPosArray[enemyIdx][10].y += -d;
                }
                EnemyState.enemyJointPosArray[enemyIdx][5].x += RMath.randFloat(f);
                EnemyState.enemyJointPosArray[enemyIdx][6].x += RMath.randFloat(f);
            }
        }
        c = .5;
        d = 1.2 * b;
        if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.StickmanAlt) {
            c = .02;
            d = 1 * b;
        }
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 3 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 3 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][3], 4 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][4], 4 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyJointPosArray[enemyIdx][5], 4 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyJointPosArray[enemyIdx][6], 4 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][7], 4 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][8], 4 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyJointPosArray[enemyIdx][9], 4 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][8], EnemyState.enemyJointPosArray[enemyIdx][10], 4 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyJointPosArray[enemyIdx][8], 5 * d, c, c);
        spawnEnemyLoot(enemyIdx, 0, EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y);
        if (0 != enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.SecondaryProjectileEnabled]) {
            spawnEnemyLoot(enemyIdx, 1, EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y);
        }
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; 11 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].set(EnemyState.enemyJointPosArray[enemyIdx][1]);
        if (0 >= EnemyState.enemyHealthArray[enemyIdx]) {
            EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 3;
            for (b = EnemyState.enemyDeathTimerArray[enemyIdx] = 0; 11 > b; b++) {
                EnemyState.enemyJointPosArray[enemyIdx][b].x += RMath.randFloatRange(-1, 1);
                EnemyState.enemyJointPosArray[enemyIdx][b].y -= RMath.randFloatRange(1, 2);
            }
            onEnemyDeath(enemyIdx);
        }
    } else {
        for (b = 0; 11 > b; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        c = .5;
        d = 1.2 * (150 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 150;
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 3 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyJointPosArray[enemyIdx][5], 4 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyJointPosArray[enemyIdx][6], 4 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyJointPosArray[enemyIdx][9], 4 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][8], EnemyState.enemyJointPosArray[enemyIdx][10], 4 * d, c, c);
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; 11 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        if (150 < EnemyState.enemyDeathTimerArray[enemyIdx]++) {
            deleteEnemy(enemyIdx--);
        }
    }
    return enemyIdx;
}


export function enemyTreeBehavior(enemyIdx) {
    var b;
    if (0 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx])
        for (EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = RMath.floor(RMath.randFloatRange(enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.ShapeParamA] + 1, enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.ShapeParamB] + 2)), b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]; b++) {
            EnemyState.enemyJointPosArray[enemyIdx][b].x += 4;
            EnemyState.enemyJointPosArray[enemyIdx][b].y += 4;
            EnemyState.enemyPrevJointPosArray[enemyIdx][b].set(EnemyState.enemyJointPosArray[enemyIdx][b]);
        } else
    if (20 >= EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.TreeLeft) {
            for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 1; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], -.04, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], 1, .99);
        } else {
            for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 1; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .04, .99);
            stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], -1, .99);
        }
        if (10 > RMath.randFloat(100)) {
            b = RMath.floor(RMath.randFloat(EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 1));
            EnemyState.enemyJointPosArray[enemyIdx][b].x += RMath.randFloatRange(-.5, .5);
        }
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 8, .2, .2);
        for (b = 1; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 2; b++) applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][b + 1], 6, .2, .2);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][b + 1], 6, .2, 0);
        spawnEnemyLoot(enemyIdx, 0, EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y);
        EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0;
        if (0 >= EnemyState.enemyHealthArray[enemyIdx])
            for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]; b++) {
                EnemyState.enemyJointPosArray[enemyIdx][b].x += RMath.randFloatRange(-.5, .5);
                EnemyState.enemyJointPosArray[enemyIdx][b].y -= RMath.randFloatRange(2, 3);
            }
        for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].x = .5 * (EnemyState.enemyJointPosArray[enemyIdx][0].x + EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 1].x);
        EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].y = .5 * (EnemyState.enemyJointPosArray[enemyIdx][0].y + EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 1].y);
        if (0 >= EnemyState.enemyHealthArray[enemyIdx]) {
            EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] += 20;
            onEnemyDeath(enemyIdx);
        }
    } else {
        for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 20; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 20; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        if (150 < EnemyState.enemyDeathTimerArray[enemyIdx]++) {
            deleteEnemy(enemyIdx--);
        }
    }
    return enemyIdx;
}


export function enemyHangingTreeBehavior(enemyIdx) {
    var b;
    if (0 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        EnemyState.enemyJointPosArray[enemyIdx][0].x += 2;
        EnemyState.enemyJointPosArray[enemyIdx][1].x += 3;
        EnemyState.enemyJointPosArray[enemyIdx][2].x += 4;
        for (b = 0; 3 > b; b++) EnemyState.enemyPrevJointPosArray[enemyIdx][b].set(EnemyState.enemyJointPosArray[enemyIdx][b]);
        EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 1;
    } else if (1 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], .05, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyPrevJointPosArray[enemyIdx][1], .05, .9);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyPrevJointPosArray[enemyIdx][2], .05, .9);
        b = findNearestPartyMemberInRect(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, 200, 50, 0);
        if (-1 != b) {
            EnemyState.enemyJointPosArray[enemyIdx][0].x += HeroesState.heroJointPositionsByHero[b][2].x < EnemyState.enemyJointPosArray[enemyIdx][0].x ? -.001 : .001;
        }
        if (0 < (EnemyState.enemyTileContactFlagsArray[enemyIdx] & 2)) {
            var c = 0;
            if (-1 != b) {
                c = HeroesState.heroJointPositionsByHero[b][2].x < EnemyState.enemyJointPosArray[enemyIdx][0].x ? -1 : 1;
            } else {
                c = RMath.randSelect(-1, 1);
            }
            if (10 > RMath.randFloat(100)) {
                EnemyState.enemyJointPosArray[enemyIdx][0].x += RMath.randFloatRange(.4, .6) * c;
                EnemyState.enemyJointPosArray[enemyIdx][0].y += RMath.randFloatRange(-1.5, -2);
            }
        }
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 0, 0, .01);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 0, 0, .01);
        spawnEnemyLoot(enemyIdx, 0, EnemyState.enemyJointPosArray[enemyIdx][0].x,
            EnemyState.enemyJointPosArray[enemyIdx][0].y);
        EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0;
        if (0 >= EnemyState.enemyHealthArray[enemyIdx])
            for (b = 0; 3 > b; b++) {
                EnemyState.enemyJointPosArray[enemyIdx][b].x += RMath.randFloatRange(-.5, .5);
                EnemyState.enemyJointPosArray[enemyIdx][b].y -= RMath.randFloatRange(2, 3);
            }
        moveEnemyJointWithTileCollision(enemyIdx, 0, .5);
        b = EnemyState.enemyTileContactFlagsArray[enemyIdx];
        moveEnemyJointWithTileCollision(enemyIdx, 1, .5);
        moveEnemyJointWithTileCollision(enemyIdx, 2, .5);
        EnemyState.enemyTileContactFlagsArray[enemyIdx] = b;
        EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].set(EnemyState.enemyJointPosArray[enemyIdx][0]);
        if (0 >= EnemyState.enemyHealthArray[enemyIdx]) {
            EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 3;
            onEnemyDeath(enemyIdx);
        }
    } else {
        for (b = 0; 3 > b; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; 3 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        if (150 < EnemyState.enemyDeathTimerArray[enemyIdx]++) {
            deleteEnemy(enemyIdx--);
        }
    }
    return enemyIdx;
}


export function enemyUpdateFunc7(enemyIdx) {
    var b, c, d, f = new RMath.Vec2(),
        g = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.ShapeParamA],
        h = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.ShapeParamB] * enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.DrawScale];
    if (0 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        for (b = 0; b < g; b++) {
            c = 360 * b / g * RMath.PI / 180;
            EnemyState.enemyJointPosArray[enemyIdx][1 + b].x += Math.cos(c) * h;
            EnemyState.enemyJointPosArray[enemyIdx][1 + b].y += Math.sin(c) * h;
        }
        for (b = 0; b <= g; b++) {
            EnemyState.enemyJointPosArray[enemyIdx][b].x += 4;
            EnemyState.enemyJointPosArray[enemyIdx][b].y += 4;
            EnemyState.enemyPrevJointPosArray[enemyIdx][b].set(EnemyState.enemyJointPosArray[enemyIdx][b]);
        }
        EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 1;
    } else if (1 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], 0, .99);
        for (b = 1; b <= g; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], 0, .99);
        RMath.Vec2Sub(f, EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0]);
        RMath.Vec2Norm(f);
        RMath.Vec2Scale(f, .008);
        b = EnemyState.enemyJointPosArray[enemyIdx][0].x;
        c = EnemyState.enemyJointPosArray[enemyIdx][0].y;
        d = getStageTileAt(b - 16, c);
        if (30 >= d) {
            f.x += .05;
        }
        d = getStageTileAt(b + 16, c);
        if (30 >= d) {
            f.x -= .05;
        }
        d = getStageTileAt(b, c - 16);
        if (30 >= d) {
            f.y += .05;
        }
        d = getStageTileAt(b, c +
            16);
        if (30 >= d) {
            f.y -= .05;
        }
        d = getStageTileAt(b - 8, c);
        if (30 >= d) {
            f.x += .05;
        }
        d = getStageTileAt(b + 8, c);
        if (30 >= d) {
            f.x -= .05;
        }
        d = getStageTileAt(b, c - 8);
        if (30 >= d) {
            f.y += .05;
        }
        d = getStageTileAt(b, c + 8);
        if (30 >= d) {
            f.y -= .05;
        }
        if (3 > RMath.randFloat(100)) {
            f.x += RMath.randFloatRange(-.1, .1);
            f.y += RMath.randFloatRange(-.1, .1);
        }
        EnemyState.enemyJointPosArray[enemyIdx][0].add(f);
        c = 360 / g * RMath.PI / 180;
        f.x = Math.cos(0) * h - Math.cos(c) * h;
        f.y = Math.sin(0) * h - Math.sin(c) * h;
        f = RMath.Vec2Mag(f);
        for (b = 0; b < g; b++) applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][b + 1], h, 0, .2);
        for (b = 1; b < g; b++) applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][b + 1], f, .2, .2);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][1], f, .2, .2);
        spawnEnemyLoot(enemyIdx, 0, EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y);
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; b <= g; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].set(EnemyState.enemyJointPosArray[enemyIdx][0]);
        if (0 >= EnemyState.enemyHealthArray[enemyIdx]) {
            EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 3;
            for (b = EnemyState.enemyDeathTimerArray[enemyIdx] = 0; b <= g; b++) {
                EnemyState.enemyJointPosArray[enemyIdx][b].x += RMath.randFloatRange(-.5, .5);
                EnemyState.enemyJointPosArray[enemyIdx][b].y -= RMath.randFloatRange(2, 3);
            }
            onEnemyDeath(enemyIdx);
        }
    } else {
        for (b = 0; b <= g; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        h = h * (150 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 150;
        for (b = 1; b < g; b++) applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][b + 1], h, .5, .5);
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; b <= g; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        if (150 < EnemyState.enemyDeathTimerArray[enemyIdx]++) {
            deleteEnemy(enemyIdx--);
        }
    }
    return enemyIdx;
}


export function enemyUpdateFunc8(enemyIdx) {
    var b;
    b = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.DrawScale];
    if (0 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        EnemyState.enemyJointPosArray[enemyIdx][0].x += 4;
        EnemyState.enemyJointPosArray[enemyIdx][0].y += 0;
        EnemyState.enemyJointPosArray[enemyIdx][1].x += 0;
        EnemyState.enemyJointPosArray[enemyIdx][1].y += 0;
        EnemyState.enemyJointPosArray[enemyIdx][2].x += 0;
        EnemyState.enemyJointPosArray[enemyIdx][2].y += 7.99;
        EnemyState.enemyJointPosArray[enemyIdx][3].x += 7.99;
        EnemyState.enemyJointPosArray[enemyIdx][3].y += 0;
        EnemyState.enemyJointPosArray[enemyIdx][4].x += 7.99;
        EnemyState.enemyJointPosArray[enemyIdx][4].y += 7.99;
        EnemyState.enemyJointPosArray[enemyIdx][5].x += 0;
        EnemyState.enemyJointPosArray[enemyIdx][5].y += 0;
        EnemyState.enemyJointPosArray[enemyIdx][6].x += 0;
        EnemyState.enemyJointPosArray[enemyIdx][6].y += 7.99;
        EnemyState.enemyJointPosArray[enemyIdx][7].x += 7.99;
        EnemyState.enemyJointPosArray[enemyIdx][7].y += 0;
        EnemyState.enemyJointPosArray[enemyIdx][8].x += 7.99;
        EnemyState.enemyJointPosArray[enemyIdx][8].y += 7.99;
        for (b = 0; 9 > b; b++) EnemyState.enemyPrevJointPosArray[enemyIdx][b].set(EnemyState.enemyJointPosArray[enemyIdx][b]);
        EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 1;
    } else if (1 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], -.05, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyPrevJointPosArray[enemyIdx][1], -.1, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyPrevJointPosArray[enemyIdx][2], .8, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyPrevJointPosArray[enemyIdx][3], -.1, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyPrevJointPosArray[enemyIdx][4],
            .8, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyPrevJointPosArray[enemyIdx][5], -.1, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][6], EnemyState.enemyPrevJointPosArray[enemyIdx][6], .8, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyPrevJointPosArray[enemyIdx][7], -.1, .99);
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][8], EnemyState.enemyPrevJointPosArray[enemyIdx][8], .8, .99);
        if (50 > RMath.randFloat(100) && 0 < (EnemyState.enemyTileContactFlagsArray[enemyIdx] & 2)) {
            var c = findNearestPartyMemberInRect(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, 500, 25, 0);
            if (-1 != c) {
                EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = HeroesState.heroJointPositionsByHero[c][2].x < EnemyState.enemyJointPosArray[enemyIdx][0].x ? 1 : 2;
            } else if (10 > RMath.randFloat(100)) {
                EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = RMath.randSelect(1, 2);
            }
            if (1 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
                if (EnemyState.enemyJointPosArray[enemyIdx][2].x < EnemyState.enemyJointPosArray[enemyIdx][6].x) {
                    EnemyState.enemyJointPosArray[enemyIdx][6].x += RMath.randFloat(-1);
                    EnemyState.enemyJointPosArray[enemyIdx][6].y += RMath.randFloatRange(-1, -1);
                } else {
                    EnemyState.enemyJointPosArray[enemyIdx][2].x += RMath.randFloat(-1);
                    EnemyState.enemyJointPosArray[enemyIdx][2].y += RMath.randFloatRange(-1, -1);
                }
                if (EnemyState.enemyJointPosArray[enemyIdx][4].x < EnemyState.enemyJointPosArray[enemyIdx][8].x) {
                    EnemyState.enemyJointPosArray[enemyIdx][8].x += RMath.randFloat(-1);
                    EnemyState.enemyJointPosArray[enemyIdx][8].y += RMath.randFloatRange(-1, -1);
                } else {
                    EnemyState.enemyJointPosArray[enemyIdx][4].x += RMath.randFloat(-1);
                    EnemyState.enemyJointPosArray[enemyIdx][4].y += RMath.randFloatRange(-1, -1);
                }
                if (1 > RMath.randFloat(100)) {
                    --EnemyState.enemyJointPosArray[enemyIdx][0].x;
                    EnemyState.enemyJointPosArray[enemyIdx][0].y -= 3;
                }
            } else {
                if (EnemyState.enemyJointPosArray[enemyIdx][2].x < EnemyState.enemyJointPosArray[enemyIdx][6].x) {
                    EnemyState.enemyJointPosArray[enemyIdx][2].x += RMath.randFloat(1);
                    EnemyState.enemyJointPosArray[enemyIdx][2].y += RMath.randFloatRange(-1, -1);
                } else {
                    EnemyState.enemyJointPosArray[enemyIdx][6].x += RMath.randFloat(1);
                    EnemyState.enemyJointPosArray[enemyIdx][6].y += RMath.randFloatRange(-1, -1);
                }
                if (EnemyState.enemyJointPosArray[enemyIdx][4].x < EnemyState.enemyJointPosArray[enemyIdx][8].x) {
                    EnemyState.enemyJointPosArray[enemyIdx][4].x += RMath.randFloat(1);
                    EnemyState.enemyJointPosArray[enemyIdx][4].y += RMath.randFloatRange(-1, -1);
                } else {
                    EnemyState.enemyJointPosArray[enemyIdx][8].x += RMath.randFloat(1);
                    EnemyState.enemyJointPosArray[enemyIdx][8].y += RMath.randFloatRange(-1, -1);
                }
                if (1 > RMath.randFloat(100)) {
                    EnemyState.enemyJointPosArray[enemyIdx][0].x += 1;
                    EnemyState.enemyJointPosArray[enemyIdx][0].y -= 3;
                }
            }
        }
        c = .3;
        b = 2.2 * b;
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][5], 3 * b, .1 * c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][7], 3 * b, .1 * c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][6], 3 * b, .1 * c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyJointPosArray[enemyIdx][6], 2 * b, .2 * c, .2 * c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][8], 3 * b, .1 * c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyJointPosArray[enemyIdx][8], 2 * b, .2 * c, .2 * c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 4 * b, .1 * c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][3], 4 * b, .1 * c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][2], 4 * b, .1 * c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 3 * b, .2 * c, .2 * c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][4], 4 * b, .1 * c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyJointPosArray[enemyIdx][4], 3 * b, .2 * c, .2 * c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][4], 8 * b, .1 * c, .1 * c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyJointPosArray[enemyIdx][7], 7 * b, .1 * c, .1 * c);
        spawnEnemyLoot(enemyIdx, 0, EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y);
        if (0 != enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.SecondaryProjectileEnabled]) {
            spawnEnemyLoot(enemyIdx, 1, EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y);
        }
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; 9 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].set(EnemyState.enemyJointPosArray[enemyIdx][0]);
        if (0 >= EnemyState.enemyHealthArray[enemyIdx]) {
            EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 3;
            EnemyState.enemyDeathTimerArray[enemyIdx] = 0;
            for (b = 1; 9 > b; b++) {
                EnemyState.enemyJointPosArray[enemyIdx][b].x += RMath.randFloatRange(-1, 1);
                EnemyState.enemyJointPosArray[enemyIdx][b].y -= RMath.randFloatRange(1, 2);
            }
            onEnemyDeath(enemyIdx);
        }
    } else {
        for (b = 0; 9 > b; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        c = .5;
        b = 1.2 * (150 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 150;
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 4 * b, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyJointPosArray[enemyIdx][4], 4 * b, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][5],
            EnemyState.enemyJointPosArray[enemyIdx][6], 3 * b, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyJointPosArray[enemyIdx][8], 3 * b, c, c);
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; 9 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        if (150 < EnemyState.enemyDeathTimerArray[enemyIdx]++) {
            deleteEnemy(enemyIdx--);
        }
    }
    return enemyIdx;
}


export function enemyUpdateFunc9(enemyIdx) {
    var b, c = new RMath.Vec2(),
        d = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.DrawScale];
    if (0 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        if (1 > RMath.randFloat(2)) {
            EnemyState.enemyJointPosArray[enemyIdx][0].x += 0;
            EnemyState.enemyJointPosArray[enemyIdx][1].x += 2;
            EnemyState.enemyJointPosArray[enemyIdx][2].x += 4;
            EnemyState.enemyJointPosArray[enemyIdx][3].x += 6;
            EnemyState.enemyJointPosArray[enemyIdx][4].x += 6;
        } else {
            EnemyState.enemyJointPosArray[enemyIdx][0].x += 6;
            EnemyState.enemyJointPosArray[enemyIdx][1].x += 4;
            EnemyState.enemyJointPosArray[enemyIdx][2].x += 2;
            EnemyState.enemyJointPosArray[enemyIdx][3].x += 0;
            EnemyState.enemyJointPosArray[enemyIdx][4].x += 0;
        }
        for (b = 0; 5 > b; b++) EnemyState.enemyPrevJointPosArray[enemyIdx][b].set(EnemyState.enemyJointPosArray[enemyIdx][b]);
        EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 1;
    } else if (1 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], 0, .99);
        for (b = 1; 5 > b; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], 0, .9);
        RMath.Vec2Set(c, 0, 0);
        b = findNearestPartyMemberInRect(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, 150, 50, 0);
        if (-1 != b) {
            RMath.Vec2Sub(c, HeroesState.heroJointPositionsByHero[b][2], EnemyState.enemyJointPosArray[enemyIdx][0]);
            b = RMath.Vec2Norm(c);
            b -= enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.PArg24] / 2 - 10;
            if (0 > b) {
                RMath.Vec2Scale(c, -.01);
            } else {
                RMath.Vec2Scale(c, .01);
            }
        }
        b = getStageTileAt(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y);
        if (31 != b) {
            c.y += .03;
        }
        b = getStageTileAt(EnemyState.enemyJointPosArray[enemyIdx][0].x - 8, EnemyState.enemyJointPosArray[enemyIdx][0].y);
        if (0 <= b && 23 >= b) {
            c.x += .03;
        }
        b = getStageTileAt(EnemyState.enemyJointPosArray[enemyIdx][0].x + 8, EnemyState.enemyJointPosArray[enemyIdx][0].y);
        if (0 <= b && 23 >= b) {
            c.x -= .03;
        }
        b = getStageTileAt(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y - 8);
        if (0 <= b && 23 >= b) {
            c.y += .03;
        }
        b = getStageTileAt(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y + 8);
        if (0 <= b && 23 >= b) {
            c.y -= .03;
        }
        if (2 > RMath.randFloat(100)) {
            c.x += RMath.randFloatRange(-.5, .5);
            c.y += RMath.randFloatRange(-.5, .5);
        }
        EnemyState.enemyJointPosArray[enemyIdx][0].add(c);
        c = .1;
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 6 * d, 0, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 4 * d, 0, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][3], 6 * d, 0, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][4], 6 * d, 0, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyJointPosArray[enemyIdx][4], 8 * d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][2], 10 * d, 0, c);
        spawnEnemyLoot(enemyIdx, 0, EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y);
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; 5 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        EnemyState.enemyJointPosArray[enemyIdx][EnemyState.enemyTargetJointIdx].set(EnemyState.enemyJointPosArray[enemyIdx][0]);
        if (0 >= EnemyState.enemyHealthArray[enemyIdx]) {
            EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] = 3;
            for (b = EnemyState.enemyDeathTimerArray[enemyIdx] = 0; 5 > b; b++) {
                EnemyState.enemyJointPosArray[enemyIdx][b].x += RMath.randFloatRange(-2, 2);
                EnemyState.enemyJointPosArray[enemyIdx][b].y -= RMath.randFloatRange(2, 4);
            }
            onEnemyDeath(enemyIdx);
        }
    } else {
        for (b = 0; 5 > b; b++) stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        c = .5;
        d = 7 * d * (150 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 150;
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][3], d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][4], d, c, c);
        applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyJointPosArray[enemyIdx][4], d, c, c);
        for (b = EnemyState.enemyTileContactFlagsArray[enemyIdx] = 0; 5 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        if (150 < EnemyState.enemyDeathTimerArray[enemyIdx]++) {
            deleteEnemy(enemyIdx--);
        }
    }
    return enemyIdx;
}


export function drawEnemies() { // Cg
    for (let enemyIdx = 0; enemyIdx < EnemyState.enemyCount; enemyIdx++) {
        let sprIdx = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.SpriteIndex],
            primTint = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.PrimaryTint],
            secTint = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.SecondaryTint],
            accentTint = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.AccentTint];
        let drawScale = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.DrawScale];
        let yAnchor = enemySpriteAnchorYBySpriteIndex[sprIdx];
        if (0 < EnemyState.enemyFreezeTimerArray[enemyIdx]) {
            primTint = 5934817;
            secTint = 1989840;
        } else if (0 < EnemyState.enemySkipDurationLeftArray[enemyIdx]) {
            primTint = 3368652;
            accentTint = secTint = 13158;
        } else if (0 < EnemyState.enemyDmgDurationLeftArray[enemyIdx]) {
            primTint = 3407616;
            accentTint = secTint = 3381504;
        }
        
        let k = (150 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 150 * drawScale;
        if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.Slime) {
            if (3 > EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
                drawEnemyScaledSprite(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y - yAnchor * drawScale + 1, 16 * drawScale, 16 * drawScale, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
            } else {
                drawEnemyScaledSprite(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y - yAnchor * drawScale + 1, 16 * drawScale, 16 * drawScale, 16 * (sprIdx & 7), 16 * (sprIdx >> 3) + 15, -15, primTint, secTint, RMath.floor(128 * (50 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 50));
            }
        } else if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.BoxSnake) {
            drawRectCentered(EnemyState.enemyJointPosArray[enemyIdx][2].x, EnemyState.enemyJointPosArray[enemyIdx][2].y - 2 * k, 4 * k, 4 * k, accentTint);
            drawRectCentered(EnemyState.enemyJointPosArray[enemyIdx][1].x, EnemyState.enemyJointPosArray[enemyIdx][1].y - 2.5 * k, 5 * k, 5 * k, accentTint);
            if (3 > EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
                k = RMath.max(1, k);
            }
            drawEnemyScaledSprite(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y - yAnchor * k + 1, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
        } else if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.Bat) {
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][1].x, EnemyState.enemyJointPosArray[enemyIdx][1].y, EnemyState.enemyJointPosArray[enemyIdx][2].x, EnemyState.enemyJointPosArray[enemyIdx][2].y, accentTint);
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][2].x, EnemyState.enemyJointPosArray[enemyIdx][2].y, EnemyState.enemyJointPosArray[enemyIdx][3].x, EnemyState.enemyJointPosArray[enemyIdx][3].y, accentTint);
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][3].x, EnemyState.enemyJointPosArray[enemyIdx][3].y, EnemyState.enemyJointPosArray[enemyIdx][1].x, EnemyState.enemyJointPosArray[enemyIdx][1].y, accentTint);
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][4].x, EnemyState.enemyJointPosArray[enemyIdx][4].y, EnemyState.enemyJointPosArray[enemyIdx][5].x, EnemyState.enemyJointPosArray[enemyIdx][5].y, accentTint);
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][5].x, EnemyState.enemyJointPosArray[enemyIdx][5].y, EnemyState.enemyJointPosArray[enemyIdx][6].x, EnemyState.enemyJointPosArray[enemyIdx][6].y, accentTint);
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][6].x, EnemyState.enemyJointPosArray[enemyIdx][6].y, EnemyState.enemyJointPosArray[enemyIdx][4].x, EnemyState.enemyJointPosArray[enemyIdx][4].y, accentTint);
            if (3 > EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
                k = RMath.max(1, k);
            }
            drawEnemyScaledSprite(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
        } else if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.Dragon) {
            let _a = 0;
            let _b = EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 1;
            if (20 < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
                _a = 1;
                _b = EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 20 - 1;
            }
            for (; _a < _b; _a++) drawLine(EnemyState.enemyJointPosArray[enemyIdx][_a].x, EnemyState.enemyJointPosArray[enemyIdx][_a].y, EnemyState.enemyJointPosArray[enemyIdx][_a + 1].x, EnemyState.enemyJointPosArray[enemyIdx][_a + 1].y, accentTint);
            drawRectCentered(RMath.floor(EnemyState.enemyJointPosArray[enemyIdx][_b].x) + 1, RMath.floor(EnemyState.enemyJointPosArray[enemyIdx][_b].y) + 1, RMath.floor(2 * k), RMath.floor(2 * k), primTint);
            drawEnemyScaledSprite(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
        } else if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.Stickman || EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.StickmanAlt) {
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][1].x, EnemyState.enemyJointPosArray[enemyIdx][1].y, EnemyState.enemyJointPosArray[enemyIdx][2].x, EnemyState.enemyJointPosArray[enemyIdx][2].y, accentTint);
            if (3 > EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
                drawLine(EnemyState.enemyJointPosArray[enemyIdx][1].x, EnemyState.enemyJointPosArray[enemyIdx][1].y, EnemyState.enemyJointPosArray[enemyIdx][3].x, EnemyState.enemyJointPosArray[enemyIdx][3].y, accentTint);
                drawLine(EnemyState.enemyJointPosArray[enemyIdx][1].x, EnemyState.enemyJointPosArray[enemyIdx][1].y, EnemyState.enemyJointPosArray[enemyIdx][4].x, EnemyState.enemyJointPosArray[enemyIdx][4].y, accentTint);
            }
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][3].x, EnemyState.enemyJointPosArray[enemyIdx][3].y, EnemyState.enemyJointPosArray[enemyIdx][5].x, EnemyState.enemyJointPosArray[enemyIdx][5].y, accentTint);
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][4].x, EnemyState.enemyJointPosArray[enemyIdx][4].y, EnemyState.enemyJointPosArray[enemyIdx][6].x, EnemyState.enemyJointPosArray[enemyIdx][6].y, accentTint);
            if (3 > EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
                drawLine(EnemyState.enemyJointPosArray[enemyIdx][2].x, EnemyState.enemyJointPosArray[enemyIdx][2].y,
                    EnemyState.enemyJointPosArray[enemyIdx][7].x, EnemyState.enemyJointPosArray[enemyIdx][7].y, accentTint);
                drawLine(EnemyState.enemyJointPosArray[enemyIdx][2].x, EnemyState.enemyJointPosArray[enemyIdx][2].y, EnemyState.enemyJointPosArray[enemyIdx][8].x, EnemyState.enemyJointPosArray[enemyIdx][8].y, accentTint);
            }
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][7].x, EnemyState.enemyJointPosArray[enemyIdx][7].y, EnemyState.enemyJointPosArray[enemyIdx][9].x, EnemyState.enemyJointPosArray[enemyIdx][9].y, accentTint);
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][8].x, EnemyState.enemyJointPosArray[enemyIdx][8].y, EnemyState.enemyJointPosArray[enemyIdx][10].x, EnemyState.enemyJointPosArray[enemyIdx][10].y, accentTint);
            drawEnemyScaledSprite(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
        } else if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.TreeLeft || EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.TreeRight) {
            let leftHanded = EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.TreeLeft ? -2 : 2;
            let startI = 20 >= EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] ? EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 1 : EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 21;
            for (let _i = startI; 0 < _i; _i--) 
                drawRectOutlineCentered(RMath.floor(EnemyState.enemyJointPosArray[enemyIdx][_i].x), RMath.floor(EnemyState.enemyJointPosArray[enemyIdx][_i].y + leftHanded), 5, 5, accentTint);
            if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.TreeLeft) {
                drawEnemyScaledSprite(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
            } else {
                drawEnemyScaledSprite(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3) + 16, -16, primTint, secTint, 255);
            }
        } else if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.HangingTree) {
            for (let _i = 1; 6 > _i; _i++) drawLine(EnemyState.enemyJointPosArray[enemyIdx][_i].x, EnemyState.enemyJointPosArray[enemyIdx][_i].y, EnemyState.enemyJointPosArray[enemyIdx][_i + 1].x, EnemyState.enemyJointPosArray[enemyIdx][_i + 1].y, secTint);
            if (3 > EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
                drawLine(EnemyState.enemyJointPosArray[enemyIdx][drawScale].x, EnemyState.enemyJointPosArray[enemyIdx][drawScale].y, EnemyState.enemyJointPosArray[enemyIdx][1].x, EnemyState.enemyJointPosArray[enemyIdx][1].y, secTint);
            }
            drawSpriteSheetPartCentered(LoadedSprites.enemySpriteSheet, RMath.floor(EnemyState.enemyJointPosArray[enemyIdx][0].x), RMath.floor(EnemyState.enemyJointPosArray[enemyIdx][0].y), RMath.floor(16 * k), RMath.floor(16 * k), 16 * sprIdx, 0, 16, 16, primTint);
        } else if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.Type8) {
            let _a = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.ShapeParamA];
            for (let _i = 1; _i < _a; _i++) drawLine(EnemyState.enemyJointPosArray[enemyIdx][_i].x - 1, EnemyState.enemyJointPosArray[enemyIdx][_i].y - 1, EnemyState.enemyJointPosArray[enemyIdx][_i + 1].x - 1, EnemyState.enemyJointPosArray[enemyIdx][_i + 1].y - 1, accentTint);
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][drawScale].x - 1, EnemyState.enemyJointPosArray[enemyIdx][drawScale].y - 1, EnemyState.enemyJointPosArray[enemyIdx][1].x - 1, EnemyState.enemyJointPosArray[enemyIdx][1].y - 1, accentTint);
            drawEnemyScaledSprite(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
        } else if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.Type9) {
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][1].x, EnemyState.enemyJointPosArray[enemyIdx][1].y, EnemyState.enemyJointPosArray[enemyIdx][2].x, EnemyState.enemyJointPosArray[enemyIdx][2].y, secTint);
            if (3 > EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
                drawLine(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, EnemyState.enemyJointPosArray[enemyIdx][1].x, EnemyState.enemyJointPosArray[enemyIdx][1].y, secTint);
                drawLine(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, EnemyState.enemyJointPosArray[enemyIdx][3].x, EnemyState.enemyJointPosArray[enemyIdx][3].y, secTint);
            }
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][1].x, EnemyState.enemyJointPosArray[enemyIdx][1].y, EnemyState.enemyJointPosArray[enemyIdx][2].x, EnemyState.enemyJointPosArray[enemyIdx][2].y, secTint);
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][3].x, EnemyState.enemyJointPosArray[enemyIdx][3].y, EnemyState.enemyJointPosArray[enemyIdx][4].x, EnemyState.enemyJointPosArray[enemyIdx][4].y, secTint);
            if (3 > EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
                drawLine(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, EnemyState.enemyJointPosArray[enemyIdx][5].x, EnemyState.enemyJointPosArray[enemyIdx][5].y, secTint);
                drawLine(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, EnemyState.enemyJointPosArray[enemyIdx][7].x, EnemyState.enemyJointPosArray[enemyIdx][7].y, secTint);
            }
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][5].x, EnemyState.enemyJointPosArray[enemyIdx][5].y, EnemyState.enemyJointPosArray[enemyIdx][6].x, EnemyState.enemyJointPosArray[enemyIdx][6].y, secTint);
            drawLine(EnemyState.enemyJointPosArray[enemyIdx][7].x, EnemyState.enemyJointPosArray[enemyIdx][7].y, EnemyState.enemyJointPosArray[enemyIdx][8].x, EnemyState.enemyJointPosArray[enemyIdx][8].y, secTint);
            drawSpriteSheetPartCentered(LoadedSprites.enemySpriteSheet, RMath.floor(EnemyState.enemyJointPosArray[enemyIdx][0].x), RMath.floor(EnemyState.enemyJointPosArray[enemyIdx][0].y), RMath.floor(16 * k), RMath.floor(16 * k), 16 * sprIdx, 0, 16, 16, primTint);
        } else {
            if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.Type10) {
                drawLine(EnemyState.enemyJointPosArray[enemyIdx][2].x, EnemyState.enemyJointPosArray[enemyIdx][2].y, EnemyState.enemyJointPosArray[enemyIdx][3].x, EnemyState.enemyJointPosArray[enemyIdx][3].y, accentTint);
                drawLine(EnemyState.enemyJointPosArray[enemyIdx][3].x, EnemyState.enemyJointPosArray[enemyIdx][3].y, EnemyState.enemyJointPosArray[enemyIdx][4].x,
                    EnemyState.enemyJointPosArray[enemyIdx][4].y, accentTint);
                drawLine(EnemyState.enemyJointPosArray[enemyIdx][4].x, EnemyState.enemyJointPosArray[enemyIdx][4].y, EnemyState.enemyJointPosArray[enemyIdx][2].x, EnemyState.enemyJointPosArray[enemyIdx][2].y, accentTint);
                drawRectOutlineCentered(EnemyState.enemyJointPosArray[enemyIdx][1].x, EnemyState.enemyJointPosArray[enemyIdx][1].y, 6 * k + 1, 6 * k + 1, accentTint);
                if (3 > EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]) {
                    k = RMath.max(1, k);
                }
                drawEnemyScaledSprite(EnemyState.enemyJointPosArray[enemyIdx][0].x, EnemyState.enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
            }
        }
    }
    for (let enemyIdx = 0; enemyIdx < EnemyState.enemyCount; enemyIdx++) {
        if (EnemyState.enemyAuxStateArray[enemyIdx] > 0){
            EnemyState.enemyAuxStateArray[enemyIdx]--;
            if (EnemyState.enemyHealthArray[enemyIdx] > 0) {
                let drawScale = enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.DrawScale];
                drawRect(RMath.floor(EnemyState.enemyJointPosArray[enemyIdx][0].x) - 7 * drawScale, RMath.floor(EnemyState.enemyJointPosArray[enemyIdx][0].y) - 10 * drawScale, 14 * drawScale, 1, 10027008);
                drawRect(
                    RMath.floor(EnemyState.enemyJointPosArray[enemyIdx][0].x) - 7 * drawScale, RMath.floor(EnemyState.enemyJointPosArray[enemyIdx][0].y) - 10 * drawScale,
                    RMath.floor(14 * drawScale * EnemyState.enemyHealthArray[enemyIdx] / enemyCatalog[EnemyState.enemyTypeArray[enemyIdx]][EnemyProps.Health]), 1, 52224
                )
            }
        }
    }
}


export function drawEnemyStatic(_typeIdx, _px, _py, _scale) { // Ch
    let behaviorIdx = enemyCatalog[_typeIdx][EnemyProps.BehaviorIdx],
        spriteIdx = enemyCatalog[_typeIdx][EnemyProps.SpriteIndex],
        primTint = enemyCatalog[_typeIdx][EnemyProps.PrimaryTint],
        secTint = enemyCatalog[_typeIdx][EnemyProps.SecondaryTint],
        accentTint = enemyCatalog[_typeIdx][EnemyProps.AccentTint];
    _scale = RMath.clamp(enemyCatalog[_typeIdx][EnemyProps.DrawScale], 1, _scale);
    let yAnchor = enemySpriteAnchorYBySpriteIndex[spriteIdx],
        posY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        posX = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (behaviorIdx == BehaviorTypes.Slime) {
        drawEnemyScaledSprite(
            _px + 0 * _scale, _py - yAnchor * _scale + 1, 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 
            16 * (spriteIdx >> 3), 16, primTint, secTint, 255
        );
    } else if (behaviorIdx == BehaviorTypes.BoxSnake) {
        drawRectCentered(_px + 5 * _scale, _py - 4 * _scale, 4 * _scale, 4 * _scale, accentTint);
        drawRectCentered(_px + 2 * _scale, _py - 10 * _scale, 5 * _scale, 5 * _scale, accentTint);
        drawEnemyScaledSprite(
            _px - 4 * _scale, _py - 11 * _scale, 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 
            16 * (spriteIdx >> 3), 16, primTint, secTint, 255
        );
    } else if (behaviorIdx == BehaviorTypes.Bat) {
        posY[0] = _px + 0 * _scale;
        posX[0] = _py - 8 * _scale;
        posY[1] = _px - 4 * _scale;
        posX[1] = _py - 8 * _scale;
        posY[2] = _px - 9 * _scale;
        posX[2] = _py - 9 * _scale;
        posY[3] = _px - 7 * _scale;
        posX[3] = _py - 4 * _scale;
        posY[4] = _px + 3 * _scale;
        posX[4] = _py - 8 * _scale;
        posY[5] = _px + 9 * _scale;
        posX[5] = _py - 10 * _scale;
        posY[6] = _px + 7 * _scale;
        posX[6] = _py - 4 * _scale;
        drawLine(posY[1], posX[1], posY[2], posX[2], accentTint);
        drawLine(posY[2], posX[2], posY[3], posX[3], accentTint);
        drawLine(posY[3], posX[3], posY[1], posX[1], accentTint);
        drawLine(posY[4], posX[4], posY[5], posX[5], accentTint);
        drawLine(posY[5], posX[5], posY[6], posX[6], accentTint);
        drawLine(posY[6], posX[6], posY[4], posX[4], accentTint);
        drawEnemyScaledSprite(posY[0], posX[0], 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 16 * (spriteIdx >> 3), 16, primTint, secTint, 255);
    } else if (behaviorIdx == BehaviorTypes.Dragon) {
        posY[0] = _px - 3 * _scale;
        posX[0] = _py - 10 * _scale;
        posY[1] = _px + 1 * _scale;
        posX[1] = _py - 10 * _scale;
        posY[2] = _px + 4 * _scale;
        posX[2] = _py - 8 * _scale;
        posY[3] = _px + 5 * _scale;
        posX[3] = _py - 6 * _scale;
        posY[4] = _px + 5 * _scale;
        posX[4] = _py - 4 * _scale;
        posY[5] = _px + 3 * _scale;
        posX[5] = _py - 1 * _scale;
        drawLine(posY[0], posX[0], posY[1], posX[1], accentTint);
        drawLine(posY[4], posX[4], posY[5], posX[5], accentTint);
        drawLine(posY[1], posX[1], posY[2], posX[2], accentTint);
        drawLine(posY[2], posX[2], posY[3], posX[3], accentTint);
        drawLine(posY[3], posX[3], posY[4], posX[4], accentTint);
        drawRectCentered(RMath.floor(posY[5]), RMath.floor(posX[5]), RMath.floor(2 * _scale), RMath.floor(2 * _scale), primTint);
        drawEnemyScaledSprite(posY[0], posX[0], 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 16 * (spriteIdx >> 3), 16, primTint, secTint, 255);
    } else if (behaviorIdx == BehaviorTypes.Stickman) {
        posY[0] = _px + 0 * _scale;
        posX[0] = _py - 15 * _scale;
        posY[1] = _px + 0 * _scale;
        posX[1] = _py - 10 * _scale;
        posY[2] = _px + 0 * _scale;
        posX[2] = _py - 7 * _scale;
        posY[3] = _px - 2 * _scale;
        posX[3] = _py - 8 * _scale;
        posY[4] = _px + 3 * _scale;
        posX[4] = _py - 11 * _scale;
        posY[5] = _px - 5 * _scale;
        posX[5] = _py - 7 * _scale;
        posY[6] = _px + 5 * _scale;
        posX[6] = _py - 8 * _scale;
        posY[7] = _px - 3 * _scale;
        posX[7] = _py - 3 * _scale;
        posY[8] = _px + 3 * _scale;
        posX[8] = _py - 5 * _scale;
        posY[9] = _px - 1 * _scale;
        posX[9] = _py - 1 * _scale;
        posY[10] = _px + 2 * _scale;
        posX[10] = _py - 0 * _scale;
        drawLine(posY[1], posX[1], posY[2], posX[2], accentTint);
        drawLine(posY[1], posX[1], posY[3], posX[3], accentTint);
        drawLine(posY[1], posX[1], posY[4], posX[4], accentTint);
        drawLine(posY[3], posX[3], posY[5], posX[5], accentTint);
        drawLine(posY[4], posX[4], posY[6], posX[6], accentTint);
        drawLine(posY[2], posX[2], posY[7], posX[7], accentTint);
        drawLine(posY[2], posX[2], posY[8], posX[8], accentTint);
        drawLine(posY[7], posX[7], posY[9], posX[9], accentTint);
        drawLine(posY[8], posX[8], posY[10], posX[10], accentTint);
        drawEnemyScaledSprite(posY[0], posX[0], 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 16 * (spriteIdx >> 3), 16, primTint, secTint, 255);
    } else if (behaviorIdx == BehaviorTypes.TreeLeft) {
        drawRectOutlineCentered(_px + 0, _py + 0, 5, 5, accentTint);
        drawRectOutlineCentered(_px - 1, _py - 6, 5, 5, accentTint);
        drawRectOutlineCentered(_px + 0, _py - 12, 5, 5, accentTint);
        drawEnemyScaledSprite(_px + 0, _py - 18, 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 16 * (spriteIdx >> 3), 16, primTint, secTint, 255);
    } else if (behaviorIdx == BehaviorTypes.TreeRight) {
        drawRectOutlineCentered(_px + 0, _py - 17, 5, 5, accentTint);
        drawRectOutlineCentered(_px - 1, _py - 11, 5, 5, accentTint);
        drawRectOutlineCentered(_px + 0, _py - 5, 5, 5, accentTint);
        drawEnemyScaledSprite(_px + 0, _py + 1, 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 16 * (spriteIdx >> 3) + 16, -16, primTint, secTint, 255);
    } else if (behaviorIdx == BehaviorTypes.HangingTree) {
        posY[0] = _px + 0 * _scale;
        posX[0] = _py - 10 * _scale;
        posY[1] = _px - 7 * _scale;
        posX[1] = _py - 19 * _scale;
        posY[2] = _px + 5 * _scale;
        posX[2] = _py - 21 * _scale;
        posY[3] = _px + 12 * _scale;
        posX[3] = _py - 12 * _scale;
        posY[4] = _px + 7 * _scale;
        posX[4] = _py - 2 * _scale;
        posY[5] = _px - 5 * _scale;
        posX[5] = _py - 0 * _scale;
        posY[6] = _px - 12 * _scale;
        posX[6] = _py - 10 * _scale;
        for (_px = 1; 6 > _px; _px++) drawLine(posY[_px], posX[_px], posY[_px + 1], posX[_px + 1], secTint);
        drawLine(posY[_px], posX[_px], posY[1], posX[1], secTint);
        drawSpriteSheetPartCentered(
            LoadedSprites.enemySpriteSheet, RMath.floor(posY[0]), RMath.floor(posX[0]), RMath.floor(16 * _scale), RMath.floor(16 * _scale), 
            16 * (spriteIdx & 7), 16 * (spriteIdx >> 3), 16, 16, primTint
        );
    } else if (behaviorIdx == BehaviorTypes.Type8) {
        behaviorIdx = enemyCatalog[_typeIdx][EnemyProps.ShapeParamA];
        _typeIdx = enemyCatalog[_typeIdx][EnemyProps.ShapeParamB];
        posY[0] = _px + 0 * _scale;
        posX[0] = _py - 10 * _scale;
        for (_px = 0; _px < behaviorIdx; _px++) {
            _py = 360 * _px / behaviorIdx * RMath.PI / 180;
            posY[_px + 1] = posY[0] + Math.cos(_py) * _typeIdx * _scale;
            posX[_px + 1] = posX[0] + Math.sin(_py) * _typeIdx * _scale;
        }
        for (_px = 1; _px < behaviorIdx; _px++) 
            drawLine(posY[_px], posX[_px], posY[_px + 1], posX[_px + 1], accentTint);
        drawLine(posY[_px], posX[_px], posY[1], posX[1], accentTint);
        drawEnemyScaledSprite(posY[0], posX[0], 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 16 * (spriteIdx >> 3), 16, primTint, secTint, 255);
    } else if (behaviorIdx == BehaviorTypes.Type9) {
        posY[0] = _px + 0 * _scale;
        posX[0] = _py - 6 * _scale;
        posY[1] = _px - 9 * _scale;
        posX[1] = _py - 9 * _scale;
        posY[2] = _px - 7 * _scale;
        posX[2] = _py - 0 * _scale;
        posY[3] = _px + 9 * _scale;
        posX[3] = _py - 9 * _scale;
        posY[4] = _px + 7 * _scale;
        posX[4] = _py - 0 * _scale;
        posY[5] = _px - 7 * _scale;
        posX[5] = _py - 5 * _scale;
        posY[6] = _px - 5 * _scale;
        posX[6] = _py - 0 * _scale;
        posY[7] = _px + 7 * _scale;
        posX[7] = _py - 5 * _scale;
        posY[8] = _px + 5 * _scale;
        posX[8] = _py - 0 * _scale;
        drawLine(RMath.floor(posY[0]), RMath.floor(posX[0]), RMath.floor(posY[1]), RMath.floor(posX[1]), secTint);
        drawLine(RMath.floor(posY[0]), RMath.floor(posX[0]), RMath.floor(posY[3]), RMath.floor(posX[3]), secTint);
        drawLine(RMath.floor(posY[1]), RMath.floor(posX[1]), RMath.floor(posY[2]), RMath.floor(posX[2]), secTint);
        drawLine(RMath.floor(posY[3]), RMath.floor(posX[3]), RMath.floor(posY[4]), RMath.floor(posX[4]), secTint);
        drawLine(RMath.floor(posY[0]), RMath.floor(posX[0]), RMath.floor(posY[5]), RMath.floor(posX[5]), secTint);
        drawLine(RMath.floor(posY[0]), RMath.floor(posX[0]), RMath.floor(posY[7]), RMath.floor(posX[7]), secTint);
        drawLine(RMath.floor(posY[5]), RMath.floor(posX[5]), RMath.floor(posY[6]), RMath.floor(posX[6]), secTint);
        drawLine(RMath.floor(posY[7]), RMath.floor(posX[7]), RMath.floor(posY[8]), RMath.floor(posX[8]), secTint);
        drawSpriteSheetPartCentered(
            LoadedSprites.enemySpriteSheet, RMath.floor(posY[0]), RMath.floor(posX[0]), RMath.floor(16 * _scale), RMath.floor(16 * _scale), 
            16 * (spriteIdx & 7), 16 * (spriteIdx >> 3), 16, 16, primTint
        );
    } else if (behaviorIdx == BehaviorTypes.Type10) {
        drawLine(_px + 5 * _scale, _py - 6 * _scale, _px + 8 * _scale, _py - 11 * _scale, accentTint);
        drawLine(_px + 8 * _scale, _py - 11 * _scale, _px + 10 * _scale, _py - 3 * _scale, accentTint);
        drawLine(_px + 10 * _scale, _py - 3 * _scale, _px + 5 * _scale, _py - 6 * _scale, accentTint);
        drawRectOutlineCentered(_px + 0 * _scale, _py - 9 * _scale, 6 * _scale + 1, 6 * _scale + 1, accentTint);
        drawEnemyScaledSprite(
            _px - 5 * _scale, _py - 13 * _scale, 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 
            16 * (spriteIdx >> 3), 16, primTint, secTint, 255
        );
    } else if (behaviorIdx == BehaviorTypes.StickmanAlt) {
        posY[0] = _px + 0 * _scale;
        posX[0] = _py - 16 * _scale;
        posY[1] = _px + 0 * _scale;
        posX[1] = _py - 10 * _scale;
        posY[2] = _px + 2 * _scale;
        posX[2] = _py - 7 * _scale;
        posY[3] = _px - 2 * _scale;
        posX[3] = _py - 8 * _scale;
        posY[4] = _px - 3 * _scale;
        posX[4] = _py - 11 * _scale;
        posY[5] = _px - 5 * _scale;
        posX[5] = _py - 7 * _scale;
        posY[6] = _px - 8 * _scale;
        posX[6] = _py - 10 * _scale;
        posY[7] = _px - 1 * _scale;
        posX[7] = _py - 4 * _scale;
        posY[8] = _px + 2 * _scale;
        posX[8] = _py - 5 * _scale;
        posY[9] = _px - 0 * _scale;
        posX[9] = _py - 1 * _scale;
        posY[10] = _px + 4 * _scale;
        posX[10] = _py - 0 * _scale;
    }
}

export function clearProjectiles() { // im
    ProjectileState.projectileCount = 0
}


export function spawnProjectile(
    _parent, jointPair, _px, _py, _vx, _vy, drawMode, tileIdx, tint, render, width, height, shape, hitboxWidth, 
    hitboxHeight, spawnDelay, hitCooldown, impactAge, impactLife, jointIdx, acel, velScale, custIntA, collisionMode, homingRange, customIntB, 
    maxTargets, dmgMin, dmgMax, effectType, effectDuration, applyMode, impactSpawnMode, spawnParam, tmpl_speed, tmpl_elementType, tmpl_elementBonus, 
    tmpl_param1, tmpl_attackMode, tmpl_param2, tmpl_aux1, tmpl_aux2, tmpl_auxA, tmpl_auxB, tmpl_auxC, tmpl_dispStatsA, tmpl_auxD, tmpl_flag, 
    tmmpl_paramTime, tmpl_hitCount, tmpl_effectMode, tmpl_statA, tmpl_extraStat1, tmpl_childCount, tmpl_childSpeed
) { // zi
    if (ProjectileState.projectileCount >= 1E3) return;
    ProjectileState.projectileOwnerIdx[ProjectileState.projectileCount] = _parent;
    ProjectileState.projectileJointPair[ProjectileState.projectileCount] = jointPair;
    RMath.Vec2Set(ProjectileState.projectilePosition[ProjectileState.projectileCount], _px, _py);
    RMath.Vec2Set(ProjectileState.projectileVelocity[ProjectileState.projectileCount], _vx, _vy);
    ProjectileState.projectileImpactState[ProjectileState.projectileCount] = 0;
    ProjectileState.projectileDrawMode[ProjectileState.projectileCount] = drawMode;
    ProjectileState.projectileSpriteTileIndex[ProjectileState.projectileCount] = tileIdx;
    ProjectileState.projectileTintColor[ProjectileState.projectileCount] = tint;
    ProjectileState.projectileSolidRenderMode[ProjectileState.projectileCount] = render;
    ProjectileState.projectileSpriteWidth[ProjectileState.projectileCount] = width;
    ProjectileState.projectileSpriteHeight[ProjectileState.projectileCount] = height;
    ProjectileState.projectileShapeMode[ProjectileState.projectileCount] = shape;
    ProjectileState.projectileHitboxWidth[ProjectileState.projectileCount] = hitboxWidth;
    ProjectileState.projectileHitboxHeight[ProjectileState.projectileCount] = hitboxHeight;
    ProjectileState.projectileSpawnDelayFrames[ProjectileState.projectileCount] = RMath.floor(RMath.randFloat(spawnDelay));
    ProjectileState.projectileHitCooldownFrames[ProjectileState.projectileCount] = hitCooldown;
    ProjectileState.projectileImpactAge[ProjectileState.projectileCount] = impactAge;
    ProjectileState.projectileImpactLifetime[ProjectileState.projectileCount] = impactLife;
    ProjectileState.projectileAttachJointIndex[ProjectileState.projectileCount] = jointIdx;
    ProjectileState.projectileAcceleration[ProjectileState.projectileCount] = acel;
    ProjectileState.projectileVelocityScale[ProjectileState.projectileCount] = velScale;
    ProjectileState.projectileCustomIntA[ProjectileState.projectileCount] = custIntA;
    ProjectileState.projectileTileCollisionMode[ProjectileState.projectileCount] = collisionMode;
    ProjectileState.projectileHomingRange[ProjectileState.projectileCount] = homingRange;
    ProjectileState.projectileCustomIntB[ProjectileState.projectileCount] = customIntB;
    ProjectileState.projectileMaxTargets[ProjectileState.projectileCount] = maxTargets;
    ProjectileState.projectileDamageMin[ProjectileState.projectileCount] = dmgMin;
    ProjectileState.projectileDamageMax[ProjectileState.projectileCount] = dmgMax;
    ProjectileState.projectileEffectType[ProjectileState.projectileCount] = effectType;
    ProjectileState.projectileEffectDuration[ProjectileState.projectileCount] = effectDuration;
    ProjectileState.projectileApplyMode[ProjectileState.projectileCount] = applyMode;
    ProjectileState.projectileImpactSpawnMode[ProjectileState.projectileCount] = impactSpawnMode;
    ProjectileState.projectileSpawnParam[ProjectileState.projectileCount] = spawnParam;
    ProjectileState.projectileTmplSpeed[ProjectileState.projectileCount] = tmpl_speed;
    ProjectileState.projectileTmplElementType[ProjectileState.projectileCount] = tmpl_elementType;
    ProjectileState.projectileTmplElementBonus[ProjectileState.projectileCount] = tmpl_elementBonus;
    ProjectileState.projectileTmplParam1[ProjectileState.projectileCount] = tmpl_param1;
    ProjectileState.projectileTmplAttackMode[ProjectileState.projectileCount] = tmpl_attackMode;
    ProjectileState.projectileTmplParam2[ProjectileState.projectileCount] = tmpl_param2;
    ProjectileState.projectileTmplAux1[ProjectileState.projectileCount] = tmpl_aux1;
    ProjectileState.projectileTmplAux2[ProjectileState.projectileCount] = tmpl_aux2;
    ProjectileState.projectileTmplAuxValueA[ProjectileState.projectileCount] = tmpl_auxA;
    ProjectileState.projectileTmplAuxValueB[ProjectileState.projectileCount] = tmpl_auxB;
    ProjectileState.projectileTmplAuxValueC[ProjectileState.projectileCount] = tmpl_auxC;
    ProjectileState.projectileTmplDisplayStatA[ProjectileState.projectileCount] = tmpl_dispStatsA;
    ProjectileState.projectileTmplAuxValueD[ProjectileState.projectileCount] = tmpl_auxD;
    ProjectileState.projectileTmplFlag[ProjectileState.projectileCount] = tmpl_flag;
    ProjectileState.projectileTmplParamTime[ProjectileState.projectileCount] = tmmpl_paramTime;
    ProjectileState.projectileTmplHitCount[ProjectileState.projectileCount] = tmpl_hitCount;
    ProjectileState.projectileTmplEffectMode[ProjectileState.projectileCount] = tmpl_effectMode;
    ProjectileState.projectileTmplStatA[ProjectileState.projectileCount] = tmpl_statA;
    ProjectileState.projectileTmplExtraStat1[ProjectileState.projectileCount] = tmpl_extraStat1;
    ProjectileState.projectileChildCount[ProjectileState.projectileCount] = tmpl_childCount;
    ProjectileState.projectileChildSpeed[ProjectileState.projectileCount] = tmpl_childSpeed;
    ProjectileState.projectileCount++;
}


export function deleteProjectile(projIdx) { // jm
    ProjectileState.projectileOwnerIdx[projIdx] = ProjectileState.projectileOwnerIdx[ProjectileState.projectileCount - 1];
    ProjectileState.projectileJointPair[projIdx] = ProjectileState.projectileJointPair[ProjectileState.projectileCount - 1];
    ProjectileState.projectilePosition[projIdx].set(ProjectileState.projectilePosition[ProjectileState.projectileCount - 1]);
    ProjectileState.projectileVelocity[projIdx].set(ProjectileState.projectileVelocity[ProjectileState.projectileCount - 1]);
    ProjectileState.projectileImpactState[projIdx] = ProjectileState.projectileImpactState[ProjectileState.projectileCount - 1];
    ProjectileState.projectileDrawMode[projIdx] = ProjectileState.projectileDrawMode[ProjectileState.projectileCount - 1];
    ProjectileState.projectileSpriteTileIndex[projIdx] = ProjectileState.projectileSpriteTileIndex[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTintColor[projIdx] = ProjectileState.projectileTintColor[ProjectileState.projectileCount - 1];
    ProjectileState.projectileSolidRenderMode[projIdx] = ProjectileState.projectileSolidRenderMode[ProjectileState.projectileCount - 1];
    ProjectileState.projectileSpriteWidth[projIdx] = ProjectileState.projectileSpriteWidth[ProjectileState.projectileCount - 1];
    ProjectileState.projectileSpriteHeight[projIdx] = ProjectileState.projectileSpriteHeight[ProjectileState.projectileCount - 1];
    ProjectileState.projectileShapeMode[projIdx] = ProjectileState.projectileShapeMode[ProjectileState.projectileCount - 1];
    ProjectileState.projectileHitboxWidth[projIdx] = ProjectileState.projectileHitboxWidth[ProjectileState.projectileCount - 1];
    ProjectileState.projectileHitboxHeight[projIdx] = ProjectileState.projectileHitboxHeight[ProjectileState.projectileCount - 1];
    ProjectileState.projectileSpawnDelayFrames[projIdx] = ProjectileState.projectileSpawnDelayFrames[ProjectileState.projectileCount - 1];
    ProjectileState.projectileHitCooldownFrames[projIdx] = ProjectileState.projectileHitCooldownFrames[ProjectileState.projectileCount - 1];
    ProjectileState.projectileImpactAge[projIdx] = ProjectileState.projectileImpactAge[ProjectileState.projectileCount - 1];
    ProjectileState.projectileImpactLifetime[projIdx] = ProjectileState.projectileImpactLifetime[ProjectileState.projectileCount - 1];
    ProjectileState.projectileAttachJointIndex[projIdx] = ProjectileState.projectileAttachJointIndex[ProjectileState.projectileCount - 1];
    ProjectileState.projectileAcceleration[projIdx] = ProjectileState.projectileAcceleration[ProjectileState.projectileCount - 1];
    ProjectileState.projectileVelocityScale[projIdx] = ProjectileState.projectileVelocityScale[ProjectileState.projectileCount - 1];
    ProjectileState.projectileCustomIntA[projIdx] = ProjectileState.projectileCustomIntA[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTileCollisionMode[projIdx] = ProjectileState.projectileTileCollisionMode[ProjectileState.projectileCount - 1];
    ProjectileState.projectileHomingRange[projIdx] = ProjectileState.projectileHomingRange[ProjectileState.projectileCount - 1];
    ProjectileState.projectileCustomIntB[projIdx] = ProjectileState.projectileCustomIntB[ProjectileState.projectileCount - 1];
    ProjectileState.projectileMaxTargets[projIdx] = ProjectileState.projectileMaxTargets[ProjectileState.projectileCount - 1];
    ProjectileState.projectileDamageMin[projIdx] = ProjectileState.projectileDamageMin[ProjectileState.projectileCount - 1];
    ProjectileState.projectileDamageMax[projIdx] = ProjectileState.projectileDamageMax[ProjectileState.projectileCount - 1];
    ProjectileState.projectileEffectType[projIdx] = ProjectileState.projectileEffectType[ProjectileState.projectileCount - 1];
    ProjectileState.projectileEffectDuration[projIdx] = ProjectileState.projectileEffectDuration[ProjectileState.projectileCount - 1];
    ProjectileState.projectileApplyMode[projIdx] = ProjectileState.projectileApplyMode[ProjectileState.projectileCount - 1];
    ProjectileState.projectileImpactSpawnMode[projIdx] = ProjectileState.projectileImpactSpawnMode[ProjectileState.projectileCount - 1];
    ProjectileState.projectileSpawnParam[projIdx] = ProjectileState.projectileSpawnParam[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplSpeed[projIdx] = ProjectileState.projectileTmplSpeed[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplElementType[projIdx] = ProjectileState.projectileTmplElementType[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplElementBonus[projIdx] = ProjectileState.projectileTmplElementBonus[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplParam1[projIdx] = ProjectileState.projectileTmplParam1[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplAttackMode[projIdx] = ProjectileState.projectileTmplAttackMode[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplParam2[projIdx] = ProjectileState.projectileTmplParam2[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplAux1[projIdx] = ProjectileState.projectileTmplAux1[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplAux2[projIdx] = ProjectileState.projectileTmplAux2[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplAuxValueA[projIdx] = ProjectileState.projectileTmplAuxValueA[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplAuxValueB[projIdx] = ProjectileState.projectileTmplAuxValueB[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplAuxValueC[projIdx] = ProjectileState.projectileTmplAuxValueC[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplDisplayStatA[projIdx] = ProjectileState.projectileTmplDisplayStatA[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplAuxValueD[projIdx] = ProjectileState.projectileTmplAuxValueD[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplFlag[projIdx] = ProjectileState.projectileTmplFlag[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplParamTime[projIdx] = ProjectileState.projectileTmplParamTime[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplHitCount[projIdx] = ProjectileState.projectileTmplHitCount[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplEffectMode[projIdx] = ProjectileState.projectileTmplEffectMode[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplStatA[projIdx] = ProjectileState.projectileTmplStatA[ProjectileState.projectileCount - 1];
    ProjectileState.projectileTmplExtraStat1[projIdx] = ProjectileState.projectileTmplExtraStat1[ProjectileState.projectileCount - 1];
    ProjectileState.projectileChildCount[projIdx] = ProjectileState.projectileChildCount[ProjectileState.projectileCount - 1];
    ProjectileState.projectileChildSpeed[projIdx] = ProjectileState.projectileChildSpeed[ProjectileState.projectileCount - 1];
    ProjectileState.projectileCount--
}


export function moveProjectileWithCollision(projIdx, vel) { // km
    var c = 0;
    vel.set(ProjectileState.projectileVelocity[projIdx]);
    var d = RMath.floor(RMath.Vec2Mag(vel) / 4) + 1;
    RMath.Vec2Scale(vel, 1 / d);
    for (var f, g, h = 0; h < d; h++) {
        f = ProjectileState.projectilePosition[projIdx].y + vel.y;
        g = getStageTileAt(ProjectileState.projectilePosition[projIdx].x, f);
        if (0 <= g && 29 >= g) {
            if (0 == ProjectileState.projectileTileCollisionMode[projIdx]) {
                c = 1;
            } else if (2 == ProjectileState.projectileTileCollisionMode[projIdx]) {
                ProjectileState.projectilePosition[projIdx].y = f;
            } else if (3 == ProjectileState.projectileTileCollisionMode[projIdx]) {
                vel.y = -vel.y;
                ProjectileState.projectileVelocity[projIdx].y = -ProjectileState.projectileVelocity[projIdx].y;
            } else if (4 == ProjectileState.projectileTileCollisionMode[projIdx] && 0 < ProjectileState.projectileVelocity[projIdx].y) {
                c = 1;
            } else {
                ProjectileState.projectileVelocity[projIdx].y = 0;
            }
        } else {
            ProjectileState.projectilePosition[projIdx].y = f;
        }
        f = ProjectileState.projectilePosition[projIdx].x + vel.x;
        g = getStageTileAt(f, ProjectileState.projectilePosition[projIdx].y);
        if (0 <= g && 29 >= g) {
            if (0 == ProjectileState.projectileTileCollisionMode[projIdx]) {
                c = 1;
            } else if (2 == ProjectileState.projectileTileCollisionMode[projIdx]) {
                ProjectileState.projectilePosition[projIdx].x = f;
            } else if (3 == ProjectileState.projectileTileCollisionMode[projIdx]) {
                vel.x = -vel.x;
                ProjectileState.projectileVelocity[projIdx].x = -ProjectileState.projectileVelocity[projIdx].x;
            } else if (4 == ProjectileState.projectileTileCollisionMode[projIdx]) {
                ProjectileState.projectileVelocity[projIdx].x = 0;
            }
        } else {
            ProjectileState.projectilePosition[projIdx].x = f;
        }
    }
    return c;
}


export function updateProjectiles() { // Bg
    let a, b, c, d = new RMath.Vec2(),
        f = new RMath.Vec2(),
        g = new RMath.Vec2(),
        h = new RMath.Vec2(),
        k = new RMath.Vec2(),
        p, t, l;
    for (a = 0; a < ProjectileState.projectileCount; a++){
        if (-64 > ProjectileState.projectilePosition[a].x || 704 < ProjectileState.projectilePosition[a].x) {
            deleteProjectile(a--);
        } else if (0 < ProjectileState.projectileSpawnDelayFrames[a]) {
            ProjectileState.projectileSpawnDelayFrames[a]--;
        } else if (1 == ProjectileState.projectileImpactState[a]) {
            ProjectileState.projectileImpactAge[a]++;
            if (ProjectileState.projectileImpactAge[a] >= ProjectileState.projectileImpactLifetime[a]) {
                deleteProjectile(a--);
            }
        } else {
            if (0 < ProjectileState.projectileHomingRange[a]) {
                b = ProjectileState.projectileHomingRange[a];
                b = 0 <= ProjectileState.projectileOwnerIdx[a] ? findEnemyInArea(ProjectileState.projectilePosition[a].x, ProjectileState.projectilePosition[a].y, b, b) : findNearestPartyMemberInRect(ProjectileState.projectilePosition[a].x, ProjectileState.projectilePosition[a].y, b, b, 0);
                if (-1 != b) {
                    if (0 <= ProjectileState.projectileOwnerIdx[a]) {
                        RMath.Vec2Sub(d, EnemyState.enemyJointPosArray[b][0], ProjectileState.projectilePosition[a]);
                    } else {
                        RMath.Vec2Sub(d, HeroesState.heroJointPositionsByHero[b][0], ProjectileState.projectilePosition[a]);
                    }
                    RMath.Vec2Norm(d);
                    b = RMath.Vec2Mag(ProjectileState.projectileVelocity[a]);
                    ProjectileState.projectileVelocity[a].x = .85 * ProjectileState.projectileVelocity[a].x + .15 * d.x + RMath.randFloatRange(-.1, .1);
                    ProjectileState.projectileVelocity[a].y = .85 * ProjectileState.projectileVelocity[a].y + .15 * d.y + RMath.randFloatRange(-.1, .1);
                    RMath.Vec2Norm(ProjectileState.projectileVelocity[a]);
                    RMath.Vec2Scale(ProjectileState.projectileVelocity[a], RMath.max(b, 1));
                }
            }
            if (0 == ProjectileState.projectileAttachJointIndex[a]) {
                ProjectileState.projectileVelocity[a].y += .01 * ProjectileState.projectileAcceleration[a];
            } else {
                if (-1 == ProjectileState.projectileAttachJointIndex[a]) {
                    d.set(ProjectileState.projectilePosition[a]);
                } else {
                    c = ProjectileState.projectileOwnerIdx[a];
                    l = 0 <= c ? HeroesState.heroJointPositionsByHero : EnemyState.enemyJointPosArray;
                    c = 0 <= c ? c : -c - 1;
                    RMath.Vec2Sub(d, ProjectileState.projectilePosition[a], l[c][ProjectileState.projectileAttachJointIndex[a]]);
                }
                RMath.Vec2Norm(d);
                RMath.Vec2Scale(d, .01 * -ProjectileState.projectileAcceleration[a]);
                ProjectileState.projectileVelocity[a].add(d);
            }
            RMath.Vec2Scale(ProjectileState.projectileVelocity[a], .01 * ProjectileState.projectileVelocityScale[a]);
            b = 0;
            if (0 > ProjectileState.projectileJointPair[a]) {
                b = moveProjectileWithCollision(a, d);
            } else {
                ProjectileState.projectilePosition[a].add(ProjectileState.projectileVelocity[a]);
            }
            if (0 > ProjectileState.projectileJointPair[a]) {
                h.set(ProjectileState.projectilePosition[a]);
                k.set(ProjectileState.projectileVelocity[a]);
            } else {
                c = ProjectileState.projectileOwnerIdx[a];
                p = ProjectileState.projectileJointPair[a] >> 8;
                t = ProjectileState.projectileJointPair[a] & 255;
                l = 0 <= c ? HeroesState.heroJointPositionsByHero : EnemyState.enemyJointPosArray;
                c = 0 <= c ? c : -c - 1;
                if (p == t) {
                    RMath.Vec2Add(h, l[c][p], ProjectileState.projectilePosition[a]);
                    k.set(ProjectileState.projectileVelocity[a]);
                } else {
                    RMath.Vec2Sub(g, l[c][t], l[c][p]);
                    RMath.Vec2Norm(g);
                    f.set(g);
                    RMath.Vec2Rotate(f);
                    h.x = f.x * ProjectileState.projectilePosition[a].x + g.x * ProjectileState.projectilePosition[a].y + l[c][p].x;
                    h.y = f.y * ProjectileState.projectilePosition[a].x + g.y * ProjectileState.projectilePosition[a].y + l[c][p].y;
                    k.x = f.x * ProjectileState.projectileVelocity[a].x + g.x * ProjectileState.projectileVelocity[a].y;
                    k.y = f.y * ProjectileState.projectileVelocity[a].x + g.y * ProjectileState.projectileVelocity[a].y;
                }
            }
            p = 1;
            if (1 == ProjectileState.projectileEffectType[a] && 0 == ProjectileState.projectileImpactSpawnMode[a] && ProjectileState.projectileEffectDuration[a] <= RMath.randFloat(60)) {
                p = 0;
            }
            if (0 < ProjectileState.projectileHitCooldownFrames[a]) {
                ProjectileState.projectileHitCooldownFrames[a]--;
                p = 0;
            }
            c = -1;
            if (1 == p) {
                c = 0;
                if (1 == ProjectileState.projectileApplyMode[a] || 2 == ProjectileState.projectileApplyMode[a]) c = 1;
                c = (0 <= ProjectileState.projectileOwnerIdx[a]) 
                    ? applyEffectToEnemies(
                        c, ProjectileState.projectileShapeMode[a], ProjectileState.projectileMaxTargets[a], ProjectileState.projectileEffectType[a], ProjectileState.projectileEffectDuration[a], 
                        ProjectileState.projectileDamageMin[a], ProjectileState.projectileDamageMax[a], h, k, ProjectileState.projectileHitboxWidth[a], ProjectileState.projectileHitboxHeight[a]
                    ) 
                    : damagePartyMemberInArea(
                        0, ProjectileState.projectileMaxTargets[a], ProjectileState.projectileEffectType[a], ProjectileState.projectileEffectDuration[a], ProjectileState.projectileDamageMin[a], ProjectileState.projectileDamageMax[a], 
                        h.x, h.y, ProjectileState.projectileHitboxWidth[a], ProjectileState.projectileHitboxHeight[a]
                    );
            }
            if (1 == ProjectileState.projectileEffectType[a] && 0 == ProjectileState.projectileImpactSpawnMode[a]) {
                c = -1;    
            }
            if (4 == ProjectileState.projectileEffectType[a] && 99 == ProjectileState.projectileMaxTargets[a]) {
                c = -1;    
            }
            if (2 == ProjectileState.projectileApplyMode[a] && 1 == ProjectileState.projectileImpactAge[a]) {
                b = 1;
            }
            if (1 == b || -1 != c) {
                ProjectileState.projectileImpactState[a] = 1; 
                ProjectileState.projectileImpactAge[a] = 0;
                if (1 <= ProjectileState.projectileImpactSpawnMode[a] && 9 >= ProjectileState.projectileImpactSpawnMode[a]) {
                    for (b = 0; b < ProjectileState.projectileChildCount[a]; b++) {
                        if (1 == ProjectileState.projectileImpactSpawnMode[a]) {
                            RMath.Vec2Set(d, 0, 0);
                        } else if (2 == ProjectileState.projectileImpactSpawnMode[a] || 3 == ProjectileState.projectileImpactSpawnMode[a]) {
                            c = RMath.floor(RMath.randFloat(512));
                            p = RMath.randFloatRange(.1, ProjectileState.projectileChildSpeed[a]);
                            d.x = RMath.rotationLUT[c][0] * p;
                            d.y = RMath.rotationLUT[c][1] * p;
                            if (0 < d.y && 2 == ProjectileState.projectileImpactSpawnMode[a]) {
                                d.y = -d.y;
                            }
                        } else if (4 == ProjectileState.projectileImpactSpawnMode[a]) {
                            RMath.Vec2Norm(k);
                            RMath.Vec2Scale(k, RMath.randFloatRange(.1, .1 * ProjectileState.projectileSpawnParam[a]));
                            c = RMath.floor(RMath.randFloat(512));
                            p = RMath.randFloatRange(0, .1 * ProjectileState.projectileChildSpeed[a]);
                            d.x = k.x + RMath.rotationLUT[c][0] * p;
                            d.y = k.y + RMath.rotationLUT[c][1] * p;
                        }
                        spawnProjectile(
                            ProjectileState.projectileOwnerIdx[a], -1, h.x, h.y, d.x, d.y, ProjectileState.projectileTmplSpeed[a], ProjectileState.projectileTmplElementType[a], ProjectileState.projectileTmplElementBonus[a], ProjectileState.projectileTmplParam1[a], 
                            ProjectileState.projectileTmplAttackMode[a], ProjectileState.projectileTmplParam2[a], ProjectileState.projectileTmplAux1[a], ProjectileState.projectileTmplAux2[a], ProjectileState.projectileTmplAuxValueA[a], ProjectileState.projectileTmplAuxValueB[a], 
                            ProjectileState.projectileTmplAuxValueC[a], ProjectileState.projectileTmplDisplayStatA[a], ProjectileState.projectileTmplAuxValueD[a], ProjectileState.projectileTmplFlag[a], ProjectileState.projectileTmplParamTime[a], 
                            ProjectileState.projectileTmplHitCount[a], ProjectileState.projectileTmplEffectMode[a], ProjectileState.projectileTmplStatA[a], 0, 0, ProjectileState.projectileTmplExtraStat1[a], ProjectileState.projectileDamageMin[a], 
                            ProjectileState.projectileDamageMax[a], ProjectileState.projectileEffectType[a], ProjectileState.projectileEffectDuration[a], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                        );
                    } 
                }
            } else if (-1 != c && 20 <= ProjectileState.projectileImpactSpawnMode[a] && 29 >= ProjectileState.projectileImpactSpawnMode[a]) {
                for (b = 0; b < ProjectileState.projectileChildCount[a]; b++) {
                    if (20 == ProjectileState.projectileImpactSpawnMode[a]) {
                        c = RMath.floor(512 * RMath.Vec2Angle(k) / RMath.TAU);
                        c = c + RMath.randFloatRange(-ProjectileState.projectileSpawnParam[a], ProjectileState.projectileSpawnParam[a]) & 511;
                        d.x = RMath.rotationLUT[c][0] * ProjectileState.projectileChildSpeed[a];
                        d.y = -RMath.rotationLUT[c][1] * ProjectileState.projectileChildSpeed[a];
                    }
                    spawnProjectile(
                        ProjectileState.projectileOwnerIdx[a], -1, h.x, h.y, d.x, d.y, ProjectileState.projectileTmplSpeed[a], ProjectileState.projectileTmplElementType[a], ProjectileState.projectileTmplElementBonus[a],
                        ProjectileState.projectileTmplParam1[a], ProjectileState.projectileTmplAttackMode[a], ProjectileState.projectileTmplParam2[a], ProjectileState.projectileTmplAux1[a], ProjectileState.projectileTmplAux2[a], ProjectileState.projectileTmplAuxValueA[a], 
                        ProjectileState.projectileTmplAuxValueB[a], ProjectileState.projectileTmplAuxValueC[a], ProjectileState.projectileTmplDisplayStatA[a], ProjectileState.projectileTmplAuxValueD[a], ProjectileState.projectileTmplFlag[a], ProjectileState.projectileTmplParamTime[a], 
                        ProjectileState.projectileTmplHitCount[a], ProjectileState.projectileTmplEffectMode[a], ProjectileState.projectileTmplStatA[a], 0, 0, ProjectileState.projectileTmplExtraStat1[a], ProjectileState.projectileDamageMin[a], ProjectileState.projectileDamageMax[a], 
                        ProjectileState.projectileEffectType[a], ProjectileState.projectileEffectDuration[a], ProjectileState.projectileApplyMode[a], ProjectileState.projectileImpactSpawnMode[a], ProjectileState.projectileSpawnParam[a], ProjectileState.projectileTmplSpeed[a], 
                        ProjectileState.projectileTmplElementType[a], ProjectileState.projectileTmplElementBonus[a], ProjectileState.projectileTmplParam1[a], ProjectileState.projectileTmplAttackMode[a], ProjectileState.projectileTmplParam2[a], ProjectileState.projectileTmplAux1[a], 
                        ProjectileState.projectileTmplAux2[a], ProjectileState.projectileTmplAuxValueA[a], ProjectileState.projectileTmplAuxValueB[a], ProjectileState.projectileTmplAuxValueC[a], ProjectileState.projectileTmplDisplayStatA[a], ProjectileState.projectileTmplAuxValueD[a], 
                        ProjectileState.projectileTmplFlag[a], ProjectileState.projectileTmplParamTime[a], ProjectileState.projectileTmplHitCount[a], ProjectileState.projectileTmplEffectMode[a], ProjectileState.projectileTmplStatA[a], ProjectileState.projectileTmplExtraStat1[a], 
                        ProjectileState.projectileChildCount[a], ProjectileState.projectileChildSpeed[a]
                    );
                }
            }
            if (0 < ProjectileState.projectileImpactAge[a]) {
                ProjectileState.projectileImpactAge[a]--;
            }
            if (0 == ProjectileState.projectileImpactAge[a]) {
                ProjectileState.projectileImpactState[a] = 1;
            }
            if (10 == ProjectileState.projectileImpactSpawnMode[a]) {
                if (RMath.randFloat(60) < ProjectileState.projectileChildCount[a]) {
                    RMath.Vec2Norm(k);
                    RMath.Vec2Scale(k, .1 * ProjectileState.projectileChildSpeed[a]);
                    spawnProjectile(
                        ProjectileState.projectileOwnerIdx[a], -1, h.x, h.y, k.x, k.y, ProjectileState.projectileTmplSpeed[a], ProjectileState.projectileTmplElementType[a], ProjectileState.projectileTmplElementBonus[a], ProjectileState.projectileTmplParam1[a], 
                        ProjectileState.projectileTmplAttackMode[a], ProjectileState.projectileTmplParam2[a], ProjectileState.projectileTmplAux1[a], ProjectileState.projectileTmplAux2[a], ProjectileState.projectileTmplAuxValueA[a], ProjectileState.projectileTmplAuxValueB[a], 
                        ProjectileState.projectileTmplAuxValueC[a], ProjectileState.projectileTmplDisplayStatA[a], ProjectileState.projectileTmplAuxValueD[a], ProjectileState.projectileTmplFlag[a], ProjectileState.projectileTmplParamTime[a], ProjectileState.projectileTmplHitCount[a], 
                        ProjectileState.projectileTmplEffectMode[a], ProjectileState.projectileTmplStatA[a], 0, 0, ProjectileState.projectileTmplExtraStat1[a], ProjectileState.projectileDamageMin[a],
                        ProjectileState.projectileDamageMax[a], ProjectileState.projectileEffectType[a], ProjectileState.projectileEffectDuration[a], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                    );
                }
            } else if (11 == ProjectileState.projectileImpactSpawnMode[a]) {
                if (RMath.randFloat(60) < ProjectileState.projectileChildCount[a]) {
                    RMath.Vec2Norm(k);
                    p = RMath.randFloatRange(-ProjectileState.projectileSpawnParam[a], ProjectileState.projectileSpawnParam[a]);
                    h.x += k.x * p;
                    h.y += k.y * p;
                    RMath.Vec2Rotate(k);
                    RMath.Vec2Scale(k, .1 * ProjectileState.projectileChildSpeed[a]);
                    spawnProjectile(
                        ProjectileState.projectileOwnerIdx[a], -1, h.x, h.y, k.x, k.y, ProjectileState.projectileTmplSpeed[a], ProjectileState.projectileTmplElementType[a], ProjectileState.projectileTmplElementBonus[a], ProjectileState.projectileTmplParam1[a], 
                        ProjectileState.projectileTmplAttackMode[a], ProjectileState.projectileTmplParam2[a], ProjectileState.projectileTmplAux1[a], ProjectileState.projectileTmplAux2[a], ProjectileState.projectileTmplAuxValueA[a], ProjectileState.projectileTmplAuxValueB[a], 
                        ProjectileState.projectileTmplAuxValueC[a], ProjectileState.projectileTmplDisplayStatA[a], ProjectileState.projectileTmplAuxValueD[a], ProjectileState.projectileTmplFlag[a], ProjectileState.projectileTmplParamTime[a], ProjectileState.projectileTmplHitCount[a], 
                        ProjectileState.projectileTmplEffectMode[a], ProjectileState.projectileTmplStatA[a], 0, 0, ProjectileState.projectileTmplExtraStat1[a], ProjectileState.projectileDamageMin[a], ProjectileState.projectileDamageMax[a], ProjectileState.projectileEffectType[a], 
                        ProjectileState.projectileEffectDuration[a], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                    );
                }
            } else if (12 == ProjectileState.projectileImpactSpawnMode[a]) {
                if (RMath.randFloat(60) < ProjectileState.projectileChildCount[a]) {
                    c = RMath.floor(RMath.randFloat(512));
                    p = RMath.randFloatRange(.1 * ProjectileState.projectileSpawnParam[a], .1 * ProjectileState.projectileChildSpeed[a]);
                    k.x = RMath.rotationLUT[c][0] * p;
                    k.y = RMath.rotationLUT[c][1] * p;
                    spawnProjectile(
                        ProjectileState.projectileOwnerIdx[a], -1, h.x, h.y, k.x, k.y, ProjectileState.projectileTmplSpeed[a], ProjectileState.projectileTmplElementType[a], ProjectileState.projectileTmplElementBonus[a], ProjectileState.projectileTmplParam1[a], 
                        ProjectileState.projectileTmplAttackMode[a], ProjectileState.projectileTmplParam2[a], ProjectileState.projectileTmplAux1[a], ProjectileState.projectileTmplAux2[a], ProjectileState.projectileTmplAuxValueA[a], ProjectileState.projectileTmplAuxValueB[a], 
                        ProjectileState.projectileTmplAuxValueC[a], ProjectileState.projectileTmplDisplayStatA[a], ProjectileState.projectileTmplAuxValueD[a], ProjectileState.projectileTmplFlag[a], ProjectileState.projectileTmplParamTime[a], ProjectileState.projectileTmplHitCount[a], 
                        ProjectileState.projectileTmplEffectMode[a], ProjectileState.projectileTmplStatA[a], 0, 0, ProjectileState.projectileTmplExtraStat1[a], ProjectileState.projectileDamageMin[a], ProjectileState.projectileDamageMax[a], ProjectileState.projectileEffectType[a], 
                        ProjectileState.projectileEffectDuration[a], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                    );
                }
            } else if (13 == ProjectileState.projectileImpactSpawnMode[a]) {
                if (RMath.randFloat(60) < ProjectileState.projectileSpawnParam[a])
                    for (c = RMath.floor(RMath.randFloat(512)), b = 0; b < ProjectileState.projectileChildCount[a]; b++) {
                        c = c + RMath.floor(512 / ProjectileState.projectileChildCount[a]) & 511;
                        p = .1 * ProjectileState.projectileChildSpeed[a];
                        k.x = RMath.rotationLUT[c][0] * p;
                        k.y = RMath.rotationLUT[c][1] * p;
                        spawnProjectile(
                            ProjectileState.projectileOwnerIdx[a], -1, h.x, h.y, k.x, k.y, ProjectileState.projectileTmplSpeed[a], ProjectileState.projectileTmplElementType[a], ProjectileState.projectileTmplElementBonus[a], ProjectileState.projectileTmplParam1[a], 
                            ProjectileState.projectileTmplAttackMode[a], ProjectileState.projectileTmplParam2[a], ProjectileState.projectileTmplAux1[a], ProjectileState.projectileTmplAux2[a], ProjectileState.projectileTmplAuxValueA[a], ProjectileState.projectileTmplAuxValueB[a], 
                            ProjectileState.projectileTmplAuxValueC[a], ProjectileState.projectileTmplDisplayStatA[a], ProjectileState.projectileTmplAuxValueD[a], ProjectileState.projectileTmplFlag[a], ProjectileState.projectileTmplParamTime[a], ProjectileState.projectileTmplHitCount[a], 
                            ProjectileState.projectileTmplEffectMode[a], ProjectileState.projectileTmplStatA[a], 0, 0, ProjectileState.projectileTmplExtraStat1[a], ProjectileState.projectileDamageMin[a], ProjectileState.projectileDamageMax[a], ProjectileState.projectileEffectType[a], 
                            ProjectileState.projectileEffectDuration[a], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                        );
                    }
            } else if (14 == ProjectileState.projectileImpactSpawnMode[a]) {
                if (RMath.randFloat(60) < ProjectileState.projectileSpawnParam[a] && (c = findEnemyInArea(h.x, h.y, 200, 200), -1 != c))
                    for (d.x = EnemyState.enemyJointPosArray[c][EnemyState.enemyTargetJointIdx].x - h.x, d.y = EnemyState.enemyJointPosArray[c][EnemyState.enemyTargetJointIdx].y - h.y, RMath.Vec2Norm(d), b = 0; b < ProjectileState.projectileChildCount[a]; b++) {
                        c = RMath.floor(RMath.randFloat(512));
                        p = .1 * RMath.randFloat(ProjectileState.projectileChildCount[a] - 1);
                        k.x = d.x * ProjectileState.projectileChildSpeed[a] * .1 + RMath.rotationLUT[c][0] * p;
                        k.y = d.y * ProjectileState.projectileChildSpeed[a] * .1 + RMath.rotationLUT[c][1] * p;
                        spawnProjectile(
                            ProjectileState.projectileOwnerIdx[a], -1, h.x, h.y, k.x, k.y, ProjectileState.projectileTmplSpeed[a], ProjectileState.projectileTmplElementType[a], ProjectileState.projectileTmplElementBonus[a], ProjectileState.projectileTmplParam1[a], 
                            ProjectileState.projectileTmplAttackMode[a], ProjectileState.projectileTmplParam2[a], ProjectileState.projectileTmplAux1[a], ProjectileState.projectileTmplAux2[a], ProjectileState.projectileTmplAuxValueA[a], ProjectileState.projectileTmplAuxValueB[a], 
                            ProjectileState.projectileTmplAuxValueC[a], ProjectileState.projectileTmplDisplayStatA[a], ProjectileState.projectileTmplAuxValueD[a], ProjectileState.projectileTmplFlag[a], ProjectileState.projectileTmplParamTime[a], ProjectileState.projectileTmplHitCount[a], 
                            ProjectileState.projectileTmplEffectMode[a], ProjectileState.projectileTmplStatA[a], 0, 0, ProjectileState.projectileTmplExtraStat1[a], ProjectileState.projectileDamageMin[a], ProjectileState.projectileDamageMax[a], ProjectileState.projectileEffectType[a], 
                            ProjectileState.projectileEffectDuration[a], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                        );
                    }
            } else if (15 == ProjectileState.projectileImpactSpawnMode[a]) {
                if (RMath.randFloat(60) < ProjectileState.projectileChildCount[a]) {
                    RMath.Vec2Norm(k);
                    RMath.Vec2Scale(k, ProjectileState.projectileChildSpeed[a]);
                    spawnProjectile(
                        ProjectileState.projectileOwnerIdx[a], -1, h.x, h.y, k.x, k.y, ProjectileState.projectileTmplSpeed[a], ProjectileState.projectileTmplElementType[a], ProjectileState.projectileTmplElementBonus[a], ProjectileState.projectileTmplParam1[a], 
                        ProjectileState.projectileTmplAttackMode[a], ProjectileState.projectileTmplParam2[a], ProjectileState.projectileTmplAux1[a], ProjectileState.projectileTmplAux2[a], ProjectileState.projectileTmplAuxValueA[a], ProjectileState.projectileTmplAuxValueB[a], 
                        ProjectileState.projectileTmplAuxValueC[a], ProjectileState.projectileTmplDisplayStatA[a], ProjectileState.projectileTmplAuxValueD[a], ProjectileState.projectileTmplFlag[a], ProjectileState.projectileTmplParamTime[a], ProjectileState.projectileTmplHitCount[a], 
                        ProjectileState.projectileTmplEffectMode[a], ProjectileState.projectileTmplStatA[a], 0, 0, ProjectileState.projectileTmplExtraStat1[a], ProjectileState.projectileDamageMin[a], ProjectileState.projectileDamageMax[a], ProjectileState.projectileEffectType[a], 
                        ProjectileState.projectileEffectDuration[a], ProjectileState.projectileApplyMode[a], 20, ProjectileState.projectileSpawnParam[a], ProjectileState.projectileTmplSpeed[a], ProjectileState.projectileTmplElementType[a], ProjectileState.projectileTmplElementBonus[a], 
                        ProjectileState.projectileTmplParam1[a], ProjectileState.projectileTmplAttackMode[a], ProjectileState.projectileTmplParam2[a], ProjectileState.projectileTmplAux1[a], ProjectileState.projectileTmplAux2[a], ProjectileState.projectileTmplAuxValueA[a], ProjectileState.projectileTmplAuxValueB[a], 
                        ProjectileState.projectileTmplAuxValueC[a], ProjectileState.projectileTmplDisplayStatA[a], ProjectileState.projectileTmplAuxValueD[a], ProjectileState.projectileTmplFlag[a], ProjectileState.projectileTmplParamTime[a], ProjectileState.projectileTmplHitCount[a], 
                        ProjectileState.projectileTmplEffectMode[a], ProjectileState.projectileTmplStatA[a], ProjectileState.projectileTmplExtraStat1[a], 1, ProjectileState.projectileChildSpeed[a]
                    );
                }
            }
        }
    }
}


export function drawProjectiles() {
    // Eg
    var a, b, c, d, 
    f = new RMath.Vec2(), g = new RMath.Vec2(), h = new RMath.Vec2(), k = new RMath.Vec2(), p = new RMath.Vec2(), t = new RMath.Vec2(), 
    l, n, w, B;

    for (a = 0; a < ProjectileState.projectileCount; a++)
        if (!(0 < ProjectileState.projectileSpawnDelayFrames[a])) {
            b = (ProjectileState.projectileSpriteTileIndex[a] & 7) << 4;
            c = ProjectileState.projectileSpriteTileIndex[a] >> 3 << 4;
            if (1 == ProjectileState.projectileImpactState[a]) {
                d = RMath.floor((ProjectileState.projectileTintColor[a] >> 24 & 255) * (ProjectileState.projectileImpactLifetime[a] - ProjectileState.projectileImpactAge[a]) / ProjectileState.projectileImpactLifetime[a]) << 24 | ProjectileState.projectileTintColor[a] & 16777215;
            } else {
                d = ProjectileState.projectileTintColor[a];
            }
            if (0 < ProjectileState.projectileHitCooldownFrames[a]) {
                d = RMath.floor((d >> 24 & 255) / 2) << 24 | d & 16777215;
            }
            RenderingState.isSolidRender = ProjectileState.projectileSolidRenderMode[a];
            RenderingState.spriteAltRenderFlag = 1;
            if (0 > ProjectileState.projectileJointPair[a]) {
                p.set(ProjectileState.projectilePosition[a]);
                t.set(ProjectileState.projectileVelocity[a]);
            } else {
                l = ProjectileState.projectileOwnerIdx[a];
                n = ProjectileState.projectileJointPair[a] >> 8;
                w = ProjectileState.projectileJointPair[a] & 255;
                B = 0 <= l ? HeroesState.heroJointPositionsByHero : EnemyState.enemyJointPosArray;
                l = 0 <= l ? l : -l - 1;
                if (n == w) {
                    RMath.Vec2Add(p, B[l][n], ProjectileState.projectilePosition[a]);
                    t.set(ProjectileState.projectileVelocity[a]);
                } else {
                    RMath.Vec2Sub(g, B[l][w], B[l][n]);
                    RMath.Vec2Norm(g);
                    f.set(g);
                    RMath.Vec2Rotate(f);
                    p.x = f.x * ProjectileState.projectilePosition[a].x + g.x * ProjectileState.projectilePosition[a].y + B[l][n].x;
                    p.y = f.y * ProjectileState.projectilePosition[a].x + g.y * ProjectileState.projectilePosition[a].y + B[l][n].y;
                    t.x = f.x * ProjectileState.projectileVelocity[a].x + g.x * ProjectileState.projectileVelocity[a].y;
                    t.y = f.y * ProjectileState.projectileVelocity[a].x + g.y * ProjectileState.projectileVelocity[a].y;
                }
            }
            if (0 == ProjectileState.projectileDrawMode[a]) {
                drawSpriteSheetPartCentered(LoadedSprites.effectSpriteSheet, p.x, p.y, ProjectileState.projectileSpriteWidth[a], ProjectileState.projectileSpriteHeight[a], b, c, 16, 16, d);
            } else if (1 == ProjectileState.projectileDrawMode[a]) {
                g.set(t);
                RMath.Vec2Norm(g);
                f.set(g);
                RMath.Vec2Rotate(f);
                RMath.Vec2Scale(f, ProjectileState.projectileSpriteWidth[a] >> 1);
                RMath.Vec2Scale(g, ProjectileState.projectileSpriteHeight[a] >> 1);
                RMath.Vec2Sub(h, g, f);
                RMath.Vec2Add(k, g, f);
                w = p.x + h.x;
                B = p.y + h.y;
                var M = b,
                    J = c,
                    y = p.x + k.x,
                    x = p.y + k.y,
                    K = b + 16,
                    ba = c,
                    U = p.x - h.x,
                    na = p.y - h.y,
                    Fa = b + 16,
                    Ga = c + 16,
                    Ca = p.x - k.x,
                    ua = p.y - k.y,
                    fb = b,
                    ob = c + 16;
                l = d;
                var Bb = LoadedSprites.effectSpriteSheet;
                w <<= 16;
                B <<= 16;
                y <<= 16;
                x <<= 16;
                U <<= 16;
                na <<= 16;
                Ca <<= 16;
                ua <<= 16;
                M *= 65535;
                J *= 65535;
                K *= 65535;
                ba *= 65535;
                Fa *= 65535;
                Ga *= 65535;
                fb *= 65535;
                ob *= 65535;
                n = 28311552;
                c = 0;
                n > B && (n = B);
                n > x && (n = x);
                n > na && (n = na);
                n > ua && (n = ua);
                c < B && (c = B);
                c < x && (c = x);
                c < na && (c = na);
                c < ua && (c = ua);
                n >>= 16;
                c >>= 16;
                0 > n && (n = 0);
                432 <= c && (c = 431);
                for (b = n; b <= c; b++) RenderingState.scanlineMinX[b] = 640, RenderingState.scanlineMaxX[b] = -1;
                rasterizeLineToScanlineBounds(w, B, M, J, y, x, K, ba);
                rasterizeLineToScanlineBounds(y, x, K, ba, U, na, Fa, Ga);
                rasterizeLineToScanlineBounds(U, na, Fa, Ga, Ca, ua, fb, ob);
                rasterizeLineToScanlineBounds(Ca, ua, fb, ob, w, B, M, J);
                w = Bb.g;
                B = Bb.h;
                M = l >> 24 & 255;
                J = l >> 16 & 255;
                y = l >> 8 & 255;
                x = l & 255;
                for (b = n; b <= c; b++){  
                    l = RenderingState.scanlineMaxX[b] - RenderingState.scanlineMinX[b] + 1;
                    n = RMath.floor((RenderingState.scanlineTexUEnd[b] - RenderingState.scanlineTexUStart[b]) / l);
                    Fa = RMath.floor((RenderingState.scanlineTexVEnd[b] - RenderingState.scanlineTexVStart[b]) / l);
                    U = RenderingState.scanlineTexUStart[b];
                    na = RenderingState.scanlineTexVStart[b];
                    if (0 > RenderingState.scanlineMinX[b]) {
                        U += n * -RenderingState.scanlineMinX[b];
                        na += Fa * -RenderingState.scanlineMinX[b];
                        RenderingState.scanlineMinX[b] = 0;
                    }
                    if (640 <= RenderingState.scanlineMaxX[b]) {
                        RenderingState.scanlineMaxX[b] = 639;
                    }
                    K = 640 * b + RenderingState.scanlineMinX[b];
                    for (ba = K + (RenderingState.scanlineMaxX[b] - RenderingState.scanlineMinX[b]); K <= ba; K++, U += n, na += Fa) {
                        l = w[(na >> 16) * B + (U >> 16)];
                        if (0 != l) {
                            l = (l & 255) * M >> 8;
                            if (1 == RenderingState.isSolidRender) {
                                Ga = RenderingState.frameBufferArray[K] >> 16 & 255;
                                Ga = ((J - Ga) * l >> 8) + Ga;
                                Ca = RenderingState.frameBufferArray[K] >> 8 & 255;
                                Ca = ((y - Ca) * l >> 8) + Ca;
                                ua = RenderingState.frameBufferArray[K] & 255;
                                ua = ((x - ua) * l >> 8) + ua;
                                RenderingState.frameBufferArray[K] = Ga << 16 | Ca << 8 | ua;
                            } else if (2 == RenderingState.isSolidRender) {
                                Ga = (RenderingState.frameBufferArray[K] >> 16 & 255) + (J * l >> 8);
                                if (255 < Ga) {
                                    Ga = 255;
                                }
                                Ca = (RenderingState.frameBufferArray[K] >> 8 & 255) + (y * l >> 8);
                                if (255 < Ca) {
                                    Ca = 255;
                                }
                                ua = (RenderingState.frameBufferArray[K] & 255) + (x * l >> 8);
                                if (255 < ua) {
                                    ua = 255;
                                }
                                RenderingState.frameBufferArray[K] = Ga << 16 | Ca << 8 | ua;
                            } else if (3 == RenderingState.isSolidRender) {
                                Ga = (RenderingState.frameBufferArray[K] >> 16 & 255) - (J * l >> 8);
                                if (Ga < 0) Ga = 0;
                                Ca = (RenderingState.frameBufferArray[K] >> 8 & 255) - (y * l >> 8);
                                if (Ca < 0) Ca = 0;
                                ua = (RenderingState.frameBufferArray[K] & 255) - (x * l >> 8);
                                if (ua < 0) ua = 0;
                                RenderingState.frameBufferArray[K] = Ga << 16 | Ca << 8 | ua;
                            }
                        }
                    }
                }
            } else if (2 == ProjectileState.projectileDrawMode[a]) {
                RenderingState.spriteAltRenderFlag = 0;
                l = -ProjectileState.projectileOwnerIdx[a] - 1;
                n = enemyCatalog[EnemyState.enemyTypeArray[l]][EnemyProps.BehaviorIdx];
                w = enemyCatalog[EnemyState.enemyTypeArray[l]][EnemyProps.SpriteIndex];
                l = RMath.max(enemyCatalog[EnemyState.enemyTypeArray[l]][EnemyProps.DrawScale], 1);
                B = 0;
                if (n == BehaviorTypes.Slime || n == BehaviorTypes.BoxSnake) B = -enemySpriteAnchorYBySpriteIndex[w] * l + 1;
                drawSpriteSheetPartCentered(LoadedSprites.enemySpriteSheet, p.x, p.y + B, ProjectileState.projectileSpriteWidth[a], ProjectileState.projectileSpriteHeight[a], b, c, 16, 16, d);
            }
            RenderingState.spriteAltRenderFlag = RenderingState.isSolidRender = 0;
        }
}



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


export function clearDrops() { // bj
    DropState.dropScore = DropState.dropCount = 0
}


export function spawnDrop(_x, _y, _tidx, _val, _meta) { // Gh
    if (100 != DropState.dropCount) {
        _x = RMath.clamp(_x, 16, 623);
        _y = RMath.clamp(_y, 8, 351);
        RMath.Vec2Set(DropState.dropPos[DropState.dropCount], _x, _y);
        DropState.dropVel[DropState.dropCount].x = mouseXCurrent < _x ?
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



export function canvasDrawImage(_canvas, _dx, _dy) {
    try {
        CanvasState.element = document.getElementById("cv"); 
        CanvasState.context2d = CanvasState.element.getContext("2d");
        CanvasState.context2d.putImageData(_canvas, _dx, _dy);
    } catch (d) { }
}


export function setupAnimRequest() {
    let requestAnim = requestAnimationFrame || mozRequestAnimationFrame || webkitRequestAnimationFrame || oRequestAnimationFrame || msRequestAnimationFrame;
    if (GameState.requestAnim) {
        GameState.requestAnim(setupAnimRequest);
        GameState.requestAnimCallCount++;
        GameState.timestampAnim = Date.now();
        var a = RMath.floor(60 * (GameState.timestampAnim - GameState.lastTimestamp) / 1E3 + .5);
        if (0 > a || 60 <= a) {
            GameState.requestAnimCallCount = 0;
            GameState.currentFPS = GameState.frameCountThisSecond;
            GameState.frameCountThisSecond = 0;
            GameState.lastTimestamp = GameState.timestampAnim;
            a = 0;
        } else if (a == GameState.lastAnimFrameBucket) {
            return;
        }
        GameState.frameCountThisSecond++;
        GameState.lastAnimFrameBucket = a;
        GameState.totalFrames++;
    }
    isMouseClicked = 0 == wasMouseDown && 1 == isMouseDown;
    isMouseReleased = 1 == wasMouseDown && 0 == isMouseDown;
    if (wasMouseDown = isMouseDown) {
        mouseHoldFrames++;
    } else {
        mouseHoldFrames = 0;
    }
    mouseXCurrent = mouseXRel;
    mouseYCurrent = mouseYRel;
    for (a = 0; 256 > a; a++) {
        keyJustPressed[a] = keyPressPending[a];
        keyPressPending[a] = false;
    }
    
    RMath.setRandSeed((RMath.getRandSeed() + RMath.floor(1024 * RMath.rand())) & 1023);
    RMath.setRandSeedStep(RMath.floor(512 * RMath.rand()) | 1);

    drawCanvas();

    var canvasBufferLength = Consts.CANVAS_WIDTH * Consts.CANVAS_HEIGHT;
    if (1 <= RenderingState.screenFadeFactor){
        for (a = 0; a < canvasBufferLength; a++) {
            CanvasState.canvasBuffer[a] = 4278190080 | 
            (RenderingState.frameBufferArray[a] & 255) << 16 | 
            RenderingState.frameBufferArray[a] & 65280 | 
            RenderingState.frameBufferArray[a] >> 16 & 255;
        }
    } else {
        for (a = 0; a < canvasBufferLength; a++) {
            CanvasState.canvasBuffer[a] = 4278190080 | 
            (RenderingState.frameBufferArray[a] & 255) * RenderingState.screenFadeFactor << 16 | 
            (RenderingState.frameBufferArray[a] >> 8 & 255) * RenderingState.screenFadeFactor << 8 | 
            (RenderingState.frameBufferArray[a] >> 16 & 255) * RenderingState.screenFadeFactor << 0;
        }
    }
    canvasDrawImage(CanvasState.canvasImage, 0, 0);
    GameState.requestAnim || setTimeout(setupAnimRequest, computeFrameDelay());
}

/** Checks hostname */
export function hostnameCheck() {
    if (Consts.hostname.length != Consts.targetHostname.length) 
        return true;
    for (GameState.hostNameUnchecked = 0; Consts.hostnameCheckIdx < Consts.hostname.length; Consts.hostnameCheckIdx++)
        if (Consts.hostname[Consts.hostnameCheckIdx] != Consts.targetHostname[Consts.hostnameCheckIdx]) 
            return true;
    return false
}



export function computeFrameDelay() { // ag
    GameState.timestampAnim = Date.now();
    let a = RMath.clamp(GameState.nextFrameTime - GameState.timestampAnim, 5, GameState.frameInteval);
    GameState.frameCountThisSecond++;
    GameState.totalFrames++;
    GameState.nextFrameTime += GameState.frameInteval;
    if (GameState.timestampAnim + a >= GameState.secondWindowDeadline || GameState.timestampAnim < GameState.lastTimestamp) GameState.currentFPS = GameState.frameCountThisSecond, GameState.frameCountThisSecond = 0, GameState.nextFrameTime = GameState.timestampAnim + GameState.frameInteval, GameState.secondWindowDeadline = GameState.timestampAnim + 1E3;
    GameState.lastTimestamp = GameState.timestampAnim;
    return a
}



export function drawText(_font, px, py, text, color, outlineColor) {
    let h, k, p, t, l, n, w, B = 640 - _font.c,
        M = _font.i.h - _font.c,
        J = _font.i.g,
        y = -1 < color ? 16777215 : 1,
        x = -1 < outlineColor ? 0 : 1,
        K = text.length;
    for (h = 0; h < K; h++, px += _font.c + _font.b) {
        k = text.charCodeAt(h) - 32;
        if (0 != _font.a) {
            px -= charKerningBefore[_font.a - 1][k];
        }
        l = 640 * py + px;
        n = k * _font.c;
        for (t = _font.j; 0 < t; t--, l += B, n += M)
            for (p = _font.c; 0 < p; p--, l++, n++) {
                w = J[n];
                if (w == y) {
                    RenderingState.frameBufferArray[l] = color;
                } else if (w == x) {
                    RenderingState.frameBufferArray[l] = outlineColor;
                }
            }
        if (0 != _font.a) {
            px -= charKerningAfter[_font.a - 1][k];
        }
    }
    _font.b = 0;
    _font.a = 0;
}

export function drawTextCentered(font, x, y, text, color, outlineColor) {
    x -= text.length * (font.c + font.b) >> 1;
    y -= font.j >> 1;
    drawText(font, x, y, text, color, outlineColor)
}

export function drawMedTextNoOutline(x, y, text, color) {
    let f = LoadedFonts.gameFontMed;
    f.b = -1;
    f.a = 3;
    drawText(f, x, y, text, color, 0)
}

export function drawSmallTextNoOutline(x, y, text, color) {
    let f = LoadedFonts.gameFontSmall;
    f.b = -1;
    f.a = 0;
    drawTextCentered(f, x, y, text, color, -1)
}

export function drawScaledTintedText(font, x, y, text, fgR, fgG, fgB, fgAlpha, altR, altG, altB, altAlpha, glyphWidth, glyphHeight) { // Tg
    fgR = fgR * fgAlpha >> 8;
    fgG = fgG * fgAlpha >> 8;
    fgB = fgB * fgAlpha >> 8;
    fgAlpha = 255 - fgAlpha;
    altR = altR * altAlpha >> 8;
    altG = altG * altAlpha >> 8;
    altB = altB * altAlpha >> 8;
    altAlpha = 255 - altAlpha;
    let idx_0, J, idx_2, idx_1, K, ba, U, na, Fa = 640 - glyphWidth,
        Ga = ~~((font.c << 8) / glyphWidth),
        Ca = font.i.g,
        ua = 255 != fgAlpha ? 16777215 : 1,
        fb = 255 != altAlpha ? 0 : 1,
        ob = text.length;
    for (idx_0 = 0; idx_0 < ob; idx_0++, x += glyphWidth + font.b) {
        J = text.charCodeAt(idx_0) - 32;
        if (0 != font.a) {
            x -= ~~(charKerningBefore[font.a - 1][J] * glyphWidth / font.c);
        }
        K = 640 * y + x;
        U = J * font.c;
        for (idx_1 = 0; idx_1 < glyphHeight; idx_1++, K += Fa)
            for (ba = ~~(idx_1 * font.j / glyphHeight) * font.i.h + U << 8, idx_2 = 0; idx_2 < glyphWidth; idx_2++, K++, ba += Ga) {
                na = Ca[ba >> 8];
                if (na == ua) {
                    RenderingState.frameBufferArray[K] = fgR + ((RenderingState.frameBufferArray[K] >> 16 & 255) * fgAlpha >> 8) << 16 | fgG + ((RenderingState.frameBufferArray[K] >> 8 & 255) * fgAlpha >> 8) << 8 | fgB + ((RenderingState.frameBufferArray[K] & 255) * fgAlpha >> 8);
                } else if (na == fb) {
                    RenderingState.frameBufferArray[K] = altR + ((RenderingState.frameBufferArray[K] >> 16 & 255) * altAlpha >> 8) << 16 | altG + ((RenderingState.frameBufferArray[K] >> 8 & 255) * altAlpha >> 8) << 8 | altB + ((RenderingState.frameBufferArray[K] & 255) * altAlpha >> 8);
                }
            }
        if (0 != font.a) {
            x -= ~~(charKerningAfter[font.a - 1][J] * glyphWidth / font.c);
        }
    }
    font.b = 0;
    font.a = 0;
}

export function drawScaledTintedTextCentered(font, x, y, text, fgR, fgG, fgB, fgAlpha, altR, altG, altB, altAlpha, glyphWidth, glyphHeight) { // Jg
    x -= text.length * (glyphWidth + font.b) >> 1;
    drawScaledTintedText(font, x, y - (glyphHeight >> 1), text, fgR, fgG, fgB, fgAlpha, altR, altG, altB, altAlpha, glyphWidth, glyphHeight)
}


export function drawLine(x1, y1, x2, y2, color) {
    x2 -= x1;
    y2 -= y1;
    var g, h;
    if (RMath.abs(x2) >= RMath.abs(y2)) {
        h = RMath.floor(RMath.abs(x2));
        if (0 != h) {
            y2 = RMath.floor(65536 * y2 / h);
        }
        x2 = 0 <= x2 ? 65536 : -65536;
    } else {
        h = RMath.floor(RMath.abs(y2));
        if (0 != h) {
            x2 = RMath.floor(65536 * x2 / h);
        }
        y2 = 0 <= y2 ? 65536 : -65536;
    }

    x1 = RMath.floor(65536 * x1) + 32768;
    y1 = RMath.floor(65536 * y1) + 32768;
    if (0 == RenderingState.isSolidRender)
        for (; 0 <= h; h--, x1 += x2, y1 += y2)
            0 > x1 || 640 <= x1 >> 16 || 0 > y1 || 432 <= y1 >> 16 || (
                g = 640 * (y1 >> 16) + (x1 >> 16), RenderingState.frameBufferArray[g] = color);
    else {
        var k = color >> 24 & 255,
            p = (color >> 16 & 255) * k >> 8,
            t = (color >> 8 & 255) * k >> 8;
        color = (color & 255) * k >> 8;
        for (k = 255 - k; 0 <= h; h--, x1 += x2, y1 += y2)
            0 > x1 || 640 <= x1 >> 16 || 0 > y1 || 432 <= y1 >> 16 || (
                g = 640 * (y1 >> 16) + (x1 >> 16),
                RenderingState.frameBufferArray[g] = p + ((RenderingState.frameBufferArray[g] >> 16 & 255) * k >> 8) << 16 |
                t + ((RenderingState.frameBufferArray[g] >> 8 & 255) * k >> 8) << 8 |
                color + ((RenderingState.frameBufferArray[g] & 255) * k >> 8));

    }
}

export function drawRectOutline(x1, y1, w, h, color) {
    w--;
    h--;
    drawLine(x1, y1, x1 + w, y1, color);
    drawLine(x1, y1 + h, x1 + w, y1 + h, color);
    drawLine(x1, y1, x1, y1 + h, color);
    drawLine(x1 + w, y1, x1 + w, y1 + h, color)
}

export function drawRectOutlineCentered(a, b, c, d, f) {
    drawRectOutline(a - (c >> 1), b - (d >> 1), c, d, f)
}

export function drawRect(_x, _y, _w, _h, _color) {
    var g, h, k;
    _w = 640 < _x + _w ? 640 : ~~(_x + _w);
    _h = 432 < _y + _h ? 432 : ~~(_y + _h);
    _x = 0 > _x ? 0 : ~~_x;
    _y = 0 > _y ? 0 : ~~_y;
    h = 640 * _y + _x;
    k = 640 - (_w - _x);

    if (0 == RenderingState.isSolidRender)
        for (; _y < _h; _y++, h += k)
            for (g = _x; g < _w; g++, h++) RenderingState.frameBufferArray[h] = _color;
    else {
        var p = _color >> 24 & 255,
            t = (_color >> 16 & 255) * p >> 8,
            l = (_color >> 8 & 255) * p >> 8;
        _color = (_color & 255) * p >> 8;
        for (p = 255 - p; _y < _h; _y++, h += k)
            for (g = _x; g < _w; g++, h++)
                RenderingState.frameBufferArray[h] = t + ((RenderingState.frameBufferArray[h] >> 16 & 255) * p >> 8) << 16 |
                    l + ((RenderingState.frameBufferArray[h] >> 8 & 255) * p >> 8) << 8 |
                    _color + ((RenderingState.frameBufferArray[h] & 255) * p >> 8)
    }
}

export function drawRectCentered(x, y, w, h, color) {
    drawRect(x - (w >> 1), y - (h >> 1), w, h, color)
}

export function drawSpriteSheetPart(spriteSheet, _x, _y, drawWidth, drawHeight, sourceX, sourceY, sourceWidth, sourceHeight, tintColor) {
    var l = spriteSheet.g, n, w, B, M;
    sourceWidth = ~~((sourceWidth << 8) / drawWidth);
    sourceHeight = ~~((sourceHeight << 8) / drawHeight);
    sourceX <<= 8;
    sourceY <<= 8;
    if (0 > _x) {
        sourceX += ~~(sourceWidth * -_x);
    }
    if (0 > _y) {
        sourceY += ~~(sourceHeight * -_y);
    }
    drawWidth = 640 < _x + drawWidth ? 640 : ~~(_x + drawWidth);
    drawHeight = 432 < _y + drawHeight ? 432 : ~~(_y + drawHeight);
    _x = 0 > _x ? 0 : ~~_x;
    _y = 0 > _y ? 0 : ~~_y;
    w = 640 * _y + _x;
    B = 640 - (drawWidth - _x);
    var J, y, x,
        K = tintColor >> 24 & 255, ba = tintColor >> 16 & 255, U = tintColor >> 8 & 255, na = tintColor & 255;
    if (!RenderingState.spriteAltRenderFlag) {
        for (; _y < drawHeight; _y++, w += B, sourceY += sourceHeight) {
            for (M = ((sourceY >> 8) * spriteSheet.h << 8) + sourceX, n = _x; n < drawWidth; n++, w++, M += sourceWidth) {
                tintColor = l[M >> 8];
            if (-1 != tintColor) {
                J = ba * (tintColor >> 16 & 255) >> 8;
                y = U * (tintColor >> 8 & 255) >> 8;
                x = na * (tintColor & 255) >> 8;
                if (0 == RenderingState.isSolidRender) {
                    RenderingState.frameBufferArray[w] = J << 16 | y << 8 | x;
                } else if (1 == RenderingState.isSolidRender) {
                    tintColor = RenderingState.frameBufferArray[w] >> 16 & 255;
                    J = ((J - tintColor) * K >> 8) + tintColor;
                    tintColor = RenderingState.frameBufferArray[w] >> 8 & 255;
                    y = ((y - tintColor) * K >> 8) + tintColor;
                    tintColor = RenderingState.frameBufferArray[w] & 255;
                    x = ((x - tintColor) * K >> 8) + tintColor;
                    RenderingState.frameBufferArray[w] = J << 16 | y << 8 | x;
                } else if (2 == RenderingState.isSolidRender) {
                    J = (RenderingState.frameBufferArray[w] >> 16 & 255) + (J * K >> 8);
                    if (255 < J) {
                        if (J = 255) {
                            y = (RenderingState.frameBufferArray[w] >> 8 & 255) + (y * K >> 8);
                            if (255 < y) {
                                if (y = 255) {
                                    x = (RenderingState.frameBufferArray[w] & 255) + (x * K >> 8);
                                    if (255 < x) {
                                        if (x = 255) {
                                            RenderingState.frameBufferArray[w] = J << 16 | y << 8 | x;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            }
        }
    } else if (1 == RenderingState.spriteAltRenderFlag) {
        for (; _y < drawHeight; _y++, w += B, sourceY += sourceHeight) {
            for (M = ((sourceY >> 8) * spriteSheet.h << 8) + sourceX, n = _x; n < drawWidth; n++, w++, M += sourceWidth) {
                tintColor = l[M >> 8];
                if (0 != tintColor) {
                    tintColor = (tintColor & 255) * K >> 8;
                    if (1 == RenderingState.isSolidRender) {
                        J = RenderingState.frameBufferArray[w] >> 16 & 255;
                        J = ((ba - J) * tintColor >> 8) + J;
                        y = RenderingState.frameBufferArray[w] >> 8 & 255;
                        y = ((U - y) * tintColor >> 8) + y;
                        x = RenderingState.frameBufferArray[w] & 255;
                        x = ((na - x) * tintColor >> 8) + x;
                        RenderingState.frameBufferArray[w] = J << 16 | y << 8 | x;
                    } else if (2 == RenderingState.isSolidRender) {
                        J = (RenderingState.frameBufferArray[w] >> 16 & 255) + (ba * tintColor >> 8);
                        if (255 < J) {
                            J = 255;
                        }
                        y = (RenderingState.frameBufferArray[w] >> 8 & 255) + (U * tintColor >> 8);
                        if (255 < y) {
                            y = 255;
                        }
                        x = (RenderingState.frameBufferArray[w] & 255) + (na * tintColor >> 8);
                        if (255 < x) {
                            x = 255;
                        }
                        RenderingState.frameBufferArray[w] = J << 16 | y << 8 | x;
                    } else if (3 == RenderingState.isSolidRender) {
                        J = (RenderingState.frameBufferArray[w] >> 16 & 255) - (ba * tintColor >> 8);
                        if (0 > J) {
                            if (J = 0) {
                                y = (RenderingState.frameBufferArray[w] >> 8 & 255) - (U * tintColor >> 8);
                                if (0 > y) {
                                    if (y = 0) {
                                        x = (RenderingState.frameBufferArray[w] & 255) - (na * tintColor >> 8);
                                        if (0 > x) {
                                            if (x = 0) {
                                                RenderingState.frameBufferArray[w] = J << 16 | y << 8 | x;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } else if (2 == RenderingState.spriteAltRenderFlag) {
        for (; _y < drawHeight; _y++, w += B, sourceY += sourceHeight) {
            for (M = ((sourceY >> 8) * spriteSheet.h << 8) + sourceX, n = _x; n < drawWidth; n++, w++, M += sourceWidth) {
                tintColor = l[M >> 8];
                if (0 < tintColor) {
                    J = tintColor >> 16 & 255;
                    y = tintColor >> 8 & 255;
                    x = tintColor & 255;
                    RenderingState.frameBufferArray[w] = J == y && y == x ? ba * J >> 8 << 16 | U * y >> 8 << 8 | na * x >> 8 : tintColor;
                }
            }
        }
    }
}

export function drawSpriteSheetPartCentered(spriteSheet, x, y, drawWidth, drawHeight, sourceX, sourceY, sourceWidth, sourceHeight, tintColor) {
    drawSpriteSheetPart(spriteSheet, x - (drawWidth >> 1), y - (drawHeight >> 1), drawWidth, drawHeight, sourceX, sourceY, sourceWidth, sourceHeight, tintColor)
}

// whiteRCol: replacement color (integer) written when the source pixel equals white (0xFFFFFF / 16777215)
// grayRCol: replacement color (integer) written when the source pixel equals gray marker (0x666666 / 6710886).
export function drawSpriteSheetPartTintedScaled(spriteSheet, _px, _py, drawWidth, drawHeight, sourceX, sourceY, sourceWidth, sourceHeight, whiteRCol, grayRCol, copySource) {
    // Qg
    let w = spriteSheet.g,
        B, M, J, y, x;
    sourceWidth = ~~((sourceWidth << 8) / drawWidth);
    sourceHeight = ~~((sourceHeight << 8) / drawHeight);
    sourceX <<= 8;
    sourceY <<= 8;
    if (0 > _px) {
        sourceX += ~~(sourceWidth * -_px);
    }
    if (0 > _py) {
        sourceY += ~~(sourceHeight * -_py);
    }
    drawWidth = 640 < _px + drawWidth ? 640 : ~~(_px + drawWidth);
    drawHeight = 432 < _py + drawHeight ? 432 : ~~(_py + drawHeight);
    _px = 0 > _px ? 0 : ~~_px;
    _py = 0 > _py ? 0 : ~~_py;
    M = 640 * _py + _px;
    for (J = 640 - (drawWidth - _px); _py < drawHeight; _py++, M += J, sourceY += sourceHeight)
        for (y = ((sourceY >> 8) * spriteSheet.h << 8) + sourceX, B = _px; B < drawWidth; B++, M++, y += sourceWidth) {
            x = w[y >> 8];
            if (-1 != x) {
                if (16777215 == x) {
                    RenderingState.frameBufferArray[M] = whiteRCol;
                } else if (6710886 == x) {
                    RenderingState.frameBufferArray[M] = grayRCol;
                } else if (copySource) {
                    RenderingState.frameBufferArray[M] = x;
                }
            }
        }
}

export function drawEnemyScaledSprite(centerX, centerY, dstWidth, dstHeight, srcX, srcY, srcHeight, replaceColW, replaceColAlt, blendAmount) {
    // fl
    centerX -= dstWidth >> 1;
    centerY -= dstHeight >> 1;
    let l, n = LoadedSprites.enemySpriteSheet.g,
        w, B, M, J, y, x, K;
    l = ~~(4096 / dstWidth);
    srcHeight = ~~((srcHeight << 8) / dstHeight);
    srcX <<= 8;
    srcY <<= 8;
    if (0 > centerX) {
        srcX += ~~(l * -centerX);
    }
    if (0 > centerY) {
        srcY += ~~(srcHeight * -centerY);
    }
    dstWidth = 640 < centerX + dstWidth ? 640 : ~~(centerX + dstWidth);
    dstHeight = 432 < centerY + dstHeight ? 432 : ~~(centerY + dstHeight);
    centerX = 0 > centerX ? 0 : ~~centerX;
    centerY = 0 > centerY ? 0 : ~~centerY;
    B = 640 * centerY + centerX;
    for (M = 640 - (dstWidth - centerX); centerY < dstHeight; centerY++, B += M, srcY += srcHeight)
        for (J = ((srcY >> 8) * LoadedSprites.enemySpriteSheet.h << 8) + srcX, w = centerX; w < dstWidth; w++, B++, J += l) {
            y = n[J >> 8];
            if (-1 != y) {
                if (255 == blendAmount) {
                    RenderingState.frameBufferArray[B] = 16777215 == y ? replaceColW : replaceColAlt;
                } else {
                    if (16777215 == y) {
                        y = RenderingState.frameBufferArray[B] >> 16 & 255;
                        x = (((replaceColW >> 16 & 255) - y) * blendAmount >> 8) + y;
                        y = RenderingState.frameBufferArray[B] >> 8 & 255;
                        K = (((replaceColW >> 8 & 255) - y) * blendAmount >> 8) + y;
                        y = RenderingState.frameBufferArray[B] & 255;
                        y = (((replaceColW & 255) - y) * blendAmount >> 8) + y;
                    } else {
                        y = RenderingState.frameBufferArray[B] >> 16 & 255;
                        x = (((replaceColAlt >> 16 & 255) - y) * blendAmount >> 8) + y;
                        y = RenderingState.frameBufferArray[B] >> 8 & 255;
                        K = (((replaceColAlt >> 8 & 255) - y) * blendAmount >> 8) + y;
                        y = RenderingState.frameBufferArray[B] & 255;
                        y = (((replaceColAlt & 255) - y) * blendAmount >> 8) + y;
                    }
                    RenderingState.frameBufferArray[B] = x << 16 | K << 8 | y;
                }
            }
        }
}

export function drawItemSpriteTinted(_px, _py, _sourceX, _sourceY, _defaultColor, _tintColor) {
    // gh
    let h = 16, k = 16, p, t, 
        l = LoadedSprites.itemsSpriteSheet.g, n, w, B, M;
    p = ~~(4096 / h);
    t = ~~(4096 / k);
    _sourceX <<= 8;
    _sourceY <<= 8;
    if (0 > _px) {
        _sourceX += ~~(p * -_px);
    }
    if (0 > _py) {
        _sourceY += ~~(t * -_py);
    }
    h = 640 < _px + h ? 640 : ~~(_px + h);
    k = 432 < _py + k ? 432 : ~~(_py + k);
    _px = 0 > _px ? 0 : ~~_px;
    _py = 0 > _py ? 0 : ~~_py;
    n = 640 * _py + _px;
    w = 640 - (h - _px);
    let J, y, x = _tintColor >> 16 & 255, K = _tintColor >> 8 & 255;
    for (ba = _tintColor & 255; _py < k; _py++, n += w, _sourceY += t) {
        for (B = ((_sourceY >> 8) * LoadedSprites.itemsSpriteSheet.h << 8) + _sourceX, _tintColor = _px; _tintColor < h; _tintColor++, n++, B += p) {
            M = l[B >> 8];
            if (0 < M) {
                J = M >> 16 & 255;
                y = M >> 8 & 255;
                M &= 255;
                RenderingState.frameBufferArray[n] = J == y && y == M ? x * J >> 8 << 16 | K * y >> 8 << 8 | ba * M >> 8 : _defaultColor;
            }
        }
    }
}

export function fillEmptyPixelsRect(_left, _top, _width, _height, _color) { // Xg
    var g, h;
    g = 640 * _top + _left;
    h = 640 - _width;
    for (_top = 0; _top < _height; _top++, g += h)
        for (_left = 0; _left < _width; _left++, g++)
            if (0 == RenderingState.frameBufferArray[g]) {
                RenderingState.frameBufferArray[g] = _color;
            }
}

export function updateScanlineBoundsFromLine(_x0, _y0, _x1, _y1) { // Li
    var f, g, h;
    if (RMath.abs(_x1 - _x0) >= RMath.abs(_y1 - _y0)) {
        _x0 >>= 16;
        _x1 >>= 16;
        f = RMath.abs(_x1 - _x0);
        _x1 = _x0 <= _x1 ? 1 : -1;
        for (h = RMath.floor((_y1 - _y0) / RMath.max(f, 1)); 0 <= f; f--, _x0 += _x1, _y0 += h) {
            if (0 == f) {
                _y0 = _y1;
            }
            g = _y0 >> 16;
            if (!(0 > g || 432 <= g)) {
                if (RenderingState.scanlineMinX[g] > _x0) {
                    RenderingState.scanlineMinX[g] = _x0;
                }
                if (RenderingState.scanlineMaxX[g] < _x0) {
                    RenderingState.scanlineMaxX[g] = _x0;
                }
            }
        }
    } else {
        _y0 >>= 16;
        _y1 >>= 16;
        f = RMath.abs(_y1 - _y0);
        h = RMath.floor((_x1 - _x0) / RMath.max(f, 1));
        for (_y1 = _y0 <= _y1 ? 1 : -1; 0 <= f; f--, _x0 += h, _y0 += _y1) {
            if (0 == f) {
                _x0 = _x1;
            }
            g = _x0 >> 16;
            if (!(0 > _y0 || 432 <= _y0)) {
                if (RenderingState.scanlineMinX[_y0] > g) {
                    RenderingState.scanlineMinX[_y0] = g;
                }
                if (RenderingState.scanlineMaxX[_y0] < g) {
                    RenderingState.scanlineMaxX[_y0] = g;
                }
            }
        }
    }
}

export function rasterizeLineToScanlineBounds(_x0, _y0, _ax0, _ay0, _x1, _y1, _ax1, _ay1) { // mm
    var p = (RMath.max(RMath.abs(_x1 - _x0), RMath.abs(_y1 - _y0)) >> 16) + 1;
    _x1 = RMath.floor((_x1 - _x0) / p);
    _y1 = RMath.floor((_y1 - _y0) / p);
    _ax1 = RMath.floor((_ax1 - _ax0) / p);
    _ay1 = RMath.floor((_ay1 - _ay0) / p);
    for (var t, l, n = 0; n < p; n++, _x0 += _x1, _y0 += _y1, _ax0 += _ax1, _ay0 += _ay1) {
        t = _x0 >> 16;
        l = _y0 >> 16;
        if (!(0 > l || 432 <= l)) {
            if (RenderingState.scanlineMinX[l] > t) {
                RenderingState.scanlineMinX[l] = t;
                RenderingState.scanlineTexUStart[l] = _ax0;
                RenderingState.scanlineTexVStart[l] = _ay0;
            }
            if (RenderingState.scanlineMaxX[l] < t) {
                RenderingState.scanlineMaxX[l] = t;
                RenderingState.scanlineTexUEnd[l] = _ax0;
                RenderingState.scanlineTexVEnd[l] = _ay0;
            }
        }
    }
}

export function applySeparationCorrection(_a, _b, _targetDist, _weightA, _weightB) { // T
    RMath.Vec2Sub(scratchVec2, _a, _b);
    _targetDist -= RMath.Vec2Norm(scratchVec2);
    _weightA *= _targetDist;
    _weightB *= _targetDist;
    _a.x += scratchVec2.x * _weightA;
    _a.y += scratchVec2.y * _weightA;
    _b.x -= scratchVec2.x * _weightB;
    _b.y -= scratchVec2.y * _weightB
}

export function stepWithVerticalBias(_a, _b, _yBias, _scale) { // S
    RMath.Vec2Sub(scratchVec2, _a, _b);
    _b.set(_a);
    scratchVec2.y += _yBias;
    RMath.Vec2Scale(scratchVec2, _scale);
    _a.add(scratchVec2)
}

export function toggleFullscreen() {
    document.fullscreenEnabled && (document.fullscreenElement ? document.exitFullscreen() : CanvasState.element.requestFullscreen())
}


export function onTouchStart(a) {
    handleTouch(a);
    if (1 == activeTouchCount) {
        isMouseDown = true;
        mouseXCurrent = mouseXRel;
        mouseYCurrent = mouseYRel;
    } else if (2 == activeTouchCount) {
        isMouseDown = false;
        mouseXCurrent = mouseXRel;
        mouseYCurrent = mouseYRel;
    }
    return false;
};

export function onContextMenu() {
    if (GameState.isCanvasFocused) return false
};

export function onMouseDown(mouseState) {
    onMouseMove(mouseState);
    GameState.isCanvasFocused = false;

    const insideCanvas =
        mouseXRel >= 0 && mouseXRel < Consts.CANVAS_WIDTH &&
        mouseYRel >= 0 && mouseYRel < Consts.CANVAS_HEIGHT;

    if (insideCanvas) {
        GameState.isCanvasFocused = true;
        if (mouseState.button === 0) {
            isMouseDown = true;
        }
        return false;
    }
    // if (
    //     !(0 > mouseXRel || CANVAS_WIDTH <= mouseXRel || 0 > mouseYRel || CANVAS_HEIGHT <= mouseYRel) && 
    //     (isCanvasFocused = true, 0 == a.button && (isMouseDown = true), isCanvasFocused)
    // ) return false
};

export function onMouseUp(mouseState) {
    onMouseMove(mouseState);
    if (mouseState.button === 0) {
        isMouseDown = false;
    }
    //0 == mouseState.button && (isMouseDown = false)
};

export function onTouchMove(a) {
    handleTouch(a);
    return false;
};

export function onTouchEnd(a) {
    handleTouch(a);
    if (0 == activeTouchCount) {
        isMouseDown = false;
    } else if (1 == activeTouchCount) {
        mouseXCurrent = mouseXRel;
        mouseYCurrent = mouseYRel;
    } else if (2 == activeTouchCount) {
        mouseXCurrent = mouseXRel;
        mouseYCurrent = mouseYRel;
    }
    return false;
};

export function onTouchCancel() {
    activeTouchCount = 0;
    isMouseDown = false;
};

export function onKeyDown(a) {
    var b = a.keyCode;
    if (65 <= b & 90 >= b) {
        a.shiftKey || (b += 32);
    } else {
        b = a.shiftKey ? keyMapShift[b] : keyMapNoShift[b];
    }
    if (0 <= b && 256 > b) {
        keyHeld[b] = true;
        keyPressPending[b] = true;
    }
    if (0 != b && GameState.isCanvasFocused) return false;
};

export function onKeyUp(a) {
    var b = a.keyCode;
    if (65 <= b & 90 >= b) {
        a.shiftKey || (b += 32);
    } else {
        b = a.shiftKey ? keyMapShift[b] : keyMapNoShift[b];
    }
    if (0 <= b && 256 > b) {
        keyHeld[b] = false;
    }
    if (0 != b && GameState.isCanvasFocused) return false;
};


export function buttonCheck(x, y, w, h) {
    return mouseXCurrent < x || x + w <= mouseXCurrent || mouseYCurrent < y || y + h <= mouseYCurrent ? false : true
}

export function buttonCheckCentered(x, y, w, h) {
    return buttonCheck(x - w / 2, y - h / 2, w, h)
}

export function onMouseMove(mouseState) {
    var clientRect = CanvasState.element.getBoundingClientRect(),
        rectWidth = clientRect.right - clientRect.left,
        rectHeight = clientRect.bottom - clientRect.top,
        f = RMath.min(rectWidth / Consts.CANVAS_WIDTH, rectHeight / Consts.CANVAS_HEIGHT),
        rectHeight = RMath.floor(rectHeight / 2 - Consts.CANVAS_HEIGHT * f / 2);
    mouseXRel = RMath.floor((mouseState.clientX - clientRect.left - RMath.floor(rectWidth / 2 - Consts.CANVAS_WIDTH * f / 2)) / f);
    mouseYRel = RMath.floor((mouseState.clientY - clientRect.top - rectHeight) / f)
    // LogMsg(`(${mouseXRel}, ${mouseYRel}), ${isCanvasFocused}`);
}

export function handleTouch(a) {
    var clientRect = CanvasState.element.getBoundingClientRect(),
        rectWidth = clientRect.right - clientRect.left,
        rectHeight = clientRect.bottom - clientRect.top,
        f = RMath.min(rectWidth / 640, rectHeight / 432),
        rectWidth = RMath.floor(rectWidth / 2 - 640 * f / 2),
        rectHeight = RMath.floor(rectHeight / 2 - 432 * f / 2);
    a = a.touches;
    console.log(a);
    activeTouchCount = a.length;
    if (1 == activeTouchCount) {
        mouseXRel = RMath.floor((a[0].clientX - clientRect.left - rectWidth) / f);
        mouseYRel = RMath.floor((a[0].clientY - clientRect.top - rectHeight) / f);
    } else if (2 == activeTouchCount) {
        mouseXRel = RMath.floor((a[0].clientX - clientRect.left - rectWidth) / f);
        mouseYRel = RMath.floor((a[0].clientY - clientRect.top - rectHeight) / f);
        rectHeight = RMath.floor((a[1].clientY - clientRect.top - rectHeight) / f);
        mouseXRel = RMath.floor((mouseXRel + RMath.floor((a[1].clientX - clientRect.left - rectWidth) / f)) / 2);
        mouseYRel = RMath.floor((mouseYRel + rectHeight) / 2);
    }
}


export function promptInput(message, _default) {
    var c = null;
    try {
        c = prompt(message, _default)
    } catch (d) { }
    return c
}



export function wrapStageIndex(a) {
    var b = stageIndexOrder.length - 1;
    return 0 > a ? b : a > b ? 0 : a
}


export function drawIconButton(x, y, iconIndex, label, color) {
    RenderingState.isSolidRender = 1;
    drawRectCentered(x, y, 32, 32, 2147483648);
    RenderingState.isSolidRender = 0;
    drawSpriteSheetPartCentered(LoadedSprites.iconSpriteSheet, x, y - 3, 24, 24, 24 * iconIndex, 0, 24, 24, color);
    if (6 <= label.length) {
        drawSmallTextNoOutline(x, y + 10, label, color);
    } else {
        drawTextCentered(LoadedFonts.gameFontSmall, x, y + 10, label, color, -1);
    }
    if (buttonCheckCentered(x, y, 32, 32)) {
        drawSpriteSheetPartCentered(LoadedSprites.iconSpriteSheet, x, y - 3, 24, 24, 24 * iconIndex, 0, 24, 24, 16750950);
        if (6 <= label.length) {
            drawSmallTextNoOutline(x, y + 10, label, 16750950);
        } else {
            drawTextCentered(LoadedFonts.gameFontSmall, x, y + 10, label, 16750950, -1);
        }
        return true;
    }
    return false;
    
}

export function drawMenuButton(x, y, iconIndex, text, color) {
    RenderingState.isSolidRender = 1;
    drawRectCentered(x, y, 24, 24, 2147483648);
    RenderingState.isSolidRender = 0;
    drawSpriteSheetPartCentered(LoadedSprites.iconSpriteSheet, x, y - 3, 16, 16, 16 * iconIndex, 24, 16, 16, color);
    if (6 <= text.length) {
        drawSmallTextNoOutline(x, y + 8, text, color);
    } else {
        drawTextCentered(LoadedFonts.gameFontSmall, x, y + 8, text, color, -1);
    }
    if (buttonCheckCentered(x, y, 24, 24)) {
        drawSpriteSheetPartCentered(LoadedSprites.iconSpriteSheet, x, y - 3, 16, 16, 16 * iconIndex, 24, 16, 16, 16737894);
        if (6 <= text.length) {
            drawSmallTextNoOutline(x, y + 8, text, 16737894) 
        } else {
            drawTextCentered(LoadedFonts.gameFontSmall, x, y + 8, text, 16737894, -1);
        }
        return true;
    }
    return false;

}

export function drawCancelButton(x, y) {
    RenderingState.isSolidRender = 1;
    drawRectCentered(x, y, 20, 20, 2147483648);
    RenderingState.isSolidRender = 0;
    drawSpriteSheetPartCentered(LoadedSprites.iconSpriteSheet, x, y, 16, 16, 96, 24, 16, 16, 16777215);
    if (buttonCheckCentered(x, y, 20, 20)) {
        drawSpriteSheetPartCentered(LoadedSprites.iconSpriteSheet, x, y, 16, 16, 96, 24, 16, 16, 16737894);
        return true;
    }
}

export function drawButtonBoldedText(x, y, w, h, text) {
    drawRectCentered(x, y, w, h, 0);
    drawTextCentered(LoadedFonts.gameFont, x, y, text, 16777215, 8409120);
    if (buttonCheckCentered(x, y, w, h)) {
        fillEmptyPixelsRect(x - (w >> 1), y - (h >> 1), w, h, 6684672);
        return true;
    }
    return false;
};