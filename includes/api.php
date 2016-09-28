<?php

require 'common.php';

header('Content-Type: text/html; charset=utf-8');
ini_set('html_errors', 0);

function call_database($type, $input) {
	
	$link = mysql_connect('tools-db', 's52411', 'akahsuvaicheesoh');
	$result = mysql_query('USE s52411__joconde') or die();
	$result = mysql_query('SET NAMES utf8') or die();
	$query = 'SELECT * FROM existingValues WHERE type="'.$type.'" AND input="'.$input.'" AND active=1;';
	$result = mysql_query($query) or die();
 	while ($line = mysql_fetch_array($result, MYSQL_ASSOC))
 		return $line;

	return array();  

}

$array = array();
if(isset($_GET['joconde_id']) AND !empty($_GET['joconde_id'])) {
	$joconde_id = $_GET['joconde_id'];
  if($joconde_id != '') {
		$array = parse_joconde_page($joconde_id);
	 
		$new_tab= array();
		foreach ($array['subject'] as $subject) {
			if (!check_subject($new_tab, $subject['text']))
				array_push($new_tab, $subject);
		}
  	$array['subject'] = $new_tab;
  	
  	//-- collection
  	for ($i=0; $i<count($array['collection']); $i++) {
  		$data = call_database('collection', $array['collection'][$i]['input']);
  		if (count($data) > 0) {
	  		$array['collection'][$i]['text'] = $data['text'];
  			$array['collection'][$i]['description'] = $data['description'];
  			$array['collection'][$i]['wikidata'] = $data['wikidata'];
  		} else {
  			$array['collection'][$i]['wikidata'] = '';
  		}
  	}
  	
  	//-- creator
  	for ($i=0; $i<count($array['creator']); $i++) {
  		$data = call_database('creator', $array['creator'][$i]['input']);
  		if (count($data) > 0) {
	  		$array['creator'][$i]['text'] = $data['text'];
  			$array['creator'][$i]['description'] = $data['description'];
  			$array['creator'][$i]['wikidata'] = $data['wikidata'];
  		} else {
  			$array['creator'][$i]['wikidata'] = '';
  		}
  	}
  	
  	//-- material
  	for ($i=0; $i<count($array['material']); $i++) {
  		$data = call_database('material', $array['material'][$i]['input']);
  		if (count($data) > 0) {
	  		$array['material'][$i]['text'] = $data['text'];
  			$array['material'][$i]['description'] = $data['description'];
  			$array['material'][$i]['wikidata'] = $data['wikidata'];
  			$array['material'][$i]['surface'] = $data['surface'];
  		} else {
  			$array['material'][$i]['wikidata'] = '';
  			$array['material'][$i]['surface'] = '';
  		}
  	}
  	
  	//-- subject
  	for ($i=0; $i<count($array['subject']); $i++) {
  		$data = call_database('subject', $array['subject'][$i]['input']);
  		if (count($data) > 0) {
	  		$array['subject'][$i]['text'] = $data['text'];
  			$array['subject'][$i]['description'] = $data['description'];
  			$array['subject'][$i]['wikidata'] = $data['wikidata'];
  			$array['subject'][$i]['genre'] = $data['genre'];
  		} else {
  			$array['subject'][$i]['wikidata'] = '';
  			$array['subject'][$i]['genre'] = '';
  		}
  	}
  	
  	//-- type
  	for ($i=0; $i<count($array['type']); $i++) {
  		$data = call_database('type', $array['type'][$i]['input']);
  		if (count($data) > 0) {
	  		$array['type'][$i]['text'] = $data['text'];
  			$array['type'][$i]['description'] = $data['description'];
  			$array['type'][$i]['wikidata'] = $data['wikidata'];
  		} else {
  			$array['type'][$i]['wikidata'] = '';
  		}
  	}
  	
	}
}

print json_encode($array);

?>
