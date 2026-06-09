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
                if (MouseState.isMouseClicked) {
                    GUIState.gameScreenState = 0 == SaveState.gameLoadStatusCode ? 3 : 4;
                }
                drawLine(256, 228, 384, 228, 11141120);
            }
            if (0 == SaveState.gameLoadStatusCode) {
                drawTextCentered(LoadedFonts.gameFont, 320, 260, "LOAD GAME", 16777215, 10053171);
                if (buttonCheckCentered(320, 260, 128, 24)) {
                    if (MouseState.isMouseClicked) {
                        GUIState.gameScreenState = 5;
                    }
                    drawLine(256, 268, 384, 268, 11141120);
                }
            }
        } else if (3 == GUIState.gameScreenState) {
            drawTextCentered(LoadedFonts.gameFont, 320, 220, "DELETE SAVED AND CREATE NEW GAME", 16777215, 10053171);
            if (buttonCheckCentered(320, 220, 128, 24)) {
                if (MouseState.isMouseClicked) {
                    GUIState.gameScreenState = 4;
                }
                drawLine(192, 228, 448, 228, 11141120);
            }

            drawTextCentered(LoadedFonts.gameFont, 320, 260, "CANCEL", 16777215, 10053171);
            if (buttonCheckCentered(320, 260, 128, 24)) {
                if (MouseState.isMouseClicked) {
                    GUIState.gameScreenState = 2;
                }
                drawLine(256, 268, 384, 268, 11141120);
            }
        }
        
        if (drawIconButton(608, 312, 8, "IMPORT", 16777215)) {
            if (8 != GameState.userSaveCode.length) {
                drawText(LoadedFonts.gameFont, MouseState.mouseXCurrent - 72, MouseState.mouseYCurrent - 6, "User only", 16777215, 13158);
            } else if (MouseState.isMouseClicked) {
                if (a = promptInput("Import Game Data", "")) {
                    SaveState.gameLoadStatusCode = loadGame(a);
                    SaveState.statusDuration = 100;
                }
            }
        }
        if (drawIconButton(608, 352, 9, "EXPORT", 16777215)) {
            if (8 != GameState.userSaveCode.length) {
                drawText(LoadedFonts.gameFont, MouseState.mouseXCurrent - 72, MouseState.mouseYCurrent - 6, "User only", 16777215, 13158);
            } else if (MouseState.isMouseClicked) {
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
        if (MouseState.isMouseClicked) {
            GUIState.clickInUI = false;
            if (360 <= MouseState.mouseYCurrent) GUIState.clickInUI = true;

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
            if (100 == GUIState.screenStateTimer && MouseState.isMouseClicked) {
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

export function drawGameUI() {
    var hidx, b, c, d, f, g, h, k;
    if (KeyboardState.keyJustPressed[32]) {
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

            if (MouseState.isMouseClicked && GUIState.selectingHero == hidx) {
                GUIState.memberUIVisible = !GUIState.memberUIVisible;
            }

            if (MouseState.isMouseClicked) {
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
            if (buttonCheck(k, n, 16, 16) && MouseState.isMouseClicked && 0 != c) {
                GUIState.selectingHero = hidx;
            }
        }
    }
    drawRectOutline(f + GUIState.selectingHero * d - 1, g - 1, 26, 26, 16711680);
    f = 472;
    g = 379;
    d = 36;
    if (drawIconButton(f + -1 * d, g, 13, "" + PartyState.collectedStageFlagsCount + "/" + PartyState.stageFlagsSetCount, 16777215) && MouseState.isMouseClicked) {
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
        if (MouseState.isMouseClicked) {
            GUIState.memberUIVisible = !GUIState.memberUIVisible;
        }
    }

    if (drawIconButton(f + 1 * d, g, 2, "ITEM", GUIState.inventoryUIVisible ? 16750950 : 16777215)) {
        if (MouseState.isMouseClicked && (GUIState.inventoryUIVisible = !GUIState.inventoryUIVisible)) {
            GUIState.shrineUIVisible = false;
        }
    }

    if (drawIconButton(f + 2 * d, g, 3, "MONSTER", GUIState.bestiaryUIVisible ? 16750950 : 16777215)) {
        if (MouseState.isMouseClicked && (GUIState.bestiaryUIVisible = !GUIState.bestiaryUIVisible)) {
            GUIState.badgesUIVisible = false;
        }
    }

    if (drawIconButton(f + 3 * d, g, 4, "MEDAL", GUIState.badgesUIVisible ? 16750950 : 16777215)) {
        if (MouseState.isMouseClicked && (GUIState.badgesUIVisible = !GUIState.badgesUIVisible)) {
            GUIState.bestiaryUIVisible = false;
        }
    }

    if (drawIconButton(f + 4 * d, g, 5, "OPTION", GUIState.optionsUIVisible ? 16750950 : 16777215)) {
        if (MouseState.isMouseClicked) {
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
            if (0 < c && c <= PartyState.partyGold && MouseState.isMouseClicked && !GUIState.clickInUI) {
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
            if (MouseState.isMouseClicked && !GUIState.clickInUI) {
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
            if (MouseState.isMouseClicked && !GUIState.clickInUI && (GUIState.shrineUIVisible = !GUIState.shrineUIVisible)) {
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
                    if (MouseState.isMouseReleased) GUIState.selectedStatIndex = _statIdx;
                } else if (0 < PartyState.partySP[GUIState.selectingHero] && PartyState.partyStats[GUIState.selectedStatIndex][GUIState.selectingHero] < maxStats[GUIState.selectedStatIndex]) {
                    drawText(LoadedFonts.gameFontSmall, MouseState.mouseXCurrent - 5, MouseState.mouseYCurrent - 8, "UP", 16776960, 1118481);
                    if (MouseState.isMouseReleased) {
                        PartyState.partyStats[GUIState.selectedStatIndex][GUIState.selectingHero]++;
                        PartyState.partySP[GUIState.selectingHero]--;
                    }
                }
            }
        }

        if (drawCancelButton(f + 188, g + 4) && MouseState.isMouseClicked) {
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
                    if (MouseState.isMouseClicked) {
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
        if (drawCancelButton(_ox + 188, _oy + 4) && MouseState.isMouseClicked) {
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
                    if (MouseState.isMouseReleased) {
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
                            drawText(LoadedFonts.gameFontSmall, MouseState.mouseXCurrent - 20, MouseState.mouseYCurrent - 8, "EQUIP", 16777215, 1118481);
                            if (MouseState.isMouseReleased) {
                                PartyState.partyEquipmentTable[GUIState.selectingHero][k] = c;
                            }
                        } else if (h == GUIState.selectingHero) {
                            drawText(LoadedFonts.gameFontSmall, MouseState.mouseXCurrent - 25, MouseState.mouseYCurrent - 8, "REMOVE", 16777215,
                                0);
                            if (MouseState.isMouseReleased) {
                                PartyState.partyEquipmentTable[GUIState.selectingHero][k] = 0;
                            }
                        } else {
                            drawText(LoadedFonts.gameFontSmall, MouseState.mouseXCurrent - 25, MouseState.mouseYCurrent - 16, "REMOVE", 16777215, 0);
                            drawText(LoadedFonts.gameFontSmall, MouseState.mouseXCurrent - 20, MouseState.mouseYCurrent - 8, "EQUIP", 16777215, 1118481);
                            if (MouseState.isMouseReleased) {
                                PartyState.partyEquipmentTable[h][k] = 0;
                                PartyState.partyEquipmentTable[GUIState.selectingHero][k] = c;
                            }
                        }
                        
                    }
                }
                if (MouseState.isMouseReleased) {
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
                if (MouseState.isMouseClicked) {
                    GUIState.inventoryTabIdx = hidx;
                }
            }
            c = 0;
            for (b = inventoryItemLists[hidx].length - 1; 0 <= b; b--) c += PartyState.itemIsNew[inventoryItemLists[hidx][b]];
            if (0 < c) {
                drawText(LoadedFonts.gameFontSmall, _ox + 12 + 28 * hidx - 12, _oy + 238 - 12, "NEW", 16776960, -1);
            }
        }
        if (drawMenuButton(_ox + 96 - 42, _oy + 209, 7, "PREV", 16777215) && MouseState.isMouseClicked) {
            GUIState.inventoryPageIdx--;
        }
        if (drawMenuButton(_ox + 138, _oy + 209, 8, "NEXT", 16777215) && MouseState.isMouseClicked) {
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
        if (drawCancelButton(f + 188, g + 4) && MouseState.isMouseClicked) {
            GUIState.bestiaryUIVisible = false;
        }
        GUIState.bestiaryEnemySelection = RMath.clamp(GUIState.bestiaryEnemySelection, 0, bestiaryPageItems[GUIState.currentBestiaryPage].length - 1);
        let c = bestiaryPageItems[GUIState.currentBestiaryPage][GUIState.bestiaryEnemySelection];

        if (0 == StageState.isStageReachedArray[stageIndexOrder[GUIState.currentBestiaryPage]]) {
            drawTextCentered(LoadedFonts.gameFont, f + 96, g + 48, "Not reached", -1, 0);
        } else {
            if (0 == BestiaryState.bestiaryEntryState[c]) {
                h = enemyCatalog[c][EnemyProps.BestiaryUnlockCost];
                if (drawButtonBoldedText(f + 96, g + 48, 96, 24, "G " + h) && h <= PartyState.partyGold && MouseState.isMouseClicked) {
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
                    if (drawButtonBoldedText(f + 120, g + 48 - 8, 80, 56, "G " + h) && h <= PartyState.partyGold && MouseState.isMouseClicked) {
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
                    if (MouseState.isMouseClicked) {
                        GUIState.bestiaryEnemySelection = hidx;
                    }
                }
                drawEnemyStatic(c, b + 12, d + 20, 2);
            }
        }
        if (drawMenuButton(f + 96 - 42, g + 156, 7, "PREV", 16777215) && MouseState.isMouseClicked) {
            GUIState.currentBestiaryPage--;
        }
        if (drawMenuButton(f + 138, g + 156, 8, "NEXT", 16777215) && MouseState.isMouseClicked) {
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
        if (drawCancelButton(f + 188, g + 4) && MouseState.isMouseClicked) {
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
        if (drawMenuButton(f + 96 - 42, g + 156, 7, "PREV", 16777215) && MouseState.isMouseClicked) {
            GUIState.badgesUIStageIdx--;
        }
        if (drawMenuButton(f + 138, g + 156, 8, "NEXT", 16777215) && MouseState.isMouseClicked) {
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
        if (drawCancelButton(f + 188, g + 4) && MouseState.isMouseClicked) {
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
                if (MouseState.isMouseClicked) {
                    PartyState.autoMoveEnabled[hidx] = 1 - PartyState.autoMoveEnabled[hidx];
                }
            }
        }
        drawText(LoadedFonts.gameFontMed, f + 0, g + 64, "Cliff stop :", 16777215, 0);
        drawText(LoadedFonts.gameFontMed, f + 78, g + 64, c[PartyState.cliffStopEnabled], 16777215, 0);
        if (buttonCheck(f + 0, g + 64 - 2, 192, 12)) {
            drawText(LoadedFonts.gameFontMed, f + 78, g + 64, c[PartyState.cliffStopEnabled], 16711680, 0);
            if (MouseState.isMouseClicked) {
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
            if (h <= PartyState.partyGold && MouseState.isMouseClicked) {
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
        if (drawCancelButton(f + 188, g + 4) && MouseState.isMouseClicked) {
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
                if (shrineRewardOptions[hidx][1] <= h && MouseState.isMouseClicked) {
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


export function canvasDrawImage(_canvas, _dx, _dy) {
    try {
        CanvasState.element = document.getElementById("cv"); 
        CanvasState.context2d = CanvasState.element.getContext("2d");
        CanvasState.context2d.putImageData(_canvas, _dx, _dy);
    } catch (d) { }
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