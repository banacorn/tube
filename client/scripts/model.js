define([
    'backbone', 
    'jquery'
], function (Backbone, $) {
    
    var City = Backbone.Model.extend({
        urlRoot: '/api/city',
        defaults: {
            name: 'stadt',
            population: 1000000
        }
    });


    var Cities = Backbone.Collection.extend({
        model: City,
        url: '/api/city'
    });

    var Terrain = Backbone.Model.extend({
        urlRoot: '/api/terrain',
        defaults: {
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


    var Terrains = Backbone.Collection.extend({
        model: Terrain,
        url: '/api/terrain'
    });

    return {
        City: City,
        Cities: Cities,
        Terrain: Terrain,
        Terrains: Terrains
    };
});