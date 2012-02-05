window.AlgView = Backbone.View.extend({

    id: 'algview',
    algDiv: this.$('#algs'),
    constraintDiv: this.$('#constraints'),
    events: {
        "change #algorithms input": "onChooseAlg",
        "click #close": "onCloseDialog"
    },

    initialize: function () {
        this.el.style.display = "none";
        window.server.bind("info-loaded", _.bind(this.onInfoLoaded, this));
        var constraints = Backbone.Model.extend({});
        this.constraintInfo = new constraints();
    },

    render: function () {
        var algorithms = window.server.get('algorithms');
        var algArr = [];

        if (!_.isUndefined(algorithms) && algorithms.length > 0) {
            for (var i in algorithms) {
                if (!algorithms[i].details.hidden) {
                    algArr.push([algorithms[i].urlsuffix, algorithms[i].name]);
                }
            }
        }

        var data = {
            algorithms: algArr,
        };
        $(this.el).html(templates.algView(data));
        $('#main').append(this.el);

        return this;
    },

    getSelectedAlgorithm: function () {
        var algorithms = window.server.get('algorithms');
        var selected = this.$('input[@name=alg]:checked').val();
        var algToReturn = null;

        for (var i = 0; i < algorithms.length; i++) {
            if (algorithms[i].urlsuffix == selected) {
                algToReturn = algorithms[i];
            }
        }

        return algToReturn;
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
                var key = currentAlg.constraints[i].name;
                // marker.set({key : value}) doesnt use the value of key.
                // instead the keys name will be "key".
                // so this is used as an alternative:
                if (!_.isEmpty(this.$('#pc_' + key).val())) {
                    var value = this.$('#pc_' + key).val();

                    if (currentAlg.constraints[i].type == "boolean") {
                        if (that.$('#pc_' + key).attr('checked')) {
                            value = true;
                        } else {
                            // this is needed, because attr would be "undefined"
                            // if the checkbox isn't checked.
                            value = false;
                        }
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

    onChooseAlg: function () {
        this.onInfoLoaded();
    },

    onInfoLoaded: function () {
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
            $(this.el).html(templates.algView(data));

            if (!_.isUndefined(currentAlg)) {
                for (i = 0; i < currentAlg.constraints.length; i++) {
                    key = currentAlg.constraints[i].name;
                    var initValue = this.$('#pc_' + key).val();
                    this.$('#pc_' + key).spinit({
                        height: 20,
                        initValue: initValue,
                        min: currentAlg.constraints[i].min,
                        max: 999999
                    });
                }
                // Update info in sidebar
                window.body.main.sidebar.$('#selectedAlg').html(currentAlg.name);
            }


        }
    },

    onCloseDialog: function() {
        $('#algview').hide();
    }
});