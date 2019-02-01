'use strict';

define(["lodash",
        "jquery",
        'angular'
], function(_, $, angular) {
	
	window.Date.prototype.getUTCTime = function(){
		var offset = this.getTimezoneOffset();
		var time = this.getTime();
		var utc = time - offset * 60 * 1000;
		return utc;
	};
	
	var mainPageController = function($rootScope, $scope, $resource, $http, $mdDialog, $state,
			session, authFactory, apiHost, pickService, lincResourceFactory, lincUtil) {
		$scope.moduleName = 'gis';
		//$scope.currentWhId = null;
		$scope.currentWh = null;
		
		//var location = $resource("../data/locations-vally.json");
		
		var coordsys = $resource('/fd-app/gis/coordsys');
		var locationSearch = $resource('/base-app/location/search', null, {
			search: { method:'POST', isArray:true }
		});
		var location = $resource('/base-app/location/:id', {id : '@id'}, {
			update: { method:'PUT' }
		});
        var locationPoint = $resource('/base-app/location/clear/:id', {id : '@id'}, {
            clear: { method:'PUT' }
        });
		var equipment = $resource('/base-app/gis/equipment/:id', {id : '@id'}, {
			update: { method:'PUT' }
		});
		var warehouse = $resource("../data/gis-warehouse.json");
		var stateLine = $resource("../data/gis-stateLine.json");
		var inventoryHistory = $resource("../data/gis-inventory-his-all.json");
		var warehouseLocationLine = $resource("../data/gis-warehouse-locationLine.json");
		var inventoryWarehouseHistory = $resource("../data/gis-inventory-his-warehouse.json");
		var truckJson = $resource("../data/gis-truck2.json");
		var truck = $resource("/base-app/iot/search-gps", {}, {'search': { 'method': 'POST', isArray: true}});
        var tmsTruck = $resource("/tms/gps/write/get_running_trucks.php", null, {
            'search': { 'method': 'POST', isArray: true},
            'getTruck': {'method': 'POST','headers': { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' } }
        });
		var humiture = $resource("/base-app/iot/search-humiture", null, {'search': { 'method': 'POST', isArray: true}});
		
		var people = $resource('/idm-app/user/search', {username : '@username'}, {
			search: { method:'POST', isArray:true}
		});
		var roadResource = $resource('/base-app/gis/road/:id', {id : '@id'}, {
			update: { method:'PUT' }
		});
		var pickRoad = $resource('/base-app/gis/gisutil/get-pick-route/search', null, {
			search: { method:'POST', isArray:true }
		});
		var itemPics = $resource('/fd-app/item-picture/search', null, {
			search: { method:'POST', isArray:true }
		});

		var loadOrderJson = $resource("../data/gis-orders.json");
        var longHaulJson = $resource("../data/gis-line-haul.json");
		

		$scope.getItemPics = function(itemSpecId){
			return itemPics.search({itemSpecId: itemSpecId}).$promise;
		};
		//coord sys
		$scope.getCoordsys = function(condition){
			return coordsys.query(condition).$promise;
		};
		$scope.saveCoordsys = function(coord){
			coord.id = $scope.currentWh.id;
			return coordsys.save(coord).$promise;
		};
		//warehouse
		$scope.getWarehouses = function(){
			var cfs = session.getAssignedCompanyFacilities();
    		var whs = [];
			_.forEach(cfs, function(cf){
				var wh = {
					id : cf.facility.id,
					type : "WAREHOUSE",
					name : cf.facility.name,
					cf : cf
				};
				var _name = _.replace(wh.name, /\s+/g, "").toLowerCase();
				var whInfo = _.find(warehouseInfo, function(info){
					var __name = _.replace(info.name, /\s+/g, "").toLowerCase();
					return _name == __name;
				});
				if(whInfo){
					wh.contact = whInfo.contact;
					wh.layout = whInfo.layout;
				}
				whs.push(wh);
			});
			$scope.gisWarehouses = whs;
		};
		//state lines
		$scope.getStateLines = function(){
			return  stateLine.query().$promise;
		};
		//state lines
		$scope.getInventoryHistory = function(){
			return  inventoryHistory.query().$promise;
		};
		$scope.getWarehouseLoctionLine = function(){
			return  warehouseLocationLine.query().$promise;
		};
		$scope.getWarehouseInventoryHistory = function(){
			return  inventoryWarehouseHistory.query().$promise;
		};
		//location
		$scope.getLocations = function(filter){
			filter = filter || {};
			filter.warehouseId = $scope.currentWh.id;
			
			return locationSearch.search(filter, function(locs){
				//init locations json when GIS_RESOURCE loaded
				if(filter.scenario == "GIS_RESOURCE"){
					$scope.locations = {
							base : [], zone : [], location : [], dock : [], staging : [], parking : [], other : [], sorting : []
					};
					_.forEach(locs, function(loc){
						var type = $scope.getFixedLocType(loc);
						if($scope.locations[type]){
							$scope.locations[type].push(loc);
						}
					});
					_.forEach($scope.locations, function(v, k){
						$scope.locations[k] = _.sortBy(v, "name");
					});
				}
			}).$promise;
		};
		$scope.getFixedLocType = function(loc){
			var type = loc.type.toLowerCase();
			//fix type for 3d location
			if(type == 'zone' && loc.subType == '3D'){
				type = 'location';
			}
			//fix type of parking
			if(type == 'spot'){
				type = "parking";
				loc.type = "PARKING";
			}
			if (type === "pick") {
                //loc.type = "LOCATION";
                return "location"
			}
			return type;
		};
		$scope.commitLocation = function(loc){
			loc = _.cloneDeep(loc);	
			if(loc.type == 'ZONE' && loc.subType != '3D'){
				delete loc.subType;
			}
			if(loc.type == 'PARKING'){
				loc.type = 'SPOT';
			}
			//if(loc._isNew){
			//delete loc.id;
			if (loc.name.indexOf("NEW-COPY") >= 0) {
				lincUtil.errorPopup("Please type location name(not NEW-COPY)!");
				throw new Error("Please type location name(not NEW-COPY)!");
			}
			return location.save(loc).$promise;
			// }else{
			// 	delete loc.type;
			// 	return location.update(loc).$promise;
			// }
		};
		$scope.deleteLocation = function(id){
			//return location.delete({id : id}).$promise;
            return locationPoint.clear({id : id}).$promise;
		};
		//equipment
		function getWebCamName(equipment) {
			var ips = equipment.ip.split(".");
            return equipment.name || (ips[ips.length-1] + ":" + equipment.port + "");
		}
		$scope.getEquipments = function(){
			return equipment.query({warehouseId : $scope.currentWh.id}, function(equipments){
				$scope.equipments = {};
				_.forEach(equipments, function(equipment){
					var type = equipment.type;
					if(type === "WEBCAM"){
						equipment.name = getWebCamName(equipment);
					}else{
						if(type === "HUMITURE" && equipment.data){
							equipment.mac = equipment.data[0];
						}
						equipment.name = equipment.username;
					}
					if(!$scope.equipments[type]){
						$scope.equipments[type] = [];
					}
					$scope.equipments[type].push(equipment);
				});
				$scope.equipments.all = equipments;
				$scope.equipments["PEOPLE_LOCATE"] = [
					{"name" : "ARIAS JUAN", "type" : "PEOPLE_LOCATE"},
					{"name" : "BENJAMIN", "type" : "PEOPLE_LOCATE"},
					{"name" : "CARL HEINE", "type" : "PEOPLE_LOCATE"},
					{"name" : "CARLOS", "type" : "PEOPLE_LOCATE"},
					{"name" : "DANNY", "type" : "PEOPLE_LOCATE"},
					{"name" : "DENA JONES", "type" : "PEOPLE_LOCATE"},
					{"name" : "DION CHEN", "type" : "PEOPLE_LOCATE"},
					{"name" : "ELIAS LOPEZ", "type" : "PEOPLE_LOCATE"},
					{"name" : "FLORES", "type" : "PEOPLE_LOCATE"},
					{"name" : "HUEY", "type" : "PEOPLE_LOCATE"},
					{"name" : "JASON DENG", "type" : "PEOPLE_LOCATE"},
					{"name" : "JAVIER VERJAN", "type" : "PEOPLE_LOCATE"},
					{"name" : "JEFF JOHNSON", "type" : "PEOPLE_LOCATE"},
					{"name" : "JINGUO FEI", "type" : "PEOPLE_LOCATE"},
					{"name" : "JORGE", "type" : "PEOPLE_LOCATE"},
					{"name" : "JUAN ANGEL", "type" : "PEOPLE_LOCATE"},
					{"name" : "KAI CHENG", "type" : "PEOPLE_LOCATE"},
					{"name" : "KYUNG CHUNG", "type" : "PEOPLE_LOCATE"},
					{"name" : "LAM YEE", "type" : "PEOPLE_LOCATE"},
					{"name" : "LUIS", "type" : "PEOPLE_LOCATE"},
					{"name" : "MICHAEL", "type" : "PEOPLE_LOCATE"},
					{"name" : "ROBERT STEEN", "type" : "PEOPLE_LOCATE"},
					{"name" : "TAGO SETH", "type" : "PEOPLE_LOCATE"},
					{"name" : "VASQUEZ", "type" : "PEOPLE_LOCATE"}];
				//$scope.webcams = equipments;
			}).$promise;
		};
		$scope.commitEquipment = function(eqpt){
			if(eqpt.type != "WEBCAM"){
				eqpt.username = eqpt.name;
			}
			if(eqpt.type === "HUMITURE"){
                eqpt.data = [eqpt.mac];
            }
			if(eqpt._isNew){
				return equipment.save(eqpt).$promise;
			}else{
				return equipment.update(eqpt).$promise;
			}
		};
		$scope.deleteEquipment = function(id){
			return equipment.delete({id : id}).$promise;
		};

		$scope.getHumiture = function(macs){
			return humiture.search({sensorMacs: macs}).$promise;
		};
		
		//fleet
		$scope.getFleetPosition = function(type, nofilter){
			type = _.lowerCase(type).replace(" ", "_").toUpperCase();
			var fleets = $scope.equipments[type];
			var res = [];
			if(fleets){
				var randomLatlng = type == "FORKLIFT" ? valleyRoadLatlng : valleyRandomLatlng;
				var len = randomLatlng.length;
				_.forEach(fleets, function(fleet, i){
					if(!fleet._currPos){
						var p = Math.floor(Math.random() * len);
						fleet.latlng = randomLatlng[p];
						fleet._increase = Math.random() < 0.5 ? 1 : -1;
						fleet._currPos = p;
						res.push(fleet);
					}else if(Math.random() < 0.25){
						if(fleet._currPos + 1 >= len || fleet._currPos == 0){
							fleet._increase = -fleet._increase;
						}
						var p = fleet._currPos + fleet._increase;
						var latlng = randomLatlng[p];
						fleet._animatPath = fleet.latlng + " " + latlng;
						fleet.latlng = latlng;
						fleet._currPos = p;
						res.push(fleet);
					}
				});
			}
			return nofilter ? fleets : res;
		};
		var valleyRandomLatlng = ["-117.956107,34.016149","-117.956091,34.016100","-117.956112,34.016055","-117.956182,34.015775","-117.956069,34.015997","-117.956058,34.015891","-117.956112,34.015775","-117.956241,34.015673","-117.956305,34.015606","-117.956209,34.015606","-117.956257,34.015499","-117.956359,34.015504","-117.956402,34.015393","-117.956455,34.015308","-117.956305,34.015397","-117.956386,34.015290","-117.956423,34.015201","-117.956514,34.015210","-117.956541,34.015064","-117.956611,34.014957","-117.956670,34.014823","-117.956718,34.014748","-117.956788,34.014628","-117.956852,34.014530","-117.956874,34.014459","-117.956944,34.014383","-117.956804,34.014330","-117.956718,34.014441","-117.956659,34.014637","-117.956563,34.014757","-117.956450,34.014886","-117.956353,34.015157","-117.956214,34.015321","-117.956107,34.015490","-117.956015,34.015722","-117.955919,34.015908","-117.955790,34.016002","-117.955774,34.015940","-117.955699,34.015877","-117.955817,34.015837","-117.955940,34.015775","-117.955844,34.015699","-117.955962,34.015602","-117.955903,34.015508","-117.956032,34.015459","-117.956042,34.015370","-117.956128,34.015299","-117.956160,34.015184","-117.956257,34.015064","-117.956230,34.014975","-117.956311,34.014903","-117.956364,34.014797","-117.956386,34.014717","-117.956471,34.014592","-117.956493,34.014508","-117.956579,34.014365","-117.956589,34.014254","-117.956418,34.014214","-117.956327,34.014161","-117.956241,34.014317","-117.956386,34.014428","-117.956316,34.014623","-117.956155,34.014623","-117.956155,34.014877","-117.956026,34.014984","-117.955946,34.015188","-117.955844,34.015375","-117.955747,34.015526","-117.955667,34.015682","-117.955543,34.015797","-117.955415,34.015886","-117.955415,34.015779","-117.955495,34.015664","-117.955613,34.015619","-117.955581,34.015517","-117.955688,34.015361","-117.955645,34.015290","-117.955785,34.015219","-117.955833,34.015037","-117.955860,34.014917","-117.955946,34.014752","-117.956042,34.014619","-117.956123,34.014463","-117.956230,34.014192","-117.956128,34.014156","-117.955978,34.014272","-117.955994,34.014503","-117.955908,34.014632","-117.955796,34.014735","-117.955726,34.014895","-117.955678,34.015086","-117.955576,34.015184","-117.955447,34.015424","-117.955356,34.015619","-117.955281,34.015726","-117.955136,34.015815","-117.955093,34.015739","-117.955189,34.015686","-117.955216,34.015570","-117.955281,34.015482","-117.955377,34.015308","-117.955399,34.015201","-117.955436,34.015072","-117.955511,34.014957","-117.955619,34.014823","-117.955683,34.014654","-117.955726,34.014534","-117.955796,34.014432","-117.955844,34.014290","-117.955946,34.014152","-117.956005,34.014054","-117.955903,34.014014","-117.956107,34.016149","-117.956091,34.016100","-117.956112,34.016055","-117.956182,34.015775","-117.956069,34.015997","-117.956058,34.015891","-117.956112,34.015775","-117.956241,34.015673","-117.956305,34.015606","-117.956209,34.015606","-117.956257,34.015499","-117.956359,34.015504","-117.956402,34.015393","-117.956455,34.015308","-117.956305,34.015397","-117.956386,34.015290","-117.956423,34.015201","-117.956514,34.015210","-117.956541,34.015064","-117.956611,34.014957","-117.956670,34.014823","-117.956718,34.014748","-117.956788,34.014628","-117.956852,34.014530","-117.956874,34.014459","-117.956944,34.014383","-117.956804,34.014330","-117.956718,34.014441","-117.956659,34.014637","-117.956563,34.014757","-117.956450,34.014886","-117.956353,34.015157","-117.956214,34.015321","-117.956107,34.015490","-117.956015,34.015722","-117.955919,34.015908","-117.955790,34.016002","-117.955774,34.015940","-117.955699,34.015877","-117.955817,34.015837","-117.955940,34.015775","-117.955844,34.015699","-117.955962,34.015602","-117.955903,34.015508","-117.956032,34.015459","-117.956042,34.015370","-117.956128,34.015299","-117.956160,34.015184","-117.956257,34.015064","-117.956230,34.014975","-117.956311,34.014903","-117.956364,34.014797","-117.956386,34.014717","-117.956471,34.014592","-117.956493,34.014508","-117.956579,34.014365","-117.956589,34.014254","-117.956418,34.014214","-117.956327,34.014161","-117.956241,34.014317","-117.956386,34.014428","-117.956316,34.014623","-117.956155,34.014623","-117.956155,34.014877","-117.956026,34.014984","-117.955946,34.015188","-117.955844,34.015375","-117.955747,34.015526","-117.955667,34.015682","-117.955543,34.015797","-117.955415,34.015886","-117.955415,34.015779","-117.955495,34.015664","-117.955613,34.015619","-117.955581,34.015517","-117.955688,34.015361","-117.955645,34.015290","-117.955785,34.015219","-117.955833,34.015037","-117.955860,34.014917","-117.955946,34.014752","-117.956042,34.014619","-117.956123,34.014463","-117.956230,34.014192","-117.956128,34.014156","-117.955978,34.014272","-117.955994,34.014503","-117.955908,34.014632","-117.955796,34.014735","-117.955726,34.014895","-117.955678,34.015086","-117.955576,34.015184","-117.955447,34.015424","-117.955356,34.015619","-117.955281,34.015726","-117.955136,34.015815","-117.955093,34.015739","-117.955189,34.015686","-117.955216,34.015570","-117.955281,34.015482","-117.955377,34.015308","-117.955399,34.015201","-117.955436,34.015072","-117.955511,34.014957","-117.955619,34.014823","-117.955683,34.014654","-117.955726,34.014534","-117.955796,34.014432","-117.955844,34.014290","-117.955946,34.014152","-117.956005,34.014054","-117.955903,34.014014","-117.955785,34.014134","-117.955667,34.014290","-117.955576,34.014508","-117.955474,34.014739","-117.955382,34.014948","-117.955281,34.015135","-117.955173,34.015304","-117.955018,34.015548","-117.954884,34.015668","-117.954760,34.015682","-117.954712,34.015566","-117.954792,34.015508","-117.954969,34.015384","-117.954900,34.015233","-117.955050,34.015197","-117.955146,34.015046","-117.955071,34.014952","-117.955195,34.014775","-117.955286,34.014970","-117.955318,34.014721","-117.955318,34.014557","-117.955436,34.014450","-117.955495,34.014277","-117.955624,34.014103","-117.955624,34.013992","-117.955500,34.013903","-117.955350,34.014130","-117.955200,34.014357","-117.955050,34.014539","-117.955012,34.014837","-117.954841,34.015024","-117.954733,34.015210","-117.954653,34.015468","-117.954524,34.015557","-117.954374,34.015517","-117.954454,34.015437","-117.954524,34.015299","-117.954546,34.015184","-117.954664,34.015028","-117.954798,34.014881","-117.954771,34.014726","-117.954889,34.014588","-117.954884,34.014450","-117.955055,34.014325","-117.955023,34.014192","-117.955141,34.014068","-117.955264,34.013921","-117.955313,34.013841","-117.955120,34.013779","-117.955007,34.013819","-117.954916,34.014045","-117.954884,34.014237","-117.954733,34.014397","-117.954615,34.014592","-117.954524,34.014766","-117.954395,34.015055","-117.954310,34.015313","-117.954213,34.015428","-117.954084,34.015402","-117.954068,34.015290","-117.954170,34.015206","-117.954267,34.014966","-117.954310,34.014868","-117.954385,34.014735","-117.954444,34.014566","-117.954562,34.014392","-117.954637,34.014250","-117.954744,34.014094","-117.954782,34.013970","-117.954867,34.013850","-117.954873,34.013801","-117.954921,34.013685","-117.954760,34.013650","-117.954653,34.013863","-117.954530,34.014108","-117.954422,34.014308","-117.954277,34.014574","-117.954170,34.014775","-117.954052,34.015050","-117.953918,34.015246","-117.953784,34.015326","-117.953677,34.015264","-117.953719,34.015219","-117.953854,34.015130","-117.953773,34.015006","-117.953966,34.014930","-117.953902,34.014810","-117.954074,34.014695","-117.954009,34.014632","-117.954106,34.014423","-117.954213,34.014237","-117.954315,34.014165","-117.954304,34.013947","-117.954460,34.013974","-117.954530,34.013832","-117.954444,34.013707","-117.954631,34.013654","-117.954471,34.013552"];
		var valleyRoadLatlng = ["-117.956525,34.015037","-117.956353,34.014979","-117.956128,34.014912","-117.955967,34.014841","-117.955747,34.014779","-117.955613,34.014721","-117.955431,34.014663","-117.955205,34.014579","-117.955034,34.014517","-117.954937,34.014712","-117.954825,34.014912","-117.954749,34.015050","-117.954926,34.015099","-117.955141,34.015170","-117.955307,34.015228","-117.955495,34.015290","-117.955688,34.015353","-117.955822,34.015393","-117.955927,34.015433","-117.955782,34.015633","-117.955669,34.015855","-117.955849,34.015957",
		                        "-117.955892,34.015966","-117.955940,34.015859","-117.955989,34.015735","-117.956042,34.015624","-117.956112,34.015535","-117.956144,34.015464","-117.956187,34.015330","-117.956246,34.015188","-117.956327,34.015041","-117.956423,34.014881","-117.956493,34.014726","-117.956568,34.014570","-117.956632,34.014441","-117.956606,34.014370","-117.956445,34.014321","-117.956348,34.014503","-117.956262,34.014708","-117.956182,34.014832","-117.956117,34.014952","-117.956026,34.015135","-117.955930,34.015317","-117.955822,34.015530","-117.955715,34.015762","-117.955613,34.015864","-117.955452,34.015824","-117.955297,34.015744","-117.955334,34.015606","-117.955431,34.015406","-117.955511,34.015246","-117.955597,34.015072","-117.955699,34.014872","-117.955763,34.014748","-117.955833,34.014614","-117.955903,34.014437","-117.955999,34.014281","-117.956042,34.014179","-117.955881,34.014121","-117.955731,34.014068","-117.955613,34.014312","-117.955533,34.014499","-117.955420,34.014681","-117.955286,34.014930","-117.955189,34.015148","-117.955093,34.015326","-117.954985,34.015566","-117.954878,34.015610","-117.954755,34.015584","-117.954642,34.015517","-117.954615,34.015406","-117.954701,34.015210","-117.954771,34.015037","-117.954857,34.014886","-117.954916,34.014748","-117.955002,34.014601","-117.955087,34.014437","-117.955141,34.014299","-117.955216,34.014161","-117.955259,34.014045","-117.955334,34.013956","-117.955141,34.013867","-117.955002,34.013823","-117.954857,34.014085","-117.954712,34.014383","-117.954594,34.014623","-117.954471,34.014841","-117.954347,34.015095","-117.954245,34.015330","-117.954149,34.015366","-117.953972,34.015273","-117.953972,34.015130","-117.954068,34.014912","-117.954106,34.014815","-117.954202,34.014641","-117.954277,34.014490","-117.954320,34.014379","-117.954390,34.014259","-117.954449,34.014143","-117.954497,34.014041","-117.954562,34.013925","-117.954615,34.013787","-117.954685,34.013690"];
		//demand
		$scope.getDemand = function(){
			return  $resource("../data/gis-demand.json").query().$promise;
		};
		//occupy
		$scope.getOccupyParking = function(){
			return  $resource("../data/gis-occupy-parking.json").query().$promise;
		};
		$scope.getOccupyDock = function(){
			return  $resource("../data/gis-occupy-dock.json").query().$promise;
		};
		$scope.getServiceStatus = function(){
			return  $resource("../data/gis-service-status.json").query().$promise;
		};
		$scope.getRecycleCollection = function(){
			return  $resource("../data/gis-recycle-collection.json").query().$promise;
		};
		$scope.getOsrTech = function(){
			return  $resource("../data/gis-osr-tech.json").query().$promise;
		};

        $scope.getLongHaul = function(){
            return longHaulJson.query({}, function(lineHauls){
                _.forEach(lineHauls, function(line){
                    line.line = _.join(line.path, " ");
                });
            }).$promise;
        };

        $scope.getLoadOrder = function(longHaulMap){
            return loadOrderJson.query({}, function(orders){
                _.forEach(orders, function(order){
                	var longHaul = longHaulMap[order.Langhaul];
                	if (!longHaul) return;
                    var index = Math.floor(longHaul.path.length * order.LinePoz);
                    order.latlng = longHaul.path[index];
                });
            }).$promise;
        };

		//load status
		$scope.getLoadStatus = function(){
			return truckJson.query({}, function(trucks){
				_.forEach(trucks, function(truck){
					var index = Math.floor(truck.path.length * truck.process);
					
					truck.latlng = truck.path[index];
					truck.line = _.join(truck.path, " ");
					delete truck.path;
				});
			}).$promise;
		};

        $scope.getTruck = function() {
            return tmsTruck.search(function (trucks) {
                _.forEach(trucks, function (truck) {
                    if (truck.path) {
                        var points = truck.path.replace(" ", "").split(",");
                        if (points.length > 1) {
                            truck.latlng = _.join([points[1], points[0]]);
						} else {
                            points = truck.path.replace(" ", "").split("-");
                            if (points.length > 1) {
                                truck.latlng = _.join(["-" + points[1], points[0]]);
                            }
						}
                    }
                });
            }).$promise;
        }
        $scope.getTruckLine = function(param){
            return tmsTruck.getTruck($.param(param), function (line) {
				if (!line || !line.path || line.path.length === 0) return;
				var path = [];
				_.forEach(line.path, function (point) {
					var ps = point.split(",");
                    path.push(ps[1] + "," + ps[0]);
                })
                line.path = path;
            }).$promise;
        };
        $scope.getTruckOld = function(){
            return truck.search(function(trucks){
                _.forEach(trucks, function(truck){
                    if(truck.lng && truck.lat){
                        truck.latlng = _.join([truck.lng, truck.lat]);
                    }
                });
            }).$promise;
        };
		//truck gps history
		$scope.getTruckLineOld = function(lp){
			return truckJson.query().$promise;
		};
		//
		$scope.getGlobalIndex = function(){
			return $resource("../data/gis-globalIndex.json").query().$promise;
		};
		//people
		$scope.getAllPeople = function(){
			return people.search({username : ""}).$promise;
		};
		
		//road
		$scope.commitRoad = function (road) {
			if (road._isNew) {
				return roadResource.save(road).$promise;
			} else {
				return roadResource.update(road).$promise;
			}
		};
		$scope.getRoads = function () {
			return roadResource.query(null, function (roads) {
				var _roads = [];
				_.forEach(roads, function(road){
					if(road.points && road.points.length > 1){
						var latlng = "", path = [];
						_.forEach(road.points, function(p){
							latlng += p.lng + "," + p.lat + " ";
							path.push([p.lng, p.lat]);
						});
						road.latlng = _.trim(latlng);
						road.path = path;
						_roads.push(road);
					}
				});
				$scope.roads = _roads;
			}).$promise;
		};
		$scope.deleteRoad = function (id) {
			return roadResource.delete({id : id}).$promise;
		};
		
		$scope.getLpOutHistoryByLocation = function(){
			return $resource("../data/gis-inventory-heat-map.json").query().$promise;
		};
		
		$scope.isWhBuild = function(id){
    		id = id || "";
    		var whs = $scope.gisWarehouses;
    		var wh = _.find(whs, {id : id});
    		var isBuild = wh && wh.coordsys;
    		return isBuild;
    	};

		//判断是否是移动设备
		$scope.isMobile = function(){
			var reg = /[android|ipad|iphone]/i;
			var userAgent = window.navigator.userAgent;
			return reg.test(userAgent);
		};
		//判断浏览器类型
		$scope.browser = function() {
			var userAgent = window.navigator.userAgent;
			var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i};

			for(var key in browsers) {
				if (browsers[key].test(userAgent)) {
					return key;
				}
			}
			return 'unknown';
		};
		
		//检查插件是否安装
		$scope.checkPlugins = function (pluginsName, activexObjectName) {
		    // 通常ActiveXObject的对象名称是两个插件名称的组合
		    if (activexObjectName == '') activexObjectName = pluginsName + "." + pluginsName;
		   
		    var np = navigator.plugins;
		    // 针对于FF等非IE
		    if (np && np.length) {
		    	pluginsName = pluginsName.toLowerCase();
		        for(var i = 0; i < np.length; i ++) {
		            if(np[i].name.toLowerCase().indexOf(pluginsName) != -1) return true;
		        }
		        return false;
		    }
		    // 针对于IE
		    else if (window.ActiveXObject) {
		        try {
		            var axobj =eval("new ActiveXObject(activexObjectName);");
		            // 将对象转化为布尔类型
		            return axobj ? true : false;
		        } catch (e) {
		            return false;
		        }
		    } else {
		        // 以上情况都排除则返回false
		        return false;
		    }
		};

		/**
		 * 仓库平面图下载
		 */
		$scope.isPdfLoading = false;
		$scope.getExportParameter = function (layers) {
			var warehouseExportParameter = {};
			warehouseExportParameter.warehouseId = $scope.currentWh.id;
			warehouseExportParameter.warehouseName = $scope.currentWh.name;
			warehouseExportParameter.unExportZone = 0;
			warehouseExportParameter.unExportLocation = 0;
			warehouseExportParameter.unExportDock = 0;
			warehouseExportParameter.unExportStaging = 0;
			warehouseExportParameter.unExportParking = 0;
			warehouseExportParameter.unExportOther = 0;

			$.each(layers, function (key, layer) {
				if(key.toLocaleString() == "zone"){
					if(!layer.checked) warehouseExportParameter.unExportZone = 1;
				}
				else if(key.toLocaleString() == "location"){
					if(!layer.checked) warehouseExportParameter.unExportLocation = 1;
				}
				else if(key.toLocaleString() == "dock"){
					if(!layer.checked) warehouseExportParameter.unExportDock = 1;
				}
				else if(key.toLocaleString() == "staging"){
					if(!layer.checked) warehouseExportParameter.unExportStaging = 1;
				}
				else if(key.toLocaleString() == "parking"){
					if(!layer.checked) warehouseExportParameter.unExportParking = 1;
				}
				else if(key.toLocaleString() == "other"){
					if(!layer.checked) warehouseExportParameter.unExportOther = 1;
				}
			});

			return warehouseExportParameter;
		}
		$scope.exportWarehouse = function () {
			if($scope.isPdfLoading) return;

			var layers;
			if($scope.layers) layers = $scope.layers;
			else if($scope.getMenus)
				layers = $scope.getMenus(["zone", "location", "staging", "dock", "parking", "other"]);
			if($scope.currentWh == null || $.isEmptyObject(layers)){
				// TODO: alert("WarehouseId is null");
				return;
			}

			var warehouseExportParameter = $scope.getExportParameter(layers);
			$scope.isPdfLoading = true;
			$http.post("/base-app/gis/gisutil/warehouse-export", warehouseExportParameter, {
				responseType: 'arraybuffer'
			}).then(function (res) {
				if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Create file failed!");
					$scope.isPdfLoading = false;
					return;
				}
				var name = warehouseExportParameter.warehouseName + '-layout.pdf';
                lincUtil.exportFile(res, name);
				$scope.isPdfLoading = false;

			}, function (error) {
                lincUtil.errorPopup(error);
				$scope.isPdfLoading = false;
			});
		};
		//解决回调函数执行时不能自动刷新页面的问题，并防止$apply already in progress报错
		$scope.apply = function(){
    		if(!$scope.$$phase) {
    			try{
    				$scope.$apply();
    			}catch(e){
    			}
    		}
    	};
    	$scope.locationType = ["ZONE", "LOCATION", "STAGING", "DOCK", "PARKING", "OTHER"];
    	$scope.locationSubType = {
    			"ZONE" : ["", "3D"],
    			"LOCATION" : ["2D", "3D"],
    			"PARKING" : ["PARKING", "EMPTY_CTN", "FULL_CTN", "WAITING"]
    	};
    	$scope.locationStatus = {
    			"DOCK" : ["USEABLE", "DISABLED"]
    	};
    	$scope.locationParent = {
    			"STAGING" : "dock",
    			"LOCATION" : "zone"
    	};

		$scope.getPickTask = function () {
			return pickService.getPickTaskList();
		};
		$scope.getPickRoad = function (search) {
			return pickRoad.search(search).$promise;
		};
		
		var warehouseInfo = {
			"ORG-2288" : {
	    		"id":"1234",
	    		"name":"Valley",
	    		"descript":"-- warehouse descript & info --",
	    		"contact" : {
	    			"address" : "15930 Valley Blvd, City of Industry, CA 91744",
	    			"phone" : "626-926-0325",
	    			"email" : "Janet.ho@logisticsteam.com",
	    			"area" : "600,000 ft²"
	    		},
	    		"layout" : {
	    			"Zone" : 51,
	    			"Location" : 1563,
	    			"Staging" : 92,
	    			"Dock" : 91,
	    			"Parking" : 129
	    		}
	    	},
	    	"ORG-2156" : {
	    		"id":"1235",
	    		"name":"Via Baron",
	    		"descript":"-- warehouse descript & info --",
	    		"contact" : {
	    			"address" : "19914 S. Via Baron, Rancho Dominguez, CA 90220",
	    			"phone" : "310-747-7388 ext:2515",
	    			"email" : "andy.lim@logisticsteam.com",
	    			"area" : "300,000 ft²"
	    		},
	    		"layout" : {
	    			"Zone" : 24,
	    			"Location" : 786,
	    			"Staging" : 50,
	    			"Dock" : 42,
	    			"Parking" : 72
	    		}
	    	},
	    	"ORG-2161" : {
	    		"id":"1236",
	    		"name":"Turnbull",
	    		"descript":"-- warehouse descript & info --",
	    		"contact" : {
	    			"address" : "900 Turnbull Canyon Rd, City of Industry, CA 91745",
	    			"phone" : "626-926-0325",
	    			"email" : "Janet.ho@logisticsteam.com",
	    			"area" : "250,000 ft²"
	    		},
	    		"layout" : {
	    			"Zone" : 27,
	    			"Location" : 630,
	    			"Staging" : 46,
	    			"Dock" : 38,
	    			"Parking" : 76
	    		}
	    	},
	    	"ORG-2287" : {
	    		"id":"1237",
	    		"name":"Walnut",
	    		"descript":"-- warehouse descript & info --",
	    		"contact" : {
	    			"address" : "218 Machlin Ct. Walnut, CA 91789",
	    			"phone" : "626-926-0325",
	    			"email" : "Janet.ho@logisticsteam.com",
	    			"area" : "300,000 ft²"
	    		},
	    		"layout" : {
	    			"Zone" : 29,
	    			"Location" : 816,
	    			"Staging" : 43,
	    			"Dock" : 41,
	    			"Parking" : 112
	    		}
	    	},
	    	"ORG-2289" : {
	    		"id":"1238",
	    		"name":"Blue Heron",
	    		"descript":"-- warehouse descript & info --",
	    		"contact" : {
	    			"address" : "100 Blue Heron Way, Edison, NJ 08837",
	    			"phone" : "626-926-0325",
	    			"email" : "Janet.ho@logisticsteam.com",
	    			"area" : "200,000 ft²"
	    		},
	    		"layout" : {
	    			"Zone" : 20,
	    			"Location" : 509,
	    			"Staging" : 26,
	    			"Dock" : 24,
	    			"Parking" : 38
	    		}
	    	},
	    	"ORG-2291" : {
	    		"id":"1238",
	    		"name":"Lion Country",
	    		"descript":"-- warehouse descript & info --",
	    		"contact" : {
	    			"address" : "2250 Lion Country Parkway, Suite 100, Grand Prairie, TX 75050",
	    			"phone" : "626-926-0325",
	    			"email" : "Janet.ho@logisticsteam.com",
	    			"area" : "200,000 ft²"
	    		},
	    		"layout" : {
	    			"Zone" : 20,
	    			"Location" : 509,
	    			"Staging" : 26,
	    			"Dock" : 24,
	    			"Parking" : 38
	    		}
	    	},
	    	"ORG-2292" : {
	    		"id":"1238",
	    		"name":"Ameriplex",
	    		"descript":"-- warehouse descript & info --",
	    		"contact" : {
	    			"address" : "6515 Ameriplex Drive, Portage, Indiana 46368",
	    			"phone" : "626-926-0325",
	    			"email" : "Janet.ho@logisticsteam.com",
	    			"area" : "200,000 ft²"
	    		},
	    		"layout" : {
	    			"Zone" : 20,
	    			"Location" : 509,
	    			"Staging" : 26,
	    			"Dock" : 24,
	    			"Parking" : 38
	    		}
	    	},
	    	"ORG-2290" : {
	    		"id":"1241",
	    		"name":"Woodbridge",
	    		"descript":"-- warehouse descript & info --",
	    		"contact" : {
	    			"address" : "3001 Woodbridge Ave, Edison, NJ 08837",
	    			"phone" : "626-533-2093",
	    			"email" : "albert.hickey@logisticsteam.com",
	    			"area" : "300,000 ft²"
	    		},
	    		"layout" : {
	    			"Zone" : 26,
	    			"Location" : 832,
	    			"Staging" : 46,
	    			"Dock" : 44,
	    			"Parking" : 68
	    		}
    	},"ORG-7941" : {
			"id":"1242",
			"name":"Willow",
			"descript":"-- warehouse descript & info --",
			"contact" : {
				"address" : "2131 W Willow St, Long Beach, CA 90810",
				"phone" : "626-533-2093",
				"email" : "albert.hickey@logisticsteam.com",
				"area" : "250,000 ft²"
			},
			"layout" : {
				"Zone" : 26,
				"Location" : 832,
				"Staging" : 46,
				"Dock" : 44,
				"Parking" : 68
			}
		},"ORG-7990" : {
				"id":"1243",
				"name":"Reyes",
				"descript":"-- warehouse descript & info --",
				"contact" : {
					"address" : "19201 S. Reyes Ave, Rancho Dominguez, 90221",
					"phone" : "(888) 488-4888",
					"email" : "albert.hickey@logisticsteam.com",
					"area" : "100,000 ft²"
				},
				"layout" : {
					"Zone" : 22,
					"Location" : 432,
					"Staging" : 12,
					"Dock" : 42,
					"Parking" : 46
				}
		},"ORG-7955" : {
			"id":"1244",
			"name":"Turnbull",
			"descript":"-- warehouse descript & info --",
			"contact" : {
				"address" : "900 Turnbull Canyon Rd City of Industry CA 91745",
				"phone" : "(888) 488-4888",
				"email" : "albert.hickey@logisticsteam.com",
				"area" : "280,000 ft²"
			},
			"layout" : {
				"Zone" : 14,
				"Location" : 482,
				"Staging" : 19,
				"Dock" :43,
				"Parking" : 67
			}
		},"ORG-7954" : {
			"id":"1245",
			"name":"Marlay",
			"descript":"-- warehouse descript & info --",
			"contact" : {
				"address" : "13367 Marlay Ave., Fontana CA 92337",
				"phone" : "(888) 488-4888",
				"email" : "albert.hickey@logisticsteam.com",
				"area" : "470,000 ft²"
			},
			"layout" : {
				"Zone" : 34,
				"Location" : 582,
				"Staging" : 23,
				"Dock" :49,
				"Parking" : 61
			}
		},"ORG-7759" : {
			"id":"1246",
			"name":"Fontana",
			"descript":"-- warehouse descript & info --",
			"contact" : {
				"address" : "10681 Production Ave Fontana CA 92337",
				"phone" : "(888) 488-4888",
				"email" : "albert.hickey@logisticsteam.com",
				"area" : "1280,000 ft²"
			},
			"layout" : {
				"Zone" : 14,
				"Location" : 482,
				"Staging" : 19,
				"Dock" :43,
				"Parking" : 67
			}
		}};

	};
	mainPageController.$inject = ['$rootScope', '$scope', '$resource', '$http', '$mdDialog', '$state',
		'session', 'authFactory', 'apiHost', 'pickService', 'lincResourceFactory', 'lincUtil'];

	return mainPageController;
});