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
    __bind = function(obj, func){
        return ('bind' in func && typeof func.bind === "function")
            ? func.bind(obj)
            : function() { func.apply(obj, __slice(arguments)) }
    },
    __init = function(selector) { return new api(selector) },
    classRE = function(cls) { return new RegExp("\\b" + cls + "\\b") },
    api = function(selector){
        if (typeof selector === "string") {
            this.el = document.querySelectorAll(selector);
            this.length = this.el.length;
            if (this.el.length == 1) {
                this.el = __slice(this.el).pop();
                this[0] = this.el;
            }
            for (var i=0, elArray = __slice(this.el), len = elArray.length; i<len; i++) {
                this[i] = elArray[i];
            }
        } else if (selector.nodeType || selector === window || selector === document) {
            this.el = this[0] = selector;
            this.length = 1;
        }
//
//        console.log("selector was a '%s' and this.el is a '%s'", typeof selector, this.el);
    }, proto = api.prototype;
    proto.is = function(tag){
        var _is = false,tagArray;
//        console.log('tag was "%s" and element is a "%s"', tag, this.el);
        if (tag.indexOf(',') >= 0) {
            tagArray = tag.split(/,\s*/g);
//            console.dir(tagArray);
            for (var i=0, len=tagArray.length; i<len; i++) {
//                console.log('tag was "%s" and element is a "%s"', tagArray[i], this.el);
                if (tagArray[i].toLowerCase() === this.el.tagName.toLowerCase()) return true;
                if (tagArray[i].indexOf(':') == 0) {
                    if (tagArray[i].substr(1).toLowerCase() === this.el.type) return true;
                }
            }
        }
        return (tag.toLowerCase() === this.el.tagName.toLowerCase());
    };
    proto.bind = function(type, callback){
        var el = this.el,
            _adder = (this._adder || (this._adder = (el.addEventListener ? el.addEventListener : el.attachEvent), this._adder)),
            _args = [],
            _type = _args[0] = (_adder === el.attachEvent) ? 'on' + type : type,
            _func = _args[1] = __bind(el, callback);
            if (_type.indexOf('on') !== 0) _args.push(true);
//        console.log('el is a %s and event type is %s', this.el, _type);
        if (this.length === 1) {
            _adder.apply(this.el, _args);
        } else {
            for (var i=0; i<this.length; i++) {
                _adder.apply(this[i], args);
            }
        }
        return this;
    };
    proto.hasClass = function(cls) {
        return this.el.className.indexOf(cls) > -1;
    };
    proto.addClass = function(cls) {
        var classList;
        //TODO make this grok element list
        if (!classRE(cls).test(this.el.className)) {
            classList = this.el.className.split(/\s+/g);
            this.el.className += ' ' + cls;
        }
        return this;
    };
    proto.removeClass = function(cls) {
        this.el.className = this.el.className.replace(classRE(cls), '');
        return this;
    };
    proto.toggleClass = function(cls) {
        if (this.hasClass(cls)) {
            this.removeClass(cls);
        } else {
            this.addClass(cls);
        }
    };
    proto.keydown = function(func){
        this.bind('keydown', func)
    };
    proto.click = function(func){
        this.bind('click', func)
    };
    proto.trigger = function(evt){
        if (evt in this.el) {
            this.el[evt]();
        }
    };
    // TODO need implementations of one and attr
    proto.one = function(type, func) {
        //Magical callback wrapper that removes the event listener goes here
        var handle = __bind(this.el, func),
            wrapper = __bind(this, function(event){
                handle(event);
                this.unbind(type, wrapper);
            });
        this.bind(type, wrapper);
    };

    proto.unbind = document.removeEventListener
        ? function( type, handle ) {
            if ( this.el.removeEventListener ) {
                this.el.removeEventListener( type, handle, false );
            }
        }
        : function( type, handle ) {
            if ( this.el.detachEvent ) {
                this.el.detachEvent( "on" + type, handle );
            }
        };
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
            $(_browser=='msie' ? document : window).keydown(function(event){
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
//                        console.log('Tag: %s, Code: %s', _tag, _code);
                        if (_valid_accesskey_code) {
                            if ($el.length) {
                                $el = ($el.is('label')) ? $('#' + $el[0].htmlFor) : $el;
                                var _action = $el.is(':text, :password, textarea, select')?'focus':'click';
//                                console.log('action to take is "%s"', _action);
                                if ($el[0].tagName.toLowerCase() == 'a') {
                                    // TODO implement one in gobSmack
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
            $(_target).click(function(){ $(this)[_remove_class](_class); });
        },
        os: _os,
        browser: _browser
    };
})(gobSmack);