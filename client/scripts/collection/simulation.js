define([
    'jquery',
    'backbone',
    'map',
    'storage'
], function ($, Backbone, Simulation, Storage) {

    var SimulationCollection = Backbone.Collection.extend({
        model: Simulation,
        url: '/api/simulation',
        initialize: function () {
            console.log('simulation collection initialized');
        }
    });



    return SimulationCollection;
});