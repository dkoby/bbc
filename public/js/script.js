/*
 * 2020-2021 Dmitrij Kobilin.
 *
 * Nenia rajtigilo ekzistas.
 * Faru bone, ne faru malbone.
 *
 */
"use strict";

var BBC = function() {
    this.version = 1;
    this.settingsVersion = 1;

    this.rims = [
        {display: "700c (622 mm)" , diameter: 622,},
        {display: "26\" (559 mm)" , diameter: 559,},
        {display: "27.5\"(584 mm)", diameter: 584,},
    ];
    this.tires = [
        {display: "700x23c" , width: 23,},
        {display: "700x25c" , width: 25,},
        {display: "700x28c" , width: 28,},
        {display: "700x32c" , width: 32,},
        {display: "700x35c" , width: 35,},
        {display: "1.5 \"" , width: 25.4 * 1.50,},
        {display: "1.75 \"" , width: 25.4 * 1.75,},
        {display: "1.95 \"" , width: 25.4 * 1.95,},
        {display: "2.0 \"" , width: 25.4 * 2.00,},
        {display: "2.35 \"" , width: 25.4 * 2.35,},
        {display: "2.5 \"" , width: 25.4 * 2.50,},
    ];
    for (let i = 23; i <= 116; i++)
    {
        this.tires.push(
            {display: i + " mm", width: i},
        );
    }
    this.frontSprockets = [];
    for (let i = 28; i <= 120; i++)
        this.frontSprockets.push({display: i + "T", tooth: i,});
    this.rearSprockets = [];
    for (let i = 12; i <= 24; i++)
        this.rearSprockets.push({display: i + "T", tooth: i,});
    this.holes = [
        {display: "20" , holes: 20,},
        {display: "28" , holes: 28,},
        {display: "32" , holes: 32,},
        {display: "36" , holes: 36,},
        {display: "40" , holes: 40,},
        {display: "48" , holes: 48,},
    ];
    this.crosses = [
        {display: "0 Cros" , crosses: 0,},
        {display: "1 Cros" , crosses: 1,},
        {display: "2 Cros" , crosses: 2,},
        {display: "3 Cros" , crosses: 3,},
        {display: "4 Cros" , crosses: 4,},
    ];

    this.block = {};
    this.block.wheel = {};
    ["rear", "front"].forEach((type) => {
        this.block.wheel[type] = {};
        this.block.wheel[type].hub = {};
        this.block.wheel[type].hub.side = {};
        ["left", "right"].forEach((side) => {
            this.block.wheel[type].hub.side[side] = {};
        })
    });
    this.block.frame = {};
    this.block.gear = {};
    this.block.fg = {};
    this.block.fg.cadence = {};

    let makeHub = function(block, type) {
        block
        .mkChild("div", ["tableCell"])
        .mkChild("div", ["flexVertical"])
        .mkChild("div", ["sectionName"], type == "rear" ? "Rear hub (spoke length)" : "Front hub (spoke length)")
        .mkSiblingExt({
            tag: "img",
            classList: ["hubImage"],
            attrs: {
                src: "img/hub.png"
            },
        })
        .mkSibling("div", ["table"])
            .mapChilds(["ERD", "WIDTH", "HOLES", "CROSSES", "DHUBHOLE"], (block, param) => {
                let paramName;
                let title;
                let display;

                switch (param)
                {
                    case "ERD"     : paramName = "erd";      display = "ERD";        title = "Effective Rim Diameter";     break;
                    case "WIDTH"   : paramName = "width"; display = "Axle width"; title = "Axle(hub) width";            break;
                    case "HOLES"   : paramName = "holes";    display = "Holes";      title = "Number of holes in rim/hub"; break;
                    case "CROSSES" : paramName = "crosses";  display = "Lacing pat.";title = "Lacing pattern (crosses)";   break;
                    case "DHUBHOLE": paramName = "dhole"; display = "Hole diam." ;title = "Hub hole diameter";   break;
                }

                block
                .mkChild("div", ["tableRow"])
                    .mkChildExt({
                        tag: "div",
                        classList: ["tableCell", "paramName"],
                        innerHTML: display,
                        attrs: {
                            title: title,
                        },
                    })
                    .mkSibling("div", ["tableCell"])
                    .apply((block) => {
                        if (param == "HOLES" || param == "CROSSES") {
                            block
                            .mkChild("select", [])
                            .apply((block) => {
                                if (param == "HOLES")
                                    this.block.wheel[type].holes = block;
                                else
                                    this.block.wheel[type].crosses = block;

                                block.element.addEventListener("change", (ev) => {
                                    this.saveSettings();
                                    this.calc();
                                });
                            })
                                .mapChilds(param == "HOLES" ? this.holes : this.crosses, (block, element) => {
                                    block.mkChildExt({
                                        tag: "option",
                                        innerHTML: element.display,
                                    });
                                })
                            ;
                        } else {
                            block
                            .mkChildExt({
                                tag: "input", 
                                attrs: {
                                    type: "text",
                                },
                                style: {
                                    width: (param == "WIDTH" || param == "ERD" || param == "DHUBHOLE") ? "5em" : "4em",
                                },
                                events: [
                                    ["click", "keyup"],
                                    (ev) => {
                                        let opt = {};
                                        opt.min = 0;
                                        opt.max = 2000;

                                        if (param == "DHUBHOLE")
                                            opt.floatVal = true;

                                        Util.validateNumInput(ev, opt);
                                        if (param == "WIDTH" || param == "DHUBHOLE")
                                            this.block.wheel[type].hub[paramName].value = ev.target.value;
                                        else
                                            this.block.wheel[type][paramName].value = ev.target.value;
                                        this.saveSettings();
                                        this.calc();
                                    }
                                ],
                            })
                            .apply((block) => {
                                if (param == "WIDTH" || param == "DHUBHOLE")
                                {
                                    this.block.wheel[type].hub[paramName] = block;
                                } else {
                                    this.block.wheel[type][paramName] = block;
                                }

                                if (param == "WIDTH" || param == "ERD" || param == "DHUBHOLE")
                                    block.getParent().mkSibling("div", ["tableCell"], "mm");
                            })
                            ;
                        }
                    })
            })
        .getParent() /* FlexVertical. */
            .mkChild("div", ["table"])
                .mapChilds(["fdiameter", "fcenter", "faxle"], (block, param) => {
                    block.mkChild("div", ["tableRow"])
                        .mapChilds(["left", "right"], (block, side) => {
                            let title;
                            let display;
                            if (side == "left")
                            {
                                switch (param)
                                {
                                    case "faxle"    : display = "LF"; title = "Left side, locknut to flange."; break;
                                    case "fcenter"  : display = "LC"; title = "Left side, flange to center."; break;
                                    case "fdiameter": display = "LD"; title = "Left side, flange diameter."; break;
                                }
                            } else {
                                switch (param)
                                {
                                    case "faxle"    : display = "RF"; title = "Right side, locknut to flange."; break;
                                    case "fcenter"  : display = "RC"; title = "Right side, flange to center."; break;
                                    case "fdiameter": display = "RD"; title = "Right side, flange diameter."; break;
                                }
                            }

                            block
                            .mkChildExt({
                                tag: "div",
                                classList: ["tableCell", "paramName"],
                                innerHTML: display,
                                attrs: {
                                    title: title,
                                },
                            })
                            .mkSibling("div", ["tableCell"])
                                .mkChildExt({
                                    tag: "input", 
                                    attrs: {
                                        type: "text",
                                    },
                                    style: {
                                        width: "4em",
                                    },
                                    events: [
                                        ["click", "keyup"],
                                        (ev) => {
                                            Util.validateNumInput(ev, {
                                                min: 0,
                                                max: 2000,
                                            });
                                            this.block.wheel[type].hub.side[side][param].value = ev.target.value;
                                            this.adjustValues({
                                                param: param,
                                                type: type,
                                                side: side,
                                            });
                                            this.saveSettings();
                                            this.calc();
                                        }
                                    ],
                                })
                                .apply((block) => {
                                    this.block.wheel[type].hub.side[side][param] = block;
                                })
                                .mkSibling("span", [], "mm")
                        }) /* left, right */
                })
        .getParent() /* FlexVertical */
            .mkChild("div", ["table"])
                .mkChild("div", ["tableRow"])
                    .mkChild("div", ["tableCell", "paramNameCalc"], "&#x0251")
                    .mutate({attrs: {title: "Spokes angle (hub hole angle)."}})
                    .mkSibling("div", ["tableCell"])
                    .apply((block) => {
                        this.block.wheel[type].spokeAngle = block;
                    })
                .getParent()
            .getParent()  /* Table. */
        .getParent()  /* FlexVertical. */
            .mkChild("div", ["table"])
                .mapChilds(["left", "right"], (block, side) => {
                    block
                    .mkChild("div", ["tableRow"])
                        .mkChild("div", ["tableCell", "paramNameCalc"], (side == "left" ? "Left" : "Right") + " spokes")
                        .mkSibling("div", ["tableCell"])
                        .apply((block) => {
                            this.block.wheel[type].hub.side[side].spokeLength = block;
                        })
                        .mkSibling("div", ["tableCell"], "mm")
                })
                .getParent()

        ;
    }
    let makeWheel = function(block, type) {
        block
        .mkChild("div", ["tableCell"])
        .mkChild("div", ["flexVertical"])
        .mkChild("div", ["sectionName"], type == "rear" ? "Rear wheel" : "Front wheel")
        .mkSibling("div", ["table"])
            .mkChild("div", ["tableRow"])
                .mkChild("div", ["tableCell", "paramName"], "Rim")
                .mkSibling("div", ["tableCell"])
                    .mkChild("select", [])
                    .apply((block) => {
                        this.block.wheel[type].rimType = block;
                        block.element.addEventListener("change", (ev) => {
                            this.saveSettings();
                            this.calc();
                        });
                    })
                        .mapChilds(this.rims, (block, element) => {
                            block.mkChildExt({
                                tag: "option",
                                innerHTML: element.display,
                            });
                        })
                .getParent() /* cell */
            .getParent() /* row */
        .getParent() /* table */
            .mkChild("div", ["tableRow"])
                .mkChild("div", ["tableCell", "paramName"], "Tire")
                .mkSibling("div", ["tableCell"])
                    .mkChild("select", [])
                    .apply((block) => {
                        this.block.wheel[type].tireType = block;
                        block.element.addEventListener("change", (ev) => {
                            this.saveSettings();
                            this.calc();
                        });
                    })
                        .mapChilds(this.tires, (block, element) => {
                            block.mkChildExt({
                                tag: "option",
                                innerHTML: element.display,
                            });
                        })
                .getParent() /* Cell. */
            .getParent() /* Row. */
        .getParent() /* Table. */
            .mkChild("div", ["tableRow"])
                .mkChild("div", ["tableCell", "paramNameCalc"], "Wheel diameter")
                .mkSibling("div", ["tableCell"])
                    .mkChild("span", [])
                        .apply((block) => {
                            this.block.wheel[type].wheelDiameter = block;
                        })
                    .mkSibling("span", [], "mm")
                .getParent() /* Cell. */
            .getParent() /* Row. */
        .getParent() /* Table. */
        ;
    }

    new BlockElement("div", ["flexVertical"], document.body)
        .mkChild("div", ["toolBar", ])
            .mkChild("div")
                .mkChildExt({
                    tag: "img",
                    classList: ["toolBarButton"],
                    attrs: {
                        title: "Load properties.",
                        src: "img/open.png",
                    },
                    events: {
                        click: () => {this.loadSettingsFromFile();},
                    },
                })
                .mkSiblingExt({
                    tag: "img",
                    classList: ["toolBarButton"],
                    attrs: {
                        title: "Save properties.",
                        src: "img/save.png",
                    },
                    events: {
                        click: () => {this.saveSettingsToFile();},
                    },
                })
            .getParent()
            .mkSibling("div", ["flexHorizontal"])
                .mkChild("div", [], "Description")
                .mkSiblingExt({
                    tag: "input",
                    attrs: {
                        type: "text",
                        maxlength: 100,
                    },
                    style: {
                        width: "20em",
                    },
                    events: {
                        change: (ev) => {
                            this.saveSettings();
                        },
                    },
                })
                .apply((block) => {
                    this.block.description = block;
                })
            .getParent()
        .getParent()
    .getParent()
        .mkChild("div", ["table", "sections"])
    /*
     * Rear wheel parameters.
     */
    .mkChild("div", ["tableRow"])
    .apply((block) => {
        makeWheel.call(this, block, "rear");
    })
    /*
     * Frame parameters.
     */
    .mkChild("div", ["tableCell"])
    .mkChild("div", ["flexVertical"])
    .mkChild("div", ["sectionName"], "Frame")
    .mkSibling("div", ["table"])
        .mkChild("div", ["tableRow"])
            .mkChild("div", ["tableCell", "paramName"], "Chainstay")
            .mkSibling("div", ["tableCell"])
                .mkChild("input", [])
                .apply((block) => {
                    this.block.frame.chainStay = block;

                    block.mutate({
                        attrs: {
                            type: "range",
                            min: 0,
                            max: 1000,
                        },
                        style: {
                            outline: "none",
                        },
                        events: [
                            ["input", "change"],
                            (ev) => {
                                this.block.frame.chainStayDisplay.value = ev.target.value;
                                this.saveSettings();
                                this.calc();
                            }
                        ]
                    });
                    block.element.style.width  = "10em";
                    block.element.style.height = "0.5em";
                })
            .getParent()
            .mkSibling("div", ["tableCell"])
                .mkChildExt({
                    tag: "input", 
                    attrs: {
                        type: "text",
                    },
                    style: {
                        width: "4em",
                    },
                    events: [
                        ["click", "keyup"],
                        (ev) => {
                            Util.validateNumInput(ev, {
                                min: 0,
                                max: Number(this.block.frame.chainStay.element.getAttribute("max")),
                            });
                            this.block.frame.chainStay.value = ev.target.value;
                            this.saveSettings();
                            this.calc();
                        }
                    ],
                })
                .apply((block) => {
                    this.block.frame.chainStayDisplay = block;
                })
                .mkSibling("span", [], "mm")
            .getParent() /* Cell. */
        .getParent() /* Row. */
    .getParent() /* Table. */
    .getParent() /* FlexVertical. */
    .mkChild("div", ["sectionName"], "Transmission")
    .mkSibling("div", ["table"])
        .mkChild("div", ["tableRow"])
            .mkChild("div", ["tableCell", "paramName"], "Front sprocket")
            .mkSibling("div", ["tableCell"])
                .mkChild("select", [])
                .apply((block) => {
                    this.block.gear.frontSprocket = block;
                    block.element.addEventListener("change", (ev) => {
                        this.saveSettings();
                        this.calc();
                    });
                })
                    .mapChilds(this.frontSprockets, (block, element) => {
                        block.mkChildExt({
                            tag: "option",
                            innerHTML: element.display,
                        });
                    })
            .getParent() /* Cell. */
        .getParent() /* Row. */
    .getParent() /* Table. */
        .mkChild("div", ["tableRow"])
            .mkChild("div", ["tableCell", "paramName"], "Rear sprocket")
            .mkSibling("div", ["tableCell"])
                .mkChild("select", [])
                .apply((block) => {
                    this.block.gear.rearSprocket = block;
                    block.element.addEventListener("change", (ev) => {
                        this.saveSettings();
                        this.calc();
                    });
                })
                    .mapChilds(this.rearSprockets, (block, element) => {
                        block.mkChildExt({
                            tag: "option",
                            innerHTML: element.display,
                        });
                    })
            .getParent() /* Cell. */
        .getParent() /* Row. */
    .getParent() /* Table. */
        .mkChild("div", ["tableRow"])
            .mkChild("div", ["tableCell", "paramNameCalc"], "Chainlength")
            .mkSibling("div", ["tableCell"])
            .apply((block) => {
                this.block.fg.chainlength = block;
            })
            .mkSibling("div", ["tableCell"], "links")
        .getParent()
    .getParent() /* Table. */
    .getParent() /* FlexVertical. */
    .getParent(2) /* Sections table, row. */
    /*
     * Front wheel parameters.
     */
    .apply((block) => {
        makeWheel.call(this, block, "front");
    })
    .getParent() /* Sections table. */
        .mkChild("div", ["tableRow"])
    /*
     * Rear hub properties (spoke length calculator).
     */
    .apply((block) => {
        makeHub.call(this, block, "rear");
    })
    /*
     * FGC
     */
    .mkChild("div", ["tableCell"])
    .mkChild("div", ["flexVertical"])
    .mkChild("div", ["sectionName"], "FG")
    .mkSibling("div", ["table"])
        .mkChild("div", ["tableRow"])
            .mkChild("div", ["tableCell", "paramNameCalc"], "Gear ratio")
            .mkSibling("div", ["tableCell"])
            .apply((block) => {
                this.block.fg.ratio = block;
            })
        .getParent()
    .getParent()
        .mkChild("div", ["tableRow"])
            .mkChild("div", ["tableCell", "paramNameCalc"], "Skid patches")
            .mkSibling("div", ["tableCell"])
            .apply((block) => {
                this.block.fg.skidPatches = block;
            })
        .getParent()
    .getParent()
        .mkChild("div", ["tableRow"])
            .mkChild("div", ["tableCell", "paramNameCalc"], "Speed at cadence")
            .mkSibling("div", ["tableCell"])
        .getParent()
    .getParent()
    .apply((block) => {
        for (let cadence = 60; cadence <= 160; cadence += 20)
        {
            block.mkChild("div", ["tableRow"])
                .mkChild("div", ["tableCell"])
                .mkSibling("div", ["tableCell", "silver"], cadence)
                .mkSibling("div", ["tableCell"])
                .apply((block) => {
                    this.block.fg.cadence[cadence] = block;
                })
                .mkSibling("div", ["tableCell"], "km/h")
            ;
        }
    })
    .getParent() /* FlexVertical. */
    .getParent(2) /* Sections table, row. */
    /*
     * Front hub properties (spoke length calculator).
     */
    .apply((block) => {
        makeHub.call(this, block, "front");
    })
    .getParent() /* Top element. */
    .mkChild("div", ["tableRow"])
    .mkChild("div", ["tableCell"])
    .mkChild("div", ["flexVertical"])
        .mkChild("div", ["sectionName"], "Other")
        .mkSibling("div", [], "Comment")
        .mkSiblingExt({
            tag: "textarea", 
            attrs: {
                rows: 12,
            },
            events: {
                change: () => {
                    this.saveSettings();
                },
            },
        })
        .apply((block) => {
            this.block.comment = block;
        })
    ;


    new BlockElement("div", ["cinfo"], document.body, "v." + this.version + " (c) 2020-2021 Dmitrij Kobilin.");

    this.loadSettings();
    this.calc();
}

