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

    //import("DOMSMack/helpers.js");

    var __el_list = [],

    __el_evt_map = {};

    // Our main API constructor
    // Sets up the Array-like object
    function Api(selector){
        if (typeof selector === "string") {
            this.els = __slice(document.querySelectorAll(selector));
        } else if (selector instanceof Api || selector instanceof NodeList) {
            this.els = __slice(selector);

        } else if ((selector.nodeType && selector.nodeType === 1) || 
                    selector === window || selector === document) {
            this.els = [selector];
        }

        this.el = this.els[0];
        __arrayify(this, this.els);
    }

    var proto = Api.prototype;

    // Make Api Array-like
    __arrayify(Api);

    // ## is ##
    // Returns true if _el_ (see _Api_ above) has a tagName matching one of the 
    // tags (or the tag if only one) or having a type matching the passed in 
    // type pseudo-tag (eg, ':text')
    // ### Args:
    //  * _el {DOMElement}_: the element to test against _tag_
    //  * _tag {String}_: the tag, pseudo-tag or comma-separated list of 
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

    // Add is to our Api object
    proto.is = function (tag){
        // Shortcut for when there is only one element
        if (this.length === 1) return is(this.el, tag);
        // return true if any of our elements (this.els)
        // is a match
        return __any(this.els, function (el) {
            if (is(el, tag)) isit = true;
        }, this);
    };

    //import("DOMSmack/events.js")

    //import("DOMSmack/attributes.js")

    // Give Api an innerHTML proxy
    proto.html = function (html) {
        __each(this.els, function (el) { el.innerHTML = html });
        return this;
    };

    // Api wrapper function -- think $() from jQuery
    function __init(selector) { 
        return new Api(selector);
    }

    //Expose our initializer function as the public DOMSmack or $ function.
    return __init;
})();