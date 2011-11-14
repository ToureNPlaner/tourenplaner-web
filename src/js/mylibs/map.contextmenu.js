/**
 * Binds contextmenu to map.
 */
function setContextMenu(map) {
    $("#main #map").contextMenu({
        menu: 'myMenu'
    }, function (action, el, pos) {
        var pixel = new OpenLayers.Pixel(pos.x, pos.y);
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
        }

    });
}
