'use strict';

function clamp(value, min, max) {
	if(value < Math.min(min, max)) {
		return min;
	}
	if(value > Math.max(min, max)) {
		return max;
	}
	return value;
}

var placer = {
	size: 25,
	total: 64,
	width: 21,
	height: 21,
	cx: 10,
	cy: 10,
	offset: 0,
	zoffset: 0,
	moving: null,
	finetuneW: 200,
	finetuneX: 0,
	finetuneY: 0,
	
	init: function(parent) {
		placer.createPlacer(parent);
		placer.createImage();
		placer.createSigns();
		placer.initStyle();
	},
	
	createPlacer: function(parent) {
		parent.innerHTML = '';
		placer.p = document.createElement('div');
		placer.p.setAttribute('id', 'placer');
		parent.appendChild(placer.p);		
		placer.p.addEventListener('mousemove', placer.mousemove);
		var offRight = document.createElement('div');
		var offBottom = document.createElement('div');
		placer.p.appendChild(offRight);
		placer.p.appendChild(offBottom);
		offRight.setAttribute('class', 'off-area');
		offBottom.setAttribute('class', 'off-area');
		offRight.style.left = (placer.width - 1) * placer.size + 'px';
		offBottom.style.top = (placer.height - 1) * placer.size + 'px';
		offRight.innerText = ' ';
		offBottom.innerText = ' ';
		var labelTop = document.createElement('div');
		labelTop.setAttribute('id', 'placer-label-top');
		var labelLeft = document.createElement('div');
		labelLeft.setAttribute('id', 'placer-label-left');
		placer.p.appendChild(labelTop);
		placer.p.appendChild(labelLeft);
		labelTop.innerHTML = 
			'<ul><li>Yellow squares are Arc Signs facing your left'
			+ '<li>Finetune the image position hovering and clicking the center'
			+ '<li>Click and drag single Signs around'
			+ '<li>Remove Signs dragging them on the red borders'
			+ '<li>Add Signs dragging them from the bottom-right corner'
			+ '<li>Move all signs with the arrows on the left'
			+ '</ul>'
			+ '<center>&#x1F870; negative | ZOFFSET | positive &#x1F872;</center>';
		labelLeft.innerHTML = '<center>&#x1F870; positive | OFFSET | negative &#x1F872;</center>';
		
		var shifter = document.createElement('div');
		shifter.setAttribute('id', 'shifter');
		placer.p.appendChild(shifter);
		
		function shiftHelper() {
			placer.shift(this.dataset.x, this.dataset.y);
		}

		var buttons = [
			{i: 'shift-left', x: -1, y: 0, h: '&#x1F870;', l: '0', t: '33.3%'},
			{i: 'shift-up', x: 0, y: -1, h: '&#x1F871;', l: '33.3%', t: '0'},
			{i: 'shift-right', x: 1, y: 0, h: '&#x1F872;', l: '66.6%', t: '33.3%'},
			{i: 'shift-bottom', x: 0, y: 1, h: '&#x1F873;', l: '33%', t: '66.6%'},
		];
		
		for(var i = 0; i < buttons.length; ++i) {
			var b = document.createElement('button');
			shifter.appendChild(b);
			b.setAttribute('id', buttons[i].i);
			b.dataset.x = buttons[i].x;
			b.dataset.y = buttons[i].y;
			b.innerHTML = buttons[i].h;
			b.style.left = buttons[i].l;
			b.style.top = buttons[i].t;
			b.addEventListener('click', shiftHelper);			
		}
		
	},
	
	createImage: function() {
		placer.center = document.createElement('div');
		placer.center.setAttribute('id', 'center');
		placer.center.style.left = placer.cx * placer.size + 'px';
		placer.center.style.top = placer.cy * placer.size + 'px';
		placer.center.style.height = placer.size + 'px';
		placer.center.style.width = placer.size + 'px';
		placer.center.innerText = ' ';
		placer.center.setAttribute('title', 'Click and drag to finetune the image position inside the one-block space');
		placer.p.appendChild(placer.center);
		
		placer.finetune = document.createElement('div');
		placer.finetune.setAttribute('id', 'finetune');
		placer.finetune.innerText = ' ';
		placer.center.appendChild(placer.finetune);
		
		placer.centerimage = document.createElement('div');
		placer.centerimage.setAttribute('id', 'centerimage');
		placer.centerimage.innertText = ' ';
		placer.center.appendChild(placer.centerimage);

		placer.finetuneimage = document.createElement('div');
		placer.finetuneimage.setAttribute('id', 'finetuneimage');
		placer.finetuneimage.innertText = ' ';
		placer.finetuneimage.style.pointerEvents = 'none';
		placer.centerimage.style.pointerEvents = 'none';
		placer.finetune.appendChild(placer.finetuneimage);
		
		placer.finetune.addEventListener('mousedown', function(e) {
			placer.movingimage = true;
			placer.moveImage(e);
		});
		
		placer.finetune.addEventListener('mousemove', placer.moveImage);
	},
	
	moveImage: function(e) {		
		if(e.buttons == 0) {
			placer.movingimage = false;
			return;
		}
		var x = clamp(e.offsetX, 0, placer.finetune.clientWidth);
		var y = clamp(e.offsetY, 0, placer.finetune.clientHeight);
		placer.setFinetune(0.5 - x / placer.finetune.offsetWidth, y / placer.finetune.offsetHeight);
	},

	setFinetune: function(x, y) {
		placer.finetuneX = x;
		placer.finetuneY = y;
		var w = placer.finetuneW;
		placer.finetuneimage.style.left = w * 0.5 - x * w + 'px';
		placer.finetuneimage.style.top = y * w + 'px';		
		placer.centerimage.style.left = placer.size * 0.5 - x * placer.size + 'px';
		placer.centerimage.style.top = y * placer.size + 'px';
		placer.updateOffsets();
	},
		
	createSigns: function() {
		placer.log = document.createElement('div');
		placer.log.setAttribute('id', 'placer-log');
		document.body.appendChild(placer.log);
		placer.signs = [];		
		for(var i = 0; i < placer.total; ++i) {
			var signlog = document.createElement('div');
			placer.log.appendChild(signlog);
			var sign = new Sign(i, placer.p, signlog);
			placer.signs[i] = sign;
			sign.move(placer.width - 1, placer.height - 1);
		}
	},
	
	overlaps: function() {
		if(!placer.moving) {
			return false;
		}
		if(placer.moving.x == placer.cx && placer.moving.y == placer.cy) {
			return true;
		}
		for(var i = 0; i < placer.total; ++i) {
			if(placer.moving.index == i) {
				continue;
			}
			var sign = placer.signs[i];
			if(sign.x == placer.moving.x && sign.y == placer.moving.y) {
				return true;
			}
		}
		return false;
	},
	
	initStyle: function() {
		placer.p.style.backgroundSize = placer.size + 'px';
		placer.p.style.fontSize = placer.size * 0.80 + 'px';
		placer.p.style.height = placer.size + 'px';
		placer.p.style.width = (placer.width * placer.size) + 'px';
		placer.p.style.height = (placer.height * placer.size) + 'px';
		placer.p.style.backgroundSize = placer.size + 'px';
	},
	
	consistencyCheck: function() {
		if(placer.consistencyCheck.working) {
			return;
		}
		placer.consistencyCheck.working = true;
		var on = [];
		for(var i = 0; i < placer.signs.length; ++i) {
			var sign = placer.signs[i];
			if(!sign.isOff()) {
				on.push({x: sign.x, y: sign.y});
			}
			sign.sendOff();
		}
		var onLen = on.length;
		inter.els.slices.value = onLen;
		for(var i = 0; i < onLen; ++i) {
			var sign = placer.signs[i];
			sign.move(on[i].x, on[i].y);
		}
		placer.storePositions();
		placer.consistencyCheck.working = false;
	},
	
	storePositions: function() {
		var positions = [];
		for(var i = 0; i < placer.signs.length; ++i) {
			var sign = placer.signs[i];
			if(!sign.isOff()) {
				positions[i] = [sign.rx, sign.ry];				
			}
		}
		window.localStorage.setItem('signs', JSON.stringify(positions));
		return positions;
	},
	
	loadPositions: function(override) {
		try {
			var positions = override || JSON.parse(window.localStorage.getItem('signs', '[]'));
			for(var i = 0; i < placer.signs.length; ++i) {
				if(i >= positions.length) {
					break;
				}
				var sign = placer.signs[i];
				if(positions[i]) {
					sign.moveRelative(positions[i][0], positions[i][1]);					
				} else {
					sign.sendOff();
				}
			}
		} catch (e) {
			// no-op
		}
	},
	
	mousemove: function(e) {
		var x = toScale(e.offsetX);
		var y = toScale(e.offsetY);
		if(e.buttons < 1 || !placer.moving) {
			if(placer.overlaps()) {
				placer.moving.restorePosition();
			}
			if(placer.moving) {
				placer.moving.restoreZindex();
				placer.consistencyCheck();
			}
			placer.moving = null;
			placer.p.style.cursor = 'default';
			placer.enableSignEvents();
			return;
		}
		placer.moving.move(x, y);
	},
	
	disableSignEvents: function() {
		placer.center.style.pointerEvents = 'none';
		placer.finetune.style.pointerEvents = 'none';
		for(var i = 0; i < placer.signs.length; ++i) {
			placer.signs[i].e.style.pointerEvents = 'none';
		}
	},
	
	enableSignEvents: function() {
		placer.center.style.pointerEvents = 'auto';
		placer.finetune.style.pointerEvents = 'auto';
		for(var i = 0; i < placer.signs.length; ++i) {
			placer.signs[i].e.style.pointerEvents = 'auto';
		}
	},
	
	shift: function(x, y) {		
		x = parseInt(x);
		y = parseInt(y);
		if(x) {
			inter.els.zoffset.value = parseFloat(inter.els.zoffset.value) + x;
		}
		if(y) {
			inter.els.offset.value = parseFloat(inter.els.offset.value) + y;
		}
		var offset = inter.els.offset.value;
		var zoffset = inter.els.zoffset.value;
		
		var first = placer.signs[0];

		var intOffset = Math.floor(offset);
		var floatOffset = offset - intOffset;
		var intZoffset = Math.round(zoffset);
		var floatZoffset = zoffset - intZoffset;

		if(floatOffset < 0.0001) {
			floatOffset = 1;
			--intOffset;
		}
		
		var shiftOffset = intOffset - (first.ry - 1);
		var shiftZoffset = intZoffset - first.rx;
		var slices = inter.els.slices.value;
		for(var i = 0; i < slices; ++i) {
			var sign = placer.signs[i];
			sign.moveRelative(sign.rx + shiftZoffset, sign.ry + shiftOffset);
		}
		setTimeout(function() {
			placer.setFinetune(floatZoffset, 1 - floatOffset);
			placer.consistencyCheck();
		}, 100);
	},
	
	updateOffsets: function() {
		var decimals = inter.els.decimals.value;
		inter.els.zoffset.value = gene.round_number(placer.signs[0].rx + placer.finetuneX, decimals);
		inter.els.offset.value = gene.round_number(placer.signs[0].ry - placer.finetuneY, decimals);
		inter.delayedStoreSettings();
	},
	
	ensureSignsAmount: function() {
		var slices = inter.els.slices.value;
		for(var i = slices; i < placer.signs.length; ++i) {
			placer.signs[i].sendOff();
		}
	},
	
	arrange: function(mode, override) {
		switch(mode) {
			case 'horizontal':
				placer.horizontal();
				break;
			case 'vertical':
				placer.vertical();
				break;
			case 'grid':
				placer.grid();
				break;
			case 'horizontalCentered':
				placer.horizontal(true);
				break;
			case 'verticalCentered':
				placer.vertical(true);
				break;
			case 'gridRight':
				placer.grid('right');
				break;
			case 'gridBottom':
				placer.grid('bottom');
				break;
			default:
				placer.loadPositions(override);
		}
		placer.consistencyCheck();
	},

	horizontal: function(centered) {
		if(inter.els.slices.value > 17) {
			inter.els.slices.value = 17;
			placer.ensureSignsAmount();
		}
		var slices = inter.els.slices.value;
		for(var i = 0; i < slices; ++i) {
			var sign = placer.signs[i];
			if(centered) {
				sign.moveRelative(i - slices / 2, 1);				
			} else {
				sign.moveRelative(i, 1);
			}
		}
		placer.updateOffsets();
	},
	
	vertical: function(centered) {
		if(inter.els.slices.value > 17) {
			inter.els.slices.value = 17;
			placer.ensureSignsAmount();
		}
		var slices = inter.els.slices.value;
		for(var i = 0; i < slices; ++i) {
			var sign = placer.signs[i];
			if(centered) {
				sign.moveRelative(1, i - slices / 2);				
			} else {
				sign.moveRelative(1, i);
			}
		}
		placer.updateOffsets();
	},
	
	grid: function(where) {
		placer.ensureSignsAmount();
		var slices = inter.els.slices.value;
		var side = Math.ceil(Math.sqrt(slices));
		for(var i = 0; i < slices; ++i) {
			var sign = placer.signs[i];
			var x = i % side + 1;
			var y = Math.floor(1.0 * i / side) + 1;
			if(where == 'right') {
				y -= Math.ceil(0.5 * side);
				++x;
			} else if(where == 'bottom') {
				x -= Math.ceil(0.5 * side);
				++y;
			} else {
				--x;
				++y;
			}
			sign.moveRelative(x, y);
		}
		placer.updateOffsets();
	}
	
};

