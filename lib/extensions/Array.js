var schema = require('../schema')

var ArraySchema = module.exports = function(itemSchema) {
  this.itemSchema = schema(itemSchema)
  
  return new schema(this)
}

ArraySchema.prototype = {
  validate : function(instance) {
    for (var i = 0; i < instance.length; i++) {
      if (!this.itemSchema.validate(instance[i])) return false
    }
    
    return true
  },
  
  compile : function() {
    var compiled = { }
    
    compiled.references = [this.itemSchema]
    
    compiled.fn =  'if (!(instance instanceof Array)) return false;'
    compiled.fn += 'for (var i = 0; i < instance.length; i++) {'
    compiled.fn += '  if (!{0}(instance[i])) return false;'
    compiled.fn += '}'
    compiled.fn += 'return true;'
    
    return compiled
  }
}

Array.of = function(itemSchema) {
  return new ArraySchema(itemSchema)
}
