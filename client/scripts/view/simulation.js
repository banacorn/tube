define([
    'jquery',
    'backbone',
    'hogan',
    'text!../../templates/simulation.html',
], function ($, Backbone, Hogan, $$simulation) {

   
    var SimulationView = Backbone.View.extend({
        template: Hogan.compile($$simulation),

        initialize: function () {

            this.simulationModel = new SimulationModel;
            this.simulationModel.fetch();

            // var viewSize = 280;
            // var viewMargin = 0;
            // this.mapView = new MapView({
            //     model: this.model,
            //     attributes: {
            //         width: viewSize - viewMargin * 2,
            //         height: viewSize - viewMargin * 2
            //     }
            // });
            // $('figcaption', this.$el).after(this.mapView.el);

            // console.log('he');


            // var 
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

    return SimulationView;
});