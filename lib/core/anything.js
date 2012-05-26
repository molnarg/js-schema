var schema = require('../schema')

schema.def(function(sch) {
  if (sch !== undefined) return
  
  var v = function() {
    return arguments.length === 1
  }
  
  v.toJS = function() {
    return undefined
  }
  
  v.toJSON = function() {
    return { type : 'any'
           , required : true
           }
  }
  
  v.schema = v
  
  return v
})

schema.fromJSON.def(function(sch) {
  if (sch.type === 'any' && sch.required === true) return schema(undefined)
})
