var ReferenceSchema = require('../patterns/reference')
  , ClassSchema = require('../patterns/class')

// Function creation is not possible the way patterns/class.js does,
// so overriding it here
Function.schema = new ClassSchema(Function)
Function.schema.generate = function() {
  return function() {}
}

Function.reference = function(f) {
  return new ReferenceSchema(f).wrap()
}
