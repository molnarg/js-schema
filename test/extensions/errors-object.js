var vows = require('vows'),
    assert = require('assert'),
    printTestResult = require('../printTestResult.js'),
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
            assert(!result,printTestResult({}, result) )

        },
        'Invalid nested input':function(){
            var input = {
                a : {
                    aa:false,
                    cc:false
                },
                d:true
            };
            var instance = schema({
                a : {
                    aa:Number,
                    bb:{
                        aaa:Boolean,
                        bbb:Number,
                        ccc:{
                            aaaa:Boolean
                        }
                    },
                    cc:Function
                },
                b : Number,
                c : Boolean,
                d : Number
            });
            var result = instance.errors(input);
            assert(!result,printTestResult(input, result))
        }
    }
}).export(module)