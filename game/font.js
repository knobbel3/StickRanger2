import { Sprite } from "./sprite.js";

export class GameFont {
    constructor() {
        this.i = new Sprite();
        this.a = 0;
        this.b = 0;
        this.j = 0;
        this.c = 0;
    }

    load(path, b, c) {
        this.i.f(path);
        this.c = b;
        this.j = c;
        this.a = this.b = 0;
    }
}

// Compatibility wrapper for existing code that still calls .f()
GameFont.prototype.f = GameFont.prototype.load;
