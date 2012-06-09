var schema = require('../schema')

var NumberSchema = module.exports = function(minimum, exclusiveMinimum, maximum, exclusiveMaximum, divisibleBy) {
  this.minimum = minimum
  this.exclusiveMinimum = exclusiveMinimum
  this.maximum = maximum
  this.exclusiveMaximum = exclusiveMaximum
  this.divisibleBy = divisibleBy
  
  return new schema(this)
}

NumberSchema.prototype = {
  compile : function() {
    var references = [this.minimum, this.maximum, this.divisibleBy]
      , checks = ['Object(instance) instanceof Number']
    
    if (this.minimum !== undefined) {
      checks.push('instance ' + (this.exclusiveMinimum ? '>' : '>=') + ' {0}')
    }
    
    if (this.maximum !== undefined) {
      checks.push('instance ' + (this.exclusiveMaximum ? '<' : '<=') + ' {1}')
    }
    
    if (this.divisibleBy !== undefined) {
      checks.push('instance % {2} === 0')
    }
    
    return { references : references, expression : checks.join(' && ') }
  },

  min : function(minimum) {
    return new NumberSchema(minimum, false, this.maximum, this.exclusiveMaximum, this.divisibleBy)
  },

  above : function(minimum) {
    return new NumberSchema(minimum, true, this.maximum, this.exclusiveMaximum, this.divisibleBy)
  },

  max : function(maximum) {
    return new NumberSchema(this.minimum, this.exclusiveMinimum, maximum, false, this.divisibleBy)
  },

  below : function(maximum) {
    return new NumberSchema(this.minimum, this.exclusiveMinimum, maximum, true, this.divisibleBy)
  },
  
  step : function(divisibleBy) {
    return new NumberSchema(this.minimum, this.exclusiveMinimum, this.maximum, this.exclusiveMaximum, divisibleBy)
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
    
    if (this.divisibleBy !== undefined) schema.divisibleBy = this.divisibleBy
    
    return schema
  }
}

Number.schema = new NumberSchema()
Number.min    = Number.schema.min
Number.above  = Number.schema.above
Number.max    = Number.schema.max
Number.below  = Number.schema.below
Number.step   = Number.schema.step

Number.Integer = Number.step(1)
