define([
    'jquery',
    'backbone',
    'map',
], function ($, Backbone, Simulation) {

    var SimulationCollection = Backbone.Collection.extend({
        model: Simulation,
        url: '/api/simulation',
        initialize: function () {
            console.log('simulation collection initialized');
        }
    });



    return SimulationCollection;
});