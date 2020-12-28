/*
 * 2020-2021 Dmitrij Kobilin.
 *
 * Nenia rajtigilo ekzistas.
 * Faru bone, ne faru malbone.
 *
 */
"use strict";

/*
 *
 */
var BlockElement = function(tag, classList, htmlParentElement, innerHTML, events, blockParent) {
    this.element = document.createElement(tag ? tag : "div");

    this.blockParent = blockParent;

    if (htmlParentElement)
    {
        htmlParentElement.appendChild(this.element);
        this.htmlParentElement = htmlParentElement;
    }

    let opt = {
        classList: classList,
        innerHTML: innerHTML,
        events: events,
    }

    this.mutate(opt);
}
BlockElement.prototype.mkChild = function(tag, classList, innerHTML, events) {
    if (Object.getPrototypeOf(this).constructor === BlockElementExt)
    {
        return this.mkChildExt({
            tag: tag,
            classList: classList,
            innerHTML: innerHTML,
            events: events,
        });
    } else {
        return new this.constructor(tag, classList, this.element, innerHTML, events, this);
    }
}
BlockElement.prototype.mkSibling = function(tag, classList, innerHTML, events) {
    return this.getParent().mkChild(tag, classList, innerHTML, events);
}
BlockElement.prototype.getParent = function(n) {
    let blockParent;

    if (n === undefined)
        return this.blockParent;

    blockParent = this.blockParent;
    while (--n)
        blockParent = blockParent.blockParent;

    return blockParent;
}
BlockElement.prototype.getMarkup = function() {
    let markup;
    for (let blockParent = this;
            blockParent !== undefined;
            blockParent = this.blockParent)
    {
        markup = blockParent.markup;
    }
    if (markup === undefined)
        markup = {};

    return markup;
}
BlockElement.prototype.mapChilds = function(array, iterator) {
    if (array && iterator)
        array.forEach(iterator.bind(this, this));
    return this;
}
BlockElement.prototype.mapNchilds = function(n, iterator) {
    if (n > 0 && iterator)
    {
        for (let index = 0; index < n; index++)
            iterator.call(this, this, index);
    }
    return this;
}
BlockElement.prototype.apply = function(apply) {
    apply.call(this, this);
    return this;
}
BlockElement.prototype.mutate = function(opt) {
    opt = opt || {};

    if (opt.classList)
    {
        let classList = []
        for (let i = 0; i < this.element.classList.length; i++)
            classList.push(this.element.classList.item(i));
        classList.forEach((c) => {
            this.removeClass(c);
        });
        opt.classList.forEach((c) => {
            this.addClass(c);
        });
    }
    if (opt.classListAdd)
    {
        opt.classListAdd.forEach((c) => {
            this.addClass(c);
        });
    }
    if (opt.classListRemove)
    {
        opt.classListRemove.forEach((c) => {
            this.addRemove(c);
        });
    }

    if (opt.innerHTML !== undefined && opt.innerHTML !== null)
        this.setInner(opt.innerHTML);

    if (opt.attrs)
    {
        Object.keys(opt.attrs).forEach((key) => {
            this.element.setAttribute(key, opt.attrs[key]); 
        });
    }
    if (opt.element)
    {
        Object.keys(opt.element).forEach((key) => {
            this.element[key] = opt.element[key]; 
        });
    }
    if (opt.events)
    {
        if (Array.isArray(opt.events))
        {
            opt.events[0].forEach((ev) => {
                this.element.addEventListener(ev, opt.events[1]); 
            });
        } else {
            Object.keys(opt.events).forEach((key) => {
                this.element.addEventListener(key, opt.events[key]); 
            });
        }
    }
    if (opt.style)
    {
        Object.keys(opt.style).forEach((key) => {
            this.element.style[key] = opt.style[key];
        });
    }
    if (opt.markup)
    {
        let markup = this.getMarkup();
        if (markup === undefined)
        {
            this.markup = {};
            markup = this.markup;
        }

        Object.keys(opt.markup).forEach((key) => {
            markup[key] = opt.markup[key];
        });
    }
    return this;
}
BlockElement.prototype.shown = function() {
    return !this.element.classList.contains("displayNone");
}
BlockElement.prototype.hide = function() {
    this.element.classList.add("displayNone");
    return this;
}
BlockElement.prototype.show = function() {
    this.element.classList.remove("displayNone");
    return this;
}
BlockElement.prototype.toggle = function() {
    if (this.shown())
        this.hide();
    else
        this.show();
    return this;
}
BlockElement.prototype.addClass = function(value) {
    this.element.classList.add(value);
    return this;
}
BlockElement.prototype.removeClass = function(value) {
    this.element.classList.remove(value);
    return this;
}
BlockElement.prototype.disable = function() {
    this.element.setAttribute("disabled", "");
    return this;
}
BlockElement.prototype.enable = function() {
    this.element.removeAttribute("disabled");
    return this;
}
BlockElement.prototype.setInner = function(value, ref) {
    this.element.innerHTML = value;
}
BlockElement.prototype.setValue = function(value, ref) {
    this.element.value = value;
}
Object.defineProperty(BlockElement.prototype, "innerHTML", {
    set: function innerHTML(value) {
        this.setInner(value);
    },
    get: function () {
        return this.element.innerHTML;
    },
});
Object.defineProperty(BlockElement.prototype, "value", {
    set: function value(v) {
        this.setValue(v);
    },
    get: function () {
        return this.element.value;
    },
});
Object.defineProperty(BlockElement.prototype, "selectedIndex", {
    set: function innerHTML(value) {
        this.element.selectedIndex = value;
    },
    get: function () {
        return this.element.selectedIndex;
    },
});
BlockElement.prototype.destroy = function() {
    if (this.htmlParentElement && this.htmlParentElement.contains(this.element))
        this.htmlParentElement.removeChild(this.element);
}
BlockElement.prototype.addEvent = function(eventName, command) {
    this.element.addEventListener(eventName, command);
    return this;
}
BlockElement.prototype.mkChildExt = function(opt) {
    opt.htmlParentElement = this.element;
    opt.blockParent = this;

    return new BlockElementExt(opt);
}
BlockElement.prototype.mkSiblingExt = function(opt) {
    return this.getParent().mkChildExt(opt);
}
/*
 *
 */
var BlockElementExt = function(opt) {
    this.opt = opt;

    BlockElement.call(this,
            opt.tag,
            opt.classList,
            opt.htmlParentElement,
            opt.innerHTML,
            opt.events,
            opt.blockParent);

    this.mutate(opt);
}
BlockElementExt.prototype = Object.create(BlockElement.prototype);
BlockElementExt.prototype.constructor = BlockElementExt;

