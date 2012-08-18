var Schema = require('../Schema')

var BooleanSchema = module.exports = Schema.extensions.BooleanSchema =  new Schema.extend({
  validate : function(instance) {
    return Object(instance) instanceof Boolean
  },

  generate : function() {
    return Math.random() < 0.5
  },

  toJSON : function() {
    return { type : 'boolean' }
  }
})

var booleanSchema = module.exports = new BooleanSchema().wrap()

Schema.fromJSON.def(function(sch) {
  if (!sch || sch.type !== 'boolean') return

  return booleanSchema
})

Boolean.schema = booleanSchema
