var Schema = require('../Schema')
  , nothing = require('./nothing')

var AnythingSchema = Schema.extend({
  validate : function(instance) {
    return instance != null
  },

  generate : function() {
    var type = [{schema:nothing}, Boolean, Number, String, Array, Object][Math.floor(Math.random()*6)]
    return type.schema.generate()
  },

  toJSON : function() {
    return { type : 'any' }
  }
})

var anything = module.exports = new AnythingSchema()

Schema.fromJS.def(function(sch) {
  if (sch === undefined) return anything
})

Schema.fromJSON.def(function(sch) {
  if (sch.type === 'any') return anything
})
