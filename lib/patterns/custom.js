var Schema = require('../BaseSchema')

var CustomSchema = module.exports = Schema.patterns.CustomSchema = Schema.extend({
	initialize: function (func) {
		this.func = func
	},
	errors: function (instance) {
		var self = this
		var result = self.func(instance);

		if (!result.valid)
			return result.msg
		return false
	},
	validate: function (instance) {
		return this.func(instance).valid
	},
	toJSON: function () {
		return { type: 'custom' }
	}
})

Schema.fromJS.def(function (func) {
	return new CustomSchema(func)
})
