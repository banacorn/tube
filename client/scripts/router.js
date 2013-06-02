define([
    'backbone',
    'view/create',
    'view/home',
    'view/simulation'
], function (Backbone,
    CreateView, HomeView, SimulationView
) {
    console.log('Router initialized');
    var Router = Backbone.Router.extend({
        
        routes: {
            '': 'home',
            'create': 'create',
            'simulation/:id': 'simulation',
        },

        initialize: function () {
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

    return new Router;
});