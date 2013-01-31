var Schema = require('../BaseSchema')

var AnythingSchema = module.exports = Schema.patterns.AnythingSchema = Schema.extend({
  validate : function(instance) {
    return instance != null
  },

  toJSON : function() {
    return { type : 'any' }
  }
})

var anything = AnythingSchema.instance = new AnythingSchema()

Schema.fromJS.def(function(sch) {
  if (sch === undefined) return anything
})

Schema.fromJSON.def(function(sch) {
  if (sch.type === 'any') return anything
})
