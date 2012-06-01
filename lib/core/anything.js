var schema = require('../schema')

var AnythingSchema = module.exports = function() {
  return schema.call(this)
}

AnythingSchema.prototype = {
  validate : function() {
    return arguments.length === 1
  },

  toJSON : function() {
    return { type : 'any', required : true }
  }
}


schema.fromJS.def(function(sch) {
  if (sch === undefined) return new AnythingSchema()
})

schema.fromJSON.def(function(sch) {
  if (sch.type === 'any' && sch.required === true) return new AnythingSchema()
})
