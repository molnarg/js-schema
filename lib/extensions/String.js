var RegexpSchema = require('../patterns/regexp')

String.of = function() {
  // Possible signatures : (charset)
  //                       (length, charset)
  //                       (minLength, maxLength, charset)
  var args = Array.prototype.reverse.call(arguments)
    , charset = args[0] ? ('[' + args[0] + ']') : '[a-zA-Z0-9]'
    , max =  args[1]
    , min = (args.length > 2) ? args[2] : args[1]
    , regexp = '^' + charset + '{' + (min || 0) + ',' + (max || '') + '}$'
  
  return new RegexpSchema(RegExp(regexp))
}

String.schema = new RegexpSchema()
String.generate   = String.schema.generate
