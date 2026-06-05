export const ItemProps = Object.freeze({
    Name: 0, // item display name shown in inventory/equipment UI.
    DropIconCol: 1, // item icon/category used by accessory bonus checks.
    HeadwearType: 2, // encoded sprite tile used for the item icon.
    Appearance: 3, // item appearance/class flag used by the UI.
    RangeType: 4, // Oc, weapon range bucket: short, middle, or long.
    SpriteSourceX: 5, // sprite sheet source X for the item icon.
    LimbSelection: 6, // Qc, limb selection code used to remap the stored limb descriptor.
    ProjectileDrawWidth: 7, // Rc, projectile sprite draw width.
    ProjectileDrawHeight: 8, // Sc, projectile sprite draw height.
    ProjectileShapeMode: 9, // Tc, projectile shape/collision mode used when spawning and resolving hits.
    HitCountStat: 10, // Uc, number of hits the projectile can apply; the UI shows all or N hit.
    AtkMin: 11, // Vc, lower attack value shown in the item’s AT min-max range.
    AtkMax: 12, // Wc, upper attack value shown in the item’s AT min-max range.
    ProjectileCount: 13, // Xc, per-attack projectile count; feeds atkCountArray and the *N attack UI.
    ProjectileSpeed: 14, // Yc, projectile launch speed; scales shot velocity before each spawnProjectile() call.
    Agility: 15, // Zc, hero agility stat; copied into heroAgiValues and shown as AGI.
    Range: 16, // $c, hero range stat; copied into heroRangeValues and shown as RANGE.
    ProjectileEffectWidth: 17, // ad, projectile effect hitbox width.
    ProjectileEffectHeight: 18, // bd, projectile effect hitbox height.
    ProjectileDelayRange: 19, // cd, random projectile spawn delay range.
    ProjectileNoDamageFrames: 20, // dd, frames a projectile can’t deal damage after spawn.
    ProjectileStartAnimFrame: 21, // ed, projectile's initial animation frame.
    ProjectileLifetime: 22, // fd, projectile lifetime (frames) used for lifespan and alpha fade.
    ProjectileTargetIndex: 23, // gd, projectile target/mode index: 0=default, -1=special, >0 = index into entity limb/slot for homing/anchoring.
    ProjectileAcceleration: 24, // hd, projectile acceleration / gravity magnitude (from item stat), used to influence projectile velocity each frame.
    ProjectileSpeedScale: 25, // id, projectile velocity scale / speed multiplier (percent-like), applied each frame as .01 * value to scale projectile velocity.
    ProjectileAuxStat: 26, // jd, auxiliary projectile stat passed into spawnProjectile; current code does not read the matching projectile slot later.
    ProjectileCollisionMode: 27, // kd, projectile wall-collision mode: 0 stop, 2 slide, 3 bounce, 4 clamp.
    AttackCooldown: 28, // ld, cooldown in frames before the next attack or passive emit can fire.
    ProjectileAuxParam: 29, // md, auxiliary projectile parameter stored on spawn; current projectile logic does not read it.
    ItemProjectileMaxTargets: 30, // nd, projectile max-target count; 2 falls back to the upper byte of itemProjectileDamageMinCol.
    ItemProjectileDamageMin: 31, // od, projectile minimum damage; its upper byte is reused by itemProjectileMaxTargetsCol when needed.
    ItemProjectileDamageMax: 32, // pd, projectile maximum damage.
    ItemProjectileEffectType: 33, // qd, projectile effect/damage mode.
    ProjectileEffectType: 34, // rd, effect type used by projectile hit logic; controls whether a hit applies direct damage or a status effect.
    ProjectileEffectDuration: 35, // sd, effect duration in frames used by projectile hit logic.
    ElementType: 36, // td, item element code; the UI renders it as physical, fire, ice, lightning, or poison.
    IceBonusPercent: 37, // ud, ice-specific percent bonus shown for ice-element gear.
    ChargeEmitValue: 38, // vd, shared charge/emit stat shown as CHARGE for arms and EMIT for emit gear.
    ForgeMaxLevel: 39, // wd, highest forge level the item can reach.
    ForgeCostPerLevel: 40, // xd, gold cost per forge level used by the upgrade panel.
    StatModifyingBase: 41, // base column for item stat modifier pairs.
    ProjectileParam1: 47, // zd, projectile config parameter; read into ic and forwarded into spawnProjectile().
    AttackMode: 48, // attack mode code; drives the *N attack UI and the special 10/11/20 cases.
    ProjectileParam2: 49, // Bd, projectile config parameter; read into kc and forwarded into spawnProjectile().
    ProjectileParam3: 50, // Cd, projectile config parameter; read into Sf and forwarded into spawnProjectile().
    AttackPower: 51, // Ed, attack power / shot strength; shown in the AT ... *N > UI and used in the forge preview.
    ProjectileTemplate: 52, // Fd, nested projectile/item template reference; the attack code dereferences selectedItem = selectedItem[Fd] before spawning.
    ProjectileAux1: 53, // Gd, nested projectile/item template reference; the attack code dereferences selectedItem = selectedItem[Fd] before spawning.
    ProjectileAux2: 54, // Hd, auxiliary projectile config value; same pattern as Gd, forwarded into spawnProjectile() and stored on the projectile state.
    AuxValueA: 55, // Id, auxiliary item parameter forwarded into projectile spawn (unknown semantic).
    AuxValueB: 56, // Jd, auxiliary item parameter forwarded into projectile spawn.
    AuxValueC: 57, // Kd, auxiliary item parameter forwarded into projectile spawn.
    DisplayStatA: 58, // Ld, item display/forge stat column used in AT UI calculations.
    AuxValueD: 59, // Md, auxiliary item parameter forwarded into projectile spawn.
    ProjectileFlag: 60, // Nd, small integer flag stored on projectile state and used in hit/draw logic.
    ProjectileParamTime: 61, // Od, time/auxiliary numeric parameter stored during updates.
    HitCount: 62, // Pd, number-of-hits stat for the item; influences UI (all / N hit) and projectile behavior.
    ProjectileEffectMode: 63, // Sd, projectile effect/damage-mode code read from the item row and forwarded into projectile hit logic.
    StatA: 64, // Td, stat index used with getModifiedStatVal() for display and calculations.
    ExtraStat1: 65, // Ud, auxiliary item stat forwarded into projectile/item logic.
    ExtraStat2: 66, // Vd, auxiliary item stat forwarded into projectile/item logic.
    SpawnTargetRange: 67, // Wd, range/index used to locate nearest party member / spawn target; forwarded into spawn logic.
    ExtraParamA: 68, // Xd, auxiliary item parameter passed to spawn logic.
    ExtraParamB: 69, // Yd, auxiliary item parameter passed to spawn logic.
    ExtraParamC: 70 // Zd, trailing auxiliary item parameter forwarded into spawn logic.
});


