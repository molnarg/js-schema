var schema = require('../schema')

var BooleanSchema = function() {
  return new schema(this)
}

BooleanSchema.prototype = {
  compile : function() {
    return { expression : 'Object(instance) instanceof Boolean' }
  },
  
  generate : function() {
    return Math.random() < 0.5
  },

  toJSON : function() {
    return { type : 'boolean' }
  }
}

var booleanSchema = new BooleanSchema()

schema.fromJSON.def(function(sch) {
  if (!sch || sch.type !== 'boolean') return
  
  return booleanSchema
})

Boolean.schema = booleanSchema
Boolean.generate   = Boolean.schema.generate
