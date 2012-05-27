var schema = require('../schema')

schema.fromJS.def(function(object) {
  if (!(object instanceof Object)) return
  
  var schemas = {}
  
  for (var property in object) schemas[property] = schema(object[property])
  
  var v = function(instance) {
    if (instance == null) return false
    
    instance = Object(instance)
    
    for (var property in schemas) {
      if (property in instance) {
        if (!schemas[property](instance[property])) return false
      } else {
        if (!schemas[property]()) return false
      }
    }
    
    return true
  }
  
  v.toJS = function() {
    var object = {}
    
    for (var property in schemas) object[property] = schemas[property].toJS()
    
    return object
  }
  
  v.schema = v
  
  return v
})
