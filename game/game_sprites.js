import { Sprite } from "./sprite.js";

export let LoadedSprites = {
    titleSprite : new Sprite(),
    iconSpriteSheet : new Sprite(),
    tilesetSprites : Array(3), 
    currentLevelSprite : new Sprite(),
    enemySpriteSheet : new Sprite(),
    droppedItemSpriteSheet : new Sprite(),
    itemsSpriteSheet : new Sprite(),
    effectSpriteSheet : new Sprite(),
    medalSpriteSheet : new Sprite(),
};

for (let _i = 0; 3 > _i; _i++) LoadedSprites.tilesetSprites[_i] = new Sprite();