var ReferenceSchema = require('../patterns/reference')
  , EqualitySchema = require('../patterns/equality')

Object.like = function(other) {
  return new EqualitySchema(other)
}

Object.reference = function(o) {
  return new ReferenceSchema(o)
}
