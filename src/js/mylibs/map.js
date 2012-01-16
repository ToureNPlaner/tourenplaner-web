window.Map = function (divId) {
    this.divId = divId;
};

_.extend(window.Map.prototype, {
    map: null,
    dataLayer: null,
    currentRouteString: null,
    routeFeature: null,

    getMap: function () {
        return this.map;
    },

    /**
     * Initialize and draw map
     */
    draw: function () {
        OpenLayers.ImgPath = "img/openlayers/";
        this.map = new OpenLayers.Map("map", {
            projection: new OpenLayers.Projection("EPSG:4326")
        });
        
        var mapLayer = new OpenLayers.Layer.OSM("OSM Tiles", "http://gerbera.informatik.uni-stuttgart.de/osm/tiles/${z}/${x}/${y}.png", {
            numZoomLevels: 19
        });

        /* add maplayer and set center of the map */
        this.map.addLayers([mapLayer]);

        /* create and add a layer for markers */
        this.dataLayer = new OpenLayers.Layer.Vector("Markers");
        this.map.addLayer(this.dataLayer);
        this.map.setCenter(new OpenLayers.LonLat(1169980, 6640717), 6);

        var that = this;
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

        var controlFeature = new OpenLayers.Control.DragFeature(this.dataLayer, {
            //geometryTypes: ['OpenLayers.Feature.Vector'],
            onStart: function(feature) {
                window.mapModel.setDataViewMarker(feature.data.mark);
            },
            onComplete: function(feature, pix) {
                var lonlat = this.map.getLonLatFromPixel(pix);

                feature.data.mark.set({
                    lonlat: lonlat
                });
            }
        });
        this.map.addControl(controlFeature);
        controlFeature.activate();
    },

    /**
     * Resets all Routes drawed in the vectorLayer
     */
    resetRoute: function () {
        this.dataLayer.removeFeatures([this.routeFeature]);
        this.currentRouteString = this.routeFeature = null;        
    },

    /**
     * Reset all Markers drawed in dataLayer
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
     * Needed, when the div of this map getting resized
     */
    refresh: function () {
        this.map.updateSize();
    },

    /**
     * Draw markers given in markList
     */
    drawMarkers: function () {
        var markList = window.markList;
        for (var i = 0; i < markList.length; i++) {
            var mark = markList.at(i);
            var size = new OpenLayers.Size(21, 25);

            // Icons generated with: http://mapicons.nicolasmollet.com/numbers-letters/?style=default&custom_color=e89733
            var iconPath = 'img/mark.png';
            if (i === 0) {
                iconPath = 'img/startmark.png';
            } else if (i == markList.length - 1) {
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
     * Draws the route defined by list of vertices
     * PARAM: List of Vertices
     */
    drawRoute: function (vertexString) {
        // exit, when there is nothing to parse
        if (_.isNull(vertexString) || _.isUndefined(vertexString) || vertexString.length === 0) 
            return;
    
        // parse string of vertices
        var pointList = [];

        if (_.isString(vertexString))
            vertexString = JSON.parse(vertexString);

        var proj = new OpenLayers.Projection("EPSG:4326");
        for (var i = 0; i < vertexString.way.length; i++) {
            // transform points
            var p = vertexString.way[i];           
            var point = new OpenLayers.Geometry.Point(p.ln / 1e7, p.lt / 1e7);
            point.transform(proj, this.map.getProjectionObject());

            pointList.push(point);
        }

        //this.drawMarkers();
        // draw route on a layer and add it to map
        var geometry = new OpenLayers.Geometry.LineString(pointList);
        this.routeFeature = new OpenLayers.Feature.Vector(geometry, null, {
            strokeColor: "#0000ff",
            strokeOpacity: 1.7,
            strokeWidth: 2.5
        });
        this.dataLayer.addFeatures(this.routeFeature);       
        this.currentRouteString = vertexString;
    },

    setCenter: function(lonlat, bb) {
        this.map.setCenter(this.transformFrom1984(new OpenLayers.LonLat(lonlat.lon, lonlat.lat)));

        if (arguments.length >= 2) {
            var bounds = new OpenLayers.Bounds(bb[2], bb[0], bb[3], bb[1]).transform(new OpenLayers.Projection("EPSG:4326"), this.map.getProjectionObject());
            this.map.zoomToExtent(bounds);
        }
    },

    /**
     * Zoom into map, so that the whole route is visible
     */
    zoomToRoute: function() {
        if (!_.isNull(this.dataLayer.getDataExtent())) {
            this.map.zoomToExtent(this.dataLayer.getDataExtent());
        }
    },

    getLonLatFromPos: function (posX, posY) {
        var pixel = new OpenLayers.Pixel(posX, posY);
        var lonlat = this.map.getLonLatFromPixel(pixel);

        // convert to "correct" projection
        var proj = new OpenLayers.Projection("EPSG:4326");
        lonlat.transform(this.map.getProjectionObject(), proj);
        return lonlat;
    },

    transformTo1984: function (lonlat) {
        var proj = new OpenLayers.Projection("EPSG:4326");
        var lonlatClone = lonlat.clone();
        lonlatClone.transform(this.map.getProjectionObject(), proj);

        return lonlatClone;
    },
    
    transformFrom1984: function (lonlat) {
        var proj = new OpenLayers.Projection("EPSG:4326");
        var lonlatClone = lonlat.clone();
        lonlatClone.transform(proj, this.map.getProjectionObject());
        return lonlatClone;
    }
});
