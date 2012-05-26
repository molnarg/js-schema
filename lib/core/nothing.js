var schema = require('../schema')

schema.def(function(sch) {
  if (sch !== null) return
  
  var v = function() {
    return arguments.length === 0
  }
  
  v.toJS = function() {
    return null
  }
  
  v.toJSON = function() {
    return { disallow : 'any' }
  }
  
  v.schema = v
  
  return v
})
