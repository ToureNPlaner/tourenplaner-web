window.DataView = Backbone.View.extend({

    id: 'data',

    /**
     * Used to save the old size (before minimizing). Using this, we can restore the old size.
     */
    oldStyle: "",

    events: {
        "click span.minmax a": "onMinMax"
    },

    initialize: function () {
        window.guiModel.bind("change:dataViewText", _.bind(this.onDataViewChange, this));
    },

    render: function () {
        $(this.el).html(templates.dataView);
        $('#main').append(this.el);

        $(this.el).resizable({
            handles: "n, nw, w"
        });

        return this;
    },
    
    testFkt: function() {
    
    	alert("SChon stier he");
    },
    
     onDataViewChange: function (model, marker) {
        var that = this;
        var lonlat = window.map.transformTo1984(marker.get("lonlat"));
        // get all pointconstraints for currently selected algorithm
        var pointconstraints = window.guiModel.getCurrentAlgorithm().pointconstraints;

        // add fields to edit pointconstraints
        var constraintsHtml = "", key;
        for (var i = 0; i < pointconstraints.length; i++) {
			key = pointconstraints[i].name;

			var value = "";
			if (!_.isUndefined(marker.get(key))) {
				value = marker.get(key);
			}
			
			constraintsHtml += "<div class='clearfix'><label for='pc_" + key + "'><b>" + key + ":</b></label>";
			if (pointconstraints[i].type == "boolean") {
				// display a checkbox and set its checked state
				var checked = "";
				if (value == true) {
					checked = "checked";
				}
				constraintsHtml += "<input type='checkbox' name='pc_" + key + "' id='pc_" + key + "' " + checked + "/></div>";
			} else {
				// display numberinputs for int, float, meter and price
				switch (pointconstraints[i].type) {
					case "integer":
							constraintsHtml += "<input value='"+value+"' type='text' class='smartspinner' name='pc_" + key + "' id='pc_" + key + "' /></div>";
						break;
					case "float":
							constraintsHtml += "<input value='"+value+"' type='text' class='smartspinner' name='pc_" + key + "' id='pc_" + key + "' /></div>";
						break;
					case "meter":
							constraintsHtml += "<input value='" + value + "' type='text' class='smartspinner' name='pc_" + key + "' id='pc_" + key + "' /> m</div>";
						break;
					case "price":
							constraintsHtml += "<input value='"+value+"' type='text' class='smartspinner' name='pc_" + key + "' id='pc_" + key + "' /> &#8364;</div>";
						break;
				}
			}
		}
		
	
        var data = {
            lonlat:  lonlat,
            marker: marker.toJSON(),
            constraints: !_.isEmpty(constraintsHtml),
            constraintsHtml: constraintsHtml
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
						
						if (pointconstraints[i].type == "boolean") {
							if (that.$('#dataview #pc_' + key).attr('checked')) {
								value = true;
							} else {
								// this is needed, because attr would be "undefined"
								// if the checkbox isn't checked.
								value = false;
							}
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
        this.el.toggleClass('minimized');
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
    }
});
