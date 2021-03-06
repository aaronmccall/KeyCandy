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
                } else if (link.fireEvent) {
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
        _typeable = (/^(sel|tex)/.test(_tag) ||
                    (_tag === 'input' && /^(tex|pas|ema|sea|tel|url|dat)/.test(_target.type))) &&
                    !_active_mods[_valid_mod_keys[_mod_key]];

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
        var _code = event.keyCode;
        if (_code == 93 || _code == 224) _code = 91;
        if (window.opera && _code == 17 && event.ctrlKey === false) _code = 91;
        // If this is a modifier key, clear it from active modifiers.
        if (_code in _active_mods) {
            _active_mods[_code] = false;
        }
    };

    return {
        version: '1.0.1',
        init: function(opt){
            // Set options
            if (opt) {
                if (opt.ctrlKey) _control_key = opt.ctrlKey;
                if (opt.reqCtrlKey) _req_control_key = opt.reqCtrlKey;
                if (opt.modKey && _valid_mod_keys[opt.modKey]) _mod_key = opt.modKey;
                if (opt.tooltipClass) _class = opt.tooltipClass;
                if (opt.domLib) $ = opt.domLib;
                target = opt.parent || _default_parent;
            } else {
                target = _default_parent;
            }
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