var vows            = require('vows')
  , assert          = require('assert')
  , schema          = require('../../index.js')


// Create a Test Suite
vows.describe('Testing if errors() precisely informs about cause').addBatch({

    'Number':{
        topic:{
            schema                  : schema({test:Number.min(0).max(10)}),
            input_invalid_string    : {test: "hello world"},
            input_invalid_number    : {test: 190},
            input_valid             : {test: 5}
        },
        'Object { test : Number }  : String was passed instead Number':function(t){
            var validation = false === t.schema(t.input_invalid_string); 
            assert(validation, 'Validation is broken. Incorrect object should NOT be validated.');

            var errors = t.schema.errors(t.input_invalid_string);
            validation = errors.test == 'dwadawd';
            
            assert(validation, 'Function schema.errors returns incorrect message : \n \t\t'+ vows.inspect(errors));
        },
        'Object { test : Number }  : Too big Number was passed ':function(t){
            var validation = false === t.schema(t.input_invalid_number);
            assert(validation, 'Validation is broken. Incorrect object should NOT be validated.');

            var errors = t.schema.errors(t.input_invalid_number);
            validation = errors.test == 'dwadawd';

            assert(validation, 'Function schema.errors returns incorrect message : \n \t\t'+ vows.inspect(errors));
        }
    }

}).export(module)
