var Schema = require('../Schema')
  , RandExp = require('randexp')

var defaultRandExp = new RandExp(/^[a-zA-Z0-9]{1,10}$/)

var RegexpSchema = module.exports = Schema.extend({
  initialize : function(regexp) {
    this.regexp = regexp
    this.randexp = this.regexp ? new RandExp(this.regexp) : defaultRandExp
  },
  
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
    var json = Schema.prototype.toJSON.call(this)
    
    json.type = 'string'
    
    if (this.regexp) {
      json.pattern = this.regexp.toString()
      json.pattern = json.pattern.substr(1, json.pattern.length - 2)
    }
    
    return json
  }
})

Schema.fromJSON.def(function(sch) {
  if (!sch || sch.type !== 'string') return
  
  if ('pattern' in sch) {
    return new RegexpSchema(RegExp('^' + sch.pattern + '$'))
  } else if ('minLength' in sch || 'maxLength' in sch) {
    return new RegexpSchema(RegExp('^.{' + [ sch.minLength || 0, sch.maxLength ].join(',') + '}$'))
  } else {
    return new RegexpSchema()
  }
})

Schema.fromJS.def(function(regexp) {
  if (regexp instanceof RegExp) return new RegexpSchema(regexp)
})
