define([
    'backbone',
], function (Backbone) {
    return Backbone.Model.extend({
        defaults: {
            size: 6,
            population: 0,
            mapIn: [],
            mapOut: []
        },
        generate: function (core) {

            var size = this.get('size');
            var mapIn = new Uint16Array(size * size);
            var mapOut = new Uint16Array(size * size);
            var populationIn = 0;
            var populationOut = 0;

            // patch squares on map
            // e.g. patch(mapIn, 100, 0, 0, 4, 4);
            var patch = function (out, n, x, y, w, h) {

                // boundary check
                w = x + w > size ? size - x : w;
                h = y + h > size ? size - y : h;

                // tweak population
                for (var j = 0; j < h; j++) {
                    for (var i = 0; i < w; i++) {
                        var offset = size * y + x + w * j + i;
                        if (out) {
                            populationOut += n - mapOut[offset];
                        } else {
                            populationIn += n - mapIn[offset];
                        }
                    }
                }

                // row
                var row = [];
                for (var i = 0; i < w; i++)
                    row.push(n);
                // set rows
                for (var i = 0; i < h; i++) {
                    var offset = size * (y + i) + x; 
                    if (out)
                        mapOut.set(row, offset);
                    else
                        mapIn.set(row, offset);
                }
            };

            // normal distribution
            var normalverteilung = function (times) {
                times = times || 20;
                var r = 0;
                for (var i = 0; i < times ; i++) {
                    r += Math.random();
                };
                return r / times;
            };

            var scale = function (r) {
                return Math.floor(r * size);
            }

            var core = function () {
                var coreX = scale(normalverteilung(2));
                var coreY = scale(normalverteilung(2));

                console.log(coreX, coreY);
            };

            var randomPatch = function (out, x, y) {

                var r = Math.random();

                if (r < 0.04) {
                    // type 3, population 800, 4%
                    var population = 800;
                    var factor = 0.2;
                } else if (r > 0.2) {
                    // type 1, population 50, 80%
                    var population = 50;
                    var factor = 0.8;
                } else {
                    // type 2, population 200, 16%
                    var population = 200;
                    var factor = 0.4;
                }

                var x = x || Math.floor(Math.random() * size);
                var y = y || Math.floor(Math.random() * size);
                var w = Math.floor(Math.random() * size * factor);
                var h = Math.floor(Math.random() * w * 2);
                
                if (out)
                    mapOut = patch(mapOut, -population, x, y, w, h);
                else
                    mapIn = patch(mapIn, population, x, y, w, h);
            }

            // // random stage
            // // seed until pOut > pIn
            // // then make up the difference with pIn hotpoint 
            // var round = 30;

            // // in
            // for (var i = 0; i < round; i++) {
            //     randomPatch(false);
            // }

            // // out
            // while (populationOut < populationIn) {
            //     randomPatch(true);
            // }

            // // in
            // while (true) {
            //     var x = Math.floor(Math.random() * size);
            //     var y = Math.floor(Math.random() * size);
            //     var difference = populationOut - populationIn;
            //     if (difference == 0)
            //         break;
            //     else if (difference < 1000) {
            //         mapIn.set([difference], y * size + x);
            //         populationIn += difference;
            //     } else {
            //         mapIn.set([difference], y * size + x);
            //         populationIn += 1000;
            //     }
            // }

            // patch(true, 100, 1, 1, 2, 2);
            // patch(true, 100, 2, 2, 2, 2);
            // patch(true, 200, 3, 3, 3, 3);



            // console.log('population in', populationIn);
            // console.log('population out', populationOut);
            // console.log(mapIn);
            // console.log(mapOut);

            core();

            this.set('population', populationIn);
            this.set('mapIn', mapIn);
            this.set('mapOut', mapOut);

        }
    });
});