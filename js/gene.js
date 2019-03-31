'use strict';

var gene = {
	zoffset_min: -8,
	zoffset_max: 8,
	offset_min: -8,
	offset_max: 8,

	init: function() {	
		gene.reader = new FileReader();
		gene.source = false;
		gene.reader.addEventListener('load', function () {
			gene.source = new Image;
			gene.source.addEventListener('load', function() {
				edit.setSource(gene.source);				
			});
			gene.source.src = gene.reader.result;
			inter.els.sourcePreview.src = gene.source.src;
		}, false);
		inter.els.fileSelector.addEventListener('change', gene.loadsource);
				
		inter.els.executeButton.addEventListener('click', gene.execute);
		
	},
	
	loadsource: function() {
		var file = inter.els.fileSelector.files[0];
		if(file) {
			gene.reader.readAsDataURL(file);
		}
	},
	
	preparation: function() {
		gene.errors = [];
		inter.els.errorMessages.innerText = '';
		inter.els.textareas.innerText = '';
		inter.els.cover.style.display = 'block';
		inter.progress.innerText = '';
		gene.gammaCorrection = 1 / parseFloat(inter.els.gammaCorrection.value);
		gene.alphaCorrection = 1 / parseFloat(inter.els.alphaCorrection.value);
		gene.useshort = inter.els.shortCodes.checked;
		gene.source = edit.getSource();
	},
	
	execute: function() {
		gene.preparation();
		setTimeout(gene.processSlices, 10);
	},
	
	processSlices: function() {
		var slices = parseInt(inter.els.slices.value);
		if(slices < 1) {
			gene.errors.push('Invalid amount of slices');
			gene.showErrors();
			gene.conclusion();
			return;
		}
		var w = gene.source.width;
		var h = gene.source.height;
		if(!w || !h) {
			gene.errors.push('Invalid input image');
			gene.showErrors();
			gene.conclusion();
			return;
		}
		var result = false;
		var start = 0;
		var results = [];
		var delta = 0;
		
		function attemptOutput(w, h) {
			gene.errors = [];
			result = gene.generateOutput(w, h, start, delta, slices);
			results.push(result);
			if(result.y == h) {
				return true;
			}
			++delta;
			start = result.y;
		}
		
		var complete;
		var tw;
		var th;
		var ratio = h / w;
		var s;
		var completion;
		var remain;
		
		function noAutoSize() {
			var loop = new TimeoutLooper(
				// start
				function() {
					s = 0;
					complete = false;
				},
				// continue
				function() {
					if(gene.errors.length) {
						return false;
					}
					if(s >= slices || complete) {
						return false;
					}
					return true;
				},
				// step
				function() {
					completion = Math.round(100.0 / slices * s);
					gene.progress('Processed slice ' + (s + 1) + ' of ' + slices + '<br>Progress: ' + completion + '%');
					complete = attemptOutput(w, h);
					++s;
				},
				// done
				function() {
					gene.conclusion();
					if(result.y < h) {
						gene.errors.push('Image too large for this amount of slices');
					}
					if(gene.errors.length) {
						gene.showErrors();
						return;
					}
					gene.displayResults(results);
				},
				// delay
				1
			);
			loop.run();
		}
		
		function autoSize() {
			var increase;
			var found;
			var increases = [100, 49, 23, 11, 5, 1];
			var total_increases = increases.length;
			var portion = 100.0 / total_increases;
			var loop = new TimeoutLooper(
				// start
				function() {
					increase = increases.shift();
					tw = increase;
					s = 0;
					start = 0;
					delta = 0;
					results = [];			
					found = false;
					complete = false;
					th = Math.round(tw * ratio);
				},
				// continue
				function() {
					return !found;
				},
				// step
				function() {
					remain = (total_increases - increases.length - 1) * portion;
					completion = Math.round(remain + portion / slices * s);
					gene.progress('Processed slice ' + (s + 1) + ' of ' + slices + ' <br>Size (' + tw + ', ' + th + ')<br>Increase: ' + increase + '<br>Progress: ' + completion + '%');
					
					if(!complete) {
						complete = attemptOutput(tw, th);
					}
					++s;
					
					if(increase == 1 && s == slices && complete) {
						found = true;
						return;
					}
					
					if(complete) {
						s = slices;
					}
					
					if(increase == 1 && s == slices && !complete) {
						--tw;
						th = Math.round(tw * ratio);
						s = 0;
						start = 0;
						delta = 0;
						results = [];
						complete = false;
						th = Math.round(tw * ratio);
					} else if(s == slices) {
						if(!complete) {
							tw -= increase;
							increase = increases.shift();							
						}
						if(!tw) {
							tw = increase;
						} else {
							tw += increase;							
						}
						s = 0;
						start = 0;
						delta = 0;
						results = [];
						complete = false;
						th = Math.round(tw * ratio);
					}
				},
				// done
				function() {
					gene.conclusion();
					gene.displayResults(results);
				},
				// delay
				1
			);
			loop.run();			
		}
				
		if(!inter.els.autoSize.checked) {
			noAutoSize();
		} else {
			autoSize();
		}
	},
	
	progress: function(message) {
		inter.progress.innerHTML = message;
	},
	
	conclusion: function() {
		inter.els.cover.style.display = 'none';
	},
	
	displayResults: function(results) {
		for(var i = 0; i < results.length; ++i) {
			gene.displayResult(results[i]);
		}
		var last = results[results.length - 1];
		var height = last.h * last.intro.vspacing * placer.size;
		placer.centerimage.style.height = '' + height + 'px';
		placer.finetuneimage.style.height = '' + (height * 8) + 'px';
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
		var placeat = 'Placement: ';
		switch(true) {
			case col > 0:
				placeat += '' + col + ' block(s) behind, ';
				break;
			case col < 0:
				placeat += '' + (-col) + ' block(s) forward, ';
				break;
			default:
				placeat += 'same column, ';
		}
		switch(true) {
			case row < 0:
				placeat += '' + (-row) + ' block(s) above ';
				break;
			case row > 0:
				placeat += '' + row + ' block(s) beneath ';
				break;
			default:
				placeat += 'same altitude ';
		}
		container.innerHTML += '<br>' + placeat + ' (relative to image top)';
		
		
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
			placer.signs[delta].e.classList.add('error');
		} else {
			placer.signs[delta].e.classList.remove('error');
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
	
	escapeRegExp: function(text) {
	  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
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
		var curhex = '';
		var rgba = {};
		var imagedata = inter.els.resultctx.createImageData(1, 1);

		var right_reg = new RegExp("(" + gene.escapeRegExp(inter.els.characters.value) + ")+$", "g");
		var left_reg = new RegExp("^(" + gene.escapeRegExp(inter.els.characters.value) + ")+", "g");

		for(y = start; y < h; ++y) {
			m[y] = new Array(w);
			var line = '';
			var line_intro = "";
			var start_rgba = {};
			for(var x = 0; x < w; ++x) {
				m[y][x] = gene.readPixel(x, y);
				if(!(x == 0 && y > start && m[y][x] === m[y-1][w-1]) && !(x > 0 && m[y][x] === m[y][x-1])) {
					// only set the color if it differs from the previous one
					curhex = m[y][x];
					if(x == 0) {
						line_intro = '<' + curhex + '>';						
					} else {
						line += '<' + curhex + '>';
					}
				}
				line += inter.els.characters.value;
				rgba = color.hexToRgba(curhex);
				if(x == 0) {
					start_rgba = rgba;
				}
				imagedata.data[0] = rgba.r;
				imagedata.data[1] = rgba.g;
				imagedata.data[2] = rgba.b;
				imagedata.data[3] = rgba.a;
				inter.els.resultctx.putImageData(imagedata, x, y);
			}
			if(rgba.a == 0 && inter.els.align.value == "left") {
				line = line_intro + line.replace(right_reg, "");
			} else if(start_rgba.a == 0 && inter.els.align.value == "right") {
				line = line.replace(left_reg, "");
			} else if(start_rgba.a == 0 && rgba.a == 0 && inter.els.align.value == "") {
				var left_matches = line.match(left_reg) || [];
				var right_matches = line.match(right_reg) || [];
				if(left_matches.length > 0 && right_matches.length > 0) {
					var min = Math.min(left_matches[0].length, right_matches[0].length);
					if(min < line.length) {
						line = line.substring(min, line.length - min);
					} else {
						line = "";
					}
					if(min < left_matches[0].length) {
						line = line_intro + line;						
					}
				}
			} else {
				line = line_intro + line;
			}
			if(line == "") {
				line = inter.els.characters.value;
			}
			offs = gene.prepareCodeOffsets(delta, y, intro);
			if(output.length + line.length + offs.output.length > limit) {
				offs = gene.prepareCodeOffsets(delta, y - 1, intro);
				break;
			}
			output += line + '\r\n';
		}
		return {
			output: offs.output + output.replace(/(<#0000>)*\r\n$/, ""),
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
		
		// inter.els.workingctx.imageSmoothingEnabled = false;
		// inter.els.resultctx.imageSmoothingEnabled = false;
		// inter.els.workingctx.translate(0.5, 0.5);
		// inter.els.resultctx.translate(0.5, 0.5);
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
	
	prepareCodeOffsets: function(delta, lines, intro) {
		var offset = -placer.finetuneY + 0.50 - intro.vspacing * 4.5 - lines * intro.vspacing * intro.verror;
		var zoffset = placer.finetuneX;
		var col = 0;
		var row = 0;
		
		var sign = placer.signs[delta];
		
		offset += sign.ry;
		zoffset += sign.rx;

		offset = gene.round_number(offset, intro.decimals);
		zoffset = gene.round_number(zoffset, intro.decimals);
		
		if(offset < gene.offset_min || offset > gene.offset_max) {
			gene.errors.push('&lt;offset&gt; out of range');
		}
		
		if(zoffset < gene.zoffset_min || zoffset > gene.zoffset_max) {
			gene.errors.push('&lt;zoffset&gt; out of range');
		}

		
		return {
			output: intro.incipit + '<offset=' + offset + '><zoffset=' + zoffset + '>',
			col: sign.rx,
			row: sign.ry,
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
		
		var longValue = color.rgbaToHex(rgba);
		var shortValue = color.rgbaToHexShort(rgba);
		var expanded = color.expandedHex(shortValue);
		if(gene.useshort || (expanded == longValue)) {
			hex = shortValue;
		} else {
			hex = longValue;
		}
		
		return edit.filterColor(hex);
	},

};

window.addEventListener('load', gene.init);
