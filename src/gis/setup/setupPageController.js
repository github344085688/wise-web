'use strict';

define([
    'jquery',
    'angular',
    'moment',
    '../main/mainPageController',
	'./tierGridController',
	'./equipmentTypeController',
    '../api/jsmap',
    '../api/roadUtil',
    'lodash'
], function($, angular, moment, mainCtrl, tierGridController, equipmentTypeController, jsmap, roadUtil, _) {
	var MIN_ROAD_ZOOM = 17; //road显示的小地图缩放比例
	
	function resizePage(){
		//避免影响其他页面
		if($("#gis_main").length === 0){
			return;
		}
		
		var headerHeight = $('.page-header').outerHeight() || 46;
        var footerHeight = $('.page-footer').outerHeight();
        var windowHeight = $(window).height();
        
        $("body").css("overflow", "hidden");
        $("#gis_main").height(windowHeight - headerHeight);
        //$("#gis_main #infowindow").height(windowHeight - headerHeight - 70);
	}
	
	function registEvent(){
		$(window).resize(function(){
			resizePage();
		});
		
		$("#infowindow #ctrl").on("click", function(e){
			var el = $(this);
			var win = $("#infowindow");
			var open = el.data("open");
			var len = "0px";
			if(open){
				var btn_len = el.outerWidth();
				var win_len = win.outerWidth();
				//len =  (btn_len - win_len) + "px";
				len =  (0 - win_len) + "px";
				el.data("open", false);
			}else{
				el.data("open", true);
			}
			//el.toggleClass("glyphicon-chevron-right");
			//el.toggleClass("glyphicon-chevron-left");
			$("#infowindow").animate({
				right : len
			});
		});
	}
	
	function increase(str){
		if(str === null || str === undefined || str === ""){
			return "1";
		}
		var cs = str.toUpperCase().split("");
		var asc = [];
		_.forEach(cs, function(s){
			asc.push(s.charCodeAt());
		});
		var _1 = "1".charCodeAt();
		var _0 = "0".charCodeAt();
		var _9 = "9".charCodeAt();
		var _A = "A".charCodeAt();
		var _Z = "Z".charCodeAt();
		for(var i = asc.length-1; i >= 0; i--){
			if(_.inRange(asc[i], _0, _9) || _.inRange(asc[i], _A, _Z)){
				asc[i] += 1;
				break;
			}
			if(asc[i] == _9){
				//asc[i] = i > 0 && !_.inRange(asc[i-1], _0, _9) ? _1 : _0;
				asc[i] = _0;
				if(i === 0){
					asc.unshift(_1);
				}
			}
			if(asc[i] == _Z){
				asc[i] = _A;
				if(i === 0){
					asc.unshift(_A);
				}
			}
		}
		var res = "";
		_.forEach(asc, function(s){
			res += String.fromCharCode(s);
		});
		return res;
	}
	function cleanData (data, ignore){
		ignore = ignore || [];
		ignore.push("workers");
		return _.pickBy(data, function(v, k){
			if(_.indexOf(ignore, k) >= 0){
				return true;
			}else{
				return typeof(v) !== 'function' && typeof(v) !== 'object' && !_.startsWith(k, '_');
			}
		});
	}
	
    var setupPageController = function($scope, $resource, $timeout, $mdDialog, lincResourceFactory, apiHost, lincUtil) {
    	registEvent();
    	resizePage();
    	jsmap.initMap('jsmap');
    	
    	$scope = $scope.$parent;
    	$scope._ = _;
    	$scope.errorList = [];
    	
    	$scope.clickMenu = function(menuKey, item, silent, checked){
    		if(item && item.disabled){
    			return;
    		}
    		//checked默认为与当前状态相反
    		if(checked === undefined){
				checked = !item.checked;
			}
    		//静默执行，true：不改变开关显示。
    		if(!silent){
    			item.checked = checked;
    		}
    		if(_.includes(["zone", "location", "staging", "dock", "parking", "other"], menuKey)){
    			var _type = menuKey;
    			if(checked){
    				jsmap.showLocation(_type, $scope.locations[_type]);
    			}else{
    				jsmap.hideLocation(_type);
    			}
    		}else if(menuKey == "webcam"){
    			if(checked){
    				jsmap.showEquipment("equipments", $scope.equipments.all);
    			}else{
    				jsmap.hideEquipment("equipments");
    			}
    		}else if(menuKey == "modify"){
    			jsmap.setEditable(checked);
    		}else if(menuKey == "customEquipment"){
    			item.checked = false;
    			$scope.equipmentTypeSetup();
    		} else if (menuKey == "road") {
				if (checked) {
					jsmap.showRoad($scope.roads);
					roadUtil.extendRoad($scope.roads);
				} else {
					jsmap.hideRoad();
				}
			}
    		$scope.apply();
    	};
    	$scope.layers = {
    			zone : {name : "Zone", checked : false, disabled : true},
    			location : {name : "Location", checked : false, disabled : true},
    			dock : {name : "Dock", checked : false, disabled : true},
    			staging : {name : "Staging", checked : false, disabled : true},
    			parking : {name : "Parking", checked : false, disabled : true},
    			other : {name : "Other", checked : false, disabled : true},
    			webcam : {name : "Equipments", checked : false, disabled : true},
				road : {name : "Road", checked : false, disabled : true}
        };
    	$scope.edit = {
    			modify : {name : "Edit Enable", checked : false, disabled : true},
    			customEquipment : {name : "Custom Equipment", checked : false, disabled : true}
    	};
    	$scope.initLayers = function(){
    		var layers = $scope.layers;
    		jsmap.showBase($scope.locations.base);
    		
    		layers.zone.checked = true;
    		angular.forEach(layers, function(val, key){
				if(val.checked){
					$scope.clickMenu(key, val, false, true);
				}
			});
    	};
    	$scope.showAllWarehouse = function(){
			var whs = $scope.gisWarehouses;
			$scope.getCoordsys().then(function(coords){
				_.forEach(coords, function(c){
					var whId = c.id;
					var wh = _.find(whs, {"id" : whId});
					if(wh){
						wh.latlng = c.locate;
						wh.coordsys = _.pick(c, ["maxX", "maxY", "pointOrigin", "pointX", "pointY"]);
					}
				});
				jsmap.markAllWarehouses(whs, {
					click : function(wh){
						$scope.changeWarehouse(wh);
					}
				});
				//====== 自动进入编辑模式  ==========
				//$scope.changeWarehouse(whs[0]);		//test
			});
    	};
    	$scope.changeWarehouse = function(wh){
    		//同步仓库设置到外部
    		$scope.onClickCompanyFacility && $scope.onClickCompanyFacility(wh.cf);
    		//设置当前warehouse
    		$scope.currentWh = wh;
    		
    		jsmap.clearAllLayers();
    		jsmap.setCoorSys(wh.coordsys);
    		$scope.removeFromAutoInfo();
    		
    		$scope.clickMenu("modify", $scope.edit.modify, false, false);
    		$scope.edit.modify.disabled = true;
    		$scope.edit.customEquipment.disabled = false;
    		
			$scope.initData();
    	};
    	$scope.createWarehouse = function(wh){
    		//同步仓库设置到外部
    		$scope.onClickCompanyFacility && $scope.onClickCompanyFacility(wh.cf);
    		
    		jsmap.clearAllLayers();
    		$scope.removeFromAutoInfo();
    		$scope.locations = {};	//清除原始location数据， 防止layers重新加载
    		
    		jsmap.setCoorSys();
    		
    		$scope.edit.modify.disabled = false;
    		$scope.clickMenu("modify", $scope.edit.modify, false, true);
    		
    		$scope.currentWh = wh;
    		$scope.BUILDING_COORD_SYS = true;
    		$scope.autoInfo.createWh = {
    				preLoc : null, 	//预选base Location, 不为null时表示base已经在编辑中
    				whInfo : wh,
    				points : [], //latlng string
    				pointsName : [], //latlng string
    				pointOrigin : null,
    				pointX : null,
    				pointY : null
    		};
    	};
		$scope.createCoodrSys = function(){
			if(!$scope.autoInfo.createWh.preLoc){
				return;
			}
			var createWh = $scope.autoInfo.createWh;
			jsmap.polygonMarkers(createWh.preLoc, true);
			createWh.points = createWh.preLoc.latlng.split(/ +/);
			var len = createWh.points.length;
			createWh.pointsName = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".substr(0, len).split("");
			
			$scope.apply();
		};
		$scope.saveWhBase = function(){
			var wh = $scope.autoInfo.createWh;
			if(!wh.pointOrigin || !wh.pointX || !wh.pointY){
				return;
			}
			var o = wh.points[wh.pointOrigin.charCodeAt() - 65],
				x = wh.points[wh.pointX.charCodeAt() - 65],
				y = wh.points[wh.pointY.charCodeAt() - 65];
			var coordsys = {
					warehouseId : $scope.currentWh.id,
					pointOrigin : o,
					pointX : x,
					pointY : y,
					maxX : 1000,
					maxY : 1000,
					locate : jsmap.getLocationCenter(wh.preLoc)
			};
			$scope.saveCoordsys(coordsys).then(function(){
				var _wh = _.find($scope.gisWarehouses, {id : $scope.currentWh.id});
				_wh.locate = coordsys.locate;
				delete coordsys.locate;
				_wh.coordsys = coordsys;
				
				jsmap.setCoorSys(coordsys);
				$scope.BUILDING_COORD_SYS = false;
				$scope.autoInfo.createWh = null;
				jsmap.polygonMarkers(wh.preLoc, false);
			}, function(err){
				var title = wh.name || "Coord Sys";
    			var info = err.data.message || "System error, save coord sys failed.";
    			$scope.addError(title, info);
			});
		};
		$scope.cancelWhBase = function(){
			jsmap.clearAllLayers();
			var wh = $scope.autoInfo.createWh;
			//删除保存的base记录
			//$scope.deleteLocation();
			if(wh.preLoc && wh.preLoc.id){
				$scope.removeLocation(wh.preLoc);
			}
			//清除autoInfo
			$scope.autoInfo.createWh = {
					whInfo : wh.whInfo
			};
			$scope.apply();
		};
    	$scope.setLayersDisabled = function(disabled){
    		disabled = disabled ? true : false;
    		angular.forEach($scope.layers, function(val, key){
				val.disabled = disabled;
			});
    	};
    	$scope.init = function(){
    		jsmap.setCallbacks({
    			editPolygonStart : $scope.moveLocation,
    			editPolygonEnd : $scope.saveLocation,
    			//editRightClick : $scope.editLocation,
    			editPolygonCancel : $scope.cancelSaveLocation,
    			editPolygonRemove : $scope.removeLocation,
    			
    			mapMark : $scope.createMarker,
    			mapDrawToolStatusChange : drawToolStatusChange,
    			editMarkerStart : $scope.editEquipment,
    			editMarkerEnd : $scope.saveEquipment,
    			editMarkerCancel : $scope.cancelSaveEquipment,
    			editMarkerRemove : $scope.removeEquipment,

				mapLine : addRoad,
				editPolylineCancel : cancelSaveRoad,
				editPolylineRemove : $scope.removeRoad,
				editPolylineEnd : $scope.saveRoad,
				editPolylineEndAll : $scope.saveAllRoad,
				
				mapZoomChange : mapZoomChange
    		});
    		
    		//初始化仓库信息
    		$scope.getWarehouses();
    		$scope.showAllWarehouse();
    		
    		//监听header warehouse切换
    		$scope.$watch("currentCompanyFacility", function(currCf, oldCf){
    			if(!currCf){
    				return;
    			}
    			var wh = $scope.currentWh;
    			if(!wh && !$scope.isPageInit){
    				$scope.isPageInit = true;
    				return;
    			}
    			var curr = _.find($scope.gisWarehouses, {id : currCf.facilityId});
    			if(!wh || wh.id != curr.id){
    				if(!$scope.isWhBuild(curr.id)){
            			lincUtil.confirmPopup("Warn", "Warehouse ["+curr.name+"] hasn't create in gis, create it?", function(){
            				$scope.createWarehouse(curr);
            			}, function(){
            				//取消编辑的时候退回到原仓库
            				if(wh){
            					$scope.changeWarehouse(wh);
            				}
            			});
            		}else{
            			$scope.changeWarehouse(curr);
            		}
    			}
    		});
    	};
    	
    	$scope.initData = function(){
    		$scope.getLocations({
				scenario: "GIS_RESOURCE"
			}).then(function(){
				$scope.setLayersDisabled(false);
	    		$scope.edit.modify.disabled = false;
	    		$scope.initLayers();
	    		//$scope.clickMenu("modify", $scope.edit.modify, false, true);	//test
			});
			//ghost location
			$scope.getLocations({
				scenario: "GHOST_LOCATION"
			}).then(function(locs){
				$scope.ghostLocations = locs || [];
			});
			
			$scope.getEquipments().then(function(){
				$scope.clickMenu("webcam", $scope.layers.webcam, false, $scope.layers.webcam.checked);
			});
			
			$scope.getRoads().then(function () {
				$scope.clickMenu("road", $scope.layers.road, false, $scope.layers.road.checked);
			});
			
			$scope.baseData = $scope.baseData || {};
    		//init people data
    		$scope.getAllPeople().then(function(ps){
    			$scope.baseData.people = _.sortBy(ps, "firstName");
    		});
    	};
    	
    	//右侧栏自动填充信息
    	$scope.autoInfo = {
    		editLoc : {		//编辑中的元素
    			loc : null,	//编辑对象，clone对象或虚拟对象(批量编辑)
    			multiple : false,	//是否批量编辑
    			locList : []	//真实被编辑对象
    		},
    		selectedLocs : null,	//选中的元素，不包括新建元素，json{array}， 按type分类
    		newLocs : null,		//新建的元素，json{array}， 按type分类
    		createWh : null,	//新建warehouse
    		webcams : null,
    		editWebcam : {
    			cam : null,
    			multiple : false,
    			camList : [],
    			index : 1	//new webcam时标记name用
    		},
    		equipment : {},	//{type : [quipments]}
    		editEquipment : {	//只能编辑一类equipment
    			type : null, 
    			//typeName : null,
    			curr : null, 
    			multiple : false, 
    			list : [], 
    			index : {}	//各type的index
    		}
    	};
    	//整理autoinfo数据
    	$scope.formatAutoInfo = function(){
    		_.forEach($scope.autoInfo.selectedLocs, function(locs, type){
				$scope.autoInfo.selectedLocs[type] = _.sortBy(locs, function(loc){
					return loc.name;
				});
    		});
    		_.forEach($scope.autoInfo.newLocs, function(locs, type){
				$scope.autoInfo.newLocs[type] = _.sortBy(locs, function(loc){
					return loc.name;
				});
    		});
    		$scope.apply();
    	};
    	$scope.moveLocation = function(loc){
    		//建立坐标系
    		if($scope.BUILDING_COORD_SYS){
    			loc.type = "BASE";
    			loc.name = "BASE";
    			if($scope.autoInfo.createWh.preLoc){
    				jsmap.refreshLocation($scope.autoInfo.createWh.preLoc._uuid);
    			}
    			$scope.autoInfo.createWh.preLoc = loc;
    			return;
    		}
    		
    		var locs = null;
    		delete loc._on;
    		if(loc._isNew){
    			$scope.autoInfo.newLocs = $scope.autoInfo.newLocs || {};
    			locs = $scope.autoInfo.newLocs;
    		}else{
    			$scope.autoInfo.selectedLocs = $scope.autoInfo.selectedLocs || {};
    			locs = $scope.autoInfo.selectedLocs;
    		}
    		locs[loc.type] = locs[loc.type] || [];
			locs[loc.type].push(loc);
			locs[loc.type] = _.sortBy(locs[loc.type], function(l){
				return l.name;
			});
			if($.isEmptyObject(locs)){
				locs = null;
			}
    		$scope.apply();
    	};
    	$scope.saveLocation = function(loc){
    		if(loc instanceof Array){	//autoinfo窗口触发的info
    			_.forEach(loc, function(l){
    				var _l = $scope.getModifyLocation(l);
    				_l.warehouseId = $scope.currentWh.id;
    				
    				var vali = $scope.validateLocation(_l);
    				if(!vali.success){
    					var title = _l.name || "no-name";
    					$scope.addError(title, vali.info);
    					return;
    				}
    				$scope.commitLocation(_l).then(function(resp){	//新建返回location对象， 修改返回空
    					var newLoc = cleanData(_l);
    					if(resp.id){
    						newLoc.id = resp.id;
    					}
    					jsmap.refreshLocation(l._uuid, newLoc);
    					$scope.removeFromAutoInfo(l);
                        //store location
                        var type = $scope.getFixedLocType(newLoc);
                        $scope.locations[type].push(newLoc);
    					
    					//画base
    		    		if($scope.BUILDING_COORD_SYS){
    		    			$scope.autoInfo.createWh.preLoc = newLoc;
    		    			$scope.createCoodrSys();
    		    			return;
    		    		}
    	    		}, function(err){	//错误信息
    	    			var title = _l.name || "no-name";
    	    			var info = err.data && err.data.message || "System error, save failed.";
    	    			$scope.addError(title, info);
    	    		});
    			});
    		}else{	//map控件触发的save
    			/*
    			//保存base时提示'不能修改'
    			if($scope.BUILDING_COORD_SYS){
    				lincUtil.confirmPopup("Save Warehouse Base", 
    						"Are you sure to save Warehouse Base, it will can't be modified.", 
    						function(){
    							$scope.saveLocation([loc]);
    				});
    			}else{
    				$scope.saveLocation([loc]);
    			}
    			*/
    			$scope.saveLocation([loc]);
    		}
    	};
    	$scope.cancelSaveLocation = function(loc){
    		if($scope.BUILDING_COORD_SYS){
    			//$scope.autoInfo.createWh.preLoc = null;
    			$scope.cancelWhBase();
    			return;
    		}
    		//autoinfo 触发批量取消
    		if(loc instanceof Array){
    			var locs = _.clone(loc);
    			_.forEach(locs, function(l){
    				$scope.cancelSaveLocation(l);
    			});
    			return;
    		}
    		
    		if(loc){	//地图回调时会传入loc
    			_.forEach($scope.autoInfo.editLoc.locList, function(_loc){
    				if(loc._uuid == _loc._uuid){
    					_loc._on = false;
    				}
    			});
    			delete loc._preId;
    			$scope.removeFromAutoInfo(loc);
    		}else{
    			_.forEach($scope.autoInfo.editLoc.locList, function(_loc){
    				_loc._on = false;
    				delete _loc._preId;
    			});
    			$scope.autoInfo.editLoc.loc = null;
    			$scope.autoInfo.editLoc.locList = [];
    		}
    	};
    	$scope.removeLocation = function(loc){
    		if($scope.BUILDING_COORD_SYS){
    			$scope.autoInfo.createWh.preLoc = null;
    		}
    		
    		var id = loc.id;
    		if(id){
    			$scope.deleteLocation(id).then(function(resp){
    				jsmap.refreshLocation(loc._uuid);
    				$scope.removeFromAutoInfo(loc);
    			}, function(err){	//错误信息
    				var title = loc.name || "no-name";
    				var info = err.data.message || "System error, delete failed.";
    				$scope.addError(title, info);
    			});
    		}else{
    			jsmap.refreshLocation(loc._uuid);
				$scope.removeFromAutoInfo(loc);
    		}
    	};
    	$scope.getModifyLocation = function(loc){
    		var edit = $scope.autoInfo.editLoc;
    		var index = _.findIndex(edit.locList, {_uuid : loc._uuid});
    		var obj = {
    				_isNew : loc._isNew
    		};
    		//ghost location
    		if(loc._preId){
    			obj._isNew = false;
    			obj.id = loc._preId;
    		}
    		//批量命名
    		if(edit.locList.length > 1){
    			var _name = _.find($scope.locNameList, {_uuid : loc._uuid});
    			if(_name){
    				obj.name = _name.name;
    			}
    		}
    		//editLoc数据优先
    		if(index > -1){
    			var editLoc = _.pickBy(edit.loc, function(v, k){
        			return typeof(v) !== 'function' && typeof(v) !== 'object' && !_.startsWith(k, '_');
        		});
    			//workers数据被过滤掉了，提出来
    			editLoc.workers = edit.loc.workers;
    			_.defaults(obj, editLoc);
    		}
    		//loc主要取坐标、经纬度数据
    		var _loc = _.pickBy(loc, function(v, k){
    			return v && typeof(v) !== 'function' && typeof(v) !== 'object' && !_.startsWith(k, '_');
    		});
    		_.defaults(obj, _loc);
    		return obj;
    	};
    	$scope.validateLocation = function(loc){
    		var result = {
    				success : true,
    				info : ''
    		};
    		var condition = [{
    			is : '_isNew',
    			require : ['warehouseId', 'name', 'type', 'points', 'latlng']
    		},{
    			not : '_isNew',
    			require : ['id']
    		}];
    		_.forEach(condition, function(c){
    			if(c.is && !loc[c.is]) return;
    			if(c.not && loc[c.not]) return;
    			var lose = [];
    			_.forEach(c.require, function(r){
	    			if(!loc[r]){
	    				lose.push(r);
	    				result.success = false;
	    			}
	    		});
    			if(lose.length > 0){
    				result.info = "Missing required info : " + _.join(lose);
    			}
    		});
    		return result;
    	};

		//road
    	$scope.roadEdit = {
    		isMain : true
    	};
    	$scope.roadEditable = function(){
    		return $scope.edit.modify.checked;
    	};
    	$scope.setRoadType = function(isMain){
    		$scope.roadEdit.isMain = isMain;
    		jsmap.setDefaultRoadStyle(isMain);
    	};
    	function addRoad(path){
    		if(path.length == 1){
    			var res = roadUtil.roadAdsorb(path[0]) || {};
    			if(res.point){
    				jsmap.resetRoadRubber(res.point);
    			}
    		}else{
    			var res = roadUtil.add(path);
    			if(res["new"]){
    				_.forEach(res["new"], function(r){
    					r.type = r.type || ($scope.roadEdit.isMain ? 'Main Road' : 'Sub Road');
    					r._isNew = true;
    				});
    				jsmap.showRoad(res["new"], true);
    			}
    			if(res["remove"]){
    				_.forEach(res["remove"], function(r){
    					jsmap.refreshRoad(r._uuid);
    				});
    			}
    			jsmap.resetRoadRubber(res["lastPoint"]);
    		}
    	};
    	function cancelSaveRoad(road){
    		var res = roadUtil.cancelAll();
    		if(res.recover && res.recover.length > 0){
    			jsmap.showRoad(res.recover, true);
    		}
    	}
		$scope.saveRoad = function (road) {
			var points = [];
			_.forEach(road.path, function(p){
				points.push({
					lng: p[0],
					lat: p[1]
				});
			});
			$scope.commitRoad({
				type: road.type,
				points: points,
				_isNew: true
			}).then(function (resp) {
				roadUtil.remove([road], true);
				road.id = resp.id;
				delete road._isNew;
				roadUtil.extendRoad([road]);
				jsmap.refreshRoad(road._uuid, road);
			}, function (err) {	//错误信息
				var info = err.data.message || "System error, save failed.";
				$scope.addError("Save Road", info);
			});
		};
		$scope.saveAllRoad = function(){
			var romoveList = roadUtil.getRemoveList();
			if(romoveList && romoveList.length > 0){
				_.forEach(romoveList, function(r){
					$scope.removeRoad(r);
				});
			}
		};
		$scope.removeRoad = function (road) {
			if (road._isNew) {
                roadUtil.remove([road], true);
                roadUtil.resetRemoveList(road);
                jsmap.refreshRoad(road._uuid);
				return;
			}
			var id = road.id;
			$scope.deleteRoad(id).then(function(){
				roadUtil.remove([road], true);
				roadUtil.resetRemoveList(road);
				jsmap.refreshRoad(road._uuid);
			}, function(err){	//错误信息
				var info = err.data.message || "System error, delete failed.";
				$scope.addError("Delete Road", info);
			});
		};

    	$scope.validateWebcam = function(cam){
    		var result = {
    				success : true,
    				info : ''
    		};
    		var condition = [{
    			is : '_isNew',
    			require : ['warehouseId', 'ip', 'port', 'point', 'latlng']
    		},{
    			not : '_isNew',
    			require : ['id']
    		}];
    		_.forEach(condition, function(c){
    			if(c.is && !cam[c.is]) return;
    			if(c.not && cam[c.not]) return;
    			var lose = [];
    			_.forEach(c.require, function(r){
	    			if(!cam[r]){
	    				lose.push(r);
	    				result.success = false;
	    			}
	    		});
    			if(lose.length > 0){
    				result.info = "Missing required info : " + _.join(lose);
    			}
    		});
    		return result;
    	};
    	/**
    	 * 不传入loc时移除全部数据
    	 */
    	$scope.removeFromAutoInfo = function(loc){
    		if(loc){
    			jsmap.setEditStatus(loc, false, true);
    		}
    		var rm = 0;
    		//===  selectedLocs ===
    		_.forEach($scope.autoInfo.selectedLocs, function(_locs, _k){
    			rm += _.remove(_locs, function(_loc){
    				return !loc || _loc._uuid == loc._uuid;
    			}).length;
    			if(_locs.length === 0){
    				delete $scope.autoInfo.selectedLocs[_k];
    			}
    		});
    		if($.isEmptyObject($scope.autoInfo.selectedLocs)){
    			$scope.autoInfo.selectedLocs = null;
    		}
    		//===  newLocs ===
    		_.forEach($scope.autoInfo.newLocs, function(_locs, _k){
    			rm += _.remove(_locs, function(_loc){
        			return !loc || _loc._uuid == loc._uuid;
        		}).length;
    			if(_locs.length === 0){
    				delete $scope.autoInfo.newLocs[_k];
    			}
    		});
    		if($.isEmptyObject($scope.autoInfo.newLocs)){
    			$scope.autoInfo.newLocs = null;
			}
    		//===  equipment ===
    		if($scope.autoInfo.equipment){
    			var info = $scope.autoInfo.equipment;
    			var edit = $scope.autoInfo.editEquipment;
    			if(loc){
    				var type = loc.type;
    				var equipments = info[type];
    				rm += _.remove(equipments, function(equipment){
    					return equipment._uuid == loc._uuid;
    				}).length;
    				if(_.isEmpty(equipments)){
    					delete info[type];
    				}
    				if(type == edit.type){
    					rm += _.remove(edit.list, function(equipment){
    						return equipment._uuid == loc._uuid;
    					}).length;
    					$scope.refreshEditEquipment();
    				}
    			}else{
    				info = {};
    				edit.curr = null;
    				edit.list = [];
    			}
    		}
    		//===  editLoc ===
    		rm += _.remove($scope.autoInfo.editLoc.locList, function(_loc){
    			return !loc || _loc._uuid == loc._uuid;
    		}).length;
    		$scope.refreshEditLoc();
    		
    		if(rm > 0){
    			$scope.apply();
    		}
    		//=== create wh ===
    		if(!loc){
    			$scope.BUILDING_COORD_SYS = false;
    			$scope.autoInfo.createWh = null;
    		}
    	};
    	/**
    	 * loc._on属性控制autoinfo选中状态
    	 */
    	$scope.editLocation = function(loc, e){
    		var edit = $scope.autoInfo.editLoc;
    		if(loc instanceof Array){	//批量
    			var el = $(e.currentTarget);
    			var check = el.find("~ span[on=off]").length>0;
    			//el.data("checked",check);
    			_.forEach(loc, function(l){
    				if(check){
    					if(l._on != check){
    						edit.locList.push(l);
    					}
    				}else{
    					_.remove(edit.locList, function(_loc){
    	        			return _loc._uuid == l._uuid;
    	        		});
    				}
    				l._on = check;
    			});
    		}else{	//单个
    			//shift + click 选中zone内所有location
    			if(!loc._isNew && loc.type == "ZONE" && e && e.shiftKey){
        			$scope.innerLocation(loc, e);
        			return;
        		}
    			//ctrl + click 多选编辑
    			if(e && e.ctrlKey){
    				if(loc._on){
    					loc._on = false;
    					_.remove(edit.locList, function(_loc){
    	        			return _loc._uuid == loc._uuid;
    	        		});
    				}else{
    					loc._on = true;
    					edit.locList.push(loc);
    				}
    			}else{	//click 单选编辑
    				_.forEach(edit.locList, function(l){
    					l._on = false;
        			});
    				loc._on = true;
    				edit.locList = [loc];
    			}
    		}
    		$scope.refreshEditLoc();
    		$scope.apply();
    	};
    	$scope.refreshEditLoc = function(){
    		var edit = $scope.autoInfo.editLoc;
    		if(edit.locList.length > 1){
    			edit.multiple = true;
    			edit.loc = {type : edit.locList[0].type};
    		}else if(edit.locList.length == 1){
    			edit.multiple = false;
    			edit.loc = _.clone(edit.locList[0]);
    		}else{
    			edit.loc = null;
    		}
    		//清除ghost location标记
    		_.forEach(edit.locList, function(loc){
    			delete loc._preId;
    		});
    	};
    	$scope.innerLocation = function(zone, e){
    		var el = $(e.currentTarget).find("span");
    		var checked = !el.data("checked");
    		el.data("checked", checked);
    		if(checked){
    			checked = checked && $scope.clickMenu("location", $scope.layers.location, false, true);
    		}
    		el.toggle();
    		el.data("checked", checked);
    		
    		var id = zone.id;
    		jsmap.editInnerLocations(id, checked);
    	};
    	$scope.previewLocNames = function(swap){
    		var name = $scope.autoInfo.editLoc.name || {};
    		var pre = (name.prefix || "") + (name.increase || "1") + (name.suffix || "");
    		var reg = /^[a-zA-Z0-9]+([-_][a-zA-Z0-9]+)*$/;
    		//格式错误返回
    		if(!reg.test(pre)){
    			name.error = true;
    			return;
    		}
    		name.error = false;
    		//排序
    		var sorts = jsmap.sortByPosition($scope.autoInfo.editLoc.locList);
    		var xSort = _.flatten(sorts[0]);
    		var ySort = _.flatten(sorts[1]);
    		var xSwap = 4, ySwap = 4;
    		if(xSort.length == sorts[0].length || ySort.length === sorts[1].length || xSort.length === 1 || ySort.length === 1){
    			xSwap = 1;
    			ySwap = 1;
    		}
    		//倒换顺序
    		name.swap = name.swap || 0;
    		if(swap){
    			name.swap = (name.swap + 1) % (xSwap + ySwap);
    		}
    		var locs = name.swap < 4 ? xSort : ySort;
    		var sort = name.swap < 4 ? sorts[0] : sorts[1];
    		switch(name.swap % 4){
    		case 1 :
    			_.reverse(locs);
    			break;
    		case 2 :
    			locs = _.flatten(_.reverse(sort));
    			break;
    		case 3 :
    			_.forEach(sort, function(row){
    				_.reverse(row);
    			});
    			locs = _.flatten(sort);
    			break;
    		}
    		//重命名
    		var nameList = $scope.batchRename(locs, name.increase, name.prefix, name.suffix);
    		$scope.locNameList = nameList;
    		jsmap.renameLocations(nameList);
    		$scope.markGhostLocations();
    		
    		$scope.autoInfo.editLoc.name = name;	//防止$scope.autoInfo.editLoc.name对象为空时name.swap无法保存
    	};
    	$scope.batchRename = function(locs, inc, pre, suf){
    		pre = pre || "";
    		suf = suf || "";
    		inc = inc || "1";
    		var result = [];
            _.forEach(locs, function(loc){
                var name = (pre + inc + suf).toUpperCase();
                inc = increase(inc);
                result.push({name : name, _uuid : loc._uuid});
            });
    		return result;
    	};
    	//匹配已有的无坐标location
    	$scope.markGhostLocations = function(){
    		var edit = $scope.autoInfo.editLoc.loc;
    		var locs = $scope.autoInfo.editLoc.locList;
    		if(locs && locs.length > 0){
    			_.forEach(locs, function(loc){
    				if(!loc._isNew){
    					return true;	//continue
    				}
    				//解决编辑loc时，edit和locs数据没有实时同步的问题
    				var name = locs.length == 1 ? (edit.name || "").toUpperCase() : loc.name;
    				var type = edit.type;
    				$scope.fitGhostLocation(loc, type, name);
    			});
    		}
    	};
    	$scope.fitGhostLocation = function(loc, type, name){
    		if(!loc._isNew){
    			return;
    		}
			var ghost = _.find($scope.ghostLocations, {
				name : name,
				type : type
			});
			if(ghost){
				loc._preId = ghost.id;
			}else{
				delete loc._preId;
			}
    	};
    	//创建marker需要用到的数据
    	$scope.markerParam = {
			types : [ "WEBCAM", "PRINTER", "COMPUTER", "WARP_MACHINE", "FORKLIFT", "DISPLAY", "HUMITURE"],
			index : 0,
			edit : false
    	};
    	function drawToolStatusChange(param){
    		var name = param.name;
    		var status = param.status;
    		if(name == 'marker'){
    			var markerParam = $scope.markerParam;
    			markerParam.edit = status;
    			if(status){
    				var type = markerParam.types[markerParam.index];
    				jsmap.setMarkerCursor(type);
    			}
    		}else if(name == 'polyline'){
    			var menu = $scope.layers.road;
    			if(status && !menu.checked){
    				$scope.clickMenu('road', menu, false, true);
    			}
    		}
    	}
    	//marker type 切换快捷键
    	$(document).keyup(function(e){
			var code = e.keyCode;
			var markerParam = $scope.markerParam;
			
			var tagName = e.target.tagName.toLowerCase();
			if(tagName != "body"){
				return;
			}
			
			var only = !e.altKey && !e.shiftKey && !e.ctrlKey;
			if(only && code === 32 && markerParam.edit){	//space bar
				
				markerParam.index += 1;
				if(markerParam.index >= markerParam.types.length){
					markerParam.index = 0;
				}
				var type = markerParam.types[markerParam.index];
				jsmap.setMarkerCursor(type);
			}
    	});
    	$scope.createMarker = function(marker){
    		var param = $scope.markerParam;
    		var type = param.types[param.index];
    		marker.type = type;
    		$scope.createEquipment(marker);
    	};
    	$scope.createEquipment = function(equipment){
    		var type = equipment.type;
    		var edit = $scope.autoInfo.editEquipment;
    		edit.index[type] = edit.index[type] || 1;
    		
    		var prefix = _.startCase(_.camelCase(type)).replace(/[^A-Z]*/g, "") + "-";
    		equipment.name = prefix + edit.index[type]++;
    		
    		jsmap.refreshEquipment(null, equipment);
    		$scope.apply();
    	};
    	/*
    	$scope.createWebcam = function(cam){
    		var edit = $scope.autoInfo.editWebcam;
    		cam.name = "W-" + edit.index++;
    		jsmap.refreshWebcam(null, cam);
    		$scope.apply();
    	};
    	*/
    	//摄像头默认填充属性
    	$scope.getWebcamPreInfo = function(){
    		var pre = {};
    		var cams = $scope.equipments.WEBCAM || [];
    		if(cams && cams.length > 0){
    			var cam = _.last(cams);
    			pre = _.pick(cam, ["ip", "port", "username", "password", "direction"]);
    			if(pre.ip){
    				var ips = pre.ip.split(".");
    				ips[3] = Number(ips[3]) + 1;
    				pre.ip = ips.join(".");
    			}
    			if(pre.port){
    				pre.port = Number(pre.port) + 1;
    			}
    		}
    		return pre;
    	};
    	$scope.editEquipment = function(equipment, e){
    		//autoinfo窗口点击批量编辑
    		if(equipment instanceof Array){
    			var i = 0;
    			_.forEach(equipment, function(eqpt){
    				var _e = i==0 ? null : {ctrlKey : true};
    				$scope.editEquipment(eqpt, _e);
    				i++;
    			});
    			return ;
    		}
    		var ctrl = e && e.ctrlKey;
    		var type = equipment.type;
    		var equipments = $scope.autoInfo.equipment[type] || [];
    		$scope.autoInfo.equipment[type] = equipments;
    		
    		var index = _.findIndex(equipments, {_uuid : equipment._uuid});
    		if(index < 0){	//地图点击
    			equipment._on = false;
    			equipments.push(equipment);
    		}else{	//autoinfo窗口点击（编辑）
    			var edit = $scope.autoInfo.editEquipment;
    			//webcam只允许单个编辑, 其他类型ctrl+鼠标批量编辑
    			if(type === "WEBCAM" || !ctrl || type != edit.type){
    				_.forEach(edit.list, function(c){
    					c._on = false;
    				});
    				edit.list = [];
				}
    			equipment._on = true;
    			if(_.findIndex(edit.list, {_uuid : equipment._uuid}) < 0){
    				edit.list.push(equipment);
    			}
    			edit.type = type;
    			//新添加的webcam自动填充一些属性
    			if(type === "WEBCAM"){
    				if(!equipment.id){
    					var pre = $scope.getWebcamPreInfo();
    					edit.curr = _.defaults(equipment, pre);
    					if(edit.curr.direction){
    						jsmap.refreshWebcamIcons(edit.curr);
    					}
    				}
    			}
    			$scope.refreshEditEquipment();
    		}
    		$scope.apply();
    	};
    	$scope.refreshEditEquipment = function(){
    		var edit = $scope.autoInfo.editEquipment;
    		var len = edit.list.length;
    		edit.multiple = len > 1;
			if(len > 1){
				var prefix = _.startCase(_.camelCase(edit.type)).replace(/[^A-Z]*/g, "") + "-";
				edit.curr = {
						prefix : prefix,
						increase : "",
						suffix : ""
				};
			}else if(len === 1){
				edit.curr = edit.list[0];
			}else if(len === 0){
				edit.curr = null;
			}
    	};
    	$scope.refreshEquipmentNames = function(){
    		var edit = $scope.autoInfo.editEquipment;
    		var list = edit.list;
    		var pre = edit.curr.prefix;
    		var inc = edit.curr.increase;
    		var suf = edit.curr.suffix;
    		_.forEach(list, function(e){
    			if(!inc){
    				inc = increase(inc);
    			}
    			var name = pre + inc + suf;
    			e.name = name;
    			inc = increase(inc);
    		});
    		jsmap.renameMarkers(list);
    	};
    	$scope.editFirstWebcam = function(){
    		var cams = $scope.autoInfo.webcams;
    		if(cams && cams.length > 0){
    			$scope.editWebcam(cams[0]);
    		}
    	};
    	$scope.saveEquipment = function(equipment){
    		var edit = $scope.autoInfo.editEquipment;
    		if(edit.multiple){
    			$scope.refreshEquipmentNames();
    		}
    		var list = equipment ? [equipment] : edit.list;
    		_.forEach(list, function(eqpmt){
    			eqpmt.warehouseId = $scope.currentWh.id;
    			if(eqpmt.type === "WEBCAM"){
    				var vali = $scope.validateWebcam(eqpmt);
    				if(!vali.success){
    					var title = eqpmt.name || "no-name";
    					$scope.addError(title, vali.info);
    					return;
    				}
    			}
    			$scope.commitEquipment(cleanData(eqpmt, ["_isNew"])).then(function(resp){	//新建返回location对象， 修改返回空
    				eqpmt.id = resp.id;
    				var cleanEquipment = cleanData(eqpmt);
    				$scope.equipments.WEBCAM = $scope.equipments.WEBCAM || [];
    				$scope.equipments.WEBCAM.push(cleanEquipment);
    				jsmap.refreshEquipment(eqpmt._uuid, cleanEquipment);
    				$scope.removeFromAutoInfo(eqpmt);
    				if(eqpmt.type === "WEWBCAM"){
    					$scope.editFirstWebcam();
    				}
    			}, function(err){	//错误信息
    				var title = eqpmt.name || "no-name";
    				var info = err.data.message || "System error, save failed.";
    				$scope.addError(title, info);
    			});
    		});
    	};
    	$scope.cancelSaveEquipment = function(equipment){
    		//autoinfo 触发批量取消
    		if(equipment instanceof Array){
    			var equipments = _.clone(equipment);
    			_.forEach(equipments, function(e){
    				$scope.cancelSaveEquipment(e);
    			});
    			return;
    		}
    		if(equipment){	//地图触发取消
    			$scope.removeFromAutoInfo(equipment);
    		}else{
    			var edit = $scope.autoInfo.editEquipment;
    			$scope.autoInfo.editWebcam.curr = null;
    			_.forEach(edit.list, function(e){
    				e._on = false;
    			});
    			edit.list = [];
    		}
    		$scope.refreshEditEquipment();
    	};
    	$scope.removeEquipment = function(equipment){
    		var id = equipment.id;
    		if(id){
    			$scope.deleteEquipment(id).then(function(resp){
    				jsmap.refreshEquipment(equipment._uuid);
    				$scope.removeFromAutoInfo(equipment);
    			}, function(err){	//错误信息
    				var title = equipment.name || "no-name";
    				var info = err.data.message || "System error, delete failed.";
    				$scope.addError(title, info);
    			});
    		}else{
    			jsmap.refreshEquipment(equipment._uuid);
				$scope.removeFromAutoInfo(equipment);
    		}
    	};
    	$scope.setWebcamDirection = function(cam){
    		jsmap.refreshWebcamIcons(cam);
    	};
    	//people in zone
    	$scope.togglePeopleInZone = function(zone, people){
    		var userId = people.idmUserId;
    		var workers = zone.workers || [];
    		if(_.indexOf(workers, userId) >= 0){
    			_.pull(workers, userId);
    		}else{
    			workers.push(userId);
    		}
    		zone.workers = workers;
    	};
    	$scope.clearPeopleInZone = function(zone){
    		zone.workers = [];
    	};
    	
    	
    	$scope.addError = function(title, info){
    		$scope.errorList.push({
    			title : title,
    			info : info
    		});
    		$scope.apply();
    		$timeout(function(){
    			if($scope.errorList.length > 0){
    				$scope.errorList.shift();
    			}
    		}, 3000);
    	};
    	
    	function mapZoomChange(zoom){
    		var len = jsmap.centumPixelToLength();
    		var roadAdsorb = len.latlngOffset / 5;	//20 pixel
    		roadUtil && roadUtil.setAdsorbLength(roadAdsorb);
    		
    		var roadMenu = $scope.layers.road;
    		if(zoom < MIN_ROAD_ZOOM){
    			if(roadMenu.checked && !roadMenu.zoomCtrl){
    				$scope.clickMenu('road', roadMenu, true, false);
    				roadMenu.zoomCtrl = true;
    			}
    		}else{
    			if(roadMenu.checked && roadMenu.zoomCtrl){
    				$scope.clickMenu('road', roadMenu, true, true);
    				roadMenu.zoomCtrl = false;
    			}
    		}
    	};

		/**
		 * THREE_D_GRID
		 */
		$scope.openGridDialog = function (loc) {
			/*
			var locs = [];
			_.forEach($scope.locations.location, function (item) {
				if(item.parentId == loc.id && item.subType == "3D_GRID")
					locs.push(item);
			});
			*/
			if(!loc || !loc.id){
				return;
			}
			$scope.getLocations({
				parentId : loc.id
			}).then(function(locs){
				$mdDialog.show({
					templateUrl: 'gis/setup/template/tierGrid.html',
					controller: tierGridController,
					controllerAs: 'ctrl',
					locals: {
						loc: loc,
						locs: locs
					},
					bindToController: true
				});
			});
			
		};
		
		$scope.equipmentTypeSetup = function(ev) {
            var templateUrl = 'gis/setup/template/equipmentType.html';
            var param = {
            		currWh: $scope.currentWh,
            		whs : $scope.warehouses
            };
            lincUtil.popupBodyPage(equipmentTypeController, templateUrl, ev, param).then(function(data) {

            });
        };

		setTimeout($scope.init, 500);
    };
    
    setupPageController.prototype = mainCtrl;

    setupPageController.$inject = ['$scope', '$resource', '$timeout', '$mdDialog', 'lincResourceFactory', 'apiHost', 'lincUtil'];

    return setupPageController;
});
