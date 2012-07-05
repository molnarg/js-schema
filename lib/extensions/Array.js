var schema = require('../schema')
  , EqualitySchema = require('../patterns/equality')
  , anything = require('../patterns/anything')
  , _ = require('underscore')
  , RandExp = require('randexp')

var ArraySchema = module.exports = function(itemSchema, max, min) {
  this.itemSchema = itemSchema || anything
  this.min = min || 0
  this.max = max || Infinity
  
  return this.schema()
}

ArraySchema.prototype = _.extend(Object.create(schema.prototype), {
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
      compiled.references = [this.itemSchema]
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
    var item_leafs = this.itemSchema.leafs ? this.itemSchema.leafs()
                                           : { certain : [ this.itemSchema ], uncertain : [] }
    
    if (this.min > 0) return item_leafs
    
    return { certain : []
           , uncertain : _.union(item_leafs.certain, item_leafs.uncertain)
           }
  },
  
  toJSON : function() {
    var schema = { type : 'array' }
    
    if (this.min > 0       ) schema.minItems = this.min
    if (this.max < Infinity) schema.maxItems = this.max
    if (this.itemSchema !== anything) schema.items = this.itemSchema.toJSON()
    
    if (this.id) schema.id = this.id
    
    return schema
  }
})

schema.fromJSON.def(function(sch) {
  if (!sch || sch.type !== 'array') return
  
  // Tuple typing is not yet supported
  if (sch.items instanceof Array) return
  
  return new ArraySchema(schema.fromJSON(sch.items), sch.maxItems, sch.minItems)
})

Array.of = function() {
  // Possible signatures : (schema)
  //                       (length, schema)
  //                       (minLength, maxLength, schema)
  var args = Array.prototype.reverse.call(arguments)
  if (args.length === 2) args[2] = args[1]
  return new ArraySchema(schema.fromJS(args[0]), args[1], args[2])
  
}

Array.like = function(other) {
  return new EqualitySchema(other)
}

Array.schema = new ArraySchema()
