
var link = function(assembly) {
  var references = []
  
  var resolve_references = function(compiled, instance_variable_name) {
    var code = compiled.result
    
    if (instance_variable_name) code = code.replace(/instance/g, instance_variable_name)
    
    compiled.references.forEach(function(ref, i) {
      var resolved
      
      if (Object(ref) === ref) {
        if (ref.schema && ref.schema.compile) {
          // ref is a compilable schema
          resolved = function(match, validate, call, param) {
            return resolve_references(ref.schema.compile(), param)
          }
        } else {
          // ref is an object, or a not compilable schema
          resolved = 'r' + (references.push(ref) - 1) + '$1'
        }
      } else {
        // ref is a primitive value
        resolved =  ref + '$1'
      }
      
      // replace strings similar to "{1}.validate(parameter)", where the validate call is optional
      code = code.replace(RegExp('\\{' + i + '\\}((\\.validate)?\\(([^)]*)\\))?', 'g'), resolved)
    })
    
    return '(' + code + ')'
  }
  
  var implementation = resolve_references(assembly)
  
  var closure_arguments_names = references.map(function(ref, i) { return 'r' + i })
  var closure_body = 'return function(instance){ return ' + implementation + ' }'
  var closure = Function.apply(global, closure_arguments_names.concat(closure_body))
  var validate = closure.apply(global, references)
  
  return validate
}

module.exports = link
