var schema = require('../schema')

var ClassSchema = module.exports = function(constructor) {
  this.constructor = constructor
  
  return new schema(this)
}

ClassSchema.prototype = {
  compile : function() {
    return { references : [this.constructor], expression : 'instance instanceof {0}' }
  },
  
  generate : function() {
    var Constructor = function() {}
    Constructor.prototype = this.constructor.prototype
    
    return new Constructor()
  }
}


schema.fromJS.def(function(constructor) {
  if (!(constructor instanceof Function)) return
  
  if (constructor.schema instanceof Function) {
    return constructor.schema
  } else {
    return new ClassSchema(constructor)
  }
})
