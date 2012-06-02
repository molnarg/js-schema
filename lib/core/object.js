var schema = require('../schema')

var ObjectSchema = module.exports = function(object) {
  this.reference = {}
  
  for (var property in object) this.reference[property] = schema(object[property])
  
  return new schema(this)
}

ObjectSchema.prototype = {
  validate : function(instance) {
    if (instance == null) return false
    
    instance = Object(instance)
    
    for (var property in this.reference) {
      if (property in instance) {
        if (!this.reference[property].validate(instance[property])) return false
      } else {
        if (!this.reference[property].validate()) return false
      }
    }
    
    return true
  },
  
  toJSON : function() {
    var schema = { type : 'object', required : true }
    
    if (Object.keys(this.reference).length > 0) {
      schema.properties = {}
      
      for (var property in this.reference) {
        schema.properties[property] = this.reference[property].toJSON()
      }
    }
    
    return schema
  },
  
  compile : function() {
    var self = this, compiled = { references : [] }
    
    var checks = Object.keys(self.reference).map(function(property, i) {
      compiled.references.push(self.reference[property])
      return '{' + i + '}(instance["' + property.replace(/"/g,'\\"') + '"])'
    })
    checks.unshift('instance != null')
    compiled.expression = checks.join(' && ')
    
    return compiled
  }
}


schema.fromJS.def(function(object) {
  if (object instanceof Object) return new ObjectSchema(object)
})
