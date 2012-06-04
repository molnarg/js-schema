var schema = require('../schema')

var InstanceofSchema = module.exports = function(parent) {
  this.parent = parent
  
  return new schema(this)
}

InstanceofSchema.prototype = {
  compile : function() {
    return { references : [this.parent], expression : 'Object(instance) instanceof {0}' }
  }
}


schema.fromJS.def(function(parent) {
  if (parent instanceof Function) return new InstanceofSchema(parent)
})
