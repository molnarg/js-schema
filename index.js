module.exports = require('./lib/schema')

// Core schemas
require('./lib/patterns/reference')

require('./lib/patterns/nothing')
require('./lib/patterns/anything')

require('./lib/patterns/object')

require('./lib/patterns/or')

require('./lib/patterns/instanceof')
require('./lib/patterns/schema')

require('./lib/patterns/regexp')

// Extensions
require('./lib/extensions/Boolean')
require('./lib/extensions/Number')
require('./lib/extensions/String')
require('./lib/extensions/Object')
require('./lib/extensions/Array')
require('./lib/extensions/Function')
