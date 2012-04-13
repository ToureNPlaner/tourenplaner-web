window.AlgView = Backbone.View.extend({

    id: 'algview',

    events: {
        "change #algorithms input": "onRefreshAlgorithm",
        "click a.close": "onCloseDialog"
    },

    initialize: function () {
        window.server.bind("info-loaded", _.bind(this.onRefreshAlgorithm, this));
    },

    render: function () {
        $('#main').append(this.el);

        return this;
    },

    getSelectedAlgorithm: function () {
        var algorithms = window.server.get('algorithms');
        var selected = this.$('input[@name=alg]:checked').val();

        for (var i = 0; i < algorithms.length; i++) {
            if (algorithms[i].urlsuffix == selected) {
                return algorithms[i];
            }
        }

        return null;
    },

    getConstraintSettings: function () {
        var algorithms = window.server.get('algorithms');
        var algSuffix = this.$('input[@name=alg]:checked').val();

        var currentAlg = null;
        // get algorithm with algSuffix
        for (var i = 0; i < algorithms.length; i++) {
            if (algSuffix == algorithms[i].urlsuffix) {
                currentAlg = algorithms[i];
            }
        }

        var constraintsJson = {};
        if (!_.isNull(currentAlg.constraints)) {
            for (var i = 0; i < currentAlg.constraints.length; i++) {
                var key = currentAlg.constraints[i].id;
                // marker.set({key : value}) doesnt use the value of key.
                // instead the keys name will be "key".
                // so this is used as an alternative:
                                
                if (!_.isEmpty(this.$('#pc_' + key).val())) {
                    var value = this.$('#pc_' + key).val();
        		    switch(currentAlg.constraints[i].type) {
        		    	case "boolean":
        			    	if (that.$('#pc_' + key).attr('checked')) {
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
                    constraintsJson[key] = value;
                } else {
                    // if nothing is written in to that pointconstraint, then set
                    // it to undefined, so we can later check if it's set or not.
                    constraintsJson[key] = undefined;
                }
            }
        } else {
            constraintsJson = null;
        }

        return constraintsJson;
    },

    onRefreshAlgorithm: function () {
        var algorithms = window.server.get('algorithms');

        if (!_.isUndefined(algorithms) && algorithms.length > 0) {
            //var index = this.$('input[@name=alg]:checked').index('input[name=alg]');
            var suffix = this.$('input[@name=alg]:checked').val();
            if (_.isUndefined(suffix)) {
                suffix = algorithms[0].urlsuffix;
            }

            currentAlg = undefined;
            for (var i = 0; i < algorithms.length; i++) {
                if (algorithms[i].urlsuffix == suffix) {
                    currentAlg = algorithms[i];
                }
            }

            // get constraints
            var data = {
                algorithms: algorithms,
                currentAlg: currentAlg
            };

            // ... and print them out
            this.$el.html(templates.algView(data));

            if (!_.isUndefined(currentAlg)) {
                for (i = 0; i < currentAlg.constraints.length; i++) {
                    key = currentAlg.constraints[i].id;
                    var initValue = this.$('#pc_' + key).val();
                    this.$('#pc_' + key).spinner({min:0, max:99999, init: 0});
                    this.$('#pc_' + key).twipsy({placement: 'right'});
                }
                // Update info in sidebar
                window.body.main.sidebar.$('#selectedAlg').html(currentAlg.name);
                window.markList.trigger('reset');
            }
        }
    },

    onCloseDialog: function() {
        $('#algview').hide();
    }
});
