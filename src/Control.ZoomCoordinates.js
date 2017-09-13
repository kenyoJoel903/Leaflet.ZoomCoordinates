L.Control.ZoomCoordinates  = L.Control.extend({
	
	options:{
		container: '',
		position: 'topleft',
		showlabel: true,
		decimals:4,
		textLatitud: 'Latitud',
		textLongitud: 'Longitud',
		textZoom: 'Zoom',
		textTitle: 'Search coordinates',
		zoomDefault: 12,
		autoRemoveSarch : true,	
		autoRemoveSarchTime : 10000,
	},
	
	initialize:  function(options){
		L.Util.setOptions(this, options || {});
		this._inputCoordinatesMinSize = this.options.decimals ? this.options.decimals + 4 : 9;
	},
	
	onAdd: function(map){
		this._map = map;
		this._container = L.DomUtil.create('div', 'leaflet-control-gotoxy');
		this._divGoToXY = this._createDivGoToXY(this.options.showlabel, 
				this.options.decimals, this.options.textLatitud,
				this.options.textLongitud, this.options.textZoom, this.options.zoomDefault,
				this.options.textTitle);
		this._button = this._createButton(this.options.textTitle, 'gotoxy-button' );
		
		return this._container;
	},
	
	addTo: function (map) {
		if(this.options.container) {
			this._container = this.onAdd(map);
			this._wrapper = L.DomUtil.get(this.options.container);
			this._wrapper.style.position = 'relative';
			this._wrapper.appendChild(this._container);
		}
		else
			L.Control.prototype.addTo.call(this, map);

		return this;
	},
	
	onRemove: function(map) {
		console.log("onRemove");
	},
	
	_createButton: function(textTitle, className){
		let button = L.DomUtil.create('a', className, this._container);
		button.href = '#';
		button.title = textTitle;
		L.DomEvent
				.on(button, 'click', L.DomEvent.stop, this)
				.on(button, 'click', this._showSearch, this)
		
		return button;
	},
	
	_createDivGoToXY: function(showlabel, decimals, textLatitud,
			textLongitud, textZoom, zoomDefault, textTitle){
		let divGoToXY = L.DomUtil.create('div', 'gotoXY-search', this._container );
		divGoToXY.style.display = 'none';
		
		let divTitle = this._createDivTitle(textTitle, divGoToXY );
		let divZoom = this._createDivZoom(showlabel,textZoom, zoomDefault, divGoToXY);
		let divCoordinates = this._createDivCoordinates(showlabel, decimals, textLatitud, textLongitud, divGoToXY);
			
		return divGoToXY;
	},
	
	_createDivTitle : function(textTitle, container){
		let divTitle = L.DomUtil.create('div', 'gotoXY-title', container );
		divTitle.innerHTML = "<b>"+textTitle+"</b>";
		
		let closeButton = L.DomUtil.create('a', 'gotoXY-close', divTitle);
		closeButton.href = "#";
		closeButton.innerHTML = "<span>&otimes;</span>";//imageless(see css)
		L.DomEvent.on(closeButton, 'click', L.DomEvent.stop, this)
					.on(closeButton, 'click', this.close, this);
		
		return divTitle;
	},
	
	_createDivZoom: function(showlabel, textZoom, zoomDefault, divContainer){
		let divZoom = L.DomUtil.create('div', 'gotoXY-div', divContainer );
		let label = null;
		if(showlabel){
			label = L.DomUtil.create('label', 'gotoXY-label', divZoom);
			label.innerHTML  = textZoom;
		}
		
		this._inputZoom = L.DomUtil.create('input', 'gotoXY-input', divZoom);
		this._inputZoom.type = 'number';
		this._inputZoom.size = 6;
		this._inputZoom.value = zoomDefault;
		this._inputZoom.max = 4;
		this._inputZoom.min = 18;
		this._inputZoom.step = 1;
		if(label == null)
			this._inputZoom.placeholder = textZoom;
		
		L.DomEvent
			.disableClickPropagation(this._inputZoom)
			.on(this._inputZoom, 'keydown', this._handleKeypress, this);
		
		return divZoom;
	},
	
	_createDivCoordinates: function(showlabel, decimals, textLatitud, textLongitud, container ){
		let divCoordinates = L.DomUtil.create('div', 'gotoXY-div', container );
		
		let step;
		if(decimals > 6){
			step = 0.000001 
		}else{
			for(step ='0'; step.length < decimals -1; step +='0'){
			}
			step = '0.'+step+'1';
		}
		
		let labelLat = null;
		if(showlabel){
			labelLat = L.DomUtil.create('label', 'gotoXY-label', divCoordinates);
			labelLat.innerHTML  = textLatitud;
		}
		
		this._inputLatitud = L.DomUtil.create('input', 'gotoXY-input', divCoordinates);
		this._inputLatitud.type = 'number';
		this._inputLatitud.size = this._inputCoordinatesMinSize;
		this._inputLatitud.max = 90;
		this._inputLatitud.min = -90;
		this._inputLatitud.step = step;
		if(labelLat == null){
			this._inputLatitud.placeholder = textLatitud;
			this._inputLatitud.title = textLatitud;
		}
			
		
		L.DomEvent
			.disableClickPropagation(this._inputLatitud)
			.on(this._inputLatitud, 'keydown', this._handleKeypress, this);
		
		let labelLng = null;
		if(showlabel){
			labelLng = L.DomUtil.create('label', 'gotoXY-label', divCoordinates);
			labelLng.innerHTML  = textLongitud;
		}
		
		this._inputLongitud = L.DomUtil.create('input', 'gotoXY-input', divCoordinates);
		this._inputLongitud.type = 'number';
		this._inputLongitud.size = this._inputCoordinatesMinSize;
		this._inputLongitud.max = 180;
		this._inputLongitud.min = -180;
		this._inputLongitud.step = step;
		if(labelLng == null){
			this._inputLongitud.placeholder = textLongitud;
			this._inputLongitud.title = textLongitud;
		}
			
		
		L.DomEvent
			.disableClickPropagation(this._inputLongitud)
			.on(this._inputLongitud, 'keydown', this._handleKeypress, this);
		
		let button = L.DomUtil.create('a', 'search-button', divCoordinates);
		button.href = '#';
		L.DomEvent
			.on(button, 'click', L.DomEvent.stop, this)
			.on(button, 'click', this._handleSubmit, this);
		
		return divCoordinates;
	},
	
	close: function(){
		if(this._divGoToXY.style.display  =  'block'){
			this._divGoToXY.style.display = 'none';
			this._button.style.display = 'block';
		}
		return this;
	},
	
	_showSearch: function(){
		this._button.style.display = 'none';
		this._divGoToXY.style.display = 'block';
		this._inputLatitud.value = '';
		this._inputLongitud.value = '';
		return this;
	},
	
	_handleSubmit: function(){
		if(this._inputLatitud.value != '' &&  this._inputLongitud.value != '' 
			&& this._inputZoom.value != ''){
			
			if(this._inputLatitud.value <= 90 && this._inputLatitud.value >= -90){
				if(this._inputLongitud.value <= 180 && this._inputLongitud.value >= -180){
					let geom = Terraformer.WKT.parse("POINT ("+this._inputLongitud.value+" "+this._inputLatitud.value+")");
					this._drawMarker(geom, this._inputZoom.value, this._inputLongitud.value, this._inputLatitud.value );
				}else{
					this._showAlert();
				}
			}else{
				this._showAlert();
			}
			
			
			
		}
	},
	
	_handleKeypress: function(e){
		switch(e.keyCode){
			case 13://Enter
				this._handleSubmit();	
				break;
		}
		
		return this;
	},
	
	_showAlert: function(){
		alert("La coordenada ingresada se encuentran fuera de rango.");
	},
	
	_drawMarker: function(geojson, zoom, lng, lat){
		var self = this;
		this.currentSearchLayer = L.geoJSON(geojson).addTo(self._map);
		self._map.flyTo([lat, lng] , zoom);
		this._removeGeometry(this.currentSearchLayer);
		return self;
	},
	
	_removeGeometry: function(layer){
		var self = this;
		if(this.options.autoRemoveSarch){
			setTimeout(function(){ 
				try {
					self._map.removeLayer(layer);
				} catch (e) {
					console.log("Delete layer search error "+e);
				}
			}, this.options.autoRemoveSarchTime);
		}
	}
	
});

L.control.zoomcoordinates = function (options) {
    return new L.Control.ZoomCoordinates(options);
};
