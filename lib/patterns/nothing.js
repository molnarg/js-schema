var schema = require('../schema')

var nothing = module.exports = new schema({
  compile : function() {
    return { expression : 'instance == null' }
  },
  
  generate : function() {
    return Math.random() < 0.5 ? null : undefined
  },
  
  toJSON : function() {
    return { type : 'null' }
  }
})

schema.fromJS.def(function(sch) {
  if (sch === null) return nothing
})

schema.fromJSON.def(function(sch) {
  if (sch.type === 'null') return nothing
})
