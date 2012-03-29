// ## DOMSmack Events ##
    //
    // *source: src/DOMSmack/events.js*

    // ## bind ##
    // Function to setup event handlers on elements
    // ### Args:
    //  * `el {DOMElement}`: the element to add event listener to
    //  * `type {String}`: the event type to add a listener for
    //  * `callback {Function}`: called when event fires
    function bind(el, type, callback) {
        var newFunc = (el.addEventListener) ?
            function (el, type, callback) {
                el.addEventListener(type, callback, false);
                return callback;
            } :
            function (el, type, callback) {
                var new_callback = function () { callback.call(el, window.event); };
                el.attachEvent('on'+type, new_callback);
                return new_callback;
            };

        bind = newFunc;
        return newFunc(el, type, callback);
    }


    proto.bind = function(type, callback){
        var elKey;
        __each(this.els, function (el, idx) {
            if (__indexOf(__el_list, el) < 0) __el_list.push(el);
            elKey = __indexOf(__el_list, el);
            __el_evt_map[elKey] = __el_evt_map[elKey] || {};
            __el_evt_map[elKey][type] = __el_evt_map[elKey][type] || [];
            if (__indexOf(__el_evt_map[elKey][type], callback) < 0) {
                bind(el, type, callback);
                __el_evt_map[elKey][type].push(callback);
            }
        }, this);
        return this;
    };

    function unbind(el, type, handle) {
        var newFunc = (document.removeEventListener) ?
        function( el, type, handle ) {
            if ( el.removeEventListener ) el.removeEventListener( type, handle, false );
        } : 
        function( el, type, handle ) {
            if ( el.detachEvent ) el.detachEvent( "on" + type, handle );
        };
        unbind = newFunc;
        newFunc(el, type, handle);
    }

    proto.unbind = function(type, handle) {
        __each(this.els, function (el) { unbind(el, type, handle); });
        return this;
    };

    function trigger(el, evt){
        if (evt in el) el[evt]();
        return this;
    }

    proto.trigger = function(evt) {
        __each(this.els, function (el) { trigger(el, evt); });
        return this;
    };


    proto.one = function (type, func) {
        __each(this.els, function (el) {
            var callback = __bind(el, func),
                handle,
                wrapper = function (event) {
                    callback(event);
                    unbind(el, type, handle);
                };
            handle = bind(el, type, wrapper);
        });
    }