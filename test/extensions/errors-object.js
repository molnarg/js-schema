var vows = require('vows'),
    assert = require('assert'),
    schema = require('../../index.js');

function showErrors(input, errors){
    input = input || {};
    return [
        "","Input:",JSON.stringify(input, null, 2),
        "","Errors:",JSON.stringify(errors, null,2)
    ].join("\n")
}
// Create a Test Suite
vows.describe('Validation Object with errors').addBatch({
    'Object': {
        'Invalid input : empty object':function(){
            var instance = schema({
                func: Function,
                number : Number.min(6).max(9),
                boolean : Boolean,
                string : String
            });
            var result = instance.errors({});
            assert(!result,showErrors({}, result) )

        },
        'Invalid nested input':function(){
            var input = {
                a : {
                    aa:false
                },
                d:true
            };

            var aSchema = schema({
                aa:Number,
                bb:Boolean,
                cc:Function
            })
            var instance = schema({
                a : aSchema,
                b : Number,
                c : Boolean,
                d : Number
            });
            var result = instance.errors(input);
            assert(!result,showErrors(input, result))
        }
    }
}).export(module)