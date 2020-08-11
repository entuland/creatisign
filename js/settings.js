'use strict';

var creatisign_settings_version = '3.4.2';

var settings = [

	// containers

	{
		tagname: 'div',
		attributes: {
			'id': 'basicSettings',
			'class': 'settingsContainer',
		},
		noWrapper: true,
		html: '<h2>Generation Settings</h2><small>Basic Settings</small>',
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
			title: 'All settings are active and will remember their values regardless of being hidden or not.',
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
			title: 'Use short color codes to help reducing the code size.\nThis setting can alter the colors of your image.\nShort color codes will be used anyway if they match the long color codes.',
		},
		icon: imgsrc['shortcodes.png'],
		label: 'Short codes',
		parent: 'basicSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'grayScale',
			type: 'checkbox',
			title: 'Convert the image to shades of gray.',
		},
		icon: imgsrc['grayscale.png'],
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
			title: 'Range 1 ~ 64\nNumber of horizontal slices / arc signs.\nLarger values provide better resolution.',
		},
		icon: imgsrc['slices.png'],
		label: 'Slices',
		parent: 'mediumSettings',
	},
	{
		tagname: 'select',
		attributes: {
			id: 'disposition',
			title: 'V and H dispositions are limited to 17 slices.\nYou need an <offset> of -8 to use 17 V slices.\nYou need a <zoffset> of -8 to use 17 H slices\nThe GRID disposition allows up to 64 slices\nAnytime you move signs manually you go into Free Placement mode and will need to add / remove signs one by one in the placement interface (bottom right).',
		},
		options: {
			grid: 'GRID (Horizontal + Vertical)',
			gridRight: 'GRID RIGHT',
			gridBottom: 'GRID BOTTOM',
			horizontal: 'H (Horizontal)',
			horizontalCentered: 'HC (Horizontal Centered)',
			vertical: 'V (Vertical)',
			verticalCentered: 'VC (Vertical Centered)',
			free: 'Free placement',
		},
		icon: imgsrc['disposition.png'],
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
			title: 'Change this value to "zoom" your image in or out.\nA pixel of size 1 will have a width slightly smaller than 1% of a block\'s width.\nActual perceived size depends on spacing, font and characters.',
		},
		unit: 'points',
		icon: imgsrc['size.png'],
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
			title: 'Defaults to about 0.55 in the game when omitted.\nPositive values bring upwards, negative values bring downwards.',
		},
		label: '<offset> tag',
		unit: 'blocks',
		icon: imgsrc['offset.png'],
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
			title: 'Defaults to zero in the game when omitted and results in the graphic placed on the vertical of the arc sign.\nPositive values bring forward, negative values bring backwards.\nSticking images to the side of a full block requires values near a half unit (for instance, 0.51, 1.5, -2.49 and so forth, depends on the desired setup).',
		},
		unit: 'blocks',
		icon: imgsrc['zoffset.png'],
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
			title: 'Indent is a horizontal spacing applied to the beginning of each line.\nNegative values bring leftwards, positive values bring rightwards.\nDouble the values for CENTER alignment.\nThis setting is pretty much useless with RIGHT alignment.',
		},
		unit: 'blocks',
		icon: imgsrc['indent.png'],
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
			title: 'Resize the image to fit it into the available slices.\nThis option may upscale and blur the image.',
		},
		label: 'Autosize',
		icon: imgsrc['autosize.png'],
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
			title: 'Maximum amount of blocks the sign is allowed to grow horizontally before wrapping lines.\nThis space is centered on the middle of the arc sign.',
		},
		unit: 'blocks',
		label: '<width> tag',
		icon: imgsrc['width.png'],
		parent: 'advancedSettings',
	},
	{
		tagname: 'select',
		attributes: {
			id: 'align',
			title: 'LEFT and RIGHT align refer to the limits set by the <width> tag.',
		},
		options: {
			'': 'center',
			'left': 'left',
			'right': 'right',
		},
		label: '<align> tag',
		icon: imgsrc['align.png'],
		parent: 'advancedSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'decimals',
			type: 'number',
			value: '3',
			min: '0',
			title: 'Number of decimals for number rounding.',
		},
		icon: imgsrc['decimals.png'],
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
			title: 'Range 0.01 ~ 7.99, preset to 0.5 to work around the current deviation of RGB shades.\nSet this to 1 to disable gamma correction altogether.',
		},
		icon: imgsrc['gammacorrection.png'],
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
			title: 'Range 0.01 ~ 7.99, defaults to 1 (disabled), only useful for art heavily relying on alpha gradients.',
		},
		icon: imgsrc['alphacorrection.png'],
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
			title: 'Values higher than -10% (such as -5%) start to show the spacing grid between pixels.\nThe higher the value, the larger the spacing.\nValues lower than 10% cause overlapping but give higher quality from a distance.',
		},
		unit: '%',
		icon: imgsrc['mainspacing.png'],
		label: 'Main spacing',
		parent: 'insaneSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'verticalSpacing',
			type: 'number',
			value: '100',
			title: '100% gives equal spacing in both directions, 200% doubles the vertical spacing, 50% halves it and so forth.',
		},
		unit: '%',
		icon: imgsrc['verticalspacing.png'],
		label: 'Vertical spacing',
		parent: 'insaneSettings',
	},
	{
		tagname: 'input',
		attributes: {
			id: 'vError',
			type: 'number',
			value: '1',
			title: 'Correction applied to the <offset> when multiplying <line-height> by the total number of lines in previous slices.\nOnly change this if you intimately know what this settings does and why.',
		},
		unit: '%',
		label: 'Vertical Error Correction',
		parent: 'insaneSettings',
	},
	{
		tagname: 'select',
		attributes: {
			id: 'fontName',
			title: 'The "Arial SDF" font provides fully opaque characters without any outline.\nThe "default" font is the semiopaque, outlined font used normally by all signs.\nDidn\'t really fiddle with the other fonts, use them at your own risk.',
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
			title: 'Defaults to a single "period / full stop" character.\nWhatever you type here will be repeated for each pixel of the image.',
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
			title: 'Maximum amount of characters allowed in a single sign.\nThis is only used to decide how to slice the image in this web tool, the actual limit is imposed by the game.',
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
			title: 'Free text to be inserted at the beginning of each textarea.\nIt\'s meant for custom tags, not for readable text.',
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

