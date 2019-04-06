L.Control.GeodirGoToXY  = L.Control.extend({
	includes: L.Mixin.Events,
	options:{
		container: '',
		position: 'topleft',
		showlabel: true,
		decimals:4,
		
		textLatitud: 'Latitud',
		textLongitud: 'Longitud',
		
		textDegreesX: 'grados',
		textMinutesX: 'minutos',
		textSecondsX: 'segundos',
		textDegreesY: 'grados',
		textMinutesY: 'minutos',
		textSecondsY: 'segundos',
		
		textUTMEasting: 'Este',
		textUTMNorthing: 'Norte',
		textUTMSelectZone: 'Zona escoger',
		textZoneNum:'Zona',
		textZoneChar:'Zona letra',
		
		textHemisferio:'Hemisferio',
		textZoom: 'Zoom',
		textTitle: 'Buscar coordenadas',
		zoomDefault: 12,
		showZoom: false,
		showTitle: false,
		autoRemoveSarch : true,	
		searchDefault: 'latitud_longitude',
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
				this.options.textTitle, 
				
				this.options.textDegreesX, 
				this.options.textMinutesX, 
				this.options.textSecondsX,
				this.options.textDegreesY, 
				this.options.textMinutesY, 
				this.options.textSecondsY,
				
				this.options.textUTMEasting, this.options.textUTMNorthing,  this.options.textUTMSelectZone ,  this.options.textZoneNum, this.options.textZoneChar,
				this.options.textHemisferio);
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
			textLongitud, textZoom, zoomDefault, textTitle, 
			
			textDegreesX, textMinutesX, textSecondsX,textDegreesY, textMinutesY, textSecondsY,
			textUTMEasting, textUTMNorthing, textUTMSelectZone, textZoneNum, textZoneChar, textHemisferio){
		let divGoToXY = L.DomUtil.create('div', 'gotoXY-search', this._container );
		divGoToXY.style.display = 'none';
		
		let divTitle = this._createDivTitle(textTitle, divGoToXY );
		let divZoom = this._createDivZoom(showlabel,textZoom, zoomDefault, divGoToXY);
		if(!this.options.showZoom){
			divZoom.style.display = 'none';
		}
		this.divOptions = this._createDivOption(divGoToXY);
		this.divSearchLatLng = this._createDivCoordinates(showlabel, decimals, textLatitud, textLongitud, divGoToXY);
		this.divSearchUTM = this._createDivUTM(showlabel, decimals, textUTMEasting, textUTMNorthing, textUTMSelectZone , textZoneNum, textZoneChar,textHemisferio, divGoToXY);
		this.divSearchDegrees = this._createDivDegrees(showlabel,textDegreesX, textMinutesX, textSecondsX,textDegreesY, textMinutesY, textSecondsY, divGoToXY);
		
		if(this.options.searchDefault == 'latitud_longitude'){
			this._activeGEO();
		}else{
			this._activeUTM();
		}
			
		return divGoToXY;
	},
	
	_createDivTitle : function(textTitle, container){
		let divTitle = L.DomUtil.create('div', 'gotoXY-title', container );
		if(this.options.showTitle){
			divTitle.innerHTML = "<b>"+textTitle+"</b>";
		}
		
		
		let closeButton = L.DomUtil.create('a', 'gotoXY-close', divTitle);
		closeButton.href = "#";
		closeButton.innerHTML = "<span class='sigvial-icon-cancel-02'></span>";//imageless(see css)
		L.DomEvent.on(closeButton, 'click', L.DomEvent.stop, this)
					.on(closeButton, 'click', this.close, this);
		
		return divTitle;
	},
	
	_createDivOption : function(container){
		let divOptions = L.DomUtil.create('div', 'btn-group', container );
		
		this._optionGeografica = L.DomUtil.create('a', 'btn btn-primary btn-sm active', divOptions);
		this._optionGeografica.style.cursor = "pointer";
		this._optionGeografica.innerHTML=' GEO ';
		
		L.DomEvent
				.on(this._optionGeografica, 'click', L.DomEvent.stop, this)
				.on(this._optionGeografica, 'click', this._activeGEO, this);
		
		
		this._optionUTM = L.DomUtil.create('a', 'btn btn-primary btn-sm notActive', divOptions);
		this._optionUTM.style.cursor = "pointer";
		this._optionUTM.innerHTML=' UTM ';
		
		L.DomEvent
				.on(this._optionUTM, 'click', L.DomEvent.stop, this)
				.on(this._optionUTM, 'click', this._activeUTM, this);
		
		
		this._optionDegrees = L.DomUtil.create('a', 'btn btn-primary btn-sm notActive', divOptions);
		this._optionDegrees.style.cursor = "pointer";
		this._optionDegrees.innerHTML=' Gº ';
		
		L.DomEvent
			.on(this._optionDegrees, 'click', L.DomEvent.stop, this)
			.on(this._optionDegrees, 'click', this._activeDegrees, this);
		
		return divOptions;
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
	
	_createDivDegrees : function(showlabel, textDegreesX, textMinutesX, textSecondsX,textDegreesY, textMinutesY, textSecondsY, container){
		let divCoordinates = L.DomUtil.create('div', 'gotoXY-div', container );
		let labelDegreesY = null;
		if(showlabel){
			labelDegreesY = L.DomUtil.create('label', 'gotoXY-label', divCoordinates);
			labelDegreesY.innerHTML = textDegreesY;
		}
		
		this._optionGeograficax = L.DomUtil.create('label', 'latlng', divCoordinates);
		this._optionGeograficax.innerHTML='Latitud';
		
		
		this._inputDegreesY = L.DomUtil.create('input', 'gotoXY-g', divCoordinates);
		this._inputDegreesY.type = 'number';
		this._inputDegreesY.type = 'number';
		this._inputDegreesY.size = 3;
		this._inputDegreesY.placeholder = textDegreesY;
		this._inputDegreesY.title = textDegreesY;
		this._inputDegreesY.step = 1;

		
		let labelMinutesY = null;
		if(showlabel){
			labelMinutesY = L.DomUtil.create('label', 'gotoXY-label', divCoordinates);
			labelMinutesY.innerHTML = textMinutesY;
		}
		this._inputMinutesY = L.DomUtil.create('input', 'gotoXY-g', divCoordinates);
		this._inputMinutesY.type = 'number';
		this._inputMinutesY.size = 3;
		this._inputMinutesY.step = 1;
		this._inputMinutesY.placeholder = textMinutesY;
		this._inputMinutesY.title = textMinutesY;
		
		let labelSecondsY = null;
		if(showlabel){
			labelSecondsY = L.DomUtil.create('label', 'gotoXY-label', divCoordinates);
			labelSecondsY.innerHTML = textSecondsY;
		}
		this._inputSecondsY = L.DomUtil.create('input', 'gotoXY-g', divCoordinates);
		this._inputSecondsY.type = 'number';
		this._inputSecondsY.size = 3;
		this._inputSecondsY.step = 1;
		this._inputSecondsY.placeholder = textSecondsY;
		this._inputSecondsY.title = textSecondsY;
		
		
		let divNorteSur = L.DomUtil.create('div', 'NorteSur', divCoordinates );
		divNorteSur.id = 'degreeNorteSur';		
		
		let labelSur = L.DomUtil.create('label', 'gotoXY-label', divNorteSur);
		labelSur.innerHTML = 'Sur';
		this._optionSur = L.DomUtil.create('input', 'gotoXY-i', divNorteSur);
		this._optionSur.checked = 'true';
		this._optionSur.type = 'radio';
		this._optionSur.name = 'optionNS';
		
		let labelNorte = L.DomUtil.create('label', 'gotoXY-label', divNorteSur);
		labelNorte.innerHTML = 'Norte';
		this._optionNorte = L.DomUtil.create('input', 'gotoXY-i', divNorteSur);
		this._optionNorte.type = 'radio';
		this._optionNorte.name = 'optionNS';
		
		let br = L.DomUtil.create('br', '', divCoordinates);
		
		this._optionGeograficas = L.DomUtil.create('label', 'latlng', divCoordinates);
		this._optionGeograficas.innerHTML='Longitud';
		
		let labelDegreesX = null;
		if(showlabel){
			labelDegreesX = L.DomUtil.create('label', 'gotoXY-label', divCoordinates);
			labelDegreesX.innerHTML = textDegreesX;
		}
		this._inputDegreesX = L.DomUtil.create('input', 'gotoXY-g', divCoordinates);
		this._inputDegreesX.type = 'number';
		this._inputDegreesX.size = 3;
		this._inputDegreesX.step = 1;
		this._inputDegreesX.placeholder = textDegreesX;
		this._inputDegreesX.title = textDegreesX;
		
		let labelMinutesX = null;
		if(showlabel){
			labelMinutesX = L.DomUtil.create('label', 'gotoXY-label', divCoordinates);
			labelMinutesX.innerHTML = textMinutesX;
		}
		this._inputMinutesX = L.DomUtil.create('input', 'gotoXY-g', divCoordinates);
		this._inputMinutesX.type = 'number';
		this._inputMinutesX.size = 3;
		this._inputMinutesX.step = 1;
		this._inputMinutesX.placeholder = textMinutesX;
		this._inputMinutesX.title = textMinutesX;
		
		let labelSecondsX = null;
		if(showlabel){
			labelSecondsX = L.DomUtil.create('label', 'gotoXY-label', divCoordinates);
			labelSecondsX.innerHTML = textSecondsX;
		}
		this._inputSecondsX = L.DomUtil.create('input', 'gotoXY-g', divCoordinates);
		this._inputSecondsX.type = 'number';
		this._inputSecondsX.size = 3;
		this._inputSecondsX.step = 1;
		this._inputSecondsX.placeholder = textSecondsX;
		this._inputSecondsX.title = textSecondsX;

		let divEsteOeste = L.DomUtil.create('div', 'NorteSur', divCoordinates );
		divEsteOeste.id = 'degreeEsteOeste';	
		
		let labelOeste = L.DomUtil.create('label', 'gotoXY-label', divEsteOeste);
		labelOeste.innerHTML = 'Oeste';
		this._optionOeste = L.DomUtil.create('input', 'gotoXY-i', divEsteOeste);
		this._optionOeste.type = 'radio';
		this._optionOeste.name = 'optionEO';
		
		let labelEste = L.DomUtil.create('label', 'gotoXY-label', divEsteOeste);
		labelEste.innerHTML = 'Este';
		this._optionEste = L.DomUtil.create('input', 'gotoXY-i', divEsteOeste);
		this._optionEste.checked = 'true';
		this._optionEste.type = 'radio';
		this._optionEste.name = 'optionEO';

		let br1 = L.DomUtil.create('br', '', divCoordinates);
		
		
		let divButtonSearch = L.DomUtil.create('div', 'container-search', divCoordinates)
		let button = L.DomUtil.create('a', 'search-button btn btnQuitar', divButtonSearch);
		button.innerHTML = 'Buscar';
		button.href = '#';
		L.DomEvent
			.on(button, 'click', L.DomEvent.stop, this)
			.on(button, 'click', this._handleDegreesSubmit, this);
		
		return divCoordinates;
	},
	
	_createDivUTM: function(showlabel, decimals, textUTMEasting, textUTMNorthing, textUTMSelectZone, txtZoneNum, txtZoneChar, txtHemisferio, container){
		let divCoordinates = L.DomUtil.create('div', 'gotoXY-div', container );
		
		let step;
		if(decimals > 6){
			step = 0.000001 
		}else{
			for(step ='0'; step.length < decimals -1; step +='0'){
			}
			step = '0.'+step+'1';
		}
		
		//**********EASTING************//
		let labelEasting = null;
		if(showlabel){
			labelEasting = L.DomUtil.create('label', 'gotoXY-label', divCoordinates);
			labelEasting.innerHTML  = textUTMEasting;
		}
		
		this._inputEasting = L.DomUtil.create('input', 'gotoXY-input', divCoordinates);
		this._inputEasting.type = 'number';
		this._inputEasting.size = this._inputCoordinatesMinSize + 4;
		this._inputEasting.step = step;
		
		if(labelEasting == null){
			this._inputEasting.placeholder = textUTMEasting;
			this._inputEasting.title = textUTMEasting;
		}
		
		L.DomEvent
				.disableClickPropagation(this._inputEasting)
				.on(this._inputEasting, 'keydown', this._handleKeypressUTM, this);
		
		//**********NORTHING************//
		let labelNorthing = null;
		if(showlabel){
			labelNorthing = L.DomUtil.create('label', 'gotoXY-label', divCoordinates);
			labelNorthing.innerHTML  = textUTMNorthing;
		}
		
		this._inputNorthing = L.DomUtil.create('input', 'gotoXY-input', divCoordinates);
		this._inputNorthing.type = 'number';
		this._inputNorthing.size = this._inputCoordinatesMinSize + 4;
		this._inputNorthing.step = step;
		
		if(labelNorthing == null){
			this._inputNorthing.placeholder = textUTMNorthing;
			this._inputNorthing.title = textUTMNorthing;
		}
		
		L.DomEvent
				.disableClickPropagation(this._inputNorthing)
				.on(this._inputNorthing, 'keydown', this._handleKeypressUTM, this);
		
		let br = L.DomUtil.create('br', '', divCoordinates);
		
		
		//**********ZONE NUM************//
		let labelUTMSelecZone = null;
		this._textUTMSelect = L.DomUtil.create('select', 'gotoXY-input', divCoordinates);
		
		var option = document.createElement("option");
		option.text = "17 Sur";		
		var option2 = document.createElement("option");
		option2.text = "18 Sur";
		var option3 = document.createElement("option");
		option3.text = "19 Sur";
		var option4 = document.createElement("option");
		option4.text = "18 Sur L";
		var option5 = document.createElement("option");
		option5.text = "18 Sur M";
		var option6 = document.createElement("option");
		option6.text = "18 Sur N";
		
		this._textUTMSelect.add(option);
		this._textUTMSelect.add(option2);
		this._textUTMSelect.add(option3);
		this._textUTMSelect.add(option4);
		this._textUTMSelect.add(option5);
		this._textUTMSelect.add(option6);
		
		if(labelUTMSelecZone == null){
			this._textUTMSelect.placeholder = textUTMSelectZone;
			this._textUTMSelect.title = textUTMSelectZone;
		}
		
		L.DomEvent
		.disableClickPropagation(this._textUTMSelect)
		.on(this._textUTMSelect, 'keydown', this._handleKeypressUTM, this);
		
		let divButtonSearch = L.DomUtil.create('div', 'container-search', divCoordinates)
		let button = L.DomUtil.create('a', 'search-button btn btnQuitar', divButtonSearch);
		button.innerHTML = 'Buscar';
		button.href = '#';
		L.DomEvent
			.on(button, 'click', L.DomEvent.stop, this)
			.on(button, 'click', this._handleUTMSubmit, this);
		
		
		return divCoordinates;
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
		
		let divButtonSearch = L.DomUtil.create('div', 'container-search', divCoordinates)
		let button = L.DomUtil.create('a', 'search-button btn btnQuitar', divButtonSearch);
		button.innerHTML = 'Buscar';
		button.href = '#';
		L.DomEvent
			.on(button, 'click', L.DomEvent.stop, this)
			.on(button, 'click', this._handleSubmit, this);
		
		return divCoordinates;
	},
	
	
	
	close: function(){
		if(this._divGoToXY.style.display  ==  'block'){
			this._divGoToXY.style.display = 'none';
			this._button.style.display = 'block';
		}
		return this;
	},
	
	_activeGEO: function(){
		this._optionGeografica.className  = 'btn btn-primary btn-sm active';
		this.divSearchLatLng.style.display = 'block';
		this._optionUTM.className = 'btn btn-primary btn-sm notActive';
		this.divSearchUTM.style.display = 'none';
		this._optionDegrees.className = 'btn btn-primary btn-sm notActive';
		this.divSearchDegrees.style.display = 'none';
	},
	
	_activeUTM: function(){
		this._optionGeografica.className = 'btn btn-primary btn-sm notActive';
		this.divSearchLatLng.style.display = 'none';
		this._optionUTM.className = 'btn btn-primary btn-sm active';
		this.divSearchUTM.style.display = 'block';
		this._optionDegrees.className = 'btn btn-primary btn-sm notActive';
		this.divSearchDegrees.style.display = 'none';
	},
	
	_activeDegrees: function(){
		this._optionGeografica.className = 'btn btn-primary btn-sm notActive';
		this.divSearchLatLng.style.display = 'none';
		this._optionUTM.className = 'btn btn-primary btn-sm notActive';
		this.divSearchUTM.style.display = 'none';
		this._optionDegrees.className = 'btn btn-primary btn-sm active';
		this.divSearchDegrees.style.display = 'block';
	},
	
	_showSearch: function(){
		this._button.style.display = 'none';
		this._divGoToXY.style.display = 'block';
		
		this._inputLatitud.value = '';
		this._inputLongitud.value = '';
		
		//this._inputHemisferio.value = '' ; 
		//this._inputZonNum.value = '';
		
		//this._selectZone.value = '' ;
		this._inputNorthing.value = '' ;
		this._inputEasting.value = '';
			
		this._inputDegreesY.value = '' ;
		this._inputMinutesY.value = '' ;
		this._inputSecondsY.value = '' ;
		this._inputDegreesX.value = '' ;
		this._inputMinutesX.value = '' ;
		this._inputSecondsX.value = '' ;

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
		}else{
			this._showAlertInsertInfo();
		}
	},
	
	_handleDegreesSubmit: function(){

		if(	this._inputDegreesY.value != '' && this._inputDegreesX.value != '' ){
			
			var valueNorteSur = parseInt(this._inputDegreesY.value) + this._inputMinutesY.value/60 + this._inputSecondsY.value/3600;			
			var valueEsteOeste = parseInt(this._inputDegreesX.value) + this._inputMinutesX.value/60 + this._inputSecondsX.value/3600;
					
			var valorConvertidoNS = parseFloat(valueNorteSur).toFixed(4);
			var valorConvertidoEO = parseFloat(valueEsteOeste).toFixed(4);

			if (valorConvertidoNS <= 90 && valorConvertidoNS >= -90){	
				
				if(this._optionNorte.checked){
					var valueNorteSurFinal = valorConvertidoNS ;
				}
				if(this._optionSur.checked){
					var valueNorteSurFinal = valorConvertidoNS * - 1;
				}

			}else{
				this._showAlert();	
			}

			if (valorConvertidoEO <=180 && valorConvertidoEO >=-180 ){
				
				if(this._optionEste.checked){
					var valueEsteOesteFinal = valorConvertidoEO  ;
				}
				if(this._optionOeste.checked){
					var valueEsteOesteFinal = valorConvertidoEO * -1;
				}

			}else{
				this._showAlert();				
			}

			let geom = Terraformer.WKT.parse("POINT ("+valueEsteOesteFinal+" "+valueNorteSurFinal+")"); 
			this._drawMarker(geom, this._inputZoom.value, valueEsteOesteFinal, valueNorteSurFinal );
		
		} else{
			this._showAlertInsertInfo();
		}
	
	},
	
	_handleUTMSubmit: function(){
		
		//Value seleccionado
		console.log('valor seleccionado utm');
		console.log(this._textUTMSelect.value);
		
		var zonaSelect = this._textUTMSelect.value.split(" "); 
		let numeroZona = zonaSelect[0];
		let valorZona = zonaSelect[1];
		console.log(numeroZona);
		console.log(valorZona);

		if(this._inputNorthing.value != '' && this._textUTMSelect.value != '' && this._inputEasting.value != ''){

				let southHemis = false;
				if(valorZona.toLowerCase() == 'sur'){
					southHemis = true;				
				}else{
					southHemis = false;
				}

				let utm = L.utm(this._inputEasting.value, this._inputNorthing.value, numeroZona , undefined, southHemis);
				let latlng = utm.latLng();
				if(latlng){
					let geom = Terraformer.WKT.parse("POINT ("+latlng.lng+" "+latlng.lat+")");
					this._drawMarker(geom, this._inputZoom.value, latlng.lng, latlng.lat );
				}else{
					this._showAlert();
				}

			
		}else{
			this._showAlertInsertInfo();
		}

	},
	
	_handleKeypress: function(e){
		switch(e.keyCode){
			case 13://Enter
				this._handleSubmit();	//do search
				break;
		}
		
		return this;
	},
	
	_handleKeypressUTM: function(e){
		switch(e.keyCode){
			case 13://Enter
				this._handleUTMSubmit();	//do search
				break;
		}
	
		return this;
	},
	
	_showAlert: function(){
		alert("La coordenada ingresada se encuentran fuera de rango.");
	},
	
	_showAlertInsertInfo: function(){
		alert("Ingrese valores"); 
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

L.control.geodirGotoXY = function(options){
	return new L.Control.GeodirGoToXY (options);
};

