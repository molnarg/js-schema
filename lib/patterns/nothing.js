var Schema = require('../Schema')

var NothingSchema = Schema.extend({
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

global.NothingSchema = NothingSchema

var nothing = module.exports = new NothingSchema()

Schema.fromJS.def(function(sch) {
  if (sch === null) return nothing
})

Schema.fromJSON.def(function(sch) {
  if (sch.type === 'null') return nothing
})
