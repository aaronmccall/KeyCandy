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
    _default_parent = 'body',
    _timeout_attr = 'data-keyCandy_timeout',
    _tooltip_toggler = function(event){
        var $class_target = (_target) ? $(_target) : $(_default_parent),
            $target = $(event.target),
            _code = event.keyCode,
            _timeout = $class_target.attr(_timeout_attr) || 0,
            _matches = [17, 91, 93, 224];
        if (_matches.indexOf(_code) > -1) {
            if (_timeout) {
                //console.log('clearing timeout %s', _timeout);
                clearTimeout(_timeout);
            }
            $class_target.addClass(_class).attr(_timeout_attr, setTimeout(function(){
                //console.log('firing timeout function to clear class: %s from parent with attribute: %s', _class, _timeout_attr);
                $('.' + _class).removeClass(_class).removeAttr(_timeout_attr);
            }, 5000));
        } else {
            $class_target.removeClass(_class);                           
            if ((_code > 46 && _code < 91) && !($target.is(':text, :password, textarea'))) {
                $('[accesskey="' + String.fromCharCode(_code) + '"]').click();
            }
        }
    },
    init = function(_parent){
        _target = _parent || _default_parent;
        $(window).keydown(_tooltip_toggler);
        $(_target).click(function(){
          var $this = $(this);
          if ($this.hasClass(_class)) {
            clearTimeout($this.attr(_timeout_attr));
            $this.removeClass(_class).removeAttr(_timeout_attr);
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