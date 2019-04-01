'use strict';

var inter = {
	exposeIDs: false,
	timeoutDelay: 500,
	firstReset: false,
	els: {},
	
	init: function() {
		inter.initializeElements();
		placer.init(document.querySelector('#placer-container'));
		inter.loadSettings();
		inter.updateSettingsMode();
		inter.updateShift();
		inter.updateDisposition();
		inter.progress = document.querySelector('#progress');
		inter.reset = document.querySelector('#reset');
		inter.reset.addEventListener('click', inter.checkReset);
		inter.initInfo();
		inter.assignFurtherControls();
		edit.init();
		document.querySelector('#import').addEventListener('click', inter.importSettings);
		document.querySelector('#export').addEventListener('click', inter.exportSettings);
	},
	
	importSettings: function() {
		var input = prompt("Paste settings here and confirm:");
		var settings = false;
		if(!input) {
			return;
		}
		try {
			settings = JSON.parse(input.replace(/^\s*(.*)\s*$/g, "$1")); 
		} catch(e) {
			alert('JSON error: ' + e.name + ' - ' + e.message);
		}
		if(settings) {
			inter.loadSettings(settings);
		}
	},
	
	exportSettings: function() {
		prompt("Copy settings from there:", JSON.stringify(inter.storeSettings()));
	},
	
	initInfo: function() {
		inter.infoButton = document.querySelector('#info-button');
		inter.infoCover = document.querySelector('#info-cover');
		inter.infoContent = document.querySelector('#info-content');
		
		inter.infoButton.addEventListener('click', function() {
			inter.infoCover.style.display = 'block';
			inter.infoContent.style.display = 'block';
		});
		inter.infoCover.addEventListener('click', function() {
			inter.infoCover.style.display = 'none';
			inter.infoContent.style.display = 'none';
		});
	},
	
	checkReset: function() {
		var internalReset = function() {
			inter.firstReset = false;
			inter.reset.innerText = 'Reset?';
			inter.reset.style.background = '#AFA';
			inter.reset.style.color = '#000';
		}
		
		if(inter.firstReset) {
			clearTimeout(inter.checkReset.timeout);
			window.localStorage.clear();
			var mode = inter.els.settingsMode.value;
			inter.initializeElements();
			inter.els.settingsMode.value = mode;
			inter.storeSettings();
			inter.updateSettingsMode();
			inter.firstReset = false;
			inter.reset.innerText = 'Reset done!';
			inter.reset.style.background = '#0F0';
			inter.reset.style.color = '#000';
			inter.updateShift();
			inter.updateDisposition();
			inter.checkReset.timeout = setTimeout(internalReset, 2000);
		} else {
			clearTimeout(inter.checkReset.timeout);
			inter.firstReset = true;
			inter.reset.innerText = 'Yes! Reset!';
			inter.reset.style.background = '#F00';
			inter.reset.style.color = '#FFF';
			inter.checkReset.timeout = setTimeout(internalReset, 2000);
		}
	},
	
	assignFurtherControls: function() {
		inter.els.fileSelector = document.querySelector('#fileSelector');

		inter.els.cover = document.querySelector('#cover');
		inter.els.errorMessages = document.querySelector('#errors');
		
		inter.els.sourcePreview = document.querySelector('#sourcePreview');
		
		inter.els.working = document.querySelector('#workingCanvas');
		inter.els.workingctx = inter.els.working.getContext('2d');
		
		inter.els.result = document.querySelector('#resultsPreview');
		inter.els.resultctx = inter.els.result.getContext('2d');
		
		inter.els.textareas = document.querySelector('#textareas');
		
		inter.els.executeButton = document.querySelector('#execute');
		
	},
	
	delayedStoreSettings: function() {
		if(inter.delayedStoreSettings.timeout) {
			clearTimeout(inter.delayedStoreSettings.timeout);
		}
		inter.delayedStoreSettings.timeout = setTimeout(inter.storeSettings, inter.timeoutDelay);
	},
	
	storeSettings: function() {
		var output = {};
		for(var e in inter.els) {
			if(e == 'fileSelector') {
				continue;
			}
			var element = inter.els[e];
			var value = null;
			if(!element) {
				continue;
			}
			if(['INPUT', 'SELECT'].indexOf(element.tagName) !== -1) {
				if(element.getAttribute('type') === 'checkbox') {
					if(element.checked) {
						value = 'on';
					} else {
						value = 'off';
					}
				} else {
					value = element.value;
				}
				output[e] = value;
				window.localStorage.setItem(e, value);
			}
		}
		output.signs = placer.storePositions();
		output.edit = edit.exportSettings();
		return output;
	},
	
	loadSettings: function(override) {
		for(var e in inter.els) {
			if(e == 'fileSelector') {
				continue;
			}
			var element = inter.els[e];
			if(['INPUT', 'SELECT'].indexOf(element.tagName) !== -1) {
				var value = override && override[e] || window.localStorage.getItem(e);
				if(value && element.getAttribute('type') === 'checkbox') {
					element.checked = value === 'on';
				} else if(value) {
					element.value = value;
				}
			}
		}
		inter.updateDisposition(override && override.signs);
		if(override && override.edit) {
			edit.importSettings(override.edit);
		}
	},
	
	initializeElements: function() {
		for(var i in settings) {
			// prepare
			var setting = settings[i];
			var id = setting.attributes.id;
			if(!id) {
				continue;
			}
			var el = null;
			try {
				el = document.querySelector('#' + id);
			} catch(err) { /* no-op */ }
			if(el) {
				el.parentNode.removeChild(el);
			}
			el = document.createElement(setting.tagname);
			inter.els[id] = el;
			
			if(setting.html) {
				el.innerHTML = setting.html;
			}
			// set
			for(var a in setting.attributes) {
				el.setAttribute(a, setting.attributes[a]);
			}
			el.setAttribute('name', id);
			
			var label = false;
			if(setting.label) {
				label = document.createElement('label');
				label.innerText = setting.label;
				label.setAttribute('for', id);
				if(setting.unit) {
					label.innerHTML += ' <small>(' + setting.unit + ')</small>';
				}
			}
						
			if(inter.els[setting.parent]) {
				parent = inter.els[setting.parent];
			} else {
				parent = document.querySelector(setting.parent);
				if(!parent) {
					parent = document.body;
				}
			}
			
			if(!setting.noWrapper) {
				var wrapper = document.createElement('div');
				wrapper.classList.add('wrapper');
				wrapper.title = setting.attributes.title ? setting.attributes.title : '';
				parent.appendChild(wrapper);
				parent = wrapper;
				if(inter.exposeIDs) {
					var exposed = document.createElement('small');
					exposed.innerText = '#' + setting.attributes.id;
					parent.appendChild(exposed);
				}
			}
			
			var imgCont = null;
			if(setting.icon) {
				var img = null;
				var imgCont = document.createElement('label');
				imgCont.classList.add('icon');
				imgCont.setAttribute('for', id);
				img = document.createElement('img');
				img.src = setting.icon;
				imgCont.appendChild(img);
			}
			
			// append
			if(imgCont) { parent.appendChild(imgCont); }
			if(label) {
				label.appendChild(el);
				parent.appendChild(label);
			} else {
				parent.appendChild(el);				
			}

			if(setting.tagname === 'select') {
				for(var value in setting.options) {
					var option = document.createElement('option');
					option.setAttribute('value', value);
					option.innerText = setting.options[value];
					el.appendChild(option);
				}
			}
			
			el.addEventListener('change', inter.delayedStoreSettings);
		}
		inter.els.settingsMode.addEventListener('change', inter.updateSettingsMode);
		inter.els.disposition.addEventListener('change', inter.updateDisposition);
		inter.els.offset.addEventListener('change', inter.updateShift);
		inter.els.zoffset.addEventListener('change', inter.updateShift);
		inter.els.slices.addEventListener('change', inter.updateDisposition);
	},

	updateShift: function() {
		clearTimeout(inter.updateShift.timeout);
		inter.updateShift.timeout = setTimeout(placer.shift, 100);
	},

	updateDisposition: function(override) {
		clearTimeout(inter.updateDisposition.timeout);
		inter.updateDisposition.timeout = setTimeout(function() {
			placer.arrange(inter.els.disposition.value, override);
		}, 100);
	},

	updateSettingsMode: function() {
		if(inter.els.settingsMode.value > 1) {
			inter.els.mediumSettings.style.display = 'block';
		} else {
			inter.els.mediumSettings.style.display = 'none';
		}
		if(inter.els.settingsMode.value > 2) {
			inter.els.advancedSettings.style.display = 'block';
		} else {
			inter.els.advancedSettings.style.display = 'none';
		}
		if(inter.els.settingsMode.value > 3) {
			inter.els.insaneSettings.style.display = 'block';
		} else {
			inter.els.insaneSettings.style.display = 'none';
		}
	},
	
	getRect: function(el) {
		var rect = el.getBoundingClientRect();
		rect.x += window.scrollX;
		rect.y += window.scrollY;
		return rect;
	},

};

window.addEventListener('load', inter.init);
