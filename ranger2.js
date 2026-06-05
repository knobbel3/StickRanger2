/*
 The games source code use is permission :-)
*/

let domDocument = document,
    mainWindow = window,
    canvasElement = domDocument.getElementById("cv"),
    context2d = canvasElement.getContext("2d"),
    canvasImage = context2d.createImageData(640, 432),
    canvasBuffer = new Uint32Array(canvasImage.data.buffer),
    mainConsole = window.console,
    fromCharCode = String.fromCharCode,
    _setTimeout = setTimeout,
    currentStorage = mainWindow.localStorage,
    hostname = "dan-ball.jp";//location.hostname;

function LogMsg(a) {
    try {
        mainConsole.log(a)
    } catch (b) { }
}

export {gameInit as Init, toggleFullscreen as full_screen};
// mainWindow.Init = gameInit;
// mainWindow.full_screen = toggleFullscreen;


const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 432;

let userSaveCode, // ca
    userSaveKey = [0, 0, 0, 0, 0, 0, 0, 0], // da
    isMinimalTitleMode, // ea
    canvasImageBuffer = new Sprite,
    titleSprite = new Sprite,
    iconSpriteSheet = new Sprite,
    tilesetSprites = Array(3);
for (let _i = 0; 3 > _i; _i++) tilesetSprites[_i] = new Sprite;

let currentLevelSprite = new Sprite,
    enemySpriteSheet = new Sprite,
    droppedItemSpriteSheet = new Sprite,
    itemsSpriteSheet = new Sprite,
    effectSpriteSheet = new Sprite,
    medalSpriteSheet = new Sprite,
    gameScreenState = 0,
    screenStateTimer = 0, // sa
    currentStage = 0,
    clickInUI = false, // ta

    memberUIVisible = false,
    inventoryUIVisible = false,
    bestiaryUIVisible = false,
    badgesUIVisible = false,
    optionsUIVisible = false,
    shrineUIVisible = false,
    
    memberUIVisibleBackup = false, // Ba
    inventoryUIVisibleBackup = false, // Da
    bestiaryUIVisibleBackup = false, // Ea
    badgesUIVisibleBackup = false, // Ha
    optionsUIVisibleBackup = false, // Ia
    shrineUIVisibleBackup = false, // Ja

    selectingHero = 0,
    selectedStatIndex = 0, 
    inventoryTabIdx = 0, // Na, 0..4 for "ARMS","CHARGE","HEAD","RING","AMULET"
    inventoryPageIdx = 0, // Oa, 
    inventorySlotIdx = 0, // Pa, 0..27 grid index; used to highlight/select a cell
    currentBestiaryPage = 0,
    bestiaryEnemySelection = 0,
    badgesUIStageIdx = 0, // Sa
    LevelExpThresholds = Array(100);
LevelExpThresholds[0] = 0;
for (let _i = 1; 98 > _i; _i++) 
    LevelExpThresholds[_i] = LevelExpThresholds[_i - 1] + 1E3 * _i;
LevelExpThresholds[98] = 9999999;
LevelExpThresholds[99] = 9999999;

let partyMemberCount = 1,
    partyLevel = 1,
    partyEXPAccum = 0,
    partyGold = 0,
    partySP = [0, 0, 0, 0],
    partyLP = [50, 50, 50, 50],
    partyMaxLP = [50, 50, 50, 50],
    heroEmitCurrent = [0, 0, 0, 0], // $a
    heroEmitValues = [0, 0, 0, 0],
    heroChargeValues = [0, 0, 0, 0],
    heroEmitCooldown = [0, 0, 0, 0], // cb

    stageEventFlags = [0, 0, 0, 0, 0, 0, 0, 0, 0],
    collectedStageFlagsCount = 0, // eb
    stageFlagsSetCount = 0, // hb

    autoMoveEnabled = [0, 0, 0, 0], // ib
    cliffStopEnabled = 0, // kb

    // real values
    partyHealthLvls = [0, 0, 0, 0],
    partyShortAtkLvls = [0, 0, 0, 0],
    partyMidAtkLvls = [0, 0, 0, 0],
    partyLongAtkLvls = [0, 0, 0, 0],
    partyPhysLvls = [0, 0, 0, 0],
    partyElemLvls = [0, 0, 0, 0],
    partyDodgeLvls = [0, 0, 0, 0],
    partyStats = [partyHealthLvls, partyShortAtkLvls, partyMidAtkLvls, partyLongAtkLvls, partyPhysLvls, partyElemLvls, partyDodgeLvls],

    // fake values!!
    partyMaxLPBonus_vals = [0, 0, 0, 0],
    partyShortAtk_vals = [0, 0, 0, 0],
    partyMidAtk_vals = [0, 0, 0, 0],
    partyLongAtk_vals = [0, 0, 0, 0],
    partyPhys_vals = [0, 0, 0, 0],
    partyElem_vals = [0, 0, 0, 0],
    partyDodge_vals = [0, 0, 0, 0],
    partyPhysAtkStats = [partyShortAtk_vals, partyMidAtk_vals, partyLongAtk_vals],
    //               PRIMARY      SECONDARY   
    //              [h0,h1,h2,h3, h0,h1,h2,h3]
    minAtkArray =   [0, 0, 0, 0,  0, 0, 0, 0],
    maxAtkArray =   [0, 0, 0, 0,  0, 0, 0, 0],
    atkCountArray = [0, 0, 0, 0,  0, 0, 0, 0],

    heroAgiValues = [0, 0, 0, 0],
    heroRangeValues = [0, 0, 0, 0],
    heroMeleeDefensesFlatArray = [0, 0, 0, 0],
    heroProjDefenseFlatArray = [0, 0, 0, 0],
    heroMagicDefenseFlatArray = [0, 0, 0, 0],
    heroDodgeChanceArray = [0, 0, 0, 0],
    physAtkBonusPercent = [0, 0, 0, 0], // Nb
    fireAtkBonusPercent = [0, 0, 0, 0], // Ob
    iceAtkBonusPercent = [0, 0, 0, 0], // Pb
    lightningAtkBonusPercent = [0, 0, 0, 0], // Sb
    poisonAtkBonusPercent = [0, 0, 0, 0], // Tb
    atkBonusPercentByElement = [physAtkBonusPercent, fireAtkBonusPercent, iceAtkBonusPercent, lightningAtkBonusPercent, poisonAtkBonusPercent], // Ub
    
    partyRewardValueBonusPercent = 0, // Vb
    partyDropChanceBonusPercent = 0, // Wb
    partyEnemyHpBonusPercent = 0, // Xb
    /** [partyN][i] */
    partyEquipmentTable = [
        // "arms", "charge", "head", "ring", "amulet"
        [4, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        []
    ],
    forgePreviewItemIdx = -1, // Zb
    itemForgeLvls = Array(256);

for (let _i = 0; 256 > _i; _i++) itemForgeLvls[_i] = 0;
let itemIsNew = Array(256); // ac, 
for (let _i = 0; 256 > _i; _i++) itemIsNew[_i] = 0;


function resetGameProgress() { // bc
    let a, b;
    resetUIStates();
    partyLevel = partyMemberCount = 1;
    for (a = partyGold = partyEXPAccum = 0; 4 > a; a++) 
        partySP[a] = 0, 
        partyLP[a] = 50, 
        partyMaxLP[a] = 50, 
        heroEmitCurrent[a] = 0;
    for (a = 0; 9 > a; a++) stageEventFlags[a] = 0;
    for (b = stageFlagsSetCount = collectedStageFlagsCount = 0; b < partyStats.length; b++)
        for (a = 0; 4 > a; a++) partyStats[b][a] = 0;
    for (a = 0; 4 > a; a++)
        for (b = 0; 8 > b; b++) partyEquipmentTable[a][b] = 0;
    for (a = 0; 256 > a; a++) itemForgeLvls[a] = 0, itemIsNew[a] = 0;
    for (a = 0; a < stageCount; a++) isStageReachedArray[a] = 0;
    for (a = 0; a < enemyTypeCount; a++) bestiaryEntryState[a] = 0;
    for (a = 0; a < badgeCount; a++) badgeCounterArray[a] = 0;
    for (a = 0; a < shrineRewardClaimSlotCount; a++) shrineRewardClaimed[a] = 0;
    for (a = 0; 4 > a; a++) autoMoveEnabled[a] = 0;
    cliffStopEnabled = 0
}


function resetUIStates() {
    screenStateTimer = 0;
    memberUIVisibleBackup = inventoryUIVisibleBackup = bestiaryUIVisibleBackup = badgesUIVisibleBackup = optionsUIVisibleBackup = shrineUIVisibleBackup = clickInUI = memberUIVisible = inventoryUIVisible = bestiaryUIVisible = badgesUIVisible = optionsUIVisible = shrineUIVisible = false;
    comboMultBonus = comboCount = comboWindowTimer = selectingHero = selectedStatIndex = inventoryTabIdx = inventoryPageIdx = inventorySlotIdx  = 0
}

let inventoryItemLists = [
    [4, 5, 6, 9, 10, 11, 15, 17, 19, 21, 24, 26, 38, 41, 42, 43, 49, 50, 51, 52, 53, 54, 89, 90, 91, 92, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [7, 8, 12, 13, 14, 16, 18, 20, 22, 23, 25, 27, 34, 35, 39, 40, 44, 46, 47, 48, 55, 56, 57, 58, 59, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 131, 132, 133, 134, 135, 0, 0, 0, 0, 0, 0, 0],
    [28, 29, 30, 31, 32, 33, 36, 37, 45, 60, 0, 0, 0, 0, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 0, 0, 0, 0, 0],
    [71, 73, 75, 77, 79, 81, 83, 85, 87, 113, 115, 117, 119, 136, 137, 138, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [72, 74, 76, 78, 80, 82, 84, 86, 88, 114, 116, 118, 120, 139, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    []
];

let ENUM_ITEM_COUNT = 0;
const itemNameCol = ENUM_ITEM_COUNT++, // item display name shown in inventory/equipment UI.
    itemDropIconCol = ENUM_ITEM_COUNT++, // item icon/category used by accessory bonus checks.
    itemHeadwearType = ENUM_ITEM_COUNT++, // encoded sprite tile used for the item icon.
    itemAppearanceCol = ENUM_ITEM_COUNT++, // item appearance/class flag used by the UI.
    itemRangeTypeCol = ENUM_ITEM_COUNT++, // Oc, weapon range bucket: short, middle, or long.
    itemSpriteSourceXCol = ENUM_ITEM_COUNT++, // sprite sheet source X for the item icon.
    itemLimbSelectionCol = ENUM_ITEM_COUNT++, // Qc, limb selection code used to remap the stored limb descriptor.
    itemProjectileDrawWidthCol = ENUM_ITEM_COUNT++, // Rc, projectile sprite draw width.
    itemProjectileDrawHeightCol = ENUM_ITEM_COUNT++, // Sc, projectile sprite draw height.
    itemProjectileShapeModeCol = ENUM_ITEM_COUNT++, // Tc, projectile shape/collision mode used when spawning and resolving hits.
    itemHitCountStatCol = ENUM_ITEM_COUNT++, // Uc, number of hits the projectile can apply; the UI shows all or N hit.
    itemAtkMinCol = ENUM_ITEM_COUNT++, // Vc, lower attack value shown in the item’s AT min-max range.
    itemAtkMaxCol = ENUM_ITEM_COUNT++, // Wc, upper attack value shown in the item’s AT min-max range.
    itemProjectileCountCol = ENUM_ITEM_COUNT++, // Xc, per-attack projectile count; feeds atkCountArray and the *N attack UI.
    itemProjectileSpeedCol = ENUM_ITEM_COUNT++, // Yc, projectile launch speed; scales shot velocity before each spawnProjectile() call.
    itemAgilityCol = ENUM_ITEM_COUNT++, // Zc, hero agility stat; copied into heroAgiValues and shown as AGI.
    itemRangeCol = ENUM_ITEM_COUNT++, // $c, hero range stat; copied into heroRangeValues and shown as RANGE.
    projectileEffectWidthCol = ENUM_ITEM_COUNT++, // ad, projectile effect hitbox width.
    projectileEffectHeightCol = ENUM_ITEM_COUNT++, // bd, projectile effect hitbox height.
    projectileDelayRangeCol = ENUM_ITEM_COUNT++, // cd, random projectile spawn delay range.
    projectileNoDamageFramesCol = ENUM_ITEM_COUNT++, // dd, frames a projectile can’t deal damage after spawn.
    projectileStartAnimFrameCol = ENUM_ITEM_COUNT++, // ed, projectile's initial animation frame.
    projectileLifetimeCol = ENUM_ITEM_COUNT++, // fd, projectile lifetime (frames) used for lifespan and alpha fade.
    projectileTargetIndexCol = ENUM_ITEM_COUNT++, // gd, projectile target/mode index: 0=default, -1=special, >0 = index into entity limb/slot for homing/anchoring.
    projectileAccelerationCol = ENUM_ITEM_COUNT++, // hd, projectile acceleration / gravity magnitude (from item stat), used to influence projectile velocity each frame.
    projectileSpeedScaleCol = ENUM_ITEM_COUNT++, // id, projectile velocity scale / speed multiplier (percent-like), applied each frame as .01 * value to scale projectile velocity.
    projectileAuxStatCol = ENUM_ITEM_COUNT++, // jd, auxiliary projectile stat passed into spawnProjectile; current code does not read the matching projectile slot later.
    projectileCollisionModeCol = ENUM_ITEM_COUNT++, // kd, projectile wall-collision mode: 0 stop, 2 slide, 3 bounce, 4 clamp.
    attackCooldownCol = ENUM_ITEM_COUNT++, // ld, cooldown in frames before the next attack or passive emit can fire.
    projectileAuxParamCol = ENUM_ITEM_COUNT++, // md, auxiliary projectile parameter stored on spawn; current projectile logic does not read it.
    itemProjectileMaxTargetsCol = ENUM_ITEM_COUNT++, // nd, projectile max-target count; 2 falls back to the upper byte of itemProjectileDamageMinCol.
    itemProjectileDamageMinCol = ENUM_ITEM_COUNT++, // od, projectile minimum damage; its upper byte is reused by itemProjectileMaxTargetsCol when needed.
    itemProjectileDamageMaxCol = ENUM_ITEM_COUNT++, // pd, projectile maximum damage.
    itemProjectileEffectTypeCol = ENUM_ITEM_COUNT++, // qd, projectile effect/damage mode.
    projectileEffectTypeCol = ENUM_ITEM_COUNT++, // rd, effect type used by projectile hit logic; controls whether a hit applies direct damage or a status effect.
    projectileEffectDurationCol = ENUM_ITEM_COUNT++, // sd, effect duration in frames used by projectile hit logic.
    itemElementTypeCol = ENUM_ITEM_COUNT++, // td, item element code; the UI renders it as physical, fire, ice, lightning, or poison.
    itemIceBonusPercentCol = ENUM_ITEM_COUNT++, // ud, ice-specific percent bonus shown for ice-element gear.
    itemChargeEmitValueCol = ENUM_ITEM_COUNT++, // vd, shared charge/emit stat shown as CHARGE for arms and EMIT for emit gear.
    itemForgeMaxLevelCol = ENUM_ITEM_COUNT++, // wd, highest forge level the item can reach.
    itemForgeCostPerLevelCol = ENUM_ITEM_COUNT++, // xd, gold cost per forge level used by the upgrade panel.
    itemStatModifyingBaseCol = ENUM_ITEM_COUNT++; // base column for item stat modifier pairs.

ENUM_ITEM_COUNT++;
ENUM_ITEM_COUNT++;
ENUM_ITEM_COUNT++;
ENUM_ITEM_COUNT++;
ENUM_ITEM_COUNT++;
const itemProjectileParam1Col = ENUM_ITEM_COUNT++, // zd, projectile config parameter; read into ic and forwarded into spawnProjectile().
    itemAttackModeCol = ENUM_ITEM_COUNT++, // attack mode code; drives the *N attack UI and the special 10/11/20 cases.
    itemProjectileParam2Col = ENUM_ITEM_COUNT++, // Bd, projectile config parameter; read into kc and forwarded into spawnProjectile().
    itemProjectileParam3Col = ENUM_ITEM_COUNT++, // Cd, projectile config parameter; read into Sf and forwarded into spawnProjectile().
    itemAttackPowerCol = ENUM_ITEM_COUNT++, // Ed, attack power / shot strength; shown in the AT ... *N > UI and used in the forge preview.
    itemProjectileTemplateCol = ENUM_ITEM_COUNT++, // Fd, nested projectile/item template reference; the attack code dereferences selectedItem = selectedItem[Fd] before spawning.
    
    itemProjectileAux1Col = ENUM_ITEM_COUNT++, // Gd, nested projectile/item template reference; the attack code dereferences selectedItem = selectedItem[Fd] before spawning.
    itemProjectileAux2Col = ENUM_ITEM_COUNT++, // Hd, auxiliary projectile config value; same pattern as Gd, forwarded into spawnProjectile() and stored on the projectile state.
    
    itemAuxValueACol = ENUM_ITEM_COUNT++, // Id, auxiliary item parameter forwarded into projectile spawn (unknown semantic).
    itemAuxValueBCol = ENUM_ITEM_COUNT++, // Jd, auxiliary item parameter forwarded into projectile spawn.
    
    itemAuxValueCCol = ENUM_ITEM_COUNT++, // Kd, auxiliary item parameter forwarded into projectile spawn.
    itemDisplayStatACol = ENUM_ITEM_COUNT++, // Ld, item display/forge stat column used in AT UI calculations.
    itemAuxValueDCol = ENUM_ITEM_COUNT++, // Md, auxiliary item parameter forwarded into projectile spawn.
    itemProjectileFlagCol = ENUM_ITEM_COUNT++, // Nd, small integer flag stored on projectile state and used in hit/draw logic.
    itemProjectileParamTimeCol = ENUM_ITEM_COUNT++, // Od, time/auxiliary numeric parameter stored on projectile state and used during updates.
    itemHitCountCol = ENUM_ITEM_COUNT++, // Pd, number-of-hits stat for the item; influences UI (all / N hit) and projectile behavior.
    itemProjectileEffectModeCol = ENUM_ITEM_COUNT++, // Sd, projectile effect/damage-mode code read from the item row and forwarded into projectile hit logic.
    itemStatACol = ENUM_ITEM_COUNT++, // Td, stat index used with getModifiedStatVal() for display and calculations.

    itemExtraStatCol1 = ENUM_ITEM_COUNT++, // Ud, auxiliary item stat forwarded into projectile/item logic.
    itemExtraStatCol2 = ENUM_ITEM_COUNT++, // Vd, auxiliary item stat forwarded into projectile/item logic 

    itemSpawnTargetRangeCol = ENUM_ITEM_COUNT++, // Wd, range/index used to locate nearest party member / spawn target; forwarded into spawn logic.

    itemExtraParamACol = ENUM_ITEM_COUNT++, // Xd, auxiliary item parameter passed to spawn logic.
    itemExtraParamBCol = ENUM_ITEM_COUNT++, // Yd, auxiliary item parameter passed to spawn logic.
    itemExtraParamCCol = ENUM_ITEM_COUNT++; // Zd, trailing auxiliary item parameter forwarded into spawn logic.

let ENUM_MODIFIER_COUNT = 6;
const itemSpriteLocYCol = ENUM_MODIFIER_COUNT++, // item sprite source Y/index used by draw routines (sprite-sheet source Y).
    heroHealthModifierCol = ENUM_MODIFIER_COUNT++, // percent HP modifier applied to hero max-HP (from equipped item).
    heroDefenseModifierCol = ENUM_MODIFIER_COUNT++, // flat defense bonus applied to hero (added to melee/projectile defense arrays).
    heroMagicDefModifierCol = ENUM_MODIFIER_COUNT++, // percent magic-resist modifier applied to hero (from equipped item).
    heroDodgeModifierCol = ENUM_MODIFIER_COUNT++; // dodge chance bonus (flat) applied to hero when item is equipped.

let ENUM_ACCESSORY_PREFIX_COUNT = 6;
ENUM_ACCESSORY_PREFIX_COUNT++;
const accessoryTempIdxCol = ENUM_ACCESSORY_PREFIX_COUNT++, // accessory template id column - identifies the accessory effect/type equipped (used by equip checks).

    accessoryPrimaryPrefixCol = ENUM_ACCESSORY_PREFIX_COUNT++, // accessory primary label prefix (string) - drawn before primary value in the accessory UI.
    accessoryPrimaryValueCol = ENUM_ACCESSORY_PREFIX_COUNT++, // accessory primary level/value column (int) - numeric primary level summed for accessory bonuses.
    accessoryPrimarySuffixCol = ENUM_ACCESSORY_PREFIX_COUNT++, // accessory primary label suffix (string) - drawn after primary value in the accessory UI.

    accessorySecondaryLabelPrefixCol = ENUM_ACCESSORY_PREFIX_COUNT++, // accessory secondary label prefix (string) - prefix text for the accessory secondary stat label.
    accessorySecondaryValueCol = ENUM_ACCESSORY_PREFIX_COUNT++, // accessory secondary label prefix (string) - prefix text for the accessory secondary stat label.
    accessorySecondaryLabelSuffixCol = ENUM_ACCESSORY_PREFIX_COUNT++; // accessory secondary label prefix (string) - prefix text for the accessory secondary stat label.

let ENUM_ACCESSORY_PROPS_COUNT = 1;
const accessoryArmsBonusCol0 = ENUM_ACCESSORY_PROPS_COUNT++, // ARMS accessory bonus effect column (grants "ARMS Lv +" for ring-type accessories; counted by heroHasAccessoryEffect/countAccessoryLvlBonuses)
    accessoryChargeBonusCol = ENUM_ACCESSORY_PROPS_COUNT++, // CHARGE accessory bonus effect column (grants "CHARGE Lv +" for amulet-type accessories; counted by heroHasAccessoryEffect/countAccessoryLvlBonuses)
    accessoryArmsBonusCol1 = ENUM_ACCESSORY_PROPS_COUNT++, // Secondary ARMS accessory bonus effect column (used by multi-effect accessories like Master Ring; supports primary/secondary sums via sumAccessorySecondaryValues)
    accessoryEffectAtkBonusCol = ENUM_ACCESSORY_PROPS_COUNT++, // oe, returns/identifies the accessory effect that boosts weapon attack; used with heroHasAccessoryEffect and countAccessoryLvlBonuses.
    accessoryEffectAgiPenaltyCol = ENUM_ACCESSORY_PROPS_COUNT++, // pe, identifies an accessory effect that reduces hero agility (AGI) by accessory level.
    accessoryEffectRangeAndCountCol = ENUM_ACCESSORY_PROPS_COUNT++, // qe, accessory effect that increases attack range (for certain item appearances) and contributes to item secondary values (range/count bonuses).
    accessoryEffectEmitFullChargeChance_duringChargeCol = ENUM_ACCESSORY_PROPS_COUNT++, // re, accessory effect that gives a chance (per accessory level) to immediately fill the emit gauge while the hero is charging.
    accessoryEffectEmitFullChargeChance_onFireCol = ENUM_ACCESSORY_PROPS_COUNT++, // se, accessory effect that gives a chance (per accessory level) to immediately refill the emit gauge when an emit completes/fires.
    accessoryEffectEmitMaxReductionCol = ENUM_ACCESSORY_PROPS_COUNT++, // te, accessory effect that reduces the hero's maximum emit value (lowers required charge), applied per accessory level.
    accessoryEffectMultiShotIncreaseCol = ENUM_ACCESSORY_PROPS_COUNT++; // ue, accessory effect that increases the attack shot count / multiple-shot count by accessory levels.

ENUM_ACCESSORY_PROPS_COUNT++;
ENUM_ACCESSORY_PROPS_COUNT++;
ENUM_ACCESSORY_PROPS_COUNT++;
ENUM_ACCESSORY_PROPS_COUNT++;
const accessoryDodgeChanceCol = ENUM_ACCESSORY_PROPS_COUNT++, // accessory effect that grants a flat dodge-chance bonus per accessory level.
    accessoryEffectPhysicalProcChanceCol = ENUM_ACCESSORY_PROPS_COUNT++, // we, accessory effect that gives a chance (per accessory level) to multiply physical weapon ATK by the accessory's secondary value (physical proc/crit).
    accessoryEffectFireStatBonusCol = ENUM_ACCESSORY_PROPS_COUNT++, // xe, accessory effect that adds its primary value to the item's fire-related stat (applied when item element == fire).
    accessoryEffectIceStatBonusCol = ENUM_ACCESSORY_PROPS_COUNT++, // ye, accessory effect that adds its primary value to the item's ice-related stat (applied when item element == ice).
    accessoryEffectLightningMaxAtkPercentCol = ENUM_ACCESSORY_PROPS_COUNT++, // ze, accessory effect that increases the max ATK percent for lightning-element items (applies only to maxAtk).
    accessoryEffectLightningElemBonusCol = ENUM_ACCESSORY_PROPS_COUNT++, // Ae, accessory effect that modifies lightning-element item behavior (e.g., increments selectedItemIdx for certain attack modes / forge interactions).
    accessoryEffectPoisonAtkPercentCol = ENUM_ACCESSORY_PROPS_COUNT++, // Be, accessory effect that increases ATK percent for poison-element items (applies to min/max ATK).
    accessoryRewardValueBonusCol = ENUM_ACCESSORY_PROPS_COUNT++, // Ce, accessory effect that increases party reward value percent (adds to stage reward value).
    accessoryDropChanceBonusCol = ENUM_ACCESSORY_PROPS_COUNT++, // Ee, accessory effect that increases party drop chance percent.
    accessoryEnemyHpBonusCol = ENUM_ACCESSORY_PROPS_COUNT++, // Fe, accessory effect that increases enemy HP percent (used to scale stage enemy HP).
    accessoryFireAtkPercentCol = ENUM_ACCESSORY_PROPS_COUNT++, // Ge, accessory effect that increases min/max ATK percent for fire-element items.
    accessoryIceAtkPercentCol = ENUM_ACCESSORY_PROPS_COUNT++, // He, accessory effect that increases min/max ATK percent for ice-element items.
    accessoryEffectPoisonStatBonusCol = ENUM_ACCESSORY_PROPS_COUNT++, // Ie, accessory effect that adds a (large) amount to an item stat when element == poison (applied as +60 * level in code).
    accessoryMultiShotSpreadDivisorCol = ENUM_ACCESSORY_PROPS_COUNT++, // Je, accessory effect that reduces multi-shot angular spread (divides the shot-step We when present).
    accessoryMeleeDefenceCol = ENUM_ACCESSORY_PROPS_COUNT++, // accessory effect that grants flat melee/proj defense per level (added to hero melee/proj defense arrays).
    accessoryMagicDefenseCol = ENUM_ACCESSORY_PROPS_COUNT++, // accessory effect that grants flat magic-defense percent per level (added to hero magic defense).
    accessoryComboMaxIncreaseCol = ENUM_ACCESSORY_PROPS_COUNT++, // Me, accessory effect that increases the combo/charge max (Vg) by 60 per accessory level (affects combo bar max).
    accessoryChargeValueBonusCol = ENUM_ACCESSORY_PROPS_COUNT++, // Ne, accessory effect that increases hero charge/emit-value (adds to heroChargeValues when present).
    accessoryHealthBonusCol = ENUM_ACCESSORY_PROPS_COUNT++, // accessory effect that multiplies party max HP by a percent per accessory level.
    accessoryJointStepDividerCol = ENUM_ACCESSORY_PROPS_COUNT++, // Pe, accessory effect that alters joint/body step smoothing (used to divide the per-joint stepWithVerticalBias step amount when present).
    accessoryMagicDamageReductionCol = ENUM_ACCESSORY_PROPS_COUNT++, // Qe, accessory effect that subtracts a flat amount from incoming magic-damage (attackType == 1).
    accessoryStunChanceReductionCol = ENUM_ACCESSORY_PROPS_COUNT++, // Re, accessory effect that reduces the "skip/chance" parameter hi[...] applied on attackType==2 (reduces skip/stun probability or similar).
    accessoryDamageNegationChanceCol = ENUM_ACCESSORY_PROPS_COUNT++, // Se, accessory effect that gives a random chance to fully negate certain attacks (attackType == 3 branch).
    accessoryDebuffDurationReductionCol = ENUM_ACCESSORY_PROPS_COUNT++; // Te, accessory effect that reduces debuff/duration timers (subtracts from dh[...] when attackType==4).


function getItemModifierAmount(itemIdx, columnIdx) { // Ue
    for (var c = 0; 6 > c; c += 2)
        if (itemList[itemIdx][itemStatModifyingBaseCol + c] == columnIdx) return itemList[itemIdx][itemStatModifyingBaseCol + c + 1];
    return 0
}


function getItemStatWithForge(_itemIdx, _columnIdx) { // Ve
    var c = 0;
    if (0 == _columnIdx) {
        c = 0;
    } else {
        if (_columnIdx == itemList[_itemIdx][itemStatModifyingBaseCol + 0]) {
            c = itemList[_itemIdx][itemStatModifyingBaseCol + 1];
        } else if (_columnIdx == itemList[_itemIdx][itemStatModifyingBaseCol + 2]) {
            c = itemList[_itemIdx][itemStatModifyingBaseCol + 3];
        } else {
            _columnIdx == itemList[_itemIdx][itemStatModifyingBaseCol + 4] && (c = itemList[_itemIdx][itemStatModifyingBaseCol + 5]);
        }
        
    }
    if (0 != c) {
        var d = itemForgeLvls[_itemIdx] - 1;
        _itemIdx == forgePreviewItemIdx && d++;
        return itemList[_itemIdx][_columnIdx] + floor(itemList[_itemIdx][_columnIdx] * d * c / 100);
    }
    return itemList[_itemIdx][_columnIdx];
}


function getItemForgeMultiplier(_itemIdx, _columnIdx) { // Xe
    var c = 0;
    if (0 == _columnIdx) {
        c = 0;
    } else if (_columnIdx == itemList[_itemIdx][itemStatModifyingBaseCol + 0]) {
        c = itemList[_itemIdx][itemStatModifyingBaseCol + 1];
    } else if (_columnIdx == itemList[_itemIdx][itemStatModifyingBaseCol + 2]) {
        c = itemList[_itemIdx][itemStatModifyingBaseCol + 3];
    } else {
        _columnIdx == itemList[_itemIdx][itemStatModifyingBaseCol + 4] && (c = itemList[_itemIdx][itemStatModifyingBaseCol + 5]);
    }
    
    if (0 != c) {
        var d = itemForgeLvls[_itemIdx] - 1;
        _itemIdx == forgePreviewItemIdx && d++;
        return d * c;
    }
    return -1;
}


function getModifiedStatVal(heroIdx, itemIdx, columnIdx) {
    let d = 0;
    // it goes like this...
    //       +0     +2     +4          | itemStatModifingCol + *
    // [..., c0,b0, c1,b1, c2,b2, ...] | itemList[itemIdx]
    //          *      *      *        | d
    if (columnIdx == 0) {
        d = 0;
    } else if (columnIdx == itemList[itemIdx][itemStatModifyingBaseCol + 0]) {
        d = itemList[itemIdx][itemStatModifyingBaseCol + 1];
    } else if (columnIdx == itemList[itemIdx][itemStatModifyingBaseCol + 2]) {
        d = itemList[itemIdx][itemStatModifyingBaseCol + 3];
    } else if (columnIdx == itemList[itemIdx][itemStatModifyingBaseCol + 4]) {
        d = itemList[itemIdx][itemStatModifyingBaseCol + 5];
    }

    if (0 != d) {
        let f = itemForgeLvls[itemIdx] - 1; // $b
        if (heroHasAccessoryEffect(heroIdx, accessoryArmsBonusCol0) && 3 == itemList[itemIdx][itemDropIconCol])
            f += countAccessoryLvlBonuses(heroIdx, accessoryArmsBonusCol0);

        if (heroHasAccessoryEffect(heroIdx, accessoryChargeBonusCol) && 4 == itemList[itemIdx][itemDropIconCol])
            f += countAccessoryLvlBonuses(heroIdx, accessoryChargeBonusCol);

        if (heroHasAccessoryEffect(heroIdx, accessoryArmsBonusCol1) && 3 == itemList[itemIdx][itemDropIconCol])
            f += countAccessoryLvlBonuses(heroIdx, accessoryArmsBonusCol1);

        if (heroHasAccessoryEffect(heroIdx, accessoryArmsBonusCol1) && 4 == itemList[itemIdx][itemDropIconCol])
            f += sumAccessorySecondaryValues(heroIdx, accessoryArmsBonusCol1);

        return itemList[itemIdx][columnIdx] + floor(itemList[itemIdx][columnIdx] * f * d / 100)
    }
    return itemList[itemIdx][columnIdx]
}


function heroHasAccessoryEffect(partyIdx, accessoryIdx) {
    return itemList[partyEquipmentTable[partyIdx][3]][accessoryTempIdxCol] == accessoryIdx ||
        itemList[partyEquipmentTable[partyIdx][4]][accessoryTempIdxCol] == accessoryIdx
        ? true
        : false
}


function countAccessoryLvlBonuses(partyIdx, accessoryIdx) {
    var c = 0;
    itemList[partyEquipmentTable[partyIdx][3]][accessoryTempIdxCol] == accessoryIdx && (c += itemList[partyEquipmentTable[partyIdx][3]][accessoryPrimaryValueCol]);
    itemList[partyEquipmentTable[partyIdx][4]][accessoryTempIdxCol] == accessoryIdx && (c += itemList[partyEquipmentTable[partyIdx][4]][accessoryPrimaryValueCol]);
    return c
}


function sumAccessorySecondaryValues(partyIdx, accessoryIdx) {
    var c = 0;
    itemList[partyEquipmentTable[partyIdx][3]][accessoryTempIdxCol] == accessoryIdx && (c += itemList[partyEquipmentTable[partyIdx][3]][accessorySecondaryValueCol]);
    itemList[partyEquipmentTable[partyIdx][4]][accessoryTempIdxCol] == accessoryIdx && (c += itemList[partyEquipmentTable[partyIdx][4]][accessorySecondaryValueCol]);
    return c
}
const itemList = Array(256);
itemList[0] = ["NONE", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
itemList[1] = ["NG", 0, 1, 0, 0, 8947848, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
itemList[2] = ["gold", 1, 0, 0, 0, 16777215, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
itemList[3] = ["onigiri", 2, 0, 0, 0, 16777215, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
itemList[4] = ["Glove", 3, 2, 1, 0, 6711039, 1, 1, 0, 0, 0, 2, 3, 1, 0, 15, 12, 0, 0, 4294967295, 1, 0, 0, 0, 10, 10, 0, 0, 15, 10, 0, 0, 100, 0, 0, 0, 0, 0, 1, 11, 5, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[5] = ["Power glove", 3, 2, 1, 0, 16737894, 1, 1, 0, 0, 0, 6, 8, 1, 0, 15, 12, 0, 0, 4294967295, 1, 0, 0, 0, 10, 10, 0, 0, 15, 10, 0, 0, 100, 0, 0, 0, 0, 0, 1, 5, 50, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[6] = ["Light glove", 3, 2, 1, 0, 13421772, 1, 1, 0, 0, 0, 2, 3, 1, 0, 10, 12, 0, 0, 4294967295, 1, 0, 0, 0, 10, 10, 0, 0, 15, 10, 0, 0, 100, 0, 0, 0, 0, 0, 1, 3, 500, itemAgilityCol, -10, 0, 0, 0, 0, 0, 0];
itemList[49] = ["Knuckle", 3, 3, 1, 0, 6710886, 1, 1, 0, 0, 0, 6, 8, 1, 0, 15, 12, 0, 0, 4294967295, 1, 0, 0, 0, 10, 10, 0, 0, 15, 10, 0, 0, 100, 0, 0, 0, 0, 0, 2, 7, 150, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[50] = ["Light knuckle", 3, 3, 1, 0, 15658734, 1, 1, 0, 0, 0, 2, 3, 1, 0, 10, 12, 0, 0, 4294967295, 1, 0, 0, 0, 10, 10, 0, 0, 15, 10, 0, 0, 100, 0, 0, 0, 0, 0, 2, 4, 1E3, itemAgilityCol, -10, 0, 0, 0, 0, 0, 0];
itemList[89] = ["Thunder knuckle", 3, 3, 1, 0, 15658598, 1, 1, 0, 0, 0, 1, 4, 1, 0, 10, 12, 0, 0, 4294967295, 1, 0, 0, 0, 10, 10, 0, 0, 15, 10, 0, 0, 100, 0, 0, 0, 3, 0, 2, 4, 1E3, itemAgilityCol, -10, 0, 0, 0, 0, 0, 0];
itemList[121] = ["Claw", 3, 4, 1, 0, 12298905, 1, 1, 0, 0, 0, 6, 8, 1, 0, 15, 12, 0, 0, 4294967295, 1, 0, 0, 0, 10, 10, 0, 0, 15, 10, 0, 0, 100, 0, 0, 0, 0, 0, 3, 9, 200, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[126] = ["Cat claw", 3, 4, 1, 0, 13421772, 1, 1, 0, 0, 0, 2, 3, 1, 0, 10, 12, 0, 0, 4294967295, 1, 0, 0, 0, 10, 10, 0, 0, 15, 10, 0, 0, 100, 0, 0, 0, 0, 0, 3, 4, 1500, itemAgilityCol, -10, 0, 0, 0, 0, 0, 0];
itemList[7] = ["Bash", 4, 2, 1, 0, 16737894, 1, 1, 0, 0, 0, 20, 30, 1, 0, 5, 12, 0, 0, 4294967295, 1, 32, 32, 0, 16, 16, 0, 0, 15, 20, 0, 0, 100, 0, 0, 0, 0, 0, 10, 5, 50, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[8] = ["Range attack", 4, 2, 1, 0, 13421772, 1, 1, 0, 0, 99, 10, 15, 1, 0, 5, 12, 0, 0, 4294967295, 1, 32, 32, 0, 16, 16, 0, 0, 15, 20, 0, 0, 100, 0, 0, 0, 0, 0, 10, 5, 50, projectileAccelerationCol, 100, projectileSpeedScaleCol, 50, 0, 0, 0, 0];
itemList[23] = ["Sand blaster", 4, 2, 1, 0, 13408563, 2, 1, 0, 0, 0, 8, 12, 1, 1, 5, 12, 0, 0, 4294967295, 1, 0, 0, 0, 16, 16, 0, 7, 10, 10, 0, 0, 100, 0, 0, 0, 0, 0, 20, 5, 80, itemChargeEmitValueCol, 5, itemAttackPowerCol, 50, 0, 0, 1, 4, 50, 1, 10, 10, 1, 8, 2160892211, 2, 16, 24, 0, 16, 16, 0, 30, 60, 10, 0, 0, 90, 0, 3];
itemList[34] = ["Fire cracker", 4, 2, 1, 0, 16750899, 3, 5, 8, 0, 0, 4, 8, 1, 90, 5, 12, 0, 0, 4294940979, 2, 16, 16, 0, 8, 8, 0, 0, 120, 10, -1, 90, 100, 0, 0, 0, 1, 5, 10, 5, 80, attackCooldownCol, 50, 0, 0, 0, 0, 0, 0];
itemList[47] = ["Range burst", 4, 2, 1, 0, 16764057, 1, 1, 0, 0, 99, 15, 20, 1, 0, 5, 12, 0, 0, 4294967295, 1, 32, 32, 0, 16, 16, 0, 0, 15, 20, 0, 0, 100, 0, 0, 0, 0, 0, 15, 5, 80, projectileAccelerationCol, 50, projectileSpeedScaleCol, 25, itemAttackPowerCol, 20, 0, 2, 0, 1, 5, 5, 1, 59, 3439316121, 2, 20, 20, 0, 16, 16, 0, 30, 60, 10, 0, 0, 90, 0, 1];
itemList[55] = ["Deadly blow", 4, 3, 1, 0, 6689041, 1, 1, 0, 0, 0, 30, 45, 1, 0, 5, 12, 0, 0, 4288221457, 2, 256, 8, 0, 32, 16, 0, 0, 15, 5, 0, 0, 100, 0, 0, 0, 0, 0, 15, 7, 100, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[93] = ["Flame cracker", 4, 3, 1, 0, 16750899, 3, 5, 16, 0, 0, 4, 8, 1, 90, 5, 12, 0, 0, 4294940979, 2, 16, 16, 0, 8, 8, 0, 0, 120, 10, -1, 90, 100, 0, 0, 0, 1, 5, 10, 17, 160, attackCooldownCol, 50, 0, 0, 0, 0, 0, 0];
itemList[98] = ["Spiral breaker", 4, 3, 1, 0, 8974062, 2, 1, 0, 0, 0, 8, 10, 10, 1, 5, 12, 1, 28, 4280435780, 2, 12, 12, 0, 16, 16, 180, 0, 30, 20, 0, 0, 100, 0, 0, 0, 0, 0, 15, 11, 160, itemProjectileCountCol, 10, 0, 0, 0, 0, 0, 0];
itemList[103] = ["Range gale", 4, 3, 1, 0, 10079487, 1, 1, 0, 0, 99, 20, 25, 1, 0, 5, 12, 0, 28, 4284914175, 1, 32, 32, 0, 16, 16, 0, 0, 15, 20, 0, 0, 100, 0, 0, 0, 0, 0, 10, 5, 800, itemChargeEmitValueCol, -10, 0, 0, 0, 0, 0, 0];
itemList[108] = ["Spark", 4, 3, 1, 0, 16737843, 0, 6, 0, 0, 0, 2, 3, 3, 10, 5, 12, 0, 53, 4294927923, 2, 16, 16, 0, 8, 8, 0, 0, 120, 20, 0, 0, 92, 0, 0, 0, 1, 5, 10, 17, 160, attackCooldownCol, 50, 0, 0, 0, 0, 0, 0];
itemList[131] = ["Death scratch", 4, 4, 1, 0, 10031411, 1, 5, 4, 0, 0, 20, 30, 3, 0, 5, 12, 0, 0, 4288221491, 2, 256, 4, 0, 32, 16, 0, 4, 15, 5, 0, 0, 100, 0, 0, 0, 0, 0, 18, 7, 600, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[9] = ["Sword", 3, 6, 2, 0, 8947848, 1, 1, 0, 12, 0, 3, 4, 1, 1, 20, 24, 1, 0, 872402124, 1, 0, 0, 1, 0, 24, 0, 0, 30, 0, 0, 0, 100, 0, 0, 0, 0, 0, 1, 5, 50, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[17] = ["Fire sword", 3, 6, 2, 0, 16737843, 1, 1, 0, 12, 0, 2, 3, 1, 1, 20, 24, 1, 0, 872388881, 2, 0, 0, 1, 0, 24, 0, 10, 10, 0, 0, 0, 100, 0, 0, 0, 1, 1, 1, 5, 60, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 1, 10, 0, 0, 20, 1, 1, 29, 2583664913, 2, 12, 24, 1, 0, 24, 0, 0, 60, 10, 0, 0, 99, 0, 1];
itemList[42] = ["Iron sword", 3, 6, 2, 0, 11184810, 1, 1, 0, 12, 2, 8, 9, 1, 1, 20, 24, 1, 0, 872402124, 1, 0, 0, 1, 0, 24, 0, 0, 30, 0, 0, 0, 100, 0, 0, 0, 0, 0, 2, 5, 50, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[51] = ["Ice sword", 3, 6, 2, 0, 11184895, 1, 1, 0, 12, 0, 5, 6, 1, 1, 20, 24, 1, 0, 869059839, 2, 0, 0, 1, 0, 24, 0, 0, 30, 0, 0, 0, 100, 0, 0, 0, 2, 25, 2, 5, 100, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[90] = ["Poison sword", 3, 6, 2, 0, 10079232, 1, 1, 0, 12, 99, 2, 3, 1, 1, 20, 24, 1, 0, 869072844, 1, 0, 0, 1, 0, 24, 0, 0, 30, 0, 0, 0, 100, 0, 0, 0, 4, 120, 2, 5, 600, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[122] = ["Sabel", 3, 7, 2, 0, 12303291, 1, 1, 0, 12, 3, 10, 12, 1, 1, 20, 24, 1, 0, 872402124, 1, 0, 0, 1, 0, 24, 0, 0, 30, 0, 0, 0, 100, 0, 0, 0, 0, 0, 3, 5, 200, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[127] = ["Fire sabel", 3, 7, 2, 0, 16737843, 1, 1, 0, 12, 0, 2, 3, 1, 1, 20, 24, 1, 0, 872388881, 2, 0, 0, 1, 0, 24, 0, 10, 10, 0, 0, 0, 100, 0, 0, 0, 1, 1, 3, 5, 300, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 1, 10, 0, 0, 50, 1, 1, 29, 1728026897, 2, 12, 24, 1, 0, 24, 0, 0, 60, 10, 0, 0, 99, 0, 1];
itemList[12] = ["Slash", 4, 6, 2, 0, 6710886, 1, 1, 0, 12, 2, 15, 25, 1, 1, 20, 24, 1, 0, 1721307409, 1, 0, 0, 1, 0, 24, 0, 0, 30, 0, 0, 0, 100, 0, 0, 0, 0, 0, 10, 5, 60, itemAtkMinCol, 50, itemAtkMaxCol, 50, itemHitCountStatCol, 25, 0, 0];
itemList[18] = ["Flame slayer", 4, 6, 2, 0, 16737843, 1, 1, 0, 12, 0, 3, 4, 1, 1, 20, 24, 1, 0, 1728026897, 2, 0, 0, 1, 0, 24, 0, 60, 20, 0, 0, 0, 100, 0, 0, 0, 1, 2, 15, 5, 80, itemAtkMinCol, 50, itemAtkMaxCol, 50, attackCooldownCol, 20, 1, 11, 3, 0, 60, 1, 1, 29, 2583664913, 2, 12, 24, 1, 0, 24, 0, 0, 60, 10, 0, 0, 99, 0, 1];
itemList[35] = ["Soul blade", 4, 6, 2, 0, 12303308, 0, 5, 20, 0, 0, 4, 8, 1, 10, 20, 0, 0, 0, 4290493439, 2, 24, 24, 0, 0, 0, 0, 300, 300, 60, 1, 10, 100, 0, 2, 0, 0, 0, -1, 5, 90, itemAtkMinCol, 25, itemAtkMaxCol, 25, itemAttackPowerCol, 25, 1, 13, 1, 1, 4, 20, 1, 25, 4294945297, 2, 16, 16, 0, 16, 16, 0, 10, 120, 10, 0, 0, 100, 0, 0];
itemList[44] = ["Flame saber", 4, 6, 2, 0, 16746547, 1, 1, 0, 8, 0, 3, 4, 3, 1, 20, 24, 1, 29, 1728026897, 2, 12, 32, 1, 0, 32, 0, 0, 180, 10, 0, 0, 95, 0, 0, 0, 1, 3, 15, 5, 80, itemAtkMinCol, 25, itemAtkMaxCol, 25, attackCooldownCol, 50, 0, 0];
itemList[56] = ["Power slash", 4, 8, 2, 0, 6710886, 1, 1, 0, 12, 3, 20, 30, 1, 1, 20, 24, 1, 0, 1721307409, 2, 0, 0, 1, 0, 24, 0, 0, 30, 0, 0, 0, 100, 0, 0, 0, 0, 0, 10, 5, 120, itemAtkMinCol, 50, itemAtkMaxCol, 50, itemHitCountStatCol, 25, 0, 0];
itemList[94] = ["Ice blade", 4, 8, 2, 0, 12303359, 1, 1, 0, 8, 0, 5, 5, 1, 1, 20, 24, 1, 0, 867941375, 2, 0, 0, 1, 0, 24, 0, 120, 120, 0, 0, 0, 100, 0, 0, 0, 2, 50, 15, 6, 500, itemIceBonusPercentCol, 2, 0, 0, 0, 0, 1, 10, 0, 1, 60, 1, 1, 36, 2579217407, 2, 24, 24, 1, 0, 24, 0, 30, 300, 10, 0, 0, 100, 0, 0];
itemList[99] = ["Salamander", 4, 8, 2, 0, 16724753, 0, 5, 20, 0, 0, 3, 4, 1, 10, 20, 0, 0, 0, 4294949819, 2, 24, 24, 0, 0, 0, 0, 300, 300, 60, 1, 10, 100, 0, 2, 0, 1, 1, -1, 3, 8E3, itemAttackPowerCol, 100, 0, 0, 0, 0, 1, 13, 20, 0, 1, 1, 1, 12, 4294914833, 2, 16, 16, 0, 16, 16, 0, 0, 120, 10, 0, 0, 96, 0, 0];
itemList[104] = ["Gale slash", 4, 8, 2, 0, 3381708, 0, 2, 0, 0, 0, 3, 4, 1, 10, 20, 24, 1, 59, 859019724, 2, 24, 24, 0, 0, 0, 0, 1E3, 100, 10, 0, 0, 100, 0, 0, 0, 0, 0, 15, 11, 300, attackCooldownCol, 50, 0, 0, 0, 0, 0, 10, 0, 1, 60, 1, 1, 59, 859019724, 2, 24, 24, 0, 20, 20, 0, 0, 1, 12, 0, 0, 100, 0, 0];
itemList[109] = ["Quick slash", 4, 8, 2, 0, 3394713, 1, 1, 0, 12, 3, 15, 25, 1, 1, 20, 24, 1, 0, 1714670745, 1, 0, 0, 1, 0, 24, 0, 0, 30, 0, 0, 0, 100, 0, 0, 0, 0, 0, 8, 5, 500, itemAtkMinCol, 50, itemAtkMaxCol, 50, itemHitCountStatCol, 25, 0, 0];
itemList[132] = ["Lightning saber", 4, 7, 2, 0, 16776960, 1, 1, 0, 0, 0, 1, 22, 1, 1, 20, 24, 1, 36, 872414976, 2, 0, 0, 1, 0, 24, 0, 60, 60, 0, 0, 0, 100, 0, 0, 0, 3, 0, 15, 5, 3E3, 0, 0, itemAtkMaxCol, 50, 0, 0, 0, 15, 45, 0, 60, 5, 1, 36, 4294967040, 2, 16, 24, 1, 0, 24, 0, 7, 20, 10, 0, 0, 100, 0, 0];
itemList[10] = ["Spear", 3, 10, 3, 1, 10066329, 0, 3, 0, 24, 0, 1, 9, 1, 1, 20, 48, 1, 35, 4294967295, 1, 0, 48, 1, 0, 48, 0, 0, 10, 0, 0, 0, 100, 0, 0, 0, 0, 0, 1, 5, 50, 0, 0, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[19] = ["Lightning spear", 3, 10, 3, 1, 13421568, 0, 3, 0, 24, 0, 1, 7, 1, 1, 20, 48, 1, 0, 4294967295, 1, 0, 0, 1, 0, 48, 0, 0, 10, 0, 0, 0, 100, 0, 0, 0, 3, 0, 1, 3, 50, itemProjectileCountCol, 100, 0, 0, 0, 0, 0, 20, 45, 0, 1, 5, 1, 36, 4294967091, 2, 16, 24, 1, 0, 24, 0, 7, 20, 10, 0, 0, 100, 0, 0];
itemList[43] = ["Barrage spear", 3, 10, 3, 1, 12303291, 0, 3, 0, 24, 0, 1, 7, 1, 1, 20, 48, 1, 35, 4294967295, 1, 0, 48, 1, 0, 48, 0, 0, 10, 0, 0, 0, 100, 0, 0, 0, 0, 0, 2, 5, 50, itemAttackPowerCol, 34, 0, 0, 0, 0, 1, 4, 50, 1, 3, 1, 1, 5, 2578085649, 1, 16, 24, 0, 16, 16, 20, 5, 20, 5, 0, 0, 90, 0, 0];
itemList[52] = ["Thunder halberd", 3, 11, 3, 1, 13421568, 0, 3, 0, 24, 0, 1, 7, 1, 1, 20, 48, 1, 0, 4294967295, 1, 0, 0, 1, 0, 48, 0, 0, 10, 0, 0, 0, 100, 0, 0, 0, 3, 0, 2, 3, 500, itemProjectileCountCol, 100, 0, 0, 0, 0, 0, 20, 45, 0, 2, 5, 1, 36, 4294967091, 2, 16, 24, 1, 0, 24, 0, 7, 20, 10, 0, 0, 100, 0, 0];
itemList[91] = ["Steel halberd", 3, 11, 3, 1, 13421772, 0, 3, 0, 24, 3, 1, 9, 1, 1, 20, 48, 1, 35, 4294967295, 1, 0, 48, 1, 0, 48, 0, 0, 10, 0, 0, 0, 100, 0, 0, 0, 0, 0, 2, 11, 100, 0, 0, itemAtkMaxCol, 20, 0, 0, 0, 0];
itemList[123] = ["Thunder trident", 3, 12, 3, 1, 13421568, 0, 3, 0, 24, 0, 1, 7, 1, 1, 20, 48, 1, 0, 4294967295, 1, 0, 0, 1, 0, 48, 0, 0, 10, 0, 0, 0, 100, 0, 0, 0, 3, 0, 3, 3, 1E3, itemProjectileCountCol, 100, 0, 0, 0, 0, 0, 20, 45, 0, 3, 5, 1, 36, 4294967091, 2, 16, 24, 1, 0, 24, 0, 7, 20, 10, 0, 0, 100, 0, 0];
itemList[128] = ["Silver trident", 3, 12, 3, 1, 14540253, 0, 3, 0, 24, 0, 1, 9, 3, 1, 20, 48, 1, 36, 4294967295, 1, 16, 80, 1, 0, 48, 0, 3, 10, 0, 0, 0, 100, 0, 0, 0, 0, 0, 3, 11, 300, 0, 0, itemAtkMaxCol, 20, 0, 0, 0, 0];
itemList[13] = ["Lancer", 4, 10, 3, 1, 3368550, 0, 3, 0, 24, 3, 1, 33, 1, 1, 20, 48, 1, 59, 2164260863, 1, 12, 48, 1, 0, 48, 0, 0, 10, 10, 0, 0, 100, 0, 0, 0, 0, 0, 10, 5, 60, 0, 0, itemAtkMaxCol, 50, itemHitCountStatCol, 34, 0, 0];
itemList[20] = ["Lightning lance", 4, 10, 3, 1, 11193344, 0, 3, 1, 32, 3, 1, 22, 3, 1, 20, 48, 1, 35, 4292738867, 2, 16, 64, 1, 0, 64, 20, 10, 20, 10, 0, 0, 100, 0, 0, 0, 3, 0, 15, 5, 60, 0, 0, itemAtkMaxCol, 50, itemHitCountStatCol, 34, 0, 0];
itemList[39] = ["Star lance", 4, 10, 3, 1, 16763904, 0, 3, 0, 0, 0, 1, 7, 1, 30, 20, 48, 1, 58, 4294954035, 2, 16, 16, 0, 0, 0, 0, 360, 120, 10, 0, 0, 100, 0, 3, 0, 3, 0, 10, 5, 80, attackCooldownCol, 25, 0, 0, 0, 0, 1, 12, 0, 1, 20, 1, 1, 5, 4294954035, 2, 16, 8, 0, 16, 16, 0, 10, 20, 5, 0, 0, 100, 0, 0];
itemList[57] = ["Laser lance", 4, 11, 3, 1, 16763904, 0, 2, 20, 10, 3, 1, 33, 3, 20, 20, 48, 1, 35, 4293831219, 2, 8, 64, 1, 0, 64, 20, 10, 20, 10, 0, 0, 100, 0, 2, 0, 3, 0, 20, 7, 120, itemProjectileCountCol, 34, 0, 0, projectileAuxStatCol, 25, 0, 0];
itemList[95] = ["Shock lancer", 4, 11, 3, 1, 6723993, 0, 3, 0, 24, 1, 1, 44, 1, 10, 20, 48, 1, 59, 2583691263, 1, 10, 32, 1, 0, 32, 0, 0, 20, 10, 0, 0, 100, 0, 2, 0, 0, 0, 10, 5, 900, 0, 0, itemAtkMaxCol, 50, 0, 0, 0, 20, 45, 0, 1, 5, 1, 59, 2583691263, 1, 10, 32, 1, 0, 32, 0, 2, 30, 10, 0, 0, 100, 0, 2];
itemList[100] = ["Power lancer", 4, 11, 3, 1, 8917265, 0, 3, 0, 40, 3, 1, 100, 1, 1, 20, 48, 1, 36, 4289335569, 1, 32, 80, 1, 0, 80, 0, 0, 10, 30, 0, 0, 100, 0, 0, 0, 0, 0, 10, 5, 900, 0, 0, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[105] = ["Thunder lance", 4, 11, 3, 1, 13382451, 0, 3, 0, 24, 0, 1, 33, 1, 1, 20, 48, 1, 0, 4294967295, 1, 0, 0, 1, 0, 48, 0, 0, 10, 0, 0, 0, 100, 0, 0, 0, 3, 0, 10, 3, 3E3, itemProjectileCountCol, 100, 0, 0, 0, 0, 0, 20, 45, 0, 3, 5, 1, 36, 4294914867, 2, 16, 24, 1, 0, 24, 0, 7, 20, 10, 0, 0, 100, 0, 0];
itemList[110] = ["Fan laser lance", 4, 11, 3, 1, 13434726, 0, 3, 8, 6, 3, 1, 33, 10, 20, 20, 48, 1, 36, 4291624806, 2, 16, 48, 1, 0, 48, 30, 10, 20, 10, 0, 0, 100, 0, 2, 0, 3, 0, 20, 9, 240, itemProjectileCountCol, 10, 0, 0, 0, 0, 0, 0];
itemList[133] = ["Flame laser", 4, 12, 3, 1, 16724787, 0, 3, 0, 32, 99, 3, 4, 1, 1, 20, 48, 1, 35, 4291559424, 2, 8, 64, 1, 0, 64, 0, 0, 120, 10, 0, 0, 100, 0, 2, 0, 1, 10, 20, 11, 300, itemAtkMinCol, 10, itemAtkMaxCol, 10, attackCooldownCol, 10, 0, 0];
itemList[11] = ["Bow", 3, 16, 4, 2, 16764006, 0, 4, 0, 0, 0, 3, 4, 1, 10, 30, 120, 1, 6, 4294954086, 1, 16, 16, 0, 8, 8, 0, 0, 200, 10, 0, 0, 100, 0, 0, 0, 0, 0, 1, 5, 50, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[21] = ["Fire bow", 3, 16, 4, 2, 16729105, 0, 4, 0, 0, 0, 2, 3, 1, 10, 30, 120, 1, 6, 4294954086, 1, 16, 16, 0, 8, 8, 0, 0, 200, 10, 0, 0, 100, 0, 0, 0, 1, 2, 1, 5, 60, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 1, 3, 0, 1, 1, 0, 0, 31, 4294940945, 2, 16, 24, 0, 16, 24, 0, 0, 120, 10, 0, 5, 92, 0, 1];
itemList[26] = ["Poison bow", 3, 16, 4, 2, 10079232, 0, 4, 0, 0, 0, 5, 5, 1, 10, 30, 120, 1, 6, 4284913920, 1, 16, 16, 0, 8, 8, 0, 0, 200, 10, 0, 0, 100, 0, 0, 0, 4, 120, 1, 5, 50, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 1, 3, 0, 1, 1, 0, 0, 9, 4282672640, 1, 16, 16, 0, 16, 16, 0, 20, 120, 60, 0, 0, 94, 0, 1];
itemList[38] = ["Light bow", 3, 16, 4, 2, 16768409, 0, 4, 0, 0, 0, 2, 3, 1, 10, 25, 120, 1, 6, 4294958489, 1, 16, 16, 0, 8, 8, 0, 0, 200, 10, 0, 0, 100, 0, 0, 0, 0, 0, 1, 6, 80, itemAgilityCol, -4, 0, 0, 0, 0, 0, 0];
itemList[53] = ["Flame bow", 3, 16, 4, 2, 16737809, 0, 4, 0, 0, 0, 2, 3, 1, 10, 30, 120, 1, 6, 4294954086, 1, 16, 16, 0, 8, 8, 0, 0, 200, 10, 0, 0, 100, 0, 0, 0, 1, 2, 2, 5, 60, itemAtkMinCol, 25, itemAtkMaxCol, 25, itemStatACol, 100, 1, 4, 3, 1, 1, 0, 1, 6, 4294927889, 2, 16, 16, 0, 16, 16, 0, 0, 120, 10, 0, 0, 100, 0, 3];
itemList[124] = ["High poison bow", 3, 16, 4, 2, 10040268, 0, 4, 0, 0, 0, 10, 10, 1, 10, 30, 120, 1, 6, 4288230348, 1, 16, 16, 0, 8, 8, 0, 0, 200, 10, 0, 0, 100, 0, 0, 0, 4, 120, 2, 7, 100, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 1, 3, 0, 1, 1, 0, 0, 9, 4284874905, 1, 16, 16, 0, 16, 16, 0, 20, 120, 60, 0, 0, 94, 0, 1];
itemList[129] = ["Wind bow", 3, 16, 4, 2, 10092543, 0, 4, 0, 0, 0, 2, 3, 1, 10, 25, 120, 1, 6, 4288282623, 1, 16, 16, 0, 8, 8, 0, 0, 200, 10, 0, 0, 100, 0, 0, 0, 0, 0, 3, 6, 240, itemAgilityCol, -4, 0, 0, 0, 0, 0, 0];
itemList[14] = ["Triple arrow", 4, 16, 4, 2, 13395456, 0, 4, 30, 0, 0, 8, 9, 3, 10, 30, 120, 1, 6, 4291585536, 1, 16, 16, 0, 8, 8, 0, 0, 200, 10, 0, 0, 100, 0, 0, 0, 0, 0, 10, 7, 50, itemProjectileCountCol, 34, 0, 0, 0, 0, 0, 0];
itemList[22] = ["Flame arrow", 4, 16, 4, 2, 16737809, 0, 4, 45, 0, 0, 2, 3, 4, 10, 30, 120, 1, 6, 4294923537, 1, 16, 16, 0, 8, 8, 0, 60, 200, 10, 0, 0, 100, 0, 0, 0, 1, 2, 15, 5, 60, itemProjectileCountCol, 25, 0, 0, 0, 0, 1, 3, 0, 1, 1, 0, 0, 31, 4294940945, 2, 16, 24, 0, 16, 24, 0, 0, 120, 10, 0, 5, 92, 0, 1];
itemList[25] = ["Poison arrow", 4, 16, 4, 2, 52224, 0, 4, 0, 0, 0, 10, 10, 1, 10, 30, 120, 1, 6, 4278229248, 1, 16, 16, 0, 8, 8, 0, 0, 200, 10, 0, 0, 100, 0, 0, 0, 4, 120, 10, 11, 60, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 1, 3, 0, 1, 5, 1, 0, 9, 4278216192, 1, 16, 16, 0, 16, 16, 0, 20, 120, 60, 0, 0, 94, 0, 1];
itemList[46] = ["Multiple arrow", 4, 16, 4, 2, 10053120, 0, 4, 30, 0, 0, 4, 5, 8, 10, 30, 120, 1, 6, 3432605184, 1, 16, 16, 0, 8, 8, 0, 0, 300, 10, 0, 0, 100, 0, 0, 0, 0, 0, 10, 7, 80, itemProjectileCountCol, 50, 0, 0, 0, 0, 0, 0];
itemList[58] = ["PoisonMist shot", 4, 18, 4, 2, 6736896, 0, 3, 0, 0, 0, 10, 10, 1, 20, 30, 120, 1, 6, 4284926976, 1, 16, 16, 0, 0, 0, 0, 180, 180, 10, 0, 0, 100, 0, 3, 0, 4, 120, 20, 11, 120, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 1, 12, 0, 1, 20, 2, 0, 9, 3425920512, 1, 16, 16, 0, 12, 12, 0, 10, 60, 20, 0, 0, 100, 0, 1];
itemList[96] = ["Explosive arrow", 4, 16, 4, 2, 16729105, 0, 4, 45, 0, 0, 2, 3, 1, 10, 30, 120, 1, 6, 4294923537, 1, 16, 16, 0, 8, 8, 0, 60, 200, 10, 0, 0, 100, 0, 0, 0, 1, 2, 20, 5, 800, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 1, 3, 0, 1, 30, 12, 1, 13, 3439289873, 2, 24, 24, 0, 20, 20, 0, 0, 120, 20, 0, 0, 80, 0, 3];
itemList[101] = ["Soul arrow", 4, 16, 4, 2, 12320767, 5, 5, 15, 0, 0, 5, 6, 1, 10, 0, 0, 0, 0, 4290510847, 2, 24, 24, 0, 0, 0, 0, 300, 300, 60, -1, 10, 100, 0, 2, 0, 0, 0, -1, 3, 3E3, itemAttackPowerCol, 100, 0, 0, 0, 0, 1, 14, 6, 1, 1, 20, 1, 6, 4280435780, 1, 16, 16, 0, 16, 16, 0, 0, 120, 10, 0, 0, 100, 0, 0];
itemList[106] = ["Flame shot", 4, 18, 4, 2, 16737809, 0, 3, 0, 0, 0, 2, 3, 1, 20, 30, 120, 1, 6, 4294927889, 1, 16, 16, 0, 0, 0, 0, 180, 180, 10, 0, 0, 100, 0, 3, 0, 1, 2, 20, 5, 800, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 1, 12, 0, 1, 30, 2, 1, 13, 4294927889, 2, 12, 12, 0, 16, 16, 0, 0, 120, 10, 0, 0, 97, 0, 1];
itemList[111] = ["Multiple shot", 4, 18, 4, 2, 6697728, 0, 3, 5, 0, 0, 5, 6, 8, 20, 30, 120, 1, 6, 4284887808, 1, 16, 16, 0, 8, 8, 0, 0, 300, 10, 0, 0, 100, 0, 3, 0, 0, 0, 10, 9, 240, itemProjectileCountCol, 50, 0, 0, 0, 0, 0, 0];
itemList[134] = ["Ice shot", 4, 18, 4, 2, 10066431, 0, 3, 0, 0, 0, 5, 5, 1, 20, 30, 120, 1, 6, 4287138047, 1, 16, 16, 0, 0, 0, 0, 180, 180, 10, 0, 0, 100, 0, 3, 0, 2, 30, 20, 9, 600, itemAtkMinCol, 50, itemAtkMaxCol, 50, 0, 0, 1, 12, 0, 1, 30, 15, 1, 10, 4287151103, 2, 16, 16, 0, 12, 12, 0, 10, 120, 20, 0, 0, 90, 0, 1];
itemList[15] = ["Lightning ball", 3, 30, 5, 2, 16776960, 0, 3, 0, 0, 0, 1, 9, 1, 10, 30, 90, 0, 1, 4294967091, 2, 16, 16, 0, 4, 4, 0, 0, 120, 10, 0, 0, 100, 0, 0, 50, 3, 0, 1, 5, 50, itemProjectileCountCol, 100, itemAtkMaxCol, -11, 0, 0, 0, 0];
itemList[24] = ["Ice ball", 3, 30, 5, 2, 8947967, 0, 3, 0, 0, 0, 4, 6, 1, 10, 30, 90, 0, 0, 4284901068, 2, 16, 16, 0, 4, 4, 0, 0, 120, 10, 0, 0, 100, 0, 0, 0, 2, 20, 1, 3, 100, itemIceBonusPercentCol, 25, 0, 0, 0, 0, 0, 0];
itemList[41] = ["Lightning shot", 3, 30, 5, 2, 16777062, 0, 3, 90, 0, 0, 1, 9, 2, 20, 30, 90, 1, 36, 4294967091, 2, 16, 16, 0, 4, 4, 0, 0, 120, 10, 0, 0, 100, 0, 3, 0, 3, 0, 2, 6, 50, itemAtkMaxCol, 25, itemProjectileCountCol, 10, 0, 0, 0, 0];
itemList[54] = ["Fire ball", 3, 30, 5, 2, 16733457, 0, 3, 0, 0, 0, 4, 6, 1, 8, 30, 90, 0, 3, 4294923537, 2, 16, 16, 0, 8, 8, 0, 0, 150, 10, 0, 5, 100, 0, 3, 0, 1, 3, 2, 5, 100, itemAtkMinCol, 25, itemAtkMaxCol, 25, attackCooldownCol, 30, 0, 0];
itemList[92] = ["Poison shot", 3, 30, 5, 2, 6736896, 0, 3, 0, 0, 0, 4, 6, 1, 10, 30, 90, 0, 1, 4284913920, 1, 16, 16, 0, 4, 4, 0, 0, 120, 10, 0, 0, 100, 0, 0, 0, 4, 120, 2, 13, 100, itemProjectileCountCol, 100, 0, 0, 0, 0, 0, 0];
itemList[125] = ["LightningBullet", 3, 29, 5, 2, 16776960, 0, 3, 0, 0, 0, 1, 9, 1, 10, 30, 90, 1, 15, 4294967091, 2, 16, 16, 0, 8, 8, 0, 0, 120, 10, 0, 0, 100, 0, 0, 0, 3, 0, 3, 21, 50, itemAtkMinCol, 0, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[130] = ["Ice bullet", 3, 29, 5, 2, 8947967, 0, 3, 0, 0, 0, 4, 6, 1, 10, 30, 90, 1, 15, 4284901068, 2, 16, 16, 0, 8, 8, 0, 0, 120, 10, 0, 0, 100, 0, 0, 0, 2, 25, 3, 4, 200, itemIceBonusPercentCol, 20, 0, 0, 0, 0, 0, 0];
itemList[16] = ["Fire bomb", 4, 30, 5, 2, 16737809, 0, 4, 0, 0, 0, 2, 3, 1, 10, 30, 90, 0, 3, 4294927889, 2, 16, 16, 0, 8, 8, 0, 120, 120, 10, 0, 0, 100, 0, 0, 0, 1, 2, 10, 5, 80, itemAtkMinCol, 34, itemAtkMaxCol, 34, itemAttackPowerCol, 20, 1, 2, 0, 1, 5, 2, 0, 30, 4294940945, 2, 16, 24, 0, 16, 24, 0, 0, 120, 10, 0, 5, 92, 0, 1];
itemList[27] = ["Lightning orb", 4, 30, 5, 2, 16763921, 0, 4, 0, 0, 0, 1, 9, 1, 8, 30, 90, 0, 0, 4294954001, 2, 32, 32, 0, 8, 8, 0, 180, 180, 10, 0, 0, 100, 0, 0, 0, 3, 0, 10, 5, 80, itemAttackPowerCol, 50, 0, 0, 0, 0, 1, 12, 10, 1, 10, 20, 1, 36, 4294945297, 2, 16, 24, 0, 16, 16, 0, 0, 120, 10, 0, 0, 100, 0, 0];
itemList[40] = ["Ice bomb", 4, 30, 5, 2, 10066431, 0, 4, 0, 0, 0, 4, 5, 1, 20, 30, 90, 0, 0, 4287138047, 2, 16, 16, 0, 8, 8, 0, 180, 180, 10, 0, 0, 100, 0, 0, 0, 2, 50, 20, 6, 50, itemChargeEmitValueCol, -10, 0, 0, 0, 0, 1, 2, 0, 0, 15, 5, 1, 5, 4287138047, 2, 20, 32, 1, 0, 32, 0, 20, 60, 60, 0, 0, 90, 0, 1];
itemList[48] = ["Explosion", 4, 30, 5, 2, 16729105, 0, 6, 30, 0, 0, 2, 3, 8, -5, 30, 90, 0, 3, 4294919185, 2, 16, 16, 0, 8, 8, 0, 120, 120, 10, 0, 0, 100, 0, 2, 0, 1, 3, 50, 5, 150, itemAtkMinCol, 34, itemAtkMaxCol, 34, itemAttackPowerCol, 13, 2, 3, 0, 1, 8, 1, 1, 29, 4294927889, 2, 20, 20, 0, 16, 16, 8, 0, 120, 10, 0, 0, 95, 0, 0];
itemList[59] = ["Lightning bolt", 4, 30, 5, 2, 16772625, 0, 4, 0, 0, 0, 1, 9, 1, 20, 30, 90, 0, 0, 4294945297, 2, 16, 16, 0, 8, 8, 0, 10, 120, 10, 0, 0, 100, 0, 0, 0, 3, 0, 50, 5, 150, 0, 0, itemAtkMaxCol, 40, itemAttackPowerCol, 20, 1, 4, 10, 1, 50, 1, 1, 36, 4294940945, 2, 16, 32, 1, 0, 32, 100, 30, 60, 20, 0, 0, 99, 0, 3];
itemList[97] = ["Ice trail", 4, 30, 5, 2, 6711039, 0, 3, 0, 0, 0, 5, 10, 1, 20, 30, 90, 0, 0, 4288256511, 2, 16, 16, 0, 8, 8, 0, 1800, 180, 10, 0, 0, 100, 0, 3, 0, 2, 30, 20, 5, 800, attackCooldownCol, 50, 0, 0, 0, 0, 1, 12, 0, 1, 30, 2, 0, 53, 4288256511, 2, 16, 16, 0, 8, 8, 0, 0, 120, 10, 0, 0, 99, 0, 0];
itemList[102] = ["Fire wave", 4, 31, 5, 2, 16724753, 0, 3, 4, 0, 0, 4, 5, 30, 15, 30, 90, 0, 0, 4294919185, 2, 24, 24, 0, 8, 8, 0, 0, 300, 20, 0, 0, 99, 0, 3, 0, 1, 3, 40, 12, 250, itemAtkMinCol, 25, itemAtkMaxCol, 20, 0, 0, 0, 0];
itemList[107] = ["Lightning burst", 4, 31, 5, 2, 16776977, 0, 6, 30, 0, 0, 1, 150, 8, -25, 30, 90, 1, 36, 4294967057, 2, 32, 32, 0, 16, 16, 0, 25, 26, 10, 0, 0, 100, 0, 2, 0, 3, 0, 10, 5, 800, 0, 0, itemAtkMaxCol, 50, 0, 0, 0, 0];
itemList[112] = ["Ice wide", 4, 31, 5, 2, 10066431, 0, 3, 0, 0, 0, 5, 10, 5, 20, 30, 90, 0, 0, 4287138047, 2, 16, 16, 0, 8, 8, 0, 10, 120, 10, 0, 0, 100, 0, 0, 0, 2, 30, 20, 6, 500, itemAttackPowerCol, 20, 0, 0, 0, 0, 1, 3, 0, 0, 5, 5, 1, 36, 4287138047, 2, 16, 24, 1, 0, 24, 0, 30, 60, 10, 0, 0, 99, 0, 3];
itemList[135] = ["Solar flare", 4, 29, 5, 2, 16720435, 0, 6, 60, 0, 0, 3, 5, 8, -5, 30, 90, 0, 3, 4294910515, 2, 16, 16, 0, 8, 8, 120, 120, 120, 10, 0, 0, 100, 0, 2, 0, 1, 3, 60, 3, 6E3, itemAtkMinCol, 50, itemAtkMaxCol, 50, itemAttackPowerCol, 25, 2, 3, 0, 1, 8, 1, 1, 12, 2298421811, 2, 20, 20, 0, 16, 16, 8, 0, 120, 10, 0, 0, 94, 0, 0];
itemList[28] = ["Headband", 6, 64, 10, 0, 13369344, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 10, heroHealthModifierCol, 50, 0, 0, 0, 0, 0, 0];
itemList[29] = ["Bandana", 6, 65, 10, 0, 6724044, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 100, heroDodgeModifierCol, 50, 0, 0, 0, 0, 0, 0];
itemList[30] = ["Knit", 6, 66, 10, 0, 16737792, 10040064, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 20, heroHealthModifierCol, 20, 0, 0, 0, 0, 0, 0];
itemList[31] = ["BB cap", 6, 67, 10, 0, 10079487, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
itemList[32] = ["Work cap", 6, 68, 10, 0, 3381555, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
itemList[33] = ["Beret", 6, 69, 10, 0, 10053324, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 50, heroHealthModifierCol, 50, 0, 0, 0, 0, 0, 0];
itemList[36] = ["Straw hat", 6, 70, 10, 0, 16764006, 13369344, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 10, heroHealthModifierCol, 20, 0, 0, 0, 0, 0, 0];
itemList[37] = ["Silk hat", 6, 71, 10, 0, 13421772, 6710886, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 10, heroHealthModifierCol, 10, 0, 0, 0, 0, 0, 0];
itemList[45] = ["Witch", 6, 72, 10, 0, 10027212, 6684825, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 30, heroMagicDefModifierCol, 20, 0, 0, 0, 0, 0, 0];
itemList[60] = ["Santa", 6, 73, 10, 0, 16764108, 14483456, 5, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 30, heroHealthModifierCol, 20, 0, 0, 0, 0, 0, 0];
itemList[61] = ["Headband", 6, 64, 10, 0, 39168, 0, 5, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 10, heroHealthModifierCol, 20, 0, 0, 0, 0, 0, 0];
itemList[62] = ["Bandana", 6, 65, 10, 0, 6710988, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 100, heroDodgeModifierCol, 25, 0, 0, 0, 0, 0, 0];
itemList[63] = ["Knit", 6, 66, 10, 0, 16750899, 6723840, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 20, heroHealthModifierCol, 20, 0, 0, 0, 0, 0, 0];
itemList[64] = ["BB cap", 6, 67, 10, 0, 10066329, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
itemList[65] = ["Work cap", 6, 68, 10, 0, 10053171, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
itemList[66] = ["Beret", 6, 69, 10, 0, 3368448, 0, 0, 1, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 200, heroDefenseModifierCol, 100, 0, 0, 0, 0, 0, 0];
itemList[67] = ["Straw hat", 6, 70, 10, 0, 10053171, 4465152, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 30, heroHealthModifierCol, 100, heroMagicDefModifierCol, 100, 0, 0, 0, 0];
itemList[68] = ["Silk hat", 6, 71, 10, 0, 13395456, 6697728, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 10, heroHealthModifierCol, 5, 0, 0, 0, 0, 0, 0];
itemList[69] = ["Witch", 6, 72, 10, 0, 16737996, 10027110, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 30, heroMagicDefModifierCol, 20, 0, 0, 0, 0, 0, 0];
itemList[70] = ["Santa", 6, 73, 10, 0, 13421823, 3355596, 10, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 30, heroMagicDefModifierCol, 20, 0, 0, 0, 0, 0, 0];
// accessories
itemList[71] = ["Craft Ring", 8, 128, 20, 0, 6710886, 11184810, accessoryArmsBonusCol0, "ARMS Lv +", 1, "", "", 0, ""];
itemList[73] = ["Iron Ring", 8, 128, 20, 0, 6710886, 4473924, accessoryEffectAtkBonusCol, "AT +", 20, "%", "", 0, ""];
itemList[75] = ["Wood Ring", 8, 128, 20, 0, 10053120, 6697728, accessoryEffectRangeAndCountCol, "RANGE +", 60, "", "COUNT +", 60, ""];
itemList[77] = ["Diamond Ring", 8, 128, 20, 0, 16777215, 6710886, accessoryEffectPhysicalProcChanceCol, "Physical Critical hit ", 25, "%", "Critical damage +", 100, "%"];
itemList[79] = ["Gold Ring", 8, 128, 20, 0, 16777164, 14658851, accessoryRewardValueBonusCol, "Gold +", 50, "%", "", 0, ""];
itemList[81] = ["Ruby Ring", 8, 128, 20, 0, 16724787, 5588036, accessoryEffectFireStatBonusCol, "Fire hit rate per second +", 1, "", "", 0, ""];
itemList[83] = ["Topaz Ring", 8, 128, 20, 0, 16763904, 5592388, accessoryEffectLightningMaxAtkPercentCol, "Lightning damage +", 30, "%", "", 0, ""];
itemList[85] = ["Shell Ring", 8, 128, 20, 0, 14803938, 13546410, accessoryDodgeChanceCol, "Dodge +", 10, "%", "", 0, ""];
itemList[87] = ["Emerald Ring", 8, 128, 20, 0, 65382, 4478276, accessoryEffectPoisonAtkPercentCol, "Poison damage +", 40, "%", "", 0, ""];
itemList[113] = ["Aquamarine Ring", 8, 128, 20, 0, 6711039, 4473992, accessoryIceAtkPercentCol, "Ice damage +", 40, "%", "", 0, ""];
itemList[115] = ["Stone Ring", 8, 128, 20, 0, 13421789, 11184827, accessoryMeleeDefenceCol, "DF +", 1, "", "", 0, ""];
itemList[117] = ["Pearl Ring", 8, 128, 20, 0, 13546410, 6710886, accessoryMagicDefenseCol, "MAGIC DF +", 10, "%", "", 0, ""];
itemList[119] = ["Warrior Ring", 8, 128, 20, 0, 16737792, 8930338, accessoryComboMaxIncreaseCol, "Combo duration +", 1, " sec", "", 0, ""];
itemList[136] = ["Master Ring", 8, 128, 20, 0, 16763955, 10053171, accessoryArmsBonusCol1, "ARMS Lv +", 1, "", "CHARGE Lv +", 1, ""];
itemList[137] = ["Titanium Ring", 8, 128, 20, 0, 6640976, 13421772, accessoryEffectAgiPenaltyCol, "AGI -", 2, "", "", 0, ""];
itemList[138] = ["Morion Ring", 8, 128, 20, 0, 7829367, 3355443, accessoryChargeValueBonusCol, "Charge +", 1, "", "", 0, ""];
itemList[72] = ["Craft Amulet", 8, 144, 30, 0, 6710886, 13421772, accessoryChargeBonusCol, "CHARGE Lv +", 1, "", "", 0, ""];
itemList[74] = ["Shell Amulet", 8, 144, 30, 0, 14803938, 13546410, accessoryDodgeChanceCol, "Dodge +", 10, "%", "", 0, ""];
itemList[76] = ["Elf Amulet", 8, 144, 30, 0, 65433, 3381606, accessoryEffectMultiShotIncreaseCol, "Multiple shots +", 2, "", "", 0, ""];
itemList[78] = ["Crystal Amulet", 8, 144, 30, 0, 15658734, 4473924, accessoryEffectEmitMaxReductionCol, "EMIT -", 2, "", "", 0, ""];
itemList[80] = ["Bandit Amulet", 8, 144, 30, 0, 15765064, 10102789, accessoryDropChanceBonusCol, "Drop +", 50, "%", "", 0, ""];
itemList[82] = ["Amethyst Amulet", 8, 144, 30, 0, 10027212, 8947848, accessoryEffectEmitFullChargeChance_duringChargeCol, "", 2, "% chance of full charge", "", 0, ""];
itemList[84] = ["Platinum Amulet", 8, 144, 30, 0, 16777215, 14540253, accessoryEnemyHpBonusCol, "EXP +", 50, "%", "", 0, ""];
itemList[86] = ["Citrine Amulet", 8, 144, 30, 0, 16763904, 8939076, accessoryEffectEmitFullChargeChance_onFireCol, "", 30, "% chance of recharge", "", 0, ""];
itemList[88] = ["Sapphire Amulet", 8, 144, 30, 0, 3355647, 4473992, accessoryEffectIceStatBonusCol, "Ice slow effect +", 20, "%", "", 0, ""];
itemList[114] = ["Garnet Amulet", 8, 144, 30, 0, 16724787, 5588036, accessoryFireAtkPercentCol, "Fire damage +", 30, "%", "", 0, ""];
itemList[116] = ["Peridot Amulet", 8, 144, 30, 0, 10092288, 4478276, accessoryEffectPoisonStatBonusCol, "Poison effect time +", 3, " sec", "", 0, ""];
itemList[118] = ["Ammolite Amulet", 8, 144, 30, 0, 6736896, 13382400, accessoryMultiShotSpreadDivisorCol, "Injection angle 1/", 2, "", "", 0, ""];
itemList[120] = ["Warrior Amulet", 8, 144, 30, 0, 16737792, 8930338, accessoryComboMaxIncreaseCol, "Combo duration +", 1, " sec", "", 0, ""];
itemList[139] = ["Giant Amulet", 8, 144, 30, 0, 16711782, 16764057, accessoryHealthBonusCol, "LP +", 50, "%", "", 0, ""];
let badgeCount = 128,
    badgeList = Array(badgeCount),
    badgeCounterArray = Array(badgeCount);
for (let _i = 0; _i < badgeCount; _i++) badgeCounterArray[_i] = 0;
let badgePopupTimer = 0, // bf
    lastCompletedBadgeIdx = 0, // cf
    badgeIndicesByStage = [ // df
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
    ];
badgeList[0] = ["Stage clear", "", 2, 0, 1];
badgeList[1] = ["Combo 100", "", 2, 1, 1];
badgeList[2] = ["Giant green slime hunt 10", "", 2, 2, 10];
badgeList[3] = ["Mining 20 gold ores", "", 2, 3, 20];
badgeList[4] = ["Stickman", "", 2, 4, 5];
badgeList[5] = ["Giant green worm", "hunt 30", 3, 5, 30];
badgeList[6] = ["Pass through (undamaged)", "", 3, 6, 1];
badgeList[7] = ["Two small rooms", "", 3, 7, 1];
badgeList[8] = ["Defeat Giant Yellow Slime", "within 30 sec", 3, 2, 1];
badgeList[9] = ["Defeat Giant Red Slime", "within 10 sec", 3, 8, 1];
badgeList[10] = ["Stage clear", "within 60 sec", 4, 0, 1];
badgeList[11] = ["Defeat Dark Green Slime", "with a physical attack", 4, 2, 1];
badgeList[12] = ["Defeat only", "Pink Tree Head", 4, 9, 1];
badgeList[13] = ["Defeat boss unhurt", "", 4, 10, 1];
badgeList[14] = ["Came from upper layer", "", 4, 11, 1];
badgeList[15] = ["Stage clear", "without healing", 5, 0, 1];
badgeList[16] = ["Defeat all fish", "without diving", 5, 12, 1];
badgeList[17] = ["Defeat all fish", "without landing", 5, 12, 1];
badgeList[18] = ["Defeat Giant Fish", "within 20 sec", 5, 12, 1];
badgeList[19] = ["Stickman's enter", "small room", 5, 7, 1];
badgeList[20] = ["Stage clear & Combo 87", "", 7, 0, 1];
badgeList[21] = ["Defeat boss unhurt", "", 7, 13, 1];
badgeList[22] = ["Doll hunt 50", "", 7, 14, 50];
badgeList[23] = ["Everyone freezes", "", 7, 15, 1];
badgeList[24] = ["Pick up 225G", "", 7, 3, 1];
badgeList[25] = ["Stage clear bonus 2.0", "", 8, 0, 1];
badgeList[26] = ["Combo 300", "", 8, 1, 1];
badgeList[27] = ["Defeat Tree Head", "with a sniper", 8, 9, 1];
badgeList[28] = ["Float for 5 sec", "with everyone", 8, 16, 1];
badgeList[29] = ["50 lost money", "", 8, 3, 50];
badgeList[30] = ["Stage clear & Combo 111", "", 9, 0, 1];
badgeList[31] = ["Defeat boss", "with an overkill", 9, 9, 1];
badgeList[32] = ["Over 100 enemies", "", 9, 10, 1];
badgeList[33] = ["In the ladder", "", 9, 17, 1];
badgeList[34] = ["Move from there?", "", 9, 18, 1];
badgeList[35] = ["Stage clear", "without healing", 10, 0, 1];
badgeList[36] = ["Combo 500", "", 10, 1, 1];
badgeList[37] = ["Defeat only", "Yellow Tree Head", 10, 9, 1];
badgeList[38] = ["Defeat Green Tree Head", "unhurt", 10, 9, 1];
badgeList[39] = ["Everyone poison", "", 10, 19, 1];
badgeList[40] = ["Stage clear", "within 60 sec", 11, 0, 1];
badgeList[41] = ["Defeat Giant Green Slime", "with a attribute attack", 11, 2, 1];
badgeList[42] = ["Defeat Black Tree Head", "unhurt", 11, 9, 1];
badgeList[43] = ["Fire & ice & poison status", "", 11, 20, 1];
badgeList[44] = ["Stickman", "", 11, 4, 1];
badgeList[45] = ["Stage clear", "within 120 sec", 13, 0, 1];
badgeList[46] = ["Defeat 90 Bats", "", 13, 10, 1];
badgeList[47] = ["Slime hunt 20", "", 13, 2, 20];
badgeList[48] = ["Defeat Giant Slime unhurt", "", 13, 2, 1];
badgeList[49] = ["Defeat Giant Fish", "within 25 sec", 13, 12, 1];
badgeList[50] = ["Stage clear", "without healing", 14, 0, 1];
badgeList[51] = ["Pass through (undamaged)", "", 14, 6, 1];
badgeList[52] = ["Tree Head hunt 20", "", 14, 9, 20];
badgeList[53] = ["Float for 30 sec", "with everyone", 14, 16, 1];
badgeList[54] = ["Golden Circle", "", 14, 3, 1];
badgeList[55] = ["Stage clear & Combo 227", "", 15, 0, 1];
badgeList[56] = ["Combo 600", "", 15, 1, 1];
badgeList[57] = ["Defeat Tree Head unhurt", "", 15, 13, 1];
badgeList[58] = ["Defeat Giant Black Slime", "within 60 sec", 15, 2, 1];
badgeList[59] = ["Over 198 fish", "", 15, 12, 1];
badgeList[60] = ["Stage clear", "", 16, 0, 1];
badgeList[61] = ["Defeat boss", "without healing", 16, 21, 1];
badgeList[62] = ["Defeat boss", "without touching wall", 16, 21, 1];
badgeList[63] = ["Defeat Tree Head", "with a sniper", 16, 9, 1];
badgeList[64] = ["100 Tropical Fish", "", 16, 12, 1];
badgeList[65] = ["Stage clear", "without healing", 17, 0, 1];
badgeList[66] = ["Defeat Slime avoid poison", "", 17, 2, 1];
badgeList[67] = ["99 gold ores", "", 17, 3, 1];
badgeList[68] = ["Defeat only", "Giant Red Square", 17, 22, 1];
badgeList[69] = ["Sunflower hunt 50", "", 17, 9, 50];
badgeList[70] = ["Stage clear", "within 150 sec", 18, 0, 1];
badgeList[71] = ["Defeat all fish", "without diving", 18, 12, 1];
badgeList[72] = ["Defeat all fish", "without landing", 18, 12, 1];
let stageBadgeRewardItemIdxByStage = [0, 0, 72, 74, 76, 78, 0, 80, 82, 84, 86, 88, 0, 114, 116, 118, 120, 139]; // ef, stage-indexed reward item table used when all five badges for a stage are cleared.


function isBadgeIncompleteForCurrentStage(badgeIdx) { // A
    return currentStage == badgeList[badgeIdx][2] && badgeCounterArray[badgeIdx] != badgeList[badgeIdx][4] ? true : false
}


function IncrementBadgeCount(badgeIndex) {
    badgeCounterArray[badgeIndex]++;
    if (badgeCounterArray[badgeIndex] == badgeList[badgeIndex][4]) {
        lastCompletedBadgeIdx = badgeIndex;
        badgePopupTimer = 120;
        var b = 0;
        badgeIndex = badgeList[badgeIndex][2];
        for (var c = 0; c < badgeList.length; c++) {
            if (
                badgeList[c] &&
                badgeIndex == badgeList[c][2] &&
                badgeCounterArray[c] == badgeList[c][4]
            ) {
                b++;
            }
        }
        if (5 == b) {
            itemForgeLvls[stageBadgeRewardItemIdxByStage[badgeIndex]] = 1;
            itemIsNew[stageBadgeRewardItemIdxByStage[badgeIndex]] = 1;
        }
    }
}

let shrineRewardClaimSlotCount = 10, // Ec
    shrineRewardClaimed = Array(shrineRewardClaimSlotCount);
for (let _i = 0; _i < shrineRewardClaimSlotCount; _i++) badgeCounterArray[_i] = 0;
let shrineRewardOptions = [
    ["Gold Shower", 15],
    ["Clear Status", 30],
    ["ONIGIRI", 45],
    ["Level Up", 60]
],
    gameSaveString = "",
    gameSaveStatusDuration = 0,
    gameLoadStatusCode = 0,
    statusDuration = 0,
    gameSaveBuffer = new Int32Array(5E3),
    saveLoadCodecScratchBuffer = new Int32Array(5E3); // lf, scratch buffer used while encoding and decoding save strings


function saveGame() {
    let b, c;
    let a = 0;
    gameSaveBuffer[a++] = 1;
    gameSaveBuffer[a++] = 0;
    gameSaveBuffer[a++] = 0;
    gameSaveBuffer[a++] = randInt(64);
    gameSaveBuffer[a++] = randInt(64);
    for (b = 0; 8 > b; b++) gameSaveBuffer[a++] = userSaveKey[b];
    gameSaveBuffer[a++] = 0;
    gameSaveBuffer[a++] = currentStage >> 6 & 63;
    gameSaveBuffer[a++] = currentStage >> 0 & 63;
    for (b = 0; 4 > b; b++) {
        gameSaveBuffer[a++] = 0;
        gameSaveBuffer[a++] = 0;
        gameSaveBuffer[a++] = 0;
    }
    gameSaveBuffer[a++] = partyMemberCount;
    gameSaveBuffer[a++] = partyLevel >> 6 & 63;
    gameSaveBuffer[a++] = partyLevel >> 0 & 63;
    gameSaveBuffer[a++] = partyEXPAccum >> 18 & 63;
    gameSaveBuffer[a++] = partyEXPAccum >> 12 & 63;
    gameSaveBuffer[a++] = partyEXPAccum >> 6 & 63;
    gameSaveBuffer[a++] = partyEXPAccum >> 0 & 63;
    gameSaveBuffer[a++] = partyGold >> 18 & 63;
    gameSaveBuffer[a++] = partyGold >> 12 & 63;
    gameSaveBuffer[a++] = partyGold >> 6 & 63;
    gameSaveBuffer[a++] = partyGold >> 0 & 63;
    for (b = 0; 4 > b; b++) {
        gameSaveBuffer[a++] = partySP[b] >> 6 & 63;
        gameSaveBuffer[a++] = partySP[b] >> 0 & 63;
    }
    for (b = 0; 4 > b; b++) {
        gameSaveBuffer[a++] = partyLP[b] >> 12 & 63;
        gameSaveBuffer[a++] = partyLP[b] >> 6 & 63;
        gameSaveBuffer[a++] = partyLP[b] >> 0 & 63;
    }
    for (b = 0; 4 > b; b++)
        for (c = 0; c < partyStats.length; c++) {
            gameSaveBuffer[a++] = partyStats[c][b] >> 6 & 63;
            gameSaveBuffer[a++] = partyStats[c][b] >> 0 & 63;
        }
    for (b = 0; 4 > b; b++)
        for (c = 0; 8 > c; c++) {
            gameSaveBuffer[a++] = partyEquipmentTable[b][c] >> 6 & 63;
            gameSaveBuffer[a++] = partyEquipmentTable[b][c] >> 0 & 63;
        }

    gameSaveBuffer[a++] = 4;
    for (b = gameSaveBuffer[a++] = 0; 256 > b; b++) gameSaveBuffer[a++] = itemForgeLvls[b];
    gameSaveBuffer[a++] = 0;
    gameSaveBuffer[a++] = 10;
    for (b = 0; 9 > b; b++) gameSaveBuffer[a++] = stageEventFlags[b];
    gameSaveBuffer[a++] = collectedStageFlagsCount;
    gameSaveBuffer[a++] = stageCount >> 6 & 63;
    gameSaveBuffer[a++] = stageCount >> 0 & 63;
    for (b = 0; b < stageCount; b++) gameSaveBuffer[a++] = isStageReachedArray[b];
    gameSaveBuffer[a++] = enemyTypeCount >> 6 & 63;
    gameSaveBuffer[a++] = enemyTypeCount >> 0 & 63;
    for (b = 0; b < enemyTypeCount; b++) gameSaveBuffer[a++] = bestiaryEntryState[b];

    let f = 5;
    gameSaveBuffer[a++] = f >> 6 & 63;
    gameSaveBuffer[a++] = f >> 0 & 63;
    for (b = 0; 4 > b; b++)
        gameSaveBuffer[a++] = autoMoveEnabled[b];
    gameSaveBuffer[a++] = cliffStopEnabled;
    gameSaveBuffer[a++] = badgeCount >> 6 & 63;
    gameSaveBuffer[a++] = badgeCount >> 0 & 63;
    for (b = 0; b < badgeCount; b++) gameSaveBuffer[a++] = badgeCounterArray[b];
    gameSaveBuffer[a++] = shrineRewardClaimSlotCount >> 6 & 63;
    gameSaveBuffer[a++] = shrineRewardClaimSlotCount >> 0 & 63;
    for (b = 0; b < shrineRewardClaimSlotCount; b++) gameSaveBuffer[a++] = shrineRewardClaimed[b];
    f = 4;
    gameSaveBuffer[a++] = f >> 6 & 63;
    gameSaveBuffer[a++] = f >> 0 & 63;
    for (b = 0; b < f; b++) gameSaveBuffer[a++] = stageEventFlags[b];

    let gameSaveHash = 0;
    for (b = 3; b < a; b++) gameSaveHash += gameSaveBuffer[b];

    gameSaveBuffer[1] = gameSaveHash >> 6 & 63;
    gameSaveBuffer[2] = gameSaveHash >> 0 & 63;
    for (b = gameSaveHash = 0; b < a;)
        if (c = gameSaveBuffer[b++], saveLoadCodecScratchBuffer[gameSaveHash++] = c, 1 >= c) {
            for (f = 0; b < a && 63 != f && c == gameSaveBuffer[b]; b++) f++;
            saveLoadCodecScratchBuffer[gameSaveHash++] = f
        }
    a = randInt(64);
    f = randInt(64);
    gameSaveString = "";
    c = a + gameSaveHash & 63;
    for (b = 0; b < gameSaveHash; b++) {
        gameSaveString += encodingCharTable[saveLoadCodecScratchBuffer[b] + c & 63];
        c = (c * c >> 4) + saveLoadCodecScratchBuffer[b] + b + f & 65535;
    }
    gameSaveString += encodingCharTable[a];
    gameSaveString += encodingCharTable[f];
    gameSaveString += encodingCharTable[c >> 6 & 63];
    let saveItem = gameSaveString += encodingCharTable[c >> 0 & 63];
    if (currentStorage) {
        if ("" != saveItem) {
            currentStorage.setItem("ranger2", saveItem);
        } else {
            currentStorage.removeItem("ranger2");
        }
    }
    gameSaveStatusDuration = 50
}


function loadGame(saveString) {

    let d = saveString.length - 4;
    if (0 >= d) return 1; // invalid length
    if (null == saveString.match(/^[0-9A-Za-z.*]+$/)) return 2; // str err
    if (10 > d || 5E3 < d) return 3; // len err
    let b = inverseCodingCharTable[saveString[d + 0]];
    let f = inverseCodingCharTable[saveString[d + 1]];
    let c = b + d & 63;
    for (b = 0; b < d; b++) {
        saveLoadCodecScratchBuffer[b] = inverseCodingCharTable[saveString[b]] - c & 63;
        c = (c * c >> 4) + saveLoadCodecScratchBuffer[b] + b + f & 65535;
    }
    if (inverseCodingCharTable[saveString[d + 2]] != (c >> 6 & 63) || inverseCodingCharTable[saveString[d + 3]] != (c >> 0 & 63)) return 4; // load err

    let i = 0;
    for (c = 0; i < d;)
        if (f = saveLoadCodecScratchBuffer[i++], gameSaveBuffer[c++] = f, 1 >= f)
            for (let g = saveLoadCodecScratchBuffer[i++], b = 0; b < g; b++) gameSaveBuffer[c++] = f;
    d = 0;
    for (b = 3; b < c; b++) d += gameSaveBuffer[b];
    if (gameSaveBuffer[1] != (d >> 6 & 63) || gameSaveBuffer[2] != (d >> 0 & 63)) return 4; // load err
    for (b = 0; 8 > b; b++)
        if (gameSaveBuffer[b + 5] != userSaveKey[b]) return 5; // user err
    resetGameProgress();

    let p = 16 + 3*4;
    b = 4;

    partyMemberCount = gameSaveBuffer[p++];
    partyLevel = (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    partyEXPAccum = (gameSaveBuffer[p++] << 18) + (gameSaveBuffer[p++] << 12) + (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    partyGold = (gameSaveBuffer[p++] << 18) + (gameSaveBuffer[p++] << 12) + (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    for (b = 0; 4 > b; b++) partySP[b] = (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    for (b = 0; 4 > b; b++) partyLP[b] = (gameSaveBuffer[p++] << 12) + (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    for (b = 0; 4 > b; b++)
        for (c = 0; c < partyStats.length; c++) partyStats[c][b] = (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    for (b = 0; 4 > b; b++)
        for (c = 0; 8 > c; c++) partyEquipmentTable[b][c] = (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];

    let g = (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    for (b = 0; b < g; b++) itemForgeLvls[b] = gameSaveBuffer[p++];

    g = (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    if (!g) return 0;
    for (b = 0; 9 > b; b++) stageEventFlags[b] = gameSaveBuffer[p++];
    collectedStageFlagsCount = gameSaveBuffer[p++];
    g = (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    if (!g) return 0;
    for (b = 0; b < g; b++) isStageReachedArray[b] = gameSaveBuffer[p++];
    g = (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    for (b = 0; b < g; b++) bestiaryEntryState[b] = gameSaveBuffer[p++];
    g = (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    if (!g) return 0;
    if (5 <= g) {
        for (b = 0; 4 > b; b++) autoMoveEnabled[b] = gameSaveBuffer[p++];
        cliffStopEnabled = gameSaveBuffer[p++];
    }
    g = (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    if (!g) return 0;
    for (b = 0; b < g; b++) badgeCounterArray[b] = gameSaveBuffer[p++];
    g = (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    if (!g) return 0;
    for (b = 0; b < g; b++) shrineRewardClaimed[b] = gameSaveBuffer[p++];
    g = (gameSaveBuffer[p++] << 6) + gameSaveBuffer[p++];
    if (!g) return 0;
    for (b = 0; b < g; b++) stageEventFlags[b] = gameSaveBuffer[p++];
    return 0;
}
let partyChecksum = 0,
    basePartyChecksum = 0,
    tamperCheckScanOffset = 0, // vf, rotating start offset for the chunked tamper-check hash pass
    itemHashTable = [],
    levelHashTable = [],
    itemCatalogHashTable = [],
    inventoryItemListsChecksum = 0; // zf, checksum of inventoryItemLists used by the tamper-check path


function hashAdjust(a, b) {
    a += (b | 1) * (a & 255 | 1);
    return (a >> 16) + (a & 65535)
}

function updatePartyChecksum() {
    var a, b, c;
    basePartyChecksum = c = floor(randFloat(1024));
    c = hashAdjust(c, 0);
    c = hashAdjust(c, currentStage);
    c = hashAdjust(c, partyMemberCount);
    c = hashAdjust(c, partyLevel);
    c = hashAdjust(c, partyEXPAccum);
    c = hashAdjust(c, partyGold);
    for (a = 0; 4 > a; a++)
        c = hashAdjust(c, partySP[a]),
            c = hashAdjust(c, partyLP[a]),
            c = hashAdjust(c, partyMaxLP[a]),
            c = hashAdjust(c, heroEmitCurrent[a]),
            c = hashAdjust(c, heroEmitValues[a]),
            c = hashAdjust(c, heroChargeValues[a]),
            c = hashAdjust(c, partyHealthLvls[a]),
            c = hashAdjust(c, partyShortAtkLvls[a]),
            c = hashAdjust(c, partyMidAtkLvls[a]),
            c = hashAdjust(c, partyLongAtkLvls[a]),
            c = hashAdjust(c, partyPhysLvls[a]),
            c = hashAdjust(c, partyElemLvls[a]),
            c = hashAdjust(c, partyDodgeLvls[a]);
    for (a = 0; 4 > a; a++)
        for (b = 0; 8 > b; b++)
            c = hashAdjust(c, partyEquipmentTable[a][b]);

    for (a = 0; 256 > a; a++) c = hashAdjust(c, itemForgeLvls[a]);
    for (a = 0; 9 > a; a++) c = hashAdjust(c, stageEventFlags[a]);
    c = hashAdjust(c, collectedStageFlagsCount);
    for (a = 0; a < stageCount; a++) c = hashAdjust(c, isStageReachedArray[a]);
    for (a = 0; a < enemyTypeCount; a++) c = hashAdjust(c, bestiaryEntryState[a]);
    for (a = 0; a < badgeCount; a++) c = hashAdjust(c, badgeCounterArray[a]);
    for (a = 0; a < shrineRewardClaimSlotCount; a++) c = hashAdjust(c, shrineRewardClaimed[a]);
    partyChecksum = c ^ 16777215
}

let gameInitStage = 0;

function gameInit(a, b) {
    let _t0;
    console.log(`gameInit(${a}, ${b}) ${gameInitStage}`);
    if (0 == gameInitStage) {
        if (a != null) {
            userSaveCode = a;
        } else {
            userSaveCode = "";
        }
        isMinimalTitleMode = "0" == b ? true : false;
        if (8 == userSaveCode.length)
            for (_t0 = 0; 8 > _t0; _t0++) userSaveKey[_t0] = inverseCodingCharTable[userSaveCode[_t0]];
        LogMsg(copyrightText2); // Copyright text
        canvasElement.width = 640;
        canvasElement.height = 432;
        for (_t0 = 0; 513 > _t0; _t0++) rotationLUT[_t0] = new Float32Array(2);
        for (_t0 = 0; 512 > _t0; _t0++) {
            var _t1 = TAU * _t0 / 512; // 360 * c / 512 * PI / 180;
            rotationLUT[_t0][0] = Math.cos(_t1);
            rotationLUT[_t0][1] = Math.sin(_t1);
        }
        // at c = 512
        rotationLUT[_t0][0] = rotationLUT[0][0];
        rotationLUT[_t0][1] = rotationLUT[0][1];
        for (_t0 = 0; 256 > _t0; _t0++) {
            keyJustPressed[_t0] = false;
            keyPressPending[_t0] = false;
            keyHeld[_t0] = false;
            keyMapNoShift[_t0] = 0;
            keyMapShift[_t0] = 0;
        }
        for (_t0 = 0; 10 > _t0; _t0++) keyMapNoShift[48 + _t0] = 48 + _t0;
        for (_t0 = 0; 9 > _t0; _t0++) keyMapShift[49 + _t0] = 33 + _t0;
        for (_t0 = 0; 4 > _t0; _t0++) keyMapNoShift[37 + _t0] = 37 + _t0;
        for (_t0 = 0; 4 > _t0; _t0++) keyMapShift[37 + _t0] = 37 + _t0;
        keyMapNoShift[13] = keyMapShift[13] = 13;
        keyMapNoShift[16] = keyMapShift[16] = 16;
        keyMapNoShift[17] = keyMapShift[17] = 17;
        keyMapNoShift[18] = keyMapShift[18] = 18;
        keyMapNoShift[32] = keyMapShift[32] = 32;
        keyMapNoShift[186] = 58;
        keyMapShift[186] = 42;
        keyMapNoShift[187] = 59;
        keyMapShift[187] = 43;
        keyMapNoShift[188] = 44;
        keyMapShift[188] = 60;
        keyMapNoShift[189] = 45;
        keyMapShift[189] = 61;
        keyMapNoShift[190] = 46;
        keyMapShift[190] = 62;
        keyMapNoShift[191] = 47;
        keyMapShift[191] = 63;
        keyMapNoShift[192] = 64;
        keyMapShift[192] = 96;
        keyMapNoShift[219] = 91;
        keyMapShift[219] = 123;
        keyMapNoShift[220] = 92;
        keyMapShift[220] = 124;
        keyMapNoShift[221] = 93;
        keyMapShift[221] = 125;
        keyMapNoShift[222] = 94;
        keyMapShift[222] = 126;
        keyMapNoShift[226] = 92;
        keyMapShift[226] = 95;
        keyMapNoShift[58] = 58;
        keyMapShift[58] = 42;
        keyMapNoShift[59] = 59;
        keyMapShift[59] = 43;
        keyMapNoShift[173] = 45;
        keyMapShift[173] = 61;
        keyMapNoShift[64] = 64;
        keyMapShift[64] = 96;
        keyMapNoShift[160] = 94;
        keyMapShift[160] = 126;
        let _t2;
        for (_t0 = 0; 276480 > _t0; _t0++) 
            frameBufferArray[_t0] = 0;
        
        // uncheckedSpriteCount is incremented
        for (_t0 = 0; 1024 > _t0; _t0++) randLUT[_t0] = _t0 / 1024;
        for (_t0 = 0; 1024 > _t0; _t0++) {
            _t1 = floor(1024 * rand());
            _t2 = randLUT[_t0];
            randLUT[_t0] = randLUT[_t1];
            randLUT[_t1] = _t2;
        }
        randSeed = floor(1024 * rand()) & 1023;
        randSeedStep = floor(512 * rand()) | 1;
        // clear frame buffer
        gameFont.f("font.png", 8, 12);
        gameFontSmall.f("font_s.png", 5, 7);
        gameFontMed.f("font_m.png", 6, 8);
        titleSprite.f("title.png");
        iconSpriteSheet.f("b.png");
        for (_t0 = 0; 3 > _t0; _t0++) tilesetSprites[_t0].f("g" + _t0 + ".png");
        enemySpriteSheet.f("en.png");
        droppedItemSpriteSheet.f("icon.png");
        itemsSpriteSheet.f("item.png");
        effectSpriteSheet.f("ef.png");
        medalSpriteSheet.f("medal.png");
        // hostnameCheck();
        // iterIdxTemp_3 = 0;
        // hostnameCheckIdx = hostname.length;
        // if (hostnameCheck()) {
        //     gameInitStage--;
        // } else {
        //     gameInitStage++;
        // }
        gameInitStage++;
    }
    if (1 == gameInitStage) { // uncheckedSpriteCount is decremented on each successful drawSprite call
        loadSprite(gameFont.i);
        loadSprite(gameFontSmall.i);
        loadSprite(gameFontMed.i);
        loadSprite(titleSprite);
        loadSprite(iconSpriteSheet);
        for (_t0 = 0; 3 > _t0; _t0++) loadSprite(tilesetSprites[_t0]);
        loadSprite(enemySpriteSheet);
        loadSprite(droppedItemSpriteSheet);
        loadSprite(itemsSpriteSheet);
        loadSprite(effectSpriteSheet);
        loadSprite(medalSpriteSheet);
        if (uncheckedSpriteCount > 0) { // restart
            _setTimeout(gameInit, computeFrameDelay());
        } else {
            gameInitStage++;
        }
    }
    if (2 == gameInitStage) {
        if (currentStorage) {
            _t0 = currentStorage.getItem("ranger2");
            gameSaveString = _t0 ?? "";
        } else {
            gameSaveString = "";
        }
        gameLoadStatusCode = loadGame(gameSaveString);
        statusDuration = 100;


        itemHashTable = Array(256);
        for (_t0 = 0; 256 > _t0; _t0++) {
            itemHashTable[_t0] = 0;
            if (itemList[_t0]) {
                for (_t1 = 1; _t1 < itemList[_t0].length; _t1++) {
                    itemHashTable[_t0] = hashAdjust(itemHashTable[_t0], itemList[_t0][_t1]);
                }
            }
        }

        levelHashTable = Array(stageListArray.length);
        for (_t0 = 0; _t0 < stageListArray.length; _t0++) {
            levelHashTable[_t0] = 0;
            if (stageListArray[_t0]) {
                for (_t1 = 2; _t1 < stageListArray[_t0].length; _t1++) {
                    levelHashTable[_t0] = hashAdjust(levelHashTable[_t0], stageListArray[_t0][_t1]);
                }
            }
        }

        itemCatalogHashTable = Array(enemyCatalog.length);
        for (_t0 = 0; _t0 < enemyCatalog.length; _t0++) {
            itemCatalogHashTable[_t0] = 0;
            if (enemyCatalog[_t0]) {
                for (_t1 = 0; _t1 < enemyCatalog[_t0].length; _t1++) {
                    itemCatalogHashTable[_t0] = hashAdjust(itemCatalogHashTable[_t0], enemyCatalog[_t0][_t1]);
                }
            }
        }

        for (_t0 = inventoryItemListsChecksum = 0; _t0 < inventoryItemLists.length; _t0++) {
            for (_t1 = 0; _t1 < inventoryItemLists[_t0].length; _t1++) {
                inventoryItemListsChecksum = hashAdjust(inventoryItemListsChecksum, inventoryItemLists[_t0][_t1]);
            }
        }

        // updatePartyChecksum();
        spriteCreateBuffer(canvasImageBuffer, 640, 432);
        setupAnimRequest();
    }
}


function drawCanvas() {

    var a, b, c, d;
    for (let a = CANVAS_WIDTH * CANVAS_HEIGHT - 1; 0 <= a; a--) frameBufferArray[a] = 0; // clear buffer
    var d;

    tamperCheckScanOffset = tamperCheckScanOffset + 1 & 63;
    if (!gameScreenState) {
        currentStage = 0;
        partySpawnXByHero[0] = 20;
        partySpawnXByHero[1] = 28;
        partySpawnXByHero[2] = 36;
        partySpawnXByHero[3] = 44;
        partySpawnYByHero[0] = 45;
        partySpawnYByHero[1] = 45;
        partySpawnYByHero[2] = 45;
        partySpawnYByHero[3] = 45;
        gameScreenState++;
    } else if (1 == gameScreenState) {
        if (loadLevelData(0)) {
            gameScreenState++;
        }
    } else if (2 == gameScreenState || 3 == gameScreenState) { // title menu
        clickInUI = false;
        updatePlayerParty();
        drawGameStage();
        drawPlayerParty();
        let a = 145;
        let b = 26;
        let d = 350;
        let f = 125;
        let h = (isMinimalTitleMode ? 0 : 125) << 8 + ((b < 0) ? h += ~~(p * -b) : 0);
        let k = ~~(89600 / d);
        let p = ~~(32E3 / f);
        let g = (a < 0) ? ~~(k * -a) : 0;

        d = (640 < a + d) ? 640 : ~~(a + d);
        f = (432 < b + f) ? 432 : ~~(b + f);

        a = 0 > a ? 0 : ~~a;
        b = 0 > b ? 0 : ~~b;
        let n = 640 * b + a;
        let titleSpriteData = titleSprite.g;
        for (let w = 640 - (d - a); b < f; b++, n += w, h += p) { // draw title
            let idxmask = ((h >> 8) * titleSprite.h << 8) + g; 
            let _dx = a;
            while (_dx < d) {
                let _px = titleSpriteData[idxmask >> 8];
                if (-1 != _px) {
                    frameBufferArray[n] = _px;
                }
                _dx++; 
                n++; 
                idxmask += k;
            }
        }

        if (2 == gameScreenState) {
            drawTextCentered(gameFont, 320, 220, "NEW GAME", 16777215, 10053171);
            if (buttonCheckCentered(320, 220, 128, 24)) {
                if (isMouseClicked) {
                    gameScreenState = 0 == gameLoadStatusCode ? 3 : 4;
                }
                drawLine(256, 228, 384, 228, 11141120);
            }
            if (0 == gameLoadStatusCode) {
                drawTextCentered(gameFont, 320, 260, "LOAD GAME", 16777215, 10053171);
                if (buttonCheckCentered(320, 260, 128, 24)) {
                    if (isMouseClicked) {
                        gameScreenState = 5;
                    }
                    drawLine(256, 268, 384, 268, 11141120);
                }
            }
        } else if (3 == gameScreenState) {
            drawTextCentered(gameFont, 320, 220, "DELETE SAVED AND CREATE NEW GAME", 16777215, 10053171);
            if (buttonCheckCentered(320, 220, 128, 24)) {
                if (isMouseClicked) {
                    gameScreenState = 4;
                }
                drawLine(192, 228, 448, 228, 11141120);
            }

            drawTextCentered(gameFont, 320, 260, "CANCEL", 16777215, 10053171);
            if (buttonCheckCentered(320, 260, 128, 24)) {
                if (isMouseClicked) {
                    gameScreenState = 2;
                }
                drawLine(256, 268, 384, 268, 11141120);
            }
        }
        
        if (drawIconButton(608, 312, 8, "IMPORT", 16777215)) {
            if (8 != userSaveCode.length) {
                drawText(gameFont, mouseXCurrent - 72, mouseYCurrent - 6, "User only", 16777215, 13158);
            } else if (isMouseClicked) {
                if (a = promptInput("Import Game Data", "")) {
                    gameLoadStatusCode = loadGame(a);
                    statusDuration = 100;
                }
            }
        }
        if (drawIconButton(608, 352, 9, "EXPORT", 16777215)) {
            if (8 != userSaveCode.length) {
                drawText(gameFont, mouseXCurrent - 72, mouseYCurrent - 6, "User only", 16777215, 13158);
            } else if (isMouseClicked) {
                promptInput("Export Game Data", gameSaveString);
            }
        }
        drawRect(0, 408, 640, 16, 0);
        drawTextCentered(gameFont, 320, 417, copyrightText2, -1, 6697728);

    } else if (4 == gameScreenState || 5 == gameScreenState) {
        if (4 == gameScreenState) {
            resetGameProgress();
            partyEquipmentTable[0][0] = 4;
            currentStage = itemForgeLvls[4] = 1;
            partySpawnXByHero[0] = 20;
            partySpawnXByHero[1] = 28;
            partySpawnXByHero[2] = 36;
            partySpawnXByHero[3] = 44;
            partySpawnYByHero[0] = 40;
            partySpawnYByHero[1] = 40;
            partySpawnYByHero[2] = 40;
            partySpawnYByHero[3] = 40;
            updatePartyStats();
        } else if (5 == gameScreenState) {
            resetUIStates();
            currentStage = 1;
            partySpawnXByHero[0] = 20;
            partySpawnXByHero[1] = 28;
            partySpawnXByHero[2] = 36;
            partySpawnXByHero[3] = 44;
            partySpawnYByHero[0] = 40;
            partySpawnYByHero[1] = 40;
            partySpawnYByHero[2] = 40;
            partySpawnYByHero[3] = 40;
        }
        
        screenFadeFactor = 0;
        gameScreenState = 10;
    } else if (10 == gameScreenState) {
        if (loadLevelData(currentStage)) {
            if (1 == currentStage) {
                comboMultBonus >>= 1;
            }
            screenStateTimer = 0;
            gameScreenState++;
        }
    } else if (11 == gameScreenState || 12 == gameScreenState || 13 == gameScreenState || 30 == gameScreenState) {
        if (isMouseClicked) {
            clickInUI = false;
            if (360 <= mouseYCurrent) clickInUI = true;

            if (memberUIVisible)
                if (buttonCheck(8, 8, 204, 196)) clickInUI = true;

            if (inventoryUIVisible)
                if (buttonCheck(218, 8, 204, 260)) clickInUI = true;

            if (bestiaryUIVisible)
                if (buttonCheck(428, 8, 204, 180)) clickInUI = true;

            if (badgesUIVisible)
                if (buttonCheck(428, 8, 204, 180)) clickInUI = true;

            if (optionsUIVisible)
                if (buttonCheck(428, 196, 204, 148)) clickInUI = true;

            if (shrineUIVisible)
                if (buttonCheck(218, 8, 204, 180)) clickInUI = true;
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
        isSolidRender = 1;
        drawRect(4, 4, 8 * stageListArray[currentStage][stageNameCol].length + 8, 20, 2151694400); // background
        isSolidRender = 0;
        drawText(gameFont, 8, 8, stageListArray[currentStage][stageNameCol], 16777215, 0);
        drawGameUI();
        if (11 == gameScreenState) {
            c = 255;
            if (50 < screenStateTimer) {
                c = 255 - floor(255 * (screenStateTimer - 50) / 20);
            }
            drawScaledTintedTextCentered(gameFont, 320, 180, stageListArray[currentStage][stageNameCol], 255, 255, 255, c, 64, 64, 64, c, 16, 24);
            a = -1E3 + floor(500 * screenStateTimer / 20);
            drawLine(a, 164, a + 1E3, 164, 8421504);
            a = 640 - floor(500 * screenStateTimer / 20);
            drawLine(a, 193, a + 1E3, 193, 8421504);
            screenStateTimer++;
            screenFadeFactor = clamp(screenStateTimer / 30, 0, 1);
            if (70 <= screenStateTimer) {
                screenFadeFactor = 1;
                screenStateTimer = 0;
                gameScreenState++;
            }
        } else if (12 == gameScreenState) {
            for (a = b = 0; a < partyMemberCount; a++)
                b += partyLP[a];
            if (0 == b) {
                screenStateTimer = 0;
                gameScreenState = 30;
                comboMultBonus = comboCount = comboWindowTimer = 0;
                c = floor(partyGold / 10 / partyMemberCount);
                if (0 < c) {
                    for (a = 0; a < partyMemberCount; a++)
                        spawnPopup(heroJointPositionsByHero[a][0].x, heroJointPositionsByHero[a][0].y, 0, -c, 60, 16776960);
                    partyGold = clamp(partyGold - c * partyMemberCount, 0, 9999999);
                }
                for (a = 0; a < partyMemberCount; a++) {
                    partyLP[a] = 1;
                    heroEmitCurrent[a] = 0;
                }
                saveGame();
                for (a = 0; a < partyMemberCount; a++)
                    partyLP[a] = 0;
            } else if (currentStage != lastStageIdx) {
                screenStateTimer = 0;
                gameScreenState = 13;
                if (isBadgeIncompleteForCurrentStage(6)) {
                    if ((2 == lastClearedStageIdx && 4 == lastStageIdx || 4 == lastClearedStageIdx && 2 == lastStageIdx) &&
                        0 == stage_partyDamageTaken &&
                        0 == stage_totalDamageDealt
                    ) {
                        IncrementBadgeCount(6);
                    }
                }
                if (isBadgeIncompleteForCurrentStage(51)) {
                    if ((13 == lastClearedStageIdx && 15 == lastStageIdx || 15 == lastClearedStageIdx && 13 == lastStageIdx) && 
                        0 == stage_partyDamageTaken &&
                        0 == stage_totalDamageDealt
                    ) {
                        IncrementBadgeCount(51);
                    }
                }
            }

        } else if (13 == gameScreenState) {
            screenStateTimer++;
            screenFadeFactor = clamp(1 - screenStateTimer / 20, 0, 1);
            if (20 == screenStateTimer) {
                screenFadeFactor = 0;
                gameScreenState = 10;
                lastClearedStageIdx = currentStage;
                currentStage = lastStageIdx;
                saveGame();
            }
        } else if (30 == gameScreenState) {
            100 > screenStateTimer && screenStateTimer++;
            c = floor(255 * screenStateTimer / 100);
            drawScaledTintedTextCentered(gameFont, 320, 180, "GAME OVER", 100, 20, 10, c, 200, 0, 0, c, 16, 24);
            if (100 == screenStateTimer && isMouseClicked) {
                for (a = 0; 4 > a; a++) {
                    partyLP[a] = 1;
                    heroEmitCurrent[a] = 0;
                }
                screenFadeFactor = 0;
                gameScreenState = 10;
                currentStage = 1;
                partySpawnXByHero[0] = 20;
                partySpawnXByHero[1] = 28;
                partySpawnXByHero[2] = 36;
                partySpawnXByHero[3] = 44;
                partySpawnYByHero[0] = 40;
                partySpawnYByHero[1] = 40;
                partySpawnYByHero[2] = 40;
                partySpawnYByHero[3] = 40;
                saveGame();
            }
        }
    }
    // updatePartyChecksum();
    if (0 < badgePopupTimer) {
        badgePopupTimer--;
        a = badgeList[lastCompletedBadgeIdx][3];
        drawSpriteSheetPartTintedScaled(medalSpriteSheet, 420, 341, 18, 19, a % 5 * 20 + 1, 20 * ~~(a / 5), 18, 19, 14540253, 2236962, true);
        b = 440;
        a = min(120 - badgePopupTimer - 0, 4);
        if (0 < a) {
            drawText(gameFontMed, b + 0, 342 + 2 * a, "G", 16777215, 0);
        }
        a = min(120 - badgePopupTimer - 2, 4);
        if (0 < a) {
            drawText(gameFontMed, b + 5, 342 + 2 * a, "E", 16777215, 0);
        }
        a = min(120 - badgePopupTimer - 4, 4);
        if (0 < a) {
            drawText(gameFontMed, b + 10, 342 + 2 * a, "T", 16777215, 0);
        }
        b = 438;
        a = min(120 - badgePopupTimer - 6, 4);
        if (0 < a) {
            drawText(gameFontMed, b + 20, 342 + 2 * a, "M", 16777215, 0);
        }
        a = min(120 - badgePopupTimer - 8, 4);
        if (0 < a) {
            drawText(gameFontMed, b + 25, 342 + 2 * a, "E", 16777215, 0);
        }
        a = min(120 - badgePopupTimer - 10, 4);
        if (0 < a) {
            drawText(gameFontMed, b + 30, 342 + 2 * a, "D", 16777215, 0);
        }
        a = min(120 - badgePopupTimer - 12, 4);
        if (0 < a) {
            drawText(gameFontMed, b + 35, 342 + 2 * a, "A", 16777215, 0);
        }
        a = min(120 - badgePopupTimer - 14, 4);
        if (0 < a) {
            drawText(gameFontMed, b + 40, 342 + 2 * a, "L", 16777215, 0);
        }
    }


    if (statusDuration > 0) {
        statusDuration--;
        if (10 > statusDuration)
            c = floor(255 * statusDuration / 10);
        else {
            c = 255;
            drawScaledTintedText(gameFont, 568, 398, " LOAD OK;; str err; len err;load err;user err".split(";")[gameLoadStatusCode], 0, 0, 0, 0, 140, 0, 0, c, 8, 12);
        }
    } else if (gameSaveStatusDuration > 0) {
        gameSaveStatusDuration--;
        if (10 > gameSaveStatusDuration)
            c = floor(255 * gameSaveStatusDuration / 10);
        else {
            c = 255;
            drawScaledTintedText(gameFont, 568, 398, " SAVE OK", 0, 0, 0, 0, 102, 0, 0, c, 8, 12);
        }
    }


}


function updatePartyStats() {
    for (let hidx = 0; 4 > hidx; hidx++) {
        partyMaxLPBonus_vals[hidx] = 10 * partyHealthLvls[hidx];
        partyShortAtk_vals[hidx] = 5 * partyShortAtkLvls[hidx];
        partyMidAtk_vals[hidx] = 5 * partyMidAtkLvls[hidx];
        partyLongAtk_vals[hidx] = 5 * partyLongAtkLvls[hidx];
        partyPhys_vals[hidx] = 5 * partyPhysLvls[hidx];
        partyElem_vals[hidx] = 5 * partyElemLvls[hidx];
        partyDodge_vals[hidx] = 2 * partyDodgeLvls[hidx];
        // from headwear
        let headgearHpPercent = getModifiedStatVal(hidx, partyEquipmentTable[hidx][2], heroHealthModifierCol); // armor health modifier %
        let headgearFlatDefense = getModifiedStatVal(hidx, partyEquipmentTable[hidx][2], heroDefenseModifierCol);
        let headgearMagicResistPercent = getModifiedStatVal(hidx, partyEquipmentTable[hidx][2], heroMagicDefModifierCol);
        let headgearDodgeBonus = getModifiedStatVal(hidx, partyEquipmentTable[hidx][2], heroDodgeModifierCol);

        heroMeleeDefensesFlatArray[hidx] = headgearFlatDefense;
        if (heroHasAccessoryEffect(hidx, accessoryMeleeDefenceCol))
            heroMeleeDefensesFlatArray[hidx] += countAccessoryLvlBonuses(hidx, accessoryMeleeDefenceCol);

        heroProjDefenseFlatArray[hidx] = headgearFlatDefense;
        if (heroHasAccessoryEffect(hidx, accessoryMeleeDefenceCol))
            heroProjDefenseFlatArray[hidx] += countAccessoryLvlBonuses(hidx, accessoryMeleeDefenceCol);

        heroMagicDefenseFlatArray[hidx] = headgearMagicResistPercent;
        if (heroHasAccessoryEffect(hidx, accessoryMagicDefenseCol))
            heroMagicDefenseFlatArray[hidx] += countAccessoryLvlBonuses(hidx, accessoryMagicDefenseCol);

        heroDodgeChanceArray[hidx] = partyDodge_vals[hidx] + headgearDodgeBonus;
        if (heroHasAccessoryEffect(hidx, accessoryDodgeChanceCol))
            heroDodgeChanceArray[hidx] += countAccessoryLvlBonuses(hidx, accessoryDodgeChanceCol);

        physAtkBonusPercent[hidx] = partyPhys_vals[hidx];
        fireAtkBonusPercent[hidx] = partyElem_vals[hidx];
        iceAtkBonusPercent[hidx] = partyElem_vals[hidx];
        lightningAtkBonusPercent[hidx] = partyElem_vals[hidx];
        poisonAtkBonusPercent[hidx] = partyElem_vals[hidx];
        partyMaxLP[hidx] = floor((50 + headgearHpPercent) * (100 + partyMaxLPBonus_vals[hidx]) / 100);

        if (heroHasAccessoryEffect(hidx, accessoryHealthBonusCol))
            partyMaxLP[hidx] = floor(partyMaxLP[hidx] * (100 + countAccessoryLvlBonuses(hidx, accessoryHealthBonusCol)) / 100);

        partyLP[hidx] = clamp(partyLP[hidx], 0, partyMaxLP[hidx]);

        heroChargeValues[hidx] = getModifiedStatVal(hidx, partyEquipmentTable[hidx][0], itemChargeEmitValueCol);
        if (heroHasAccessoryEffect(hidx, accessoryChargeValueBonusCol) && 0 < heroChargeValues[hidx])
            heroChargeValues[hidx] = max(heroChargeValues[hidx] + countAccessoryLvlBonuses(hidx, accessoryChargeValueBonusCol), 1);

        heroEmitValues[hidx] = getModifiedStatVal(hidx, partyEquipmentTable[hidx][1], itemChargeEmitValueCol);
        if (heroHasAccessoryEffect(hidx, accessoryEffectEmitMaxReductionCol) && 0 < heroEmitValues[hidx])
            heroEmitValues[hidx] = max(heroEmitValues[hidx] - countAccessoryLvlBonuses(hidx, accessoryEffectEmitMaxReductionCol), 1);

        heroEmitCurrent[hidx] = clamp(heroEmitCurrent[hidx], 0, heroEmitValues[hidx]);
    }

    // weapons 
    for (let heroItem = 0; 2 > heroItem; heroItem++)
        for (let hidx = 0; 4 > hidx; hidx++) {
            let itemIdx = partyEquipmentTable[hidx][heroItem];
            if (0 != itemIdx) {
                let f = getModifiedStatVal(hidx, itemIdx, itemRangeTypeCol);
                let g = getModifiedStatVal(hidx, itemIdx, itemElementTypeCol);
                let c = 4 * heroItem + hidx;
                minAtkArray[c] = getModifiedStatVal(hidx, itemIdx, itemAtkMinCol);
                maxAtkArray[c] = getModifiedStatVal(hidx, itemIdx, itemAtkMaxCol);
                minAtkArray[c] = floor(minAtkArray[c] * (100 + partyPhysAtkStats[f][hidx]) / 100);
                maxAtkArray[c] = floor(maxAtkArray[c] * (100 + partyPhysAtkStats[f][hidx]) / 100);
                minAtkArray[c] = floor(minAtkArray[c] * (100 + atkBonusPercentByElement[g][hidx]) / 100);
                maxAtkArray[c] = floor(maxAtkArray[c] * (100 + atkBonusPercentByElement[g][hidx]) / 100);

                if (heroHasAccessoryEffect(hidx, accessoryEffectAtkBonusCol)) {
                    minAtkArray[c] = floor(minAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, accessoryEffectAtkBonusCol)) / 100);
                    maxAtkArray[c] = floor(maxAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, accessoryEffectAtkBonusCol)) / 100);
                }
                if (heroHasAccessoryEffect(hidx, accessoryFireAtkPercentCol) && 1 == g) {
                    minAtkArray[c] = floor(minAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, accessoryFireAtkPercentCol)) / 100);
                    maxAtkArray[c] = floor(maxAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, accessoryFireAtkPercentCol)) / 100);
                }
                if (heroHasAccessoryEffect(hidx, accessoryIceAtkPercentCol) && 2 == g) {
                    minAtkArray[c] = floor(minAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, accessoryIceAtkPercentCol)) / 100);
                    maxAtkArray[c] = floor(maxAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, accessoryIceAtkPercentCol)) / 100);
                }

                if (heroHasAccessoryEffect(hidx, accessoryEffectLightningMaxAtkPercentCol) && 3 == g)
                    maxAtkArray[c] = floor(maxAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, accessoryEffectLightningMaxAtkPercentCol)) / 100);

                if (heroHasAccessoryEffect(hidx, accessoryEffectPoisonAtkPercentCol) && 4 == g) {
                    minAtkArray[c] = floor(minAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, accessoryEffectPoisonAtkPercentCol)) / 100);
                    maxAtkArray[c] = floor(maxAtkArray[c] * (100 + countAccessoryLvlBonuses(hidx, accessoryEffectPoisonAtkPercentCol)) / 100);
                }

                atkCountArray[c] = getModifiedStatVal(hidx, itemIdx, itemProjectileCountCol);
                if (heroHasAccessoryEffect(hidx, accessoryEffectMultiShotIncreaseCol) && 1 < atkCountArray[c])
                    atkCountArray[c] += countAccessoryLvlBonuses(hidx, accessoryEffectMultiShotIncreaseCol);

                heroItem || (
                    heroAgiValues[hidx] = getModifiedStatVal(hidx, itemIdx, itemAgilityCol),
                    heroHasAccessoryEffect(hidx, accessoryEffectAgiPenaltyCol) && (heroAgiValues[hidx] -= countAccessoryLvlBonuses(hidx, accessoryEffectAgiPenaltyCol)),
                    heroRangeValues[hidx] = getModifiedStatVal(hidx, itemIdx, itemRangeCol),
                    !heroHasAccessoryEffect(hidx, accessoryEffectRangeAndCountCol) || 4 != itemList[itemIdx][itemAppearanceCol] && 5 != itemList[itemIdx][itemAppearanceCol] || (heroRangeValues[hidx] += countAccessoryLvlBonuses(hidx, accessoryEffectRangeAndCountCol))
                )
            }
        }
    partyEnemyHpBonusPercent = partyDropChanceBonusPercent = partyRewardValueBonusPercent = 0;
    comboWindowMaxFrames = 180;
    for (let hidx = 0; 4 > hidx; hidx++)
        heroHasAccessoryEffect(hidx, accessoryRewardValueBonusCol) && (partyRewardValueBonusPercent += countAccessoryLvlBonuses(hidx, accessoryRewardValueBonusCol)),
            heroHasAccessoryEffect(hidx, accessoryDropChanceBonusCol) && (partyDropChanceBonusPercent += countAccessoryLvlBonuses(hidx, accessoryDropChanceBonusCol)),
            heroHasAccessoryEffect(hidx, accessoryEnemyHpBonusCol) && (partyEnemyHpBonusPercent += countAccessoryLvlBonuses(hidx, accessoryEnemyHpBonusCol)),
            heroHasAccessoryEffect(hidx, accessoryComboMaxIncreaseCol) && (comboWindowMaxFrames += 60 * countAccessoryLvlBonuses(hidx, accessoryComboMaxIncreaseCol));
    comboWindowTimer = clamp(comboWindowTimer, 0, comboWindowMaxFrames);
    for (let hidx = stageFlagsSetCount = 0; 9 > hidx; hidx++) 1 == stageEventFlags[hidx] && stageFlagsSetCount++
}


function handleInventoryButton(_x, _y, _width, _height, _itemId, _pageIdx) { // Wg
    var h;
    if (buttonCheck(_x, _y, _width, _height))
        if (fillEmptyPixelsRect(_x, _y, _width, _height, 6684672), isMouseClicked && 0 != _itemId) {
            if (inventoryUIVisible = inventoryUIVisible && inventoryItemLists[inventoryTabIdx][28 * inventoryPageIdx + inventorySlotIdx] == _itemId ? false : true) {
                shrineUIVisible = false;
            }
            for (_x = 0; _x < inventoryItemLists.length; _x++) {
                for (h = 0; h < inventoryItemLists[_x].length && inventoryItemLists[_x][h] != _itemId; h++);
                if (inventoryItemLists[_x][h] == _itemId) break;
            }
            if (_x != inventoryItemLists.length) {
                inventoryTabIdx = _x;
                inventoryPageIdx = floor(h / 28);
                inventorySlotIdx = h % 28;
            }
        } else if (isMouseClicked) {
        if (inventoryUIVisible = inventoryUIVisible && inventoryTabIdx == _pageIdx ? false : true) {
            shrineUIVisible = false;
        }
        inventoryTabIdx = _pageIdx;
        inventorySlotIdx = inventoryPageIdx = 0;
    }
}


function drawGameUI() {
    var hidx, b, c, d, f, g, h, k;
    if (keyJustPressed[32]) {
        if (memberUIVisible ||
            inventoryUIVisible ||
            bestiaryUIVisible ||
            badgesUIVisible ||
            optionsUIVisible ||
            shrineUIVisible
        ) {
            memberUIVisibleBackup = memberUIVisible;
            inventoryUIVisibleBackup = inventoryUIVisible;
            bestiaryUIVisibleBackup = bestiaryUIVisible;
            badgesUIVisibleBackup = badgesUIVisible;
            optionsUIVisibleBackup = optionsUIVisible;
            shrineUIVisibleBackup = shrineUIVisible;
            memberUIVisible = inventoryUIVisible = bestiaryUIVisible = badgesUIVisible = optionsUIVisible = shrineUIVisible = false;
        } else {
            memberUIVisible = memberUIVisibleBackup;
            inventoryUIVisible = inventoryUIVisibleBackup;
            bestiaryUIVisible = bestiaryUIVisibleBackup;
            badgesUIVisible = badgesUIVisibleBackup;
            optionsUIVisible = optionsUIVisibleBackup;
            shrineUIVisible = shrineUIVisibleBackup;
        }
    }


    drawRect(0, 361, 640, 70, stageListArray[currentStage][stageUIBgColorCol]);
    f = 8;
    g = 348;
    drawText(gameFont, f, g, "LV " + partyLevel, 16777215, 0);
    if (99 > partyLevel) {
        var p = LevelExpThresholds[partyLevel - 1];
        drawText(gameFont, f + 48, g, "EXP " + partyEXPAccum + "(" + floor(100 * (partyEXPAccum - p) / (LevelExpThresholds[partyLevel] - p)) + "%)", 16777215, 0);
    } else drawText(gameFont, f + 48, g, "EXP " + partyEXPAccum + "(MAX)", 16777215, 0);
    drawText(gameFont, f + 184, g, "G " + partyGold, 16777215, 0);

    drawRect(f + 264, g, 90, 11, 2236962); // combo bar bg
    drawRect(f + 264, g, floor(90 * comboWindowTimer / comboWindowMaxFrames), 11, 12281344); // combo bar fg
    p = 10 + floor(comboCount / 10);
    h = "CB " + comboCount;
    gameFontMed.a = 4;
    drawText(gameFontMed, f + 265, g + 2, h, 12281344, 0); // combo count 
    if (comboCount >= 10) {
        gameFontMed.a = 4;
        drawText(gameFontMed, f + 265 + 6 * h.length + 0, g + 2, "*" + p / 10, 12281344, 0);
    }
    // 0 < Ic && (Ic--, 0 == Ic && (4 <= Hc && (Zg = 60, $g = floor((Hc * p / 10 + partyMemberCount - 1) / partyMemberCount), partyGold = clamp(partyGold + $g * partyMemberCount, 0, 9999999), A(1) && 100 <= Hc && IncrementBadgeCount(1), A(26) && 300 <= Hc && IncrementBadgeCount(26), A(36) && 500 <= Hc && IncrementBadgeCount(36), A(56) && 600 <= Hc && IncrementBadgeCount(56)), Hc = 0));
    if (comboWindowTimer > 0) {
        comboWindowTimer--;
        if (comboWindowTimer == 0) {
            if (comboCount >= 4) {
                comboPopupTimer = 60;
                comboGoldPayoutPerHero = floor((comboCount * p / 10 + partyMemberCount - 1) / partyMemberCount);
                partyGold = clamp(partyGold + comboGoldPayoutPerHero * partyMemberCount, 0, 9999999);
                if (isBadgeIncompleteForCurrentStage(1) && 100 <= comboCount) {
                    IncrementBadgeCount(1);
                }
                if (isBadgeIncompleteForCurrentStage(26) && 300 <= comboCount) {
                    IncrementBadgeCount(26);
                }
                if (isBadgeIncompleteForCurrentStage(36) && 500 <= comboCount) {
                    IncrementBadgeCount(36);
                }
                if (isBadgeIncompleteForCurrentStage(56) && 600 <= comboCount) {
                    IncrementBadgeCount(56);
                }
            }
            comboCount = 0;
        }
    }
    p = 100 + comboMultBonus;
    gameFontMed.a = 4;
    drawText(gameFontMed, f + 356, g + 2, "CB *" + p / 100, 16777215, 0); // combo multiplier
    f = 8;
    g = 364;
    d = 80;
    var p = [12, 12, 12, 8, 16, 5, 19, 9, 14, 9, 14],
        t = [6, 10, 14, 13, 13, 13, 13, 18, 17, 21, 21],
        l = Array(11);
    for (let _i = 0; 11 > _i; _i++)
        l[_i] = new Vec2();

    for (hidx = 0; hidx < partyMemberCount; hidx++) { // draw party
        drawRect(f + hidx * d, g, 24, 24, 0); // bg behind hero
        drawLine(f + hidx * d + 7, g + 22, f + hidx * d + 16, g + 22, 15908203);
        drawLine(f + hidx * d + 6, g + 23, f + hidx * d + 17, g + 23, 15908203);

        for (b = 0; 11 > b; b++) {
            l[b].x = f + hidx * d + p[b];
            l[b].y = g + t[b];
        }

        c = 16777215;
        if (0 < heroStatusTintTimer[hidx]) {
            c = 5934817;
        } else if (0 < heroSkipTimer[hidx]) {
            c = 1989840;
        } else if (0 < heroTimedDamageTimer[hidx]) {
            c = 3407616;
        }
        drawHero(hidx, l, 0, 1, 15908203, c, 2);

        drawText(gameFontSmall, f + hidx * d + 28, g, "P" + (hidx + 1), 3355443, -1);
        drawRect(f + hidx * d + 28, g + 8, 48, 7, 1114112);
        drawRect(f + hidx * d + 28, g + 8, floor(48 * partyLP[hidx] / partyMaxLP[hidx]), 7, 10027008);
        drawText(gameFontSmall, f + hidx * d + 28, g + 8, "" + partyLP[hidx], 16764108, -1);
        drawRect(f + hidx * d + 28, g + 17, 48, 5, 17);
        drawRect(f + hidx * d + 28, g + 17, 48 * heroEmitCurrent[hidx] / max(heroEmitValues[hidx], 1), 5, 221);
        if (buttonCheck(f + hidx * d, g, 24, 24)) {
            fillEmptyPixelsRect(f + hidx * d, g, 24, 24, 8388608);

            if (isMouseClicked && selectingHero == hidx) {
                memberUIVisible = !memberUIVisible;
            }

            if (isMouseClicked) {
                selectingHero = hidx;
            }
        }
        for (b = 0; 5 > b; b++) {
            c = partyEquipmentTable[hidx][b];
            k = f + hidx * d + b % 3 * 20;
            var n = g + 28 + 20 * floor(b / 3);
            drawRect(k, n, 16, 16, 0);
            if (0 != c) {
                spriteAltRenderFlag = 2;
                h = itemList[c][itemHeadwearType];
                if (2 == b) {
                    drawSpriteSheetPartTintedScaled(itemsSpriteSheet, k, n, 16, 16, 16 * (h & 15), 16 * (h >> 4), 16, 16, itemList[c][itemSpriteSourceXCol], itemList[c][itemSpriteLocYCol], true);
                } else if (3 == b || 4 == b) {
                    drawItemSpriteTinted(k, n, 16 * (h & 15), 16 * (h >> 4), itemList[c][itemSpriteSourceXCol], itemList[c][itemSpriteLocYCol]);
                } else {
                    drawSpriteSheetPart(itemsSpriteSheet, k, n, 16, 16, 16 * (h & 15), 16 * (h >> 4), 16, 16, itemList[c][itemSpriteSourceXCol]);
                }
                spriteAltRenderFlag = 0;
            }
            handleInventoryButton(k, n, 16, 16, c, b);
            if (buttonCheck(k, n, 16, 16) && isMouseClicked && 0 != c) {
                selectingHero = hidx;
            }
        }
    }
    drawRectOutline(f + selectingHero * d - 1, g - 1, 26, 26, 16711680);
    f = 472;
    g = 379;
    d = 36;
    if (drawIconButton(f + -1 * d, g, 13, "" + collectedStageFlagsCount + "/" + stageFlagsSetCount, 16777215) && isMouseClicked) {
        for (hidx = c = 0; hidx < partyMemberCount; hidx++) c += partyMaxLP[hidx] - partyLP[hidx];
        if (0 < c && 0 < collectedStageFlagsCount) {
            for (hidx = 0; hidx < partyMemberCount; hidx++) {
                if (partyLP[hidx] != partyMaxLP[hidx]) {
                    spawnPopup(heroJointPositionsByHero[hidx][0].x, heroJointPositionsByHero[hidx][0].y, 0, partyMaxLP[hidx] - partyLP[hidx], 60, 65280);
                }
                partyLP[hidx] = partyMaxLP[hidx];
            }
            collectedStageFlagsCount--;
            stageFlagUseCount++;
        }
    }
    if (drawIconButton(f + 0 * d, g, 1, "STATUS", memberUIVisible ? 16750950 : 16777215) && isMouseClicked) {
        memberUIVisible = !memberUIVisible;
    }

    if (drawIconButton(f + 1 * d, g, 2, "ITEM", inventoryUIVisible ? 16750950 : 16777215) && isMouseClicked) {
        shrineUIVisible = false;
    }

    if (drawIconButton(f + 2 * d, g, 3, "MONSTER", bestiaryUIVisible ? 16750950 : 16777215) && isMouseClicked) {
        badgesUIVisible = false;
    }

    if (drawIconButton(f + 3 * d, g, 4, "MEDAL", badgesUIVisible ? 16750950 : 16777215) && isMouseClicked) {
        bestiaryUIVisible = false;
    }

    if (drawIconButton(f + 4 * d, g, 5, "OPTION", optionsUIVisible ? 16750950 : 16777215) && isMouseClicked) {
        optionsUIVisible = !optionsUIVisible;
    }
    c = 0;
    for (b = itemIsNew.length - 1; 0 <= b; b--) c += itemIsNew[b];
    if (0 < c) {
        drawText(gameFontSmall, f + 1 * d - 16, g - 16, "NEW", 16776960, -1);
    }
    if (1 == currentStage) {
        gameFont.a = 1;
        drawTextCentered(gameFont, 530, 168, "INN", 16777215, 8409120);
        if (buttonCheckCentered(528, 180, 48, 40)) {
            for (hidx = c = 0; hidx < partyMemberCount; hidx++)
                c += partyMaxLP[hidx] - partyLP[hidx];
            if (0 < c) {
                c = 10;
            }
            c += 10 * (stageFlagsSetCount - collectedStageFlagsCount);
            gameFont.a = 1;
            drawTextCentered(gameFont, 530, 168, "INN", 15908203, 8409120);
            drawTextCentered(gameFont, 528, 187, "G " + c, 16777215, 8409120);
            if (0 < c && c <= partyGold && isMouseClicked && !clickInUI) {
                for (hidx = 0; hidx < partyMemberCount; hidx++) {
                    if (partyLP[hidx] != partyMaxLP[hidx]) {
                        spawnPopup(heroJointPositionsByHero[hidx][0].x, heroJointPositionsByHero[hidx][0].y, 0, partyMaxLP[hidx] - partyLP[hidx], 60, 65280);
                    }
                    partyLP[hidx] = partyMaxLP[hidx];
                }
                if (collectedStageFlagsCount != stageFlagsSetCount) {
                    spawnPopup(436, 380, 0, stageFlagsSetCount - collectedStageFlagsCount, 60, 65280);
                }
                collectedStageFlagsCount = stageFlagsSetCount;
                partyGold = clamp(partyGold - c, 0, 9999999);
            }
        }
        gameFont.a = 1;
        drawTextCentered(gameFont, 54, 296, "SMITH", 16777215, 8409120);
        if (buttonCheckCentered(52, 308, 56, 40)) {
            gameFont.a = 1;
            drawTextCentered(gameFont, 54, 296, "SMITH", 15908203, 8409120);
            if (isMouseClicked && !clickInUI) {
                if (inventoryUIVisible = !inventoryUIVisible) {
                    shrineUIVisible = false;
                }
            }
        }
    } else if (12 == currentStage) {
        gameFont.a = 1;
        drawTextCentered(gameFont, 418, 104, "SHRINE", 16777215, 8409120);
        if (buttonCheckCentered(416, 108, 48, 40)) {
            gameFont.a = 1;
            drawTextCentered(gameFont, 418, 104, "SHRINE", 15908203, 8409120);
            if (isMouseClicked && !clickInUI && (shrineUIVisible = !shrineUIVisible)) {
                inventoryUIVisible = false;
            }
        }
    };

    if (memberUIVisible) {
        g = f = 14;
        drawRect(f - 6, g - 6, 204, 196, stageListArray[currentStage][stageUIBgColorCol]);
        gameFont.a = 1;
        drawText(gameFont, f, g, "LP " + partyLP[selectingHero] + "/" + partyMaxLP[selectingHero] + " SP (" + partySP[selectingHero] + ")", 16777215, 0);
        let k = "LP +10%;Short Attack +5%;Middle Attack +5%;Long Attack +5%;Physical +5%;Elemental +5%;Dodge +2%".split(";");
        gameFont.a = 1;
        drawText(gameFont, f, g + 20, k[selectedStatIndex], 16777215, 0);
        let statXs = [9, 0, 20, 21, 17, 22, 23];
        let maxStats = [999, 999, 999, 999, 999, 999, 25];

        // draw each hero stat
        for (let _statIdx = 0; 7 > _statIdx; _statIdx++) {
            let _clicked = drawMenuButton(
                f + 12 + _statIdx % 7 * 28, g + 46 + 28 * ~~(_statIdx / 7),
                statXs[_statIdx],
                "" + partyStats[_statIdx][selectingHero],
                selectedStatIndex == _statIdx ? 16737894 : 16777215
            );
            if (_clicked) {
                if (selectedStatIndex != _statIdx) {
                    // mouse button is held, but the cursor is hovering over another icon
                    if (isMouseReleased) selectedStatIndex = _statIdx;
                } else if (0 < partySP[selectingHero] && partyStats[selectedStatIndex][selectingHero] < maxStats[selectedStatIndex]) {
                    drawText(gameFontSmall, mouseXCurrent - 5, mouseYCurrent - 8, "UP", 16776960, 1118481);
                    if (isMouseReleased) {
                        partyStats[selectedStatIndex][selectingHero]++;
                        partySP[selectingHero]--;
                    }
                }
            }
        }

        if (drawCancelButton(f + 188, g + 4) && isMouseClicked) {
            memberUIVisible = false;
        }

        g += 64;
        // show stats
        for (let _slotIdx = 0; 2 > _slotIdx; _slotIdx++) { // loop over primary and secondary
            let _equipmentIdx = partyEquipmentTable[selectingHero][_slotIdx];
            if (0 != itemList[_equipmentIdx][itemAppearanceCol]) { // is it empty
                if (10 > itemList[_equipmentIdx][itemAppearanceCol]) {
                    gameFontMed.a = 4;
                    let accessoryLevel = itemForgeLvls[_equipmentIdx];
                    if (heroHasAccessoryEffect(selectingHero, accessoryArmsBonusCol0) && 3 == itemList[_equipmentIdx][itemDropIconCol]) {
                        accessoryLevel += countAccessoryLvlBonuses(selectingHero, accessoryArmsBonusCol0);
                    }
                    if (heroHasAccessoryEffect(selectingHero, accessoryChargeBonusCol) && 4 == itemList[_equipmentIdx][itemDropIconCol]) {
                        accessoryLevel += countAccessoryLvlBonuses(selectingHero, accessoryChargeBonusCol);
                    }
                    if (heroHasAccessoryEffect(selectingHero, accessoryArmsBonusCol1) && 3 == itemList[_equipmentIdx][itemDropIconCol]) {
                        accessoryLevel += countAccessoryLvlBonuses(selectingHero, accessoryArmsBonusCol1);
                    }
                    if (heroHasAccessoryEffect(selectingHero, accessoryArmsBonusCol1) && 4 == itemList[_equipmentIdx][itemDropIconCol]) {
                        accessoryLevel += sumAccessorySecondaryValues(selectingHero, accessoryArmsBonusCol1);
                    }

                    drawText(gameFontMed, f + 96 * _slotIdx, g + 0, "" + itemList[_equipmentIdx][itemNameCol] + " " + accessoryLevel, -1, 0);

                    let atkRangeTxt = "AT " + minAtkArray[4 * _slotIdx + selectingHero] + "-" + maxAtkArray[4 * _slotIdx + selectingHero];

                    if (itemList[_equipmentIdx][itemAttackModeCol] === 10 ||
                        itemList[_equipmentIdx][itemAttackModeCol] === 11) {
                        atkRangeTxt += " *" + atkCountArray[4 * _slotIdx + selectingHero] + ">" + ~~(getModifiedStatVal(selectingHero, _equipmentIdx, attackCooldownCol) * getModifiedStatVal(selectingHero, _equipmentIdx, itemAttackPowerCol) / 60);
                    } else if (0 != itemList[_equipmentIdx][itemAttackModeCol]) {
                        let b = getModifiedStatVal(selectingHero, _equipmentIdx, itemAttackPowerCol);
                        if (heroHasAccessoryEffect(selectingHero, accessoryEffectLightningElemBonusCol) && 3 == itemList[_equipmentIdx][itemElementTypeCol] && 20 == itemList[_equipmentIdx][itemAttackModeCol]) {
                            b += countAccessoryLvlBonuses(selectingHero, accessoryEffectLightningElemBonusCol);
                        }
                        atkRangeTxt += " *" + atkCountArray[4 * _slotIdx + selectingHero] + ">" + b;
                    } else {
                        if (1 < atkCountArray[4 * _slotIdx + selectingHero]) {
                            atkRangeTxt += " *" + atkCountArray[4 * _slotIdx + selectingHero];
                        }
                        if (99 == getModifiedStatVal(selectingHero, _equipmentIdx, itemHitCountStatCol)) {
                            atkRangeTxt += " all";
                        } else if (1 < getModifiedStatVal(selectingHero, _equipmentIdx, itemHitCountStatCol)) {
                            atkRangeTxt += " " + getModifiedStatVal(selectingHero, _equipmentIdx, itemHitCountStatCol) + "hit";
                        }
                        drawText(gameFontMed, f + 96 * _slotIdx, g + 12, atkRangeTxt, 16777215, 0);
                        if (!_slotIdx) {
                            drawText(gameFontMed, f + 96 * _slotIdx, g + 24, "AGI " + heroAgiValues[selectingHero], 16777215, 0);
                            drawText(gameFontMed, f + 96 * _slotIdx, g + 36, "RANGE " + heroRangeValues[selectingHero], 16777215, 0);
                        }
                        if (_slotIdx) {
                            if (-1 == heroEmitValues[selectingHero]) {
                                drawText(gameFontMed, f + 96 * _slotIdx, g + 48, "EMIT passive", 16777215, 0);
                            } else {
                                drawText(gameFontMed, f + 96 * _slotIdx, g + 48, "EMIT " + heroEmitValues[selectingHero], 16777215, 0);
                            }
                        } else {
                            drawText(gameFontMed, f + 96 * _slotIdx, g + 48, "CHARGE +" + heroChargeValues[selectingHero], 16777215, 0);
                            drawText(gameFontMed, f + 96 * _slotIdx, g + 60, "SML", 16777215, 0);
                            if (0 == itemList[_equipmentIdx][itemRangeTypeCol]) {
                                drawText(gameFontMed, f + 96 * _slotIdx, g + 60, "    short", 16764057, 0);
                            }
                            if (1 == itemList[_equipmentIdx][itemRangeTypeCol]) {
                                drawText(gameFontMed, f + 96 * _slotIdx, g + 60, "    middle", 16764057, 0);
                            }
                            if (2 == itemList[_equipmentIdx][itemRangeTypeCol]) {
                                drawText(gameFontMed, f + 96 * _slotIdx, g + 60, "    long", 16764057, 0);
                            }
                            drawText(gameFontMed, f + 96 * _slotIdx, g + 72, "ATR", 16777215, 0);
                            if (0 == itemList[_equipmentIdx][itemElementTypeCol]) {
                                drawText(gameFontMed, f + 96 * _slotIdx, g + 72, "    physical", 10066329, 0);
                            }
                            if (1 == itemList[_equipmentIdx][itemElementTypeCol]) {
                                drawText(gameFontMed, f + 96 * _slotIdx, g + 72, "    fire", 16724736, 0);
                            }
                            if (2 == itemList[_equipmentIdx][itemElementTypeCol]) {
                                let iceVal = getModifiedStatVal(selectingHero, _equipmentIdx, itemIceBonusPercentCol);
                                if (heroHasAccessoryEffect(selectingHero, accessoryEffectIceStatBonusCol)) {
                                    iceVal += countAccessoryLvlBonuses(selectingHero, accessoryEffectIceStatBonusCol);
                                }
                                drawText(gameFontMed, f + 96 * _slotIdx, g + 72, "    ice " + iceVal + "%", 10070783, 0);
                            }
                            if (3 == itemList[_equipmentIdx][itemElementTypeCol]) {
                                drawText(gameFontMed, f + 96 * _slotIdx, g + 72, "    lightning", 15658496, 0);
                            }
                            if (4 == itemList[_equipmentIdx][itemElementTypeCol]) {
                                drawText(gameFontMed, f + 96 * _slotIdx, g + 72, "    poison", 52224, 0);
                            }
                        }
                    }
                } else {
                    gameFontMed.a = 4;
                    drawText(gameFontMed, f + 96 * _slotIdx, g + 0, "" + itemList[_equipmentIdx][itemNameCol] + " Lv" + itemForgeLvls[_equipmentIdx], 16777215, 0);
                }
            };
        }
        g += 96;
        k = ["ARMS", "CHARGE"];
        for (hidx = 0; 2 > hidx; hidx++) {
            c = partyEquipmentTable[selectingHero][hidx];
            b = f + 28 * hidx;
            d = g;
            drawRect(b, d, 24, 24, 0);
            spriteAltRenderFlag = 2;
            h = itemList[c][itemHeadwearType];
            drawSpriteSheetPart(itemsSpriteSheet, b + 4, d + 4, 16, 16, 16 * (h & 15), 16 * (h >> 4), 16, 16, itemList[c][itemSpriteSourceXCol]);
            spriteAltRenderFlag = 0;
            
            drawTextCentered(gameFontSmall, b + 12, d + 0, k[hidx], 16777215, 0);
            handleInventoryButton(b, d, 24, 24, c, hidx);
            
        }
    }

    if (inventoryUIVisible) {
        let _ox = 224;
        let _oy = 14;
        drawRect(_ox - 6, _oy - 6, 204, 260, stageListArray[currentStage][stageUIBgColorCol]);
        let c = inventoryItemLists[inventoryTabIdx][28 * inventoryPageIdx + inventorySlotIdx];

        if (0 != itemForgeLvls[c] && 1 == currentStage && 2 >= inventoryTabIdx) { // item upgrade panel
            drawTextCentered(gameFontMed, _ox + 138, _oy + 28, "Lv UP", 16777215, 0);
            hidx = getItemStatWithForge(c, itemForgeMaxLevelCol);
            if (0 == hidx)
                drawButtonBoldedText(_ox + 138, _oy + 48 - 2, 80, 24, "---");
            else if (itemForgeLvls[c] < hidx) {
                forgePreviewItemIdx = -1;
                h = getItemStatWithForge(c, itemForgeCostPerLevelCol) * itemForgeLvls[c];
                if (drawButtonBoldedText(_ox + 138, _oy + 48 - 2, 80, 24, "G " + h) && h <= partyGold) {
                    forgePreviewItemIdx = c;
                    if (isMouseClicked) {
                        forgePreviewItemIdx = -1;
                        partyGold = clamp(partyGold - h, 0, 9999999);
                        itemForgeLvls[c]++;
                    }
                }
            } else {
                drawButtonBoldedText(_ox + 138, _oy + 48 - 2, 80, 24, "MAX");
            }
        }

        if (0 != itemForgeLvls[c]) {
            if (10 > itemList[c][itemAppearanceCol]) {
                gameFontMed.a = 4;
                drawText(gameFontMed, _ox, _oy + 0, "" + itemList[c][itemNameCol] + " Lv" + itemForgeLvls[c], -1, 0);
                h = "AT " + getItemStatWithForge(c, itemAtkMinCol) + "-" + getItemStatWithForge(c, itemAtkMaxCol);
                if (10 <= getItemStatWithForge(c, itemAttackModeCol) && 11 >= getItemStatWithForge(c, itemAttackModeCol)) {
                    h += " *" + getItemStatWithForge(c, itemProjectileCountCol) + ">" + ~~(getItemStatWithForge(c, attackCooldownCol) * getItemStatWithForge(c, itemAttackPowerCol) / 60);
                } else if (0 != getItemStatWithForge(c, itemAttackModeCol)) {
                    h += " *" + getItemStatWithForge(c, itemProjectileCountCol) + ">" + getItemStatWithForge(c, itemAttackPowerCol);
                } else {
                    if (1 < getItemStatWithForge(c, itemProjectileCountCol)) {
                        h += " *" + getItemStatWithForge(c, itemProjectileCountCol);
                    }
                    if (99 == getItemStatWithForge(c, itemHitCountStatCol)) {
                        h += " all";
                    } else {
                        if (1 < getItemStatWithForge(c, itemHitCountStatCol)) {
                            h += " " + getItemStatWithForge(c, itemHitCountStatCol) + "hit";
                        }
                        drawText(gameFontMed, _ox, _oy + 12, h, 16777215, 0);
                        if (                    0 == inventoryTabIdx) {
                            drawText(gameFontMed, _ox, _oy + 24, "AGI " + getItemStatWithForge(c, itemAgilityCol), 16777215, 0);
                        }
                        if (0 == inventoryTabIdx) {
                            drawText(gameFontMed, _ox, _oy + 36, "RANGE " + getItemStatWithForge(c, itemRangeCol), 16777215, 0);
                        }
                        if (0 == inventoryTabIdx) {
                            drawText(gameFontMed, _ox, _oy + 48, "CHARGE +" + getItemStatWithForge(c, itemChargeEmitValueCol), 16777215, 0);
                        } else {
                            if (-1 == getItemStatWithForge(c, itemChargeEmitValueCol)) {
                                drawText(gameFontMed, _ox, _oy + 48, "EMIT passive", 16777215, 0);
                            } else {
                                drawText(gameFontMed, _ox, _oy + 48, "EMIT " + getItemStatWithForge(c, itemChargeEmitValueCol), 16777215, 0);
                                drawText(gameFontMed, _ox, _oy + 60, "SML", 16777215, 0);
                                if (0 == itemList[c][itemRangeTypeCol]) {
                                    drawText(gameFontMed, _ox, _oy + 60, "    short", 16764057, 0);
                                }
                                if (1 == itemList[c][itemRangeTypeCol]) {
                                    drawText(gameFontMed, _ox, _oy + 60, "    middle", 16764057, 0);
                                }
                                if (2 == itemList[c][itemRangeTypeCol]) {
                                    drawText(gameFontMed, _ox, _oy + 60, "    long", 16764057, 0);
                                }
                                drawText(gameFontMed, _ox, _oy + 72, "ATR", 16777215, 0);
                                if (0 == itemList[c][itemElementTypeCol]) {
                                    drawText(gameFontMed, _ox, _oy + 72, "    physical", 10066329, 0);
                                }
                                if (1 == itemList[c][itemElementTypeCol]) {
                                    drawText(gameFontMed, _ox, _oy + 72, "    fire", 16724736, 0);
                                }
                                if (2 == itemList[c][itemElementTypeCol]) {
                                    drawText(gameFontMed, _ox, _oy + 72, "    ice " + getItemStatWithForge(c, itemIceBonusPercentCol) + "%", 10070783, 0);
                                }
                                if (3 == itemList[c][itemElementTypeCol]) {
                                    drawText(gameFontMed, _ox, _oy + 72, "    lightning", 15658496, 0);
                                }
                                if (4 == itemList[c][itemElementTypeCol]) {
                                    drawText(gameFontMed, _ox, _oy + 72, "    poison", 52224, 0);
                                }
                                hidx = getItemForgeMultiplier(c, projectileAccelerationCol);
                                if (-1 != hidx) {
                                    drawText(gameFontMed, _ox + 84, _oy + 72, "RANGE +" + hidx + "%", 16777215, 0);
                                }
                                hidx = getItemForgeMultiplier(c, attackCooldownCol);
                                if (-1 != hidx) {
                                    drawText(gameFontMed, _ox + 84, _oy + 72, "COUNT +" + hidx + "%", 16777215, 0);
                                }
                                hidx = getItemForgeMultiplier(c, itemStatACol);
                                if (-1 != hidx) {
                                    drawText(gameFontMed, _ox + 84, _oy + 72, "COUNT +" + hidx + "%", 16777215, 0);
                                }
                            }
                        }
                    }
                }

            } else if (20 > itemList[c][itemAppearanceCol]) {
                if (gameFontMed.a = 4, 0 == itemList[c][itemForgeMaxLevelCol]) {
                    drawText(gameFontMed, _ox, _oy + 0, "" + itemList[c][itemNameCol], -1, 0);
                } else {
                    drawText(gameFontMed, _ox, _oy + 0, "" + itemList[c][itemNameCol] + " Lv" + itemForgeLvls[c], -1, 0);
                    d = 1;
                    {
                        hidx = getItemStatWithForge(c, heroHealthModifierCol);
                        if (0 < hidx) {
                            drawText(gameFontMed, _ox, _oy + 12 * d, "LP +" + hidx, 16777215, 0);
                            d++;
                        }
                    }
                    hidx = getItemStatWithForge(c, heroDefenseModifierCol);
                    if (0 < hidx) {
                        drawText(gameFontMed, _ox, _oy + 12 * d, "DF +" + hidx, 16777215, 0);
                        d++;
                    }
                    hidx = getItemStatWithForge(c, heroMagicDefModifierCol);
                    if (0 < hidx) {
                        drawText(gameFontMed, _ox, _oy + 12 * d, "MAGIC DF " + hidx + "%", 16777215, 0);
                        d++;
                    }
                    hidx = getItemStatWithForge(c, heroDodgeModifierCol);
                    if (0 < hidx) {
                        drawText(gameFontMed, _ox, _oy + 12 * d, "DODGE +" + hidx, 16777215, 0);
                    }
                }
            
            } else {
                gameFontMed.a = 4;
                drawText(gameFontMed, _ox, _oy + 0, "" + itemList[c][itemNameCol], -1, 0);
                if (0 != itemList[c][accessoryPrimaryValueCol]) {
                    drawText(gameFontMed, _ox, _oy + 12, itemList[c][accessoryPrimaryPrefixCol] + itemList[c][accessoryPrimaryValueCol] + itemList[c][accessoryPrimarySuffixCol], 16777215, 0);
                }
                if (0 != itemList[c][accessorySecondaryValueCol]) {
                    drawText(gameFontMed, _ox, _oy + 24, itemList[c][accessorySecondaryLabelPrefixCol] + itemList[c][accessorySecondaryValueCol] + itemList[c][accessorySecondaryLabelSuffixCol], 16777215, 0);
                }
            }
            
        }

        forgePreviewItemIdx = -1;
        k = inventoryTabIdx;
        if (drawCancelButton(_ox + 188, _oy + 4) && isMouseClicked) {
            inventoryUIVisible = false;
        }
        for (hidx = 0; 28 > hidx; hidx++) {
            c = inventoryItemLists[inventoryTabIdx][28 * inventoryPageIdx + hidx];
            b = _ox + hidx % 7 * 28;
            d = _oy + 84 + 28 * ~~(hidx / 7);
            drawRect(b, d, 24, 24, 0);
            if (0 < itemForgeLvls[c]) {
                spriteAltRenderFlag = 2;
                h = itemList[c][itemHeadwearType];
                if (2 == inventoryTabIdx) {
                    drawSpriteSheetPartTintedScaled(itemsSpriteSheet, b + 4, d + 4, 16, 16, 16 * (h & 15), 16 * (h >> 4), 16, 16, itemList[c][itemSpriteSourceXCol], itemList[c][itemSpriteLocYCol], true);
                } else if (3 == inventoryTabIdx || 4 == inventoryTabIdx) {
                    drawItemSpriteTinted(b + 4, d + 4, 16 * (h & 15), 16 * (h >> 4), itemList[c][itemSpriteSourceXCol], itemList[c][itemSpriteLocYCol]);
                } else {
                    drawSpriteSheetPart(itemsSpriteSheet, b + 4, d + 4, 16, 16, 16 * (h & 15), 16 * (h >> 4), 16, 16, itemList[c][itemSpriteSourceXCol]);
                }
                
                spriteAltRenderFlag = 0;
            }
            if (hidx == inventorySlotIdx) {
                drawRectOutline(b, d, 24, 24, 16711680);
            }
            if (buttonCheck(b, d, 24, 24)) {
                fillEmptyPixelsRect(b, d, 24, 24, 6684672);
                if (inventorySlotIdx != hidx) {
                    if (isMouseReleased) {
                        inventorySlotIdx = hidx;
                    }
                } else {
                    h = -1;
                    if (partyEquipmentTable[0][k] == c) {
                        h = 0;
                    } else if (partyEquipmentTable[1][k] == c) {
                        h = 1;
                    } else if (partyEquipmentTable[2][k] == c) {
                        h = 2;
                    } else if (partyEquipmentTable[3][k] == c) {
                        h = 3;
                    }

                    if (0 != itemForgeLvls[c]) {
                        if (-1 == h) {
                            drawText(gameFontSmall, mouseXCurrent - 20, mouseYCurrent - 8, "EQUIP", 16777215, 1118481);
                            if (isMouseReleased) {
                                partyEquipmentTable[selectingHero][k] = c;
                            }
                        } else if (h == selectingHero) {
                            drawText(gameFontSmall, mouseXCurrent - 25, mouseYCurrent - 8, "REMOVE", 16777215,
                                0);
                            if (isMouseReleased) {
                                partyEquipmentTable[selectingHero][k] = 0;
                            }
                        } else {
                            drawText(gameFontSmall, mouseXCurrent - 25, mouseYCurrent - 16, "REMOVE", 16777215, 0);
                            drawText(gameFontSmall, mouseXCurrent - 20, mouseYCurrent - 8, "EQUIP", 16777215, 1118481);
                            if (isMouseReleased) {
                                partyEquipmentTable[h][k] = 0;
                                partyEquipmentTable[selectingHero][k] = c;
                            }
                        }
                        
                    }
                }
                if (isMouseReleased) {
                    itemIsNew[c] = 0;
                }
            }
            if (0 < itemIsNew[c]) {
                drawText(gameFontSmall, b, d, "NEW", 16776960, -1);
            }
            if (0 != c) {
                if (partyEquipmentTable[0][k] == c) {
                    drawText(gameFontSmall, b + 14, d + 17, "E1", 16777215, -1);
                } else if (partyEquipmentTable[1][k] == c) {
                    drawText(gameFontSmall, b + 14, d + 17, "E2", 16777215, -1);
                } else if (partyEquipmentTable[2][k] == c) {
                    drawText(gameFontSmall, b + 14, d + 17, "E3", 16777215, -1);
                } else if (partyEquipmentTable[3][k] == c) {
                    drawText(gameFontSmall, b + 14, d + 17, "E4", 16777215, -1);
                }
            }
        }
        k = ["ARMS", "CHARGE", "HEAD", "RING", "AMULET"];
        for (hidx = 0; 5 > hidx; hidx++) {
            if (drawMenuButton(_ox + 12 + 28 * hidx, _oy + 238, hidx, k[hidx], inventoryTabIdx == hidx ? 16737894 : 16777215)) {
                if (isMouseClicked) {
                    inventoryTabIdx = hidx;
                }
            }
            c = 0;
            for (b = inventoryItemLists[hidx].length - 1; 0 <= b; b--) c += itemIsNew[inventoryItemLists[hidx][b]];
            if (0 < c) {
                drawText(gameFontSmall, _ox + 12 + 28 * hidx - 12, _oy + 238 - 12, "NEW", 16776960, -1);
            }
        }
        if (drawMenuButton(_ox + 96 - 42, _oy + 209, 7, "PREV", 16777215) && isMouseClicked) {
            inventoryPageIdx--;
        }
        if (drawMenuButton(_ox + 138, _oy + 209, 8, "NEXT", 16777215) && isMouseClicked) {
            inventoryPageIdx++;
        }
        h = ~~(inventoryItemLists[inventoryTabIdx].length / 28);
        inventoryPageIdx = clamp(inventoryPageIdx, 0, h - 1);
        drawTextCentered(gameFontSmall, _ox + 96, _oy + 209, "" + (inventoryPageIdx + 1) + "/" + h, 3355443, -1);
    }

    if (bestiaryUIVisible) {
        let f = 434;
        let g = 14;
        drawRect(f - 6, g - 6, 204, 180, stageListArray[currentStage][stageUIBgColorCol]);
        if (drawCancelButton(f + 188, g + 4) && isMouseClicked) {
            bestiaryUIVisible = false;
        }
        bestiaryEnemySelection = clamp(bestiaryEnemySelection, 0, bestiaryPageItems[currentBestiaryPage].length - 1);
        let c = bestiaryPageItems[currentBestiaryPage][bestiaryEnemySelection];

        if (0 == isStageReachedArray[stageIndexOrder[currentBestiaryPage]]) {
            drawTextCentered(gameFont, f + 96, g + 48, "Not reached", -1, 0);
        } else {
            if (0 == bestiaryEntryState[c]) {
                h = enemyCatalog[c][enemyBestiaryUnlockCostCol];
                if (drawButtonBoldedText(f + 96, g + 48, 96, 24, "G " + h) && h <= partyGold && isMouseClicked) {
                    partyGold = clamp(partyGold - h, 0, 9999999);
                    bestiaryEntryState[c] = 1;
                }
            } else {
                drawText(gameFontMed, f, g + 0, "LV " + enemyCatalog[c][enemyLevelCol], 16777215, 0);
                drawText(gameFontMed, f, g + 12, "LP " + enemyCatalog[c][enemyHealthCol], 16777215, 0);
                drawText(gameFontMed, f, g + 24, "GOLD " + enemyCatalog[c][enemyGoldRewardCol], 16777215, 0);
                drawText(gameFontMed, f, g + 36, "EXP " + enemyCatalog[c][enemyExpRewardCol], 16777215, 0);
                b = 0;
                if (0 != enemyCatalog[c][enemyPhysResistPctCol]) {
                    drawMedTextNoOutline(f + 22 + b, g + 48, "ph", 10066329);
                    b += 13;
                }
                if (0 != enemyCatalog[c][enemyFireResistPctCol]) {
                    drawMedTextNoOutline(f + 22 + b, g + 48, "fi", 16724736);
                    b += 10;
                }
                if (0 != enemyCatalog[c][enemyIceResistPctCol]) {
                    drawMedTextNoOutline(f + 22 + b, g + 48, "ic", 10070783);
                    b += 10;
                }
                if (0 != enemyCatalog[c][enemyLightResistPctCol]) {
                    drawMedTextNoOutline(f + 22 + b, g + 48, "li", 15658496);
                    b += 7;
                }
                if (0 != enemyCatalog[c][enemyPoisonResistPctCol]) {
                    drawMedTextNoOutline(f + 22 + b, g + 48, "po", 52224);
                    b += 13;
                }
                if (0 < b) {
                    drawText(gameFontMed, f, g + 48, "RES ", 16777215, 0);
                }
                drawText(gameFontMed, f + 80, g + 0, "DROP ITEM", 16777215, 0);
                if (1 == bestiaryEntryState[c]) {
                    h = enemyCatalog[c][enemyBestiaryUnlockCostCol];
                    if (drawButtonBoldedText(f + 120, g + 48 - 8, 80, 56, "G " + h) && h <= partyGold && isMouseClicked) {
                        partyGold = clamp(partyGold - h, 0, 9999999);
                        bestiaryEntryState[c] = 2;
                    }
                } else {
                    for (d = b = 0; 4 > b; b++) {
                        hidx = enemyCatalog[c][enemyDropTableStartIdxCol + 2 * b];
                        if (hidx <= 2) {
                            continue;
                        }
                        drawRect(f + 80, g + 12 + 20 * d, 16, 16, 0);
                        spriteAltRenderFlag = 2;
                        h = itemList[hidx][itemHeadwearType];
                        if (10 == itemList[hidx][itemAppearanceCol]) {
                            drawSpriteSheetPartTintedScaled(itemsSpriteSheet,
                                f + 80, g + 12 + 20 * d,
                                16, 16,
                                16 * (h & 15), 16 * (h >> 4),
                                16, 16,
                                itemList[hidx][itemSpriteSourceXCol],
                                itemList[hidx][itemSpriteLocYCol],
                                true
                            );
                        } else {
                            if (20 == itemList[hidx][itemAppearanceCol] || 30 == itemList[hidx][itemAppearanceCol]) {
                                drawItemSpriteTinted(f + 80, g + 12 + 20 * d,
                                    16 * (h & 15), 16 * (h >> 4),
                                    itemList[hidx][itemSpriteSourceXCol],
                                    itemList[hidx][itemSpriteLocYCol]
                                );
                            } else {
                                drawSpriteSheetPart(itemsSpriteSheet,
                                    f + 80, g + 12 + 20 * d,
                                    16, 16, 16 * (h & 15), 16 * (h >> 4), 16, 16, itemList[hidx][itemSpriteSourceXCol]);
                                spriteAltRenderFlag = 0;
                                gameFontMed.a = 4;
                                drawText(gameFontMed, f + 100, g + 12 + 20 * d + 4, itemList[hidx][itemNameCol], -1, 0);
                                if (0 < itemForgeLvls[hidx]) {
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
            for (hidx = 0; hidx < bestiaryPageItems[currentBestiaryPage].length; hidx++) {
                let c = bestiaryPageItems[currentBestiaryPage][hidx];
                let b = f + hidx % 7 * 28;
                d = g + 96 + 28 * ~~(hidx / 7);
                drawRect(b, d, 24, 24, 0);
                if (hidx == bestiaryEnemySelection) {
                    drawRectOutline(b, d, 24, 24, 16711680);
                }
                if (buttonCheck(b, d, 24, 24)) {
                    fillEmptyPixelsRect(b, d, 24, 24, 6684672);
                    if (isMouseClicked) {
                        bestiaryEnemySelection = hidx;
                    }
                }
                drawEnemyStatic(c, b + 12, d + 20, 2);
            }
        }
        if (drawMenuButton(f + 96 - 42, g + 156, 7, "PREV", 16777215) && isMouseClicked) {
            currentBestiaryPage--;
        }
        if (drawMenuButton(f + 138, g + 156, 8, "NEXT", 16777215) && isMouseClicked) {
            currentBestiaryPage++;    
        }
        currentBestiaryPage = wrapStageIndex(currentBestiaryPage);
        drawTextCentered(gameFontSmall, f + 96, g + 156, "" + (currentBestiaryPage + 1) + "/" + stageIndexOrder.length, 3355443, -1);
        if (1 == isStageReachedArray[stageIndexOrder[currentBestiaryPage]]) {
            drawTextCentered(gameFontMed, f + 96, g + 156 - 20, stageListArray[stageIndexOrder[currentBestiaryPage]][stageNameCol], -1, 0);
        }
    }
    if (badgesUIVisible) {
        let f = 434;
        let g = 14;
        drawRect(f - 6, g - 6, 204, 180, stageListArray[currentStage][stageUIBgColorCol]);
        if (drawCancelButton(f + 188, g + 4) && isMouseClicked) {
            badgesUIVisible = false;
        }
        if (0 == isStageReachedArray[stageIndexOrder[badgesUIStageIdx]]) 
            drawTextCentered(gameFont, f + 96, g + 48, "Not reached", -1, 0);
        else for (hidx = 0; hidx < badgeIndicesByStage[badgesUIStageIdx].length; hidx++) {
                c = badgeIndicesByStage[badgesUIStageIdx][hidx];
                if (badgeList[c]) {
                    b = f + 6;
                    d = g + 6 + 24 * hidx;
                    drawRect(b - 1, d + 5, 10, 10, 0);
                    drawRect(b + 14, d, 20, 20, 0);
                    h = badgeList[c][3];
                    if (badgeCounterArray[c] == badgeList[c][4]) {
                        drawSpriteSheetPart(iconSpriteSheet, b, d + 6, 8, 8, 272, 8, 8, 8, 39168);
                        drawSpriteSheetPartTintedScaled(medalSpriteSheet, b + 14, d + 0, 20, 20, h % 5 * 20, 20 * ~~(h / 5), 20, 20, 14540253, 2236962, true);
                    } else {
                        drawSpriteSheetPart(medalSpriteSheet, b + 14, d + 0, 20, 20, h % 5 * 20, 20 * ~~(h / 5), 20, 20, 4473924);
                        if (0 < badgeCounterArray[c]) {
                            gameFontMed.b = -1;
                            drawTextCentered(gameFontMed, b + 3, d + 10, "" + badgeCounterArray[c], 16777215, -1);
                        }
                    }
                    gameFontMed.a = 3;
                    if (0 == badgeList[c][1].length) {
                        drawText(gameFontMed, b + 40, d + 6, badgeList[c][0], 16777215, 0);
                    } else {
                        drawText(gameFontMed, b + 40, d + 1, badgeList[c][0], 16777215, 0);
                        gameFontMed.a = 3;
                        drawText(gameFontMed, b + 40, d + 11, badgeList[c][1], 16777215, 0);
                    }
                }
            }
        if (drawMenuButton(f + 96 - 42, g + 156, 7, "PREV", 16777215) && isMouseClicked) {
            badgesUIStageIdx--;
        }
        if (drawMenuButton(f + 138, g + 156, 8, "NEXT", 16777215) && isMouseClicked) {
            badgesUIStageIdx++;
        }
        badgesUIStageIdx = wrapStageIndex(badgesUIStageIdx);
        drawTextCentered(gameFontSmall, f + 96, g + 156, "" + (badgesUIStageIdx + 1) + "/" + stageIndexOrder.length, 3355443, -1);
        if (1 == isStageReachedArray[stageIndexOrder[badgesUIStageIdx]]) {
            drawTextCentered(gameFontMed, f + 96, g + 156 - 20, stageListArray[stageIndexOrder[badgesUIStageIdx]][stageNameCol], -1, 0);
        }
    }
    if (optionsUIVisible) {
        let f = 434;
        let g = 202;
        d = 32;
        drawRect(f - 6, g - 6, 204, 148, stageListArray[currentStage][stageUIBgColorCol]);
        if (drawCancelButton(f + 188, g + 4) && isMouseClicked) {
            optionsUIVisible = false;
        }
        c = ["ON", "OFF"];
        drawText(gameFontMed, f + 0, g + 48, "Auto move", 16777215, 0);
        for (hidx = 0; hidx < partyMemberCount; hidx++) {
            drawRect(f + 72 + hidx * d, g + 20, 24, 24, 0);
            drawLine(f + 72 + hidx * d + 7, g + 42, f + 72 + hidx * d + 16, g + 42, 15908203);
            drawLine(f + 72 + hidx * d + 6, g + 43, f + 72 + hidx * d + 17, g + 43, 15908203);
            for (b = 0; 11 > b; b++) {
                l[b].x = f + 72 + hidx * d + p[b];
                l[b].y = g + 20 + t[b];
            }
            drawHero(hidx, l, 0, 1, 15908203, 16777215, 2);
            drawTextCentered(gameFontMed, f + 84 + hidx * d, g + 52, c[autoMoveEnabled[hidx]], 16777215, 0);
            if (buttonCheckCentered(f + 84 + hidx * d, g + 40, 32, 40)) {
                fillEmptyPixelsRect(f + 72 + hidx * d, g + 20, 24, 24, 8388608);
                drawTextCentered(gameFontMed, f + 84 + hidx * d, g + 52, c[autoMoveEnabled[hidx]], 16711680, 0);
                if (isMouseClicked) {
                    autoMoveEnabled[hidx] = 1 - autoMoveEnabled[hidx];
                }
            }
        }
        drawText(gameFontMed, f + 0, g + 64, "Cliff stop :", 16777215, 0);
        drawText(gameFontMed, f + 78, g + 64, c[cliffStopEnabled], 16777215, 0);
        if (buttonCheck(f + 0, g + 64 - 2, 192, 12)) {
            drawText(gameFontMed, f + 78, g + 64, c[cliffStopEnabled], 16711680, 0);
            if (isMouseClicked) {
                cliffStopEnabled = 1 - cliffStopEnabled;
            }
        }
        if (1 == currentStage) {
            drawTextCentered(gameFontMed, f + 96, g + 100, "Return to TITLE", -1, 0);
        } else {
            drawTextCentered(gameFontMed, f + 96, g + 100, "Return to Village",
                -1, 0);
        }
        h = stageListArray[currentStage][stageReturnCost];
        if (drawButtonBoldedText(f + 96, g + 120, 96, 24, "G " + h)) {
            if (h <= partyGold && isMouseClicked) {
                partyGold = clamp(partyGold - h, 0, 9999999);
                if (1 == currentStage) {
                    gameScreenState = 0;
                } else {
                    screenFadeFactor = 0;
                    gameScreenState = 10;
                    currentStage = 1;
                    partySpawnXByHero[0] = 20;
                    partySpawnXByHero[1] = 28;
                    partySpawnXByHero[2] = 36;
                    partySpawnXByHero[3] = 44;
                    partySpawnYByHero[0] = 40;
                    partySpawnYByHero[1] = 40;
                    partySpawnYByHero[2] = 40;
                    partySpawnYByHero[3] = 40;
                }
                saveGame();
                optionsUIVisible = false;
            }
        }
    }
    if (shrineUIVisible) {
        f = 224;
        g = 14;
        drawRect(f - 6, g - 6, 204, 180, stageListArray[currentStage][stageUIBgColorCol]);
        if (drawCancelButton(f + 188, g + 4) && isMouseClicked) {
            shrineUIVisible = false;
        }
        for (hidx = h = 0; hidx < badgeList.length; hidx++)
            if (badgeList[hidx] && badgeCounterArray[hidx] == badgeList[hidx][4]) {
                h++;
            }
        gameFontMed.a = 3;
        drawText(gameFontMed, f + 27, g + 6, "Achievement Medal", 16777215, 0);
        gameFont.a = 1;
        drawText(gameFont, f + 129, g + 6 - 3, "" + h, 16777215, 0);
        c = -1;
        for (hidx = 0; hidx < shrineRewardOptions.length; hidx++) {
            b = f + 6;
            d = g + 26 + 24 * hidx;
            drawRect(b + 14, d, 20, 20, 0);
            if (100 > shrineRewardOptions[hidx][1]) {
                gameFontSmall.b = -2;
                drawScaledTintedTextCentered(gameFontSmall,
                    b + 23, d + 10, "" + shrineRewardOptions[hidx][1], 255, 255, 255, 255, 0, 0, 0, 0, 10, 14);
            } else {
                gameFontSmall.a = 3;
                gameFontSmall.b = -3;
                drawScaledTintedTextCentered(gameFontSmall, b + 25, d + 10, "" + shrineRewardOptions[hidx][1], 255, 255, 255, 255, 0, 0, 0, 0, 10, 14);
            }
            if (1 == shrineRewardClaimed[hidx]) {
                drawRect(b - 1, d + 5, 10, 10, 0);
                drawSpriteSheetPart(iconSpriteSheet, b, d + 6, 8, 8, 272, 8, 8, 8, 39168);
            } else if (buttonCheck(b + 14, d, 20, 20)) {
                fillEmptyPixelsRect(b + 14, d, 20, 20, 6684672);
                if (shrineRewardOptions[hidx][1] <= h && isMouseClicked) {
                    c = hidx;
                }
            }
            
            gameFontMed.a = 3;
            gameFontMed.b = 1;
            drawText(gameFontMed, b + 40, d + 6, shrineRewardOptions[hidx][0], 16777215, 0);
        }
        if (!c)
            for (shrineRewardClaimed[c] = 1, shrineUIVisible = false, hidx = 0; 100 > hidx;) {
                f = randIntRange(2, 78);
                g = randIntRange(1, 44);
                25 >= stageTileData[g][f] || (h = floor(100 * (100 + partyRewardValueBonusPercent) / 100), spawnDrop(8 * f + 4, 8 * g + 4, 2, h, 0), hidx++);
        } else if (1 == c)
            for (shrineRewardClaimed[c] = 1, hidx = 0; 4 > hidx; hidx++)
                for (b = 0; b < partyStats.length; b++) {
                    partySP[hidx] += partyStats[b][hidx];
                    partyStats[b][hidx] = 0;
        } else if (2 == c) {
            shrineRewardClaimed[c] = 1;
            stageEventFlags[3] = 1;
            collectedStageFlagsCount++;
        } else if (3 == c){
            for (shrineRewardClaimed[c] = 1, hidx = 0; 2 > hidx; hidx++){
                if (99 > partyLevel) {
                    partyEXPAccum = LevelExpThresholds[partyLevel];
                    partyLevel++;
                    for (b = 0; 4 > b; b++) partySP[b] += 2;
                    levelUpPopupTimer = 60;
                }
            }
        }
    }
    gameFontSmall.a = 2;
    drawScaledTintedText(gameFontSmall, 476, 421, copyrightText1, 0, 0, 0, 0, 0, 0, 0, 128, 5, 7);
    drawScaledTintedText(gameFontSmall, 607, 421, "" + currentFPS + fpsName, 0, 0, 0, 0, 0, 0, 0, 128, 5, 7);
}

let areUpperJointsDisabled = 1, // rig mode flag
    heroJointPositionsByHero = Array(4); // O, current joint positions for each hero.

    for (let _i = 0; 4 > _i; _i++) heroJointPositionsByHero[_i] = Array(21);

let heroJointPrevPositionsByHero = Array(4); // Mh, previous joint positions used for collision resolution and drag selection.

for (let _i = 0; 4 > _i; _i++) heroJointPrevPositionsByHero[_i] = Array(21);
for (let _i = 0; 4 > _i; _i++)
    for (let _j = 0; 21 > _j; _j++) heroJointPositionsByHero[_i][_j] = new Vec2;
for (let _i = 0; 4 > _i; _i++)
    for (let _j = 0; 21 > _j; _j++) heroJointPrevPositionsByHero[_i][_j] = new Vec2;

let heroJoint5HistoryByHero = Array(4); // Nh, 16-frame history for joint 5 positions.

for (let _i = 0; 4 > _i; _i++) heroJoint5HistoryByHero[_i] = Array(16);
for (let _i = 0; 4 > _i; _i++)
    for (let _j = 0; 16 > _j; _j++) heroJoint5HistoryByHero[_i][_j] = new Vec2;

let heroJoint3HistoryByHero = Array(4); // Oh, 16-frame history for joint 3 positions.

for (let _i = 0; 4 > _i; _i++) heroJoint3HistoryByHero[_i] = Array(16);
for (let _i = 0; 4 > _i; _i++)
    for (let _j = 0; 16 > _j; _j++) heroJoint3HistoryByHero[_i][_j] = new Vec2;

let heroJoint6HistoryByHero = Array(4); // Ph, 16-frame history for joint 6 positions.

for (let _i = 0; 4 > _i; _i++) heroJoint6HistoryByHero[_i] = Array(16);
for (let _i = 0; 4 > _i; _i++)
    for (let _j = 0; 16 > _j; _j++) heroJoint6HistoryByHero[_i][_j] = new Vec2;

let heroJoint4HistoryByHero = Array(4); // Qh, 16-frame history for joint 4 positions.

for (let _i = 0; 4 > _i; _i++) heroJoint4HistoryByHero[_i] = Array(16);
for (let _i = 0; 4 > _i; _i++)
    for (let _j = 0; 16 > _j; _j++) heroJoint4HistoryByHero[_i][_j] = new Vec2;

let heroPoseTrailWriteIdxByHero = Array(4), // Rh, hero pose trail write index per hero.
    heroAttackTrailTimerByHero = Array(4), // Sh, hero attack trail timer per hero.
    heroAttackTrailHistorySets = [
        heroJoint5HistoryByHero, 
        heroJoint6HistoryByHero, 
        heroJoint3HistoryByHero, 
        heroJoint4HistoryByHero
    ], // Th, grouped joint-history buffers used for attack-trail drawing.
    heroAimPosByHero = Array(4); // Uh, stored hero aim position per hero.

for (let _i = 0; 4 > _i; _i++) heroAimPosByHero[_i] = new Vec2;

let heroAttackLineTimer = Array(4),
    heroUpperJointMode = new Int32Array(4), // Wh, per-hero rig mode flag that switches between normal and upper-joint-disabled updates.
    heroPoseAgeFrames = new Int32Array(4), // Xh, per-hero pose age counter used while the rig settles after movement or impact.
    heroTileContactFlags = new Int32Array(4), // Yh, per-hero tile-contact flags set while joint movement hits stage geometry.
    heroAttackCooldownFrames = new Int32Array(4), // Zh, per-hero attack cooldown timer that gates target tracking and attack cadence.
    heroHitFlashTimer = new Int32Array(4), // $h, per-hero hit flash timer used to tint the hero when damage lands.
    heroEnemySeekTimer = new Int32Array(4), // ai, per-hero AI move timer that spaces out enemy-approach adjustments.
    draggedHeroIndex = -1, // bi, dragged hero index for mouse joint selection.
    draggedJointIndex = 0, // ci, dragged joint index for mouse joint selection.
    levelUpPopupTimer = 0, // Hh, level-up popup timer.
    stageClearPopupTimer = 0, // di, stage-clear popup timer.
    comboPopupTimer = 0, // Zg, combo popup timer.
    comboWindowTimer = 0, // Ic, combo window timer that counts down after each hit.
    comboWindowMaxFrames = 0, // Vg, maximum combo window length in frames.
    comboCount = 0, // Hc, combo count shown in the UI and used for payout checks.
    comboGoldPayoutPerHero = 0, // $g, per-hero combo gold payout after a combo ends.
    comboMultBonus = 0, // comboMultBonus, extra percent added to combo payout.
    attackTrailSideIdx = new Int32Array(4), // ei, per-hero active attack-side index used for trail and weapon selection.
    attackWeaponSlotIdx = new Int32Array(4), // fi, per-hero active weapon slot index used by the current attack sequence.
    heroBodyDrawStateByHero = [ // partyBodyDrawOptions, per-hero body draw state: two attack-side slots plus facing.
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
    ],
    heroSkipTimer = new Int32Array(4), // ch, per-hero skip timer that can block updates entirely.
    heroSkipChancePercent = new Int32Array(4), // hi, per-hero skip chance used with ch during attackType 2 effects.
    heroTimedDamageTimer = new Int32Array(4), // dh, per-hero damage-over-time timer.
    heroTimedDamageAmount = new Int32Array(4), // ii, per-hero damage-over-time amount used to drain LP each tick.
    heroStatusTintTimer = new Int32Array(4), // bh, per-hero status tint timer used for the buff-colored hero draw.
    heroTileEffectLatch = new Int32Array(4); // ji, per-hero tile-effect latch used to fire one-off stage tile projectiles.


function resetDragSelection() { // ki
    draggedHeroIndex = -1;
    draggedJointIndex = 0
}


function resetHeroPose(heroIdx, spawnX, spawnY) { // li(a, b, c)
    spawnX *= 8;
    spawnY *= 8;
    for (let d = 0; 21 > d; d++) {
        Vec2Set(heroJointPositionsByHero[heroIdx][d], spawnX + randFloat(4), spawnY + randFloat(4));
        heroJointPrevPositionsByHero[heroIdx][d].set(heroJointPositionsByHero[heroIdx][d]);
    }
    for (let d = 0; 16 > d; d++) { 
        heroJoint5HistoryByHero[heroIdx][d].set(heroJointPositionsByHero[heroIdx][5]);
        heroJoint3HistoryByHero[heroIdx][d].set(heroJointPositionsByHero[heroIdx][3]);
        heroJoint6HistoryByHero[heroIdx][d].set(heroJointPositionsByHero[heroIdx][6]);
        heroJoint4HistoryByHero[heroIdx][d].set(heroJointPositionsByHero[heroIdx][4]);
    }
    heroPoseTrailWriteIdxByHero[heroIdx] = 0;
    heroAttackTrailTimerByHero[heroIdx] = 0;
    Vec2Set(heroAimPosByHero[heroIdx], 320, 240);
    heroAttackLineTimer[heroIdx] = 0;
    heroUpperJointMode[heroIdx] = 0;
    heroPoseAgeFrames[heroIdx] = 0;
    heroTileContactFlags[heroIdx] = 0;
    heroAttackCooldownFrames[heroIdx] = 0;
    heroHitFlashTimer[heroIdx] = 0;
    heroEnemySeekTimer[heroIdx] = 0;
    attackTrailSideIdx[heroIdx] = 0;
    attackWeaponSlotIdx[heroIdx] = 0;
    heroSkipTimer[heroIdx] = 0;
    heroSkipChancePercent[heroIdx] = 0;
    heroTimedDamageTimer[heroIdx] = 0;
    heroTimedDamageAmount[heroIdx] = 0;
    heroStatusTintTimer[heroIdx] = 0;
    heroTileEffectLatch[heroIdx] = 0
}


function moveJointWithCollisions(_entityIdx, _jointIdx) { // ni
    var c = new Vec2();
    Vec2Sub(c, heroJointPositionsByHero[_entityIdx][_jointIdx], heroJointPrevPositionsByHero[_entityIdx][_jointIdx]);
    heroJointPositionsByHero[_entityIdx][_jointIdx].set(heroJointPrevPositionsByHero[_entityIdx][_jointIdx]);
    var d = (Vec2Mag(c) >> 2) + 1;
    Vec2Scale(c, 1 / d);
    var f, g;
    g = getStageTileAt(heroJointPositionsByHero[_entityIdx][_jointIdx].x, heroJointPositionsByHero[_entityIdx][_jointIdx].y);
    if (31 == g) {
        Vec2Scale(c, .95);
        heroTileContactFlags[_entityIdx] |= 2;
    }
    for (var h = 0; h < d; h++) {
        f = heroJointPositionsByHero[_entityIdx][_jointIdx].y + c.y;
        g = getStageTileAt(heroJointPositionsByHero[_entityIdx][_jointIdx].x, f);
        if (!(0 > f || 8 * stageHeight <= f)) {
            if (0 <= g && 23 >= g) {
                c.x *= .5;
                c.y = -c.y;
                heroTileContactFlags[_entityIdx] |= 1;
            } else if (24 <= g && 26 >= g && 0 < c.y && draggedHeroIndex != _entityIdx) {
                c.x *= .5;
                c.y = -c.y;
                heroTileContactFlags[_entityIdx] |= 1;
            } else {
                heroJointPositionsByHero[_entityIdx][_jointIdx].y = f;
            }
        }
        f = heroJointPositionsByHero[_entityIdx][_jointIdx].x + c.x;
        g = getStageTileAt(f, heroJointPositionsByHero[_entityIdx][_jointIdx].y);
        if (!(0 > f || 640 <= f)) {
            if (0 <= g && 23 >= g) {
                c.y *= .5;
                c.x = -c.x;
                heroTileContactFlags[_entityIdx] |= 1;
            } else {
                heroJointPositionsByHero[_entityIdx][_jointIdx].x = f;
            }
        }
    }
}


function findNearestPartyMemberInRect(_cx, _cy, _halfW, _halfH, _modelFlag) { // ti
    var g = _cx - _halfW - 5,
        h = _cy - _halfH - 10;
    _halfW = _cx + _halfW + 5;
    _halfH = _cy + _halfH + 10;
    var k, p = new Vec2(),
        t = new Vec2(),
        l, n, w = 1E3,
        B = -1;
    _modelFlag = 0 == _modelFlag ? 29 : 23;
    for (var M = 0; M < partyMemberCount; M++) {
        if (heroUpperJointMode[M] != areUpperJointsDisabled) {
            k = heroJointPositionsByHero[M][2];
            if (!(k.x > _halfW || k.x < g || k.y > _halfH || k.y < h)) {
                t.x = k.x - _cx;
                t.y = k.y - _cy;
                l = Vec2Mag(t);
                k = (l >> 3) + 1;
                Vec2Scale(t, 1 / k);
                Vec2Set(p, _cx, _cy);
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
function damagePartyMemberInArea(__unused, stopOnHit, attackType, auxValue, dmgMin, dmgMax, _cy, _cx, _w, _h) { // ui
    _w *= .5;
    _h *= .5;
    __unused = _cy - _w - 5;
    var l = _cx - _h - 10;
    _w = _cy + _w + 5;
    _h = _cx + _h + 10;
    for (var n, w = new Vec2(), B = new Vec2(), M, J, y = -1, x = 0; x < partyMemberCount; x++) {
        if (heroUpperJointMode[x] != areUpperJointsDisabled) {
            n = heroJointPositionsByHero[x][2];
            if (!(n.x > _w || n.x < __unused || n.y > _h || n.y < l)) {
                B.x = n.x - _cy;
                B.y = n.y - _cx;
                n = Vec2Mag(B);
                M = (n >> 3) + 1;
                Vec2Scale(B, 1 / M);
                Vec2Set(w, _cy, _cx);
                for (n = 0; n <= M; n++) {
                    J = getStageTileAt(w.x, w.y);
                    if (0 <= J && 29 >= J) break;
                    w.add(B);
                }
                if (!(n <= M)) {
                    y = dmgMin + floor(randFloat(dmgMax - dmgMin + 1));
                    M = 0 == heroBodyDrawStateByHero[x][2] ? 1 : -1;
                    J = 16711680;
                    heroHitFlashTimer[x] = 2;
                    if (0 == attackType) {
                        y = max(y - heroMeleeDefensesFlatArray[x], 1);
                    } else {
                        if (6 == attackType) {
                            y = max(y - heroProjDefenseFlatArray[x], 1);
                        } else {
                            if (1 <= attackType) {
                                y = max(floor(y * (100 - heroMagicDefenseFlatArray[x]) / 100), 1);
                            }
                        }
                    }
                    if (randFloat(100) < heroDodgeChanceArray[x]) {
                        y = 0;
                        J = 16744576;
                        heroHitFlashTimer[x] = 0;
                    }
                    if (1 == attackType) {
                        if (heroHasAccessoryEffect(x,
                                accessoryMagicDamageReductionCol)) {
                            y = max(y - countAccessoryLvlBonuses(x, accessoryMagicDamageReductionCol), 1);
                        }
                    }
                    if (2 == attackType) {
                        heroSkipTimer[x] = 120;
                        heroSkipChancePercent[x] = auxValue;
                        if (heroHasAccessoryEffect(x, accessoryStunChanceReductionCol)) {
                            heroSkipChancePercent[x] = max(floor(heroSkipChancePercent[x] * (100 - countAccessoryLvlBonuses(x, accessoryStunChanceReductionCol)) / 100), 0);
                        }
                    } else
                    if (3 == attackType) {
                        if (heroHasAccessoryEffect(x, accessoryDamageNegationChanceCol)) {
                            if (randFloat(100) < countAccessoryLvlBonuses(x, accessoryDamageNegationChanceCol)) {
                                y = 0;
                                J = 16744576;
                                heroHitFlashTimer[x] = 0;
                            }
                        }
                    } else
                    if (4 == attackType) {
                        heroTimedDamageTimer[x] = auxValue;
                        heroTimedDamageAmount[x] = y;
                        if (heroHasAccessoryEffect(x, accessoryDebuffDurationReductionCol)) {
                            heroTimedDamageTimer[x] = max(heroTimedDamageTimer[x] - 60 * countAccessoryLvlBonuses(x, accessoryDebuffDurationReductionCol), 0);
                        }
                        y = x;
                        continue;
                    } else if (5 == attackType) {
                        heroStatusTintTimer[x] = floor(auxValue / 10);
                    }
                    if (isBadgeIncompleteForCurrentStage(43)) {
                        if (1 == attackType) {
                            if (0 < heroSkipTimer[x]) {
                                if (0 < heroTimedDamageTimer[x]) {
                                    IncrementBadgeCount(43);
                                }
                            }
                        }
                    }
                    partyLP[x] -= y;
                    spawnPopup(heroJointPositionsByHero[x][0].x, heroJointPositionsByHero[x][0].y, M, y, 60, J);
                    stage_partyDamageTaken += y;
                    if (0 > partyLP[x])
                        for (y = max(~~-partyLP[x], 1), n = partyLP[x] = 0; n < partyMemberCount; n++)
                            if (x != n) {
                                partyLP[n] = clamp(partyLP[n] - y, 0, partyMaxLP[n]);
                                spawnPopup(heroJointPositionsByHero[n][0].x, heroJointPositionsByHero[n][0].y, M, y, 60, J);
                                stage_partyDamageTaken += y;
                            }
                    y = x;
                    if (0 == stopOnHit) break;
                }
            }
        }
        return y;
    }
}


function pickHeroJointUnderMouse() { // vi
    var a = new Vec2(),
        b, c;
    if (-1 == draggedHeroIndex) {
        if (isMouseClicked && !clickInUI) {
            b = 20;
            a.x = mouseXCurrent - heroJointPrevPositionsByHero[selectingHero][0].x;
            a.y = mouseYCurrent - (heroJointPrevPositionsByHero[selectingHero][0].y - 8);
            c = Vec2Mag(a);
            if (20 > c) {
                if (c < b) {
                    b = c;
                    draggedHeroIndex = selectingHero;
                    draggedJointIndex = 0;
                }
            }
            for (var d = 0; d < partyMemberCount; d++)
                if (heroUpperJointMode[d] != areUpperJointsDisabled)
                    for (var f = 0; 10 > f; f++) {
                        a.x = mouseXCurrent - heroJointPrevPositionsByHero[d][f].x;
                        a.y = mouseYCurrent - heroJointPrevPositionsByHero[d][f].y;
                        c = Vec2Mag(a);
                        if (20 > c) {
                            if (c < b) {
                                b = c;
                                draggedHeroIndex = d;
                                draggedJointIndex = f;
                                selectingHero = d;
                            }
                        }
                    }
        }
    } else if (!wasMouseDown) {
        draggedHeroIndex = -1; 
        draggedJointIndex = 0;
    }
}



function spawnHeroAttackPattern(heroIdx, limbDesc, itemSlot, originX, originY, targetEnemyIdx) { // xi
    console.log(`spawnHeroAttackPattern(${heroIdx}, ${limbDesc}, ${itemSlot}, ${originX}, ${originY}, ${targetEnemyIdx})`);
    let projDir = new Vec2(),
        selectedItemIdx = partyEquipmentTable[heroIdx][itemSlot],
        selectedItem = itemList[selectedItemIdx],
        limbSel = selectedItem[itemLimbSelectionCol];
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
    let pwidth = selectedItem[itemProjectileDrawWidthCol],
        pheight = selectedItem[itemProjectileDrawHeightCol],
        pshape = selectedItem[itemProjectileShapeModeCol],
        pewidth = selectedItem[projectileEffectWidthCol],
        peheight = selectedItem[projectileEffectHeightCol],
        pdelr = selectedItem[projectileDelayRangeCol],
        pnodmg = selectedItem[projectileNoDamageFramesCol],
        panim = selectedItem[projectileStartAnimFrameCol],
        plife = selectedItem[projectileLifetimeCol],
        ptarg = selectedItem[projectileTargetIndexCol],
        pacelMod = getModifiedStatVal(heroIdx, selectedItemIdx, projectileAccelerationCol),
        pspdMod = getModifiedStatVal(heroIdx, selectedItemIdx, projectileSpeedScaleCol),
        pauxMod = getModifiedStatVal(heroIdx, selectedItemIdx, projectileAuxStatCol),
        pcol = selectedItem[projectileCollisionModeCol],
        pcdMod = getModifiedStatVal(heroIdx, selectedItemIdx, attackCooldownCol);

    if (heroHasAccessoryEffect(heroIdx, accessoryEffectRangeAndCountCol) && (4 == selectedItem[itemAppearanceCol] || 5 == selectedItem[itemAppearanceCol])) {
        pcdMod += sumAccessorySecondaryValues(heroIdx, accessoryEffectRangeAndCountCol);
    }
    let paux = selectedItem[projectileAuxParamCol],
        pmaxtarg = selectedItem[itemProjectileMaxTargetsCol];
    if (2 == pmaxtarg) {
        pmaxtarg = limbDesc >> 8;
    }
    limbDesc = selectedItem[itemProjectileDamageMinCol];

    let itemdmgMax = selectedItem[itemProjectileDamageMaxCol],
        itempEffect = selectedItem[itemProjectileEffectTypeCol],
        projEffect = selectedItem[projectileEffectTypeCol],
        projEffectDur = selectedItem[projectileEffectDurationCol],
        itemHitCountMod = getModifiedStatVal(heroIdx, selectedItemIdx, itemHitCountStatCol),
        minAtk = minAtkArray[4 * itemSlot + heroIdx],
        maxAtk = maxAtkArray[4 * itemSlot + heroIdx];
    if (heroHasAccessoryEffect(heroIdx, accessoryEffectPhysicalProcChanceCol) && 0 == selectedItem[itemElementTypeCol] && randFloat(100) < countAccessoryLvlBonuses(heroIdx, accessoryEffectPhysicalProcChanceCol)) {
        minAtk = floor(minAtk * (100 + sumAccessorySecondaryValues(heroIdx, accessoryEffectPhysicalProcChanceCol)) / 100);
        maxAtk = floor(maxAtk * (100 + sumAccessorySecondaryValues(heroIdx, accessoryEffectPhysicalProcChanceCol)) / 100);
    }
    itemSlot = atkCountArray[4 * itemSlot + heroIdx];
    let itemProjSpd = selectedItem[itemProjectileSpeedCol],
        itemEType = selectedItem[itemElementTypeCol],
        itemBonus = getModifiedStatVal(heroIdx, selectedItemIdx, itemIceBonusPercentCol);
    if (heroHasAccessoryEffect(heroIdx, accessoryEffectFireStatBonusCol)) {
        if (1 == selectedItem[itemElementTypeCol]) {
            itemBonus += countAccessoryLvlBonuses(heroIdx, accessoryEffectFireStatBonusCol);
        }
    }
    if (heroHasAccessoryEffect(heroIdx, accessoryEffectIceStatBonusCol)) {
        if (2 == selectedItem[itemElementTypeCol]) {
            itemBonus += countAccessoryLvlBonuses(heroIdx, accessoryEffectIceStatBonusCol);
        }
    }
    if (heroHasAccessoryEffect(heroIdx, accessoryEffectPoisonStatBonusCol)) {
        if (4 == selectedItem[itemElementTypeCol]) {
            itemBonus += 60 * countAccessoryLvlBonuses(heroIdx, accessoryEffectPoisonStatBonusCol);
        }
    }
    let itemProjParam1 = selectedItem[itemProjectileParam1Col],
        itemAtkMode = selectedItem[itemAttackModeCol],
        itemProjParam2 = selectedItem[itemProjectileParam2Col],
        itemProjAux1 = selectedItem[itemProjectileAux1Col],
        itemProjAux2 = selectedItem[itemProjectileAux2Col],
        itemAuxA = selectedItem[itemAuxValueACol],
        itemAuxB = selectedItem[itemAuxValueBCol],
        itemAuxC = selectedItem[itemAuxValueCCol],
        itemDispA = selectedItem[itemDisplayStatACol],
        itemAuxD = selectedItem[itemAuxValueDCol],
        itemProjFlag = selectedItem[itemProjectileFlagCol],
        itemProjParamTime = selectedItem[itemProjectileParamTimeCol],
        itemHCount = selectedItem[itemHitCountCol],
        itemProjEffect = selectedItem[itemProjectileEffectModeCol],
        itemStatAMod = getModifiedStatVal(heroIdx, selectedItemIdx, itemStatACol),
        itemExt1 = selectedItem[itemExtraStatCol1],
        itemExt2 = selectedItem[itemExtraStatCol2],
        itemSpwnRange = selectedItem[itemSpawnTargetRangeCol],
        itemExtA = selectedItem[itemExtraParamACol],
        itemExtB = selectedItem[itemExtraParamBCol],
        itemExtC = selectedItem[itemExtraParamCCol],
        itemProjParam3 = selectedItem[itemProjectileParam3Col];

    selectedItemIdx = getModifiedStatVal(heroIdx, selectedItemIdx, itemAttackPowerCol);
    if (heroHasAccessoryEffect(heroIdx, accessoryEffectLightningElemBonusCol)) {
        if (3 == selectedItem[itemElementTypeCol] && 20 == selectedItem[itemAttackModeCol]) {
            selectedItemIdx += countAccessoryLvlBonuses(heroIdx, accessoryEffectLightningElemBonusCol);    
        }
    }

    selectedItem = selectedItem[itemProjectileTemplateCol];
    let jointX = enemyJointPosArray[targetEnemyIdx][enemyTargetJointIdx].x;
    let jointY = enemyJointPosArray[targetEnemyIdx][enemyTargetJointIdx].y;

    if (pwidth == 0) return;
    if (1 == pwidth) {
        for (pwidth = 0; pwidth < itemSlot; pwidth++) {
            let spawnX = randFloatRange(-pheight, pheight);
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
        dirX /= abs(dirX);
        for (pwidth = 0; pwidth < itemSlot; pwidth++) {
            let spawnX = originX + dirX * pheight;
            let spawn = originY + randFloatRange(-pshape, pshape);
            let velX = dirX * itemProjSpd * .1;
            spawnProjectile(heroIdx, limbSel, spawnX, spawn, velX, 0, pewidth, peheight, pdelr, pnodmg, panim, plife, ptarg, pacelMod, pspdMod, pauxMod, pcol, pcdMod,
                paux, pmaxtarg, limbDesc, itemdmgMax, itempEffect, projEffect, projEffectDur, 0, itemHitCountMod, minAtk, maxAtk, itemEType, itemBonus, itemProjParam1, itemAtkMode,
                itemProjParam2, itemProjAux1, itemProjAux2, itemAuxA, itemAuxB, itemAuxC, itemDispA, itemAuxD, itemProjFlag, itemProjParamTime, itemHCount, itemProjEffect, itemStatAMod, itemExt1, itemExt2,
                itemSpwnRange, itemExtA, itemExtB, itemExtC, itemProjParam3, selectedItemIdx, selectedItem
            );
        }
    } else if (3 == pwidth) {
        Vec2Set(projDir, jointX - originX, jointY - originY);
        let We = 0 < pheight ? pheight - 1 : 16;
        if (heroHasAccessoryEffect(heroIdx, accessoryMultiShotSpreadDivisorCol)) {
            We = floor(We / countAccessoryLvlBonuses(heroIdx, accessoryMultiShotSpreadDivisorCol));
        }
        jointX = floor(512 * Vec2Angle(projDir) / TAU);
        jointX -= floor((itemSlot - 1) * We / 2);
        for (pwidth = 0; pwidth < itemSlot; pwidth++) {
            projDir.x = rotationLUT[jointX & 511][0];
            projDir.y = -rotationLUT[jointX & 511][1];
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
        Vec2Set(projDir, jointX - originX, jointY - originY - 5);
        itemProjSpd = Vec2Mag(projDir) / (.1 * itemProjSpd);
        limbDesc = 2E4 / (itemProjSpd * itemProjSpd);
        for (pwidth = 0; pwidth < itemSlot; pwidth++) {
            Vec2Set(projDir, jointX - originX, jointY - 5 - originY);
            if (1 < itemSlot) {
                let _a = 0 < pheight ? pheight : itemSlot + 4;
                pshape = randInt(512);
                let spawnX = randFloat(_a);
                projDir.x += rotationLUT[pshape][0] * spawnX;
                projDir.y += rotationLUT[pshape][1] * spawnX;
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
        jointX = 256 + 256 * heroBodyDrawStateByHero[heroIdx][2];
        let _a = floor(512 / itemSlot);
        for (pwidth = 0; pwidth < itemSlot; pwidth++) {
            projDir.x = rotationLUT[jointX & 511][0];
            projDir.y = -rotationLUT[jointX & 511][1];
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
        originX = floor(512 / itemSlot);
        pshape = floor(randFloat(originX));
        for (pwidth = 0; pwidth < itemSlot; pwidth++) {
            let spawnX = jointX + rotationLUT[pshape][0] * pheight;
            let spawnY = jointY + rotationLUT[pshape][1] * pheight;
            let velX = rotationLUT[pshape][0] * itemProjSpd * .1;
            let velY = rotationLUT[pshape][1] * itemProjSpd * .1;
            spawnProjectile(heroIdx, limbSel, spawnX, spawnY, velX, velY, pewidth, peheight, pdelr, pnodmg, panim, plife, ptarg, pacelMod, pspdMod, pauxMod, pcol,
                pcdMod, paux, pmaxtarg, limbDesc, itemdmgMax, itempEffect, projEffect, projEffectDur, 0, itemHitCountMod, minAtk, maxAtk, itemEType, itemBonus, itemProjParam1,
                itemAtkMode, itemProjParam2, itemProjAux1, itemProjAux2, itemAuxA, itemAuxB, itemAuxC, itemDispA, itemAuxD, itemProjFlag, itemProjParamTime, itemHCount, itemProjEffect, itemStatAMod, itemExt1,
                itemExt2, itemSpwnRange, itemExtA, itemExtB, itemExtC, itemProjParam3, selectedItemIdx, selectedItem
            );
            pshape += originX;
        }
    }
}


function updatePartyMemberAI(memberIdx) { // Di
    let b = heroJointPositionsByHero[memberIdx][2].x,
        c = heroJointPositionsByHero[memberIdx][2].y;
    
    if (autoMoveEnabled[memberIdx] == 1)
        return;
    let nearestEnem = findEnemyInArea(heroJointPositionsByHero[memberIdx][0].x, heroJointPositionsByHero[memberIdx][0].y, 200, 50);

    if (!(-1 != nearestEnem && 0 != heroTileContactFlags[memberIdx]))
        return;

    if (0 < heroEnemySeekTimer[memberIdx]) {
        heroEnemySeekTimer[memberIdx]--;
    } else {
        heroEnemySeekTimer[memberIdx] = 15;
        let f = b > enemyJointPosArray[nearestEnem][enemyTargetJointIdx].x ? -1 : 1;
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
            k = heroJointPositionsByHero[memberIdx][9].x < heroJointPositionsByHero[memberIdx][10].x ? 7 : 8;
            heroBodyDrawStateByHero[memberIdx][2] = 1;
        } else {
            k = heroJointPositionsByHero[memberIdx][9].x > heroJointPositionsByHero[memberIdx][10].x ? 7 : 8;
            heroBodyDrawStateByHero[memberIdx][2] = 0;
        }
        if (!cliffStopEnabled) {
            h = getStageTileAt(b + 20 * f, c + 8 + 0);
            let p = getStageTileAt(b + 20 * f, c + 8 + 8),
                t = getStageTileAt(b + 20 * f, c + 8 + 16),
                l = getStageTileAt(b + 20 * f, c + 8 + 24);
            if (30 <= h && 30 <= p && 30 <= t && 30 <= l) {
                k = (k = 7, 8);
                f *= -1;
            }
        }
        heroJointPositionsByHero[memberIdx][k].x += 4 * f;
        heroJointPositionsByHero[memberIdx][k].y -= 3 * g;
    }
    if (2 == heroTileContactFlags[memberIdx]) {
        if (b < enemyJointPosArray[nearestEnem][enemyTargetJointIdx].x) {
            heroJointPositionsByHero[memberIdx][0].x += .25;
            heroJointPositionsByHero[memberIdx][1].x += .25;
            heroBodyDrawStateByHero[memberIdx][2] = 1;
        } else {
            heroJointPositionsByHero[memberIdx][0].x -= .25;
            heroJointPositionsByHero[memberIdx][1].x -= .25;
            heroBodyDrawStateByHero[memberIdx][2] = 0;
        }
        if (c < enemyJointPosArray[nearestEnem][enemyTargetJointIdx].y) {
            heroJointPositionsByHero[memberIdx][0].y += .25;
            heroJointPositionsByHero[memberIdx][1].y += .25;
        } else {
            heroJointPositionsByHero[memberIdx][0].y -= .25;
            heroJointPositionsByHero[memberIdx][1].y -= .25;
        }
        heroJointPositionsByHero[memberIdx][0].x += randFloatRange(-.25, .25);
        heroJointPositionsByHero[memberIdx][0].y += randFloatRange(-.25, .25);
        heroJointPositionsByHero[memberIdx][1].x += randFloatRange(-.25, .25);
        heroJointPositionsByHero[memberIdx][1].y += randFloatRange(-.25, .25);
    }
}


function updatePlayerParty() {
    var a, b, c, d, f = new Vec2(),
        g = new Vec2(),
        h = new Vec2();
    pickHeroJointUnderMouse();
    for (a = 0; a < partyMemberCount; a++) {
        if (0 < heroTimedDamageTimer[a] && (heroTimedDamageTimer[a]--, d = floor(heroTimedDamageAmount[a] / 60), b = heroTimedDamageAmount[a] - 60 * d, randFloat(60) < b && (d += 1), partyLP[a] -= d, stage_partyDamageTaken += d, 0 > partyLP[a]))
            for (c = 0 == heroBodyDrawStateByHero[a][2] ? 1 : -1, d = max(~~-partyLP[a], 1), b = partyLP[a] = 0; b < partyMemberCount; b++)
                if (a != b) {
                    partyLP[b] = clamp(partyLP[b] - d, 0, partyMaxLP[b]);
                    spawnPopup(heroJointPositionsByHero[b][0].x, heroJointPositionsByHero[b][0].y, c, d, 60, 16711680);
                    stage_partyDamageTaken += d;
                }


        if (0 < heroStatusTintTimer[a]) heroStatusTintTimer[a]--;
        else {
            if (0 < heroSkipTimer[a] && (heroSkipTimer[a]--, randFloat(100) < heroSkipChancePercent[a])) continue;
            heroPoseAgeFrames[a]++;
            if (heroUpperJointMode[a] == areUpperJointsDisabled)
                for (b = 0; 11 > b; b++) stepWithVerticalBias(heroJointPositionsByHero[a][b], heroJointPrevPositionsByHero[a][b], .05, .99);
            else if (2 == heroTileContactFlags[a])
                for (b = 0; 11 > b; b++) stepWithVerticalBias(heroJointPositionsByHero[a][b], heroJointPrevPositionsByHero[a][b], .01, .99);
            else if (20 > heroPoseAgeFrames[a]) {
                stepWithVerticalBias(heroJointPositionsByHero[a][0], heroJointPrevPositionsByHero[a][0], -.2, .99);
                stepWithVerticalBias(heroJointPositionsByHero[a][1], heroJointPrevPositionsByHero[a][1], 0, .99);
                stepWithVerticalBias(heroJointPositionsByHero[a][2], heroJointPrevPositionsByHero[a][2], -.1, .99);
                stepWithVerticalBias(heroJointPositionsByHero[a][3], heroJointPrevPositionsByHero[a][3], 0, .99);
                stepWithVerticalBias(heroJointPositionsByHero[a][4], heroJointPrevPositionsByHero[a][4], 0, .99);
                stepWithVerticalBias(heroJointPositionsByHero[a][5], heroJointPrevPositionsByHero[a][5], 0, .99);
                stepWithVerticalBias(heroJointPositionsByHero[a][6], heroJointPrevPositionsByHero[a][6], 0, .99);
                stepWithVerticalBias(heroJointPositionsByHero[a][7], heroJointPrevPositionsByHero[a][7], 0, .99);
                stepWithVerticalBias(heroJointPositionsByHero[a][8], heroJointPrevPositionsByHero[a][8], 0, .99);
                stepWithVerticalBias(heroJointPositionsByHero[a][9], heroJointPrevPositionsByHero[a][9], .3, .99);
                stepWithVerticalBias(heroJointPositionsByHero[a][10], heroJointPrevPositionsByHero[a][10], .3, .99);
            } else for (b = 0; 11 > b; b++)
                if (heroHasAccessoryEffect(a, accessoryJointStepDividerCol)) {
                    stepWithVerticalBias(heroJointPositionsByHero[a][b], heroJointPrevPositionsByHero[a][b], .05 / countAccessoryLvlBonuses(a, accessoryJointStepDividerCol), .99);
                } else {
                    stepWithVerticalBias(heroJointPositionsByHero[a][b], heroJointPrevPositionsByHero[a][b], .05, .99);
                }
            for (b = d = 0; b < partyMemberCount; b++) d += partyLP[b];
            if (0 == d && heroUpperJointMode[a] != areUpperJointsDisabled)
                for (heroUpperJointMode[a] = areUpperJointsDisabled, b = heroAttackCooldownFrames[a] = 0; 11 > b; b++) {
                    heroJointPositionsByHero[a][b].x += randFloatRange(-2, 2);
                    heroJointPositionsByHero[a][b].y +=
                        randFloatRange(-1, -3);
                }
            if (heroUpperJointMode[a] != areUpperJointsDisabled) {
                if (1 == currentStage) {
                    if (partyLP[a] < partyMaxLP[a]) {
                        if (1 > randFloat(100)) {
                            partyLP[a] = clamp(partyLP[a] + 5, 0, partyMaxLP[a]);
                            spawnPopup(heroJointPositionsByHero[a][0].x, heroJointPositionsByHero[a][0].y, 0, 5, 60, 65280);
                        }
                    }
                }
                if (draggedHeroIndex == a) {
                    heroJointPositionsByHero[draggedHeroIndex][draggedJointIndex].x += .2 * (mouseXCurrent - heroJointPositionsByHero[draggedHeroIndex][draggedJointIndex].x);
                    heroJointPositionsByHero[draggedHeroIndex][draggedJointIndex].y += .2 * (mouseYCurrent - heroJointPositionsByHero[draggedHeroIndex][draggedJointIndex].y);
                }
                b = itemList[partyEquipmentTable[a][0]][itemAppearanceCol];
                c = heroRangeValues[a];
                d = heroJointPositionsByHero[a][1].x;
                var k = heroJointPositionsByHero[a][1].y;
                c = findEnemyInArea(d, k, c, c);
                if (-1 == heroEmitValues[a]) {
                    if (0 < heroEmitCooldown[a]) {
                        heroEmitCooldown[a]--;
                    }
                    if (0 == heroEmitCooldown[a]) {
                        k = findEnemyInArea(d, k, 999, 999);
                        if (-1 != k) {
                            spawnHeroAttackPattern(a, 1540, 1, heroJointPositionsByHero[a][6].x, heroJointPositionsByHero[a][6].y, k);
                            heroEmitCooldown[a] = itemList[partyEquipmentTable[a][1]][attackCooldownCol];
                        }
                    }
                }
                if (0 < heroAttackCooldownFrames[a]) heroAttackCooldownFrames[a]--;
                else if (draggedHeroIndex != a && 0 != b && -1 != c) {
                    heroAttackCooldownFrames[a] = heroAgiValues[a] + randIntRange(-1, 1);
                    heroBodyDrawStateByHero[a][2] = d < enemyJointPosArray[c][enemyTargetJointIdx].x ? 1 : 0;
                    k = 0;
                    if (-1 == heroEmitValues[a]) {
                        heroEmitCurrent[a] =
                            0;
                        attackWeaponSlotIdx[a] = 0;
                    } else {
                        if (heroEmitCurrent[a] < heroEmitValues[a] || 0 == heroEmitValues[a]) {
                            heroEmitCurrent[a] = clamp(heroEmitCurrent[a] + heroChargeValues[a], 0, heroEmitValues[a]);
                            attackWeaponSlotIdx[a] = 0;
                            if (heroHasAccessoryEffect(a, accessoryEffectEmitFullChargeChance_duringChargeCol)) {
                                if (100 * rand() < countAccessoryLvlBonuses(a, accessoryEffectEmitFullChargeChance_duringChargeCol)) {
                                    heroEmitCurrent[a] = heroEmitValues[a];
                                }
                            }
                        } else {
                            heroEmitCurrent[a] = 0;
                            attackWeaponSlotIdx[a] = 1;
                            b = itemList[partyEquipmentTable[a][1]][itemAppearanceCol];
                            if (heroHasAccessoryEffect(a, accessoryEffectEmitFullChargeChance_onFireCol)) {
                                if (100 * rand() < countAccessoryLvlBonuses(a, accessoryEffectEmitFullChargeChance_onFireCol)) {
                                    heroEmitCurrent[a] = heroEmitValues[a];
                                }
                            }
                        }
                    }
                    if (0 != b)
                        if (3 == b) {
                            Vec2Sub(g, enemyJointPosArray[c][enemyTargetJointIdx], heroJointPositionsByHero[a][5]);
                            Vec2Sub(h, enemyJointPosArray[c][enemyTargetJointIdx], heroJointPositionsByHero[a][6]);
                            if (g.x * g.x + g.y * g.y >= h.x * h.x + h.y * h.y) {
                                Vec2Norm(g);
                                Vec2Scale(g, 3);
                                heroJointPositionsByHero[a][5].add(g);
                                heroJointPositionsByHero[a][4].sub(g);
                                f.set(heroJointPositionsByHero[a][5]);
                                k = 1283;
                                attackTrailSideIdx[a] = 0;
                            } else {
                                Vec2Norm(h);
                                Vec2Scale(h, 3);
                                heroJointPositionsByHero[a][6].add(h);
                                heroJointPositionsByHero[a][3].sub(h);
                                f.set(heroJointPositionsByHero[a][6]);
                                k = 1540;
                                attackTrailSideIdx[a] = 1;
                            }
                            heroAimPosByHero[a].set(enemyJointPosArray[c][enemyTargetJointIdx]);
                            heroAttackLineTimer[a] = 5;
                        } else
                    if (4 == b) {
                        var k = 5 + attackWeaponSlotIdx[a],
                            p = 3 +
                            attackWeaponSlotIdx[a],
                            t = 4 - attackWeaponSlotIdx[a];
                        if (
                            d < enemyJointPosArray[c][enemyTargetJointIdx].x) {
                            heroJointPositionsByHero[a][k].x += .5;
                            heroJointPositionsByHero[a][p].x += .5;
                            --heroJointPositionsByHero[a][t].x;
                        } else {
                            heroJointPositionsByHero[a][k].x -= .5;
                            heroJointPositionsByHero[a][p].x -= .5;
                            heroJointPositionsByHero[a][t].x += 1;
                        }
                        f.set(heroJointPositionsByHero[a][k]);
                        k = k << 8 | 3;
                        attackTrailSideIdx[a] = attackWeaponSlotIdx[a];
                    } else if (5 == b) {
                        if (d < enemyJointPosArray[c][enemyTargetJointIdx].x) {
                            heroJointPositionsByHero[a][5].x += 1;
                            heroJointPositionsByHero[a][6].x += 1;
                            heroJointPositionsByHero[a][1].x -= 2;
                        } else {
                            --heroJointPositionsByHero[a][5].x;
                            --heroJointPositionsByHero[a][6].x;
                            heroJointPositionsByHero[a][1].x += 2;
                        }
                        if (heroJointPositionsByHero[a][5].y < heroJointPositionsByHero[a][6].y) {
                            f.set(heroJointPositionsByHero[a][5]);
                            k = 1283;
                            attackTrailSideIdx[a] = 0;
                        } else {
                            f.set(heroJointPositionsByHero[a][6]);
                            k = 1540;
                            attackTrailSideIdx[a] = 1;
                        }
                        applySeparationCorrection(heroJointPositionsByHero[a][5], heroJointPositionsByHero[a][6], 5, .1, .1);
                    } else {
                        if (d < enemyJointPosArray[c][enemyTargetJointIdx].x) {
                            if (heroJointPositionsByHero[a][5].x < heroJointPositionsByHero[a][6].x) {
                                heroJointPositionsByHero[a][5].x += 4;
                                heroJointPositionsByHero[a][4].x -= 4;
                                f.set(heroJointPositionsByHero[a][5]);
                                k = 1283;
                                attackTrailSideIdx[a] = 0;
                            } else {
                                heroJointPositionsByHero[a][6].x += 4;
                                heroJointPositionsByHero[a][3].x -= 4;
                                f.set(heroJointPositionsByHero[a][6]);
                                k =
                                    1540;
                                attackTrailSideIdx[a] = 1;
                            }
                        } else {
                            if (heroJointPositionsByHero[a][5].x > heroJointPositionsByHero[a][6].x) {
                                heroJointPositionsByHero[a][5].x -= 4;
                                heroJointPositionsByHero[a][4].x += 4;
                                f.set(heroJointPositionsByHero[a][5]);
                                k = 1283;
                                attackTrailSideIdx[a] = 0;
                            } else {
                                heroJointPositionsByHero[a][6].x -= 4;
                                heroJointPositionsByHero[a][3].x += 4;
                                f.set(heroJointPositionsByHero[a][6]);
                                k = 1540;
                                attackTrailSideIdx[a] = 1;
                            }
                        }
                    }
                    if (2 == b) {
                        heroAttackTrailTimerByHero[a] = 30;
                    }
                    heroBodyDrawStateByHero[a][attackTrailSideIdx[a]] = attackWeaponSlotIdx[a];
                    spawnHeroAttackPattern(a, k, attackWeaponSlotIdx[a], f.x, f.y, c);
                }
                if (draggedHeroIndex != a) {
                    if (0 != b) {
                        if (-1 == c) {
                            updatePartyMemberAI(a);
                        }
                    }
                }
            }
            if (
                heroUpperJointMode[a] == areUpperJointsDisabled) {
                applySeparationCorrection(heroJointPositionsByHero[a][1], heroJointPositionsByHero[a][2], 3.6, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][3], heroJointPositionsByHero[a][5], 4.8, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][4], heroJointPositionsByHero[a][6], 4.8, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][7], heroJointPositionsByHero[a][9], 4.8, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][8], heroJointPositionsByHero[a][10], 4.8, .5, .5);
            } else {
                applySeparationCorrection(heroJointPositionsByHero[a][0], heroJointPositionsByHero[a][1], 3.6, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][1], heroJointPositionsByHero[a][2], 3.6, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][1], heroJointPositionsByHero[a][3], 4.8, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][1], heroJointPositionsByHero[a][4], 4.8, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][3], heroJointPositionsByHero[a][5], 4.8, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][4], heroJointPositionsByHero[a][6], 4.8, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][2], heroJointPositionsByHero[a][7], 4.8, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][2], heroJointPositionsByHero[a][8], 4.8, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][7], heroJointPositionsByHero[a][9], 4.8, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][8], heroJointPositionsByHero[a][10], 4.8, .5, .5);
                applySeparationCorrection(heroJointPositionsByHero[a][7], heroJointPositionsByHero[a][8], 6, .1, .1);
            }
            if (0 < (heroTileContactFlags[a] & 1)) {
                heroPoseAgeFrames[a] = 0;
            }
            for (b = heroTileContactFlags[a] = 0; 11 > b; b++) moveJointWithCollisions(a, b);
            heroPoseTrailWriteIdxByHero[a] = heroPoseTrailWriteIdxByHero[a] + 1 & 15;
            heroJoint5HistoryByHero[a][heroPoseTrailWriteIdxByHero[a]].set(heroJointPositionsByHero[a][5]);
            heroJoint3HistoryByHero[a][heroPoseTrailWriteIdxByHero[a]].set(heroJointPositionsByHero[a][3]);
            heroJoint6HistoryByHero[a][heroPoseTrailWriteIdxByHero[a]].set(heroJointPositionsByHero[a][6]);
            heroJoint4HistoryByHero[a][heroPoseTrailWriteIdxByHero[a]].set(heroJointPositionsByHero[a][4]);
            if (0 < heroAttackTrailTimerByHero[a]) {
                heroAttackTrailTimerByHero[a]--;
                b = itemList[partyEquipmentTable[a][attackWeaponSlotIdx[a]]][itemAppearanceCol];
                if (2 != b) {
                    heroAttackTrailTimerByHero[a] = 0;
                }
            }
            if (0 == heroAttackCooldownFrames[a]) {
                f.set(heroJointPositionsByHero[a][1]);
                f.x += 0 == heroBodyDrawStateByHero[a][2] ? -50 : 50;
                Vec2Scale(f, .1);
                Vec2Scale(heroAimPosByHero[a], .9);
                heroAimPosByHero[a].add(f);
            }
            if (0 < heroAttackLineTimer[a]) {
                heroAttackLineTimer[a]--;
            }
            if (heroTileContactFlags[a] & 2) {
                if (0 == heroTileEffectLatch[a])
                    for (heroTileEffectLatch[a] = 1, b = 0; 11 > b; b++) {
                        d = clamp(heroJointPositionsByHero[a][b].x, 0, 8 * stageWidth - 1) >> 3;
                        c = clamp(heroJointPositionsByHero[a][b].y, 0, 8 * stageHeight - 1) >> 3;
                        if (30 == stageTileData[c][d]) {
                            spawnProjectile(a, -1, heroJointPositionsByHero[a][b].x, heroJointPositionsByHero[a][b].y, 0, -.8, 0, 29, 4284900966, 2, 16, 16, 0, 0, 0, 0, 1E3, 30, 20, 0, 1, 90, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                        }
                    }
                d = clamp(heroJointPositionsByHero[a][0].x, 0, 8 * stageWidth - 1) >> 3;
                c = clamp(heroJointPositionsByHero[a][0].y, 0, 8 * stageHeight - 1) >> 3;
                if (31 == stageTileData[c][d]) {
                    if (1 > randFloat(50)) {
                        b = randFloatRange(-1, 2);
                        spawnProjectile(a, -1, heroJointPositionsByHero[a][0].x + b, heroJointPositionsByHero[a][0].y, 0, 0, 0, 2, 4281545523, 2, 8, 8, 0, 0, 0, 0, 1E3, 50, 5, 0, -1, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                    }
                }
            } else heroTileEffectLatch[a] = 0;
            if (5 == currentStage) {
                if (heroTileContactFlags[a] & 1) {
                    stageConditionMask |= 1;
                }
            }
            if (5 == currentStage) {
                if (heroTileContactFlags[a] & 2) {
                    stageConditionMask |= 2;
                }
            }
            if (16 == currentStage) {
                if (heroTileContactFlags[a] & 1) {
                    stageConditionMask |= 1;
                }
            }
            if (16 == currentStage) {
                if (heroTileContactFlags[a] & 2) {
                    stageConditionMask |= 2;
                }
            }
            if (18 == currentStage) {
                if (heroTileContactFlags[a] & 1) {
                    stageConditionMask |= 1;
                }
            }
            if (18 == currentStage) {
                if (heroTileContactFlags[a] & 2) {
                    stageConditionMask |= 2;
                }
            }
        }
    }
}



function drawPlayerParty() {
    var a, b, c, d, f, g, h = new Vec2(),
        k = new Vec2();
    for (a = 0; a < partyMemberCount; a++) {
        d = 15908203;
        f = 16777215;
        if (0 < heroStatusTintTimer[a]) {
            d = 1989840;
            f = 5934817;
        } else {
            if (0 < heroSkipTimer[a]) {
                d = 9840;
                f = 1989840;
            } else {
                if (0 < heroTimedDamageTimer[a]) {
                    d = 3381504;
                    f = 3407616;
                }
            }
        }
        if (0 < heroHitFlashTimer[a]) {
            heroHitFlashTimer[a]--;
            f = 16711680;
        }
        spriteAltRenderFlag = isSolidRender = 1;
        for (c = 0; 11 > c; c++) drawSpriteSheetPartCentered(effectSpriteSheet, floor(heroJointPositionsByHero[a][c].x), floor(heroJointPositionsByHero[a][c].y), 16, 16, 0, 0, 16, 16, 1073741824);
        isSolidRender = spriteAltRenderFlag = 0;
        drawHero(a, heroJointPositionsByHero[a], heroBodyDrawStateByHero[a][0], heroBodyDrawStateByHero[a][1], d, f, heroUpperJointMode[a]);
        if (0 < heroAttackTrailTimerByHero[a]) {
            b = partyEquipmentTable[a][attackWeaponSlotIdx[a]];
            c = itemList[b][projectileSpeedScaleCol];
            d = itemList[b][projectileDelayRangeCol];
            f = d >> 24 & 255;
            var p = itemList[b][projectileNoDamageFramesCol];
            d &= 16777215;
            for (b = 0; 10 > b; b++) {
                var t, l, n;
                t = heroAttackTrailHistorySets[0 + attackTrailSideIdx[a]];
                g = heroAttackTrailHistorySets[2 + attackTrailSideIdx[a]];
                l = heroPoseTrailWriteIdxByHero[a] - b - 0 & 15;
                n = heroPoseTrailWriteIdxByHero[a] -
                    b - 1 & 15;
                h.x = t[a][l].x - g[a][l].x;
                h.y = t[a][l].y - g[a][l].y;
                Vec2Norm(h);
                Vec2Scale(h, c);
                k.x = t[a][n].x - g[a][n].x;
                k.y = t[a][n].y - g[a][n].y;
                Vec2Norm(k);
                Vec2Scale(k, c);
                g = floor(f * (12 - b) / 12);
                isSolidRender = p;
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
                    scanlineMinX[l] = 640;
                    scanlineMaxX[l] = -1;
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
                    for (0 > scanlineMinX[l] && (scanlineMinX[l] = 0), 640 <= scanlineMaxX[l] && (scanlineMaxX[l] = 639), U = 640 * l + scanlineMinX[l], y = U + (scanlineMaxX[l] - scanlineMinX[l]), x = 640 * l + scanlineMinX[l + 1], K = x + (scanlineMaxX[l + 1] - scanlineMinX[l + 1]), U < x && (U = x), y >= K && (y = min(y - 1, K)); U <= y; U++)
                        if (0 == isSolidRender) {
                            frameBufferArray[U] = t;
                        } else {
                            if (1 == isSolidRender) {
                                x = frameBufferArray[U] >> 16 & 255;
                                x = ((B - x) * w >> 8) + x;
                                K = frameBufferArray[U] >> 8 & 255;
                                K = ((M - K) * w >> 8) + K;
                                ba = frameBufferArray[U] & 255;
                                ba = ((J - ba) * w >> 8) + ba;
                                frameBufferArray[U] = x << 16 | K << 8 | ba;
                            } else {
                                if (2 == isSolidRender) {
                                    x = (frameBufferArray[U] >>
                                        16 & 255) + (B * w >> 8);
                                    if (255 < x) {
                                        x = 255;
                                    }
                                    K = (frameBufferArray[U] >> 8 & 255) + (M * w >> 8);
                                    if (255 < K) {
                                        K = 255;
                                    }
                                    ba = (frameBufferArray[U] & 255) + (J * w >> 8);
                                    if (255 < ba) {
                                        ba = 255;
                                    }
                                    frameBufferArray[U] = x << 16 | K << 8 | ba;
                                }
                            }
                        }
                isSolidRender = 0;
            }
        }
        if (0 < levelUpPopupTimer) {
            d = ~~heroJointPositionsByHero[a][0].x + 0;
            f = ~~heroJointPositionsByHero[a][0].y - 7;
            if (5 > levelUpPopupTimer) {
                g = floor(255 * levelUpPopupTimer / 5);
            } else {
                g = 255;
            }
            c = min(60 - levelUpPopupTimer - 0, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d - 16, f - 2 * c, "L", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
            c = min(60 - levelUpPopupTimer - 3, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d - 12, f - 2 * c, "E", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
            c = min(60 - levelUpPopupTimer - 6, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d - 8, f - 2 * c, "V", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
            c = min(60 - levelUpPopupTimer - 9, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d - 4, f - 2 * c, "E", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
            c = min(60 - levelUpPopupTimer - 12, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d + 0, f - 2 * c, "L", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
            c = min(60 - levelUpPopupTimer - 15, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d + 8, f - 2 * c, "U", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
            c = min(60 - levelUpPopupTimer - 18, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d + 12, f - 2 * c, "P", 255, 255, 34, g, 34, 34, 0, g, 5, 7);
            }
        }
        if (
            0 < stageClearPopupTimer) {
            d = ~~heroJointPositionsByHero[a][0].x + 0 - 2;
            f = ~~heroJointPositionsByHero[a][0].y - 7;
            if (5 > stageClearPopupTimer) {
                g = floor(255 * stageClearPopupTimer / 5);
            } else {
                g = 255;
            }
            c = min(60 - stageClearPopupTimer - 0, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d - 8, f - 2 * c, "C", 255, 255, 255, g, 34, 34, 34, g, 5, 7);
            }
            c = min(60 - stageClearPopupTimer - 3, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d - 4, f - 2 * c, "L", 255, 255, 255, g, 34, 34, 34, g, 5, 7);
            }
            c = min(60 - stageClearPopupTimer - 6, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d + 0, f - 2 * c, "E", 255, 255, 255, g, 34, 34, 34, g, 5, 7);
            }
            c = min(60 - stageClearPopupTimer - 9, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d + 4, f -
                    2 * c, "A", 255, 255, 255, g, 34, 34, 34, g, 5, 7);
            }
            c = min(60 - stageClearPopupTimer - 12, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d + 8, f - 2 * c, "R", 255, 255, 255, g, 34, 34, 34, g, 5, 7);
            }
            c = min(60 - stageClearPopupTimer - 15, 4);
            if (0 < c) {
                gameFontSmall.b = -1;
                drawScaledTintedTextCentered(gameFontSmall, d + 2, f - 2 * c + 9, "+" + stageClearBaseGoldPerHero, 255, 255, 255, g, 34, 34, 34, g, 5, 7);
            }
        }
        if (0 < comboPopupTimer) {
            d = ~~heroJointPositionsByHero[a][0].x + 0 - 2;
            f = ~~heroJointPositionsByHero[a][0].y - 7;
            if (5 > comboPopupTimer) {
                g = floor(255 * comboPopupTimer / 5);
            } else {
                g = 255;
            }
            c = min(60 - comboPopupTimer - 0, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d - 8, f - 2 * c, "C", 255, 128, 0, g, 48, 24, 0, g, 5, 7);
            }
            c = min(60 - comboPopupTimer - 3, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d - 4, f - 2 * c, "O", 255, 128, 0, g, 48, 24, 0, g, 5, 7);
            }
            c = min(60 - comboPopupTimer - 6, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d + 0, f - 2 * c, "M", 255, 128, 0, g, 48, 24, 0, g, 5, 7);
            }
            c = min(60 - comboPopupTimer - 9, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d + 4, f -
                    2 * c, "B", 255, 128, 0, g, 48, 24, 0, g, 5, 7);
            }
            c = min(60 - comboPopupTimer - 12, 4);
            if (0 < c) {
                drawScaledTintedText(gameFontSmall, d + 8, f - 2 * c, "O", 255, 128, 0, g, 48, 24, 0, g, 5, 7);
            }
            c = min(60 - comboPopupTimer - 15, 4);
            if (0 < c) {
                gameFontSmall.b = -1;
                drawScaledTintedTextCentered(gameFontSmall, d + 2, f - 2 * c + 9, "+" + comboGoldPayoutPerHero, 255, 128, 0, g, 48, 24, 0, g, 5, 7);
            }
        }
    }
    if (0 < levelUpPopupTimer) {
        levelUpPopupTimer--;
    } else {
        if (0 < stageClearPopupTimer) {
            stageClearPopupTimer--;
        } else {
            if (0 < comboPopupTimer) {
                comboPopupTimer--;
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
function drawHero(heroIdx, joints, c, d, headColor, bodyColor, noUpperJoints) {
    //*
    // torso
    drawLine(joints[1].x, joints[1].y, joints[2].x, joints[2].y, bodyColor);

    // upper arms
    if (noUpperJoints != areUpperJointsDisabled) {
        drawLine(joints[1].x, joints[1].y, joints[3].x, joints[3].y, bodyColor);
        drawLine(joints[1].x, joints[1].y, joints[4].x, joints[4].y, bodyColor);
    }

    // lower arms
    drawLine(joints[3].x, joints[3].y, joints[5].x, joints[5].y, bodyColor);
    drawLine(joints[4].x, joints[4].y, joints[6].x, joints[6].y, bodyColor);

    // upper legs
    if (noUpperJoints != areUpperJointsDisabled) {
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
    let headwearType = itemList[partyEquipmentTable[heroIdx][2]][itemHeadwearType]; // headwear type
    if (headwearType != 0) {
        if (heroBodyDrawStateByHero[heroIdx][2] == 0)
            drawSpriteSheetPartTintedScaled(
                itemsSpriteSheet,
                ~~joints[0].x - 8, ~~joints[0].y - 8,
                16, 16,
                16 * (headwearType & 15) + 0, 16 * (headwearType >> 4),
                16, 16,
                itemList[partyEquipmentTable[heroIdx][2]][itemSpriteSourceXCol], itemList[partyEquipmentTable[heroIdx][2]][itemSpriteLocYCol],
                false
            );
        else

            drawSpriteSheetPartTintedScaled(
                itemsSpriteSheet,
                ~~joints[0].x - 8, ~~joints[0].y - 8,
                16, 16,
                16 * (headwearType & 15) + 16, 16 * (headwearType >> 4),
                -16, 16,
                itemList[partyEquipmentTable[heroIdx][2]][itemSpriteSourceXCol], itemList[partyEquipmentTable[heroIdx][2]][itemSpriteLocYCol],
                false
            );
    }

    var baseDrawPos = new Vec2();

    for (let toolIdx = 0; toolIdx < 2; toolIdx++) {
        let p = partyEquipmentTable[heroIdx][toolIdx ? d : c];
        let appearanceType = itemList[p][itemAppearanceCol];
        p = itemList[p][itemSpriteSourceXCol];
        let t = joints[5 + toolIdx];
        let l = joints[3 + toolIdx];

        switch (appearanceType) {
            case 1:
                drawRectCentered(t.x, t.y, 3, 3, p);
                break;
            case 2:
                Vec2Sub(baseDrawPos, t, l);
                Vec2Norm(baseDrawPos);
                if (noUpperJoints == 2) {
                    drawLine(l.x + 2 * baseDrawPos.x, l.y + 2 * baseDrawPos.y, l.x + 7 * baseDrawPos.x, l.y + 7 * baseDrawPos.y, p);
                } else {
                    drawLine(l.x + 2 * baseDrawPos.x, l.y + 2 * baseDrawPos.y, l.x + 10 * baseDrawPos.x, l.y + 10 * baseDrawPos.y, p);
                }
                Vec2Rotate(baseDrawPos);
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
                    Vec2Sub(baseDrawPos, heroAimPosByHero[heroIdx], t);
                    Vec2Norm(baseDrawPos);
                    if (0 < heroAttackLineTimer[heroIdx] && attackTrailSideIdx[heroIdx] == toolIdx) {
                        drawLine(t.x - 5 * baseDrawPos.x, t.y - 5 * baseDrawPos.y, heroAimPosByHero[heroIdx].x, heroAimPosByHero[heroIdx].y, p);
                    } else {
                        drawLine(t.x - 5 * baseDrawPos.x, t.y - 5 * baseDrawPos.y, t.x + 20 * baseDrawPos.x, t.y + 20 * baseDrawPos.y, p);
                    }
                }
                break;
            case 4:
                Vec2Sub(baseDrawPos, t, l);
                Vec2Norm(baseDrawPos);
                if (2 == noUpperJoints) {
                    drawLine(l.x, l.y, l.x + 4 * baseDrawPos.x, l.y + 4 * baseDrawPos.y, p);
                } else {
                    drawLine(l.x, l.y, l.x + 8 * baseDrawPos.x, l.y + 8 * baseDrawPos.y, p);
                }
                drawLine(t.x, t.y, t.x - 2 * baseDrawPos.x + 4 * baseDrawPos.y, t.y - 2 * baseDrawPos.y - 4 * baseDrawPos.x, 8421504);
                drawLine(t.x, t.y, t.x - 2 * baseDrawPos.x - 4 * baseDrawPos.y, t.y - 2 * baseDrawPos.y + 4 * baseDrawPos.x, 8421504);
                break;
            case 5:
                isSolidRender = 2;
                spriteAltRenderFlag = 1;
                drawSpriteSheetPartCentered(effectSpriteSheet, t.x, t.y, 16, 16, 0, 0, 16, 16, 3422552064 | p);
                isSolidRender = spriteAltRenderFlag = 0;
                break;

        }
    }
}
const stageCount = 32,
    stageListArray = Array(stageCount);
let ENUM_STAGE_PROPS_COUNT = 0;
const stageNameCol = ENUM_STAGE_PROPS_COUNT++,
    stageTilesetIdxCol = ENUM_STAGE_PROPS_COUNT++,
    stageUIBgColorCol = ENUM_STAGE_PROPS_COUNT++,
    stageReturnCost = ENUM_STAGE_PROPS_COUNT++, // stageAttr3, gold cost to return/warp to the village
    stageExitTopIdx = ENUM_STAGE_PROPS_COUNT++, // stageAttr4, stage index to go to when exiting off the top edge
    stageExitBottomIdx = ENUM_STAGE_PROPS_COUNT++, // stageAttr5, stage index to go to when exiting off the bottom edge
    stageExitLeftIdx = ENUM_STAGE_PROPS_COUNT++, // stageAttr6, stage index to go to when exiting off the left edge
    stageExitRightIdx = ENUM_STAGE_PROPS_COUNT++, // stageAttr7, stage index to go to when exiting off the right edge
    stageSpawnChance = ENUM_STAGE_PROPS_COUNT++, // stageAttr8, stage spawn chance/intensity (higher -> more frequent ambient spawns)
    stageSpawnGroupsStartIdx = ENUM_STAGE_PROPS_COUNT++; // stageAttr9, index where this row's spawn-group definitions begin (groups of 7 values)

stageListArray[0] = ["", 0, 13407305, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
stageListArray[1] = ["Village", 0, 13407305, 0, 0, 0, 0, 2, 10, 0, 0, 0, 0, 0, 0, 0];
stageListArray[2] = ["Cave 1", 0, 13407305, 1, 0, 0, 1, 3, 10, 0, 5, 10, 11, 40, 63, 41, 0, 5, 10, 5, 34, 45, 34, 1, 2, 0, 5, 34, 45, 34, 1, 8, 30, 8, 26, 46, 26, 2, 3, 5, 50, 22, 60, 22, 2, 5, 10, 32, 8, 74, 9, 3, 1, 1, 4, 13, 11, 13, 5, 15, 30, 50, 25, 62, 28];
stageListArray[3] = ["Cave 2", 0, 13407305, 2, 0, 0, 2, 4, 10, 4, 3, 0, 11, 14, 22, 14, 8, 1, 0, 11, 30, 11, 30, 15, 0, 0, 16, 41, 16, 41, 6, 1, 0, 45, 7, 45, 7, 7, 8, 15, 34, 15, 59, 16, 9, 6, 30, 26, 25, 61, 27, 12, 10, 20, 36, 41, 74, 41, 13, 3, 5, 42, 41, 54, 41, 14, 3, 10, 43, 36, 45, 36, 14, 2, 10, 52, 36, 59, 36];
stageListArray[4] = ["Cave 3", 0, 13407305, 3, 0, 0, 3, 5, 10, 5, 0, 0, 56, 33, 75, 37, 16, 0, 0, 65, 35, 65, 35, 12, 3, 15, 9, 8, 28, 8, 10, 8, 0, 31, 28, 73, 28, 11, 1, 3, 31, 28, 73, 28, 13, 3, 15, 9, 39, 27, 39, 17, 10, 20, 39, 13, 76, 14];
stageListArray[5] = ["Cave 4", 0, 13407305, 4, 0, 0, 4, 6, 10, 22, 1, 1, 17, 17, 17, 17, 21, 20, 20, 4, 9, 44, 24, 18, 1, 0, 14, 41, 19, 41, 19, 10, 0, 33, 31, 48, 31, 20, 4, 8, 60, 24, 74, 24, 20, 2, 4, 60, 4, 74, 4];
stageListArray[6] = ["Central cavity", 0, 13407305, 0, 7, 0, 5, 13, 10, 0, 0, 0, 0, 0, 0, 0];
stageListArray[7] = ["Terraced cave", 0, 13407305, 5, 0, 6, 8, 0, 10, 23, 10, 30, 5, 32, 6, 32, 24, 0, 0, 66, 42, 66, 42, 27, 1, 0, 47, 20, 47, 20, 25, 5, 10, 7, 18, 24, 18, 26, 1, 3, 33, 21, 33, 21, 26, 1, 3, 35, 20, 35, 20, 26, 1, 3, 37, 19, 37, 19, 26, 1, 3, 39, 18, 39, 18, 26, 1, 3, 41, 17, 41, 17, 28, 1, 0, 62, 21, 72, 21];
stageListArray[8] = ["Sky garden", 1, 12290116, 6, 0, 5, 9, 7, 10, 29, 15, 99, 35, 17, 75, 35, 30, 2, 5, 35, 17, 75, 35, 31, 1, 0, 35, 17, 75, 35, 32, 1, 0, 3, 21, 18, 25, 33, 1, 0, 10, 36, 10, 36];
stageListArray[9] = ["Sky garden 2", 1, 12290116, 7, 0, 4, 10, 8, 10, 34, 1, 0, 28, 8, 33, 8, 35, 2, 0, 69, 13, 74, 14, 35, 1, 0, 75, 21, 75, 23, 36, 1, 0, 40, 40, 40, 40];
stageListArray[10] = ["Sky garden 3", 1, 12290116, 8, 0, 3, 11, 9, 10, 37, 25, 0, 32, 33, 64, 33, 38, 1, 0, 6, 40, 6, 40, 39, 40, 80, 7, 20, 55, 20, 40, 1, 0, 15, 7, 15, 7];
stageListArray[11] = ["Upper cave", 1, 12290116, 9, 0, 0, 12, 10, 10, 42, 8, 40, 20, 30, 70, 30, 43, 3, 0, 9, 41, 14, 41, 44, 30, 40, 37, 34, 60, 40, 45, 1, 0, 14, 11, 14, 11, 46, 1, 0, 72, 14, 72, 14];
stageListArray[12] = ["Terrace", 1, 12290116, 0, 0, 1, 0, 11, 10, 0, 0, 0, 0, 0, 0, 0];
stageListArray[13] = ["Limestone cave 1", 2, 8686715, 10, 14, 0, 6, 16, 50, 47, 30, 90, 20, 30, 54, 41, 48, 15, 45, 24, 16, 40, 21, 49, 20, 60, 22, 10, 40, 10, 50, 1, 0, 46, 41, 46, 41, 51, 1, 0, 9, 15, 13, 15, 52, 1, 0, 67, 42, 67, 42];
stageListArray[14] = ["Limestone cave 2", 2, 8686715, 11, 0, 13, 0, 15, 50, 53, 5, 50, 52, 38, 74, 40, 54, 3, 0, 12, 25, 32, 35, 55, 50, 0, 9, 7, 75, 7, 56, 1, 0, 4, 9, 4, 9, 57, 1, 0, 12, 38, 12, 38, 58, 1, 0, 67, 21, 67, 21];
stageListArray[15] = ["Limestone cave 3", 2, 8686715, 12, 0, 16, 14, 0, 50, 59, 50, 150, 15, 1, 64, 17, 60, 1, 0, 54, 24, 57, 24, 61, 10, 0, 21, 26, 40, 33, 62, 5, 0, 9, 24, 11, 24, 63, 1, 0, 65, 42, 65, 42, 64, 1, 0, 65, 11, 65, 11];
stageListArray[16] = ["Limestone cave 4", 2, 8686715, 13, 15, 0, 13, 17, 50, 65, 5, 0, 63, 3, 76, 5, 65, 5, 0, 63, 11, 76, 13, 66, 5, 0, 62, 7, 75, 9, 66, 5, 0, 62, 15, 75, 17, 67, 1, 0, 63, 3, 76, 5, 67, 1, 0, 63, 11, 76, 13, 67, 1, 0, 62, 7, 75, 9, 67, 1, 0, 62, 15, 75, 17, 68, 30, 60, 5, 42, 69, 42, 69, 1, 0, 73, 41, 73, 41, 70, 1, 0, 30, 14, 31, 14];
stageListArray[17] = ["Limestone cave 5", 2, 8686715, 14, 18, 0, 16, 0, 50, 71, 60, 0, 13, 24, 67, 24, 72, 1, 3, 20, 35, 20, 35, 72, 1, 3, 32, 35, 32, 35, 72, 1, 3, 44, 35, 44, 35, 73, 30, 150, 12, 26, 53, 31, 74, 5, 0, 29, 18, 65, 18, 75, 1, 0, 29, 18, 65, 18, 76, 3, 0, 5, 16, 10, 16];
stageListArray[18] = ["Limestone cave 6", 2, 8686715, 15, 19, 17, 0, 0, 50, 77, 1, 3, 29, 42, 29, 42, 77, 1, 3, 44, 42, 44, 42, 77, 1, 3, 59, 42, 59, 42, 78, 2, 0, 7, 34, 15, 34, 78, 1, 0, 7, 18, 14, 18, 79, 20, 80, 4, 26, 17, 26, 80, 1, 0, 39, 4, 53, 8, 81, 99, 99, 23, 14, 67, 28, 82, 1, 0, 47, 20, 47, 20];
stageListArray[19] = ["Limestone cave 7", 2, 8686715, 16, 0, 18, 20, 0, 50, 84, 20, 0, 10, 36, 18, 36, 84, 10, 0, 29, 38, 34, 38, 85, 1, 0, 63, 28, 63, 28, 85, 1, 0, 13, 25, 13, 25];
stageListArray[20] = ["Limestone cave 8", 2, 8686715, 17, 0, 15, 0, 19, 50, 0, 0, 0, 0, 0, 0, 0];
let isStageReachedArray = Array(stageCount);
for (let _i = 0; _i < stageCount; _i++) isStageReachedArray[_i] = 0;
let stageIndexOrder = [2, 3, 4, 5, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19],
    /** array of lists of enemy ids indexed by stage number */
    bestiaryPageItems = [
        [0, 1, 2, 5, 3],
        [4, 7, 6, 9, 8, 14, 15],
        [12, 13, 10, 11, 17, 16],
        [18, 19, 20, 21, 22],
        [23, 24, 25, 26, 27, 28],
        [29, 30, 31, 32, 33],
        [34, 35, 36],
        [37, 38, 39, 40, 41],
        [42, 43, 44, 45, 46],
        [47, 48, 49, 50, 51, 52],
        [53, 54, 55, 56, 57, 58],
        [59, 60, 61, 62, 63, 64],
        [65, 66, 67, 68, 69, 70],
        [71, 72, 73, 74, 75, 76],
        [77, 78, 79, 80, 81, 82, 83],
        [84, 85, 86, 87, 88, 89],
        []
    ],
    stageWidth = 80, // Gi
    stageHeight = 60, // si
    stageTileData = Array(stageHeight); // P
for (let i = 0; i < stageHeight; i++) stageTileData[i] = Array(stageWidth);
let loadedLevelIndex = -1,
    lastStageIdx = 0, // Mg
    lastClearedStageIdx = 0, // Ng, last cleared stage index (stage just completed before returning)
    partySpawnXByHero = [0, 0, 0, 0], // per-hero spawn Y (tile/row) positions used when placing party members on stage
    partySpawnYByHero = [0, 0, 0, 0], // per-hero spawn X (tile/column) positions used when placing party members on stage
    activeSpawnCountByGroup = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // V[group], active spawn counts per spawn-group (number of currently active enemies)
    totalSpawnedCountByGroup = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Xi[group], cumulative spawned count per spawn-group (used to cap spawns and compute stage-clear payouts)
    stageClearBaseGoldPerHero = 0; // Mi, per-hero stage-clear gold payout (base amount computed from spawned enemies)


function loadLevelData(a) {
    if (loadedLevelIndex != a) {
        loadedLevelIndex = a;
        currentLevelSprite = new Sprite;
        currentLevelSprite.f("m" + a + ".png");
    }
    loadSprite(currentLevelSprite); // check if loaded sprite is valid
    if (uncheckedSpriteCount) return false;
    lastStageIdx = currentStage;
    isStageReachedArray[currentStage] = 1;
    stageHeight = currentLevelSprite.i;
    let d = 0;
    let spriteData = currentLevelSprite.g;
    for (let b = 0; b < stageHeight; b++) {
        for (let a = 0; a < stageWidth; a++, d++) {
            let pu = (b > 0) ? (d - stageWidth) : d; // up
            let pd = (b == stageHeight - 1) ? d : d + stageWidth; // down
            let pl = (a > 0) ? d - 1 : d; // left 
            let pr = (a == stageWidth - 1) ? d : d + 1; // right

            stageTileData[b][a] = 64; // default
            const _isPixelSolid = (i) => {
                let _a, _b, _c;
                _a = spriteData[i] >> 16 & 255;
                _b = spriteData[i] >> 8 & 255;
                _c = spriteData[i] & 255;
                return (_a == _c && _b == _c && _c) ? 1 : 0;
            };

            if (0xffffff == spriteData[d]) { 
                let k0 = _isPixelSolid(pu);
                let k1 = _isPixelSolid(pd);
                let k2 = _isPixelSolid(pl);
                let k3 = _isPixelSolid(pr);
                
                k0 || !k1 || k2 || !k3 
                ? k0 || !k1 || !k2 || !k3 
                ? k0 || !k1 || !k2 || k3 
                ? !k0 || !k1 || k2 || !k3 
                ? k0 && k1 && k2 && k3 
                ? stageTileData[b][a] = 9 
                : !k0 || !k1 || !k2 || k3 
                ? !k0 || k1 || k2 || !k3 
                ? !k0 || k1 || !k2 || !k3 
                ? !k0 || k1 || !k2 || k3 
                ? k0 || k1 || k2 || k3 
                ? k0 || !k1 || k2 || k3 
                ? !k0 || k1 || k2 || k3 
                ? k0 || k1 || k2 || !k3 
                ? k0 || k1 || !k2 || k3 
                ? k0 || k1 || !k2 || !k3 
                ? !k0 || !k1 || k2 || k3 || (stageTileData[b][a] = 19) 
                : stageTileData[b][a] = 11
                : stageTileData[b][a] = 7 
                : stageTileData[b][a] = 6 
                : stageTileData[b][a] = 5 
                : stageTileData[b][a] = 4 
                : stageTileData[b][a] = 3 
                : stageTileData[b][a] = 18 
                : stageTileData[b][a] = 17 
                : stageTileData[b][a] = 16 
                : stageTileData[b][a] = 10 
                : stageTileData[b][a] = 8 
                : stageTileData[b][a] = 2 
                : stageTileData[b][a] = 1 
                : stageTileData[b][a] = 0
            } else {
                (12303291 == spriteData[d]) 
                ? stageTileData[b][a] = 12 
                : 11184810 == spriteData[d] 
                ? stageTileData[b][a] = 13 
                : 10066329 == spriteData[d] 
                ? stageTileData[b][a] = 14 
                : 6684774 == spriteData[d] 
                ? stageTileData[b][a] = 20 
                : 6697728 == spriteData[d] 
                ? stageTileData[b][a] = 24 
                : 10053171 == spriteData[d] 
                ? stageTileData[b][a] = 25 
                : 13408614 == spriteData[d] 
                ? stageTileData[b][a] = 26 
                : 16764057 == spriteData[d] && 0 == spriteData[pl] 
                ? stageTileData[b][a] = 27 
                : 16764057 == spriteData[d] && 21913 == spriteData[pl] 
                ? stageTileData[b][a] = 29 
                : 16764057 == spriteData[d] && 0 != spriteData[pl] 
                ? stageTileData[b][a] = 28 
                : 21913 == spriteData[d] && 0 == spriteData[pu] 
                ? stageTileData[b][a] = 30 
                : 21913 == spriteData[d] && 0 != spriteData[pu] 
                ? stageTileData[b][a] = 31 
                : 3355392 == spriteData[d] 
                ? stageTileData[b][a] = 32 
                : 6710835 == spriteData[d] 
                ? stageTileData[b][a] = 33 
                : 10066278 == spriteData[d] 
                ? stageTileData[b][a] = 34 
                : 13421721 == spriteData[d] 
                ? stageTileData[b][a] = 35 
                : 10053120 == spriteData[d] && 10053120 == spriteData[pd] 
                ? stageTileData[b][a] = 36 
                : 16724736 == spriteData[d] && 16724736 != spriteData[pu] 
                ? stageTileData[b][a] = 37 
                : 3355494 == spriteData[d] && 3355494 != spriteData[pu] 
                ? stageTileData[b][a] = 38 
                : 16776960 == spriteData[d] 
                ? stageTileData[b][a] = 39 
                : 3368448 == spriteData[d] 
                ? stageTileData[b][a] = 40 
                : 6723891 == spriteData[d] 
                ? stageTileData[b][a] = 41 
                : 10079334 == spriteData[d] 
                ? stageTileData[b][a] = 42 
                : 10053120 == spriteData[d] && 10053120 != spriteData[pd] 
                ? stageTileData[b][a] = 44 
                : 16724736 == spriteData[d] && 16724736 == spriteData[pu] 
                ? stageTileData[b][a] = 45 
                : 3355494 == spriteData[d] && 3355494 == spriteData[pu] 
                ? stageTileData[b][a] = 46 
                : 6710784 == spriteData[d] 
                ? stageTileData[b][a] = 47 
                : 16724940 == spriteData[d] 
                ? stageTileData[b][a] = 48 
                : 13056 == spriteData[d] 
                ? stageTileData[b][a] = 49 
                : 51 == spriteData[d] 
                ? stageTileData[b][a] = 50 
                : 10040064 == spriteData[d] 
                ? stageTileData[b][a] = 51 
                : 10066431 == spriteData[d] && 10066431 == spriteData[pd] 
                ? stageTileData[b][a] = 52 
                : 16737792 == spriteData[d] && 16737792 != spriteData[pu] 
                ? stageTileData[b][a] = 53 
                : 16763904 == spriteData[d] 
                ? stageTileData[b][a] = 55 
                : 10066431 == spriteData[d] && 10066431 == spriteData[pu] 
                ? stageTileData[b][a] = 60 
                : 16737792 == spriteData[d] && 16737792 == spriteData[pu] && (stageTileData[b][a] = 61)
            }
        }
    }

    for (let a = 0; 4 > a; a++) heroEmitCooldown[a] = 0;
    resetDragSelection();
    for (let a = 0; 4 > a; a++) resetHeroPose(a, partySpawnXByHero[a], partySpawnYByHero[a]);
    for (let a = 0; 20 > a; a++) {
        activeSpawnCountByGroup[a] = 0;
        totalSpawnedCountByGroup[a] = 0;
    }
    stageClearBaseGoldPerHero = 0;
    clearEnemies();
    for (let a = stageSpawnGroupsStartIdx; a < stageListArray[currentStage].length; a += 7) {
        let c = stageListArray[currentStage][a + 0];
        let d = stageListArray[currentStage][a + 1];
        let k = stageListArray[currentStage][a + 3];
        let f = stageListArray[currentStage][a + 4];
        let p = stageListArray[currentStage][a + 5];
        let t = stageListArray[currentStage][a + 6];
        for (let b = 0; b < d; b++) {
            let h = randIntRange(k, p + 1);
            let g = randIntRange(f, t + 1);

            if (stageTileData[g][h] > 25) {
                spawnEnemy(h, g, c, (a - stageSpawnGroupsStartIdx) / 7);
                activeSpawnCountByGroup[(a - stageSpawnGroupsStartIdx) / 7]++;
                totalSpawnedCountByGroup[(a - stageSpawnGroupsStartIdx) / 7]++;
            };
        }
        let b = enemyCatalog[c][enemyLevelCol];
        if (stageMaxEnemyLevel < b) stageMaxEnemyLevel = b;
    }
    popupCount = projectileCount = 0;
    clearDrops();
    initStageState();
    return true
}


function getStageTileAt(x, y) { // ri
    x = clamp(x, 0, 8 * stageWidth - 1) >> 3; // divide by 8
    y = clamp(y, 0, 8 * stageHeight - 1) >> 3;
    return stageTileData[y][x]
}


function fillStageTilesRect(_tx0, _ty0, _tx1, _ty1, _tid) { // dj
    let _row;
    for (_row = _ty0; _row <= _ty1; _row++)
        for (_ty0 = _tx0; _ty0 <= _tx1; _ty0++) stageTileData[_row][_ty0] = _tid
}


function updateStageEdgeSpawns() { // wg
    var a;
    if (12 == gameScreenState)
        for (a = 0; a < partyMemberCount; a++)
            if (heroUpperJointMode[a] != areUpperJointsDisabled) {
                var b = heroJointPositionsByHero[a][1].x,
                    c = heroJointPositionsByHero[a][1].y;
                if (4 > b && 0 < stageListArray[currentStage][stageExitLeftIdx]) {
                    lastStageIdx = stageListArray[currentStage][stageExitLeftIdx];
                    for (var d = 0; 4 > d; d++) {
                        partySpawnXByHero[d] = 77;
                        partySpawnYByHero[d] = c >> 3;
                    }
                } else if (636 <= b && 0 < stageListArray[currentStage][stageExitRightIdx])
                    for (lastStageIdx = stageListArray[currentStage][stageExitRightIdx], d = 0; 4 > d; d++) {
                        partySpawnXByHero[d] = 2;
                        partySpawnYByHero[d] = c >> 3;
                    }
                if (4 > c && 0 < stageListArray[currentStage][stageExitTopIdx])
                    for (lastStageIdx = stageListArray[currentStage][stageExitTopIdx], d = 0; 4 > d; d++) {
                        partySpawnXByHero[d] = b >> 3;
                        partySpawnYByHero[d] = 42;
                    } else
                if (356 <= c && 0 < stageListArray[currentStage][stageExitBottomIdx])
                    for (lastStageIdx = stageListArray[currentStage][stageExitBottomIdx], d = 0; 4 > d; d++) {
                        partySpawnXByHero[d] = b >> 3;
                        partySpawnYByHero[d] = 2;
                    }
            } for (a = 0; 20 > a; a++) activeSpawnCountByGroup[a] = 0;
    for (a = 0; a < enemyCount; a++) activeSpawnCountByGroup[enemySpawnGroupIdxArray[a]]++;
    for (b = stageSpawnGroupsStartIdx; b < stageListArray[currentStage].length; b += 7) {
        a = stageListArray[currentStage][b + 0];
        var f = stageListArray[currentStage][b + 1],
            c = stageListArray[currentStage][b + 2],
            g = stageListArray[currentStage][b + 3],
            d = stageListArray[currentStage][b + 4],
            h = stageListArray[currentStage][b + 5],
            k = stageListArray[currentStage][b + 6];
        if (!(c <= totalSpawnedCountByGroup[(b - stageSpawnGroupsStartIdx) / 7])) {
            if (activeSpawnCountByGroup[(b - stageSpawnGroupsStartIdx) / 7] < f) {
                if (1E3 * rand() < stageListArray[currentStage][stageSpawnChance]) {
                    c = randIntRange(g, h + 1);
                    d = randIntRange(d, k + 1);
                    if (!25 >= stageTileData[d][c]) {
                        spawnEnemy(c, d, a, (b - stageSpawnGroupsStartIdx) / 7);
                        activeSpawnCountByGroup[(b - stageSpawnGroupsStartIdx) / 7]++;
                        totalSpawnedCountByGroup[(b - stageSpawnGroupsStartIdx) / 7]++;
                    }
                }
            }
        }


    }
    a = d = 0;
    for (b = stageSpawnGroupsStartIdx; b < stageListArray[currentStage].length; b += 7) {
        a = (b - stageSpawnGroupsStartIdx) / 7;
        c = stageListArray[currentStage][b + 2];
        if (0 != activeSpawnCountByGroup[a] || totalSpawnedCountByGroup[a] < c) {
            d++;
        }
    }
    for (; 20 > a; a++)
        if (0 != activeSpawnCountByGroup[a]) {
            d++;
        }
    if (!d && 0 == stageClearBaseGoldPerHero) {
        for (a = 0; 20 > a; a++) stageClearBaseGoldPerHero += totalSpawnedCountByGroup[a];
        stageClearBaseGoldPerHero = floor((stageClearBaseGoldPerHero + partyMemberCount - 1) / partyMemberCount);
        if (0 < stageClearBaseGoldPerHero) {
            b = 100 + comboMultBonus;
            comboMultBonus += stageClearBaseGoldPerHero;
            stageClearBaseGoldPerHero = floor(stageClearBaseGoldPerHero * b / 100);
            stageClearPopupTimer = 60;
            partyGold = clamp(partyGold + stageClearBaseGoldPerHero * partyMemberCount, 0, 9999999);
            if (isBadgeIncompleteForCurrentStage(0)) {
                IncrementBadgeCount(0);
            }
            if (isBadgeIncompleteForCurrentStage(10)) {
                if (3600 > gameFrameCounter) {
                    IncrementBadgeCount(10);
                }
            }
            if (isBadgeIncompleteForCurrentStage(15)) {
                if (!stageFlagUseCount) {
                    IncrementBadgeCount(15);
                }
            }
            if (isBadgeIncompleteForCurrentStage(20)) {
                if (87 <= comboCount) {
                    IncrementBadgeCount(20);
                }
            }
            if (isBadgeIncompleteForCurrentStage(25)) {
                if (100 <= comboMultBonus) {
                    IncrementBadgeCount(25);
                }
            }
            if (isBadgeIncompleteForCurrentStage(30)) {
                if (111 <= comboCount) {
                    IncrementBadgeCount(30);
                }
            }
            if (isBadgeIncompleteForCurrentStage(35)) {
                if (!stageFlagUseCount) {
                    IncrementBadgeCount(35);
                }
            }
            if (isBadgeIncompleteForCurrentStage(40)) {
                if (3600 > gameFrameCounter) {
                    IncrementBadgeCount(40);
                }
            }
            if (isBadgeIncompleteForCurrentStage(45)) {
                if (7200 > gameFrameCounter) {
                    IncrementBadgeCount(45);
                }
            }
            if (isBadgeIncompleteForCurrentStage(50)) {
                if (!stageFlagUseCount) {
                    IncrementBadgeCount(50);
                }
            }
            if (isBadgeIncompleteForCurrentStage(55)) {
                if (227 <= comboCount) {
                    IncrementBadgeCount(55);
                }
            }
            if (isBadgeIncompleteForCurrentStage(60)) {
                IncrementBadgeCount(60);
            }
            if (isBadgeIncompleteForCurrentStage(65)) {
                if (!stageFlagUseCount) {
                    IncrementBadgeCount(65);
                }
            }
            if (isBadgeIncompleteForCurrentStage(70)) {
                if (9E3 > gameFrameCounter) {
                    IncrementBadgeCount(70);
                }
            }
            if (19 == currentStage) {
                if (0 == stageEventFlags[1]) {
                    stageEventFlags[1] = 1;
                }
            }
            spawnPopup(320, 213, 0, "STAGE CLEAR", 300, 16777215);
            let popupText = floor(gameFrameCounter / 3600) + ":" + floor(gameFrameCounter % 3600 / 60) + "." + gameFrameCounter % 60;
            if (3600 > gameFrameCounter) {
                popupText = floor(gameFrameCounter / 60) + "." + gameFrameCounter % 60;
            }
            spawnPopup(320, 223, 0, popupText, 300, 16777215);
        }
    }
}


function drawGameStage() {
    var a, b, c, d;
    a = stageListArray[currentStage][stageTilesetIdxCol];
    for (c = 0; c < stageHeight; c++)
        for (b = 0; b < stageWidth; b++)
            if (d = stageTileData[c][b], 64 == d) drawRect(8 * b, 8 * c, 8, 8, 0);
            else {
                var f = tilesetSprites[a],
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
                            frameBufferArray[k] = l;
                        }
                    }
            } for (c = 0; c < stageHeight; c++)
        for (b = 1; b < stageWidth - 1; b++)
            if (30 == stageTileData[c][b]) {
                if (30 != stageTileData[c][b - 1]) {
                    fillEmptyPixelsRect(8 * b - 2, 8 * c + 6, 2, 2, 21913);
                }
                if (30 != stageTileData[c][b + 1]) {
                    fillEmptyPixelsRect(8 * b + 8, 8 * c + 6, 2, 2, 21913);
                }
            } else {
                if (31 == stageTileData[c][b]) {
                    if (31 != stageTileData[c][b - 1]) {
                        fillEmptyPixelsRect(8 * b - 2, 8 * c, 2, 8, 21913);
                    }
                    if (31 != stageTileData[c][b + 1]) {
                        fillEmptyPixelsRect(8 * b + 8, 8 * c, 2, 8, 21913);
                    }
                }
            }
    if (1 == currentStage) {
        if (1 == isStageReachedArray[6]) {
            b = 184 + randFloatRange(4, 28);
            c = 192 + randFloatRange(3, 7);
            spawnProjectile(0, -1, b, c, 0, 0, 0, 35, 1080465868, 2, 32, 10, 0, 0, 0, 0, 1E3, 30, 5, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
    } else
    if (6 == currentStage) {
        b = 304 + randFloatRange(4, 28);
        c = 192 + randFloatRange(3, 7);
        spawnProjectile(0, -1, b, c, 0, 0, 0, 35, 1080465868, 2, 32, 10, 0, 0, 0, 0, 1E3, 30, 5, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    } else
    if (14 == currentStage) {
        b = 2 * rotationLUT[gameFrameCounter >> 2 & 511][0];
        c = 2 * rotationLUT[gameFrameCounter >> 2 & 511][1];
        spawnProjectile(-1, -1, 180, 180, b, c, 0, 0, 4294927889, 2, 16, 16, 0, 8, 8, 0, 0, 78, 5, 0, 0, 100, 0, 2, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    } else
    if (17 == currentStage) {
        if (70 == gameFrameCounter % 360) {
            spawnProjectile(-1, -1, 551, 179, -.5, 0, 0, 35, 4279365137, 2, 8, 48, 0, 4, 48, 0, 0, 910, 5, 0, 0, 100, 0, 0, 0, 0, 0, 6, 6, 4, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
    } else
    if (18 == currentStage)
        for (f = [29, 44, 59], g = [35, 34, 33], a = 0; 3 > a; a++) {
            for (h = 0; h < partyMemberCount && !(b = clamp(heroJointPositionsByHero[h][2].x, 0, 8 * stageWidth - 1) >> 3, c = clamp(heroJointPositionsByHero[h][2].y, 0, 8 * stageHeight - 1) >> 3, f[a] - 2 <= b && b <= f[a] + 2 && g[a] <= c && c <= g[a] + 9); h++);
            h == partyMemberCount || gameFrameCounter % 8 || spawnProjectile(-1, -1, 8 * f[a] + 4, 8 * g[a] + 8, 0, 1, 0, 35, 4294967057, 2, 16, 12, 0, 8, 12, 0, 0, 80, 0, 0, 0, 100, 0, 0, 0, 0, 0, 1, 9, 3, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
}
let stage_partyDamageTaken = 0, // Og, accumulated party LP lost this stage (used for badges and payouts).
    stage_totalDamageDealt = 0, // total damage dealt this stage (used for badges/conditions).
    gameFrameCounter = 0, // gj, global frame tick counter (drives time-based events and UI timers).
    consecutiveConditionFrameCount = 0, // hj, consecutive-frame counter for stage condition (used for timed badges/popups).
    stageEncounterCounter = 0, // ij, counter for specific enemy presences/encounters this stage (used for badge triggers).
    stageConditionMask = 0, // Hi, bitmask of stage tile/contact conditions set by heroes (per-stage).
    stageFlagUseCount = 0, // jh, count of stage-flag uses (increments when stage flags are triggered).
    stageEventFlagArray = [0, 0, 0, 0]; // of, array of per-stage event flags (saved/loaded and used for one-off stage events).


function initStageState() { // cj
    stageFlagUseCount = stageConditionMask = stageEncounterCounter = consecutiveConditionFrameCount = gameFrameCounter = stage_totalDamageDealt = stage_partyDamageTaken = 0;
    let a, b, c, d;
    if (17 == currentStage) {
        b = partyGold % 100;
        for (a = 0; a < b;) {
            c = ~~randFloatRange(27, 70);
            d = randFloat(2.1);
            d = 3 + ~~(d * d * d);
            if (32 == stageTileData[d][c]) {
                fillStageTilesRect(c, d, c, d, 39);
                a++;
            }
        }
        if (isBadgeIncompleteForCurrentStage(67)) {
            if (99 == b) {
                IncrementBadgeCount(67);
            }
        }
    } else if (19 == currentStage) {
        let b = [14, 13, 13, 13, 13, 14, 14, 14, 15, 15, 16, 16, 16, 17, 18, 18, 19, 19, 19, 20, 20, 20, 19, 19, 19, 17, 17, 17, 0, 0, 0, 0, 17, 17, 17, 19, 19, 19, 20];
        for (a = 0; 39 > a; a++) {
            if (0 != b[a]) {
                spawnEnemy(19 + a, b[a], 88, 6);
                activeSpawnCountByGroup[6]++;
                totalSpawnedCountByGroup[6]++;
            }
        }
    }
}


function updateStageTick() { // xg
    var a, b, c, d, f = b = 0,
        g, h, k = 79,
        p = 0,
        t = 59,
        l = 0;
    gameFrameCounter++;
    if (-1 != draggedHeroIndex) {
        b = clamp(heroJointPositionsByHero[draggedHeroIndex][2].x, 0, 8 * stageWidth - 1) >> 3;
        f = clamp(heroJointPositionsByHero[draggedHeroIndex][2].y, 0, 8 * stageHeight - 1) >> 3;
    }

    g = clamp(heroJointPositionsByHero[selectingHero][2].x, 0, 8 * stageWidth - 1) >> 3;
    h = clamp(heroJointPositionsByHero[selectingHero][2].y, 0, 8 * stageHeight - 1) >> 3;
    for (a = 0; a < partyMemberCount; a++) {
        c = clamp(heroJointPositionsByHero[a][2].x, 0, 8 * stageWidth - 1) >> 3;
        d = clamp(heroJointPositionsByHero[a][2].y, 0, 8 * stageHeight - 1) >> 3;
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
        var n = clamp(mouseXCurrent + c[a] >> 3, 0, stageWidth - 1),
            w = clamp(mouseYCurrent + d[a] >> 3, 0, stageHeight - 1);
        if (isMouseClicked) {
            if (39 == stageTileData[w][n]) {
                fillStageTilesRect(n, w, n, w, 32);
                a = 1;
                if (1 > randFloat(200)) {
                    a = 100;
                } else if (1 > randFloat(14)) {
                    a = 7;
                }
                a = floor(a * (100 + partyRewardValueBonusPercent) / 100);
                spawnDrop(8 * n +
                    4, 8 * w + 4, 2, a, 0);
                if (isBadgeIncompleteForCurrentStage(3)) {
                    IncrementBadgeCount(3);
                }
                if (13 == currentStage)
                    for (a = 0; 15 > a; a++) {
                        spawnEnemy(n, w, 48, 6);
                        activeSpawnCountByGroup[6]++;
                        totalSpawnedCountByGroup[6]++;
                    }
                if (19 == currentStage) {
                    spawnEnemy(n, w, 87, 5);
                    activeSpawnCountByGroup[5]++;
                    totalSpawnedCountByGroup[5]++;
                }
                break;
            }
            if (47 == stageTileData[w][n]) {
                if (2 == currentStage) {
                    if (isBadgeIncompleteForCurrentStage(4)) {
                        IncrementBadgeCount(4);
                    }
                }
                if (11 == currentStage) {
                    c = 8 * n + 4 - mouseXCurrent;
                    d = 8 * w + 4 - mouseYCurrent;
                    if (abs(c) >= abs(d)) {
                        if (0 < c && 32 == stageTileData[w][n + 1]) {
                            fillStageTilesRect(n + 1, w, n + 1, w, 47);
                            fillStageTilesRect(n, w, n, w, 32);
                            n += 1;
                        } else if (0 > c && 32 == stageTileData[w][n - 1]) {
                            fillStageTilesRect(n - 1, w, n - 1, w, 47);
                            fillStageTilesRect(n, w, n, w, 32);
                            --n;
                        }
                    } else if (0 < d && 32 == stageTileData[w + 1][n]) {
                        fillStageTilesRect(n, w + 1, n, w + 1, 47);
                        fillStageTilesRect(n, w, n, w, 32);
                        w += 1;
                    } else if (0 > d && 32 == stageTileData[w - 1][n]) {
                        fillStageTilesRect(n, w - 1, n, w - 1, 47);
                        fillStageTilesRect(n, w, n, w, 32);
                        --w;
                    }
                    if (isBadgeIncompleteForCurrentStage(44)) {
                        c = abs(64 - n);
                        d = abs(11 - w);
                        spawnPopup(mouseXCurrent, mouseYCurrent, 0, "" + c + d, 30, 10066431);
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
    if (1 == currentStage) {
        if (12 == gameScreenState && 1 == isStageReachedArray[6] && 23 <= g && 26 >= g && 24 <= h && 24 >= h) {
            lastStageIdx = 6;
            partySpawnXByHero[0] = 33;
            partySpawnYByHero[0] = 24;
            partySpawnXByHero[1] = 35;
            partySpawnYByHero[1] = 24;
            partySpawnXByHero[2] = 44;
            partySpawnYByHero[2] = 24;
            partySpawnXByHero[3] = 46;
            partySpawnYByHero[3] = 24;
        }
        if (12 == gameScreenState && 1 == isStageReachedArray[12] && 1 > h) {
            lastStageIdx = 12;
            partySpawnXByHero[0] = 67;
            partySpawnYByHero[0] = 42;
            partySpawnXByHero[1] = 69;
            partySpawnYByHero[1] = 42;
            partySpawnXByHero[2] = 71;
            partySpawnYByHero[2] = 42;
            partySpawnXByHero[3] = 73;
            partySpawnYByHero[3] = 42;
        }
    } else if (2 != currentStage)
        if (3 == currentStage) {
            if (1 == partyMemberCount && 0 == activeSpawnCountByGroup[0]) {
                resetHeroPose(partyMemberCount, 25, 14);
                partyMemberCount++;
            }
            if (2 <= partyMemberCount) {
                fillStageTilesRect(25, 13, 25, 14, 64);
                fillStageTilesRect(31, 11, 31, 14, 64);
            }
            if (1 == stageEventFlagArray[0]) {
                fillStageTilesRect(11, 30, 11, 30, 63);
            } else if (32 == stageTileData[30][11]) {
                if (0 == activeSpawnCountByGroup[1]) {
                    fillStageTilesRect(11, 30, 11, 30, 55);
                }
            } else if (55 == stageTileData[30][11] && 10 <= b && 12 >= b && 29 <= f && 31 >= f) {
                fillStageTilesRect(11, 30, 11, 30, 63);
                spawnDrop(92,
                    244, 3, 0, 0);
            }
            if (0 == totalSpawnedCountByGroup[2] && 10 <= b && 20 >= b && 34 <= f && 41 >= f) {
                spawnEnemy(14, 41, 15, 2);
                spawnEnemy(16, 41, 15, 2);
                spawnEnemy(18, 41, 15, 2);
                activeSpawnCountByGroup[2] = 3;
                totalSpawnedCountByGroup[2] = 3;
            }
            if (1 == stageEventFlagArray[1]) {
                fillStageTilesRect(16, 41, 16, 41, 63);
            } else if (32 == stageTileData[41][16]) {
                if (0 == activeSpawnCountByGroup[2] && 0 != totalSpawnedCountByGroup[2]) {
                    fillStageTilesRect(16, 41, 16, 41, 55);
                }
            } else if (55 == stageTileData[41][16] && 15 <= b && 17 >= b && 40 <= f && 42 >= f) {
                fillStageTilesRect(16, 41, 16, 41, 63);
                spawnDrop(132, 332, 3, 1, 0);
            }
            if (isBadgeIncompleteForCurrentStage(7)) {
                for (a = b = 0; a < partyMemberCount; a++) {
                    c = clamp(heroJointPositionsByHero[a][2].x, 0, 8 * stageWidth - 1) >> 3;
                    d = clamp(heroJointPositionsByHero[a][2].y, 0, 8 * stageHeight - 1) >> 3;
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
            if (0 != totalSpawnedCountByGroup[2]) {
                consecutiveConditionFrameCount++;
            }
        } else if (4 == currentStage) {
        if (2 == partyMemberCount && 0 == activeSpawnCountByGroup[1] && 0 != totalSpawnedCountByGroup[1]) {
            resetHeroPose(partyMemberCount, 55, 40);
            partyMemberCount++;
        }
        if (3 <= partyMemberCount) {
            fillStageTilesRect(55, 39, 55, 40, 32);
            fillStageTilesRect(77, 38, 77, 41, 32);
        }
        if (2 == partyMemberCount && 0 == totalSpawnedCountByGroup[0] && 54 <= g && 76 >= g && 38 <= h && 41 >= h)
            for (a = 0; 20 > a; a++) {
                spawnEnemy(randIntRange(56, 76), randIntRange(33, 38), 5, 0);
                activeSpawnCountByGroup[0]++;
                totalSpawnedCountByGroup[0]++;
            }
        if ((3 <= partyMemberCount || 0 == activeSpawnCountByGroup[0] && 0 != totalSpawnedCountByGroup[0]) && 0 == totalSpawnedCountByGroup[1]) {
            spawnEnemy(65, 35, 16, 1);
            activeSpawnCountByGroup[1] = 1;
            totalSpawnedCountByGroup[1] = 1;
        }
        if (isBadgeIncompleteForCurrentStage(11)) {
            if (0 == activeSpawnCountByGroup[6] && 20 == totalSpawnedCountByGroup[6] && !stageConditionMask) {
                IncrementBadgeCount(11);
            }
        }
        if (isBadgeIncompleteForCurrentStage(12)) {
            if (0 == activeSpawnCountByGroup[4] && 3 == totalSpawnedCountByGroup[4] && 8 == activeSpawnCountByGroup[3]) {
                IncrementBadgeCount(12);
            }
        }
        if (isBadgeIncompleteForCurrentStage(13)) {
            if (0 == activeSpawnCountByGroup[1] && 1 == totalSpawnedCountByGroup[1] && 0 == stage_partyDamageTaken) {
                IncrementBadgeCount(13);
            }
        }
        if (isBadgeIncompleteForCurrentStage(14)) {
            if (9 == lastClearedStageIdx) {
                IncrementBadgeCount(14);
            }
        }
    } else if (5 == currentStage) {
        if (3 == partyMemberCount && 0 == activeSpawnCountByGroup[0] && 0 == activeSpawnCountByGroup[1] && (resetHeroPose(partyMemberCount, 17, 5), partyMemberCount++), 4 == partyMemberCount && (fillStageTilesRect(17, 4, 17, 5, 64), fillStageTilesRect(77, 20, 77, 24, 64)), !isBadgeIncompleteForCurrentStage(16) || 0 != activeSpawnCountByGroup[0] || 0 != activeSpawnCountByGroup[1] || stageConditionMask & 2 || IncrementBadgeCount(16),
            !isBadgeIncompleteForCurrentStage(17) || 0 != activeSpawnCountByGroup[0] || 0 != activeSpawnCountByGroup[1] || stageConditionMask & 1 || IncrementBadgeCount(17), isBadgeIncompleteForCurrentStage(19)) {
            for (a = b = 0; a < partyMemberCount; a++) {
                c = clamp(heroJointPositionsByHero[a][2].x, 0, 8 * stageWidth - 1) >> 3;
                d = clamp(heroJointPositionsByHero[a][2].y, 0, 8 * stageHeight - 1) >> 3;
                if (56 <= c && 59 >= c && 39 <= d && 41 >= d) {
                    b++;
                }
            }
            if (4 == b) {
                IncrementBadgeCount(19);
            }
        }
    } else if (6 == currentStage) {
        if (12 == gameScreenState && 38 <= g && 41 >= g && 24 <= h && 24 >= h) {
            lastStageIdx = 1;
            partySpawnXByHero[0] = 18;
            partySpawnYByHero[0] = 24;
            partySpawnXByHero[1] = 20;
            partySpawnYByHero[1] = 24;
            partySpawnXByHero[2] = 29;
            partySpawnYByHero[2] = 24;
            partySpawnXByHero[3] = 31;
            partySpawnYByHero[3] = 24;
        }
    } else if (7 == currentStage) {
        if (0 == totalSpawnedCountByGroup[1] && 73 <= g && 76 >= g && 34 <= h && 39 >= h)
            if (c = 0, 39 == stageTileData[34][75] && c++, 39 == stageTileData[35][72] && c++, 39 == stageTileData[35][74] && c++, 39 == stageTileData[36][75] && c++, 39 == stageTileData[38][76] && c++, 1 == c || 2 == c) {
                spawnEnemy(66, 42, 24, 1);
                activeSpawnCountByGroup[1]++;
                totalSpawnedCountByGroup[1]++;
            } else {
                for (5 == c ? c = 12 : 4 == c ? c = 13 : 3 == c ? c = 14 : c || (c = 20), a = 0; 15 > a; a++) {
                    spawnEnemy(randIntRange(56, 69), randIntRange(42, 43), c, 1);
                    activeSpawnCountByGroup[1]++;
                    totalSpawnedCountByGroup[1]++;
                }
            }
        c = 43;
        d = 30;
        if (1 == stageEventFlagArray[2]) {
            fillStageTilesRect(c, d, c, d, 63);
        } else if (32 == stageTileData[d][c]) {
            if (0 == activeSpawnCountByGroup[2]) {
                fillStageTilesRect(c, d, c, d, 55);
            }
        } else if (55 == stageTileData[d][c] && c - 1 <= b && b <= c + 1 && d - 1 <= f && f <= d + 1) {
            fillStageTilesRect(c, d, c, d, 63);
            spawnDrop(8 * c + 4, 8 * d + 4, 3, 2, 0);
        }
        if (1 == totalSpawnedCountByGroup[9] && 40 <= k && 72 >= p && 23 <= t && 30 >= l)
            for (a = 0; 15 > a; a++) {
                spawnEnemy(randIntRange(61, 76), 21, 28, 9);
                activeSpawnCountByGroup[9]++;
                totalSpawnedCountByGroup[9]++;
            }
        if (isBadgeIncompleteForCurrentStage(21)) {
            if (0 == activeSpawnCountByGroup[2] && 0 == stage_partyDamageTaken) {
                IncrementBadgeCount(21);
            }
        }
        if (isBadgeIncompleteForCurrentStage(23)) {
            for (a = b = 0; a < partyMemberCount; a++)
                if (0 < heroSkipTimer[a]) {
                    b++;
                } if (4 == b) {
                IncrementBadgeCount(23);
            }
        }
    } else if (8 == currentStage) {
        if (30 > totalSpawnedCountByGroup[3] && 2 <= g && 20 >= g && 20 <= h && 27 >= h && 4 > randFloat(60)) {
            a = [5, 18, 3, 20];
            g = [18, 16, 21, 22];
            b = randInt(4);
            spawnEnemy(a[b], g[b], 32, 3);
            activeSpawnCountByGroup[3]++;
            totalSpawnedCountByGroup[3]++;
        }
        if (isBadgeIncompleteForCurrentStage(27)) {
            for (a = 0; a < partyMemberCount; a++) {
                c = clamp(heroJointPositionsByHero[a][2].x, 0, 8 * stageWidth - 1) >> 3;
                d = clamp(heroJointPositionsByHero[a][2].y, 0, 8 * stageHeight - 1) >> 3;
                if (2 <= c && 15 >= c && 29 <= d && 36 >= d) {
                    stageConditionMask = 1;
                }
            }
            0 != activeSpawnCountByGroup[4] || stageConditionMask || IncrementBadgeCount(27);
        }
        if (isBadgeIncompleteForCurrentStage(28)) {
            for (a = 0; a < partyMemberCount && 0 == heroTileContactFlags[a]; a++);
            if (a == partyMemberCount) {
                consecutiveConditionFrameCount++;
            } else {
                consecutiveConditionFrameCount = 0;
            }
            if (300 <= consecutiveConditionFrameCount) {
                IncrementBadgeCount(28);
            }
        }
    } else if (9 == currentStage) {
        b = -1;
        for (a = 0; a < enemyCount; a++)
            if (36 == enemyTypeArray[a] && 0 != enemyHealthArray[a]) {
                b = a;
            }
        if (-1 != b && 10 < enemyPoseTrailWriteIdxArray[b] && 500 > enemyHealthArray[b])
            for (enemyHealthArray[b] += 1500, enemyPoseTrailWriteIdxArray[b]--, c = 2 * (19 - enemyPoseTrailWriteIdxArray[b] + 1), a = 0; a < c; a++) {
                spawnEnemy(randIntRange(25, 57), randIntRange(25, 39), 35, 1);
                activeSpawnCountByGroup[1]++;
                totalSpawnedCountByGroup[1]++;
            }
        if (isBadgeIncompleteForCurrentStage(31)) {
            if (0 == activeSpawnCountByGroup[3] && 2 == totalSpawnedCountByGroup[1]) {
                IncrementBadgeCount(31);
            }
        }
        if (isBadgeIncompleteForCurrentStage(32)) {
            if (100 <= enemyCount) {
                IncrementBadgeCount(32);
            }
        }
        if (isBadgeIncompleteForCurrentStage(33)) {
            for (a =
                b = 0; a < partyMemberCount; a++) {
                c = clamp(heroJointPositionsByHero[a][2].x, 0, 8 * stageWidth - 1) >> 3;
                d = clamp(heroJointPositionsByHero[a][2].y, 0, 8 * stageHeight - 1) >> 3;
                if (26 == stageTileData[d][c]) {
                    b++;
                }
            }
            if (4 == b) {
                IncrementBadgeCount(33);
            }
        }
        if (isBadgeIncompleteForCurrentStage(34)) {
            if (10 == lastStageIdx && 1 >= g && 41 <= h) {
                IncrementBadgeCount(34);
            }
        }
    } else if (10 == currentStage) {
        if (25 >= totalSpawnedCountByGroup[0] && 4 <= g && 21 >= g && 34 <= h && 40 >= h)
            for (a = 0; 15 > a; a++) {
                spawnEnemy(randIntRange(32, 53), randIntRange(33, 34), 37, 0);
                activeSpawnCountByGroup[0]++;
                totalSpawnedCountByGroup[0]++;
            }
        if (40 > totalSpawnedCountByGroup[4] && 8 <= g && 38 >= g && 0 <= h && 7 >= h && 10 > randFloat(60)) {
            a = [24, 25, 29, 30];
            g = [4, 4, 3, 3];
            b = randInt(4);
            spawnEnemy(a[b], g[b], 41, 4);
            activeSpawnCountByGroup[4]++;
            totalSpawnedCountByGroup[4]++;
        }
        if (isBadgeIncompleteForCurrentStage(37)) {
            if (0 == activeSpawnCountByGroup[1] && activeSpawnCountByGroup[0] == totalSpawnedCountByGroup[0]) {
                IncrementBadgeCount(37);
            }
        }
        if (isBadgeIncompleteForCurrentStage(38)) {
            if (0 == activeSpawnCountByGroup[3] && 0 == stage_partyDamageTaken) {
                IncrementBadgeCount(38);
            }
        }
        if (isBadgeIncompleteForCurrentStage(39)) {
            for (a = b = 0; a < partyMemberCount; a++)
                if (0 < heroTimedDamageTimer[a]) {
                    b++;
                } if (4 == b) {
                IncrementBadgeCount(39);
            }
        }
    } else if (11 == currentStage) {
        if (isBadgeIncompleteForCurrentStage(41)) {
            if (0 == activeSpawnCountByGroup[3] && !stageConditionMask) {
                IncrementBadgeCount(41);
            }
        }
        if (isBadgeIncompleteForCurrentStage(42)) {
            if (0 == activeSpawnCountByGroup[4] && 0 == stage_partyDamageTaken) {
                IncrementBadgeCount(42);
            }
        }
    } else if (13 == currentStage) {
        if (1 == stageEventFlagArray[0]) {
            fillStageTilesRect(77, 20, 77, 24, 31);
        }
        if (isBadgeIncompleteForCurrentStage(46)) {
            if (0 == activeSpawnCountByGroup[1] && 45 == totalSpawnedCountByGroup[1] && 0 == activeSpawnCountByGroup[6] && 45 == totalSpawnedCountByGroup[6]) {
                IncrementBadgeCount(46);
            }
        }
        if (isBadgeIncompleteForCurrentStage(48)) {
            if (0 == activeSpawnCountByGroup[5] && 0 == stage_partyDamageTaken) {
                IncrementBadgeCount(48);
            }
        }
    } else if (14 == currentStage) {
        if (isBadgeIncompleteForCurrentStage(53)) {
            for (a = 0; a < partyMemberCount && 2 == heroTileContactFlags[a]; a++);
            if (a == partyMemberCount) {
                consecutiveConditionFrameCount++;
            } else {
                consecutiveConditionFrameCount = 0;
            }
            if (1800 <= consecutiveConditionFrameCount) {
                IncrementBadgeCount(53);
            }
        }
        if (isBadgeIncompleteForCurrentStage(54)) {
            if (39 == stageTileData[12][44] && 39 == stageTileData[12][45] && 39 == stageTileData[13][43] && 39 != stageTileData[13][44] && 39 != stageTileData[13][45] && 39 == stageTileData[13][46] && 39 == stageTileData[14][43] && 39 != stageTileData[14][44] && 39 != stageTileData[14][45] && 39 == stageTileData[14][46] && 39 != stageTileData[15][43] && 39 == stageTileData[15][44] && 39 == stageTileData[15][45]) {
                IncrementBadgeCount(54);
            }
        }
    } else if (15 == currentStage) {
        if (60 > totalSpawnedCountByGroup[1] && 42 <= g && 67 >= g &&
            18 <= h && 24 >= h && 4 > randFloat(60)) {
            a = [44, 45, 46, 66];
            g = [24, 24, 24, 24];
            b = randInt(4);
            spawnEnemy(a[b], g[b], 60, 1);
            activeSpawnCountByGroup[1]++;
            totalSpawnedCountByGroup[1]++;
        }
        if (0 == activeSpawnCountByGroup[5] && totalSpawnedCountByGroup[6] < 150 - (totalSpawnedCountByGroup[0] - activeSpawnCountByGroup[0])) {
            c = randIntRange(15, 65);
            d = randIntRange(1, 18);
            if (25 < stageTileData[d][c]) {
                spawnEnemy(c, d, 59, 6);
                activeSpawnCountByGroup[6]++;
                totalSpawnedCountByGroup[6]++;
            }
        }
        if (isBadgeIncompleteForCurrentStage(57)) {
            if (0 == activeSpawnCountByGroup[3] && 0 == stage_partyDamageTaken) {
                IncrementBadgeCount(57);
            }
        }
        if (isBadgeIncompleteForCurrentStage(59)) {
            if (198 <= activeSpawnCountByGroup[0] + activeSpawnCountByGroup[6]) {
                IncrementBadgeCount(59);
            }
        }
    } else if (16 == currentStage) {
        f = activeSpawnCountByGroup[0] + activeSpawnCountByGroup[1];
        k = activeSpawnCountByGroup[2] + activeSpawnCountByGroup[3];
        p = activeSpawnCountByGroup[4] + activeSpawnCountByGroup[5] + activeSpawnCountByGroup[6] + activeSpawnCountByGroup[7];
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
        if (0 < b && 100 > totalSpawnedCountByGroup[11]) {
            c = randIntRange(4, 59);
            d = randIntRange(30, 33);
            if (25 < stageTileData[d][c]) {
                spawnEnemy(c, d, b, 11);
                activeSpawnCountByGroup[11]++;
                totalSpawnedCountByGroup[11]++;
            }
        }
        if (60 > totalSpawnedCountByGroup[12] && 70 <= g && 76 >= g &&
            34 <= h && 41 >= h) {
            c = randIntRange(5, 70);
            d = randIntRange(42, 43);
            if (25 < stageTileData[d][c]) {
                spawnEnemy(c, d, 68, 12);
                activeSpawnCountByGroup[12]++;
                totalSpawnedCountByGroup[12]++;
            }
        }
        b = -1;
        for (a = 0; a < enemyCount; a++)
            if (70 == enemyTypeArray[a] && 0 != enemyHealthArray[a]) {
                b = a;
            }
        if (-1 != b && 10 < enemyPoseTrailWriteIdxArray[b] && enemyHealthArray[b] < 1E4 * (enemyPoseTrailWriteIdxArray[b] - 10) - 5E3)
            for (enemyPoseTrailWriteIdxArray[b]--, t = min(256, 1 << 20 - enemyPoseTrailWriteIdxArray[b]), a = 0; a < t; a++) {
                g = enemyJointPosArray[b][enemyPoseTrailWriteIdxArray[b]].x;
                h = enemyJointPosArray[b][enemyPoseTrailWriteIdxArray[b]].y;
                c = .5 * rotationLUT[512 * a / t][0];
                d = .5 * -rotationLUT[512 * a / t][1];
                spawnProjectile(-1, -1, g, h, c, d, 0, 26, 4294910481, 1, 16, 16, 0, 8, 8, 0, 200, 300, 10, 0, 0, 100, 0, 3, 0, 0, 0, 33, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            }
        if (0 == stageEventFlagArray[0] && 0 == activeSpawnCountByGroup[10]) {
            stageEventFlagArray[0] = 1;
        }
        if (1 == stageEventFlagArray[0]) {
            fillStageTilesRect(2, 20, 2, 24, 31);
        }
        if (isBadgeIncompleteForCurrentStage(61)) {
            if (0 == activeSpawnCountByGroup[10] && !stageFlagUseCount) {
                IncrementBadgeCount(61);
            }
        }
        !isBadgeIncompleteForCurrentStage(62) || 0 != activeSpawnCountByGroup[10] || stageConditionMask & 1 || IncrementBadgeCount(62);
        if (isBadgeIncompleteForCurrentStage(63)) {
            for (a = 0; a < partyMemberCount; a++) {
                c = clamp(heroJointPositionsByHero[a][2].x, 0, 8 * stageWidth - 1) >> 3;
                d = clamp(heroJointPositionsByHero[a][2].y, 0, 8 * stageHeight - 1) >> 3;
                if (58 <= c && 76 >= c && 36 <= d && 42 >= d) {
                    stageEncounterCounter = 1;
                }
            }
            0 != activeSpawnCountByGroup[9] || stageEncounterCounter || IncrementBadgeCount(63);
        }
        if (isBadgeIncompleteForCurrentStage(64)) {
            if (0 == p && 0 < f && 0 < k && 100 == activeSpawnCountByGroup[11]) {
                IncrementBadgeCount(64);
            }
        }
    } else if (17 == currentStage) {
        for (a = 0; a < partyMemberCount; a++) {
            if (0 < heroTimedDamageTimer[a]) {
                stageConditionMask = 1;
            } 
            if (isBadgeIncompleteForCurrentStage(66)) {
                if (0 == activeSpawnCountByGroup[0] && !stageConditionMask) {
                    IncrementBadgeCount(66);
                }
            }
        }
        if (isBadgeIncompleteForCurrentStage(68)) {
            if (0 == activeSpawnCountByGroup[6] && 5 == activeSpawnCountByGroup[5]) {
                IncrementBadgeCount(68);
            }
        }
    } else if (18 == currentStage) {
        if (6 > totalSpawnedCountByGroup[9] && 68 <= g && 70 >= g && 33 <= h && 40 >= h) {
            a = [29, 44, 59];
            b = randInt(3);
            spawnEnemy(a[b], 42, 83, 9);
            activeSpawnCountByGroup[9]++;
            totalSpawnedCountByGroup[9]++;
        }
        if (9 > totalSpawnedCountByGroup[10] && 3 <= g && 4 >= g && 5 <= h && 9 >= h && 10 > randFloat(60)) {
            c = randIntRange(8, 23);
            spawnEnemy(c, 10, 83, 10);
            activeSpawnCountByGroup[10]++;
            totalSpawnedCountByGroup[10]++;
        }!isBadgeIncompleteForCurrentStage(71) || 0 != activeSpawnCountByGroup[7] || 0 != activeSpawnCountByGroup[8] || stageConditionMask & 2 || IncrementBadgeCount(71);
        !isBadgeIncompleteForCurrentStage(72) || 0 != activeSpawnCountByGroup[7] || 0 != activeSpawnCountByGroup[8] || stageConditionMask & 1 || IncrementBadgeCount(72);
    } else if (19 == currentStage) {
        if (totalSpawnedCountByGroup[7] < 20 * (35 - activeSpawnCountByGroup[6]) && 15 > randFloat(60)) {
            c = randIntRange(19, 59);
            d = randIntRange(26, 33);
            if (33 == stageTileData[d][c]) {
                if (19 == totalSpawnedCountByGroup[7] % 20) {
                    spawnEnemy(c, d, 89, 7);
                } else {
                    spawnEnemy(c, d, 84, 7);
                }
                activeSpawnCountByGroup[7]++;
                totalSpawnedCountByGroup[7]++;
            }
        }
        if (1 > totalSpawnedCountByGroup[4] && 5 <= g && 12 >= g && 24 <= h && 26 >= h) {
            spawnEnemy(8, 26, 86, 4);
            activeSpawnCountByGroup[4]++;
            totalSpawnedCountByGroup[4]++;
        }
        if (1 == stageEventFlagArray[1]) {
            fillStageTilesRect(47, 15, 50, 15, 24);
            fillStageTilesRect(1, 31, 1, 35, 32);
        }
    } else if (20 == currentStage) {
        if (1 == stageEventFlagArray[4]) {
            fillStageTilesRect(70, 34, 70, 34, 63);
        } else if (55 == stageTileData[34][70] && 69 <= b && 71 >= b && 33 <= f && 35 >= f) {
            fillStageTilesRect(70, 34, 70, 34, 63);
            spawnDrop(564, 276, 3, 4, 0);
        }
    }
}

let ENUM_ENEMY_PROPS_COUNT = 0;    
const // 0-10
    enemyLevelCol = ENUM_ENEMY_PROPS_COUNT++, // Enemy level used for bestiary display and EXP scaling.
    enemyBehaviorIdxCol = ENUM_ENEMY_PROPS_COUNT++, // Dispatch-table index for the enemy update behavior.
    enemyShapeParamACol = ENUM_ENEMY_PROPS_COUNT++, // Shape parameter used by multi-part enemies; some behaviors treat it as a segment count.
    enemyShapeParamBCol = ENUM_ENEMY_PROPS_COUNT++, // Secondary shape parameter used by multi-part enemies; some behaviors treat it as a span or max count.
    enemySpriteIndexCol = ENUM_ENEMY_PROPS_COUNT++, // Sprite sheet index used to pick the enemy art.
    enemyDrawScaleCol = ENUM_ENEMY_PROPS_COUNT++, // Draw scale multiplier used for the enemy sprite and hitbox math.
    enemyPrimaryTintCol = ENUM_ENEMY_PROPS_COUNT++, // Primary tint color used by the enemy renderer.
    enemySecondaryTintCol = ENUM_ENEMY_PROPS_COUNT++, // Secondary tint color used by the enemy renderer.
    enemyAccentTintCol = ENUM_ENEMY_PROPS_COUNT++, // Accent tint color used by the enemy renderer.
    enemyHealthCol = ENUM_ENEMY_PROPS_COUNT++, // health column used for the LP display and health bar.
    enemyProjectileAttachModeCol = ENUM_ENEMY_PROPS_COUNT++, // Attachment mode for the spawned projectile; remapped to -1/0/1 before spawn.
    enemyProjectileVisualPackCol = ENUM_ENEMY_PROPS_COUNT++, // Packed projectile visual mode; splits into tint mode and solid or blend mode.

    // 12-38: Projectile template arguments forwarded unchanged into spawnProjectile.
    enemyPArg0Col = ENUM_ENEMY_PROPS_COUNT++,  enemyPArg1Col = ENUM_ENEMY_PROPS_COUNT++,  enemyPArg2Col = ENUM_ENEMY_PROPS_COUNT++,  enemyPArg3Col = ENUM_ENEMY_PROPS_COUNT++,
    enemyPArg4Col = ENUM_ENEMY_PROPS_COUNT++,  enemyPArg5Col = ENUM_ENEMY_PROPS_COUNT++,  enemyPArg6Col = ENUM_ENEMY_PROPS_COUNT++,  enemyPArg7Col = ENUM_ENEMY_PROPS_COUNT++,
    enemyPArg8Col = ENUM_ENEMY_PROPS_COUNT++,  enemyPArg9Col = ENUM_ENEMY_PROPS_COUNT++,  enemyPArg10Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg11Col = ENUM_ENEMY_PROPS_COUNT++,
    enemyPArg12Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg13Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg14Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg15Col = ENUM_ENEMY_PROPS_COUNT++,
    enemyPArg16Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg17Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg18Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg19Col = ENUM_ENEMY_PROPS_COUNT++,
    enemyPArg20Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg21Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg22Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg23Col = ENUM_ENEMY_PROPS_COUNT++,
    enemyPArg24Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg25Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg26Col = ENUM_ENEMY_PROPS_COUNT++,

    // 39-44
    enemyPhysResistPctCol = ENUM_ENEMY_PROPS_COUNT++, // Physical resistance percentage shown in RES and applied as flat damage reduction.
    enemyFireResistPctCol = ENUM_ENEMY_PROPS_COUNT++, // Fire resistance percentage shown in RES and applied to percentage damage reduction.
    enemyIceResistPctCol = ENUM_ENEMY_PROPS_COUNT++, // Ice resistance percentage shown in RES and applied to percentage damage reduction.
    enemyLightResistPctCol = ENUM_ENEMY_PROPS_COUNT++, // Light resistance percentage shown in RES and applied to percentage damage reduction.
    enemyPoisonResistPctCol = ENUM_ENEMY_PROPS_COUNT++, // Poison resistance percentage shown in RES and applied to DoT damage reduction.
    enemyFreezeResistPctCol = ENUM_ENEMY_PROPS_COUNT++, // Freeze resistance percentage used by freeze status duration reduction.

    // 45-62: Projectile template arguments forwarded unchanged into spawnProjectile.
    enemyPArg27Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg28Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg29Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg30Col = ENUM_ENEMY_PROPS_COUNT++,
    enemyPArg31Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg32Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg33Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg34Col = ENUM_ENEMY_PROPS_COUNT++,
    enemyPArg35Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg36Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg37Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg38Col = ENUM_ENEMY_PROPS_COUNT++,
    enemyPArg39Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg40Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg41Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg42Col = ENUM_ENEMY_PROPS_COUNT++,
    enemyPArg43Col = ENUM_ENEMY_PROPS_COUNT++, enemyPArg44Col = ENUM_ENEMY_PROPS_COUNT++,

    // 63-67
    enemySecondaryProjectileEnabledCol = ENUM_ENEMY_PROPS_COUNT++, // Secondary projectile template flag; nonzero spawns the variant projectile set.
    enemyExpRewardCol = ENUM_ENEMY_PROPS_COUNT++, // EXP reward granted on death.
    enemyGoldRewardCol = ENUM_ENEMY_PROPS_COUNT++, // Gold reward granted on death and bestiary unlock.
    enemyBestiaryUnlockCostCol = ENUM_ENEMY_PROPS_COUNT++, // Bestiary unlock cost shown before the enemy entry is revealed.
    enemyDropTableStartIdxCol = ENUM_ENEMY_PROPS_COUNT++; // Base index of the four-slot death drop table; read as item and probability pairs.


let enemyTypeCount = 128,
    enemyCatalog = Array(enemyTypeCount),
    bestiaryEntryState = Array(enemyTypeCount); // Bestiary entry unlock state: 0=locked, 1=preview/purchased, 2=fully unlocked
for (let _i = 0; _i < enemyTypeCount; _i++) bestiaryEntryState[_i] = 0;

enemyCatalog[0] = [1, 0, 0, 0, 0, 1, 3394611, 3355443, 0, 30, 1, 0, 2, 0, 4294967091, 2, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 1, 3, 1, 10, 50, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 1, 10, 7, 10, 9, 10, 0, 0, 71, 1E3];
enemyCatalog[1] = [2, 0, 0, 0, 0, 1, 3394815, 3355545, 0, 60, 1, 0, 2, 0, 4294967295, 2, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 2, 3, 1, 10, 50, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 1, 10, 5, 20, 10, 30, 0, 0, 71, 1E3];
enemyCatalog[2] = [3, 0, 0, 0, 0, 1, 13369344, 3342336, 0, 90, 0, 2, 0, 2, 4288217088, 1, 16, 16, 8, 8, 0, 0, 20, 10, 0, 100, 0, 0, 0, 0, 3, 5, 1, 10, 50, 20, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 1, 10, 6, 30, 28, 5, 0, 0, 71, 1E3];
enemyCatalog[3] = [5, 0, 0, 0, 0, 3, 3394611, 3355443, 0, 900, 0, 3, 0, 3, 4286611584, 1, 8, 8, 8, 8, 0, 0, 100, 10, 0, 100, 0, 0, 0, 0, 2, 3, 5, 10, 10, 15, 120, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 3, 20, 8, 1, 30, 3, 0, 0, 71, 100];
enemyCatalog[5] = [4, 2, 0, 0, 7, 1, 13421772, 0, 6702114, 60, 1, 0, 2, 7, 4294914867, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 1, 1, 1, 10, 50, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 1, 10, 11, 20, 0, 0, 0, 0, 71, 1E3];
enemyCatalog[4] = [5, 1, 0, 0, 4, 2, 3394611, 3355443, 3381555, 150, 0, 3, 1, 4, 4294967295, 1, 16, 16, 8, 8, 0, 0, 20, 40, 0, 100, 0, 0, 0, 0, 3, 4, 1, 5, 50, 20, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 5, 20, 29, 15, 0, 0, 0, 0, 73, 1E3];
enemyCatalog[6] = [6, 5, 4, 6, 15, 1, 0, 13395456, 3368448, 360, 0, 4, 0, 3, 4294940979, 1, 16, 16, 8, 8, 0, 0, 150, 10, 5, 100, 0, 0, 0, 0, 6, 8, 1, 100, 50, 20, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 3, 10, 14, 5, 33, 10, 0, 0, 73, 50];
enemyCatalog[7] = [4, 0, 0, 0, 0, 1, 13421568, 3355443, 0, 120, 1, 0, 2, 0, 4294967295, 2, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 2, 4, 1, 10, 50, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 1, 10, 12, 20, 13, 20, 0, 0, 73, 1E3];
enemyCatalog[8] = [7, 0, 0, 0, 0, 3, 13421568, 3355443, 0, 900, 1, 0, 2, 0, 4294967295, 2, 48, 48, 120, 64, 0, 0, 0, 10, 0, 100, 0, 0, 0, 1, 6, 8, 1, 10, 50, 20, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 5, 20, 16, 2, 0, 0, 0, 0, 73, 100];
enemyCatalog[9] = [5, 1, 0, 0, 5, 1, 4482577, 10035712, 3359761, 90, 1, 0, 2, 5, 4294954171, 1, 16, 16, 32, 32, 0, 0, 30, 10, 0, 100, 0, 0, 0, 0, 2, 4, 1, 10, 50, 20, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 1, 10, 15, 10, 0, 0, 0, 0, 73, 1E3];
enemyCatalog[14] = [8, 0, 0, 0, 8, 1, 13369344, 3342336, 0, 20, 1, 0, 2, 8, 4294915071, 2, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 3, 3, 1, 10, 20, 300, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 1, 10, 21, 10, 22, 20, 0, 0, 73, 1E3];
enemyCatalog[15] = [9, 0, 0, 0, 8, 2, 11141120, 3342336, 0, 450, 1, 0, 2, 8, 4294915071, 2, 32, 32, 120, 64, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 3, 3, 1, 10, 20, 300, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 5, 20, 23, 15, 0, 0, 0, 0, 73, 200];
enemyCatalog[10] = [6, 5, 2, 3, 3, 1, 6710937, 102, 3355443, 200, 0, 104, 0, 2, 4293848831, 1, 16, 16, 4, 4, 40, 15, 150, 10, 3, 100, 0, 4, 0, 0, 3, 3, 3, 120, 150, 20, 120, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 1, 10, 17, 20, 19, 20, 0, 0, 75, 1E3];
enemyCatalog[11] = [7, 5, 2, 3, 3, 1, 15623833, 102, 3355443, 200, 0, 104, 0, 2, 4294923605, 1, 16, 16, 4, 4, 50, 15, 150, 10, 3, 100, 0, 4, 0, 0, 5, 5, 5, 120, 150, 20, 120, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 300, 3, 10, 18, 10, 20, 10, 0, 0, 75, 1E3];
enemyCatalog[12] = [5, 0, 0, 0, 8, 1, 3394611, 3355443, 0, 20, 1, 0, 2, 8, 4294967091, 2, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 1, 1, 1, 10, 20, 300, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 1, 10, 32, 20, 0, 0, 0, 0, 75, 1E3];
enemyCatalog[13] = [6, 0, 0, 0, 8, 1, 3394815, 3355545, 0, 20, 1, 0, 2, 8, 4294967295, 2, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 2, 2, 1, 10, 20, 300, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 1, 10, 24, 20, 31, 20, 0, 0, 75, 1E3];
enemyCatalog[16] = [10, 2, 0, 0, 7, 2, 13421772, 0, 6702114, 600, 0, 3, 0, 1, 4291611852, 1, 16, 16, 4, 4, 0, 0, 300, 10, 0, 100, 0, 0, 0, 0, 1, 1, 16, 5, 50, 20, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 5, 20, 37, 5, 0, 0, 0, 0, 75, 100];
enemyCatalog[17] = [8, 0, 0, 0, 0, 1, 0, 3368448, 0, 120, 1, 0, 2, 0, 4294967091, 2, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 5, 6, 1, 10, 50, 20, 20, 0, 0, 0, 100, 100, 100, 100, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 1, 10, 25, 20, 0, 0, 0, 0, 75, 500];
enemyCatalog[18] = [10, 0, 0, 0, 0, 3, 35839, 21913, 0, 1800, 0, 4, 0, 0, 4278225919, 2, 16, 16, 8, 8, 0, 40, 400, 10, .5, 100, 0, 0, 0, 0, 4, 6, 5, 300, 50, 10, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 10, 20, 27, 7, 0, 0, 0, 0, 77, 70];
enemyCatalog[19] = [9, 6, 2, 5, 8, 1, 10027059, 3342336, 26112, 180, 0, 4, 0, 1, 4294901862, 1, 16, 16, 4, 4, 0, 0, 400, 10, .5, 100, 0, 0, 0, 0, 4, 4, 1, 160, 200, 20, 120, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 1, 10, 26, 20, 0, 0, 0, 0, 77, 1E3];
enemyCatalog[20] = [10, 0, 0, 0, 8, 1, 15645440, 10053120, 0, 20, 1, 0, 2, 8, 4282659584, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 1, 5, 1, 10, 20, 300, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 3, 10, 34, 20, 0, 0, 0, 0, 77, 1E3];
enemyCatalog[21] = [11, 10, 0, 0, 3, 1, 6724095, 14697, 14697, 240, 1, 0, 2, 3, 4294954035, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 1, 4, 1, 10, 50, 20, 20, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 1, 10, 36, 30, 0, 0, 0, 0, 77, 1E3];
enemyCatalog[22] = [12, 10, 0, 0, 3, 3, 10079487, 14697, 14697, 2E3, 0, 3, 0, 1, 4279308561, 1, 16, 16, 4, 4, 0, 100, 1E3, 10, 0, 100, 0, 0, 0, 0, 2, 2, 20, 2, 150, 20, 200, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 10, 20, 35, 5, 0, 0, 0, 0, 77, 100];
enemyCatalog[23] = [12, 1, 0, 0, 7, 1, 39219, 10040064, 13107, 120, 1, 0, 2, 7, 4291572480, 1, 16, 16, 32, 32, 0, 0, 30, 20, 0, 100, 0, 0, 0, 0, 2, 4, 1, 10, 50, 20, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 2, 10, 0, 0, 0, 0, 0, 0, 79, 1E3];
enemyCatalog[24] = [13, 0, 0, 0, 8, 2, 15645440, 10053120, 0, 550, 1, 0, 2, 8, 4282659584, 1, 32, 32, 120, 64, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 1, 7, 1, 10, 20, 300, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 150, 20, 38, 5, 0, 0, 0, 0, 79, 100];
enemyCatalog[25] = [14, 6, 2, 2, 5, 1, 10066380, 102, 3355494, 250, 0, 1, 0, 1, 4293848831, 1, 16, 16, 4, 4, 0, 0, 200, 10, .5, 100, 0, 0, 0, 0, 2, 2, 1, 10, 200, 20, 120, 2, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 2, 10, 40, 20, 0, 0, 0, 0, 79, 1E3];
enemyCatalog[26] = [14, 5, 2, 5, 5, 1, 16763904, 3342336, 3355392, 250, 0, 4, 1, 36, 4294967057, 1, 16, 16, 4, 4, 0, 0, 200, 10, 5, 100, 0, 4, 0, 0, 1, 9, 1, 120, 150, 20, 120, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 2, 10, 39, 20, 0, 0, 0, 0, 79, 1E3];
enemyCatalog[27] = [15, 6, 9, 9, 7, 3, 13421772, 3355443, 8912964, 3E3, 0, 4, 0, 0, 4294919185, 2, 16, 16, 0, 0, 0, 500, 500, 10, .5, 100, 0, 0, 0, 0, 2, 3, 1, 120, 50, 20, 130, 1, 1, 0, 100, 0, 0, 0, 0, 2, 0, 30, 4294919185, 2, 16, 24, 16, 24, 180, 10, 5, 92, 0, 1, 0, 5, 1, 0, 1E3, 20, 20, 41, 5, 0, 0, 0, 0, 79, 100];
enemyCatalog[28] = [15, 4, 0, 0, 7, 1, 13421772, 8912964, 3355443, 150, 1, 0, 2, 7, 4279308561, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 2, 2, 1, 10, 50, 20, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 2, 10, 42, 10, 43, 10, 0, 0, 79, 1E3];
enemyCatalog[29] = [15, 2, 0, 0, 9, 1, 13421772, 0, 10053171, 50, 1, 0, 2, 9, 4294906129, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 2, 2, 1, 10, 50, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 2, 10, 46, 99, 0, 0, 2, 1, 81, 1E3];
enemyCatalog[30] = [16, 3, 6, 0, 3, 1, 10066380, 0, 13107, 750, 0, 4, 1, 7, 4291611903, 1, 16, 16, 8, 8, 0, 30, 500, 10, 2, 100, 0, 0, 0, 0, 5, 5, 3, 120, 200, 10, 120, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 400, 6, 10, 45, 15, 0, 0, 0, 0, 81, 1E3];
enemyCatalog[31] = [17, 3, 6, 0, 3, 1, 13395456, 0, 10040064, 750, 0, 303, 0, 13, 4294927889, 2, 16, 16, 8, 8, 15, 0, 120, 5, -1, 99, 0, 0, 0, 0, 2, 3, 9, 12, 100, 20, 60, 1, 2, 0, 100, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 400, 9, 10, 44, 5, 0, 0, 0, 0, 81, 60];
enemyCatalog[32] = [16, 2, 0, 0, 9, 1, 13421772, 13382604, 4460868, 110, 1, 0, 2, 9, 4294906129, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 2, 2, 1, 10, 50, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 2, 10, 48, 99, 0, 0, 2, 1, 81, 1E3];
enemyCatalog[33] = [18, 5, 4, 4, 13, 1, 16750848, 10027161, 2245632, 1E3, 0, 4, 1, 7, 4290484633, 1, 32, 32, 12, 12, 0, 0, 1E3, 10, .3, 100, 0, 0, 0, 0, 20, 25, 1, 300, 50, 5, 150, 0, 0, 0, 100, 100, 100, 100, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 400, 9, 10, 47, 5, 0, 0, 0, 0, 81, 1E3];
enemyCatalog[34] = [19, 0, 0, 0, 0, 3, 2236962, 4473924, 0, 5500, 0, 104, 0, 24, 4294914918, 1, 16, 16, 4, 4, 80, 25, 800, 10, 1, 100, 0, 3, 0, 0, 5, 5, 8, 200, 150, 10, 200, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 50, 20, 49, 15, 54, 15, 0, 0, 83, 100];
enemyCatalog[35] = [17, 2, 0, 0, 9, 1, 4204560, 0, 3342336, 150, 1, 0, 2, 9, 4294906129, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 2, 2, 1, 10, 50, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 2, 10, 53, 99, 0, 0, 2, 1, 83, 1E3];
enemyCatalog[36] = [20, 5, 19, 19, 13, 3, 16750848, 10027008, 2245632, 2E3, 0, 4, 1, 7, 4288256443, 2, 24, 24, 8, 8, 0, 0, 2E3, 10, .1, 100, 0, 4, 0, 0, 20, 25, 5, 800, 200, 5, 160, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2E3, 100, 100, 50, 9, 51, 9, 52, 9, 83, 100];
enemyCatalog[37] = [19, 4, 0, 0, 9, 1, 13421772, 8912964, 3355443, 330, 1, 0, 2, 9, 4279308561, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 2, 2, 1, 10, 50, 20, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 3, 10, 55, 99, 0, 0, 0, 0, 85, 1E3];
enemyCatalog[38] = [21, 5, 3, 3, 13, 1, 16763904, 13369344, 6684672, 2500, 0, 6403, 0, 54, 4294910481, 2, 16, 16, 8, 8, 0, 0, 300, 10, 0, 100, 0, 3, 0, 0, 1, 1, 8, 10, 50, 5, 110, 1, 3, 0, 100, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 400, 20, 20, 57, 5, 0, 0, 0, 0, 85, 100];
enemyCatalog[39] = [20, 0, 0, 0, 0, 1, 0, 8409120, 0, 380, 0, 4, 1, 5, 4294953984, 2, 12, 12, 6, 6, 0, 30, 1E3, 10, .5, 100, 0, 4, 0, 0, 5, 6, 1, 300, 100, 10, 80, 0, 0, 0, 50, 50, 50, 50, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 3, 10, 56, 99, 0, 0, 0, 0, 85, 500];
enemyCatalog[40] = [21, 5, 4, 4, 13, 1, 52224, 0, 6684825, 2500, 0, 4, 1, 6, 4278216192, 1, 16, 16, 8, 8, 0, 0, 1E3, 10, 1, 100, 0, 0, 0, 0, 1, 1, 1, 300, 50, 10, 240, 4, 720, 0, 0, 0, 0, 100, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 400, 20, 20, 58, 8, 59, 6, 0, 0, 85, 100];
enemyCatalog[41] = [20, 0, 0, 0, 8, 1, 2245632, 16764006, 0, 120, 1, 0, 2, 8, 4288217088, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 3, 3, 1, 10, 20, 300, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 3, 10, 60, 99, 0, 0, 0, 0, 85, 1E3];
enemyCatalog[42] = [20, 4, 0, 0, 5, 1, 13421772, 8912964, 1052688, 330, 1, 0, 2, 5, 4279308561, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 3, 3, 1, 10, 50, 20, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 5, 10, 61, 50, 0, 0, 0, 0, 87, 1E3];
enemyCatalog[43] = [22, 1, 0, 0, 6, 2, 12259584, 1114112, 1114112, 1500, 0, 303, 0, 13, 4294927889, 2, 16, 16, 8, 8, 15, 0, 120, 5, -1, 99, 0, 0, 0, 0, 2, 3, 9, 12, 100, 20, 60, 1, 1, 0, 100, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 600, 2, 20, 63, 10, 0, 0, 0, 0, 87, 300];
enemyCatalog[44] = [21, 2, 0, 0, 9, 1, 11184810, 26265, 1118498, 220, 1, 0, 2, 9, 4279308799, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 2, 2, 1, 10, 50, 20, 20, 2, 50, 0, 50, 100, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 3, 10, 62, 50, 0, 0, 0, 0, 87, 1E3];
enemyCatalog[45] = [23, 0, 0, 0, 0, 3, 1118481, 3390259, 0, 4500, 0, 803, 1, 11, 4278211840, 1, 16, 16, 8, 8, 5, 0, 100, 10, 0, 100, 0, 0, 0, 0, 2, 2, 2, 10, 5, 1E3, 200, 4, 720, 0, 90, 0, 90, 100, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 600, 6, 20, 64, 5, 66, 10, 0, 0, 87, 60];
enemyCatalog[46] = [23, 5, 6, 6, 12, 1, 0, 14540032, 1572864, 3300, 0, 1504, 1, 6, 4292730112, 1, 16, 16, 8, 8, 0, 40, 300, 10, 1, 100, 0, 4, 0, 0, 1, 9, 15, 200, 150, 20, 200, 3, 0, 0, 80, 80, 100, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 400, 70, 20, 65, 5, 0, 0, 0, 0, 87, 200];
enemyCatalog[47] = [24, 10, 0, 0, 9, .6, 6724095, 14697, 14697, 700, 1, 0, 2, 9, 4294954035, 2, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 3, 4, 1, 10, 50, 20, 20, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 1, 40, 0, 0, 0, 0, 0, 0, 113, 1E3];
enemyCatalog[48] = [24, 2, 0, 0, 20, .6, 4204560, 15658734, 4204560, 600, 1, 0, 2, 20, 4294906129, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 1, 1, 1, 10, 20, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 3, 40, 91, 99, 0, 0, 0, 0, 113, 1E3];
enemyCatalog[49] = [25, 5, 2, 5, 9, 1, 6710784, 102, 3368448, 900, 0, 104, 0, 2, 4293853149, 1, 16, 16, 4, 4, 40, 15, 150, 10, 3, 100, 0, 4, 0, 0, 4, 4, 3, 120, 150, 20, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 2, 40, 90, 99, 0, 0, 0, 0, 113, 1E3];
enemyCatalog[50] = [26, 0, 0, 0, 16, 2, 16750848, 10027161, 0, 8E3, 0, 2, 1, 15, 4278190080, 1, 16, 16, 8, 8, 0, 15, 400, 10, 0, 100, 0, 0, 0, 0, 20, 25, 1, 10, 50, 10, 400, 0, 0, 0, 100, 100, 100, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 50, 80, 93, 9, 96, 9, 0, 0, 113, 100];
enemyCatalog[51] = [27, 10, 0, 0, 14, 1, 26316, 10066176, 10066176, 9E3, 0, 1603, 0, 53, 4294958387, 2, 16, 16, 4, 4, 0, 90, 270, 10, 0, 100, 0, 3, 0, 0, 1, 7, 32, 7, 50, 5, 100, 3, 0, 0, 100, 0, 100, 100, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 600, 70, 80, 89, 7, 95, 7, 0, 0, 113, 50];
enemyCatalog[52] = [27, 0, 0, 0, 16, 4, 16750848, 3342489, 0, 32E3, 0, 4, 1, 15, 4278190080, 1, 32, 32, 16, 16, 0, 60, 300, 10, 1, 100, 0, 4, 0, 0, 80, 100, 1, 200, 500, 1E3, 200, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 500, 80, 92, 7, 94, 9, 97, 9, 113, 100];
enemyCatalog[53] = [26, 8, 6, 10, 17, 1, 16764006, 21913, 13408512, 1200, 1, 0, 2, 17, 4284874752, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 1, 6, 1, 10, 50, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 1, 40, 101, 99, 0, 0, 0, 0, 115, 1E3];
enemyCatalog[54] = [28, 8, 6, 10, 17, 2, 16764006, 0, 4456448, 2E4, 0, 103, 1, 28, 4294923537, 2, 48, 48, 32, 32, 0, 0, 900, 10, 0, 99, 0, 3, 0, 0, 2, 3, 3, 10, 250, 20, 100, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 150, 80, 102, 20, 0, 0, 0, 0, 115, 100];
enemyCatalog[55] = [26, 0, 0, 0, 0, 1, 3394611, 4456584, 0, 800, 1, 0, 2, 0, 4291559679, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 3, 3, 1, 10, 50, 20, 20, 4, 300, 0, 100, 0, 0, 100, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 20, 40, 67, 99, 0, 0, 0, 0, 115, 1E3];
enemyCatalog[56] = [27, 5, 4, 4, 15, 1, 16764057, 10053171, 2236962, 11E3, 0, 2, 1, 7, 4279308561, 1, 16, 16, 4, 4, 0, 0, 1E3, 10, 0, 100, 0, 0, 0, 0, 10, 15, 1, 10, 50, 15, 600, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 300, 100, 60, 100, 7, 0, 0, 0, 0, 115, 100];
enemyCatalog[57] = [27, 5, 3, 3, 15, 1, 16751052, 10040166, 4456448, 11E3, 0, 203, 0, 3, 4294923537, 2, 16, 16, 8, 8, 30, 0, 600, 10, 0, 99, 0, 0, 0, 0, 2, 3, 20, 10, 250, 20, 150, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 300, 100, 60, 99, 9, 0, 0, 0, 0, 115, 100];
enemyCatalog[58] = [27, 6, 6, 6, 15, 1, 10079487, 3368601, 10066380, 11E3, 0, 4, 1, 7, 4288269567, 2, 16, 16, 4, 4, 30, 30, 200, 10, 2, 100, 0, 4, 0, 0, 5, 10, 20, 120, 250, 20, 200, 2, 50, 0, 100, 100, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 300, 100, 60, 98, 8, 0, 0, 0, 0, 115, 100];
enemyCatalog[59] = [27, 10, 0, 0, 17, .6, 16763904, 6710784, 13056, 700, 1, 0, 2, 17, 4278203136, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 1, 7, 1, 10, 50, 20, 20, 0, 0, 0, 90, 0, 90, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 7, 40, 103, 99, 0, 0, 2, 7, 117, 1E3];
enemyCatalog[60] = [28, 1, 0, 0, 9, 1, 39219, 6684825, 6684825, 600, 1, 0, 2, 9, 4291559475, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 4, 4, 1, 10, 50, 20, 20, 4, 300, 0, 0, 0, 0, 100, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 8, 40, 68, 99, 0, 0, 2, 8, 117, 1E3];
enemyCatalog[61] = [29, 3, 2, 0, 17, 1, 10066329, 0, 10027008, 2500, 0, 3, 1, 36, 4294927974, 1, 16, 16, 8, 8, 0, 0, 100, 10, 0, 100, 0, 0, 0, 0, 5, 6, 1, 10, 50, 20, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 300, 9, 60, 106, 30, 0, 0, 2, 9, 117, 1E3];
enemyCatalog[62] = [29, 6, 4, 11, 15, 1, 13408512, 1127168, 3368448, 8E3, 0, 4, 0, 2, 4288243200, 1, 16, 16, 4, 4, 30, 30, 200, 10, 2, 100, 0, 3, 0, 0, 5, 5, 20, 120, 500, 1E3, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 10, 60, 105, 15, 0, 0, 2, 10, 117, 1E3];
enemyCatalog[63] = [30, 0, 0, 0, 16, 4, 5592405, 1118481, 0, 33E3, 0, 0, 0, 0, 4278190080, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 0, 0, 1, 10, 50, 0, 20, 0, 0, 1E3, 100, 100, 100, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1E3, 1E3, 80, 104, 7, 107, 7, 0, 0, 117, 100];
enemyCatalog[64] = [30, 10, 0, 0, 17, .6, 15601920, 1118464, 15645440, 2100, 1, 0, 2, 17, 4278203136, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 1, 7, 1, 10, 50, 20, 20, 0, 0, 0, 90, 0, 90, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 7, 80, 0, 0, 0, 0, 0, 0, 117, 50];
enemyCatalog[65] = [29, 10, 0, 0, 17, .6, 6724095, 14697, 14697, 800, 1, 0, 2, 17, 4294954035, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 3, 4, 1, 10, 50, 20, 20, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 5, 40, 112, 99, 0, 0, 0, 0, 119, 1E3];
enemyCatalog[66] = [29, 10, 0, 0, 17, .6, 10066329, 14697, 14697, 800, 1, 0, 2, 17, 4294967295, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 3, 4, 1, 10, 50, 20, 20, 0, 0, 100, 100, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 5, 40, 109, 99, 0, 0, 0, 0, 119, 1E3];
enemyCatalog[67] = [30, 10, 0, 0, 17, .6, 15597738, 1118464, 15645440, 800, 1, 0, 2, 17, 4280418321, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 1, 8, 1, 10, 50, 20, 20, 0, 0, 100, 0, 90, 90, 90, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 25, 40, 108, 99, 0, 0, 0, 0, 119, 500];
enemyCatalog[68] = [29, 1, 0, 0, 5, .6, 4491519, 14697, 14697, 2400, 1, 0, 2, 5, 4294954035, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 4, 4, 1, 10, 50, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 5, 40, 110, 99, 0, 0, 0, 0, 119, 1E3];
enemyCatalog[69] = [31, 5, 6, 6, 14, 1, 10053273, 2232610, 3342387, 28E3, 0, 2, 1, 15, 4281532467, 1, 16, 16, 8, 8, 0, 0, 560, 10, 1, 100, 0, 3, 0, 0, 15, 15, 1, 10, 50, 15, 600, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 250, 60, 111, 4, 0, 0, 0, 0, 119, 100];
enemyCatalog[70] = [32, 3, 20, 0, 17, 3, 10066329, 0, 10027008, 99999, 0, 3, 0, 24, 4288256409, 1, 16, 16, 4, 4, 0, 20, 500, 10, 0, 100, 0, 0, 0, 0, 3, 3, 3, 10, 10, 1E3, 600, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1E3, 1E3, 100, 69, 3, 0, 0, 0, 0, 119, 25];
enemyCatalog[71] = [30, 0, 0, 0, 21, 1, 3381555, 8704, 0, 900, 1, 0, 2, 21, 4294901862, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 4, 5, 1, 10, 50, 20, 20, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 6, 50, 124, 99, 0, 0, 0, 0, 136, 1E3];
enemyCatalog[72] = [32, 5, 3, 7, 18, 2, 16763904, 10053171, 2113536, 2E4, 0, 104, 0, 1, 4291598694, 1, 16, 16, 4, 4, 60, 0, 1E3, 10, .5, 100, 0, 4, 0, 0, 3, 3, 20, 200, 120, 20, 600, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 300, 300, 50, 125, 10, 0, 0, 0, 0, 136, 100];
enemyCatalog[73] = [30, 2, 0, 0, 18, .6, 10066329, 14540253, 5259312, 1100, 1, 0, 2, 18, 4294906129, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 1, 1, 1, 10, 30, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 3, 50, 121, 99, 0, 0, 0, 0, 136, 1E3];
enemyCatalog[74] = [32, 0, 0, 0, 4, 4, 6710784, 1118481, 0, 3E4, 0, 3, 0, 28, 4294967057, 2, 32, 32, 24, 24, 0, 90, 100, 10, 0, 99, 0, 3, 0, 0, 1, 33, 1, 10, 50, 20, 100, 3, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 500, 100, 123, 50, 0, 0, 0, 0, 136, 1E3];
enemyCatalog[75] = [33, 0, 0, 0, 4, 4, 6684672, 1118481, 0, 6E4, 0, 103, 0, 9, 4294927889, 2, 16, 16, 16, 16, 40, 0, 100, 5, -1, 99, 0, 0, 0, 0, 2, 3, 30, 10, 50, 20, 100, 1, 2, 0, 100, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1500, 30, 100, 70, 4, 0, 0, 0, 0, 136, 50];
enemyCatalog[76] = [33, 1, 0, 0, 3, 2, 21913, 39372, 13158, 2E4, 0, 3, 0, 53, 4278229452, 2, 16, 16, 8, 8, 0, 170, 180, 10, 0, 98, 0, 3, 0, 0, 4, 6, 24, 10, 300, 1E3, 200, 2, 80, 0, 100, 100, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1500, 50, 100, 122, 9, 0, 0, 0, 0, 136, 1E3];
enemyCatalog[77] = [33, 5, 3, 3, 19, 2, 13421568, 13369344, 2236962, 3E4, 0, 2, 1, 35, 4294967057, 2, 16, 16, 12, 6, 0, 80, 180, 10, 0, 100, 0, 0, 0, 0, 1, 33, 1, 8, 50, 20, 80, 3, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 300, 900, 100, 126, 15, 0, 0, 0, 0, 137, 1E3];
enemyCatalog[78] = [34, 1, 0, 0, 8, 3, 13408614, 6697728, 10053171, 8E4, 1, 0, 2, 8, 4291559424, 1, 48, 48, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 3, 3, 1, 10, 25, 100, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1E3, 10, 100, 127, 15, 0, 0, 0, 0, 137, 100];
enemyCatalog[79] = [32, 4, 0, 0, 19, 1, 6697728, 13408614, 10053171, 3E3, 1, 0, 2, 19, 4294901760, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 3, 3, 1, 10, 100, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 5, 50, 0, 0, 0, 0, 0, 0, 137, 1E3];
enemyCatalog[80] = [34, 3, 10, 0, 19, 1, 13421568, 13369344, 2236962, 3E3, 0, 3, 1, 35, 4294967057, 2, 16, 16, 8, 8, 0, 100, 600, 10, 0, 100, 0, 3, 0, 0, 1, 33, 1, 20, 100, 20, 400, 3, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1E3, 900, 100, 128, 5, 0, 0, 0, 0, 137, 25];
enemyCatalog[81] = [31, 10, 0, 0, 18, .6, 6724095, 14697, 14697, 2E3, 1, 0, 2, 18, 4294901760, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 1, 5, 1, 10, 100, 20, 20, 0, 0, 0, 100, 0, 100, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 9, 50, 0, 0, 0, 0, 2, 9, 137, 1E3];
enemyCatalog[82] = [35, 10, 0, 0, 2, 1, 13421568, 13369344, 6724095, 4E3, 0, 3, 1, 35, 4294914833, 2, 16, 16, 8, 8, 0, 100, 900, 10, 0, 100, 0, 3, 0, 0, 1, 66, 1, 20, 100, 20, 300, 3, 0, 0, 100, 0, 100, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1E3, 900, 100, 130, 5, 0, 0, 2, 900, 137, 100];
enemyCatalog[83] = [34, 5, 4, 4, 19, 2, 52224, 13369344, 2236962, 3E4, 0, 2, 1, 35, 4279369489, 2, 16, 16, 12, 6, 0, 0, 180, 10, 0, 100, 0, 0, 0, 0, 5, 5, 1, 8, 50, 20, 80, 4, 300, 0, 0, 0, 0, 100, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 300, 10, 100, 129, 45, 0, 0, 0, 0, 137, 1E3];
enemyCatalog[84] = [33, 4, 0, 0, 19, 1, 6697728, 13421568, 10053171, 1500, 1, 0, 2, 19, 4294901760, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 3, 3, 1, 10, 100, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 5, 50, 0, 0, 0, 0, 0, 0, 138, 1E3];
enemyCatalog[85] = [35, 5, 4, 4, 13, 1, 5574929, 10031377, 10057591, 15E3, 0, 204, 0, 9, 4294927889, 2, 16, 16, 16, 16, 20, 0, 200, 10, -1, 100, 0, 0, 0, 0, 2, 3, 8, 100, 300, 20, 64, 1, 1, 0, 100, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1E3, 9, 100, 131, 5, 0, 0, 0, 0, 138, 100];
enemyCatalog[86] = [35, 0, 0, 0, 16, 4, 10079436, 6710988, 0, 35E3, 1, 0, 2, 16, 4278190284, 1, 64, 64, 40, 28, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 5, 5, 1, 10, 100, 20, 32, 2, 90, 0, 100, 100, 100, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1500, 8, 100, 133, 4, 0, 0, 0, 0, 138, 100];
enemyCatalog[87] = [34, 4, 0, 0, 19, 1, 10040064, 13421568, 15658496, 2500, 1, 0, 2, 19, 4294901760, 1, 16, 16, 32, 32, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 4, 4, 1, 10, 100, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 777, 50, 135, 50, 0, 0, 2, 333, 138, 1E3];
enemyCatalog[88] = [36, 6, 12, 12, 13, 1, 13408512, 10027161, 2228258, 5E3, 0, 104, 0, 24, 4288217241, 1, 16, 16, 4, 4, 50, 50, 500, 10, .5, 100, 0, 4, 0, 0, 4, 4, 5, 300, 600, 20, 160, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 400, 6, 100, 134, 50, 0, 0, 0, 0, 138, 1E3];
enemyCatalog[89] = [36, 4, 0, 0, 19, 2, 6697728, 13421568, 10053171, 25E3, 1, 0, 2, 19, 4294901760, 1, 32, 32, 32, 64, 0, 0, 0, 10, 0, 100, 0, 0, 0, 0, 6, 6, 1, 10, 50, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4278190080, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 800, 5, 100, 132, 50, 0, 0, 0, 0, 138, 100];

const // Dispatch-table indices
    enemySlimeBehaviorIdx = 0,  // pk, 
    enemyBoxSnakeBehaviorIdx = 1,  // qk, 
    enemyBatBehaviorIdx = 2,  // rk, 
    enemyDragonBehaviorIdx = 3,  // sk, 
    enemyStickmanBehaviorIdx = 4,  // tk, 
    enemyTreeBehaviorLeftIdx = 5,  // uk, 
    enemyTreeBehaviorRightIdx = 6,  // vk, 
    enemyHangingTreeBehaviorIdx = 7,  // wk, 
    enemyUpdateFunc7Idx = 8,  // xk, 
    enemyUpdateFunc9Idx = 9,  // yk, 
    enemyUpdateFunc10Idx = 10, // zk, 
    enemyStickmanBehaviorAltIdx = 11; // Ak, 

let enemyJointPosArray = Array(999), // Q, 
    enemyPrevJointPosArray = Array(999); // Z, 

for (let _i = 0; 999 > _i; _i++) enemyPrevJointPosArray[_i] = Array(21);
for (let _i = 0; 999 > _i; _i++) enemyJointPosArray[_i] = Array(21);

for (let _i = 0; 999 > _i; _i++)
    for (let iterIdxTemp_2 = 0; 21 > iterIdxTemp_2; iterIdxTemp_2++)
        enemyJointPosArray[_i][iterIdxTemp_2] = new Vec2;

for (let _i = 0; 999 > _i; _i++)
    for (let iterIdxTemp_2 = 0; 21 > iterIdxTemp_2; iterIdxTemp_2++)
        enemyPrevJointPosArray[_i][iterIdxTemp_2] = new Vec2;

let enemyTypeArray = new Int32Array(999), // 
    enemyUpdateFuncIdxArray = new Int32Array(999),
    enemyPoseTrailWriteIdxArray  = new Int32Array(999), // Y , 
    enemyDeathTimerArray = new Int32Array(999), // Ck, 
    enemyTileContactFlagsArray = new Int32Array(999), // Dk, 
    enemySpawnGroupIdxArray = new Int32Array(999), // fj, 
    enemyHealthArray = new Int32Array(999),
    enemyAuxStateArray = new Int32Array(999), // Ek
    enemyActionCooldownTimerArray = new Int32Array(999), // Fk
    enemySkipDurationLeftArray = new Int32Array(999),
    enemyUpdateSkipProbArray = new Int32Array(999),
    enemyDmgDurationLeftArray = new Int32Array(999),
    enemyDmgPerFrameArray = new Int32Array(999),
    enemyFreezeTimerArray = new Int32Array(999),
    enemyCount = 0,
    enemyTargetJointIdx = 20, // yi, default enemy joint index used as the target/aim/spawn point for projectiles and AI
    stageMaxEnemyLevel = 0,  // $i, maximum enemy level among spawned enemies (used for reward/EXP scaling)
    enemyHitboxHalfWidthByBehavior = [8, 10, 10, 10, 9, 4, 4, 10, 9, 8, 10, 10], // Lk
    enemyHitboxHalfHeightByBehavior = [8, 10, 10, 10, 12, 24, 24, 10, 9, 8, 10, 10], // Mk
    enemySpriteAnchorYBySpriteIndex = [4, 4, 5, 4, 4, 4, 5, 5, 4, 3, 5, 5, 5, 5, 6, 7, 3, 0, 2, 2, 2, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Nk
    enemyDispatchTable = [
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


function clearEnemies() {
    stageMaxEnemyLevel = enemyCount = 0
}


/** spawns an enemy at coordinates (8 * gridX, 8 * gridY) */
function spawnEnemy(gridX, gridY, enemyType, d) {
    if (999 != enemyCount) {
        gridX *= 8;
        gridY *= 8;
        for (var f = 0; 21 > f; f++)
            Vec2Set(enemyJointPosArray[enemyCount][f], gridX + randFloat(1), gridY + randFloat(1)),
                enemyPrevJointPosArray[enemyCount][f].set(enemyJointPosArray[enemyCount][f]);

        enemyTypeArray[enemyCount] = enemyType;
        enemyUpdateFuncIdxArray[enemyCount] = enemyCatalog[enemyType][enemyBehaviorIdxCol];
        enemyPoseTrailWriteIdxArray[enemyCount] = 0;
        enemyDeathTimerArray[enemyCount] = 0;
        enemyTileContactFlagsArray[enemyCount] = 0;
        enemySpawnGroupIdxArray[enemyCount] = d;
        enemyHealthArray[enemyCount] = enemyCatalog[enemyType][enemyHealthCol];
        enemyAuxStateArray[enemyCount] = 0;
        enemyActionCooldownTimerArray[enemyCount] = enemyCatalog[enemyType][enemyPArg22Col];
        enemySkipDurationLeftArray[enemyCount] = 0;
        enemyUpdateSkipProbArray[enemyCount] = 0;
        enemyDmgDurationLeftArray[enemyCount] = 0;
        enemyDmgPerFrameArray[enemyCount] = 0;
        enemyFreezeTimerArray[enemyCount] = 0;
        enemyCount++
    }
}


// swaps the last enemy entry with the selected one
// and decrements the enemyCount variable to invalidate it
function deleteEnemy(enemyIdx) {
    for (var b = 0; 21 > b; b++)
        enemyJointPosArray[enemyIdx][b].set(enemyJointPosArray[enemyCount - 1][b]),
            enemyPrevJointPosArray[enemyIdx][b].set(enemyPrevJointPosArray[enemyCount - 1][b]);
    enemyTypeArray[enemyIdx] = enemyTypeArray[enemyCount - 1];
    enemyUpdateFuncIdxArray[enemyIdx] = enemyUpdateFuncIdxArray[enemyCount - 1];
    enemyPoseTrailWriteIdxArray[enemyIdx] = enemyPoseTrailWriteIdxArray[enemyCount - 1];
    enemyDeathTimerArray[enemyIdx] = enemyDeathTimerArray[enemyCount - 1];
    enemyTileContactFlagsArray[enemyIdx] = enemyTileContactFlagsArray[enemyCount - 1];
    enemySpawnGroupIdxArray[enemyIdx] = enemySpawnGroupIdxArray[enemyCount - 1];
    enemyHealthArray[enemyIdx] = enemyHealthArray[enemyCount - 1];
    enemyAuxStateArray[enemyIdx] = enemyAuxStateArray[enemyCount - 1];
    enemyActionCooldownTimerArray[enemyIdx] = enemyActionCooldownTimerArray[enemyCount - 1];
    enemySkipDurationLeftArray[enemyIdx] = enemySkipDurationLeftArray[enemyCount - 1];
    enemyUpdateSkipProbArray[enemyIdx] = enemyUpdateSkipProbArray[enemyCount - 1];
    enemyDmgDurationLeftArray[enemyIdx] = enemyDmgDurationLeftArray[enemyCount - 1];
    enemyDmgPerFrameArray[enemyIdx] = enemyDmgPerFrameArray[enemyCount - 1];
    enemyFreezeTimerArray[enemyIdx] = enemyFreezeTimerArray[enemyCount - 1];
    enemyCount--
}


function moveEnemyJointWithTileCollision(enemyIdx, jointIdx, bounceScale) { // $k
    let d = new Vec2();
    Vec2Sub(d, enemyJointPosArray[enemyIdx][jointIdx], enemyPrevJointPosArray[enemyIdx][jointIdx]);
    enemyJointPosArray[enemyIdx][jointIdx].set(enemyPrevJointPosArray[enemyIdx][jointIdx]);
    let f = (Vec2Mag(d) >> 2) + 1;
    Vec2Scale(d, 1 / f);
    for (let g, h, k = 0; k < f; k++) {
        g = enemyJointPosArray[enemyIdx][jointIdx].y + d.y;
        h = getStageTileAt(enemyJointPosArray[enemyIdx][jointIdx].x, g);
        if (0 > g || 8 * stageHeight <= g) {
            enemyTileContactFlagsArray[enemyIdx] |= 2;
        } else if (0 <= h && 25 >= h) {
            if (0 < d.y) {
                enemyTileContactFlagsArray[enemyIdx] |= 2;
            }
            d.x *= bounceScale;
            d.y = -d.y;
        } else if (26 <= h && 26 >= h && 0 < d.y) {
            enemyTileContactFlagsArray[enemyIdx] |= 2;
            d.x *= bounceScale;
            d.y = -d.y;
        } else {
            enemyJointPosArray[enemyIdx][jointIdx].y = g;
        }
        g = enemyJointPosArray[enemyIdx][jointIdx].x + d.x;
        h = getStageTileAt(g, enemyJointPosArray[enemyIdx][jointIdx].y);
        if (0 > g || 640 <= g) {
            enemyTileContactFlagsArray[enemyIdx] |= 1;
        } else if (0 <= h && 25 >= h) {
            d.y *= bounceScale;
            d.x = -d.x;
            enemyTileContactFlagsArray[enemyIdx] |= 1;
        } else if (27 <= h && 29 >= h) {
            d.y *= bounceScale;
            d.x = -d.x;
            enemyTileContactFlagsArray[enemyIdx] |= 1;
        } else {
            enemyJointPosArray[enemyIdx][jointIdx].x = g;
        }
    }
}


/**
 * finds the closest living enemy to a center point inside an axis-aligned rectangle that is not blocked by stage tiles (ray-stepped line-of-sight check). Returns the index of that enemy or -1 if none found.
 */
function findEnemyInArea(cx, cy, rx, ry) { // Ei
    let f = cx - rx,
        g = cy - ry;
    rx = cx + rx;
    ry = cy + ry; 
    let t = new Vec2();
    let l = new Vec2();
    let n = 1E3;
    let w = -1;
    for (let _i = 0; _i < enemyCount; _i++)
        if (0 != enemyHealthArray[_i]) {
            let h = enemyHitboxHalfWidthByBehavior[enemyCatalog[enemyTypeArray[_i]][enemyBehaviorIdxCol]] * enemyCatalog[enemyTypeArray[_i]][enemyDrawScaleCol];
            let k = enemyHitboxHalfHeightByBehavior[enemyCatalog[enemyTypeArray[_i]][enemyBehaviorIdxCol]] * enemyCatalog[enemyTypeArray[_i]][enemyDrawScaleCol];
            if (enemyUpdateFuncIdxArray[_i] == enemyTreeBehaviorLeftIdx || enemyUpdateFuncIdxArray[_i] == enemyTreeBehaviorRightIdx)
                k = 3 * enemyPoseTrailWriteIdxArray[_i] + 5 * enemyCatalog[enemyTypeArray[_i]][enemyDrawScaleCol];
            let p = enemyJointPosArray[_i][enemyTargetJointIdx];
            if (!(p.x - h > rx || p.x + h < f || p.y - k > ry || p.y + k < g)) {
                l.x = p.x - cx;
                l.y = p.y - cy;
                k = Vec2Mag(l);
                h = (k >> 3) + 1;
                Vec2Scale(l, 1 / h);
                Vec2Set(t, cx, cy);
                for (var M = 0; M <= h; M++) {
                    p = getStageTileAt(t.x, t.y);
                    if (0 <= p && 29 >= p) break;
                    t.add(l);
                }
                if (M > h && k < n) {
                    n = k;
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
function applyEffectToEnemies(applyFlag, shapeMode, maxTargets, effectType, effectDuration, damageMin, damageMax, centerPos, directionVec, width, height) { // al
    let n = -1,
        w, B, M, J, y, x, K = new Vec2(),
        ba = new Vec2(),
        U, na;
    width *= .5;
    height *= .5;
    if (0 == shapeMode) {
        w = centerPos.x - width;
        B = centerPos.y - height;
        M = centerPos.x + width;
        J = centerPos.y + height;
    } else if (1 == shapeMode) {
        Vec2Norm(directionVec);
        Vec2Scale(directionVec, height);
        w = min(centerPos.x - directionVec.x, centerPos.x + directionVec.x);
        B = min(centerPos.y - directionVec.y, centerPos.y + directionVec.y);
        M = max(centerPos.x - directionVec.x, centerPos.x + directionVec.x);
        J = max(centerPos.y - directionVec.y, centerPos.y + directionVec.y);
    }
    

    for (height = 0; height < enemyCount; height++)
        if (0 != enemyHealthArray[height]) {
            x = enemyJointPosArray[height][enemyTargetJointIdx];
            y = enemyHitboxHalfWidthByBehavior[enemyUpdateFuncIdxArray[height]] * enemyCatalog[enemyTypeArray[height]][enemyDrawScaleCol];
            width = enemyHitboxHalfHeightByBehavior[enemyUpdateFuncIdxArray[height]] * enemyCatalog[enemyTypeArray[height]][enemyDrawScaleCol];
            if (enemyUpdateFuncIdxArray[height] == enemyTreeBehaviorLeftIdx || enemyUpdateFuncIdxArray[height] == enemyTreeBehaviorRightIdx)
                width = 3 * enemyPoseTrailWriteIdxArray[height] + 5 * enemyCatalog[enemyTypeArray[height]][enemyDrawScaleCol];
            if (!(x.x - y > M || x.x + y < w || x.y - width > J || x.y + width < B)) {
                if (0 == shapeMode) {
                    ba.x = x.x - centerPos.x;
                    ba.y = x.y - centerPos.y;
                    U = Vec2Mag(ba);
                    U = (U >> 3) + 1;
                    Vec2Scale(ba, 1 / U);
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
                    U = Vec2Mag(ba);
                    U = (U >> 3) + 1;
                    Vec2Scale(ba, 1 / U);
                    Vec2Sub(K, centerPos, directionVec);
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
                    n = damageMin + floor(randFloat(damageMax - damageMin + 1));
                    if (4 == effectType) {
                        enemyDmgPerFrameArray[height] = max(
                            enemyDmgPerFrameArray[height],
                            max(1, n - floor(n * enemyCatalog[enemyTypeArray[height]][enemyPoisonResistPctCol] / 100))
                        );
                        enemyDmgDurationLeftArray[height] = max(
                            enemyDmgDurationLeftArray[height],
                            effectDuration - floor(effectDuration * enemyCatalog[enemyTypeArray[height]][enemyPoisonResistPctCol] / 100)
                        );
                    } else {
                        if (0 == effectType) {
                            n = max(1, n - enemyCatalog[enemyTypeArray[height]][enemyPhysResistPctCol]);
                        } else if (1 == effectType) {
                            n = max(1, n - floor(n * enemyCatalog[enemyTypeArray[height]][enemyFireResistPctCol] / 100));
                        } else if (2 == effectType) {
                            n = max(1, n - floor(n * enemyCatalog[enemyTypeArray[height]][enemyIceResistPctCol] / 100));
                        } else {
                            3 == effectType && (n = max(1, n - floor(n * enemyCatalog[enemyTypeArray[height]][enemyLightResistPctCol] / 100)));
                        }
                        enemyHealthArray[height] = max(enemyHealthArray[height] - n, 0);
                        spawnPopup(enemyJointPosArray[height][enemyTargetJointIdx].x, enemyJointPosArray[height][enemyTargetJointIdx].y - width, 0 > ba.x ? -1 : 1, n, 60, 12632256);
                        stage_totalDamageDealt += n;
                    }
                    if (2 == effectType) {
                        enemySkipDurationLeftArray[height] = 120 - floor(120 * enemyCatalog[enemyTypeArray[height]][enemyIceResistPctCol] / 100);
                        enemyUpdateSkipProbArray[height] = effectDuration - floor(effectDuration * enemyCatalog[enemyTypeArray[height]][enemyIceResistPctCol] / 100);
                    } else {
                        5 == effectType && (enemyFreezeTimerArray[height] = effectDuration - floor(effectDuration * enemyCatalog[enemyTypeArray[height]][enemyFreezeResistPctCol] / 100));
                    }

                    enemyAuxStateArray[height] = 120;
                    30 != gameScreenState && (comboWindowTimer = comboWindowMaxFrames);
                    isBadgeIncompleteForCurrentStage(11) && 17 == enemyTypeArray[height] && 0 != effectType && stageConditionMask++;
                    isBadgeIncompleteForCurrentStage(41) && 45 == enemyTypeArray[height] && 0 == effectType && stageConditionMask++;
                }

                n = height;
                maxTargets--;
                if (0 >= maxTargets) break;
            }
        } return n; // index of a hit enemy (last one hit), or -1 if none.
}


function spawnEnemyLoot(enemyIdx, lootVariant, _px, _py) { // bl
    let itemPos = new Vec2(),
        itemIdx = enemyTypeArray[enemyIdx] + lootVariant,
        selectedItem = enemyCatalog[itemIdx];
    lootVariant = -enemyIdx - 1;
    let k = selectedItem[enemyProjectileAttachModeCol];
    if (0 == k) {
        k = -1;
    } else if (1 == k) {
        k = 0;
    } else if (2 == k) {
        k = 1;
    }
    
    let _s0 = selectedItem[enemyProjectileVisualPackCol] % 100,
        _s1 = floor(selectedItem[enemyProjectileVisualPackCol] / 100),
        _p0 = selectedItem[enemyPArg0Col],
        _p1 = selectedItem[enemyPArg1Col],
        _p2 = selectedItem[enemyPArg2Col],
        _p3 = selectedItem[enemyPArg3Col],
        _p4 = selectedItem[enemyPArg4Col],
        _p5 = selectedItem[enemyPArg5Col],
        _p6 = selectedItem[enemyPArg6Col],
        _p7 = selectedItem[enemyPArg7Col],
        _p8 = selectedItem[enemyPArg8Col],
        _p9 = selectedItem[enemyPArg9Col],
        _p10 = selectedItem[enemyPArg10Col],
        _p11 = selectedItem[enemyPArg11Col],
        _p12 = selectedItem[enemyPArg12Col],
        _p13 = selectedItem[enemyPArg13Col],
        _p14 = selectedItem[enemyPArg14Col],
        _p15 = selectedItem[enemyPArg15Col],
        _p16 = selectedItem[enemyPArg16Col],
        _p17 = selectedItem[enemyPArg17Col],
        _p18 = selectedItem[enemyPArg18Col],
        _p19 = selectedItem[enemyPArg19Col],
        _p20 = selectedItem[enemyPArg20Col],
        _p21 = selectedItem[enemyPArg21Col],
        _p22 = selectedItem[enemyPArg22Col],
        _p23 = selectedItem[enemyPArg23Col],
        _p24 = selectedItem[enemyPArg24Col],
        _p25 = selectedItem[enemyPArg25Col],
        _p26 = selectedItem[enemyPArg26Col],
        _p27 = selectedItem[enemyPArg27Col],
        _p28 = selectedItem[enemyPArg28Col],
        _p29 = selectedItem[enemyPArg29Col],
        _p30 = selectedItem[enemyPArg30Col],
        _p31 = selectedItem[enemyPArg31Col],
        _p32 = selectedItem[enemyPArg32Col],
        _p33 = selectedItem[enemyPArg33Col],
        _p34 = selectedItem[enemyPArg34Col],
        _p35 = selectedItem[enemyPArg35Col],
        _p36 = selectedItem[enemyPArg36Col],
        _p37 = selectedItem[enemyPArg37Col],
        _p38 = selectedItem[enemyPArg38Col],
        _p39 = selectedItem[enemyPArg39Col],
        _p40 = selectedItem[enemyPArg40Col],
        _p41 = selectedItem[enemyPArg41Col],
        _p42 = selectedItem[enemyPArg42Col],
        _p43 = selectedItem[enemyPArg43Col],
        _p44 = selectedItem[enemyPArg44Col];

    let _foundHero = findNearestPartyMemberInRect(_px, _py, _p24, _p24, 0);
    if (_foundHero == -1)
        return;
    
    if (0 < enemyActionCooldownTimerArray[enemyIdx]) {
        enemyActionCooldownTimerArray[enemyIdx]--;
    } else if (!(randFloat(1E3) >= _p23)) {
        enemyActionCooldownTimerArray[enemyIdx] = _p22;
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
            _p24 = _p22 < heroJointPositionsByHero[_foundHero][2].x ? .1 * _p21 : -.1 * _p21;
            for (_s0 = 0; _s0 < _p20; _s0++) {
                spawnProjectile(
                    lootVariant, k, _p22, _p23, _p24, 0, _p0, _p1, _p2, _p3, _p4, _p5, 0, _p6, _p7, _p8, _p9, _p10, _p11, 
                    0, _p12, _p13, _p14, _p15, _p16, 0, _p17, _p18, _p19, _p25, _p26, 0, _p27, 0, _p28, _p29, _p30, 
                    _p31, _p32, _p33, 0, _p34, _p35, 0, 0, _p36, _p37, 0, _p38, _p39, _p40, _p41, _p42, _p43, _p44
                );
            }
        } else if (3 == _s0 || 6 == _s0) {
            if (3 == _s0) {
                Vec2Set(itemPos, heroJointPositionsByHero[_foundHero][2].x - enemyJointPosArray[enemyIdx][enemyTargetJointIdx].x, heroJointPositionsByHero[_foundHero][2].y - enemyJointPosArray[enemyIdx][enemyTargetJointIdx].y);
            } else if (6 == _s0) {
                Vec2Set(itemPos, 0, -1);
            }
            itemIdx = (0 < _s1) ? _s1 : 16;
            enemyIdx = floor(512 * Vec2Angle(itemPos) / TAU);
            enemyIdx -= floor((_p20 - 1) * itemIdx / 2);
            for (_s0 = 0; _s0 < _p20; _s0++) {
                itemPos.x = rotationLUT[enemyIdx & 511][0];
                itemPos.y = -rotationLUT[enemyIdx & 511][1];
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
                Vec2Set(itemPos, heroJointPositionsByHero[_foundHero][2].x - enemyJointPosArray[enemyIdx][0].x, heroJointPositionsByHero[_foundHero][2].y - enemyJointPosArray[enemyIdx][0].y);
                itemIdx = 0 < _s1 ? _s1 - 1 : _p20;
                if (0 < _p20) {
                    _p24 = floor(randFloat(512));
                    itemIdx = randFloat(10) * itemIdx;
                    itemPos.x += rotationLUT[_p24][0] * itemIdx;
                    itemPos.y += rotationLUT[_p24][1] * itemIdx;
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
                _p22 = _px + randFloatRange(-_p24, _p24);
                _p23 = _py + randFloatRange(-_p24, 0);
                spawnProjectile(
                    lootVariant, k, _p22, _p23, 0, 0, _p0, _p1, _p2, _p3, _p4, _p5, 0, _p6, _p7, _p8, _p9, _p10, _p11, 
                    0, _p12, _p13, _p14, _p15, _p16, 0, _p17, _p18, _p19, _p25, _p26, 0, _p27, 0, _p28, _p29, 
                    _p30, _p31, _p32, _p33, 0, _p34, _p35, 0, 0, _p36, _p37, 0, _p38, _p39, _p40, _p41, _p42, 
                    _p43, _p44
                );
            } 
        } else if (7 == _s0) {
            for (_s0 = 0; _s0 < _p20; _s0++) {
                _p22 = floor(_px / 8);
                _p23 = floor(_py / 8);
                spawnEnemy(_p22, _p23, itemIdx + _p18, 0);
            }
        }
    }
    
}


function onEnemyDeath(_enemyIdx) { // cl
    let lvlDiff = abs(enemyCatalog[enemyTypeArray[_enemyIdx]][enemyLevelCol] - partyLevel);
    let expRewardValue = floor(enemyCatalog[enemyTypeArray[_enemyIdx]][enemyExpRewardCol] * (100 + partyEnemyHpBonusPercent) / 100);
    if (stageMaxEnemyLevel + 10 <= partyLevel) {
        expRewardValue = 0;
    } else if (10 > lvlDiff) {
        expRewardValue = floor(expRewardValue * (10 - lvlDiff) / 10);
    } else {
        expRewardValue = 1;
    }

    partyEXPAccum = clamp(partyEXPAccum + expRewardValue, 0, 9999999);
    if (LevelExpThresholds[partyLevel] <= partyEXPAccum && 99 > partyLevel) {
        partyLevel++;
        for (let _i = 0; 4 > _i; _i++) partySP[_i] += 2;
        levelUpPopupTimer = 60;
    }
    for (let _dropIdx = enemyDropTableStartIdxCol; _dropIdx < enemyDropTableStartIdxCol + 8; _dropIdx += 2) {
        let itemIdx = enemyCatalog[enemyTypeArray[_enemyIdx]][_dropIdx];
        if (0 != itemIdx) {
            let randComp = floor(100 * (100 + partyDropChanceBonusPercent) / 100);
            if (2 == itemIdx) {
                itemIdx = floor(enemyCatalog[enemyTypeArray[_enemyIdx]][_dropIdx + 1] * (100 + partyRewardValueBonusPercent) / 100);
                spawnDrop(enemyJointPosArray[_enemyIdx][0].x, enemyJointPosArray[_enemyIdx][0].y, 2, itemIdx, 0);
            } else if (rand() * enemyCatalog[enemyTypeArray[_enemyIdx]][_dropIdx + 1] * 100 < randComp) {
                if (1 > itemForgeLvls[itemIdx] && isDropTypeAbsent(itemIdx)) {
                    spawnDrop(enemyJointPosArray[_enemyIdx][0].x, enemyJointPosArray[_enemyIdx][0].y, itemIdx, 1, 0);    
                }
            }
        }
    }
    let val = floor(enemyCatalog[enemyTypeArray[_enemyIdx]][enemyGoldRewardCol] * (100 + partyRewardValueBonusPercent) / 100);
    if (1 > 3 * rand()) {
        spawnDrop(enemyJointPosArray[_enemyIdx][0].x, enemyJointPosArray[_enemyIdx][0].y, 2, val, 0);
    }
    if (30 != gameScreenState) {
        comboCount++;
    }
    if (isBadgeIncompleteForCurrentStage(2) && 3 == enemyTypeArray[_enemyIdx]) {
        IncrementBadgeCount(2);
    }
    if (isBadgeIncompleteForCurrentStage(5) && 4 == enemyTypeArray[_enemyIdx]) {
        IncrementBadgeCount(5);
    }
    if (3 == currentStage) {
        if (8 == enemyTypeArray[_enemyIdx]) {
            if (isBadgeIncompleteForCurrentStage(8) && 1800 > gameFrameCounter) {
                IncrementBadgeCount(8);
            }
            spawnPopup(enemyJointPosArray[_enemyIdx][0].x, enemyJointPosArray[_enemyIdx][0].y, 0, floor(gameFrameCounter / 60) + "SEC", 120, 10066431);
        }

        if (15 == enemyTypeArray[_enemyIdx]) {
            stageEncounterCounter++;
            if (3 == stageEncounterCounter) {
                if (isBadgeIncompleteForCurrentStage(9) && 600 > consecutiveConditionFrameCount) {
                    IncrementBadgeCount(9);    
                }
                spawnPopup(enemyJointPosArray[_enemyIdx][0].x, enemyJointPosArray[_enemyIdx][0].y, 0, "" + floor(consecutiveConditionFrameCount / 60) + "SEC", 120, 10066431);
            }
        }
    }
    if (5 == currentStage) {
        if (22 == enemyTypeArray[_enemyIdx]) {
            if (isBadgeIncompleteForCurrentStage(18) && 1200 > gameFrameCounter) {
                IncrementBadgeCount(18);
            }
            spawnPopup(enemyJointPosArray[_enemyIdx][0].x, enemyJointPosArray[_enemyIdx][0].y, 0, floor(gameFrameCounter / 60) + "SEC", 120, 10066431);
        }
    }
    if (isBadgeIncompleteForCurrentStage(22) && 28 == enemyTypeArray[_enemyIdx]) {
        IncrementBadgeCount(22);    
    }
    if (isBadgeIncompleteForCurrentStage(47) && !(50 != enemyTypeArray[_enemyIdx] && 52 != enemyTypeArray[_enemyIdx])) {
        IncrementBadgeCount(47);
    }
    if (51 == enemyTypeArray[_enemyIdx]) {
        if (isBadgeIncompleteForCurrentStage(49) && 1500 > gameFrameCounter) {
            IncrementBadgeCount(49);    
        }
        spawnPopup(enemyJointPosArray[_enemyIdx][0].x, enemyJointPosArray[_enemyIdx][0].y, 0, floor(gameFrameCounter / 60) + "SEC", 120, 10066431);
    }
    !isBadgeIncompleteForCurrentStage(52) || 56 != enemyTypeArray[_enemyIdx] && 57 != enemyTypeArray[_enemyIdx] && 58 != enemyTypeArray[_enemyIdx] || IncrementBadgeCount(52);
    if (63 == enemyTypeArray[_enemyIdx]) {
        if (isBadgeIncompleteForCurrentStage(58) && 3600 > gameFrameCounter) {
            IncrementBadgeCount(58);
        }
        spawnPopup(enemyJointPosArray[_enemyIdx][0].x, enemyJointPosArray[_enemyIdx][0].y, 0, floor(gameFrameCounter / 60) + "SEC", 120, 10066431);
    }
    if (isBadgeIncompleteForCurrentStage(69) && 72 == enemyTypeArray[_enemyIdx]) {
        IncrementBadgeCount(69);
    }
}


function updateEnemies() {
    var enemyIdx;
    for (enemyIdx = 0; enemyIdx < enemyCount; enemyIdx++) {
        if (0 < enemyDmgDurationLeftArray[enemyIdx] && 0 < enemyHealthArray[enemyIdx]) {
            enemyDmgDurationLeftArray[enemyIdx]--;
            var b = floor(enemyDmgPerFrameArray[enemyIdx] / 60),
                c = enemyDmgPerFrameArray[enemyIdx] - 60 * b;
            randFloat(60) < c && (b += 1);
            enemyHealthArray[enemyIdx] = max(enemyHealthArray[enemyIdx] - b, 0);
            stage_totalDamageDealt += b
        }
        if (0 < enemyFreezeTimerArray[enemyIdx] && 0 < enemyHealthArray[enemyIdx]) // effect type 5 in al
            enemyFreezeTimerArray[enemyIdx]--;
        else {
            // if (0 < Gk[enemyIdx] && 0 < enemyHealthArray[enemyIdx] && (Gk[enemyIdx]--, randFloat(100) < Hk[enemyIdx])) continue;
            if (0 < enemySkipDurationLeftArray[enemyIdx] && 0 < enemyHealthArray[enemyIdx]) { // effect type 2
                enemySkipDurationLeftArray[enemyIdx]--;
                if (randFloat(100) < enemyUpdateSkipProbArray[enemyIdx])
                    continue;
            }
            enemyIdx = enemyDispatchTable[enemyUpdateFuncIdxArray[enemyIdx]](enemyIdx)
        }
    }
}


function enemySlimeBehavior(enemyIdx) {

    var b, c = enemyCatalog[enemyTypeArray[enemyIdx]][enemyDrawScaleCol];
    if (0 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        enemyJointPosArray[enemyIdx][0].x += 4;
        enemyJointPosArray[enemyIdx][0].y += 6;
        for (b = 0; 1 > b; b++) enemyPrevJointPosArray[enemyIdx][b].set(enemyJointPosArray[enemyIdx][b]);
        enemyPoseTrailWriteIdxArray[enemyIdx] = randSelect(1, 2);
    } else if (1 == enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][0], enemyPrevJointPosArray[enemyIdx][0], .03, .99);
        if (0 < (enemyTileContactFlagsArray[enemyIdx] & 2) && 5 > randFloat(100)) {
            enemyJointPosArray[enemyIdx][0].x += randFloat(1 == enemyPoseTrailWriteIdxArray[enemyIdx] ? -.2 : .2);
            if (enemyJointPosArray[enemyIdx][0].y -= randFloat(.5)) {
                if (1 > randFloat(100)) {
                    enemyPoseTrailWriteIdxArray[enemyIdx] = randSelect(1, 2);
                }
            }
        }
        var d = enemySpriteAnchorYBySpriteIndex[enemyCatalog[enemyTypeArray[enemyIdx]][enemySpriteIndexCol]];
        spawnEnemyLoot(enemyIdx, 0, enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y - d * c + 1);
        enemyTileContactFlagsArray[enemyIdx] = 0;
        if (0 >= enemyHealthArray[enemyIdx])
            for (b = 0; 1 > b; b++) {
                enemyJointPosArray[enemyIdx][b].x += randFloatRange(-.3, .3);
                enemyJointPosArray[enemyIdx][b].y -= randFloatRange(1, 2);
            }
        for (b = 0; 1 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        enemyJointPosArray[enemyIdx][enemyTargetJointIdx].x = enemyJointPosArray[enemyIdx][0].x;
        enemyJointPosArray[enemyIdx][enemyTargetJointIdx].y = enemyJointPosArray[enemyIdx][0].y - d * c + 1;
        if (0 >= enemyHealthArray[enemyIdx]) {
            enemyPoseTrailWriteIdxArray[enemyIdx] = 3;
            onEnemyDeath(enemyIdx);
        }
    } else {
        for (b = 0; 1 > b; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        for (b = enemyTileContactFlagsArray[enemyIdx] = 0; 1 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        if (50 <= enemyDeathTimerArray[enemyIdx]++) {
            deleteEnemy(enemyIdx--);
        }
    }
    return enemyIdx;
}


function enemyBoxSnakeBehavior(enemyIdx) {
    var b, c = enemyCatalog[enemyTypeArray[enemyIdx]][enemyDrawScaleCol];
    if (0 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        enemyJointPosArray[enemyIdx][0].x += 2;
        enemyJointPosArray[enemyIdx][1].x += 3;
        enemyJointPosArray[enemyIdx][2].x += 4;
        for (b = 0; 3 > b; b++) enemyPrevJointPosArray[enemyIdx][b].set(enemyJointPosArray[enemyIdx][b]);
        enemyPoseTrailWriteIdxArray[enemyIdx] = 1;
    } else if (1 == enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][0], enemyPrevJointPosArray[enemyIdx][0], .05, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][1], enemyPrevJointPosArray[enemyIdx][1], .05, .9);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][2], enemyPrevJointPosArray[enemyIdx][2], .05, .9);
        var d = findNearestPartyMemberInRect(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, 200, 50, 0);
        if (-1 != d) {
            enemyJointPosArray[enemyIdx][0].x += heroJointPositionsByHero[d][2].x < enemyJointPosArray[enemyIdx][0].x ? -.001 : .001;
        }
        if (0 < (enemyTileContactFlagsArray[enemyIdx] & 2)) {
            b = 0;
            if (-1 != d) {
                b = heroJointPositionsByHero[d][2].x < enemyJointPosArray[enemyIdx][0].x ? -1 : 1;
            } else {
                b = randSelect(-1, 1);
            }
            if (10 > randFloat(100)) {
                enemyJointPosArray[enemyIdx][0].x += randFloatRange(.4, .6) * b;
                enemyJointPosArray[enemyIdx][0].y += randFloatRange(-1.5, -2);
            }
        }
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][1], 0, 0, .01);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][1], enemyJointPosArray[enemyIdx][2], 0, 0, .01);
        d = enemySpriteAnchorYBySpriteIndex[enemyCatalog[enemyTypeArray[enemyIdx]][enemySpriteIndexCol]];
        spawnEnemyLoot(enemyIdx, 0, enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y - d * c + 1);
        enemyTileContactFlagsArray[enemyIdx] = 0;
        if (0 >= enemyHealthArray[enemyIdx])
            for (b = 0; 3 > b; b++) {
                enemyJointPosArray[enemyIdx][b].x += randFloatRange(-.5, .5);
                enemyJointPosArray[enemyIdx][b].y -= randFloatRange(2, 3);
            }
        moveEnemyJointWithTileCollision(enemyIdx, 0, .5);
        b = enemyTileContactFlagsArray[enemyIdx];
        moveEnemyJointWithTileCollision(enemyIdx, 1, .5);
        moveEnemyJointWithTileCollision(enemyIdx, 2, .5);
        enemyTileContactFlagsArray[enemyIdx] = b;
        enemyJointPosArray[enemyIdx][enemyTargetJointIdx].x = enemyJointPosArray[enemyIdx][0].x;
        enemyJointPosArray[enemyIdx][enemyTargetJointIdx].y = enemyJointPosArray[enemyIdx][0].y - d * c + 1;
        if (0 >= enemyHealthArray[enemyIdx]) {
            enemyPoseTrailWriteIdxArray[enemyIdx] = 3;
            onEnemyDeath(enemyIdx);
        }
    } else {
        for (b = 0; 3 > b; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        for (b = enemyTileContactFlagsArray[enemyIdx] = 0; 3 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        if (150 < enemyDeathTimerArray[enemyIdx]++) {
            deleteEnemy(enemyIdx--);
        }
    }
    return enemyIdx;
}


function enemyBatBehavior(enemyIdx) {
    var b, c = new Vec2;
    b = enemyCatalog[enemyTypeArray[enemyIdx]][enemyDrawScaleCol];
    if (0 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        enemyJointPosArray[enemyIdx][0].x += 4;
        enemyJointPosArray[enemyIdx][0].y += 4;
        enemyJointPosArray[enemyIdx][1].x += 4;
        enemyJointPosArray[enemyIdx][1].y += 4;
        enemyJointPosArray[enemyIdx][2].x += 2;
        enemyJointPosArray[enemyIdx][2].y += 2;
        enemyJointPosArray[enemyIdx][3].x += 2;
        enemyJointPosArray[enemyIdx][3].y += 6;
        enemyJointPosArray[enemyIdx][4].x += 4;
        enemyJointPosArray[enemyIdx][4].y += 4;
        enemyJointPosArray[enemyIdx][5].x += 6;
        enemyJointPosArray[enemyIdx][5].y += 2;
        enemyJointPosArray[enemyIdx][6].x += 6;
        enemyJointPosArray[enemyIdx][6].y += 6;
        for (b = 0; 7 > b; b++) enemyPrevJointPosArray[enemyIdx][b].set(enemyJointPosArray[enemyIdx][b]);
        enemyPoseTrailWriteIdxArray[enemyIdx] = 1
    } else if (1 == enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][0], enemyPrevJointPosArray[enemyIdx][0], 0, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][1], enemyPrevJointPosArray[enemyIdx][1], 0, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][2], enemyPrevJointPosArray[enemyIdx][2], 0, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][3], enemyPrevJointPosArray[enemyIdx][3], 0, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][4], enemyPrevJointPosArray[enemyIdx][4], 0, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][5], enemyPrevJointPosArray[enemyIdx][5], 0, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][6], enemyPrevJointPosArray[enemyIdx][6], 0, .99);
        Vec2Set(c, 0, 0);
        var d = findNearestPartyMemberInRect(enemyJointPosArray[enemyIdx][0].x,
            enemyJointPosArray[enemyIdx][0].y, 150, 150, 0); - 1 != d && (Vec2Sub(c, heroJointPositionsByHero[d][2], enemyJointPosArray[enemyIdx][0]), d = Vec2Norm(c), d -= enemyCatalog[enemyTypeArray[enemyIdx]][enemyPArg24Col] - 10, 0 > d ? Vec2Scale(c, -.05) : Vec2Scale(c, .05));
        enemyJointPosArray[enemyIdx][0].add(c);
        10 > randFloat(100) && (enemyJointPosArray[enemyIdx][0].x += randFloatRange(-1, 1), enemyJointPosArray[enemyIdx][0].y += randFloatRange(-1, 1));
        enemyJointPosArray[enemyIdx][2].x += randFloatRange(0, -.1);
        enemyJointPosArray[enemyIdx][3].x += randFloatRange(0, -.1);
        enemyJointPosArray[enemyIdx][5].x += randFloatRange(0, .1);
        enemyJointPosArray[enemyIdx][6].x += randFloatRange(0, .1);
        c = .5;
        d = 6 * b;
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][1], 3 * b, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][4], 3 * b, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][1], enemyJointPosArray[enemyIdx][2], d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][1], enemyJointPosArray[enemyIdx][3], d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][2], enemyJointPosArray[enemyIdx][3], d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][4], enemyJointPosArray[enemyIdx][5], d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][4], enemyJointPosArray[enemyIdx][6], d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][5], enemyJointPosArray[enemyIdx][6], d, c, c);
        spawnEnemyLoot(enemyIdx, 0, enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y);
        enemyTileContactFlagsArray[enemyIdx] = 0;
        if (0 >=
            enemyHealthArray[enemyIdx])
            for (b = 0; 7 > b; b++) enemyJointPosArray[enemyIdx][b].x += randFloatRange(-1, 1), enemyJointPosArray[enemyIdx][b].y -= randFloatRange(1, 2);
        for (b = 0; 7 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, 1);
        enemyJointPosArray[enemyIdx][enemyTargetJointIdx].set(enemyJointPosArray[enemyIdx][0]);
        0 >= enemyHealthArray[enemyIdx] && (enemyPoseTrailWriteIdxArray[enemyIdx] = 3, onEnemyDeath(enemyIdx))
    } else {
        for (b = 0; 8 > b; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        c = .5;
        d = 6 * (150 - enemyDeathTimerArray[enemyIdx]) / 150;
        applySeparationCorrection(enemyJointPosArray[enemyIdx][1], enemyJointPosArray[enemyIdx][2], d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][1], enemyJointPosArray[enemyIdx][3], d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][2], enemyJointPosArray[enemyIdx][3], d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][4], enemyJointPosArray[enemyIdx][5], d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][4], enemyJointPosArray[enemyIdx][6], d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][5], enemyJointPosArray[enemyIdx][6], d, c, c);
        for (b = enemyTileContactFlagsArray[enemyIdx] = 0; 7 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        150 < enemyDeathTimerArray[enemyIdx]++ && deleteEnemy(enemyIdx--)
    }
    return enemyIdx
}


function enemyDragonBehavior(enemyIdx) {
    var b, c, d, f = new Vec2;
    if (0 == enemyPoseTrailWriteIdxArray[enemyIdx]) enemyPoseTrailWriteIdxArray[enemyIdx] = enemyCatalog[enemyTypeArray[enemyIdx]][enemyShapeParamACol];
    else if (20 >= enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][0], enemyPrevJointPosArray[enemyIdx][0], 0, .99);
        for (b = 1; b < enemyPoseTrailWriteIdxArray[enemyIdx]; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], 0, .9);
        Vec2Sub(f, enemyJointPosArray[enemyIdx][0], enemyPrevJointPosArray[enemyIdx][0]);
        Vec2Norm(f);
        Vec2Scale(f, .008);
        b = enemyJointPosArray[enemyIdx][0].x;
        c = enemyJointPosArray[enemyIdx][0].y;
        d = getStageTileAt(b - 24, c);
        if (28 >= d || 24 > b) f.x += .03;
        d = getStageTileAt(b + 24, c);
        if (28 >= d || b > 8 * stageWidth - 24) f.x -= .03;
        d = getStageTileAt(b, c - 24);
        if (28 >= d || 24 > c) f.y += .03;
        d = getStageTileAt(b, c + 24);
        if (28 >= d || c > 8 * stageHeight - 24) f.y -= .03;
        3 > randFloat(100) && (f.x += randFloatRange(-.1, .1), f.y += randFloatRange(-.1, .1));
        enemyJointPosArray[enemyIdx][0].add(f);
        f = .013;
        c = 5;
        for (b = 0; b < enemyPoseTrailWriteIdxArray[enemyIdx] - 1; b++) applySeparationCorrection(enemyJointPosArray[enemyIdx][b], enemyJointPosArray[enemyIdx][b + 1], c, 0, f);
        spawnEnemyLoot(enemyIdx, 0, enemyJointPosArray[enemyIdx][0].x,
            enemyJointPosArray[enemyIdx][0].y);
        enemyTileContactFlagsArray[enemyIdx] = 0;
        if (0 >= enemyHealthArray[enemyIdx])
            for (b = 0; b < enemyPoseTrailWriteIdxArray[enemyIdx]; b++) enemyJointPosArray[enemyIdx][b].x += randFloatRange(-1, 1), enemyJointPosArray[enemyIdx][b].y -= randFloatRange(1, 2);
        for (b = 0; b < enemyPoseTrailWriteIdxArray[enemyIdx]; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        enemyJointPosArray[enemyIdx][enemyTargetJointIdx].set(enemyJointPosArray[enemyIdx][0]);
        0 >= enemyHealthArray[enemyIdx] && (enemyPoseTrailWriteIdxArray[enemyIdx] += 20, enemyDeathTimerArray[enemyIdx] = 0, onEnemyDeath(enemyIdx))
    } else {
        for (b = 0; b < enemyPoseTrailWriteIdxArray[enemyIdx] - 20; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        f = .5;
        c = 10 * (150 - enemyDeathTimerArray[enemyIdx]) / 150;
        for (b = 1; b < enemyPoseTrailWriteIdxArray[enemyIdx] - 21; b++) applySeparationCorrection(enemyJointPosArray[enemyIdx][b], enemyJointPosArray[enemyIdx][b + 1], c, f, f);
        for (b = enemyTileContactFlagsArray[enemyIdx] = 0; b < enemyPoseTrailWriteIdxArray[enemyIdx] - 20; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        150 < enemyDeathTimerArray[enemyIdx]++ && deleteEnemy(enemyIdx--)
    }
    return enemyIdx
}


function enemyStickmanBehavior(enemyIdx) {
    var b;
    b = enemyCatalog[enemyTypeArray[enemyIdx]][enemyDrawScaleCol];
    if (0 == enemyPoseTrailWriteIdxArray[enemyIdx]) enemyPoseTrailWriteIdxArray[enemyIdx] = 1;
    else if (1 == enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        enemyUpdateFuncIdxArray[enemyIdx] == enemyStickmanBehaviorIdx ? (stepWithVerticalBias(enemyJointPosArray[enemyIdx][0], enemyPrevJointPosArray[enemyIdx][0], -.2, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][1], enemyPrevJointPosArray[enemyIdx][1], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][2], enemyPrevJointPosArray[enemyIdx][2], -.1, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][3], enemyPrevJointPosArray[enemyIdx][3], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][4], enemyPrevJointPosArray[enemyIdx][4], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][5], enemyPrevJointPosArray[enemyIdx][5], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][6], enemyPrevJointPosArray[enemyIdx][6], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][7], enemyPrevJointPosArray[enemyIdx][7], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][8], enemyPrevJointPosArray[enemyIdx][8], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][9], enemyPrevJointPosArray[enemyIdx][9], .3, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][10], enemyPrevJointPosArray[enemyIdx][10], .3, .99)) : enemyUpdateFuncIdxArray[enemyIdx] == enemyStickmanBehaviorAltIdx && (stepWithVerticalBias(enemyJointPosArray[enemyIdx][0], enemyPrevJointPosArray[enemyIdx][0], -.02, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][1], enemyPrevJointPosArray[enemyIdx][1], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][2], enemyPrevJointPosArray[enemyIdx][2], -.01, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][3], enemyPrevJointPosArray[enemyIdx][3], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][4],
            enemyPrevJointPosArray[enemyIdx][4], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][5], enemyPrevJointPosArray[enemyIdx][5], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][6], enemyPrevJointPosArray[enemyIdx][6], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][7], enemyPrevJointPosArray[enemyIdx][7], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][8], enemyPrevJointPosArray[enemyIdx][8], 0, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][9], enemyPrevJointPosArray[enemyIdx][9], .1, .99), stepWithVerticalBias(enemyJointPosArray[enemyIdx][10], enemyPrevJointPosArray[enemyIdx][10], .1, .99));
        if (50 > randFloat(100) && 0 < (enemyTileContactFlagsArray[enemyIdx] & 2)) {
            var c = findNearestPartyMemberInRect(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, 200, 50, 0); - 1 != c ? enemyPoseTrailWriteIdxArray[enemyIdx] = heroJointPositionsByHero[c][2].x < enemyJointPosArray[enemyIdx][0].x ? 1 : 2 : 10 > randFloat(100) && (enemyPoseTrailWriteIdxArray[enemyIdx] = randSelect(1, 2));
            var d = c = 1,
                f = 0;
            enemyUpdateFuncIdxArray[enemyIdx] == enemyStickmanBehaviorAltIdx && (c = .25, d = .3, f = .25);
            1 == enemyPoseTrailWriteIdxArray[enemyIdx] ? (enemyJointPosArray[enemyIdx][9].x < enemyJointPosArray[enemyIdx][10].x ? (enemyJointPosArray[enemyIdx][10].x += randFloat(-c), enemyJointPosArray[enemyIdx][10].y += -d) : (enemyJointPosArray[enemyIdx][9].x += randFloat(-c), enemyJointPosArray[enemyIdx][9].y += -d), enemyJointPosArray[enemyIdx][5].x += randFloat(-f), enemyJointPosArray[enemyIdx][6].x += randFloat(-f)) : (enemyJointPosArray[enemyIdx][9].x < enemyJointPosArray[enemyIdx][10].x ? (enemyJointPosArray[enemyIdx][9].x +=
                randFloat(c), enemyJointPosArray[enemyIdx][9].y += -d) : (enemyJointPosArray[enemyIdx][10].x += randFloat(c), enemyJointPosArray[enemyIdx][10].y += -d), enemyJointPosArray[enemyIdx][5].x += randFloat(f), enemyJointPosArray[enemyIdx][6].x += randFloat(f))
        }
        c = .5;
        d = 1.2 * b;
        enemyUpdateFuncIdxArray[enemyIdx] == enemyStickmanBehaviorAltIdx && (c = .02, d = 1 * b);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][1], 3 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][1], enemyJointPosArray[enemyIdx][2], 3 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][1], enemyJointPosArray[enemyIdx][3], 4 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][1], enemyJointPosArray[enemyIdx][4], 4 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][3], enemyJointPosArray[enemyIdx][5], 4 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][4], enemyJointPosArray[enemyIdx][6], 4 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][2], enemyJointPosArray[enemyIdx][7], 4 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][2], enemyJointPosArray[enemyIdx][8], 4 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][7], enemyJointPosArray[enemyIdx][9], 4 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][8], enemyJointPosArray[enemyIdx][10], 4 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][7], enemyJointPosArray[enemyIdx][8], 5 * d, c, c);
        spawnEnemyLoot(enemyIdx, 0, enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y);
        0 != enemyCatalog[enemyTypeArray[enemyIdx]][enemySecondaryProjectileEnabledCol] && spawnEnemyLoot(enemyIdx, 1, enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y);
        for (b =
            enemyTileContactFlagsArray[enemyIdx] = 0; 11 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        enemyJointPosArray[enemyIdx][enemyTargetJointIdx].set(enemyJointPosArray[enemyIdx][1]);
        if (0 >= enemyHealthArray[enemyIdx]) {
            enemyPoseTrailWriteIdxArray[enemyIdx] = 3;
            for (b = enemyDeathTimerArray[enemyIdx] = 0; 11 > b; b++) enemyJointPosArray[enemyIdx][b].x += randFloatRange(-1, 1), enemyJointPosArray[enemyIdx][b].y -= randFloatRange(1, 2);
            onEnemyDeath(enemyIdx)
        }
    } else {
        for (b = 0; 11 > b; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        c = .5;
        d = 1.2 * (150 - enemyDeathTimerArray[enemyIdx]) / 150;
        applySeparationCorrection(enemyJointPosArray[enemyIdx][1], enemyJointPosArray[enemyIdx][2], 3 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][3], enemyJointPosArray[enemyIdx][5], 4 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][4], enemyJointPosArray[enemyIdx][6], 4 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][7], enemyJointPosArray[enemyIdx][9], 4 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][8], enemyJointPosArray[enemyIdx][10], 4 * d, c, c);
        for (b = enemyTileContactFlagsArray[enemyIdx] = 0; 11 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        150 < enemyDeathTimerArray[enemyIdx]++ && deleteEnemy(enemyIdx--)
    }
    return enemyIdx
}


function enemyTreeBehavior(enemyIdx) {
    var b;
    if (0 == enemyPoseTrailWriteIdxArray[enemyIdx])
        for (enemyPoseTrailWriteIdxArray[enemyIdx] = floor(randFloatRange(enemyCatalog[enemyTypeArray[enemyIdx]][enemyShapeParamACol] + 1, enemyCatalog[enemyTypeArray[enemyIdx]][enemyShapeParamBCol] + 2)), b = 0; b < enemyPoseTrailWriteIdxArray[enemyIdx]; b++) enemyJointPosArray[enemyIdx][b].x += 4, enemyJointPosArray[enemyIdx][b].y += 4, enemyPrevJointPosArray[enemyIdx][b].set(enemyJointPosArray[enemyIdx][b]);
    else if (20 >= enemyPoseTrailWriteIdxArray[enemyIdx]) {
        if (enemyUpdateFuncIdxArray[enemyIdx] == enemyTreeBehaviorLeftIdx) {
            for (b = 0; b < enemyPoseTrailWriteIdxArray[enemyIdx] - 1; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], -.04, .99);
            stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], 1, .99)
        } else {
            for (b = 0; b < enemyPoseTrailWriteIdxArray[enemyIdx] - 1; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], .04, .99);
            stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], -1, .99)
        }
        10 > randFloat(100) && (b = floor(randFloat(enemyPoseTrailWriteIdxArray[enemyIdx] - 1)), enemyJointPosArray[enemyIdx][b].x += randFloatRange(-.5, .5));
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][1], 8, .2, .2);
        for (b = 1; b < enemyPoseTrailWriteIdxArray[enemyIdx] - 2; b++) applySeparationCorrection(enemyJointPosArray[enemyIdx][b], enemyJointPosArray[enemyIdx][b + 1], 6, .2, .2);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][b], enemyJointPosArray[enemyIdx][b + 1], 6, .2, 0);
        spawnEnemyLoot(enemyIdx, 0, enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y);
        enemyTileContactFlagsArray[enemyIdx] = 0;
        if (0 >= enemyHealthArray[enemyIdx])
            for (b = 0; b < enemyPoseTrailWriteIdxArray[enemyIdx]; b++) enemyJointPosArray[enemyIdx][b].x += randFloatRange(-.5, .5), enemyJointPosArray[enemyIdx][b].y -= randFloatRange(2, 3);
        for (b = 0; b < enemyPoseTrailWriteIdxArray[enemyIdx]; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        enemyJointPosArray[enemyIdx][enemyTargetJointIdx].x = .5 * (enemyJointPosArray[enemyIdx][0].x + enemyJointPosArray[enemyIdx][enemyPoseTrailWriteIdxArray[enemyIdx] - 1].x);
        enemyJointPosArray[enemyIdx][enemyTargetJointIdx].y = .5 * (enemyJointPosArray[enemyIdx][0].y + enemyJointPosArray[enemyIdx][enemyPoseTrailWriteIdxArray[enemyIdx] - 1].y);
        0 >= enemyHealthArray[enemyIdx] && (enemyPoseTrailWriteIdxArray[enemyIdx] += 20, onEnemyDeath(enemyIdx))
    } else {
        for (b = 0; b < enemyPoseTrailWriteIdxArray[enemyIdx] - 20; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        for (b = enemyTileContactFlagsArray[enemyIdx] = 0; b < enemyPoseTrailWriteIdxArray[enemyIdx] - 20; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        150 < enemyDeathTimerArray[enemyIdx]++ && deleteEnemy(enemyIdx--)
    }
    return enemyIdx
}


function enemyHangingTreeBehavior(enemyIdx) {
    var b;
    if (0 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        enemyJointPosArray[enemyIdx][0].x += 2;
        enemyJointPosArray[enemyIdx][1].x += 3;
        enemyJointPosArray[enemyIdx][2].x += 4;
        for (b = 0; 3 > b; b++) enemyPrevJointPosArray[enemyIdx][b].set(enemyJointPosArray[enemyIdx][b]);
        enemyPoseTrailWriteIdxArray[enemyIdx] = 1
    } else if (1 == enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][0], enemyPrevJointPosArray[enemyIdx][0], .05, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][1], enemyPrevJointPosArray[enemyIdx][1], .05, .9);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][2], enemyPrevJointPosArray[enemyIdx][2], .05, .9);
        b = findNearestPartyMemberInRect(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, 200, 50, 0); - 1 != b && (enemyJointPosArray[enemyIdx][0].x += heroJointPositionsByHero[b][2].x < enemyJointPosArray[enemyIdx][0].x ? -.001 : .001);
        if (0 < (enemyTileContactFlagsArray[enemyIdx] & 2)) {
            var c = 0; - 1 != b ? c = heroJointPositionsByHero[b][2].x < enemyJointPosArray[enemyIdx][0].x ? -1 : 1 : c = randSelect(-1, 1);
            10 > randFloat(100) && (enemyJointPosArray[enemyIdx][0].x += randFloatRange(.4, .6) * c, enemyJointPosArray[enemyIdx][0].y += randFloatRange(-1.5, -2))
        }
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][1], 0, 0, .01);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][1], enemyJointPosArray[enemyIdx][2], 0, 0, .01);
        spawnEnemyLoot(enemyIdx, 0, enemyJointPosArray[enemyIdx][0].x,
            enemyJointPosArray[enemyIdx][0].y);
        enemyTileContactFlagsArray[enemyIdx] = 0;
        if (0 >= enemyHealthArray[enemyIdx])
            for (b = 0; 3 > b; b++) enemyJointPosArray[enemyIdx][b].x += randFloatRange(-.5, .5), enemyJointPosArray[enemyIdx][b].y -= randFloatRange(2, 3);
        moveEnemyJointWithTileCollision(enemyIdx, 0, .5);
        b = enemyTileContactFlagsArray[enemyIdx];
        moveEnemyJointWithTileCollision(enemyIdx, 1, .5);
        moveEnemyJointWithTileCollision(enemyIdx, 2, .5);
        enemyTileContactFlagsArray[enemyIdx] = b;
        enemyJointPosArray[enemyIdx][enemyTargetJointIdx].set(enemyJointPosArray[enemyIdx][0]);
        0 >= enemyHealthArray[enemyIdx] && (enemyPoseTrailWriteIdxArray[enemyIdx] = 3, onEnemyDeath(enemyIdx))
    } else {
        for (b = 0; 3 > b; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        for (b = enemyTileContactFlagsArray[enemyIdx] = 0; 3 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        150 < enemyDeathTimerArray[enemyIdx]++ && deleteEnemy(enemyIdx--)
    }
    return enemyIdx
}


function enemyUpdateFunc7(enemyIdx) {
    var b, c, d, f = new Vec2,
        g = enemyCatalog[enemyTypeArray[enemyIdx]][enemyShapeParamACol],
        h = enemyCatalog[enemyTypeArray[enemyIdx]][enemyShapeParamBCol] * enemyCatalog[enemyTypeArray[enemyIdx]][enemyDrawScaleCol];
    if (0 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        for (b = 0; b < g; b++) c = 360 * b / g * PI / 180, enemyJointPosArray[enemyIdx][1 + b].x += Math.cos(c) * h, enemyJointPosArray[enemyIdx][1 + b].y += Math.sin(c) * h;
        for (b = 0; b <= g; b++) enemyJointPosArray[enemyIdx][b].x += 4, enemyJointPosArray[enemyIdx][b].y += 4, enemyPrevJointPosArray[enemyIdx][b].set(enemyJointPosArray[enemyIdx][b]);
        enemyPoseTrailWriteIdxArray[enemyIdx] = 1
    } else if (1 == enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][0], enemyPrevJointPosArray[enemyIdx][0], 0, .99);
        for (b = 1; b <= g; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], 0, .99);
        Vec2Sub(f, enemyJointPosArray[enemyIdx][0], enemyPrevJointPosArray[enemyIdx][0]);
        Vec2Norm(f);
        Vec2Scale(f, .008);
        b = enemyJointPosArray[enemyIdx][0].x;
        c = enemyJointPosArray[enemyIdx][0].y;
        d = getStageTileAt(b - 16, c);
        30 >= d && (f.x += .05);
        d = getStageTileAt(b + 16, c);
        30 >= d && (f.x -= .05);
        d = getStageTileAt(b, c - 16);
        30 >= d && (f.y += .05);
        d = getStageTileAt(b, c +
            16);
        30 >= d && (f.y -= .05);
        d = getStageTileAt(b - 8, c);
        30 >= d && (f.x += .05);
        d = getStageTileAt(b + 8, c);
        30 >= d && (f.x -= .05);
        d = getStageTileAt(b, c - 8);
        30 >= d && (f.y += .05);
        d = getStageTileAt(b, c + 8);
        30 >= d && (f.y -= .05);
        3 > randFloat(100) && (f.x += randFloatRange(-.1, .1), f.y += randFloatRange(-.1, .1));
        enemyJointPosArray[enemyIdx][0].add(f);
        c = 360 / g * PI / 180;
        f.x = Math.cos(0) * h - Math.cos(c) * h;
        f.y = Math.sin(0) * h - Math.sin(c) * h;
        f = Vec2Mag(f);
        for (b = 0; b < g; b++) applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][b + 1], h, 0, .2);
        for (b = 1; b < g; b++) applySeparationCorrection(enemyJointPosArray[enemyIdx][b], enemyJointPosArray[enemyIdx][b + 1], f, .2, .2);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][b], enemyJointPosArray[enemyIdx][1], f, .2, .2);
        spawnEnemyLoot(enemyIdx, 0, enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y);
        for (b = enemyTileContactFlagsArray[enemyIdx] = 0; b <= g; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        enemyJointPosArray[enemyIdx][enemyTargetJointIdx].set(enemyJointPosArray[enemyIdx][0]);
        if (0 >= enemyHealthArray[enemyIdx]) {
            enemyPoseTrailWriteIdxArray[enemyIdx] =
                3;
            for (b = enemyDeathTimerArray[enemyIdx] = 0; b <= g; b++) enemyJointPosArray[enemyIdx][b].x += randFloatRange(-.5, .5), enemyJointPosArray[enemyIdx][b].y -= randFloatRange(2, 3);
            onEnemyDeath(enemyIdx)
        }
    } else {
        for (b = 0; b <= g; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        h = h * (150 - enemyDeathTimerArray[enemyIdx]) / 150;
        for (b = 1; b < g; b++) applySeparationCorrection(enemyJointPosArray[enemyIdx][b], enemyJointPosArray[enemyIdx][b + 1], h, .5, .5);
        for (b = enemyTileContactFlagsArray[enemyIdx] = 0; b <= g; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        150 < enemyDeathTimerArray[enemyIdx]++ && deleteEnemy(enemyIdx--)
    }
    return enemyIdx
}


function enemyUpdateFunc8(enemyIdx) {
    var b;
    b = enemyCatalog[enemyTypeArray[enemyIdx]][enemyDrawScaleCol];
    if (0 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        enemyJointPosArray[enemyIdx][0].x += 4;
        enemyJointPosArray[enemyIdx][0].y += 0;
        enemyJointPosArray[enemyIdx][1].x += 0;
        enemyJointPosArray[enemyIdx][1].y += 0;
        enemyJointPosArray[enemyIdx][2].x += 0;
        enemyJointPosArray[enemyIdx][2].y += 7.99;
        enemyJointPosArray[enemyIdx][3].x += 7.99;
        enemyJointPosArray[enemyIdx][3].y += 0;
        enemyJointPosArray[enemyIdx][4].x += 7.99;
        enemyJointPosArray[enemyIdx][4].y += 7.99;
        enemyJointPosArray[enemyIdx][5].x += 0;
        enemyJointPosArray[enemyIdx][5].y += 0;
        enemyJointPosArray[enemyIdx][6].x += 0;
        enemyJointPosArray[enemyIdx][6].y += 7.99;
        enemyJointPosArray[enemyIdx][7].x += 7.99;
        enemyJointPosArray[enemyIdx][7].y += 0;
        enemyJointPosArray[enemyIdx][8].x += 7.99;
        enemyJointPosArray[enemyIdx][8].y += 7.99;
        for (b = 0; 9 > b; b++) enemyPrevJointPosArray[enemyIdx][b].set(enemyJointPosArray[enemyIdx][b]);
        enemyPoseTrailWriteIdxArray[enemyIdx] = 1
    } else if (1 == enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][0], enemyPrevJointPosArray[enemyIdx][0], -.05, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][1], enemyPrevJointPosArray[enemyIdx][1], -.1, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][2], enemyPrevJointPosArray[enemyIdx][2], .8, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][3], enemyPrevJointPosArray[enemyIdx][3], -.1, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][4], enemyPrevJointPosArray[enemyIdx][4],
            .8, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][5], enemyPrevJointPosArray[enemyIdx][5], -.1, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][6], enemyPrevJointPosArray[enemyIdx][6], .8, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][7], enemyPrevJointPosArray[enemyIdx][7], -.1, .99);
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][8], enemyPrevJointPosArray[enemyIdx][8], .8, .99);
        if (50 > randFloat(100) && 0 < (enemyTileContactFlagsArray[enemyIdx] & 2)) {
            var c = findNearestPartyMemberInRect(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, 500, 25, 0); - 1 != c ? enemyPoseTrailWriteIdxArray[enemyIdx] = heroJointPositionsByHero[c][2].x < enemyJointPosArray[enemyIdx][0].x ? 1 : 2 : 10 > randFloat(100) && (enemyPoseTrailWriteIdxArray[enemyIdx] = randSelect(1, 2));
            1 == enemyPoseTrailWriteIdxArray[enemyIdx] ? (enemyJointPosArray[enemyIdx][2].x < enemyJointPosArray[enemyIdx][6].x ? (enemyJointPosArray[enemyIdx][6].x += randFloat(-1), enemyJointPosArray[enemyIdx][6].y += randFloatRange(-1, -1)) : (enemyJointPosArray[enemyIdx][2].x += randFloat(-1), enemyJointPosArray[enemyIdx][2].y += randFloatRange(-1, -1)), enemyJointPosArray[enemyIdx][4].x < enemyJointPosArray[enemyIdx][8].x ? (enemyJointPosArray[enemyIdx][8].x += randFloat(-1), enemyJointPosArray[enemyIdx][8].y += randFloatRange(-1, -1)) : (enemyJointPosArray[enemyIdx][4].x += randFloat(-1), enemyJointPosArray[enemyIdx][4].y += randFloatRange(-1, -1)), 1 > randFloat(100) && (--enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y -= 3)) : (enemyJointPosArray[enemyIdx][2].x < enemyJointPosArray[enemyIdx][6].x ?
                (enemyJointPosArray[enemyIdx][2].x += randFloat(1), enemyJointPosArray[enemyIdx][2].y += randFloatRange(-1, -1)) : (enemyJointPosArray[enemyIdx][6].x += randFloat(1), enemyJointPosArray[enemyIdx][6].y += randFloatRange(-1, -1)), enemyJointPosArray[enemyIdx][4].x < enemyJointPosArray[enemyIdx][8].x ? (enemyJointPosArray[enemyIdx][4].x += randFloat(1), enemyJointPosArray[enemyIdx][4].y += randFloatRange(-1, -1)) : (enemyJointPosArray[enemyIdx][8].x += randFloat(1), enemyJointPosArray[enemyIdx][8].y += randFloatRange(-1, -1)), 1 > randFloat(100) && (enemyJointPosArray[enemyIdx][0].x += 1, enemyJointPosArray[enemyIdx][0].y -= 3))
        }
        c = .3;
        b = 2.2 * b;
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][5], 3 * b, .1 * c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][7], 3 * b, .1 * c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][6], 3 * b, .1 * c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][5], enemyJointPosArray[enemyIdx][6], 2 * b, .2 * c, .2 * c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][8], 3 * b, .1 * c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][7], enemyJointPosArray[enemyIdx][8], 2 * b, .2 * c, .2 * c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][1], 4 * b, .1 * c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][3], 4 * b, .1 * c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][2], 4 * b, .1 * c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][1],
            enemyJointPosArray[enemyIdx][2], 3 * b, .2 * c, .2 * c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][4], 4 * b, .1 * c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][3], enemyJointPosArray[enemyIdx][4], 3 * b, .2 * c, .2 * c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][2], enemyJointPosArray[enemyIdx][4], 8 * b, .1 * c, .1 * c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][5], enemyJointPosArray[enemyIdx][7], 7 * b, .1 * c, .1 * c);
        spawnEnemyLoot(enemyIdx, 0, enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y);
        0 != enemyCatalog[enemyTypeArray[enemyIdx]][enemySecondaryProjectileEnabledCol] && spawnEnemyLoot(enemyIdx, 1, enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y);
        for (b = enemyTileContactFlagsArray[enemyIdx] = 0; 9 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        enemyJointPosArray[enemyIdx][enemyTargetJointIdx].set(enemyJointPosArray[enemyIdx][0]);
        if (0 >= enemyHealthArray[enemyIdx]) {
            enemyPoseTrailWriteIdxArray[enemyIdx] = 3;
            enemyDeathTimerArray[enemyIdx] = 0;
            for (b = 1; 9 > b; b++) enemyJointPosArray[enemyIdx][b].x += randFloatRange(-1, 1), enemyJointPosArray[enemyIdx][b].y -= randFloatRange(1, 2);
            onEnemyDeath(enemyIdx)
        }
    } else {
        for (b = 0; 9 > b; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        c = .5;
        b = 1.2 * (150 - enemyDeathTimerArray[enemyIdx]) / 150;
        applySeparationCorrection(enemyJointPosArray[enemyIdx][1], enemyJointPosArray[enemyIdx][2], 4 * b, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][3], enemyJointPosArray[enemyIdx][4], 4 * b, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][5],
            enemyJointPosArray[enemyIdx][6], 3 * b, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][7], enemyJointPosArray[enemyIdx][8], 3 * b, c, c);
        for (b = enemyTileContactFlagsArray[enemyIdx] = 0; 9 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        150 < enemyDeathTimerArray[enemyIdx]++ && deleteEnemy(enemyIdx--)
    }
    return enemyIdx
}


function enemyUpdateFunc9(enemyIdx) {
    var b, c = new Vec2,
        d = enemyCatalog[enemyTypeArray[enemyIdx]][enemyDrawScaleCol];
    if (0 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        1 > randFloat(2) ? (enemyJointPosArray[enemyIdx][0].x += 0, enemyJointPosArray[enemyIdx][1].x += 2, enemyJointPosArray[enemyIdx][2].x += 4, enemyJointPosArray[enemyIdx][3].x += 6, enemyJointPosArray[enemyIdx][4].x += 6) : (enemyJointPosArray[enemyIdx][0].x += 6, enemyJointPosArray[enemyIdx][1].x += 4, enemyJointPosArray[enemyIdx][2].x += 2, enemyJointPosArray[enemyIdx][3].x += 0, enemyJointPosArray[enemyIdx][4].x += 0);
        for (b = 0; 5 > b; b++) enemyPrevJointPosArray[enemyIdx][b].set(enemyJointPosArray[enemyIdx][b]);
        enemyPoseTrailWriteIdxArray[enemyIdx] = 1
    } else if (1 == enemyPoseTrailWriteIdxArray[enemyIdx] || 2 == enemyPoseTrailWriteIdxArray[enemyIdx]) {
        stepWithVerticalBias(enemyJointPosArray[enemyIdx][0], enemyPrevJointPosArray[enemyIdx][0], 0, .99);
        for (b = 1; 5 > b; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], 0, .9);
        Vec2Set(c, 0, 0);
        b = findNearestPartyMemberInRect(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, 150, 50, 0); - 1 != b && (Vec2Sub(c, heroJointPositionsByHero[b][2], enemyJointPosArray[enemyIdx][0]), b = Vec2Norm(c), b -= enemyCatalog[enemyTypeArray[enemyIdx]][enemyPArg24Col] / 2 - 10, 0 > b ? Vec2Scale(c, -.01) : Vec2Scale(c, .01));
        b = getStageTileAt(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y);
        31 != b && (c.y += .03);
        b = getStageTileAt(enemyJointPosArray[enemyIdx][0].x - 8, enemyJointPosArray[enemyIdx][0].y);
        0 <= b && 23 >= b && (c.x += .03);
        b = getStageTileAt(enemyJointPosArray[enemyIdx][0].x + 8, enemyJointPosArray[enemyIdx][0].y);
        0 <= b && 23 >= b && (c.x -= .03);
        b = getStageTileAt(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y - 8);
        0 <= b && 23 >= b && (c.y += .03);
        b = getStageTileAt(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y + 8);
        0 <= b && 23 >= b && (c.y -= .03);
        2 > randFloat(100) && (c.x += randFloatRange(-.5, .5), c.y += randFloatRange(-.5, .5));
        enemyJointPosArray[enemyIdx][0].add(c);
        c = .1;
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][1], 6 * d, 0, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][1], enemyJointPosArray[enemyIdx][2], 4 * d, 0, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][2], enemyJointPosArray[enemyIdx][3], 6 * d, 0, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][2], enemyJointPosArray[enemyIdx][4], 6 * d, 0, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][3], enemyJointPosArray[enemyIdx][4], 8 * d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][0], enemyJointPosArray[enemyIdx][2], 10 * d, 0, c);
        spawnEnemyLoot(enemyIdx, 0, enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y);
        for (b = enemyTileContactFlagsArray[enemyIdx] = 0; 5 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        enemyJointPosArray[enemyIdx][enemyTargetJointIdx].set(enemyJointPosArray[enemyIdx][0]);
        if (0 >= enemyHealthArray[enemyIdx]) {
            enemyPoseTrailWriteIdxArray[enemyIdx] = 3;
            for (b = enemyDeathTimerArray[enemyIdx] = 0; 5 > b; b++) enemyJointPosArray[enemyIdx][b].x += randFloatRange(-2, 2), enemyJointPosArray[enemyIdx][b].y -= randFloatRange(2, 4);
            onEnemyDeath(enemyIdx)
        }
    } else {
        for (b = 0; 5 > b; b++) stepWithVerticalBias(enemyJointPosArray[enemyIdx][b], enemyPrevJointPosArray[enemyIdx][b], .05, .99);
        c = .5;
        d = 7 * d * (150 - enemyDeathTimerArray[enemyIdx]) / 150;
        applySeparationCorrection(enemyJointPosArray[enemyIdx][2], enemyJointPosArray[enemyIdx][3], d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][2], enemyJointPosArray[enemyIdx][4], d, c, c);
        applySeparationCorrection(enemyJointPosArray[enemyIdx][3], enemyJointPosArray[enemyIdx][4], d, c, c);
        for (b = enemyTileContactFlagsArray[enemyIdx] = 0; 5 > b; b++) moveEnemyJointWithTileCollision(enemyIdx, b, .5);
        150 < enemyDeathTimerArray[enemyIdx]++ && deleteEnemy(enemyIdx--)
    }
    return enemyIdx
}


function drawEnemies() { // Cg
    for (let enemyIdx = 0; enemyIdx < enemyCount; enemyIdx++) {
        let sprIdx = enemyCatalog[enemyTypeArray[enemyIdx]][enemySpriteIndexCol],
            primTint = enemyCatalog[enemyTypeArray[enemyIdx]][enemyPrimaryTintCol],
            secTint = enemyCatalog[enemyTypeArray[enemyIdx]][enemySecondaryTintCol],
            accentTint = enemyCatalog[enemyTypeArray[enemyIdx]][enemyAccentTintCol];
        let drawScale = enemyCatalog[enemyTypeArray[enemyIdx]][enemyDrawScaleCol];
        let yAnchor = enemySpriteAnchorYBySpriteIndex[sprIdx];
        if (0 < enemyFreezeTimerArray[enemyIdx]) {
            primTint = 5934817;
            secTint = 1989840;
        } else if (0 < enemySkipDurationLeftArray[enemyIdx]) {
            primTint = 3368652;
            accentTint = secTint = 13158;
        } else if (0 < enemyDmgDurationLeftArray[enemyIdx]) {
            primTint = 3407616;
            accentTint = secTint = 3381504;
        }
        
        let k = (150 - enemyDeathTimerArray[enemyIdx]) / 150 * drawScale;
        if (enemyUpdateFuncIdxArray[enemyIdx] == enemySlimeBehaviorIdx) {
            if (3 > enemyPoseTrailWriteIdxArray[enemyIdx]) {
                drawEnemyScaledSprite(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y - yAnchor * drawScale + 1, 16 * drawScale, 16 * drawScale, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
            } else {
                drawEnemyScaledSprite(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y - yAnchor * drawScale + 1, 16 * drawScale, 16 * drawScale, 16 * (sprIdx & 7), 16 * (sprIdx >> 3) + 15, -15, primTint, secTint, floor(128 * (50 - enemyDeathTimerArray[enemyIdx]) / 50));
            }
        } else if (enemyUpdateFuncIdxArray[enemyIdx] == enemyBoxSnakeBehaviorIdx) {
            drawRectCentered(enemyJointPosArray[enemyIdx][2].x, enemyJointPosArray[enemyIdx][2].y - 2 * k, 4 * k, 4 * k, accentTint);
            drawRectCentered(enemyJointPosArray[enemyIdx][1].x, enemyJointPosArray[enemyIdx][1].y - 2.5 * k, 5 * k, 5 * k, accentTint);
            if (3 > enemyPoseTrailWriteIdxArray[enemyIdx]) {
                k = max(1, k);
            }
            drawEnemyScaledSprite(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y - yAnchor * k + 1, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
        } else if (enemyUpdateFuncIdxArray[enemyIdx] == enemyBatBehaviorIdx) {
            drawLine(enemyJointPosArray[enemyIdx][1].x, enemyJointPosArray[enemyIdx][1].y, enemyJointPosArray[enemyIdx][2].x, enemyJointPosArray[enemyIdx][2].y, accentTint);
            drawLine(enemyJointPosArray[enemyIdx][2].x, enemyJointPosArray[enemyIdx][2].y, enemyJointPosArray[enemyIdx][3].x, enemyJointPosArray[enemyIdx][3].y, accentTint);
            drawLine(enemyJointPosArray[enemyIdx][3].x, enemyJointPosArray[enemyIdx][3].y, enemyJointPosArray[enemyIdx][1].x, enemyJointPosArray[enemyIdx][1].y, accentTint);
            drawLine(enemyJointPosArray[enemyIdx][4].x, enemyJointPosArray[enemyIdx][4].y, enemyJointPosArray[enemyIdx][5].x, enemyJointPosArray[enemyIdx][5].y, accentTint);
            drawLine(enemyJointPosArray[enemyIdx][5].x, enemyJointPosArray[enemyIdx][5].y, enemyJointPosArray[enemyIdx][6].x, enemyJointPosArray[enemyIdx][6].y, accentTint);
            drawLine(enemyJointPosArray[enemyIdx][6].x, enemyJointPosArray[enemyIdx][6].y, enemyJointPosArray[enemyIdx][4].x, enemyJointPosArray[enemyIdx][4].y, accentTint);
            if (3 > enemyPoseTrailWriteIdxArray[enemyIdx]) {
                k = max(1, k);
            }
            drawEnemyScaledSprite(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
        } else if (enemyUpdateFuncIdxArray[enemyIdx] == enemyDragonBehaviorIdx) {
            let _a = 0;
            let _b = enemyPoseTrailWriteIdxArray[enemyIdx] - 1;
            if (20 < enemyPoseTrailWriteIdxArray[enemyIdx]) {
                _a = 1;
                _b = enemyPoseTrailWriteIdxArray[enemyIdx] - 20 - 1;
            }
            for (; _a < _b; _a++) drawLine(enemyJointPosArray[enemyIdx][_a].x, enemyJointPosArray[enemyIdx][_a].y, enemyJointPosArray[enemyIdx][_a + 1].x, enemyJointPosArray[enemyIdx][_a + 1].y, accentTint);
            drawRectCentered(floor(enemyJointPosArray[enemyIdx][_b].x) + 1, floor(enemyJointPosArray[enemyIdx][_b].y) + 1, floor(2 * k), floor(2 * k), primTint);
            drawEnemyScaledSprite(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
        } else if (enemyUpdateFuncIdxArray[enemyIdx] == enemyStickmanBehaviorIdx || enemyUpdateFuncIdxArray[enemyIdx] == enemyStickmanBehaviorAltIdx) {
            drawLine(enemyJointPosArray[enemyIdx][1].x, enemyJointPosArray[enemyIdx][1].y, enemyJointPosArray[enemyIdx][2].x, enemyJointPosArray[enemyIdx][2].y, accentTint);
            if (3 > enemyPoseTrailWriteIdxArray[enemyIdx]) {
                drawLine(enemyJointPosArray[enemyIdx][1].x, enemyJointPosArray[enemyIdx][1].y, enemyJointPosArray[enemyIdx][3].x, enemyJointPosArray[enemyIdx][3].y, accentTint);
                drawLine(enemyJointPosArray[enemyIdx][1].x, enemyJointPosArray[enemyIdx][1].y, enemyJointPosArray[enemyIdx][4].x, enemyJointPosArray[enemyIdx][4].y, accentTint);
            }
            drawLine(enemyJointPosArray[enemyIdx][3].x, enemyJointPosArray[enemyIdx][3].y, enemyJointPosArray[enemyIdx][5].x, enemyJointPosArray[enemyIdx][5].y, accentTint);
            drawLine(enemyJointPosArray[enemyIdx][4].x, enemyJointPosArray[enemyIdx][4].y, enemyJointPosArray[enemyIdx][6].x, enemyJointPosArray[enemyIdx][6].y, accentTint);
            if (3 > enemyPoseTrailWriteIdxArray[enemyIdx]) {
                drawLine(enemyJointPosArray[enemyIdx][2].x, enemyJointPosArray[enemyIdx][2].y,
                    enemyJointPosArray[enemyIdx][7].x, enemyJointPosArray[enemyIdx][7].y, accentTint);
                drawLine(enemyJointPosArray[enemyIdx][2].x, enemyJointPosArray[enemyIdx][2].y, enemyJointPosArray[enemyIdx][8].x, enemyJointPosArray[enemyIdx][8].y, accentTint);
            }
            drawLine(enemyJointPosArray[enemyIdx][7].x, enemyJointPosArray[enemyIdx][7].y, enemyJointPosArray[enemyIdx][9].x, enemyJointPosArray[enemyIdx][9].y, accentTint);
            drawLine(enemyJointPosArray[enemyIdx][8].x, enemyJointPosArray[enemyIdx][8].y, enemyJointPosArray[enemyIdx][10].x, enemyJointPosArray[enemyIdx][10].y, accentTint);
            drawEnemyScaledSprite(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
        } else if (enemyUpdateFuncIdxArray[enemyIdx] == enemyTreeBehaviorLeftIdx || enemyUpdateFuncIdxArray[enemyIdx] == enemyTreeBehaviorRightIdx) {
            let leftHanded = enemyUpdateFuncIdxArray[enemyIdx] == enemyTreeBehaviorLeftIdx ? -2 : 2;
            let startI = 20 >= enemyPoseTrailWriteIdxArray[enemyIdx] ? enemyPoseTrailWriteIdxArray[enemyIdx] - 1 : enemyPoseTrailWriteIdxArray[enemyIdx] - 21;
            for (let _i = startI; 0 < _i; _i--) 
                drawRectOutlineCentered(floor(enemyJointPosArray[enemyIdx][_i].x), floor(enemyJointPosArray[enemyIdx][_i].y + leftHanded), 5, 5, accentTint);
            if (enemyUpdateFuncIdxArray[enemyIdx] == enemyTreeBehaviorLeftIdx) {
                drawEnemyScaledSprite(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
            } else {
                drawEnemyScaledSprite(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3) + 16, -16, primTint, secTint, 255);
            }
        } else if (enemyUpdateFuncIdxArray[enemyIdx] == enemyHangingTreeBehaviorIdx) {
            for (let _i = 1; 6 > _i; _i++) drawLine(enemyJointPosArray[enemyIdx][_i].x, enemyJointPosArray[enemyIdx][_i].y, enemyJointPosArray[enemyIdx][_i + 1].x, enemyJointPosArray[enemyIdx][_i + 1].y, secTint);
            if (3 > enemyPoseTrailWriteIdxArray[enemyIdx]) {
                drawLine(enemyJointPosArray[enemyIdx][drawScale].x, enemyJointPosArray[enemyIdx][drawScale].y, enemyJointPosArray[enemyIdx][1].x, enemyJointPosArray[enemyIdx][1].y, secTint);
            }
            drawSpriteSheetPartCentered(enemySpriteSheet, floor(enemyJointPosArray[enemyIdx][0].x), floor(enemyJointPosArray[enemyIdx][0].y), floor(16 * k), floor(16 * k), 16 * sprIdx, 0, 16, 16, primTint);
        } else if (enemyUpdateFuncIdxArray[enemyIdx] == enemyUpdateFunc7Idx) {
            let _a = enemyCatalog[enemyTypeArray[enemyIdx]][enemyShapeParamACol];
            for (let _i = 1; _i < _a; _i++) drawLine(enemyJointPosArray[enemyIdx][_i].x - 1, enemyJointPosArray[enemyIdx][_i].y - 1, enemyJointPosArray[enemyIdx][_i + 1].x - 1, enemyJointPosArray[enemyIdx][_i + 1].y - 1, accentTint);
            drawLine(enemyJointPosArray[enemyIdx][drawScale].x - 1, enemyJointPosArray[enemyIdx][drawScale].y - 1, enemyJointPosArray[enemyIdx][1].x - 1, enemyJointPosArray[enemyIdx][1].y - 1, accentTint);
            drawEnemyScaledSprite(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
        } else if (enemyUpdateFuncIdxArray[enemyIdx] == enemyUpdateFunc9Idx) {
            drawLine(enemyJointPosArray[enemyIdx][1].x, enemyJointPosArray[enemyIdx][1].y, enemyJointPosArray[enemyIdx][2].x, enemyJointPosArray[enemyIdx][2].y, secTint);
            if (3 > enemyPoseTrailWriteIdxArray[enemyIdx]) {
                drawLine(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, enemyJointPosArray[enemyIdx][1].x, enemyJointPosArray[enemyIdx][1].y, secTint);
                drawLine(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, enemyJointPosArray[enemyIdx][3].x, enemyJointPosArray[enemyIdx][3].y, secTint);
            }
            drawLine(enemyJointPosArray[enemyIdx][1].x, enemyJointPosArray[enemyIdx][1].y, enemyJointPosArray[enemyIdx][2].x, enemyJointPosArray[enemyIdx][2].y, secTint);
            drawLine(enemyJointPosArray[enemyIdx][3].x, enemyJointPosArray[enemyIdx][3].y, enemyJointPosArray[enemyIdx][4].x, enemyJointPosArray[enemyIdx][4].y, secTint);
            if (3 > enemyPoseTrailWriteIdxArray[enemyIdx]) {
                drawLine(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, enemyJointPosArray[enemyIdx][5].x, enemyJointPosArray[enemyIdx][5].y, secTint);
                drawLine(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, enemyJointPosArray[enemyIdx][7].x, enemyJointPosArray[enemyIdx][7].y, secTint);
            }
            drawLine(enemyJointPosArray[enemyIdx][5].x, enemyJointPosArray[enemyIdx][5].y, enemyJointPosArray[enemyIdx][6].x, enemyJointPosArray[enemyIdx][6].y, secTint);
            drawLine(enemyJointPosArray[enemyIdx][7].x, enemyJointPosArray[enemyIdx][7].y, enemyJointPosArray[enemyIdx][8].x, enemyJointPosArray[enemyIdx][8].y, secTint);
            drawSpriteSheetPartCentered(enemySpriteSheet, floor(enemyJointPosArray[enemyIdx][0].x), floor(enemyJointPosArray[enemyIdx][0].y), floor(16 * k), floor(16 * k), 16 * sprIdx, 0, 16, 16, primTint);
        } else {
            if (enemyUpdateFuncIdxArray[enemyIdx] == enemyUpdateFunc10Idx) {
                drawLine(enemyJointPosArray[enemyIdx][2].x, enemyJointPosArray[enemyIdx][2].y, enemyJointPosArray[enemyIdx][3].x, enemyJointPosArray[enemyIdx][3].y, accentTint);
                drawLine(enemyJointPosArray[enemyIdx][3].x, enemyJointPosArray[enemyIdx][3].y, enemyJointPosArray[enemyIdx][4].x,
                    enemyJointPosArray[enemyIdx][4].y, accentTint);
                drawLine(enemyJointPosArray[enemyIdx][4].x, enemyJointPosArray[enemyIdx][4].y, enemyJointPosArray[enemyIdx][2].x, enemyJointPosArray[enemyIdx][2].y, accentTint);
                drawRectOutlineCentered(enemyJointPosArray[enemyIdx][1].x, enemyJointPosArray[enemyIdx][1].y, 6 * k + 1, 6 * k + 1, accentTint);
                if (3 > enemyPoseTrailWriteIdxArray[enemyIdx]) {
                    k = max(1, k);
                }
                drawEnemyScaledSprite(enemyJointPosArray[enemyIdx][0].x, enemyJointPosArray[enemyIdx][0].y, 16 * k, 16 * k, 16 * (sprIdx & 7), 16 * (sprIdx >> 3), 16, primTint, secTint, 255);
            }
        }
    }
    for (let enemyIdx = 0; enemyIdx < enemyCount; enemyIdx++) {
        if (enemyAuxStateArray[enemyIdx] > 0){
            enemyAuxStateArray[enemyIdx]--;
            if (enemyHealthArray[enemyIdx] > 0) {
                let drawScale = enemyCatalog[enemyTypeArray[enemyIdx]][enemyDrawScaleCol];
                drawRect(floor(enemyJointPosArray[enemyIdx][0].x) - 7 * drawScale, floor(enemyJointPosArray[enemyIdx][0].y) - 10 * drawScale, 14 * drawScale, 1, 10027008);
                drawRect(
                    floor(enemyJointPosArray[enemyIdx][0].x) - 7 * drawScale, floor(enemyJointPosArray[enemyIdx][0].y) - 10 * drawScale,
                    floor(14 * drawScale * enemyHealthArray[enemyIdx] / enemyCatalog[enemyTypeArray[enemyIdx]][enemyHealthCol]), 1, 52224
                )
            }
        }
    }
}


function drawEnemyStatic(_typeIdx, _px, _py, _scale) { // Ch
    let behaviorIdx = enemyCatalog[_typeIdx][enemyBehaviorIdxCol],
        spriteIdx = enemyCatalog[_typeIdx][enemySpriteIndexCol],
        primTint = enemyCatalog[_typeIdx][enemyPrimaryTintCol],
        secTint = enemyCatalog[_typeIdx][enemySecondaryTintCol],
        accentTint = enemyCatalog[_typeIdx][enemyAccentTintCol];
    _scale = clamp(enemyCatalog[_typeIdx][enemyDrawScaleCol], 1, _scale);
    let yAnchor = enemySpriteAnchorYBySpriteIndex[spriteIdx],
        posY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        posX = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (behaviorIdx == enemySlimeBehaviorIdx) {
        drawEnemyScaledSprite(
            _px + 0 * _scale, _py - yAnchor * _scale + 1, 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 
            16 * (spriteIdx >> 3), 16, primTint, secTint, 255
        );
    } else if (behaviorIdx == enemyBoxSnakeBehaviorIdx) {
        drawRectCentered(_px + 5 * _scale, _py - 4 * _scale, 4 * _scale, 4 * _scale, accentTint);
        drawRectCentered(_px + 2 * _scale, _py - 10 * _scale, 5 * _scale, 5 * _scale, accentTint);
        drawEnemyScaledSprite(
            _px - 4 * _scale, _py - 11 * _scale, 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 
            16 * (spriteIdx >> 3), 16, primTint, secTint, 255
    );
    } else if (behaviorIdx == enemyBatBehaviorIdx) {
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
    } else if (behaviorIdx == enemyDragonBehaviorIdx) {
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
        drawRectCentered(floor(posY[5]),
            floor(posX[5]), floor(2 * _scale), floor(2 * _scale), primTint);
        drawEnemyScaledSprite(posY[0], posX[0], 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 16 * (spriteIdx >> 3), 16, primTint, secTint, 255);
    } else if (behaviorIdx == enemyStickmanBehaviorIdx) {
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
        drawLine(posY[2], posX[2],
            posY[8], posX[8], accentTint);
        drawLine(posY[7], posX[7], posY[9], posX[9], accentTint);
        drawLine(posY[8], posX[8], posY[10], posX[10], accentTint);
        drawEnemyScaledSprite(posY[0], posX[0], 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 16 * (spriteIdx >> 3), 16, primTint, secTint, 255);
    } else if (behaviorIdx == enemyTreeBehaviorLeftIdx) {
        drawRectOutlineCentered(_px + 0, _py + 0, 5, 5, accentTint);
        drawRectOutlineCentered(_px - 1, _py - 6, 5, 5, accentTint);
        drawRectOutlineCentered(_px + 0, _py - 12, 5, 5, accentTint);
        drawEnemyScaledSprite(_px + 0, _py - 18, 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 16 * (spriteIdx >> 3), 16, primTint, secTint, 255);
    } else if (behaviorIdx == enemyTreeBehaviorRightIdx) {
        drawRectOutlineCentered(_px + 0, _py - 17, 5, 5, accentTint);
        drawRectOutlineCentered(_px - 1, _py - 11, 5, 5, accentTint);
        drawRectOutlineCentered(_px + 0, _py - 5, 5, 5, accentTint);
        drawEnemyScaledSprite(_px + 0, _py + 1, 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 16 * (spriteIdx >> 3) + 16, -16, primTint, secTint, 255);
    } else if (behaviorIdx == enemyHangingTreeBehaviorIdx) {
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
        posY[5] =
            _px - 5 * _scale;
        posX[5] = _py - 0 * _scale;
        posY[6] = _px - 12 * _scale;
        posX[6] = _py - 10 * _scale;
        for (_px = 1; 6 > _px; _px++) drawLine(posY[_px], posX[_px], posY[_px + 1], posX[_px + 1], secTint);
        drawLine(posY[_px], posX[_px], posY[1], posX[1], secTint);
        drawSpriteSheetPartCentered(
            enemySpriteSheet, floor(posY[0]), floor(posX[0]), floor(16 * _scale), floor(16 * _scale), 
            16 * (spriteIdx & 7), 16 * (spriteIdx >> 3), 16, 16, primTint
        );
    } else if (behaviorIdx == enemyUpdateFunc7Idx) {
        behaviorIdx = enemyCatalog[_typeIdx][enemyShapeParamACol];
        _typeIdx = enemyCatalog[_typeIdx][enemyShapeParamBCol];
        posY[0] = _px + 0 * _scale;
        posX[0] = _py - 10 * _scale;
        for (_px = 0; _px < behaviorIdx; _px++) {
            _py = 360 * _px / behaviorIdx * PI / 180;
            posY[_px + 1] = posY[0] + Math.cos(_py) * _typeIdx * _scale;
            posX[_px + 1] = posX[0] + Math.sin(_py) * _typeIdx * _scale;
        }
        for (_px = 1; _px < behaviorIdx; _px++) 
            drawLine(posY[_px], posX[_px], posY[_px + 1], posX[_px + 1], accentTint);
        drawLine(posY[_px], posX[_px], posY[1], posX[1], accentTint);
        drawEnemyScaledSprite(posY[0], posX[0], 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 16 * (spriteIdx >> 3), 16, primTint, secTint, 255);
    } else if (behaviorIdx == enemyUpdateFunc9Idx) {
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
        drawLine(floor(posY[0]), floor(posX[0]), floor(posY[1]), floor(posX[1]), secTint);
        drawLine(floor(posY[0]), floor(posX[0]), floor(posY[3]), floor(posX[3]), secTint);
        drawLine(floor(posY[1]), floor(posX[1]), floor(posY[2]), floor(posX[2]), secTint);
        drawLine(floor(posY[3]), floor(posX[3]), floor(posY[4]), floor(posX[4]), secTint);
        drawLine(floor(posY[0]), floor(posX[0]), floor(posY[5]), floor(posX[5]), secTint);
        drawLine(floor(posY[0]), floor(posX[0]), floor(posY[7]), floor(posX[7]), secTint);
        drawLine(floor(posY[5]), floor(posX[5]), floor(posY[6]), floor(posX[6]), secTint);
        drawLine(floor(posY[7]), floor(posX[7]), floor(posY[8]), floor(posX[8]), secTint);
        drawSpriteSheetPartCentered(
            enemySpriteSheet, floor(posY[0]), floor(posX[0]), floor(16 * _scale), floor(16 * _scale), 
            16 * (spriteIdx & 7), 16 * (spriteIdx >> 3), 16, 16, primTint
        );
    } else if (behaviorIdx == enemyUpdateFunc10Idx) {
        drawLine(_px + 5 * _scale, _py - 6 * _scale, _px + 8 * _scale, _py - 11 * _scale, accentTint);
        drawLine(_px + 8 * _scale, _py - 11 * _scale, _px + 10 * _scale, _py - 3 * _scale, accentTint);
        drawLine(_px + 10 * _scale, _py - 3 * _scale, _px + 5 * _scale, _py - 6 * _scale, accentTint);
        drawRectOutlineCentered(_px + 0 * _scale, _py - 9 * _scale, 6 * _scale + 1, 6 * _scale + 1, accentTint);
        drawEnemyScaledSprite(
            _px - 5 * _scale, _py - 13 * _scale, 16 * _scale, 16 * _scale, 16 * (spriteIdx & 7), 
            16 * (spriteIdx >> 3), 16, primTint, secTint, 255
        );
    } else if (behaviorIdx == enemyStickmanBehaviorAltIdx) {
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

let projectileCount = 0,
    projectileOwnerIdx = new Int32Array(1E3),           // hl, projectile owner index (>=0 = hero index; <0 = -enemyIdx-1)
    projectileJointPair = new Int32Array(1E3),          // il, packed attach joint pair (high=jointA, low=jointB). Negative => free-moving (tile-collision) mode.
    projectilePosition = Array(1E3);                    // jl, projectile position Vec2 — world position when free, local offset when attached.
for (let _i = 0; 1E3 > _i; _i++) projectilePosition[_i] = new Vec2;
let projectileVelocity = Array(1E3);                    // kl, projectile velocity Vec2; updated (gravity/homing) and used to advance or transform projectile motion.
for (let _i = 0; 1E3 > _i; _i++) projectileVelocity[_i] = new Vec2;
let projectileImpactState = new Int32Array(1E3),        // ll, projectile life/state flag (0 = active, 1 = impact/fade-out awaiting deletion).
    projectileDrawMode = new Int32Array(1E3),           // ml, projectile draw mode. 0 = simple sprite, 1 = rasterized rotated quad, 2 = draw enemy-sprite branch.
    projectileSpriteTileIndex = new Int32Array(1E3),    // nl, packed projectile sprite-sheet tile info (low bits used for sub-tile, high bits used for tile index -> sheet x/y).
    projectileTintColor = new Int32Array(1E3),          // ol, packed RGBA tint used for projectile color/alpha (alpha scaled by life for fade-out).
    
    projectileSolidRenderMode = new Int32Array(1E3),    // pl, projectile solid/blend render mode (used as isSolidRender with modes 0/1/2/3 selecting different compositing behavior).
    projectileSpriteWidth = new Int32Array(1E3),        // ql, projectile sprite/render width (pixels) passed to sprite/draw calls.
    projectileSpriteHeight = new Int32Array(1E3),       // rl, projectile sprite/render height (pixels) passed to sprite/draw calls.
    
    projectileShapeMode = new Int32Array(1E3),          // sl, projectile effect shape/mode for hit detection (0 = rectangular area, 1 = line/beam shape; passed as shapeMode to applyEffectToEnemies).
    projectileHitboxWidth = new Int32Array(1E3),        // tl, full hitbox width (pixels) passed to collision/effect routines.
    projectileHitboxHeight = new Int32Array(1E3),       // ul, full hitbox height (pixels) passed to collision/effect routines.
    
    projectileSpawnDelayFrames = new Int32Array(1E3),   // vl, frames to wait before the projectile becomes active (counts down each frame).
    projectileHitCooldownFrames = new Int32Array(1E3),  // wl, short frames of suppressed hit/impact processing after spawn/impact.
    projectileImpactAge = new Int32Array(1E3),          // xl, frames spent in impact/fade-out (incremented while impact-state == 1).
    projectileImpactLifetime = new Int32Array(1E3),     // yl, frames before an impacted projectile is deleted (impact lifetime).
    projectileAttachJointIndex = new Float32Array(1E3), // zl, attachment/joint index mode (0 = free/gravity; -1 = special; >0 = index into owner joint positions used for seeking/attachment).
    
    projectileAcceleration = new Float32Array(1E3),     // Al, per-projectile acceleration scalar used for gravity or homing (applied as .01 * Al to velocity each update).
    projectileVelocityScale = new Int32Array(1E3),      // Bl, per-projectile velocity scale applied each update (velocity multiplied by .01 * Bl).
    projectileCustomIntA = new Int32Array(1E3),         // Cl, integer per-projectile extra parameter assigned at spawn but not referenced elsewhere (reserved/unused in current code).
    projectileTileCollisionMode = new Int32Array(1E3),  // Dl, per-projectile tile-collision mode controlling how projectiles interact with stage tiles (observed modes: 0 triggers impact, 2/stick-to-tile, 3=bounce, 4=clamp/zero-vel).
    projectileHomingRange = new Int32Array(1E3),        // El, homing/search radius for projectiles; when >0 the projectile searches for targets within El and adjusts velocity toward them.
    projectileCustomIntB = new Int32Array(1E3),         // Fl, integer per-projectile extra parameter assigned at spawn but not observed used elsewhere (reserved/unused in current code).
    projectileMaxTargets = new Int32Array(1E3),         // Gl, per-projectile effect maxTargets passed to applyEffectToEnemies when the projectile hits (limits how many enemies the projectile affects).

    projectileDamageMin = new Int32Array(1E3),          // Hl, projectile effect damage minimum (passed as damageMin to applyEffectToEnemies / damagePartyMemberInArea)
    projectileDamageMax = new Int32Array(1E3),          // Il, projectile effect damage maximum (passed as damageMax to applyEffectToEnemies / damagePartyMemberInArea)
    projectileEffectType = new Int32Array(1E3),         // Jl, projectile effect type (0=phys,1=fire,2=ice,3=light,4=poison - selects damage/effect branch in applyEffectToEnemies)
    projectileEffectDuration = new Int32Array(1E3),     // Kl, projectile effect duration/parameter (frames passed as effectDuration to applyEffectToEnemies)
    projectileApplyMode = new Int32Array(1E3),          // Ll, projectile hit/apply mode flag (controls whether effect call is "check-only" vs applies damage; certain values also alter impact timing)
    projectileImpactSpawnMode = new Int32Array(1E3),    // Ml, projectile impact/spawn mode (selects child-spawn / impact pattern used when the projectile hits)
    projectileSpawnParam = new Int32Array(1E3),         // Nl, projectile spawn parameter (used as angular spread or probability threshold depending on Ml)

    // Per-projectile extra integer parameters forwarded from item/projectile template
    projectileTmplSpeed = new Int32Array(1E3),          // Ol, template itemProjectileSpeedCol forwarded: projectile base speed from item template; carried into spawn and child-spawns.
    projectileTmplElementType = new Int32Array(1E3),    // Pl, template itemElementTypeCol forwarded: item element/type (0=phys,1=fire,2=ice,3=light,4=poison); used by effect/aux logic and forwarded to child spawns.
    projectileTmplElementBonus = new Int32Array(1E3),   // Ql, modified itemIceBonusPercent (adjusted by accessories) forwarded: per-template element bonus percent applied to effect calculations; carried into projectile and child spawns.
    projectileTmplParam1 = new Int32Array(1E3),         // Rl, template itemProjectileParam1Col forwarded: template-specific integer parameter (semantics defined by projectile template); passed to child-spawns.
    projectileTmplAttackMode = new Int32Array(1E3),     // Sl, template itemAttackModeCol forwarded: attack mode flag from item (influences attack/spawn behaviour); carried into projectile and children.
    projectileTmplParam2 = new Int32Array(1E3),         // Tl, template itemProjectileParam2Col forwarded: second template-specific integer parameter; passed through to spawn/impact handlers.
    projectileTmplAux1 = new Int32Array(1E3),           // Ul, template itemProjectileAux1Col forwarded: auxiliary template integer A; forwarded into spawned children.
    projectileTmplAux2 = new Int32Array(1E3),           // Vl, template itemProjectileAux2Col forwarded: auxiliary template integer B; forwarded into spawned children.
    projectileTmplAuxValueA = new Int32Array(1E3),      // Wl, template itemAuxValueACol forwarded: auxiliary value A from item (template-defined use); carried into projectile and child spawns.
    projectileTmplAuxValueB = new Int32Array(1E3),      // Xl, per-projectile template param forwarded to child spawns.
    projectileTmplAuxValueC = new Int32Array(1E3),      // Yl, template itemAuxValueBCol forwarded: auxiliary value B from item; forwarded into spawn/impact calls.
    projectileTmplDisplayStatA = new Int32Array(1E3),   // Zl, template itemDisplayStatACol forwarded: display/stat A from item (often shown in UI or used by template logic); forwarded to children.
    projectileTmplAuxValueD = new Int32Array(1E3),      // $l, template itemAuxValueDCol forwarded: auxiliary value D from item; carried through to spawn/impact handlers.
    projectileTmplFlag = new Int32Array(1E3),           // am, template itemProjectileFlagCol forwarded: bitfield/flag set on the item’s projectile template altering spawn/impact behaviours; forwarded into projectile and child spawns.
    projectileTmplParamTime = new Int32Array(1E3),      // bm, template itemProjectileParamTimeCol forwarded: time/threshold parameter used by some impact/spawn modes; carried from item -> spawn and forwarded into child-spawn calls.
    projectileTmplHitCount = new Int32Array(1E3),       // cm, template itemHitCountCol forwarded: hit/count parameter from item (used as per-template hit-count or chance for spawned children).
    projectileTmplEffectMode = new Int32Array(1E3),     // dm, template itemProjectileEffectModeCol forwarded: per-template effect-mode flag (selects specialised effect/spawn handling); passed from item into projectile and into child spawns.
    projectileTmplStatA = new Int32Array(1E3),          // em, template itemStatACol (modified) forwarded: per-item stat A (modified by hero/accessories) carried into projectile and child spawns for template-specific behaviors.
    projectileTmplExtraStat1 = new Int32Array(1E3),     // fm, template itemExtraStatCol1 forwarded: extra/template stat carried through to projectile and child-spawns (template-defined use).
    
    projectileChildCount = new Int32Array(1E3),         // gm, child‑spawn count (or chance threshold in some impact modes); used as loop bound and probability check.
    projectileChildSpeed = new Int32Array(1E3);         // hm, scalar used to set spawned child projectile velocity/scale (interpreted as speed/magnitude)


function clearProjectiles() { // im
    projectileCount = 0
}


function spawnProjectile(
    _parent, jointPair, _px, _py, _vx, _vy, drawMode, tileIdx, tint, render, width, height, shape, hitboxWidth, 
    hitboxHeight, spawnDelay, hitCooldown, impactAge, impactLife, jointIdx, acel, velScale, custIntA, collisionMode, homingRange, customIntB, 
    maxTargets, dmgMin, dmgMax, effectType, effectDuration, applyMode, impactSpawnMode, spawnParam, tmpl_speed, tmpl_elementType, tmpl_elementBonus, 
    tmpl_param1, tmpl_attackMode, tmpl_param2, tmpl_aux1, tmpl_aux2, tmpl_auxA, tmpl_auxB, tmpl_auxC, tmpl_dispStatsA, tmpl_auxD, tmpl_flag, 
    tmmpl_paramTime, tmpl_hitCount, tmpl_effectMode, tmpl_statA, tmpl_extraStat1, tmpl_childCount, tmpl_childSpeed
) { // zi
    if (projectileCount >= 1E3) return;
    projectileOwnerIdx[projectileCount] = _parent;
    projectileJointPair[projectileCount] = jointPair;
    Vec2Set(projectilePosition[projectileCount], _px, _py);
    Vec2Set(projectileVelocity[projectileCount], _vx, _vy);
    projectileImpactState[projectileCount] = 0;
    projectileDrawMode[projectileCount] = drawMode;
    projectileSpriteTileIndex[projectileCount] = tileIdx;
    projectileTintColor[projectileCount] = tint;
    projectileSolidRenderMode[projectileCount] = render;
    projectileSpriteWidth[projectileCount] = width;
    projectileSpriteHeight[projectileCount] = height;
    projectileShapeMode[projectileCount] = shape;
    projectileHitboxWidth[projectileCount] = hitboxWidth;
    projectileHitboxHeight[projectileCount] = hitboxHeight;
    projectileSpawnDelayFrames[projectileCount] = floor(randFloat(spawnDelay));
    projectileHitCooldownFrames[projectileCount] = hitCooldown;
    projectileImpactAge[projectileCount] = impactAge;
    projectileImpactLifetime[projectileCount] = impactLife;
    projectileAttachJointIndex[projectileCount] = jointIdx;
    projectileAcceleration[projectileCount] = acel;
    projectileVelocityScale[projectileCount] = velScale;
    projectileCustomIntA[projectileCount] = custIntA;
    projectileTileCollisionMode[projectileCount] = collisionMode;
    projectileHomingRange[projectileCount] = homingRange;
    projectileCustomIntB[projectileCount] = customIntB;
    projectileMaxTargets[projectileCount] = maxTargets;
    projectileDamageMin[projectileCount] = dmgMin;
    projectileDamageMax[projectileCount] = dmgMax;
    projectileEffectType[projectileCount] = effectType;
    projectileEffectDuration[projectileCount] = effectDuration;
    projectileApplyMode[projectileCount] = applyMode;
    projectileImpactSpawnMode[projectileCount] = impactSpawnMode;
    projectileSpawnParam[projectileCount] = spawnParam;
    projectileTmplSpeed[projectileCount] = tmpl_speed;
    projectileTmplElementType[projectileCount] = tmpl_elementType;
    projectileTmplElementBonus[projectileCount] = tmpl_elementBonus;
    projectileTmplParam1[projectileCount] = tmpl_param1;
    projectileTmplAttackMode[projectileCount] = tmpl_attackMode;
    projectileTmplParam2[projectileCount] = tmpl_param2;
    projectileTmplAux1[projectileCount] = tmpl_aux1;
    projectileTmplAux2[projectileCount] = tmpl_aux2;
    projectileTmplAuxValueA[projectileCount] = tmpl_auxA;
    projectileTmplAuxValueB[projectileCount] = tmpl_auxB;
    projectileTmplAuxValueC[projectileCount] = tmpl_auxC;
    projectileTmplDisplayStatA[projectileCount] = tmpl_dispStatsA;
    projectileTmplAuxValueD[projectileCount] = tmpl_auxD;
    projectileTmplFlag[projectileCount] = tmpl_flag;
    projectileTmplParamTime[projectileCount] = tmmpl_paramTime;
    projectileTmplHitCount[projectileCount] = tmpl_hitCount;
    projectileTmplEffectMode[projectileCount] = tmpl_effectMode;
    projectileTmplStatA[projectileCount] = tmpl_statA;
    projectileTmplExtraStat1[projectileCount] = tmpl_extraStat1;
    projectileChildCount[projectileCount] = tmpl_childCount;
    projectileChildSpeed[projectileCount] = tmpl_childSpeed;
    projectileCount++;
}


function deleteProjectile(projIdx) { // jm
    projectileOwnerIdx[projIdx] = projectileOwnerIdx[projectileCount - 1];
    projectileJointPair[projIdx] = projectileJointPair[projectileCount - 1];
    projectilePosition[projIdx].set(projectilePosition[projectileCount - 1]);
    projectileVelocity[projIdx].set(projectileVelocity[projectileCount - 1]);
    projectileImpactState[projIdx] = projectileImpactState[projectileCount - 1];
    projectileDrawMode[projIdx] = projectileDrawMode[projectileCount - 1];
    projectileSpriteTileIndex[projIdx] = projectileSpriteTileIndex[projectileCount - 1];
    projectileTintColor[projIdx] = projectileTintColor[projectileCount - 1];
    projectileSolidRenderMode[projIdx] = projectileSolidRenderMode[projectileCount - 1];
    projectileSpriteWidth[projIdx] = projectileSpriteWidth[projectileCount - 1];
    projectileSpriteHeight[projIdx] = projectileSpriteHeight[projectileCount - 1];
    projectileShapeMode[projIdx] = projectileShapeMode[projectileCount - 1];
    projectileHitboxWidth[projIdx] = projectileHitboxWidth[projectileCount - 1];
    projectileHitboxHeight[projIdx] = projectileHitboxHeight[projectileCount - 1];
    projectileSpawnDelayFrames[projIdx] = projectileSpawnDelayFrames[projectileCount - 1];
    projectileHitCooldownFrames[projIdx] = projectileHitCooldownFrames[projectileCount - 1];
    projectileImpactAge[projIdx] = projectileImpactAge[projectileCount - 1];
    projectileImpactLifetime[projIdx] = projectileImpactLifetime[projectileCount - 1];
    projectileAttachJointIndex[projIdx] = projectileAttachJointIndex[projectileCount - 1];
    projectileAcceleration[projIdx] = projectileAcceleration[projectileCount - 1];
    projectileVelocityScale[projIdx] = projectileVelocityScale[projectileCount - 1];
    projectileCustomIntA[projIdx] = projectileCustomIntA[projectileCount - 1];
    projectileTileCollisionMode[projIdx] = projectileTileCollisionMode[projectileCount - 1];
    projectileHomingRange[projIdx] = projectileHomingRange[projectileCount - 1];
    projectileCustomIntB[projIdx] = projectileCustomIntB[projectileCount - 1];
    projectileMaxTargets[projIdx] = projectileMaxTargets[projectileCount - 1];
    projectileDamageMin[projIdx] = projectileDamageMin[projectileCount - 1];
    projectileDamageMax[projIdx] = projectileDamageMax[projectileCount - 1];
    projectileEffectType[projIdx] = projectileEffectType[projectileCount - 1];
    projectileEffectDuration[projIdx] = projectileEffectDuration[projectileCount - 1];
    projectileApplyMode[projIdx] = projectileApplyMode[projectileCount - 1];
    projectileImpactSpawnMode[projIdx] = projectileImpactSpawnMode[projectileCount - 1];
    projectileSpawnParam[projIdx] = projectileSpawnParam[projectileCount - 1];
    projectileTmplSpeed[projIdx] = projectileTmplSpeed[projectileCount - 1];
    projectileTmplElementType[projIdx] = projectileTmplElementType[projectileCount - 1];
    projectileTmplElementBonus[projIdx] = projectileTmplElementBonus[projectileCount - 1];
    projectileTmplParam1[projIdx] = projectileTmplParam1[projectileCount - 1];
    projectileTmplAttackMode[projIdx] = projectileTmplAttackMode[projectileCount - 1];
    projectileTmplParam2[projIdx] = projectileTmplParam2[projectileCount - 1];
    projectileTmplAux1[projIdx] = projectileTmplAux1[projectileCount - 1];
    projectileTmplAux2[projIdx] = projectileTmplAux2[projectileCount - 1];
    projectileTmplAuxValueA[projIdx] = projectileTmplAuxValueA[projectileCount - 1];
    projectileTmplAuxValueB[projIdx] = projectileTmplAuxValueB[projectileCount - 1];
    projectileTmplAuxValueC[projIdx] = projectileTmplAuxValueC[projectileCount - 1];
    projectileTmplDisplayStatA[projIdx] = projectileTmplDisplayStatA[projectileCount - 1];
    projectileTmplAuxValueD[projIdx] = projectileTmplAuxValueD[projectileCount - 1];
    projectileTmplFlag[projIdx] = projectileTmplFlag[projectileCount - 1];
    projectileTmplParamTime[projIdx] = projectileTmplParamTime[projectileCount - 1];
    projectileTmplHitCount[projIdx] = projectileTmplHitCount[projectileCount - 1];
    projectileTmplEffectMode[projIdx] = projectileTmplEffectMode[projectileCount - 1];
    projectileTmplStatA[projIdx] = projectileTmplStatA[projectileCount - 1];
    projectileTmplExtraStat1[projIdx] = projectileTmplExtraStat1[projectileCount - 1];
    projectileChildCount[projIdx] = projectileChildCount[projectileCount - 1];
    projectileChildSpeed[projIdx] = projectileChildSpeed[projectileCount - 1];
    projectileCount--
}


function moveProjectileWithCollision(projIdx, vel) { // km
    var c = 0;
    vel.set(projectileVelocity[projIdx]);
    var d = floor(Vec2Mag(vel) / 4) + 1;
    Vec2Scale(vel, 1 / d);
    for (var f, g, h = 0; h < d; h++) {
        f = projectilePosition[projIdx].y + vel.y;
        g = getStageTileAt(projectilePosition[projIdx].x, f);
        if (0 <= g && 29 >= g) {
            if (0 == projectileTileCollisionMode[projIdx]) {
                c = 1;
            } else if (2 == projectileTileCollisionMode[projIdx]) {
                projectilePosition[projIdx].y = f;
            } else if (3 == projectileTileCollisionMode[projIdx]) {
                vel.y = -vel.y;
                projectileVelocity[projIdx].y = -projectileVelocity[projIdx].y;
            } else if (4 == projectileTileCollisionMode[projIdx] && 0 < projectileVelocity[projIdx].y) {
                c = 1;
            } else {
                projectileVelocity[projIdx].y = 0;
            }
        } else {
            projectilePosition[projIdx].y = f;
        }
        f = projectilePosition[projIdx].x + vel.x;
        g = getStageTileAt(f, projectilePosition[projIdx].y);
        if (0 <= g && 29 >= g) {
            if (0 == projectileTileCollisionMode[projIdx]) {
                c = 1;
            } else if (2 == projectileTileCollisionMode[projIdx]) {
                projectilePosition[projIdx].x = f;
            } else if (3 == projectileTileCollisionMode[projIdx]) {
                vel.x = -vel.x;
                projectileVelocity[projIdx].x = -projectileVelocity[projIdx].x;
            } else if (4 == projectileTileCollisionMode[projIdx]) {
                projectileVelocity[projIdx].x = 0;
            }
        } else {
            projectilePosition[projIdx].x = f;
        }
    }
    return c;
}


function updateProjectiles() { // Bg
    let a, b, c, d = new Vec2(),
        f = new Vec2(),
        g = new Vec2(),
        h = new Vec2(),
        k = new Vec2(),
        p, t, l;
    for (a = 0; a < projectileCount; a++){
        if (-64 > projectilePosition[a].x || 704 < projectilePosition[a].x) {
            deleteProjectile(a--);
        } else if (0 < projectileSpawnDelayFrames[a]) {
            projectileSpawnDelayFrames[a]--;
        } else if (1 == projectileImpactState[a]) {
            projectileImpactAge[a]++;
            if (projectileImpactAge[a] >= projectileImpactLifetime[a]) {
                deleteProjectile(a--);
            }
        } else {
            if (0 < projectileHomingRange[a]) {
                b = projectileHomingRange[a];
                b = 0 <= projectileOwnerIdx[a] ? findEnemyInArea(projectilePosition[a].x, projectilePosition[a].y, b, b) : findNearestPartyMemberInRect(projectilePosition[a].x, projectilePosition[a].y, b, b, 0);
                if (-1 != b) {
                    if (0 <= projectileOwnerIdx[a]) {
                        Vec2Sub(d, enemyJointPosArray[b][0], projectilePosition[a]);
                    } else {
                        Vec2Sub(d, heroJointPositionsByHero[b][0], projectilePosition[a]);
                    }
                    Vec2Norm(d);
                    b = Vec2Mag(projectileVelocity[a]);
                    projectileVelocity[a].x = .85 * projectileVelocity[a].x + .15 * d.x + randFloatRange(-.1, .1);
                    projectileVelocity[a].y = .85 * projectileVelocity[a].y + .15 * d.y + randFloatRange(-.1, .1);
                    Vec2Norm(projectileVelocity[a]);
                    Vec2Scale(projectileVelocity[a], max(b, 1));
                }
            }
            if (0 == projectileAttachJointIndex[a]) {
                projectileVelocity[a].y += .01 * projectileAcceleration[a];
            } else {
                if (-1 == projectileAttachJointIndex[a]) {
                    d.set(projectilePosition[a]);
                } else {
                    c = projectileOwnerIdx[a];
                    l = 0 <= c ? heroJointPositionsByHero : enemyJointPosArray;
                    c = 0 <= c ? c : -c - 1;
                    Vec2Sub(d, projectilePosition[a], l[c][projectileAttachJointIndex[a]]);
                }
                Vec2Norm(d);
                Vec2Scale(d, .01 * -projectileAcceleration[a]);
                projectileVelocity[a].add(d);
            }
            Vec2Scale(projectileVelocity[a], .01 * projectileVelocityScale[a]);
            b = 0;
            if (0 > projectileJointPair[a]) {
                b = moveProjectileWithCollision(a, d);
            } else {
                projectilePosition[a].add(projectileVelocity[a]);
            }
            if (0 > projectileJointPair[a]) {
                h.set(projectilePosition[a]);
                k.set(projectileVelocity[a]);
            } else {
                c = projectileOwnerIdx[a];
                p = projectileJointPair[a] >> 8;
                t = projectileJointPair[a] & 255;
                l = 0 <= c ? heroJointPositionsByHero : enemyJointPosArray;
                c = 0 <= c ? c : -c - 1;
                if (p == t) {
                    Vec2Add(h, l[c][p], projectilePosition[a]);
                    k.set(projectileVelocity[a]);
                } else {
                    Vec2Sub(g, l[c][t], l[c][p]);
                    Vec2Norm(g);
                    f.set(g);
                    Vec2Rotate(f);
                    h.x = f.x * projectilePosition[a].x + g.x * projectilePosition[a].y + l[c][p].x;
                    h.y = f.y * projectilePosition[a].x + g.y * projectilePosition[a].y + l[c][p].y;
                    k.x = f.x * projectileVelocity[a].x + g.x * projectileVelocity[a].y;
                    k.y = f.y * projectileVelocity[a].x + g.y * projectileVelocity[a].y;
                }
            }
            p = 1;
            if (1 == projectileEffectType[a] && 0 == projectileImpactSpawnMode[a] && projectileEffectDuration[a] <= randFloat(60)) {
                p = 0;
            }
            if (0 < projectileHitCooldownFrames[a]) {
                projectileHitCooldownFrames[a]--;
                p = 0;
            }
            c = -1;
            if (1 == p) {
                c = 0;
                if (1 == projectileApplyMode[a] || 2 == projectileApplyMode[a]) c = 1;
                c = 0 <= projectileOwnerIdx[a] ? applyEffectToEnemies(c, projectileShapeMode[a], projectileMaxTargets[a], projectileEffectType[a], projectileEffectDuration[a], projectileDamageMin[a], projectileDamageMax[a], h, k, projectileHitboxWidth[a], projectileHitboxHeight[a]) : damagePartyMemberInArea(0, projectileMaxTargets[a], projectileEffectType[a], projectileEffectDuration[a], projectileDamageMin[a], projectileDamageMax[a], h.x, h.y, projectileHitboxWidth[a], projectileHitboxHeight[a]);
            }
            if (1 == projectileEffectType[a] && 0 == projectileImpactSpawnMode[a]) {
                c = -1;    
            }
            if (4 == projectileEffectType[a] && 99 == projectileMaxTargets[a]) {
                c = -1;    
            }
            if (2 == projectileApplyMode[a] && 1 == projectileImpactAge[a]) {
                b = 1;
            }
            if (1 == b || -1 != c) {
                projectileImpactState[a] = 1; 
                projectileImpactAge[a] = 0;
                if (1 <= projectileImpactSpawnMode[a] && 9 >= projectileImpactSpawnMode[a]) {
                    for (b = 0; b < projectileChildCount[a]; b++) {
                        if (1 == projectileImpactSpawnMode[a]) {
                            Vec2Set(d, 0, 0);
                        } else if (2 == projectileImpactSpawnMode[a] || 3 == projectileImpactSpawnMode[a]) {
                            c = floor(randFloat(512));
                            p = randFloatRange(.1, projectileChildSpeed[a]);
                            d.x = rotationLUT[c][0] * p;
                            d.y = rotationLUT[c][1] * p;
                            if (0 < d.y && 2 == projectileImpactSpawnMode[a]) {
                                d.y = -d.y;
                            }
                        } else if (4 == projectileImpactSpawnMode[a]) {
                            Vec2Norm(k);
                            Vec2Scale(k, randFloatRange(.1, .1 * projectileSpawnParam[a]));
                            c = floor(randFloat(512));
                            p = randFloatRange(0, .1 * projectileChildSpeed[a]);
                            d.x = k.x + rotationLUT[c][0] * p;
                            d.y = k.y + rotationLUT[c][1] * p;
                        }
                        spawnProjectile(projectileOwnerIdx[a], -1, h.x, h.y, d.x, d.y, projectileTmplSpeed[a], projectileTmplElementType[a], projectileTmplElementBonus[a], projectileTmplParam1[a], projectileTmplAttackMode[a], projectileTmplParam2[a], projectileTmplAux1[a], projectileTmplAux2[a], projectileTmplAuxValueA[a], projectileTmplAuxValueB[a], projectileTmplAuxValueC[a], projectileTmplDisplayStatA[a], projectileTmplAuxValueD[a], projectileTmplFlag[a], projectileTmplParamTime[a], projectileTmplHitCount[a], projectileTmplEffectMode[a], projectileTmplStatA[a], 0, 0, projectileTmplExtraStat1[a], projectileDamageMin[a], projectileDamageMax[a], projectileEffectType[a], projectileEffectDuration[a], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                    } 
                }
            } else if (-1 != c && 20 <= projectileImpactSpawnMode[a] && 29 >= projectileImpactSpawnMode[a]) {
                for (b = 0; b < projectileChildCount[a]; b++) {
                    if (20 == projectileImpactSpawnMode[a]) {
                        c = floor(512 * Vec2Angle(k) / TAU);
                        c = c + randFloatRange(-projectileSpawnParam[a], projectileSpawnParam[a]) & 511;
                        d.x = rotationLUT[c][0] * projectileChildSpeed[a];
                        d.y = -rotationLUT[c][1] * projectileChildSpeed[a];
                    }
                    spawnProjectile(projectileOwnerIdx[a], -1, h.x, h.y, d.x, d.y, projectileTmplSpeed[a], projectileTmplElementType[a], projectileTmplElementBonus[a],
                        projectileTmplParam1[a], projectileTmplAttackMode[a], projectileTmplParam2[a], projectileTmplAux1[a], projectileTmplAux2[a], projectileTmplAuxValueA[a], projectileTmplAuxValueB[a], projectileTmplAuxValueC[a], projectileTmplDisplayStatA[a], projectileTmplAuxValueD[a], projectileTmplFlag[a], projectileTmplParamTime[a], projectileTmplHitCount[a], projectileTmplEffectMode[a], projectileTmplStatA[a], 0, 0, projectileTmplExtraStat1[a], projectileDamageMin[a], projectileDamageMax[a], projectileEffectType[a], projectileEffectDuration[a], projectileApplyMode[a], projectileImpactSpawnMode[a], projectileSpawnParam[a], projectileTmplSpeed[a], projectileTmplElementType[a], projectileTmplElementBonus[a], projectileTmplParam1[a], projectileTmplAttackMode[a], projectileTmplParam2[a], projectileTmplAux1[a], projectileTmplAux2[a], projectileTmplAuxValueA[a], projectileTmplAuxValueB[a], projectileTmplAuxValueC[a], projectileTmplDisplayStatA[a], projectileTmplAuxValueD[a], projectileTmplFlag[a], projectileTmplParamTime[a], projectileTmplHitCount[a], projectileTmplEffectMode[a], projectileTmplStatA[a], projectileTmplExtraStat1[a], projectileChildCount[a], projectileChildSpeed[a]);
                }
            }
            if (0 < projectileImpactAge[a]) {
                projectileImpactAge[a]--;
            }
            if (0 == projectileImpactAge[a]) {
                projectileImpactState[a] = 1;
            }
            if (10 == projectileImpactSpawnMode[a]) {
                if (randFloat(60) < projectileChildCount[a]) {
                    Vec2Norm(k);
                    Vec2Scale(k, .1 * projectileChildSpeed[a]);
                    spawnProjectile(projectileOwnerIdx[a], -1, h.x, h.y, k.x, k.y, projectileTmplSpeed[a], projectileTmplElementType[a], projectileTmplElementBonus[a], projectileTmplParam1[a], projectileTmplAttackMode[a], projectileTmplParam2[a], projectileTmplAux1[a], projectileTmplAux2[a], projectileTmplAuxValueA[a], projectileTmplAuxValueB[a], projectileTmplAuxValueC[a], projectileTmplDisplayStatA[a], projectileTmplAuxValueD[a], projectileTmplFlag[a], projectileTmplParamTime[a], projectileTmplHitCount[a], projectileTmplEffectMode[a], projectileTmplStatA[a], 0, 0, projectileTmplExtraStat1[a], projectileDamageMin[a],
                        projectileDamageMax[a], projectileEffectType[a], projectileEffectDuration[a], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                }
            } else if (11 == projectileImpactSpawnMode[a]) {
                if (randFloat(60) < projectileChildCount[a]) {
                    Vec2Norm(k);
                    p = randFloatRange(-projectileSpawnParam[a], projectileSpawnParam[a]);
                    h.x += k.x * p;
                    h.y += k.y * p;
                    Vec2Rotate(k);
                    Vec2Scale(k, .1 * projectileChildSpeed[a]);
                    spawnProjectile(projectileOwnerIdx[a], -1, h.x, h.y, k.x, k.y, projectileTmplSpeed[a], projectileTmplElementType[a], projectileTmplElementBonus[a], projectileTmplParam1[a], projectileTmplAttackMode[a], projectileTmplParam2[a], projectileTmplAux1[a], projectileTmplAux2[a], projectileTmplAuxValueA[a], projectileTmplAuxValueB[a], projectileTmplAuxValueC[a], projectileTmplDisplayStatA[a], projectileTmplAuxValueD[a], projectileTmplFlag[a], projectileTmplParamTime[a], projectileTmplHitCount[a], projectileTmplEffectMode[a], projectileTmplStatA[a], 0, 0, projectileTmplExtraStat1[a], projectileDamageMin[a], projectileDamageMax[a], projectileEffectType[a], projectileEffectDuration[a], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                }
            } else if (12 == projectileImpactSpawnMode[a]) {
                if (randFloat(60) < projectileChildCount[a]) {
                    c = floor(randFloat(512));
                    p = randFloatRange(.1 * projectileSpawnParam[a], .1 * projectileChildSpeed[a]);
                    k.x = rotationLUT[c][0] * p;
                    k.y = rotationLUT[c][1] * p;
                    spawnProjectile(projectileOwnerIdx[a], -1, h.x, h.y,
                        k.x, k.y, projectileTmplSpeed[a], projectileTmplElementType[a], projectileTmplElementBonus[a], projectileTmplParam1[a], projectileTmplAttackMode[a], projectileTmplParam2[a], projectileTmplAux1[a], projectileTmplAux2[a], projectileTmplAuxValueA[a], projectileTmplAuxValueB[a], projectileTmplAuxValueC[a], projectileTmplDisplayStatA[a], projectileTmplAuxValueD[a], projectileTmplFlag[a], projectileTmplParamTime[a], projectileTmplHitCount[a], projectileTmplEffectMode[a], projectileTmplStatA[a], 0, 0, projectileTmplExtraStat1[a], projectileDamageMin[a], projectileDamageMax[a], projectileEffectType[a], projectileEffectDuration[a], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                }
            } else if (13 == projectileImpactSpawnMode[a]) {
                if (randFloat(60) < projectileSpawnParam[a])
                    for (c = floor(randFloat(512)), b = 0; b < projectileChildCount[a]; b++) {
                        c = c + floor(512 / projectileChildCount[a]) & 511;
                        p = .1 * projectileChildSpeed[a];
                        k.x = rotationLUT[c][0] * p;
                        k.y = rotationLUT[c][1] * p;
                        spawnProjectile(projectileOwnerIdx[a], -1, h.x, h.y, k.x, k.y, projectileTmplSpeed[a], projectileTmplElementType[a], projectileTmplElementBonus[a], projectileTmplParam1[a], projectileTmplAttackMode[a], projectileTmplParam2[a], projectileTmplAux1[a], projectileTmplAux2[a], projectileTmplAuxValueA[a], projectileTmplAuxValueB[a], projectileTmplAuxValueC[a], projectileTmplDisplayStatA[a], projectileTmplAuxValueD[a], projectileTmplFlag[a], projectileTmplParamTime[a], projectileTmplHitCount[a], projectileTmplEffectMode[a], projectileTmplStatA[a], 0, 0, projectileTmplExtraStat1[a], projectileDamageMin[a], projectileDamageMax[a], projectileEffectType[a], projectileEffectDuration[a], 0, 0,
                            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                    }
            } else if (14 == projectileImpactSpawnMode[a]) {
                if (randFloat(60) < projectileSpawnParam[a] && (c = findEnemyInArea(h.x, h.y, 200, 200), -1 != c))
                    for (d.x = enemyJointPosArray[c][enemyTargetJointIdx].x - h.x, d.y = enemyJointPosArray[c][enemyTargetJointIdx].y - h.y, Vec2Norm(d), b = 0; b < projectileChildCount[a]; b++) {
                        c = floor(randFloat(512));
                        p = .1 * randFloat(projectileChildCount[a] - 1);
                        k.x = d.x * projectileChildSpeed[a] * .1 + rotationLUT[c][0] * p;
                        k.y = d.y * projectileChildSpeed[a] * .1 + rotationLUT[c][1] * p;
                        spawnProjectile(projectileOwnerIdx[a], -1, h.x, h.y, k.x, k.y, projectileTmplSpeed[a], projectileTmplElementType[a], projectileTmplElementBonus[a], projectileTmplParam1[a], projectileTmplAttackMode[a], projectileTmplParam2[a], projectileTmplAux1[a], projectileTmplAux2[a], projectileTmplAuxValueA[a], projectileTmplAuxValueB[a], projectileTmplAuxValueC[a], projectileTmplDisplayStatA[a], projectileTmplAuxValueD[a], projectileTmplFlag[a], projectileTmplParamTime[a], projectileTmplHitCount[a], projectileTmplEffectMode[a], projectileTmplStatA[a], 0, 0, projectileTmplExtraStat1[a], projectileDamageMin[a], projectileDamageMax[a], projectileEffectType[a], projectileEffectDuration[a], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                    }
            } else if (15 == projectileImpactSpawnMode[a]) {
                if (randFloat(60) < projectileChildCount[a]) {
                    Vec2Norm(k);
                    Vec2Scale(k, projectileChildSpeed[a]);
                    spawnProjectile(projectileOwnerIdx[a], -1, h.x, h.y, k.x, k.y, projectileTmplSpeed[a], projectileTmplElementType[a], projectileTmplElementBonus[a], projectileTmplParam1[a], projectileTmplAttackMode[a], projectileTmplParam2[a], projectileTmplAux1[a], projectileTmplAux2[a], projectileTmplAuxValueA[a], projectileTmplAuxValueB[a], projectileTmplAuxValueC[a], projectileTmplDisplayStatA[a], projectileTmplAuxValueD[a], projectileTmplFlag[a], projectileTmplParamTime[a], projectileTmplHitCount[a], projectileTmplEffectMode[a], projectileTmplStatA[a], 0, 0, projectileTmplExtraStat1[a], projectileDamageMin[a], projectileDamageMax[a], projectileEffectType[a], projectileEffectDuration[a], projectileApplyMode[a], 20, projectileSpawnParam[a], projectileTmplSpeed[a], projectileTmplElementType[a], projectileTmplElementBonus[a], projectileTmplParam1[a], projectileTmplAttackMode[a], projectileTmplParam2[a], projectileTmplAux1[a], projectileTmplAux2[a], projectileTmplAuxValueA[a], projectileTmplAuxValueB[a], projectileTmplAuxValueC[a], projectileTmplDisplayStatA[a], projectileTmplAuxValueD[a], projectileTmplFlag[a], projectileTmplParamTime[a], projectileTmplHitCount[a], projectileTmplEffectMode[a], projectileTmplStatA[a], projectileTmplExtraStat1[a], 1, projectileChildSpeed[a]);
                }
            }
        }
    }
}


function drawProjectiles() { // Eg
    var a, b, c, d, f = new Vec2,
        g = new Vec2,
        h = new Vec2,
        k = new Vec2,
        p = new Vec2,
        t = new Vec2,
        l, n, w, B;
    for (a = 0; a < projectileCount; a++)
        if (!(0 < projectileSpawnDelayFrames[a])) {
            b = (projectileSpriteTileIndex[a] & 7) << 4;
            c = projectileSpriteTileIndex[a] >> 3 << 4;
            1 == projectileImpactState[a] ? d = floor((projectileTintColor[a] >> 24 & 255) * (projectileImpactLifetime[a] - projectileImpactAge[a]) / projectileImpactLifetime[a]) << 24 | projectileTintColor[a] & 16777215 : d = projectileTintColor[a];
            0 < projectileHitCooldownFrames[a] && (d = floor((d >> 24 & 255) / 2) << 24 | d & 16777215);
            isSolidRender = projectileSolidRenderMode[a];
            spriteAltRenderFlag = 1;
            0 > projectileJointPair[a] ? (p.set(projectilePosition[a]), t.set(projectileVelocity[a])) : (l = projectileOwnerIdx[a], n = projectileJointPair[a] >> 8, w = projectileJointPair[a] & 255, B = 0 <= l ? heroJointPositionsByHero : enemyJointPosArray, l = 0 <= l ? l : -l - 1, n == w ? (Vec2Add(p, B[l][n], projectilePosition[a]), t.set(projectileVelocity[a])) : (Vec2Sub(g, B[l][w], B[l][n]), Vec2Norm(g), f.set(g), Vec2Rotate(f), p.x = f.x * projectilePosition[a].x + g.x * projectilePosition[a].y + B[l][n].x, p.y =
                f.y * projectilePosition[a].x + g.y * projectilePosition[a].y + B[l][n].y, t.x = f.x * projectileVelocity[a].x + g.x * projectileVelocity[a].y, t.y = f.y * projectileVelocity[a].x + g.y * projectileVelocity[a].y));
            if (0 == projectileDrawMode[a]) drawSpriteSheetPartCentered(effectSpriteSheet, p.x, p.y, projectileSpriteWidth[a], projectileSpriteHeight[a], b, c, 16, 16, d);
            else if (1 == projectileDrawMode[a]) {
                g.set(t);
                Vec2Norm(g);
                f.set(g);
                Vec2Rotate(f);
                Vec2Scale(f, projectileSpriteWidth[a] >> 1);
                Vec2Scale(g, projectileSpriteHeight[a] >> 1);
                Vec2Sub(h, g, f);
                Vec2Add(k, g, f);
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
                var Bb = effectSpriteSheet;
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
                Ga *=
                    65535;
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
                for (b = n; b <= c; b++) scanlineMinX[b] = 640, scanlineMaxX[b] = -1;
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
                for (b = n; b <= c; b++)
                    for (l = scanlineMaxX[b] - scanlineMinX[b] + 1, n = floor((scanlineTexUEnd[b] - scanlineTexUStart[b]) / l), Fa = floor((scanlineTexVEnd[b] - scanlineTexVStart[b]) / l), U = scanlineTexUStart[b], na = scanlineTexVStart[b], 0 > scanlineMinX[b] && (U += n * -scanlineMinX[b], na += Fa * -scanlineMinX[b], scanlineMinX[b] =
                        0), 640 <= scanlineMaxX[b] && (scanlineMaxX[b] = 639), K = 640 * b + scanlineMinX[b], ba = K + (scanlineMaxX[b] - scanlineMinX[b]); K <= ba; K++, U += n, na += Fa) l = w[(na >> 16) * B + (U >> 16)], 0 != l && (l = (l & 255) * M >> 8, 1 == isSolidRender ? (Ga = frameBufferArray[K] >> 16 & 255, Ga = ((J - Ga) * l >> 8) + Ga, Ca = frameBufferArray[K] >> 8 & 255, Ca = ((y - Ca) * l >> 8) + Ca, ua = frameBufferArray[K] & 255, ua = ((x - ua) * l >> 8) + ua, frameBufferArray[K] = Ga << 16 | Ca << 8 | ua) : 2 == isSolidRender ? (Ga = (frameBufferArray[K] >> 16 & 255) + (J * l >> 8), 255 < Ga && (Ga = 255), Ca = (frameBufferArray[K] >> 8 & 255) + (y * l >> 8), 255 < Ca && (Ca = 255), ua = (frameBufferArray[K] & 255) + (x * l >> 8), 255 < ua && (ua = 255), frameBufferArray[K] = Ga << 16 | Ca << 8 | ua) : 3 == isSolidRender && (Ga = (frameBufferArray[K] >> 16 & 255) - (J * l >> 8), 0 > Ga && (Ga = 0), Ca = (frameBufferArray[K] >> 8 & 255) - (y * l >> 8), 0 > Ca && (Ca = 0),
                            ua = (frameBufferArray[K] & 255) - (x * l >> 8), 0 > ua && (ua = 0), frameBufferArray[K] = Ga << 16 | Ca << 8 | ua))
            } else if (2 == projectileDrawMode[a]) {
                spriteAltRenderFlag = 0;
                l = -projectileOwnerIdx[a] - 1;
                n = enemyCatalog[enemyTypeArray[l]][enemyBehaviorIdxCol];
                w = enemyCatalog[enemyTypeArray[l]][enemySpriteIndexCol];
                l = max(enemyCatalog[enemyTypeArray[l]][enemyDrawScaleCol], 1);
                B = 0;
                if (n == enemySlimeBehaviorIdx || n == enemyBoxSnakeBehaviorIdx) B = -enemySpriteAnchorYBySpriteIndex[w] * l + 1;
                drawSpriteSheetPartCentered(enemySpriteSheet, p.x, p.y + B, projectileSpriteWidth[a], projectileSpriteHeight[a], b, c, 16, 16, d)
            }
            spriteAltRenderFlag = isSolidRender = 0
        }
}
let popupCount = 0, // aj
    popupPos = Array(1E3); // rm
for (let _i = 0; 1E3 > _i; _i++) popupPos[_i] = new Vec2;
let popupVel = Array(1E3); // sm
for (let _i = 0; 1E3 > _i; _i++) popupVel[_i] = new Vec2;
let popupValue = Array(1E3), // tm
    popupLife = new Int32Array(1E3), // um
    popupColor = new Int32Array(1E3); // vm


function clearPopups() { // wm
    popupCount = 0
}


function spawnPopup(x, y, vx, vy, life, color) { // Lg
    (1E3 != popupCount) && (
        x = clamp(x, 16, 623), 
        y = clamp(y, 8, 351), 
        Vec2Set(popupPos[popupCount], x, y), 
        Vec2Set(popupVel[popupCount], vx, -2), 
        (0 != vx) && (
            popupVel[popupCount].x += randFloatRange(-.2, .2), 
            popupVel[popupCount].y += randFloatRange(-.2, .2)
        ), 
        popupValue[popupCount] = vy, 
        popupLife[popupCount] = life, 
        popupColor[popupCount] = color, 
        popupCount++
    )
}


function removePopup(idx) { // xm
    popupPos[idx].set(popupPos[popupCount - 1]);
    popupVel[idx].set(popupVel[popupCount - 1]);
    popupValue[idx] = popupValue[popupCount - 1];
    popupLife[idx] = popupLife[popupCount - 1];
    popupColor[idx] = popupColor[popupCount - 1];
    popupCount--
}


function updatePopups() { // Ag
    let a;
    for (a = 0; a < popupCount; a++) {
        if (0 == popupVel[a].x) {
            var b = popupPos[a],
                c = popupVel[a];
            c.y += 0;
            Vec2Scale(c, .95)
        } else b = popupPos[a], c = popupVel[a], c.y += .05, Vec2Scale(c, .99);
        b.add(c);
        popupPos[a].x = clamp(popupPos[a].x, 16, 623);
        popupPos[a].y = clamp(popupPos[a].y, 8, 351);
        popupLife[a]--;
        0 >= popupLife[a] && removePopup(a--)
    }
}


function drawPopups() { // Fg
    let a, b, c, d, f;
    for (a = 0; a < popupCount; a++) 
        (20 <= popupLife[a]) 
            ? drawTextCentered(gameFontSmall, ~~popupPos[a].x, ~~popupPos[a].y, "" + popupValue[a], popupColor[a], 0) 
            : (
                b = popupColor[a] >> 16 & 255,
                c = popupColor[a] >> 8 & 255, 
                d = popupColor[a] & 255, 
                f = floor(255 * min(popupLife[a], 20) / 20), 
                drawScaledTintedTextCentered(gameFontSmall, ~~popupPos[a].x, ~~popupPos[a].y, "" + popupValue[a], b, c, d, f, 0, 0, 0, f, 5, 7)
            )
}
let dropCount = 0, // ym
    dropPos = Array(100); // zm
for (let _i = 0; 100 > _i; _i++) dropPos[_i] = new Vec2;
let dropVel = Array(100); // Am
for (let _i = 0; 100 > _i; _i++) dropVel[_i] = new Vec2;
let dropType = new Int32Array(100), // Bm, in id
    dropValue = new Int32Array(100), // Cm, value/amount
    dropMeta = new Int32Array(100), // Dm, rarity/state
    dropState = new Int32Array(100), // Em, state/lifetime
    dropScore = 0; // Fm, aggregated score/weight for drops (sum of 7type + 3value + 11*meta)


function clearDrops() { // bj
    dropScore = dropCount = 0
}


function spawnDrop(_x, _y, _tidx, _val, _meta) { // Gh
    if (100 != dropCount) {
        _x = clamp(_x, 16, 623);
        _y = clamp(_y, 8, 351);
        Vec2Set(dropPos[dropCount], _x, _y);
        dropVel[dropCount].x = mouseXCurrent < _x ?
            randFloatRange(-.5, -1) :
            randFloatRange(.5, 1);
        dropVel[dropCount].y = randFloatRange(-1, -2);
        dropType[dropCount] = _tidx;
        dropValue[dropCount] = _val;
        dropMeta[dropCount] = _meta;
        dropState[dropCount] = 0;
        dropCount++;
        for (
            _tidx = dropScore = 0; // end initialization
            _tidx < dropCount; // condition
            _tidx++ // repeat
        ) dropScore += 7 * dropType[_tidx] + 3 * dropValue[_tidx] + 11 * dropMeta[_tidx];
    }
}


function removeDrop(a) { // Gm
    dropCount--;
    dropPos[a].set(dropPos[dropCount]);
    dropVel[a].set(dropVel[dropCount]);
    dropType[a] = dropType[dropCount];
    dropValue[a] = dropValue[dropCount];
    dropMeta[a] = dropMeta[dropCount];
    dropState[a] = dropState[dropCount];
    for (a = dropScore = 0; a < dropCount; a++) dropScore += 7 * dropType[a] + 3 * dropValue[a] + 11 * dropMeta[a]
}


function isDropTypeAbsent(typeIdx) { // dl
    if (2 == typeIdx) return true;
    let b;
    for (b = 0; b < dropCount; b++)
        if (dropType[b] == typeIdx) return false;
    return true
}


function updateDrops() { // zg
    let a, b, c;
    for (a = b = 0; a < dropCount; a++)
        b += 7 * dropType[a] + 3 * dropValue[a] + 11 * dropMeta[a];
    
    // if (dropScore != b) {
    //     frameBufferArray = null;
    // }
    for (a = 0; a < dropCount; a++) {
        dropVel[a].y += .04;
        Vec2Scale(dropVel[a], .98);
        c = clamp(dropPos[a].y + dropVel[a].y, 8, 8 * stageHeight + 16 - 1);
        b = getStageTileAt(dropPos[a].x, c);
        if (!(0 <= b && 23 >= b || 24 <= b && 26 >= b && 0 < dropVel[a].y)) {
            dropPos[a].y = c
        }
        if (c > 8 * stageHeight + 12) {
            if (isBadgeIncompleteForCurrentStage(29)) {
                if (2 == dropType[a]) {
                    IncrementBadgeCount(29);
                }
            }
            removeDrop(a--);
        } else {
            c = clamp(dropPos[a].x + dropVel[a].x, 16, 623);
            b = getStageTileAt(c, dropPos[a].y);
            0 <= b && 23 >= b || (dropPos[a].x = c);
            if (100 > dropState[a]) {
                dropState[a]++;
            } else if (-1 != findNearestPartyMemberInRect(dropPos[a].x, dropPos[a].y - 6, 12, 12, 1)) {
                if (2 == dropType[a]) {
                    partyGold = clamp(partyGold + dropValue[a], 0, 9999999);
                    spawnPopup(dropPos[a].x, dropPos[a].y, 0, dropValue[a], 60, 16776960);
                } else if (3 == dropType[a]) {
                    stageEventFlagArray[dropValue[a]] = 1;
                    collectedStageFlagsCount++;
                } else if (itemForgeLvls[dropType[a]] < dropValue[a]) {
                    itemForgeLvls[dropType[a]] = dropValue[a];
                    itemIsNew[dropType[a]] = 1;
                }
                if (isBadgeIncompleteForCurrentStage(24)) {
                    if (2 == dropType[a] && 225 <= dropValue[a]) {
                        IncrementBadgeCount(24);
                    }
                }
                removeDrop(a--);
            }
        }
    }
}



function drawDrops() { // Dg
    let a;
    spriteAltRenderFlag = 2;
    for (a = 0; a < dropCount; a++)
        (100 == dropState[a] || dropState[a] & 6) &&
            drawSpriteSheetPart(droppedItemSpriteSheet,
                dropPos[a].x - 6, dropPos[a].y - 12,
                12, 12,
                12 * itemList[dropType[a]][itemDropIconCol], 0,
                12, 12,
                itemList[dropType[a]][itemSpriteSourceXCol]
            );
    spriteAltRenderFlag = 0
}



function canvasDrawImage(_canvas, _dx, _dy) {
    try {
        canvasElement = domDocument.getElementById("cv"); 
        context2d = canvasElement.getContext("2d");
        context2d.putImageData(_canvas, _dx, _dy);
    } catch (d) { }
}



let copyrightText1 = "(C) 2018 ha55ii DAN-BALL.jp", //fromCharCode(40, 67, 41, 32, 50, 48, 49, 56, 32, 104, 97, 53, 53, 105, 105, 32, 68, 65, 78, 45, 66, 65, 76, 76, 46, 106, 112),
    copyrightText2 = "Copyright (C) 2018 ha55ii DAN-BALL.jp", //fromCharCode(67, 111, 112, 121, 114, 105, 103, 104, 116, 32, 40, 67, 41, 32, 50, 48, 49, 56, 32, 104, 97, 53, 53, 105, 105, 32, 68, 65, 78, 45, 66, 65, 76, 76, 46, 106, 112),
    dataPath = "./data/", //fromCharCode(46, 47, 100, 97, 116, 97, 47),
    fpsName = "fps", //fromCharCode(102, 112, 115),
    canvasTag = "canvas", //fromCharCode(99, 97, 110, 118, 97, 115),
    name2d = "2d", //fromCharCode(50, 100),
    encodingCharTable = "01WtCplxayfTvqchHmA9*JZOri6VN7L4w8dUGe.S3FIDzsnPbEkQXYMRgu25BjoK",
    //fromCharCode(48, 49, 87, 116, 67, 112, 108, 120, 97, 121, 102, 84, 118, 113, 99, 104, 72, 109, 65, 57, 42, 74, 90, 79, 114, 105, 54, 86, 78, 55, 76, 52, 119, 56, 100, 85, 71, 101, 46, 83, 51, 70, 73, 68, 122, 115, 110, 80, 98, 69, 107, 81, 88,
    //89, 77, 82, 103, 117, 50, 53, 66, 106, 111, 75),
    inverseCodingCharTable = [];

for (let _i = 0; 64 > _i; _i++) inverseCodingCharTable[encodingCharTable[_i]] = _i;
let hostnameCheckIdx = 0,
    targetHostname = "dan-ball.jp", //fromCharCode(100, 97, 110, 45, 98, 97, 108, 108, 46, 106, 112),
    frameBufferArray = new Int32Array(276480),

    // per-scanline X ranges (16.16 fixed-point) used for rasterization
    scanlineMinX = new Int32Array(432),         // Ji,
    scanlineMaxX = new Int32Array(432),         // Ki,

    // per-scanline start texture U ranges (16.16 fixed-point) for sampling during rasterization.
    scanlineTexUStart = new Float32Array(432),  // om, 
    scanlineTexUEnd = new Float32Array(432),    // nm, 

    // per-scanline end texture V ranges (16.16 fixed-point) for sampling during rasterization.    
    scanlineTexVStart = new Float32Array(432),  // qm, 
    scanlineTexVEnd = new Float32Array(432);    // pm, 

function setupAnimRequest() {
    if (requestAnim) {
        requestAnim(setupAnimRequest);
        requestAnimCallCount++;
        timestampAnim = Date.now();
        var a = floor(60 * (timestampAnim - lastTimestamp) / 1E3 + .5);
        if (0 > a || 60 <= a) {
            requestAnimCallCount = 0;
            currentFPS = frameCountThisSecond;
            frameCountThisSecond = 0;
            lastTimestamp = timestampAnim;
            a = 0;
        } else if (a == lastAnimFrameBucket) {
            return;
        }
        frameCountThisSecond++;
        lastAnimFrameBucket = a;
        totalFrames++;
    }
    isMouseClicked = 0 == wasMouseDown && 1 == isMouseDown;
    isMouseReleased = 1 == wasMouseDown && 0 == isMouseDown;
    if (wasMouseDown = isMouseDown) {
        mouseHoldFrames++;
    } else {
        mouseHoldFrames = 0;
    }
    mouseXCurrent = mouseXRel;
    mouseYCurrent = mouseYRel;
    for (a = 0; 256 > a; a++) {
        keyJustPressed[a] = keyPressPending[a];
        keyPressPending[a] = false;
    }
    
    randSeed = randSeed + floor(1024 * rand()) & 1023;
    randSeedStep = floor(512 * rand()) | 1;

    drawCanvas();

    var canvasBufferLength = CANVAS_WIDTH * CANVAS_HEIGHT;
    if (1 <= screenFadeFactor){
        for (a = 0; a < canvasBufferLength; a++) {
            canvasBuffer[a] = 4278190080 | 
            (frameBufferArray[a] & 255) << 16 | 
            frameBufferArray[a] & 65280 | 
            frameBufferArray[a] >> 16 & 255;
        }
    } else {
        for (a = 0; a < canvasBufferLength; a++) {
            canvasBuffer[a] = 4278190080 | 
            (frameBufferArray[a] & 255) * screenFadeFactor << 16 | 
            (frameBufferArray[a] >> 8 & 255) * screenFadeFactor << 8 | 
            (frameBufferArray[a] >> 16 & 255) * screenFadeFactor << 0;
        }
    }
    canvasDrawImage(canvasImage, 0, 0);
    requestAnim || _setTimeout(setupAnimRequest, computeFrameDelay());
}
let hostNameUnchecked = 1;

/** Checks hostname */
function hostnameCheck() {
    if (hostname.length != targetHostname.length) 
        return true;
    for (hostNameUnchecked = 0; hostnameCheckIdx < hostname.length; hostnameCheckIdx++)
        if (hostname[hostnameCheckIdx] != targetHostname[hostnameCheckIdx]) 
            return true;
    return false
}

let requestAnim = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame,
    requestAnimCallCount = 0, // Vm, counts active requestAnimationFrame callbacks (incremented each anim callback; reset on timing jumps).
    lastAnimFrameBucket = 0,  // Zm, last rounded animation-frame bucket (stores previous a to detect/skip duplicate callbacks).
    frameCountThisSecond = 0, // Ym
    currentFPS = 0,
    frameInteval = 20, // en, in milliseconds
    timestampAnim = Date.now(),
    lastTimestamp = timestampAnim, // Xm
    nextFrameTime = timestampAnim + frameInteval, // fn
    secondWindowDeadline = timestampAnim, // gn
    totalFrames = 0; // $m

function computeFrameDelay() { // ag
    timestampAnim = Date.now();
    let a = clamp(nextFrameTime - timestampAnim, 5, frameInteval);
    frameCountThisSecond++;
    totalFrames++;
    nextFrameTime += frameInteval;
    if (timestampAnim + a >= secondWindowDeadline || timestampAnim < lastTimestamp) currentFPS = frameCountThisSecond, frameCountThisSecond = 0, nextFrameTime = timestampAnim + frameInteval, secondWindowDeadline = timestampAnim + 1E3;
    lastTimestamp = timestampAnim;
    return a
}

let uncheckedSpriteCount = 0;

function Sprite() {
    /** Image object */
    this.a = 0; // image
    /** image path */
    this.b = "";
    /** is image ready */
    this.c = 0;
    /** image data */
    this.g = 0;
    /** width */
    this.i = 0;
    /** height */
    this.h = 0;
}

function spriteCreateBuffer(sprite, width, height) {
    sprite.h = width;
    sprite.i = height;
    for (width = 0; 16 > width; width++);
    sprite.g = new Int32Array(sprite.h * sprite.i)
}

/** load  */
Sprite.prototype.f = function (path) {
    if (this.b != path) {
        uncheckedSpriteCount++;
        this.b = path;
        this.a = new Image;
        this.a.src = dataPath + path;
        delete this.g;
        this.c = 0
        this.g = 0
    }
};

function loadSprite(sprite) {
    if (!sprite.c && sprite.a.complete) {
        uncheckedSpriteCount--;
        var imgWidth = sprite.a.width,
            imgHeight = sprite.a.height;
        if (!imgWidth || !imgHeight) throw delete sprite.a, sprite.b = "", "ERROR";
        var d = domDocument.createElement(canvasTag);
        d.width = imgWidth;
        d.height = imgHeight;
        d = d.getContext(name2d);
        d.drawImage(sprite.a, 0, 0);
        d = d.getImageData(0, 0, imgWidth, imgHeight).data;
        spriteCreateBuffer(sprite, imgWidth, imgHeight);
        imgWidth = 0;
        for (imgHeight = d.length; imgWidth < imgHeight; imgWidth += 4)
            sprite.g[imgWidth >> 2] = 0 == d[imgWidth + 3]
                ? -1
                : d[imgWidth + 0] << 16 | d[imgWidth + 1] << 8 | d[imgWidth + 2];
        delete sprite.a;
        sprite.c = 1
    }
}
let charKerningBefore = [
    [0, 2, 0, 0, 1, 0, 0, 2, 2, 1, 1, 1, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0],
    [2, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0]
]; // jn
let charKerningAfter = [
    [0, 1, 1, 0, 0, 0, 0, 2, 1, 2, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
    [2, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0]
]; // kn

let gameFont = new GameFont;
let gameFontSmall = new GameFont;
let gameFontMed = new GameFont;

function GameFont() {
    this.i = new Sprite;
    this.a = 0
    this.b = 0
    this.j = 0
    this.c = 0
}
GameFont.prototype.f = function (a, b, c) {
    this.i.f(a);
    this.c = b;
    this.j = c;
    this.a = this.b = 0
};

function drawText(_font, px, py, text, color, outlineColor) {
    let h, k, p, t, l, n, w, B = 640 - _font.c,
        M = _font.i.h - _font.c,
        J = _font.i.g,
        y = -1 < color ? 16777215 : 1,
        x = -1 < outlineColor ? 0 : 1,
        K = text.length;
    for (h = 0; h < K; h++, px += _font.c + _font.b) {
        k = text.charCodeAt(h) - 32;
        0 != _font.a && (px -= charKerningBefore[_font.a - 1][k]);
        l = 640 * py + px;
        n = k * _font.c;
        for (t = _font.j; 0 < t; t--, l += B, n += M)
            for (p = _font.c; 0 < p; p--, l++, n++) w = J[n], w == y ? frameBufferArray[l] = color : w == x && (frameBufferArray[l] = outlineColor);
        0 != _font.a && (px -= charKerningAfter[_font.a - 1][k])
    }
    _font.b = 0;
    _font.a = 0
}

function drawTextCentered(font, x, y, text, color, outlineColor) {
    x -= text.length * (font.c + font.b) >> 1;
    y -= font.j >> 1;
    drawText(font, x, y, text, color, outlineColor)
}

function drawMedTextNoOutline(x, y, text, color) {
    let f = gameFontMed;
    f.b = -1;
    f.a = 3;
    drawText(f, x, y, text, color, 0)
}

function drawSmallTextNoOutline(x, y, text, color) {
    let f = gameFontSmall;
    f.b = -1;
    f.a = 0;
    drawTextCentered(f, x, y, text, color, -1)
}

function drawScaledTintedText(font, x, y, text, fgR, fgG, fgB, fgAlpha, altR, altG, altB, altAlpha, glyphWidth, glyphHeight) { // Tg
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
        0 != font.a && (x -= ~~(charKerningBefore[font.a - 1][J] * glyphWidth / font.c));
        K = 640 * y + x;
        U = J * font.c;
        for (idx_1 = 0; idx_1 < glyphHeight; idx_1++, K += Fa)
            for (ba = ~~(idx_1 * font.j / glyphHeight) * font.i.h + U << 8, idx_2 = 0; idx_2 < glyphWidth; idx_2++, K++, ba += Ga) na = Ca[ba >> 8], na == ua ? frameBufferArray[K] = fgR + ((frameBufferArray[K] >> 16 & 255) * fgAlpha >> 8) << 16 | fgG + ((frameBufferArray[K] >> 8 & 255) * fgAlpha >> 8) << 8 | fgB + ((frameBufferArray[K] & 255) * fgAlpha >> 8) : na == fb && (frameBufferArray[K] =
                altR + ((frameBufferArray[K] >> 16 & 255) * altAlpha >> 8) << 16 | altG + ((frameBufferArray[K] >> 8 & 255) * altAlpha >> 8) << 8 | altB + ((frameBufferArray[K] & 255) * altAlpha >> 8));
        0 != font.a && (x -= ~~(charKerningAfter[font.a - 1][J] * glyphWidth / font.c))


    }
    font.b = 0;
    font.a = 0
}

function drawScaledTintedTextCentered(font, x, y, text, fgR, fgG, fgB, fgAlpha, altR, altG, altB, altAlpha, glyphWidth, glyphHeight) { // Jg
    x -= text.length * (glyphWidth + font.b) >> 1;
    drawScaledTintedText(font, x, y - (glyphHeight >> 1), text, fgR, fgG, fgB, fgAlpha, altR, altG, altB, altAlpha, glyphWidth, glyphHeight)
}
let screenFadeFactor = 1, // ug, screen fade multiplier used when composing final canvas (0..1).
    isSolidRender = 0,
    spriteAltRenderFlag = 0; // fh, auxiliary sprite render-mode flag used for temporary tint/alt-draw modes.

function drawLine(x1, y1, x2, y2, color) {
    x2 -= x1;
    y2 -= y1;
    var g, h;
    abs(x2) >= abs(y2)
        ? (
            h = floor(abs(x2)), 0 != h && (y2 = floor(65536 * y2 / h)),
            x2 = 0 <= x2 ? 65536 : -65536
        )
        : (
            h = floor(abs(y2)),
            0 != h && (x2 = floor(65536 * x2 / h)),
            y2 = 0 <= y2 ? 65536 : -65536
        );
    x1 = floor(65536 * x1) + 32768;
    y1 = floor(65536 * y1) + 32768;
    if (0 == isSolidRender)
        for (; 0 <= h; h--, x1 += x2, y1 += y2)
            0 > x1 || 640 <= x1 >> 16 || 0 > y1 || 432 <= y1 >> 16 ||
                (g = 640 * (y1 >> 16) + (x1 >> 16), frameBufferArray[g] = color);
    else {
        var k = color >> 24 & 255,
            p = (color >> 16 & 255) * k >> 8,
            t = (color >> 8 & 255) * k >> 8;
        color = (color & 255) * k >> 8;
        for (k = 255 - k; 0 <= h; h--, x1 += x2, y1 += y2)
            0 > x1 || 640 <= x1 >> 16 || 0 > y1 || 432 <= y1 >> 16 ||
                (
                    g = 640 * (y1 >> 16) + (x1 >> 16),
                    frameBufferArray[g] = p + ((frameBufferArray[g] >> 16 & 255) * k >> 8) << 16 |
                    t + ((frameBufferArray[g] >> 8 & 255) * k >> 8) << 8 |
                    color + ((frameBufferArray[g] & 255) * k >> 8)
                )
    }
}

function drawRectOutline(x1, y1, w, h, color) {
    w--;
    h--;
    drawLine(x1, y1, x1 + w, y1, color);
    drawLine(x1, y1 + h, x1 + w, y1 + h, color);
    drawLine(x1, y1, x1, y1 + h, color);
    drawLine(x1 + w, y1, x1 + w, y1 + h, color)
}

function drawRectOutlineCentered(a, b, c, d, f) {
    drawRectOutline(a - (c >> 1), b - (d >> 1), c, d, f)
}

function drawRect(_x, _y, _w, _h, _color) {
    var g, h, k;
    _w = 640 < _x + _w ? 640 : ~~(_x + _w);
    _h = 432 < _y + _h ? 432 : ~~(_y + _h);
    _x = 0 > _x ? 0 : ~~_x;
    _y = 0 > _y ? 0 : ~~_y;
    h = 640 * _y + _x;
    k = 640 - (_w - _x);

    if (0 == isSolidRender)
        for (; _y < _h; _y++, h += k)
            for (g = _x; g < _w; g++, h++) frameBufferArray[h] = _color;
    else {
        var p = _color >> 24 & 255,
            t = (_color >> 16 & 255) * p >> 8,
            l = (_color >> 8 & 255) * p >> 8;
        _color = (_color & 255) * p >> 8;
        for (p = 255 - p; _y < _h; _y++, h += k)
            for (g = _x; g < _w; g++, h++)
                frameBufferArray[h] = t + ((frameBufferArray[h] >> 16 & 255) * p >> 8) << 16 |
                    l + ((frameBufferArray[h] >> 8 & 255) * p >> 8) << 8 |
                    _color + ((frameBufferArray[h] & 255) * p >> 8)
    }
}

function drawRectCentered(x, y, w, h, color) {
    drawRect(x - (w >> 1), y - (h >> 1), w, h, color)
}

function drawSpriteSheetPart(spriteSheet, _x, _y, drawWidth, drawHeight, sourceX, sourceY, sourceWidth, sourceHeight, tintColor) {
    var l = spriteSheet.g,
        n, w, B, M;
    sourceWidth = ~~((sourceWidth << 8) / drawWidth);
    sourceHeight = ~~((sourceHeight << 8) / drawHeight);
    sourceX <<= 8;
    sourceY <<= 8;
    0 > _x && (sourceX += ~~(sourceWidth * -_x));
    0 > _y && (sourceY += ~~(sourceHeight * -_y));
    drawWidth = 640 < _x + drawWidth ? 640 : ~~(_x + drawWidth);
    drawHeight = 432 < _y + drawHeight ? 432 : ~~(_y + drawHeight);
    _x = 0 > _x ? 0 : ~~_x;
    _y = 0 > _y ? 0 : ~~_y;
    w = 640 * _y + _x;
    B = 640 - (drawWidth - _x);
    var J, y, x, K = tintColor >> 24 & 255,
        ba = tintColor >> 16 & 255,
        U = tintColor >> 8 & 255,
        na = tintColor & 255;
    if (!spriteAltRenderFlag)
        for (; _y < drawHeight; _y++, w += B, sourceY += sourceHeight)
            for (M = ((sourceY >> 8) * spriteSheet.h << 8) + sourceX, n = _x; n < drawWidth; n++, w++, M += sourceWidth) tintColor = l[M >> 8], -1 != tintColor && (J = ba * (tintColor >> 16 & 255) >> 8, y = U * (tintColor >> 8 & 255) >> 8, x = na * (tintColor & 255) >> 8, 0 == isSolidRender ? frameBufferArray[w] = J << 16 | y << 8 | x : 1 == isSolidRender ? (tintColor = frameBufferArray[w] >> 16 & 255, J = ((J - tintColor) * K >> 8) + tintColor, tintColor = frameBufferArray[w] >> 8 & 255, y =
                ((y - tintColor) * K >> 8) + tintColor, tintColor = frameBufferArray[w] & 255, x = ((x - tintColor) * K >> 8) + tintColor, frameBufferArray[w] = J << 16 | y << 8 | x) : 2 == isSolidRender && (J = (frameBufferArray[w] >> 16 & 255) + (J * K >> 8), 255 < J && (J = 255), y = (frameBufferArray[w] >> 8 & 255) + (y * K >> 8), 255 < y && (y = 255), x = (frameBufferArray[w] & 255) + (x * K >> 8), 255 < x && (x = 255), frameBufferArray[w] = J << 16 | y << 8 | x));
    else if (1 == spriteAltRenderFlag)
        for (; _y < drawHeight; _y++, w += B, sourceY += sourceHeight)
            for (M = ((sourceY >> 8) * spriteSheet.h << 8) + sourceX, n = _x; n < drawWidth; n++, w++, M += sourceWidth) tintColor = l[M >> 8], 0 != tintColor && (tintColor = (tintColor & 255) * K >> 8, 1 == isSolidRender ? (J = frameBufferArray[w] >> 16 & 255, J = ((ba - J) * tintColor >> 8) + J, y = frameBufferArray[w] >> 8 & 255, y = ((U - y) * tintColor >> 8) + y, x = frameBufferArray[w] & 255, x = ((na - x) * tintColor >> 8) + x, frameBufferArray[w] = J << 16 | y << 8 | x) : 2 == isSolidRender ? (J = (frameBufferArray[w] >> 16 & 255) + (ba * tintColor >> 8), 255 < J && (J = 255), y = (frameBufferArray[w] >> 8 &
                255) + (U * tintColor >> 8), 255 < y && (y = 255), x = (frameBufferArray[w] & 255) + (na * tintColor >> 8), 255 < x && (x = 255), frameBufferArray[w] = J << 16 | y << 8 | x) : 3 == isSolidRender && (J = (frameBufferArray[w] >> 16 & 255) - (ba * tintColor >> 8), 0 > J && (J = 0), y = (frameBufferArray[w] >> 8 & 255) - (U * tintColor >> 8), 0 > y && (y = 0), x = (frameBufferArray[w] & 255) - (na * tintColor >> 8), 0 > x && (x = 0), frameBufferArray[w] = J << 16 | y << 8 | x));
    else if (2 == spriteAltRenderFlag)
        for (; _y < drawHeight; _y++, w += B, sourceY += sourceHeight)
            for (M = ((sourceY >> 8) * spriteSheet.h << 8) + sourceX, n = _x; n < drawWidth; n++, w++, M += sourceWidth) tintColor = l[M >> 8], 0 >= tintColor || (J = tintColor >> 16 & 255, y = tintColor >> 8 & 255, x = tintColor & 255, frameBufferArray[w] = J == y && y == x ? ba * J >> 8 << 16 | U * y >> 8 << 8 | na * x >> 8 : tintColor)
}

function drawSpriteSheetPartCentered(spriteSheet, x, y, drawWidth, drawHeight, sourceX, sourceY, sourceWidth, sourceHeight, tintColor) {
    drawSpriteSheetPart(spriteSheet, x - (drawWidth >> 1), y - (drawHeight >> 1), drawWidth, drawHeight, sourceX, sourceY, sourceWidth, sourceHeight, tintColor)
}

// whiteRCol: replacement color (integer) written when the source pixel equals white (0xFFFFFF / 16777215)
// grayRCol: replacement color (integer) written when the source pixel equals gray marker (0x666666 / 6710886).
function drawSpriteSheetPartTintedScaled(spriteSheet, _px, _py, drawWidth, drawHeight, sourceX, sourceY, sourceWidth, sourceHeight, whiteRCol, grayRCol, copySource) { // Qg
    let w = spriteSheet.g,
        B, M, J, y, x;
    sourceWidth = ~~((sourceWidth << 8) / drawWidth);
    sourceHeight = ~~((sourceHeight << 8) / drawHeight);
    sourceX <<= 8;
    sourceY <<= 8;
    0 > _px && (sourceX += ~~(sourceWidth * -_px));
    0 > _py && (sourceY += ~~(sourceHeight * -_py));
    drawWidth = 640 < _px + drawWidth ? 640 : ~~(_px + drawWidth);
    drawHeight = 432 < _py + drawHeight ? 432 : ~~(_py + drawHeight);
    _px = 0 > _px ? 0 : ~~_px;
    _py = 0 > _py ? 0 : ~~_py;
    M = 640 * _py + _px;
    for (J = 640 - (drawWidth - _px); _py < drawHeight; _py++, M += J, sourceY += sourceHeight)
        for (y = ((sourceY >> 8) * spriteSheet.h << 8) + sourceX, B = _px; B < drawWidth; B++, M++, y += sourceWidth)
            x = w[y >> 8],
                -1 != x && (
                    16777215 == x
                        ? frameBufferArray[M] = whiteRCol
                        : 6710886 == x
                            ? frameBufferArray[M] = grayRCol
                            : copySource && (frameBufferArray[M] = x)
                )
}

function drawEnemyScaledSprite(centerX, centerY, dstWidth, dstHeight, srcX, srcY, srcHeight, replaceColW, replaceColAlt, blendAmount) { // fl
    centerX -= dstWidth >> 1;
    centerY -= dstHeight >> 1;
    let l, n = enemySpriteSheet.g,
        w, B, M, J, y, x, K;
    l = ~~(4096 / dstWidth);
    srcHeight = ~~((srcHeight << 8) / dstHeight);
    srcX <<= 8;
    srcY <<= 8;
    0 > centerX && (srcX += ~~(l * -centerX));
    0 > centerY && (srcY += ~~(srcHeight * -centerY));
    dstWidth = 640 < centerX + dstWidth ? 640 : ~~(centerX + dstWidth);
    dstHeight = 432 < centerY + dstHeight ? 432 : ~~(centerY + dstHeight);
    centerX = 0 > centerX ? 0 : ~~centerX;
    centerY = 0 > centerY ? 0 : ~~centerY;
    B = 640 * centerY + centerX;
    for (M = 640 - (dstWidth - centerX); centerY < dstHeight; centerY++, B += M, srcY += srcHeight)
        for (J = ((srcY >> 8) * enemySpriteSheet.h << 8) + srcX, w = centerX; w < dstWidth; w++, B++, J += l) y = n[J >> 8], -1 != y && (255 == blendAmount ? frameBufferArray[B] = 16777215 == y ? replaceColW : replaceColAlt : (16777215 == y ? (y = frameBufferArray[B] >> 16 & 255, x = (((replaceColW >> 16 & 255) - y) * blendAmount >> 8) + y, y = frameBufferArray[B] >> 8 & 255, K = (((replaceColW >> 8 & 255) - y) * blendAmount >> 8) + y, y = frameBufferArray[B] & 255, y = (((replaceColW & 255) - y) * blendAmount >> 8) + y) : (y = frameBufferArray[B] >> 16 &
            255, x = (((replaceColAlt >> 16 & 255) - y) * blendAmount >> 8) + y, y = frameBufferArray[B] >> 8 & 255, K = (((replaceColAlt >> 8 & 255) - y) * blendAmount >> 8) + y, y = frameBufferArray[B] & 255, y = (((replaceColAlt & 255) - y) * blendAmount >> 8) + y), frameBufferArray[B] = x << 16 | K << 8 | y))
}

function drawItemSpriteTinted(_px, _py, _sourceX, _sourceY, _defaultColor, _tintColor) { // gh
    var h = 16,
        k = 16,
        p, t, l = itemsSpriteSheet.g,
        n, w, B, M;
    p = ~~(4096 / h);
    t = ~~(4096 / k);
    _sourceX <<= 8;
    _sourceY <<= 8;
    0 > _px && (_sourceX += ~~(p * -_px));
    0 > _py && (_sourceY += ~~(t * -_py));
    h = 640 < _px + h ? 640 : ~~(_px + h);
    k = 432 < _py + k ? 432 : ~~(_py + k);
    _px = 0 > _px ? 0 : ~~_px;
    _py = 0 > _py ? 0 : ~~_py;
    n = 640 * _py + _px;
    w = 640 - (h - _px);
    for (var J, y, x = _tintColor >> 16 & 255, K = _tintColor >> 8 & 255, ba = _tintColor & 255; _py < k; _py++, n += w, _sourceY += t)
        for (B = ((_sourceY >> 8) * itemsSpriteSheet.h << 8) + _sourceX, _tintColor = _px; _tintColor < h; _tintColor++, n++, B += p) M = l[B >> 8], 0 >= M || (J = M >> 16 & 255, y = M >> 8 & 255, M &= 255, frameBufferArray[n] = J == y && y == M ? x * J >> 8 << 16 | K * y >> 8 << 8 | ba * M >> 8 : _defaultColor)
}

function fillEmptyPixelsRect(_left, _top, _width, _height, _color) { // Xg
    var g, h;
    g = 640 * _top + _left;
    h = 640 - _width;
    for (_top = 0; _top < _height; _top++, g += h)
        for (_left = 0; _left < _width; _left++, g++) 0 == frameBufferArray[g] && (frameBufferArray[g] = _color)
}

function updateScanlineBoundsFromLine(_x0, _y0, _x1, _y1) { // Li
    var f, g, h;
    if (abs(_x1 - _x0) >= abs(_y1 - _y0))
        for (_x0 >>= 16, _x1 >>= 16, f = abs(_x1 - _x0), _x1 = _x0 <= _x1 ? 1 : -1, h = floor((_y1 - _y0) / max(f, 1)); 0 <= f; f--, _x0 += _x1, _y0 += h) 0 == f && (_y0 = _y1), g = _y0 >> 16, 0 > g || 432 <= g || (scanlineMinX[g] > _x0 && (scanlineMinX[g] = _x0), scanlineMaxX[g] < _x0 && (scanlineMaxX[g] = _x0));
    else
        for (_y0 >>= 16, _y1 >>= 16, f = abs(_y1 - _y0), h = floor((_x1 - _x0) / max(f, 1)), _y1 = _y0 <= _y1 ? 1 : -1; 0 <= f; f--, _x0 += h, _y0 += _y1) 0 == f && (_x0 = _x1), g = _x0 >> 16, 0 > _y0 || 432 <= _y0 || (scanlineMinX[_y0] > g && (scanlineMinX[_y0] = g), scanlineMaxX[_y0] < g && (scanlineMaxX[_y0] = g))
}

function rasterizeLineToScanlineBounds(_x0, _y0, _ax0, _ay0, _x1, _y1, _ax1, _ay1) { // mm
    var p = (max(abs(_x1 - _x0), abs(_y1 - _y0)) >> 16) + 1;
    _x1 = floor((_x1 - _x0) / p);
    _y1 = floor((_y1 - _y0) / p);
    _ax1 = floor((_ax1 - _ax0) / p);
    _ay1 = floor((_ay1 - _ay0) / p);
    for (var t, l, n = 0; n < p; n++, _x0 += _x1, _y0 += _y1, _ax0 += _ax1, _ay0 += _ay1) t = _x0 >> 16, l = _y0 >> 16, 0 > l || 432 <= l || (scanlineMinX[l] > t && (scanlineMinX[l] = t, scanlineTexUStart[l] = _ax0, scanlineTexVStart[l] = _ay0), scanlineMaxX[l] < t && (scanlineMaxX[l] = t, scanlineTexUEnd[l] = _ax0, scanlineTexVEnd[l] = _ay0))
}
var scratchVec2 = new Vec2; // nn, temporary Vec2 scratch used by separation/step helpers.

function applySeparationCorrection(_a, _b, _targetDist, _weightA, _weightB) { // T
    Vec2Sub(scratchVec2, _a, _b);
    _targetDist -= Vec2Norm(scratchVec2);
    _weightA *= _targetDist;
    _weightB *= _targetDist;
    _a.x += scratchVec2.x * _weightA;
    _a.y += scratchVec2.y * _weightA;
    _b.x -= scratchVec2.x * _weightB;
    _b.y -= scratchVec2.y * _weightB
}

function stepWithVerticalBias(_a, _b, _yBias, _scale) { // S
    Vec2Sub(scratchVec2, _a, _b);
    _b.set(_a);
    scratchVec2.y += _yBias;
    Vec2Scale(scratchVec2, _scale);
    _a.add(scratchVec2)
}

function toggleFullscreen() {
    domDocument.fullscreenEnabled && (domDocument.fullscreenElement ? domDocument.exitFullscreen() : canvasElement.requestFullscreen())
}

let isMouseClicked = false,
    isMouseReleased = false,
    wasMouseDown = false,
    isMouseDown = false,
    mouseHoldFrames = 0, // bn, frames mouse has been continuously held down (hold-duration counter).
    mouseXCurrent = 0,
    mouseYCurrent = 0,
    mouseXRel = 0,
    mouseYRel = 0,
    activeTouchCount = 0;

function buttonCheck(x, y, w, h) {
    return mouseXCurrent < x || x + w <= mouseXCurrent || mouseYCurrent < y || y + h <= mouseYCurrent ? false : true
}

function buttonCheckCentered(x, y, w, h) {
    return buttonCheck(x - w / 2, y - h / 2, w, h)
}

function onMouseMove(mouseState) {
    var clientRect = canvasElement.getBoundingClientRect(),
        rectWidth = clientRect.right - clientRect.left,
        rectHeight = clientRect.bottom - clientRect.top,
        f = min(rectWidth / CANVAS_WIDTH, rectHeight / CANVAS_HEIGHT),
        rectHeight = floor(rectHeight / 2 - CANVAS_HEIGHT * f / 2);
    mouseXRel = floor((mouseState.clientX - clientRect.left - floor(rectWidth / 2 - CANVAS_WIDTH * f / 2)) / f);
    mouseYRel = floor((mouseState.clientY - clientRect.top - rectHeight) / f)
    // LogMsg(`(${mouseXRel}, ${mouseYRel}), ${isCanvasFocused}`);
}


domDocument.onmousemove = onMouseMove;
domDocument.onmousedown = function (mouseState) {
    onMouseMove(mouseState);
    isCanvasFocused = false;

    const insideCanvas =
        mouseXRel >= 0 && mouseXRel < CANVAS_WIDTH &&
        mouseYRel >= 0 && mouseYRel < CANVAS_HEIGHT;

    if (insideCanvas) {
        isCanvasFocused = true;
        if (mouseState.button === 0) {
            isMouseDown = true;
        }
        return false;
    }
    // if (
    //     !(0 > mouseXRel || CANVAS_WIDTH <= mouseXRel || 0 > mouseYRel || CANVAS_HEIGHT <= mouseYRel) && 
    //     (isCanvasFocused = true, 0 == a.button && (isMouseDown = true), isCanvasFocused)
    // ) return false
};
domDocument.onmouseup = function (mouseState) {
    onMouseMove(mouseState);
    if (mouseState.button === 0) {
        isMouseDown = false;
    }
    //0 == mouseState.button && (isMouseDown = false)
};
domDocument.oncontextmenu = function () {
    if (isCanvasFocused) return false
};

function handleTouch(a) {
    var clientRect = canvasElement.getBoundingClientRect(),
        rectWidth = clientRect.right - clientRect.left,
        rectHeight = clientRect.bottom - clientRect.top,
        f = min(rectWidth / 640, rectHeight / 432),
        rectWidth = floor(rectWidth / 2 - 640 * f / 2),
        rectHeight = floor(rectHeight / 2 - 432 * f / 2);
    a = a.touches;
    console.log(a);
    activeTouchCount = a.length;
    1 == activeTouchCount
        ? (mouseXRel = floor((a[0].clientX - clientRect.left - rectWidth) / f),
            mouseYRel = floor((a[0].clientY - clientRect.top - rectHeight) / f))
        : 2 == activeTouchCount && (mouseXRel = floor((a[0].clientX - clientRect.left - rectWidth) / f),
            mouseYRel = floor((a[0].clientY - clientRect.top - rectHeight) / f),
            rectHeight = floor((a[1].clientY - clientRect.top - rectHeight) / f),
            mouseXRel = floor((mouseXRel + floor((a[1].clientX - clientRect.left - rectWidth) / f)) / 2),
            mouseYRel = floor((mouseYRel + rectHeight) / 2))
}
canvasElement.ontouchstart = function (a) {
    handleTouch(a);
    1 == activeTouchCount ? (isMouseDown = true, mouseXCurrent = mouseXRel, mouseYCurrent = mouseYRel) : 2 == activeTouchCount && (isMouseDown = false, mouseXCurrent = mouseXRel, mouseYCurrent = mouseYRel);
    return false
};
canvasElement.ontouchmove = function (a) {
    handleTouch(a);
    return false
};
canvasElement.ontouchend = function (a) {
    handleTouch(a);
    0 == activeTouchCount ? isMouseDown = false : 1 == activeTouchCount ? (mouseXCurrent = mouseXRel, mouseYCurrent = mouseYRel) : 2 == activeTouchCount && (mouseXCurrent = mouseXRel, mouseYCurrent = mouseYRel);
    return false
};
canvasElement.ontouchcancel = function () {
    activeTouchCount = 0;
    isMouseDown = false
};
let keyJustPressed = Array(256), // Jf
    keyPressPending = Array(256), // Kf
    keyHeld = Array(256), // Lf
    keyMapNoShift = Array(256), // Mf
    keyMapShift = Array(256); // Nf

domDocument.onkeydown = function (a) {
    var b = a.keyCode;
    65 <= b & 90 >= b
        ? a.shiftKey || (b += 32)
        : b = a.shiftKey ? keyMapShift[b] : keyMapNoShift[b];

    0 <= b && 256 > b && (keyHeld[b] = true, keyPressPending[b] = true);
    if (0 != b && isCanvasFocused) return false
};


domDocument.onkeyup = function (a) {
    var b = a.keyCode;
    65 <= b & 90 >= b ? a.shiftKey || (b += 32) : b = a.shiftKey ? keyMapShift[b] : keyMapNoShift[b];
    0 <= b && 256 > b && (keyHeld[b] = false);
    if (0 != b && isCanvasFocused) return false
};

let isCanvasFocused = false;

function promptInput(message, _default) {
    var c = null;
    try {
        c = prompt(message, _default)
    } catch (d) { }
    return c
}

function Vec2() {
    this.y = this.x = 0
}
Vec2.prototype.set = function (a) {
    this.x = a.x;
    this.y = a.y;
    return this
};

function Vec2Set(v, x, y) {
    v.x = x;
    v.y = y
}
Vec2.prototype.add = function (a) {
    this.x += a.x;
    this.y += a.y;
    return this
};

function Vec2Add(a, b, c) {
    a.x = b.x + c.x;
    a.y = b.y + c.y
}
Vec2.prototype.sub = function (a) {
    this.x -= a.x;
    this.y -= a.y;
    return this
};

function Vec2Sub(a, b, c) {
    a.x = b.x - c.x;
    a.y = b.y - c.y
}

function Vec2Scale(a, b) {
    a.x *= b;
    a.y *= b
}

function Vec2Rotate(a) {
    var b = a.x;
    a.x = a.y;
    a.y = -b
}

function Vec2Mag(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y)
}

function Vec2Norm(a) {
    var b = Vec2Mag(a);
    if (0 == b) return 0;
    a.x /= b;
    a.y /= b;
    return b
}

function Vec2Angle(a) {
    var b = Math.acos(a.x / Math.sqrt(a.x * a.x + a.y * a.y));
    0 < a.y && (b = TAU - b);
    return b
}
var randLUT = new Float32Array(1024),
    randSeed = 0,
    randSeedStep = 0;


/** Returns a random number between [0, a) */
function randFloat(a) {
    randSeed += randSeedStep;
    randSeed &= 1023;
    return randLUT[randSeed] * a
}

/** Returns a random number between [a, b] */
function randFloatRange(a, b) {
    randSeed += randSeedStep;
    randSeed &= 1023;
    return randLUT[randSeed] * (b - a) + a
}

/** Randomly selects a or b */
function randSelect(a, b) {
    randSeed += randSeedStep;
    randSeed &= 1023;
    return .5 > randLUT[randSeed] ? a : b
}

function randInt(maxInt) {
    randSeed += randSeedStep;
    randSeed &= 1023;
    return ~~(randLUT[randSeed] * maxInt)
}

function randIntRange(a, b) {
    randSeed += randSeedStep;
    randSeed &= 1023;
    return ~~(randLUT[randSeed] * (b - a) + a)
}

let rotationLUT = Array(513),
    PI = 3.1415927,
    TAU = 6.2831855;

function rand() {
    return Math.random()
}

function abs(a) {
    return 0 > a ? -a : a
}

function max(a, b) {
    return a > b ? a : b
}

function min(a, b) {
    return a < b ? a : b
}

function clamp(a, b, c) {
    return a < b ? b : a > c ? c : a
}

function wrapStageIndex(a) {
    var b = stageIndexOrder.length - 1;
    return 0 > a ? b : a > b ? 0 : a
}

function floor(a) {
    return Math.floor(a)
}

function drawIconButton(x, y, iconIndex, label, color) {
    isSolidRender = 1;
    drawRectCentered(x, y, 32, 32, 2147483648);
    isSolidRender = 0;
    drawSpriteSheetPartCentered(iconSpriteSheet, x, y - 3, 24, 24, 24 * iconIndex, 0, 24, 24, color);
    6 <= label.length ? drawSmallTextNoOutline(x, y + 10, label, color) : drawTextCentered(gameFontSmall, x, y + 10, label, color, -1);
    return buttonCheckCentered(x, y, 32, 32) ? (drawSpriteSheetPartCentered(iconSpriteSheet, x, y - 3, 24, 24, 24 * iconIndex, 0, 24, 24, 16750950), 6 <= label.length ? drawSmallTextNoOutline(x, y + 10, label, 16750950) : drawTextCentered(gameFontSmall, x, y + 10, label, 16750950, -1), true) : false
}

function drawMenuButton(x, y, iconIndex, text, color) {
    isSolidRender = 1;
    drawRectCentered(x, y, 24, 24, 2147483648);
    isSolidRender = 0;
    drawSpriteSheetPartCentered(iconSpriteSheet, x, y - 3, 16, 16, 16 * iconIndex, 24, 16, 16, color);
    6 <= text.length ? drawSmallTextNoOutline(x, y + 8, text, color) : drawTextCentered(gameFontSmall, x, y + 8, text, color, -1);
    return buttonCheckCentered(x, y, 24, 24)
        ? (
            drawSpriteSheetPartCentered(iconSpriteSheet, x, y - 3, 16, 16, 16 * iconIndex, 24, 16, 16, 16737894),
            6 <= text.length
                ? drawSmallTextNoOutline(x, y + 8, text, 16737894)
                : drawTextCentered(gameFontSmall, x, y + 8, text, 16737894, -1),
            true
        )
        : false
}

function drawCancelButton(x, y) {
    isSolidRender = 1;
    drawRectCentered(x, y, 20, 20, 2147483648);
    isSolidRender = 0;
    drawSpriteSheetPartCentered(iconSpriteSheet, x, y, 16, 16, 96, 24, 16, 16, 16777215);
    return buttonCheckCentered(x, y, 20, 20) ? (drawSpriteSheetPartCentered(iconSpriteSheet, x, y, 16, 16, 96, 24, 16, 16, 16737894), true) : false
}

function drawButtonBoldedText(x, y, w, h, text) {
    drawRectCentered(x, y, w, h, 0);
    drawTextCentered(gameFont, x, y, text, 16777215, 8409120);
    return buttonCheckCentered(x, y, w, h) ? (fillEmptyPixelsRect(x - (w >> 1), y - (h >> 1), w, h, 6684672), true) : false
};
