var def = require('def.js')
  , linker = require('./linker')
  , _ = require('underscore')

var schema = module.exports.schema = function(schemaObject) {
  if (this instanceof schema) {
    // When called with new, create a schema object and then return the schema function
    var constructor = schema.extend(schemaObject)
    return new constructor()
    
  } else {
    // When called as simple function, forward everything
    // to fromJS, and then seal the resulting schema
    return schema.fromJS.apply(null, arguments)
  }
}

schema.prototype = {
  getId : function() {
    if (!this.id) this.id = 'id-' + Math.floor(Math.random()*100000)
    
    return this.id
  },
  
  leafs : function() {
    return { certain : [ this ], uncertain : [] }
  },
  
  seal : function() {
    if (this.sealed) return this.validate
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
          for (var key in this.validate) newValidate[key] = this.validate[key]
          newValidate.schema = newValidate
          this.validate = newValidate
        }
        
        // schema.self needs to be pointed to this schema, and then it must be reset
        schema.self.set(this.validate)
        schema.self = new SelfSchema()
      }
    }
    
    delete this.validate.assembly
    
    return this.validate
  },
  
  wrap : function() {
    if (this.wrapped) return this.validate
    this.wrapped = true
    
    var publicFunctions = [ 'seal', 'toJSON', 'generate', 'getId', 'leafs', 'unwrap' ]
    publicFunctions = publicFunctions.concat(this.publicFunctions || [])
    
    for (var i = 0; i < publicFunctions.length; i++) {
      if (!this[publicFunctions[i]]) continue
      this.validate[publicFunctions[i]] = this[publicFunctions[i]].bind(this)
    }
    
    this.validate.schema = this.validate
    
    return this.validate
  },
  
  unwrap : function() {
    return this
  },
  
  toJSON : function() {
    var json = {}
    
    if (this.id != null) json.id = this.id
    
    return json
  }
}

schema.extend = function(descriptor) {
  if (!descriptor.compile && !descriptor.validate) {
    throw new Error('Schema objects must have either compile or validate function.')
  }
  
  var constructor = function() {
    if (this.initialize) this.initialize.apply(this, arguments)
    
    this.validate = this.compile ? linker.link(this.compile())
                                 : this.validate.bind(this)
  }
  
  constructor.prototype = _.extend(Object.create(schema.prototype), descriptor)
  
  return constructor
}


schema.toJSON = function(sch) {
  return fromJS(sch).wrap().seal().toJSON()
}

schema.generate = function(sch) {
  return fromJS(sch).wrap().seal().generate()
}

schema.fromJS = function(sch) {
  return fromJS(sch).wrap().seal()
}

schema.fromJSON = function(sch) {
  return fromJSON(sch).wrap().seal()
}


var fromJS = module.exports.fromJS = def()

var fromJSON = module.exports.fromJSON = def()


var SelfSchema = schema.extend({
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

schema.self = new SelfSchema().wrap()
