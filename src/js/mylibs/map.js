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
        this.map.setCenter(new OpenLayers.LonLat(0, 0), 4);

        /* create and add vectorlayer */
        this.vectorLayer = new OpenLayers.Layer.Vector("Vectors");
        this.map.addLayer(this.vectorLayer);

        /* create and add a layer for markers */
        this.markerLayer = new OpenLayers.Layer.Markers("Markers");
        this.map.addLayer(this.markerLayer);
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
        this.markerLayer.clearMarkers();
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
            var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);

            // Icons generated with: http://mapicons.nicolasmollet.com/numbers-letters/?style=default&custom_color=e89733
            var iconPath = 'img/mark.png';
            if (i == 0) {
                iconPath = 'img/startmark.png';
            } else if (i == markList.length - 1 && i > 0) {
                iconPath = 'img/targetmark.png';
            }
            var icon = new OpenLayers.Icon(iconPath, size, offset);


            var marker = new OpenLayers.Marker(mark.get("lonlat"), icon);

            // associate click event
            marker.events.register('mousedown', marker, function (evt) {
                // clone lonlat object of this marker and transform it into epsg-4326			
                var lonlatClone = this.lonlat.clone();
                var proj = new OpenLayers.Projection("EPSG:4326");
                lonlatClone.transform(this.map.getProjectionObject(), proj);

                var mark = markList.getMarkByLonLat(this.lonlat);

                // trigger bind of mapModel to display lonlat in DataViewBox
                window.mapModel.setDataViewMarker(mark);
            });

            // opacity stuff
            marker.setOpacity(0.9);
            marker.events.register('mouseover', marker, function (evt) {
                this.setOpacity(1.0);
            });

            marker.events.register('mouseout', marker, function (evt) {
                this.setOpacity(0.9);
            });

            this.markerLayer.addMarker(marker);
        }
    },


    /**
     * Draws the route defined by list of vertices
     * PARAM: List of Vertices
     */
    drawRoute: function (vertexString) {
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
            lonlat.transform(proj, this.map.getProjectionObject());
            point.transform(proj, this.map.getProjectionObject());

            if (i == 0) {
                var mark = new Mark();
                mark.set({
                    name: "Startpunkt"
                });
                mark.set({
                    lonlat: lonlat
                });

                window.markList.setStartMark(mark);
            }

            if (i != 0 && i == vertexList.length - 1) {
                var mark = new Mark();
                mark.set({
                    name: "TargetMark"
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
        this.map.zoomToExtent(this.vectorLayer.getDataExtent(), false);
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
