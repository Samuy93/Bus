/*
 * Test URLS working
 * http://www.montevideo.gub.uy/ubicacionesRestProd/calles?nombre=LECOCQ
 * http://www.montevideo.gub.uy/transporteRestProd/pasadas/4201/SABADO/12:45
 * http://www.montevideo.gub.uy/transporteRestProd/lineas/4458
 */

window.location.href.indexOf("#") != -1 && window.location.replace(window.location.href.split("#")[0]);
var hostProd = "www.montevideo.gub.uy/aquehorapasa",
	proxyURL = "",
	geoserverHost = "geoweb.montevideo.gub.uy",
	currentHost = hostProd,
	restServiceURL = "/aquehorapasa/aqhpRestWEB",
	ubicacionesRestServiceURL = "/ubicacionesRestProd",
	transporteRestServiceURL = "/transporteRestProd",
	restServiceURL = {
		ubicaciones: ubicacionesRestServiceURL,
		transporte: transporteRestServiceURL
	},
	geoserverWMSCacheURL = "http://" + geoserverHost + "/geoserver/gwc/service/wms",
	geoserverWMSURL = "http://" + currentHost + "/geoserver/wms",
	geoserverGetInfoWMSURL =
	"http://" + currentHost + "/geoserver/wms",
	MDEO_MAX_EXTENT = new OpenLayers.Bounds(-2.003750834E7, -2.003750834E7, 2.003750834E7, 2.003750834E7),
	IM_LON = -6254693.6073798165,
	IM_LAT = -4151052.5970040187,
	UBICACION_ICON_URL = "./resources/images/marcador_origen.png",
	DEFAULT_LOAD_MSG = "Cargando",
	LOCATE_LOAD_MSG = "Obteniendo ubicaci\u00f3n";
var localHost = "10.191.0.16",
	mobileHost = "192.168.1.10",
	reqHost = mobileHost,
	selectedFeature = null,
	reqURL, selectedCalle, selectedEsquina, selectedPoint, markers = null,
	currentPositionMarker = null,
	icon, geoLocateAtShow = !0,
	hideLink = !1;
$("#searchpage").live("pageinit", function() {
	$.mobile.loadingMessage = DEFAULT_LOAD_MSG;
	getCurrentTime()
});
$("#searchpage").live("pageshow", function(a, b) {
	var c = OpenLayers.Util.getParameters(window.location.href).codigoParada;
	hideLink = c != void 0;
	c && ($("#query").val(c), reqURL = restServiceURL.transporte + "/lineas/" + $("#query")[0].value, reqRESTService(reqURL, loadLineas));
	selectedFeature != void 0 && $("#query")[0].value == "" && (hideLink = !1, $("#query").val(selectedFeature.data.cod_ubic_parada));
	$("#query").bind("change", function() {
		$("#query")[0].value !== "" && (hideLink = !1, reqURL = restServiceURL.transporte + "/lineas/" + $("#query")[0].value,
			reqRESTService(reqURL, loadLineas))
	});
	$("#lineaSelectId").bind("change", function(a) {
		hideLink = !0;
		updateResults(a, !1)
	});
	$("#picker_horasInputId").bind("change", function(a) {
		hideLink = !0;
		updateResults(a, !1)
	});
	$("#tipoDiaSelectId").bind("change", function(a) {
		hideLink = !0;
		updateResults(a, !1)
	});
	$("#searchpage").die("pageshow", arguments.callee)
});

