var schema = require('../schema')
  , EqualitySchema = require('../patterns/equality')
  , _ = require('underscore')
  , RandExp = require('randexp')

var OrSchema = module.exports = function(schemas) {
  this.schemas = schemas
  
  return this.schema()
}

OrSchema.prototype = _.extend({}, schema.prototype, {
  compile : function() {
    var compiled = { references : this.schemas.slice() }
    
    var checks = this.schemas.map(function(sch, i) { return '{' + i + '}(instance)' })
    compiled.expression = checks.join(' || ')
    
    return compiled
  },
  
  generate : function() {
    return this.schemas[Math.floor(Math.random()*this.schemas.length)].generate()
  },
  
  leafs : function() {
    // Certain and uncertain leafs of subschemas
    var subschema_leafs = this.schemas.map(function(sub) {
      return sub.leafs ? sub.leafs() 
                       : { certain : [ sub ], uncertain : [] }
    })
    subschema_leafs.certain   = subschema_leafs.map(function(leafs){ return leafs.certain })
    subschema_leafs.uncertain = subschema_leafs.map(function(leafs){ return leafs.uncertain })

    // If some leaf appears in all subschemas as certain then it is certain. Otherwise uncertain.
    var all = _.union.apply(null, subschema_leafs.certain.concat(subschema_leafs.uncertain))
    var certain = _.intersection.apply(null, subschema_leafs.certain)
    var uncertain = _.difference(all, certain)
    
    return { certain : certain, uncertain : uncertain }
  },
  
  toJSON : function() {
    var jsons = this.schemas.map(schema.toJSON)
    
    var onlyEquality = true
    for (var i = 0; i < jsons.length; i++) {
      if (!(jsons[i]['enum'] instanceof Array && jsons[i]['enum'].length === 1)) {
        onlyEquality = false
        break
      }
    }
    if (onlyEquality) return { 'enum' : jsons.map(function(json) { return json['enum'][0] }) }
    
    var json = { 'type' : jsons.map(function(json) {
      var simpleType = typeof json.type === 'string' && Object.keys(json).length === 1
      return simpleType ? json.type : json
    })}
    
    if (this.id) schema.id = this.id
    
    return json
  }
})


schema.fromJS.def(function(schemas) {
  if (schemas instanceof Array) return new OrSchema(schemas.map(function(sch) {
    return sch === undefined ? schema.self : schema.fromJS(sch)
  }))
})

schema.fromJSON.def(function(sch) {
  if (!sch) return
  
  if (sch['enum'] instanceof Array) {
    return new OrSchema(sch['enum'].map(function(object) {
      return new EqualitySchema(object)
    }))
  }
  
  if (sch['type'] instanceof Array) {
    return new OrSchema(sch['type'].map(function(type) {
      return schema.fromJSON(typeof type === 'string' ? { type : type } : type)
    }))
  }
})
