var native_functions = [Boolean, Number, String, Object, Array, Function, Date]

var linker = {
  reference_counter : 0,
  
  local_counter : 0,
  
  assemble : function(assembly, instance_variable) {
    if (instance_variable === 'instance') return assembly.result
    
    var code = assembly.result.replace(/(\W|^)instance(\W|$)/g, '$1' + instance_variable + '$2')
    
    return code
  },
  
  resolve_references : function(assembly) {
    var self = this, code = assembly.result
        
    var id, reference, variable, referenced_assembly, resolved
    while (assembly.references.length > 0) {
      reference = assembly.references.pop()
      id = assembly.references.length
      
      if (Object(reference) === reference) {
        if (reference.schema && reference.schema.assembly) {
          // reference is a compiled schema
          referenced_assembly = reference.schema.assembly
          
          for (var name in referenced_assembly.references) {
            assembly.references[name] = referenced_assembly.references[name]
          }
          
          resolved = function(match, validate, call, param) {
            return self.assemble(referenced_assembly, param)
          }
        
        } else if (native_functions.indexOf(reference) != -1) {
          // native functions can be referenced by name
          resolved = reference.name + '$1'
          
        } else {
          // reference is an object, or a not compilable schema
          variable = 'r' + this.reference_counter
          this.reference_counter += 1
          
          assembly.references[variable] = reference
          
          resolved = variable + '$1'
        }
        
      } else {
        // reference is a primitive value
        resolved =  reference + '$1'
      }
      
      // replace strings similar to "{1}.validate(parameter)", where the validate call is optional
      code = code.replace(RegExp('\\{' + id + '\\}((\\.validate)?\\(([^)]*)\\))?', 'g'), resolved)
    }
    
    assembly.result = '(' + code + ')'
  },

  // The linker resolves dependencies in an assembly, and returns a callable function
  link : function(assembly) {
    this.resolve_references(assembly)
    var implementation = this.assemble(assembly, 'instance')
    
    var closure_arg_names = Object.keys(assembly.references)
    var closure_args = closure_arg_names.map(function(key){ return assembly.references[key] })
    var closure_body = 'return function(instance){ return ' + implementation + ' }'
    var closure = Function.apply(global, closure_arg_names.concat(closure_body))
    var validate = closure.apply(global, closure_args)
    
    validate.assembly = assembly
    
    return validate
  }
}

module.exports = linker
