function addMarker(action, evt) {
    var pixelx, pixely;
    pixelx = evt.pageX - $('#map').offset().left
    pixely = evt.pageY - $('#map').offset().top
    var pixel = new OpenLayers.Pixel(pixelx, pixely);
    var lonlat = window.mapModel.get("mapObject").getMap().getLonLatFromPixel(pixel);
    var mark = new Mark({
        "lonlat": lonlat
    });
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
	mark.findNearestNeighbour();
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
