/*
 * Key Candy makes your web app melt in your hands not on your mouse!
 * Provides tooltips for elements with accesskey attributes and focuses/activates
 * elements with an accesskey in a standardized, cross-browser, cross-platform way.
 */
/*! (c) 2011 Aaron McCall. 
 *  Contributors: Beau Sorenson
 *  MIT license (see http://creativecommons.org/licenses/MIT/). 
 */
//function e(){ return (typeof exports === 'undefined') ? ((typeof window === 'undefined)?this:window) : exports }
var gobSmack = (function(){

    var __slice = function(obj) { return Array.prototype.slice.call(obj); },

    __indexOf = function(array, val) {
        var newFunc =  (typeof Array.prototype.indexOf === "function")
            ? function(array, val) {
                return Array.prototype.indexOf.call(array, val);
            }
            : function(array, val) {
                for (var i=0, j=array.length; i<j; i++) {
                    if (array[i] === val) return i;
                }
                return -1;
            };
        __indexOf = newFunc;
        return newFunc(array, val);
    },

    __bind = function(obj, func){
        return ('bind' in func && typeof func.bind === "function")
            ? func.bind(obj)
            : function() { func.apply(obj, __slice(arguments)) }
    },

    __init = function(selector) { return new api(selector) },

    classRE = function(cls) { return new RegExp("\\b" + cls + "\\b") },

    __el_list = [],

    __el_evt_map = {},

    hasGetAttribute = function() {
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
    },

    propertyFix = {
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
    
    getAttributeParamFix = {
        width: true,
        height: true,
        src: true,
        href: true
    },

    api = function(selector){
        if (typeof selector === "string") {
            this.el = document.querySelectorAll(selector);
            this.length = this.el.length;
            if (this.el.length == 1) {
                this[0] = this.el = __slice(this.el).pop();
            } else {
                for (var i=0, elArray = __slice(this.el), len = elArray.length; i<len; i++) {
                    if (i===0) this.el = elArray[i];
                    this[i] = elArray[i];
                }
            }
        } else if (selector.nodeType || selector === window || selector === document) {
            this.el = this[0] = selector;
            this.length = 1;
        }
//
    },

    proto = api.prototype;

    proto.is = function(tag){
        var _is = false,tagArray;
        if (tag.indexOf(',') >= 0) {
            tagArray = tag.split(/,\s*/g);
            for (var i=0, len=tagArray.length; i<len; i++) {
                if (tagArray[i].toLowerCase() === this.el.tagName.toLowerCase()) return true;
                if (tagArray[i].indexOf(':') == 0) {
                    if (tagArray[i].substr(1).toLowerCase() === this.el.type) return true;
                }
            }
        }
        return (tag.toLowerCase() === this.el.tagName.toLowerCase());
    };

    function bind(el, type, callback) {
        var newFunc = el.addEventListener
            ? function (el, type, callback) {
                el.addEventListener(type, callback, true);
            }
            : function (el, type, callback) {
                el.attachEvent('on'+type, callback);
            };

        bind = newFunc;
        return newFunc(el, type, callback);
    }

    proto.bind = function(type, callback){
        var elKey;
        for (var i=0; i<this.length; i++) {
            if (__indexOf(__el_list, this[i]) < 0) __el_list.push(this[i]);
            elKey = __indexOf(__el_list, this[i]);
            __el_evt_map[elKey] = __el_evt_map[elKey] || {};
            __el_evt_map[elKey][type] = __el_evt_map[elKey][type] || [];
            if (__indexOf(__el_evt_map[elKey][type], callback) < 0) {
                bind(this[i], type, callback);
                __el_evt_map[elKey][type].push(callback);
            }
        }
        return this;
    };

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
        el.className = el.className.replace(classRE(cls), '').replace(/^\s+/, '');
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

    function trigger(el, evt){
        if (evt in el) el[evt]();
        return this;
    }

    proto.trigger = function(evt) {
        for (var i=0; i<this.length; i++) trigger(this[i], evt);
        return this;
    };

    proto.one = function(type, func) {
        var handle = __bind(this.el, func),
            wrapper = __bind(this, function(event){
                handle(event);
                this.unbind(type, wrapper);
            });
        this.bind(type, wrapper);
        return this;
    };

    function unbind(el, type, handle) {
        var newFunc = document.removeEventListener
            ? function( el, type, handle ) {
            if ( el.removeEventListener ) el.removeEventListener( type, handle, false );
        }
            : function( el, type, handle ) {
            if ( el.detachEvent ) el.detachEvent( "on" + type, handle );
        };
        unbind = newFunc;
        newFunc(el, type, handle);
    }

    proto.unbind = function(type, handle) {
        for (var i=0; i<this.length; i++) unbind(this[i], type, handle);
        return this;
    };

    function setAttr(el, attr, val) {
//        console.log('initializing setAttr');
        var newFunc = hasGetAttribute()
            ? function (el, attr, val) {
//                console.log('setting %s to %s', attr, val);
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
        var newFunc = hasGetAttribute()
            ? function (el, attr) {
                return el.getAttribute(attr);
            }
            : function (el, attr) {
                if (propertyFix[attr]) {
                    attr = propertyFix[attr];
                }

                if (getAttributeParamFix[attr]) {
                    return el.getAttribute(attr, 2);
                }

                if (attr === 'value' && el.nodeName === 'BUTTON') {
                  return el.getAttributeNode(attr).nodeValue;
                }
                return el.getAttribute(attr);
            };
        getAttr = newFunc;
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
//                console.log('removing %s', name);
                removeAttr(this[i], name);
            } else {
//                console.log('setting %s to %s', name, value);
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

    //Expose our initializer function as the public gobSmack or $ function.
    return __init;
})();
KeyCandy = (function($){
    var agent = navigator.userAgent,
    os = /Linux|Windows|Macintosh/.exec(agent).toString().toLowerCase(),
    browser = (agent.indexOf('WebKit')>-1) ? 'webkit' : /Gecko|MSIE|Opera/.exec(agent).toString().toLowerCase(),
    os_browser_map = { macintosh: 91, linux: 17, windows: 17 },
    target,
    _class = 'keycandy',
    _remove_class = 'removeClass',
    _default_parent = 'body',
    _control_key = (os_browser_map[os]) ? os_browser_map[os] : 17,
    _req_control_key = false,
    _valid_mod_keys = { '⇧': 16, shift: 16, option: 18, '⌥': 18, alt: 18, ctrl: 17, control: 17, command: 91, '⌘': 91 },
    _mod_key = 'alt',
    _active_mods = {16: false, 17: false, 18: false, 91: false },
    html_key_map = {'windows': 'ctrl', 'linux': 'ctrl', 'macintosh': '&#x2318;'},
    attr_key_map = {'windows': 'ctrl', 'linux': 'ctrl', 'macintosh': String.fromCharCode(parseInt('2318',16))},
    handle_keydown = function(event){
        var $class_target = (_target) ? $(_target) : $(_default_parent),
            _target = event.target,
            _tag = _target.tagName.toLowerCase(),
            $target = $(_target),
            _code = event.keyCode,
            _accesskey_event = ($class_target.hasClass(_class)||!_req_control_key),// && event.type == 'keyup',
            _valid_accesskey_code = (_code > 46 && _code < 91),
            _selector = (_valid_accesskey_code) ? '[accesskey="' + String.fromCharCode(_code) + '"]' : null,
            $el = (_selector) ? $(_selector) : null,
            _old_idx,
            _typeable,
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

                if (!cancelled) window.location = link.href;
            };
//        console.log('keycode:', _code);
        if (_code == 93 || _code == 224) _code = 91;
        if (_code == 17 && window.opera && _control_key == 91 && event.ctrlKey === false) _code = 91;
        if (_code in _active_mods) _active_mods[_code] = true/*, console.dir(_active_mods)*/;
        _typeable = (/^(sel|tex)/.test(_tag) || (_tag === 'input' && /^(tex|pas|ema|sea|tel|url|dat)/.test(_target.type)))
                && !_active_mods[_valid_mod_keys[_mod_key]];
        if (_code === _control_key && !_typeable) {
            $class_target.toggleClass(_class);
        } else {
            if (_accesskey_event && !_typeable) {
                if (_valid_accesskey_code) {
                    if ($el.length) {
                        $el = ($el.is('label')) ? $('#' + $el.attr('for')) : $el;
                        var el = $el[0], el_tag = el.tagName.toLowerCase();
                        var _action = $el.is(':text, :password, textarea, select')?'focus':'click';
                        if (el_tag == 'a' && el.href) {
                            _click_link(el);
                        } else if (el_tag == 'select' && browser=='gecko' && _tag!='select') {
                            //Gecko does some really crazy stuff with keydown bleeding through all attempts to prevent keypress
                            (function(el, _idx){
                                setTimeout(function(){ el.selectedIndex=_idx; }, 0);
                            })(el, el.selectedIndex);
                        }
                        event.stopPropagation();
                        event.preventDefault();
                        $el.trigger(_action);

                    }
                }
                $class_target[_remove_class](_class);
            }
        }
    },
    unset_modkey = function(event) {
        var _code = event.keyCode;if (_code == 93 || _code == 224) _code = 91;
        if (window.opera && _code == 17 && event.ctrlKey === false) _code = 91;
        if (_code in _active_mods) {
//            console.log('setting active_mods entry for', _code, 'to false');
            _active_mods[_code] = false;
        }
    };

    return {
        version: '1.0RC',
        init: function(opt){
            opt || (opt = {});

            // Control key and menu removal key overrides
            opt.ctrlKey && (_control_key = opt.ctrlKey);
            opt.reqCtrlKey && (_req_control_key = opt.reqCtrlKey);
            opt.modKey && _valid_mod_keys[opt.modKey] && (_mod_key = opt.modKey);

            target = opt.parent || _default_parent;
            $(browser=='msie' ? document : window)
                .bind('keydown', handle_keydown)
                .bind('keyup', unset_modkey);
            $(target).bind('click', function(){ $(this)[_remove_class](_class); })
                     .attr('data-kchint', 'Press [' + attr_key_map[KeyCandy.os] + '] to hide tooltips.');
            $('#controlKey').html(html_key_map[KeyCandy.os]);
        },
        os: os,
        browser: browser
    };
})(gobSmack);