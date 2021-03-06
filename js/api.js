app.factory('api', function ($http) {
  var WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
  var COMMONS_API  = 'https://commons.wikimedia.org/w/api.php';
  var SPARQL_API   = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql';

  return {

    entity : function(id) {
      var params = {
        'action'    : 'wbgetentities',
        'ids'       : id,
        'format'    : 'json',
        'callback'  : 'JSON_CALLBACK',
        'languages' : 'en|fr',
        'props'     : 'labels|descriptions|aliases|claims'
      };
      return $http.jsonp(WIKIDATA_API, { params : params });
    },

    search : function(q, lang) {
      var params = {
        'action' : 'wbsearchentities',
        'search' : q,
        'format' : 'json',
        'language' : lang,
        'type' : 'item',
        'callback' : 'JSON_CALLBACK'
      };
      
      return $http.jsonp(WIKIDATA_API, { params : params });
    },
    
    descriptions : function(ids, lang) {
      var params = {
        'action' : 'wbgetentities',
        'ids' : ids,
        'format' : 'json',
        'props' : 'labels|descriptions',
        'languages' : lang,
        'callback' : 'JSON_CALLBACK'
      };

      return $http.jsonp(WIKIDATA_API, { params : params });
    },
    
    checkIdJocondeOnWikidata : function(id) {
    	
    	var query = 'SELECT ?item WHERE { ?item wdt:P347 "'+id+'" }';
    	
    	var params = {
    		'format' : 'json',
    		'query' : query,
        'callback' : 'JSON_CALLBACK'
    	}
    	
    	return $.getJSON(SPARQL_API, params, function( data ) {
    		return data;
    	});
    },
    
    
    
    checkDatabase : function(type, input) {
    	var params = {
    		action : 'check',
    		type   : type,
    		input  : input
    	};
			return $http({
    		method: 'POST',
	    	url: 'includes/database.php',
  	  	headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    		transformRequest: function(obj) {
      	  var str = [];
        	for(var p in obj)
	        str.push(	encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  	      return str.join("&");
    		},
    		data: params
			});
    },

    addDatabase : function(type, input, text, description, wikidata, surface, genre) {
    	var params = {
    		action      : 'add',
    		type        : type,
    		input       : input,
    		text        : text,
    		description : description,
    		wikidata    : wikidata,
    		surface     : surface,
    		genre       : genre
    	};
			return $http({
    		method: 'POST',
	    	url: 'includes/database.php',
  	  	headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    		transformRequest: function(obj) {
      	  var str = [];
        	for(var p in obj)
	        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  	      return str.join("&");
    		},
    		data: params
			});
    },

    deleteDatabase : function(id) {
    	var params = {
    		action      : 'delete',
    		id          : id,
    	};
			return $http({
    		method: 'POST',
	    	url: 'includes/database.php',
  	  	headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    		transformRequest: function(obj) {
      	  var str = [];
        	for(var p in obj)
	        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  	      return str.join("&");
    		},
    		data: params
			});
    }

  };
});
