define([
    'jquery',
    'backbone',
    'hogan',
    '../model/map'
], function ($, Backbone, Hogan,
    Map
) {
    var MapView = Backbone.View.extend({
        tagName: 'canvas',
        className: 'simulation-map',
        initialize: function () {
            var self = this;
            if (this.model) {
                this.listenTo(this.model, 'generated', this.render);
            } else {
                this.model = new Map;
                this.listenTo(this.model, 'generated', this.render);
                this.model.generate(1);
            }


            if (this.attributes)
                this.canvasSize = this.attributes.width;
            else
                this.canvasSize = 400
            this.render();

            this.model.on('change', function () {
                self.render();
            })
        },

        render: function () {
            var canvas = this.$el.get(0);
            if (canvas) {
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
                var size        = this.model.get('size');
                var population  = this.model.get('population');
                var mapIn       = this.model.get('mapIn');
                var mapOut      = this.model.get('mapOut');
                var tileSize    = this.canvasSize / size;
                var layer       = this.model.get('layer') || 'both';
                for (var y = 0; y < size; y++) {
                    for (var x = 0; x < size; x++) {
                        var offset = y * size + x;
                        var populationIn = mapIn[offset];
                        var populationOut = mapOut[offset];

                        if (populationIn == undefined || populationOut == undefined || populationIn + populationOut == 0) {
                            ctx.fillStyle = "none";
                        } else {
                            var base = 4000;
                            var populationHere = 0;
                            switch (layer) {
                                case "both":
                                    populationHere = populationIn + populationOut;
                                    break;
                                case "in":
                                    populationHere = populationIn;
                                    break;
                                case "out":
                                    populationHere = populationOut;
                                    break;
                            }
                            var hue = 120 - 120 * populationHere / base;
                            var transparancy = populationHere == 0 ? 0 : (populationHere / base) + 0.5;
                            ctx.fillStyle =  "hsla(" + hue + ", 80%, 70%, " + transparancy +")";
                            // ctx.fillStyle =  "hsla(30, 80%, 70%, 1)";
                        }
                        // console.log(tileSize * x, tileSize * y, tileSize, tileSize);
                        ctx.fillRect(
                            tileSize * x, 
                            tileSize * y, 
                            tileSize,
                            tileSize
                        );
                    }
                }
            }

            return this;

        }
    });



    return MapView;


});