var def = require('def.js')
  , linker = require('./linker')
  , global = (function(){ return this }())

var schema = module.exports = function(schemaObject) {
  // When called as simple function, forward everything to fromJS
  if (this === global) return schema.fromJS.apply(global, arguments)
  
  // When called with new, transform the parameter schema object to a compiled schema function
  if (!schemaObject.compile && !schemaObject.validate) {
    throw new Error('Schemas must have either compile or validate function.')
  }
  
  var validate = schemaObject.compile ? linker.link(schemaObject.compile())
                                      : schemaObject.validate.bind(schemaObject)
  
  for (var property in schemaObject) {
    if (schemaObject[property] instanceof Function) validate[property] = schemaObject[property].bind(schemaObject)
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
