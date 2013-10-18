## Pesta Readme

Ever wanted to intercept jQuery's or Backbone's ajax calls to do something else first, then make the call?
or maybe consolidate multiple ajax calls to multiple servers, in one Client-Side restful route?

well i once wanted to do so, my use case was basically that I had build ONE backbone model, using 3 different ajax calls, each to a different API, so I decided to
intercept ajax calls, make 3 different calls, then return the data consolidated to the original request, kinda like your own API server, but it runs on the browser.
