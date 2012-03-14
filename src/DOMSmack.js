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

        return __any(this.els, function (el) {
            if (is(el, tag)) isit = true;
        }, this);

    };

    //import("DOMSmack/events.js")

    //import("DOMSmack/attributes.js")

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