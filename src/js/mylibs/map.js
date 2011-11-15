window.Map = function (divId) {
    this.divId = divId;
}

_.extend(window.Map.prototype, {
    map: null,
    vectorLayer: null,
    markerLayer: null,

    getMap: function () {
        return this.map;
    },

    /**
     * Initialize and draw map
     */
    draw: function () {
        this.map = new OpenLayers.Map("map", {
            projection: new OpenLayers.Projection("EPSG:4326")
        });
        var mapLayer = new OpenLayers.Layer.OSM("OSM Tiles", "http://gerbera.informatik.uni-stuttgart.de/osm/tiles/${z}/${x}/${y}.png", {
            numZoomLevels: 19
        });

        /* add maplayer and set center of the map */
        this.map.addLayers([mapLayer]);

        /* create and add vectorlayer */
        this.vectorLayer = new OpenLayers.Layer.Vector("Vectors");
        this.map.addLayer(this.vectorLayer);

        /* create and add a layer for markers */
        this.markerLayer = new OpenLayers.Layer.Vector("Markers");
        this.map.addLayer(this.markerLayer);
        this.map.setCenter(new OpenLayers.LonLat(1169980, 6640717), 6);

        var that = this;
        var selectFeature = new OpenLayers.Control.SelectFeature(this.markerLayer, {
            hover: true,
            callbacks: {
                click: function (feature) {
                    log (feature);
                    window.mapModel.setDataViewMarker(feature.data.mark);
                },
                clickout: function () {
                    //window.mapModel.setDataViewMarker(null);
                },
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
    },

    /**
     * Resets all Routes drawed in the vectorLayer
     */
    resetRoute: function () {
        this.vectorLayer.removeAllFeatures();
    },

    /**
     * Reset all Markers drawed in markerLayer
     */
    resetMarkers: function () {
        this.markerLayer.removeAllFeatures();
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
            if (i == 0) {
                iconPath = 'img/startmark.png';
            } else if (i == markList.length - 1) {
                iconPath = 'img/targetmark.png';
            }

            var feature = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(mark.get('lonlat').lon, mark.get('lonlat').lat),
                {mark: mark},
                {externalGraphic: iconPath, graphicHeight: size.h, graphicWidth: size.w, graphicXOffset: -(size.w/2), graphicYOffset: -size.h, graphicOpacity: 0.7 }
            );
            this.markerLayer.addFeatures(feature);
        }
    },


    /**
     * Draws the route defined by list of vertices
     * PARAM: List of Vertices
     */
    drawRoute: function (vertexString) {
        // parse string of vertices
        var pointList = [];

        if (_.isString(vertexString))
            vertexString = JSON.parse(vertexString);

        for (var i = 0; i < vertexString.points.length; i++) {
            // transform points
            var p = vertexString.points[i];
            var lonlat = new OpenLayers.LonLat(p.ln / 1e7, p.lt / 1e7);
            var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);

            var proj = new OpenLayers.Projection("EPSG:4326");
            lonlat.transform(proj, this.map.getProjectionObject());
            point.transform(proj, this.map.getProjectionObject());

            if (i == 0) {
                var mark = new Mark();
                mark.set({
                    name: "Startmark"
                });
                mark.set({
                    lonlat: lonlat
                });

                window.markList.setStartMark(mark);
            }

            if (i != 0 && i == vertexString.points.length - 1) {
                var mark = new Mark();
                mark.set({
                    name: "Targetmark"
                });
                mark.set({
                    lonlat: lonlat
                });

                window.markList.setTargetMark(mark);
            }

            pointList.push(point);
        }

        this.drawMarkers(window.markList);
        // draw route on a layer and add it to map
        var geometry = new OpenLayers.Geometry.LineString(pointList);
        var feature = new OpenLayers.Feature.Vector(geometry, null, {
            strokeColor: "#0000ff",
            strokeOpacity: 1.7,
            strokeWidth: 2.5
        });
        this.vectorLayer.addFeatures(feature);
        this.map.zoomToExtent(this.markerLayer.getDataExtent());
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
    }
});
