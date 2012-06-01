var schema = require('../schema')

var InstanceofSchema = function(parent) {
  this.parent = parent
  
  return schema.call(this)
}

InstanceofSchema.prototype = {
  validate : function(instance) {
    return Object(instance) instanceof this.parent
  }
}


schema.fromJS.def(function(parent) {
  if (parent instanceof Function) return new InstanceofSchema(parent)
})
