js-schema
=========

js-schema is essentially a way to describe JSON schemas using a
much cleaner and simpler syntax. Schemas described this way
can be then serialized to standard JSON schema.

Examples
========

Object validation:

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

console.log( Duck(myDuck) ); // true
console.log( Duck(myCat)  ); // false
```

Defining, validating, and generating resursive data structures:

```javascript
// defining the data structure
var Tree = schema({ left : [Tree, Number], right : [Tree, Number] });

// validation
console.log( Tree({left : {left : 1, right : 2   }, right : 9}) ); // true
console.log( Tree({left : {left : 1, right : null}, right : 9}) ); // false

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

