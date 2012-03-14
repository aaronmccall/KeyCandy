// DOMSmack attribute accessors and manipulators
    // source: src/DOMSmack/attributes.js

    // Map HTML attribute names to DOM property names
    var propertyFix = {
        tabindex:        'tabIndex',
        readonly:        'readOnly',
        'for':           'htmlFor',
        'class':         'className',
        maxlength:       'maxLength',
        cellspacing:     'cellSpacing',
        cellpadding:     'cellPadding',
        rowspan:         'rowSpan',
        colspan:         'colSpan',
        usemap:          'useMap',
        frameborder:     'frameBorder',
        contenteditable: 'contentEditable'
    },

    // Old IE versions require an additional parameter to getAttribute
    getAttributeParamFix = { width: 1, height: 1, src: 1, href: 1 };


    function hasGetAttribute() {
        var div = document.createElement('div'), newFunc;
        div.innerHTML = '<a href="#"></a>';

        if (div.childNodes[0].getAttribute('href') === '#') {
            newFunc = function() { return true; };
            return true;
        }

        // Helps IE release memory associated with the div
        div = null;
        newFunc = function() { return false; };
        hasGetAttribute = newFunc;
        return false;
    }

    function setAttr(el, attr, val) {
        var newFunc = hasGetAttribute() ? 
            function (el, attr, val) {
                return el.setAttribute(attr, val);
            } : 
            function (el, attr, val) {
                if (propertyFix[name]) name = propertyFix[name];

                if (name === 'value' && element.nodeName === 'BUTTON') {
                    return element.getAttributeNode(name).nodeValue = value;
                }

                return element.setAttribute(name, value);
            };
        setAttr = newFunc;
        return newFunc(el, attr, val);
    }

    function getAttr(el, attr) {
        // Build a customized attribute getter for the current browser.
        var newFunc = hasGetAttribute() ?
            // Browser supports standard attribute access
            function (el, attr) { return el.getAttribute(attr); } : 
            function (el, attr) {
                // Swap HTML attribute name for DOM property name, if required.
                if (propertyFix[attr]) attr = propertyFix[attr];

                // Old IE versions require the extra param for some attributes.
                if (getAttributeParamFix[attr]) return el.getAttribute(attr, 2);

                // Old IE versions do weird things with button.value.
                if (attr === 'value' && el.nodeName === 'BUTTON') {
                  return el.getAttributeNode(attr).nodeValue;
                }

                // Default to standard DOM API
                return el.getAttribute(attr);
            };
        // Replace `getAttr` with the function that is optimized for the browser
        // for all calls after the initial one.
        getAttr = newFunc;
        // On the intial call we need to return a call to `newFunc`
        return newFunc(el, attr);
    }

    function removeAttr(el, attr) {
        var newFunc = hasGetAttribute() ? 
            function (el, attr) {
                if ('1-9'.indexOf(''+el.nodeType) < 0) return;
                setAttr(el, attr, '');
                el.removeAttributeNode(el.getAttributeNode(attr));
            } : 
            function (el, attr) {
                el.removeAttribute(attr);
            };
        removeAttr = newFunc;
        return newFunc(el, attr);
    }

    proto.attr = function (name, value) {
        if (value === undefined) return getAttr(this.el, name) ;

        __each(this.els, function (el) {
            if (value === null) {
                removeAttr(el, name);
            } else {
                setAttr(el, name, value);
            }
        });

        return this;
    };


    function hasClass(el, cls) { 
        return classRE(cls).test(el.className); 
    }

    proto.hasClass = function (cls) { 
        if (this.length ===1) return hasClass(this.el, cls); 
        var has_class = false;
        __each(this.els, function (el) {
            if (hasClass(el, cls)) has_class = true;
        }, this);
        return has_class;
    };

    function addClass(el, cls) {
        var classList;
        if (!hasClass(el, cls)) {
            classList = (el.className||"").split(/\s+/g);
            classList.push(cls);
            el.className = classList.join(' ');
        }
    }

    proto.addClass = function (cls) {
        __each(this.els, function (el) { addClass(el, cls) }, this);
        return this;
    };

    function removeClass(el, cls) {
        el.className = el.className.replace(classRE(cls), '').replace(/^\s+|\s+$/g, '');
    }

    proto.removeClass = function (cls) {
        __each(this.els, function (el) { removeClass(el, cls) }, this);
        return this;
    };

    function toggleClass(el, cls) {
        return (hasClass(el, cls)) ? removeClass(el, cls) : addClass(el, cls)
    }

    proto.toggleClass = function (cls) {
        __each(this.els, function (el) { 
            toggleClass(el, cls); 
        });
        return this;
    };

    function prop(el, name, value) {
        var prop = (propertyFix[name]) ? propertyFix[name] : name;
        if (prop in el) {
            if (typeof value === undefined ) return el[prop];
            el[prop] = value;
            return this;
        }
    };


    proto.prop = function (name, value) {
        __each(this.els, function (el) { prop(el, name, value); }, this);
    };