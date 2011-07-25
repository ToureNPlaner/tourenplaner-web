/**
 * FILE: Map
 * AUTHOR: Huy Viet Le
 * INFO: Initializes and draws an OpenLayer Map.
 * Provides methods for drawing a route etc.
 * not finished...
 */
function Map(divId) {	

	var vectorLayer, markerLayer, divId;


	/**
	 * drawMap
	 * Draws a Map in the Div named divId.
	 */
	this.drawMap = function (){
		map = new OpenLayers.Map("map");
		var mapLayer = new OpenLayers.Layer.OSM();

		/* add maplayer and set center of the map */
		map.addLayers([mapLayer]);
		map.setCenter(new OpenLayers.LonLat(0,0), 2);
	
		/* create and add vectorlayer */
		vectorLayer = new OpenLayers.Layer.Vector("Vectors");
		map.addLayer(vectorLayer);
		
		/* create and add a layer for markers */
		markerLayer = new OpenLayers.Layer.Markers( "Markers" );
		map.addLayer(markerLayer);
	}
	
	
	/**
	 * resetRoute
	 * Resets all Routes drawed in the vectorLayer 
	 */
	this.resetRoute = function() {
		this.vectorLayer.removeAllFeatures();
	}
	
	
	/**
	 * refresh
	 * Forces Map to update itself.
	 * Needed, when the div of this map getting resized
	 */
	this.refresh = function() {
		map.updateSize();
	}
	
	
	/**
	 * drawRoute()
	 * PARAM: List of Vertices
	 * Draws the Route defined by the list of vertices
	 */
	this.drawRoute = function(vertexString) {
		// parse string of vertices 
		var vertexList = vertexString.split("],[");
		vertexList[0] = vertexList[0].slice(1);
		vertexList[vertexList.length - 1] = vertexList[vertexList.length - 1].slice(0, vertexList[vertexList.length - 1].length - 1);
		
		var pointList = [];
		
		// Iterate over the list of vertices to create a list of Pointobjects
		for (var i = 0; i < vertexList.length; i++) {
			var splitted = vertexList[i].split(",");
			var lonlat = new OpenLayers.LonLat(splitted[0], splitted[1]);
			var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
			
			// get right projection
			var proj = new OpenLayers.Projection("EPSG:4326");
			point.transform(proj, map.getProjectionObject());
			lonlat.transform(proj, map.getProjectionObject());
			
			// set markers at the beginning and end of the route
			if (i == 0 || i == vertexList.length - 1) {
				var size = new OpenLayers.Size(21,25);
				var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
				var icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
				markerLayer.addMarker(new OpenLayers.Marker(lonlat, icon));
			}							
			pointList.push(point);
		}
				
		// draw route on a layer and add it to map
		var geometry = new OpenLayers.Geometry.LineString(pointList);
		var feature = new OpenLayers.Feature.Vector(geometry, null, {
			strokeColor: "#0000ff",
			strokeOpacity: 1.7,
			strokeWidth: 2.5
		});
		vectorLayer.addFeatures(feature);
		map.zoomToExtent(vectorLayer.getDataExtent(), false);
	}
		

	/**
	 * contextMenu()
	 * Creates Contextmenu and bind it to the map
	 */
	this.contextMenu = function() {
		// create menu in html as a list
		document.write('<ul id="myMenu" class="contextMenu">\
		<li>\
		    <a href="#getcoordinate">Position?</a>\
		</li>\
		<li>\
		    <a href="#action">Another action..</a>\
		</li>\
		<li>\
		    <a href="#bazinga">Bazinga!</a>\
		</li>\
		</ul>');

		// use created list for contextmenu
		$("#map").contextMenu({
			menu: 'myMenu'
		},
		function(action, el, pos) {
			switch(action) {
				// alert selected point as lonlat
				case "getcoordinate":
					var pixel = new OpenLayers.Pixel(pos.x, pos.y);
					var lonlat = map.getLonLatFromPixel(pixel);
			
					// convert to "correct" projection
					var proj = new OpenLayers.Projection("EPSG:4326");
					lonlat.transform(map.getProjectionObject(), proj);
			
					alert("Lon: " + lonlat.lon + "\nLat: " + lonlat.lat);
					break;
				default:
					alert("default action..");							
			}
		});
		
	}
} // end of map object

// create object and draws an example route
var mapObject = new Map('map');
mapObject.drawMap();
mapObject.contextMenu();
mapObject.drawRoute("[9.219390,48.680170,0.000000],[9.219080,48.680060,0.000000],[9.219080,48.680060,0.000000],[9.219190,48.679820,0.000000],[9.219700,48.679140,0.000000],[9.219810,48.678840,0.000000],[9.219810,48.678700,0.000000],[9.219810,48.678700,0.000000],[9.218010,48.678460,0.000000],[9.216390,48.678180,0.000000],[9.216210,48.678110,0.000000],[9.216210,48.678110,0.000000],[9.216430,48.677350,0.000000],[9.217050,48.676210,0.000000],[9.217050,48.676210,0.000000],[9.216960,48.676060,0.000000],[9.216670,48.675870,0.000000],[9.216390,48.674940,0.000000],[9.216180,48.674640,0.000000],[9.215950,48.674430,0.000000],[9.215380,48.674090,0.000000],[9.214870,48.673720,0.000000],[9.214500,48.673290,0.000000],[9.214130,48.672400,0.000000],[9.213890,48.671620,0.000000],[9.213600,48.671060,0.000000],[9.213360,48.670800,0.000000],[9.212360,48.669990,0.000000],[9.212360,48.669990,0.000000],[9.212200,48.669980,0.000000],[9.212210,48.669870,0.000000],[9.212280,48.669850,0.000000],[9.212390,48.669890,0.000000],[9.213250,48.669290,0.000000],[9.213250,48.669290,0.000000],[9.212990,48.669190,0.000000],[9.212910,48.669190,0.000000],[9.212370,48.669320,0.000000],[9.212190,48.669320,0.000000],[9.211310,48.669000,0.000000],[9.211160,48.668880,0.000000],[9.211160,48.668880,0.000000],[9.211040,48.668720,0.000000],[9.211180,48.668140,0.000000],[9.211180,48.667870,0.000000]");
