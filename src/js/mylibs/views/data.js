window.DataView = Backbone.View.extend({

    id: 'data',
    currentMarker: null,

    /**
     * Used to save the old size (before minimizing). Using this, we can restore the old size.
     */
    oldStyle: "",

    events: {
        "click span.minmax a": "onMinMax",
        "keydown" : "onEnterKeyDown"
    },

    render: function () {
        this.$el.html(templates.dataView);
        $('#main').append(this.el);

        this.$el.resizable({
            handles: "n, nw, w"
        });

        return this;
    },
    
    showMarker: function (marker) {
        var that = this;

        if (this.currentMarker != null) {
            this.currentMarker.unbind("change:lonlat");
        }
        
        this.currentMarker = marker;
        this.currentMarker.bind("change:lonlat", function() {
            that.onDataViewChange(that, marker);
        });

        this.onDataViewChange(this, marker);
    },

    onDataViewChange: function (model, marker) {
        var that = this,
            lonlat = window.map.transformTo1984(marker.get("lonlat")),
            // get all pointconstraints for currently selected algorithm
            pointconstraints = window.algview.getSelectedAlgorithm().pointconstraints,
            // add fields to edit pointconstraints
            key;
	
        var data = {
            lonlat:  lonlat,
            marker: marker.toJSON(),
            constraints: pointconstraints
        };
        
        this.$('.content').html(templates.dataViewContent(data));
	
		// initialize Spinners
		for (i = 0; i < pointconstraints.length; i++) {
			key = pointconstraints[i].name;
			
			var initValue = this.$('#dataview #pc_' + key).val();
            this.$('#dataview #pc_' + key).spinit({height: 30, initValue: initValue, min: pointconstraints[i].min, max: pointconstraints[i].max});
		}
	

        this.$('#dataview #saveMarkAttributes').click(function () {
            marker.set({
                name: that.$('#dataview #markerName').val()
            });

			if (!_.isNull(pointconstraints)) {
				for (var i = 0; i < pointconstraints.length; i++) {
					var key = pointconstraints[i].name;
					// marker.set({key : value}) doesnt use the value of key.
					// instead the keys name will be "key".
					// so this is used as an alternative:
					if (!_.isEmpty(that.$('#dataview #pc_' + key).val())) {
						var value = that.$('#dataview #pc_' + key).val();
						
					    switch(pointconstraints[i].type) {
					    	case "boolean":
						    	if (that.$('#dataview #pc_' + key).attr('checked')) {
							    value = true;
							} else {
							    // this is needed, because attr would be "undefined"
							    // if the checkbox isn't checked.
							    value = false;
							}
							break;
						case "integer":
							value = parseInt(value, 10);
							break;
						case "meter": 
							value = parseFloat(value.replace(",", "."));
							break;
						case "price":
							value = parseFloat(value.replace(",", "."));
							break;
						case "float":
							value = parseFloat(value.replace(",", "."));
							break;
					   }
						marker.attributes[key] = value;
					} else {
						// if nothing is written in to that pointconstraint, then set
						// it to undefined, so we can later check if it's set or not.
						marker.attributes[key] = undefined;
					}
				}
			}

            var pos = that.$('#dataview #markerPos').val();
            window.markList.moveMark(marker, pos);
        });

        this.$('#dataview #deleteMark').click(function () {
            window.markList.deleteMark(marker);
            that.$('.content').html($._("No point selected!"));
        });
    },

    onMinMax: function () {
        this.$el.toggleClass('minimized');
        this.$('.content').toggle();

        var link = this.$('.minmax a');
        if (link.html() === '_') {
            link.html($._('Data'));

            this.oldStyle = this.el.attr('style');
            this.el.attr('style', '');
        } else {
            link.html('_');

            this.el.attr('style', this.oldStyle);
        }
    },

    onEnterKeyDown: function(event) {
        if (event.which == 13) {
            this.$('#dataview #saveMarkAttributes').click();
            return false;
        }
    }
});
