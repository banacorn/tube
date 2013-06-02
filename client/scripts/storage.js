require([
    'backbone',
    'underscore'
], function (Backbone, _) {

    // a thin layer of abstraction on top of localStorage

    var Storage = {
        set: function (url, data) {
            localStorage[url] = JSON.stringify(data);
        },
        get: function (url) {
            var data = localStorage[url];
            return data ? JSON.parse(localStorage[url]) : undefined;
        },
        sadd: function (url, data) {
            var stored = Storage.get(url) || [];
            stored.push(data);
            Storage.set(url, _.uniq(stored));
        },
        remove: function (url) {
            delete localStorage[url];
        }
    };

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
        var findModel = function (id) { return Storage.get(url + '/' + id); };

        if (type === 'collection') {
            var collection = model;
            var IDs = Storage.get(url) || [];

            switch (method) {
                case 'read':
                    // console.log('COLLECTION READ')

                    collection.once('sync', function () {
                        console.log('[Storage] remote sync');
                        var oldModelIDs     = Storage.get(url) || [];
                        var newModelIDs     = collection.pluck('id');
                        Storage.set(url, newModelIDs);

                        var addedIDs        = _.difference(newModelIDs, oldModelIDs);
                        var removedIDs      = _.difference(oldModelIDs, newModelIDs);
                        var removedModels   = removedIDs.map(findModel);
                        
                        collection.forEach(function (model) {
                            var modelURL = url + '/' + model.id;
                            if (_.contains(addedIDs, model.id)) {
                                Storage.set(modelURL,model);
                            } else if (! _.isEqual(model.toJSON(), findModel(model.id))) {
                                Storage.set(modelURL,model);
                            }
                        });

                        removedIDs.forEach(function (id) {
                            var model = findModel(id);
                            Storage.remove(url + '/' + id);
                        });

                    });

                    // fetch localStorage and 'update'
                    if (IDs.length !== 0) {

                        var models = _(IDs).map(findModel);
                        collection.set(models);
                        console.log('[Storage] local sync')
                    }

                    break;

            }


        }

        if (type === 'model') {



            switch (method) {
                case 'read':    

                    model.once('sync', function () {
                        if (! _.isEqual(model.toJSON(), Storage.get(url))) {
                            Storage.set(url, model);
                        }
                        console.log('[Storage] remote sync');
                    });

                    // fetch localStorage and 'update'
                    if (Storage.get(url)) {
                        model.set(Storage.get(url));
                        console.log('[Storage] local sync');
                    }

                    break;
                case 'create':

                    model.once('sync', function () {
                        Storage.set(url + '/' + model.id, model.toJSON());
                        Storage.sadd(url, model.id);
                    });

                    break;

                case 'update':

                    var id = url.split('/').slice(-1).join('/');
                    var urlRoot = url.split('/').slice(0, -1).join('/');

                    Storage.set(url, model.toJSON());
                    Storage.sadd(urlRoot, id);

                    break;
                case 'delete':
                    

                    var id = url.split('/').slice(-1).join('/');
                    var urlRoot = url.split('/').slice(0, -1).join('/');

                    Storage.remove(url);

                    var ids = Storage.get(urlRoot);
                    Storage.set(urlRoot, _.without(ids, id));

                    break;
            }

        }


        // switch (method) {
        //     case 'read':

        //         // update `Storage if synced from remote
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
        // arguments[2].update = true;

        // var success = options.success;
        // console.log(success)
        // arguments[2].success = function(resp) {
        //     if (success) success(model, resp, options);
        //     model.trigger('remote-sync', model, resp, options);
        // };

        console.log('Storage initialized');


        Backbone.remoteSync.apply(this, arguments);


    }

});