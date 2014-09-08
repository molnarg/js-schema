var Schema    = require('../BaseSchema')
  , anything  = require('./anything').instance
  , nothing   = require('./nothing').instance

var ObjectSchema = module.exports = Schema.patterns.ObjectSchema = Schema.extend({
  initialize: function(properties, other) {
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
  },

  validatePropsFunction: function (intance, properties, validatedFields, validation) {
    var allErrors = [];
    for (var k in properties) {
      var check = properties[k];
      var numberOfMatches = 0;
      for (var instanceKey in intance) {
        var value = intance[instanceKey];
        if (validation(k, instanceKey, check, value)) {
          numberOfMatches++;
          validatedFields[instanceKey] = true;
        }
      }

      if (numberOfMatches < check.min && !check.value.validate(undefined))
        allErrors.push(intance + " doesn't match " + check + " check");
    }
    return allErrors;
  },
  errors: function(instance) {
    var self = this;

    if (instance == null)
      return ( instance + ' is not Object' );

    var validatedFields = {};
    for (var k in instance) {
      validatedFields[k] = false;
    }

    var regexpErrors =  self.validatePropsFunction(instance, self.regexpProps, validatedFields, function (checkKey, instanceKey, check, value) {
      return check.key.test(instanceKey) && check.value.validate(value);
    });

    var stringErrors = self.validatePropsFunction(instance, self.stringProps, validatedFields, function (checkKey, instanceKey, check, value) {
      return checkKey === instanceKey && check.value.validate(value);
    });

    var missedPropsErrors = {};
    for (var k in validatedFields) {
      var result = validatedFields[k];
      if (!result && !self.other.validate(instance[k])) {
        missedPropsErrors[k] = "Property " + k + " doesn't match any of checks";
      }
    }
    var allErrors = {};
    for (var k in regexpErrors) {
      if (regexpErrors.hasOwnProperty(k))
        allErrors[k] = regexpErrors[k];
    }
    for (var k in stringErrors) {
      if (stringErrors.hasOwnProperty(k))
        allErrors[k] = stringErrors[k];
    }
    for (var k in missedPropsErrors) {
      if (missedPropsErrors.hasOwnProperty([k]))
        allErrors[k] = missedPropsErrors[k];
    }

    return Object.keys(allErrors).length == 0 ? false : allErrors;
  },
  validate: function(instance) {
    var self = this;
    return self.errors(instance) ? false : true;
  },

  toJSON: Schema.session(function() {
    var i, property, regexp, json = Schema.prototype.toJSON.call(this, true)

    if (json['$ref'] != null) return json

    json.type = 'object'

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

    return json
  })
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

Schema.fromJS.def(function(object) {
  if (!(object instanceof Object)) return

  var other, property, properties = []
  for (var key in object) {
    property = {
      value: Schema.fromJS(object[key])
    }

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

Schema.fromJSON.def(function(json) {
  if (!json || json.type !== 'object') return

  var key, properties = []
  for (key in json.properties) {
    properties.push({
      min: json.properties[key].required ? 1 : 0,
      max: 1,
      key: key,
      value: Schema.fromJSON(json.properties[key]),
      title: json.properties[key].title
    })
  }
  for (key in json.patternProperties) {
    properties.push({
      min: 0,
      max: Infinity,
      key: RegExp('^' + key + '$'),
      value: Schema.fromJSON(json.patternProperties[key]),
      title: json.patternProperties[key].title
    })
  }

  var other
  if (json.additionalProperties !== undefined) {
    other = json.additionalProperties === false ? nothing : Schema.fromJSON(json.additionalProperties)
  }

  return new ObjectSchema(properties, other)
})
