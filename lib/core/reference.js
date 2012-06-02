var schema = require('../schema')

var ReferenceSchema = module.exports = function(value) {
  this.value = value
  
  return new schema(this)
}

ReferenceSchema.prototype = {
  validate : function(instance) {
    return instance === this.value
  },
  
  toJSON : function() {
    return { 'enum' : [this.value], required : true }
  },
  
  compile : function() {
    return { code : 'instance === {0}', references : [this.value] }
  }
}


schema.fromJS.def(function(value) {
  return new ReferenceSchema(value)
})
