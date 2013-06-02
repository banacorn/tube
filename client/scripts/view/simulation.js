define([
    'jquery',
    'backbone',
    'hogan',
    '../model/map',
    '../view/map',
    'text!../../templates/simulation.html',
], function ($, Backbone, Hogan, Map, MapView, $$simulation) {
   
    var SimulationView = Backbone.View.extend({
        mapSize: 600,
        template: Hogan.compile($$simulation),

        events: {
            'click #button-destroy': 'destroy'
        },

        initialize: function () {
            var self = this;
            
            this.model = new Map({
                id: this.id
            });

            this.mapView = new MapView({
                model: this.model,
                attributes: {
                    width: this.mapSize,
                    height: this.mapSize
                }
            });


            this.model.on('change', function (model) {
                self.render();
                self.renderMap();
            });

            this.render();
            this.renderMap();
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
            return this;
        },
        renderMap: function () {
            console.log('renderMap!!');
            $('.simulation-map', this.$el).append(this.mapView.el);
        },

        destroy: function () {
            this.model.destroy();
            Backbone.trigger('navigate', '', {trigger: true});
        }


    });

    return SimulationView;
});