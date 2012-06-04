var schema = require('../schema')

var ReferenceSchema = module.exports = function(value) {
  this.value = value
  
  return new schema(this)
}

ReferenceSchema.prototype = {
  toJSON : function() {
    return { 'enum' : [this.value], required : true }
  },
  
  compile : function() {
    return { references : [this.value], expression : 'instance === {0}' }
  }
}


schema.fromJS.def(function(value) {
  return new ReferenceSchema(value)
})
