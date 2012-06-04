var schema = require('../schema')

var AndSchema = module.exports = function(schemas) {
  this.schemas = schemas[0].map(schema.fromJS)
  
  return new schema(this)
}

AndSchema.prototype = {
  compile : function() {
    var compiled = { references : this.schemas }
    
    var checks = this.schemas.map(function(sch, i) { return '{' + i + '}(instance)' })
    compiled.expression = checks.join(' && ')
    
    return compiled
  }
}


schema.fromJS.def(function(schemas) {
  var match = schemas instanceof Array
           && schemas.length === 1
           && schemas[0] instanceof Array
  
  if (match) return new AndSchema(schemas)
})
