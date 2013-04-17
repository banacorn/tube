define([
    'backbone', 
    'jquery',
    'hogan',
    'text!../templates/breadcrumb.html'
], function (Backbone, $, Hogan, $$breadcrumb) {
    return Backbone.View.extend({

        tagName: 'nav',
        template: Hogan.compile($$breadcrumb),
        id: 'nav',

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template.render());
            return this;
        },

        home: function () {
            this.$el.html(this.template.render({
                home: true
            }));
        },

        create: function () {
            this.$el.html(this.template.render({
                create: true
            }));
        },

        about: function () {
            this.$el.html(this.template.render({
                about: true
            }));
        }
    });
});