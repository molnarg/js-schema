var schema = require('../schema')

schema.fromJS.def(function(schemas) {
  if (!(schemas instanceof Array)) return
  
  schemas = schemas.map(schema)
  
  var v = function(instance) {
    for (var schema in schemas) {
      if (schemas[schema](instance)) return true
    }
    
    return false
  }
  
  v.toJS = function() {
    return schemas.map(schema.toJS)
  }
  
  v.schema = v
  
  return v
})
