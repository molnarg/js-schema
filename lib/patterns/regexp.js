var schema = require('../schema')
  , RandExp = require('randexp')

var defaultRandExp = new RandExp(/^[a-zA-Z0-9]{1,10}$/)

var RegexpSchema = module.exports = function(regexp) {
  this.regexp = regexp
  this.randexp = this.regexp ? new RandExp(this.regexp) : defaultRandExp
  
  return new schema(this)
}

RegexpSchema.prototype = {
  compile : function() {
    return { references : [this.regexp]
           , expression : 'Object(instance) instanceof String'
                        + (this.regexp ? ' && {0}.test(instance)' : '')
           }
  },
  
  generate : function() {
    return this.randexp.gen()
  },
  
  toJSON : function() {
    var sch = { type : 'string' }
    
    if (this.regexp) {
      console.log(this.regexp.toString())
      sch.pattern = this.regexp.toString()
      sch.pattern = sch.pattern.substr(1, sch.pattern.length - 2)
    }
    
    return sch
  }
}

schema.fromJSON.def(function(sch) {
  if (!sch || sch.type !== 'string') return
  
  if ('pattern' in sch) {
    return new RegexpSchema(RegExp('^' + sch.pattern + '$'))
  } else if ('minLength' in sch || 'maxLength' in sch) {
    return new RegexpSchema(RegExp('^.{' + [ sch.minLength || 0, sch.maxLength ].join(',') + '}$'))
  } else {
    return new RegexpSchema()
  }
})

schema.fromJS.def(function(regexp) {
  if (regexp instanceof RegExp) return new RegexpSchema(regexp)
})
