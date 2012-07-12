var Schema = require('../Schema')
  , EqualitySchema = require('../patterns/equality')
  , anything = require('../patterns/anything')
  , _ = require('underscore')

var ArraySchema = module.exports = Schema.extend({
  initialize : function(itemSchema, max, min) {
    this.itemSchema = itemSchema || anything
    this.min = min || 0
    this.max = max || Infinity
  },
  
  compile : function() {
    var compiled = { }
        
    // Instance must be an instance of Array
    compiled.fn = 'if (!(instance instanceof Array)) return false;'
    
    // Checking length
    if (this.min > 0 || this.max < Infinity) {
      var checks = []
      if (this.min === this.max) {
        checks.push('instance.length !== ' + this.min)
      } else {
        if (this.min > 0       ) checks.push('instance.length < ' + this.min)
        if (this.max < Infinity) checks.push('instance.length > ' + this.max)
      }
      compiled.fn += 'if (' + checks.join(' || ') + ') return false;'
    }
    
    // Checking conformance to the given item schema
    if (this.itemSchema !== anything) {
      compiled.references = [this.itemSchema.validate]
      compiled.fn += 'for (var i = 0; i < instance.length; i++) {'
                  +  '  if (!{0}(instance[i])) return false;'
                  +  '}'
    }
    
    // If every check passes, return true
    compiled.fn += 'return true;'
    
    return compiled
  },
  
  generate : function() {
    var array = []
    
    while (array.length < this.min || (array.length < this.max && Math.random() < 0.666)) {
        array.push(this.itemSchema.generate())
    }
    
    return array
  },
  
  leafs : function() {
    var item_leafs = this.itemSchema.leafs()
    
    if (this.min > 0) return item_leafs
    
    return { certain : []
           , uncertain : _.union(item_leafs.certain, item_leafs.uncertain)
           }
  },
  
  toJSON : function() {
    var json = Schema.prototype.toJSON.call(this)
    
    json.tpye = 'array'
    
    if (this.min > 0) json.minItems = this.min
    if (this.max < Infinity) json.maxItems = this.max
    if (this.itemSchema !== anything) json.items = this.itemSchema.toJSON()
    
    return json
  }
})

Schema.fromJSON.def(function(sch) {
  if (!sch || sch.type !== 'array') return
  
  // Tuple typing is not yet supported
  if (sch.items instanceof Array) return
  
  return new ArraySchema(Schema.fromJSON(sch.items), sch.maxItems, sch.minItems)
})

Array.of = function() {
  // Possible signatures : (schema)
  //                       (length, schema)
  //                       (minLength, maxLength, schema)
  var args = Array.prototype.reverse.call(arguments)
  if (args.length === 2) args[2] = args[1]
  return new ArraySchema(Schema.fromJS(args[0]), args[1], args[2])
}

Array.like = function(other) {
  return new EqualitySchema(other).wrap()
}

Array.schema = new ArraySchema().wrap()
