var schema = require('../schema')
  , RandExp = require('randexp')

var ObjectSchema = module.exports = function(regexp, other) {
  this.other = other
  this.regexp = regexp || []
  for (var i in this.regexp) this.regexp[i].key = RegExp('^' + this.regexp[i].key + '$')
  
  return new schema(this)
}

ObjectSchema.prototype = {
  validate : function(instance) {
    // TODO: treat non-regexps differently
    // regexpElementTests = '[](){}^$?*+'.split('').map(function(element) {
    //   return RegExp('(^|[^\\\\])\\' + element)
    // })
    var i, matches = this.regexp.map(function(){ return 0 }), match = false
    for (var property in instance) {
      match = false
      
      for (i in this.regexp) {
        if (this.regexp[i].key.test(property)) {
          if (!this.regexp[i].value(instance[property])) return false
          matches[i] +=  1
          match = true
        }
      }
      
      if (!match && this.other && !this.other(instance[property])) return false
    }

    for (i in this.regexp) {
      if (!(this.regexp[i].min <= matches[i] && matches[i] <= this.regexp[i].max)) return false
    }

    return true
  },
  
  generate : function() {
    var i, key, object = {}
    
    for (i in this.regexp) {
      var n = 0
      for (key in object) {
        if (this.regexp[i].key.test(key)) n += 1
      }
      
      while (n < this.regexp[i].min) {
        key = new RandExp(this.regexp[i].key).gen()
        if (!(key in object)) {
          object[key] = this.regexp[i].value.generate()
          n += 1
        }
      }
      
      while (n < this.regexp[i].max && Math.random() < 0.5) {
        key = new RandExp(this.regexp[i].key).gen()
        if (!(key in object)) {
          object[key] = this.regexp[i].value.generate()
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


schema.fromJS.def(function(object) {
  if (!(object instanceof Object)) return
  
  var first, min, max, value, properties = [], other
  for (var key in object) {
    value = schema(object[key])
    
    first = key[0]
    min = (first === '*' || first === '?') ? 0 : 1
    max = (first === '*' || first === '+') ? Infinity : 1
    if (first === '*' || first === '?' || first === '+') key = key.substr(1)
    
    if (key === '') {
      other = value
    } else {
      properties.push({ min : min, max : max, key : key, value : value })
    }
  }
  
  return new ObjectSchema(properties, other)
})
