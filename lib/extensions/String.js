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
    return { type : 'string', required : true }
  }
}

String.schema = new StringSchema()
String.generate   = String.schema.generate
