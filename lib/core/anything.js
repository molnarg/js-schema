var schema = require('../schema')

var AnythingSchema = module.exports = function() {
  return new schema(this)
}

AnythingSchema.prototype = {
  toJSON : function() {
    return { type : 'any', required : true }
  },
  
  compile : function() {
    return { expression : 'instance != null' }
  }
}


schema.fromJS.def(function(sch) {
  if (sch === undefined) return new AnythingSchema()
})

schema.fromJSON.def(function(sch) {
  if (sch.type === 'any' && sch.required === true) return new AnythingSchema()
})
