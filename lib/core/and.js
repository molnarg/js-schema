var schema = require('../schema')

schema.def(function(schemas) {
  var match = schemas instanceof Array
           && schemas.length === 1
           && schemas[0] instanceof Array
  
  if (!match) return
  
  schemas = schemas[0].map(schema)
  
  var v = function(instance) {
    for (var schema in schemas) {
      if (!schemas[schema](instance)) return false
    }
    
    return true
  }
  
  v.toJS = function() {
    return [schemas.map(schema.toJS)]
  }
  
  v.schema = v
  
  return v
})