export const ModifierColumns = Object.freeze({
    itemSpriteLocY: 6, // item sprite source Y/index used by draw routines (sprite-sheet source Y).
    heroHealthModifier: 7, // percent HP modifier applied to hero max-HP (from equipped item).
    heroDefenseModifier: 8, // flat defense bonus applied to hero (added to melee/projectile defense arrays).
    heroMagicDefModifier: 9, // percent magic-resist modifier applied to hero (from equipped item).
    heroDodgeModifier: 10 // dodge chance bonus (flat) applied to hero when item is equipped.
});


export const AccessoryPrefixes = Object.freeze({
    TempIdx: 7, // accessory template id column - identifies the accessory effect/type equipped (used by equip checks).
    PrimaryPrefix: 8, // accessory primary label prefix (string) - drawn before primary value in the accessory UI.
    PrimaryValue: 9, // accessory primary level/value column (int) - numeric primary level summed for accessory bonuses.
    PrimarySuffix: 10, // accessory primary label suffix (string) - drawn after primary value in the accessory UI.
    SecondaryLabelPrefix: 11, // accessory secondary label prefix (string) - prefix text for the accessory secondary stat label.
    SecondaryValue: 12, // accessory secondary value column (int) - numeric secondary value for accessory bonuses.
    SecondaryLabelSuffix: 13 // accessory secondary label suffix (string) - prefix text for the accessory secondary stat label.
});


