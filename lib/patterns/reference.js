var schema = require('../schema')
  , _ = require('underscore')

var ReferenceSchema = module.exports = schema.schema.extend({
  initialize : function(value) {
    this.value = value
  },
  
  compile : function() {
    return { references : [this.value], expression : 'instance === {0}' }
  },
  
  generate : function() {
    return this.value
  },
  
  toJSON : function() {
    return _.extend(schema.schema.prototype.toJSON.call(this), { 'enum' : [this.value] })
  }
})


schema.fromJS.def(function(value) {
  return new ReferenceSchema(value)
})
