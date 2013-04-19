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
    'map',
    'text!../templates/cityitem.html',
    'text!../templates/create.html',
], function ($, Backbone, Storage, Hogan, Raphael, Model, Breadcrumb, Map, $$cityItem, $$create) {

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

    var CreateView = Backbone.View.extend({
        canvasSize: 400,
        template: Hogan.compile($$create),
        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template.render());
            this.map = new Map;
            this.map.generate();
            this.renderMap();
        },

        renderMap: function () {
            var canvas = $('#create-map canvas', this.$el).get(0);
            if (canvas) {

                var ctx = canvas.getContext('2d');

                var size        = this.map.get('size');
                var population  = this.map.get('population');
                var mapIn       = this.map.get('mapIn');
                var mapOut      = this.map.get('mapOut');
                var tileSize = this.canvasSize / size;
                // ctx.fillStyle = "hsla(210, 70%, 70%, 1)";

                for (var y = 0; y < size; y++) {
                    for (var x = 0; x < size; x++) {
                        var offset = y * size + x;
                        var populationIn = mapIn[offset];
                        var populationOut = mapOut[offset];

                        if (populationIn + populationOut == 0) {
                            ctx.fillStyle = "none";
                        } else {
                            var hue = 0 + 120 * ((populationOut) / (populationIn + populationOut));
                            var strength = (populationIn + populationOut) / 200;
                            ctx.fillStyle = "hsla(" + hue + ", 80%, 70%, " + strength +")";
                        }
                        ctx.fillRect(
                            tileSize * x, 
                            tileSize * y, 
                            tileSize,
                            tileSize
                        );
                    }
                }
            }

        }
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
