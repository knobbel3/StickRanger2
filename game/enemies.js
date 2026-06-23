import { enemyCatalog, enemyHitboxHalfHeightByBehavior, enemyHitboxHalfWidthByBehavior, enemySpriteAnchorYBySpriteIndex } from "./enemy_list.js";
import { EnemyProps, BehaviorTypes } from "./enemy_enums.js";
import * as RMath from "./math.js";
import { LoadedSprites } from "./game_sprites.js";
import { PartyState } from "./party_state.js";
import { GameplayState, HeroesState } from "./heroes.js";
import { StageState } from "./stages.js";
import { EnemyState } from "./enemy_state.js";
import { getStageTileAt } from "./stage.js";
import { spawnPopup } from "./popups.js";
import { IncrementBadgeCount, isBadgeIncompleteForCurrentStage } from "./badges.js";
import { findNearestPartyMemberInRect } from "./party.js";
import { spawnProjectile } from "./projectiles.js";
import { isDropTypeAbsent, spawnDrop } from "./drops.js";
import { drawEnemyScaledSprite, drawLine, drawRect, drawRectCentered, drawRectOutlineCentered, drawSpriteSheetPartCentered } from "./render.js";
import { GUIState } from "./global_states.js";

const enemyDispatchTable = [
    enemySlimeBehavior,
    enemyBoxSnakeBehavior,
    enemyBatBehavior,
    enemyDragonBehavior,
    enemyStickmanBehavior,
    enemyTreeBehavior,
    enemyTreeBehavior,
    enemyHangingTreeBehavior,
    enemyUpdateFunc7,
    enemyUpdateFunc8,
    enemyUpdateFunc9,
    enemyStickmanBehavior
];

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
    let jdir = new RMath.Vec2();
    RMath.Vec2Sub(jdir, EnemyState.enemyJointPosArray[enemyIdx][jointIdx], EnemyState.enemyPrevJointPosArray[enemyIdx][jointIdx]);
    EnemyState.enemyJointPosArray[enemyIdx][jointIdx].set(EnemyState.enemyPrevJointPosArray[enemyIdx][jointIdx]);
    let f = (RMath.Vec2Mag(jdir) >> 2) + 1;
    RMath.Vec2Scale(jdir, 1 / f);
    for (let k = 0; k < f; k++) {
        let g = EnemyState.enemyJointPosArray[enemyIdx][jointIdx].y + jdir.y;
        let h = getStageTileAt(EnemyState.enemyJointPosArray[enemyIdx][jointIdx].x, g);
        if (0 > g || 8 * StageState.stageHeight <= g) {
            EnemyState.enemyTileContactFlagsArray[enemyIdx] |= 2;
        } else if (0 <= h && 25 >= h) {
            if (0 < jdir.y) {
                EnemyState.enemyTileContactFlagsArray[enemyIdx] |= 2;
            }
            jdir.x *= bounceScale;
            jdir.y = -jdir.y;
        } else if (26 <= h && 26 >= h && 0 < jdir.y) {
            EnemyState.enemyTileContactFlagsArray[enemyIdx] |= 2;
            jdir.x *= bounceScale;
            jdir.y = -jdir.y;
        } else {
            EnemyState.enemyJointPosArray[enemyIdx][jointIdx].y = g;
        }
        g = EnemyState.enemyJointPosArray[enemyIdx][jointIdx].x + jdir.x;
        h = getStageTileAt(g, EnemyState.enemyJointPosArray[enemyIdx][jointIdx].y);
        if (0 > g || 640 <= g) {
            EnemyState.enemyTileContactFlagsArray[enemyIdx] |= 1;
        } else if (0 <= h && 25 >= h) {
            jdir.y *= bounceScale;
            jdir.x = -jdir.x;
            EnemyState.enemyTileContactFlagsArray[enemyIdx] |= 1;
        } else if (27 <= h && 29 >= h) {
            jdir.y *= bounceScale;
            jdir.x = -jdir.x;
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
            let hbW = enemyHitboxHalfWidthByBehavior[enemyCatalog[EnemyState.enemyTypeArray[_i]][EnemyProps.BehaviorIdx]] * enemyCatalog[EnemyState.enemyTypeArray[_i]][EnemyProps.DrawScale];
            let hbH = enemyHitboxHalfHeightByBehavior[enemyCatalog[EnemyState.enemyTypeArray[_i]][EnemyProps.BehaviorIdx]] * enemyCatalog[EnemyState.enemyTypeArray[_i]][EnemyProps.DrawScale];
            if (EnemyState.enemyUpdateFuncIdxArray[_i] == BehaviorTypes.TreeLeft || EnemyState.enemyUpdateFuncIdxArray[_i] == BehaviorTypes.TreeRight)
                hbH = 3 * EnemyState.enemyPoseTrailWriteIdxArray[_i] + 5 * enemyCatalog[EnemyState.enemyTypeArray[_i]][EnemyProps.DrawScale];
            let pos = EnemyState.enemyJointPosArray[_i][EnemyState.enemyTargetJointIdx];
            if (!(pos.x - hbW > rx || pos.x + hbW < f || pos.y - hbH > ry || pos.y + hbH < g)) {
                l.x = pos.x - cx;
                l.y = pos.y - cy;
                hbH = RMath.Vec2Mag(l);
                hbW = (hbH >> 3) + 1;
                RMath.Vec2Scale(l, 1 / hbW);
                RMath.Vec2Set(t, cx, cy);
                for (var M = 0; M <= hbW; M++) {
                    pos = getStageTileAt(t.x, t.y);
                    if (0 <= pos && 29 >= pos) break;
                    t.add(l);
                }
                if (M > hbW && hbH < n) {
                    n = hbH;
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
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], .03, .99);
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
        for (b = 0; 1 > b; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
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
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], .05, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyPrevJointPosArray[enemyIdx][1], .05, .9);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyPrevJointPosArray[enemyIdx][2], .05, .9);
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
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 0, 0, .01);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 0, 0, .01);
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
        for (b = 0; 3 > b; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
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
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], 0, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyPrevJointPosArray[enemyIdx][1], 0, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyPrevJointPosArray[enemyIdx][2], 0, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyPrevJointPosArray[enemyIdx][3], 0, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyPrevJointPosArray[enemyIdx][4], 0, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyPrevJointPosArray[enemyIdx][5], 0, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][6], EnemyState.enemyPrevJointPosArray[enemyIdx][6], 0, .99);
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
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 3 * b, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][4], 3 * b, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][3], d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][3], d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyJointPosArray[enemyIdx][5], d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyJointPosArray[enemyIdx][6], d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyJointPosArray[enemyIdx][6], d, c, c);
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
        for (b = 0; 8 > b; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        c = .5;
        d = 6 * (150 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 150;
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][3], d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][3], d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyJointPosArray[enemyIdx][5], d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyJointPosArray[enemyIdx][6], d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyJointPosArray[enemyIdx][6], d, c, c);
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
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], 0, .99);
        for (b = 1; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx]; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], 0, .9);
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
        for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 1; b++) RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][b + 1], c, 0, f);
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
        for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 20; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        f = .5;
        c = 10 * (150 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 150;
        for (b = 1; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 21; b++) RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][b + 1], c, f, f);
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
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], -.2, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyPrevJointPosArray[enemyIdx][1], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyPrevJointPosArray[enemyIdx][2], -.1, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyPrevJointPosArray[enemyIdx][3], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyPrevJointPosArray[enemyIdx][4], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyPrevJointPosArray[enemyIdx][5], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][6], EnemyState.enemyPrevJointPosArray[enemyIdx][6], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyPrevJointPosArray[enemyIdx][7], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][8], EnemyState.enemyPrevJointPosArray[enemyIdx][8], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][9], EnemyState.enemyPrevJointPosArray[enemyIdx][9], .3, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][10], EnemyState.enemyPrevJointPosArray[enemyIdx][10], .3, .99);
        } else if (EnemyState.enemyUpdateFuncIdxArray[enemyIdx] == BehaviorTypes.StickmanAlt) {
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], -.02, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyPrevJointPosArray[enemyIdx][1], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyPrevJointPosArray[enemyIdx][2], -.01, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyPrevJointPosArray[enemyIdx][3], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][4],
                EnemyState.enemyPrevJointPosArray[enemyIdx][4], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyPrevJointPosArray[enemyIdx][5], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][6], EnemyState.enemyPrevJointPosArray[enemyIdx][6], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyPrevJointPosArray[enemyIdx][7], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][8], EnemyState.enemyPrevJointPosArray[enemyIdx][8], 0, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][9], EnemyState.enemyPrevJointPosArray[enemyIdx][9], .1, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][10], EnemyState.enemyPrevJointPosArray[enemyIdx][10], .1, .99);
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
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 3 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 3 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][3], 4 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][4], 4 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyJointPosArray[enemyIdx][5], 4 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyJointPosArray[enemyIdx][6], 4 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][7], 4 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][8], 4 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyJointPosArray[enemyIdx][9], 4 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][8], EnemyState.enemyJointPosArray[enemyIdx][10], 4 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyJointPosArray[enemyIdx][8], 5 * d, c, c);
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
        for (b = 0; 11 > b; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        c = .5;
        d = 1.2 * (150 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 150;
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 3 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyJointPosArray[enemyIdx][5], 4 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyJointPosArray[enemyIdx][6], 4 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyJointPosArray[enemyIdx][9], 4 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][8], EnemyState.enemyJointPosArray[enemyIdx][10], 4 * d, c, c);
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
            for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 1; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], -.04, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], 1, .99);
        } else {
            for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 1; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .04, .99);
            RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], -1, .99);
        }
        if (10 > RMath.randFloat(100)) {
            b = RMath.floor(RMath.randFloat(EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 1));
            EnemyState.enemyJointPosArray[enemyIdx][b].x += RMath.randFloatRange(-.5, .5);
        }
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 8, .2, .2);
        for (b = 1; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 2; b++) RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][b + 1], 6, .2, .2);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][b + 1], 6, .2, 0);
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
        for (b = 0; b < EnemyState.enemyPoseTrailWriteIdxArray[enemyIdx] - 20; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
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
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], .05, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyPrevJointPosArray[enemyIdx][1], .05, .9);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyPrevJointPosArray[enemyIdx][2], .05, .9);
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
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 0, 0, .01);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 0, 0, .01);
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
        for (b = 0; 3 > b; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
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
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], 0, .99);
        for (b = 1; b <= g; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], 0, .99);
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
        for (b = 0; b < g; b++) RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][b + 1], h, 0, .2);
        for (b = 1; b < g; b++) RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][b + 1], f, .2, .2);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][1], f, .2, .2);
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
        for (b = 0; b <= g; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        h = h * (150 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 150;
        for (b = 1; b < g; b++) RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyJointPosArray[enemyIdx][b + 1], h, .5, .5);
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
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], -.05, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyPrevJointPosArray[enemyIdx][1], -.1, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyPrevJointPosArray[enemyIdx][2], .8, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyPrevJointPosArray[enemyIdx][3], -.1, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][4], EnemyState.enemyPrevJointPosArray[enemyIdx][4],
            .8, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyPrevJointPosArray[enemyIdx][5], -.1, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][6], EnemyState.enemyPrevJointPosArray[enemyIdx][6], .8, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyPrevJointPosArray[enemyIdx][7], -.1, .99);
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][8], EnemyState.enemyPrevJointPosArray[enemyIdx][8], .8, .99);
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
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][5], 3 * b, .1 * c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][7], 3 * b, .1 * c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][6], 3 * b, .1 * c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyJointPosArray[enemyIdx][6], 2 * b, .2 * c, .2 * c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][8], 3 * b, .1 * c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyJointPosArray[enemyIdx][8], 2 * b, .2 * c, .2 * c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 4 * b, .1 * c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][3], 4 * b, .1 * c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][2], 4 * b, .1 * c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 3 * b, .2 * c, .2 * c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][4], 4 * b, .1 * c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyJointPosArray[enemyIdx][4], 3 * b, .2 * c, .2 * c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][4], 8 * b, .1 * c, .1 * c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][5], EnemyState.enemyJointPosArray[enemyIdx][7], 7 * b, .1 * c, .1 * c);
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
        for (b = 0; 9 > b; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        c = .5;
        b = 1.2 * (150 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 150;
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 4 * b, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyJointPosArray[enemyIdx][4], 4 * b, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][5],
            EnemyState.enemyJointPosArray[enemyIdx][6], 3 * b, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][7], EnemyState.enemyJointPosArray[enemyIdx][8], 3 * b, c, c);
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
        RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyPrevJointPosArray[enemyIdx][0], 0, .99);
        for (b = 1; 5 > b; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], 0, .9);
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
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][1], 6 * d, 0, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][1], EnemyState.enemyJointPosArray[enemyIdx][2], 4 * d, 0, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][3], 6 * d, 0, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][4], 6 * d, 0, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyJointPosArray[enemyIdx][4], 8 * d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][0], EnemyState.enemyJointPosArray[enemyIdx][2], 10 * d, 0, c);
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
        for (b = 0; 5 > b; b++) RMath.stepWithVerticalBias(EnemyState.enemyJointPosArray[enemyIdx][b], EnemyState.enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        c = .5;
        d = 7 * d * (150 - EnemyState.enemyDeathTimerArray[enemyIdx]) / 150;
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][3], d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][2], EnemyState.enemyJointPosArray[enemyIdx][4], d, c, c);
        RMath.applySeparationCorrection(EnemyState.enemyJointPosArray[enemyIdx][3], EnemyState.enemyJointPosArray[enemyIdx][4], d, c, c);
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