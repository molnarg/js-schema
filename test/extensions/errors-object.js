var vows            = require('vows')
  , assert          = require('assert')
  , printTestResult = require('../printTestResult.js')
  , schema          = require('../../index.js');


// Create a Test Suite
vows.describe('Validation Object with errors').addBatch({
  'Object': {
    'Invalid input : empty object': function() {
      var input = {
        object: {},
        number: 3
      };
      var B = function B() {};
      var instance = schema({
        func: Function,
        number: Number.min(6).max(9),
        boolean: Boolean,
        string: String,
        class: B,
        object: {
          a: Number.min(2).max(7),
          b: Function
        }
      });
      var result = instance.errors(input);
      console.log('Input : \n', vows.inspect(input));
      console.log('Errors : \n', vows.inspect(result));
      assert(result, printTestResult(input, result))
    },
    'Invalid nested input': function() {
      var input = {
        a: {
          aa: false,
          cc: false
        },
        d: true
      };
      var instance = schema({
        a: {
          aa: [Number.min(2), String],
          bb: {
            aaa: Boolean,
            bbb: Number,
            ccc: {
              aaaa: Boolean
            }
          },
          cc: Function
        },
        b: Number,
        c: Boolean,
        d: Number
      });
      var result = instance.errors(input);
      console.log('Input : \n', vows.inspect(input));
      console.log('Errors : \n', vows.inspect(result));
      assert(result, printTestResult(input, result))
    }
  }
}).export(module)
