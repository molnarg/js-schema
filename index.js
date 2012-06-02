module.exports = require('./lib/schema')

// Core schemas
require('./lib/core/reference')

require('./lib/core/nothing')
require('./lib/core/anything')

require('./lib/core/object')

require('./lib/core/or')
require('./lib/core/and')

require('./lib/core/instanceof')
require('./lib/core/schema')

// extensions
require('./lib/extensions/Number')
require('./lib/extensions/Function')
require('./lib/extensions/Object')
require('./lib/extensions/Array')

//var schema = module.exports
//console.log(schema([3,4]))
//console.log(schema([3,4]).toString())
