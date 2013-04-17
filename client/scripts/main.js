require.config({
    paths: {
        jquery      : 'jam/jquery/dist/jquery',
        // underscore  : 'jam/underscore/underscore',
        backbone    : 'jam/backbone/backbone',
        hogan       : 'jam/hogan/hogan',
        raphael     : 'jam/raphael'
    }
}); 

require([
    'jquery',
    'backbone',
    'storage',
    'hogan',
    'raphael/raphael.amd',
    'model',
    'breadcrumb',
    'text!../templates/cityitem.html',
    'text!../templates/create.html',
], function ($, Backbone, Storage, Hogan, Raphael, Model, Breadcrumb, $$cityItem, $$create) {

    // helper shits
    var socket = io.connect();
    var log = function (a) { console.log(a); };

    // alias
    var CITIES = new Model.Cities;
    var BREADCRUMB = new Breadcrumb;


    //
    //  Router & Breadcrumb
    //

    var Router = Backbone.Router.extend({
        
        routes: {
            '': 'home',
            'create': 'create',
            'about': 'about'
        },

        initialize: function () {
            $('#nav-container').html(BREADCRUMB.el);
        },

        home: function () {

            BREADCRUMB.home();

            var cityListView = new CityListView
            $('#main').html(cityListView.el);
        },

        create: function () {
            BREADCRUMB.create();

            var createView = new CreateView
            $('#main').html(createView.el);
        },

        about: function () {
            BREADCRUMB.about();
        }
    });

    var ROUTER = new Router;

    // var TerrainView = Backbone.View.extend({
    //     tagName: ''
    // });

    // var NavItemView = Backbone.View.extend({
    //     tagName: 'li',
    //     template: Hogan.compile($$navItem),
    //     initialize: function () {
    //         this.id = 'navitem-' + this.model.id;
    //         this.render();
    //         this.renderTerrain();
    //         this.listenTo(this.model, 'destroy', this.remove);
    //     },
    //     render: function () {
    //         this.$el.html(this.template.render(this.model.toJSON()));
    //     },
    //     renderTerrain: function () {


    //         var terrain = TERRAINS.get(this.model.id);
    //         if (!terrain) return;

    //         var map = terrain.get('map');
    //         var canvas = $('#terrain-' + terrain.id, this.$el).get(0);
    //         if (canvas) {

    //             var ctx = canvas.getContext('2d');

    //             var residentialColor = "#20A040";
    //             var commercialColor = "#296089";
    //             var size = 40;

    //             map.forEach(function (city) {

    //                 if (city.type === 'residential')
    //                     ctx.fillStyle = residentialColor;
    //                 else
    //                     ctx.fillStyle = commercialColor;

    //                 ctx.fillRect(
    //                     city.x * (100 / size), 
    //                     city.y * (100 / size), 
    //                     city.w * (100 / size), 
    //                     city.h * (100 / size)
    //                 );
    //             });
    //         }
    //     }
    // });


    var CreateView = Backbone.View.extend({
        template: Hogan.compile($$create),
    });

    var CityItemView = Backbone.View.extend({
        template: Hogan.compile($$cityItem),
        tagName: 'li',

        initialize: function () {
            // console.log('city inited');
            // console.log(this.model);
            this.render();
        },

        render: function () {
            this.$el.html(this.template.render(this.model.toJSON()));
            return this;
        }

    });

    var CityListView = Backbone.View.extend({
        tagName: 'ul',
        id: 'city-list',

        initialize: function () {
            this.listenTo(CITIES, 'add', this.add);
            // this.listenTo(CITIES, 'remove', this.remove);
            CITIES.fetch();
            console.log(CITIES.models);
            this.render();
        },

        add: function (model) {
            var cityItemView = new CityItemView({
                model: model
            })
            this.$el.append(cityItemView.el);
        },

        render: function () {
            this.$el.html();
            var $el = this.$el;
            CITIES.models.forEach(function (city) {
                var cityItemView = new CityItemView({
                    model: city
                });
                $el.append(cityItemView.el);
            });
            return this;
        }
    });


    var App = Backbone.View.extend({
       
        initialize: function () {
            // var homeView = new HomeView;
            // $('#cities').html(navView.el);
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

    });

    $(function () {


        var app = new App;
        app.enablePushState();
        app.disableAnchor();

    });
})
