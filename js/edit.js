'use strict';

var edit = {
	
	init: function() {
		edit.initControls();
		edit.initEvents();
	},
	
	exportSettings: function() {
		return {
			settingsToggle: edit.settingsToggle.checked,
			forceWidth: edit.forceWidth.checked,
			sectionWidth: edit.sectionWidth.value,
			splitCols: edit.splitCols.value,
			splitRows: edit.splitRows.value,
			cropTop: edit.cropTop.value,
			cropLeft: edit.cropLeft.value,
			cropRight: edit.cropRight.value,
			cropBottom: edit.cropBottom.value,
			transparents: edit.transparents.value,
		};
	},
	
	importSettings: function(settings) {
		edit.settingsToggle.checked = settings.settingsToggle;
		edit.forceWidth.checked = settings.forceWidth;
		edit.sectionWidth.value = settings.sectionWidth;
		edit.splitCols.value = settings.splitCols;
		edit.splitRows.value = settings.splitRows;
		edit.cropTop.value = settings.cropTop;
		edit.cropLeft.value = settings.cropLeft;
		edit.cropRight.value = settings.cropRight;
		edit.cropBottom.value = settings.cropBottom;
		edit.transparents.value = settings.transparents;
		edit.settingsToggleToggled();
		edit.forceWidthToggled();
		edit.updateCropping();
	},
	
	initControls: function() {
		edit.colors = [];
		edit.settingsToggle = document.querySelector('#showsourcesettings');
		edit.sourceSettingsTable = document.querySelector('#sourcesettings');
		edit.transparents = document.querySelector('#transparents');
		edit.forceWidth = document.querySelector('#forcewidth');
		edit.sectionWidth = document.querySelector('#sectionwidth');
		edit.splitCols = document.querySelector('#splitcolumns');
		edit.splitRows = document.querySelector('#splitrows');
		edit.cropAll = document.querySelector('#cropall');
		edit.cropTop = document.querySelector('#croptop');
		edit.cropRight = document.querySelector('#cropright');
		edit.cropBottom = document.querySelector('#cropbottom');
		edit.cropLeft = document.querySelector('#cropleft');
		edit.cropMask = document.querySelector('#cropmask');
		edit.cropMouse = document.querySelector('#cropmouse');
		edit.canvas = document.querySelector('#editcanvas');
		edit.rotateLeft = document.querySelector('#rotateleft');
		edit.rotateRight = document.querySelector('#rotateright');
		edit.mirrorVertical = document.querySelector('#mirrorvertical');
		edit.mirrorHorizontal = document.querySelector('#mirrorhorizontal');
		edit.ctx = edit.canvas.getContext('2d');
		edit.sectionNotice = document.querySelector('#sectionnotice');
	},
	
	initEvents: function() {
		edit.forceWidth.addEventListener('change', edit.forceWidthToggled);
		edit.splitRows.addEventListener('input', edit.updateCropping);
		edit.splitCols.addEventListener('input', edit.updateCropping);
		edit.cropMouse.addEventListener('mousedown', edit.maskMouseDown);
		edit.cropMouse.addEventListener('mousemove', edit.maskMouseMove);
		document.addEventListener('mouseup', edit.maskMouseUp);
		edit.cropAll.addEventListener('input', edit.cropAllChange);
		edit.cropTop.addEventListener('input', edit.updateCropping);
		edit.cropRight.addEventListener('input', edit.updateCropping);
		edit.cropLeft.addEventListener('input', edit.updateCropping);
		edit.cropBottom.addEventListener('input', edit.updateCropping);
		edit.settingsToggle.addEventListener('click', edit.settingsToggleToggled);
		edit.rotateLeft.addEventListener('click', function() {
			edit.rotate('left');
		});
		edit.rotateRight.addEventListener('click', function() {
			edit.rotate('right');
		});
		edit.mirrorHorizontal.addEventListener('click', function() {
			edit.mirror('horizontal');
		});
		edit.mirrorVertical.addEventListener('click', function() {
			edit.mirror('vertical');
		});
	},
	
	filterColor: function(hex) {
		if(!edit.colors.length) {
			return hex;
		}
		if(edit.colors.indexOf(hex.replace('#', '')) !== -1) {
			return '#0000';
		}
		return hex;
	},
	
	prepareColors: function() {
		var remove = edit.transparents.value.toUpperCase();		
		edit.colors = remove.replace(/[^0-9A-F]+/g, ' ').replace(/\s+/g, ' ').split(' ');
	},
	
	settingsToggleToggled: function() {
		edit.sourceSettingsTable.style.display = edit.settingsToggle.checked ? "table" : "none";
	},
	
	forceWidthToggled: function() {
		if(edit.forceWidth.checked) {
			edit.sectionWidth.parentNode.style.display = 'inline-block';
		} else {
			edit.sectionWidth.parentNode.style.display = 'none';
		}
	},
	
	maskMouseDown: function(e) {
		var rect = inter.getRect(edit.cropMouse);
		edit.maskStart = {
			x: e.clientX - rect.x,
			y: e.clientY - rect.y,
		};
	},
	
	maskMouseMove: function(e) {
		if(!edit.maskStart) {
			return;
		}
		var a = edit.maskStart;
		var rect = inter.getRect(edit.cropMouse);
		var b = {
			x: e.clientX - rect.x,
			y: e.clientY - rect.y,
		};
		edit.maskToCrop(a, b);
	},
	
	maskMouseUp: function(e) {
		edit.maskStart = false;
	},
	
	maskToCrop: function(a, b) {
		var minX = Math.min(a.x, b.x);
		var maxX = Math.max(a.x, b.x);
		var minY = Math.min(a.y, b.y);
		var maxY = Math.max(a.y, b.y);
		
		if(maxX - minX < 5 || maxY - minY < 5) {
			return;
		}
		
		var source = edit.canvas;
		var prev = inter.els.sourcePreview;
		
		var ratio = source.width / prev.clientWidth;

		edit.cropLeft.value = Math.round(minX * ratio);
		edit.cropTop.value = Math.round(minY * ratio);
		edit.cropRight.value = Math.round((prev.clientWidth - maxX) * ratio);
		edit.cropBottom.value = Math.round((prev.clientHeight - maxY) * ratio);
		
		window.ddd = {
			a: a,
			b: b,
			ratio: ratio,
			prev: prev,
			source: source,
		};
		
		edit.updateCropping();
	},
	
	setSource: function(source) {
		edit.canvas.width = source.width;
		edit.canvas.height = source.height;
		edit.ctx.drawImage(source, 0, 0);
		setTimeout(edit.updateCropping, 100);
	},
	
	getSource: function() {
		var source = document.createElement('canvas');
		var ratio = 1;
		
		source.width = (edit.canvas.width - edit.cropLeft.value - edit.cropRight.value) / edit.splitCols.value;
		source.height = (edit.canvas.height - edit.cropTop.value - edit.cropBottom.value) / edit.splitRows.value;
		
		if(edit.forceWidth.checked) {
			ratio = parseFloat(edit.sectionWidth.value) / source.width;
		}
		source.width *= ratio;
		source.height *= ratio;
		
		var ctx = source.getContext('2d');
		// ctx.imageSmoothingEnabled = false;
		// ctx.translate(0.5, 0.5);
		
		var col = edit.chosenSection % edit.splitCols.value;
		var row = Math.floor(edit.chosenSection / edit.splitCols.value);
		
		var left = -source.width * col - edit.cropLeft.value * ratio;
		var top = -source.height * row - edit.cropTop.value * ratio;
		ctx.drawImage(edit.canvas, left, top, edit.canvas.width * ratio, edit.canvas.height * ratio);
		
		edit.prepareColors();
		
		return source;
	},
	
	updateSectionNotice: function() {
		edit.sectionNotice.innerText = "You're working on section #" + (edit.chosenSection + 1) + " of " + edit.sections.length;
	},
	
	updatePreview: function() {
		inter.els.sourcePreview.src = edit.canvas.toDataURL();
		setTimeout(edit.updateCropping, 100);
	},
	
	cropAllChange: function() {
		edit.cropTop.value 
			= edit.cropRight.value
			= edit.cropBottom.value
			= edit.cropLeft.value
			= edit.cropAll.value;
		edit.updateCropping();
	},
	
	updateCropping: function() {
		var source = edit.canvas;
		var prev = inter.els.sourcePreview;
		var mask = edit.cropMask;
		var mouse = edit.cropMouse;
		
		mask.innerHTML = '';
		
		var ratio = prev.clientWidth / source.width;
		
		mouse.style.display = 'block';
		mouse.style.width = prev.clientWidth + 'px';
		mouse.style.height = prev.clientHeight + 'px';
		
		mask.style.borderWidth =
			Math.round(edit.cropTop.value * ratio) + "px " + 
			Math.round(edit.cropRight.value * ratio) + "px " + 
			Math.round(edit.cropBottom.value * ratio) + "px " + 
			Math.round(edit.cropLeft.value * ratio) + "px";
		
		var total = edit.splitCols.value * edit.splitRows.value;
		
		edit.sections = [];
		
		for(var i = 0; i < total; ++i) {
			var section = document.createElement('div');
			section.classList.add('splitsection');
			mask.appendChild(section);
			section.dataset.index = i;
			if(i === 0) {
				section.classList.add('selected');
			}
			section.style.width = mask.clientWidth / edit.splitCols.value + 'px';
			section.style.height = mask.clientHeight / edit.splitRows.value + 'px';
			section.addEventListener('click', edit.chooseSection);
			section.setAttribute('title', 'Click to select, click and drag for manual cropping');
			edit.sections.push(section);
		}
		edit.chosenSection = 0;
		edit.updateSectionNotice();
	},
	
	chooseSection: function() {
		edit.chosenSection = parseInt(this.dataset.index);
		for(var i = 0; i < edit.sections.length; ++i) {
			var section = edit.sections[i];
			if(i === edit.chosenSection) {
				section.classList.add('selected');
			} else {
				section.classList.remove('selected');
			}
		}
		edit.updateSectionNotice();
	},
	
	rotate: function(direction) {
		
		var radians = Math.PI / 2;
		if(direction == 'left') {
			radians = -radians;
		}
		var canvas = document.createElement('canvas');
		canvas.width = edit.canvas.width;
		canvas.height = edit.canvas.height;

		var ctx = canvas.getContext('2d');
		ctx.drawImage(edit.canvas, 0, 0);

		var pass = edit.canvas.width;
		edit.canvas.width = edit.canvas.height;
		edit.canvas.height = pass;
		
		edit.ctx.clearRect(0, 0, edit.canvas.width, canvas.height);
		edit.ctx.save();
		edit.ctx.translate(edit.canvas.width / 2, edit.canvas.height / 2);
		edit.ctx.rotate(radians);
		edit.ctx.drawImage(canvas, -edit.canvas.height / 2, -edit.canvas.width / 2);
		edit.ctx.restore();
		edit.updatePreview();
	},
	
	mirror: function(direction) {
		edit.ctx.save();
		var canvas = document.createElement('canvas');
		canvas.width = edit.canvas.width;
		canvas.height = edit.canvas.height;

		var ctx = canvas.getContext('2d');

		if(direction == 'horizontal') {
			ctx.scale(-1, 1);
			ctx.drawImage(edit.canvas, 0, 0, -canvas.width, canvas.height); 
		} else {
			ctx.scale(1, -1);
			ctx.drawImage(edit.canvas, 0, 0, canvas.width, -canvas.height); 
		}
		
		edit.ctx.clearRect(0, 0, edit.canvas.width, canvas.height);
		edit.ctx.drawImage(canvas, 0, 0);
		edit.ctx.restore();
		edit.updatePreview();
	},

};