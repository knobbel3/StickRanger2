import * as RMath from "./math.js";
import { CanvasState, GameState, KeyboardState, MouseState } from "./global_states.js";
import * as Consts from "./consts.js"


export function toggleFullscreen() {
    document.fullscreenEnabled && (document.fullscreenElement ? document.exitFullscreen() : CanvasState.element.requestFullscreen())
}

export function onTouchStart(a) {
    handleTouch(a);
    if (1 == MouseState.activeTouchCount) {
        MouseState.isMouseDown = true;
        MouseState.mouseXCurrent = MouseState.mouseXRel;
        MouseState.mouseYCurrent = MouseState.mouseYRel;
    } else if (2 == MouseState.activeTouchCount) {
        MouseState.isMouseDown = false;
        MouseState.mouseXCurrent = MouseState.mouseXRel;
        MouseState.mouseYCurrent = MouseState.mouseYRel;
    }
    return false;
};

export function onContextMenu() {
    if (GameState.isCanvasFocused) return false
};

export function onMouseDown(mouseState) {
    onMouseMove(mouseState);
    GameState.isCanvasFocused = false;

    const insideCanvas =
        MouseState.mouseXRel >= 0 && MouseState.mouseXRel < Consts.CANVAS_WIDTH &&
        MouseState.mouseYRel >= 0 && MouseState.mouseYRel < Consts.CANVAS_HEIGHT;

    if (insideCanvas) {
        GameState.isCanvasFocused = true;
        if (mouseState.button === 0) {
            MouseState.isMouseDown = true;
        }
        return false;
    }
    // if (
    //     !(0 > mouseXRel || CANVAS_WIDTH <= mouseXRel || 0 > mouseYRel || CANVAS_HEIGHT <= mouseYRel) && 
    //     (isCanvasFocused = true, 0 == a.button && (isMouseDown = true), isCanvasFocused)
    // ) return false
};

export function onMouseUp(mouseState) {
    onMouseMove(mouseState);
    if (mouseState.button === 0) {
        MouseState.isMouseDown = false;
    }
    //0 == mouseState.button && (isMouseDown = false)
};

export function onTouchMove(a) {
    handleTouch(a);
    return false;
};

export function onTouchEnd(a) {
    handleTouch(a);
    if (0 == MouseState.activeTouchCount) {
        MouseState.isMouseDown = false;
    } else if (1 == MouseState.activeTouchCount) {
        MouseState.mouseXCurrent = MouseState.mouseXRel;
        MouseState.mouseYCurrent = MouseState.mouseYRel;
    } else if (2 == MouseState.activeTouchCount) {
        MouseState.mouseXCurrent = MouseState.mouseXRel;
        MouseState.mouseYCurrent = MouseState.mouseYRel;
    }
    return false;
};

export function onTouchCancel() {
    MouseState.activeTouchCount = 0;
    MouseState.isMouseDown = false;
};

export function onKeyDown(a) {
    var b = a.keyCode;
    if (65 <= b & 90 >= b) {
        a.shiftKey || (b += 32);
    } else {
        b = a.shiftKey ? KeyboardState.keyMapShift[b] : KeyboardState.keyMapNoShift[b];
    }
    if (0 <= b && 256 > b) {
        KeyboardState.keyHeld[b] = true;
        KeyboardState.keyPressPending[b] = true;
    }
    if (0 != b && GameState.isCanvasFocused) return false;
};

export function onKeyUp(a) {
    var b = a.keyCode;
    if (65 <= b & 90 >= b) {
        a.shiftKey || (b += 32);
    } else {
        b = a.shiftKey ? KeyboardState.keyMapShift[b] : KeyboardState.keyMapNoShift[b];
    }
    if (0 <= b && 256 > b) {
        KeyboardState.keyHeld[b] = false;
    }
    if (0 != b && GameState.isCanvasFocused) return false;
};


export function buttonCheck(x, y, w, h) {
    return MouseState.mouseXCurrent < x || x + w <= MouseState.mouseXCurrent || MouseState.mouseYCurrent < y || y + h <= MouseState.mouseYCurrent ? false : true
}

export function buttonCheckCentered(x, y, w, h) {
    return buttonCheck(x - w / 2, y - h / 2, w, h)
}

export function onMouseMove(mouseState) {
    var clientRect = CanvasState.element.getBoundingClientRect(),
        rectWidth = clientRect.right - clientRect.left,
        rectHeight = clientRect.bottom - clientRect.top,
        f = RMath.min(rectWidth / Consts.CANVAS_WIDTH, rectHeight / Consts.CANVAS_HEIGHT),
        rectHeight = RMath.floor(rectHeight / 2 - Consts.CANVAS_HEIGHT * f / 2);
    MouseState.mouseXRel = RMath.floor((mouseState.clientX - clientRect.left - RMath.floor(rectWidth / 2 - Consts.CANVAS_WIDTH * f / 2)) / f);
    MouseState.mouseYRel = RMath.floor((mouseState.clientY - clientRect.top - rectHeight) / f)
    // LogMsg(`(${mouseXRel}, ${mouseYRel}), ${isCanvasFocused}`);
}

export function handleTouch(a) {
    var clientRect = CanvasState.element.getBoundingClientRect(),
        rectWidth = clientRect.right - clientRect.left,
        rectHeight = clientRect.bottom - clientRect.top,
        f = RMath.min(rectWidth / 640, rectHeight / 432),
        rectWidth = RMath.floor(rectWidth / 2 - 640 * f / 2),
        rectHeight = RMath.floor(rectHeight / 2 - 432 * f / 2);
    a = a.touches;
    console.log(a);
    MouseState.activeTouchCount = a.length;
    if (1 == MouseState.activeTouchCount) {
        MouseState.mouseXRel = RMath.floor((a[0].clientX - clientRect.left - rectWidth) / f);
        MouseState.mouseYRel = RMath.floor((a[0].clientY - clientRect.top - rectHeight) / f);
    } else if (2 == MouseState.activeTouchCount) {
        MouseState.mouseXRel = RMath.floor((a[0].clientX - clientRect.left - rectWidth) / f);
        MouseState.mouseYRel = RMath.floor((a[0].clientY - clientRect.top - rectHeight) / f);
        rectHeight = RMath.floor((a[1].clientY - clientRect.top - rectHeight) / f);
        MouseState.mouseXRel = RMath.floor((MouseState.mouseXRel + RMath.floor((a[1].clientX - clientRect.left - rectWidth) / f)) / 2);
        MouseState.mouseYRel = RMath.floor((MouseState.mouseYRel + rectHeight) / 2);
    }
}


export function promptInput(message, _default) {
    var c = null;
    try {
        c = prompt(message, _default)
    } catch (d) { }
    return c
}