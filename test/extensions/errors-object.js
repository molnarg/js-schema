var vows = require('vows')
    , _ = require('underscore')
    , assert = require('assert')
    , schema = require('../../index.js')


// Create a Test Suite
vows.describe('Testing if errors() precisely informs about the cause').addBatch({
    'Object': {
        topic:function(){
            return {
                input_invalid_boolean: {test: false},
                input_invalid_function: {test: function () {}},
                input_invalid_object: {test: {}},
                input_invalid_number: {test: 190},
                input_invalid_string: {test: "hello world"}
            }
        },
        'Number': {
            topic:function(common){
                return _.defaults({
                    schema: schema({test: Number.min(0).max(10)}),
                    input_invalid_string: {test: "hello world"},
                    input_invalid_number: {test: 190},
                    input_valid: {test: 5}
                }, common);
            },

            'Object { test : Number }  : String was passed instead Number': function (t) {
                var validation = false === t.schema(t.input_invalid_string);
                assert(validation, 'Validation is broken. Incorrect object '+vows.inspect(t.input_invalid_string)+' should NOT be validated.');

                var errors = t.schema.errors(t.input_invalid_string);
                validation = /hello world is not Number/.test(errors.test);

                assert(validation, 'Function schema.errors returns incorrect message : \n \t\t' + vows.inspect(errors));
            },
            'Object { test : Number }  : Too big Number was passed ': function (t) {
                var validation = false === t.schema(t.input_invalid_number);
                assert(validation, 'Validation is broken. Incorrect object should NOT be validated.');

                var errors = t.schema.errors(t.input_invalid_number);
                validation = /number = 190 is bigger than required maximum = 10/.test(errors.test);

                assert(validation, 'Function schema.errors returns incorrect message : \n \t\t' + vows.inspect(errors));
            }
        },
        'String': {
            topic: function(common){
                return _.defaults({
                    schema: schema({test: String}),
                    input_valid: {test: "some string"}
                }, common);
            },
            'Object { test : String }  : Boolean | Function | Object | Number was passed instead String': function (t) {
                [t.input_invalid_boolean, t.input_invalid_function, t.input_invalid_number, t.input_invalid_object].forEach(function (instance, index, array) {
                    var validation = false === t.schema(instance);
                    assert(!_.isString(instance.test), "Input nr "+index+" is broken ("+vows.inspect(instance)+").  Test assumes that 'instance.test' is not String")
                    assert(validation, 'Validation is broken. Received input '+vows.inspect(t.input_invalid_string)+' should NOT be validated.');

                    var errors = t.schema.errors(instance);
                    validation = /(.*) is not a String/.test(errors.test);

                    assert(validation, 'Function schema.errors returns incorrect message : \n \t\t' + vows.inspect(errors));
                })

            }
        }
    }

}).export(module)
