/**
 * Implements the Nominatim API offered by OpenStreetMap for address lookups.
 */
window.Nominatim = function() {
	
};

_.extend(window.Nominatim.prototype, {

	/** The url of the API */
	url: 'http://nominatim.openstreetmap.org/search.php',

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
        query = str_replace(['ä', 'ü', 'ö', 'Ä', 'Ü', 'Ö', 'ß'], ['ae', 'ue', 'oe', 'Ae', 'Ue', 'Oe', 'ss'], query);

		var data = {q: query};
		_.extend(data, this.params);

		$.ajax(this.url, {
            type: 'get',
			data: data,
			cache: false,
			accepts: 'json',
			dataType: 'json',
            success: function(data, status, jqXHR) {
            	callback(true, data);
            },
            error: function(jqXHR, status, error) {
            	callback(false, error);
            }
		});
	}

});