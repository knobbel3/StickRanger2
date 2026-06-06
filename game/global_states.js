import { badgeCount } from "./badge_list.js";
import { enemyTypeCount } from "./enemy_list.js";
import { shrineRewardClaimSlotCount } from "./shrine_data.js";
import { Sprite } from "./sprite.js";

export let CanvasState = {
    element : document.getElementById("cv"),
    canvasImage: undefined,
    canvasBuffer: undefined,

};

CanvasState.context2d = CanvasState.element.getContext("2d");
CanvasState.canvasImage = CanvasState.context2d.createImageData(640, 432);
CanvasState.canvasImage = CanvasState.context2d.createImageData(640, 432);
CanvasState.canvasBuffer = new Uint32Array(CanvasState.canvasImage.data.buffer);

export let SaveState = {
    userSaveCode : undefined, // ca
    userSaveKey : [0, 0, 0, 0, 0, 0, 0, 0], // da
    gameSaveString : "",
    gameSaveStatusDuration : 0,
    gameLoadStatusCode : 0,
    statusDuration : 0,
    gameSaveBuffer : new Int32Array(5E3),
    saveLoadCodecScratchBuffer : new Int32Array(5E3), // lf, scratch buffer used while encoding and decoding save strings
};

export let GameState = {
    userSaveCode : undefined, // ca
    userSaveKey : [0, 0, 0, 0, 0, 0, 0, 0], // da
    isMinimalTitleMode : undefined, // ea
    requestAnimCallCount : 0, // Vm, counts active requestAnimationFrame callbacks (incremented each anim callback; reset on timing jumps).
    lastAnimFrameBucket : 0,  // Zm, last rounded animation-frame bucket (stores previous a to detect/skip duplicate callbacks).
    frameCountThisSecond : 0, // Ym
    currentFPS : 0,
    frameInteval : 20, // en, in milliseconds
    timestampAnim : Date.now(),
    lastTimestamp : undefined, // Xm
    nextFrameTime : undefined, // fn
    secondWindowDeadline : undefined, // gn
    totalFrames : 0, // $m
    gameInitStage : 0,
    isCanvasFocused : false,
    hostNameUnchecked : 1,
};

GameState.lastTimestamp = GameState.timestampAnim; // Xm
GameState.nextFrameTime = GameState.timestampAnim + GameState.frameInteval; // fn
GameState.secondWindowDeadline = GameState.timestampAnim; // gn

export let RenderingState = {
    frameBufferArray : new Int32Array(276480),

    // per-scanline X ranges (16.16 fixed-point) used for rasterization
    scanlineMinX : new Int32Array(432),         // Ji,
    scanlineMaxX : new Int32Array(432),         // Ki,

    // per-scanline start texture U ranges (16.16 fixed-point) for sampling during rasterization.
    scanlineTexUStart : new Float32Array(432),  // om, 
    scanlineTexUEnd : new Float32Array(432),    // nm, 

    // per-scanline end texture V ranges (16.16 fixed-point) for sampling during rasterization.    
    scanlineTexVStart : new Float32Array(432),  // qm, 
    scanlineTexVEnd : new Float32Array(432),    // pm,

    screenFadeFactor : 1, // ug, screen fade multiplier used when composing final canvas (0..1).
    isSolidRender : 0,
    spriteAltRenderFlag : 0, // fh, auxiliary sprite render-mode flag used for temporary tint/alt-draw modes.
};

export let GUIState = {
    gameScreenState : 0,
    screenStateTimer : 0, // sa
    currentStage : 0,
    clickInUI : false, // ta

    memberUIVisible : false,
    inventoryUIVisible : false,
    bestiaryUIVisible : false,
    badgesUIVisible : false,
    optionsUIVisible : false,
    shrineUIVisible : false,
    
    memberUIVisibleBackup : false, // Ba
    inventoryUIVisibleBackup : false, // Da
    bestiaryUIVisibleBackup : false, // Ea
    badgesUIVisibleBackup : false, // Ha
    optionsUIVisibleBackup : false, // Ia
    shrineUIVisibleBackup : false, // Ja

    selectingHero : 0,
    selectedStatIndex : 0, 
    inventoryTabIdx : 0, // Na, 0..4 for "ARMS","CHARGE","HEAD","RING","AMULET"
    inventoryPageIdx : 0, // Oa, 
    inventorySlotIdx : 0, // Pa, 0..27 grid index; used to highlight/select a cell
    currentBestiaryPage : 0,
    bestiaryEnemySelection : 0,
    badgesUIStageIdx : 0, // Sa
    LevelExpThresholds : Array(100),
};

GUIState.LevelExpThresholds[0] = 0;

for (let _i = 1; 98 > _i; _i++) 
    GUIState.LevelExpThresholds[_i] = GUIState.LevelExpThresholds[_i - 1] + 1E3 * _i;
GUIState.LevelExpThresholds[98] = 9999999;
GUIState.LevelExpThresholds[99] = 9999999;

export let BadgeState = {
    badgeCounterArray : Array(badgeCount),
    badgePopupTimer : 0, // bf
    lastCompletedBadgeIdx : 0, // cf
    badgeIndicesByStage : [ // df
        [0, 1, 2, 3, 4],
        [5, 6, 7, 8, 9],
        [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24],
        [25, 26, 27, 28, 29],
        [30, 31, 32, 33, 34],
        [35, 36, 37, 38, 39],
        [40, 41, 42, 43, 44],
        [45, 46, 47, 48, 49],
        [50, 51, 52, 53, 54],
        [55, 56, 57, 58, 59],
        [60, 61, 62, 63, 64],
        [65, 66, 67, 68, 69],
        [70, 71, 72],
        [],
        [],
        []
    ],
};
for (let _i = 0; _i < badgeCount; _i++) BadgeState.badgeCounterArray[_i] = 0;
for (let _i = 0; _i < shrineRewardClaimSlotCount; _i++) BadgeState.badgeCounterArray[_i] = 0;

export let GameStateChecksum = {
    partyChecksum : 0,
    basePartyChecksum : 0,
    tamperCheckScanOffset : 0, // vf, rotating start offset for the chunked tamper-check hash pass
    itemHashTable : [],
    levelHashTable : [],
    itemCatalogHashTable : [],
    inventoryItemListsChecksum : 0, // zf, checksum of inventoryItemLists used by the tamper-check path
};

export let BestiaryState = {
    bestiaryEntryState : Array(enemyTypeCount) // Bestiary entry unlock state: 0=locked, 1=preview/purchased, 2=fully unlocked
};
for (let _i = 0; _i < enemyTypeCount; _i++) BestiaryState.bestiaryEntryState[_i] = 0;

