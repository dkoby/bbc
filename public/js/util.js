/*
 * 2020-2021 Dmitrij Kobilin.
 *
 * Nenia rajtigilo ekzistas.
 * Faru bone, ne faru malbone.
 *
 */
"use strict";

var Util = {};

Util.validateNumInput = function(ev, rules)
{
    let input = ev.target;

    let success    = false;
    let checkRange = true;

    let value = input.value;

    let matchVar = {};
    function match(s, pat, matchVar) {
        matchVar.value = s.match(pat);
        return matchVar.value;
    }

    if (value.match(/^\d+$/) != null)
    {
        success = true;
    } else if (value.match(/^0x[0-9a-fA-F]+$/) != null) {
        success = true;
    } else if (value.match(/^0x$/) != null) {
        input.value = "0x0";
        input.setSelectionRange(2, 3);
        success = true;
    } else if (value.match(/^\d+\.\d+$/) != null
        && rules.floatVal
    ) {
        success = true;
    } else if (match(value, /^(\d+)\.$/, matchVar) != null
        && rules.floatVal
    ) {
        input.value = matchVar.value[1] + ".0";
        let slength = String(matchVar.value[1]).length;
        input.setSelectionRange(slength + 1, slength + 2);
        success = true;
    } else if (match(value, /^\.(\d+)$/, matchVar) != null
        && rules.floatVal
    ) {
        input.value = "0." + matchVar.value[1];
        let slength = String(matchVar.value[1]).length;
        input.setSelectionRange(0, 1);
        success = true;

    } else if (value.match(/^0b[01]+$/) != null) {
        success = true;
    } else if (value.match(/^0b$/) != null) {
        input.value = "0b0";
        input.setSelectionRange(2, 3);
        success = true;
    } else if (rules.min !== undefined && value.match(/^-$/) != null) {
        input.value = rules.min;
        input.setSelectionRange(1, 2);
        success = true;
    } else if (value.match(/^-[0-9]+$/) != null) {
        success = true;
    } else if (value.match(/^-$/) != null) {
        if (rules.min !== undefined && rules.min < 0)
            input.value = rules.min;
        else
            input.value = -1;
        input.setSelectionRange(1, 2);
        success = true;
    } else if (value == "") {
        if (rules.allowEmpty)
        {
            checkRange = false;
            success = true;
        } else if (rules.min !== "undefined") {
            checkRange = false;
            input.value = rules.min;
            input.setSelectionRange(0, input.value.toString().length);
            success = true;
        }
    }

    if (success)
        value = input.value;

    if (value != "" && isNaN(Number(value)))
    {
        success = false;
    }

    if (checkRange)
    {
        let num = Number(value);
        if (rules.min !== undefined && num < rules.min)
            success = false;
        if (rules.max !== undefined && num > rules.max)
            success = false;
    }

    if (success)
    {
        do
        {
            if (rules.validatePost && !rules.validatePost(input.value))
                break;

            input.oldValue = input.value;
            return;
        } while (false);
    }

    if (input.oldValue !== undefined)
        input.value = input.oldValue;
    else if (rules.min !== undefined)
        input.value = rules.min;
}

