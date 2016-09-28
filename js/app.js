'use strict';

var app = angular.module('jocondeApp', ['ui.bootstrap'])

app.filter('object2Array', function() {
	return function(input) {
		var out = []; 
		for(var i in input)
			out.push(input[i]);
		return out;
	}
});

