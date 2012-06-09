var schema = require('../schema')
  , RandExp = require('randexp')

var RegexpSchema = module.exports = function(regexp) {
  this.regexp = regexp
  
  return new schema(this)
}

RegexpSchema.prototype = {
  compile : function() {
    return { references : [this.regexp], expression : '{0}.test(instance)' }
  },
  
  generate : function() {
    return (new RandExp(this.regexp)).gen()
  }
}


schema.fromJS.def(function(regexp) {
  if (regexp instanceof RegExp) return new RegexpSchema(regexp)
})
