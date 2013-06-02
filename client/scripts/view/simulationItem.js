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
            var viewSize = 280;
            var viewMargin = 0;
            this.mapView = new MapView({
                model: this.model,
                attributes: {
                    width: viewSize - viewMargin * 2,
                    height: viewSize - viewMargin * 2
                }
            });
            $('figcaption', this.$el).after(this.mapView.el);
        }

    });

    return SimulationItemView;
});