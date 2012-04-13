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
    iconSize: new L.Point(17, 26),
    iconAnchor: new L.Point(8, 26)    
});

Marker = L.Icon.extend({
    iconUrl: 'img/mark.png',
    shadowUrl: null,
    iconSize: new L.Point(17, 26),
    iconAnchor: new L.Point(8, 26)    
});

TargetMarker = L.Icon.extend({
    iconUrl: 'img/targetmark.png',
    shadowUrl: null,
    iconSize: new L.Point(17, 26),
    iconAnchor: new L.Point(8, 26)    
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

        var mapLayer = new L.TileLayer('http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            maxZoom: 18
        });

        this.map.addLayer(mapLayer);

        /* add maplayer and set center of the map */
        this.map.setView(new L.LatLng(51, 10), 6).addLayer(mapLayer);
    },

    onDragComplete: function(e) {
        e.target.mark.set({
            lonlat: e.target.getLatLng()
        }, {silent: true});
        e.target.mark.findNearestNeighbour();

        var alg = window.algview.getSelectedAlgorithm().urlsuffix;
        if (!_.isUndefined(alg) && !_.isEmpty(alg) && 
                (_.isUndefined(window.algview.getSelectedAlgorithm().details.minpoints) || window.markList.length >= window.algview.getSelectedAlgorithm().details.minpoints) &&
                (_.isUndefined(window.algview.getSelectedAlgorithm().details.maxpoints) || window.markList.length <= window.algview.getSelectedAlgorithm().details.maxpoints)) {

            loadingView = new LoadingView($._('Waiting for response from server ...')).render();
            
            var jsonObj = {
                alg: window.algview.$('input[@name=alg]:checked').val(),
                points: window.markList.toJSON(),
                callback: function (text, success) {
                    if (success) {
                        for (var i = 0; i < text.points.length; i++) {
                            var pos = text.points[i].position;
                            if (pos < window.markList.length)
                                window.markList.moveMark(window.markList.at(pos), i);
                        }

                        window.map.drawRoute(text);
                        if (!_.isUndefined(text.requestid) && !_.isNaN(parseInt(text.requestid)) && parseInt(text.requestid) > 0)
                            window.app.navigate('route/' + text.requestid);
                    }
                    loadingView.remove();
                }
            };

            // if constraints are available, then add them to request object
            var constraints = window.algview.getConstraintSettings();
            if (constraints != null)
                jsonObj['constraints'] = constraints;

            window.api.alg(jsonObj);
        }
    },

    /**
     * Returns the marker at the given point.
     *
     * @param point The point to look for
     * @return The marker at the given point or null
     */
    getMarkerForPoint: function(point) {        
        for (var i = 0; i < this.markers.length; ++i) {
            var pt = this.map.latLngToLayerPoint(this.markers[i].getLatLng());
            if (pt.x === point.x && pt.y === point.y)
                return this.markers[i];
        }
        return null;
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
        if (this.markers.length > 0) {
            for (var i = 0; i < this.markers.length; ++i)
                this.map.removeLayer(this.markers[i]);
            this.markers = [];
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
        var that = this;
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

            var marker = new L.Marker(new L.LatLng(mark.get("lonlat").lat, mark.get("lonlat").lng), {icon: icon, draggable: true});
            marker.mark = mark;
            marker.on("dragend", this.onDragComplete, this);
            marker.on("click", function (e) {
                // Show the marker in the data view
                window.body.main.data.showMarker(e.target.mark);

                // Center on the marker
                that.map.setView(e.target.getLatLng(), that.map.getZoom());
            });

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

        for (var i = 0; i < vertexString.way.length; i++) {
            for (var j = 0; j < vertexString.way[i].length; j++) {
                var p = vertexString.way[i][j];
                pointList.push(new L.LatLng(p.lt / 1e7, p.ln / 1e7));
            }
        }

        // draw route on a layer and add it to map
        this.routeFeature = new L.Polyline(pointList, {color: 'blue'});
        this.map.addLayer(this.routeFeature);
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

        for (var i in obj.points) {
            var ll = new L.LatLng(obj.points[i].lt / 1e7, obj.points[i].ln / 1e7)

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
        if(!_.isUndefined(data) && !_.isNull(data))
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
        //TODO: Needs testing
        this.map.fitBounds(new L.LatLngBounds(new L.LatLng(bb[0], bb[2]), new L.LatLng(bb[1], bb[3])));
    }

});
