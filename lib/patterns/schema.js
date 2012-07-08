var schema = require('../schema')

schema.fromJS.def(function(sch) {
  if (sch instanceof schema.schema) return sch
})
