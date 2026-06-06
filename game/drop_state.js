import * as RMath from "./math.js";

// dropped items
export let DropState = {
    dropCount : 0, // ym
    dropPos : Array(100), // zm
    dropVel : Array(100), // Am
    dropType : new Int32Array(100), // Bm, in id
    dropValue : new Int32Array(100), // Cm, value/amount
    dropMeta : new Int32Array(100), // Dm, rarity/state
    dropState : new Int32Array(100), // Em, state/lifetime
    dropScore : 0, // Fm, aggregated score/weight for drops (sum of 7type + 3value + 11*meta)
};

for (let _i = 0; 100 > _i; _i++) DropState.dropVel[_i] = new RMath.Vec2;
for (let _i = 0; 100 > _i; _i++) DropState.dropPos[_i] = new RMath.Vec2;