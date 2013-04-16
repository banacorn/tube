require.config({
    paths: {
        jquery      : 'jam/jquery/dist/jquery',
        underscore  : 'jam/underscore/underscore',
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
    'text!../templates/home.html',
    'text!../templates/navitem.html',
    'text!../templates/city.html'
], function ($, Backbone, Storage, Hogan, Raphael, Model, Breadcrumb, $$home, $$navItem, $$city) {

    var Banana;

    // helper shits
    var socket = io.connect();
    var log = function (a) { console.log(a); };

    // alias
    var City = Model.City;  
    var Cities = Model.Cities;
    var Terrain = Model.Terrain;
    var Terrains = Model.Terrains;


    var BREADCRUMB = new Breadcrumb;


    //
    //  Router & Breadcrumb
    //

    var Router = Backbone.Router.extend({
        
        routes: {
            '': 'home',
            'fuck': 'fuck',
            'city/:id': 'city'
        },

        initialize: function () {
            $('#nav-container').html(BREADCRUMB.el);
        },

        home: function () {

            BREADCRUMB.home();

            var homeView = new HomeView
            $('#main').html(homeView.el);
            // $('input')[0].focus();
        },

        fuck: function () {

            BREADCRUMB.fuck();
        },

        city: function (id) {
            var cityView = new CityView({
                cityID: id
            });

            $('#main').html(cityView.el);

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

    // var NavView = Backbone.View.extend({
    //     tagName: 'ul',
    //     initialize: function () {
    //         this.listenTo(CITIES, 'reset', this.render);
    //         this.listenTo(CITIES, 'add', this.add);
    //         TERRAINS.fetch();
    //         CITIES.fetch();
    //     },
    //     render: function () {
    //         var $el = this.$el;
    //         CITIES.each(function (city) {
    //             var navItemView = new NavItemView({
    //                 model: city
    //             });
    //             $el.append(navItemView.el);
    //         });
    //     },
    //     add: function (model) {
    //         var navItemView = new NavItemView({
    //             model: model
    //         })
    //         this.$el.append(navItemView.el);
    //     }
    // });


    // var CityView = Backbone.View.extend({
    //     template: Hogan.compile($$city),
    //     tagName: 'section',
    //     id: 'city',
    //     events: {
    //         'click #remove-city': 'removeCity'
    //     },
    //     initialize: function (options) {
    //         this.model = CITIES.get(options.cityID);
    //         this.render();
    //         this.listenTo(this.model, 'change', this.render);
    //         this.model.fetch();
    //     },
    //     render: function () {
    //         this.$el.html(this.template.render(this.model.toJSON()));
    //         return this;
    //     },
    //     removeCity: function () {

    //         var terrain = TERRAINS.get(this.model.id);
    //         CITIES.remove(this.model);
    //         TERRAINS.remove(terrain);
    //         terrain.destroy();
    //         this.model.destroy();

    //         ROUTER.navigate('', true);

    //     }
    // });

    var HomeView = Backbone.View.extend({
        template: Hogan.compile($$home),
        tagName: 'section',
        id: 'home',
        initialize: function () {
            this.render();
        },
        events: {
            'submit #create-form': 'create',
            'click #regenerate-button': 'generate',
            'focus #city-name': 'focusCityName',
            'focus #city-population': 'focusCityPopulation'
        },
        render: function () {
            this.$el.html(this.template.render());
            // this.city = new City;
            // this.terrain = new Terrain;
            // this.generate();
            return this;
        },
        generate: function () {
            var canvas = $('#map-preview', this.$el).get(0);
            var ctx = canvas.getContext('2d');


            ctx.clearRect(0, 0, 400, 400);

            var residentialColor = "#20A040";
            var commercialColor = "#296089";
            var size = 40;

            // residential
            ctx.fillStyle = residentialColor;

            for (var i = 0; i < 30; i ++) {

                var w = Math.cos(Math.random()) * size / 5;
                var h = w * (Math.random() * 0.8 + 0.6);
                var x = size / 2 - (w/2) + Math.sin(Math.random() * Math.PI * 2) * size * 0.3;
                var y = size / 2 - (h/2) + Math.sin(Math.random() * Math.PI * 2) * size * 0.3;

                ctx.fillRect (
                    Math.floor(x) * (400 / size),
                    Math.floor(y) * (400 / size),
                    Math.floor(w) * (400 / size),
                    Math.floor(h) * (400 / size)
                );

                this.terrain.drawMap('residential', Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
            }


            // commercial
            ctx.fillStyle = commercialColor;

            var shiftX = Math.sin(Math.random() * Math.PI * 2) * (size * 0.1);
            var shiftY = Math.sin(Math.random() * Math.PI * 2) * (size * 0.1);

            for (var i = 0; i < 20; i ++) {

                var w = Math.random() * (size * 0.2);
                var h = w * (Math.random() * 0.8 + 0.6);
                var x = (size * 0.5) - (w/2) + Math.sin(Math.random() * Math.PI * 2) * (size * 0.25) + shiftX;
                var y = (size * 0.5) - (h/2) + Math.sin(Math.random() * Math.PI * 2) * (size * 0.25) + shiftX;

                ctx.fillRect (
                    Math.floor(x) * (400 / size),
                    Math.floor(y) * (400 / size),
                    Math.floor(w) * (400 / size),
                    Math.floor(h) * (400 / size)
                );

                this.terrain.drawMap('commercial', Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));

            }

            this.ctx = ctx;

            return false;
        },
        create: function () {

            var city = this.city;
            var terrain = this.terrain;

            city.set('name', $('#city-name', this.$el).val().toUpperCase());
            city.set('population', parseInt($('#city-population', this.$el).val(), 10));
            city.save();

            city.once('sync', function () {
                terrain.set('id', city.id)
                terrain.save();
                TERRAINS.add(terrain);
                CITIES.add(city);
                ROUTER.navigate('/city/' + city.id, true);
            });

            return false;
        },
        focusCityName: function () {
            setTimeout(function () {
                $('#city-name', this.$el).select();
            }, 0);
        },
        focusCityPopulation: function () {
            setTimeout(function () {
                $('#city-population', this.$el).select();
            }, 0);
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
