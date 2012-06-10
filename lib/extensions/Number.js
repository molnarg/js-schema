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
  
  generate : function() {
    var length, random
      , min = this.minimum
      , max = this.maximum
      , step = this.divisibleBy
    
    // If there's no decalred maximum or minimum then assigning a reasonable value
    if (min == null || min === -Infinity) {
      if (max == null || max === Infinity) {
        min = 0
        max = 10
      } else {
        min = max > 0 ? 0 : max*2
      }
    } else if (max == null || max === Infinity) {
      max = this.min < 0 ? 0 : this.min*2
    }
    
    // Choosing random number from a continuous set
    if (step == null || step === 0) {
      length = max - min
      do {
        random = min + Math.random()*length
      } while ((this.exclusiveMinimum && random === min) || (this.exclusiveMaximum && random === max))
    
    // Choosing random number from a discrete set
    } else {
      min = Math.ceil(min / step) * step
      max = Math.floor(max / step) * step
      
      if (this.exclusiveMinimum && min === this.minimum) min += step
      if (this.exclusiveMaximum && max === this.maximum) max -= step
      
      if (min > max) return undefined
      
      length = Math.round((max - min) / step) + 1
      random = min + step * Math.floor(Math.random()*length)
    }
    
    return random
  },
  
  toJSON : function() {
    var schema = { type : 'number' }
    
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

Number.schema     = new NumberSchema()
Number.min        = Number.schema.min
Number.above      = Number.schema.above
Number.max        = Number.schema.max
Number.below      = Number.schema.below
Number.step       = Number.schema.step
Number.generate   = Number.schema.generate

Number.Integer = Number.step(1)
