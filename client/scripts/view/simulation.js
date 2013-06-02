define([
    'jquery',
    'backbone',
    'hogan',
    '../model/map',
    '../view/map',
    'text!../../templates/simulation.html',
], function ($, Backbone, Hogan, Map, MapView ,$$simulation) {

   
    var SimulationView = Backbone.View.extend({
        template: Hogan.compile($$simulation),

        initialize: function () {
            var self = this;
            this.model = new Map({
                id: this.id
            });
            this.model.on('change', function (model) {
                console.log(model)
                self.mapView = new MapView({
                    model: model,
                    attributes: {
                        width: 500,
                        height: 500
                    }
                });
                self.render();
            });
            this.model.fetch();
            // console.log(this.simulationModel);
            // this.simulationModel.on('change', function (model) {
            //     console.log(model)
            //     self.model = model;
            //     self.mapView = new MapView({
            //         model: model,
            //         attributes: {
            //             width: 500,
            //             height: 500
            //         }
            //     });
            //     self.render();
            // })
            // this.simulationModel.fetch();



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
            // this.renderMap();
            return this;
        }
        // renderMap: function () {

        //     var viewSize = 280;
        //     var viewMargin = 0;
        //     this.mapView = new MapView({
        //         model: this.model,
        //         attributes: {
        //             width: viewSize - viewMargin * 2,
        //             height: viewSize - viewMargin * 2
        //         }
        //     });
        //     $('figcaption', this.$el).after(this.mapView.el);
        // }

    });

    return SimulationView;
});