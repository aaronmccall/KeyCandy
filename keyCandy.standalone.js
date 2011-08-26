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
                el.getAttribute(attr);
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
//        console.log('running $.attr to set attribute "%s" to value "%s" on %s elements', name, value, this.length);
        if (typeof value === undefined) return getAttr(this.el, name) ;

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
    var _agent = navigator.userAgent,
    _os = /Linux|Windows|Macintosh/.exec(_agent).toString().toLowerCase(),
    _browser = (_agent.indexOf('WebKit')>-1) ? 'webkit' : /Gecko|MSIE|Opera/.exec(_agent).toString().toLowerCase(),
    _os_browser_map = { macintosh: { webkit: 91, gecko: 224 } },
    _target,
    _class = 'keycandy',
    _remove_class = 'removeClass',
    _default_parent = 'body',
    _control_key = (_os_browser_map[_os] && _os_browser_map[_os][_browser]) ? _os_browser_map[_os][_browser] : 17,
    _req_control_key = false,
    _valid_mod_keys = { alt: 'alt', ctrl: 'ctrl', meta: 'meta', shift: 'shift' },
    _mod_key = 'alt';

    return {
        version: '1.0RC',
        init: function(opt){
            opt || (opt = {});

            // Control key and menu removal key overrides
            opt.ctrlKey && (_control_key = opt.ctrlKey);
            opt.reqCtrlKey && (_req_control_key = opt.reqCtrlKey);
            opt.modKey && _valid_mod_keys[opt.modKey] && (_mod_key = opt.modKey);

            _target = opt.parent || _default_parent;
            $(_browser=='msie' ? document : window).bind('keydown', function(event){
                var $class_target = (_target) ? $(_target) : $(_default_parent),
                    _target = event.target,
                    _tag = _target.tagName.toLowerCase(),
                    $target = $(_target),
                    _code = event.keyCode,
                    _do_showtips = _code === _control_key,// && event.type == 'keydown',
                    _accesskey_event = ($class_target.hasClass(_class)||!_req_control_key),// && event.type == 'keyup',
                    _valid_accesskey_code = (_code > 46 && _code < 91),
                    _selector = (_valid_accesskey_code) ? '[accesskey="' + String.fromCharCode(_code) + '"]' : null,
                    $el = (_selector) ? $(_selector) : null,
                    _old_idx,
                    _typeable = (/^(sel|tex)/.test(_tag) || (_tag === 'input' && /^(tex|pas|ema|sea|tel|url)/.test(_target.type) > -1))
                        && !event[_valid_mod_keys[_mod_key]+'Key'];
                if (_do_showtips && !_typeable) {
                    $class_target.toggleClass(_class);
                } else {
                    if (_accesskey_event && !_typeable) {
                        if (_valid_accesskey_code) {
                            if ($el.length) {
                                $el = ($el.is('label')) ? $('#' + $el[0].htmlFor) : $el;
                                var _action = $el.is(':text, :password, textarea, select')?'focus':'click';
                                if ($el[0].tagName.toLowerCase() == 'a') {
                                    $el.one('click', function(){ this.href && (location.href = this.href) });
                                } else if ($el[0].tagName.toLowerCase() == 'select' && _browser=='gecko' && _tag!='select') {
                                    _old_idx = $el[0].selectedIndex;
                                    (function(){
                                        var _idx = _old_idx, el = $el[0];
                                        setTimeout(function(){ el.selectedIndex=_idx; }, 0);
                                    })();
                                }

                                event.preventDefault();
                                event.stopPropagation();
                                $el.trigger(_action);
                            }
                        }
                        $class_target[_remove_class](_class);
                    }
                }
            });
            $(_target).bind('click', function(){ $(this)[_remove_class](_class); });
        },
        os: _os,
        browser: _browser
    };
})(gobSmack);

var $ = gobSmack;