
function Vec2() {
    this.y = this.x = 0
}

Vec2.prototype.set = function (a) {
    this.x = a.x;
    this.y = a.y;
    return this
};

function Vec2Set(v, x, y) {
    v.x = x;
    v.y = y
}

Vec2.prototype.add = function (a) {
    this.x += a.x;
    this.y += a.y;
    return this
};

function Vec2Add(a, b, c) {
    a.x = b.x + c.x;
    a.y = b.y + c.y
}

Vec2.prototype.sub = function (a) {
    this.x -= a.x;
    this.y -= a.y;
    return this
};

function Vec2Sub(a, b, c) {
    a.x = b.x - c.x;
    a.y = b.y - c.y
}

function Vec2Scale(a, b) {
    a.x *= b;
    a.y *= b
}

function Vec2Rotate(a) {
    var b = a.x;
    a.x = a.y;
    a.y = -b
}

function Vec2Mag(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y)
}

function Vec2Norm(a) {
    var b = Vec2Mag(a);
    if (0 == b) return 0;
    a.x /= b;
    a.y /= b;
    return b
}

function Vec2Angle(a) {
    var b = Math.acos(a.x / Math.sqrt(a.x * a.x + a.y * a.y));
    0 < a.y && (b = TAU - b);
    return b
}

let randLUT = new Float32Array(1024);
let randSeed = 0;
let randSeedStep = 0;


/** Returns a random number between [0, a) */
function randFloat(a) {
    randSeed += randSeedStep;
    randSeed &= 1023;
    return randLUT[randSeed] * a
}

/** Returns a random number between [a, b] */
function randFloatRange(a, b) {
    randSeed += randSeedStep;
    randSeed &= 1023;
    return randLUT[randSeed] * (b - a) + a
}

/** Randomly selects a or b */
function randSelect(a, b) {
    randSeed += randSeedStep;
    randSeed &= 1023;
    return .5 > randLUT[randSeed] ? a : b
}

function randInt(maxInt) {
    randSeed += randSeedStep;
    randSeed &= 1023;
    return ~~(randLUT[randSeed] * maxInt)
}

function randIntRange(a, b) {
    randSeed += randSeedStep;
    randSeed &= 1023;
    return ~~(randLUT[randSeed] * (b - a) + a)
}

function getRandSeed() {
    return randSeed;
}

function setRandSeed(v) {
    randSeed = v;
}

function getRandSeedStep() {
    return randSeedStep;
}

function setRandSeedStep(v) {
    randSeedStep = v;
}

let rotationLUT = Array(513);
const PI = 3.1415927;
const TAU = 6.2831855;

function rand() {
    return Math.random()
}

function abs(a) {
    return 0 > a ? -a : a
}

function max(a, b) {
    return a > b ? a : b
}

function min(a, b) {
    return a < b ? a : b
}

function clamp(a, b, c) {
    return a < b ? b : a > c ? c : a
}

function floor(a) {
    return Math.floor(a)
}

let scratchVec2 = new Vec2;

function applySeparationCorrection(_a, _b, _targetDist, _weightA, _weightB) { // T
    Vec2Sub(scratchVec2, _a, _b);
    _targetDist -= Vec2Norm(scratchVec2);
    _weightA *= _targetDist;
    _weightB *= _targetDist;
    _a.x += scratchVec2.x * _weightA;
    _a.y += scratchVec2.y * _weightA;
    _b.x -= scratchVec2.x * _weightB;
    _b.y -= scratchVec2.y * _weightB
}

function stepWithVerticalBias(_a, _b, _yBias, _scale) { // S
    Vec2Sub(scratchVec2, _a, _b);
    _b.set(_a);
    scratchVec2.y += _yBias;
    Vec2Scale(scratchVec2, _scale);
    _a.add(scratchVec2)
}

function InitStates() {
    let _t0;
    for (_t0 = 0; 513 > _t0; _t0++) rotationLUT[_t0] = new Float32Array(2);
    for (_t0 = 0; 512 > _t0; _t0++) {
        let _t1 = TAU * _t0 / 512; // 360 * c / 512 * PI / 180;
        rotationLUT[_t0][0] = Math.cos(_t1);
        rotationLUT[_t0][1] = Math.sin(_t1);
    }
    // at c = 512
    rotationLUT[_t0][0] = rotationLUT[0][0];
    rotationLUT[_t0][1] = rotationLUT[0][1];

    for (let i = 0; 1024 > i; i++) randLUT[i] = i / 1024;
    for (let i = 0; 1024 > i; i++) {
        let a = floor(1024 * rand());
        let b = randLUT[i];
        randLUT[i] = randLUT[a];
        randLUT[a] = b;
    }
    randSeed = floor(1024 * rand()) & 1023;
    randSeedStep = floor(512 * rand()) | 1;
}

export {
    InitStates,
    PI,
    TAU,
    Vec2,
    Vec2Add,
    Vec2Angle,
    Vec2Mag,
    Vec2Norm,
    Vec2Rotate,
    Vec2Scale,
    Vec2Set,
    Vec2Sub,
    abs,
    clamp,
    floor,
    max,
    min,
    rand,
    randFloat,
    randFloatRange,
    randInt,
    randIntRange,
    randLUT,
    randSelect,
    rotationLUT,
    getRandSeed,
    setRandSeed,
    getRandSeedStep,
    setRandSeedStep,
    applySeparationCorrection,
    stepWithVerticalBias,
};

