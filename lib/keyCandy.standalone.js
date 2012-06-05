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

    // DOMSmack helpers
    // source: src/DOMSmack/helpers.js

    // Get a shorter handle to Array's prototype (helps with minification too)
    var ArrProto = Array.prototype,
        nativeBind = Function.prototype.bind,
        breaker = {};

    // ## __arrayify ##
    // Having an integer _length_ property and a _splice_ method makes
    // an instance an [Array-like object](http://cl.ly/3k0i3n0A2R2h2t303B0x)
    // ### Args:
    // _obj {Object}_: the object to extend to be Array-like
    // _items {Array-like object}_: items to add as the indexed 'array' items
    // _append {Boolean}_: should we append _items_ to the end of any existing items?
    function __arrayify(obj, items, append) {
        if (obj.prototype && (!obj.length || !obj.splice)) {
            var proto = obj.prototype;
            proto.splice = [].splice;
            proto.length = 0;
        }
        if (!items || !items.length) return;
        items = (append ? __slice(obj) : []).concat(__slice(items));
        __each(items, function (item, idx) {
            obj[idx] = item;
        });
        obj.length = items.length;
    }

    // ## __any ##
    // Array.some-like functionality provided either by the native method
    // or by an ___each_-based fallback
    // ### Args:
    // _array {Array}_: the array we are operating on
    // _callback {Function}_: the tester function to call on each member of _array_
    // _context {Object}_: the [optional] _this_ object for _callback_
    function __any(array, callback, context) {
        var newFunc = (ArrProto.some) ?
            function (array, callback) { 
                return ArrProto.some.call(array, callback, context)
            } :
            function (array, callback, context) { 
                var result = false;
                __each(array||[], function (val, idx, list) {
                    if (result || (result = callback.call(context, val, idx, list))) return breaker;
                }, context);
                return !!result;
            }
        __any = newFunc;
        return newFunc(array, callback, context);
    }

    // ## __each ##
    // Array.forEach-like functionality provided either by the native method
    // itself or a for-based fallback.
    // ### Args:
    // _array {Array}_: the array we are operating on
    // _callback {Function}_: the function to call on each member of _array_
    // _context {Object}_: the [optional] _this_ object for _callback_
    function __each(array, callback, context) {
        var newFunc = (typeof ArrProto.forEach == "function") ?
        function (array, callback, context) {
            ArrProto.forEach.call(array, callback, context);
        } :
        function (array, callback, context) {
            for (var i = 0, len = array.length; i<len; i++) {
                if (i in array && callback.call(context, array[i], i, array)===breaker) return;
            }
        };
        __each = newFunc;
        return newFunc(array, callback, context);
    }

    // ## __indexOf ##
    // Array.indexOf-like functionality provided either by the native method
    // itself or a for-based fallback.
    // ### Args:
    // _array {Array}_: the array we are operating on
    // _val {multiple}_: value (any type is allowed) to look for in _array_
    function __indexOf (array, val) {
        var newFunc = (typeof ArrProto.indexOf === "function") ?
            function(array, val) {
                return ArrProto.indexOf.call(array, val);
            } :
            function(array, val) {
                for (var i=0, j=array.length; i<j; i++) {
                    if (array[i] === val) return i;
                }
                return -1;
            };
        __indexOf = newFunc;
        return newFunc(array, val);
    }

    // ## __slice ##
    // Quick and dirty wrapper around [].slice that allows
    // us to convert Array-like objects into actual Arrays
    // ### Args:
    // * _obj {multiple}_: can be a String, Object or Array
    // * _start {Integer}_: optional start index (0-based)
    // * _stop {Integer}_: optional stop index (defaults to end)
    function __slice(obj, start, stop) { return ArrProto.slice.call(obj, start, stop); }

    // ## __bind ##
    // Shim for ES5 Function.bind
    // ### Args:
    // * _obj {Object}_: the _this_ context to bind to _func_
    // * _func {Function}_: the function to bind the context to
    function __bind(obj, func) { 
        var bindArgs = __slice(arguments, 2);
        bindArgs.unshift(obj);
        if (typeof func !== 'function' || typeof func.call !== 'function' ) {
            throw Error('func is not a function');
        }
        return (func.bind && nativeBind && nativeBind === func.bind) ? 
            nativeBind.apply(func, bindArgs) : 
            function() { func.apply && func.apply(obj, bindArgs.concat(__slice(arguments))); }
    }

    // ## __lc ##
    // Shortcut for String.toLowerCase
    function __lc(string) { return (''+string).toLowerCase(); }

    // ## classRE ##
    // Simple className matcher builder
    function classRE(cls) { return new RegExp("\\b" + cls + "\\b") }

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

    // ## DOMSmack Events ##
    //
    // *source: src/DOMSmack/events.js*

    // ## bind ##
    // Function to setup event handlers on elements
    // ### Args:
    //  * _el {DOMElement}_: the element to add event listener to
    //  * _type {String}_: the event type to add a listener for
    //  * _callback {Function}_: called when event fires
    function bind(el, type, callback) {
        var newFunc = (el.addEventListener) ?
            function (el, type, callback) {
                el.addEventListener(type, callback, false);
                return callback;
            } :
            function (el, type, callback) {
                var new_callback = function () { callback.call(el, window.event); };
                el.attachEvent('on'+type, new_callback);
                return new_callback;
            };

        bind = newFunc;
        return newFunc(el, type, callback);
    }


    proto.bind = function(type, callback){
        var elKey;
        __each(this.els, function (el, idx) {
            if (__indexOf(__el_list, el) < 0) __el_list.push(el);
            elKey = __indexOf(__el_list, el);
            __el_evt_map[elKey] = __el_evt_map[elKey] || {};
            __el_evt_map[elKey][type] = __el_evt_map[elKey][type] || [];
            if (__indexOf(__el_evt_map[elKey][type], callback) < 0) {
                bind(el, type, callback);
                __el_evt_map[elKey][type].push(callback);
            }
        }, this);
        return this;
    };

    function unbind(el, type, handle) {
        var newFunc = (document.removeEventListener) ?
        function( el, type, handle ) {
            if ( el.removeEventListener ) el.removeEventListener( type, handle, false );
        } : 
        function( el, type, handle ) {
            if ( el.detachEvent ) el.detachEvent( "on" + type, handle );
        };
        unbind = newFunc;
        newFunc(el, type, handle);
    }

    proto.unbind = function(type, handle) {
        __each(this.els, function (el) { unbind(el, type, handle); });
        return this;
    };

    function trigger(el, evt){
        if (evt in el) el[evt]();
        return this;
    }

    proto.trigger = function(evt) {
        __each(this.els, function (el) { trigger(el, evt); });
        return this;
    };


    proto.one = function (type, func) {
        __each(this.els, function (el) {
            var callback = __bind(el, func),
                handle,
                wrapper = function (event) {
                    callback(event);
                    unbind(el, type, handle);
                };
            handle = bind(el, type, wrapper);
        });
    }

    // DOMSmack attribute accessors and manipulators
    // source: src/DOMSmack/attributes.js

    // Map HTML attribute names to DOM property names
    var propertyFix = {
        tabindex:        'tabIndex',
        readonly:        'readOnly',
        'for':           'htmlFor',
        'class':         'className',
        maxlength:       'maxLength',
        cellspacing:     'cellSpacing',
        cellpadding:     'cellPadding',
        rowspan:         'rowSpan',
        colspan:         'colSpan',
        usemap:          'useMap',
        frameborder:     'frameBorder',
        contenteditable: 'contentEditable'
    },

    // Old IE versions require an additional parameter to getAttribute
    getAttributeParamFix = { width: 1, height: 1, src: 1, href: 1 };

    // ## hasGetAttribute ##
    // Determines whether the current environment supports proper getAttribute 
    // DOM method. Rewrites itself on first call to simply return true or false
    // based on the results of the initial test.
    function hasGetAttribute() {
        var div = document.createElement('div'), newFunc, hasGetAttr;
        div.innerHTML = '<a href="#"></a>';

        // Test to see if our current browser truly supports getAttribute
        if (div.childNodes[0].getAttribute('href') === '#') {
            //Browser properly applies getAttribute
            newFunc = function() { return true; };
            hasGetAttribute = newFunc;
            return true;
        }

        // Helps IE release memory associated with the div
        div = null;
        // Browser DOES NOT properly apply getAttribute
        newFunc = function() { return false; };
        hasGetAttribute = newFunc;
        return false;
    }

    // ## setAttr ##
    // Sets attribute _attr_ to value _val_ on element _el_
    // Rewrites itself to an optimized code path depending on browser's support
    // for standard DOM methods
    // ### Args:
    // * _el {DOM Element}_: the element to set an attribute value on
    // * _attr {String}_: the attribute name
    // * _val {String}_: the value to assign to the attribute
    function setAttr(el, attr, val) {
        var newFunc = hasGetAttribute() ? 
            function (el, attr, val) {
                return el.setAttribute(attr, val);
            } : 
            function (el, attr, val) {
                if (propertyFix[attr]) attr = propertyFix[attr];

                if (attr === 'value' && element.nodeAttr === 'BUTTON') {
                    return element.getAttributeNode(attr).nodeValue = value;
                }

                return element.setAttribute(attr, value);
            };
        setAttr = newFunc;
        return newFunc(el, attr, val);
    }

    // ## getAttr ##
    // Retrieves the current value of attribute _attr_ on element _el_
    // ### Args:
    // * _el {DOM Element}_: the element to get the attribute value from
    // * _attr {String}_: the attribute name
    function getAttr(el, attr) {
        // Build a customized attribute getter for the current browser.
        var newFunc = hasGetAttribute() ?
            // Browser supports standard attribute access
            function (el, attr) { return el.getAttribute(attr); } : 
            function (el, attr) {
                // Swap HTML attribute name for DOM property name, if required.
                if (propertyFix[attr]) attr = propertyFix[attr];

                // Old IE versions require the extra param for some attributes.
                if (getAttributeParamFix[attr]) return el.getAttribute(attr, 2);

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

    // ## removeAttr ##
    // Removes an attribute from an element
    // ### Args:
    // * _el {DOM Element}_: the element to remove the attribute from
    // * _attr {String}_: the attribute name
    function removeAttr(el, attr) {
        var newFunc = hasGetAttribute() ? 
            function (el, attr) {
                if (!el.nodeType || !~'19'.indexOf(''+el.nodeType)) return;
                setAttr(el, attr, '');
                el.removeAttributeNode(el.getAttributeNode(attr));
            } : 
            function (el, attr) { el.removeAttribute(attr); };
        removeAttr = newFunc;
        return newFunc(el, attr);
    }

    // ## Api.prototype.attr ##
    // A simplified clone of jQuery's $().attr()
    // ### Args:
    // _name {String}_: the attribute name
    // _value {multiple}_: the [optional] value to set
    proto.attr = function (name, value) {
        // If called with only one arg, return the attribute value
        if (value === undefined) return getAttr(this.el, name) ;

        __each(this.els, function (el) {
            if (value === null) {
                // Otherwise, if _value_ is explicitly null, remove the attribute.
                removeAttr(el, name);
            } else {
                // If not, set it to the new value.
                setAttr(el, name, value);
            }
        });
        // Chainify!
        return this;
    };


    // ## prop ##
    // Property accessor for DOM elements:
    // If value is undefined, return the current value.
    // If value is defined, set named property to the new value.
    // ### Args:
    // _el {DOM Element}_: the element to access the property on
    // _name {String}_: the property name
    // _value {multiple}_: the [optional] value to set
    function prop(el, name, value) {
        var prop = (propertyFix[name]) ? propertyFix[name] : name;
        if (prop in el) {
            // If no value passed in, then return current value
            if (typeof value === undefined ) return el[prop];
            // else set to new value
            el[prop] = value;
            return this;
        }
    };


    // ## Api.prototype.prop ##
    // _Api_-compatible interface to _prop_
    // _name {String}_: the property name
    // _value {multiple}_: the [optional] value to set
    proto.prop = function (name, value) {
        // If no value passed in, return the current value for the first element
        if (value === undefined) return prop(this.el, name);
        // else set the value on all elements in the collection
        __each(this.els, function (el) { prop(el, name, value); }, this);
        return this;
    };


    // BEGIN class manipulation/accessor functions/methods

    // ## classRE ##
    // Simple className matcher builder
    function classRE(cls) { return new RegExp("\\b" + cls + "\\b") }

    // ## hasClass ##
    // Does _el_ have the given class name (_cls_)?
    // ### Args:
    // _el {DOM Element}_: the element to check for the class name
    // _cls {String}_: the class name to look for
    function hasClass(el, cls) { 
        return classRE(cls).test(el.className); 
    }

    // ## Api.prototype.hasClass ##
    // Returns true if any of the elements in our collection has the class.
    // ### Args:
    // _cls {String}_: the class name to look for
    proto.hasClass = function (cls) { 
        return __any(this.els, function (el) { return hasClass(el, cls) }, this);
    };

    // ## addClass ##
    // Add the given class name to _el_.
    // ### Args:
    // _el {DOM Element}_: the element to check for the class name
    // _cls {String}_: the class name to add
    function addClass(el, cls) {
        var classList;
        if (!hasClass(el, cls)) {
            classList = (el.className||"").split(/\s+/g);
            classList.push(cls);
            el.className = classList.join(' ');
        }
    }

    // ## Api.prototype.addClass ##
    // Returns true if any of the elements in our collection has the class.
    // ### Args:
    // _cls {String}_: the class name to add
    proto.addClass = function (cls) {
        __each(this.els, function (el) { addClass(el, cls) }, this);
        return this;
    };

    // ## removeClass ##
    // Remove the given class name (if it exists) from _el_.
    // ### Args:
    // _el {DOM Element}_: the element to check for the class name
    // _cls {String}_: the class name to remove
    function removeClass(el, cls) {
        el.className = el.className.replace(classRE(cls), '').replace(/^\s+|\s+$/g, '');
    }

    // ## Api.prototype.removeClass ##
    // Remove the given class name (if present) from all of the elements in our collection
    // ### Args:
    // _cls {String}_: the class name to remove
    proto.removeClass = function (cls) {
        __each(this.els, function (el) { removeClass(el, cls) }, this);
        return this;
    };

    // ## toggleClass ##
    // Remove the given class name (if it exists) from _el_ else add it.
    // ### Args:
    // _el {DOM Element}_: the element to check for the class name
    // _cls {String}_: the class name to remove or add
    function toggleClass(el, cls) {
        return (hasClass(el, cls)) ? removeClass(el, cls) : addClass(el, cls)
    }

    // ## Api.prototype.toggleClass ##
    // Remove (if present) the given class name from or add it to (if not present)
    // all of the elements in our collection.
    // ### Args:
    // _cls {String}_: the class name to remove
    proto.toggleClass = function (cls) {
        __each(this.els, function (el) { toggleClass(el, cls); });
        return this;
    };

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

var KEYCANDY_DOM_LIB = DOMSmack;

// (c) 2011 Aaron McCall.

// Contributors: Beau Sorenson

// [MIT license](http://creativecommons.org/licenses/MIT/).

// Key Candy makes your web app melt in your hands not on your mouse!
// Provides tooltips for elements with accesskey attributes and focuses/activates
// elements with an accesskey in a standardized, cross-browser, cross-platform way.

KeyCandy = (function($, undefined){
    var agent = navigator.userAgent,
    os = /Linux|Windows|Macintosh/.exec(agent).toString().toLowerCase(),
    browser = (agent.indexOf('WebKit')>-1) ? 'webkit' : /Gecko|MSIE|Opera/.exec(agent).toString().toLowerCase(),
    os_browser_map = { macintosh: 91, linux: 17, windows: 17 },
    target,
    _class = 'keycandy',
    _remove_class = 'removeClass',
    _default_parent = 'body',
    // Set accesskey tooltip control key to default for OS: CTRL for Windows and Linux and ⌘ for Mac Os
    _control_key = (os_browser_map[os]) ? os_browser_map[os] : 17,
    // Don't require the control key to activate the accesskey'd elements
    _req_control_key = false,
    _valid_mod_keys = { '⇧': 16, shift: 16, option: 18, '⌥': 18, alt: 18, ctrl: 17, control: 17, command: 91, '⌘': 91 },
    //Set modifier key that allows activating accesskey'd elements while a 'typeable' element has focus
    _mod_key = 'alt',
    // Store active modifier keys here
    _active_mods = {16: false, 17: false, 18: false, 91: false },
    attr_key_map = {'windows': 'ctrl', 'linux': 'ctrl', 'macintosh': String.fromCharCode(parseInt('2318',16))},
    // Handler for keydown events: sets active modifier keys and triggers appropriate events for accesskey'd elements
    handle_keydown = function(event){
        var _target = event.target,
            $class_target = $(target||_default_parent),
            _tag = _target.tagName.toLowerCase(),
            $target = $(_target),
            _code = event.keyCode,
            // Is this a keydown that we may need to handle?
            _accesskey_event = (_active_mods[_control_key]||!_req_control_key),
            // Is the current key code a valid accesskey value?
            _valid_accesskey_code = (_code > 47 && _code < 58) || (_code > 64 && _code < 91) || (_code > 96 && _code < 123),
            // If it is, build a selector to retrieve the accesskey'd element.
            _selector = (_valid_accesskey_code) ? '[accesskey="' + String.fromCharCode(_code) + '"]' : null,
            $el = (_selector) ? $(_selector) : null,
            _old_idx,
            _typeable,
            // A smart link clicker
            _click_link = function(link) {
                var cancelled = false;

                if (document.createEvent) {
                    var event = document.createEvent("MouseEvents");
                    event.initMouseEvent("click", !0, !0, window, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null);
                    cancelled = !link.dispatchEvent(event);
                }
                else if (link.fireEvent) {
                    cancelled = !link.fireEvent("onclick");
                }

                // If no event handler has prevented default link click behavior, navigate to the href.
                if (!cancelled && link.href) window.location = link.href;
            };

        // Normalize right and left ⌘ keys on Mac Os
        if (_code == 93 || _code == 224) _code = 91;

        // Workaround for Opera Mac's insane handling of the ⌘ key
        if (_code == 17 && window.opera && _control_key == 91 && event.ctrlKey === false) _code = 91;
        
        // If the current key code is a modifier key, set it active.
        if (_active_mods[_code] !== undefined) _active_mods[_code] = true;

        // Are we supposed to be typing write now? Meaning: Does a typeable element
        // have focus and is the modifier key not pressed?
        _typeable = (/^(sel|tex)/.test(_tag) || (_tag === 'input'
                  && /^(tex|pas|ema|sea|tel|url|dat)/.test(_target.type)))
                  && !_active_mods[_valid_mod_keys[_mod_key]];

        // If the current key is the tooltip control key, toggle the tooltip revealing class.
        if (_code === _control_key && !_typeable) {
            $class_target.toggleClass(_class);
        } else {
            if (_accesskey_event && !_typeable) {
                if (_valid_accesskey_code) {
                    if ($el.length) {
                        // Let's activate an accesskey'd element!
                        $el = ($el.is('label')) ? $('#' + $el.attr('for')) : $el;
                        var el = $el[0], el_tag = el.tagName.toLowerCase();
                        var _action = $el.is(':text, :password, textarea, select')?'focus':'click';
                        if (el_tag == 'a' && el.href) {
                            _click_link(el);
                        } else if (el_tag == 'select' && browser=='gecko' && _tag!='select') {
                            // Gecko does some really crazy stuff with keydown bleeding through all attempts to prevent keypress.
                            // So we are going to get the selectedIndex and set it back as soon as the event finishes.  
                            (function(el, _idx){
                                setTimeout(function(){ el.selectedIndex=_idx; }, 0);
                            })(el, el.selectedIndex);
                        }
                        // Don't type the character if we are in a typeable element and don't bubble up the DOM.
                        event.stopPropagation();
                        event.preventDefault();
                        // Focus or click the element depending on what is appropriate.
                        $el.trigger(_action);

                    }
                }
                // Remove the tooltip revealer class
                $class_target[_remove_class](_class);
            }
        }
    },
    // Keyup handler that clears modifier keys from active modifiers.
    unset_modkey = function(event) {
        var _code = event.keyCode;if (_code == 93 || _code == 224) _code = 91;
        if (window.opera && _code == 17 && event.ctrlKey === false) _code = 91;
        // IF this is a modifier key, clear it from active modifiers.
        if (_code in _active_mods) {
            _active_mods[_code] = false;
        }
    };

    return {
        version: '1.0',
        init: function(opt){
            opt || (opt = {});

            // Set options
            opt.ctrlKey && (_control_key = opt.ctrlKey);
            opt.reqCtrlKey && (_req_control_key = opt.reqCtrlKey);
            opt.modKey && _valid_mod_keys[opt.modKey] && (_mod_key = opt.modKey);
            target = opt.parent || _default_parent;

            // Setup event handlers for key events.
            $(browser=='msie' ? document : window)
                .bind('keydown', handle_keydown)
                .bind('keyup', unset_modkey);
            // Add a click handler on the class target to clear tooltips.
            $(target).bind('click', function(){ $(this)[_remove_class](_class); })
            // Add hint text to the data attribute of our class target.
                     .attr('data-kchint', 'Press [' + attr_key_map[os] + '] to hide tooltips.');
        },
        os: os,
        browser: browser
    };
})(window.KEYCANDY_DOM_LIB || window.$);