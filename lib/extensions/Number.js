var schema = require('../schema')

var NumberSchema = module.exports = function(minimum, exclusiveMinimum, maximum, exclusiveMaximum) {
  this.minimum = minimum
  this.exclusiveMinimum = exclusiveMinimum
  this.maximum = maximum
  this.exclusiveMaximum = exclusiveMaximum
  
  return new schema(this)
}

NumberSchema.prototype = {
  compile : function() {
    var compiled = { references : [this.minimum, this.maximum] }
    
    compiled.expression = 'Object(instance) instanceof Number'
    
    if (this.minimum !== undefined) {
      compiled.expression += ' && instance ' + (this.exclusiveMinimum ? '>' : '>=') + ' {0}'
    }
    
    if (this.maximum !== undefined) {
      compiled.expression += ' && instance ' + (this.exclusiveMaximum ? '<' : '<=') + ' {1}'
    }
    
    return compiled
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