BBC.prototype.adjustValues = function(opt) {
    if (opt.param !== undefined)
    {
        if (opt.param == "faxle")
        {
            let hubWidth = this.block.wheel[opt.type].hub.width.value;
            this.block.wheel[opt.type].hub.side[opt.side].fcenter.value =
                hubWidth / 2 - this.block.wheel[opt.type].hub.side[opt.side].faxle.value;
        } else if (opt.param == "fcenter") {
            let hubWidth = this.block.wheel[opt.type].hub.width.value;
            this.block.wheel[opt.type].hub.side[opt.side].faxle.value =
                hubWidth / 2 - this.block.wheel[opt.type].hub.side[opt.side].fcenter.value;
        }
    }
}
BBC.prototype.saveSettings = function() {
    let settings = {};

    settings.version = this.settingsVersion;

    settings.description = this.block.description.value;
    settings.comment = this.block.comment.value;
    settings.wheel = {};
    ["rear", "front"].forEach((type) => {
        settings.wheel[type] = {};

        settings.wheel[type].rimTypeIndex  = this.block.wheel[type].rimType.element.selectedIndex;
        settings.wheel[type].tireTypeIndex = this.block.wheel[type].tireType.element.selectedIndex;
        settings.wheel[type].erd = this.block.wheel[type].erd.value;

        settings.wheel[type].holesIndex   = this.block.wheel[type].holes.selectedIndex;
        settings.wheel[type].crossesIndex = this.block.wheel[type].crosses.selectedIndex;

        settings.wheel[type].hub = {}
        settings.wheel[type].hub.width = this.block.wheel[type].hub.width.value;
        settings.wheel[type].hub.dhole = this.block.wheel[type].hub.dhole.value;
        settings.wheel[type].hub.side = {};
        ["left", "right"].forEach((side) => {
            settings.wheel[type].hub.side[side] = {};
            ["faxle", "fcenter", "fdiameter"].forEach((param) => {
                settings.wheel[type].hub.side[side][param] = this.block.wheel[type].hub.side[side][param].value;
            });
        });
    });
    settings.chainStay = this.block.frame.chainStay.value;
    settings.gear = {};
    console.log("INDEX", this.block.gear.frontSprocket.selectedIndex);
    settings.gear.frontSprocketIndex = this.block.gear.frontSprocket.selectedIndex;
    settings.gear.rearSprocketIndex = this.block.gear.rearSprocket.selectedIndex;

    let data = JSON.stringify(settings);
    localStorage.setItem("BBC", data);

    return data;
}
BBC.prototype.saveSettingsToFile = function() {
    var file = new Blob([this.saveSettings()], {type: "application/json"});
    var a = document.createElement("a"),
            url = URL.createObjectURL(file);
    a.href = url;
    a.download = "bigbicalc.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
}
BBC.prototype.loadSettings = function(settings) {
    if (settings === undefined)
    {
        settings = localStorage.getItem("BBC");
        if (settings === null)
            settings = {};
        else
            settings = JSON.parse(settings);

        if (settings.version == 1 || settings.version === undefined)
        {
            if (settings.wheel === undefined)
                settings.wheel = {};
            ["rear", "front"].forEach((type) => {
                if (settings.wheel[type] === undefined)
                    settings.wheel[type] = {};
                if (settings.wheel[type].rimTypeIndex === undefined)
                    settings.wheel[type].rimTypeIndex = 0;
                if (settings.wheel[type].tireTypeIndex === undefined)
                    settings.wheel[type].tireTypeIndex = 0;
                if (settings.wheel[type].erd === undefined)
                    settings.wheel[type].erd = 550;
                if (settings.wheel[type].holesIndex === undefined)
                    settings.wheel[type].holesIndex = this.holes.findIndex((holes) => {return holes.holes == 32;}); 
                if (settings.wheel[type].crossesIndex === undefined)
                    settings.wheel[type].crossesIndex = this.crosses.findIndex((crosses) => {return crosses.crosses == 3;}); 
                if (settings.wheel[type].hub === undefined)
                    settings.wheel[type].hub = {};
                if (settings.wheel[type].hub.width === undefined)
                    settings.wheel[type].hub.width = type == "rear" ? 120 : 100;
                if (settings.wheel[type].hub.dhole === undefined)
                    settings.wheel[type].hub.dhole = 2.6;
                if (settings.wheel[type].hub === undefined)
                    settings.wheel[type].hub = {};
                if (settings.wheel[type].hub.side === undefined)
                    settings.wheel[type].hub.side = {};
                ["left", "right"].forEach((side) => {
                    if (settings.wheel[type].hub.side[side] === undefined)
                        settings.wheel[type].hub.side[side] = {};
                    if (settings.wheel[type].hub.side[side].faxle === undefined)
                        settings.wheel[type].hub.side[side].faxle = type == "rear" ? 32 : 15;
                    if (settings.wheel[type].hub.side[side].fcenter === undefined)
                        settings.wheel[type].hub.side[side].fcenter = type == "rear" ? 28 : 35;
                    if (settings.wheel[type].hub.side[side].fdiameter === undefined)
                        settings.wheel[type].hub.side[side].fdiameter = 62;
                });
            });
            if (settings.chainStay === undefined)
                settings.chainStay = 400;
            if (settings.gear === undefined)
                settings.gear = {};
            if (settings.gear.frontSprocketIndex === undefined)
                settings.gear.frontSprocketIndex = this.frontSprockets.findIndex((sprocket) => {return sprocket.tooth == 46;});
            if (settings.gear.rearSprocketIndex === undefined)
                settings.gear.rearSprocketIndex = this.rearSprockets.findIndex((sprocket) => {return sprocket.tooth == 16;});
        }
    }

    if (settings.wheel !== undefined)
    {
        ["rear", "front"].forEach((type) => {
            if (settings.wheel[type] !== undefined)
            {
                if (settings.wheel[type].rimTypeIndex !== undefined)
                    this.block.wheel[type].rimType.element.selectedIndex = settings.wheel[type].rimTypeIndex;
                if (settings.wheel[type].tireTypeIndex !== undefined)
                    this.block.wheel[type].tireType.element.selectedIndex = settings.wheel[type].tireTypeIndex;
                if (settings.wheel[type].erd !== undefined)
                    this.block.wheel[type].erd.value = settings.wheel[type].erd;

                if (settings.wheel[type].holesIndex !== undefined)
                    this.block.wheel[type].holes.selectedIndex = settings.wheel[type].holesIndex;
                if (settings.wheel[type].crossesIndex !== undefined)
                    this.block.wheel[type].crosses.selectedIndex = settings.wheel[type].crossesIndex;

                if (settings.wheel[type].hub !== undefined)
                {
                    if (settings.wheel[type].hub.width !== undefined)
                        this.block.wheel[type].hub.width.element.value = settings.wheel[type].hub.width;
                    if (settings.wheel[type].hub.dhole !== undefined)
                        this.block.wheel[type].hub.dhole.element.value = settings.wheel[type].hub.dhole;
                    if (settings.wheel[type].hub.side !== undefined)
                    {
                        ["left", "right"].forEach((side) => {
                            ["faxle", "fcenter", "fdiameter"].forEach((param) => {
                                if (settings.wheel[type].hub.side[side][param] !== undefined)
                                    this.block.wheel[type].hub.side[side][param].value = settings.wheel[type].hub.side[side][param];
                            })
                        })
                    }
                }
            }
        });
    }

    if (settings.chainStay !== undefined)
    {
        this.block.frame.chainStay.value = settings.chainStay;
        this.block.frame.chainStayDisplay.value = settings.chainStay;
    }
    if (settings.gear !== undefined)
    {
        if (settings.gear.frontSprocketIndex !== undefined)
            this.block.gear.frontSprocket.selectedIndex = settings.gear.frontSprocketIndex;
        if (settings.gear.rearSprocketIndex !== undefined)
            this.block.gear.rearSprocket.selectedIndex = settings.gear.rearSprocketIndex;
    }

    if (settings.description !== undefined)
        this.block.description.value = settings.description;
    if (settings.comment !== undefined)
        this.block.comment.value = settings.comment;
}
BBC.prototype.loadSettingsFromFile = function() {
    let fileInput = document.createElement("input");
    fileInput.setAttribute("type", "file");
    fileInput.setAttribute("accept", ".json");
    fileInput.style.display = "none";
    fileInput.addEventListener("change", (ev) => {
        let reader = new FileReader();
        reader.addEventListener("loadend", (ev) => {
            let data;
            try {
                data = JSON.parse(ev.target.result);
            } catch (parseError) {
                alert("File format error" + ": " + parseError);
                return;
            }

            if (data.version === undefined)
            {
                alert("File format error (no version provided)");
                return;
            }

            if (data.version != this.settingsVersion)
            {
                alert(
                    "Settings version mismatch, loaded " +
                    data.version + ", should be " + this.version);
            }

            this.loadSettings(data);
            this.saveSettings();
            this.calc();
        });
        reader.readAsText(ev.target.files[0]);
    });
    fileInput.click();
}
BBC.prototype.sprocketRadius = function(tooth) {
    /* Inches. */
    return (1.0 / 2) / 2 / Math.sin(Math.PI / tooth);
}
BBC.prototype.round = function(num, r) {
    return Math.round(num * Math.pow(10, r)) / Math.pow(10, r);
}
BBC.prototype.calc = function(settings) {
    let wheel = {};
    ["rear", "front"].forEach((type) => {
        wheel[type] = {};
        /*
         * Wheel diameter.
         */
        wheel[type].rimDiameter = this.rims[this.block.wheel[type].rimType.element.selectedIndex].diameter;
        wheel[type].tireWidth   = this.tires[this.block.wheel[type].tireType.element.selectedIndex].width;

        wheel[type].diameter    = wheel[type].rimDiameter + 2 * wheel[type].tireWidth;
        this.block.wheel[type].wheelDiameter.innerHTML = wheel[type].diameter;
    })

    /*
     * Gear ratio.
     */
    let frontSprocketTooth = this.frontSprockets[this.block.gear.frontSprocket.element.selectedIndex].tooth;
    let rearSprocketTooth = this.rearSprockets[this.block.gear.rearSprocket.element.selectedIndex].tooth;
    let gearRatio = frontSprocketTooth / rearSprocketTooth;
    this.block.fg.ratio.innerHTML = this.round(gearRatio, 2);
    /*
     * Skid patches.
     */
    let cogDivider = rearSprocketTooth;
    while (cogDivider > 1) {
        if ((rearSprocketTooth  % cogDivider) == 0 &&
            (frontSprocketTooth % cogDivider) == 0
        ) {
            break;
        }
        cogDivider--;
    }
    let skidPatches = rearSprocketTooth / cogDivider;
    this.block.fg.skidPatches.innerHTML = skidPatches;
    if (skidPatches < 5)
        this.block.fg.skidPatches.element.classList.add("alert");
    else
        this.block.fg.skidPatches.element.classList.remove("alert");
    /*
     * Speed at cadence.
     */
    {
        let meters = Math.PI * wheel.rear.diameter / 1000 * gearRatio;
        Object.keys(this.block.fg.cadence).forEach((cadence) => {
            let speedkmh = cadence * meters / 1000 * 60;
            this.block.fg.cadence[cadence].innerHTML = this.round(speedkmh, 2);
        });
    }
    /*
     * Chainlength
     */
    {
        let chainstay = this.block.frame.chainStay.value / 10.0 / 2.54; /* inches */
        let r1 = this.sprocketRadius(rearSprocketTooth);
        let r2 = this.sprocketRadius(frontSprocketTooth);

        let length = 0;
        length += 2 * Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(chainstay, 2));
        length += 2 * Math.PI * r1 / 2;
        length += 2 * Math.PI * r2 / 2;

        this.block.fg.chainlength.innerHTML = this.round(length * 2, 1);
    }
    /*
     * Spoke length.
     */
    {
        ["rear", "front"].forEach((type) => {
            let crosses = this.crosses[this.block.wheel[type].crosses.selectedIndex].crosses;
            let holes   = this.holes[this.block.wheel[type].holes.selectedIndex].holes;
            let spokeAngle = 2 * 360 * crosses / holes;
            let spokeAngleRad = spokeAngle * Math.PI / 180;
            let holeN = spokeAngle / (360 / (holes / 2));
            let ERD      = this.block.wheel[type].erd.value;
            let holeDiameter = this.block.wheel[type].hub.dhole.value;

            this.block.wheel[type].spokeAngle.innerHTML = spokeAngle + "&#x00B0";
            this.block.wheel[type].spokeAngle.mutate({
                attrs: {title: this.round(holeN, 2) + " hole"}
            });

            ["left", "right"].forEach((side) => {
                let flangeRadius = this.block.wheel[type].hub.side[side].fdiameter.value / 2;
                let flangeCenter = this.block.wheel[type].hub.side[side].fcenter.value;

                if (true && crosses == 0)
                {
                    let length;

                    length  = Math.sqrt(Math.pow(ERD / 2 - flangeRadius, 2) + Math.pow(flangeCenter, 2));
                    length -= holeDiameter / 2;

                    this.block.wheel[type].hub.side[side].spokeLength.innerHTML = this.round(length, 1);
                } else {
                    let lengthCenter = Math.sqrt(
                        Math.pow(ERD / 2 - Math.cos(spokeAngleRad) * flangeRadius, 2) +
                        Math.pow(Math.sin(spokeAngleRad) * flangeRadius, 2)
                    );
                    let length;

                    length  = Math.sqrt(Math.pow(flangeCenter, 2) + Math.pow(lengthCenter, 2));
                    length -= holeDiameter / 2;

                    this.block.wheel[type].hub.side[side].spokeLength.innerHTML = this.round(length, 1);
                }

            });
        });
    }
}

new BBC();

