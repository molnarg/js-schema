var def = require('def.js')
  , global = (function(){ return this }())

var schema = module.exports = function(f, options) {
  // If called as simple function, forward everything to fromJS
  if (this === global) return schema.fromJS.apply(this, arguments)
  
  // If called as parent constructor
  if (!this.validate) throw new Error('Schemas must have validate function.')
  
  var validate = schema.compile(this)
  
  for (var property in this) {
    if (this[property] instanceof Function) validate[property] = this[property].bind(this)
  }
  
  validate.schema = validate
  
  return validate
}

schema.compile = function(sch) {
  if (!sch.compile) return sch.validate.bind(sch)
  
  var references = []
  
  var resolve_references = function(compiled, instance_variable_name) {
    var code = compiled.code.replace(/instance/g, instance_variable_name || 'instance')
    //console.log('resolve_call', instance_variable_name, code)
    
    compiled.references.forEach(function(ref, i) {
      var resolved
      
      if (Object(ref) === ref) {
        if (ref.schema && ref.schema.compile) {
          // ref is a compilable schema
          resolved = function(match, call, param) {
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
      
      // replace strings similar to "{1}(parameter)", where the function call is optional
      code = code.replace(RegExp('\\{' + i + '\\}(\\(([^)]*)\\))?', 'g'), resolved)
    })
    
    return '(' + code + ')'
  }
  
  var implementation = resolve_references(sch.compile())
  
  var closure_arguments_names = references.map(function(ref, i) { return 'r' + i })
  var closure_body = 'return function(instance){ return ' + implementation + ' }'
  var closure = Function.apply(global, closure_arguments_names.concat(closure_body))
  var validate = closure.apply(global, references)
  
  return validate
}

schema.fromJS = def()

schema.fromJSON = def()

schema.toJSON = function(sch) {
  return schema(sch).toJSON()
}

schema.random = function(sch) {
  return schema(sch).random()
}
