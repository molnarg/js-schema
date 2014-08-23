var Schema = require('../BaseSchema')

var ReferenceSchema = module.exports = Schema.patterns.ReferenceSchema = Schema.extend({
  initialize : function(value) {
    this.value = value
  },
  errors : function(instance) {
    if(!(Object(instance) instanceof Function)) {
        return this.err(instance + " is not a reference", instance);
    }
    if(instance !== this.value){
        return this.err(instance + " is not reference to "+this.value, instance);
    }
    return false;
  },
  validate : function(instance) {
    return instance === this.value
  },

  toJSON : function() {
    var json = Schema.prototype.toJSON.call(this)

    json['enum'] = [this.value]

    return json
  }
})


Schema.fromJS.def(function(value) {
  return new ReferenceSchema(value)
})
