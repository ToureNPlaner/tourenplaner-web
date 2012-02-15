window.MapView = Backbone.View.extend({

    id: 'map',

    initialize: function (args) {
        $(window).resize(_.bind(this.onResize, this));
        args.sidebar.bind("resize", this.onSidebarResize);

        
        window.markList.bind("add", this.onMarkListChange);
        window.markList.bind("change:lonlat", this.onMarkListChange);
        window.markList.bind("remove", this.onMarkListChange);
        window.markList.bind("reset", this.onMarkListChange);
    },

    render: function () {
        $('#main').append(this.el);

        this.onResize(this.options.sidebar);

        var mapObject = window.map;
        mapObject.draw();
        setContextMenu();
        mapObject.refresh();

        // Move the attribution stuff to a readable position
        $('.olControlAttribution').css({
            right: '5px',
            top: '5px'
        });

        return this;
    },


    onMarkListChange: function (model, markList) {
        var mapObject = window.map;
        mapObject.resetMarkers();
        mapObject.drawMarkers(markList);
    },

    onResize: function (sidebar) {
        var width = 0;
        try {
            width = $(sidebar.el).outerWidth();
        } catch (e) {
            width = $(window.body.main.sidebar.el).outerWidth();
        }

        this.$el.height($(window).height() - 40);
        this.$el.width($(window).width() - $('#main #sidebar').width());
        this.$el.css("left", $('#main #sidebar').width());
    },

    onSidebarResize: function (event, ui) {
        $("#main #map").css('left', ui.size.width);
        $("#main #map").css('width', "100%");
        $("#main #map").css('height', "100%");
        window.map.refresh();
    }
});