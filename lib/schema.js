var Schema = require('./Schema')

var schema = module.exports = function(schemaDescription) {
  var doc, schemaObject
  
  if (arguments.length === 2) {
    doc = schemaDescription
    schemaDescription = arguments[1]
  }
  
  if (this instanceof schema) {
    // When called with new, create a schema object and then return the schema function
    var constructor = Schema.extend(schemaDescription)
    schemaObject = new constructor()
    if (doc) schemaObject.doc = doc
    return schemaObject.wrap()
  
  } else {
    // When called as simple function, forward everything
    // to fromJS, and then seal the resulting schema
    schemaObject = Schema.fromJS(schemaDescription)
    if (doc) schemaObject.doc = doc
    return schemaObject.wrap().seal()
  }
}

schema.toJSON = function(sch) {
  return Schema.fromJS(sch).wrap().seal().toJSON()
}

schema.generate = function(sch) {
  return Schema.fromJS(sch).wrap().seal().generate()
}

schema.fromJS = function(sch) {
  return Schema.fromJS(sch).wrap().seal()
}

schema.fromJSON = function(sch) {
  return Schema.fromJSON(sch).wrap().seal()
}

