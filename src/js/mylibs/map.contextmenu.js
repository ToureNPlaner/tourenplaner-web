function addMarker(action, evt) {
    var pixel = new OpenLayers.Pixel(evt.layerX, evt.layerY);
    var lonlat = window.mapModel.get("mapObject").getMap().getLonLatFromPixel(pixel);
    var mark = new Mark({
        "lonlat": lonlat
    });
    // get nearest neighbour
    window.api.nearestNeighbour({
    	points: lonlat,
    	callback: function(text, success){
    		if(success)
				mark.set({points: text.points[0]});
			else
				log("Nearest Nabour Search wasn't successful. No points updated");

			switch (action) {
				// alert selected point as lonlat
                case "start":
                    window.markList.setStartMark(mark);
                    alert("lonlat: "+mark.get("lonlat"));
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
        title: "Markers",
        items: function (evt) {
            var feature = window.mapModel.get('mapObject').dataLayer.getFeatureFromEvent(evt);

            // if it's a marker
            if (feature && (feature.attributes.mark != undefined)) {
                return [
                    {label: 'Set as Startmarker', icon: 'img/startmark.png', action: function (evt) { editMarker('start', feature); }},
                    {label: 'Set as Endmarker', icon: 'img/targetmark.png', action: function (evt) { editMarker('end', feature); }},
                    null,
                    {label: "Delete", action: function (evt) { editMarker('delete', feature) }}
                ];
            } else {
                return [
                    {label: "Add Startmarker", icon: 'img/startmark.png', action: function (evt) { addMarker("start", evt); }},
                    {label: "Add Marker", icon: 'img/mark.png', action: function (evt) {  addMarker("mark", evt); }},
                    {label: "Add Endmarker", icon: 'img/targetmark.png', action: function (evt) { addMarker("target", evt); }}
                ];
            }
        }
    });
}
