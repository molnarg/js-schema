var vows            = require('vows')
  , assert          = require('assert')
  , printTestResult = require('../printTestResult.js')
  , schema          = require('../../index.js')


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
    },
    "original validate schema has a bug with regexp field validation.": function () {
      //object should have at least one String field
      var validation = schema({
        "+.+" : String
      });
      var emptyObject = {};
      assert(false, validation(emptyObject));

      var emptyArray = [];
      assert(false, validation(emptyArray));
    },
    //this test is commented, because there is not "strict" mode yet
    /*
    "some fields are valid, all the rest are not": function () {
      var validation = schema({
        "+check.?" : Number
      });
      var correctObject = {
        check1 : 1,
        check2 : 2
      };
      assert(true, validation(correctObject));
      var incorrectObject = {
        check1 : 1,
        check2 : 2,
        someOther : 3
      };
      assert(false, validation(incorrectObject));
    },
    */
    "with allowed other fields": function () {
      var anotherValidation = schema({
        "+check.?": Number,
        "*": Number
      });
      var o1 = {
        check1: 1,
        check2: 2
      };
      var o2 = {
        check1: 1,
        check2: 2,
        someOther: 3
      };

      assert(true, anotherValidation(o1));
      assert(true, anotherValidation(o2));
    },
    "empty object should be valid sometimes": function () {
      var allowAll = schema({
        "*": String
      });
      expect(allowAll({})).toBe(true);

      var allowSome = schema({
        "check": [null, String]
      });
      expect(allowSome({})).toBe(true);
    }
  }
}).export(module)
