import { enemyTypeCount } from "./enemy_list.js";
import * as RMath from "./math.js";
import { badgeCount } from "./badge_list.js";
import { stageCount } from "./stage_data.js";
import { BadgeState, BestiaryState, CanvasState, GameState, GameStateChecksum, GUIState, KeyboardState, MouseState, RenderingState, SaveState } from "./global_states.js";
import * as Consts from "./consts.js"
import { PartyState } from "./party_state.js";
import { shrineRewardClaimed, shrineRewardClaimSlotCount } from "./shrine_data.js";
import { GameplayState } from "./heroes.js";
import { StageState } from "./stages.js";
import { canvasDrawImage, drawCanvas } from "./render.js";


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

export function gameLoop() {
    let requestAnim = requestAnimationFrame || mozRequestAnimationFrame || webkitRequestAnimationFrame || oRequestAnimationFrame || msRequestAnimationFrame;
    if (requestAnim) {
        requestAnim(gameLoop);
        GameState.requestAnimCallCount++;
        GameState.timestampAnim = Date.now();
        let framesPassed = RMath.floor(60 * (GameState.timestampAnim - GameState.lastTimestamp) / 1E3 + .5);
        if (0 > framesPassed || 60 <= framesPassed) {
            GameState.requestAnimCallCount = 0;
            GameState.currentFPS = GameState.frameCountThisSecond;
            GameState.frameCountThisSecond = 0;
            GameState.lastTimestamp = GameState.timestampAnim;
            framesPassed = 0;
        } else if (framesPassed == GameState.lastAnimFrameBucket) {
            return;
        }
        GameState.frameCountThisSecond++;
        GameState.lastAnimFrameBucket = framesPassed;
        GameState.totalFrames++;
    }
    MouseState.isMouseClicked = 0 == MouseState.wasMouseDown && 1 == MouseState.isMouseDown;
    MouseState.isMouseReleased = 1 == MouseState.wasMouseDown && 0 == MouseState.isMouseDown;
    if (MouseState.wasMouseDown = MouseState.isMouseDown) {
        MouseState.mouseHoldFrames++;
    } else {
        MouseState.mouseHoldFrames = 0;
    }
    MouseState.mouseXCurrent = MouseState.mouseXRel;
    MouseState.mouseYCurrent = MouseState.mouseYRel;
    for (a = 0; 256 > a; a++) {
        KeyboardState.keyJustPressed[a] = KeyboardState.keyPressPending[a];
        KeyboardState.keyPressPending[a] = false;
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
    if (!requestAnim) {
        setTimeout(gameLoop, computeFrameDelay());
    }
}

// /** Checks hostname */
// export function hostnameCheck() {
//     if (Consts.hostname.length != Consts.targetHostname.length) 
//         return true;
//     for (GameState.hostNameUnchecked = 0; Consts.hostnameCheckIdx < Consts.hostname.length; Consts.hostnameCheckIdx++)
//         if (Consts.hostname[Consts.hostnameCheckIdx] != Consts.targetHostname[Consts.hostnameCheckIdx]) 
//             return true;
//     return false
// }

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
