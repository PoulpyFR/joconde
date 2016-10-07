app.controller('editController', function($scope, $q, $http, STRUCTURE, api) {

	//$scope.joconde_id = '07290038618';
	$scope.joconde_id = '';
	$scope.current_joconde_id = $scope.joconde_id;
	$scope.wikidata_id = '';
	$scope.already_wikidata = false;
	$scope.data = [];
	$scope.language = 'fr';
	$scope.datePrecision = [
		{ value:11, text:'jour' },
		{ value:10, text:'mois' },
		{ value:9,  text:'année' },
		{ value:8,  text:'décade' },
		{ value:7,  text:'siècle' },
		{ value:6,  text:'millénaire' },
	];
	$scope.quickStatements = '';

	$scope.removeLine = function(property, index) {
		$scope.data[property].data.splice(index,1);
		$scope.updateQuickStatements();
	}

	$scope.addLine = function(property) {
		var newData = {};
		if ($scope.data[property].type == 'date')
			newData.precision = 9;
		$scope.data[property].data.push(JSON.parse(JSON.stringify(newData)));
		$scope.updateQuickStatements();
	}

	$scope.updateData = function(property, index) {
		$scope.updateQuickStatements();
	}

	$scope.updateRadioData = function(property, index, radio) {
		if (radio < $scope.data[property].values.length) {
			$scope.data[property].data[index].other = false;
		} else {
			$scope.data[property].data[index].other = true;
			$scope.data[property].data[index].value = $scope.data[property].data[index].othervalue;
		}
		$scope.updateQuickStatements();
	}

	$scope.suggestWikidata = function(val, i) {
		$scope.loading = true;

		 return api.search(val, $scope.language).then(function(res){
		 	
		 	var ids = [];
		 	angular.forEach(res.data.search, function(item){
		 		ids.push(item.id);
		 	});
		 	
			return api.descriptions(ids.join('|'), $scope.language).then(function(res2) {
		 		var labels = [];
		 		angular.forEach(res2.data.entities, function(item){
		 			
		 			var label, description;

		 			if (item.labels[$scope.language] === undefined)
		 				label = '(aucun label)';
		 			else
		 				label = item.labels[$scope.language].value;

		 			if (item.descriptions[$scope.language] === undefined)
		 				description = '(aucune description)';
		 			else
		 				description = item.descriptions[$scope.language].value;

					labels.push({
						label:       label,
						id:          item.id,
						description: description,
						display:     label + "<br>" + description,
						index:       i
					});
		 		});
		 		$scope.loading = false;
				return labels;
		 	});

		});
	}
	
	$scope.onSelectLine = function (property, index, item, radio=false) {
		item.display = item.label;
		
		$scope.data[property].data[index].value = item.id;
		$scope.data[property].data[index].label = item.label;
		$scope.data[property].data[index].description = item.description;
		
		if(radio) {
			$scope.data[property].data[index].value = item.id;
			$scope.data[property].data[index].text  = item.label;
			$scope.data[property].data[index].other = true;
			$scope.data[property].data[index].othervalue = item.id;
			$scope.data[property].data[index].othertext = item.label;
		}
		
		$scope.updateQuickStatements();
	}
	
	$scope.convertDate = function(date, precision) {
		var s = '';

		var plus = true;
		if (date.substr(0,1) == "-") {
			plus = false;
			date = date.substr(1,1000);							
		}
		var date = date.split("-");
		var year = date[0];
		while (year.length < 4)
			year = "0" + year;

		var month = date[1];
		if (typeof month === 'undefined' || month =='')
			month = "1";
		if (month.length == 1)
			month = "0"+month;

		var day = date[2];
		if (typeof day === 'undefined' || day =='')
			day = "1";
		if (day.length == 1)
			day = "0"+day;

		if (plus)
			s = "+";
		else
			s = "-";
							
		s += year + "-" + month + "-" + day + "T00:00:00Z/" + precision;
		
		return s;
	}
	
	$scope.updateQuickStatements = function () {
		
		$scope.quickStatements = '';
		
		angular.forEach($scope.data, function(property) {
			
			angular.forEach(property.data, function(data) {
				if ((typeof data.disabled === 'undefined' || !data.disabled) && typeof data.value !== 'undefined' && data.value != '' && !(property.header && typeof data.language === 'undefined') && !(typeof data.database !=='undefined' && data.database == 1)) {
					if ($scope.wikidata_id)
						$scope.quickStatements += $scope.wikidata_id;
					else
						$scope.quickStatements += "LAST";
					$scope.quickStatements += "\t";
					
					if (property.property == 'P180' && data.genre)
						$scope.quickStatements += 'P136';
					else if (property.property == 'P170' && data.attributed)
						$scope.quickStatements += 'P1773';
					else
						$scope.quickStatements += property.property;

					if (property.header)
						$scope.quickStatements += data.language;
					$scope.quickStatements += "\t";
				
					switch (property.type) {
						case 'date':
							$scope.quickStatements += $scope.convertDate(data.value, data.precision);

							if (data.circa)
								$scope.quickStatements += "\tP1480\tQ5727902" 
							if (data.presumably)
								$scope.quickStatements += "\tP1480\tQ18122778"
							if (data.latest)
								$scope.quickStatements += "\tP1326\t" + $scope.convertDate(data.latest, 9);
							if (data.earliest)
								$scope.quickStatements += "\tP1319\t" + $scope.convertDate(data.earliest, 9);

							break;

						case 'entity':
							$scope.quickStatements += data.value;
							break;

						case 'monolingual text':
						case 'text':
							$scope.quickStatements += "\"" + data.value + "\"";
							break;
					}
					
					if (property.property == 'P195') {
						angular.forEach($scope.data, function(p) {
							if (p.property == 'P217') {
								angular.forEach(p.data, function(d) {
									if (d.value)
										$scope.quickStatements += "\tP217\t\"" + d.value + "\"";
								});
							}
						});
					}

					if (property.property == 'P217') {
						angular.forEach($scope.data, function(p) {
							if (p.property == 'P195') {
								angular.forEach(p.data, function(d) {
									if (d.value)
										$scope.quickStatements += "\tP195\t" + d.value;
								});
							}
						});
					}
					
					if (property.property == 'P186' && data.surface)
						$scope.quickStatements += "\tP518\tQ861259";

					if (!property.header && property.property != 'P18')
						$scope.quickStatements += "\tS248\tQ809825";

					$scope.quickStatements += "\n";
				}

			});
			
			angular.forEach(property.subs, function(data) {
				if (typeof data.data !== 'undefined' && typeof data.data[0] !== 'undefined' && typeof data.data[0].value !== 'undefined' && data.data[0].value != '' && (data.type != 'quantity' || !isNaN(data.data[0].value))) {

					if ($scope.wikidata_id)
						$scope.quickStatements += $scope.wikidata_id;
					else
						$scope.quickStatements += "LAST";
					$scope.quickStatements += "\t" + data.property + "\t";
					
					switch (data.type) {
						case 'quantity':
							$scope.quickStatements += data.data[0].value;
							break;

						case 'text':
							$scope.quickStatements += "\"" + data.data[0].value + "\"";
							break;
					}
					
					$scope.quickStatements += "\tS248\tQ809825\n";

				}

			});
		});
		
		if ($scope.quickStatements != '') {
			if (!$scope.wikidata_id)
				$scope.quickStatements = "CREATE\n" + $scope.quickStatements;
			
			if ($scope.current_joconde_id) {
				if ($scope.wikidata_id)
					$scope.quickStatements += $scope.wikidata_id;
				else
					$scope.quickStatements += "LAST";
				$scope.quickStatements += "\tP347\t\""+$scope.current_joconde_id+"\"";
			}
		}

	}
	
	$scope.init = function () {

		$scope.data = [];		

		//-- get url parameters		
		qs = document.location.search;
		qs = qs.split('+').join(' ');
		var params = {},
				tokens,
				re = /[?&]?([^=]+)=([^&]*)/g;

		while (tokens = re.exec(qs))
			params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
		
		//-- check joconde_id
		if (params['joconde_id']) {
			
			$scope.joconde_id = params['joconde_id'];
			$scope.current_joconde_id = $scope.joconde_id;
			
			angular.forEach(STRUCTURE, function(property) {
				data = JSON.parse(JSON.stringify(property));
				data.data = [];
				angular.forEach(data.subs, function(sub) {
					sub.data = [{
						value:'',
						disabled:false
					}];
				});
			
				if (typeof data.default !== 'undefined') {
					angular.forEach(data.default, function(item) {
						data.data.push(JSON.parse(JSON.stringify(item)));
					});
				}

				$scope.data.push(data);
			});
		
			$http.get('includes/api.php?joconde_id='+$scope.joconde_id)
				.success(function(api_data) {
					
					angular.forEach($scope.data, function(data) {

						switch(data.property) {

							case 'L':
								if (api_data.title_fr) {
									data.data.push({
										language: 'fr',
										value: api_data.title_fr
									});
								}
								break;
								
							case 'P170':
							case 'P31':
							case 'P186':
							case 'P195':
							case 'P180':
								var entry;
								switch (data.property) {
									case 'P170':
										entry = api_data.creator;
										break;
									case 'P31':
										entry = api_data.type;
										break;
									case 'P186':
										entry = api_data.material;
										break;
									case 'P195':
										entry = api_data.collection;
										break;
									case 'P180':
										entry = api_data.subject;
										break;
								}
								angular.forEach(entry, function(e) {
									var new_data = {
										text: e.text,
										input: e.input,
										original_value: e.wikidata,
										value: e.wikidata,
										description: e.description,
										attribute: e.attribute,
									};
									if (e.attribute == 'attribué à')
										new_data.attributed = true;
									if (e.surface == 1)
										new_data.surface = true;
									if (e.genre == 1)
										new_data.genre = true;
									data.data.push(new_data);
								});
								break;
								
							case 'P571':
								if (api_data.date) {
									data.data.push({
										value: api_data.date,
										precision: api_data.precision,
									});
								} else {
									data.data.push({
										precision: 9,
									});
								}
								break;
							
							case 'P217':
								angular.forEach(api_data.inventory, function(inventory) {
									data.data.push({
										value: inventory.text,
									});
								});
								break;

						}
						
						angular.forEach(data.subs, function(sub) {
							switch(sub.property) {

								case 'P2048':
									if (api_data.height) {
										sub.data[0].value = api_data.height;
									}
									break;

							}
						});
						
					});
					
					//-- check if joconde ID already used on Wikidata
					$scope.wikidata_id = '';
					
					api.checkIdJocondeOnWikidata($scope.joconde_id).then(function(res){
						
						angular.forEach(res.results.bindings, function(item) {
							$scope.wikidata_id = item.item.value.replace('http://www.wikidata.org/entity/', '');
						});
						
						if ($scope.wikidata_id != '') {
							
							api.entity($scope.wikidata_id).then(function(res) {

								$scope.mergeJocondeAndWikidata(res.data.entities[$scope.wikidata_id]);
								$scope.updateQuickStatements();
								
							});
							
						}

						$scope.updateQuickStatements();

					});

				})
				.error(function(api_data) {
					console.log('Error: ' + api_data);
				});

			$scope.updateQuickStatements();
		
		}

	}
	
	$scope.mergeJocondeAndWikidata = function(entity) {
		
		//console.log(entity);
		//console.log($scope.data);
				
		//-- Labels				
		current_labels = $scope.getDataProperty('L');
		
		angular.forEach(entity.labels, function(label) {
			
			//-- label in french
			if (label.language == 'fr') {

				//-- disable current french title
				current_labels.data[0].disabled = true;

				if (label.value != current_labels.data[0].value) {
					//-- Wikidata label not the same as Joconde title

					//-- Place Joconde title as an alias
					current_aliases = $scope.getDataProperty('A');
					current_aliases.data.push({
						language: 'fr',
						value: current_labels.data[0].value,
					});
					
					//-- Update french label
					current_labels.data[0].value = label.value;
				}

			} else
				//-- add label
				current_labels.data.push({
					language: label.language,
					value: label.value,
					disabled:true,
				});
		});

		//-- Descriptions
		current_descriptions = $scope.getDataProperty('D');
		
		angular.forEach(entity.descriptions, function(description) {
			//-- add description
			current_descriptions.data.push({
				language: description.language,
				value: description.value,
				disabled:true,
			});
		});
		
		//-- Claims
		angular.forEach(entity.claims, function(claim, property_id) {

			var current_claim;
			
			if (property_id != 'P136')
				current_claim = $scope.getDataProperty(property_id);
			else
				current_claim = $scope.getDataProperty('P180');
			if (property_id == 'P571')
				console.log(current_claim, claim);
			angular.forEach(claim, function(claim_wikidata) {
			
				var found = false;
				angular.forEach(current_claim.data, function(claim_joconde) {
					switch (current_claim.type) {
						case 'entity':
							if (claim_joconde.value == claim_wikidata.mainsnak.datavalue.value.id) {
								claim_joconde.disabled = true;
								found = true;
							}
							break;
						case 'file':
						case 'text':
							if (claim_joconde.value == claim_wikidata.mainsnak.datavalue.value) {
								claim_joconde.disabled = true;
								found = true;
							}
							break;
							
						case 'quantity':
							if (claim_joconde.value == parseFloat(claim_wikidata.mainsnak.datavalue.amout)) {
								claim_joconde.disabled = true;
								found = true;
							}
							break;
							
						case 'date':
							if (claim_joconde.value == claim_wikidata.mainsnak.datavalue.time) {
								claim_joconde.disabled = true;
								found = true;
							}
							break;
					}
				});

				if (!found) {
					
					var new_claim = '';
					
					switch (current_claim.type) {
						case 'entity':
							api.entity(claim_wikidata.mainsnak.datavalue.value.id).then(function(res) {

								new_data = res.data.entities[claim_wikidata.mainsnak.datavalue.value.id];

								if (typeof new_data.labels.fr !== 'undefined')
									new_label = new_data.labels.fr.value;
								else
									new_label = '(aucun label)'

								if (typeof new_data.descriptions.fr !== 'undefined')
									new_description = new_data.descriptions.fr.value;
								else
									new_description = '(aucune description)'

								new_claim = {
									'description' : new_description,
									'text' : new_label,
									'value' : claim_wikidata.mainsnak.datavalue.value.id,
									'disabled' : true,
								};
								if (current_claim.multiple)
									current_claim.data.push(new_claim);
								else
								current_claim.data[0] = new_claim;

							});

							break;
						case 'file':
						case 'text':
							
							new_text = {
								'value' : claim_wikidata.mainsnak.datavalue.value,
								'disabled' : true,
							};

							if (typeof current_claim.multiple !== 'undefined' && current_claim.multiple && typeof current_claim.data !== 'undefined')
								current_claim.data.push(new_text);
							else {
								if (typeof current_claim.data === 'undefined')
									current_claim.data = [];
								current_claim.data[0] = new_text;
							}
						
							break;
							
						case 'quantity':
						
							new_quantity = {
								'value' : parseFloat(claim_wikidata.mainsnak.datavalue.value.amount),
								'disabled' : true,
							};

							if (typeof current_claim.multiple !== 'undefined' && current_claim.multiple && typeof current_claim.data !== 'undefined')
								current_claim.data.push(new_quantity);
							else {
								if (typeof current_claim.data === 'undefined')
									current_claim.data = [];
								current_claim.data[0] = new_quantity;
							}
							
							break;
							
						case 'date':
						
							new_date = {
								'value' : claim_wikidata.mainsnak.datavalue.value.time,
								'precision' : claim_wikidata.mainsnak.datavalue.value.precision,
								'disabled' : true,
							};

							if (typeof current_claim.multiple !== 'undefined' && current_claim.multiple && typeof current_claim.data !== 'undefined')
								current_claim.data.push(new_date);
							else {
								if (typeof current_claim.data === 'undefined')
									current_claim.data = [];
								current_claim.data[0] = new_date;
							}
							
							break;
					}

				}

			});

		});

	}
	
	$scope.getDataProperty = function(property_id) {
		
		var property = {};
		
		angular.forEach($scope.data, function(data) {
			if (data.property == property_id)
				property = data;
				
			angular.forEach(data.subs, function(sub) {
				if (sub.property == property_id)
					property = sub;
			});
		});

		return property;
	}
	
	$scope.submitQS = function() {

		  angular.forEach($scope.data, function (property) {
		  	if (property.type == 'entity') {
			  	angular.forEach(property.data, function (data) {
			  		if (data.value && data.input) {
			  			
			  			var type;
			  			switch(property.property) {
			  				case 'P195':
			  					type = 'collection';
			  					break;
			  				case 'P186':
			  					type = 'material';
			  					break;
			  				case 'P180':
			  					type = 'subject';
			  					break;
			  				case 'P31':
			  					type = 'type';
			  					break;
			  				case 'P170':
			  					type = 'creator';
			  					break;
			  			}
			  			api.checkDatabase(type, data.input).then(function (value) {
			  				if (typeof data.database === 'undefined' || data.database == 0) {

			  					//-- add to database
				  				if (!value.data) {
				  					var genre = (typeof data.genre !== 'undefined' && data.genre);
				  					var surface = (typeof data.surface !== 'undefined' && data.surface);
						  			api.addDatabase(
								  		type,
									  	data.input,
									  	data.label,
											data.description,
											data.value,
											surface,
											genre);
									}
									
								} else if (data.database == 1) {

			  					//-- delete in database
			  					if (value.data) {
			  						api.deleteDatabase(value.data.id);
			  					}

								} else if (data.database == 2) {

			  					//-- replace in database
			  					if (value.data) {
			  						api.deleteDatabase(value.data.id);
				  					var genre = (typeof data.genre !== 'undefined' && data.genre);
				  					var surface = (typeof data.surface !== 'undefined' && data.surface);
						  			api.addDatabase(
								  		type,
									  	data.input,
									  	data.label,
											data.description,
											data.value,
											surface,
											genre);
			  					}

								}

			  			});
			  		}
			  	});
			  }
			});
			
  }
  
  $scope.databaseMenu = function(property, element, index) {
		$scope.data[property].data[element].database = index;
		$scope.updateQuickStatements();
	}
	
});
