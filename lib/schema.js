var def = require('def.js')
  , linker = require('./linker')

var schema = module.exports = function(schemaObject) {
  // When called as simple function, forward everything to fromJS, and then seal the resulting schema
  if (!(this instanceof schema)) return schema.fromJS.apply(null, arguments).seal()
  
  // When called with new, transform the parameter schema object to a compiled schema function
  if (!schemaObject.compile && !schemaObject.validate) {
    throw new Error('Schema definition objects must have either compile or validate function.')
  }
  
  if (schemaObject.compile) schemaObject.validate = linker.link(schemaObject.compile())

  var schemaFunction = function(object) {
    if (schemaObject.sealed) schema.self.push(schemaFunction)
    var result = schemaObject.validate(object)
    if (schemaObject.sealed) schema.self.pop()
    
    return result
  }
  
  schemaFunction.assembly = schemaObject.validate.assembly
  
  schemaFunction.seal = function() {
    console.log('seal');
    delete schemaFunction.assembly
    schemaObject.sealed = true
    return schemaFunction
  }
  
  schemaFunction.schema = schemaFunction
  
  for (var key in schemaObject) {
    if (schemaObject[key] instanceof Function) schemaFunction[key] = schemaObject[key].bind(schemaObject)
  }
  
  return schemaFunction
}

schema.self = new schema({
  validate : function(object) {
    return this.references[0](object)
  },
  
  references : [],
  
  push : function(reference) {
    this.references.unshift(reference)
  },
  
  pop : function(reference) {
    this.references.shift(reference)
  }
})

schema.fromJS = def()

schema.fromJSON = def()

schema.toJSON = function(sch) {
  return schema(sch).toJSON()
}

schema.generate = function(sch) {
  return schema(sch).generate()
}
