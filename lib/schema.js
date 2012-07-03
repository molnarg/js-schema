var def = require('def.js')
  , linker = require('./linker')
  , _ = require('underscore')

var schema = module.exports = function(schemaObject) {
  if (this instanceof schema) {
    // When called with new, create a schema object and then return the schema function
    return _.extend({}, schema.prototype, schemaObject).schema()
    
  } else {
    // When called as simple function, forward everything
    // to fromJS, and then seal the resulting schema
    return schema.fromJS.apply(null, arguments).seal()
  }
}

schema.prototype = {
  seal : function() {
    if (this.sealed) return this.validator
    this.sealed = true
    
    if (this.leafs) {
      var leafs = this.leafs()
      if (leafs.certain.indexOf(schema.self) !== -1) {
        throw new Error('There\'s no object that satisfies this schema.')
      }
      if (leafs.uncertain.indexOf(schema.self) !== -1) {
        // If the validate function is compiled then recompiling it with self inlining
        if (this.compile) {
          var newValidate = linker.link(this.compile(), schema.self)
          for (var key in this.validator) newValidate[key] = this.validator[key]
          newValidate.schema = newValidate
          this.validator = newValidate
        }
        
        // schema.self needs to be pointed to this schema, and then it must be reset
        schema.self.set(this.validator)
        schema.self = new SelfSchema()
      }
    }
    
    delete this.validator.assembly
    
    return this.validator
  },
  
  schema : function() {
    if (!this.compile && !this.validate) {
      throw new Error('Schema definition objects must have either compile or validate function.')
    }
    
    this.validator = this.compile ? linker.link(this.compile())
                                  : this.validate.bind(this)
    
    this.validator.schema = this.validator
    
    var publicFunctions = [ 'seal', 'toJSON', 'generate', 'getId', 'leafs' ]
    publicFunctions = publicFunctions.concat(this.publicFunctions || [])
    
    for (var i = 0; i < publicFunctions.length; i++) {
      if (!this[publicFunctions[i]]) continue
      this.validator[publicFunctions[i]] = this[publicFunctions[i]].bind(this)
    }
    
    return this.validator
  }
}


var SelfSchema = function() {
  return this.schema()
}

SelfSchema.prototype = _.extend({}, schema.prototype, {
  set : function(target) {
    if (!this.target) this.target = target
  },
  
  publicFunctions : [ 'set' ],

  validate : function(instance) {
    return this.target(instance)
  },
  
  generate : function() {
    return this.target.generate()
  },
  
  toJSON : function() {
    return { '$ref' : this.target.getId() }
  }
})

schema.self = new SelfSchema()


schema.fromJS = def()

schema.fromJSON = def()

schema.toJSON = function(sch) {
  return schema(sch).toJSON()
}

schema.generate = function(sch) {
  return schema(sch).generate()
}
