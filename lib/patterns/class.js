var Schema = require('../BaseSchema')

var ClassSchema = module.exports = Schema.patterns.ClassSchema = Schema.extend({
  initialize : function(constructor) {
    this.constructor = constructor
  },

  validate : function(instance) {
    return instance instanceof this.constructor
  }
})


Schema.fromJS.def(function(constructor) {
  if (!(constructor instanceof Function)) return

  if (constructor.schema instanceof Function) {
    return constructor.schema.unwrap()
  } else {
    return new ClassSchema(constructor)
  }
})
