'use strict';

var creatiVersion = '3.0';

var settings = [

	// containers

	{
		tagname: 'div',
		attributes: {
			'id': 'basicSettings',
			'class': 'settingsContainer',
		},
		noWrapper: true,
		html: '<small>Basic Settings</small>',
		parent: '#interface',
	},
	{
		tagname: 'div',
		attributes: {
			'id': 'mediumSettings',
			'class': 'settingsContainer',
		},
		noWrapper: true,
		html: '<small>Medium Settings</small>',
		parent: '#interface',
	},
	{
		tagname: 'div',
		attributes: {
			'id': 'advancedSettings',
			'class': 'settingsContainer',
		},
		noWrapper: true,
		html: '<small>Advanced Settings</small>',
		parent: '#interface',
	},

	{
		tagname: 'div',
		attributes: {
			'id': 'insaneSettings',
			'class': 'settingsContainer',
		},
		noWrapper: true,
		html: '<small>Insane Settings</small>',
		parent: '#interface',
	},
	
	// basic settings
	
	{
		tagname: 'select',
		attributes: {
			id: 'settingsMode',
			title: 'all settings are active and will remember their values regardless of being hidden or not',
		},
		label: 'Settings mode',
		options: {
			'1': 'Basic',
			'2': 'Medium',
			'3': 'Advanced',
			'4': 'Insane',
		},
		parent: 'basicSettings',
		label: 'Settings Mode',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'shortCodes',
			type: 'checkbox',
			title: 'always use short color codes to help reducing the code size; this setting can alter the colors of your image; short color codes will be used anyway if they match the long color codes',
		},
		icon: 'img/shortcodes.png',
		label: 'Short codes',
		parent: 'basicSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'grayScale',
			type: 'checkbox',
			title: 'convert the image to shades of gray',
		},
		icon: 'img/grayscale.png',
		label: 'Grayscale',
		parent: 'basicSettings',
	},


	
	// medium settings
	
	{
		tagname: 'input',
		attributes: {
			id: 'slices',
			type: 'number',
			min: '1',
			max: '64',
			step: '1',
			value: '1',
			title: 'range 1 ~ 64; number of horizontal slices / arc signs, larger values provide better resolution',
		},
		icon: 'img/slices.png',
		label: 'Slices',
		parent: 'mediumSettings',
	},
	{
		tagname: 'select',
		attributes: {
			id: 'disposition',
			title: 'V and H dispositions are limited to 17 slices; you need an <offset> of -8 to use 17 V slices; you need a <zoffset> of -8 to use 17 H slices; the GRID disposition allows up to 64 slices',
		},
		options: {
			grid: 'GRID (Horizontal + Vertical)',
			horizontal: 'H (Horizontal)',
			vertical: 'V (Vertical)',
		},
		icon: 'img/disposition.png',
		label: 'Sign disposition',
		parent: 'mediumSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'size',
			type: 'number',
			value: '2',
			step: '0.1',
			title: 'change this value to "zoom" your image; with the default settings a pixel of size 1 will have a width slightly smaller than 1% of a block\'s width; mileage varies changing font and characters',
		},
		unit: 'points',
		icon: 'img/size.png',
		label: '<size> tag',
		parent: 'mediumSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'offset',
			type: 'number',
			step: '0.01',
			min: '-8',
			max: '8',
			value: '2',
			title: 'defaults to about 0.55 in the game when omitted (positive values bring upwards, negative values bring downwards)',
		},
		label: '<offset> tag',
		unit: 'blocks',
		icon: 'img/offset.png',
		parent: 'mediumSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'zoffset',
			type: 'number',
			step: '0.01',
			min: '-8',
			max: '8',
			value: '0',
			title: 'defaults to zero in the game when omitted and results in the graphic placed on the vertical of the arc sign (positive values bring forward, negative values bring backwards)',
		},
		unit: 'blocks',
		icon: 'img/zoffset.png',
		label: '<zoffset> tag',
		parent: 'mediumSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'indent',
			type: 'number',
			value: '0',
			step: '0.01',
			title: 'indentation is an horizontal spacing applied to the beginning of each line (negative values bring leftwards, positive values bring rightwards)',
		},
		unit: 'blocks',
		icon: 'img/indent.png',
		label: '<indent> tag',
		parent: 'mediumSettings',
	},
	
	
	// advanced settings

	{
		tagname: 'input',
		attributes: {
			id: 'autoSize',
			type: 'checkbox',
			checked: 'checked',
			title: 'resize the image to fit it into the available slices, this may upscale and blur the image',
		},
		label: 'Autosize',
		icon: 'img/autosize.png',
		parent: 'advancedSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'width',
			type: 'number',
			min: '0',
			max: '8',
			value: '8',
			step: '0.1',
			title: 'maximum amount of blocks the sign is allowed to grow horizontally before wrapping lines',
		},
		unit: 'blocks',
		label: '<width> tag',
		icon: 'img/width.png',
		parent: 'advancedSettings',
	},
	{
		tagname: 'select',
		attributes: {
			id: 'align',
			title: 'align to the limit set by the <width> tag',
		},
		options: {
			'': 'center',
			'left': 'left',
			'right': 'right',
		},
		label: '<align> tag',
		icon: 'img/align.png',
		parent: 'advancedSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'decimals',
			type: 'number',
			value: '3',
			min: '0',
			title: 'number of decimals for number rounding',
		},
		icon: 'img/decimals.png',
		label: 'Decimals',
		parent: 'advancedSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'gammaCorrection',
			type: 'number',
			min: '0.01',
			max: '7.99',
			value: '0.5',
			step: '0.01',
			title: 'range 0.01 ~ 7.99, preset to 0.5 to work around the current deviation of RGB shades, set this to 1 to disable gamma correction altogether',
		},
		icon: 'img/gammacorrection.png',
		label: 'Gamma Correction',
		parent: 'advancedSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'alphaCorrection',
			type: 'number',
			min: '0.01',
			max: '7.99',
			value: '1',
			step: '0.01',
			title: 'range 0.01 ~ 7.99, preset to 1 (disabled) to let you use it only if necessary',
		},
		icon: 'img/alphacorrection.png',
		label: 'Alpha Correction',
		parent: 'advancedSettings',
	},
	
	// insane settings
	{
		tagname: 'input',
		attributes: {
			id: 'mainSpacing',
			type: 'number',
			value: '-10',	
			title: 'values higher than -10% start to show the spacing grid between pixels, the higher the value, the larger the horizontal spacing',
		},
		unit: '%',
		icon: 'img/mainspacing.png',
		label: 'Main spacing',
		parent: 'insaneSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'verticalSpacing',
			type: 'number',
			value: '100',
			title: '100% gives equal spacing in both directions, 200% doubles the vertical spacing, 50% halves it and so forth',
		},
		unit: '%',
		icon: 'img/verticalspacing.png',
		label: 'Vertical spacing',
		parent: 'insaneSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'vError',
			type: 'number',
			value: '1',
			title: 'correction applied to the <offset> when multiplying <line-height> by the total number of lines in previous slices',
		},
		unit: '%',
		label: 'Vertical Error Correction',
		parent: 'insaneSettings',
	},
	{
		tagname: 'select',
		attributes: {
			id: 'fontName',
			title: 'the "Arial SDF" font provides fully opaque characters without any outline, the "default" font is the semiopaque, outlined font used normally by all signs, didn\'t really fiddle with the other fonts',
		},
		options: {
			'Arial SDF': 'Arial SDF',
			'default': 'Default',
			'LiberationSans SDF': 'LiberationSans SDF',
			'SourceHanSerifSC-Bold SDF': 'SourceHanSerifSC-Bold SDF',
			'SourceHanSerifSC-Regular SDF': 'SourceHanSerifSC-Regular SDF',
		},
		label: 'Font name',
		parent: 'insaneSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'characters',
			type: 'text',
			value: '.',
			title: 'whatever you type here will be repeated for each pixel of the image',
		},
		label: 'Character(s)',
		parent: 'insaneSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'charLimit',
			type: 'number',
			value: '10000',
			title: 'maximum amount of characters allowed in a single sign',
		},
		label: 'Character limit',
		parent: 'insaneSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'freeIncipit',
			type: 'text',
			value: '',
			title: 'free text to be inserted at the beginning of each textarea',
		},
		label: 'Free text prefix',
		parent: 'insaneSettings',
	},

	{
		tagname: 'input',
		attributes: {
			id: '',
			type: '',
			title: '',
		},
		label: '',
		parent: '',
	},
];

