/**
 * The Map class is a wrapper around the OpenLayers.Map class which draws the map using OpenStreetMap data.
 * It also provides a few utility functions to simplify our use cases.
 */
window.Map = function (divId) {
    this.divId = divId;
};

StartMarker = L.Icon.extend({
    iconUrl: 'img/startmark.png',
    shadowUrl: null,
    iconSize: new L.Point(24, 36),
    iconAnchro: new L.Point(0, 0)    
});

Marker = L.Icon.extend({
    iconUrl: 'img/mark.png',
    shadowUrl: null,
    iconSize: new L.Point(24, 36),
    iconAnchro: new L.Point(0, 0)    
});

TargetMarker = L.Icon.extend({
    iconUrl: 'img/targetmark.png',
    shadowUrl: null,
    iconSize: new L.Point(24, 36),
    iconAnchro: new L.Point(0, 0)    
});

_.extend(window.Map.prototype, {
    map: null,
    currentRouteString: null,
    routeFeature: null,
    markers: [],

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

        this.map = new L.Map("map");

        var mapLayer = new L.TileLayer('http://gerbera.informatik.uni-stuttgart.de/osm/tiles/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            maxZoom: 19
        });

        this.map.addLayer(mapLayer);

        /* add maplayer and set center of the map */
        this.map.setView(new L.LatLng(49, 9), 6).addLayer(mapLayer);


        /* SelectFeature for some simple opacity changes */
 /*       var selectMarkerFeature = new OpenLayers.Control.SelectFeature(this.dataLayer, {
            geometryTypes: ['OpenLayers.Geometry.Point'],
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
        this.map.addControl(selectMarkerFeature);
        selectMarkerFeature.activate();

        /* DragFeature for drag and drop support of the markers 
        var controlFeature = new OpenLayers.Control.DragFeature(this.dataLayer, {
            geometryTypes: ['OpenLayers.Geometry.Point'],
            onStart: function(feature) {
               window.body.main.data.showMarker(feature.data.mark);
            },
            onComplete: _.bind(this.onDragComplete, this)
        });
        this.map.addControl(controlFeature);
        controlFeature.activate(); */
    },

    onDragComplete: function(feature, pix) {
        var lonlat = this.map.getLonLatFromPixel(pix);

        feature.data.mark.set({
            lonlat: lonlat
        }, {silent: true});

        var alg = window.algview.getSelectedAlgorithm().urlsuffix;
        if (_.isUndefined(alg) || _.isEmpty(alg) || 
                window.markList.length < window.algview.getSelectedAlgorithm().details.minpoints ||
                window.markList.length > window.algview.getSelectedAlgorithm().details.maxpoints) {
            // Only send a nns request if we're not requesting the whole route (which would also return the nns)
            feature.data.mark.findNearestNeighbour();
        } else {
            loadingView = new LoadingView($._('Waiting for response from server ...')).render();
            
            var jsonObj = {
                alg: window.algview.$('input[@name=alg]:checked').val(),
                points: window.markList.toJSON(),
                callback: function (text, success) {
                    if (success) {
                        for (var i = 0; i < text.points.length; i++) {
                            var pos = text.points[i].position;
                            if (pos < window.markList.length) {
                                window.markList.moveMark(window.markList.at(pos), i);
                            }
                        }

                        window.map.drawRoute(text);
                        if (!_.isUndefined(text.requestid))
                            window.app.navigate('route/' + text.requestid);
                    }
                    loadingView.remove();
                }
            };

            // if constraints are available, then add them to request object
            var constraints = window.algview.getConstraintSettings();
            if (constraints != null) {
                jsonObj['constraints'] = constraints;
            }

            window.api.alg(jsonObj);
        }
    },

    /**
     * Removes the currently drawn route from the map.
     */
    resetRoute: function () {
        if (!_.isNull(this.routeFeature)) {
            this.map.removeLayer(this.routeFeature);
            this.routeOverlay.remove();
        }
            
        this.currentRouteString = this.routeFeature = null;        
    },

    /**
     * Removes all currently drawn markers from the map.
     */
    resetMarkers: function () {
        // - remove all features (route and markers)
        // - then draw route back
        if (this.markers.length > 0) {
            for (var i = 0; i < this.markers.length; ++i)
                this.map.removeLayer(this.markers[i]);
            this.markers = [];
        }
        
        if (!_.isNull(this.routeFeature)) {
            this.dataLayer.addFeatures(this.routeFeature);
        }            
    },

    /**
     * Forces Map to update itself.
     * Needed, when the div of this map is getting resized.
     */
    refresh: function () {
        this.map.invalidateSize();
    },

    /**
     * Draw the markers currently saved in markList.
     */
    drawMarkers: function () {
        var sourceIsTarget = window.body.main.algview.getSelectedAlgorithm().details.sourceistarget;
        for (var i = 0; i < markList.length; i++) {
            var mark = markList.at(i);

            var icon;
            if (i === 0) {
                icon = new StartMarker();
            } else if (!sourceIsTarget && i == markList.length - 1) {
                icon = new TargetMarker();
            } else {
                icon = new Marker();
            }

            log(mark);
            var marker = new L.Marker(new L.LatLng(mark.get("lonlat").lat, mark.get("lonlat").lng), {icon: icon, draggable: true});
            this.map.addLayer(marker);
            this.markers.push(marker);
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

        //var proj = new OpenLayers.Projection("EPSG:4326");
        for (var i = 0; i < vertexString.way.length; i++) {
            for (var j = 0; j < vertexString.way[i].length; j++) {
                // transform points
                var p = vertexString.way[i][j];           
                //var point = new OpenLayers.Geometry.Point(p.ln / 1e7, p.lt / 1e7);
                //point.transform(proj, this.map.getProjectionObject());

                pointList.push(new L.LatLng(p.lt / 1e7, p.ln / 1e7));
            }
        }

        // draw route on a layer and add it to map
        this.routeFeature = new L.Polyline(pointList, {color: 'blue'});
        this.map.addLayer(routeFeature);
        this.map.fitBounds(new L.LatLngBounds(pointList));

        this.displayRouteInfo();
    },

    /**
     * Draw the markers and the route contained in an object returned by the server.
     *
     * @param obj A route object returned by the server
     */
    drawMarkersAndRoute: function(obj) {
        this.drawRoute(obj);
        window.markList.deleteAllMarks();

        //var proj = new OpenLayers.Projection("EPSG:4326");
        for (var i in obj.points) {
            //var ll = new OpenLayers.LonLat(obj.points[i].ln / 1e7, obj.points[i].lt / 1e7);
            //ll.transform(proj, this.map.getProjectionObject());
            var ll = new L.LatLng(obj.points[i].lt / 1e7, obj.points.ln / 1e7)

            var m = new Mark({lonlat: ll});
            m.set(obj.points[i]);
            window.markList.appendMark(m);
        }
        this.drawMarkers();
    },

    displayRouteInfo: function () {
        if ($('#route-overlay').length > 0)
            this.routeOverlay.remove();

        var data = this.currentRouteString;
        if (_.isString(this.currentRouteString))
            data = JSON.parse(this.currentRouteString);

        data = data.misc;
        this.routeOverlay = new RouteOverlay(data).render();
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
    /*    this.map.setCenter(this.transformFrom1984(new OpenLayers.LonLat(lonlat.lon, lonlat.lat)));

        if (arguments.length >= 2) {
            var bounds = new OpenLayers.Bounds(bb[2], bb[0], bb[3], bb[1]).transform(new OpenLayers.Projection("EPSG:4326"), this.map.getProjectionObject());
            this.map.zoomToExtent(bounds);
        } */
    },

    /**
     * Returns the geo coordinates for a pixel position on the map.
     *
     * @param posX The position on the x axis
     * @param posY The position on the y axis
     * @return A OpenLayers.LonLat object in 1984 projection
     */
    getLonLatFromPos: function (posX, posY) {
        // var pixel = new OpenLayers.Pixel(posX, posY);
        // var lonlat = this.map.getLonLatFromPixel(pixel);
        // return this.transfromTo1984(lonlat);

        return this.map.layerPointToLatLng(new L.Point(posX, posY));
    },

    /**
     * Transforms the given OpenLayers.LonLat object to the 1984 projection.
     *
     * @param lonlat The OpenLayers.LonLat object to transform
     * @return The object in 1984 projection
     */
    transformTo1984: function (lonlat) {
        //var proj = new OpenLayers.Projection("EPSG:4326");
        //var lonlatClone = lonlat.clone();
        //lonlatClone.transform(this.map.getProjectionObject(), proj);

        //return lonlatClone;
        return lonlat;
    },
    
    /**
     * Transforms the given OpenLayers.LonLat object from the 1984 projection to the map projection.
     *
     * @param lonlat The OpenLayers.LonLat object to transform
     * @return The object in map projection
     */
    transformFrom1984: function (lonlat) {
        // var proj = new OpenLayers.Projection("EPSG:4326");
        // var lonlatClone = lonlat.clone();
        // lonlatClone.transform(proj, this.map.getProjectionObject());
        // return lonlatClone;
        return lonlat;
    }

});
