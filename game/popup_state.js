import * as RMath from "./math.js";

export let PopupState = {
    popupCount : 0, // aj
    popupPos : Array(1E3), // rm
    popupVel : Array(1E3), // sm
    popupValue : Array(1E3), // tm
    popupLife : new Int32Array(1E3), // um
    popupColor : new Int32Array(1E3), // vm
};
for (let _i = 0; 1E3 > _i; _i++) PopupState.popupPos[_i] = new RMath.Vec2;
for (let _i = 0; 1E3 > _i; _i++) PopupState.popupVel[_i] = new RMath.Vec2;