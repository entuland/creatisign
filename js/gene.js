'use strict';

var gene = {
	zoffset_min: -8,
	zoffset_max: 8,
	offset_min: -8,
	offset_max: 8,

	init: function() {	
		gene.reader = new FileReader();
		gene.source = false;
		gene.reader.addEventListener("load", function () {
			gene.source = new Image;
			gene.source.src = gene.reader.result;
			inter.els.sourcePreview.src = gene.source.src;
		}, false);
		inter.els.fileSelector.addEventListener('change', gene.loadsource);
		
		gene.attachPlacementPreview();
		gene.computePlacement();
		
		inter.els.executeButton.addEventListener('click', gene.execute);
	},
	
	attachPlacementPreview: function() {
		inter.els.offset.addEventListener('change', gene.computeDeferredPlacement);
		inter.els.zoffset.addEventListener('change', gene.computeDeferredPlacement);
		inter.els.slices.addEventListener('change', gene.computeDeferredPlacement);
		inter.els.disposition.addEventListener('change', gene.computeDeferredPlacement);
	},
	
	computeDeferredPlacement: function() {
		gene.placement_timeout = false;
		if(gene.placement_timeout) {
			clearTimeout(gene.placement_timeout);
		}
		
		gene.placement_timeout = setTimeout(gene.computePlacement, 250);
	},
	
	computePlacement: function() {
		var old = document.querySelector('#greendot');
		var oldheight = 0;
		if(old) {
			oldheight = old.style.height;
		}
		inter.els.placement.innerHTML = '';
		gene.greendot = document.createElement('div');
		gene.greendot.title = 'Top/extension of the resulting graphic (approx)';
		gene.greendot.classList.add('greendot');
		gene.greendot.setAttribute('id', 'greendot');
		inter.els.placement.appendChild(gene.greendot);
		var offset = parseFloat(inter.els.offset.value);
		var zoffset = parseFloat(inter.els.zoffset.value);
		var slices = parseInt(inter.els.slices.value);
		var disposition = inter.els.disposition.value;
		var side = Math.ceil(Math.sqrt(slices));
		var row = 0;
		var currow = 0;
		var col = 0;
		var curoffset = 0;
		var curzoffset = 0;

		function computeLimits(delta) {
			curoffset = offset;
			curzoffset = zoffset;
			if(disposition == 'vertical') {
				row = delta;
				curoffset += delta;
			}
			
			if(disposition == 'horizontal') {
				col = delta;
				curzoffset += delta;
			}
			
			if(disposition == 'grid') {
				col = delta % side;
				row = Math.floor(delta / side);
				curzoffset += col;
				curoffset += row;
			}
		}
		
		for(var delta = 0; delta < slices; ++delta) {
			var sign = document.createElement('div');
			sign.classList.add('sign');
			currow = row
			computeLimits(delta);
			if(
				curoffset < gene.offset_min 
				|| curoffset > gene.offset_max
			) {
				sign.classList.add('error');
				sign.title += 'offset out of range; ';
			}			
			if(
				curzoffset < gene.zoffset_min 
				|| curzoffset > gene.zoffset_max
			) {
				sign.classList.add('error');
				sign.title += 'zoffset out of range; ';
			}			
			sign.innerText = delta + 1;
			if(row > currow) {
				inter.els.placement.appendChild(document.createElement('br'));
			}
			inter.els.placement.appendChild(sign);
		}
		
		gene.greendot.style.left = '' + ((zoffset - 0.5) * -2) + 'em'
		gene.greendot.style.top = '' + (offset * -2) + 'em'
		if(oldheight) {
			gene.greendot.style.height = oldheight;
		}
	},
	
	loadsource: function() {
		var file = inter.els.fileSelector.files[0];
		if(file) {
			gene.reader.readAsDataURL(file);
		}
	},
	
	execute: function() {
		inter.els.cover.style.display = 'block';
		setTimeout(function() {
			gene.preparation();
			gene.processSlices();
			gene.showErrors();
			inter.els.cover.style.display = 'none';
		}, 100);
	},
	
	preparation: function() {
		gene.errors = [];
		inter.els.errorMessages.innerText = '';
		inter.els.textareas.innerText = '';
		gene.gammaCorrection = 1 / parseFloat(inter.els.gammaCorrection.value);
		gene.alphaCorrection = 1 / parseFloat(inter.els.alphaCorrection.value);
		gene.useshort = inter.els.shortCodes.checked;
	},
	
	processSlices: 	function() {
		var slices = parseInt(inter.els.slices.value);
		if(slices < 1) {
			gene.errors.push('Invalid amount of slices');
			return;
		}
		var w = gene.source.width;
		var h = gene.source.height;
		if(!w || !h) {
			gene.errors.push('Invalid input image');
			return;
		}
		var result = false;
		var start = 0;
		var results = [];
		var delta = 0;
		
		function attemptOutput(w, h) {
			gene.errors = [];
			result = gene.generateOutput(w, h, start, delta, slices);
			if(gene.errors.length) {
				// got errors
				return false; // trigger exit from processSlices();
			}
			results.push(result);
			if(result.y == h) {
				// completed the picture
				return true; // trigger break from loop;
			}
			++delta;
			start = result.y;
		}
		
		var decide;
		var tw;
		var th;
		
		if(!inter.els.autoSize.checked) {
			for(var s = 0; s < slices; ++s) {
				decide = attemptOutput(w, h);
				if(decide === true) {
					// picture completed
					break;
				}
				if(decide === false) {
					// got errors
					return;
				}
			}
			if(result.y < h) {
				gene.errors.push('Image too large for this amount of slices');
				return;
			}
		} else {
			var ratio = h / w;
			for(tw = 10; /* no limit */ ; tw += 10) {
				// first pass, increase by 10 until run out of slices
				th = Math.round(tw * ratio);
				delta = 0;
				start = 0;
				results = [];
				var s;
				for(s = 0; s < slices; ++s) {
					decide = attemptOutput(tw, th);
					if(decide === true) {
						// picture completed
						break;
					}
					if(decide === false) {
						// got errors
						return;
					}
				}
				if(result.y < th && s == slices) {
					// run out of space
					break;
				}
			}
			var maxw = tw - 10;
			for(/* no init */; tw > maxw; --tw) {
				// second pass, decrease by 1 until NOT run out of slices
				var th = Math.round(tw * ratio);
				delta = 0;
				start = 0;
				results = [];
				var s;
				var completed = false;
				for(s = 0; s < slices; ++s) {
					decide = attemptOutput(tw, th);
					if(decide === true) {
						completed = true;
						break;
					}
					if(decide === false) {
						// got errors
						return;
					}
				}
				if(completed && s >= slices - 1) {
					// run out of space
					break;
				}
			}
		}
		gene.greendot.style.height = '' + (2 * result.h * result.intro.vspacing * 1.03) + 'em'; 
		for(var i in results) {
			gene.displayResult(results[i]);
		}			
	},
	
	displayResult: function(result) {
		var output = result.output;
		var w = result.w;
		var h = result.lines;
		var delta = result.delta;
		var col = result.col;
		var row = result.row;
		var container = document.createElement('div');
		inter.els.textareas.appendChild(container);
		container.innerHTML = '<hr><strong>Arc Sign #' + (delta + 1) + '</strong>, ';
		container.innerHTML += '' + output.length + ' chars, sizes (' + w + ', ' + h + ')';
		container.innerHTML += '<br>Place at row #' + row + ' and column #' + col;
		
		
		var textarea = document.createElement('textarea');
		var limit = parseInt(inter.els.charLimit.value);
		var notices = document.createElement('p');
		
		var errors = [];
		
		notices.classList.add('notices');
		
		if(output.length > limit) {
			errors.push('Character limit exceeded');
		}
		
		if(result.offset < gene.offset_min || result.offset > gene.offset_max) {
			errors.push('&lt;offset&gt; out of range');
		}
		
		if(result.zoffset < gene.zoffset_min || result.zoffset > gene.zoffset_max) {
			errors.push('&lt;zoffset&gt; out of range');
		}
		
		if(errors.length) {
			textarea.classList.add('error');
			notices.innerHTML += errors.join('<br>');
			container.appendChild(notices);
		}		
		
		container.appendChild(textarea);
		textarea.value = output;
		textarea.onfocus = function() {
			this.select();
		};
	},

	showErrors: function() {
		inter.els.errorMessages.innerHTML = gene.errors.join('<br>');
	},
	
	generateOutput: function(w, h, start, delta, slices) {
		if(start == 0) {
			gene.prepareCanvas(w, h);
		}
		var intro = gene.prepareCodeIntro();
		var output = intro.output;
		var m = new Array(h);
		var limit = parseInt(inter.els.charLimit.value);
		var y;
		var offs = {};
		var side = Math.ceil(Math.sqrt(slices));
		var curhex = '';
		var rgba = {};
		var imagedata = inter.els.resultctx.createImageData(1, 1);
		for(y = start; y < h; ++y) {
			m[y] = new Array(w);
			var line = '';
			for(var x = 0; x < w; ++x) {
				m[y][x] = gene.readPixel(x, y);
				if(!(x == 0 && y > start && m[y][x] === m[y-1][w-1]) && !(x > 0 && m[y][x] === m[y][x-1])) {
					// only set the color if it differs from the previous one
					curhex = m[y][x];
					line += '<' + curhex + '>';
				}
				line += inter.els.characters.value;
				rgba = color.hexToRgba(curhex);
				imagedata.data[0] = rgba.r;
				imagedata.data[1] = rgba.g;
				imagedata.data[2] = rgba.b;
				imagedata.data[3] = rgba.a;
				inter.els.resultctx.putImageData(imagedata, x, y);
			}
			offs = gene.prepareCodeOffsets(delta, side, y, intro);
			if(output.length + line.length + offs.output.length > limit) {
				offs = gene.prepareCodeOffsets(delta, side, y - 1, intro);
				break;
			}
			output += line + '\r\n';
		}
		return {
			output: offs.output + output.replace(/\r\n$/, ""),
			start: start,
			delta: delta,
			w: w,
			h: h,
			y: y,
			lines: y - start,
			col: offs.col,
			row: offs.row,
			offset: offs.offset,
			zoffset: offs.zoffset,
			side: side,
			intro: intro,
		};
	},
	
	prepareCanvas: function (w, h) {
		inter.els.working.width = w;
		inter.els.working.height = h;
		inter.els.workingctx.clearRect(0, 0, w, h);
		inter.els.workingctx.drawImage(gene.source, 0, 0, w, h);
		
		inter.els.result.width = w;
		inter.els.result.height = h;
		inter.els.resultctx.clearRect(0, 0, w, h);
	},
	
	prepareCodeIntro: function() {
		var verror = parseFloat(inter.els.vError.value);
		var offset = parseFloat(inter.els.offset.value);
		var disposition = inter.els.disposition.value;
		var indent = parseFloat(inter.els.indent.value);
		var size = parseFloat(inter.els.size.value);
		var width = parseFloat(inter.els.width.value);
		var zoffset = parseFloat(inter.els.zoffset.value);
		var tweak = parseInt(inter.els.mainSpacing.value);
		var vtweak = parseInt(inter.els.verticalSpacing.value);
		var decimals = parseInt(inter.els.decimals.value);
		var font = inter.els.fontName.value;

		var spacing = gene.round_number(size / 10000 * (100 + tweak), decimals);
		var vspacing = gene.round_number(spacing / 100 * vtweak, decimals);
		verror = 100 / (100 - verror);
		
		var output = '';
		
		var incipit = inter.els.freeIncipit.value;
		var align = inter.els.align.value;
		
		if(indent != 0) {
			output += '<indent=' + indent + '>';
		}
		
		if(align) {
			output += '<align=' + align + '>';
		}
		
		output += '<width=' + gene.round_number(width, decimals) + '>';
		
		output += '<font="' + font + '"><size=' + size +'><mspace=' + spacing + '><line-height=' + vspacing + '>';
		
		return {
			output: output,
			vspacing: vspacing,
			offset: offset,
			zoffset: zoffset,
			disposition: disposition,
			decimals: decimals,
			verror: verror,
			incipit: incipit,
		};
	},
	
	prepareCodeOffsets: function(delta, side, lines, intro) {
		var offset = intro.offset + 0.50 - intro.vspacing * 4.5 - lines * intro.vspacing * intro.verror;
		var zoffset = intro.zoffset;
		var col = 0;
		var row = 0;
		
		if(intro.disposition == 'vertical') {
			row = delta;
			offset += delta;
		}
		
		if(intro.disposition == 'horizontal') {
			col = delta;
			zoffset += delta;
		}
		
		if(intro.disposition == 'grid') {
			col = delta % side;
			row = Math.floor(delta / side);
			zoffset += col;
			offset += row;
		}

		offset = gene.round_number(offset, intro.decimals);
		
		return {
			output: intro.incipit + '<offset=' + offset + '><zoffset=' + zoffset + '>',
			col: col + 1,
			row: row + 1,
			offset: offset,
			zoffset: zoffset,
		};
	},
	
	round_number: function(num, dec) {
		return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
	},

	readPixel: function (x, y) {
		var hex = '';
		var p = inter.els.workingctx.getImageData(x, y, 1, 1).data;
		
		var rgba = {
			r: p[0],
			g: p[1],
			b: p[2],
			a: p[3]
		};
		//console.log(rgba);
		
		if(inter.els.grayScale.checked) {
			rgba.r = rgba.g = rgba.b = 0.2126 * rgba.r + 0.7152 * rgba.g + 0.0722 * rgba.b;
		}

		if(gene.gammaCorrection != 1) {
			rgba.r = 255 * Math.pow(( rgba.r / 255), gene.gammaCorrection);
			rgba.g = 255 * Math.pow(( rgba.g / 255), gene.gammaCorrection);
			rgba.b = 255 * Math.pow(( rgba.b / 255), gene.gammaCorrection);
		}
		
		if(gene.alphaCorrection != 1) {
			rgba.a = 255 * Math.pow(( rgba.a / 255), gene.alphaCorrection);
		}
		
		//console.log(rgba);
		
		var longValue = color.rgbaToHex(rgba);
		var shortValue = color.rgbaToHexShort(rgba);
		var expanded = color.expandedHex(shortValue);
		if(gene.useshort || (expanded == longValue)) {
			hex = shortValue;
		} else {
			hex = longValue;
		}

		return hex
	},

};

window.addEventListener('load', gene.init);
