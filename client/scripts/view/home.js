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
            this.simulationCollection.on('sync', function (collection) {
                collection.forEach(function (model) {
                    var simulationItemView = new SimulationItemView({
                        model: model,
                        id: model.id
                    });
                    $('ul.simulation-list', self.el$).append(simulationItemView.el);
                })
                // console.log('got data!!', arguments);
            });
            this.simulationCollection.fetch();
            // console.log('SimulationCollection fetched', this.simulationCollection.length)



        },

        render: function () {
            this.$el.html(this.template.render());
            return this;
        }

    });

    return HomeView;
});