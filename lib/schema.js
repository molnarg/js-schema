var def = require('def.js')

var schema = module.exports = function() {
  return schema.fromJS.apply(this, arguments)
}

schema.fromJS = def()

schema.fromJSON = def()

schema.toJS = function(sch) {
  return schema(sch).toJS()
}

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
