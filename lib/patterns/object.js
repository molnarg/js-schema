var schema = require('../schema')
  , RandExp = require('randexp')
  , utils = require('../utils')
  , anything = require('./anything')
  , nothing = require('./nothing')
  , _ = require('underscore')

var ObjectSchema = module.exports = function(properties, other) {
  var self = this
  
  this.other = other || anything
  this.properties = properties || []
  
  // Sorting properties into two groups
  this.stringProps = {}, this.regexpProps = []
  this.properties.forEach(function(property) {
    if (typeof property.key === 'string') {
      self.stringProps[property.key] = property
    } else {
      self.regexpProps.push(property)
    }
  })
  
  
  return new schema(this)
}

ObjectSchema.prototype = {
  compile : function() {
    var checks = ['instance != null']
      , references = []
      , ref = utils.referenceHandler(references)
    
    // Simple string properties
    var check
    for (var key in this.stringProps) {
      check = '{schema}(instance[{key}])'.replace('{schema}', ref(this.stringProps[key].value))
                                         .replace('{key}', ref(key))
      if (this.stringProps[key].min === 0) {
        check = '(instance[{key}] === undefined || {check})'.replace('{key}', ref(key))
                                                            .replace('{check}', check)
      }
      checks.push(check)
    }
    
    if (!this.regexpProps.length && this.other === anything) {
      return { references : references, expression : checks.join(' && ') }
    }
    
    // Regexp and other properties
    var stringPropNames = Object.keys(this.stringProps)
    
    var fn = 'if (!( {checks} )) return false;'.replace('{checks}', checks.join(' && '))
    
    if (this.other !== anything) fn += 'var checked;'
    
    // Iterating over the keys in the instance
    fn += 'for (var key in instance) {'

      // Checking the key against every key regexps
      if (this.other !== anything) fn += 'checked = false;'
      for (var i = 0; i < this.regexpProps.length; i++) {
        if (this.other !== anything) {
          check = 'if (({regexp}.test(key) && (checked = true)) && !{schema}(instance[key])) return false;'
        } else {
          check = 'if ({regexp}.test(key) && !{schema}(instance[key])) return false;'
        }
        fn += check.replace('{regexp}', ref(this.regexpProps[i].key))
                   .replace('{schema}', ref(this.regexpProps[i].value))
      }
      
      // If the key is not matched by regexps and by simple string checks, check it against this.other
      if (this.other !== anything) {
        check = 'if (!checked && {stringProps}.indexOf(key) === -1 && !{other}(instance[key])) return false;'
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
    var object = {}
    
    for (var key in this.stringProps) {
      if (this.stringProps[key].min === 1 || Math.random() < 0.5) {
        object[key] = this.stringProps[key].value.generate()
      }
    }

    var n, property, randexp
    for (var i = 0; i < this.regexpProps.length; i++) {
      property = this.regexpProps[i]
      n = Object.keys(object).filter(function(ikey){ return property.key.test(ikey) }).length
      
      randexp = new RandExp(property.key)
      while (n < property.min || (n < property.max && Math.random() < 0.5)) {
        key = randexp.gen()
        if (key in object) continue
        
        object[key] = property.value.generate()
        n += 1
      }
    }

    if (this.other !== nothing) {
      while (Math.random() < 0.5) {
        key = String.schema.generate()
        if (!(key in object)) object[key] = this.other.generate()
      }
    }

    return object
  },
  
  leafs : function() {
    var certain = [], uncertain = []
    
    this.properties.forEach(function(property) {
      var property_leafs = property.value.leafs ? property.value.leafs()
                                                : { certain : [ property.value ], uncertain : [] }
                                                 
      if (property.min > 0) {
        certain.push(property_leafs.certain)
        uncertain.push(property_leafs.uncertain)
      } else {
        uncertain.push(property_leafs.uncertain)
        uncertain.push(property_leafs.certain)
      }
    })
    
    return { certain : _.union.apply(null, certain)
           , uncertain : _.union.apply(null, uncertain.concat([this.other]))
           }
  },
  
  toJSON : function() {
    var i, property, regexp, json = { type : 'object' }
    
    for (i in this.stringProps) {
      property = this.stringProps[i]
      json.properties = json.properties || {}
      json.properties[property.key] = property.value.toJSON()
      if (property.min === 1) json.properties[property.key].required = true
    }
    
    for (i = 0; i < this.regexpProps.length; i++) {
      property = this.regexpProps[i]
      json.patternProperties = json.patternProperties || {}
      regexp = property.key.toString()
      regexp = regexp.substr(2, regexp.length - 4)
      json.patternProperties[regexp] = property.value.toJSON()
    }
    
    if (this.other !== anything) {
      json.additionalProperties = (this.other === nothing) ? false : this.other.toJSON()
    }
    
    return json
  }
}

// Testing if a given string is a real regexp or just a single string escaped
// If it is just a string escaped, return the string. Otherwise return the regexp
var regexpString = (function() {
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
    
    for (i = 0; i < shouldBeEscaped.length; i++) {
      match = string.match(shouldBeEscaped[i])
      if (!match) continue
      for (j = 0; j < match.length; j++) {
        // If it is not escaped, it must be a regexp (e.g. [, \\[, \\\\[, etc.)
        if (match[j].length % 2 === 1) return RegExp('^' + string + '$')
      }
    }
    for (i = 0; i < shouldntBeEscaped.length; i++) {
      match = string.match(shouldntBeEscaped[i])
      if (!match) continue
      for (j = 0; j < match.length; j++) {
        // If it is escaped, it must be a regexp (e.g. \b, \\\b, \\\\\b, etc.)
        if (match[j].length % 2 === 0) return RegExp('^' + string + '$')
      }
    }
    
    // It is not a real regexp. Removing the escaping.
    for (i = 0; i < shouldBeEscaped.length; i++) {
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
    value = schema.fromJS(object[key])
    
    if (key === '*') {
      other = value
      continue
    }
    
    first = key[0]
    min = (first === '*' || first === '?') ? 0 : 1
    max = (first === '*' || first === '+') ? Infinity : 1
    if (first === '*' || first === '?' || first === '+') key = key.substr(1)
    
    key = regexpString(key)
    
    // {a : undefined} is the same as {} so it does not make sense to specify undefined
    // for a mandatory string parameter so we consider it as recursion, like in this case:
    // Tree = schema([ Number, { left : Tree, right : Tree } ])
    if (typeof key === 'string' && value === anything) value = schema.self
    
    properties.push({ min : min, max : max, key : key, value : value })
  }
  
  return new ObjectSchema(properties, other)
})

schema.fromJSON.def(function(sch) {
  if (!sch || sch.type !== 'object') return
  
  var key, properties = []
  for (key in sch.properties) {
    properties.push({ min : sch.properties[key].required ? 1 : 0
                    , max : 1
                    , key : key
                    , value : schema.fromJSON(sch.properties[key])
                    })
  }
  for (key in sch.patternProperties) {
    properties.push({ min : 0
                    , max : Infinity
                    , key : RegExp('^' + key + '$')
                    , value : schema.fromJSON(sch.properties[key])
                    })
  }
  
  var other
  if (sch.additionalProperties !== undefined) {
    other = sch.additionalProperties === false ? nothing : schema.fromJSON(sch.additionalProperties)
  }
  
  return new ObjectSchema(properties, other)
})
