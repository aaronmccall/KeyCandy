// **DOMSmack** (c) 2011 Aaron McCall.

// A lightweight, minimalist set of DOM and event tools that was
// created to replace jQuery in KeyCandy's standalone version.
//
// Many concepts/approaches here borrowed from [jQuery](http://jquery.com), 
// [Zepto](http://zeptojs.com) and DailyJS's 
// [Let's Make a Framework](http://dailyjs.com/tags.html#lmaf)
//
// The [Javascript Russian Doll](http://cl.ly/32401n1d3M2A3g2K410c) concept
// is also heavily used throughout to provide optimized functions/methods 
// for the current environment.
var DOMSmack = (function () {

    //import("DOMSmack/helpers.js");

    var __el_list = [],

    __el_evt_map = {};

     function api(selector){
    function Api(selector){
        if (typeof selector === "string") {
            this.els = __slice(document.querySelectorAll(selector));
            this.length = this.els.length;
            if (this.els.length == 1) {
                this[0] = this.el = this.els[0];
            } else {
                __each(this.els, function (el, idx) {
                    this[idx] = el;
                }, this);
            }
        } else if (selector.nodeType || selector === window || selector === document) {
            this.els = [selector];
            this.el = this[0] = selector;
            this.length = 1;
        }
    }

    var proto = Api.prototype;

    // Having an integer `length` property and a `splice` method makes
    // Api an [Array-like object](http://cl.ly/3k0i3n0A2R2h2t303B0x)
    proto.length = 0;
    proto.splice = [].splice;

    // ## is ##
    // Returns true if `el` (see `Api` above) has a tagName matching one of the 
    // tags (or the tag if only one) or having a type matching the passed in 
    // type pseudo-tag (eg, ':text')
    // ### Args:
    //  * `el {DOMElement}`: the element to test against `tag`
    //  * `tag {String}`: the tag, pseudo-tag or comma-separated list of 
    //     tags/pseudo-tags to test against
    function is(el, tag) {
        var _is = false,
            _elTag = __lc(el.tagName),
            _lTag = __lc(tag),
            tagArray;
        if (~tag.indexOf(',')) {
            tagArray = _lTag.split(/,\s*/g);
            for (var i=0, len=tagArray.length; i<len; i++) {
                if (tagArray[i] === _elTag) return true;
                if (tagArray[i].indexOf(':') === 0) {
                    if (tagArray[i].substr(1) === __lc(el.type)) return true;
                }
            }
        }
        return (_lTag === _elTag);
    }

    proto.is = function (tag){
        if (this.length === 1) return is(this.el, tag);

    };

    //import("DOMSmack/events.js")

    function hasClass(el, cls) { return classRE(cls).test(el.className); }

    proto.hasClass = function(cls) { return hasClass(this.el, cls) };

    function addClass(el, cls) {
        var classList;
        if (!hasClass(el, cls)) {
            classList = el.className.split(/\s+/g);
            classList.push(cls);
            el.className = classList.join(' ');
        }
    }

    proto.addClass = function(cls){
        for (var i=0; i<this.length; i++) addClass(this[i], cls);
        return this;
    };

    function removeClass(el, cls) {
        el.className = el.className.replace(classRE(cls), '').replace(/^\s+|\s+$/g, '');
    }

    proto.removeClass = function(cls) {
        for (var i=0; i<this.length; i++) removeClass(this[i], cls);
        return this;
    };

    function toggleClass(el, cls) {
        if (hasClass(el, cls)) {
            removeClass(el, cls);
        } else {
            addClass(el, cls);
        }
    }

    proto.toggleClass = function(cls) {
        for (var i=0; i<this.length; i++) toggleClass(this[i], cls);
        return this;
    };


    function hasGetAttribute() {
        var div = document.createElement('div');
        div.innerHTML = '<a href="/example"></a>';

        if (div.childNodes[0].getAttribute('href') === '/example') {
            hasGetAttribute = function() { return true };
            return true;
        }

        // Helps IE release memory associated with the div
        div = null;
        hasGetAttribute = function() { return false };
        return false;
    }

    function setAttr(el, attr, val) {
        var newFunc = hasGetAttribute()
            ? function (el, attr, val) {
                return el.setAttribute(attr, val);
            }
            : function (el, attr, val) {
                if (propertyFix[name]) {
                    name = propertyFix[name];
                }

                if (name === 'value' && element.nodeName === 'BUTTON') {
                    return element.getAttributeNode(name).nodeValue = value;
                }

                return element.setAttribute(name, value);
            };
        setAttr = newFunc;
        return newFunc(el, attr, val);
    }

    function getAttr(el, attr) {
        // Build a customized attribute getter for the current browser.
        var newFunc = hasGetAttribute() ?
            // Browser supports standard attribute access
            function (el, attr) {
                return el.getAttribute(attr);
            } : 
            function (el, attr) {
                // Swap HTML attribute name for DOM property name, if required.
                if (propertyFix[attr]) {
                    attr = propertyFix[attr];
                }

                // Old IE versions require the extra param for some attributes.
                if (getAttributeParamFix[attr]) {
                    return el.getAttribute(attr, 2);
                }

                // Old IE versions do weird things with button.value.
                if (attr === 'value' && el.nodeName === 'BUTTON') {
                  return el.getAttributeNode(attr).nodeValue;
                }

                // Default to standard DOM API
                return el.getAttribute(attr);
            };
        // Replace `getAttr` with the function that is optimized for the browser
        // for all calls after the initial one.
        getAttr = newFunc;
        // On the intial call we need to return a call to `newFunc`
        return newFunc(el, attr);
    }

    function removeAttr(el, attr) {
        var newFunc = hasGetAttribute()
            ? function (el, attr) {
                if ('1-9'.indexOf(''+el.nodeType) < 0) return;
                setAttr(el, attr, '');
                el.removeAttributeNode(el.getAttributeNode(attr));
            }
            : function (el, attr) {
                el.removeAttribute(attr);
            };
        removeAttr = newFunc;
        return newFunc(el, attr);
    }

    proto.attr = function(name, value){
        if (value === undefined) return getAttr(this.el, name) ;

        for (var i=0; i<this.length; i++) {
            if (value === null) {
                removeAttr(this[i], name);
            } else {
                setAttr(this[i], name, value);
            }
        }
        return this;
    };

    proto.prop = function(name, value){
        var prop = (propertyFix[name]) ? propertyFix[name] : name;
        if (prop in this.el) {
            if (typeof value === undefined ) return this.el[prop];
            this.el[prop] = value;
        }
    };

    proto.html = function(html) {
        for (var i=0; i<this.length; i++) {
            this[i].innerHTML = html;
        }
        return this;
    };


    __init = function(selector) { 
        return new api(selector) 
    }

    //Expose our initializer function as the public DOMSmack or $ function.
    return __init;
})();