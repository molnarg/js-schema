var schema = require('../schema')

var OrSchema = module.exports = function(schemas) {
  this.schemas = schemas.map(schema.fromJS)
  
  return new schema(this)
}

OrSchema.prototype = {
  compile : function() {
    var compiled = { references : this.schemas }
    
    var checks = this.schemas.map(function(sch, i) { return '{' + i + '}(instance)' })
    compiled.expression = checks.join(' || ')
    
    return compiled
  }
}


schema.fromJS.def(function(schemas) {
  if (schemas instanceof Array) return new OrSchema(schemas)
})
