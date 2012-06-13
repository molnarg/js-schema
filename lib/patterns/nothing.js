var schema = require('../schema')

var NothingSchema = function() {
  return new schema(this)
}

NothingSchema.prototype = {
  compile : function() {
    return { expression : 'instance == null' }
  },
  
  generate : function() {
    return null
  },
  
  toJSON : function() {
    return { disallow : 'any' }
  }
}

var nothingSchema = module.exports = new NothingSchema()

schema.fromJS.def(function(sch) {
  if (sch === null) return nothingSchema
})

schema.fromJSON.def(function(sch) {
  if (sch.disallow === 'any') return nothingSchema
})
