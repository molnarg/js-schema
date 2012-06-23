var schema = require('../schema')

var NumberSchema = module.exports = function(minimum, exclusiveMinimum, maximum, exclusiveMaximum, divisibleBy) {
  this.minimum = minimum != null ? minimum : -Infinity
  this.exclusiveMinimum = exclusiveMinimum
  this.maximum = minimum != null ? maximum : Infinity
  this.exclusiveMaximum = exclusiveMaximum
  this.divisibleBy = divisibleBy || 0
  
  return new schema(this)
}

NumberSchema.prototype = {
  compile : function() {
    var references = [this.minimum, this.maximum, this.divisibleBy]
      , checks = ['Object(instance) instanceof Number']
    
    if (this.minimum !== -Infinity) {
      checks.push('instance ' + (this.exclusiveMinimum ? '>' : '>=') + ' {0}')
    }
    
    if (this.maximum !== Infinity) {
      checks.push('instance ' + (this.exclusiveMaximum ? '<' : '<=') + ' {1}')
    }
    
    if (this.divisibleBy !== 0) {
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
    
    // If there's no declared maximum or minimum then assigning a reasonable value
    if (min === -Infinity) {
      if (max === Infinity) {
        min = 0
        max = 10
      } else {
        min = max > 0 ? 0 : max*2
      }
    } else if (max === Infinity) {
      max = this.minimum < 0 ? 0 : this.minimum*2
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
    var integer = this.divisibleBy !== 0 && this.divisibleBy === Math.floor(this.divisibleBy)
    var schema = { type : integer ? 'integer' : 'number' }
    
    if (this.minimum !== -Infinity) {
      schema.minimum = this.minimum
      if (this.exclusiveMinimum === true) schema.exclusiveMinimum = true
    }
    
    if (this.maximum !== Infinity) {
      schema.maximum = this.maximum
      if (this.exclusiveMaximum === true) schema.exclusiveMaximum = true
    }
    
    var step = this.divisibleBy
    if (step !== 0 && step !== 1) schema.divisibleBy = step
    
    return schema
  }
}

schema.fromJSON.def(function(sch) {
  if (!sch || (sch.type !== 'number' && sch.type !== 'integer')) return
  
  return new NumberSchema( sch.minimum, sch.exclusiveMinimum
                         , sch.maximum, sch.exclusiveMaximum
                         , sch.divisibleBy || (sch.type === 'integer' ? 1 : 0)
                         )
})

Number.schema     = new NumberSchema()
Number.min        = Number.schema.min
Number.above      = Number.schema.above
Number.max        = Number.schema.max
Number.below      = Number.schema.below
Number.step       = Number.schema.step

Number.Integer = Number.step(1)
