window.Nominatim = function() {
	
};

_.extend(window.Nominatim.prototype, {

	url: 'http://nominatim.openstreetmap.org/search',

	params: {
		format: 'json',
		countrycodes: 'de',
		addressdetails: 1
	},
	
	search: function (query, callback) {
		var data = {q: encodeURIComponent(query)};
		_.extend(data, this.params);

		$.ajax(this.url, {
			data: data,
			cache: false,
			accepts: 'json',
			dataType: 'json',
            success: function(data, status, jqXHR) {
            	log(data, status);
            	callback(true, data);
            },
            error: function(jqXHR, status, error) {
            	log(status, error);
            	callback(false, error);
            }
		});
	}

});