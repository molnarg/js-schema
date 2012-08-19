#!/bin/bash

DEBUG="js-schema.debug.js"
MIN="js-schema.min.js"

echo '(function(){'                           >$DEBUG
browserify index.js | head -n -2             >>$DEBUG
echo 'window.schema = require("/index.js");' >>$DEBUG
echo '}())'                                  >>$DEBUG

uglifyjs $DEBUG >$MIN
