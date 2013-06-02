define([
    'io',
    'backbone',
    'underscore'
], function (io, Backbone, _) {
    var socket = io.connect();

    // save the original Backbone.Sync here
    Backbone.remoteSync = Backbone.sync;

    // var bindStore = function () {
    //     var self = this;
    //     // var idAttribute = this.model.prototype.idAttribute;
        
    //     this.backend.ready(function() {
    //         var event = self.backend.options.event;
            
    //         self.on(event + ':create', function(model) {
    //             self.add(model);
    //         });
    //         self.bind(event + ':update', function(model) {
    //             var item = self.get(model[idAttribute]);
    //             if (item) item.set(model);
    //         });
    //         self.bind(event + ':delete', function(model) {
    //             self.remove(model[idAttribute]);
    //         });
    //     });
    // };

    Backbone.sync = function (method, model, options) {

        var prefix = 'store';

        var type = (model instanceof Backbone.Collection) ? 'Collection' : 'Model';
        var address = model.store;

        if (address == undefined)
            new Error('store address not specified');

        // console.log('Method: ', method);
        // console.log('Type: ', (model instanceof Backbone.Collection) ? 'Collection' : 'Model');
        // console.log('@', address);

        socket.emit(prefix + ':sync:' + address, {
            method: method,
            type: type,
            address: address,
            data: model.toJSON()
        });

        if (type == 'Model') {




        } else {
            socket.on(prefix + ':sync:' + address, function (method, data) {
                console.log('Method: ', method);
                console.log('Data: ', data);
            });
            
        }

    };
    return Backbone.sync;
});