function fixContentHeight() {
	var a = $("div[data-role='footer']:visible"),
		b = $("div[data-role='content']:visible:visible"),
		c = $(window).height(),
		d = c - a.outerHeight();
	b.outerHeight() + a.outerHeight() !== c && (d -= b.outerHeight() - b.height() + 1, b.height(d));
	window.map && window.map instanceof OpenLayers.Map ? map.updateSize() : (init(function(a) {
		a.features && a.features.length && (selectedFeature = a.features[0], reqURL = restServiceURL.transporte + "/lineas/" + selectedFeature.data.cod_ubic_parada, reqRESTService(reqURL, loadLineas),
			$.mobile.changePage("#searchpage"), $("#query").val(selectedFeature.data.cod_ubic_parada))
	}), initLayerList())
}
$("#mappage").live("pageinit", function() {
	$("#plus").click(function() {
		map.zoomIn()
	});
	$("#minus").click(function() {
		map.zoomOut()
	});
	$("#locate").click(doGeolocate);
	OpenLayers.Map.prototype.getCurrentSize = function() {
		var a = $(this.div);
		return new OpenLayers.Size(a.width(), a.height())
	};
	$(window).bind("orientationchange resize", fixContentHeight);
	fixContentHeight()
});
$("#mappage").live("pageshow", function() {
	geoLocateAtShow && (doGeolocate(), geoLocateAtShow = !1);
	fixContentHeight()
});
$("#ubicacionpage").live("pageshow", function(a, b) {
	$("#queryCalle").bind("change", function(a) {
		$("#queryCalle")[0].value !== "" && searchCalle(a)
	});
	$("#queryEsquina").bind("change", function(a) {
		$("#queryEsquina")[0].value !== "" && searchEsquina(a)
	});
	$("#ubicacionpage").die("pageshow", arguments.callee)
});

function initLayerList() {
	$("#layerspage").page();
	$("<li>", {
		id: "carto_li_title",
		"data-role": "list-divider",
		text: "Cartograf\u00edas"
	}).appendTo("#layerslist");
	var a = map.getLayersBy("isBaseLayer", !0);
	$.each(a, function() {
		addLayerToList(this)
	});
	$("#layerslist").listview("refresh");
	map.events.register("addlayer", this, function(a) {
		a.layer.CLASS_NAME != "OpenLayers.Layer.Markers" && addLayerToList(a.layer)
	})
}

function addLayerToList(a) {
	var b = $("<li>", {
		"data-icon": "check",
		"class": a.visibility ? "checked" : ""
	}).append($("<a />", {
		text: a.name
	}).click(function() {
		$.mobile.changePage("#mappage");
		a.isBaseLayer ? a.map.setBaseLayer(a) : a.setVisibility(!a.getVisibility())
	})).appendTo("#layerslist");
	a.events.on({
		visibilitychanged: function() {
			$(b).toggleClass("checked")
		}
	})
}

function getHorariosJSON(a) {
	var b = proxyURL + getRestURLByInputJq($("#query")[0].value);
	console.log('mamamamamam' + b);
	$.getJSON(b, function(b) {
		$.each(b, function() {
			var a = this.pasada ? this.pasada : this;
			a.hora != -1 && $("<li>").hide().append($("<h3 />", {
				text: a.linea
			})).append($("<p/>", {
				html: a.destino
			})).append($("<h5 />", {
				html: a.horaDesc
			}).addClass("ui-li-aside")).appendTo("#search_results").click(function(b) {
				var c = $("#lineaSelectId:last").find("option").filter(function() {
					return jQuery.trim($(this).text()) == a.linea
				});
				c.prop("selected") ||
					(c.prop("selected", "selected"), $("#lineaSelectId").selectmenu("refresh"), updateResults(b, !1, !1))
			}).show()
		});
		$("#search_results").listview("refresh");
		(a == void 0 || !a) && updateLinkResult();
		$.mobile.hidePageLoadingMsg()
	}).error(function() {
		$.mobile.hidePageLoadingMsg();
		alert("Error al calcular horarios")
	});
	$("#searchpage").die("pageshow", arguments.callee)
}

function updateResults(a, b) {
	$("#search_results").empty();
	$("#resultContentDiv").trigger("collapse");
	$.mobile.showPageLoadingMsg();
	b || a.preventDefault();
	getHorariosJSON(hideLink);
	$("#resultContentDiv").trigger("expand")
}

