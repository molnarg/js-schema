var schema = require('../schema')

var ReferenceSchema = module.exports = schema.schema.extend({
  initialize : function(value) {
    this.value = value
  },
  
  compile : function() {
    return { references : [this.value], expression : 'instance === {0}' }
  },
  
  generate : function() {
    return this.value
  },
  
  toJSON : function() {
    var json = schema.schema.prototype.toJSON.call(this)
    
    json['enum'] = [this.value]
    
    return json
  }
})


schema.fromJS.def(function(value) {
  return new ReferenceSchema(value)
})
