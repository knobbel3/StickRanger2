
export const EnemyProps = Object.freeze({
    Level : 0, // Enemy level used for bestiary display and EXP scaling.
    BehaviorIdx : 1, // Dispatch-table index for the enemy update behavior.
    ShapeParamA : 2, // Shape parameter used by multi-part enemies; some behaviors treat it as a segment count.
    ShapeParamB : 3, // Secondary shape parameter used by multi-part enemies; some behaviors treat it as a span or max count.
    SpriteIndex : 4, // Sprite sheet index used to pick the enemy art.
    DrawScale : 5, // Draw scale multiplier used for the enemy sprite and hitbox math.
    PrimaryTint : 6, // Primary tint color used by the enemy renderer.
    SecondaryTint : 7, // Secondary tint color used by the enemy renderer.
    AccentTint : 8, // Accent tint color used by the enemy renderer.
    Health : 9, // health column used for the LP display and health bar.
    ProjectileAttachMode : 10, // Attachment mode for the spawned projectile; remapped to -1/0/1 before spawn.
    ProjectileVisualPack : 11, // Packed projectile visual mode; splits into tint mode and solid or blend mode.
    
    PArg0 : 12,
    PArg1 : 13,
    PArg2 : 14,
    PArg3 : 15,
    PArg4 : 16,
    PArg5 : 17,
    PArg6 : 18,
    PArg7 : 19,
    PArg8 : 20,
    PArg9 : 21,
    PArg10 : 22,
    PArg11 : 23,
    PArg12 : 24,
    PArg13 : 25,
    PArg14 : 26,
    PArg15 : 27,
    PArg16 : 28,
    PArg17 : 29,
    PArg18 : 30,
    PArg19 : 31,
    PArg20 : 32,
    PArg21 : 33,
    PArg22 : 34,
    PArg23 : 35,
    PArg24 : 36,
    PArg25 : 37,
    PArg26 : 38,
    
    PArg27 : 45,
    PArg28 : 46,
    PArg29 : 47,
    PArg30 : 48,
    PArg31 : 49,
    PArg32 : 50,
    PArg33 : 51,
    PArg34 : 52,
    PArg35 : 53,
    PArg36 : 54,
    PArg37 : 55,
    PArg38 : 56,
    PArg39 : 57,
    PArg40 : 58,
    PArg41 : 59,
    PArg42 : 60,
    PArg43 : 61,
    PArg44 : 62,

    PhysResistPct : 39, // Physical resistance percentage shown in RES and applied as flat damage reduction.
    FireResistPct : 40, // Fire resistance percentage shown in RES and applied to percentage damage reduction.
    IceResistPct : 41, // Ice resistance percentage shown in RES and applied to percentage damage reduction.
    LightResistPct : 42, // Light resistance percentage shown in RES and applied to percentage damage reduction.
    PoisonResistPct : 43, // Poison resistance percentage shown in RES and applied to DoT damage reduction.
    FreezeResistPct : 44, // Freeze resistance percentage used by freeze status duration reduction.

    SecondaryProjectileEnabled : 63, // Secondary projectile template flag; nonzero spawns the variant projectile set.
    ExpReward : 64, // EXP reward granted on death.
    GoldReward : 65, // Gold reward granted on death and bestiary unlock.
    BestiaryUnlockCost : 66, // Bestiary unlock cost shown before the enemy entry is revealed.
    DropTableStartIdx : 67, // Base index of the four-slot death drop table; read as item and probability pairs.
});

export const BehaviorTypes = Object.freeze({
    Slime : 0 ,
    BoxSnake : 1,
    Bat : 2,
    Dragon : 3,
    Stickman : 4,
    TreeLeft : 5,
    TreeRight : 6,
    HangingTree : 7,
    Type8 : 8,
    Type9 : 9,
    Type10 : 10,
    StickmanAlt : 11,
});