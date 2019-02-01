'use strict';

define(['lodash', 'angular', 'jquery'], function(_, angular, $) {
	var equipmentTypeController = function($scope, $mdDialog, $http, currWh, whs, lincUtil, gisService){
		$scope.currWh = currWh;
		$scope.whs = whs;
		
		$scope.equipmentTypes = [];
		function init(){
			gisService.getEquipmentType().then(function(data){
				_.forEach(data, function(e){
					fillIconUrl(e);
				});
				$scope.equipmentTypes = data;
			});
		}
		init();
		
		$scope.removeCurrWh = function(e){
			if(e && e.id){
				var id = e.id
				var orgIds = _.cloneDeep(e.orgIds);
				var whId = currWh.id;
				
				var index = orgIds.indexOf(whId);
	        	if(e.common || index > -1){
	        		_.pullAt(orgIds, index);
	        		gisService.updateEquipmentType(id, {
	        			common : false,
	        			orgIds : orgIds
	        		}).then(function(){
	        			e.orgIds = orgIds;
	        			e.common = false;
	        		});
	        	}
			}
		}
		$scope.addCurrWh = function(e){
			if(e && e.id){
				var id = e.id
				var orgIds = _.cloneDeep(e.orgIds || []);
				var whId = currWh.id;
				
				var index = orgIds.indexOf(whId);
				if(index == -1){
					orgIds.push(whId);
					gisService.updateEquipmentType(id, {
						orgIds : orgIds
					}).then(function(){
						e.orgIds = orgIds;
					});
				}
			}
		}
		$scope.removeEquipmentType = function(e){
			if(e && e.id){
				gisService.removeEquipmentType(e.id).then(function(){
					_.remove($scope.equipmentTypes, function(_e){
						return _e.id == e.id;
					});
				});
			}
		}
		$scope.editEquipment = function(e){
			if(e && e.id){
				$scope.newType = $.extend({}, $scope.newTypeCopy, e);
				//fillIconUrl($scope.newType);
			}
		};
		function fillIconUrl(e){
			if(e.iconId){
				e.iconUrl = "/file-app/file-download/" + e.iconId;
			}
			if(e.iconEditId){
				e.iconEditUrl = "/file-app/file-download/" + e.iconEditId;
			}
		}
		$scope.newType = {
				name : null,
				iconId : null,
				iconUrl : null,
				iconEditId : null,
				iconEditUrl : null,
				common : false,
				orgIds : [],
				properties : []
		};
		/*
		$scope.newType = {
				name : "E-Name",
				iconId : "2877",
				iconUrl : "/file-app/file-download/2877",
				iconEditId : "2878",
				iconEditUrl : "/file-app/file-download/2878",
				common : false,
				orgIds : [],
				properties : []
		};
		*/
		$scope.newTypeCopy = _.cloneDeep($scope.newType);
		
		$scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.addOrg = function(id){
        	var t = $scope.newType.orgIds;
        	var index = t.indexOf(id);
        	if(index > -1){
        		_.pullAt(t, index);
        	}else{
        		t.push(id);
        	}
        };
        $scope.delProperty = function(pro){
        	var t = $scope.newType.properties;
        	_.pullAt(t, t.indexOf(pro));
        };
        window.gisUploadImg = $scope.preLoad = function(normal){
        	var id = "#equipment_file_" + (normal ? "1" : "2");
        	var files = $(id)[0].files;
        	if(!files || files.length == 0){
        		return;
        	}
        	var url = normal ? "iconUrl" : "iconEditUrl";
        	var iconId = normal ? "iconId" : "iconEditId";
        	$scope.newType[url] = "assets/img/loading-spinner-grey.gif";
        	uploadImg(files[0], function(photoId){
        		var curr = $scope.newType.currIcon;
        		$scope.newType[url] = "/file-app/file-download/" + photoId;
        		$scope.newType[iconId] = null;
        	},null, true);
        };
		$scope.upload = function(mime, elId, successFun, failFun) {
            var canvas = document.createElement('canvas');
            var img = $('#' + elId);
            canvas.width = "24";
            canvas.height = "24";
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img[0], 0, 0, 24, 24);
            var imgData = canvas.toDataURL(mime);
            uploadImg(imgData, successFun, failFun);
        };

        function uploadImg(data, successFun, failFun, origin) {
            var fd = new FormData();
            fd.append("img", data);
            fd.append("app", "fd");
            fd.append("module", "gis");
            fd.append("service", "pic");
            var url = origin ? "/file-app/file-upload" : "/file-app/img-upload";
            $http.post(url, fd, {
                withCredentials: true,
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity
            }).then(function(resp) {
            	var photoId = resp.data.filesId[0];
            	if(successFun){
            		successFun(photoId);
            	}
            });
        }
        
        $scope.errorInfo = "";
        $scope.saveCompleted = true;
        $scope.save = function(){
        	$scope.errorInfo = "";
        	$scope.saveCompleted = false;
        	
        	var t = $scope.newType;
        	if(!t.iconId){
        		$scope.upload("image/png", "equipment_img_1", function(fid){
        			t.iconId = fid;
        			save();
        		}, function(){
        			fail();
        		});
        	}
        	if(!t.iconEditId){
        		$scope.upload("image/png", "equipment_img_2", function(fid){
        			t.iconEditId = fid;
        			save();
        		}, function(){
        			fail();
        		});
        	}
        	save();
        	function save(){
        		if(!validate()){
        			$scope.saveCompleted = true;
            		return
            	}
        		var obj = getTypeObj();
        		var t = $scope.newType;
        		if(t.id){
        			gisService.updateEquipmentType(t.id, obj).then(function(){
        				success();
					}, function(){
						fail();
					});
        		}else{
        			gisService.saveEquipmentType(obj).then(function(){
        				success();
        			}, function(){
        				fail();
        			});
        		}
        	}
        	function success(){
        		$scope.saveCompleted = true;
    			$scope.reset();
    			$scope.errorInfo = "";
    			init();
        	}
        	function fail(){
        		$scope.saveCompleted = true;
    			$scope.errorInfo = "Save error!";
        	}
        };
        $scope.reset = function(){
        	$scope.newType = _.cloneDeep($scope.newTypeCopy);
        };
        function validate(){
        	var t = $scope.newType;
        	t.name = _.trim(t.name);
        	if(!t.name){
        		$scope.errorInfo = "Name is empty!";
        		return false;
        	}
        	if(!t.iconId || !t.iconEditId){
        		$scope.errorInfo = "Icon is empty or upload fail!";
        		return false;
        	}
        	if(!t.common && t.orgIds.length == 0){
        		$scope.errorInfo = "No warehouse choose!";
        		return false;
        	}
        	$scope.errorInfo = "";
        	return true;
        };
        function getTypeObj(){
        	var obj = {};
        	var r = $scope.newType;
        	_.forEach(["name", "iconId", "iconEditId", "common", "orgIds", "properties"], function(k){
        		obj[k] = r[k];
        	});
        	return obj;
        }
	};
	equipmentTypeController.$inject = ['$scope', '$mdDialog', '$http', 'currWh', 'whs', 'lincUtil', 'gisService'];
	return equipmentTypeController;
});