define([
    'backbone', 
    'jquery'
], function (Backbone, $) {
    
    var City = Backbone.Model.extend({
        urlRoot: '/api/city',
        defaults: {
            name: 'stadt',
            population: 1000000,
            map: []
        },
        drawMap: function (type, x, y, w, h) {
            var map = this.get('map');
            map.push({
                type: type,
                x: x,
                y: y,
                w: w,
                h: h
            });
            this.set('map', map);
        }
    });


    var Cities = Backbone.Collection.extend({
        model: City,
        url: '/api/city'
    });

    return {
        City: City,
        Cities: Cities
    };
});