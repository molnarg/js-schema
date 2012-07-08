var schema = require('../schema')
  , EqualitySchema = require('../patterns/equality')
  , _ = require('underscore')

var OrSchema = module.exports = schema.schema.extend({
  initialize : function(schemas) {
    this.schemas = schemas
  },
  
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
    var subschema_certain = this.schemas.map(function(sub) { return sub.leafs().certain })
      , subschema_uncertain = this.schemas.map(function(sub) { return sub.leafs().uncertain })
      , subschema_all = _.union.apply(null, subschema_certain.concat(subschema_uncertain))

    // If some leaf appears in all subschemas as certain then it is certain. Otherwise uncertain.
    var certain = _.intersection.apply(null, subschema_certain)
      , uncertain = _.difference(subschema_all, certain)
    
    return { certain : certain, uncertain : uncertain }
  },
  
  toJSON : function() {
    var json = schema.schema.prototype.toJSON.call(this)
      , subjsons = this.schemas.map(schema.toJSON)
      , onlyEquality = subjsons.every(function(json) {
          return json['enum'] instanceof Array && json['enum'].length === 1
        })
    
    if (onlyEquality) {
      json['enum'] = subjsons.map(function(json) {
        return json['enum'][0] 
      })
    
    } else {
      json['type'] = subjsons.map(function(json) {
        var simpleType = typeof json.type === 'string' && Object.keys(json).length === 1
        return simpleType ? json.type : json
      })
    }
    
    return json
  }
})


schema.fromJS.def(function(schemas) {
  if (schemas instanceof Array) return new OrSchema(schemas.map(function(sch) {
    return sch === undefined ? schema.schema.self : schema.fromJS(sch)
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
