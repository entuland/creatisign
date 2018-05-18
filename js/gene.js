var gene = {
	zoffset_min: -8,
	zoffset_max: 8,
	offset_min: -8,
	offset_max: 8,

	init: function() {
		gene.placement = document.querySelector('#placementpreview');
		gene.offset = document.querySelector('#offset');
		gene.disposition = document.querySelector('#disposition');
		gene.pixelsize = document.querySelector('#pixelsize');
		gene.width = document.querySelector('#width');
		gene.zoffset = document.querySelector('#zoffset');
		gene.tweak = document.querySelector('#tweak');
		gene.vtweak = document.querySelector('#vtweak');
		gene.decimals = document.querySelector('#decimals');
		gene.font = document.querySelector('#font');
		
		gene.fileselector = document.querySelector('#fileselector');
		
		gene.cover = document.querySelector('#cover');
		gene.errormessages = document.querySelector('#errors');
		
		gene.sourcepreview = document.querySelector('#sourcepreview');
		
		gene.working = document.querySelector('#working');
		gene.workingctx = gene.working.getContext('2d');
		gene.workingctx.imageSmoothingEnabled = false;
		
		gene.result = document.querySelector('#resultpreview');
		gene.resultctx = gene.result.getContext('2d');
		gene.resultctx.imageSmoothingEnabled = false;
		
		gene.autosize = document.querySelector('#autosize');
		gene.textareas = document.querySelector('#textareas');
		gene.grayscale = document.querySelector('#grayscale');
		gene.character = document.querySelector('#character');
		
		gene.executebutton = document.querySelector('#execute');
		gene.executebutton.addEventListener('click', gene.execute);
		
		gene.slicecount = document.querySelector('#slices');
		
		gene.reader = new FileReader();
		gene.source = false;
		gene.reader.addEventListener("load", function () {
			gene.source = new Image;
			gene.source.src = gene.reader.result;
			gene.sourcepreview.src = gene.source.src;
		}, false);
		gene.fileselector.addEventListener('change', gene.loadsource);
		
		gene.attachPlacementPreview();
		gene.computePlacement();
	},
	
	attachPlacementPreview: function() {
		gene.offset.addEventListener('change', gene.computeDeferredPlacement);
		gene.zoffset.addEventListener('change', gene.computeDeferredPlacement);
		gene.slicecount.addEventListener('change', gene.computeDeferredPlacement);
		gene.disposition.addEventListener('change', gene.computeDeferredPlacement);
	},
	
	computeDeferredPlacement: function() {
		gene.placement_timeout = false;
		if(gene.placement_timeout) {
			clearTimeout(gene.placement_timeout);
		}
		
		gene.placement_timeout = setTimeout(gene.computePlacement, 100);
	},
	
	computePlacement: function() {
		gene.placement.innerHTML = '';
		var greendot = document.createElement('div');
		greendot.title = 'Top of the resulting graphic (approx)';
		greendot.classList.add('greendot');
		gene.placement.appendChild(greendot);
		var offset = parseFloat(gene.offset.value);
		var zoffset = parseFloat(gene.zoffset.value);
		var slices = parseInt(gene.slicecount.value);
		var disposition = gene.disposition.value;
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
			
			if(disposition == 'both') {
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
				gene.placement.appendChild(document.createElement('br'));
			}
			gene.placement.appendChild(sign);
		}
		
		greendot.style.left = '' + (-(zoffset-0.5) * 2) + 'em'
		greendot.style.top = '' + (-offset * 2) + 'em'
	},
	
	loadsource: function() {
		var file = gene.fileselector.files[0];
		if(file) {
			gene.reader.readAsDataURL(file);
		}
	},
	
	execute: function() {
		gene.cover.style.display = 'block';
		setTimeout(function() {
			gene.preparation();
			gene.processSlices();
			gene.showErrors();
			gene.cover.style.display = 'none';
		}, 100);
	},
	
	preparation: function() {
		gene.errors = [];
		gene.errormessages.innerText = '';
		gene.textareas.innerText = '';
		gene.gammacorrection = 1 / parseFloat(document.querySelector("#gamma").value);
		gene.alphacorrection = 1 / parseFloat(document.querySelector("#alpha").value);
		gene.useshort = document.querySelector('#shortcolors').checked;
	},
	
	processSlices: 	function() {
		var slices = parseInt(gene.slicecount.value);
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
		var y = 0;
		var results = [];
		var delta = 0;
		
		function attemptOutput(w, h) {
			gene.errors = [];
			result = gene.generateOutput(w, h, y, delta, slices);
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
			y = result.y;
		}
		
		var decide = null;
		
		if(!gene.autosize.checked) {
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
			decide = null;
			var tw;
			for(tw = 10; /* no limit */ ; tw += 10) {
				// first pass, increase by 10 until run out of slices
				var th = Math.round(tw * ratio);
				// console.log(["#1 attempting: ", tw, th, slices].join(', '));
				delta = 0;
				y = 0;
				results = [];
				var s;
				for(s = 0; s < slices; ++s) {
					decide = attemptOutput(tw, th);
					if(decide === true) {
						// picture completed
						// console.log('picture completed');
						break;
					}
					if(decide === false) {
						// console.log('got errors');
						// got errors
						return;
					}
				}
				if(result.y < th && s == slices) {
					console.log('out of space');
					// run out of space
					break;
				}
			}
			var maxw = tw - 10;
			for(/* no init */; tw > maxw; --tw) {
				// second pass, decrease by 1 until NOT run out of slices
				var th = Math.round(tw * ratio);
				// console.log(["#2 attempting: ", tw, th, slices].join(', '));
				delta = 0;
				y = 0;
				results = [];
				var s;
				var completed = false;
				for(s = 0; s < slices; ++s) {
					decide = attemptOutput(tw, th);
					if(decide === true) {
						// console.log('picture completed');
						completed = true;
						break;
					}
					if(decide === false) {
						// console.log('got errors');
						// got errors
						return;
					}
				}
				if(completed && s >= slices - 1) {
					// console.log('end of loop 2');
					// run out of space
					break;
				}
			}
		}
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
		gene.textareas.appendChild(container);
		container.innerHTML = '<hr><strong>Arc Sign #' + (delta + 1) + '</strong>, ';
		container.innerHTML += '' + output.length + ' chars, sizes (' + w + ', ' + h + ')';
		container.innerHTML += '<br>Place at row #' + row + ' and column #' + col;
		
		
		var textarea = document.createElement('textarea');
		var limit = parseInt(document.querySelector('#limit').value);
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
		gene.errormessages.innerHTML = gene.errors.join('<br>');
	},
	
	generateOutput: function(w, h, start, delta, slices) {
		if(start == 0) {
			gene.prepareCanvas(w, h);
		}
		var intro = gene.prepareCodeIntro();
		var output = intro.output;
		var m = new Array(h);
		var limit = parseInt(document.querySelector('#limit').value);
		var y;
		var offs = {};
		var side = Math.ceil(Math.sqrt(slices));
		var curhex = '';
		var rgba = {};
		var imagedata = gene.resultctx.createImageData(1, 1);
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
				line += gene.character.value;
				rgba = color.hexToRgba(curhex);
				imagedata.data[0] = rgba.r;
				imagedata.data[1] = rgba.g;
				imagedata.data[2] = rgba.b;
				imagedata.data[3] = rgba.a;
				gene.resultctx.putImageData(imagedata, x, y);
			}
			offs = gene.prepareCodeOffsets(delta, side, y, intro);
			if(output.length + line.length + offs.output.length > limit) {
				--y;
				break;
			}
			line += '\r\n';
			output += line;
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
		};
	},
	
	prepareCanvas: function (w, h) {
		gene.working.width = w;
		gene.working.height = h;
		gene.workingctx.clearRect(0, 0, w, h);
		gene.workingctx.drawImage(gene.source, 0, 0, w, h);
		
		gene.result.width = w;
		gene.result.height = h;
		gene.resultctx.clearRect(0, 0, w, h);
	},
	
	prepareCodeIntro: function() {
		var offset = parseFloat(gene.offset.value);
		var disposition = gene.disposition.value;
		var size = parseFloat(gene.pixelsize.value);
		var width = parseFloat(gene.width.value);
		var zoffset = parseFloat(gene.zoffset.value);
		var tweak = parseInt(gene.tweak.value);
		var vtweak = parseInt(gene.vtweak.value);
		var decimals = parseInt(gene.decimals.value);
		var font = gene.font.value;

		var spacing = gene.round_number(size / 10000 * (100 + tweak), decimals);
		var vspacing = gene.round_number(spacing / 100 * vtweak, decimals);
		
		var output = '';
		
		output += '<width=' + gene.round_number(width, decimals) + '>';
		
		output += '<font="' + font + '"><size=' + size +'><mspace=' + spacing + '><line-height=' + vspacing + '>';
		
		return {
			output: output,
			vspacing: vspacing,
			offset: offset,
			zoffset: zoffset,
			disposition: disposition,
			decimals: decimals,
		};
	},
	
	prepareCodeOffsets: function(delta, side, lines, intro) {
		var offset = intro.offset - lines * intro.vspacing;
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
		
		if(intro.disposition == 'both') {
			col = delta % side;
			row = Math.floor(delta / side);
			zoffset += col;
			offset += row;
		}

		offset = gene.round_number(offset, intro.decimals);
		
		return {
			output: '<offset=' + offset + '><zoffset=' + zoffset + '>',
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
		var p = gene.workingctx.getImageData(x, y, 1, 1).data;
		
		var rgba = {
			r: p[0],
			g: p[1],
			b: p[2],
			a: p[3]
		};
		
		if(gene.grayscale.checked) {
			rgba.r = rgba.g = rgba.b = 0.2126 * rgba.r + 0.7152 * rgba.g + 0.0722 * rgba.b;
		}

		if(gene.gammacorrection != 1) {
			rgba.r = 255 * Math.pow(( rgba.r / 255), gene.gammacorrection);
			rgba.g = 255 * Math.pow(( rgba.g / 255), gene.gammacorrection);
			rgba.b = 255 * Math.pow(( rgba.b / 255), gene.gammacorrection);
		}
		
		if(gene.alphacorrection != 1) {
			rgba.a = 255 * Math.pow(( rgba.a / 255), gene.alphacorrection);
		}
				
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
