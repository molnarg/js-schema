var schema = require('../schema')

var InstanceofSchema = module.exports = function(parent) {
  this.parent = parent
  
  return new schema(this)
}

InstanceofSchema.prototype = {
  validate : function(instance) {
    return Object(instance) instanceof this.parent
  }
}


schema.fromJS.def(function(parent) {
  if (parent instanceof Function) return new InstanceofSchema(parent)
})
