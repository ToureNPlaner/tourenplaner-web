window.AlgView = Backbone.View.extend({

    id: 'algview',

    events: {
        "change #algorithms input": "onRefreshAlgorithm",
        "click a.close": "onCloseDialog",
        "submit" : "onEnterKeyDown"
    },

    initialize: function () {
        window.server.bind("info-loaded", _.bind(this.onRefreshAlgorithm, this));
    },

    render: function () {
        $('#main').append(this.el);

        return this;
    },

    setSelectedAlgorithm: function (alg) {
        this.$('#'+alg).click();
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

                    // convert textinputs to the respective format
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
                        default:
                            // there is nothing to convert.
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
                for (var i = 0; i < currentAlg.constraints.length; i++) {
                    key = currentAlg.constraints[i].id;
                    type = currentAlg.constraints[i].type;
                    spinnerRequired = new Array("integer", "float", "meter", "price");
                    comboboxRequired = new Array("enum");
                    if (spinnerRequired.join().indexOf(type) > -1) {
                        minValue = currentAlg.constraints[i].min;
                        maxValue = currentAlg.constraints[i].max;

                        if (typeof maxValue == "undefined")
                            maxValue = Number.MAX_VALUE;

                        if (typeof minValue == "undefined" || minValue == 0) {
                            this.$('#pc_' + key).spinner({min:0, max:maxValue, init:0});
                            // workaround: spinner inits with maxValue if min and init are 0.
                            this.$('#pc_' + key).val(0);
                        } else {
                            this.$('#pc_' + key).spinner({min:minValue, max:maxValue, init: minValue});
                        }
                    } else if (comboboxRequired.join().indexOf(type) > -1) {
                        options = currentAlg.constraints[i].values;

                        for (var j = 0; j < options.length; j++) {
                            this.$('#pc_' + key).append(new Option(options[i], options[i]));
                        }
                    }
                    this.$('#pc_' + key).twipsy({placement: 'right'});
                }
                window.body.main.sidebar.$('#selectedAlg').html(currentAlg.name);
                window.markList.trigger('reset');
            }
        }
    },

    onCloseDialog: function() {
        $('#algview').hide();
    },

    onEnterKeyDown: function() {
        window.body.main.sidebar.onSend();
        return false;
    }
});