function searchCalle(a) {
	var b = proxyURL + getRestURLUbicacionByInput("CALLE", escape($("#queryCalle")[0].value));
	$("#calle_search_results").empty();
	$.mobile.showPageLoadingMsg();
	a.preventDefault();
	$.getJSON(b, function(a) {
		$.each(a, function() {
			var a = this.infoUbicacionVia ? this.infoUbicacionVia : this;
			$("<li>").hide().append($("<h2 />", {
				text: a.nombre
			})).appendTo("#calle_search_results").click(function() {
				selectedCalle = a;
				$("#queryCalle").val(a.nombre);
				$("#calle_search_results").empty()
			}).show()
		});
		$("#calle_search_results").listview("refresh");
		$.mobile.hidePageLoadingMsg()
	})
}

function searchEsquina(a) {
	var b = proxyURL + getRestURLUbicacionByInput("CRUCES", selectedCalle.codigo, escape($("#queryEsquina")[0].value));
	$("#calle_search_results").empty();
	$.mobile.showPageLoadingMsg();
	a.preventDefault();
	$.getJSON(b, function(a) {
		$.each(a, function() {
			var a = this.infoUbicacionVia ? this.infoUbicacionVia : this;
			$("<li>").hide().append($("<h2 />", {
				text: a.nombre
			})).appendTo("#calle_search_results").click(function() {
				$.mobile.showPageLoadingMsg();
				selectedEsquina = a;
				$("#queryEsquina").val(a.nombre);
				$("#calle_search_results").empty();
				searchURL = getRestURLUbicacionByInput("ESQUINA", selectedCalle.codigo, selectedEsquina.codigo);
				reqRESTService(searchURL, gotoLocation)
			}).show()
		});
		$("#calle_search_results").listview("refresh");
		$.mobile.hidePageLoadingMsg()
	})
}

function gotoLocation(a) {
	geoLocateAtShow = !1;
	$.mobile.changePage("#mappage", {
		transition: "slideup"
	});
	$.mobile.hidePageLoadingMsg();
	a = new OpenLayers.LonLat(a.geom.coordinates[0], a.geom.coordinates[1]);
	a = a.transform(new OpenLayers.Projection("EPSG:32721"), map.getProjectionObject());
	addMarker(a);
	map.setCenter(a, 18)
}

function getCurrentTime() {
	reqURL = restServiceURL.transporte + "/hora/";
	reqRESTService(reqURL, setCurrentTime)
}

function addMarker(a) {
	var b = new OpenLayers.Size(31, 25),
		c = new OpenLayers.Pixel(-(b.w / 2) + 16, -b.h);
	markers == null ? (icon = new OpenLayers.Icon(UBICACION_ICON_URL, b, c), markers = new OpenLayers.Layer.Markers("Ubicacion"), map.addLayer(markers)) : markers.removeMarker(currentPositionMarker);
	currentPositionMarker = new OpenLayers.Marker(a, icon);
	markers.addMarker(currentPositionMarker)
}

function doGeolocate() {
	var a = map.getControlsBy("id", "locate-control")[0];
	$.mobile.loadingMessage = LOCATE_LOAD_MSG;
	$.mobile.showPageLoadingMsg();
	a.active ? a.getCurrentLocation() : a.activate()
}

function updateLinkResult() {
	$("#current_link").attr("href", "./parada/" + $("#query")[0].value);
	$("#current_link").css("visibility", "visible")
};
var map, mdeoCarto, osm_layer, demolayer, sm = new OpenLayers.Projection("EPSG:900913"),
	featureType = "v_uptu_paradas",
	typeName = "imm:" + featureType,
	geoserverWFSURL = "http://" + geoserverHost + "/geoserver/wfs",
	selectCtrl, paradas_wms, wmsGetFeatureInfoCtrl;
