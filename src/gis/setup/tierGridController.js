/**
 * Created by Giroux on 2016/8/11.
 */

'use strict';

define(['jquery',
    'angular',
    'lodash'
], function($, angular, _) {

    var controller = function($scope, $mdDialog, $timeout) {
        // 参数接收
        var ctrl = this;
        $scope.parentLocation = ctrl.loc;
        $scope.tierLocs = ctrl.locs;

        // 设置项
        $scope.tierSet = {};
        $scope.tierSet.tier = 3;
        $scope.tierSet.col = 4;
        $scope.tierSet.prefix = $scope.parentLocation.name;
        $scope.tierSet.increase = "-01";
        $scope.tierSet.suffix = "-01";
        // 3d location尺寸设置
        $scope.locSize = {
        		length : null,
        		width : null,
        		height : null,
        		unit : 1,
        		sync : true,
        		currLoc : null
        };

        // 数据
        $scope.tierData = {};
        $scope.tierData.rowNum = [];
        $scope.tierData.colNum = [];
        $scope.tierData.rows = [];
        $scope.tierData.locs = [];

        var locationStatus = "USEABLE";
        var locationSubType = "3D_GRID";
        var locationType = "LOCATION";

        var tempLocs = [];
        var defaultTier = 0;
        var defaultCol = 0;
        var defaultIncrease = "-01";
        var defaultSuffix = "-01";

        // 根据 locs 计算设置项的值
        function init() {
            if($scope.tierLocs.length < 1) return;

            var tier = 0;
            var col = 0;
            var group = _.groupBy($scope.tierLocs, function (loc) {
                return loc.tierNumber;
            });
            var min = 1000, minval = [], maxval = [];
            _.forEach(group, function (val, key) {
                if(key > tier) tier = key;
                if(key <= min){
                    min = key;
                    minval = val;
                }
                var len = val.length;
                if(len > col){
                    col = len;
                    maxval = val;
                }
            });
            tier = tier - min + 1;

            minval = _.sortBy(minval, "name");
            var name = minval[0].name;
            var ns = name.split("-");

            maxval = _.sortBy(maxval, "name");
            name = maxval[maxval.length - 1].name;
            var ms = name.split("-");

            if(ns.length > 2) {
                $scope.tierSet.suffix = "-" + ns[ns.length - 1];
                $scope.tierSet.increase = "-" + ns[ns.length - 2];

                if(ms.length > 2){
                    var fn = ns[ns.length - 1];
                    var lm = ms[ms.length - 1];
                    var nc = 1;
                    while(fn < lm){
                        nc++;
                        fn = strAdd(fn);
                    }
                    col = nc;
                }
            }
            $scope.tierSet.tier = tier;
            $scope.tierSet.col = col;

            defaultTier = tier;
            defaultCol = col;
            defaultIncrease = $scope.tierSet.increase;
            defaultSuffix = $scope.tierSet.suffix;

            $scope.createTable();
        }
        //size
        $scope.setSize = function(loc, e){
        	e.stopPropagation();
        	
        	$scope.locSize.currLoc = loc;
        	var size = $scope.locSize;
        	var unit = size.unit || 1;
        	
        	var length = loc.length * unit;
        	var width = loc.width * unit;
        	var height = loc.height * unit;
        	size.length = parseFloat(length.toFixed(1));
        	size.width = parseFloat(width.toFixed(1));
        	size.height = parseFloat(height.toFixed(1));
        }
        $scope.setLocSize = function(){
        	var size = $scope.locSize;
        	var loc = size.currLoc;
        	var sync = size.sync;
        	var length = size.length / size.unit;
        	var width = size.width / size.unit;
        	var height = size.height / size.unit;
        	length = parseFloat(length.toFixed(1));
        	width = parseFloat(width.toFixed(1));
        	height = parseFloat(height.toFixed(1));
        	if(sync){
        		_.forEach($scope.tierData.locs, function(_loc){
        			_loc.length = length;
        			_loc.width = width;
        			_loc.height = height;
        		});
        	}else{
        		loc.length = length;
        		loc.width = width;
        		loc.height = height;
        	}
        	size.currLoc = null;
        }
        // 设置删除标志
        function markLocDel() {
            _.forEach($scope.tierLocs, function (loc) {
                var location = _.find($scope.tierData.locs, function (_loc) {
                    return _loc.id == loc.id;
                });
                if(location == null){
                    loc._isDel = true;
                    $scope.tierData.locs.push(loc);
                }
            });
        }

        // 历史记录
        function addTempLocs() {
            var len = defaultTier * defaultCol;
            if(len > $scope.tierData.locs.length) return;
            for(var i = 0; i < len; i++) {
                var loc = $scope.tierData.locs[i];
                var location = _.find(tempLocs, function (_loc) {
                    return _loc.name == loc.name;
                });

                if (location == null) {
                    tempLocs.push(_.cloneDeep(loc));
                }else{
                	location._isDel = loc._isDel;
                }
            }
        }

        var nameChars1 = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(",");
        var nameChars2 = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z".split(",");
        function charIndex(chars, char) {
            for (var i = 0; i < chars.length; i++) {
                if (chars[i] == char) return i;
            }
            return -1;
        }

        function isNumber(obj) {
            if(obj == null) return false;
            var re = new RegExp("^[0-9]+$", "i");
            var res = obj.match(re);
            if (res == null || res[0] != obj) return false;
            return true;
        }
        function isLowerCase(obj) {
            if(obj == null) return false;
            if(charIndex(nameChars1, obj) >= 0) return true;
            return false;
        }
        function isUpperCase(obj) {
            if(obj == null) return false;
            if(charIndex(nameChars2, obj) >= 0) return true;
            return false;
        }

        // 数字字母组合字符串自增
        function charAdd(str, num, index, max, minChar, curChar) {
            var res = str;
            var sub = str.substr(0, index);
            if (num < max) {
                res = sub;
                res += curChar;
            }
            else {
                res = strAdd(sub);
                res += minChar;
            }
            if (index < str.length - 1)
                res += str.substring(index + 1, str.length);
            return res;
        }
        function strAdd(str) {
            var index = str.length - 1;
            var res = str;
            var char = str[index];

            if (isNumber(char)) {
                var num = parseInt(char);
                num += 1;
                res = charAdd(res, num, index, 10, "0", num);
            }
            else if(isLowerCase(char)){
                var num = charIndex(nameChars1, char);
                num += 1;
                res = charAdd(res, num, index, 26, "a", nameChars1[num]);
            }
            else if(isUpperCase(char)){
                var num = charIndex(nameChars2, char);
                num += 1;
                res = charAdd(res, num, index, 26, "A", nameChars2[num]);
            }
            return res;
        }

        // 命名规则：parentLocation.name + "- 字母或数字组合（行）" + "- 字母或数字组合（列）"
        function getLocationName(row, col, increase, suffix) {
            var prefix = $scope.tierSet.prefix;
            if(increase == null) increase = $scope.tierSet.increase;
            if(suffix == null) suffix = $scope.tierSet.suffix;
            increase = increase.replace("-", "");
            suffix = suffix.replace("-", "");

            if(row > 1) {
                for (var i = 1; i < row; i++)
                    increase = strAdd(increase);
            }
            if(col > 1) {
                for (var i = 1; i < col; i++)
                    suffix = strAdd(suffix);
            }
            return prefix + "-" + increase + "-" + suffix;
        }

        function getLocation(row, col) {
            var name = getLocationName(row, col);
            var nameOld = getLocationName(row, col, defaultIncrease, defaultSuffix);
            var loc = null;

            if(tempLocs.length > 0){
                loc = _.find(tempLocs, function (_loc) {
                    return _loc.name == name;
                });
                if(loc != null) return loc;

                loc = _.find(tempLocs, function (_loc) {
                    return _loc.name == nameOld;
                });
                if(loc != null) {
                    loc.name = name;
                    return loc;
                }
            }

            if($scope.tierLocs.length > 0) {
                loc = _.find($scope.tierLocs, function (_loc) {
                    return _loc.name == name;
                });
                if(loc != null) return loc;

                loc = _.find($scope.tierLocs, function (_loc) {
                    return _loc.name == nameOld;
                });
                if(loc != null){
                    loc.name = name;
                    return loc;
                }
            }

            loc = {
            		name : name,
            		warehouseId : $scope.parentLocation.warehouseId,
            		parentId : $scope.parentLocation.id,
		            status : locationStatus,
		            subType : locationSubType,
		            type : locationType,
		            points : null,
		            latlng : null,
		            tierNumber : row,
		            _isNew : true
            };
            /*
            loc.name = name;
            loc.warehouseId = $scope.parentLocation.warehouseId;
            loc.parentId = $scope.parentLocation.id;
            loc.status = locationStatus;
            loc.subType = locationSubType;
            loc.type = locationType;
            loc.points = null;
            loc.latlng = null;
            loc.tierNumber = row;
            loc._isNew = true;
*/
            if($scope.tierLocs.length > 0 && row <= defaultTier && col <= defaultCol 
                && defaultIncrease == $scope.tierSet.suffix && defaultSuffix == $scope.tierSet.increase){
                loc._isDel = true;
            }
            return loc;
        }

        // 检查 loc 是否修改过
        function isLocChange(loc) {
            if(loc.id == null) return true;
            for(var i = 0; i < $scope.tierLocs.length; i++){
                if($scope.tierLocs[i].id == loc.id){
                    if($scope.tierLocs[i].name != loc.name) return true;
                    if($scope.tierLocs[i].tierNumber != loc.tierNumber) return true;
                    if($scope.tierLocs[i].length != loc.length) return true;
                    if($scope.tierLocs[i].width != loc.width) return true;
                    if($scope.tierLocs[i].height != loc.height) return true;

                    return false;
                }
            }
            return true;
        }

        // 关闭
        $scope.closeGridDialog = function () {
            _.forEach($scope.tierLocs, function (loc) {
                loc._isDel = false;
            });
            $mdDialog.cancel();
        }

        // 设置状态，是否删除
        $scope.setLocStatus = function (loc) {
            if(loc == null){
                return;
            }
            if(loc._isDel == null || loc._isDel) {
                loc._isDel = false;
            }else{
                loc._isDel = true;
            }
        }

        // 创建新的表格
        $scope.createTable = function () {
            //addTempLocs();
            $scope.tierData.rowNum = [];
            $scope.tierData.colNum = [];
            $scope.tierData.rows = [];
            $scope.tierData.locs = [];

            var num = parseInt($scope.tierSet.tier);
            var col = parseInt($scope.tierSet.col);
            if(num < 1 || col < 1) return;

            for(var i = 1; i <= num; i++){
                $scope.tierData.rowNum.push(i);
                var locs = [];
                for(var j = 1; j <= col; j++){
                    if($scope.tierData.colNum.length < col)
                        $scope.tierData.colNum.push(j);

                    var loc = _.clone(getLocation(i, j));
                    $scope.tierData.locs.push(loc);
                    locs.push(loc);
                }
                $scope.tierData.rows.push(locs);
            }
            $scope.tierData.rowNum = _.sortBy($scope.tierData.rowNum, function (item) {
                return -item;
            });

            defaultTier = num;
            defaultCol = col;
            defaultIncrease = $scope.tierSet.increase;
            defaultSuffix = $scope.tierSet.suffix;
            markLocDel();
        }

        // 保存
        $scope.saveTierData = function () {
            if($scope.tierData.locs.length === 0) return;
            var susNum = 0;
            var errNum = 0;
            _.forEach($scope.tierData.locs, function(loc) {
                if(loc._isDel){     // 数据删除
                    if(loc._isNew){ // 新增时的删除，无需保存
                        susNum++;
                        saveSus(susNum);
                        return;
                    }
                    $scope.$parent.$$childHead.deleteLocation(loc.id).then(function (resp) {
                        _.remove($scope.tierLocs, function (_loc) {
                            return _loc.id == loc.id;
                        });
                        _.remove($scope.$parent.$$childHead.locations.location, function (_loc) {
                            return _loc.id == loc.id;
                        });
                        susNum++;
                        saveSus(susNum);
                    }), function (err) {
                        errNum++;
                        showError(errNum + susNum );
                    };
                }
                else {  // 数据新增或编辑
                    if(!loc._isNew && !isLocChange(loc)){   // 没有编辑的数据无需保存
                        susNum++;
                        saveSus(susNum);
                        return;
                    }
                    $scope.$parent.$$childHead.commitLocation(loc).then(function (resp) {	//新建返回location对象， 修改返回空
                        if (resp != null && resp.id) {
                            loc.id = resp.id;
                            $scope.tierLocs.push(loc);
                            $scope.$parent.$$childHead.locations.location.push(loc);
                        }
                        susNum++;
                        saveSus(susNum);
                    }, function (err) {	//错误信息
                        errNum++;
                        showError(errNum + susNum );
                    });
                }
            });
        }
        function saveSus(susNum) {
            if (susNum == $scope.tierData.locs.length) {
                $scope.closeGridDialog();
            }
        }
        function showError(num) {
            if (num == $scope.tierData.locs.length) {
                var alertWindow = $mdDialog.alert()
                    .title('failed')
                    .textContent("save failed.")
                    .ok('OK');
                $mdDialog.show(alertWindow);
            }
        }

        $timeout(init, 500);
    }

    controller.$inject = ['$scope', '$mdDialog', '$timeout'];
    return controller;
});

