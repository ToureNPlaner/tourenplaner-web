/**
 * Binds contextmenu to map.
 */
document.write('<ul id="myMenu" class="contextMenu"><li><a href="#start">Setze Startpunkt</a></li><li><a href="#mark">Setze Punkt</a></li><li><a href="#target">Setze Zielpunkt</a></li></ul>');

function setContextMenu() {
    $("#main #map").contextMenu({
        menu: 'myMenu'
    }, function (action, el, pos) {
        switch (action) {
            // alert selected point as lonlat
        case "start":
            var pixel = new OpenLayers.Pixel(pos.x, pos.y);
            var lonlat = map.getLonLatFromPixel(pixel);
            var markList = window.mapModel.get("markList");
            var mark = markList.createStartMark();
            
            mark.lonlat = lonlat;
            mark.name = "Startknoten";

            var mapObject = window.mapModel.get("mapObject");
            mapObject.resetMarkers();
            mapObject.drawMarkers(markList.marks);
            
            $('#main #sidebar #start').val(mapObject.transformTo1984(lonlat));
            
            break;

        case "mark":
            var pixel = new OpenLayers.Pixel(pos.x, pos.y);
            var lonlat = map.getLonLatFromPixel(pixel);

            var markList = window.mapModel.get("markList");
            var mark = markList.addMark();
            mark.lonlat = lonlat;

            var mapObject = window.mapModel.get("mapObject");
            mapObject.resetMarkers();
            mapObject.drawMarkers(markList.marks);
            
            $('#main #sidebar #target').val(mapObject.transformTo1984(lonlat));
            
            break;

        case "target":
            var pixel = new OpenLayers.Pixel(pos.x, pos.y);
            var lonlat = map.getLonLatFromPixel(pixel);


            var markList = window.mapModel.get("markList");
            var mark = markList.createTargetMark();
            mark.lonlat = lonlat;
            mark.name = "Zielknoten";

            var mapObject = window.mapModel.get("mapObject");
            mapObject.resetMarkers();
            mapObject.drawMarkers(markList.marks);
            break;
        default:
            log("something went wrong with contextMenu! this is the default action.");
        }

    });
}
