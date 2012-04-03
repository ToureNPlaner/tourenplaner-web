window.RouteOverlay = Backbone.View.extend({
	
	id: 'route-overlay',

	events: {
		
	},

	initialize: function(data) {
		this.data = data;
	},

	render: function () {
		$('#algview').hide();

		var html = templates.routeOverlay();
		jQuery.each(this.data, function(i, val) {
			if (i === "distance" || i === "altitude") val = val / 1000 + " km"
			if (i === "time") val = Math.floor(val / 3600) + " h " + Math.floor((val - (Math.floor(val / 3600) * 3600)) / 60) + " min";
			i = i.charAt(0).toUpperCase() + i.slice(1);
			html += templates.routeOverlayAttribute({name: i, value: val});
		});

		this.$el.html(html);

		$('#main').append(this.el);

		var left = ($("#map").width() - this.$el.innerWidth()) / 2 + $("#sidebar").width();
		this.$el.css("left", left + "px");

		return this;
	},

	remove: function () {
		$(this.el).remove();
	}

});