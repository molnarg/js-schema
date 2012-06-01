var schema = require('../schema')

var NumberSchema = module.exports = function(minimum, exclusiveMinimum, maximum, exclusiveMaximum) {
  this.minimum = minimum
  this.exclusiveMinimum = exclusiveMinimum
  this.maximum = maximum
  this.exclusiveMaximum = exclusiveMaximum
  
  return schema.call(this)
}

NumberSchema.prototype = {
  validate : function(instance) {
    if (!(Object(instance) instanceof Number)) return false
    
    if (this.minimum !== undefined) {
      if (instance < this.minimum || (this.exclusiveMinimum && instance == this.minimum)) return false
    }
    
    if (this.maximum !== undefined) {
      if (instance > this.maximum || (this.exclusiveMaximum && instance == this.maximum)) return false
    }
    
    return true
  },

  min : function(minimum) {
    return new NumberSchema(minimum, false, this.maximum, this.exclusiveMaximum)
  },

  above : function(minimum) {
    return new NumberSchema(minimum, true, this.maximum, this.exclusiveMaximum)
  },

  max : function(maximum) {
    return new NumberSchema(this.minimum, this.exclusiveMinimum, maximum, false)
  },

  below : function(maximum) {
    return new NumberSchema(this.minimum, this.exclusiveMinimum, maximum, true)
  },

  toJSON : function() {
    var schema = { type : 'number', required : true }
    
    if (this.minimum !== undefined) {
      schema.minimum = this.minimum
      schema.exclusiveMinimum = (this.exclusiveMinimum === true)
    }
    
    if (this.maximum !== undefined) {
      schema.maximum = this.maximum
      schema.exclusiveMaximum = (this.exclusiveMaximum === true)
    }
    
    return schema
  }
}

Number.schema = new NumberSchema()
Number.min    = Number.schema.min
Number.above  = Number.schema.above
Number.max    = Number.schema.max
Number.below  = Number.schema.below
