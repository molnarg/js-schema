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
    
    compiled.variables = ['i', 'result']
    
    compiled.code =  'if (instance == null) {'
    compiled.code += '  result = false;'
    compiled.code += '} else {'
    compiled.code += '  result = true;'
    compiled.code += '  for (i = 0; i < instance.length; i++) {'
    compiled.code += '    if (!{0}(instance[i])) { result = false; break; }'
    compiled.code += '  }'
    compiled.code += '}'
    
    compiled.result = 'result'
    
    return compiled
  }
}

Array.of = function(itemSchema) {
  return new ArraySchema(itemSchema)
}
