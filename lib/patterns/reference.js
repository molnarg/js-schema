var Schema = require('../Schema')

var ReferenceSchema = module.exports = Schema.extend({
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
    var json = Schema.prototype.toJSON.call(this)
    
    json['enum'] = [this.value]
    
    return json
  }
})


Schema.fromJS.def(function(value) {
  return new ReferenceSchema(value)
})
