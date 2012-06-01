var schema = require('../schema')

var OrSchema = function(schemas) {
  this.schemas = schemas.map(schema.fromJS)
  
  return schema.call(this)
}

OrSchema.prototype = {
  validate : function(instance) {
    for (var schema in this.schemas) {
      if (this.schemas[schema](instance)) return true
    }
    
    return false
  }
}


schema.fromJS.def(function(schemas) {
  if (schemas instanceof Array) return new OrSchema(schemas)
})