OpenLayers.ProxyHost = proxyURL;
var init = function(a) {
	new OpenLayers.Bounds(-6250640.4329, -4147229.89959, -6249423.41209, -4146643.48426);
	var b = new OpenLayers.Layer.Vector("GeoLocate Vector Layer", {}),
		c = MDEO_MAX_EXTENT,
		d = c.clone();
	new OpenLayers.Bounds(-6250640.4329, -4147229.89959, -6249423.41209, -4146643.48426);
	maxResolution = 156543.0339;
	var e = new OpenLayers.Control.Geolocate({
			id: "locate-control",
			geolocationOptions: {
				enableHighAccuracy: !1,
				maximumAge: 0,
				timeout: 7E3
			}
		}),
		f = {
			fillOpacity: 0.1,
			fillColor: "#000",
			strokeColor: "#f00",
			strokeOpacity: 0.6
		};
	e.events.register("locationupdated", this, function(a) {
		$.mobile.hidePageLoadingMsg();
		$.mobile.loadingMessage = DEFAULT_LOAD_MSG;
		b.removeAllFeatures();
		b.addFeatures([new OpenLayers.Feature.Vector(a.point, {}, {
			graphicName: "cross",
			strokeColor: "#f00",
			strokeWidth: 2,
			fillOpacity: 0,
			pointRadius: 10
		}), new OpenLayers.Feature.Vector(OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(a.point.x, a.point.y), a.position.coords.accuracy / 2, 50, 0), {}, f)]);
		map.zoomToExtent(b.getDataExtent())
	});
	e.events.register("locationfailed",
		this,
		function(a) {
			$.mobile.hidePageLoadingMsg();
			$.mobile.loadingMessage = DEFAULT_LOAD_MSG;
			var b = "",
				a = a.error;
			switch (a.code) {
				case a.TIMEOUT:
					b = "Tiempo de espera agotado";
					break;
				case a.POSITION_UNAVAILABLE:
					b = "Ubicaci\u00f3n no disponible";
					break;
				case a.PERMISSION_DENIED:
					b = "Permiso denegado";
					break;
				case a.UNKNOWN_ERROR:
					b = "Error desconocido"
			}
			alert("Error de geolocalizacion \n" + b)
		});
	e.events.register("locationuncapable", this, function() {
		$.mobile.hidePageLoadingMsg();
		$.mobile.loadingMessage = DEFAULT_LOAD_MSG;
		alert("Su dispositivo no es capaz de hallar su ubicacion")
	});
	c = {
		theme: null,
		controls: [new OpenLayers.Control.Attribution, new OpenLayers.Control.TouchNavigation({
			dragPanOptions: {
				enableKinetic: !0
			}
		}), e],
		projection: new OpenLayers.Projection("EPSG:900913"),
		units: "m",
		numZoomLevels: 20,
		maxResolution: maxResolution,
		maxExtent: c,
		restrictedExtent: d
	};
	map = new OpenLayers.Map("map", c);
	initLocalLayers();
	map.addLayers([mdeoCarto, osm_layer]);
	map.addLayers([paradas_wms, b]);
	addGetFeatureInfoCap(a);
	a = new OpenLayers.LonLat(IM_LON, IM_LAT);
	map.setCenter(a, 17)
};

function initLocalLayers() {
	osm_layer = new OpenLayers.Layer.OSM("OpenStreetMap", null, {
		transitionEffect: "resize"
	});
	mdeoCarto = new OpenLayers.Layer.WMS("Intendencia", geoserverWMSCacheURL, {
		width: 512,
		srs: "EPSG:900913",
		layers: "stm_carto_basica",
		height: 512,
		styles: "",
		format: "image/png",
		tiled: "true"
	}, {
		buffer: 0
	}, {
		transitionEffect: "resize"
	});
	paradas_wms = new OpenLayers.Layer.WMS("LAYER_PARADAS", geoserverWMSURL, {
		width: 512,
		srs: "EPSG:900913",
		layers: "imm:v_uptu_paradas",
		height: 512,
		styles: "stm_paradas_numero",
		format: "image/png",
		transparent: "true"
	})
}

function addGetFeatureInfoCap(a) {
	wmsGetFeatureInfoCtrl = new OpenLayers.Control.WMSGetFeatureInfo({
		url: geoserverGetInfoWMSURL,
		title: "Horarios en la parada",
		layers: [paradas_wms],
		queryVisible: !0,
		infoFormat: "application/vnd.ogc.gml",
		vendorParams: {
			buffer: 10
		}
	});
	wmsGetFeatureInfoCtrl.events.register("getfeatureinfo", this, a);
	map.addControl(wmsGetFeatureInfoCtrl);
	wmsGetFeatureInfoCtrl.activate()
};
var codigoParadaParam, horaParam, tDiaParam, lineaParam, cantidadRespuestasParam, responseJSON, paramArray;

