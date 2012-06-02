var native_functions = [Boolean, Number, String, Object, Array, Function, Date]

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
          
          assembly.subroutines = assembly.subroutines.concat(referenced_assembly.subroutines)
          
          resolved = function(match, validate, call, param) {
            var instance_regexp = RegExp('(\\W|^)instance(\\W|$)', 'g')
            var expr = referenced_assembly.expression.replace(instance_regexp, '$1' + param + '$2')
            return '(' + expr + ')'
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
      var format = function(str) {
        return str.replace(RegExp('\\{' + id + '\\}((\\.validate)?\\(([^)]*)\\))?', 'g'), resolved)
      }
      assembly.expression = format(assembly.expression)
      assembly.subroutines = assembly.subroutines.map(format)
    }
  },

  link : function(assembly) {
    assembly.subroutines = assembly.subroutines || []
    
    var name
    if (assembly.fn) {
      name = 'f' + counter()
      assembly.subroutines.push('function ' + name + '(instance){' + assembly.fn + '}')
      assembly.expression = name + '(instance)'
    }
    
    this.resolve_references(assembly)
    
    var closure_arg_names = Object.keys(assembly.references)
    var closure_args = closure_arg_names.map(function(key){ return assembly.references[key] })
    var closure_body = assembly.subroutines.join('\n') + '\n'
                     + 'return function(instance){ return ' + assembly.expression + '; }'
    var closure = Function.apply(global, closure_arg_names.concat(closure_body))
    var validate = closure.apply(global, closure_args)
    
    validate.assembly = assembly
    
    return validate
  }
}

module.exports = linker
