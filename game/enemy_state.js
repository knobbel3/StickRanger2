import * as RMath from "./math.js";

export let EnemyState = {
    stageMaxEnemyLevel : 0,  // $i, maximum enemy level among spawned enemies (used for reward/EXP scaling)
    enemyTargetJointIdx : 20, // yi, default enemy joint index used as the target/aim/spawn point for projectiles and AI

    enemyCount : 0,
    enemyJointPosArray : Array(999), // Q, 
    enemyPrevJointPosArray : Array(999), // Z, 
    enemyTypeArray : new Int32Array(999), // 
    enemyUpdateFuncIdxArray : new Int32Array(999),
    enemyPoseTrailWriteIdxArray  : new Int32Array(999), // Y , 
    enemyDeathTimerArray : new Int32Array(999), // Ck, 
    enemyTileContactFlagsArray : new Int32Array(999), // Dk, 
    enemySpawnGroupIdxArray : new Int32Array(999), // fj, 
    enemyHealthArray : new Int32Array(999),
    enemyAuxStateArray : new Int32Array(999), // Ek
    enemyActionCooldownTimerArray : new Int32Array(999), // Fk
    enemySkipDurationLeftArray : new Int32Array(999),
    enemyUpdateSkipProbArray : new Int32Array(999),
    enemyDmgDurationLeftArray : new Int32Array(999),
    enemyDmgPerFrameArray : new Int32Array(999),
    enemyFreezeTimerArray : new Int32Array(999),
};


for (let i = 0; 999 > i; i++) EnemyState.enemyPrevJointPosArray[i] = Array(21);
for (let i = 0; 999 > i; i++) EnemyState.enemyJointPosArray[i] = Array(21);

for (let i = 0; 999 > i; i++)
    for (let j = 0; 21 > j; j++)
        EnemyState.enemyJointPosArray[i][j] = new RMath.Vec2();

for (let i = 0; 999 > i; i++)
    for (let j = 0; 21 > j; j++)
        EnemyState.enemyPrevJointPosArray[i][j] = new RMath.Vec2();