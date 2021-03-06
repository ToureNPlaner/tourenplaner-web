window.MarkList = Backbone.Collection.extend({

    model: Mark,

    comparator: function (mark) {
        return mark.get('position');
    },

    setStartMark: function (mark) {
        if (mark.get('position') === 0) {
            return;
        } else if (mark.get('position') >= this.length) {
            this._moveAllMarks(0, 1);
            mark.set({position: 0});
            this.add(mark);
        } else {
            this._moveAllMarks(0, 1);
            mark.set({position: 0});
            this.sort();
        }
    },

    getStartMark: function (mark) {
        if (this.length > 0)
            return this.at(0);
        return null;
    },

    setTargetMark: function (mark) {
        if (mark.get('position') < this.length - 1) {
            var oldpos = mark.get('position');
            mark.set({position: this.length - 1});

            this._moveAllMarks(oldpos + 1, -1);
            this.sort();
        } else if (mark.get('position') >= this.length) {
            mark.set({position: this.length});
            this.add(mark, {
                at: this.length
            });
        }

    },

    getTargetMark: function (mark) {
        if (this.length > 1)
            return this.at(this.length - 1);
        return null;
    },

    getSize: function() {
        return this.length;
    },

    appendMark: function (mark) {
        if (this.length >= 2 && !window.algview.getSelectedAlgorithm().details.sourceistarget) {
            mark.set({position: this.length - 1});
            this.at(this.length - 1).set({position: this.length});
            this.add(mark, {at: this.length - 1});
        } else {
            mark.set({position: this.length});
            this.add(mark, {
                at: this.length
            });
        }
    },

    indexOfMark: function (mark) {
        return this.indexOf(mark);
    },

    moveMark: function (mark, pos, opt) {
        if (mark.get('position') != pos) {
            opt = opt || {};
            this._moveAllMarks(pos, 1, opt);
            mark.set({position: pos}, opt);
        }
    },

    deleteMark: function (mark) {
        this._moveAllMarks(mark.get('position') + 1, -1);
        this.remove(mark);
    },

    deleteAllMarks: function () {
        this.reset(null);
    },

    getMarkByLonLat: function (lonlat) {
        for (var i = 0; i < this.length; i++) {
            var l = this.at(i).get("lonlat");
            if (l.equals(lonlat))
                return this.at(i);            
        }

        return null;
    },

    flip: function() {
        // Changes the order of all points
        var max = this.length - 1;
        for (var i = 0; i < this.length; i++) {
            var pt = this.at(i);
            pt.set({position: max - pt.get("position")});
        }

        this.sort();
    },

    toJSON: function () {
        var ret = [];
        for (var i = 0; i < this.length; i++) {
            ret.push(this.at(i).toJSON());
        }

        return ret;
    },

    fromJSON: function(data) {
        var marks = [];
        for (var i = 0, m; m = data[i]; ++i)
            marks.push(new Mark().fromJSON(m));
        this.reset(marks);
    },

    /**
     * Move the position of all marks +1 or -1
     *
     * @param from The starting index
     * @param direction -1 or 1
     */
    _moveAllMarks: function (from, direction, opt) {
        opt = opt || {};
        for (var i = from; i < this.length; ++i)
            this.at(i).set({position: this.at(i).get('position') + 1 * direction}, opt);
    }
});