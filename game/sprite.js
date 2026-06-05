export let uncheckedSpriteCount = {
    value: 0
};
export const dataPath = "./data/";
export const canvasTag = "canvas";
export const name2d = "2d";

export class Sprite {
    constructor() {
        /** Image object */
        this.a = 0;
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

    createBuffer(width, height) {
        this.h = width;
        this.i = height;
        for (width = 0; 16 > width; width++);
        this.g = new Int32Array(this.h * this.i);
    }

    /** load */
    load(path) {
        if (this.b !== path) {
            uncheckedSpriteCount.value++;
            this.b = path;
            this.a = new Image();
            this.a.src = dataPath + path;
            delete this.g;
            this.c = 0;
            this.g = 0;
        }
    }

    processLoad() {
        if (!this.c && this.a.complete) {
            uncheckedSpriteCount.value--;
            const imgWidth = this.a.width;
            const imgHeight = this.a.height;
            if (!imgWidth || !imgHeight) {
                delete this.a;
                this.b = "";
                throw "ERROR";
            }

            const canvas = document.createElement("canvas");
            canvas.width = imgWidth;
            canvas.height = imgHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(this.a, 0, 0);
            const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight).data;

            this.createBuffer(imgWidth, imgHeight);
            for (let i = 0, length = imageData.length; i < length; i += 4) {
                this.g[i >> 2] = imageData[i + 3] === 0
                    ? -1
                    : (imageData[i] << 16) | (imageData[i + 1] << 8) | imageData[i + 2];
            }

            delete this.a;
            this.c = 1;
        }
    }
}

// Compatibility wrappers for existing code patterns
Sprite.prototype.f = Sprite.prototype.load;

export function spriteCreateBuffer(sprite, width, height) {
    sprite.createBuffer(width, height);
}

export function loadSprite(sprite) {
    sprite.processLoad();
}
