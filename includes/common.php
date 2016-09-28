<?php

/**************************************************************************/

function print_header() {
	//header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html ng-app="jocondeApp">
<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Joconde</title>
  <!--<script type='text/javascript' src='/js/lib/dummy.js'></script>-->
  <style type='text/css'></style>
  <!--<link rel="stylesheet" href="joconde.css" />-->
  <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.10/angular.js"></script>
  <script src="//angular-ui.github.io/bootstrap/ui-bootstrap-tpls-0.11.0.js"></script>
  <script src="app.js"></script>
  <link href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" rel="stylesheet">
  <link href="joconde.css" rel="stylesheet">
</head>
<body>
<div id="page" ng-controller="jocondeController">
<?php
}

function print_footer() {
?>
<div style="clear:both"></div>
<hr />
<small>&Agrave; priori, toute cette page est plac&eacute;e sous la <a href="http://creativecommons.org/licenses/by-sa/4.0/">licence Creative Commons Attribution-Sharealike (BY-SA)</a>. Pour toute info, explication, réclamation, vous pouvez vous adresser à <a href="https://www.wikidata.org/wiki/User:Poulpy">Poulpy</a></small>
</div>
</body>
</html>
<?php
}

/**************************************************************************/

/* gets the data from a URL */
function get_data($url) {
	$ch = curl_init();
	$timeout = 5;
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
	$data = utf8_encode(curl_exec($ch));
	curl_close($ch);
	return $data;
}

function name_formatting($name) {
	$last_name = "";
	$first_name= "";
	$s = explode(' ', $name);
	foreach($s as $element) {
		/*if ($element == "&" || (strlen($element)>2 && $element == strtoupper($element))) {
			if ($last_name != "")
				$last_name .= " ";
			$last_name .= $element[0].strtolower(substr($element, 1, 10000));
		}
		else {
			if ($first_name != "")
				$first_name .= " ";
			$first_name .= $element;
		}*/
		if ($last_name != "")
			$last_name .= " ";
		$last_name .= $element[0].strtolower(substr($element, 1, 10000));
	}

	//return $first_name." ".$last_name;
	return $last_name;
}

/**************************************************************************/

