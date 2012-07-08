var schema = require('../schema')
  , nothing = require('./nothing')

var anything = module.exports = new schema.schema({
  compile : function() {
    return { expression : 'instance != null' }
  },
  
  generate : function() {
    var type = [nothing, Boolean, Number, String, Array, Object][Math.floor(Math.random()*6)]
    return type.schema.generate()
  },

  toJSON : function() {
    return { type : 'any' }
  }
})

schema.fromJS.def(function(sch) {
  if (sch === undefined) return anything
})

schema.fromJSON.def(function(sch) {
  if (sch.type === 'any') return anything
})
