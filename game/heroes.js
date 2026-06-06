import * as RMath from "./math.js"

// heros
export let HeroesState = {
    areUpperJointsDisabled : 1, // rig mode flag
    heroJointPositionsByHero : Array(4), // O, current joint positions for each hero.
    heroJointPrevPositionsByHero : Array(4), // Mh, previous joint positions used for collision resolution and drag selection.
    heroJoint5HistoryByHero : Array(4), // Nh, 16-frame history for joint 5 positions.
    heroJoint3HistoryByHero : Array(4), // Oh, 16-frame history for joint 3 positions.
    heroJoint6HistoryByHero : Array(4), // Ph, 16-frame history for joint 6 positions.
    heroJoint4HistoryByHero : Array(4), // Qh, 16-frame history for joint 4 positions.
    heroPoseTrailWriteIdxByHero : Array(4), // Rh, hero pose trail write index per hero.
    heroAttackTrailTimerByHero : Array(4), // Sh, hero attack trail timer per hero.
    heroAttackTrailHistorySets : undefined, // Th, grouped joint-history buffers used for attack-trail drawing.
    heroAimPosByHero : Array(4), // Uh, stored hero aim position per hero.

    heroAttackLineTimer : Array(4),
    heroUpperJointMode : new Int32Array(4), // Wh, per-hero rig mode flag that switches between normal and upper-joint-disabled updates.
    heroPoseAgeFrames : new Int32Array(4), // Xh, per-hero pose age counter used while the rig settles after movement or impact.
    heroTileContactFlags : new Int32Array(4), // Yh, per-hero tile-contact flags set while joint movement hits stage geometry.
    heroAttackCooldownFrames : new Int32Array(4), // Zh, per-hero attack cooldown timer that gates target tracking and attack cadence.
    heroHitFlashTimer : new Int32Array(4), // $h, per-hero hit flash timer used to tint the hero when damage lands.
    heroEnemySeekTimer : new Int32Array(4), // ai, per-hero AI move timer that spaces out enemy-approach adjustments.
    attackTrailSideIdx : new Int32Array(4), // ei, per-hero active attack-side index used for trail and weapon selection.
    attackWeaponSlotIdx : new Int32Array(4), // fi, per-hero active weapon slot index used by the current attack sequence.
    heroBodyDrawStateByHero : [ // partyBodyDrawOptions, per-hero body draw state: two attack-side slots plus facing.
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
    ],
    heroSkipTimer : new Int32Array(4), // ch, per-hero skip timer that can block updates entirely.
    heroSkipChancePercent : new Int32Array(4), // hi, per-hero skip chance used with ch during attackType 2 effects.
    heroTimedDamageTimer : new Int32Array(4), // dh, per-hero damage-over-time timer.
    heroTimedDamageAmount : new Int32Array(4), // ii, per-hero damage-over-time amount used to drain LP each tick.
    heroStatusTintTimer : new Int32Array(4), // bh, per-hero status tint timer used for the buff-colored hero draw.
    heroTileEffectLatch : new Int32Array(4), // ji, per-hero tile-effect latch used to fire one-off stage tile projectiles.
};

HeroesState.heroAttackTrailHistorySets = [
    HeroesState.heroJoint5HistoryByHero, 
    HeroesState.heroJoint6HistoryByHero, 
    HeroesState.heroJoint3HistoryByHero, 
    HeroesState.heroJoint4HistoryByHero
];

export let GameplayState = {
    draggedHeroIndex : -1, // bi, dragged hero index for mouse joint selection.
    draggedJointIndex : 0, // ci, dragged joint index for mouse joint selection.
    levelUpPopupTimer : 0, // Hh, level-up popup timer.
    stageClearPopupTimer : 0, // di, stage-clear popup timer.
    comboPopupTimer : 0, // Zg, combo popup timer.
    comboWindowTimer : 0, // Ic, combo window timer that counts down after each hit.
    comboWindowMaxFrames : 0, // Vg, maximum combo window length in frames.
    comboCount : 0, // Hc, combo count shown in the UI and used for payout checks.
    comboGoldPayoutPerHero : 0, // $g, per-hero combo gold payout after a combo ends.
    comboMultBonus : 0, // comboMultBonus, extra percent added to combo payout.
}


for (let _i = 0; 4 > _i; _i++) HeroesState.heroJointPositionsByHero[_i] = Array(21);
for (let _i = 0; 4 > _i; _i++) HeroesState.heroJointPrevPositionsByHero[_i] = Array(21);

for (let _i = 0; 4 > _i; _i++)
    for (let _j = 0; 21 > _j; _j++) HeroesState.heroJointPositionsByHero[_i][_j] = new RMath.Vec2();
for (let _i = 0; 4 > _i; _i++)
    for (let _j = 0; 21 > _j; _j++) HeroesState.heroJointPrevPositionsByHero[_i][_j] = new RMath.Vec2();

for (let _i = 0; 4 > _i; _i++) HeroesState.heroJoint5HistoryByHero[_i] = Array(16);
for (let _i = 0; 4 > _i; _i++)
    for (let _j = 0; 16 > _j; _j++) HeroesState.heroJoint5HistoryByHero[_i][_j] = new RMath.Vec2();

for (let _i = 0; 4 > _i; _i++) HeroesState.heroJoint3HistoryByHero[_i] = Array(16);
for (let _i = 0; 4 > _i; _i++)
    for (let _j = 0; 16 > _j; _j++) HeroesState.heroJoint3HistoryByHero[_i][_j] = new RMath.Vec2();

for (let _i = 0; 4 > _i; _i++) HeroesState.heroJoint6HistoryByHero[_i] = Array(16);
for (let _i = 0; 4 > _i; _i++)
    for (let _j = 0; 16 > _j; _j++) HeroesState.heroJoint6HistoryByHero[_i][_j] = new RMath.Vec2();

for (let _i = 0; 4 > _i; _i++) HeroesState.heroJoint4HistoryByHero[_i] = Array(16);
for (let _i = 0; 4 > _i; _i++)
    for (let _j = 0; 16 > _j; _j++) HeroesState.heroJoint4HistoryByHero[_i][_j] = new RMath.Vec2();

for (let _i = 0; 4 > _i; _i++) HeroesState.heroAimPosByHero[_i] = new RMath.Vec2();