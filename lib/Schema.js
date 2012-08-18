var def = require('def.js')
  , _ = require('underscore')

var Schema =  module.exports = function() {}

Schema.prototype = {
  wrap : function() {
    if (this.wrapped) return this.validate
    this.wrapped = true

    var publicFunctions = [ 'toJSON', 'generate', 'unwrap' ]
    publicFunctions = publicFunctions.concat(this.publicFunctions || [])

    for (var i = 0; i < publicFunctions.length; i++) {
      if (!this[publicFunctions[i]]) continue
      this.validate[publicFunctions[i]] = this[publicFunctions[i]].bind(this)
    }

    return this.validate
  },

  unwrap : function() {
    return this
  },

  toJSON : session(function(makeReference) {
    var json, session = Schema.session

    // Initializing session if it isnt
    if (!session.serialized) session.serialized = { objects: [], jsons: [], ids: [] }

    var index = session.serialized.objects.indexOf(this)
    if (makeReference && index !== -1) {
      // This was already serialized, returning a JSON schema reference ($ref)
      json = session.serialized.jsons[index]

      // If there was no id given, generating one now
      if (json.id == null) {
        do {
          json.id = 'id-' + Math.floor(Math.random()*100000)
        } while (session.serialized.ids.indexOf(json.id) !== -1)
        session.serialized.ids.push(json.id)
      }

      json = { '$ref': json.id }

    } else {
      // This was not serialized yet, serializing now
      json = {}

      if (this.doc != null) json.description = this.doc

      // Registering that this was serialized and storing the json
      session.serialized.objects.push(this)
      session.serialized.jsons.push(json)
    }

    return json
  })
}

var active = false
function session(f) {
  var proxy = function() {
    if (active) {
      // There's an active session, just forwarding to the original function
      return f.apply(this, arguments)

    } else {
      // The initiator is the one who handles the active flag, and clears the session when it's over
      active = true

      var result = f.apply(this, arguments)

      // Cleanup
      for (var i in session) delete session[i]
      active = false

      return result
    }
  }

  for (var i in f) proxy[i] = f[i].bind(f)

  return proxy
}
Schema.session = session

Schema.fromJS = def()

Schema.fromJSON = Schema.session(def())


Schema.extend = function(descriptor) {
  if (!descriptor.validate) {
    throw new Error('Schema objects must have a validate function.')
  }

  var constructor = function() {
    if (this.initialize) this.initialize.apply(this, arguments)

    this.validate = this.validate.bind(this)

    this.validate.schema = this.validate
  }

  constructor.prototype = _.extend(Object.create(Schema.prototype), descriptor)

  return constructor
}
