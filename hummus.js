/*
 Project: Hummus
 Description: intercepts, redirects, consolidates Ajax calls (or any other functions)
  > for various libraries,
  > for various reasons,
  > and doesn't care what you think.
 Version: 0.0.1
 Soft Dependencies: jQuery 1.7+
 License: WTFPL 2.0
 */

(function(window){

    var $ = window.jQuery || {};

    var defaults = {
        lib: {
            // what is the function called on each lib
            // if none is given, "ajax" is the assumed function name
            functions: [{base: "ajax"}],

            // default name is pickle_INDEX of a lib, if no name given
            name: "pickle"
        },
        // if you decide the ajax interception,
        // what do you client side api calls start with?
        ajax: {
            // default
            rootRoute: "#hummus"
        } // sample api call would be #hummus/users/:id,

    };

    var Hummus = window.Hummus = function(libs, config){

        // pass on some configs
        this.config = $.extend({}, defaults, config);

        // which libs are we intercepting?
        this.libs = LIBS = [].concat(libs);

        // set some defaults
        this.libs.map(this._setDefaults.bind(this));

        // no matter what, save a copy of jquery's ajax
        this._ajax = $.ajax;

        // ok, start the mess
        this.init();
    };

    Hummus.prototype = {

        _setDefaults: function(lib, li){
            lib.name = lib.name || (defaults.lib.name + "_" + li);
            lib.$ = lib.$ || {};

            lib.functions = lib.functions ? [].concat(lib.functions) : defaults.lib.functions;
            lib._oldFunctions = [];
            for (var i = 0; i < lib.functions.length; i++){
                // see if an inverse function is passed in to be executed in case the condition function returns true
                // if not, fall back to the hummus one, which assumed it's an ajax call
                lib.functions[i].inverse = typeof lib.functions[i].inverse == "function" ? lib.functions[i].inverse : this.hummusInverse.bind(this);

                // see if a condition function is passed in to be checked,
                // if not fall back to the hummus one, which assumes it's an ajax call, and will check for the url paramajax(url)
                lib.functions[i].condition = typeof lib.functions[i].condition == "function" ? lib.functions[i].condition : this.hummusCondition.bind(this);

                // save a copy of each old function
                lib._oldFunctions[lib.functions[i].base] = lib.$[lib.functions[i].base];
            }
            return lib;
        },

        // iterate over each lib and "augment" or put a condition on each's lib
        init: function(){
            this.libs.forEach(this.conditionFunctions.bind(this))
        },

        // intercept dem functions
        conditionFunctions: function(lib){
            for(var i = 0; i < lib.functions.length; i++)
                lib.$[lib.functions[i].base] = this.intercept(lib.$[lib.functions[i].base], lib.functions[i].inverse, lib.functions[i].condition);
        },

        // okay, so, pass in the original function, aka baseFn, pass in the inverseFn, which executes only if the conditionFn returns true
        // otherwise, just executes the normal baseFn passing in the same original arguments
        intercept: function(baseFn, inverseFn, conditionFn){
            return (function(){
                return function () {
                    if (conditionFn(arguments)) {
                        console.log("base intercepted, inverse called");
                        inverseFn.apply(this, arguments);
                    } else {
                        baseFn.apply(this, arguments);
                        console.log("base called, inverse skipped");
                    }
                };
            })();
        },

        // for now, the condition I am looking for is if the ajax's {url: URL} start's with the route we set to intercept.
        hummusCondition: function(){
            return arguments
                && arguments[0]
                && arguments[0][0]
                && arguments[0][0]['url']
                // if the url is there, and it starts with the rootRoute, then return true
                && arguments[0][0]['url'].indexOf(this.config.ajax.rootRoute) == 0;
        },

        // this is the what gets called if shouldIntercept returns true,
        // this is obviously not complete, but here you can execute your other behavior
        // I will writing adapters to consolidate other api calls into one.
        hummusInverse: function(){
            // var deferred = new $.Deferred();
            // do something with it, make few calls, .. then resolve, or reject, you know
            // or i can has just do; return this._ajax(arguments);
        }
    };
})(window);