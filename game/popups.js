import * as RMath from "./math.js";
import { LoadedFonts } from "./game_fonts.js";
import { PopupState } from "./popup_state.js";
import { drawScaledTintedTextCentered, drawTextCentered } from "./render.js";


export function clearPopups() { // wm
    PopupState.popupCount = 0
}


export function spawnPopup(x, y, vx, vy, life, color) { // Lg
    if (1E3 != PopupState.popupCount) {
        x = RMath.clamp(x, 16, 623);
        y = RMath.clamp(y, 8, 351);
        RMath.Vec2Set(PopupState.popupPos[PopupState.popupCount], x, y);
        RMath.Vec2Set(PopupState.popupVel[PopupState.popupCount], vx, -2);
        if (0 != vx) {
            PopupState.popupVel[PopupState.popupCount].x += RMath.randFloatRange(-.2, .2);
            if (PopupState.popupVel[PopupState.popupCount].y += RMath.randFloatRange(-.2, .2)) {

                PopupState.popupValue[PopupState.popupCount] = vy;
                PopupState.popupLife[PopupState.popupCount] = life;
                PopupState.popupColor[PopupState.popupCount] = color;
                PopupState.popupCount++;
            }
        }
    }

}


export function removePopup(idx) { // xm
    PopupState.popupPos[idx].set(PopupState.popupPos[PopupState.popupCount - 1]);
    PopupState.popupVel[idx].set(PopupState.popupVel[PopupState.popupCount - 1]);
    PopupState.popupValue[idx] = PopupState.popupValue[PopupState.popupCount - 1];
    PopupState.popupLife[idx] = PopupState.popupLife[PopupState.popupCount - 1];
    PopupState.popupColor[idx] = PopupState.popupColor[PopupState.popupCount - 1];
    PopupState.popupCount--
}


export function updatePopups() { // Ag
    let a;
    for (a = 0; a < PopupState.popupCount; a++) {
        if (0 == PopupState.popupVel[a].x) {
            var b = PopupState.popupPos[a],
                c = PopupState.popupVel[a];
            c.y += 0;
            RMath.Vec2Scale(c, .95);
        } else {
            b = PopupState.popupPos[a];
            c = PopupState.popupVel[a];
            c.y += .05;
            RMath.Vec2Scale(c, .99);
        }
        b.add(c);
        PopupState.popupPos[a].x = RMath.clamp(PopupState.popupPos[a].x, 16, 623);
        PopupState.popupPos[a].y = RMath.clamp(PopupState.popupPos[a].y, 8, 351);
        PopupState.popupLife[a]--;
        if (0 >= PopupState.popupLife[a]) {
            removePopup(a--);
        }
    }
}


export function drawPopups() { // Fg
    let a, b, c, d, f;
    for (a = 0; a < PopupState.popupCount; a++)
        if (20 <= PopupState.popupLife[a]) {
            drawTextCentered(LoadedFonts.gameFontSmall, ~~PopupState.popupPos[a].x, ~~PopupState.popupPos[a].y, "" + PopupState.popupValue[a], PopupState.popupColor[a], 0);
        } else {
            b = PopupState.popupColor[a] >> 16 & 255;
            c = PopupState.popupColor[a] >> 8 & 255;
            d = PopupState.popupColor[a] & 255;
            f = RMath.floor(255 * RMath.min(PopupState.popupLife[a], 20) / 20);
            drawScaledTintedTextCentered(LoadedFonts.gameFontSmall, ~~PopupState.popupPos[a].x, ~~PopupState.popupPos[a].y, "" + PopupState.popupValue[a], b, c, d, f, 0, 0, 0, f, 5, 7);
        }

}