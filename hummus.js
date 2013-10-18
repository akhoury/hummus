/*
 Project: Hummus
 Description: intercepts function calls with conditional and with inverse function if wanted
 > for various libraries,
 > for various reasons,
 > for various fuck you, that's why,
 Version: 0.0.1
 Soft Dependencies: jQuery 1.7+
 License: WTFPL 2.0
 */

(function(window){

    var $ = window.jQuery || {};

    var defaults = {

        // what is the function to be intercepted on each lib
        // if none is given, $.ajax is the assumed function name
        // because that's the one I wanted to intercepte, so I made it default
        functions: [
            {
                base: $["ajax"] || function(){},
                // the condition I am looking for ajax if the ajax's {url: URL} start's with the route we set to intercept.
                condition: function(){
                    return arguments
                        && arguments[0]
                        && arguments[0][0]
                        && arguments[0][0]['url']
                        // if the url is there, and it starts with the "#hummus", then return true
                        && arguments[0][0]['url'].indexOf("#hummus") == 0;
                },
                // this is the what gets called if condition returns true,
                // this is obviously not complete, but here you can execute your other behavior
                // I will writing adapters to consolidate other api calls into one.
                inverse: function(){
                    // var deferred = new $.Deferred();
                    // do something with it, make few calls, .. then resolve, or reject, you know
                    // or i can has just do; return this._ajax(arguments);
                }
            }]
    };

    var Hummus = window.Hummus = function(functions, config){

        // pass on some configs
        this.config = $.extend({}, defaults, config);

        // which functions are we intercepting?
        this.functions = functions && functions.length ? [].concat(functions) : defaults.functions;

        // sanity check yo
        this.functions.map(this.sanityCheck.bind(this));

        // no matter what, save a copy of jquery's ajax if we have it
        this._ajax = $.ajax || function(){};

        // ok, start the mess
        this.init();
    };

    Hummus.prototype = {

        sanityCheck: function(func){
            // see if an inverse function is passed in to be executed in case the condition function returns true
            func.inverse = typeof func.inverse == "function" ? func.inverse : function(){};
            // see if a condition function is passed in to be checked,
            func.condition = typeof func.condition == "function" ? func.condition : function(){};
            // save a copy of each old function
            func._old = func.base;
            return func;
        },

        // iterate over each function and "augment" or put a condition on each
        init: function(){
            this.functions.forEach(this.conditionFunctions.bind(this))
        },

        // intercept dat function
        conditionFunctions: function(func){
                func.base = this.intercept(func.base, func.inverse, func.condition);
        },

        // okay, so, pass in the original function, aka baseFn, pass in the inverseFn, which executes only if the conditionFn returns true
        // otherwise, just executes the normal baseFn passing in the same original arguments
        intercept: function(baseFn, inverseFn, conditionFn){
            return (function(){
                return function () {
                    if (conditionFn(arguments)) {
                        inverseFn.apply(this, arguments);
                    } else {
                        baseFn.apply(this, arguments);
                    }
                };
            })();
        }
    };
})(window);