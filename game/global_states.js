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