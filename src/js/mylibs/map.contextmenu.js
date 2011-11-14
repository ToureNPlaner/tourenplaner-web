/**
 * Binds contextmenu to map.
 */
function setContextMenu(map) {
    $("#main #map").contextMenu({
        menu: 'myMenu'
    }, function (action, el, pos) {
        switch (action) {
            // alert selected point as lonlat
        case "start":
            var pixel = new OpenLayers.Pixel(pos.x, pos.y);
            var lonlat = window.mapModel.get("mapObject").getMap().getLonLatFromPixel(pixel);
            var mark = new Mark();

            mark.set({
                "lonlat": lonlat
            });
            mark.set({
                "name": "Startknoten"
            });

            window.markList.setStartMark(mark);

            break;

        case "mark":
            var pixel = new OpenLayers.Pixel(pos.x, pos.y);
            var lonlat = window.mapModel.get("mapObject").getMap().getLonLatFromPixel(pixel);

            var mark = new Mark();
            mark.set({
                "lonlat": lonlat
            });

            window.markList.appendMark(mark);
            break;

        case "target":
            var pixel = new OpenLayers.Pixel(pos.x, pos.y);
            var lonlat = window.mapModel.get("mapObject").getMap().getLonLatFromPixel(pixel);

            var mark = new Mark();
            mark.set({
                "lonlat": lonlat
            });
            mark.set({
                "name": "Zielknoten"
            });

            window.markList.setTargetMark(mark);
            break;
        default:
            log("something went wrong with contextMenu! this is the default action.");
        }

    });
}
