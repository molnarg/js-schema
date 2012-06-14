var schema = require('../schema')

var ArraySchema = module.exports = function(itemSchema, max, min) {
  this.itemSchema = itemSchema
  this.min = min
  this.max = max
  
  return new schema(this)
}

ArraySchema.prototype = {
  compile : function() {
    var compiled = { }
        
    // Instance must be an instance of Array
    compiled.fn = 'if (!(instance instanceof Array)) return false;'
    
    // Checking length
    if (this.min !== undefined || this.max !== undefined) {
      var checks = []
      if (this.min === this.max) {
        checks.push('instance.length !== ' + this.min)
      } else {
        if (this.min !== undefined) checks.push('instance.length < ' + this.min)
        if (this.max !== undefined) checks.push('instance.length > ' + this.max)
      }
      compiled.fn += 'if (' + checks.join(' || ') + ') return false;'
    }
    
    // Checking conformance to the given item schema
    if (this.itemSchema !== undefined) {
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
    var min = this.min === undefined ? 0  : this.min
      , max = this.max === undefined ? 10 : this.max
      , length = min + Math.floor(Math.random()*(max - min + 1))
      , array = []
    
    for (var i = 0; i < length; i++) array.push(this.itemSchema.generate())
    
    return array
  },
  
  toJSON : function() {
    var schema = { type : 'array' }
    
    if (this.min !== undefined) schema.minItems = this.min
    if (this.max !== undefined) schema.maxItems = this.max
    if (this.itemSchema) schema.items = this.itemSchema.toJSON()
    
    return schema
  }
}

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
  return new ArraySchema(schema(args[0]), args[1], args[2])
}
