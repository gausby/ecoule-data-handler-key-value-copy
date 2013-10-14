Key-Value Copy Data Handler for Écoule
======================================

An [Écoule][ecoule-core] data handler module that copies data from one or more keys to other keys. This is useful for normalizing data structures when more than one Écoule source returns different structures and the transformer expect a given structure.

[ecoule-core]: https://github.com/gausby/ecoule

The bugtracker for this project is located here: [Key-Value Copy Data Handler for Écoule Issue tracker][bugtracker].


## Usage
This is a Source module for the Écoule-engine, and should be included in the source section of an Écoule-configuration.

    var Ecoule = require('ecoule'),
        copy = require('ecoule-data-handler-key-value-copy')
    ;

    var myEcoule({
        'data-handlers': [
            copy({
                // configration
            })
        ]
        // ...
    });


### Configuration
The configuration passed to the file system source is an object with the following keys.

  * `match` an [Pursuit][pursuit] object or a function that return a boolean value. By default it will match everything.
  * `directives` object or array of objects that describes input and output keys, and optional functions that the input will get passed through.

[pursuit]: https://github.com/gausby/pursuit

#### Directives
One or more directives can be given. A directive need at least a `from` and `to` key set, and the `to` key shall be unique if there is more than one directive is set.

If you need more than one directive pass them in as an array.


##### `from`, `write`, and `to`

A directive is a normal object literal with the following structure:

    var copy = require('ecoule-data-handler-key-value-copy');

    var example = copy({
        from: 'input-key',
        to: 'output-key'
    });

This will copy the data from `input-key` to `output-key` in the passed in entry object. Like so:

    var entry = { 'input-key': 'foo' };

    example(entry); // entry is now { 'input-key': 'foo', 'output-key': 'foo' }

Alternatively a directive can *write* data to an output key.

    var example = copy({
        write: 'something',
        to: 'output-key'
    });

    var entry = { };

    example(entry); // entry is now { 'output-key': 'something' }

If neither a `write` or `from` command is present in a directive the data handler will throw an exception. If both are present in the same directive it will also throw an exception. A directive needs at least one.


##### `fn`

A directive can have a function attached, that the input will be run through before being stored in the output-key.

    var copy = require('ecoule-data-handler-key-value-copy');

    var example = copy({
        from: 'in',
        to: 'out',
        fn: function (data) { return data.toUpperCase(); }
    });

    var entry = { in: 'foo' };
    example(entry); // entry is now { in: 'foo', out: 'FOO' }


##### `overwrite`

By default the destination key will be checked for data before data is copied. This is done to prevent data being overwritten. If you want to overwrite data you can do so by setting `overwrite: true` on the directive.

    var copy = require('ecoule-data-handler-key-value-copy');

    var example = copy({
        from: 'in',
        to: 'out',
        overwrite: true
    });

    var entry = { in: 'foo', out: 'bar' };
    example(entry); // entry is now { in: 'foo', out: foo }

If overwrite is set to true, and the input is undefined, the output key will be deleted.


## Development
After cloning the project you will have to run `npm install` in the project root. This will install the various grunt plugins and other dependencies.


### QA tools
The QA tools rely on the [Grunt](http://gruntjs.com) task runner. To run any of these tools, you will need the grunt-cli installed globally on your system. This is easily done by typing the following in a terminal.

    $ npm install grunt-cli -g

The unit tests will need the [Buster](http://busterjs.org/) unit test framework.

    $ npm install -g buster

These two commands will install the buster and grunt commands on your system. These can be removed by typing `npm uninstall buster -g` and `npm uninstall grunt-cli -g`.


#### Unit Tests
The test suit can be run by typing the following in the project root.

    $ npm test

When developing you want to run the script watcher. Navigate to the project root and type the following in your terminal.

    $ grunt watch:scripts

This will run the jshint and tests each time a file has been modified.


## License
The MIT License (MIT)

Copyright (c) 2013 Martin Gausby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[bugtracker]: https://github.com/gausby/ecoule-data-handler-key-value-copy/issues
