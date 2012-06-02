var schema = require('../schema')

var OrSchema = module.exports = function(schemas) {
  this.schemas = schemas.map(schema.fromJS)
  
  return new schema(this)
}

OrSchema.prototype = {
  validate : function(instance) {
    for (var schema in this.schemas) {
      if (this.schemas[schema].validate(instance)) return true
    }
    
    return false
  },
  
  compile : function() {
    var compiled = { references : this.schemas }
    
    var checks = this.schemas.map(function(sch, i) { return '{' + i + '}.validate(instance)' })
    compiled.result = checks.join(' || ')
    
    return compiled
  }
}


schema.fromJS.def(function(schemas) {
  if (schemas instanceof Array) return new OrSchema(schemas)
})
