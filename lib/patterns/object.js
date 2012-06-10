var schema = require('../schema')

var ObjectSchema = module.exports = function(mandatory, optional) {
  this.mandatory = mandatory || {}
  this.optional = optional || {}
  
  return new schema(this)
}

ObjectSchema.prototype = {
  compile : function() {
    var self = this, references = []
    
    var reference = function(object) { return '{' + (references.push(object) - 1) + '}' }
    var propertyName = function(property) { return '"' + property.replace(/"/g,'\\"') + '"' }
    
    var checks = ['instance != null']
    
    checks = checks.concat(Object.keys(self.mandatory).map(function(property) {
      var conforms = reference(self.mandatory[property]) + '(instance[' + propertyName(property) + '])'
      return conforms
    }))
    
    checks = checks.concat(Object.keys(self.optional).map(function(property) {
      // either not present in instance or it conforms to the schema
      var inInstance = propertyName(property) + ' in instance'
      var conforms = reference(self.optional[property]) + '(instance[' + propertyName(property) + '])'
      return '(!(' + inInstance + ') || ' + conforms + ')'
    }))
    
    return { references : references, expression : checks.join(' && ') }
  },
  
  generate : function() {
    var object = {}
    
    for (var property in this.reference) {
      object[property] = this.reference[property].generate()
    }
    
    return object
  },

  toJSON : function() {
    var schema = { type : 'object' }
    
    if (Object.keys(this.mandatory).length > 0 || Object.keys(this.optional).length > 0) {
      schema.properties = {}
      
      for (var property in this.mandatory) {
        schema.properties[property] = this.mandatory[property].toJSON()
        schema.properties[property].required = true
      }
      
      for (var property in this.optional) {
        schema.properties[property] = this.optional[property].toJSON()
      }
    }
    
    return schema
  }
}


schema.fromJS.def(function(object) {
  if (!(object instanceof Object)) return
  
  var mandatory = {}, optional = {}, optionalPropertyName = RegExp('^/(.*)/$')
  
  for (var property in object) {
    if (optionalPropertyName.test(property)) {
      optional[property.match(optionalPropertyName)[1]] = schema(object[property])
    } else {
      mandatory[property] = schema(object[property])
    }
  }
  
  return new ObjectSchema(mandatory, optional)
})

schema.fromJSON.def(function(sch) {
  if (!sch || sch.type !== 'object') return
  
  var mandatory = {}, optional = {}, subschema
    
  for (var name in sch.properties) {
    subschema = sch.properties[name]
    (subschema.required === true ? mandatory : optional)[name] = schema.fromJSON(subschema)
  }
  
  return new ObjectSchema(mandatory)
})
