/**
 * Structure
 **/

app.value('STRUCTURE', [
	{
		title:		'Titre',
		type:			'monolingual text',
		property:	'L',
		multiple:	true,
		visible:	true,
		header:		true,
	},{
		title:		'Description',
		type:			'monolingual text',
		property:	'D',
		multiple:	true,
		visible:	true,
		header:		true,
	},{
		title:		'Alias',
		type:			'monolingual text',
		property:	'A',
		multiple:	true,
		visible:	true,
		header:		true,
	},{
		title:		'Créateur',
		type:			'entity',
		property:	'P170',
		multiple:	true,
		visible:	true,
	},{
		title:		'Type d\'œuvre',
		type:			'entity',
		property:	'P31',
		multiple:	true,
		visible:	true,
	},{
		title:		'Date',
		type:			'date',
		property:	'P571',
		multiple:	false,
		visible:	true,
	},{
		title:		'Matériaux',
		type:			'entity',
		property:	'P186',
		multiple:	true,
		visible:	true,
	},{
		title:		'Collection',
		type:			'entity',
		property:	'P195',
		multiple:	false,
		visible:	true,
	},{
		title:		'Numéro d\'inventaire',
		type:			'text',
		property:	'P217',
		multiple:	true,
		visible:	true,
	},{
		title:		'Lieu',
		type:			'entity',
		property:	'P276',
		multiple:	true,
		visible:	true,
	},{
		title:		'Basé sur',
		type:			'entity',
		property:	'P144',
		multiple:	true,
		visible:	true,
	},{
		title:		'Sujet de l\'œuvre',
		type:			'entity',
		property:	'P921',
		multiple:	true,
		visible:	true,
	},{
		title:		'Dépeint',
		type:			'entity',
		property:	'P180',
		multiple:	true,
		visible:	true,
	},{
		title:		'Dimensions',
		multiple:	false,
		visible:	true,
		subs: [
			{
				title:		'Hauteur',
				type:			'quantity',
				property:	'P2048',
				multiple:	false,
			},{
				title:		'Largeur',
				type:			'quantity',
				property:	'P2049',
				multiple:	false,
			},{
				title:		'Épaisseur',
				type:			'quantity',
				property:	'P2610',
				multiple:	false,
			},{
				title:		'Longueur',
				type:			'quantity',
				property:	'P2043',
				multiple:	false,
			},{
				title:		'Diamètre',
				type:			'quantity',
				property:	'P2386',
				multiple:	false,
			},{
				title:		'Surface',
				type:			'quantity',
				property:	'P2046',
				multiple:	false,
			},
		],
	},{
		title:		'Divers',
		multiple:	false,
		visible:	true,
		subs: [
			{
				title:		'Décrit à l\'url',
				type:			'text',
				property:	'P973',
				multiple:	false,
			},{
				title:		'Atlas ID',
				type:			'text',
				property:	'P1212',
				multiple:	false,
			},{
				title:		'Category Commons',
				type:			'text',
				property:	'P373',
				multiple:	false,
			},{
				title:		'Image',
				type:			'file',
				property:	'P18',
				multiple:	false,
			},
		]
	}
]);
