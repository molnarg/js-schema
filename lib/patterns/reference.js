var schema = require('../schema')

var ReferenceSchema = module.exports = function(value) {
  this.value = value
  
  return new schema(this)
}

ReferenceSchema.prototype = {
  compile : function() {
    return { references : [this.value], expression : 'instance === {0}' }
  },
  
  generate : function() {
    return this.value
  },
  
  toJSON : function() {
    return { 'enum' : [this.value] }
  }
}


schema.fromJS.def(function(value) {
  return new ReferenceSchema(value)
})
