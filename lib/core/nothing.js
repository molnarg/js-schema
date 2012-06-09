var schema = require('../schema')

var NothingSchema = module.exports = function() {
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

schema.fromJS.def(function(sch) {
  if (sch === null) return new NothingSchema()
})

schema.fromJSON.def(function(sch) {
  if (sch.disallow === 'any') return new NothingSchema()
})
