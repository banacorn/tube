define([
    'jquery',
    'backbone',
    'hogan',
    'map',
    'text!../../templates/create.html',
], function ($, Backbone, Hogan, Map, 
    $$create
) {

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

        saveMap: function () {
            var name = $('#input-name', this.el$).val();
            this.map.set('name', name);
            this.map.save();
        },

        focusNameInput: function () {
            setTimeout(function () {

                $('#input-name', this.$el).select();
            }, 0);
        }
    });

    return CreateView;
});