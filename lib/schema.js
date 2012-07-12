var Schema = require('./Schema')

var schema = module.exports = function(schemaObject) {
  if (this instanceof schema) {
    // When called with new, create a schema object and then return the schema function
    var constructor = Schema.extend(schemaObject)
    return new constructor()
    
  } else {
    // When called as simple function, forward everything
    // to fromJS, and then seal the resulting schema
    return schema.fromJS.apply(null, arguments)
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

