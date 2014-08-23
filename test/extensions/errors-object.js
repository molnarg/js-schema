var vows = require('vows'),
    assert = require('assert'),
    schema = require('../../index.js');

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
            console.log(JSON.stringify(result, null,2))

        },
        'Invalid nested input':function(){
            var input = {
                a : {
                    aa:true,
                    bb:1,
                    cc:null
                }
            };

            var aSchema = schema({
                aa:Number,
                bb:Boolean,
                cc:Function
            })
            var instance = schema({              // A duck
                a : aSchema
            });
            var result = instance.errors(input);

            console.log(JSON.stringify(result, null,2));
            assert(result);
        }
    }
}).export(module)