define([
    'backbone',
    'view/create',
    'view/home',
    'view/simulation'
], function (Backbone,
    CreateView, HomeView, SimulationView
) {
    var Router = Backbone.Router.extend({
        
        routes: {
            '': 'home',
            'create': 'create',
            'simulation/:id': 'simulation',
        },

        initialize: function () {
            this.listenTo(Backbone, 'navigate', this.navigate);
        },

        home: function () {

            var homeView = new HomeView
            $('#main').html(homeView.el);

        },

        create: function () {

            var createView = new CreateView
            $('#main').html(createView.el);
        },

        simulation: function (id) {
            var simulationView = new SimulationView({
                id: id
            });
            $('#main').html(simulationView.el);
        }

    });
    console.log('Router initialized');

    return new Router;
});