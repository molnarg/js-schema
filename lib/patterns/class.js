var schema = require('../schema')

var ClassSchema = module.exports = function(constructor) {
  this.constructor = constructor
  
  return new schema(this)
}

ClassSchema.prototype = {
  validate : function(instance) {
    return this.constructor.schema(instance)
  },
  
  generate : function() {
    var Constructor = function() {}
    Constructor.prototype = this.parent.prototype
    
    return new Constructor()
  }
}


schema.fromJS.def(function(constructor) {
  if (!(constructor instanceof Function && constructor.schema instanceof Function)) return
  
  return new ClassSchema(constructor)
})

// Default schema for all constructors
Function.prototype.schema = function(instance) {
  return instance instanceof this
}
