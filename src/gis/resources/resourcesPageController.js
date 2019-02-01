'use strict';

define([
    'jquery',
    'angular',
	'lodash',
    'moment',
    '../main/mainPageController',
    '../api/jsmap',
    './rtspPlayer',
    './threeInventory'
], function($, angular, _, moment, mainCtrl, jsmap, rtspPlayer, _3D) {
	var headerHeight, footerHeight;
	function resizePage(){
		//避免影响其他页面
		if($("#gis_main").length === 0){
			return;
		}
		headerHeight = $('.page-header').outerHeight() || 46;
        footerHeight = $('.page-footer').outerHeight();
        var windowHeight = $(window).height();
        
        $("body").css("overflow", "hidden");
        var gis_main = $("#gis_main");
        gis_main.height(windowHeight - headerHeight);
        
        if(gis_main.width() > 0){
        	var info_open = $("#infowindow #ctrl").data("open");
        	var info_len = $("#infowindow").outerWidth();
        	$("#gis_main #jsmap").outerWidth(gis_main.width() - (info_open ? info_len : 0));
        }
        
        //$("#gis_main #infowindow").height(windowHeight - headerHeight);
        
        resizeWebcamPlayer();
        
        _3D.resizePage();
	}
	
	function resizeWebcamPlayer(){
		var size = getPlayerSize();
		var el = $("#gis_main #webcam_player");
		el.height(size.height);
		el.width(size.width);
	}
	
	function getPlayerSize(){
		var width = $("#gis_main").width();
		var n = Math.floor((width / 280).toFixed(0));
		var w = Math.floor(width / n);
		var h = Math.floor(w * 0.56);
		return {
			width : w,
			height : h,
			count : n
		};
	}
	
	function registEvent(){
		$(window).resize(function(){
			resizePage();
		});
		
		$("#gis_main").on('mousemove', function(e){
			//showMenu(e.clientX, e.clientY);
		});
		
		$("#infowindow #ctrl").on("click", function(e){
			// var el = $(this);
			// var win = $("#infowindow");
			// var open = !el.data("open");
			// var win_len = win.outerWidth();
			// el.data("open", open);
			// win.css("right", open ? 0 : -win_len);
			// var map = $("#jsmap");
			// map.outerWidth(map.outerWidth() - (open ? win_len : -win_len));
			
			// el.toggleClass("glyphicon-triangle-left");
			// el.toggleClass("glyphicon-triangle-right");
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
			
			$("#infowindow").animate({
				right : len
			});
		
		});
	}
	
	function switchMenu(id, checked){
		var el = $("#gis_main #menu #" + id);
		
		if(checked){
			el.attr("checked", "checked");
		}else{
			el.removeAttr("checked");
		}
	}
	
	function showMenu(clientX, clientY){
		var div = $("#gis_main #menu");
		var mapOffsetX =  $("#gis_main #jsmap").offset().left;
		var offsetX = clientX - mapOffsetX;
		if(div.is(":hidden")){
			if(offsetX < 100 && clientY > 200){
				div.slideDown("fast");
			}
		}else{
			if(offsetX > div.outerWidth()){
				div.slideUp("fast");
			}
		}
	}
	
	/*
	 * info : [[a,b,c], [d,e], [f,g,h]]
	 * table : 
	 * 		a 	b	c
	 * 		d	e
	 * 		f	g	h
	 */
	function createInfoTable(info){
		var html = "<table>";
		_.forEach(info, function(row){
			var tr = "<tr>";
			var firstCol = true;
			_.forEach(row, function(col){
				var style = firstCol ? "text-align: right; padding-right: 5px;" : "";
				var b = firstCol ? "" : "<b>";
				tr += "<td style='vertical-align: initial; " + style + "'>" + b + col + b + "</td>";
				firstCol = false;
			});
			tr += "</tr>";
			html += tr;
		});
		html += "</table>";
		return html;
	}
	
	var INFO_PAGE_SIZE = 7;
	
    var resourcesPageController = function($interval,$scope, $resource, $timeout, $mdDialog, $mdPanel, $mdMedia, lincResourceFactory, apiHost, lincUtil, inventoryService,yardEquipmentService,entryService) {
    	$scope = $scope.$parent;
    	
    	var goEasy;
    	
    	// registEvent();
    	// resizePage();
    	// jsmap.initMap('jsmap');
    	
    	//动态数据刷新时间
    	$scope.INTERVAL_TIME = {
    			INVENTORY : 1000 * 60 * 60,
    			OCCUPY : 1000 * 60 * 5,
    			TRUCK : 1000 * 60 * 3,
    			FLEET : 1000 * 7
    	};
    	
    	$scope.autoInfo = {
			selectWarehouse:'All',
			selectCustomer:'Vizio',
			warehouses : null,
			inventory : null,
			inventoryDetail: null,
			parking_occupy : null,
			dock_occupy : null,
			inventoryHis : null,
			truck : null,
			truckPlayback : null,
			demand : null,
			loadStatus : null,
			locUtilization : null,
			serviceStatus : null,
			pickTask : null,
			pickHeatData : null,

			display : null,

			currentLoc : null,	//当前鼠标所在的location对象
			currentInventoryLoc : null,	//当前展示的inventory所在location
			inventoryLocs : [], 	//有库存的locs ID
			inventoryLocStore : {},	//inventory缓存, 减少请求次数,  by locationId,

			filter : {},	//筛选条件，key格式：inventory_item
			list : {},		//筛选列表， key格式 ： inventory_item， value : Array; key不带前缀表示公用，如item

			bottomInfoClose : false,	//info window 开关

			clearFilter : function(key){	//清除filter, key = "inventory"  --> 清除inventory_*
				if(!key){
					return;
				}
				key += "_";
				_.forEach($scope.autoInfo.filter, function(v, k){
					if(_.startsWith(k, key)){
						delete $scope.autoInfo.filter[k];
					}
				});
			},
			getFilter : function(key){
				if(!key){
					return {};
				}
				key += "_";
				var filter  = {};
				_.forEach($scope.autoInfo.filter, function(v, k){
					if(v && _.startsWith(k, key)){
						filter[k.replace(key, "")] = v;
					}
				});
				return filter;
			}
    	};
    	$scope.autIinfoIsEmpty = function(){
    		return false;
    		/*
    		var keys = ["warehouses", "inventory", "parking_occupy", "dock_occupy", "dock_occupy", "inventoryHis",
				"truck", "demand", "loadStatus", "locUtilization", "serviceStatus", "pickTask"];

    		return _.every(keys, function(key){
    			var info = $scope.autoInfo[key];
    			return !info || _.size(info) === 0;
    		});
    		*/
    	};
    	$scope.setAutoInfo = {
			warehouse : function(whs){
				$scope.autoInfo.warehouses = whs;
				$scope.apply();
			},
			inventory : function(inventory){
				$scope.setAutoInfo.inventoryDetail();
				if(inventory){
					$scope.autoInfo.inventory = {
							list : inventory
					};
					$scope.refreshDataPage($scope.autoInfo.inventory);
				}else{
					$scope.autoInfo.inventory = null;
					$scope.autoInventoryDisable = false;
				}
				$scope.apply();
			},
			inventoryDetail: function(itemCount, item){
				if(itemCount){
					$scope.autoInfo.inventoryDetail = {
						item: item,
						list: itemCount.locations,
						totalQty: itemCount.totalQty,
						page_size: 5
					};
					$scope.refreshDataPage($scope.autoInfo.inventoryDetail);
					var loc = _.map(itemCount.locations, function(_loc){
						return {
							id: _loc.locationId,
							_type: "border"
						};
					});
					recoverInventoryHighlight();
					jsmap.highlightLocs(loc, "inventory_item");
				}else{
					$scope.autoInfo.inventoryDetail = null;
					jsmap.highlightLocs(null, "inventory_item");
					recoverInventoryHighlight();
				}
				$scope.apply();
			},
			parking_occupy : function(occupy){
				if(occupy){
					var total = $scope.locations.parking.length;
					$scope.autoInfo.parking_occupy = {
							occupy_total : occupy.length,
							total : total,
							list : occupy
					};
				}else{
					$scope.autoInfo.parking_occupy = null;
				}
				$scope.apply();
			},
			dock_occupy : function(occupy){
				if(occupy){
					var total = $scope.locations.dock.length;
					$scope.autoInfo.dock_occupy = {
							occupy_total : occupy.length,
							total : total,
							list : occupy
					};
				}else{
					$scope.autoInfo.dock_occupy = null;
				}
				$scope.apply();
			},
			truck : function(trucks){
				if(trucks){
					$scope.autoInfo.truck = {
						list : trucks,
					};
					$scope.refreshDataPage($scope.autoInfo.truck);
				}else{
					$scope.autoInfo.truck = null;
					$scope.setAutoInfo.truckPlayback();
				}
				$scope.apply();
			},
			truckPlayback : function(truck){
				if(truck){
					$scope.autoInfo.truckPlayback = {
							truck : truck,
							points : null,
							current : 0, //当前播放点的index
							pause : true
					};
				}else{
					$scope.autoInfo.truckPlayback = null;
					$scope.truckPlayback.remove();
				}
			},
			loadStatus : function(loads){
				if(loads){
					$scope.autoInfo.loadStatus = {
							list : loads
					};
					$scope.refreshDataPage($scope.autoInfo.loadStatus);
				}else{
					$scope.autoInfo.loadStatus = null;
				}
			},
			serviceStatus : function(status){
				if(status){
					$scope.autoInfo.serviceStatus = {
							list : status
					};
					$scope.refreshDataPage($scope.autoInfo.serviceStatus);
				}else{
					$scope.autoInfo.serviceStatus = null;
				}
			},
			demand : function(data){
				if(data){
					var maxQty = 0;
					_.forEach(data, function(item){
						if(item.qty > maxQty){
							maxQty = item.qty;
						}
					});
					//最大值修正为1W整
					maxQty = (Math.floor(maxQty / 10000) + 1 ) * 10000;
					$scope.autoInfo.demand = {
							maxQty : maxQty,
							list : data,
							colorRange : jsmap.getStateColors("demand")
					};
					$scope.refreshDataPage($scope.autoInfo.demand);
				}else{
					$scope.autoInfo.demand = null;
				}
			},
			locUtilization : function(locs){
				if(locs){
					var list = [];
					_.forEach(locs, function(loc){
						var rate = parseInt(Math.random() * 100);
						list.push({
							name : loc.name,
							utilizationRate : rate
						});
					});
					list = _.sortBy(list, "name");
					$scope.autoInfo.locUtilization = {
							list : list
					};
					$scope.refreshDataPage($scope.autoInfo.locUtilization);
				}else{
					$scope.autoInfo.locUtilization = null;
				}
			},
			display : function(display){
				var info = $scope.autoInfo.display || {
					playList : [],
					asset : null,
					listHistory : {}
				};
				if(info.asset){
					info.asset._active = false;
					jsmap.refreshEquipmentIcons(info.asset);
					info.listHistory[info.asset.id] = info.playList;
				}
				if(display && (!info.asset || display.id != info.asset.id)){
					info.asset = display;
					info.playList = info.listHistory[display.id] || [];
					display._active = true;
					jsmap.refreshEquipmentIcons(display);
				}else{
					var asset = info.asset;
					if(asset){
						info.listHistory[asset.id] = info.playList;
					}
					info.playList = [];
					info.asset = null;
				}
				$scope.autoInfo.display = info;
			},

			pickTask : function (isLoadTask) {
				if (isLoadTask) {
					$scope.getPickTask().then(function (datas) {
						$scope.autoInfo.pickTask = {};
						$scope.autoInfo.pickTask.datas = datas;
						$scope.autoInfo.pickTask.list = datas.pickTasks;
						$scope.refreshDataPage($scope.autoInfo.pickTask);
						$scope.apply();
					});
				} else {
					$scope.autoInfo.pickTask = null;
					$scope.apply();
				}
			},
			heatMap: function (isLoadHeatMap) {
				if (isLoadHeatMap) {
					$scope.autoInfo.pickHeatData = {};
					$scope.getPickTask().then(function (datas) {
						$scope.autoInfo.pickHeatData.datas = datas;
						$scope.autoInfo.pickHeatData.list = [];

						_.forEach(datas.pickTasks, function (task) {
							_.forEach(task.subTasks, function (subTask) {
								if (subTask.pickItemLines == null) return;

								_.forEach(subTask.pickItemLines, function (itemLine) {

									var isFound = false;
									for(var i = 0; i < $scope.autoInfo.pickHeatData.list.length; i++) {
										if ($scope.autoInfo.pickHeatData.list[i].location.id == itemLine.locationId) {
											isFound = true;
											$scope.autoInfo.pickHeatData.list[i].count++;
										}
									}
									if (!isFound) {
										var plocation = {};
										plocation.location = _.find(datas.locationMap, function (l) {
											return l.id == itemLine.locationId;
										});
										plocation.count = 1;
										$scope.autoInfo.pickHeatData.list.push(plocation);
									}
								})

							})
						})

						showPickHeatMap($scope.autoInfo.pickHeatData.list);
						$scope.refreshDataPage($scope.autoInfo.pickHeatData);
						$scope.apply();
					});
				} else {
					$scope.autoInfo.pickHeatData = null;
					$scope.apply();
				}
			}
    	};
    	//params : 传给内部函数使用的参数
    	$scope.clickMenu = function(menuKey, silent, checked, params){
    		var item = $scope.menus[menuKey];
    		if(!item || item.disabled){
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
    		if(checked){
    			//关闭冲突的菜单
    			$scope.menuSingleCtrl(menuKey);
    		}
			//定位浮动菜单
			locateFloatMenu(menuKey, checked);
    		if(menuKey == "warehouse"){
    			if(checked){
    				//fitBounds默认为true
    				var fitBounds = params && params.fitBounds;
    				fitBounds = fitBounds === undefined || fitBounds;
    				$scope.showAllWarehouse(fitBounds);
    			}else{
    				jsmap.hideAllWarehouses();
    				$scope.setAutoInfo.warehouse();
    			}
    		}else if(menuKey == "layer"){
    			$scope.toggleLayers(checked);
    		}else if(_.includes(["zone", "location", "staging", "dock", "parking", "other"], menuKey)){
    			var _type = menuKey;
    			if(checked){
					jsmap.showLocation(_type, $scope.locations[_type]);
    			}else{
    				jsmap.hideLocation(_type);
    			}
    		}else if(_.includes(["webcam", "humiture", "printer", "computer", "warpMachine", "display"], menuKey)){
    			var type = _.lowerCase(menuKey).replace(" ", "_").toUpperCase();
    			if(checked){
    				loadEquipment(type);
    			}else{
    				$scope.removeAllPlayer();
    				jsmap.hideEquipment(type);
    				//清除autoInfo
    				if(menuKey == "display"){
    					$scope.displayCtrl.open();
    				}
    			}
    		}else if(_.includes(["forklift", "peopleLocate"], menuKey)){
				
				var type = _.lowerCase(menuKey).replace(" ", "_").toUpperCase();
				if(checked){
					loadEquipment(type);
				}else{
    				jsmap.hideEquipment(type);
    			}
				
    			// $scope.refreshFleets(menuKey);
    		}else if(menuKey == "utilization"){
    			var layer = $scope.getMenu("layer");
    			if(checked){
    				if(!layer.checked){
    					$scope.clickMenu("layer", false, true);
    				}
    				//=============
    				inventoryService.getInventoryForGis({}).then(function(invs){
    					var locs = [];
    					_.forEach(invs, function(inv){
    						locs.push(inv.location);
    					});
    					locs = _.uniq(locs);
    					
    					jsmap.showLocsUtilizationRate(locs);
    					$scope.setAutoInfo.locUtilization($scope.locations.zone);
    				});
    				//=============
    				
    				//jsmap.showLocsUtilizationRate($scope.locations.location);
    				//$scope.setAutoInfo.locUtilization($scope.locations.zone);
    			}else{
    				jsmap.hideLocsUtilizationRate();
    				$scope.setAutoInfo.locUtilization();
    			}
    		}else if(menuKey == "occupy"){
    			$scope.refreshOccupy();
    		}else if(menuKey == "currentInv"){
    			//$scope.refreshInventory();
    			if(checked){
    				$scope.showLocationWithInventory()
    			}else{
    				$scope.hideLocationWithInventory();
    			}
    		}else if(menuKey == "invHeatMap"){
    			if(checked){
    				jsmap.showLocation("zone", $scope.locations.zone);
    				jsmap.showLocation("location", $scope.locations.location);
    				jsmap.hideLocation("location");
    				showInventoryHeatMap();
    			}else{
    				hideInventoryHeatMap();
    			}
    		}else if(menuKey == "loadStatus"){
    			if(checked){
    				$scope.showLoadStatus();
    			}else{
    				$scope.autoInfo.loadStatus = null;
    				//delete $scope.autoInfo.filter.loadStatus_loadNo;
    				$scope.autoInfo.clearFilter("loadStatus");
    				jsmap.clearAllLayers();
    			}
    		}else if(menuKey == "truck"){
    			$scope.refreshTrucks();
    		}else if(menuKey == "serviceStatus"){
    			if(checked){
    				$scope.showServiceStatus();
    			}else{
    				$scope.autoInfo.serviceStatus = null;
    				jsmap.clearAllLayers();
    			}
    		}else if(menuKey == "recycleCollection"){
    			if(checked){
    				$scope.showRecycleCollection();
    			}else{
    				jsmap.clearAllLayers();
    			}
    		}else if(menuKey == "osrTech"){
    			if(checked){
    				$scope.showOsrTech();
    			}else{
    				jsmap.clearAllLayers();
    			}
    		}else if(menuKey == "invPlayback"){
    			if(checked){
    				$scope.invPlayback();
    			}else{
    				$scope.autoInfo.inventoryHis = null;
    				jsmap.clearAllLayers();
    			}
    		}else if(menuKey == "demand"){
    			if(checked){
    				$scope.demandInStates();
    			}else{
    				$scope.autoInfo.demand = null;
    				jsmap.clearAllLayers();
    			}
    		}else if(menuKey == "downloadPdf"){
    			$scope.exportWarehouse();
    			item.checked = false;
    		}else if(menuKey == "createMap"){
    			window.open("#/gis/setup");
    			item.checked = false;
    		}else if(menuKey == "workZone"){
	    		if(checked){
	    			$scope.showPeopleInZone();
	    		}else{
	    			$scope.hidePeopleInZone();
	    		}
	    	} else if (menuKey == "warehouseRoad") {
				if (checked) {
					jsmap.showRoad($scope.roads);
				} else {
					jsmap.hideRoad();
				}
			}else if(menuKey == "roadHeatMap"){
    			if(checked){
    				jsmap.showLocation("zone", $scope.locations.zone);
    				jsmap.showRoad($scope.roads);
    				jsmap.hideRoad();
    				showRoadHeatMap();
    			}else{
    				hideRoadHeatMap();
    			}
    		} else if (menuKey == "pickTask") {
				if (checked) {
					var layer = $scope.getMenu("layer");
					if(!layer.checked){
						$scope.clickMenu("layer", false, true);
					}

					var road = $scope.getMenu("road");
					if(!road.checked){
						$scope.clickMenu("road", false, true);
					}

					$scope.setAutoInfo.pickTask(true);
				} else {
					jsmap.highlightLocs(null, "pick_location");
					jsmap.hidePickRoad();
					$scope.setAutoInfo.pickTask(false);
					$scope.setAutoInfo.locUtilization();
					$scope.selTaskId = null;
				}
			} else if (menuKey == "heatMap") {
				if (checked) {
					$scope.setAutoInfo.heatMap(true);
				} else {
					jsmap.showHeatLocation(null);
					jsmap.showHeatMap(null);
					$scope.setAutoInfo.heatMap(false);
					$scope.selHeatLocationId = null;
				}
			}

    		if(checked){
    			//关闭非定位仓库视图的不可用菜单
        		$scope.menuDisableCtrl();
        		//有二级菜单的一级菜单只能打开一个
        		$scope.mainMenuUniqCtrl(menuKey);
    		}else{
    			$scope.defaultView();
    		}
    		if(!silent){
    			
    		}
    	};
    	$scope.menus = {
    			warehouse : 	{name : "Overview", 	checked : true,  disabled : false,	fontIcon : ""},
    			
    			layers : 		{name : "Location", 			checked : false, disabled : false,	fontIcon : "view_quilt",
    								children : ["layer", "occupy", "utilization", "pickTask", "heatMap"]},
    			layer : 		{name : "Layout", 		checked : false, disabled : false}, 
    			zone : 			{name : "Zone", 		checked : false, disabled : false},
 			   	location : 		{name : "Location", 	checked : false, disabled : false},
 			   	staging : 		{name : "Staging", 		checked : false, disabled : false},
 			   	dock : 			{name : "Dock", 		checked : false, disabled : false},
 			   	parking : 		{name : "Parking", 		checked : false, disabled : false},
 			   	other : 		{name : "Other", 		checked : false, disabled : false},

 			   	road : 			{name : "Road", 		checked : false, disabled : false,	fontIcon : "timeline",
 			   						children : ["warehouseRoad", "roadHeatMap"]},
				warehouseRoad : {name : "Road", 		checked : false, disabled : false},
				roadHeatMap : 	{name : "Road Heat Map",checked : false, disabled : false},

 			    utilization : 	{name : "Utilization rate", 		checked : false, disabled : false},
 			   	occupy : 		{name : "Occupy", 		checked : false, disabled : false,	fontIcon : ""},
				pickTask : 		{name : "Pick task", 		checked : false, disabled : false,	fontIcon : ""},
				heatMap : 		{name : "Heat Map", 		checked : false, disabled : false,	fontIcon : ""},
 			   	
 			   	inventory : 	{name : "Inventory", 	checked : false, disabled : false,	fontIcon : "dashboard",
 			   						children : ["currentInv", "invHeatMap"]},
 			   	currentInv : 	{name : "Current Inventory", 	checked : false, disabled : false,	fontIcon : "dashboard"},
 			   	invHeatMap : 	{name : "Inventory Heat Map", 	checked : false, disabled : false,	fontIcon : "bubble_chart"},
 			   	
 			   	equipment : 	{name : "Device", 		checked : false, disabled : false,	fontIcon : "devices",
 			   						children : ["webcam", "humiture", "printer", "computer", "laptop", "camera", "mobile", "audio", "display", "gps", "warpMachine"]},
				webcam : 		{name : "Surveillance", 		checked : false, disabled : false},
 			   	humiture : 		{name : "Humiture", 	checked : false, disabled : false},
 			   	printer : 		{name : "Printer", 		checked : false, disabled : false},
 			   	computer : 		{name : "Computer", 	checked : false, disabled : false},
 			   	warpMachine : 	{name : "Wrap machine", checked : false, disabled : false},
 			   	camera : 		{name : "Camera", checked : false, disabled : true},
 			   	laptop : 		{name : "Laptop", checked : false, disabled : true},
 			    mobile : 		{name : "Mobile", checked : false, disabled : true},
 			    gps : 			{name : "GPS", checked : false, disabled : true},
 			    display : 		{name : "Display", checked : false, disabled : false},
 			    audio : 		{name : "Audio", checked : false, disabled : true},
 			   	
 			   	fleet : 		{name : "Fleet", 		checked : false, disabled : false,	fontIcon : "directions_car",
									children : ["auto", "van", "fleet_truck", "tractor", "trailer", "container", "forklift"]},
				auto : 			{name : "Auto", 	checked : false, disabled : true},
				van : 			{name : "Van", 	checked : false, disabled : true},
				fleet_truck : 	{name : "Truck", 	checked : false, disabled : true},
				tractor : 		{name : "Tractor", 	checked : false, disabled : true},
				trailer : 		{name : "Trailer", 	checked : false, disabled : true},
				container : 	{name : "Container", 	checked : false, disabled : true},
				forklift : 		{name : "Forklift", 	checked : false, disabled : false},
 			   	
 			   	people : 		{name : "People", 		checked : false, disabled : false,	fontIcon : "people",
 			   						children : ["peopleLocate", "workZone", "chat"]},
 			   	peopleLocate : 		{name : "Live position", checked : false, disabled : false},
 			   	workZone : 		{name : "Zone location", checked : false, disabled : false},
 			   	chat : 			{name : "Chat", 		checked : false, disabled : true},
 			   	
 			   	distribution :	{name : "Intelligence", 	checked : false, disabled : false,	fontIcon : "track_changes",
 			   						children : ["invPlayback", "demand", "loadStatus", "truck", "serviceStatus", "recycleCollection", "osrTech", "ship"]},
 			   	invPlayback : 	{name : "Inventory Playback", 	checked : false, disabled : false},
 			   	demand : 		{name : "Demand", 		checked : false, disabled : false},
 			   	loadStatus : 	{name : "Load status", 	checked : false, disabled : false},
 			   	truck : 		{name : "Truck", 		checked : false, disabled : false},
 			    ship : 			{name : "Ship", 		checked : false, disabled : false},
 			    serviceStatus : {name : "Service Status", 		checked : false, disabled : false},
 			    recycleCollection : {name : "Recycle Collection Center", checked : false, disabled : false},
 			    osrTech : 		{name : "OSR Tech", 	checked : false, disabled : false},
 			   	
 			   	createMap : 	{name : "Create map", 	checked : false, disabled : false,	fontIcon : "settings"},
 			   	openMap : 		{name : "Open map", 	checked : false, disabled : false,	fontIcon : "account_balance",	children : ["warehouse"]},
 			   	shareFile : 	{name : "Share file", 	checked : false, disabled : false,	fontIcon : "insert_drive_file",	children : ["downloadPdf"]},
 			   	downloadPdf : 	{name : "Download PDF", checked : false, disabled : false},
 			   	
 			   	truckRoute : 	{name : "Truck route", 	checked : false, disabled : true,	fontIcon : "local_shipping"},
 			   	traffic : 		{name : "Traffic", 		checked : false, disabled : true,	fontIcon : "traffic"},
 			   	earth : 		{name : "Earth", 		checked : false, disabled : true,	fontIcon : "public"},
 			   	terrain : 		{name : "Terrain", 		checked : false, disabled : true,	fontIcon : "terrain"},
 			   	transit : 		{name : "Transit", 		checked : false, disabled : true,	fontIcon : "directions_bus"},
 			   	bicycling : 	{name : "Bicycling", 	checked : false, disabled : true,	fontIcon : "directions_bike"},
 			   	
 			   	tour : 			{name : "Tour", 		checked : false, disabled : true,	fontIcon : ""},
 			   	tipTrick : 		{name : "Tip & Tricks", checked : false, disabled : true,	fontIcon : ""},
 			   	help : 			{name : "Help", 		checked : false, disabled : true,	fontIcon : ""},
 			   	feedback : 		{name : "Feedback", 	checked : false, disabled : true,	fontIcon : ""},
 			   	history : 		{name : "History", 		checked : false, disabled : true,	fontIcon : ""}
    	};
    	
    	$scope.menuGroups = [["inventory", "layers", "equipment", "fleet", "people", "road", "shareFile"],
    	                     ["openMap", "createMap"],
    	                     ["distribution"],
    	                     ["traffic", "truckRoute", "transit", "bicycling", "terrain", "earth"],
    	                     ["tour", "tipTrick", "help", "feedback", "history"]];
    	var menuConfig = {
    		//没有定位仓库撤销的菜单，会清除菜单图层
    		noWhUndo : ["occupy", "currentInv", "utilization", "warehouseRoad", "invHeatMap", "roadHeatMap"],
    		//没有定位仓库无效的菜单，会锁定菜单，不会清除菜单图层
    		noWhDisable :["inventory", "road", "layers", "equipment", "people", "shareFile", "fleet"],
    		//需要单独打开的菜单，清除其他菜单图层
    		singleCtrl : ["warehouse", "loadStatus", "invPlayback", "truck", "demand", "serviceStatus", "recycleCollection", "osrTech"]
    		
    	};
    	$scope.childernMenuPos = "";
    	function locateFloatMenu(key, checked){
    		var el = $("#menu-" + key);
    		if(el.length == 0){
    			return;
    		}
    		var ch = $(".float-menu");
    		checked && ch.hide();
    		var top = el.offset().top - headerHeight - 13;
    		var left = el.outerWidth() + 4;
    		$scope.childernMenuPos = "top: " + top + "px; left: " + left + "px;";
    	}
    	//取消菜单选择，仅设置checked=false，不执行取消选择关联的业务逻辑
    	function uncheckMenu(key){
    		var menu = $scope.getMenu(key);
   			menu.checked = false;
    	};

    	var lastMenuKey = null;
    	$scope.mouseInSimpleMenu = function(key){
    		if(key == 'createMap'){
    			lastMenuKey && uncheckMenu(lastMenuKey);
    			lastMenuKey = null;
    			return null;
    		}
    		$scope.clickMenu(key);
    		lastMenuKey = key;
    	};
    	$scope.mouseOutChildMenu = function(){

    	};
    	
    	$scope.isMenuChecked = function(key){
    		var menu = $scope.getMenu(key);
    		return !!menu.checked;
    	};
    	$scope.getMenu = function(key){
    		return $scope.menus[key] || {};
    	};
    	$scope.getMenus = function(keys){
    		var menus = {};
    		if(keys){
    			_.forEach(keys, function(k){
    				var m = $scope.menus[k];
    				if(m){
    					menus[k] = m;
    				}
    			});
    		}
    		return menus;
    	};
    	$scope.childrenMenuOpen = function(){
    		return !_.every($scope.menus, function(menu){
    			return !menu.children || !menu.checked;
    		});
    	};
    	$scope._3DInfo = {
    			status : false,
    			currLocId : null,
    			currLoc : null,
    			inventory : null
    	};
    	$scope.inventory_3d = function(){
    		$scope._3DInfo.status = !$scope._3DInfo.status;
    		_3D.init({
    			lpCount: $scope.baseData.lpCount,
    			locations: $scope.locations.location,
    			coordsys: $scope.currentWh.coordsys
    		}, {
    			moveoverLocation : function(locId){
    				var info = $scope._3DInfo;
    				info.currLocId = locId;
    				info.currLoc = _.find($scope.locations.location, {
    					id : locId
    				});
    				var store = $scope.autoInfo.inventoryLocStore;
    	    		if(store[locId]){
    	    			_load(store[locId]);
    	    		}else{
    	    			var query = {
    	    				locationIds : [locId]
    	    			};
    	    			inventoryService.getInventoryForGis(query).then(function(invs){
    	    				store[locId] = invs;
    	    				//防止请求过慢导致的信息显示错位
    	    				if(info.currLocId == locId){
    	    					_load(invs);
    	    				}
    	    			});
    	    		}
    	    		function _load(invs){
    	    			if(!invs || invs.length == 0){
    	    				invs = null;
    	    			}
    	    			info.inventory = invs;
    	    			//console.log(info);
    	    			$scope.apply();
    	    		};
    			}, 
    			moveoutLocation : function(){
    				var info = $scope._3DInfo;
    		    	info.currLocId = null;
    		    	info.inventory = null;
    		    	$scope.apply();
    			}
    		});
    	};
    	
    	$scope.init = function(){
			registEvent();
			resizePage();
			jsmap.initMap('jsmap');
			
			//_3D.test_3d();
			
    		jsmap.setCallbacks({
    			markerDblclick : $scope.markerDblclick,
    			mapZoomChange : $scope.mapZoomChange,
    			mapDragEnd : $scope.mapDragEnd,
    			mapResize : $scope.mapResize,
    			polygonMouseover : $scope.locationMouseover,
    			polygonMouseout : $scope.locationMouseout,
    			polygonClick: $scope.locationClick
    		});
    		//初始化仓库信息
    		$scope.getWarehouses();
    		//自动打开信息栏
			$("#infowindow #ctrl").trigger("click");
			//打开warehouse菜单
    		$scope.clickMenu("warehouse", true, true);
    		
    		//监听header warehouse切换
    		$scope.$watch("currentCompanyFacility", function(currCf, oldCf){
    			if(!currCf){
    				return;
    			}
    			var wh = $scope.currentWh;
    			if(!wh){
    				return;
    			}
    			var curr = _.find($scope.gisWarehouses, {id : currCf.facilityId});
    			if(!wh || wh.id != curr.id){
    				if(!$scope.isWhBuild(curr.id)){
            			lincUtil.messagePopup("Warn", "Warehouse ["+curr.name+"] hasn't create in gis!", function(){
            				if(!oldCf) return;
            				//同步仓库设置到外部
            				var _oldWh = _.find($scope.gisWarehouses, {id : oldCf.facilityId});
            				if(_oldWh){
            					$scope.onClickCompanyFacility && $scope.onClickCompanyFacility(_oldWh.cf);
            				}
            			});
            		}else{
            			$scope.changeWarehouse(curr);
            		}
    			}
    		});

			$scope.apply();
    	};
    	$scope.initData = function(){
    		if(!$scope.currentWh){
    			return;
    		}
    		$scope.getLocations({
				scenario: "GIS_RESOURCE"
			}).then(function(){
				$scope.initLayers();
			});
			
			$scope.getEquipments().then(function(){
				var menus = $scope.getMenus(["webcam", "printer", "computer", "warpMachine"]);
				_.forEach(menus, function(menu, key){
					$scope.clickMenu(key, false, menu.checked);
				});
			});
			
			$scope.getRoads().then(function () {
				var menu = $scope.getMenu("road");
				$scope.clickMenu("road", false, menu.checked);
			});
    		
    		$scope.baseData = $scope.baseData || {};
    		//init people data
    		$scope.getAllPeople().then(function(ps){
    			$scope.baseData.people = _.sortBy(ps, "firstName");
    		});
    		inventoryService.statistics({}).then(function(resp){
    			$scope.baseData.invStatistics = resp;
    		});
    		inventoryService.getLPCountByLocation().then(function(lpCount){
    			$scope.baseData.lpCount = lpCount;
    		});
		};

		var  orginStateLines, orginLocationLines;	
		$scope.initLocationLine = function(fitBounds, callback){
    		$scope.getWarehouseLoctionLine().then(function(lines){
				orginLocationLines =angular.copy(lines);
				$scope.locationLines = angular.copy(lines);

				$scope.selectAll = true;
				$scope.checkedLocationLines =angular.copy(lines);

    			jsmap.initLocationLines(lines);
    			if(fitBounds){
    				$scope.fitLocationLineBounds();
    			}
    			if(callback){
    				callback();
    			}
    		});
    	};
    	
    	$scope.initStateLine = function(fitBounds, callback){
    		$scope.getStateLines().then(function(lines){
    			jsmap.initStateLines(lines);
    			if(fitBounds){
    				$scope.fitStateLineBounds();
    			}
    			if(callback){
    				callback();
    			}
    		});
    	};
    	
    	$scope.initLayers = function(){
    		var menus = $scope.getMenus(["zone", "location", "staging", "dock", "parking", "other"]);
    		jsmap.showBase($scope.locations.base);
    		_.forEach(menus, function(val, key){
				if(val.checked){
					$scope.clickMenu(key, true, true);
				}
			});
    	};
    	
    	$scope.toggleLayers = function(checked){
    		checked = checked === true;
    		var menus = ["zone", "location", "staging", "dock", "parking", "other"];
    		_.forEach(menus, function(key){
    				$scope.clickMenu(key, false, checked);
    		});
    	};
    	
    	//需要定位仓库的菜单控制
    	$scope.menuDisableCtrl = function(){
    		var disabled = !$scope.currentWh;
    		if(disabled){
    			var menus = $scope.getMenus(menuConfig.noWhUndo);
    			_.forEach(menus, function(menu, key){
    				$scope.clickMenu(key, false, false);
    			});
    		}
    		//控制root层级
    		var menus = $scope.getMenus(menuConfig.noWhDisable);
    		_.forEach(menus, function(menu, key){
    			menu.disabled = disabled;
    			if(disabled && menu.children){
    				menu.checked = false;
    				_.forEach(menu.children, function(c){
    					$scope.getMenu(c).checked = false;
    				});
    			}
    		});
    	};
    	//有二级菜单的一级菜单只能打开一个
    	$scope.mainMenuUniqCtrl = function(key){
    		var curr = $scope.getMenu(key);
    		if(!curr.checked || !curr.children){
    			return;
    		}
    		_.forEach($scope.menus, function(menu, _key){
    			if(_key != key && menu.children){
    				menu.checked = false;
    			}
    		});
    	};
    	
    	//需要单独打开的菜单控制
    	$scope.menuSingleCtrl = function(currKey){
    		var menus = $scope.getMenus(menuConfig.singleCtrl);
    		//如果currKey存在，且不是以上菜单组内的菜单，则不执行该方法
    		if(currKey && !menus[currKey]){
    			return;
    		}
			//删除所有layers
			jsmap.clearAllLayers();
			$scope.currentWh = null;
			
    		_.forEach(menus, function(menu, key){
    			if(currKey != key && menu.checked){
    				$scope.clickMenu(key, false, false);
    			}
    		});
    	};
    	//默认视图
    	$scope.defaultView = function(){
    		
    	};
    	
    	$scope.showAllWarehouse = function(fitBounds){
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
				jsmap.markAllWarehouses(whs, fitBounds);
				$scope.menuDisableCtrl();
	    		
				$scope.refreshWarehouseInfo();
			});
    	};
    	$scope.changeWarehouse = function(wh){
    		//同步仓库设置到外部
    		$scope.onClickCompanyFacility && $scope.onClickCompanyFacility(wh.cf);
    		
    		$scope.menuSingleCtrl();
    		//设置当前warehouse
    		$scope.currentWh = wh;
    		$scope.menuDisableCtrl();
    		
    		//$scope.removeFromAutoInfo();
    		$scope.clickMenu("warehouse", false, false);
    		
    		$scope.initData();
    		
			//$scope.initMenuWithDynamicData();
    	};
    	//需要定时刷新数据的菜单
    	$scope.initMenuWithDynamicData = function(){
    		var menus = $scope.getMenus(["occupy", "truck", "peopleLocate"]);
    		_.forEach(menus, function(menu, key){
    			if(menu.checked){
					$scope.clickMenu(key, true, true);
				}
    		});
    	};
    	
    	//inventory
    	$scope.showLocationWithInventory = function(force){
    		$scope.setAutoInfo.inventory();
    		var menu = $scope.getMenu("currentInv");
    		//强制开启查询
    		if(force){
    			menu.checked = true;
    		}
    		//自动开启layer图层
    		var loc = $scope.getMenu("layer");
			if(!loc.checked){
				$scope.clickMenu("layer", false, true);
			}
			var query = $scope.autoInfo.getFilter("inventory");
			if(query.ghost){
				$scope.hideLocationWithInventory();
				$scope.loadInventory();
			}else{
				inventoryService.getInventoryLocations(query).then(function(locIds){
					var locs = [];
					var ghost = [];
					_.forEach(locIds, function(locId){
						//location
						locs.push({id : locId});
						//ghost
						var index = _.findIndex($scope.locations.location, function(l){
							return l.id == locId;
						}); 
						if(index < 0){
							ghost.push(locId);
						}
					});
					jsmap.highlightLocs(locs, "inventory");
					$scope.autoInfo.inventoryLocs = locIds;
				});
			}
    	};
    	function recoverInventoryHighlight(){
    		var locs = $scope.autoInfo.inventoryLocs;
    		if(locs && locs.length > 0){
    			var _locs = _.map(locs, function(locId){
    				return {
    					id: locId
    				};
    			});
    			jsmap.highlightLocs(_locs, "inventory");
    		}
    	};
    	$scope.hideLocationWithInventory = function(){
    		$scope.autoInfo.inventoryLocs = [];
    		$scope.autoInfo.inventoryLocStore = {};
    		$scope.autoInfo.currentInventoryLoc = null;
    		
    		//$scope.autoInfo.clearFilter("inventory");
			$scope.setAutoInfo.inventory(null);
			jsmap.highlightLocs(null, "inventory");
    	};
    	$scope.loadInventory = function(loc){
    		var query = $scope.autoInfo.getFilter("inventory");
    		var ghost = query.ghost;
    		delete query.ghost;
    		//传入locId但loc上没有库存时, 结束方法
    		if(loc && $scope.autoInfo.inventoryLocs.indexOf(loc.id) < 0){
    			//_load();
    			return;
    		}
    		$scope.autoInfo.currentInventoryLoc = loc;
    		var locId = loc ? loc.id : "_ghost";
    		var store = $scope.autoInfo.inventoryLocStore;
    		if(store[locId]){
    			_load(store[locId]);
    		}else{
    			if(ghost){
    				query.scenario = "GHOST_INVENTORY";
    			}else{
    				query.locationIds = [locId];
    			}
    			//$scope.getInventory(query).then(function(invs){
    			inventoryService.getInventoryForGis(query).then(function(invs){
    				store[locId] = invs;
    				//防止请求过慢导致的信息显示错位
    				if(ghost || $scope.autoInfo.currentInventoryLoc.id == locId){
    					_load(invs);
    				}
    			});
    		}
    		function _load(invs){
    			$scope.setAutoInfo.inventory(invs);
    		}
    	};
    	$scope.itemPictures = {};
    	$scope.showInventoryItemDetail = function(item){
    		var query = {
    			itemSpecId: item.itemSpecId
    		};
    		inventoryService.getItemCount(query).then(function(count){
    			$scope.setAutoInfo.inventoryDetail(count, item);
    		});
    		if(!$scope.itemPictures[item.itemSpecId]){
	    		$scope.getItemPics(item.itemSpecId).then(function(pics){
	    			$scope.itemPictures[item.itemSpecId] = pics;
	    		});
    		}
    	};
    	/*
    	$scope.refreshInventory = function(force){
    		var menu = $scope.getMenu("currentInv");
    		//强制开启查询
    		if(!menu.disabled && force){
    			menu.checked = true;
    		}
    		var able = !menu.disabled && menu.checked;
    		if(able){
    			var loc = $scope.getMenu("layer");
    			if(!loc.checked){
    				$scope.clickMenu("layer", false, true);
    			}
    			$scope.loadInventory();
    			if(!menu.interval){
    				menu.interval = setInterval($scope.refreshInventory, $scope.INTERVAL_TIME.INVENTORY);
    			}
    		}else{
    			if(menu.interval){
    				clearInterval(menu.interval);
    				delete menu.interval;
    			}
    			//delete $scope.autoInfo.filter.inventory_item;
    			//delete $scope.autoInfo.filter.inventory_supplier;
    			$scope.autoInfo.clearFilter("inventory");
    			jsmap.highlightLocs(null, "inventory");
    			$scope.setAutoInfo.inventory(null);
    		}
    	};
    	$scope.loadInventory = function(){
			$scope.getInventory().then(function(inventory){
				$scope.currInventory = inventory;
				
				//过滤条件
				var filterFields = ["item", "title", "supplier", "customer"];
				var filterList = [[], [], [], []];
				//占用location
				var locs = [];
				var ghost = [];
				_.forEach(inventory, function(inv){
					//location
					locs.push({name : inv.location});
					//filter
					_.forEach(filterFields, function(field, i){
						if(inv[field]){
							filterList[i].push(inv[field]);
						}
					});
					//ghost
					var index = _.findIndex($scope.locations.location, function(l){
						return l.name.toUpperCase() == inv.location.toUpperCase();
					}); 
					if(index < 0){
						ghost.push(inv);
					}
				});
				ghost = ghost.length > 0 ? ghost : null;
				
				_.forEach(filterFields, function(field, i){
					if(filterList[i].length > 0){
						$scope.autoInfo.list["inventory_"+field] = _.sortBy(_.uniq(filterList[i]));
					}
				});
				
				jsmap.highlightLocs(locs, "inventory");
				$scope.setAutoInfo.inventory(inventory, ghost);
			});
		};
		$scope.filterInventoryInfo = function(loc, refreshMap){
			var menu = $scope.getMenu("currentInv");
			var inventory = $scope.currInventory;
			if(!menu.checked || menu.disabled || !inventory || inventory.length==0){
				return ;
			}
			//===过滤条件===
			var _f = $scope.autoInfo.getFilter("inventory");
			if(!_.isEmpty(_f)){
				inventory = _.filter(inventory, _f);
			}
			
			if(refreshMap){
				var locs = [];
				_.forEach(inventory, function(d){
					locs.push({name : d.location});
				});
				jsmap.highlightLocs(locs, "inventory");
			}
			if(loc){
				var locName = loc && loc.name;
				inventory = _.filter(inventory, {location : locName});
				if(!inventory || inventory.length==0){
					return;
				}
				$scope.setAutoInfo.inventory(inventory, null, true);
			}else{
				$scope.setAutoInfo.inventory(inventory);
			}
		};
		*/

		$scope.changeWarehouseInventory=function(){
			$scope.autoInfo.inventoryHis=null;
			if(intervalId){
				$interval.cancel(intervalId);
			}
			$scope.invPlayback();
		}
     	var  orginStateInventory, orginLocationInventory;
		function getWarehouseInventoryHistory(callback){
			if(orginLocationInventory){
				if(callback){
					callback();
				}
			}else{
				$scope.getWarehouseInventoryHistory().then(function(wareHouseHis){
				
					var inv = _.groupBy(wareHouseHis,'date');
					var maxQty =_.max(_.map(wareHouseHis,'qty'));
					//最大值修正为1k整
					maxQty = (Math.floor(maxQty / 1000) + 1 ) * 1000;
					var inventoryLocationHis = {
							maxQty : maxQty,
							index : 0,
							list : _.toArray(inv),
							colorRange : jsmap.getLocationColors("inventory"),
							date : null,
							current : null,
							pause : false
					};
					orginLocationInventory=angular.copy(inventoryLocationHis);
					if(callback){
						callback();
					}
					
				});
			}
		
		}
		function getStateInventoryHistory(callback){
			$scope.getInventoryHistory().then(function(his){		
				var inv = _.groupBy(his,'date');
				var maxQty =_.sum(_.map(his,'qty'));
				//最大值修正为10W整
				maxQty = (Math.floor(maxQty / 100000) + 1 ) * 100000;
				var inventoryStateHis = {
						maxQty : maxQty,
						index : 0,
						list : _.toArray(inv),
						colorRange : jsmap.getStateColors("inventory"),
						date : null,
						current : null,
						pause : false
				};
				orginStateInventory=angular.copy(inventoryStateHis);
				if(callback){
					callback();
				}
				
				//$scope.fitStateLineBounds();
			});
		}
		$scope.invPlayback = function(){
			if($scope.autoInfo.selectWarehouse && $scope.autoInfo.selectWarehouse!="All"){
				getWarehouseInventoryHistory(function(){
					$scope.initLocationLine(true,function(){
						$scope.autoInfo.inventoryHis=angular.copy(orginLocationInventory);
						$scope.playInventoryHistory();
						
					});
				})
			}else{
				getStateInventoryHistory(function(){
					$scope.initStateLine(true,function(){
						$scope.autoInfo.inventoryHis=angular.copy(orginStateInventory);
						$scope.playInventoryHistory();
					;
					});
				})
			}
    		
		};
		var intervalId;
		$scope.playInventoryHistory = function(force){
			var his = $scope.autoInfo.inventoryHis;
			if(!his||!his.list || !his.list.length){
 					return;
			}
			var list = his.list[his.index];
			his.date = list[0].date;
			his.current = list;
			

			var menu = $scope.getMenu("invPlayback");
			var able = force || menu.checked && !menu.disabled && !his.pause;
			if(!able)
				return;
			if($scope.autoInfo.selectWarehouse && $scope.autoInfo.selectWarehouse!="All"){
				jsmap.hideStateLines();
			}else{
				jsmap.hideLocationLines();
			}
			
			if(!force){
				his.index += 1;
				if(his.list && (his.index >= his.list.length || his.list.length < 0)){
					his.index = 0;
				}
			}
			if(intervalId){
				$interval.cancel(intervalId);
			}
			
			var step = his.maxQty / 10;
			_.forEach(list, function(r){
			
				var level = Math.floor(r.qty / step) + 1;
				if(level > 10){
					level = 10;
				}
				if(level<=0){
					level=0;
				}
				if($scope.autoInfo.selectWarehouse && $scope.autoInfo.selectWarehouse!="All"){
				   
					var label = r.location + "<br>" + r.qty + " PCS";
					if(_.find($scope.checkedLocationLines,{name:r.location})){
						jsmap.showLocationLine("inventory", r.location, label, level, 10);
					}
					
				}
				else{
					var label = r.state + "<br>" + r.qty + " PCS";
					jsmap.showStateLine("inventory", r.state, label, level, 10);
				}
				
			});
			if(!force){
			  intervalId = $interval(function(){
				$scope.playInventoryHistory();
			  }, 1000);
			}
		};
		$scope.showSelectedLocation= function(loc){
			if(_.find($scope.checkedLocationLines,{name:loc.location})){
				return true;
			}else{
				return false;
			}
		}
        $scope.checkAllLoactions = function () {

             var currentLocationLines =angular.copy(orginLocationLines);
             if ($scope.selectAll) {
				//  $scope.autoInfo.inventoryHis={};
                 $scope.checkedLocationLines = [];
                 $scope.selectAll = false;
             }
             else {
				$scope.checkedLocationLines = currentLocationLines;
				// $scope.autoInfo.inventoryHis=angular.copy(orginLocationInventory);
                $scope.selectAll = true;
			}
		
			var checkedlatlngs=_.map($scope.checkedLocationLines,'latlng');
			jsmap.hideUncheckedPolygons("locationLine",checkedlatlngs);
		};
		
        $scope.checkLocation = function (location) {
            if (_.find($scope.checkedLocationLines, location)) {
                _.remove($scope.checkedLocationLines, function (loc) {
                    return loc.name == location.name;
                })
            } else {
                $scope.checkedLocationLines.push(location);
			}
			var checkedlatlngs=_.map($scope.checkedLocationLines,'latlng');
			jsmap.hideUncheckedPolygons("locationLine",checkedlatlngs);
			// $scope.autoInfo.inventoryHis=angular.copy(orginLocationInventory);
			// jsmap.hideLocationLines();
			// jsmap.initLocationLines($scope.checkedLocationLines);
		};
		
        $scope.isChecked = function (location) {
            return _.find($scope.checkedLocationLines, location) ? true : false;
        };
		
		$scope.demandInStates = function(){
			$scope.initStateLine(true, function(){
				$scope.getDemand().then(function(data){
					$scope.setAutoInfo.demand(data);
					var maxQty = $scope.autoInfo.demand.maxQty;
					var step = maxQty / 10;
					_.forEach(data, function(item){
						var level = Math.floor(item.qty / step) + 1;
						if(level > 10){
							level = 10;
						}
						var label = item.state + "<br>" + item.qty + " PCS";
						jsmap.showStateLine("demand", item.state, label, level, 10);
					});
				});
			});
		};
		
		$scope.refreshOccupy = function(force){
			var menu = $scope.getMenu("occupy");
			//强制开启查询
			if(!menu.disabled && force){
    			menu.checked = true;
    		}
			var able = !menu.disabled && menu.checked;
			if(able){
				var loc = $scope.getMenu("layer");
    			if(!loc.checked){
    				$scope.clickMenu("layer", false, true);
    			}
				$scope.loadOccupy();
				if(!menu.interval){
					menu.interval = setInterval($scope.refreshOccupy, $scope.INTERVAL_TIME.OCCUPY);
				}
			}else{
				if(menu.interval){
					clearInterval(menu.interval);
					delete menu.interval;
				}
				jsmap.highlightLocs(null, "occupy_parking");
				jsmap.highlightLocs(null, "occupy_dock");
				
				$scope.setAutoInfo.dock_occupy(null);
				$scope.setAutoInfo.parking_occupy(null);
			}
		};
		$scope.loadOccupy = function(){
			yardEquipmentService.getLocationOccupy().then(function(data){
			  var dockDatas =_.filter(data,{locationType:'DOCK'});
			  var packingDatas =_.filter(data,function(d){
				  return  d.locationType ==='PARKING' ||  d.locationType === 'SPOT';
			  });
			  if(dockDatas.length>0){
				  operateOccupiedDock(dockDatas);
			  }
			  if(packingDatas.length>0){
				operateOccupiedPacking(packingDatas);
			  }
			});
			
			// $scope.getOccupyDock().then(function(data){
			
			// });
		};

		function  operateOccupiedDock(dockOccupiedDatas){
			var entryIds = _.map(dockOccupiedDatas,'checkInEntry');
			var locs = [];
			var occupy = [];
			if(entryIds.length>0){
				entryService.searchActivityForGisByParams({entryIds:entryIds}).then(function(res){
				  var  entryTicketGroupByEntryId = _.groupBy(res,'entryId');
					_.forEach(dockOccupiedDatas, function(data){
						var loc = {
							id : data.currentLocationId, 
							type : "DOCK"
						};
						locs.push(loc);
						var rnOrDns =  (_.map(entryTicketGroupByEntryId[data.checkInEntry],'subTaskId')).toString();
						var o = {};
						loc._warn =  rnOrDns? true:false;
						o.locName = data.locationName;
						o.ctn = data.equipmentNo;
						o.entryId =data.checkInEntry;
						o.orderOrReceipt =  rnOrDns;
						occupy.push(o);
						
						var info = [["CTN#:", o.ctn],
									["Entry ID:", o.entryId],
									[ "Order/Receipt:" , rnOrDns]
								];
						loc._html = createInfoTable(info);
					});
					jsmap.highlightLocs(locs, "occupy_dock");
					$scope.setAutoInfo.dock_occupy(occupy);
	
				});
			}else{
				_.forEach(dockOccupiedDatas, function(data){
					var loc = {
						id : data.currentLocationId, 
						type : "DOCK"
					};
					locs.push(loc);
					var o = {};
					loc._warn =  false;
					o.locName = data.locationName;
					o.ctn = data.equipmentNo;
					o.entryId =data.checkInEntry;
					occupy.push(o);
					
					var info = [["CTN#:", o.ctn],
								["Entry ID:", o.entryId],
								[ "Order/Receipt" , '']
							];
					loc._html = createInfoTable(info);
				});
				jsmap.highlightLocs(locs, "occupy_dock");
				$scope.setAutoInfo.dock_occupy(occupy);
			}
			
			
		}

		function  operateOccupiedPacking(packingOccupiedDatas){
			var locs = [];
			var occupy = [];
			_.forEach(packingOccupiedDatas, function(data){
				var loc = {
					id : data.currentLocationId, 
					type : "PARKING"
				};
				locs.push(loc);
				var o = {};
				if(o){
					loc._warn = o.full = data.status ==="Loaded" ? true : false ;
					o.locName = data.locationName;
					o.ctn = data.equipmentNo;
					o.entryId =data.checkInEntry;
					occupy.push(o);
				}
				var info = [
							["CTN#:", data.equipmentNo],
							["Entry ID:", data.checkInEntry],
							["Full:", data.status  === "Loaded" ? "Yes" : "No"]
							];
				loc._html = createInfoTable(info);
			});
			jsmap.highlightLocs(locs, "occupy_parking");
			$scope.setAutoInfo.parking_occupy(occupy);
		}
		//type: Auto, Van, Trailer, forklift and so on...
		$scope.refreshFleets = function(type){
			var menu = $scope.getMenu(type);
			if(_.isEmpty(menu)) return;
			var able = !menu.disabled && menu.checked;
			if(able){
				$scope.loadFleetPosition(type, true);
	 			//立即开始移动   
				$scope.loadFleetPosition(type);
				if(!menu.interval){
					menu.interval = setInterval(function(){
						$scope.loadFleetPosition(type);
					}, $scope.INTERVAL_TIME.FLEET);
				}
				
			}else{
				 
				if(menu.interval){
					clearInterval(menu.interval);
					delete menu.interval;
				}
					
				jsmap.hideEquipment(type);
			}
		};
		$scope.loadFleetPosition = function(type, init){
			/*
			$scope.getFleetPosition(type).then(function(fleets){
				jsmap.showEquipment(type, fleets, true);
			});
			*/

			var fleets = $scope.getFleetPosition(type, init);   注释by-jerry
			if(init){
				jsmap.showEquipment(type, fleets, true);
			}else{
				_.forEach(fleets, function(fleet){
					if(fleet._uuid){
						jsmap.equipmentAnimate(fleet, fleet._animatPath);
					}
				});
			}
			
		};
		
		$scope.refreshTrucks = function(){
			var menu = $scope.getMenu("truck");
			var able = !menu.disabled && menu.checked;
			if(able){
				$scope.loadTrucks(true);
				if(!menu.interval){
					menu.interval = setInterval($scope.loadTrucks, $scope.INTERVAL_TIME.TRUCK);
				}
			}else{
				if(menu.interval){
					clearInterval(menu.interval);
					delete menu.interval;
				}
				//delete $scope.autoInfo.filter.truck_search;
				$scope.autoInfo.clearFilter("truck");
				jsmap.hideTrucks();
				$scope.setAutoInfo.truck(null);
			}
		};

        var allTrucks;
        $scope.filterTruck = function(fitBounds) {
            var trucks = allTrucks;
            var filter = $scope.autoInfo.filter;
            if (filter.truck_search) {
                trucks = _.filter(allTrucks, {"license_plate": filter.truck_search});
                trucks = _.concat(trucks, _.filter(allTrucks, {"driver_name": filter.truck_search}));
            }
            showTruck(trucks, fitBounds);
        }
        function showTruck(trucks, fitBounds) {
            _.forEach(trucks, function(truck){
                var info = [];
                if(truck.license_plate)
                    info.push(["License Plate:", truck.license_plate]);
                if(truck.driver_name)
                    info.push(["Driver Name:", truck.driver_name]);
                if(info.length > 0)
                    truck._html = createInfoTable(info);

                var humitureList = truck.humitureList;
                if(humitureList && humitureList.length > 0){
                    truck._html = truck._html || "";
                    //仅显示一条记录
                    truck._html += createHumitureHtml([humitureList[0]]);
                }
            });

            if(trucks && trucks.length > 0){
                jsmap.markTrucks(trucks, fitBounds);
                $scope.setAutoInfo.truck(trucks);
            }
		}
		$scope.loadTrucks = function(fitBounds){
			$scope.loadingTrucks = true;
			$scope.getTruck().then(function(trucks){
                allTrucks = trucks;
                $scope.loadingTrucks = false;
                showTruck(trucks, fitBounds);
			});
		};
		function createHumitureHtml(humitureList){
			var html = "";
			_.forEach(humitureList, function(h, i){
				if(html){
					html += "<hr style='margin: 5px 0;'/>";
				}
				var info = [];
				info.push(["Sensor Mac:", h.sensorMac]);
				if(h.temperature)
					info.push(["Temperature:", h.temperature.toFixed(1) + "°C"]);
				if(h.humidity)
					info.push(["Humidity:", h.humidity.toFixed(0) + "RH"]);
				info.push(["Time:", h.sensorDate]);
				html += createInfoTable(info);
			});
			return html;
		}
		//truck轨迹回放
		$scope.truckPlayback = {
				init : function(truck){
					$scope.setAutoInfo.truckPlayback(truck);
				},
				play : function(){
					var info = $scope.autoInfo.truckPlayback;
					if(info.pause){
						jsmap.gpsRoutePlay();
					}else{
						jsmap.gpsRoutePause();
					}
					info.pause = !info.pause;
				},
				remove : function(){
					jsmap.gpsRouteRemove();
				},
				query : function(){
					var info = $scope.autoInfo.truckPlayback;
					//var lp = info.truck.license_plate;

					if (!info.startTime || !info.endTime) {
                        lincUtil.errorPopup("Please select time from & to!");
						return;
					}

					var param = {
                        license_plate: info.truck.license_plate,
                        driver_name: info.truck.driver_name,
                        time_from: info.startTime,
                        time_to: info.endTime
					};
					$scope.loadingTruckPoint = true;
					$scope.getTruckLine(param).then(function(line){
                        $scope.loadingTruckPoint = false;

						var path = line.path || [];
						info.points = path;
						jsmap.gpsRouteCreate(path, function(curr){
							info.current = curr;
							if(curr >= path.length - 1){
								info.pause = true;
							}
							$scope.apply();
						});
						info.pause = false;
					});
				}
		};

		function loadEquipment(type){
			var es = $scope.equipments[type];
			if(type == "HUMITURE"){
				var macs = _.map(es, "mac");
				$scope.getHumiture(macs).then(function(list){
					_.forEach(es, function(e){
						var h = _.find(list, {sensorMac: e.mac});
						if(h){
							e._html = createHumitureHtml([h]);
						}
					});
					jsmap.showEquipment(type, es);
				}, function(){
					jsmap.showEquipment(type, es);
				});
			}else{
				jsmap.showEquipment(type, es);
			}
		}

        $scope.showLoadStatus = function(){
            $scope.getLongHaul().then(function(lineHauls){
            	var lineHaulMap = _.keyBy(lineHauls, "Langhaul");
                $scope.getLoadOrder(lineHaulMap).then(function(orders){
                    var fitBounds = true;

                    var filter = $scope.autoInfo.filter;
                    var _f = {};
                    if(filter.loadStatus_loadNo){
                        _f.OrderNo = filter.loadStatus_loadNo;
                        orders = _.filter(orders, _f);
                        fitBounds = false;
                    }

                    _.forEach(orders, function(order){
                        var infoData = [];
                        if(order.OrderNo) infoData.push(["OrderNo.: ", order.OrderNo]);
                        if(order.CustomerID) infoData.push(["Customer: ", order.CustomerID]);
                        if(order.ReferenceNo) infoData.push(["ReferenceNo: ", order.ReferenceNo]);
                        if(order.StoreName) infoData.push(["StoreName: ", order.StoreName]);
                        if(order.ShipToState) infoData.push(["State: ", order.ShipToState]);
                        if(order.ShipToCity) infoData.push(["City: ", order.ShipToCity]);
                        if(order.ShipToAddress1) infoData.push(["Address: ", order.ShipToAddress1]);
                        if(order.ShipToZipCode) infoData.push(["ZipCode: ", order.ShipToZipCode]);
                        if(infoData.length > 0)
                            order._html = createInfoTable(infoData);
                    });

                    var lines = [];
                    _.forEach(lineHauls, function(line){
                        lines.push({
                            latlng : line.line
                        });
					})
                    jsmap.showLoadStatus(orders, lines, fitBounds);
                    $scope.setAutoInfo.loadStatus(orders);
				})
			})
        };
		$scope.showLoadStatusOld = function(){
			$scope.getLoadStatus().then(function(loads){
				var fitBounds = true;
				//过滤出loadNo
				var loadNos = _.map(loads, _.ary(function(v){
					return v.loadNo;
				}));
				$scope.autoInfo.list.loadStatus_loadNo = _.sortBy(_.uniq(loadNos));
				
				//===过滤条件===
				var filter = $scope.autoInfo.filter;
				var _f = {};
				if(filter.loadStatus_loadNo){
					_f.loadNo = filter.loadStatus_loadNo;
					loads = _.filter(loads, _f);
					fitBounds = false;
				}

				var lines = [];
				_.forEach(loads, function(load){
					var infoData = [];
					if(load.loadNo)
						infoData.push(["Load No.: ", load.loadNo]);
					if(load.customer)
						infoData.push(["Customer: ", load.customer]);
					if(load.from)
						infoData.push(["From: ", load.from]);
					if(load.to)
						infoData.push(["To: ", load.to]);
					if(load.address)
						infoData.push(["Address: ", load.address]);
					if(infoData.length > 0)
						load._html = createInfoTable(infoData);

                    lines.push({
                        latlng : load.line
                    });
				});
				
				jsmap.showLoadStatus(loads, lines, fitBounds);
				$scope.setAutoInfo.loadStatus(loads);
			});
		};
		$scope.showServiceStatus = function(){
			$scope.getServiceStatus().then(function(data){
				_.forEach(data, function(status){
					var infoData = [];
					if(status.rma)
						infoData.push(["RMA: ", status.rma]);
					if(status.status)
						infoData.push(["Status: ", status.status]);
					if(status.dip)
						infoData.push(["DIP: ", status.dip]);
					if(status.date_osr_accepted)
						infoData.push(["Service Date: ", status.date_osr_accepted]);
					if(status.eu_address)
						infoData.push(["Service Address: ", status.eu_address + ", " + status.eu_city + ", " + status.eu_state + " " + status.eu_zipcode + " " + status.eu_country]);
					if(status.model_name)
						infoData.push(["Model: ", status.model_name]);
					if(status.serial_number)
						infoData.push(["SN: ", status.serial_number]);
					var tech = status.tech_name ? status.tech_name + "<br/>" :  "";
					tech += status.tech_phone ? status.tech_phone + "<br/>" :  "";
					tech += status.tech_email ? status.tech_email :  "";
					if(tech)
						infoData.push(["Tech: ", tech]);
					
					if(infoData.length > 0)
						status._html = createInfoTable(infoData);
				});
				jsmap.markTrucks(data, true);
				$scope.setAutoInfo.serviceStatus(data);
			});
		};
		$scope.showRecycleCollection = function(){
			$scope.getRecycleCollection().then(function(data){
				jsmap.markTrucks(data, true);
			});
		};
		$scope.showOsrTech = function(){
			$scope.getOsrTech().then(function(data){
				jsmap.markTrucks(data, true);
			});
		};
		
    	//正在播放的webcam
    	$scope.webcamPlayers = [];

		$scope.videoFullScreen = function (vname) {
			var element = $("[vname='" + vname + "']")[0];
			if (element.requestFullscreen) {
				element.requestFullscreen();
			}
			else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			}
			else if (element.msRequestFullscreen) {
				element.msRequestFullscreen();
			}
			else if (element.oRequestFullscreen) {
				element.oRequestFullscreen();
			}
			else if (element.webkitRequestFullscreen) {
				element.webkitRequestFullScreen();
			}
		};

    	$scope.playWebcam = function(cam){
    		var uuid = cam._uuid;
    		var _cam  = _.find($scope.webcamPlayers, {_uuid : uuid});
    		//已经在播放则关闭
    		if(_cam){
    			$scope.removePlayer(_cam);
    		}else{
    			if(($scope.browser() == "ie" || $scope.browser() == "safari") && !$scope.checkPlugins("vlc")){
    				lincUtil.popupBodyPage(function(){}, "./gis/resources/template/vlcDownloadUrl.html", null, {});
    				return;
    			}
    			cam.video = true;
    			if($scope.browser() == "ie" || $scope.browser() == "safari") 
    				cam.video = false;
    			
    			
    			var size = getPlayerSize();
    			cam._size = size;
    			$scope.buildRtspUrl(cam);
    			$scope.webcamPlayers.push(cam);
    			cam.playing = true;
    			jsmap.refreshWebcamIcons(cam);
    		}
    		$scope.apply();
			if(cam.video){
				rtspPlayer.play();
			}
    	};
    	
    	$scope.removePlayer = function(cam){
    		_.remove($scope.webcamPlayers, function(_cam){
    			return _cam._uuid == cam._uuid;
    		});
    		cam.playing = false;
			jsmap.refreshWebcamIcons(cam);
			rtspPlayer.stop(cam._uuid);
    	};
    	
    	$scope.removeAllPlayer = function(){
    		_.forEach($scope.webcamPlayers, function(cam){
    			cam.playing = false;
    			jsmap.refreshWebcamIcons(cam);
    		});
    		$scope.webcamPlayers = [];
    	};
    	$scope.restartPlayer = function(uuid){
    		uuid = parseInt(uuid);
    		var cam  = _.find($scope.webcamPlayers, {_uuid : uuid});
    		$scope.removePlayer(cam);
    		$scope.apply();
    		$scope.playWebcam(cam);
    		$scope.apply();
    	};
    	window.gis = window.gis || {};
    	window.gis.h5RtspCtrl = {
    			playFailed : function(e){
    				var el = $(e.target);
    				
    				//console.log("==== h5 play failed : "+el.attr("vname"));
    				var playing = el.data("playing");
    	    		//console.log(playing);
    	    		el.css("border", '2px solid red');
    	    		if(playing){
    	    			el.data("playing", false);
    	    			var id = el.attr("id");
    	    			//rtspPlayer.restart(el.attr("id"));
    	    			//$scope.restartPlayer(el.attr("id"));
    	    			//rtspPlayer.stop(id);
    	    			
    	    			setTimeout(function(){
    	    				$scope.restartPlayer(el.attr("id"));
    	    			}, 3000);
    	    		}
    			},
    			playing : function(e){
    				//console.log("==== h5 playing ===");
    				var el = $(e.target);
    				el.data("playing", true);
    				el.css("border", '2px solid green');
    				//this.style.border='2px solid green'; 
    			}
    	};
    	
    	$scope.buildRtspUrl = function(cam){
    		if(cam && !cam.rtspUrl){
    			//rtsp://admin:12345@50.104.129.125:11064/h264/ch1/main/av_stream
    			var url = "rtsp://";
    			if(cam.username && cam.password){
    				url += cam.username + ":" + cam.password + "@";
    			}
    			url += cam.ip + ":" + cam.port;
				url += "/h264/ch1/sub/";
    			cam.rtspUrl = url;
    		}
    	};
    	
    	$scope.displayCtrl = {
			open : function(display){
	    		$scope.setAutoInfo.display(display);
	    		$scope.apply();
	    	},
	    	addResource : function(type, url){
	    		if(!type || !url) return;
 	    		var info = $scope.autoInfo.display;
	    		var res = {
		    			type: type,
		    			url: url,
		    			_id: Math.floor(Math.random() * 10000000)
		    	};
 	    		info.playList.push(res);
	    		if(type == "PDF"){
	    			$scope.pdf.load(res);
	    		}
 	    	},
	    	removeResource : function(index){
	    		var info = $scope.autoInfo.display;
	    		var list = info.playList;
	    		if(index > -1 && index < list.length){
	    			var res = list[index];
	    			if(res.playing){
	    				$scope.displayCtrl.pushMsg({
	    					type : "clean"
	    				});
	    			}
	    			list.splice(index, 1);
	    		}
	    	},
	    	removeAll : function(){
	    		var info = $scope.autoInfo.display;
	    		info.playList = [];
	    	},
	    	move : function(index, move){
	    		if(index > 0 && move){
	    			
	    		}
	    	},
	    	pushMsg : function(res, pageNum){
	    		var info = $scope.autoInfo.display;
	    		var equipment = info.asset;
	    		if(!equipment || !equipment.name){
	    			return;
	    		}
	    		var msg = {
	    				type: res.type
	    		};
	    		if(res.playing && !pageNum){
	    			msg.type = "clean";
	    		}
	    		if(pageNum){
	    			msg.pageTo = pageNum;
	    		}else{
	    			msg.url = res.url;
	    		};
	    		if (!goEasy) {
                    goEasy = new GoEasy({
                        appkey: window.linc.config.goEasyAppKey
                    });
                }
	    		goEasy.publish({
	    			channel: equipment.name,
	    			message: JSON.stringify(msg)
                });
	    		//状态修改
	    		var s = !res.playing;
	    		var list = info.playList;
	    		_.forEach(list, function(r){
	    			r.playing = false;
	    		});
	    		res.playing = s;
	    	}
    	};
    	$scope.pdf = {
			load : function(res){
			    if(!res || !res.url) return;
			    /*PDFJS.getDocument(res.url).then(function(_pdf){
			        if(!_pdf) return;
			        res.doc = _pdf;
			        $scope.pdf.pageTo(res);
			    });*/
			},
			pageTo : function(res, pageNum) {
				var pdf = res.doc;
			    if (!pdf || pdf.pdfInfo.numPages < pageNum) {
			        return;
			    }
			    pdf.getPage(pageNum).then(function (page) {
			        //var scale = 1;
			        //var viewport = page.getViewport(scale);
			
			        var winHeight = 180;
			        var viewport = page.getViewport(1);
			        var scale = winHeight / viewport.height;
			        var scaledViewport = page.getViewport(scale);
			
			        var canvas = $("#displayPdfView" + res._id)[0];
			        var context = canvas.getContext('2d');
			        canvas.height = scaledViewport.height;
			        canvas.width = scaledViewport.width;
			
			        var renderContext = {
			            canvasContext: context,
			            viewport: scaledViewport
			        };
			        page.render(renderContext);
			    });
			}
		};
    	$scope.markerDblclick = function(data){
    		if(!data || !data.type){
    			return;
    		}
    		var type = data.type;
    		if(type === "WAREHOUSE"){
    			$scope.changeWarehouse(data);
    		}else if(type === "WEBCAM"){
    			$scope.playWebcam(data);
    		}else if(type === "DISPLAY"){
    			$scope.displayCtrl.open(data);
    		}
    	};
    	
    	$scope.mapZoomChange = function(zoom){
    		if(zoom <= 14){
    			var menu = $scope.getMenu("warehouse");
    			//已定位仓库
    			if(!menu.checked && $scope.currentWh){
    				$scope.clickMenu("warehouse", false, true, {fitBounds : false});
    			}
    		}
    		$scope.refreshWarehouseInfo();
    	};
    	
    	$scope.mapDragEnd = function(){
    		$scope.refreshWarehouseInfo();
    	};
    	$scope.mapResize = function(){
    		$scope.refreshWarehouseInfo();
    		$scope.fitStateLineBounds();
    	};
    	
    	$scope.refreshWarehouseInfo = function(zoom){
    		var menu = $scope.getMenu("warehouse");
    		if(!menu.checked || menu.disabled) 
    			return;
    		var whs = jsmap.getWarehouseInMap();
    		$scope.setAutoInfo.warehouse(whs);
    	};
    	$scope.fitStateLineBounds = function(){
    		var menus = $scope.getMenus(["invPlayback", "demand"]);
    		if(_.find(menus, {disabled : false, checked : true})){
    			jsmap.fitStateBounds();
    		}
		};
		$scope.fitLocationLineBounds = function(){
    		var menus = $scope.getMenus(["invPlayback"]);
    		if(_.find(menus, {disabled : false, checked : true})){
    			jsmap.fitLocationBounds();
    		}
    	};
    	
    	
    	$scope.showPeopleInZone = function(){
    		var list = _.filter($scope.locations.zone, function(zone){
    			return zone.workers && zone.workers.length > 0;
    		});
    		if(list.length > 0){
    			var loc = $scope.getMenu("layer");
    			if(!loc.checked){
    				$scope.clickMenu("layer", false, true);
    			}
    		}
    		var data = [];
    		_.forEach(list, function(zone){
    			zone = _.clone(zone);
    			var html = "<div style='max-width: 350px;'><span>Zone: " + zone.name.toUpperCase() + "</span><br/>";
    			var workers = zone.workers;
    			_.forEach($scope.baseData.people, function(p){
    				if(workers.indexOf(p.idmUserId) > -1){
    					html += "<span class='badge' style='color:white; margin:3px;text-transform: capitalize;'>" + p.firstName +" " + p.lastName + "</span>";
    				}
    			});
    			html += "</div>";
    			zone._html = html;
    			zone.type = "people_zone";
    			zone.name = null;
    			data.push(zone);
    		});
    		jsmap.showEquipment("people_zone", data);
    	}
    	$scope.hidePeopleInZone = function(){
    		jsmap.hideEquipment("people_zone");
    	}
    	
    	/**
    	 * 分页
    	 * data.list : 未分页数据
    	 * data.curr_list : 当前页数据
    	 * data.page_total : 总页数
    	 * data.page_size : 每页条数
    	 * data.curr_page : 当前页码
    	 */
    	$scope.refreshDataPage = function(data, pageInc){
    		if(!data || !data.list)
    			return;
    		
    		pageInc = pageInc || 1;
    		var pageSize = data.page_size || INFO_PAGE_SIZE;
    		var currPage = data.curr_page || 0;
    		currPage += pageInc;
    		
    		var list = data.list || [];
    		var pageTotal = Math.floor((list.length + pageSize -1) / pageSize);
    		
    		if(currPage > pageTotal)
    			currPage = pageTotal;
    		if(currPage < 1)
    			currPage = 1;
    		if(pageSize < 1)
    			pageSize = INFO_PAGE_SIZE;
    		
    		data.page_total = pageTotal;
    		data.page_size = pageSize;
    		data.curr_page = currPage;
    		
    		var start = pageSize * (currPage - 1);
    		var end = pageSize * currPage;
    		if(start >= list.length)
    			start = 0;
    		if(end >= list.length)
    			end = list.length;
    		
    		data.curr_list = list.slice(start, end);
    		//$scope.apply();
    	};
    	
    	$scope.locationMouseover = function(loc){
    		if($scope.autoInventoryDisable){
    			return;
    		}
    		$scope.autoInfo.currentLoc = loc;
    		$scope.loadInventory(loc);
    	};
    	$scope.locationMouseout= function(loc){
    		if($scope.autoInventoryDisable){
    			return;
    		}
    		$scope.autoInfo.currentLoc = null;
    		//$scope.loadInventory();
    	};
    	$scope.locationClick = function(loc){
    		if($scope.isMenuChecked('currentInv')){
    			$scope.autoInventoryDisable = true;
	    		$scope.autoInfo.currentLoc = loc;
	    		$scope.loadInventory(loc);
    		}else{
    			$scope.autoInventoryDisable = false;
    		}
    	};
    	$scope.colseInventory = function(){
    		$scope.setAutoInfo.inventory();
    	};
    	$scope.pinInventory = function(){
    		$scope.autoInventoryDisable = true;
    	};
    	$scope.unpinInventory = function(){
    		$scope.autoInventoryDisable = false;
    		$scope.setAutoInfo.inventoryDetail();
    	};
    	
    	$scope.showMenu = function(){
    		var top = $(".page-header").height();
    		var position = $mdPanel.newPanelPosition().absolute().left().top(top);
    		var animation = $mdPanel.newPanelAnimation();
			animation.openFrom({top:top, left:-200});
			animation.closeTo({top:top, left:-200});
			animation.withAnimation($mdPanel.animation.SLIDE);
			
			var ctrl = function(){};
			ctrl.prototype = $scope;
			
    		var config = {
    			    animation: animation,
    			    attachTo: $("#gis_main"),
    			    controller: ctrl,
    			    controllerAs: 'ctrl',
    			    templateUrl: 'gis/resources/template/menu.html',
    			    panelClass: 'gis-menu-full',
    			    position: position,
    			    trapFocus: true,
    			    //zIndex: 150,
    			    clickOutsideToClose: true,
    			    clickEscapeToClose: true,
    			    hasBackdrop: true
    			  };
    		$mdPanel.open(config);
    	};
    	
    	//global search
    	$scope.globalSearch = {
    			history : [],
    			list : [],
    			focusOn : null,
    			keyWord : "",
    			keyWordLast : "",
    			wordChange : function(e){
    				var code = e && e.keyCode;
    				if(code === 40 || code === 38 || code ===13){	//↓  ↑  enter 
    					$scope.globalSearch.search(code);
    					return;
    				}
    				
    				var word = $scope.globalSearch.keyWord;
    				var wordLast = $scope.globalSearch.keyWordLast;
    				if(!word){
    					$scope.globalSearch.keyWordLast = "";
    					$scope.globalSearch.list = $scope.globalSearch.history || [];
    					return;
    				}
    				if(word.toUpperCase() == wordLast.toUpperCase()){
    					return;
    				}
    				$scope.getGlobalIndex().then(function(indexs){
    					var list = [];
    					_.forEach(indexs, function(index){
    						if(list.length > 5){
    							return false;
    						}
    						//var label = "[" + index.model + "] " + index.item;
    						var label = index.label;
    						//var fit = index.item.toUpperCase().includes(word.toUpperCase());
    						var fit = label.toUpperCase().includes(word.toUpperCase());
    						if(fit){
    							//var label = "[" + index.model + "] " + index.item;
    							//index.label = label;
    							list.push(index);
    						}
    					});
    					$scope.globalSearch.list = list;
    					$scope.globalSearch.focusOn = null;
    				});
    				$scope.globalSearch.keyWordLast = $scope.globalSearch.keyWord;
    			},
    			blur : function(e){
    				var search = $scope.globalSearch;
    				
    				var relTarget = e && $(e.relatedTarget);
    				if(relTarget && relTarget.attr("id") === "resource-search-item"){
    					var focusOn = relTarget.data("index");
    					search.focusOn = focusOn;
    					search.search(13);
    				}
    				search.list = [];
    				search.keyWordLast = "";
    				search.focusOn = null;
    			},
    			search : function(key){	
    				var search = $scope.globalSearch;
    				var on = search.focusOn===null ? -1 : search.focusOn;
    				
    				var inList = on >= 0 && on < search.list.length;
    				//key : 38 上， 40  下， 13 回车
    				if(key === 13){
    					if(!inList){
    						on = 0;
    						search.focusOn = on;
    					}
    					search.locateResult();
    					if(search.list[on]){
    						var label = search.list[on].label
    						search.keyWord = label;
    						//search history
    						search.history.unshift(search.list[on]);
    						search.history = _.slice(_.uniq(search.history), 0, 3);
    					}
    					search.blur();
    					return;
    				}
    				
    				if(key === 38)
    					on--;
    				if(key === 40)
    					on++;
    				inList = on >= 0 && on < search.list.length;
    				if(inList){
    					search.focusOn = on;
    					search.keyWord = search.list[on].label;
    					search.showResult();
    				}else{
    					search.focusOn = null;
    				}
    			},
    			showResult : function(){
    				var search = $scope.globalSearch;
    				var on = search.focusOn;
    				var index = search.list[on];
    				if(!index){
    					return;
    				}
    				var menu = index.menu;
    				var filter = index.filter;
    			},
    			locateResult : function(){
    				var search = $scope.globalSearch;
    				var on = search.focusOn;
    				if(on === null || !search.list || search.list.length === 0){
    					return;
    				}
    				var index = search.list[on];
    				_.merge($scope.autoInfo.filter, index.filter);
    				$scope.clickMenu(index.menu, false, true);
    			}
    	};
    	
    	function showInventoryHeatMap(){
    		/*
    		//test start=======
    		var datas = [];
    		_.forEach($scope.locations.location, function(loc){
    			var i = parseInt(loc.name.replace(/\D/g, "")) / 100 - 0.8;
    			i = i * i;
    			var z = (72 - loc.name.charCodeAt(0)) / 7;
    			if(z > 0){
    				z = z * z * z* z;
    				i = Math.max(z, i);
    			}
    			var weight = Math.sin(i * Math.PI) || 0.1;
    			datas.push({
    				filter : {
    					type: loc.type,
    					id: loc.id
    				},
					weight : weight
    			});
    			console.log(JSON.stringify({
					type: loc.type,
					id: loc.id,
					weight : Math.floor(weight * 100)
				}));
    		});
    		jsmap.showHeatMapFromLoc(datas);
    		//test end=======
    		*/
    		$scope.getLpOutHistoryByLocation().then(function(datas){
    			var heatMapDatas = [];
    			_.forEach(datas, function(data){
    				var weight = data.weight,
    					filter = _.pick(data, ["id", "name", "type"]);
    				var d = {
    					filter : filter,
    					weight : weight
    				};
    				heatMapDatas.push(d);
    			});
    			jsmap.showHeatMapFromLoc(heatMapDatas);
    		});
    		
    	}
    	
    	function hideInventoryHeatMap(){
    		jsmap.showHeatMapFromLoc(null);
    	};
    	
    	function showRoadHeatMap(){
    		var datas = [];
    		_.forEach($scope.roads, function(road, i){
    			var weight = Math.sin(i % Math.PI);
    			datas.push({
    				filter : {id : road.id},
    				weight : weight
    			});
    		});
    		jsmap.showHeatMapFromRoad(datas);
    	}
    	function hideRoadHeatMap(){
    		jsmap.showHeatMapFromRoad();
    	}

		var queryPickRoading = false;
		$scope.selTaskId = null;
		$scope.showPickRoad = function (taskId) {
			if (queryPickRoading) return;
			if ($scope.autoInfo.pickTask == null) return;
			$scope.selTaskId = taskId;

		 	var pickTask = _.find($scope.autoInfo.pickTask.list, function (task) {
				return task.id == taskId;
			});

			if (pickTask == null || pickTask.subTasks == null) return;

			var locationIds = [];
			_.forEach(pickTask.subTasks, function (task) {
				if (task.pickItemLines == null) return;

				_.forEach(task.pickItemLines, function (itemLine) {
					if (!_.includes(locationIds, itemLine.locationId)) {
						locationIds.push(itemLine.locationId);
					}
				})
			})

			if (locationIds.length == 0) return;

			var layer = $scope.getMenu("layer");
			if(!layer.checked){
				$scope.clickMenu("layer", false, true);
			}
			var road = $scope.getMenu("road");
			if(!road.checked){
				$scope.clickMenu("road", false, true);
			}

			showPickLocation(locationIds, taskId);
			jsmap.hidePickRoad();

			var query = {};
			query.locationIds = locationIds;
			queryPickRoading = true;
			$scope.getPickRoad(query).then(function (road) {
				queryPickRoading = false;
				jsmap.showPickRoad(road);
			}, function (error) {
				queryPickRoading = false;
			});
		};
		function showPickLocation(locationIds, taskId) {
			jsmap.highlightLocs(null, "pick_location");

			var locs = [];
			_.forEach(locationIds, function (id) {
				var location = _.find($scope.autoInfo.pickTask.datas.locationMap, function (l) {
					return l.id == id;
				});
				var loc = {
					id : location.id,
					type : "LOCATION"
				};
				locs.push(loc);

				var info = [
					["Pick Task ID:", taskId],
					["Location name:", location.name]
				];
				loc._html = createInfoTable(info);
			});

			jsmap.highlightLocs(locs, "pick_location");
		}

		function showPickHeatMap(heatDatas) {
			var points = [];
			_.forEach(heatDatas, function (data) {
				var latlngs = data.location.latlng.split(" ");

				var pointx = [];
				var pointy = [];
				for (var i = 0; i < latlngs.length && i < 4; i++) {
					var lp = latlngs[i].split(",");
					if (lp.length < 2) continue;

					pointx.push(parseFloat(lp[0]));
					pointy.push(parseFloat(lp[1]));

					var point = {};
					point.x = lp[0];
					point.y = lp[1];
					point.weight = data.count;
					points.push(point);
				}
				getHeatPoint(pointx, pointy, data.count, points);
			})
			jsmap.showHeatMap(points);
		}
		function getHeatPoint(pointx, pointy, weight, points) {
			var threshold = 0.000005;

			if (pointx.length < 3) return;
			var minx = pointx[0] < pointx[1] ? pointx[0] : pointx[1];
			var maxx = pointx[0] < pointx[1] ? pointx[1] : pointx[0];

			var k = 0;
			if (pointx[0] != pointx[1]) {
				k = (pointy[0] - pointy[1]) / (pointx[0] - pointx[1]);
			}
			var k1 = 0;
			if (pointx[1] != pointx[2]) {
				k1 = (pointy[1] - pointy[2]) / (pointx[1] - pointx[2]);
			}

			var py = (pointx[2] - pointx[1]) * k + pointy[1];
			var ycount = Math.abs(py - pointy[2]) / threshold;

			while (minx < maxx) {
				minx += threshold;
				var point = {};
				point.x = minx;
				point.y = k * (minx - pointx[0]) + pointy[0];
				point.weight = weight;
				points.push(point);

				for (var i = 1; i <= ycount; i++) {
					var ny = point.y + i * threshold;
					var pt = {};
					pt.x = (point.y - ny)/(k - k1) + point.x;
					pt.y = k1 * pt.x - k1 * point.x + point.y;
					pt.weight = weight;
					points.push(pt);
				}
			}

		}
		$scope.selHeatLocationId = null;
		$scope.showHeatLocation = function (locationId) {
			var location = _.find($scope.autoInfo.pickHeatData.list, function (l) {
				return l.location.id == locationId;
			});
			jsmap.showHeatLocation(location.location);

			$scope.selHeatLocationId = locationId;
		};


		$timeout($scope.init, 500);
    };
    
    
    resourcesPageController.prototype = mainCtrl;

    resourcesPageController.$inject = ['$interval','$scope', '$resource', '$timeout', '$mdDialog', '$mdPanel', '$mdMedia', 'lincResourceFactory', 'apiHost', 'lincUtil', 'inventoryService','yardEquipmentService','entryService'];

    return resourcesPageController;
});
