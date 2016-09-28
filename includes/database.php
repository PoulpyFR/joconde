<?php

/**
 * database.php
 *
 * Database Wrapper for Joconde
 **/

header('Content-type: application/json; charset=UTF-8');

//-- database constants
define('', 'tools-db');
define('', 's52411');
define('', 'akahsuvaicheesoh');
define('', 's52411__joconde');

/**
 * databaseQuery
 *
 * Performs a query
 *
 * $query: query to execute
 *
 * return: query result
 **/
function databaseQuery($query) {
	$link = mysql_connect('tools-db', 's52411', 'akahsuvaicheesoh');
	$result = mysql_query('USE s52411__joconde') or die();
	$result = mysql_query('SET NAMES utf8') or die();
	$result = mysql_query($query) or die();
	
	return $result;
}

/**
 * raw_json_encode
 **/
function raw_json_encode($input) {
  return preg_replace_callback(
    '/\\\\u([0-9a-zA-Z]{4})/',
    function ($matches) {
      return mb_convert_encoding(pack('H*',$matches[1]),'UTF-8','UTF-16');
    },
    json_encode($input)
  );
} //-- raw_json_encode


/**
 * Main
 **/

$action = $_REQUEST['action'];
if ($action) {
	switch ($action) {

		case 'check':
			$type  = $_REQUEST['type'];
			$input = $_REQUEST['input'];
			
			if($type && $input) {
				$query = 'SELECT * FROM existingValues WHERE type="'.$type.'" AND input="'.$input.'" AND active=1;';
				$result = databaseQuery($query);
			 	while ($line = mysql_fetch_array($result, MYSQL_ASSOC)) {
					$data = raw_json_encode($line);
			 		$data = preg_replace('/\"0\"/', 'false', $data);
			 		$data = preg_replace('/\"1\"/', 'true',  $data);
			 		echo $data;
			  	break;
			  }
			}
			break;

		case 'add':
			$type        = $_REQUEST['type'];
			$input       = $_REQUEST['input'];
			$text        = $_REQUEST['text'];
    	$description = $_REQUEST['description'];
    	$wikidata    = $_REQUEST['wikidata'];
    	$surface     = $_REQUEST['surface'];
    	$genre       = $_REQUEST['genre'];

	 		$query  = 'INSERT INTO existingValues(type,input,text,description,wikidata,surface,genre) VALUES ("'.$type.'", "'.$input.'", "'.$text.'", "'.$description.'", "'.$wikidata.'", "'.$surface.'", "'.$genre.'");';
    	$query  = preg_replace('/\"false\"/', 'false', $query);
			$query  = preg_replace('/\"true\"/',  'true',  $query);
			$result = databaseQuery($query);
			echo raw_json_encode($result);
			
			break;

		case 'delete':
			$id = $_REQUEST['id'];
			
			$query = 'UPDATE existingValues SET active=0 WHERE id='.$id;
			$result = databaseQuery($query);
			echo raw_json_encode($result);

			break;

	}
}
?>
