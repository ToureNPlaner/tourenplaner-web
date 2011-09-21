/**
 * Binds contextmenu to map.
 */
document.write('<ul id="myMenu" class="contextMenu"><li><a href="#getcoordinate">get coordinates.</a></li><li><a href="#start">Startposition</a></li><li><a href="#target">Targetposition</a></li></ul>');

function setContextMenu() {
	 $("#main #map").contextMenu({
	       menu: 'myMenu'
       },
       function(action, el, pos) {
	       switch(action) {
		       // alert selected point as lonlat
		       case "getcoordinate":
			       var lonlat = mapObject.getLonLatFromPos(pos.x, pos.y);
			       alert("Lon: " + lonlat.lon + "\nLat: " + lonlat.lat);
			       break;
		       case "start":
			       var pixel = new OpenLayers.Pixel(pos.x, pos.y);
			       var lonlat = map.getLonLatFromPixel(pixel);
			       
			       // convert to "correct" projection
			       var proj = new OpenLayers.Projection("EPSG:4326");
			       lonlat.transform(map.getProjectionObject(), proj);
			       
			       $('#main #sidebar form #start').val(lonlat.lon + "," + lonlat.lat);
			       break;
			       
		       case "target":
			       var pixel = new OpenLayers.Pixel(pos.x, pos.y);
			       var lonlat = map.getLonLatFromPixel(pixel);
			       
			       // convert to "correct" projection
			       var proj = new OpenLayers.Projection("EPSG:4326");
			       lonlat.transform(map.getProjectionObject(), proj);
			       
			       $('#main #sidebar form #target').val(lonlat.lon + "," + lonlat.lat);
			       break;
		       default:
			       log("something went wrong with contextMenu! default action.");
	       }
       });
}