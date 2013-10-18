/*
 Project: Hummus
 Description: intercepts Ajax calls for various libraries, for various reasons, and doesn't care what you think.
 Dependencies: jQuery 1.7+
 License: WTFPL 2.0
 */

(function($, window){

    var defaults = {
        // what do you client side api calls start with?
        route: "#hummus", // sample api call would be #hummus/users/:id,

        // what is the function called on each lib
        // todo, make this dynamic per lib, i got lucky with $ and Backbone (cuz it uses $'s), but that's not cool bro, not cool
        ajaxFn: "ajax"
    };

    var Hummus = window.Hummus = function(libs, config){

        // pass on some configs
        this.config = $.extend({}, defaults, config);

        // which libs are we intercepting?
        this.libs = [].concat(libs);

        // no matter what, save a copy of jquery's ajax
        // todo, save a copy of each lib instead, and use that respectively
        this._ajax = $.ajax;

        // ok, start the mess
        this.init();
    };

    Hummus.prototype = {

        // interated over each lib and "augment" or put a condition on each's lib
        init: function(){
            this.libs.forEach(this.conditionAjax.bind(this))
        },

        // intercept dem functions
        conditionAjax: function(lib){
            if(lib && typeof lib[this.config.ajaxFn] == "function") {
                lib[this.config.ajaxFn] = this.intercept(lib[this.config.ajaxFn], this.hummusAjax, this.shouldIntercept.bind(this));
            }
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
        },

        // for now, the condition I am looking for is if the ajax's {url: URL} start's with the route we set to intercept.
        shouldIntercept: function(){
            return arguments
                && arguments[0]
                && arguments[0][0]
                && arguments[0][0]['url']
                && arguments[0][0]['url'].indexOf(this.config.route) == 0;
        },

        // this is the what gets called if shouldIntercept returns true,
        // this is obviously not complete, but here you can execute your other behavior
        // I will writing adapters to consolidate other api calls into one.
        hummusAjax: function(){
            console.log("hummusAjax called:");
            console.log(arguments);
            // var deferred = new $.Deferred();
            // do something with it, make few calls, .. then resolve, or reject, you know
            // or i can has just do; return this._ajax(arguments);
        }
    };
})(jQuery, window);