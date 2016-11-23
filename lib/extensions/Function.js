var ReferenceSchema = require('../patterns/reference')
var CustomSchema = require('../patterns/custom')

Function.reference = function (f) {
	return new ReferenceSchema(f).wrap()
}

Function.custom = function (f) {
	return new CustomSchema(f).wrap()
}
