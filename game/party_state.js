
export let PartyState = {
    partyMemberCount : 1,
    partyLevel : 1,
    partyEXPAccum : 0,
    partyGold : 0,
    partySP : [0, 0, 0, 0],
    partyLP : [50, 50, 50, 50],
    partyMaxLP : [50, 50, 50, 50],
    heroEmitCurrent : [0, 0, 0, 0], // $a
    heroEmitValues : [0, 0, 0, 0],
    heroChargeValues : [0, 0, 0, 0],
    heroEmitCooldown : [0, 0, 0, 0], // cb

    stageEventFlags : [0, 0, 0, 0, 0, 0, 0, 0, 0],
    collectedStageFlagsCount : 0, // eb
    stageFlagsSetCount : 0, // hb

    autoMoveEnabled : [0, 0, 0, 0], // ib
    cliffStopEnabled : 0, // kb

    // real values
    partyHealthLvls : [0, 0, 0, 0],
    partyShortAtkLvls : [0, 0, 0, 0],
    partyMidAtkLvls : [0, 0, 0, 0],
    partyLongAtkLvls : [0, 0, 0, 0],
    partyPhysLvls : [0, 0, 0, 0],
    partyElemLvls : [0, 0, 0, 0],
    partyDodgeLvls : [0, 0, 0, 0],
    partyStats : undefined,

    // fake values!!
    partyMaxLPBonus_vals : [0, 0, 0, 0],
    partyShortAtk_vals : [0, 0, 0, 0],
    partyMidAtk_vals : [0, 0, 0, 0],
    partyLongAtk_vals : [0, 0, 0, 0],
    partyPhys_vals : [0, 0, 0, 0],
    partyElem_vals : [0, 0, 0, 0],
    partyDodge_vals : [0, 0, 0, 0],
    partyPhysAtkStats : undefined,
    //               PRIMARY      SECONDARY   
    //              [h0,h1,h2,h3, h0,h1,h2,h3]
    minAtkArray :   [0, 0, 0, 0,  0, 0, 0, 0],
    maxAtkArray :   [0, 0, 0, 0,  0, 0, 0, 0],
    atkCountArray : [0, 0, 0, 0,  0, 0, 0, 0],

    heroAgiValues : [0, 0, 0, 0],
    heroRangeValues : [0, 0, 0, 0],
    heroMeleeDefensesFlatArray : [0, 0, 0, 0],
    heroProjDefenseFlatArray : [0, 0, 0, 0],
    heroMagicDefenseFlatArray : [0, 0, 0, 0],
    heroDodgeChanceArray : [0, 0, 0, 0],
    physAtkBonusPercent : [0, 0, 0, 0], // Nb
    fireAtkBonusPercent : [0, 0, 0, 0], // Ob
    iceAtkBonusPercent : [0, 0, 0, 0], // Pb
    lightningAtkBonusPercent : [0, 0, 0, 0], // Sb
    poisonAtkBonusPercent : [0, 0, 0, 0], // Tb
    atkBonusPercentByElement : undefined, // Ub
    
    partyRewardValueBonusPercent : 0, // Vb
    partyDropChanceBonusPercent : 0, // Wb
    partyEnemyHpBonusPercent : 0, // Xb
    /** [partyN][i] */
    partyEquipmentTable : [
        // "arms", "charge", "head", "ring", "amulet"
        [4, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        []
    ],
    forgePreviewItemIdx : -1, // Zb
    itemForgeLvls : Array(256),
    itemIsNew : Array(256), // ac, 
};

PartyState.partyStats = [
    PartyState.partyHealthLvls, 
    PartyState.partyShortAtkLvls, 
    PartyState.partyMidAtkLvls, 
    PartyState.partyLongAtkLvls, 
    PartyState.partyPhysLvls, 
    PartyState.partyElemLvls, 
    PartyState.partyDodgeLvls
];

PartyState.partyPhysAtkStats = [
    PartyState.partyShortAtk_vals, 
    PartyState.partyMidAtk_vals, 
    PartyState.partyLongAtk_vals
];

PartyState.atkBonusPercentByElement = [
    PartyState.physAtkBonusPercent, 
    PartyState.fireAtkBonusPercent, 
    PartyState.iceAtkBonusPercent, 
    PartyState.lightningAtkBonusPercent, 
    PartyState.poisonAtkBonusPercent
];

for (let _i = 0; 256 > _i; _i++) PartyState.itemIsNew[_i] = 0;
for (let _i = 0; 256 > _i; _i++) PartyState.itemForgeLvls[_i] = 0;

export const inventoryItemLists = [
    [4, 5, 6, 9, 10, 11, 15, 17, 19, 21, 24, 26, 38, 41, 42, 43, 49, 50, 51, 52, 53, 54, 89, 90, 91, 92, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [7, 8, 12, 13, 14, 16, 18, 20, 22, 23, 25, 27, 34, 35, 39, 40, 44, 46, 47, 48, 55, 56, 57, 58, 59, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 131, 132, 133, 134, 135, 0, 0, 0, 0, 0, 0, 0],
    [28, 29, 30, 31, 32, 33, 36, 37, 45, 60, 0, 0, 0, 0, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 0, 0, 0, 0, 0],
    [71, 73, 75, 77, 79, 81, 83, 85, 87, 113, 115, 117, 119, 136, 137, 138, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [72, 74, 76, 78, 80, 82, 84, 86, 88, 114, 116, 118, 120, 139, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    []
];