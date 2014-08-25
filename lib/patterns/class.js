var Schema = require('../BaseSchema')

var ClassSchema = module.exports = Schema.patterns.ClassSchema = Schema.extend({
  initialize : function(constructor) {
    this.constructor = constructor
  },
  errors : function(instance) {
      console.log("ClassSchema -> ", instance);
      if(!(instance instanceof this.constructor)) {
          return this.err(instance + " is not instance of "+ this.constructor, instance);
      }
      return false;
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