function toScale(val) {
	val = Math.round(1.0 * val / placer.size) - 1;
	if(val < 0) {
		return 0;
	}
	return val;
}

function Sign(index, parent, logelement) {
	var self = this;
	
	self.index = index;
	
	self.e = document.createElement('div');
	
	self.e.classList.add('sign');
	
	self.e.innerText = index + 1;
	self.e.style.width = placer.size + 'px';
	self.e.style.height = placer.size + 'px';
	
	parent.appendChild(self.e);
	
	self.sendOff = function() {
		self.move(placer.width - 1, placer.height - 1);
	};
	
	self.isOff = function() {
		return self.x < 0
				|| self.y < 0
				|| self.x >= placer.width - 1 
				|| self.y >= placer.height - 1;
	};
	
	self.e.addEventListener('mousedown', function(e) {
		inter.els.disposition.value = 'free';
		placer.moving = self;
		placer.disableSignEvents();
		placer.p.style.cursor = 'move';
		self.oldX = self.x;
		self.oldY = self.y;
		self.e.style.zIndex = placer.total;
	});
	
	self._move = function() {
		if(self.index == 0) {
			placer.updateOffsets();
		}
		self.e.style.left = self.x * placer.size + 'px';
		self.e.style.top = self.y * placer.size + 'px';
		logelement.innerText = '#' + index + ' (' + self.rx + ', ' + self.ry + ')';
	};
	
	self.moveRelative = function(x, y) {
		x = Math.round(x);
		y = Math.round(y);
		self.rx = x;
		self.ry = y;
		self.x = x + placer.cx;
		self.y = y + placer.cy;
		self._move();
	};
	
	self.move = function(x, y) {
		x = Math.round(x);
		y = Math.round(y);
		self.x = x;
		self.y = y;
		self.rx = x - placer.cx;
		self.ry = y - placer.cy;
		self._move();
	};
	
	self.restoreZindex = function() {		
		self.e.style.zIndex = placer.total - self.index;
	}
	
	self.restorePosition = function() {
		self.move(self.oldX, self.oldY);
	};
	
	self.restoreZindex();
}
