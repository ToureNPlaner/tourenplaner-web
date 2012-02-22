window.RouteOverlay = Backbone.View.extend({
	
	id: 'route-overlay',

	events: {
		
	},

	initialize: function(data) {
		this.data = data;
	},

	render: function () {
		this.$el.html(templates.routeOverlay(this.data));
		$('#main').append(this.el);

		var left = ($(window).width() - this.$el.innerWidth()) / 2;
		this.$el.css("left", left + "px");

		return this;
	},

	remove: function () {
		$(this.el).remove();
	}

});