var def = require('def.js')
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
        // schema.self needs to be pointed to this schema, and then it must be reset
        Schema.self.resolve(this)
      }
    }
    
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
  if (!descriptor.validate) {
    throw new Error('Schema objects must have a validate function.')
  }
  
  var constructor = function() {
    if (this.initialize) this.initialize.apply(this, arguments)
    
    this.validate = this.validate.bind(this)
    
    this.validate.schema = this.validate
  }
  
  constructor.prototype = _.extend(Object.create(Schema.prototype), descriptor)
  
  return constructor
}
