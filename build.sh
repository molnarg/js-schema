#!/bin/bash

DEBUG="js-schema.debug.js"
MIN="js-schema.min.js"

browserify index.js | sed 's|require("/index.js")|window.schema = require("/index.js")|g' >$DEBUG

uglifyjs $DEBUG >$MIN
