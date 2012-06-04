var schema = require('../schema')

var NothingSchema = module.exports = function() {
  return new schema(this)
}

NothingSchema.prototype = {
  toJSON : function() {
    return { disallow : 'any' }
  },
  
  compile : function() {
    return { references : [], expression : 'instance == null' }
  }
}

schema.fromJS.def(function(sch) {
  if (sch === null) return new NothingSchema()
})

schema.fromJSON.def(function(sch) {
  if (sch.disallow === 'any') return new NothingSchema()
})
