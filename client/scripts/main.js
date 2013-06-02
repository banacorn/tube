require.config({
    shim: {
        io: [],
        main: {
            deps: ['storage'],
            init: function (Storage) {
                console.log('Storage initialized');
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

        map         : 'map'
    }
}); 

require([
    'jquery',
    'backbone',
    'io',
    'hogan',
    'map',
    'storage',
    'view/create',
    'collection/simulation',
    'text!../templates/create.html',
    'text!../templates/home.html',
], function (
    $, Backbone, io, Hogan,
    Map, Storage,
    CreateView, 
    SimulationCollection,
    $$create, $$home
) {

    //
    //  Router & Breadcrumb
    //

    var Router = Backbone.Router.extend({
        
        routes: {
            '': 'home',
            'create': 'create'
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
        }

    });

    var ROUTER = new Router;


    var HomeView = Backbone.View.extend({
        template: Hogan.compile($$home),
        tagName: 'div',
        initialize: function () {
            this.render();
            var simulationCollection = new SimulationCollection;
            simulationCollection.fetch();
            console.log('SimulationCollection fetched', simulationCollection.length)



        },

        render: function () {
            this.$el.html(this.template.render());
            return this;
        }

    });

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
