define([
    'backbone'
], function (Backbone) {

    return Backbone.Model.extend({
        urlRoot: '/api/simulation',
        url: function () {
            return this.urlRoot + '/' + this.id;
        }
    });
});