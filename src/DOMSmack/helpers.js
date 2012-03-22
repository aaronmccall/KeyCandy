// DOMSmack helpers
    // source: src/DOMSmack/helpers.js

    // Get a shorter handle to Array's prototype (helps with minification too)
    var ArrProto = Array.prototype,
        breaker = {};

    // ## __any ##
    // Array.some-like functionality provided either by the native method
    // or by an `__each`-based fallback
    // ### Args:
    // `array {Array}`: the array we are operating on
    // `callback {Function}`: the tester function to call on each member of `array`
    // `context {Object}`: the [optional] `this` object for `callback`
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
    // `array {Array}`: the array we are operating on
    // `callback {Function}`: the function to call on each member of `array`
    // `context {Object}`: the [optional] `this` object for `callback`
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
    // `array {Array}`: the array we are operating on
    // `val {multiple}`: value (any type is allowed) to look for in `array`
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
        return (func.bind) ? func.bind(obj) : function() { func.apply(obj, __slice(arguments)); }
    }

    // ## __LC ##
    // Shortcut for String.toLowerCase
    function __lc(string) { return (''+string).toLowerCase(); }

    // ## classRE ##
    // Simple className matcher builder
    function classRE(cls) { return new RegExp("\\b" + cls + "\\b") }