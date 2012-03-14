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

    function __slice(obj) { 
        return Array.prototype.slice.call(obj); 
    }

    function __indexOf (array, val) {
        var newFunc =  (typeof Array.prototype.indexOf === "function") ?
            function(array, val) {
                return Array.prototype.indexOf.call(array, val);
            } :
            function(array, val) {
                var i=0, j=array.length;
                for (; i<j; i++) {
                    if (array[i] === val) return i;
                }
                return -1;
            };
        __indexOf = newFunc;
        return newFunc(array, val);
    }

    function __each(array, callback, context) {
        var newFunc = (typeof Array.prototype.forEach == "function") ?
        function (array, callback, context) {
            Array.prototype.foreEach.call(array, callback, context);
        } :
        function (array, callback, context) {
            if (!array || !array.length) return;
            var i = 0, len = array.length;
            for (i<len; i++) {
                if (array[i] !== undefined) callback.call(context||null, array[i], i, array);
            }
        }
        __each = newFunc;
        return newFunc(array, callback, context);
    }

    function __bind(obj, func) {
        return ('bind' in func && typeof func.bind === "function")
            ? func.bind(obj)
            : function() { func.apply(obj, __slice(arguments)) }
    }

    function classRE(cls) { 
        return new RegExp("\\b" + cls + "\\b") 
    }