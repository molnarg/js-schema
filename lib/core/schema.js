var schema = require('../schema')

schema.def(function(f) {
  if (!(f instanceof Function && f.schema instanceof Function)) return
  
  return f.schema
})