function parse_joconde_page($joconde_id) {
	$joconde_page = get_data('http://www.culture.gouv.fr/public/mistral/joconde_fr?ACTION=CHERCHER&FIELD_98=REF&VALUE_98='.$joconde_id);
	$content = html_entity_decode($joconde_page, ENT_COMPAT|ENT_HTML401, 'UTF-8');
	$content = preg_replace('/\r/', '', $content);
	$content = preg_replace('/\n/', '', $content);
	$content = preg_replace('/^.*<TABLE BORDER=0 width=\"550\">/', '', $content);
	$content = preg_replace('/<\/TD><\/TABLE>.*$/', '', $content);
	$content = preg_replace('/<\/N><\/TD><TD width=\"350\" class=\"resultat\"><P align=\"justify\"><N>/', '\t', $content);
	$content = preg_replace('/<\/N><\/TD><TD width=\"350\" class=\"resultat\"><P align=\"justify\">/', '\t', $content);
	$content = preg_replace('/[ ]+/', ' ', $content);
	$content = preg_replace('/\t /', '\t', $content);
	$content = preg_replace('/<\/N><\/P><\/TD><\/TR>/', '', $content);
	$content = preg_replace('/<\/P><\/TD><\/TR>/', '', $content);
	$content = preg_replace('/<[ ]*/', '<', $content);
	$content = preg_replace('/[ ]*>/', '>', $content);

	$data = explode('<N>', $content);

	foreach($data as $element) {
		$element = preg_replace('/<[Tt][Dd][^>]*>/', '', $element);
		$element = preg_replace('/<\\[Tt][Dd]>/', '', $element);
		$element = preg_replace('/<[Tt][Rr][^>]*>/', '', $element);
		$element = preg_replace('/<\\[Tt][Rr]>/', '', $element);
		$element = preg_replace('/<[Aa] [^>]*>/', '', $element);
		$element = preg_replace('/<\/[Aa]>/', '', $element);
		$element = preg_replace('/<[Ii][Mm][Gg] [^>]*>/', '', $element);
		$element = preg_replace('/^ /', '', $element);
		$element = preg_replace('/\t /', '\t', $element);

		list($key, $value) = explode('\t', $element);
		$result[$key] = $value;
	}
	
	$painting = false;
	
	$array = array(
		'creator' 		=> array(),
		'date'				=> array(),
		'precision'		=> 9,
		'description_fr' => '',
		'description_en' => '',
		'height'			=> '',
		'inventory'		=> array(),
		'joconde_id'	=> $joconde_id,
		'collection'  => array(),
		'material'		=> array(),
		'subject'			=> array(),
		'title_en'		=> '',
		'title_fr'		=> '',
		'type' 				=> array(),
		'alias_fr'    => array(array('text' => '','index' => 0)),
		'alias_en'    => array(array('text' => '','index' => 0))
	);
	
	

	foreach($result as $key => $value)
	if (strlen($key) > 1) {
		switch ($key) {
			case "Auteur/exécutant":
				$value2 = preg_replace('/[ ]*;[ ]*/', ';', $value);
				$creator = explode(';', $value2);
				for ($i=0; $i<count($creator); $i++) {
					$element = array(
					  'text'      => '',
					  'attribute' => '',
					  'index'     => $i
					);

				  $par_pos = strpos($creator[$i], "(");
					if ($par_pos>0) {
						$element['attribute'] = substr($creator[$i], $par_pos+1, 10000);
						$element['attribute'] = substr($element['attribute'], 0, strlen($element['attribute'])-1);
						$element['text'] = name_formatting(substr($creator[$i], 0, $par_pos-1));
					} else
						$element['text'] = name_formatting($creator[$i]);
					if ($element['attribute'] == 'dit')
						$element['attribute'] = '';
					$element['input'] = $element['text'];
					array_push($array['creator'], $element);
				}
				break;

			case "Dénomination":
			case "Domaine":
				$type = explode(';', $value);
				for ($i=0; $i<count($type); $i++) {
					$element = array(
					  'text'     => $type[$i],
					  'index'    => $i + count($array['type'])
					);
					$element['text'] = preg_replace('/^[ ]+/', '', $element['text']);
					$element['text'] = preg_replace('/[ ]+$/', '', $element['text']);
					$element['input'] = $element['text'];
					
					switch ($element['text']) {
						case 'peinture':
						case 'tableau':
						  if (!$painting) {
						  	$painting = true;
						  	$element['text'] = 'peinture';
						  	$element['input'] = $element['text'];
						  	array_push($array['type'], $element);
						  }
							break;
						
						default:
						  array_push($array['type'], $element);
					}
					
				}
				break;

			case "Dimensions":
				$value = preg_replace('/^[ ]+/', '', $value);
				$value = preg_replace('/[ ]+$/', '', $value);
				$array['height'] = $value[0].strtolower(substr($value, 1, 10000));
				break;

			case "Lieu de conservation":
			  $element = array(
			    'text'     => $value,
			    'index'    => 0
			  );
				$element['text'] = preg_replace('/^[ ]+/', '', $element['text']);
				$element['text'] = preg_replace('/[ ]+$/', '', $element['text']);
				$element['input'] = $element['text'];

				array_push($array['collection'], $element);
				break;

			case "Matériaux/techniques" :
				$mat = preg_split('/[,;]/', $value);
				for ($i=0; $i<count($mat); $i++) {
					$element = array(
					  'text'     => $mat[$i],
					  'index'    => $i
					);
					$element['text'] = preg_replace('/^[ ]+/', '', $element['text']);
					$element['text'] = preg_replace('/[ ]+$/', '', $element['text']);
					$element['input'] = $element['text'];
					
					switch ($element['text']) {
						case "peinture à l'huile (toile)":
						  $element['text']        = "peinture à l'huile";
						  $element['input'] = $element['text'];
							array_push($array['material'], $element);
							$element['text']        = "toile";
							$element['input'] = $element['text'];
						  break;
					}
					
					array_push($array['material'], $element);
				}
				break;
				
			case "Millésime création/exécution":
				$value = preg_replace('/^[ ]+/', '', $value);
				$value = preg_replace('/[ ]+$/', '', $value);
				$array['date'] = $value;
				break;
				
			case "Numéro d'inventaire":
				$inventory = explode(';', $value);
				for ($i=0; $i<count($inventory); $i++) {
					$element = array(
					  'text'       => $inventory[$i],
					  'collection' => true,
					  'index'      => $i
					);
					$element['text'] = preg_replace('/^[ ]+/', '', $element['text']);
					$element['text'] = preg_replace('/[ ]+$/', '', $element['text']);
					array_push($array['inventory'], $element);
				}
				break;

			case "Période création/exécution":
			  if(!$array['date']) {
					$value = preg_replace('/^[ ]+/', '', $value);
					$value = preg_replace('/[ ]+$/', '', $value);
					$array['date'] = $value;
				}
				break;

			case "Sujet représenté":
				$value = preg_replace('/<[Bb][Rr][ ]*[\/]*>/', ',', $value);
				$subject = preg_split('/[,\(;:]/', $value);
				for ($i=0; $i<count($subject); $i++) {
					$element = array(
					  'text'     => $subject[$i],
					  'genre'    => false,
					  'wikidata' => '',
					  'index'    => $i
					);
					$element['text'] = preg_replace('/^[ ]+/', '', $element['text']);
					$element['text'] = preg_replace('/[ ]+$/', '', $element['text']);
					$element['text'] = preg_replace('/\)/', '', $element['text']);
					$element['input'] = $element['text'];
					array_push($array['subject'], $element);
				}
				break;
			
			case "Titre":
				$value = preg_replace('/^[ ]+/', '', $value);
				$value = preg_replace('/[ ]+$/', '', $value);
				//$array['title_fr'] = $value[0].strtolower(substr($value, 1, 10000));
				if (preg_match('/^[0-9A-Z\-, ]*$/', $value))
					$array['title_fr'] = $value[0].strtolower(substr($value, 1, 10000));
				else
					$array['title_fr'] = $value;
				break;

		}
	}
	
	return $array;
}

