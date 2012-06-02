var schema = require('../schema')

var AndSchema = module.exports = function(schemas) {
  this.schemas = schemas[0].map(schema.fromJS)
  
  return new schema(this)
}

AndSchema.prototype = {
  validate : function(instance) {
    for (var schema in this.schemas) {
      if (!this.schemas[schema](instance)) return false
    }
    
    return true
  }
}


schema.fromJS.def(function(schemas) {
  var match = schemas instanceof Array
           && schemas.length === 1
           && schemas[0] instanceof Array
  
  if (match) return new AndSchema(schemas)
})
