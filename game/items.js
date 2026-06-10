import { ItemProps, AccessoryPrefixes, AccessoryProps } from "./item_enums.js";
import { itemList } from "./item_list.js";
import * as RMath from "./math.js";
import { PartyState } from "./party_state.js";

export function getItemModifierAmount(itemIdx, columnIdx) { // Ue
    for (var c = 0; 6 > c; c += 2)
        if (itemList[itemIdx][ItemProps.StatModifyingBase + c] == columnIdx) return itemList[itemIdx][ItemProps.StatModifyingBase + c + 1];
    return 0;
}


export function getItemStatWithForge(_itemIdx, _columnIdx) { // Ve
    var c = 0;
    if (0 == _columnIdx) {
        c = 0;
    } else {
        if (_columnIdx == itemList[_itemIdx][ItemProps.StatModifyingBase + 0]) {
            c = itemList[_itemIdx][ItemProps.StatModifyingBase + 1];
        } else if (_columnIdx == itemList[_itemIdx][ItemProps.StatModifyingBase + 2]) {
            c = itemList[_itemIdx][ItemProps.StatModifyingBase + 3];
        } else {
            _columnIdx == itemList[_itemIdx][ItemProps.StatModifyingBase + 4] && (c = itemList[_itemIdx][ItemProps.StatModifyingBase + 5]);
        }
        
    }
    if (0 != c) {
        var d = PartyState.itemForgeLvls[_itemIdx] - 1;
        _itemIdx == PartyState.forgePreviewItemIdx && d++;
        return itemList[_itemIdx][_columnIdx] + RMath.floor(itemList[_itemIdx][_columnIdx] * d * c / 100);
    }
    return itemList[_itemIdx][_columnIdx];
}


export function getItemForgeMultiplier(_itemIdx, _columnIdx) { // Xe
    var c = 0;
    if (0 == _columnIdx) {
        c = 0;
    } else if (_columnIdx == itemList[_itemIdx][ItemProps.StatModifyingBase + 0]) {
        c = itemList[_itemIdx][ItemProps.StatModifyingBase + 1];
    } else if (_columnIdx == itemList[_itemIdx][ItemProps.StatModifyingBase + 2]) {
        c = itemList[_itemIdx][ItemProps.StatModifyingBase + 3];
    } else {
        _columnIdx == itemList[_itemIdx][ItemProps.StatModifyingBase + 4] && (c = itemList[_itemIdx][ItemProps.StatModifyingBase + 5]);
    }
    
    if (0 != c) {
        var d = PartyState.itemForgeLvls[_itemIdx] - 1;
        _itemIdx == PartyState.forgePreviewItemIdx && d++;
        return d * c;
    }
    return -1;
}


export function getModifiedStatVal(heroIdx, itemIdx, columnIdx) {
    let d = 0;
    // it goes like this...
    //       +0     +2     +4          | itemStatModifingCol + *
    // [..., c0,b0, c1,b1, c2,b2, ...] | itemList[itemIdx]
    //          *      *      *        | d
    if (columnIdx == 0) {
        d = 0;
    } else if (columnIdx == itemList[itemIdx][ItemProps.StatModifyingBase + 0]) {
        d = itemList[itemIdx][ItemProps.StatModifyingBase + 1];
    } else if (columnIdx == itemList[itemIdx][ItemProps.StatModifyingBase + 2]) {
        d = itemList[itemIdx][ItemProps.StatModifyingBase + 3];
    } else if (columnIdx == itemList[itemIdx][ItemProps.StatModifyingBase + 4]) {
        d = itemList[itemIdx][ItemProps.StatModifyingBase + 5];
    }

    if (0 != d) {
        let f = PartyState.itemForgeLvls[itemIdx] - 1; // $b
        if (heroHasAccessoryEffect(heroIdx, AccessoryProps.ArmsBonus0) && 3 == itemList[itemIdx][ItemProps.DropIconCol])
            f += countAccessoryLvlBonuses(heroIdx, AccessoryProps.ArmsBonus0);

        if (heroHasAccessoryEffect(heroIdx, AccessoryProps.ChargeBonus) && 4 == itemList[itemIdx][ItemProps.DropIconCol])
            f += countAccessoryLvlBonuses(heroIdx, AccessoryProps.ChargeBonus);

        if (heroHasAccessoryEffect(heroIdx, AccessoryProps.ArmsBonus1) && 3 == itemList[itemIdx][ItemProps.DropIconCol])
            f += countAccessoryLvlBonuses(heroIdx, AccessoryProps.ArmsBonus1);

        if (heroHasAccessoryEffect(heroIdx, AccessoryProps.ArmsBonus1) && 4 == itemList[itemIdx][ItemProps.DropIconCol])
            f += sumAccessorySecondaryValues(heroIdx, AccessoryProps.ArmsBonus1);

        return itemList[itemIdx][columnIdx] + RMath.floor(itemList[itemIdx][columnIdx] * f * d / 100)
    }
    return itemList[itemIdx][columnIdx]
}


export function heroHasAccessoryEffect(partyIdx, accessoryIdx) {
    return itemList[PartyState.partyEquipmentTable[partyIdx][3]][AccessoryPrefixes.TempIdx] == accessoryIdx ||
        itemList[PartyState.partyEquipmentTable[partyIdx][4]][AccessoryPrefixes.TempIdx] == accessoryIdx
        ? true
        : false
}


export function countAccessoryLvlBonuses(partyIdx, accessoryIdx) {
    var c = 0;
    itemList[PartyState.partyEquipmentTable[partyIdx][3]][AccessoryPrefixes.TempIdx] == accessoryIdx && (c += itemList[PartyState.partyEquipmentTable[partyIdx][3]][AccessoryPrefixes.PrimaryValue]);
    itemList[PartyState.partyEquipmentTable[partyIdx][4]][AccessoryPrefixes.TempIdx] == accessoryIdx && (c += itemList[PartyState.partyEquipmentTable[partyIdx][4]][AccessoryPrefixes.PrimaryValue]);
    return c
}


export function sumAccessorySecondaryValues(partyIdx, accessoryIdx) {
    var c = 0;
    itemList[PartyState.partyEquipmentTable[partyIdx][3]][AccessoryPrefixes.TempIdx] == accessoryIdx && (c += itemList[PartyState.partyEquipmentTable[partyIdx][3]][AccessoryPrefixes.SecondaryValue]);
    itemList[PartyState.partyEquipmentTable[partyIdx][4]][AccessoryPrefixes.TempIdx] == accessoryIdx && (c += itemList[PartyState.partyEquipmentTable[partyIdx][4]][AccessoryPrefixes.SecondaryValue]);
    return c
}

