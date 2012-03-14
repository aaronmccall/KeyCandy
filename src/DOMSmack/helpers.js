    // DOMSmack helpers



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