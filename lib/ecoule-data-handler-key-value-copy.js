/* global module require */
'use strict';

var isArray = require('util').isArray;

function DataHandler (config) {
    this.match = config.match || {};

    // Normailize the input so that we always have an array
    // of directives. Makes it possible to pass in an directive
    // object as input if only one is needed.
    if (config.directives && ! isArray(config.directives)) {
        this.directives = [config.directives];
    }
    else {
        this.directives = config.directives || [];
    }
}

DataHandler.prototype.initialize = function (done) {
    var err,
        i = 0,
        allowedFnTypes = ['function', 'undefined'],
        allowedOverwriteTypes = ['boolean', 'undefined'],
        destinations = {},
        current
    ;

    if (this.directives.length === 0) {
        err = new Error('No directives was given.');
    }
    else {
        for (; this.directives[i]; i += 1) {
            current = this.directives[i];
            if (typeof current.from !== 'string') {
                err = new Error(
                    'A directive should have a from argument and it should be a string'
                );
            }

            if (typeof current.to !== 'string') {
                err = new Error(
                    'A directive should have a to argument and it should be a string'
                );
            }

            if (allowedFnTypes.indexOf(typeof current.fn) === -1) {
                err = new Error(
                    'A directive had a defined a fn but it was not a function'
                );
            }

            if (allowedOverwriteTypes.indexOf(typeof current.overwrite) === -1) {
                err = new Error(
                    'A directive had a overwrite defined but it was not a boolean'
                );
            }

            if (typeof destinations[current.to] === 'undefined') {
                destinations[current.to] = true;
            }
            else {
                err = new Error(
                    'Two or more directives has the same to-value'
                );
            }

            // bail out if we have an error
            if (err) {
                break;
            }
        }
    }

    return done(err);
};

DataHandler.prototype.execute = function(entry, done) {
    var err, current, i;

    for (i = 0; this.directives[i]; i += 1) {
        current = this.directives[i];

        if (typeof entry[current.from] === 'undefined') {
            if (current.overwrite) {
                delete entry[current.to];
            }
        }
        else if (current.overwrite || typeof entry[current.to] === 'undefined') {
            if (current.fn) {
                entry[current.to] = current.fn(entry[current.from]);
            }
            else {
                entry[current.to] = entry[current.from];
            }
        }
    }

    return done(err);
};

module.exports = function (config) {
    return new DataHandler(config || {});
};