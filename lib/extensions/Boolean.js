var schema = require('../schema')

var booleanSchema = module.exports = new schema.schema({
  compile : function() {
    return { expression : 'Object(instance) instanceof Boolean' }
  },
  
  generate : function() {
    return Math.random() < 0.5
  },

  toJSON : function() {
    return { type : 'boolean' }
  }
})

schema.fromJSON.def(function(sch) {
  if (!sch || sch.type !== 'boolean') return
  
  return booleanSchema
})

Boolean.schema = booleanSchema
