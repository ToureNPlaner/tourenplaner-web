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

        if (!_.isNull(this.currentMarker))
            this.currentMarker.unbind("change:lonlat");
        

        this.currentMarker = marker;
        if (!_.isNull(marker)) {
            this.currentMarker.on("change:lonlat", function() {
                that.onDataViewChange(that, marker);
            });            
            this.onDataViewChange(this, marker);
        } else {
            that.$('.content').html($._("No point selected!"));
        }
    },

    onDataViewChange: function (model, marker) {
        var that = this,
            lonlat = marker.get("lonlat"),
            // get all pointconstraints for currently selected algorithm
            pointconstraints = window.algview.getSelectedAlgorithm().pointconstraints;
            // add fields to edit pointconstraints
log(marker);
	
        var data = {
            lonlat:  lonlat,
            marker: marker.toJSON(),
            constraints: pointconstraints
        };
        this.$('.content').html(templates.dataViewContent(data));
	
        for (i = 0; i < pointconstraints.length; i++) {
            key = pointconstraints[i].id;
            type = pointconstraints[i].type;
            spinnerRequired = new Array("integer", "float", "meter", "price");
            comboboxRequired = new Array("enum");
            var initValue = marker.attributes[key];
            if (spinnerRequired.join().indexOf(type) > -1) {
                // component is a spinner, set min, max and initial value 
                minValue = pointconstraints[i].min;
                maxValue = pointconstraints[i].max;

                if (typeof minValue == "undefined" || minValue == 0) {
                    minValue = -Number.MAX_VALUE;
                } 

                if (typeof maxValue == "undefined" || maxValue == 0) {
                    maxValue = Number.MAX_VALUE;
                } 

                this.$('#dataview #pc_' + key).spinner({min:minValue, max:maxValue, init:initValue});
                this.$('#dataview #pc_' + key).val(initValue);

            } else if (comboboxRequired.join().indexOf(type) > -1) {
                // component is a combobox. Set selectable values.
                options = pointconstraints[i].values;

                for (var j = 0; j < options.length; j++) {
                    this.$('#dataview #pc_' + key).append(new Option(options[j], options[j]));
                }

                this.$('#dataview #pc_' + key).val(initValue);
            } else if (type == "boolean" && initValue == true) {
                // component is a checkbox. set checked or not.
                this.$('#dataview #pc_' + key).attr('checked', true);
            } else {
                // component is sth. else (text input box). set value.
                this.$('#dataview #pc_' + key).val(initValue);
            }

            this.$('#dataview #pc_' + key).twipsy({placement: 'left'});
            this.$('#dataview #pc_' + key).focus(function() {
                that.$('#dataview #saveMarkAttributes').removeClass('disabled');
            });
        }

        this.$('#markerName').focus(function() {
            that.$('#dataview #saveMarkAttributes').removeClass('disabled');
        });

        // Save mark attributes
        this.$('#dataview #saveMarkAttributes').click(function () {
            marker.set({
                name: that.$('#dataview #markerName').val()
            });

			if (!_.isNull(pointconstraints)) {
				for (var i = 0; i < pointconstraints.length; i++) {
					var key = pointconstraints[i].id;
					// marker.set({key : value}) doesnt use the value of key.
					// instead the keys name will be "key".
					// so this is used as an alternative:
					if (!_.isEmpty(that.$('#dataview #pc_' + key).val()) || (pointconstraints[i].type == "boolean")) {
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

                that.$('#dataview #saveMarkAttributes').addClass('disabled');
			}
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
