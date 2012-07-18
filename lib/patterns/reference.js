var Schema = require('../Schema')

var ReferenceSchema = module.exports = Schema.extend({
  initialize : function(value) {
    this.value = value
  },
  
  validate : function(instance) {
    return instance === this.value
  },
  
  generate : function() {
    return this.value
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
