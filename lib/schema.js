var def = require('def.js')
  , linker = require('./linker')

var schema = module.exports = function(schemaObject) {
  // When called as simple function, forward everything to fromJS, and then seal the resulting schema
  if (!(this instanceof schema)) return schema.fromJS.apply(null, arguments).seal()
  
  // When called with new, transform the parameter schema object to a compiled schema function
  if (!schemaObject.compile && !schemaObject.validate) {
    throw new Error('Schema definition objects must have either compile or validate function.')
  }
  
  var validate = schemaObject.compile ? linker.link(schemaObject.compile())
                                      : schemaObject.validate.bind(schemaObject)
  
  validate.seal = function() {
    var sealed = function(object) {
      schema.self.push(validate)
      var result = validate(object)
      schema.self.pop()

      return result
    }
    
    for (var key in validate) sealed[key] = validate[key]
    ;delete sealed.assembly
    ;delete sealed.seal
    sealed.schema = sealed

    return sealed
  }
  
  validate.schema = validate
  
  for (var key in schemaObject) {
    if (schemaObject[key] instanceof Function) validate[key] = schemaObject[key].bind(schemaObject)
  }
  
  return validate
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
