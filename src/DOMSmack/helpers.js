// DOMSmack helpers
    // source: src/DOMSmack/helpers.js

    // Get a shorter handle to Array's prototype (helps with minification too)
    var ArrProto = Array.prototype,
        //
        nativeBind = Function.prototype.bind,
        breaker = {};

    // ## __arrayify ##
    // Having an integer _length_ property and a _splice_ method makes
    // an instance an [Array-like object](http://cl.ly/3k0i3n0A2R2h2t303B0x)
    // ### Args:
    // _obj {Object}_: the object to extend to be Array-like
    // _items {Array-like object}_: items to add as the indexed 'array' items
    // _append {Boolean}_: should we append _items_ to the end of any existing items?
    function __arrayify(obj, items, append) {
        if (obj.prototype && (!obj.length || !obj.splice)) {
            var proto = obj.prototype;
            proto.splice = [].splice;
            proto.length = 0;
        }
        if (!items || !items.length) return;
        items = (append ? __slice(obj) : []).concat(__slice(items));
        __each(items, function (item, idx) {
            obj[idx] = item;
        });
        obj.length = items.length;
    }

    // ## __any ##
    // Array.some-like functionality provided either by the native method
    // or by an ___each_-based fallback
    // ### Args:
    // _array {Array}_: the array we are operating on
    // _callback {Function}_: the tester function to call on each member of _array_
    // _context {Object}_: the [optional] _this_ object for _callback_
    function __any(array, callback, context) {
        var newFunc = (ArrProto.some) ?
            function (array, callback) { 
                return ArrProto.some.call(array, callback, context)
            } :
            function (array, callback, context) { 
                var result = false;
                __each(array||[], function (val, idx, list) {
                    if (result || (result = callback.call(context, val, idx, list))) return breaker;
                }, context);
                return !!result;
            }
        __any = newFunc;
        return newFunc(array, callback, context);
    }

    // ## __each ##
    // Array.forEach-like functionality provided either by the native method
    // itself or a for-based fallback.
    // ### Args:
    // _array {Array}_: the array we are operating on
    // _callback {Function}_: the function to call on each member of _array_
    // _context {Object}_: the [optional] _this_ object for _callback_
    function __each(array, callback, context) {
        var newFunc = (typeof ArrProto.forEach == "function") ?
        function (array, callback, context) {
            ArrProto.forEach.call(array, callback, context);
        } :
        function (array, callback, context) {
            for (var i = 0, len = array.length; i<len; i++) {
                if (i in array && callback.call(context, array[i], i, array)===breaker) return;
            }
        };
        __each = newFunc;
        return newFunc(array, callback, context);
    }

    // ## __indexOf ##
    // Array.indexOf-like functionality provided either by the native method
    // itself or a for-based fallback.
    // ### Args:
    // _array {Array}_: the array we are operating on
    // _val {multiple}_: value (any type is allowed) to look for in _array_
    function __indexOf (array, val) {
        var newFunc = (typeof ArrProto.indexOf === "function") ?
            function(array, val) {
                return ArrProto.indexOf.call(array, val);
            } :
            function(array, val) {
                for (var i=0, j=array.length; i<j; i++) {
                    if (array[i] === val) return i;
                }
                return -1;
            };
        __indexOf = newFunc;
        return newFunc(array, val);
    }

    // ## __slice ##
    // Quick and dirty wrapper around [].slice that allows
    // us to convert Array-like objects into actual Arrays
    // ### Args:
    // * _obj {multiple}_: can be a String, Object or Array
    // * _start {Integer}_: optional start index (0-based)
    // * _stop {Integer}_: optional stop index (defaults to end)
    function __slice(obj, start, stop) { return ArrProto.slice.call(obj, start, stop); }

    // ## __bind ##
    // Shim for ES5 Function.bind
    // ### Args:
    // * _obj {Object}_: the _this_ context to bind to _func_
    // * _func {Function}_: the function to bind the context to
    function __bind(obj, func) { 
        if (typeof func !== 'function' || typeof func.call !== 'function' ) {
            throw Error('func is not a function');
        }

        var bindArgs = __slice(arguments, 2), finalBind;

        if (!finalBind) {
            finalBind =  (func.bind && nativeBind && nativeBind === func.bind) ? 
            function (bindArgs) { 
                bindArgs.unshift(obj);
                return nativeBind.apply(func, bindArgs);
            } : 
            function (bindArgs) { 
                return function () {
                    func.apply(obj, bindArgs.concat(__slice(arguments))); 
                }
            };
        }

        return finalBind(bindArgs)
    }

    // ## __lc ##
    // Shortcut for String.toLowerCase
    function __lc(string) { return (''+string).toLowerCase(); }

    // ## classRE ##
    // Simple className matcher builder
    function classRE(cls) { return new RegExp("\\b" + cls + "\\b") }