function raw_json_encode($input) {
  return preg_replace_callback(
    '/\\\\u([0-9a-zA-Z]{4})/',
    function ($matches) {
      return mb_convert_encoding(pack('H*',$matches[1]),'UTF-8','UTF-16');
    },
    json_encode($input)
  );
}

function check_subject($array, $subject) {
	foreach ($array as $s)
		if ($s['text'] == $subject)
			return true;
	return false;
}

function print_init_values($array) {
	$new_tab= array();
	foreach ($array['subject'] as $subject) {
		if (!check_subject($new_tab, $subject['text']))
			array_push($new_tab, $subject);
  }
  $array['subject'] = $new_tab;
	
	$dataModel = raw_json_encode($array);
	$dataModel = preg_replace('/\{\"/', '{', $dataModel);
	$dataModel = preg_replace('/,\"/', ',', $dataModel);
	$dataModel = preg_replace('/\":/', ':', $dataModel);
	$dataModel = preg_replace('/\'/', '\\\'', $dataModel);
	$dataModel = preg_replace('/\"/', '\'', $dataModel);
	echo "<!-- " . $txt . " -->\n";
	
?>

<div ng-init="dataModel = <?php echo $dataModel; ?>"></div>
<div ng-init="loadExistingValues()"></div>
<div ng-init="checkExistingEntity()"></div>
<div ng-init="change()"></div>
<?php
}

/**************************************************************************/

