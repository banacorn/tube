define([
    'jquery',
    'backbone',
    'hogan',
    'map',
    '../view/map',
    'text!../../templates/create.html',
], function ($, Backbone, Hogan, Map, 
    MapView,
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
            var viewSize = 400;
            this.mapView = new MapView({
                model: this.map,
                attributes: {
                    width: viewSize,
                    height: viewSize
                }
            });
            $('#create-map', this.$el).html(this.mapView.el);

            this.map.generate(1);

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