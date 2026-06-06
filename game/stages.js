import { stageCount } from "./stage_data.js";


// stage state
export let StageState = {
    isStageReachedArray : Array(stageCount),
    stageWidth : 80, // Gi
    stageHeight : 60, // si
    stageTileData : null, // P
    loadedLevelIndex : -1,
    lastStageIdx : 0, // Mg
    lastClearedStageIdx : 0, // Ng, last cleared stage index (stage just completed before returning)
    partySpawnXByHero : [0, 0, 0, 0], // per-hero spawn Y (tile/row) positions used when placing party members on stage
    partySpawnYByHero : [0, 0, 0, 0], // per-hero spawn X (tile/column) positions used when placing party members on stage
    activeSpawnCountByGroup : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // V[group], active spawn counts per spawn-group (number of currently active enemies)
    totalSpawnedCountByGroup : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Xi[group], cumulative spawned count per spawn-group (used to cap spawns and compute stage-clear payouts)
    stageClearBaseGoldPerHero : 0, // Mi, per-hero stage-clear gold payout (base amount computed from spawned enemies)

    stage_partyDamageTaken : 0, // Og, accumulated party LP lost this stage (used for badges and payouts).
    stage_totalDamageDealt : 0, // total damage dealt this stage (used for badges/conditions).
    gameFrameCounter : 0, // gj, global frame tick counter (drives time-based events and UI timers).
    consecutiveConditionFrameCount : 0, // hj, consecutive-frame counter for stage condition (used for timed badges/popups).
    stageEncounterCounter : 0, // ij, counter for specific enemy presences/encounters this stage (used for badge triggers).
    stageConditionMask : 0, // Hi, bitmask of stage tile/contact conditions set by heroes (per-stage).
    stageFlagUseCount : 0, // jh, count of stage-flag uses (increments when stage flags are triggered).
    stageEventFlagArray : [0, 0, 0, 0], // of, array of per-stage event flags (saved/loaded and used for one-off stage events).
};

StageState.stageTileData = Array(StageState.stageHeight);

for (let _i = 0; _i < stageCount; _i++) StageState.isStageReachedArray[_i] = 0;
for (let i = 0; i < StageState.stageHeight; i++) StageState.stageTileData[i] = Array(StageState.stageWidth);
