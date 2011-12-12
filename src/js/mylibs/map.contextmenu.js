function addMarker(action, evt) {
    var pixel = new OpenLayers.Pixel(evt.layerX, evt.layerY);
    var lonlat = window.mapModel.get("mapObject").getMap().getLonLatFromPixel(pixel);
    var mark = new Mark({
        "lonlat": lonlat
    });
    var pointString = mark.toJSON();
    // get nearest neighbour
    window.api.nearestNeighbour({
    	points: pointString,
    	callback: function(text, success){
    		if(success){
    			var tempLon = text.points[0].ln / 1e7;
    			var tempLat = text.points[0].lt / 1e7;
    			var mark_center = new OpenLayers.LonLat(tempLon,tempLat);
    			var p1984 = new OpenLayers.Projection("EPSG:4326");
				var pMap = new OpenLayers.Projection("EPSG:3857");
    			mark_center.transform(p1984,pMap);
    			mark.set({'lonlat':mark_center});
			}
			else
				log("Nearest Nabour Search wasn't successful. No points updated");

			switch (action) {
				// alert selected point as lonlat
                case "start":
                    window.markList.setStartMark(mark);
                    break;

                case "mark":
                    window.markList.appendMark(mark);
                    break;

                case "target":
                    window.markList.setTargetMark(mark);
                    break;

                default:
                    log("Something went wrong with contextMenu! This is the default action.");
			};

		}
    });
}

function editMarker(action, marker) {
    switch (action) {
        case 'delete':
            window.markList.remove(marker.data.mark);
            break;
        case 'start':
            window.markList.setStartMark(marker.data.mark);
            break;
        case 'end':
            window.markList.setTargetMark(marker.data.mark);
            break;
    };
}

/**
 * Binds contextmenu to map.
 */
function setContextMenu(map) {
    $('#main #map').contextPopup({
        title: $._("Markers"),
        items: function (evt) {
            var feature = window.mapModel.get('mapObject').dataLayer.getFeatureFromEvent(evt);

            // if it's a marker
            if (feature && !_.isUndefined(feature.attributes.mark)) {
                return [
                    {label: $._('Set as Startmarker'), icon: 'img/startmark.png', action: function (evt) { editMarker('start', feature); }},
                    {label: $._('Set as Endmarker'), icon: 'img/targetmark.png', action: function (evt) { editMarker('end', feature); }},
                    null,
                    {label: $._("Delete"), action: function (evt) { editMarker('delete', feature) }}
                ];
            } else {
                return [
                    {label: $._("Add Startmarker"), icon: 'img/startmark.png', action: function (evt) { addMarker("start", evt); }},
                    {label: $._("Add Marker"), icon: 'img/mark.png', action: function (evt) {  addMarker("mark", evt); }},
                    {label: $._("Add Endmarker"), icon: 'img/targetmark.png', action: function (evt) { addMarker("target", evt); }}
                ];
            }
        }
    });
}
