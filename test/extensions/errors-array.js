var vows = require('vows'),
    assert = require('assert'),
    schema = require('../../index.js');

// Create a Test Suite
vows.describe('Validation Array with errors').addBatch({
    'Array.of': {
        topic: function () { return [9,0,1,2,3,4,5,6]},
        'Number.min(x}.max(y)':{
            'One number is too big': function (topic) {
                var aSchema = schema(Array.of(Number.min(0).max(5)));
                var result = aSchema.errors(topic);

                console.log(JSON.stringify(result, null,2));
                assert
            }
        }

    },
    'Array.of(length, pattern)': {},
    'Array.of(minLength, maxLength, pattern)': {},
    'Array.like(array)': {}
}).export(module)