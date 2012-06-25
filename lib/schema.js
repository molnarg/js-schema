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
    if (schemaObject.sealed) return validate
    schemaObject.sealed = true
    
    if (schemaObject.leafs) {
      var leafs = schemaObject.leafs()
      if (leafs.certain.indexOf(schema.self) !== -1) {
        throw new Error('There\'s no object that satisfies this schema because of necessary recursion.')
      }
      if (leafs.uncertain.indexOf(schema.self) !== -1) {
        // If the validate function is compiled then recompiling it with self inlining
        if (validate.assembly) {
          var newValidate = linker.link(schemaObject.compile(), schema.self)
          for (var key in validate) newValidate[key] = validate[key]
          newValidate.schema = newValidate
          validate = newValidate
        }
        
        // schema.self needs to be pointed to this schema, and then it must be reset
        schema.self.set(validate)
        schema.self = new SelfSchema()
      }
    }
    
    delete validate.assembly
    
    return validate
  }
  
  validate.schema = validate
  
  for (var key in schemaObject) {
    if (schemaObject[key] instanceof Function && !schemaObject[key].schema) {
      validate[key] = schemaObject[key].bind(schemaObject)
    }
  }
  
  return validate
}


var SelfSchema = function() {
  return new schema(this)
}

SelfSchema.prototype = {
  validate : function(instance) {
    return this.target(instance)
  },
  
  generate : function() {
    return this.target.generate()
  },
  
  set : function(target) {
    if (!this.target) this.target = target
  }
}

schema.self = new SelfSchema()


schema.fromJS = def()

schema.fromJSON = def()

schema.toJSON = function(sch) {
  return schema(sch).toJSON()
}

schema.generate = function(sch) {
  return schema(sch).generate()
}
