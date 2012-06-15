var ReferenceSchema = require('../patterns/reference')

// Function creation is not possible the way patterns/class.js does,
// so overriding it here
Function.schema = Function.prototype.schema.bind(Function)
Function.schema.generate = function() {
  return function() {}
}

Function.Reference = function(f) {
  return new ReferenceSchema(f)
}
