var schema = require('../schema')

schema.fromJS.def(function(sch) {
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
