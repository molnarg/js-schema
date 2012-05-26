var schema = require('../schema')

schema.def(function(parent) {
  if (!(parent instanceof Function)) return
  
  var v = function(instance) {
    return Object(instance) instanceof parent
  }
  
  v.toJS = function() {
    return parent
  }
  
  v.schema = v
  
  return v
})
