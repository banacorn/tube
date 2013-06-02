require.config({
    shim: {
        io: [],
        main: {
            deps: ['storage'],
            init: function (Storage) {
            }
        }
        // store: {
        //     deps: ['backbone', 'io'],
        //     init: function (Store) {
        //         console.log('Store initialized');
        //     }  
        // } 
    },

    paths: {
        jquery      : 'jam/jquery/dist/jquery',
        io          : '/socket.io/socket.io',
        storage     : 'storage',
        underscore  : 'jam/underscore/underscore',
        backbone    : 'jam/backbone/backbone',
        hogan       : 'jam/hogan/hogan',
        raphael     : 'jam/raphael',
    }
}); 

require([
    'jquery',
    'backbone',
    'io',
    'hogan',
    'storage',
    'view/create',
    'view/home',
    'view/simulation',
    'collection/simulation',
], function (
    $, Backbone, io, Hogan,
    Storage,
    CreateView, HomeView, SimulationView,
    SimulationCollection
) {

    //
    //  Router & Breadcrumb
    //

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

    var ROUTER = new Router;


    // var CityItemView = Backbone.View.extend({
    //     template: Hogan.compile($$cityItem),
    //     tagName: 'li',
    //     className: 'city',
    //     initialize: function () {
    //         this.render();
    //     },

    //     render: function () {
    //         this.$el.html(this.template.render(this.model.toJSON()));
    //         return this;
    //     }

    // });

    // var CityListView = Backbone.View.extend({
    //     tagName: 'ul',
    //     id: 'city-list',

    //     initialize: function () {
    //         this.listenTo(CITIES, 'add', this.add);
    //         this.listenTo(CITIES, 'remove', this.remove);
    //         CITIES.fetch();
    //         this.render();
    //     },

    //     add: function (model) {
    //         var cityItemView = new CityItemView({
    //             model: model
    //         })
    //         this.$el.append(cityItemView.el);
    //     },

    //     render: function () {
    //         this.$el.html();
    //         var $el = this.$el;
    //         // CITIES.models.forEach(function (city) {
    //         //     var cityItemView = new CityItemView({
    //         //         model: city
    //         //     });
    //         //     $el.append(cityItemView.el);
    //         // });
    //         return this;
    //     }
    // });


    var App = Backbone.View.extend({
       
        initialize: function () {
        },

        // enables history api pushstate
        // acient IE fallback to hashbang #!
        enablePushState: function () {
            Backbone.history.start({
                pushState: true
            });
        },
        
        // disables anchors
        // let the Router handle this
        disableAnchor: function () {
            $(document).on('click', 'a', function () {
                urn = $(this).attr('href');
                ROUTER.navigate(urn, true);
                return false;
            });
        },


        // disables form submits
        disableFormSubmit: function () {
            $(document).on('submit', 'form', function () {
                return false;
            });
        },
    });

    $(function () {


        var app = new App;
        app.enablePushState();
        app.disableAnchor();
        app.disableFormSubmit();
    });
})
