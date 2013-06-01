require.config({
    shim: {
        io: []
    },

    paths: {
        jquery      : 'jam/jquery/dist/jquery',
        io          : '/socket.io/socket.io',
        underscore  : 'jam/underscore/underscore',
        backbone    : 'jam/backbone/backbone',
        hogan       : 'jam/hogan/hogan',
        raphael     : 'jam/raphael'
    }
}); 

require([
    'jquery',
    'backbone',
    'io',
    'storage',
    'hogan',
    'raphael/raphael.amd',
    'model',
    'map',
    'view/simulation',
    'text!../templates/cityitem.html',
    'text!../templates/create.html',
    'text!../templates/home.html',
], function ($, Backbone, io, Storage, Hogan, Raphael, Model, Map, SimulationView, $$cityItem, $$create, $$home) {

    // helper shits

    // var socket = io.connect();
    var log = function (a) { console.log(a); };

    // alias
    var CITIES = new Model.Cities;


    //
    //  Router & Breadcrumb
    //

    var Router = Backbone.Router.extend({
        
        routes: {
            '': 'home',
            'create': 'create',
            'simulation': 'simulation'
        },

        initialize: function () {
        },

        home: function () {

            var homeView = new HomeView
            $('#main').html(homeView.el);

            // var cityListView = new CityListView

        },

        create: function () {

            var createView = new CreateView
            $('#main').html(createView.el);
        },

        simulation: function () {
            var simulationView = new SimulationView
            $('#main').html(simulationView.el);
        }
    });

    var ROUTER = new Router;

    var CreateView = Backbone.View.extend({
        canvasSize: 400,
        template: Hogan.compile($$create),

        events: {
            'click #button-regenerate': 'generateMap',
            'click #button-layer': 'changeLayer',
            'click #button-create': 'saveMap',
            'focus #input-name': 'focusNameInput',
            'submit #create-form': 'submit'
        },

        initialize: function () {
            this.map = new Map;
            this.listenTo(this.map, 'generated', this.renderMap);
            this.listenTo(this.map, 'change:layer', this.renderMap);
            this.listenTo(this.map, 'change:layer', this.renderLayerButton);
            this.listenTo(this.map, 'change:population', this.showPopulation);
            this.render();
        },

        render: function () {
            this.$el.html(this.template.render());
            this.generateMap();
        },

        generateMap: function () {
            this.map.generate(1);
        },

        renderMap: function () {
            var canvas = $('#create-map canvas', this.$el).get(0);
            if (canvas) {
                var ctx = canvas.getContext('2d');

                ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
                var size        = this.map.get('size');
                var population  = this.map.get('population');
                var mapIn       = this.map.get('mapIn');
                var mapOut      = this.map.get('mapOut');
                var tileSize    = this.canvasSize / size;
                var layer       = this.map.get('layer') || 'both';


                for (var y = 0; y < size; y++) {
                    for (var x = 0; x < size; x++) {
                        var offset = y * size + x;
                        var populationIn = mapIn[offset];
                        var populationOut = mapOut[offset];

                        if (populationIn + populationOut == 0) {
                            ctx.fillStyle = "none";
                        } else {
                            var base = 4000;
                            switch (layer) {
                                case "both":
                                    var population = populationIn + populationOut;
                                    break;
                                case "in":
                                    var population = populationIn;
                                    break;
                                case "out":
                                    var population = populationOut;
                                    break;
                            }
                            var hue = 120 - 120 * population / base;
                            var transparancy = population == 0 ? 0 : population / base + 0.5;
                            ctx.fillStyle =  "hsla(" + hue + ", 80%, 70%, " + transparancy +")";
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

        },

        showPopulation: function () {
            var population = this.map.get('population');
            $('#input-population', this.$el).val(population);
        },

        changeLayer: function () {
            var layer = this.map.get('layer');
            switch (layer) {
                case "both":
                    this.map.set('layer', 'in');
                    break;
                case "in":
                    this.map.set('layer', 'out');
                    break;
                case "out":
                    this.map.set('layer', 'both');
                    break;
            }
        },

        renderLayerButton: function () {
            switch (this.map.get('layer')) {
                case "both":
                    var content = '<i class="icon-eye-open"></i> In + Out'
                    break;
                case "in":
                    var content = '<i class="icon-eye-open"></i> In      '
                    break;
                case "out":
                    var content = '<i class="icon-eye-open"></i> Out      '
                    break;
            }
            $('#button-layer', this.$el).html(content)
        },

        submit: function () {
            console.log('submit')
        },

        saveMap: function () {
            this.map.save();
        },

        focusNameInput: function () {
            setTimeout(function () {

                $('#input-name', this.$el).select();
            }, 0);
        }
    });

    var HomeView = Backbone.View.extend({
        template: Hogan.compile($$home),
        tagName: 'div',
        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template.render());
            return this;
        }

    });

    var CityItemView = Backbone.View.extend({
        template: Hogan.compile($$cityItem),
        tagName: 'li',
        className: 'city',
        initialize: function () {
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
            this.listenTo(CITIES, 'remove', this.remove);
            CITIES.fetch();
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
            // CITIES.models.forEach(function (city) {
            //     var cityItemView = new CityItemView({
            //         model: city
            //     });
            //     $el.append(cityItemView.el);
            // });
            return this;
        }
    });


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
