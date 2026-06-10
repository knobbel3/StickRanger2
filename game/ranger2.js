/*
 The games source code use is permission :-)
*/

import { enemyCatalog } from "./enemy_list.js";
import { itemList } from "./item_list.js";
import * as RMath from "./math.js";
import { stageListArray } from "./stage_data.js";
import { loadSprite, uncheckedSpriteCount } from "./sprite.js";
import { CanvasState, GameState, GameStateChecksum, KeyboardState, RenderingState, SaveState } from "./global_states.js";
import * as Consts from "./consts.js"
import { LoadedSprites } from "./game_sprites.js";
import { LoadedFonts } from "./game_fonts.js";
import { inventoryItemLists } from "./party_state.js";
import { initInputState, onContextMenu, onKeyDown, onKeyUp, onMouseDown, onMouseMove, onMouseUp, onTouchCancel, onTouchEnd, onTouchMove, onTouchStart, toggleFullscreen } from "./input.js";
import { computeFrameDelay, hashAdjust, loadGame, gameLoop } from "./state.js";



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

        initInputState();
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
        gameLoop();
    }
}