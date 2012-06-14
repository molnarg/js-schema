var ReferenceSchema = require('../patterns/reference')
  , InstanceofSchema = require('../patterns/instanceof')

Function.Reference = function(f) {
  return new ReferenceSchema(f)
}

Function.schema = new InstanceofSchema(Function)
Function.schema.generate = function() {
  return function() {}
}
