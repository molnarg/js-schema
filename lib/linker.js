var native_functions = [Boolean, Number, String, Object, Array, Function, Date]

var rename_variable = function(assembly, name, new_name) {
  if (name === new_name) return assembly
  
  var new_assembly = { }
  
  var name_regexp = RegExp('(\\W|^)' + name + '(\\W|$)', 'g')
  var rename = function(s) {
    return typeof s !== 'string' ? s : s.replace(name_regexp, '$1' + new_name + '$2')
  }

  for (var property in assembly) {
    if (assembly[property] instanceof Array) {
      new_assembly[property] = assembly[property].map(rename)
    } else {
      new_assembly[property] = rename(assembly[property])
    }
  }

  return new_assembly
}

var c = 0
var counter = function() { return c++ }

var linker = {
  resolve_references : function(assembly) {
    var id, reference, variable, referenced_assembly, resolved
    
    while (assembly.references.length > 0) {
      reference = assembly.references.pop()
      id = assembly.references.length
      
      if (Object(reference) === reference) {
        if (reference.schema && reference.schema.assembly) {
          // reference is a compiled schema, merging it
          referenced_assembly = reference.schema.assembly
          
          for (var name in referenced_assembly.references) {
            assembly.references[name] = referenced_assembly.references[name]
          }
          
          resolved = function(match, validate, call, param) {
            var own = rename_variable(referenced_assembly, 'instance', param)
            assembly.variables = assembly.variables.concat(own.variables)
            assembly.code += own.code || ''
            return '(' + own.result + ')'
          }
        
        } else if (native_functions.indexOf(reference) != -1) {
          // native functions can be referenced by name
          resolved = reference.name + '$1'
          
        } else {
          // reference is an object, or a not compiled schema, it remains reference
          variable = 'r' + counter()
          
          assembly.references[variable] = reference
          
          resolved = variable + '$1'
        }
        
      } else {
        // reference is a primitive value
        resolved =  reference + '$1'
      }
      
      // replace strings similar to "{1}.validate(parameter)", where the validate call is optional
      for (var property in assembly) {
        if (typeof assembly[property] !== 'string') continue
        assembly[property] = assembly[property].replace(RegExp('\\{' + id + '\\}((\\.validate)?\\(([^)]*)\\))?', 'g'), resolved)
      }
    }
  },

  link : function(assembly) {
    assembly.variables = assembly.variables || []
    assembly.code = assembly.code || ''
    
    for (var i in assembly.variables) {
      assembly = rename_variable(assembly, assembly.variables[i], 'l' + counter())
    }
    
    this.resolve_references(assembly)
    
    var closure_arg_names = Object.keys(assembly.references)
    var closure_args = closure_arg_names.map(function(key){ return assembly.references[key] })
    var closure_body = 'return function(instance){'
                     + (assembly.variables.length ? ('var ' + assembly.variables.join(',') + ';') : '')
                     + (assembly.code ? assembly.code : '')
                     + 'return ' + assembly.result + ';'
                     + '}'
    var closure = Function.apply(global, closure_arg_names.concat(closure_body))
    var validate = closure.apply(global, closure_args)
    
    validate.assembly = assembly
    
    return validate
  }
}

module.exports = linker