function reqRESTService(a, b) {
	var c = new OpenLayers.Function.bind(function(a) {
		noExisteParada.apply(this, [a])
	}, this);
	return OpenLayers.Request.GET({
		url: a,
		params: null,
		success: createCallback(b),
		failure: c,
		scope: null
	})
}

function createCallback(a) {
	return OpenLayers.Function.bind(function(b) {
		formatJSON = new OpenLayers.Format.JSON;
		responseJSON = formatJSON.read(b.responseText);
		a.apply(this, [responseJSON])
	}, this)
}

function noExisteParada() {
	alert("El codigo de parada ingresado no es v\u00e1lido")
}

function getRestURLByInput(a) {
	var b, c;
	b = OpenLayers.Util.getElement("horasInputId").value;
	c = OpenLayers.Util.getElement("minutosInputId").value;
	horaParam = parseInt(b) * 100 + parseInt(c);
	cantidadRespuestasParam = OpenLayers.Util.getElement("respuestasInputId").value;
	tDiaParam = OpenLayers.Util.getElement("tipoDiaSelectId").value;
	lineaParam = OpenLayers.Util.getElement("lineaSelectId").value;
	codigoParadaParam = OpenLayers.Util.getElement("codigoParadaInputId").value;
	return restServiceURL.transporte + "/pasadas/" + a +
		"/" + tDiaParam + (lineaParam != 0 ? "/" + lineaParam : "") + "/" + b + ":" + c + "?max_respuestas=" + cantidadRespuestasParam
}

function getRestURLByInputJq(a) {
	var b, c;
	b = OpenLayers.Util.getElement("horasInputId").value.split(":")[0];
	c = OpenLayers.Util.getElement("horasInputId").value.split(":")[1];
	tDiaParam = OpenLayers.Util.getElement("tipoDiaSelectId").value;
	lineaParam = OpenLayers.Util.getElement("lineaSelectId").value;
	return restServiceURL.transporte + "/pasadas/" + a + "/" + tDiaParam + (lineaParam != 0 ? "/" + lineaParam : "") + "/" + b + ":" + c
}

function getRestURLUbicacionByInput(a, b, c) {
	var d = restServiceURL.ubicaciones + "/calles?nombre=" + b;
	a == "CRUCES" && (d = restServiceURL.ubicaciones + "/cruces/" + b + "/?nombre=" + c);
	a == "ESQUINA" && (d = restServiceURL.ubicaciones + "/esquina/" + b + "/" + c);
	return d
}

function loadLineas(a) {
	var b = OpenLayers.Util.getElement("lineaSelectId"),
		c = new Option("Todas", "0");
	$("#lineaSelectId").empty();
	$("#paradaDesc").empty();
	$("#paradaDesc").append(a.descripcion);
	if ($.isArray(a.lineas))
		for (index in b.options[0] = c, a.lineas) b.options[b.options.length] = new Option(a.lineas[index].descripcion, a.lineas[index].codigo);
	else b.options[b.options.length] = new Option(a.lineas.descripcion, a.lineas.codigo);
	b.selectedIndex = 0;
	$("#lineaSelectId").selectmenu("refresh");
	updateResults(null, !0)
}

function setCurrentTime(a) {
	$("#horasInputId").val(a.horaDesc);
	$("#tipoDiaSelectId").val(a.tipoDia);
	$("#tipoDiaSelectId").selectmenu("refresh")
}

function loadHorarios(a) {
	$.each(a, function() {
		this.hora != -1 && $("<li>").hide().append($("<h3 />", {
			text: this.linea
		})).append($("<p/>", {
			html: this.destino
		})).append($("<h5 />", {
			html: this.horaDesc
		}).addClass("ui-li-aside")).appendTo("#search_results").show()
	});
	$("#search_results").listview("refresh");
	$.mobile.hidePageLoadingMsg()
};