export const AccessoryProps = Object.freeze({
    ArmsBonus0: 1, // ARMS accessory bonus effect column (grants "ARMS Lv +" for ring-type accessories; counted by heroHasAccessoryEffect/countAccessoryLvlBonuses)
    ChargeBonus: 2, // CHARGE accessory bonus effect column (grants "CHARGE Lv +" for amulet-type accessories; counted by heroHasAccessoryEffect/countAccessoryLvlBonuses)
    ArmsBonus1: 3, // Secondary ARMS accessory bonus effect column (used by multi-effect accessories like Master Ring; supports primary/secondary sums via sumAccessorySecondaryValues)
    EffectAtkBonus: 4, // oe, returns/identifies the accessory effect that boosts weapon attack; used with heroHasAccessoryEffect and countAccessoryLvlBonuses.
    EffectAgiPenalty: 5, // pe, identifies an accessory effect that reduces hero agility (AGI) by accessory level.
    EffectRangeAndCount: 6, // qe, accessory effect that increases attack range (for certain item appearances) and contributes to item secondary values (range/count bonuses).
    EffectEmitFullChargeChance_duringCharge: 7, // re, accessory effect that gives a chance (per accessory level) to immediately fill the emit gauge while the hero is charging.
    EffectEmitFullChargeChance_onFire: 8, // se, accessory effect that gives a chance (per accessory level) to immediately refill the emit gauge when an emit completes/fires.
    EffectEmitMaxReduction: 9, // te, accessory effect that reduces the hero's maximum emit value (lowers required charge), applied per accessory level.
    EffectMultiShotIncrease: 10, // ue, accessory effect that increases the attack shot count / multiple-shot count by accessory levels.
    DodgeChance: 15, // accessory effect that grants a flat dodge-chance bonus per accessory level.
    EffectPhysicalProcChance: 16, // we, accessory effect that gives a chance (per accessory level) to multiply physical weapon ATK by the accessory's secondary value (physical proc/crit).
    EffectFireStatBonus: 17, // xe, accessory effect that adds its primary value to the item's fire-related stat (applied when item element == fire).
    EffectIceStatBonus: 18, // ye, accessory effect that adds its primary value to the item's ice-related stat (applied when item element == ice).
    EffectLightningMaxAtkPercent: 19, // ze, accessory effect that increases the max ATK percent for lightning-element items (applies only to maxAtk).
    EffectLightningElemBonus: 20, // Ae, accessory effect that modifies lightning-element item behavior (e.g., increments selectedItemIdx for certain attack modes / forge interactions).
    EffectPoisonAtkPercent: 21, // Be, accessory effect that increases ATK percent for poison-element items (applies to min/max ATK).
    RewardValueBonus: 22, // Ce, accessory effect that increases party reward value percent (adds to stage reward value).
    DropChanceBonus: 23, // Ee, accessory effect that increases party drop chance percent.
    EnemyHpBonus: 24, // Fe, accessory effect that increases enemy HP percent (used to scale stage enemy HP).
    FireAtkPercent: 25, // Ge, accessory effect that increases min/max ATK percent for fire-element items.
    IceAtkPercent: 26, // He, accessory effect that increases min/max ATK percent for ice-element items.
    EffectPoisonStatBonus: 27, // Ie, accessory effect that adds a (large) amount to an item stat when element == poison (applied as +60 * level in code).
    MultiShotSpreadDivisor: 28, // Je, accessory effect that reduces multi-shot angular spread (divides the shot-step We when present).
    MeleeDefence: 29, // accessory effect that grants flat melee/proj defense per level (added to hero melee/proj defense arrays).
    MagicDefense: 30, // accessory effect that grants flat magic-defense percent per level (added to hero magic defense).
    ComboMaxIncrease: 31, // Me, accessory effect that increases the combo/charge max (Vg) by 60 per accessory level (affects combo bar max).
    ChargeValueBonus: 32, // Ne, accessory effect that increases hero charge/emit-value (adds to heroChargeValues when present).
    HealthBonus: 33, // accessory effect that multiplies party max HP by a percent per accessory level.
    JointStepDivider: 34, // Pe, accessory effect that alters joint/body step smoothing (used to divide the per-joint stepWithVerticalBias step amount when present).
    MagicDamageReduction: 35, // Qe, accessory effect that subtracts a flat amount from incoming magic-damage (attackType == 1).
    StunChanceReduction: 36, // Re, accessory effect that reduces the "skip/chance" parameter hi[...] applied on attackType==2 (reduces skip/stun probability or similar).
    DamageNegationChance: 37, // Se, accessory effect that gives a random chance to fully negate certain attacks (attackType == 3 branch).
    DebuffDurationReduction: 38 // Te, accessory effect that reduces debuff/duration timers (subtracts from dh[...] when attackType==4).
});

