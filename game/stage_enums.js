
export const StageProps = Object.freeze({stageNameCol : 0,
    stageTilesetIdxCol : 1,
    stageUIBgColorCol : 2,
    stageReturnCost : 3, // stageAttr3, gold cost to return/warp to the village
    stageExitTopIdx : 4, // stageAttr4, stage index to go to when exiting off the top edge
    stageExitBottomIdx : 5, // stageAttr5, stage index to go to when exiting off the bottom edge
    stageExitLeftIdx : 6, // stageAttr6, stage index to go to when exiting off the left edge
    stageExitRightIdx : 7, // stageAttr7, stage index to go to when exiting off the right edge
    stageSpawnChance : 8, // stageAttr8, stage spawn chance/intensity (higher -> more frequent ambient spawns)
    stageSpawnGroupsStartIdx : 9, // stageAttr9, index where this row's spawn-group definitions begin (groups of 7 values)
});
