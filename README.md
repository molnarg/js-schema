js-schema
=========

js-schema is essentially a way to describe JSON schemas using a
much cleaner and simpler syntax. Schemas described this way
can be then serialized to standard JSON schema.

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

Instanceof
----------

`schema(Class)(object)` (where `Class` is a function) is true if `object instanceof Class`.

Examples:
```javascript
schema(Number)(1);   //true
schema(String)(1);   //false
schema(String)('x'); //true

function Class() { /*...*/ }  // constructor function
var object = new Class();

schema(Class)(object);  // true
schema(Class)({});      // false
schema(Number)(object); // false
```

Object
------

Reference
---------

Or
--

And
---

Nothing
-------

Anything
--------

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

