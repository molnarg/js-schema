var def = require('def.js')

var schema = module.exports = def()

schema.fromJS = schema

schema.toJS = function(sch) {
  return schema(sch).toJS()
}

schema.fromJSON = def()

schema.toJSON = function(sch) {
  return schema(sch).toJSON()
}

schema.random = function(sch) {
  return schema(sch).random()
}


require('./core/reference')

require('./core/nothing')
require('./core/anything')

require('./core/object')

require('./core/or')
require('./core/and')

require('./core/instanceof')
require('./core/schema')
