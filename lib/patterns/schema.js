var Schema = require('../Schema')

Schema.fromJS.def(function(sch) {
  if (sch instanceof Schema) return sch
})
