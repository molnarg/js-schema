var schema = require('../schema')
  , EqualitySchema = require('../patterns/equality')

var OrSchema = module.exports = function(schemas) {
  this.schemas = schemas
  
  return new schema(this)
}

OrSchema.prototype = {
  compile : function() {
    var compiled = { references : this.schemas.slice() }
    
    var checks = this.schemas.map(function(sch, i) { return '{' + i + '}(instance)' })
    compiled.expression = checks.join(' || ')
    
    return compiled
  },
  
  generate : function() {
    return this.schemas[Math.floor(Math.random()*this.schemas.length)].generate()
  }
}


schema.fromJS.def(function(schemas) {
  if (schemas instanceof Array) return new OrSchema(schemas.map(schema.fromJS))
})

schema.fromJSON.def(function(sch) {
  if (!sch) return
  
  if (sch['enum'] instanceof Array) {
    return new OrSchema(sch['enum'].map(function(object) {
      return new EqualitySchema(object)
    }))
  }
  
  if (sch['type'] instanceof Array) {
    return new OrSchema(sch['type'].map(function(type) {
      return schema.fromJSON(typeof type === 'string' ? { type : type } : type)
    }))
  }
})
