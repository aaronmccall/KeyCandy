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
    _require_control_key = false,
    _valid_override_keys = {'alt':1, 'ctrl':1, 'meta':1, 'shift':1},
    _typeable_override_key = 'alt',
    _tooltip_toggler = function(event){
        console.log("keyCode: %s, [alt]: %s [ctrl]: %s [meta]: %s [shift]: %s", event.keyCode, event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
        var $class_target = (_target) ? $(_target) : $(_default_parent),
            _target = event.target,
            _tag = _target.tagName.toLowerCase(),
            $target = $(_target),
            _code = event.keyCode,
            _showtips_event = _code === _control_key,// && event.type == 'keydown',
            _accesskey_event = ($class_target[_has_class](_class)||!_require_control_key),// && event.type == 'keyup',
            _valid_code = (_code > 46 && _code < 91),
            _typeable = (_tag === 'textarea' || (_tag === 'input' && /text|password/.test(_target.type) > -1)) && !event[_typeable_override_key+'Key'];
        if (_showtips_event && !_typeable) {
            $class_target.toggleClass(_class);
        } else {
            if (_accesskey_event && !_typeable) {
                if (_code == _remove_key || _valid_code) {
                    if (_valid_code) {
                        console.log('testing for accesskey');
                        var _selector = '[accesskey="' + String.fromCharCode(_code) + '"]',
                            $el = $(_selector);
                        console.log("Selector: '%s'", _selector);
                        if ($el.length) {
                            console.log('activating accesskey');
                            $el = ($el.is('label')) ? $('#' + $el.attr('for')) : $el;
                            var _action = $el.is(':text, :password, textarea, select')?'focus':'click';
                            if ($el.is('a')) {
                                // Ensure the link has an href before changing location
                                $el.one('click', function(){ this.href && (location.href = this.href) });
                            }
                            $el.trigger(_action);
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                }
                $class_target[_remove_class](_class);
            }
        }
    },
    init = function(_parent, opt){
        opt || (opt = {});
        
        // Control key and menu removal key overrides
        opt.controlKey && (_control_key = opt.controlKey);
        opt.requireControlKey && (_require_control_key = opt.requireControlKey);
        opt.typeableOverrideKey && _valid_override_keys[opt._typeable_override_key] && (_typeable_override_key = opt.typeableOverrideKey);
        
        _target = _parent || _default_parent;
        //TODO: determine if we can eliminate the keyup, since that will allow us to activate the accesskey from a typeable element
        $(window).bind('keydown', _tooltip_toggler);
        $(_target).click(function(){
          var $this = $(this);
          if ($this[_has_class](_class)) $this[_remove_class](_class);
        });
    };
    pub = {
        version: '0.7',
        init: init,
        os: _os
    };
    return pub;
})($ || jQuery);