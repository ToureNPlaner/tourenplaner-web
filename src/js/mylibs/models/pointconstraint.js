window.PointConstraint = Backbone.Model.extend({

   defaults: {
      name: "",
      type: "",
      minValue: 0,
      maxvalue: 0,
      value: 0
   },

   toJSON: function() {
      return {
         "name": this.get("name"),
         "type": this.get("type"),
         "min": this.get("minvalue"),
         "max": this.get("maxValue")
      };
   }

});