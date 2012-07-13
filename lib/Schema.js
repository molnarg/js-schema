var def = require('def.js')
  , linker = require('./linker')
  , _ = require('underscore')

var Schema =  module.exports = function() {}

Schema.prototype = {
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
      if (leafs.certain.indexOf(Schema.self) !== -1) {
        throw new Error('There\'s no object that satisfies this schema.')
      }
      if (leafs.uncertain.indexOf(Schema.self) !== -1) {
        // If the validate function is compiled then recompiling it with self inlining
        if (this.compile) {
          var newValidate = linker.link(this.compile(), Schema.self.validate)
          for (var key in this.validate) newValidate[key] = this.validate[key]
          newValidate.schema = newValidate
          this.validate = newValidate
        }
        
        // schema.self needs to be pointed to this schema, and then it must be reset
        Schema.self.set(this.validate)
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
    
    return this.validate
  },
  
  unwrap : function() {
    return this
  },
  
  toJSON : function() {
    var json = {}
    
    if (this.id != null) json.id = this.id
    if (this.doc != null) json.description = this.doc
    
    return json
  }
}

Schema.fromJS = def()

Schema.fromJSON = def()


Schema.extend = function(descriptor) {
  if (!descriptor.compile && !descriptor.validate) {
    throw new Error('Schema objects must have either compile or validate function.')
  }
  
  var constructor = function() {
    if (this.initialize) this.initialize.apply(this, arguments)
    
    this.validate = this.compile ? linker.link(this.compile())
                                 : this.validate.bind(this)
    
    this.validate.schema = this.validate
  }
  
  constructor.prototype = _.extend(Object.create(Schema.prototype), descriptor)
  
  return constructor
}
