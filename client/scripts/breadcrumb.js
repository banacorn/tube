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
            console.log('init bread');
            this.render();
        },

        render: function () {
            this.$el.html(this.template.render());
            return this;
        },

        home: function () {
            this.$el.html(this.template.render());
        },

        fuck: function () {
            this.$el.html(this.template.render({
                crumbs: [{
                    href: '/',
                    content: 'you'
                },{
                    href: '/',
                    content: 'you'
                }]
            }));
        }
    });
});