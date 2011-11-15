function addMarker(action, evt) {
    var pixel = new OpenLayers.Pixel(evt.layerX, evt.layerY);
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
            var feature = window.mapModel.get('mapObject').markerLayer.getFeatureFromEvent(evt);
            if (feature) {
                return [
                    {label: 'Set as Startmarker', action: function (evt) { editMarker('start', feature); }},
                    {label: 'Set as Endmarker', action: function (evt) { editMarker('end', feature); }},
                    null,
                    {label: "Delete", action: function (evt) { editMarker('delete', feature) }}
                ];
            } else {
                return [
                    {label: "Add Startmarker", action: function (evt) { addMarker("start", evt); }},
                    {label: "Add Marker", action: function (evt) {  addMarker("mark", evt); }},
                    {label: "Add Endmarker", action: function (evt) { addMarker("target", evt); }}
                ];
            }
        }
    });
}
