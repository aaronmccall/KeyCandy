// ## DOMSmack Events ##
    //
    // *source: src/DOMSmack/events.js*

    // ## bind ##
    // Function to setup event handlers on elements
    // ### Args:
    //  * _el {DOMElement}_: the element to add event listener to
    //  * _type {String}_: the event type to add a listener for
    //  * _callback {Function}_: called when event fires
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

    // ## Api.prototype.bind ##
    // Adds ability to bind event callbacks to all elements in our collection
    // while preventing binding the same callback multiple times to the same
    // element / event combination
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

    // ## unbind ##
    // Function to setup event handlers on elements
    // ### Args:
    //  * _el {DOMElement}_: the element to remove event listener from
    //  * _type {String}_: the event type to remove a listener for
    //  * _callback {Function}_: listener function to remove
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

    // ## Api.prototype.unbind ##
    // Unbind _handle_ for _type_ on all elements in our collection
    proto.unbind = function(type, handle) {
        __each(this.els, function (el) { unbind(el, type, handle); });
        return this;
    };

    // ## trigger ##
    // Function to fire event (_evt_) on element (_el_)
    // ### Args:
    //  * _el {DOMElement}_: the element to fire the event on
    //  * _evt {String}_: the event type to fire
    function trigger(el, evt){
        if (evt in el) el[evt]();
        return this;
    }

    // ## Api.prototype.trigger ##
    // Fire the given event (_evt_) on all elements in our collection
    proto.trigger = function(evt) {
        __each(this.els, function (el) { trigger(el, evt); });
        return this;
    };

    // ## Api.prototype.one ##
    // Binds a single-use listener (_callback_) to an event _type_ on each
    // element in our collection.
    // ### Args:
    // _type {String}_: 
    proto.one = function (type, callback) {
        __each(this.els, function (el) {
            var callback = __bind(el, callback),
                handle,
                wrapper = function (event) {
                    callback(event);
                    unbind(el, type, handle);
                };
            handle = bind(el, type, wrapper);
        });
    }