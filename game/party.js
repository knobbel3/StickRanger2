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
        if (fillEmptyPixelsRect(_x, _y, _width, _height, 6684672), MouseState.isMouseClicked && 0 != _itemId) {
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
        } else if (MouseState.isMouseClicked) {
        if (GUIState.inventoryUIVisible = GUIState.inventoryUIVisible && GUIState.inventoryTabIdx == _pageIdx ? false : true) {
            GUIState.shrineUIVisible = false;
        }
        GUIState.inventoryTabIdx = _pageIdx;
        GUIState.inventorySlotIdx = GUIState.inventoryPageIdx = 0;
    }
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
        if (MouseState.isMouseClicked && !GUIState.clickInUI) {
            b = 20;
            a.x = MouseState.mouseXCurrent - HeroesState.heroJointPrevPositionsByHero[GUIState.selectingHero][0].x;
            a.y = MouseState.mouseYCurrent - (HeroesState.heroJointPrevPositionsByHero[GUIState.selectingHero][0].y - 8);
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
                        a.x = MouseState.mouseXCurrent - HeroesState.heroJointPrevPositionsByHero[d][f].x;
                        a.y = MouseState.mouseYCurrent - HeroesState.heroJointPrevPositionsByHero[d][f].y;
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
    } else if (!MouseState.wasMouseDown) {
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
                for (b = 0; 11 > b; b++) RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][b], HeroesState.heroJointPrevPositionsByHero[a][b], .05, .99);
            else if (2 == HeroesState.heroTileContactFlags[a])
                for (b = 0; 11 > b; b++) RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][b], HeroesState.heroJointPrevPositionsByHero[a][b], .01, .99);
            else if (20 > HeroesState.heroPoseAgeFrames[a]) {
                RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][0], HeroesState.heroJointPrevPositionsByHero[a][0], -.2, .99);
                RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][1], HeroesState.heroJointPrevPositionsByHero[a][1], 0, .99);
                RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][2], HeroesState.heroJointPrevPositionsByHero[a][2], -.1, .99);
                RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][3], HeroesState.heroJointPrevPositionsByHero[a][3], 0, .99);
                RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][4], HeroesState.heroJointPrevPositionsByHero[a][4], 0, .99);
                RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][5], HeroesState.heroJointPrevPositionsByHero[a][5], 0, .99);
                RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][6], HeroesState.heroJointPrevPositionsByHero[a][6], 0, .99);
                RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][7], HeroesState.heroJointPrevPositionsByHero[a][7], 0, .99);
                RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][8], HeroesState.heroJointPrevPositionsByHero[a][8], 0, .99);
                RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][9], HeroesState.heroJointPrevPositionsByHero[a][9], .3, .99);
                RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][10], HeroesState.heroJointPrevPositionsByHero[a][10], .3, .99);
            } else for (b = 0; 11 > b; b++)
                if (heroHasAccessoryEffect(a, AccessoryProps.JointStepDivider)) {
                    RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][b], HeroesState.heroJointPrevPositionsByHero[a][b], .05 / countAccessoryLvlBonuses(a, AccessoryProps.JointStepDivider), .99);
                } else {
                    RMath.stepWithVerticalBias(HeroesState.heroJointPositionsByHero[a][b], HeroesState.heroJointPrevPositionsByHero[a][b], .05, .99);
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
                    HeroesState.heroJointPositionsByHero[GameplayState.draggedHeroIndex][GameplayState.draggedJointIndex].x += .2 * (MouseState.mouseXCurrent - HeroesState.heroJointPositionsByHero[GameplayState.draggedHeroIndex][GameplayState.draggedJointIndex].x);
                    HeroesState.heroJointPositionsByHero[GameplayState.draggedHeroIndex][GameplayState.draggedJointIndex].y += .2 * (MouseState.mouseYCurrent - HeroesState.heroJointPositionsByHero[GameplayState.draggedHeroIndex][GameplayState.draggedJointIndex].y);
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
                        RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][5], HeroesState.heroJointPositionsByHero[a][6], 5, .1, .1);
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
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][1], HeroesState.heroJointPositionsByHero[a][2], 3.6, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][3], HeroesState.heroJointPositionsByHero[a][5], 4.8, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][4], HeroesState.heroJointPositionsByHero[a][6], 4.8, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][7], HeroesState.heroJointPositionsByHero[a][9], 4.8, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][8], HeroesState.heroJointPositionsByHero[a][10], 4.8, .5, .5);
            } else {
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][0], HeroesState.heroJointPositionsByHero[a][1], 3.6, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][1], HeroesState.heroJointPositionsByHero[a][2], 3.6, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][1], HeroesState.heroJointPositionsByHero[a][3], 4.8, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][1], HeroesState.heroJointPositionsByHero[a][4], 4.8, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][3], HeroesState.heroJointPositionsByHero[a][5], 4.8, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][4], HeroesState.heroJointPositionsByHero[a][6], 4.8, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][2], HeroesState.heroJointPositionsByHero[a][7], 4.8, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][2], HeroesState.heroJointPositionsByHero[a][8], 4.8, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][7], HeroesState.heroJointPositionsByHero[a][9], 4.8, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][8], HeroesState.heroJointPositionsByHero[a][10], 4.8, .5, .5);
                RMath.applySeparationCorrection(HeroesState.heroJointPositionsByHero[a][7], HeroesState.heroJointPositionsByHero[a][8], 6, .1, .1);
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

