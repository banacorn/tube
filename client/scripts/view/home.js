define([
    'jquery',
    'backbone',
    'hogan',
    '../collection/simulation',
    '../view/simulationItem',
    'text!../../templates/home.html',
], function ($, Backbone, Hogan, 
    SimulationCollection,
    SimulationItemView,
    $$home
) {

    var HomeView = Backbone.View.extend({
        template: Hogan.compile($$home),
        tagName: 'div',
        initialize: function () {
            var self = this;
            this.render();
            this.simulationCollection = new SimulationCollection;
            this.simulationCollection.on('add', function (model) {
                var simulationItemView = new SimulationItemView({
                    model: model,
                    id: model.id
                });
                $('ul.simulation-list', self.$el).append(simulationItemView.el);
            });
            // this.simulationCollection.on('sync', function (collection) {
            //     collection.forEach(function (model) {
            //         console.log('remote add')
            //         var simulationItemView = new SimulationItemView({
            //             model: model,
            //             id: model.id
            //         });
            //         $('ul.simulation-list', self.el$).append(simulationItemView.el);
            //     })
            // });
            this.simulationCollection.fetch();



        },

        render: function () {
            this.$el.html(this.template.render());
            return this;
        }

    });

    return HomeView;
});