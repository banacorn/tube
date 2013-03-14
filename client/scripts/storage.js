require([
    'backbone',
    'underscore'
], function (Backbone, _) {

    //
    //  Storage
    //
    //  localStorage as cache
    //


    // save the original Backbone.Sync here
    Backbone.remoteSync = Backbone.sync;

    // modified Backbone.Sync that will check localStorage cache first
    Backbone.sync = function (method, model, options) {

        // localStorage support
        if (!localStorage) {
            Backbone.remoteSync.apply(this, arguments);
            return;
        }

        var url = (typeof model.url === 'function') ? model.url() : model.url;
        var type = (model instanceof Backbone.Collection) ? 'collection' : 'model';

        // helper function
        var findModel = function (id) { return JSON.parse(localStorage[url + '/' + id]); };

        if (type === 'collection') {

            var collection = model;
            var IDs = localStorage[url] ? JSON.parse(localStorage[url]) : [];

            switch (method) {
                case 'read':

                    collection.once('sync', function () {

                        var oldModelIDs     = localStorage[url] ? JSON.parse(localStorage[url]) : [];
                        var newModelIDs     = collection.pluck('id');
                        localStorage[url] = JSON.stringify(newModelIDs);

                        var addedIDs        = _.difference(newModelIDs, oldModelIDs);
                        var removedIDs      = _.difference(oldModelIDs, newModelIDs);
                        var removedModels   = removedIDs.map(findModel);
                        
                        collection.forEach(function (model) {
                            var modelURL = url + '/' + model.id;
                            if (_.contains(addedIDs, model.id)) {
                                localStorage[modelURL] = JSON.stringify(model);
                                // collection.trigger('add', model, collection, options);
                            } else if (! _.isEqual(model.toJSON(), findModel(model.id))) {
                                localStorage[modelURL] = JSON.stringify(model);
                                // collection.trigger('change', model, collection, options);
                            }
                        });

                        removedIDs.forEach(function (id) {
                            var model = findModel(id);
                            // collection.trigger('remove', model, collection, options);
                            delete localStorage[url + '/' + id];
                        });

                    });

                    // fetch localStorage and 'update'
                    if (IDs.length !== 0) {
                        var models = IDs.map(findModel);
                        collection.reset(models)
                    }

                    break;

            }


        }

        if (type === 'model') {

            var storedModel = localStorage[url] ? JSON.parse(localStorage[url]) : undefined;


            switch (method) {
                case 'read':
                    model.once('sync', function () {
                        // console.log('sync')
                        if (! _.isEqual(model.toJSON(), localStorage[url])) {
                            localStorage[url] = JSON.stringify(model.toJSON());
                            // model.trigger('change', model);
                        }
                    });

                    // fetch localStorage and 'update'
                    if (storedModel) {
                        model.set(storedModel);
                    }

                    break;
            }

        }


        // switch (method) {
        //     case 'read':

        //         // update localStorage if synced from remote
        //         model.once('sync', function () {

        //             var inLocalStorage = localStorage !== undefined && localStorage[url] !== undefined;

        //             // emit event 'get' and update cache
        //             if (!inLocalStorage || localStorage[url] !== JSON.stringify(model.toJSON())) {
        //                 model.trigger('get', JSON.stringify(model.toJSON()))
        //                 localStorage[url] = JSON.stringify(model.toJSON())
        //             }
        //         })


        //         // fetch localStorage
        //         if (localStorage !== undefined && localStorage[url] !== undefined) {
        //             var data = JSON.parse(localStorage[url]);
        //             if (model instanceof Backbone.Collection)
        //                 model.reset(data)
        //             if (model instanceof Backbone.Model)
        //                 model.set(data)

        //             // trigger event 'get'
        //             model.trigger('get');
        //         }

        //         break;
        //     case 'create':
        //         if (localStorage !== undefined)
        //             localStorage[url] = JSON.stringify(model.toJSON());
        //         break;

        //     case 'update':
        //         if (localStorage !== undefined)
        //             localStorage[url] = JSON.stringify(model.toJSON());
        //         break;
        // }

        // arguments[2].silent = true;
        arguments[2].update = true;

        // var success = options.success;
        // console.log(success)
        // arguments[2].success = function(resp) {
        //     if (success) success(model, resp, options);
        //     model.trigger('remote-sync', model, resp, options);
        // };



        Backbone.remoteSync.apply(this, arguments);


    }

});