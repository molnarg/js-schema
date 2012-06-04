js-schema
=========

js-schema is essentially a new way to describe JSON schemas using a
much cleaner and simpler syntax. Think of it like regexp for objects.

Examples
========

Object validation and filtering:

```javascript
var schema = require('js-schema');

var Duck = schema({
  quack : Function,
  feed : Function,
  age : Number.min(0).max(5)
  color : ['yellow', 'brown']
});

var myDuck = { quack : function() {}, feed : function() {}, age : 2, color : 'yellow' };
var myCat =  { purr  : function() {}, feed : function() {}, age : 3, color : 'black'  };
var animals = [myDuck, myCat, /*...*/ ];

console.log( Duck(myDuck) ); // true
console.log( Duck(myCat)  ); // false
console.log( animals.filter(Duck) ); // every Duck-like object
console.log( animals.filter(schema({ feed : Function })) ); // every animal that can be fed
```

Usage
=====

The first parameter passed to the `schema` function describes the schema, and the return value
is a new function called validator. Then the validator can be used to check any object against
the described schema as in the example above.

There are various patterns that can be used to describe a schema. For example,
`schema({n : Number})` returns a validation function which returns true when called
with an object that has a number type property called `n`. This is a combination of the
object pattern and the instanceof pattern. Most of the patterns are pretty intuitive, so
reading a schema description is quite easy even if you are not familiar with js-schema.
Most patterns accept other patterns as parameters, so composition of patterns is very easy.

Extensions are functions that return validator by themselves without using the `schema` function
as wrapper. These extensions are usually tied to native object constructors, like `Array`,
`Number`, or `String`, and can be used everywhere where a pattern is expected. Examples
include `Array.of(X)`, `Number.min(X)`, or `String.matches(/X/)`.

Reference - patterns
====================

There are 8 basic rules used by js-schema:

1. `Class` (where `Class` is a function, and has a function type property called
`schema`) matches `x` if `Class.schema(x)` is true
2. `Class` (where `Class` is a function) matches `x` if `x instanceof Class`
3. `[[pattern1, pattern2, ...]]` matches `x` if _all_ of the given patterns match `x`
4. `[pattern1, pattern2, ...]` matches `x` if _any_ of the given patterns match `x`
5. `{ a : pattern1, b : pattern2, ... }` matches `x` if `pattern1`  matches `x.a`, `pattern2`
matches `x.b`, etc.
6. `undefined` matches `x` if `x` _is not_ `null` or `undefined`
7. `null` matches `x` if `x` _is_ `null` or `undefined`
8. `primitive` (where `primitive` is boolean, number, or string) matches `x` if `primitive === x`

The order is important. When calling `schema(pattern)`, the rules are examined one by one,
starting with the first. If there's a match, js-schema first resolves the sub-patterns, and then
generates the appropriate validator function and returns it.

The following example contains patterns for all of the rules, except the first. The comments
denote the number of the rules used and the nesting level of the subpatterns (indentation).

```javascript
validator = schema({              // (5) 'object' pattern
  a : [[ String, {length : 5} ]], //     (3) 'and' pattern
                                  //         (2) 'instanceof' pattern
                                  //         (5) 'object' pattern
                                  //             (8) 'primitive' pattern
  b : [Color, 'red', 'blue'],     //     (4) 'or' pattern
                                  //         (2) 'instanceof' pattern
                                  //         (8) 'primitive' pattern
  c : undefined,                  //     (6) 'anything' pattern
  d : null                        //     (7) 'nothing' pattern
});
```

The `schema` function compiles the pattern, and returns the value of the following expression
(the validator function):

```javascript
(functon(r0){
  return function(instance){
    return instance != null && (
             (Object(instance["a"]) instanceof String) && 
             (instance["a"] != null && (instance["a"]["length"] === 5))
           ) && (
             (Object(instance["b"]) instanceof r0) ||
             (instance["b"] === "red") || (instance["b"] === "blue")
           ) && (
             instance["c"] != null
           ) && (
             instance["d"] == null
           );
  };
}(Color));
```

As you can see, the compiled function is nearly optimal, and looks like what anyone would
write when following the rules described above.

Reference - extensions
======================

Numbers
-------

Strings
-------

Objects
-------

Arrays
------

Functions
---------

Future plans
============

Defining and validating resursive data structures:

```javascript
// defining the data structure
var Tree = schema({ left : [Tree, Number], right : [Tree, Number] });

// validation
console.log( Tree({left : {left : 1, right : 2   }, right : 9}) ); // true
console.log( Tree({left : {left : 1, right : null}, right : 9}) ); // false
```

Generating random objects based on schema description:

```javascript
// generating random trees
console.log( schema.random(Tree) ); // {left : 0.123, right : {left : 0.2, right : 0.9}}

// generating an array of random trees for testing
var testcases = schema.random(Array.of(Tree));
test(testcases);
```

Installation
============

Using [npm](http://npmjs.org):

    npm install js-schema

License
=======

The MIT License

Copyright (C) 2012 Gábor Molnár <gabor.molnar@sch.bme.hu>

