var def = require('def.js')
  , global = (function(){ return this }())

var schema = module.exports = function(f, options) {
  // If called as simple function, forward everything to fromJS
  if (this === global) return schema.fromJS.apply(this, arguments)
  
  // If called as parent constructor
  if (!this.validate) throw new Error('Schemas must have validate function.')
  
  var validate = this.validate.bind(this)
  
  for (var property in this) {
    if (this[property] instanceof Function) validate[property] = this[property].bind(this)
  }
  
  validate.schema = validate
  
  return validate
}

schema.fromJS = def()

schema.fromJSON = def()

schema.toJSON = function(sch) {
  return schema(sch).toJSON()
}

schema.random = function(sch) {
  return schema(sch).random()
}