/*
const {
    itemNameCol,
    itemDropIconCol,
    itemHeadwearType,
    itemAppearanceCol,
    itemRangeTypeCol,
    itemSpriteSourceXCol,
    itemLimbSelectionCol,
    itemProjectileDrawWidthCol,
    itemProjectileDrawHeightCol,
    itemProjectileShapeModeCol,
    itemHitCountStatCol,
    itemAtkMinCol,
    itemAtkMaxCol,
    itemProjectileCountCol,
    itemProjectileSpeedCol,
    itemAgilityCol,
    itemRangeCol,
    projectileEffectWidthCol,
    projectileEffectHeightCol,
    projectileDelayRangeCol,
    projectileNoDamageFramesCol,
    projectileStartAnimFrameCol,
    projectileLifetimeCol,
    projectileTargetIndexCol,
    projectileAccelerationCol,
    projectileSpeedScaleCol,
    projectileAuxStatCol,
    projectileCollisionModeCol,
    attackCooldownCol,
    projectileAuxParamCol,
    itemProjectileMaxTargetsCol,
    itemProjectileDamageMinCol,
    itemProjectileDamageMaxCol,
    itemProjectileEffectTypeCol,
    projectileEffectTypeCol,
    projectileEffectDurationCol,
    itemElementTypeCol,
    itemIceBonusPercentCol,
    itemChargeEmitValueCol,
    itemForgeMaxLevelCol,
    itemForgeCostPerLevelCol,
    itemStatModifyingBaseCol,
    itemProjectileParam1Col,
    itemAttackModeCol,
    itemProjectileParam2Col,
    itemProjectileParam3Col,
    itemAttackPowerCol,
    itemProjectileTemplateCol,
    itemProjectileAux1Col,
    itemProjectileAux2Col,
    itemAuxValueACol,
    itemAuxValueBCol,
    itemAuxValueCCol,
    itemDisplayStatACol,
    itemAuxValueDCol,
    itemProjectileFlagCol,
    itemProjectileParamTimeCol,
    itemHitCountCol,
    itemProjectileEffectModeCol,
    itemStatACol,
    itemExtraStatCol1,
    itemExtraStatCol2,
    itemSpawnTargetRangeCol,
    itemExtraParamACol,
    itemExtraParamBCol,
    itemExtraParamCCol
} = ItemColumns;

const {
    accessoryArmsBonusCol0,
    accessoryChargeBonusCol,
    accessoryArmsBonusCol1,
    accessoryEffectAtkBonusCol,
    accessoryEffectAgiPenaltyCol,
    accessoryEffectRangeAndCountCol,
    accessoryEffectEmitFullChargeChance_duringChargeCol,
    accessoryEffectEmitFullChargeChance_onFireCol,
    accessoryEffectEmitMaxReductionCol,
    accessoryEffectMultiShotIncreaseCol,
    accessoryDodgeChanceCol,
    accessoryEffectPhysicalProcChanceCol,
    accessoryEffectFireStatBonusCol,
    accessoryEffectIceStatBonusCol,
    accessoryEffectLightningMaxAtkPercentCol,
    accessoryEffectLightningElemBonusCol,
    accessoryEffectPoisonAtkPercentCol,
    accessoryRewardValueBonusCol,
    accessoryDropChanceBonusCol,
    accessoryEnemyHpBonusCol,
    accessoryFireAtkPercentCol,
    accessoryIceAtkPercentCol,
    accessoryEffectPoisonStatBonusCol,
    accessoryMultiShotSpreadDivisorCol,
    accessoryMeleeDefenceCol,
    accessoryMagicDefenseCol,
    accessoryComboMaxIncreaseCol,
    accessoryChargeValueBonusCol,
    accessoryHealthBonusCol,
    accessoryJointStepDividerCol,
    accessoryMagicDamageReductionCol,
    accessoryStunChanceReductionCol,
    accessoryDamageNegationChanceCol,
    accessoryDebuffDurationReductionCol
} = AccessoryPropColumns;

const {
    accessoryTempIdxCol,
    accessoryPrimaryPrefixCol,
    accessoryPrimaryValueCol,
    accessoryPrimarySuffixCol,
    accessorySecondaryLabelPrefixCol,
    accessorySecondaryValueCol,
    accessorySecondaryLabelSuffixCol
} = AccessoryPrefixColumns;

const {
    itemSpriteLocYCol,
    heroHealthModifierCol,
    heroDefenseModifierCol,
    heroMagicDefModifierCol,
    heroDodgeModifierCol
} = ModifierColumns;
*/