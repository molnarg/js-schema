var schema = require('../schema')
  , RandExp = require('randexp')
  , utils = require('../utils')

var ObjectSchema = module.exports = function(properties, other) {
  this.other = other
  this.properties = properties || []
  
  return new schema(this)
}

ObjectSchema.prototype = {
  compile : function() {
    var checks = ['instance != null']
      , references = []
      , ref = utils.referenceHandler(references)
      , propertyName = function(property) { return '"' + property.replace(/"/g,'\\"') + '"' }
    
    // Sorting properties into two groups
    var stringProps = {}, regexpProps = []
    this.properties.forEach(function(property) {
      if (typeof property.key === 'string') {
        stringProps[property.key] = property
      } else {
        regexpProps.push(property)
      }
    })
    
    // Simple string properties
    var check
    for (var key in stringProps) {
      check = '{schema}(instance[{key}])'.replace('{schema}', ref(stringProps[key].value))
                                         .replace('{key}', propertyName(key))
      if (stringProps[key].min === 0) {
        check = '(instance[{key}] === undefined || {check})'.replace('{key}', propertyName(key))
                                                            .replace('{check}', check)
      }
      checks.push(check)
    }
    
    if (!regexpProps.length && !this.other) {
      return { references : references, expression : checks.join(' && ') }
    }
    
    // Regexp and other properties
    var stringPropNames = Object.keys(stringProps)
    
    var fn = 'if (!( {checks} )) return false;'.replace('{checks}', checks.join(' && '))
    
    if (this.other) fn += 'var checked;'
    
    // Iterating over the keys in the instance
    fn += 'for (var i in instance) {'

      // Checking the key against every key regexps
      if (this.other) fn += 'checked = false;'
      for (var i in regexpProps) {
        if (this.other) {
          check = 'if (({regexp}.test(i) && (checked = true)) && !{schema}(instance[i])) return false;'
        } else {
          check = 'if ({regexp}.test(i) && !{schema}(instance[i])) return false;'
        }
        fn += check.replace('{regexp}', ref(regexpProps[i].key))
                   .replace('{schema}', ref(regexpProps[i].value))
      }
      
      // If the key is not matched by regexps and by simple string checks, check it against this.other
      if (this.other) {
        check = 'if (!checked && {stringProps}.indexOf(i) === -1 && !{other}(instance[i])) return false;'
        fn += check.replace('{stringProps}', ref(stringPropNames))
                   .replace('{other}', ref(this.other))
      }
    
    fn += '}'
    // Iteration ends
    
    // If all checks passed, the instance conforms to the schema
    fn += 'return true;'
    
    return { references : references, fn : fn }
  },
  
  generate : function() {
    var i, ikey, key, object = {}
    
    for (i in this.properties) {
      var n = 0
      for (ikey in object) {
        key = this.properties[i].key
        if (typeof key === 'string' ? key === ikey : key.test(ikey)) n += 1
      }
      
      while (n < this.properties[i].min) {
        key = this.properties[i].key
        if (key instanceof RegExp) key = new RandExp(key).gen()
        
        if (!(key in object)) {
          object[key] = this.properties[i].value.generate()
          n += 1
        }
      }
      
      while (n < this.properties[i].max && Math.random() < 0.5) {
        key = this.properties[i].key
        if (key instanceof RegExp) key = new RandExp(key).gen()
        
        if (!(key in object)) {
          object[key] = this.properties[i].value.generate()
          n += 1
        }
      }
    }

    if (this.other) {
      while (Math.random() < 0.5) {
        key = String.generate()
        if (!(key in object)) object[key] = this.other.generate()
      }
    }

    return object
  },
  
  toJSON : function() {
    var json = { type : 'object' }
    
    var property, regexp
    for (var i in this.properties) {
      property = this.properties[i]
      
      if (typeof property.key === 'string') {
        // Simple property
        json.properties = json.properties || {}
        json.properties[property.key] = property.value.toJSON()
        if (property.min === 1) json.properties[property.key].required = true
        
      } else {
        // Regexp property
        json.patternProperties = json.patternProperties || {}
        regexp = property.key.toString()
        regexp = regexp.substr(2, regexp.length - 4)
        json.patternProperties[regexp] = property.value.toJSON()
      }
    }
    
    if (this.other && this.other !== schema(undefined)) {
      json.additionalProperties = (this.other === schema(null)) ? false : this.other.toJSON()
    }
    
    return json
  }
}

// Testing if a given string is a real regexp or just a single string escaped
// If it is just a string escaped, return the string. Otherwise return the regexp
var regexpString = global.regexpString = (function() {
  // Special characters that should be escaped when describing a regular string in regexp
  var shouldBeEscaped = '[](){}^$?*+.'.split('').map(function(element) {
        return RegExp('(\\\\)*\\' + element, 'g')
      })
  // Special characters that shouldn't be escaped when describing a regular string in regexp
  var shouldntBeEscaped = 'bBwWdDsS'.split('').map(function(element) {
        return RegExp('(\\\\)*' + element, 'g')
      })
      
  return function(string) {
    var i, j, match
    
    for (i in shouldBeEscaped) {
      match = string.match(shouldBeEscaped[i])
      for (j in match) {
        // If it is not escaped, it must be a regexp (e.g. [, \\[, \\\\[, etc.)
        if (match[j].length % 2 === 1) return RegExp('^' + string + '$')
      }
    }
    for (i in shouldntBeEscaped) {
      match = string.match(shouldntBeEscaped[i])
      for (j in match) {
        // If it is escaped, it must be a regexp (e.g. \b, \\\b, \\\\\b, etc.)
        if (match[j].length % 2 === 0) return RegExp('^' + string + '$')
      }
    }
    
    // It is not a real regexp. Removing the escaping.
    for (i in shouldBeEscaped) {
      string = string.replace(shouldBeEscaped[i], function(match) {
        return match.substr(1)
      })
    }
    
    return string
  }
})()

schema.fromJS.def(function(object) {
  if (!(object instanceof Object)) return
      
  var first, min, max, value, properties = [], other
  for (var key in object) {
    value = schema(object[key])
    
    if (key === '*') {
      other = value
      continue
    }
    
    first = key[0]
    min = (first === '*' || first === '?') ? 0 : 1
    max = (first === '*' || first === '+') ? Infinity : 1
    if (first === '*' || first === '?' || first === '+') key = key.substr(1)
    
    key = regexpString(key)
    
    properties.push({ min : min, max : max, key : key, value : value })
  }
  
  return new ObjectSchema(properties, other)
})

schema.fromJSON.def(function(sch) {
  if (!sch || sch.type !== 'object') return
  
  var properties = []
  for (var key in sch.properties) {
    properties.push({ min : sch.properties[key].required ? 1 : 0
                    , max : 1
                    , key : key
                    , value : schema.fromJSON(sch.properties[key])
                    })
  }
  for (var key in sch.patternProperties) {
    properties.push({ min : 0
                    , max : Infinity
                    , key : RegExp('^' + key + '$')
                    , value : schema.fromJSON(sch.properties[key])
                    })
  }
  
  var other
  if (sch.additionalProperties !== undefined) {
    other = sch.additionalProperties === false ? schema(null) : schema.fromJSON(sch.additionalProperties)
  }
  
  return new ObjectSchema(properties, other)
})
