/*
 * Key Candy makes your web app melt in your hands not on your mouse!
 * Provides tooltips for elements with accesskey attributes and focuses/activates
 * elements with an accesskey in a standardized, cross-browser, cross-platform way.
 */
/* !(c) 2011 Aaron McCall. MIT license. */
KeyCandy = (function($){
    var pub = {},
    _target,
    _class = 'keycandy',
    _remove_class = 'removeClass',
    _has_class = 'hasClass',
    _default_parent = 'body',
    _tooltip_toggler = function(event){
        var $class_target = (_target) ? $(_target) : $(_default_parent),
            $target = $(event.target),
            _code = event.keyCode,
            _valid_accesskey = (_code > 46 && _code < 91);
        if (_code === 17) {
            $class_target.addClass(_class);
        } else {
            if ($class_target[_has_class](_class)) {
                if (_code == 27 || _valid_accesskey) {
                    if (_valid_accesskey) {
                        var _selector = '[accesskey="' + String.fromCharCode(_code) + '"]',
                            $el = $(_selector, '.' + _class);
                        if ($el.length) {
    //                        console.log('Selector: %s is %s', _selector, $el.attr('tagName'));
                            $el = ($el.is('label')) ? $('#' + $el.attr('for')) : $el;
                            $el[$el.is(':text, :password, textarea, select')?'focus':'click']();
                            event.preventDefault();
                        }
                    }
                    $class_target[_remove_class](_class);
                }
            }
        }
    },
    init = function(_parent){
        _target = _parent || _default_parent;
        $(window).keydown(_tooltip_toggler);
        $(_target).click(function(){
          var $this = $(this);
          if ($this[_has_class](_class)) $this[_remove_class](_class);
        });
//        pub.initialized = true;
    };
    pub = {
        version: '0.5',
//        initialized: false,
        'init': init,
//        init_funcs: [init]
    };
    return pub;
})($ || jQuery);