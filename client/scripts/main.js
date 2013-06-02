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
