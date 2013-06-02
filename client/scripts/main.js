require.config({
    shim: {
        io: [],
        main: {
            deps: ['storage', 'router'],
            init: function () {
                console.log('fuck')
            }
        }
    },

    paths: {
        jquery      : 'jam/jquery/dist/jquery',
        io          : '/socket.io/socket.io',
        storage     : 'storage',
        router      : 'router',
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
    'router'
], function (
    $, Backbone, io, Hogan,
    Storage, ROUTER
) {
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
