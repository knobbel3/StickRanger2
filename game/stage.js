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
        var n = RMath.clamp(MouseState.mouseXCurrent + c[a] >> 3, 0, StageState.stageWidth - 1),
            w = RMath.clamp(MouseState.mouseYCurrent + d[a] >> 3, 0, StageState.stageHeight - 1);
        if (MouseState.isMouseClicked) {
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
                    c = 8 * n + 4 - MouseState.mouseXCurrent;
                    d = 8 * w + 4 - MouseState.mouseYCurrent;
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
                        spawnPopup(MouseState.mouseXCurrent, MouseState.mouseYCurrent, 0, "" + c + d, 30, 10066431);
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


export function wrapStageIndex(a) {
    var b = stageIndexOrder.length - 1;
    return 0 > a ? b : a > b ? 0 : a
}