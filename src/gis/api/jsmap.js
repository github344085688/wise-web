'use strict';

define([
        'jquery',
        'lodash',
        './GoogleMapsV3'
], function($, _, _map){

	var LAYER_STYLE = {
			"BASE" : {"strokeColor" : "#AAAAAA", "strokeWeight" : 3, "strokeOpacity" : 1, "fillColor" : "#AAAAAA", "fillOpacity" : 0},
			//"LOCATION" : {"strokeColor" : "#00bb00", "strokeWeight" : 1, "strokeOpacity" : 1, "fillColor" : "#B8FA7D", "fillOpacity" : 1},
			"LOCATION" : {"strokeColor" : "#795046", "strokeWeight" : 1, "strokeOpacity" : 1, "fillColor" : "#EEDC82", "fillOpacity" : 1},
			"LOCATION3D" : {"strokeColor" : "#795046", "strokeWeight" : 1, "strokeOpacity" : 1, "fillColor" : "#87CEEB", "fillOpacity" : 1},
			"LOCATION2D" : {"strokeColor" : "#795046", "strokeWeight" : 1, "strokeOpacity" : 1, "fillColor" : "#EEDC82", "fillOpacity" : 1},
			"STAGING" : {"strokeColor" : "#966E0F", "strokeWeight" : 1, "strokeOpacity" : 1, "fillColor" : "#FFFFB4", "fillOpacity" : 1},
			"DOCK" : {"strokeColor" : "#69D46E", "strokeWeight" : 2, "strokeOpacity" : 1, "fillColor" : "#93FBBF", "fillOpacity" : 1},
			"PARKING" : {"strokeColor" : "#69D46E", "strokeWeight" : 2, "strokeOpacity" : 1, "fillColor" : "#93FBBF", "fillOpacity" : 1,'OccupyColor':'#ff7c00'},
			"ZONE" : {"strokeColor" : "#AAAAAA", "strokeWeight" : 2, "strokeOpacity" : 1, "fillColor" : "#AAAAAA", "fillOpacity" : 0},
			"OTHER" : {"strokeColor" : "#75B4D0", "strokeWeight" : 2, "strokeOpacity" : 1, "fillColor" : "#6AB3FB", "fillOpacity" : 0},
			"WEBCAM" : {"strokeColor" : "#F88F87", "strokeWeight" : 1, "strokeOpacity" : 0.2, "fillColor" : "#F88F87", "fillOpacity" : 0.2},
			"GHOST_POLYGON" : {"strokeColor" : "#337AB7", "strokeWeight" : 1, "strokeOpacity" : 0.2, "fillColor" : "#FFFFFF", "fillOpacity" : 0},
			"DEFAULT" : {"strokeColor" : "#AAAAAA", "strokeWeight" : 2, "strokeOpacity" : 1, "fillColor" : "#AAAAAA", "fillOpacity" : 0},
			
			"EMPTY_CTN" : {"strokeColor": "#FF8C00", "strokeWeight" : 1, "strokeOpacity": 1, "fillColor": "#F9BC73", "fillOpacity": 1},
			"FULL_CTN" : {"strokeColor": "#FF2222", "strokeWeight" : 1, "strokeOpacity": 1, "fillColor": "#F56262", "fillOpacity": 1},
			"HIGHTLIGHT_BORDER" : {"strokeColor": "#0BB30B", "strokeWeight" : 2, "strokeOpacity": 1},
			
			"LOAD_STATUS_LINE" : {"strokeColor" : "#077DE2", "strokeWeight" : 3, "strokeOpacity" : 0.8},
			"ROAD_MAIN" : {"strokeColor": '#DDDDDD', "strokeWeight": 10,
				            "icons": [{repeat: "1px", icon: {path: 'M -0.5,0 z', strokeColor: '#0159cf', strokeWeight: 1}},
				                    {repeat: "20px", icon: {path: 'M 0,-1 0,1', strokeColor: '#0159cf', strokeWeight: 1, scale: 4}},
				                    {repeat: "1px", icon: {path: 'M 0.5,0 z', strokeColor: '#0159cf', strokeWeight: 1}}]},
			"ROAD_SUB" : {"strokeColor": '#DDDDDD', "strokeWeight": 6,
							icons: [{repeat: "1px", icon: {path: 'M -0.5,0 z', strokeColor: '#0159cf', strokeWeight: 1}},
							        {repeat: "1px", icon: {path: 'M 0.5,0 z', strokeColor: '#0159cf', strokeWeight: 1}}]},
			
			"STATE_LINE" : {"strokeColor" : "#795046", "strokeWeight" : 1, "strokeOpacity" : 0.8, "fillColor" : "#EEDC82", "fillOpacity" : 0.8},
			"STATE_LINE_LIMIT" : {
				"INVENTORY" : [[179, 226, 255], [4, 94, 165]], //blue
				"DEMAND" : [[247, 207, 221], [233, 30, 99]],	//red
			},		//rgb
			"UTILIZATION_RATE" : {"used" : "#FF8B60", "free" : "#AAEA78"}
	};
	var LAYER_OPTION = {
			"BASE" : 		{noLabel : true, noGhostLabel : true, fitBounds : true, zIndexUp : -1, editDisable :true},
			"LOCATION" : 	{noLabel : true, labelZoomRange:[20,21], zIndexUp : 1},
			"LOCATION3D" : 	{noLabel : true, labelZoomRange:[20,21], zIndexUp : 1},
			"LOCATION2D" : 	{noLabel : true, labelZoomRange:[20,21], zIndexUp : 1},
			"STAGING" : 	{labelZoomRange:[20,21]},
			"DOCK" : 		{labelZoomRange:[19,21]},
			"PARKING" : 	{labelZoomRange:[19,21]},
			"ZONE" : 		{labelZoomRange:[18,19]},
			"OTHER" : 		{labelZoomRange:[20,21]},
			"STATE_LINE" : 	{labelZoomRange:[4, 6]},
			"ROAD" : 		{zoomRange:[18,21], editDeceive:false, zIndexUp : 2},
			"DEFAULT" : 	{labelZoomRange:[20,21]}
			
	};
	var WEBCAM_ICON = {
			"0" : [{url : "./assets/img/gis/webcam_0.png", anchor : {x : 5, y : 12}},
			       {url : "./assets/img/gis/webcam_red_0.png", anchor : {x : 5, y : 12}}],
	        "30" : [{url : "./assets/img/gis/webcam_30.png", anchor : {x : 11, y : 13}},
			       {url : "./assets/img/gis/webcam_red_30.png", anchor : {x : 11, y : 13}}],
	        "60" : [{url : "./assets/img/gis/webcam_60.png", anchor : {x : 13, y : 10}},
	               {url : "./assets/img/gis/webcam_red_60.png", anchor : {x : 13, y : 10}}],
	        "90" : [{url : "./assets/img/gis/webcam_90.png", anchor : {x : 12, y : 5}},
			       {url : "./assets/img/gis/webcam_red_90.png", anchor : {x : 12, y : 5}}],
	        "120" : [{url : "./assets/img/gis/webcam_120.png", anchor : {x : 13, y : 10}},
			       {url : "./assets/img/gis/webcam_red_120.png", anchor : {x : 13, y : 10}}],
	        "150" : [{url : "./assets/img/gis/webcam_150.png", anchor : {x : 11, y : 13}},
			       {url : "./assets/img/gis/webcam_red_150.png", anchor : {x : 11, y : 13}}],
	        "180" : [{url : "./assets/img/gis/webcam_180.png", anchor : {x : 5, y : 12}},
	               {url : "./assets/img/gis/webcam_red_180.png", anchor : {x : 5, y : 12}}],
	               
	        "-30" : [{url : "./assets/img/gis/webcam_n30.png", anchor : {x : 11, y : 13}},
			       {url : "./assets/img/gis/webcam_red_n30.png", anchor : {x : 11, y : 13}}],
	        "-60" : [{url : "./assets/img/gis/webcam_n60.png", anchor : {x : 13, y : 10}},
			       {url : "./assets/img/gis/webcam_red_n60.png", anchor : {x : 13, y : 10}}],
	        "-90" : [{url : "./assets/img/gis/webcam_n90.png", anchor : {x : 12, y : 5}},
			       {url : "./assets/img/gis/webcam_red_n90.png", anchor : {x : 12, y : 5}}],
	        "-120" : [{url : "./assets/img/gis/webcam_n120.png", anchor : {x : 13, y : 10}},
	               {url : "./assets/img/gis/webcam_red_n120.png", anchor : {x : 13, y : 10}}],
	        "-150" : [{url : "./assets/img/gis/webcam_n150.png", anchor : {x : 11, y : 13}},
			       {url : "./assets/img/gis/webcam_red_n150.png", anchor : {x : 11, y : 13}}],
	        "-180" : [{url : "./assets/img/gis/webcam_n180.png", anchor : {x : 5, y : 12}},
		           {url : "./assets/img/gis/webcam_red_n180.png", anchor : {x : 5, y : 12}}],
	};
	var EQUIPMENT_ICON = {
			"PRINTER" : [{url : "./assets/img/gis/printer.png", anchor : {x : 13, y : 12}},
					     {url : "./assets/img/gis/printer_red.png", anchor : {x : 13, y : 12}}],
			"COMPUTER" : [{url : "./assets/img/gis/computer.png", anchor : {x : 12, y : 9}},
					      {url : "./assets/img/gis/computer_red.png", anchor : {x : 12, y : 9}}],
			"WARP_MACHINE" : [{url : "./assets/img/gis/warp_machine.png", anchor : {x : 11, y : 13}},
						      {url : "./assets/img/gis/warp_machine_red.png", anchor : {x : 11, y : 13}}],
			"FORKLIFT" : [{url : "./assets/img/gis/forklift.png", anchor : {x : 12, y : 9}},
					      {url : "./assets/img/gis/forklift_red.png", anchor : {x : 12, y : 9}}],
			"TRUCK" : [{url : "./assets/img/gis/point_out_red.gif", anchor : {x : 15, y : 15}},
			              {url : "./assets/img/gis/point_out_red.gif", anchor : {x : 15, y : 15}}],
			"PEOPLE_ZONE" : [{url : "./assets/img/gis/people_group.png", anchor : {x : 15, y : 10}},
			           {url : "./assets/img/gis/people_group.png", anchor : {x : 15, y : 10}}],
            "PEOPLE_LOCATE" : [{url : "./assets/img/gis/people_locate.png", anchor : {x : 10, y : 14}},
                       {url : "./assets/img/gis/people_locate.png", anchor : {x : 10, y : 14}}],
            "DISPLAY" : [{url : "./assets/img/gis/display.png", anchor : {x : 11, y : 10}},
                            {url : "./assets/img/gis/display_red.png", anchor : {x : 11, y : 10}}],
            "HUMITURE" : [{url : "./assets/img/gis/humiture.png", anchor : {x : 12, y : 12}},
                            {url : "./assets/img/gis/humiture_red.png", anchor : {x : 12, y : 12}}]
	};
	function getCamIcons(cam){
		var icons = null;
		if(cam){
			var dir = cam.direction || 0;
			dir = (dir / 30).toFixed(0) * 30;
			icons = WEBCAM_ICON[dir];
			//正在播放的cam标记为红色
			if(cam.playing){
				icons = [icons[1], icons[0]];
			}
		}
		return icons;
	}
	function getEquipmentIcons(eqp){
		var icons = null;
		var type = eqp.type.toUpperCase();
		if(type == "WEBCAM"){
			icons = getCamIcons(eqp);
		}else{
			icons = EQUIPMENT_ICON[type];
			if(eqp._active){
				icons = [icons[1], icons[0]];
			}
		}
		return icons;
	}
	
	function getStateColor(style, level, levels){
		level -= 1;
		levels -= 1;
		var colors = LAYER_STYLE.STATE_LINE_LIMIT[style] || [[230, 230, 230], [25, 25, 25]];	//默认黑白色
		var min = colors[0];
		var max = colors[1];
		var r = Math.floor(min[0] + (max[0] - min[0]) /  levels * level);
		var g = Math.floor(min[1] + (max[1] - min[1]) /  levels * level);
		var b = Math.floor(min[2] + (max[2] - min[2]) /  levels * level);
		var color = rgbToStr([r, g, b]);
		return {"strokeColor" : color, "fillColor" : color};
	}
	
	function getStateColors(style){
		var colors = LAYER_STYLE.STATE_LINE_LIMIT[style] || [[230, 230, 230], [25, 25, 25]];	//默认黑白色
		var min = colors[0];
		var max = colors[1];
		return {min : rgbToStr(min), max : rgbToStr(max)};
	}
	//rgb : [r, g, b]
	function rgbToStr(rgb){
		var color = "#";
		_.forEach(rgb, function(c){
			var s = c.toString(16);
			if(s.length === 1){
				s = "0" + s;
			}
			color += s;
		});
		return color;
	}
	
	var CoorUtil = {
			coorsys : null,
			/**
			 * return: [lng, lat]
			 */
			pointToLatlngArray : function(x, y){
				var COORSYS = this.coorsys;
				if(_.isEmpty(COORSYS)){
					return [0, 0];	
				}
				
				var maxX = COORSYS.maxX;
				var maxY = COORSYS.maxY;
				
				var pointO = COORSYS.pointOrigin;
				var pointX = COORSYS.pointX;
				var pointY = COORSYS.pointY;
				
				//计算缩放比例和旋转角度
				var aLng = parseFloat(pointO.split(",")[0]);
				var aLat = parseFloat(pointO.split(",")[1]);
				var bLng = parseFloat(pointX.split(",")[0]);
				var bLat = parseFloat(pointX.split(",")[1]);
				var dLng = parseFloat(pointY.split(",")[0]);
				var dLat = parseFloat(pointY.split(",")[1]);
				var ratio = Math.hypot(aLat-bLat,aLng-bLng)/maxX;
				var radX = Math.atan((aLat-bLat)/(aLng-bLng));
				var radY = Math.atan((aLat-dLat)/(aLng-dLng));
				if(radY <= 0){
					radY += Math.PI;
				}
				radY -= Math.PI/2;
				var radN = radX - radY;
				var maxY_map = Math.hypot(aLat-dLat,aLng-dLng)/ratio; 
				
				var X = x;
				var Y = y;
				
				//仓库相对地图旋转、缩放、平移等处理
				Y /= maxY/maxY_map;  //Y轴拉伸
				
				X = X + Y*Math.sin(radN)*Math.cos(radN);
				Y = Y*Math.cos(radN);
				
				var sign = X>0 ? 1 : -1 ;//由于atan(x)结果在第1,4象限，计算rad时2,3象限的点被旋转180°，即中心对称，因此需作此处理
				var rad = radX + Math.atan(Y/X);
				var len = Math.hypot(X,Y); 
				var lat = sign*len*ratio*Math.sin(rad) + aLat;
				var lng = sign*len*ratio*Math.cos(rad) + aLng;
				if(isNaN(lat)){
					lat = aLat;
				}
				if(isNaN(lng)){
					lng = aLng;
				}
				return [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))];
			},
			/**
			 * return: [x, y]
			 */
			latlngToPoint : function(lng, lat){
				var COORSYS = this.coorsys;
				if(_.isEmpty(COORSYS)){
					return [0, 0];
				}
				
				var maxX = COORSYS.maxX;
				var maxY = COORSYS.maxY;
				
				var pointO = COORSYS.pointOrigin;
				var pointX = COORSYS.pointX;
				var pointY = COORSYS.pointY;
				
				//计算缩放比例和旋转角度
				var aLng = parseFloat(pointO.split(",")[0]);
				var aLat = parseFloat(pointO.split(",")[1]);
				var bLng = parseFloat(pointX.split(",")[0]);
				var bLat = parseFloat(pointX.split(",")[1]);
				var dLng = parseFloat(pointY.split(",")[0]);
				var dLat = parseFloat(pointY.split(",")[1]);
				var ratio = Math.hypot(aLat-bLat,aLng-bLng)/maxX;
				var radX = Math.atan((aLat-bLat)/(aLng-bLng));
				var radY = Math.atan((aLat-dLat)/(aLng-dLng));
				if(radY <= 0){
					radY += Math.PI;
				}
				radY -= Math.PI/2;
				var radN = radX - radY;
				var maxY_map = Math.hypot(aLat-dLat,aLng-dLng)/ratio;
				
				lng -= aLng;
				lat -= aLat;
				
				var sign = lng>0 ? 1 : -1 ;//由于atan(x)结果在第1,4象限，计算rad时2,3象限的点被旋转180°，即中心对称，因此需作此处理
				var rad = radX - Math.atan(lat/lng);
				var len = Math.hypot(lat,lng);
				
				var Y = sign*len*Math.sin(rad)/ratio*maxY/maxY_map;
				var X = sign*len*Math.cos(rad)/ratio;
				
				Y /= -Math.cos(radN);
				X -= Y*Math.sin(radN)/(maxY/maxY_map);
				
				if(isNaN(X)){
					X = 0;
				}
				if(isNaN(Y)){
					Y = 0;
				}
				return [parseFloat(X.toFixed(2)), parseFloat(Y.toFixed(2))];
			}
	};
	
	function Jsmap(){
		this.map = null;
		this.el_id = null;
		/**
		 * 记录图层状态
		 * created : 是否已创建
		 */
		this.status = {
				base : {}, zone : {}, location : {}, dock : {}, staging : {}, parking : {}, other : {}, webcam : {},
				stateLine : {},locationLine:{}, road: {}
		};
	}
	
	Jsmap.prototype.initMap = function(el_id, simple_map){
		simple_map = simple_map || false;
		//if (this.map == null) {
			var options = {simple_map : simple_map};
	        var el = document.getElementById(el_id);
	        if (el !== null) {
	            try {
	            	this.map = new _map(el);
	            	this.setLayerStyle();
	            	this.setMapOptions();
	                if (!this.map) {
	                    alert("[Jsmap.init]: " + _map.PROVIDER_NAME + "\n" + 
	                        "Error occured while creating JSMap" +
	                        "(map provider service may be temporarily unavailable)");
	                }
	            } catch (e) {
	            	console.error(e);
	                alert(
	                    "[Jsmap.init]: " + _map.PROVIDER_NAME + "\n" + 
	                    "Error initializing map\n" +
	                    "(map provider service may be temporarily unavailable)\n" +
	                    e
	                    );
	            }
	        } else {
	            alert(
	                "[Jsmap.init]: " + _map.PROVIDER_NAME + "\n" + 
	                "Div '" + el_id + "' not found"
	                );
	        }
	    //}
	};
	
	Jsmap.prototype.setCoorSys = function(coorSys){
		CoorUtil.coorsys = coorSys;
		this.map.initCoorSysUtil(CoorUtil);
	};
	Jsmap.prototype.setMapOptions = function(){
		this.map.setOptions('forceExitEdit', false);
		this.map.setOptions('forceRemove', false);
	};
	//warehouse
	Jsmap.prototype.markAllWarehouses = function(whs, fitBounds){
		this.map.createMarkers("warehouse", whs, fitBounds);
	};
	Jsmap.prototype.hideAllWarehouses = function(){
		this.map.clearMarkers("warehouse");
	};
	Jsmap.prototype.getWarehouseInMap = function(){
		var markers = this.map.getMarkers("warehouse", {_inMap : true});
		return _.map(markers, "data");
	};
	
	Jsmap.prototype.setLayerStyle = function(){
		this.map.setPolysArgs({
			base : 		{style : LAYER_STYLE.BASE, 			option : LAYER_OPTION.BASE },
			location : 	{style : LAYER_STYLE.LOCATION, 		option : LAYER_OPTION.LOCATION },
			staging : 	{style : LAYER_STYLE.STAGING, 		option : LAYER_OPTION.STAGING},
			dock : 		{style : LAYER_STYLE.DOCK, 			option : LAYER_OPTION.DOCK},
			parking : 	{style : LAYER_STYLE.PARKING, 		option : LAYER_OPTION.PARKING},
			zone : 		{style : LAYER_STYLE.ZONE, 			option : LAYER_OPTION.ZONE},
			other : 	{style : LAYER_STYLE.OTHER, 		option : LAYER_OPTION.OTHER},
			stateLine : {style : LAYER_STYLE.STATE_LINE, 	option : LAYER_OPTION.STATE_LINE},
			locationLine : {style : LAYER_STYLE.STATE_LINE, 	option : LAYER_OPTION.STATE_LINE},

			
			loadStatusLine : {style : LAYER_STYLE.LOAD_STATUS_LINE},
			road : 		{style : LAYER_STYLE.ROAD_MAIN,		option : LAYER_OPTION.ROAD},
			
			"default" : {style : LAYER_STYLE.DEFAULT, 		option : LAYER_OPTION.DEFAULT}
		});
	};
	//coor
	Jsmap.prototype.setCoorSysVisible = function(visible){
		this.map.setCoorSysVisible(visible);
	};
	//base
	Jsmap.prototype.showBase = function(base){
		this.map.createPolygons("base", base);
	};
	//all kinds location
	Jsmap.prototype.showLocation = function(type, locs){
		type = type.toLowerCase();
		if(this.status[type].created){
			this.map.showPolygons(type);
		}else{
			var list = this.map.createPolygons(type, locs);
			this.status[type].created = true;
			this.status[type].locs = list;
		}
	};
	Jsmap.prototype.hideLocation = function(type){
		this.map.clearPolygons(type);
	};


	//location utilization rate
	Jsmap.prototype.showLocsUtilizationRate = function(locs){
		var map = this.map;
		locs = locs || [];
		//test
		_.forEach(locs, function(loc){
			
			var filter = {
					//id : loc.id
					name : loc
			};
			var colors = [{
					len : parseInt(Math.random() * 100), color : LAYER_STYLE.UTILIZATION_RATE.used
				}, {
					color : LAYER_STYLE.UTILIZATION_RATE.free
				}];
			map.polygonPartColors(filter, colors);
		});
	};

	Jsmap.prototype.hideLocsUtilizationRate = function(){
		this.map.clearPolygonPartColors(null, true);
	};
	
	//state line
	Jsmap.prototype.initStateLines = function(lines){
		var _lines = this.map.createPolygons("stateLine", lines);
		var uuids = {};
		_.forEach(_lines, function(line){
			var uuid = line.data._uuid;
			var name = line.data.name;
			uuids[name] = uuid;
		});
		this.status.stateLine.lines = uuids;
		//隐藏
		this.map.clearPolygons("stateLine");
	};
	Jsmap.prototype.fitStateBounds = function(){
		this.map.fitBoundsWithPolygons("stateLine");
	};
	Jsmap.prototype.hideStateLines = function(){
		this.map.clearPolygons("stateLine");
	};
	Jsmap.prototype.showStateLine = function(colorStyle, stateName, newName, level, levels){
		colorStyle = (colorStyle || "").toUpperCase();
		if(!this.status.stateLine.lines)
			return;
		var uuid = this.status.stateLine.lines[stateName];
		if(uuid){
			var style = getStateColor(colorStyle, level, levels);
			this.map.renamePolygon(uuid, newName);
			this.map.showPolygons("stateLine", {_uuid : uuid}, style);
		}
	};
	Jsmap.prototype.getStateColors = function(colorStyle){
		colorStyle = (colorStyle || "").toUpperCase();
		return getStateColors(colorStyle);
	};

	//location line
	Jsmap.prototype.initLocationLines = function(lines){
		var _lines = this.map.createPolygons("locationLine", lines);
		var uuids = {};
		_.forEach(_lines, function(line){
			var uuid = line.data._uuid;
			var name = line.data.name;
			uuids[name] = uuid;
		});
		this.status.locationLine.lines = uuids;
		//隐藏
		this.map.clearPolygons("locationLine");
	};
	Jsmap.prototype.hideLocationLines = function(){
		this.map.clearPolygons("locationLine");
	};

	Jsmap.prototype.hideUncheckedPolygons = function(type,checkLatlngs){
		this.map.clearUncheckedPolygons(type,checkLatlngs);
	};
	
	Jsmap.prototype.showLocationLine = function(colorStyle, locationName, newName, level, levels){
		colorStyle = (colorStyle || "").toUpperCase();
		if(!this.status.locationLine.lines)
			return;
		var uuid = this.status.locationLine.lines[locationName];
		if(uuid){
			var style = getStateColor(colorStyle, level, levels);
			this.map.renamePolygon(uuid, newName);
			this.map.showPolygons("locationLine", {_uuid : uuid}, style);
		}
		
	};
	Jsmap.prototype.setCenter=function(latLng){
		this.map.setCenter(latLng);
	}
	Jsmap.prototype.setZoom=function(zoom){
		this.map.setZoom(zoom);
	}
	Jsmap.prototype.getLocationColors = function(colorStyle){
		colorStyle = (colorStyle || "").toUpperCase();
		return getStateColors(colorStyle);
	};
	Jsmap.prototype.fitLocationBounds = function(){
		this.map.fitBoundsWithPolygons("locationLine");
	};
	


	//webcam
	Jsmap.prototype.showWebcam = function(cams){
		if(this.status.webcam.created){
			this.map.showMarkers("webcam");
		}else{
			_.forEach(cams, function(cam){
				var icons = getCamIcons(cam);
				cam._icons = icons;
			});
			this.map.createMarkers("webcam", cams);
			this.status.webcam.created = true;
		}
	};
	Jsmap.prototype.hideWebcam = function(){
		this.map.clearMarkers("webcam");
	};
	Jsmap.prototype.refreshWebcam = function(uuid, cam){
		if(cam){
			var icons = getCamIcons(cam);
			cam._icons = icons;
		}
		this.map.rebuildMarker(uuid, "webcam", cam);
	};
	Jsmap.prototype.refreshWebcamIcons = function(cam){
		var icons = getCamIcons(cam);
		this.map.setMarkerIcons(cam._uuid, icons);
	};
	//all type equipment
	Jsmap.prototype.showEquipment = function(type, equipments, refresh){
		this.status[type] = this.status[type] || {};
		if(refresh){
			this.map.clearMarkers(type, true);
			this.status[type].created = false;
		}
		if(this.status[type].created){
			this.map.showMarkers(type);
		}else{
			_.forEach(equipments, function(equipment){
				var icons = getEquipmentIcons(equipment);
				equipment._icons = icons;
				if(equipment.latlng.indexOf(" ") > -1){
					equipment.latlng = getCenter(equipment.latlng).toString();
				}
			});
			this.map.createMarkers(type, equipments, false, {
				noRecombine : true
			});
			this.status[type].created = true;
		}
	};
	Jsmap.prototype.hideEquipment = function(type){
		this.map.clearMarkers(type);
	};
	Jsmap.prototype.refreshEquipment = function(uuid, equipment){
		if(equipment){
			var icons = getEquipmentIcons(equipment);
			equipment._icons = icons;
		}
		this.map.rebuildMarker(uuid, equipment && equipment.type, equipment);
	};
	Jsmap.prototype.refreshEquipmentIcons = function(equipment){
		var icons = getEquipmentIcons(equipment);
		this.map.setMarkerIcons(equipment._uuid, icons);
	};
	Jsmap.prototype.equipmentAnimate = function(equipment, pathStr){
		this.map.setMarkerAnimat(equipment._uuid, {
			path : pathStr,
			speed : equipment.type == "FORKLIFT" ? 3 : 1
		});
	};
	
	//truck
	Jsmap.prototype.markTrucks = function(trucks, fitBounds){
		//先清除所有truck, 再重建
		this.hideTrucks();
		_.forEach(trucks, function(truck){
			truck._icons = EQUIPMENT_ICON.TRUCK;
		});
		this.map.createMarkers("truck", trucks, fitBounds, {
			noRecombine : true,
			noLabel : true
		});
	};
	Jsmap.prototype.hideTrucks = function(){
		this.map.clearMarkers("truck", true);
	};
	
	//load status
	Jsmap.prototype.showLoadStatus = function(loads, lines, fitBounds){
		var markers = [];
		//var lines = [];
		_.forEach(loads, function(load){
			var marker = {
				_icons : EQUIPMENT_ICON.TRUCK,
				latlng : load.latlng
			};
			if(load._html)
				marker._html = load._html;
			
			markers.push(marker);
			// lines.push({
			// 		latlng : load.line
			// });
		});
		
		//先清除所有load, 再重建
		this.hideLoadStatus();
		this.map.createMarkers("loadStatus", markers, fitBounds, {
			noRecombine : true,
			noLabel : true
		});
		this.map.createPolylines("loadStatusLine", lines);
	};
	Jsmap.prototype.hideLoadStatus = function(){
		this.map.clearMarkers("loadStatus", true);
		this.map.clearPolylines("loadStatusLine", true);
	};
	/**
	 * 路径回放
	 * path: 线路
	 * progressChange : function, 播放进度改变时执行
	 */
	Jsmap.prototype.gpsRouteCreate = function(path, progressChange){
		this.map.createRoutePlayer("truckGPS", _.join(path, " "), {
			preRoute : true,
			setProgress : progressChange
		});
	};
	Jsmap.prototype.gpsRouteRemove = function(){
		this.map.clearRoutePlayer("truckGPS");
	};
	Jsmap.prototype.gpsRouteStop = function(){
		this.map.routePlayerCtrl("truckGPS", "stop");
	};
	Jsmap.prototype.gpsRoutePlay = function(){
		this.map.routePlayerCtrl("truckGPS", "play");
	};
	Jsmap.prototype.gpsRoutePause = function(){
		this.map.routePlayerCtrl("truckGPS", "pause");
	};
	
	//设置编辑状态
	Jsmap.prototype.setEditable = function(status){
		this.map.edit.setEditable(status);
	};
	
	//设置回调函数
	Jsmap.prototype.setCallbacks = function(callbacks){
		callbacks = callbacks || {};
		$.extend(this.map.callbacks, callbacks);
	};
	//选中zone内部所有location
	Jsmap.prototype.editInnerLocations = function(id, checked){
		this.map.edit.changePolygonsEditStatus(checked, "location", {parentId:id});
	};
	//设置对象的编辑状态，silent : boolean,静默执行,不触发回调函数
	Jsmap.prototype.setEditStatus = function(loc, editable, silent){
		if(!loc._uuid){
			return;
		}
		this.map.edit.changeMarkersEditStatus(editable, null, {_uuid : loc._uuid}, !silent);
		this.map.edit.changePolygonsEditStatus(editable, null, {_uuid : loc._uuid}, !silent);
	};
	//重命名locations
	Jsmap.prototype.renameLocations = function(locs){
		var map = this.map;
		_.forEach(locs, function(loc){
			map.renamePolygon(loc._uuid, loc.name);
		});
	};
	//重命名markers
	Jsmap.prototype.renameMarkers = function(markers){
		var map = this.map;
		_.forEach(markers, function(marker){
			map.renameMarker(marker._uuid, marker.name);
		});
	};
	//刷新location
	Jsmap.prototype.refreshLocation = function(uuid, loc){
		var group = null;
		if(loc){
			uuid = uuid || loc._uuid;
			group = loc.type.toLowerCase();
		}
		this.map.rebuildPolygon(uuid, group, loc);
	};
	
	//road
	Jsmap.prototype.setDefaultRoadStyle = function (isMain) {
		var style = isMain ? LAYER_STYLE.ROAD_MAIN : LAYER_STYLE.ROAD_SUB;
		this.map.setPolysArgs({
			road : {STYLE : style}
		});
	};
	Jsmap.prototype.refreshRoad = function (uuid, road) {
		this.map.rebuildPolyline(uuid, "road", road);
	};
	Jsmap.prototype.resetRoadRubber = function (latlng) {
		var latlngStr;
		if(latlng){
			latlngStr = latlng[0] + "," + latlng[1];
		}
		this.map.edit.line('reset', latlngStr);
	};
	Jsmap.prototype.showRoad = function (roads, extend) {
		if(this.status.road.created && !extend){
			this.map.showPolylines("road");
		}else{
			var main = [], sub = [];
			_.forEach(roads, function(road){
				var type = road.type.toLowerCase();
				if(type == "main road"){
					main.push(road);
				}else{
					sub.push(road);
				}
			});
			if(main.length > 0){
				this.map.createPolylines("road", main, LAYER_STYLE.ROAD_MAIN);
			}
			if(sub.length > 0){
				this.map.createPolylines("road", sub, LAYER_STYLE.ROAD_SUB);
			}
			this.status.road.created = true;
		}
	};
	Jsmap.prototype.hideRoad = function () {
		this.map.clearPolylines("road");
	};
	Jsmap.prototype.setDefaultRoadType = function(isMain){
		var style = isMain ? LAYER_STYLE.ROAD_MAIN : LAYER_STYLE.ROAD_SUB;
		this.map.setPolysArgs({
			road : {style : style}
		});
	};
	
	
	
	Jsmap.prototype.showPickRoad = function (roadDatas) {
		this.map.createPickRoads(roadDatas);
	};
	Jsmap.prototype.hidePickRoad = function () {
		this.map.clearPickRoads();
	};
	Jsmap.prototype.showHeatMap = function (datas) {
		this.map.setHeatMap(datas);
	};

	
	
	Jsmap.prototype.showHeatLocation = function (loc) {
		this.map.setHeatLocation(loc);
	};
	/**
	 * locs: [{
	 * 			filter: {},			//location过滤条件
	 * 			weight: Number		//权重，取值范围1-10
	 * 		}, ...]
	 */
	Jsmap.prototype.showHeatMapFromLoc = function (locs) {
		locs = locs || [];
		var max, min;
		var datas = [];
		
		_.forEach(locs, function(loc){
			if(_.isNumber(loc.weight) && !_.isEmpty(loc.filter)){
				var weight = loc.weight;
				max = Math.max(max || weight, weight);
				min = Math.min(min || weight, weight);
				datas.push(_.clone(loc));
			}
		});
		var step = (max - min) || min;
		_.forEach(datas, function(data){
			var w = data.weight;
			w = Math.ceil(((w - min) / step) * 10) || 1;
			data.weight = w;
		});
		this.map.polygonHeatMap(datas);
	};
	/**
	 * locs: [{
	 * 			filter: {},			//location过滤条件
	 * 			weight: Number		//权重，取值范围1-10
	 * 		}, ...]
	 */
	Jsmap.prototype.showHeatMapFromRoad = function (roads) {
		roads = roads || [];
		var max, min;
		var datas = [];
		
		_.forEach(roads, function(road){
			if(_.isNumber(road.weight) && !_.isEmpty(road.filter)){
				var weight = road.weight;
				max = Math.max(max || weight, weight);
				min = Math.min(min || weight, weight);
				datas.push(_.clone(road));
			}
		});
		var step = (max - min) || min;
		_.forEach(datas, function(data){
			var w = data.weight;
			w = Math.ceil(((w - min) / step) * 10) || 1;
			data.weight = w;
		});
		this.map.polylineHeatMap(datas, "road");
	};
	
	
	//按位置排序,按坐标系正方向分列排序，排序结果为二维数组。sort = [[Loc11, Loc12 ...], [Loc21, Loc22 ...] ...]。
	//返回结果包含X、Y2个方向的排序结果，为三维数组, [X-sort, Y-sort]
	//accuracy ： 精度，决定同列对象允许偏离该列轴线的距离，单位：坐标系单位，默认值：2。
	Jsmap.prototype.sortByPosition = function(locs, accuracy){
		accuracy = accuracy || 2;
		//compute objects's center
		_.forEach(locs, function(loc){
			var center = getCenter(loc.latlng);
			loc._x = center[0];
			loc._y = center[1];
		});
		//cols follow x-axis
		var fy = _.sortBy(locs, function(loc){
			return loc._y;
		});
		var X = [];
		var last = fy[0]._y;
		var lastArray = [];
		var deviation = accuracy;
		_.forEach(fy, function(loc){
			deviation -= loc._y - last;
			last = loc._y;
			if(deviation < 0){
				deviation = accuracy;
				X.push(_.sortBy(lastArray, function(l){
					return l._x;
				}));
				lastArray = [];
			}
			lastArray.push(loc);
		});
		X.push(_.sortBy(lastArray, function(l){
			return l._x;
		}));
		
		//cols follow y-axis
		var fx = _.sortBy(locs, function(loc){
			return loc._x;
		});
		var Y = [];
		last = fx[0]._x;
		lastArray = [];
		deviation = accuracy;
		_.forEach(fx, function(loc){
			deviation -= loc._x - last;
			last = loc._x;
			if(deviation < 0){
				deviation = accuracy;
				Y.push(_.sortBy(lastArray, function(l){
					return l._y;
				}));
				lastArray = [];
			}
			lastArray.push(loc);
		});
		Y.push(_.sortBy(lastArray, function(l){
			return l._y;
		}));
		return [X, Y];
	};
	
	Jsmap.prototype.polygonMarkers = function(loc, show){
		var filter = {};
		if(loc._uuid){
			filter["_uuid"] = loc._uuid;
		}else if(loc.id){
			filter["id"] = loc.id;
		}else{
			return;
		}
		this.map.markPolygon(filter, show);
	};
	
	Jsmap.prototype.highlightLocs = function(locs, group){
		_.forEach(locs, function(loc){
			loc._style = loc._warn === false ? LAYER_STYLE.EMPTY_CTN : LAYER_STYLE.FULL_CTN;
			delete loc._warn;
			if(loc._type == 'border'){
				loc._style = LAYER_STYLE.HIGHTLIGHT_BORDER;
				delete loc._type;
			}
		});
		this.map.highlightPolygons(locs, group, true);
	};
	
	Jsmap.prototype.getLocationCenter = function(loc){
		var center = "";
		if(loc && loc.latlng){
			var c = getCenter(loc.latlng);
			return c[0].toFixed(6) + "," + c[1].toFixed(6);
		}
		return center;
	};
	
	Jsmap.prototype.setMarkerCursor = function(type){
		if(!type)
			return;
		type = type.toLowerCase();
		var cursor = {
				webcam : "webcam",
				printer : "printer",
				computer : "computer",
				warp_machine : "warp_machine",
				forklift : "forklift",
				display : "display",
				humiture : "humiture"
		}[type];
		if(cursor){
			this.map.setCursor(cursor);
		}
	};
	
	//清除所有图层
	Jsmap.prototype.clearAllLayers = function(){
		this.map.clearAllLayers();
		
		//var ignore = ["stateLine"];
		var status = this.status;
		for(var key in status){
			//if(_.includes(ignore, key))
			//	continue;
			status[key] = {};
		}
	};
	
	//百像素对应的长度， return: {distance: Float m, latlng: Float}
	Jsmap.prototype.centumPixelToLength = function(){
		var dis = this.map.pixelToDistance(100);
		var len = this.map.pixelToLatlngLength(100);
		return {
			distance: dis,
			latlngOffset: len
		};
	};
	
	//============== util functions =============
	function getCenter(points){
		var ps = pointsToArrays(points);
		if(ps.length === 0){
			return [0, 0];
		}
		var xSum = 0;
		var ySum = 0;
		_.forEach(ps, function(p){
            xSum += p[0];
            ySum += p[1];
		});
		var x = xSum / ps.length;
		var y = ySum / ps.length;
		return [x, y];
	}
	function pointsToArrays(points, separat1, separat2){
		separat1 = separat1 || / +/;
		separat2 = separat2 || / *, */;
		var ps = points.split(separat1);
		var result = [];
		_.forEach(ps, function(p){
			if(p !== ""){
				result.push(pointToArray(p));
			}
		});
		return result;
	}
	function pointToArray(point, separat){
		separat = separat || / *, */;
		var str = point.split(separat);
		var result = [parseFloat(str[0]), parseFloat(str[1])];
		return result;
	}
	//============== util functions end =============
	return new Jsmap();
});