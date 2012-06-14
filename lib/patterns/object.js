var schema = require('../schema')
  , RandExp = require('randexp')

var ObjectSchema = module.exports = function(properties, other) {
  this.other = other
  this.properties = properties || []
  
  return new schema(this)
}

ObjectSchema.prototype = {
  validate : function(instance) {
    var i, key, matches = this.properties.map(function(){ return 0 }), match
    for (var ikey in instance) {
      match = false
      
      for (i in this.properties) {
        key = this.properties[i].key
        if (typeof key === 'string' ? key === ikey : key.test(ikey)) {
          if (!this.properties[i].value(instance[ikey])) return false
          matches[i] +=  1
          match = true
        }
      }
      
      if (!match && this.other && !this.other(instance[ikey])) return false
    }

    for (i in this.properties) {
      if (!(this.properties[i].min <= matches[i] && matches[i] <= this.properties[i].max)) return false
    }

    return true
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
  
  console.log(properties, other)
  
  return new ObjectSchema(properties, other)
})
