/**
 * Implements the Nominatim API offered by OpenStreetMap for address lookups.
 */
window.Nominatim = function() {
	
};

_.extend(window.Nominatim.prototype, {

	/** The url of the API */
	url: 'http://nominatim.openstreetmap.org/search',

	/** Standard parameters given to the API */
	params: {
		format: 'json',
		countrycodes: 'de',
		addressdetails: 1
	},
	
	/** 
	 * Search for the given query using the Nominatim API
	 *
	 * @param query The address to lookup
	 * @param callback Function called when the lookup has finished
	 */
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