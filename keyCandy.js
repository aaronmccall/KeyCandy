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
})(window.jQuery);