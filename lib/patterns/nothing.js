var Schema = require('../BaseSchema')

var NothingSchema = module.exports = Schema.patterns.NothingSchema = Schema.extend({
  errors: function(instance) {
    if (instance != null)
      return "this key is not allowed in strict mode";
    return false
  },
  validate: function(instance) {
    return instance == null
  },

  toJSON: function() {
    return { type: 'null' }
  }
})

var nothing = NothingSchema.instance = new NothingSchema()

Schema.fromJS.def(function(sch) {
  if (sch === null) return nothing
})

Schema.fromJSON.def(function(sch) {
  if (sch.type === 'null') return nothing
})
