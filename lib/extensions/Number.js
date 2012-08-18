var Schema = require('../Schema')

var NumberSchema = module.exports = Schema.extend({
  initialize : function(minimum, exclusiveMinimum, maximum, exclusiveMaximum, divisibleBy) {
    this.minimum = minimum != null ? minimum : -Infinity
    this.exclusiveMinimum = exclusiveMinimum
    this.maximum = minimum != null ? maximum : Infinity
    this.exclusiveMaximum = exclusiveMaximum
    this.divisibleBy = divisibleBy || 0
  },

  min : function(minimum) {
    return new NumberSchema( minimum, false
                           , this.maximum, this.exclusiveMaximum
                           , this.divisibleBy
                           ).wrap()
  },

  above : function(minimum) {
    return new NumberSchema( minimum, true
                           , this.maximum, this.exclusiveMaximum
                           , this.divisibleBy
                           ).wrap()
  },

  max : function(maximum) {
    return new NumberSchema( this.minimum, this.exclusiveMinimum
                           , maximum, false
                           , this.divisibleBy
                           ).wrap()
  },

  below : function(maximum) {
    return new NumberSchema( this.minimum, this.exclusiveMinimum
                           , maximum, true
                           , this.divisibleBy
                           ).wrap()
  },

  step : function(divisibleBy) {
    return new NumberSchema( this.minimum, this.exclusiveMinimum
                           , this.maximum, this.exclusiveMaximum
                           , divisibleBy
                           ).wrap()
  },

  publicFunctions : [ 'min', 'above', 'max', 'below', 'step' ],

  validate : function(instance) {
    return (Object(instance) instanceof Number) &&
           (this.exclusiveMinimum ? instance >  this.minimum
                                  : instance >= this.minimum) &&
           (this.exclusiveMaximum ? instance <  this.maximum
                                  : instance <= this.maximum) &&
           (this.divisibleBy === 0 || instance % this.divisibleBy === 0)
  },

  generate : function() {
    var length, random
      , min = this.minimum
      , max = this.maximum
      , step = this.divisibleBy

    // If there's no declared maximum or minimum then assigning a reasonable value
    if (min === -Infinity || max === Infinity) {
      length = 10
      while (Math.random() < 0.5) length = length * 10

      if (min === -Infinity && max === Infinity) {
        min = length / -2
        max = length / +2
      } else if (min === -Infinity) {
        min = max - length
      } else if (max === Infinity) {
        max = min + length
      }
    }

    // Choosing random number from a continuous set
    if (step === 0) {
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
    var json = Schema.prototype.toJSON.call(this)

    json.type = ( this.divisibleBy !== 0 && this.divisibleBy % 1 === 0 ) ? 'integer' : 'number'

    if (this.divisibleBy !== 0 && this.divisibleBy !== 1) json.divisibleBy = this.divisibleBy

    if (this.minimum !== -Infinity) {
      json.minimum = this.minimum
      if (this.exclusiveMinimum === true) json.exclusiveMinimum = true
    }

    if (this.maximum !== Infinity) {
      json.maximum = this.maximum
      if (this.exclusiveMaximum === true) json.exclusiveMaximum = true
    }

    return json
  }
})

Schema.fromJSON.def(function(sch) {
  if (!sch || (sch.type !== 'number' && sch.type !== 'integer')) return

  return new NumberSchema( sch.minimum, sch.exclusiveMinimum
                         , sch.maximum, sch.exclusiveMaximum
                         , sch.divisibleBy || (sch.type === 'integer' ? 1 : 0)
                         )
})

Number.schema     = new NumberSchema().wrap()
Number.min        = Number.schema.min
Number.above      = Number.schema.above
Number.max        = Number.schema.max
Number.below      = Number.schema.below
Number.step       = Number.schema.step

Number.Integer = Number.step(1)
