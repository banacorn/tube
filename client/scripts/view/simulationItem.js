define([
    'jquery',
    'backbone',
    'hogan',
    'view/map',
    'text!../../templates/simulationItem.html',
], function ($, Backbone, Hogan, 
    MapView,
    $$simulationItem
) {

    var SimulationItemView = Backbone.View.extend({
        template: Hogan.compile($$simulationItem),
        tagName: 'li',
        className: 'simulation-item',
        initialize: function () {
            this.render();
            // this.model.on('change', this.render());
        },

        render: function () {
            this.$el.html(this.template.render(this.model.toJSON()));
            this.renderMap();
            return this;
        },

        renderMap: function () {
            var viewSize = 300;
            this.mapView = new MapView({
                model: this.model,
                attributes: {
                    width: viewSize - 20,
                    height: viewSize - 20
                }
            });
            $(this.$el).append(this.mapView.el);
        }

    });

    return SimulationItemView;
});