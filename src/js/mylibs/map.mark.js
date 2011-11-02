function Mark() {

    this.name = "Marker";
    this.lonlat;
    this.lonlatAs1984;
    this.k = "100";
    
	this.getLonLatAs1984 = function () {
		return window.mapModel.get("mapObject").transformTo1984(this.lonlat);
	}
	
	this.getJSON = function() {
		var s = '{"lt": ' + this.getLonLatAs1984().lat + ",";
		s += '"ln": ' + this.getLonLatAs1984().lon + ",";
		s += '"k": ' + this.k + ' }';
		return s;
	}

} 


// KONSTRUKTOR UND SOMIT ALLE ATTRIBUTE ERZWINGEN?
