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
        i = 0, j = 0, occurrences,
        allowedFnTypes = ['function', 'undefined'],
        allowedOverwriteTypes = ['boolean', 'undefined'],
        allowedActions = ['write', 'from'],
        destinations = {},
        current
    ;

    if (this.directives.length === 0) {
        err = new Error('No directives was given.');
    }
    else {
        for (; this.directives[i]; i += 1) {
            current = this.directives[i];

            // check if there is more than one command in the directive
            for (j = 0, occurrences = 0; allowedActions[j]; j += 1) {
                if (allowedActions[j] in current) {
                    occurrences += 1;
                }
            }
            if (occurrences > 1) {
                var last = allowedActions.pop();

                err = new Error([
                    'A directive must only have one occurrence of the following commands:',
                    allowedActions.concat('or ' + last).join(', ')
                ].join(' '));
            }

            if (typeof current.from !== 'string' && typeof current.write === 'undefined') {
                err = new Error([
                    'A directive should have a from argument and it should be a string',
                    'or have a \'write\'-argument'
                ].join(' '));
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

        if (typeof entry[current.from] === 'undefined' && typeof current.write === 'undefined') {
            if (current.overwrite) {
                delete entry[current.to];
            }
        }
        else if (current.overwrite || typeof entry[current.to] === 'undefined') {
            if (current.fn) {
                entry[current.to] = current.fn(entry[current.from]);
            }
            else if (typeof current.write !== 'undefined') {
                entry[current.to] = current.write;
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