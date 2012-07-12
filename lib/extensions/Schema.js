var Schema = require('../Schema')
  , schema = require('../schema')

var SelfSchema = module.exports = Schema.extend({
  set : function(target) {
    if (!this.target) this.target = target
    Schema.self = schema.self = new SelfSchema()
  },
  
  publicFunctions : [ 'set' ],

  validate : function(instance) {
    return this.target(instance)
  },
  
  generate : function() {
    return this.target.generate()
  },
  
  toJSON : function() {
    return { '$ref' : this.target.getId() }
  }
})

Schema.self = schema.self = new SelfSchema()
