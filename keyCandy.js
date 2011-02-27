/*
 * Key Candy - hotkeys for the visual crowd.
 * Provides tooltips for elements with accesskey attributes and focuses/activates 
 * elements with an accesskey without Alt, Alt + Shift, Command, etc.
 * (c) 2011 Aaron McCall. MIT license.                                                                  
 */
KeyCandy = (function($){
    var pub = {},
    _target,        
    _class = 'keycandy',
    _clear_timeout = clearTimeout,
    _remove_class = 'removeClass',
    _remove_attr = 'removeAttr',
    _default_parent = 'body',
    _timeout_attr = 'data-keyCandy_timeout',
    _clickable = function($el) {
        return $el.is('a, :checkbox, :button, :submit, :radio, :reset')
    },
    _tooltip_toggler = function(event){
        var $class_target = (_target) ? $(_target) : $(_default_parent),
            $target = $(event.target),
            _code = event.keyCode,
            _timeout = $class_target.attr(_timeout_attr) || 0,
            _matches = [17, 91, 93, 224];
        if (_matches.indexOf(_code) > -1) {
            $class_target.addClass(_class).attr(_timeout_attr, setTimeout(function(){
                //console.log('firing timeout function to clear class: %s from parent with attribute: %s', _class, _timeout_attr);
                $('.' + _class)[_remove_class](_class)[_remove_attr](_timeout_attr);
            }, 5000));
        } else {
            $class_target[_remove_class](_class)[_remove_attr](_timeout_attr);                           
            if ((_code > 46 && _code < 91) && !($target.is(':text, :password, textarea'))) {
                var _selector = '[accesskey="' + String.fromCharCode(_code) + '"]',
                    $el = $(_selector);
                if ($el.length) {
                    //console.log('Selector: %s is clickable: %s', _selector, _clickable($el));
                    $el = ($el.is('label')) ? $('#' + $el.attr('for')) : $el;
                    $el[(_clickable($el))?'click':'focus']();
                    return false;
                }
            }
        }
        
        if (_timeout) {
            //console.log('clearing timeout %s', _timeout);
            _clear_timeout(_timeout);
        }
    },
    init = function(_parent){
        _target = _parent || _default_parent;
        $(window).keyup(_tooltip_toggler);
        $(_target).click(function(){
          var $this = $(this);
          if ($this.hasClass(_class)) {
            _clear_timeout($this.attr(_timeout_attr));
            $this[_remove_class](_class)[_remove_attr](_timeout_attr);
          }
        });
        pub.initialized = true;
    };
    pub = {
        version: '0.4',
        initialized: false,
        'init': init,
        init_funcs: [init]
    };
    return pub;
})(window.jQuery || Zepto);