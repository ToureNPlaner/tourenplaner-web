function MarkList() {


    // how to make this private?
    this.marks = new Array();

    this.getMarks = function () {
        return this.marks;
    }


    /* PRIVATE
     * creates new mark and push it to markslist
     */
    this.createMark = function () {
        var mark = new Mark();

        // Mark hinzufügen
        this.marks.push(mark);
        return mark;
    }


    /*
     * creates new startmark and removes old startmark.
     * @return new startmark
     */
    this.createStartMark = function () {
        this.marks.splice(0, 1);
        var newMark = this.createMark();
        this.moveToPos(newMark, 0);

        return newMark;
    }


    /*
     * creates new targetmark and removes old targetmark
     * @return new targetmark
     */
    this.createTargetMark = function () {
        this.marks.splice(this.marks.length - 1, 1);
        var newMark = this.createMark();
        return newMark;
    }


    /*
     * creates new mark and moves it to the second last position of marklist.
     * @return added mark
     */
    this.addMark = function () {
        var newMark = this.createMark();

        var newPos = this.marks.length - 2;

        // if this mark would be a startmark, 
        // move it one position behind the real startmark
        if (newPos < 1) {
            newPos = 1;
        }

        this.moveToPos(newMark, newPos);
        return newMark;
    }


    /*
     * Move mark to specified position.
     */
    this.moveToPos = function (mark1, pos) {
        var indexOfMark = this.marks.indexOf(mark1);
        if (indexOfMark < pos) {
            pos = pos + 1;
        }
        this.marks.splice(pos, 0, mark1);

        if (pos <= indexOfMark) {
            indexOfMark = indexOfMark + 1;
        }

        this.marks.splice(indexOfMark, 1);
    }


    /* MAYBE DEPRECATED
     * insert Markobject at specified position
     */
    this.insertMarkAtPos = function (mark, pos) {
        this.marks.splice(pos, 0, mark);
    }


    /*
     * check if a mark with specified name already exists
     */
    this.nameExists = function (name) {
        var ret = false;
        for (i in this.marks) {
            if (this.marks[i].name == name) {
                ret = true;
            }
        }

        return ret;
    }


    /*
     * get a mark specified by name. returns 0 if not existing.
     * @return mark with specified name
     */
    this.getMarkByName = function (name) {
        var ret = 0;
        for (mark in this.marks) {
            if (mark.name == name) {
                ret = mark;
            }
        }

        return ret;
    }
    
    
    this.getMarkByLonlat = function (lonlat) {
        var ret = 0;
        for (var i = 0; i < this.marks.length; i++) {
            var mark = this.marks[i];
            if (mark.lonlat == lonlat) {
                ret = mark;
            }
        }

        return ret;		
	}


    /* 
     * removes a mark specified by name.
     * @return true if succeeded
     */
    this.removeMarkByName = function (name) {
        var removed = false;
        for (mark in this.marks) {
            if (mark.name == name) {
                this.marks.remove(mark);
                removed = true;
            }
        }

        return remove;
    }

    this.getMarksCount = function () {
        return this.marks.length;
    }
    
    this.removeAllMarks = function () {
		this.marks.splice(0, this.marks.length);
	}


    this.getJSON = function () {
		var s = "[\n";
		var comma = ",";
		for (var i = 0; i < this.marks.length; i++) {
			if (i == this.marks.length - 1) {
				comma = "";
			}
			
			s += this.marks[i].getJSON() + comma + "\n";
		}
		
		s += "]";
		return s;
    }

    this.test = function () {
        alert("TEST");
    }
} // end of map object
