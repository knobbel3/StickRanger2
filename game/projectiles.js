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