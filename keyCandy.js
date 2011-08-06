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
    var _agent = navigator.userAgent,
    _os = /Linux|Windows|Macintosh/.exec(_agent).toString().toLowerCase(),
    _browser = (_agent.indexOf('WebKit')>-1) ? 'webkit' : /Gecko|MSIE|Opera/.exec(_agent).toString().toLowerCase(),
    _os_browser_map = { macintosh: { webkit: 91, gecko: 224 } },
    _target,
    _class = 'keycandy',
    _remove_class = 'removeClass',
    _has_class = 'hasClass',
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
                    _accesskey_event = ($class_target[_has_class](_class)||!_req_control_key),// && event.type == 'keyup',
                    _valid_accesskey_code = (_code > 46 && _code < 91),
                    _typeable = (_tag === 'textarea' || (_tag === 'input' && /text|password|email|search|tel|url/.test(_target.type) > -1))
                        && !event[_valid_mod_keys[_mod_key]+'Key'];
                if (_do_showtips && !_typeable) {
                    $class_target.toggleClass(_class);
                } else {
                    if (_accesskey_event && !_typeable) {
                        if (_valid_accesskey_code) {
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
                        $class_target[_remove_class](_class);
                    }
                }
            });
            $(_target).click(function(){ $(this)[_remove_class](_class); });
        },
        os: _os
    };
})($ || jQuery);