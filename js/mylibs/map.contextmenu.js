/**
 * Callback function for the contextmenu when adding a marker.
 * Will add a marker at the given pixel position.
 *
 * @param action The name of the event triggered by the contextmenu
 * @param evt The event object
 */
function addMarker(action, evt) {
    var maxpoints = window.body.main.algview.getSelectedAlgorithm().details.maxpoints;
    if (!_.isUndefined(maxpoints) && maxpoints <= window.markList.length) {
        new MessageView({title: $._('Too many points'), message: $._('The algorithm doesn\'t allow any more points.')}).render();
        return;
    }

    var latlng = window.map.getMap().mouseEventToLatLng(evt);
    var mark = new Mark({
        lonlat: latlng
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
            window.markList.remove(marker);
            break;
        case 'start':
            window.markList.setStartMark(marker);
            break;
        case 'end':
            window.markList.setTargetMark(marker);
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
            var ret = [
                {label: $._("Add Startmarker"), icon: 'img/startmark_quad.png', action: function (evt) { addMarker("start", evt); }},
                {label: $._("Add Marker"), icon: 'img/mark_quad.png', action: function (evt) {  addMarker("mark", evt); }}                    
            ];
            if (!window.body.main.algview.getSelectedAlgorithm().details.sourceistarget)
                ret.push({label: $._("Add Endmarker"), icon: 'img/targetmark_quad.png', action: function (evt) { addMarker("target", evt); }});
            return ret;            
        }
    });
}

function setMarkerMenu() {
        $('#main #map .leaflet-marker-icon').contextPopup({
        title: $._("Marker"),
        items: function (evt) {
            var marker = window.map.getMarkerForPoint(evt.target._leaflet_pos);
            var ret = [
                {label: $._('Set as Startmarker'), icon: 'img/startmark_quad.png', action: function (evt) { editMarker('start', marker.mark); }},
                null,
                {label: $._("Delete"), action: function (evt) { editMarker('delete', marker.mark); }}
            ];
            if (!window.body.main.algview.getSelectedAlgorithm().details.sourceistarget)
                ret.splice(1, 0, {label: $._('Set as Endmarker'), icon: 'img/targetmark_quad.png', action: function (evt) { editMarker('end', marker.mark); }});
            return ret;
        }
    });
}
