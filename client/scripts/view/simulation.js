define([
    'jquery',
    'backbone',
    'hogan',
    'text!../../templates/simulation.html',
], function ($, Backbone, Hogan, $$simulation) {

    var SimulationView = Backbone.View.extend({
        template: Hogan.compile($$simulation),
        tagName: 'div',
        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template.render());
            return this;
        }
    });

    return SimulationView;
});