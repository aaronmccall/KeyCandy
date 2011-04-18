/*
 * Key Candy makes your web app melt in your hands not on your mouse!
 * Provides tooltips for elements with accesskey attributes and focuses/activates
 * elements with an accesskey in a standardized, cross-browser, cross-platform way.
 */
/*! (c) 2011 Aaron McCall. 
 *  MIT license (see http://creativecommons.org/licenses/MIT/). 
 */
KeyCandy = (function($){
    var pub = {},
    _target,
    _class = 'keycandy',
    _remove_class = 'removeClass',
    _has_class = 'hasClass',
    _default_parent = 'body',
    _tooltip_toggler = function(event){
        var $class_target = (_target) ? $(_target) : $(_default_parent),
            _target = event.target,
            _tag = _target.tagName.toLowerCase(),
            $target = $(_target),
            _code = event.keyCode,
            _valid_accesskey = (_code > 46 && _code < 91),
            _typeable = _tag === 'textarea' || (_tag === 'input' && /text|password/.test(_target.type) > -1);
        if (_code === 17 && event.type == 'keydown' && !_typeable) {
            $class_target.addClass(_class);
        } else {
            if ($class_target[_has_class](_class) && event.type == 'keyup' && !_typeable) {
                if (_code == 27 || _valid_accesskey) {
                    if (_valid_accesskey) {
                        var _selector = '[accesskey="' + String.fromCharCode(_code) + '"]',
                            $el = $(_selector, '.' + _class);
                        if ($el.length) {
    //                        console.log('Selector: %s is %s', _selector, $el.attr('tagName'));
                            $el = ($el.is('label')) ? $('#' + $el.attr('for')) : $el;
                            var _action = $el.is(':text, :password, textarea, select')?'focus':'click';
                            if ($el.is('a')) {
                                $el.one('click', function(){ location.href = this.href });
                            }
//                            console.log('Triggering %s via .%s %s which contains %s elements', _action, _class, _selector, $el.length);
                            $el.trigger(_action);
//                            if (_action == 'focus') event.preventDefault();
                        }
                    }
                    $class_target[_remove_class](_class);
                }
            }
        }
    },
    init = function(_parent){
        _target = _parent || _default_parent;
        $(window).bind('keydown keyup', _tooltip_toggler);
        $(_target).click(function(){
          var $this = $(this);
          if ($this[_has_class](_class)) $this[_remove_class](_class);
        });
//        pub.initialized = true;
    };
    pub = {
        version: '0.6',
        'init': init
    };
    return pub;
})($ || jQuery);