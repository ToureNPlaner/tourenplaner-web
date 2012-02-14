/**
 * The Map class is a wrapper around the OpenLayers.Map class which draws the map using OpenStreetMap data.
 * It also provides a few utility functions to simplify our use cases.
 */
window.Map = function (divId) {
    this.divId = divId;
};

_.extend(window.Map.prototype, {
    map: null,
    dataLayer: null,
    currentRouteString: null,
    routeFeature: null,

    /**
     * Returns the used instance of the OpenLayers.Map class.
     *
     * @return An instance of the OpenLayers.Map class
     */
    getMap: function () {
        return this.map;
    },

    /**
     * Initialize and draw the map using OSM data and our own tile server.
     */
    draw: function () {
        var that = this;

        OpenLayers.ImgPath = "img/openlayers/";
        this.map = new OpenLayers.Map("map", {
            projection: new OpenLayers.Projection("EPSG:4326")
        });
        
        var mapLayer = new OpenLayers.Layer.OSM("OSM Tiles", "http://gerbera.informatik.uni-stuttgart.de/osm/tiles/${z}/${x}/${y}.png", {
            numZoomLevels: 19
        });

        /* add maplayer and set center of the map */
        this.map.addLayer(mapLayer);

        /* create and add a layer for the markers and the route */
        this.dataLayer = new OpenLayers.Layer.Vector("Data");
        this.map.addLayer(this.dataLayer);
        this.map.setCenter(new OpenLayers.LonLat(1169980, 6640717), 6);

        /* SelectFeature for some simple opacity changes */
        var selectFeature = new OpenLayers.Control.SelectFeature(this.dataLayer, {
            hover: true,
            callbacks: {
                over: function (feature) {
                    feature.style.graphicOpacity = 1;
                    this.layer.drawFeature(feature);
                },
                out: function (feature) {
                    feature.style.graphicOpacity = 0.7;
                    this.layer.drawFeature(feature);
                }
            }
        });
        this.map.addControl(selectFeature);
        selectFeature.activate();

        /* DragFeature for drag and drop support of the markers */
        var controlFeature = new OpenLayers.Control.DragFeature(this.dataLayer, {
            geometryTypes: ['OpenLayers.Geometry.Point'],
            onStart: function(feature) {
               window.body.main.data.showMarker(feature.data.mark);
            },
            onComplete: function(feature, pix) {
                var lonlat = this.map.getLonLatFromPixel(pix);

                feature.data.mark.set({
                    lonlat: lonlat
                });
                feature.data.mark.findNearestNeighbour();
            }
        });
        this.map.addControl(controlFeature);
        controlFeature.activate();
    },

    /**
     * Removes the currently drawn route from the map.
     */
    resetRoute: function () {
        if (!_.isNull(this.routeFeature))
            this.dataLayer.removeFeatures([this.routeFeature]);
        this.currentRouteString = this.routeFeature = null;        
    },

    /**
     * Removes all currently drawn markers from the map.
     */
    resetMarkers: function () {
        // - remove all features (route and markers)
        // - then draw route back
        this.dataLayer.removeAllFeatures();
        if (!_.isNull(this.routeFeature))
            this.dataLayer.addFeatures(this.routeFeature);
    },

    /**
     * Forces Map to update itself.
     * Needed, when the div of this map is getting resized.
     */
    refresh: function () {
        this.map.updateSize();
    },

    /**
     * Draw the markers currently saved in markList.
     */
    drawMarkers: function () {
        var sourceIsTarget = window.body.main.algview.getSelectedAlgorithm().details.sourceIsTarget;
        for (var i = 0; i < markList.length; i++) {
            var mark = markList.at(i);
            var size = new OpenLayers.Size(21, 25);

            // Icons generated with: http://mapicons.nicolasmollet.com/numbers-letters/?style=default&custom_color=e89733
            var iconPath = 'img/mark.png';
            if (i === 0) {
                iconPath = 'img/startmark.png';
            } else if (!sourceIsTarget && i == markList.length - 1) {
                iconPath = 'img/targetmark.png';
            }

            var feature = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(mark.get('lonlat').lon, mark.get('lonlat').lat),
                {mark: mark},
                {externalGraphic: iconPath, graphicHeight: size.h, graphicWidth: size.w, graphicXOffset: -(size.w/2), graphicYOffset: -size.h, graphicOpacity: 0.7 }
            );
            this.dataLayer.addFeatures(feature);
        }
    },

    /**
     * Draws the route defined by a list of vertices.
     * 
     * @param vertexString List of vertices
     */
    drawRoute: function (vertexString) {
        // exit, when there is nothing to parse
        if (_.isNull(vertexString) || _.isUndefined(vertexString) || vertexString.length === 0) 
            return;
        this.resetRoute();
    	
        this.currentRouteString = vertexString;
    	
        // parse string of vertices
        var pointList = [];
        if (_.isString(vertexString))
            vertexString = JSON.parse(vertexString);

        var proj = new OpenLayers.Projection("EPSG:4326");
        for (var i = 0; i < vertexString.way.length; i++) {
            for (var j = 0; j < vertexString.way[i].length; j++){
                // transform points
                var p = vertexString.way[i][j];           
                var point = new OpenLayers.Geometry.Point(p.ln / 1e7, p.lt / 1e7);
                point.transform(proj, this.map.getProjectionObject());

                pointList.push(point);
            }
        }

        // draw route on a layer and add it to map
        var geometry = new OpenLayers.Geometry.LineString(pointList);
        this.routeFeature = new OpenLayers.Feature.Vector(geometry, null, {
            strokeColor: "#0000ff",
            strokeOpacity: 1.7,
            strokeWidth: 2.5
        });
        this.dataLayer.addFeatures(this.routeFeature);       
        this.zoomToRoute();
    },

    /**
     * Draw the markers and the route contained in an object returned by the server.
     *
     * @param obj A route object returned by the server
     */
    drawMarkersAndRoute: function(obj) {
        this.drawRoute(obj);
        window.markList.deleteAllMarks();

        var proj = new OpenLayers.Projection("EPSG:4326");
        for (var i in obj.points) {
            var ll = new OpenLayers.LonLat(obj.points[i].ln / 1e7, obj.points[i].lt / 1e7);
            ll.transform(proj, this.map.getProjectionObject());

            var m = new Mark({lonlat: ll});
            m.set(obj.points[i]);
            window.markList.appendMark(m);
        }
        this.drawMarkers();
    },
    
    /**
     * Returns the current route as a string.
     *
     * @return The current route as a stringified json object
     */
    getRoute: function() {
    	return this.currentRouteString;
    },

    /**
     * Centers and zooms the map to the given position and boundaries. 
     * This function is used by the Nominatim code. This is why the order of the bounding box may seem unintuitive.
     *
     * @param lonlat The longitude and latitude to center on
     * @param bb The bounding box to zoom to.
     */
    setCenter: function(lonlat, bb) {
        this.map.setCenter(this.transformFrom1984(new OpenLayers.LonLat(lonlat.lon, lonlat.lat)));

        if (arguments.length >= 2) {
            var bounds = new OpenLayers.Bounds(bb[2], bb[0], bb[3], bb[1]).transform(new OpenLayers.Projection("EPSG:4326"), this.map.getProjectionObject());
            this.map.zoomToExtent(bounds);
        }
    },

    /**
     * Zoom into map, so that the whole route is visible.
     */
    zoomToRoute: function() {
        if (!_.isNull(this.dataLayer.getDataExtent())) {
            this.map.zoomToExtent(this.dataLayer.getDataExtent());
        }
    },

    /**
     * Returns the geo coordinates for a pixel position on the map.
     *
     * @param posX The position on the x axis
     * @param posY The position on the y axis
     * @return A OpenLayers.LonLat object in 1984 projection
     */
    getLonLatFromPos: function (posX, posY) {
        var pixel = new OpenLayers.Pixel(posX, posY);
        var lonlat = this.map.getLonLatFromPixel(pixel);
        return this.transfromTo1984(lonlat);
    },

    /**
     * Transforms the given OpenLayers.LonLat object to the 1984 projection.
     *
     * @param lonlat The OpenLayers.LonLat object to transform
     * @return The object in 1984 projection
     */
    transformTo1984: function (lonlat) {
        var proj = new OpenLayers.Projection("EPSG:4326");
        var lonlatClone = lonlat.clone();
        lonlatClone.transform(this.map.getProjectionObject(), proj);

        return lonlatClone;
    },
    
    /**
     * Transforms the given OpenLayers.LonLat object from the 1984 projection to the map projection.
     *
     * @param lonlat The OpenLayers.LonLat object to transform
     * @return The object in map projection
     */
    transformFrom1984: function (lonlat) {
        var proj = new OpenLayers.Projection("EPSG:4326");
        var lonlatClone = lonlat.clone();
        lonlatClone.transform(proj, this.map.getProjectionObject());
        return lonlatClone;
    }
});
