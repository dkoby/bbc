/*
 * 2020-2021 Dmitrij Kobilin.
 *
 * Nenia rajtigilo ekzistas.
 * Faru bone, ne faru malbone.
 *
 */
"use strict";

var FG = function() {
    this.version = 1;
    this.settingsVersion = 1;

    this.wheels = [
        {display: "700x23c" , width: 23, rim: 622},
        {display: "700x25c" , width: 25, rim: 622},
        {display: "700x28c" , width: 28, rim: 622},
        {display: "700x32c" , width: 32, rim: 622},
        {display: "700x35c" , width: 35, rim: 622},
    ];
    this.cons = {
        sprocket: {
            front: {
                min: 28,
                max: 80,
            },
            rear: {
                min: 11,
                max: 24,
            },
        }
    };
    this.cadence = [];
    for (let i = 60; i <= 220; i+= 20)
        this.cadence.push(i);

    this.sprockets = {};
    this.sprockets.front = [];
    for (let i = this.cons.sprocket.front.min; i <= this.cons.sprocket.front.max; i++)
        this.sprockets.front.push({display: i + "T", tooth: i,});
    this.sprockets.rear = [];
    for (let i = this.cons.sprocket.rear.min; i <= this.cons.sprocket.rear.max; i++)
        this.sprockets.rear.push({display: i + "T", tooth: i,});

    this.view = {
        sprocket: {
            front: {
                check: [],
            },
            rear: {
                check: [],
            },
        },
    };

    new BlockElement("div", ["content"], document.body)
        .mkChild("div")
            .mkChildExt({
                tag: "a",
                classlist: ["marginBlock"],
                innerHTML: "Back",
                attrs: {
                    "href": "index.html",
                },
            })
        .getParent()
    .getParent()
        .mkChild("div", ["flexHorizontal", "marginBlock"])
            .mkChild("div", ["paramName"], "Wheel")
            .mkSibling("select", [])
                .apply((block) => {
                    this.view.wheel = block;
                })
                .mapChilds(this.wheels, (block, element) => {
                    block.mkChildExt({
                        tag: "option",
                        innerHTML: element.display,
                    });
                })
                .addEvent("change", () => {
                    this.saveSettings();
                    this.rebuild();
                })
        .getParent()
    .getParent()
        .mkChild("div", ["table", "marginBlock"])
        .mapChilds(["front", "rear"], (block, type) => {
            block
                .mkChild("div", ["tableRow"])
                    .mkChild  ("div", ["tableCell", "paramName"], (type == "front" ? "Front" : "Rear") + " sprocket")
                .getParent()
                    .mapChilds(["min", "max"], (block, range) => {
                        block
                        .mkChild("div", ["tableCell"], (range == "min" ? "Min" : "Max"))
                        .mkSibling("div", ["tableCell"])
                            .mkChild("select", [])
                            .apply((block) => {
                                this.view.sprocket[type][range] = block;
                            })
                            .mapChilds(
                                type == "front" ? this.sprockets.front : this.sprockets.rear,
                                (block, element) => {
                                    block.mkChildExt({
                                        tag: "option",
                                        innerHTML: element.display,
                                    });
                                }
                            )
                            .addEvent("change", () => {
                                this.validate({
                                    control: "sprocket",
                                    type   : type,
                                    range  : range,
                                });
                                this.saveSettings();
                                this.rebuild();
                            })
                        ;
                    })
                .mkChild("div", ["tableCell"])
                    .mkChild("div", ["flexHorizontal"])
                        .mapChildsN(this.sprockets[type].length, (block, index) => {
                            {
                                block
                                    .mkChild("div", ["flexHorizontal"])
                                    .apply((block) => {
                                        this.view.sprocket[type].check.push({
                                            block: block,
                                            checkbox: null,
                                        });
                                    })
                                        .mkChild("div", [], this.sprockets[type][index].display)
                                        .mkSiblingExt({
                                            tag: "input",
                                            attrs: {
                                                "type": "checkbox",
                                            },
                                        })
                                        .apply((block) => {
                                            this.view.sprocket[type].check[index].checkbox = block;
                                        })
                                        .addEvent("change", () => {
                                            this.saveSettings();
                                            this.rebuild();
                                        })
                                ;
                            }
                        })
            ;
        })
    .getParent()
        .mkChild("div", ["flexHorizontal", "marginBlock"])
            .mkChild("div", ["paramName"], "Chainstay")
            .mkSibling("div", ["flexHorizontalV"])
                .mkChild("input", [])
                .apply((block) => {
                    this.view.chainStay = {};
                    this.view.chainStay.range = block;

                    block.mutate({
                        attrs: {
                            type: "range",
                            min: 0,
                            max: 1000,
                        },
                        style: {
                            outline: "none",
                            width: "10em",
                            height: "0.5em",
                        },
                        events: [
                            ["input", "change"],
                            (ev) => {
                                this.view.chainStay.input.value = ev.target.value;
                                this.saveSettings();
                                this.rebuild();
                            }
                        ]
                    });
                })
            .getParent()
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
                                max: Number(this.view.chainStay.range.element.getAttribute("max")),
                            });
                            this.view.chainStay.range.value = ev.target.value;
                            this.saveSettings();
                            this.rebuild();
                        }
                    ],
                })
                .apply((block) => {
                    this.view.chainStay.input = block;
                })
            .getParent()
        .getParent()
    .getParent()
        .mkChild("div", [])
        .apply((block) => {
            this.view.calc = block;
        })
            .mkChild("div", ["table", "marginBlock"])
            .apply((block) => {
                this.view.table = block;
            })
    ;

    new BlockElement("footer", [], document.body, "v." + this.version + " (c) 2020-2021 Dmitrij Kobilin.");

    this.loadSettings();
    this.rebuild();
}
FG.prototype.loadSettings = function(settings) {
    if (settings === undefined)
    {
        settings = localStorage.getItem("BBC_FG");
        if (settings === null)
            settings = {};
        else
            settings = JSON.parse(settings);

        if (settings.version == 1 || settings.version === undefined)
        {
            if (settings.wheelIndex === undefined)
                settings.wheelIndex = 2;
            if (settings.sprocket === undefined)
                settings.sprocket = {};
            ["rear", "front"].forEach((type) => {
                if (settings.sprocket[type] === undefined)
                    settings.sprocket[type] = {};
                if (settings.sprocket[type].checked === undefined)
                    settings.sprocket[type].checked = [];
                for (let i = 0; i < this.sprockets[type].length; i++)
                {
                    if (settings.sprocket[type].checked[i] === undefined)
                    {
                        let checked = false;
                        if (type == "front" && this.sprockets[type][i].tooth == 46)
                            checked = true;
                        if (type == "rear" && this.sprockets[type][i].tooth == 16)
                            checked = true;
                        settings.sprocket[type].checked[i] = checked;
                    }
                }

                ["min", "max"].forEach((range) => {
                    if (settings.sprocket[type][range] === undefined)
                    {
                        settings.sprocket[type][range] =
                            type == "front" ?
                                (range == "min" ? 44 - this.cons.sprocket.front.min: 50 - this.cons.sprocket.front.min) :
                                (range == "min" ? 13 - this.cons.sprocket.rear.min : 17 - this.cons.sprocket.rear.min )
                        ;
                    } else {
                        if (settings.sprocket[type][range] > this.sprockets[type].length)
                            settings.sprocket[type][range] = this.sprockets[type].length;
                    }
                })
            })
            if (settings.chainStay === undefined)
                settings.chainStay = 408;
        }
    }

    this.view.wheel.element.selectedIndex = settings.wheelIndex;
    this.view.chainStay.range.value = settings.chainStay;
    this.view.chainStay.input.value = settings.chainStay;
    ["rear", "front"].forEach((type) => {
        ["min", "max"].forEach((range) => {
            this.view.sprocket[type][range].element.selectedIndex = settings.sprocket[type][range];
        });
        for (let i = 0; i < this.sprockets[type].length; i++)
            this.view.sprocket[type].check[i].checkbox.element.checked = settings.sprocket[type].checked[i];
    });
}
FG.prototype.validate = function(opt) {
    if (opt.control == "sprocket")
    {
        if (opt.range == "max" &&
            this.view.sprocket[opt.type].min.element.selectedIndex > 
            this.view.sprocket[opt.type].max.element.selectedIndex)
        {
            this.view.sprocket[opt.type].min.element.selectedIndex = this.view.sprocket[opt.type].max.element.selectedIndex;
        }
        if (opt.range == "min" &&
            this.view.sprocket[opt.type].max.element.selectedIndex < 
            this.view.sprocket[opt.type].min.element.selectedIndex)
        {
            this.view.sprocket[opt.type].max.element.selectedIndex = this.view.sprocket[opt.type].min.element.selectedIndex;
        }
    }
}
FG.prototype.saveSettings = function() {
    let settings = {};

    settings.version = this.settingsVersion;

    settings.wheelIndex = this.view.wheel.element.selectedIndex;
    settings.sprocket = {};
    ["rear", "front"].forEach((type) => {
        settings.sprocket[type] = {};

        settings.sprocket[type].checked = [];
        for (let i = 0; i < this.sprockets[type].length; i++)
            settings.sprocket[type].checked[i] = this.view.sprocket[type].check[i].checkbox.element.checked;

        ["min", "max"].forEach((range) => {
            settings.sprocket[type][range] = this.view.sprocket[type][range].element.selectedIndex;
        });
    });
    settings.chainStay = this.view.chainStay.range.value;

    let data = JSON.stringify(settings);
    localStorage.setItem("BBC_FG", data);

    return data;
}
FG.prototype.rebuild = function(settings) {
    ["front", "rear"].forEach((type) => {
        for (let i = 0; i < this.sprockets[type].length; i++)
        {
            if (i < this.view.sprocket[type].min.element.selectedIndex ||
                i > this.view.sprocket[type].max.element.selectedIndex)
            {
                this.view.sprocket[type].check[i].block.hide();
                this.view.sprocket[type].check[i].checkbox.element.checked = false;
            } else {
                this.view.sprocket[type].check[i].block.show();
            }
        }
    });

    this.view.calc
        .mkChild("div", ["table", "marginBlock"])
        .apply((block) => {
            this.view.table.destroy();
            this.view.table = block;
        })
            .mkChild("div", ["tableRow"])
                .mkChild("div", ["tableCell"])
            .getParent()
            .apply((block) => {
                this.iterateSprockets((findex, rindex) => {
                    block
                    .mkChild("div", ["tableCell"])
                        .mkChildExt({
                            tag: "div",
                            innerHTML: this.sprockets.front[findex].tooth + "/" + this.sprockets.rear[rindex].tooth,
                            style: {
                                "margin" : "2px",
                                "border" : "dotted 1px gray",
                            }
                        })
                        ;

                });
            })
        .getParent()
            .mkChild("div", ["tableRow"])
                .mkChild("div", ["tableCell"], "Gear ratio")
                .mutate({
                    style: {
                        "margin" : "2px",
                        "border" : "dotted 1px gray",
                    }
                })
            .getParent()
            .apply((block) => {
                this.iterateSprockets((findex, rindex) => {
                    block
                    .mkChild("div", ["tableCell"])
                        .mkChildExt({
                            tag: "div",
                            style: {
                                "margin" : "2px",
                                "border" : "solid 1px gray",
                            }
                        })
                        .apply((block) => {
                            block.innerHTML = Calc.prototype.round(
                                this.sprockets.front[findex].tooth / this.sprockets.rear[rindex].tooth,
                                2
                            )
                        })
                    ;
                });
            })

        .getParent()
            .mkChild("div", ["tableRow"])
                .mkChild("div", ["tableCell"], "Skid patches")
                .mutate({
                    style: {
                        "margin" : "2px",
                        "border" : "dotted 1px gray",
                    }
                })
            .getParent()
            .apply((block) => {
                this.iterateSprockets((findex, rindex) => {
                    block
                    .mkChild("div", ["tableCell"])
                        .mkChildExt({
                            tag: "div",
                            style: {
                                "margin" : "2px",
                                "border" : "solid 1px gray",
                            }
                        })
                        .apply((block) => {
                            let skidPatches = Calc.prototype.skidPatches(
                                this.sprockets.front[findex].tooth,
                                this.sprockets.rear[rindex].tooth
                            );
                            block.innerHTML = skidPatches;
                            if (skidPatches < 5)
                            {
                                block.mutate({
                                    style: {
                                        "background-color": "orange",
                                    },
                                })
                            }

                        })
                    ;
                });
            })
        .getParent()
            .mkChild("div", ["tableRow"])
                .mkChild("div", ["tableCell"], "Chain length")
                .mutate({
                    style: {
                        "margin" : "2px",
                        "border" : "dotted 1px gray",
                    }
                })
            .getParent()
            .apply((block) => {
                this.iterateSprockets((findex, rindex) => {
                    block
                    .mkChild("div", ["tableCell"])
                    .apply((block) => {
                        let length = Calc.prototype.chainLength(
                            this.sprockets.front[findex].tooth,
                            this.sprockets.rear[rindex].tooth,
                            this.view.chainStay.range.value
                        );
                        block.innerHTML = Calc.prototype.round(length, 1);
                    })
                    ;
                });
            })
        .getParent()
            .mkChild("div", ["tableRow"])
                .mkChild("div", ["tableCell"], "Speed at cadence")
                .mutate({
                    style: {
                        "margin" : "2px",
                        "border" : "dotted 1px gray",
                        "white-space": "pre-wrap",
                    }
                })
            .getParent()
        .getParent()
            .mapChilds(this.cadence, (block, cadence) => {
                block
                .mkChild("div", ["tableRow"])
                    .mkChild("div", ["tableCell"])
                        .mkChild("div", [], cadence)
                        .mutate({
                            style: {
                                "display": "flex",
                                "justify-content": "flex-end",
                                "margin": "0px",
                            },
                        })
                    .getParent()
                .getParent()
                .apply((block) => {
                    this.iterateSprockets((findex, rindex) => {
                        block
                        .mkChild("div", ["tableCell"])
                            .mkChildExt({
                                tag: "div",
                                style: {
                                    "margin" : "2px",
                                    "border" : "solid 1px gray",
                                    "cursor" : "pointer",
                                }
                            })
                            .apply((block) => {
                                block.view = {};
                                block.view.selected = false;
                                block.addEvent("click", (ev) =>  {
                                    block.view.selected = block.view.selected ? false : true;
                                    if (block.view.selected)
                                        ev.target.style["background-color"] = "cyan";
                                    else
                                        ev.target.style["background-color"] = "inherit";
                                })

                                let wheel = this.wheels[this.view.wheel.element.selectedIndex];

                                let speed = Math.floor(
                                    Calc.prototype.speed(
                                        this.sprockets.front[findex].tooth,
                                        this.sprockets.rear[rindex].tooth,
                                        wheel.width * 2 + wheel.rim,
                                        cadence,
                                    )
                                );

                                block.innerHTML = speed + " km/h";

                                /* Color. */
                                if (false)
                                {
                                    let min = 10;
                                    let max = 60;
                                    let range = max - min;

                                    let cspeed = speed;
                                    if (cspeed > max)
                                        cspeed = max;
                                    if (cspeed < min)
                                        cspeed = min;

                                    cspeed -= min;

                                    let r = Math.floor(cspeed / range * 100)  + 155;
                                    let g = Math.floor(1 - cspeed / range * 100) + 155;

                                    let color = [r, g, 50];

                                    block.mutate({
                                        style: {
                                            "font-weight": "bold",
                                            "background-color": "rgba(" + color.join() + ", 0.5)",
                                        },
                                    });
                                }
                            })
                        ;
                    });
                })
            })
    ;
}
FG.prototype.iterateSprockets = function(func) {
    for (let f = 0; f < this.sprockets.front.length; f++)
    {
        if (!this.view.sprocket.front.check[f].checkbox.element.checked)
            continue;
        for (let r = 0; r < this.sprockets.rear.length; r++)
        {
            if (!this.view.sprocket.rear.check[r].checkbox.element.checked)
                continue;
            func.call(this, f, r)
        }
    }
}

new FG();

