var Schema = require('../Schema')
  , schema = require('../schema')

var SchemaReference = Schema.extend({
  validate : function() {
    throw new Error('Trying to validate unresolved schema reference.')
  },
  
  resolve : function(schemaDescriptor) {
    var schemaObject = Schema.fromJS(schemaDescriptor)
    
    for (var key in schemaObject) {
      if (!schemaObject.hasOwnProperty(key)) continue
      
      this[key] = schemaObject[key]
    }
    
    delete this.resolve
  },
  
  publicFunctions : [ 'resolve' ]
})

schema.reference = function(schemaDescriptor) {
  return new SchemaReference()
}

function renewing(ref) {
  ref.resolve = function() {
    Schema.self = schema.self = renewing(new SchemaReference())
    return SchemaReference.prototype.resolve.apply(this, arguments)
  }
  return ref
}

Schema.self = schema.self = renewing(new SchemaReference())
