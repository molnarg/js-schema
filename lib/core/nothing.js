var schema = require('../schema')

var NothingSchema = module.exports = function() {
  return schema.call(this)
}

NothingSchema.prototype = {
  validate : function() {
    return arguments.length === 0
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
