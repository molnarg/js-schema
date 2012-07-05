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
  
  
  return this.schema()
}

ObjectSchema.prototype = _.extend(Object.create(schema.prototype), {
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
          check = '({regexp}.test(key) && (checked = true)) && !{schema}(instance[key])'
        } else {
          check = '{regexp}.test(key) && !{schema}(instance[key])'
        }
        check = 'if (' + check + ') return false;'
        fn += check.replace('{regexp}', ref(this.regexpProps[i].key))
                   .replace('{schema}', ref(this.regexpProps[i].value))
      }
      
      // If the key is not matched by regexps and by simple string checks
      // then check it against this.other
      if (this.other !== anything) {
        check = '!checked && {stringProps}.indexOf(key) === -1 && !{other}(instance[key])'
        check = 'if (' + check + ') return false;'
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
      if (property.title) json.properties[property.key].title = property.title
    }
    
    for (i = 0; i < this.regexpProps.length; i++) {
      property = this.regexpProps[i]
      json.patternProperties = json.patternProperties || {}
      regexp = property.key.toString()
      regexp = regexp.substr(2, regexp.length - 4)
      json.patternProperties[regexp] = property.value.toJSON()
      if (property.title) json.patternProperties[regexp].title = property.title
    }
    
    if (this.other !== anything) {
      json.additionalProperties = (this.other === nothing) ? false : this.other.toJSON()
    }
    
    if (this.id) json.id = this.id
    
    return json
  }
})

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
      
  var other, property, properties = []
  for (var key in object) {
    property = { value : schema.fromJS(object[key]) }
    
    // '*' as property name means 'every other property should match this schema'
    if (key === '*') {
      other = property.value
      continue
    }
    
    // Handling special chars at the beginning of the property name
    property.min = (key[0] === '*' || key[0] === '?') ? 0 : 1
    property.max = (key[0] === '*' || key[0] === '+') ? Infinity : 1
    key = key.replace(/^[*?+]/, '')
    
    // Handling property title that looks like: { 'a : an important property' : Number }
    key = key.replace(/\s*:[^:]+$/, function(match) {
      property.title = match.replace(/^\s*:\s*/, '')
      return ''
    })
    
    // Testing if it is regexp-like or not. If it is, then converting to a regexp object
    property.key = regexpString(key)
    
    properties.push(property)
  }
  
  return new ObjectSchema(properties, other)
})

schema.fromJSON.def(function(json) {
  if (!json || json.type !== 'object') return
  
  var key, properties = []
  for (key in json.properties) {
    properties.push({ min : json.properties[key].required ? 1 : 0
                    , max : 1
                    , key : key
                    , value : schema.fromJSON(json.properties[key])
                    , title : json.properties[key].title
                    })
  }
  for (key in json.patternProperties) {
    properties.push({ min : 0
                    , max : Infinity
                    , key : RegExp('^' + key + '$')
                    , value : schema.fromJSON(json.patternProperties[key])
                    , title : json.patternProperties[key].title
                    })
  }
  
  var other
  if (json.additionalProperties !== undefined) {
    other = json.additionalProperties === false ? nothing : schema.fromJSON(json.additionalProperties)
  }
  
  return new ObjectSchema(properties, other)
})
