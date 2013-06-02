define([
    'gaussian',
    'backbone',
], function (gaussian, Backbone) {

    var normal = function (mean, deviation) {
        mean = mean || 0;
        deviation = deviation || 1;
        return gaussian(mean, deviation).ppf(Math.random());
    };

    return Backbone.Model.extend({
        urlRoot: '/api/simulation',
        url: function () {
            return this.urlRoot + '/' + this.id;
        },
        
        defaults: {
            name: 'untitled',
            size: 40,
            population: 0,
            mapIn: [],
            mapOut: [],
            layer: 'both'
        },

        generate: function (core) {

            var size = this.get('size');
            var mapIn = new Uint16Array(size * size);
            var mapOut = new Uint16Array(size * size);
            var populationIn = 0;
            var populationOut = 0;

            var random = Math.random;

            var spinkle = function (mean, deviation, angle, population, out) {

                var cos = Math.cos;
                var sin = Math.sin;
                var factor = 0.10;
                var vector = {
                    x: normal(0, deviation.a) * factor,
                    y: normal(0, deviation.b) * factor
                };

                var rotate = function (vector, angle) {
                    return {
                        x: vector.x * cos(angle) - vector.y * sin(angle),
                        y: vector.x * sin(angle) + vector.y * cos(angle)
                    };
                };

                var transist = function (vector, offset) {
                    return {
                        x: vector.x + offset.x,
                        y: vector.y + offset.y
                    };
                };


                var floor = function (vector) {
                    return {
                        x: Math.floor(vector.x),
                        y: Math.floor(vector.y)
                    };
                };

                var scale = function (vector, factor) {
                    return {
                        x: vector.x * factor,
                        y: vector.y * factor
                    };
                };
            
                var coordinate = floor(scale(transist(rotate(vector, angle), mean), size));
                // punch on map

                if (
                    coordinate.x < 0 || 
                    coordinate.x >= size || 
                    coordinate.y < 0 ||
                    coordinate.y >= size
                ) return;

                var offset = coordinate.y * size + coordinate.x;
                if (out) {
                    populationOut += population;
                    mapOut[offset] += population;
                } else {
                    populationIn += population;
                    mapIn[offset] += population;
                }
            };

            var core = function (times, out) {
                
                times = times || 1000;

                // location, 0.2 ~ 0.8
                var center = { 
                    x: random() * 0.6 + 0.2,
                    y: random() * 0.6 + 0.2
                };

                // 2 dimension, b = 0.2a ~ 1.8a
                var a = random() + 0.2;
                var deviation = {
                    a: a,
                    b: a * (random() * 1.6 + 0.2)
                };

                // rotation angle, 0 ~ π
                var angle = Math.PI * random();
                for (var i = 0; i < times; i++) {
                    spinkle(center, deviation, angle, 200, out);
                }

            };


            var sprinkleTimes = Math.random() * 20;

            // spinkle pop out
            for (var i = 0; i < sprinkleTimes + 5; i++) {
                core(250, true);
            }

            // spinkle pop in
            for (var i = 0; i < sprinkleTimes; i++) {
                core(250, false);
            }

            // make up pop in
            while (populationIn != populationOut) {
                
                var center = { 
                    x: random() * 0.5 + 0.25,
                    y: random() * 0.5 + 0.25
                };

                // 2 dimension, b = 0.2a ~ 1.8a
                var a = random() * 2 + 1;
                var deviation = {
                    a: a,
                    b: a * (random() * 1 + 0.5)
                };
                var angle = Math.PI * random();

                spinkle(center, deviation, angle, 200, false);
            }

            this.set('population', populationIn);
            this.set('mapIn', Array.apply([], mapIn));
            this.set('mapOut', Array.apply([], mapOut));
            this.trigger('generated');
        }
    });
});