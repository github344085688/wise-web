define(['jquery', '../api/3dStore', 'lodash'], function($, _3d, _){
	var _3DInventory = function(){
		this.store = null;
	};
	_3DInventory.prototype = {
		resizePage: function(){
			this.store && this.store.resize();
		},
		init : function(options, callbacks){
			//moveoverLocation, moveoutLocation
			callbacks = callbacks || {};
			resize3dStore();
			$("#store_3d").empty();
			if(this.store){
				this.store = null;
				$("#store_3d").hide();
			}else{
				$("#store_3d").show();
				this.store = new _3d();
				var maxX = -options.coordsys.maxX,
					maxY = -options.coordsys.maxY;
				this.store.init({
					el_id : "store_3d",
					lp_count : options.lpCount || [],
					locations : getShelves(options.locations || []),
					bound : [[0, 0], [maxX * 30, maxY * 30]],
					callbacks : callbacks
				});
			}
		},
		test_3d : function(callbacks){
			//moveoverLocation, moveoutLocation
			callbacks = callbacks || {};
			resize3dStore();
			$("#store_3d").empty();
			if(this.store){
				this.store = null;
				$("#store_3d").hide();
			}else{
				$("#store_3d").show();
				this.store = new _3d();
				this.store.init({
					el_id : "store_3d",
					lp_count : [{"locationId":"1","lpIds":"LP-120","lpQty":1},{"locationId":"10","locationName":"D067","lpIds":"LP-100,LP-10025,LP-10026,LP-10035,LP-10036,LP-10037,LP-10047,LP-10050,LP-10062,LP-10063,LP-10064,LP-10065,LP-10080,LP-10082,LP-10083,LP-10185,LP-10206,LP-10207,LP-10224,LP-10225,LP-10284,LP-10286,LP-10288,LP-10289,LP-10290,LP-10291,LP-10292,LP-10293,LP-10333,LP-10334,LP-10364,LP-10365,LP-10375,LP-10379,LP-10380,LP-10381,LP-10382,LP-10383,LP-10384,LP-10385,LP-10386,LP-10387,LP-10388,LP-10389,LP-10392,LP-10393,LP-10394,LP-10395,LP-10396,LP-10397,LP-10407,LP-10409,LP-10410,LP-10411,LP-10412,LP-10413,LP-10414,LP-10415,LP-10420,LP-10421,LP-10422,LP-10424,LP-10425,LP-10426,LP-10427,LP-10428,LP-10474,LP-10475,LP-10476,LP-10477,LP-10478,LP-10479,LP-10480,LP-10494,LP-10495,LP-10505,LP-10506,LP-10510,LP-10511,LP-10611,LP-20005,LP-20006,LP-20038,LP-47","lpQty":84},{"locationId":"100","locationName":"E037","lpIds":"LP-10052,LP-10142,LP-10143,LP-10144,LP-10146,LP-10147,LP-10234,LP-10453,LP-10454,LP-10455,LP-10457,LP-10458,LP-10466,LP-10467,LP-10470,LP-10609","lpQty":16},{"locationId":"1000","locationName":"B065","lpIds":"LP-10053,LP-10054,LP-10100","lpQty":3},{"locationId":"1001","locationName":"B066","lpIds":"LP-10087,LP-10088,LP-10190,LP-10191,LP-10522,LP-10526,LP-10527","lpQty":7},{"locationId":"1002","locationName":"B067","lpIds":"LP-10066,LP-10067,LP-10089,LP-10091,LP-10102,LP-10277,LP-10278","lpQty":7},{"locationId":"1003","locationName":"B068","lpIds":"LP-10090,LP-10202,LP-10203,LP-10204,LP-10205,LP-10280,LP-10281,LP-10282,LP-10283","lpQty":9},{"locationId":"1004","locationName":"B069","lpIds":"LP-10068,LP-10104,LP-10523","lpQty":3},{"locationId":"1005","locationName":"B070","lpIds":"LP-10069,LP-10081,LP-10118,LP-10119,LP-10120,LP-10121,LP-10123,LP-10124,LP-10125,LP-10126","lpQty":10},{"locationId":"1006","locationName":"B071","lpIds":"LP-10128,LP-10129,LP-10130,LP-10131","lpQty":4},{"locationId":"1238","locationName":"1-A1","lpIds":"LP-10176,LP-10214,LP-10335,LP-10507","lpQty":4},{"locationId":"1361","locationName":"12","lpIds":"LP-10175","lpQty":1},{"locationId":"2","lpIds":"LP-104,LP-105,LP-106,LP-107,LP-117,LP-118,LP-119,LP-12,LP-121,LP-122,LP-123,LP-127,LP-13,LP-131,LP-132,LP-133,LP-134,LP-135,LP-136,LP-137,LP-14,LP-140,LP-141,LP-142,LP-143,LP-144,LP-145,LP-146,LP-147,LP-148,LP-149,LP-15,LP-150,LP-151,LP-152,LP-153,LP-154,LP-155,LP-156,LP-157,LP-158,LP-159,LP-16,LP-160,LP-161,LP-162,LP-163,LP-164,LP-165,LP-166,LP-167,LP-168,LP-169,LP-17,LP-170,LP-171,LP-172,LP-173,LP-174,LP-175,LP-176,LP-177,LP-178,LP-179,LP-18,LP-180,LP-181,LP-19,LP-20,LP-21,LP-23,LP-24,LP-25,LP-27,LP-28,LP-29,LP-31,LP-32,LP-33,LP-34,LP-35,LP-36,LP-37,LP-38,LP-39,LP-40,LP-41,LP-42,LP-43,LP-44,LP-45,LP-46,LP-48,LP-49,LP-50,LP-51,LP-52,LP-53,LP-54,LP-55,LP-56,LP-57,LP-58,LP-59,LP-60,LP-61,LP-62,LP-63,LP-65,LP-66,LP-67,LP-68,LP-69,LP-71,LP-74","lpQty":115},{"locationId":"4","lpIds":"LP-20001,LP-258,LP-260,LP-261,LP-262,LP-263,LP-264,LP-265,LP-266,LP-271,LP-272,LP-273,LP-274,LP-275,LP-276,LP-277,LP-278,LP-279,LP-280,LP-282,LP-283,LP-284,LP-285,LP-286,LP-287,LP-288,LP-289,LP-290,LP-291,LP-292,LP-293,LP-294,LP-295,LP-296","lpQty":34},{"locationId":"5","lpIds":"LP-297,LP-298,LP-299,LP-300,LP-301,LP-302,LP-303,LP-304,LP-305,LP-306,LP-307,LP-308,LP-309,LP-310,LP-311,LP-312,LP-313,LP-314,LP-315,LP-316,LP-317,LP-318,LP-319,LP-320,LP-321,LP-322,LP-323,LP-324,LP-325,LP-326,LP-327,LP-328,LP-329,LP-330,LP-331,LP-332,LP-333,LP-334,LP-335,LP-336,LP-337,LP-338,LP-339,LP-340,LP-341,LP-342,LP-343,LP-344,LP-345,LP-347,LP-348,LP-349,LP-350,LP-351,LP-354,LP-355,LP-356,LP-357,LP-358,LP-359,LP-360,LP-361,LP-362,LP-363,LP-364,LP-365,LP-366,LP-367,LP-368,LP-369,LP-370,LP-371,LP-372,LP-373,LP-374,LP-375,LP-376,LP-379,LP-380,LP-381,LP-382,LP-383,LP-384,LP-385,LP-386,LP-387,LP-388,LP-389,LP-390,LP-391,LP-392,LP-393,LP-394,LP-395,LP-396,LP-397,LP-398,LP-399,LP-400,LP-401,LP-402,LP-403,LP-430,LP-431,LP-432,LP-433,LP-434,LP-435,LP-436,LP-437,LP-438,LP-439,LP-440,LP-441,LP-442,LP-443,LP-444,LP-445,LP-446,LP-447,LP-448,LP-449,LP-450,LP-451,LP-452,LP-453,LP-454,LP-455,LP-456,LP-457,LP-458,LP-459,LP-460,LP-461,LP-462,LP-463,LP-464,LP-465,LP-466,LP-467,LP-468,LP-469,LP-470,LP-471,LP-472,LP-473,LP","lpQty":206}],
					locations : getShelves(locations),
					bound : [[0, 0], [860 * 30, -720 * 30]],
					callbacks : callbacks
				});
			}
		}
	};
	//3d库存div大小,设置为与map完全重合
	function resize3dStore(){
		var map=$("#jsmap");
		var el=$("#store_3d");
		if(el.css("display") != "none"){
			el.offset(map.offset());
			el.width(map.width());
			el.height(map.height());
		}
	}
	
	function getShelves(locations){
		var shelves = [];
		var count = 0;
		_.forEach(locations, function(loc){
			if(!loc.points){
				return true;
			}
			count++;
			if(count > 10){
				//return false;
			}
			//239.7,438.6 301.4,438.5 301.4,442.4 239.7,442.5 239.7,438.6
			var ps = loc.points.split(/\s+/);
			if(ps.length < 3){
				return true;
			}
			var p1 = ps[0].split(",");
			var p2 = ps[1].split(",");
			var p3 = ps[2].split(",");
			//单位 ft --> cm
			var x1 = parseFloat(p1[0]) * 30;
			var y1 = parseFloat(p1[1]) * 30;
			var x2 = parseFloat(p2[0]) * 30;
			var y2 = parseFloat(p2[1]) * 30;
			var x3 = parseFloat(p3[0]) * 30;
			var y3 = parseFloat(p3[1]) * 30;
			
			var width = Math.floor(Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) + 0.5);
			var length = Math.floor(Math.sqrt((x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2)) + 0.5);
			var x = (x1 - x3) / 2 + x3;
			var y = (y1 - y3) / 2 + y3;
			
			if(width > 3000 && length > 3000){
				console.log(loc.name);
			}
			
			var position = [Math.floor(x + 0.5), -Math.floor(y + 0.5)];
			
			var shelf = {
					//length : Math.min(length, width),
					//width : Math.max(length, width),
					length : length,
					width : width,
					position : position,
					floors : loc.subType == "3D" ? 4 : 0,
					//floors : Math.random() > 0.9 ? 4 : 0,
					id : loc.id
			}
			shelves.push(shelf);
		});
		return shelves;
	}
	//拼container
	function creatContainerHtml(con){
		var pro = con.products[0];
		var html = "<div id='con_"+con.con_id+"' class='element'>" +
					"	<div class='top_title'>"+
					"		<div class='con_type'>"+ con.container_type +"</div>"+
					"		<div class='title'>"+con.title_id+"</div>"+
					"	</div>"+
					"	<h1>"+con.container+"</h1>" +
					"	<div class='uls'>"+
					"		<ul>" +
					"		<li><span>Pro name : "+pro.p_name+"</span><p>"+(pro.quantity - pro.locked_quantity)+"/"+pro.quantity+"</p></li>" +
					//"		<li><span>PDT Line : "+pro.product_line+"</span></li>" +
					"		<li><span>Lot No. : "+con.lot_number+"</span></li>" +
					"</div>";
		return html;
	}
	return new _3DInventory();
});