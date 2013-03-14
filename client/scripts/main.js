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
    'text!../templates/home.html',
    'text!../templates/navitem.html',
    'text!../templates/city.html'
], function ($, Backbone, Storage, Hogan, Raphael, Model, $$home, $$navItem, $$city) {

    var socket = io.connect();
    var log = function (a) { console.log(a); };

    var City = Model.City;
    var Cities = Model.Cities;

    var CITIES = new Cities;

    var Router = Backbone.Router.extend({
        routes: {
            '': 'home',
            'city/:id': 'city'
        },
        home: function () {
            var homeView = new HomeView
            $('#main').html(homeView.el);
            $('input')[0].focus();
        },
        city: function (id) {
            var cityView = new CityView({
                cityID: id
            });

            $('#main').html(cityView.el);

        }
    });

    var ROUTER = new Router;

    var NavView = Backbone.View.extend({
        tagName: 'ul',
        itemTemplate: Hogan.compile($$navItem),
        initialize: function () {

            var aa = function (event) {
                return function () {
                    console.log(event + ' fired');
                    console.log(CITIES.toJSON());
                };
            };

            this.listenTo(CITIES, 'reset', this.render);
            this.listenTo(CITIES, 'add', this.addItem);
            this.listenTo(CITIES, 'remove', this.removeItem);
            CITIES.fetch();
        },
        render: function () {

            var $el = this.$el;
            var template = this.itemTemplate;
            
            CITIES.each(function (city) {

                $el.append(template.render(city.toJSON()));

                var map = city.get('map');

                var canvas = $('#minimap-' + city.id, $el).get(0);
                if (canvas) {

                    var ctx = canvas.getContext('2d');

                    var residentialColor = "#20A040";
                    var commercialColor = "#296089";
                    map.forEach(function (city) {

                        if (city.type === 'residential')
                            ctx.fillStyle = residentialColor;
                        else
                            ctx.fillStyle = commercialColor;

                        ctx.fillRect(city.x, city.y, city.w, city.h);
                    });
                }
            })
            return this;
        },
        addItem: function (model) {
            console.log('add', model);
            this.$el.append(this.itemTemplate.render(model.toJSON()));
        },
        removeItem: function (model) {
            console.log('remove', model);
            $('#city-' + model.id, this.$el).remove();
        }
    });

    var CityView = Backbone.View.extend({
        template: Hogan.compile($$city),
        tagName: 'section',
        id: 'city',
        events: {
            'click #remove-city': 'removeCity'
        },
        initialize: function (options) {
            this.model = new City({
                id: options.cityID
            });
            this.render();
            this.listenTo(this.model, 'change', this.render);
            this.model.fetch();
        },
        render: function () {
            this.$el.html(this.template.render(this.model.toJSON()));
            return this;
        },
        removeCity: function () {

            CITIES.remove(this.model)
            this.model.destroy();
            ROUTER.navigate('', true);

        }
    });

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
            this.city = new City;
            this.generate();
            return this;
        },
        generate: function () {
            var canvas = $('#map-preview', this.$el).get(0);
            var ctx = canvas.getContext('2d');


            ctx.clearRect(0, 0, 400, 400);
            this.city.set('map', []);

            var residentialColor = "#20A040";
            var commercialColor = "#296089";

            // residential
            ctx.fillStyle = residentialColor;

            for (var i = 0; i < 30; i ++) {

                var w = Math.cos(Math.random()) * 20;
                var h = w * (Math.random() * 0.8 + 0.6);
                var x = 50 - (w/2) + Math.sin(Math.random() * Math.PI * 2) * 30;
                var y = 50 - (h/2) + Math.sin(Math.random() * Math.PI * 2) * 30;

                ctx.fillRect (
                    Math.floor(x) * 4,
                    Math.floor(y) * 4,
                    Math.floor(w) * 4,
                    Math.floor(h) * 4
                );

                this.city.drawMap('residential', Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
            }


            // commercial
            ctx.fillStyle = commercialColor;

            var shiftX = Math.sin(Math.random() * Math.PI * 2) * 10;
            var shiftY = Math.sin(Math.random() * Math.PI * 2) * 10;

            for (var i = 0; i < 20; i ++) {

                var w = Math.random() * 20;
                var h = w * (Math.random() * 0.8 + 0.6);
                var x = 50 - (w/2) + Math.sin(Math.random() * Math.PI * 2) * 25 + shiftX;
                var y = 50 - (h/2) + Math.sin(Math.random() * Math.PI * 2) * 25 + shiftX;

                ctx.fillRect (
                    Math.floor(x) * 4,
                    Math.floor(y) * 4,
                    Math.floor(w) * 4,
                    Math.floor(h) * 4
                );

                this.city.drawMap('commercial', Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));

            }


            this.ctx = ctx;

            return false;
        },
        create: function () {

            var city = this.city;

            city.set('name', $('#city-name', this.$el).val().toUpperCase());
            city.set('population', parseInt($('#city-population', this.$el).val(), 10));
            city.save();
            this.listenTo(city, 'change', function () {
                console.log('fuck');
                console.log(city.id)
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


            var navView = new NavView;
            $('#cities').html(navView.el);
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

    socket.on('all cities', function (data) {
        console.log(data[0].map.length);
    })

    $(function () {

        var app = new App;
        app.enablePushState();
        app.disableAnchor();
    });
})
