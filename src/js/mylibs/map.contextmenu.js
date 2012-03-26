/**
 * Callback function for the contextmenu when adding a marker.
 * Will add a marker at the given pixel position.
 *
 * @param action The name of the event triggered by the contextmenu
 * @param evt The event object
 */
function addMarker(action, evt) {
    var latlng = window.map.getMap().mouseEventToLatLng(evt);
    log(latlng);
    var mark = new Mark({
        "lonlat": latlng
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
	}
	mark.findNearestNeighbour();
}

/**
 * Callback function for the contextmenu when a marker is selected.
 *
 * @param action The name of the event triggered by the contextmenu
 * @param marker The Feature that is currently selected
 */
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
    }
}

/**
 * Displays the contextmenu on top of the map when requested.
 */
function setContextMenu() {
    $('#main #map').contextPopup({
        title: $._("Markers"),
        items: function (evt) {
            var feature = null; //window.map.dataLayer.getFeatureFromEvent(evt);
            var sourceIsTarget = window.body.main.algview.getSelectedAlgorithm().details.sourceistarget;

            // if it's a marker
            if (feature && !_.isUndefined(feature.attributes.mark)) {
                var ret = [
                    {label: $._('Set as Startmarker'), icon: 'img/startmark.png', action: function (evt) { editMarker('start', feature); }},
                    null,
                    {label: $._("Delete"), action: function (evt) { editMarker('delete', feature); }}
                ];
                if (!sourceIsTarget)
                    ret.splice(1, 0, {label: $._('Set as Endmarker'), icon: 'img/targetmark.png', action: function (evt) { editMarker('end', feature); }});
                return ret;
            } else {
                var ret = [
                    {label: $._("Add Startmarker"), icon: 'img/startmark.png', action: function (evt) { addMarker("start", evt); }},
                    {label: $._("Add Marker"), icon: 'img/mark.png', action: function (evt) {  addMarker("mark", evt); }}                    
                ];
                if (!sourceIsTarget)
                    ret.push({label: $._("Add Endmarker"), icon: 'img/targetmark.png', action: function (evt) { addMarker("target", evt); }});
                return ret;
            }
        }
    });
}
