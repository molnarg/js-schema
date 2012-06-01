var schema = require('../schema')

var ReferenceSchema = function(value) {
  this.value = value
  
  return schema.call(this)
}

ReferenceSchema.prototype = {
  validate : function(instance) {
    return instance === this.value
  },
  
  toJSON : function() {
    return { 'enum' : [this.value], required : true }
  }
}


schema.fromJS.def(function(value) {
  return new ReferenceSchema(value)
})
