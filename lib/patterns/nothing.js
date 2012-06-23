var schema = require('../schema')

var nothing = module.exports = new schema({
  compile : function() {
    return { expression : 'instance == null' }
  },
  
  generate : function() {
    return null
  },
  
  toJSON : function() {
    return { disallow : 'any' }
  }
})

schema.fromJS.def(function(sch) {
  if (sch === null) return nothing
})

schema.fromJSON.def(function(sch) {
  if (sch.disallow === 'any') return nothing
})
