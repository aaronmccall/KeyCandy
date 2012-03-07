

    function bind(el, type, callback) {
        var newFunc = el.addEventListener
            ? function (el, type, callback) {
                el.addEventListener(type, callback, true);
            }
            : function (el, type, callback) {
                el.attachEvent('on'+type, callback);
            };

        bind = newFunc;
        return newFunc(el, type, callback);
    }

    proto.bind = function(type, callback){
        var elKey;
        for (var i=0; i<this.length; i++) {
            if (__indexOf(__el_list, this[i]) < 0) __el_list.push(this[i]);
            elKey = __indexOf(__el_list, this[i]);
            __el_evt_map[elKey] = __el_evt_map[elKey] || {};
            __el_evt_map[elKey][type] = __el_evt_map[elKey][type] || [];
            if (__indexOf(__el_evt_map[elKey][type], callback) < 0) {
                bind(this[i], type, callback);
                __el_evt_map[elKey][type].push(callback);
            }
        }
        return this;
    };

    function unbind(el, type, handle) {
        var newFunc = document.removeEventListener
            ? function( el, type, handle ) {
            if ( el.removeEventListener ) el.removeEventListener( type, handle, false );
        }
            : function( el, type, handle ) {
            if ( el.detachEvent ) el.detachEvent( "on" + type, handle );
        };
        unbind = newFunc;
        newFunc(el, type, handle);
    }

    proto.unbind = function(type, handle) {
        for (var i=0; i<this.length; i++) unbind(this[i], type, handle);
        return this;
    };

    function trigger(el, evt){
        if (evt in el) el[evt]();
        return this;
    }

    proto.trigger = function(evt) {
        for (var i=0; i<this.length; i++) trigger(this[i], evt);
        return this;
    };

    proto.one = function(type, func) {
        var handle = __bind(this.el, func),
            wrapper = __bind(this, function(event){
                handle(event);
                this.unbind(type, wrapper);
            });
        this.bind(type, wrapper);
        return this;
    };