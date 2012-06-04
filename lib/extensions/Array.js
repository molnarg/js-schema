var schema = require('../schema')

var ArraySchema = module.exports = function(itemSchema) {
  this.itemSchema = schema(itemSchema)
  
  return new schema(this)
}

ArraySchema.prototype = {
  compile : function() {
    var compiled = { }
    
    compiled.references = [this.itemSchema]
    
    compiled.fn = 'if (!(instance instanceof Array)) return false;'
                + 'for (var i = 0; i < instance.length; i++) {'
                + '  if (!{0}(instance[i])) return false;'
                + '}'
                + 'return true;'
    
    return compiled
  }
}

Array.of = function(itemSchema) {
  return new ArraySchema(itemSchema)
}
