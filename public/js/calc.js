/*
 * 2020-2021 Dmitrij Kobilin.
 *
 * Nenia rajtigilo ekzistas.
 * Faru bone, ne faru malbone.
 *
 */
"use strict";

var Calc = function() {

}
Calc.prototype.skidPatches = function(front, rear) {
    let cogDivider = rear;
    while (cogDivider > 1) {
        if ((rear  % cogDivider) == 0 &&
            (front % cogDivider) == 0
        ) {
            break;
        }
        cogDivider--;
    }
    return rear / cogDivider;
}
Calc.prototype.speed = function(front, rear, wheeld, cadence, opt) {
    let gearRatio = front / rear;
    let meters    = Math.PI * wheeld / 1000 * gearRatio;

    return cadence * meters / 1000 * 60;
}
Calc.prototype.round = function(num, r) {
    return Math.round(num * Math.pow(10, r)) / Math.pow(10, r);
}
Calc.prototype.sprocketRadius = function(teeth) {
    /* Inches. */
    return (1.0 / 2) / 2 / Math.sin(Math.PI / teeth);
}
Calc.prototype.chainLength = function(frontTeeth, rearTeeth, chainstay) {
    let r1 = Calc.prototype.sprocketRadius(rearTeeth);
    let r2 = Calc.prototype.sprocketRadius(frontTeeth);

    chainstay = chainstay / 10.0 / 2.54; /* inches */

    let length = 0;
    length += 2 * Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(chainstay, 2));
    length += 2 * Math.PI * r1 / 2;
    length += 2 * Math.PI * r2 / 2;
    length *= 2;

    return length;
}

