'use strict';

var color = {
	
	shortHex: function(hex) {
		if(hex % 17 > 7) {
			hex = 17 + hex - hex % 17;
		} else {
			hex = hex - hex % 17;
		}
		return ('' + hex.toString(16)).slice(0, 1);
	},

	expandedHex: function(hex) {
		var result = '#';
		for(var i = 1; i < hex.length; ++i) {
			result += hex[i] + hex[i];
		}
		return result;
	},

	rgbaToHex: function(rgba) {
		// for some reason weird numbers are arriving here, rounding them to play safe for the time being
		rgba.r = Math.round(rgba.r);
		rgba.g = Math.round(rgba.g);
		rgba.b = Math.round(rgba.b);
		rgba.a = Math.round(rgba.a);
		if (rgba.r > 255 || rgba.g > 255 || rgba.b > 255 || rgba.a > 255) {
			throw 'Invalid color component';
		}
		rgba = color.alphaCheck(rgba);
		var result = '#';		
		result += rgba.r.toString(16).padStart(2, "0");
		result += rgba.g.toString(16).padStart(2, "0");
		result += rgba.b.toString(16).padStart(2, "0");
		if(rgba.a < 255) {
			result += rgba.a.toString(16).padStart(2, "0");
		}
		return result.toUpperCase();
	},

	rgbaToHexShort: function(rgba) {
		rgba = color.alphaCheck(rgba);
		var result = '';
		rgba.r = color.shortHex(rgba.r);
		rgba.g = color.shortHex(rgba.g);
		rgba.b = color.shortHex(rgba.b);
		rgba.a = color.shortHex(rgba.a);
		if(rgba.a !== 'f') {
			return ("#" + rgba.r + rgba.g + rgba.b + rgba.a).toUpperCase();
		}
		return ("#" + rgba.r + rgba.g + rgba.b).toUpperCase();
	},
	
	hexToRgba: function(hex) {
		var trimmed = hex.replace(/^#/, '');
		var rgba = {
			r: 0,
			g: 0,
			b: 0,
			a: 255,
		}
		if([3, 4, 6, 8].indexOf(trimmed.length) == -1) {
			return rgba;
		}
		var expanded = trimmed;
		if(trimmed.length < 6) {
			expanded = '';
			for(var i = 0; i < trimmed.length; ++i) {
				expanded += '' + trimmed[i] + trimmed[i];
			}
		}
		rgba.r = parseInt(expanded.substr(0, 2), 16);
		rgba.g = parseInt(expanded.substr(2, 2), 16);
		rgba.b = parseInt(expanded.substr(4, 2), 16);
		if(expanded.length == 8) {			
			rgba.a = parseInt(expanded.substr(6, 2), 16);
		}
		return color.alphaCheck(rgba);
	},
	
	alphaCheck: function(rgba) {
		if(rgba.a == 0) {
			rgba.r = rgba.g = rgba.b = rgba.a;
		}
		return rgba;
	}
	
};

