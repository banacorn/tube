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
    'hogan',
    'raphael/raphael.amd',
    'text!../templates/home.html',
    'text!../templates/nav.html'
], function ($, Backbone, Hogan, Raphael, $$home, $$nav) {

    var socket = io.connect();

    var log = function (a) { console.log(a); };

    var City = Backbone.Model.extend({
        urlRoot: '/api/city',
        defaults: {
            name: 'stadt',
            population: 1000000,
            map: []
        },
        drawMap: function (type, x, y, w, h) {
            var map = this.get('map');
            map.push({
                type: type,
                x: x,
                y: y,
                w: w,
                h: h
            });
            this.set('map', map);
        }
    });


    var Cities = Backbone.Collection.extend({
        model: City,
        url: '/api/city'
    });

    var NavView = Backbone.View.extend({
        tagName: 'ul',
        template: Hogan.compile($$nav),
        initialize: function () {
            window.cities = new Cities;
            this.listenTo(window.cities, 'sync', this.render);
            this.listenTo(window.cities, 'add', this.render);
            window.cities.fetch();
        },
        render: function () {
            this.$el.html(this.template.render({
                city: window.cities.toJSON()
            }));
            window.cities.each(function (city) {
                log(city.toJSON())
                // JSON.parse city.toJSON().map
            })
            return this;
        }
    });

    var HomeView = Backbone.View.extend({
        template: Hogan.compile($$home),
        tagName: 'section',
        id: 'home',
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

            this.city.set('name', $('#city-name', this.$el).val().toUpperCase());
            this.city.set('population', parseInt($('#city-population', this.$el).val(), 10));

            this.city.save();
            window.cities.add(this.city);
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

    var Router = Backbone.Router.extend({
        routes: {
            '': 'home',
        },
        home: function () {
            var homeView = new HomeView
            $('#main').html(homeView.render().el);
            $('input')[0].focus();
        }
    });

    var App = Backbone.View.extend({
       
        initialize: function () {


            this.router = new Router;

            var navView = new NavView;
            $('#cities').html(navView.render().el);
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
            var that = this;

            $(document).on('click', 'a', function () {
                urn = $(this).attr('href');
                that.router.navigate(urn, true);
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
