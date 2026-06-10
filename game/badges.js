import {badgeList, stageBadgeRewardItemIdxByStage} from "./badge_list.js";
import { BadgeState, GUIState } from "./global_states.js";
import {PartyState} from "./party_state.js";


export function isBadgeIncompleteForCurrentStage(badgeIdx) { // A
    return GUIState.currentStage == badgeList[badgeIdx][2] && BadgeState.badgeCounterArray[badgeIdx] != badgeList[badgeIdx][4] ? true : false
}


export function IncrementBadgeCount(badgeIndex) {
    BadgeState.badgeCounterArray[badgeIndex]++;
    if (BadgeState.badgeCounterArray[badgeIndex] == badgeList[badgeIndex][4]) {
        BadgeState.lastCompletedBadgeIdx = badgeIndex;
        BadgeState.badgePopupTimer = 120;
        var b = 0;
        badgeIndex = badgeList[badgeIndex][2];
        for (var c = 0; c < badgeList.length; c++) {
            if (
                badgeList[c] &&
                badgeIndex == badgeList[c][2] &&
                BadgeState.badgeCounterArray[c] == badgeList[c][4]
            ) {
                b++;
            }
        }
        if (5 == b) {
            PartyState.itemForgeLvls[stageBadgeRewardItemIdxByStage[badgeIndex]] = 1;
            PartyState.itemIsNew[stageBadgeRewardItemIdxByStage[badgeIndex]] = 1;
        }
    }
}