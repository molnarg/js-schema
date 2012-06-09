var schema = require('../schema')

var ObjectSchema = module.exports = function(object) {
  this.reference = {}
  
  for (var property in object) this.reference[property] = schema(object[property])
  
  return new schema(this)
}

ObjectSchema.prototype = {
  compile : function() {
    var self = this, compiled = { references : [] }
    
    var checks = Object.keys(self.reference).map(function(property, i) {
      compiled.references.push(self.reference[property])
      return '{' + i + '}(instance["' + property.replace(/"/g,'\\"') + '"])'
    })
    checks.unshift('instance != null')
    compiled.expression = checks.join(' && ')
    
    return compiled
  },
  
  generate : function() {
    var object = {}
    
    for (var property in this.reference) {
      object[property] = this.reference[property].generate()
    }
    
    return object
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
  }
}


schema.fromJS.def(function(object) {
  if (object instanceof Object) return new ObjectSchema(object)
})

schema.fromJSON.def(function(sch) {
  if (!sch || sch.type !== 'object') return
  
  var properties = {}
  for (var name in sch.properties) properties[name] = schema.fromJSON(sch.properties[name])
  
  return new ObjectSchema(properties)
})
