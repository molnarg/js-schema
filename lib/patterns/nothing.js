var Schema = require('../Schema')

var NothingSchema = module.exports = Schema.patterns.NothingSchema = Schema.extend({
  validate : function(instance) {
    return instance == null
  },

  generate : function() {
    return Math.random() < 0.5 ? null : undefined
  },

  toJSON : function() {
    return { type : 'null' }
  }
})

var nothing = NothingSchema.instance = new NothingSchema()

Schema.fromJS.def(function(sch) {
  if (sch === null) return nothing
})

Schema.fromJSON.def(function(sch) {
  if (sch.type === 'null') return nothing
})
