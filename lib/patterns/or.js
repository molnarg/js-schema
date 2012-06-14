var schema = require('../schema')

var OrSchema = module.exports = function(schemas) {
  this.schemas = schemas
  
  return new schema(this)
}

OrSchema.prototype = {
  compile : function() {
    var compiled = { references : this.schemas.slice() }
    
    var checks = this.schemas.map(function(sch, i) { return '{' + i + '}(instance)' })
    compiled.expression = checks.join(' || ')
    
    return compiled
  },
  
  generate : function() {
    return this.schemas[Math.floor(Math.random()*this.schemas.length)].generate()
  }
}


schema.fromJS.def(function(schemas) {
  if (schemas instanceof Array) return new OrSchema(schemas.map(schema.fromJS))
})
