window.ImExportView = Backbone.View.extend({
   
    id: 'imexport',
    className: 'modal',

    events: {
        "hidden": "remove",
        "click .modal-footer a.close": "onClose",
        "click .modal-header a.close": "onClose",
        "click ul.nav-tabs a": "onTabsChange",
        "click a.import": "onImport",
        "click a.export": "onExport" 
    },

    render: function() {
        this.$el.html(templates.imexportView);

        this.$el.modal({
            show: true,
            backdrop: 'static',
            keyboard: true
        });

        $('#ieTab a:first').tab('show');

        return this;
    },

    onClose: function () {
        this.$el.modal('hide');
    },

    remove: function () {
        this.$el.remove();
    },

    onTabsChange: function(e) {
        if ($(e.target).parent().hasClass('active'))
            return false;

        this.$('ul.nav-tabs li').each(function() {
            $(this).toggleClass('active');
        });

        this.$('#import').toggle();
        this.$('#export').toggle();

        return false;
    },

    onImport: function() {
        var that = this;

        if (_.isEmpty(this.$('#import input').val())) {
            new MessageView({title: $._('Error!'), message: $._('No file specified')}).render();
            return false;
        }

        var file = $('#import input[type=file]').get()[0].files[0];

        var reader = new FileReader();
        reader.onloadend = (function (file, dialog) {
            return function(e) {
                if (e.target.readyState === FileReader.DONE) {
                    var data = JSON.parse(e.target.result);

                    if (!_.isEmpty(data.marks))
                        window.markList.fromJSON(data.marks);
                    if (!_.isEmpty(data.route))
                        window.map.drawRoute(data.route, true);

                    dialog.remove();
                }
            };
        })(file, that);

        reader.readAsText(file);

        return false;
    },

    onExport: function() {
        var contents = {marks: [], route: {}};
        contents.marks = window.markList.toJSON();

        var route = window.map.getRoute();
        if (_.isString(route))
            contents.route = JSON.parse(route);
        else
            contents.route = route;

        var dataURI = 'data:application/octet-stream;charset=utf-8;base64,' + Base64.encode(JSON.stringify(contents));
        var win = window.open(dataURI, "export.json");

        return false;
    }
    
});
