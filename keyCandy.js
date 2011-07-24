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
KeyCandy = (function($){
    var pub = {},
    _os = /Linux|Windows|Macintosh/.exec(navigator.userAgent).toString(),
    _target,
    _class = 'keycandy',
    _remove_class = 'removeClass',
    _has_class = 'hasClass',
    _default_parent = 'body',
    _control_key = (_os==='Macintosh')?224:17,
    _req_control_key = false,
    _valid_override_keys = {'alt':1, 'ctrl':1, 'meta':1, 'shift':1},
    _override_key = 'alt';
    return {
        version: '0.8',
        init: function(_parent, opt){
            opt || (opt = {});

            // Control key and menu removal key overrides
            opt.ctrlKey && (_control_key = opt.ctrlKey);
            opt.reqCtrlKey && (_req_control_key = opt.reqCtrlKey);
            opt.overrideKey && _valid_override_keys[opt.overrideKey] && (_override_key = opt.overrideKey);

            _target = _parent || _default_parent;
            $(window).bind('keydown', function(event){
                var $class_target = (_target) ? $(_target) : $(_default_parent),
                    _target = event.target,
                    _tag = _target.tagName.toLowerCase(),
                    $target = $(_target),
                    _code = event.keyCode,
                    _do_showtips = _code === _control_key,// && event.type == 'keydown',
                    _accesskey_event = ($class_target[_has_class](_class)||!_req_control_key),// && event.type == 'keyup',
                    _valid_code = (_code > 46 && _code < 91),
                    _typeable = (_tag === 'textarea' || (_tag === 'input' && /text|password|email|search|tel|url/.test(_target.type) > -1)) && !event[_override_key+'Key'];
                if (_do_showtips && !_typeable) {
                    $class_target.toggleClass(_class);
                } else {
                    if (_accesskey_event && !_typeable) {
                        if (_valid_code) {
                            if (_valid_code) {
                                var _selector = '[accesskey="' + String.fromCharCode(_code) + '"]',
                                    $el = $(_selector);
                                if ($el.length) {
                                    $el = ($el.is('label')) ? $('#' + $el.attr('for')) : $el;
                                    var _action = $el.is(':text, :password, textarea, select')?'focus':'click';
                                    if ($el.is('a')) {
                                        // Ensure the link has an href before changing location
                                        $el.one('click', function(){ this.href && (location.href = this.href) });
                                    }
                                    $el.trigger(_action);
                                    return false;
                                }
                            }
                        }
                        $class_target[_remove_class](_class);
                    }
                }
            });
            $(_target).click(function(){
              $(this)[_remove_class](_class);
            });
        },
        os: _os
    };
})($ || jQuery);