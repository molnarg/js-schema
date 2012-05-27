var schema = require('../schema')

schema.fromJS.def(function(value) {
  var v = function(instance) {
    return instance === value
  }
  
  v.toJS = function() {
    return value
  }
  
  v.toJSON = function() {
    return { 'enum' : [value]
           , required : true
           }
  }
  
  v.schema = v
  
  return v
})
