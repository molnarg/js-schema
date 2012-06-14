var schema = require('../schema')

var StringSchema = function() {
  return new schema(this)
}

StringSchema.prototype = {
  compile : function() {
    return { expression : 'Object(instance) instanceof String' }
  },
  
  generate : function() {
    return schema(/[a-zA-Z0-9]+/).generate()
  },

  toJSON : function() {
    return { type : 'string' }
  }
}

schema.fromJSON.def(function(sch) {
  if (!sch || sch.type !== 'string') return
  
  // minLength, maxLength and pattern is not yet supported
  if (Object.keys(sch).length > 1) return
  
  return new StringSchema()
})

String.schema = new StringSchema()
String.generate   = String.schema.generate
