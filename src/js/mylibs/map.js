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
     * Constructor
     * Draws a Map in the Div named divId.
     */
    map = new OpenLayers.Map("map");
    var mapLayer = new OpenLayers.Layer.OSM();

    /* add maplayer and set center of the map */
    map.addLayers([mapLayer]);
    map.setCenter(new OpenLayers.LonLat(0,0), 4);

    /* create and add vectorlayer */
    vectorLayer = new OpenLayers.Layer.Vector("Vectors");
    map.addLayer(vectorLayer);
    
    /* create and add a layer for markers */
    markerLayer = new OpenLayers.Layer.Markers( "Markers" );
    map.addLayer(markerLayer);


    
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
        
      
      this.getLonLatFromPos = function (posX, posY) {
        var pixel = new OpenLayers.Pixel(posX, posY);
        var lonlat = map.getLonLatFromPixel(pixel);
        
        // convert to "correct" projection
        var proj = new OpenLayers.Projection("EPSG:4326");
        lonlat.transform(map.getProjectionObject(), proj);
        return lonlat;
    }
} // end of map object