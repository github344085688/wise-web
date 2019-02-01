/**
 * Created by Giroux on 2016/11/24.
 */

'use strict';

define([
    'jquery',
    'lodash'
], function($, _){
	/**
	 * 名词定义：
	 * point : [x, y], 路口交叉点, 数组形式存储, x = p[0], y = p[1]
	 * line : [point, point], point数组
	 * road : {
	 * 		id : id
	 * 		path : line
	 * }
	 * roads : [road, ...]
	 */
	var ADSORB_LEN = 0;	//自动吸附距离
	var NEW_ID_PREFIX = "new-road-";
	var pointCount = {};	//{pointStr : {point : [], count : 1}, ...}  count: point被road使用的次数， 等于0时应删除该点
	var removeRoads = [];	//删除的road，new road直接删除， 不保存在此数组
    function Road() {
        this.points = [];
        this.roads = [];
    }
    //设置自动吸附距离
    Road.prototype.setAdsorbLength = function(adsorbLen){
    	ADSORB_LEN = adsorbLen;
    };
    Road.prototype.clearRoad = function(){
    	this.roads = [];
    };
    //设置用于计算的路网/补充路网数据
    Road.prototype.extendRoad = function(roads){
    	var _this = this;
    	if(roads){
    		var changed = false;
    		_.forEach(roads, function(road){
    			var _r = _.find(_this.roads, function(r){
    				r.id == road.id;
    			});
    			if(!_r){
    				_this.roads.push(road);
    				changed = true;
    			}
    		});
    		changed && this.updatePoints();
    	}
    };
    //更新points信息
    Road.prototype.updatePoints = function(){
    	var _this = this;
    	this.points = [];
    	pointCount = {};
    	_.forEach(this.roads, function(road){
    		var path = road.path;
    		_.forEach(path, function(point){
    			var k = pointToStr(point);
    			if(pointCount[k]){
    				pointCount[k].count++;
    			}else{
    				pointCount[k] = {
    						point : point,
    						count : 1
    				};
    				_this.points.push(point);
    			}
    		});
    	});
    }
    /**
     * 添加一条线路
     * return : {
     * 		new : [road, ...],
     * 		remove : [road, ...],
     * 		lastPoint : point
     * }
     */
    Road.prototype.add = function(line){
    	var result = {
    			'new' : null,
    			'remove' : null,
    			'lastPoint' : null
    	};
    	var _this = this;
    	//道路吸附
    	var r_id = [NaN, NaN],
    		_remove = [], 
    		_new = [];
    	_.forEach(line, function(p, i){
    		var adsorb = _this.roadAdsorb(p) || {};
    		if(adsorb.point){
    			line[i] = adsorb.point;
    		}
    		if(adsorb.roadId){
    			r_id[i] = adsorb.roadId;
    		}
    	});
    	//与已有路重合
    	if(r_id[0] == r_id[1]){
    		return result;
    	}
    	//交叉点, 更新road
    	var ps = [];
    	var cutRoad = {};	//{pointStr: [roadId, ..]}
    	var cutRemove = {};	//{pointStr: roadId}
    	_.forEach(_this.roads, function(r){
    		var path = r.path;
    		var p = pointOfIntersection(line, r.path, true);
    		if(p){
    			if(isNear(p, path[0])){
					p = path[0];
				}else if(isNear(p, path[1])){
					p = path[1];
				}else{
					_remove.push(r);
					var new1 = _.clone(r);
					new1.path = [path[0], p];
					new1.latlng = lineToStr(new1.path);
					new1.id = getId();
					var new2 = _.clone(r);
					new2.path = [path[1], p];
					new2.latlng = lineToStr(new2.path);
					new2.id = getId();
					
					_new.push(new1);
					_new.push(new2);
					
					var pStr = pointToStr(p);
					cutRoad[pStr] = [new1.id, new2.id];
					cutRemove[pStr] = [r.id];
				}
    			ps.push(p);
    		}
    	});
    	ps.push(line[0]);
    	ps.push(line[1]);
    	ps = sortUniq(ps);
    	if(ps.length > 0){
    		var front = ps[0], ignore;
    		for(var i=1; i<ps.length; i++){
    			if(!isNear(front, ps[i]) && !isDuplicate([front, ps[i]], this.roads)){
    				_new.push(lineToRoad([front, ps[i]]));
    			}else{
    				//如果ps内的某一点没有被road利用，则被该点切割的旧路恢复（取消删除动作），该点切割后产生的新路取消
    				var frontStr = pointToStr(front);
    				if(frontStr == ignore){
    					_.remove(_new, function(_r){
    						var cut = cutRoad[frontStr] || [];
    						return cut.indexOf(_r.id) > -1;
    					});
    					_.remove(_remove, function(_r){
    						return _r.id == cutRemove[frontStr];
    					});
    				}
    				ignore = pointToStr(ps[i]);
    			}
    			front = ps[i];
    		}
    	}
    	if(_remove.length > 0){
    		result["remove"] = _remove;
    		this.remove(_remove);
    	}
    	if(_new.length > 0){
    		result["new"] = _new;
    		this.extendRoad(_new);
    	}
    	result["lastPoint"] = line[1];
    	return result;
    };
    //删除road, hard: 硬删除，不保存到removeRoads
    Road.prototype.remove = function(roads, hard){
    	var _this = this;
    	var changed = false;
    	_.forEach(roads, function(road){
    		var remove = _.remove(_this.roads, function(r){
    			return r.id == road.id;
    		});
    		if(remove && remove.length > 0){
    			changed = true;
    			if(!hard){
    				_.forEach(remove, function(r){
    					if(!isNew(r)){
    						removeRoads.push(r);
    					}
    				});
    			}
    		}
    	});
    	changed && this.updatePoints();
    };
    //获取被删除的road
    Road.prototype.getRemoveList = function(){
    	return _.uniqBy(removeRoads, function(r){
			return r.id;
		});
    };
    //重置删除列表，如果road不为空，则仅重置该road，否则重置所有
    Road.prototype.resetRemoveList = function(road){
    	if(road){
    		_.remove(removeRoads, function(r){
    			return r.id == road.id;
    		})
    	}else{
    		removeRoads = [];
    	}
    };
    //取消编辑，返回{recover: [road, ...], remove: [road, ...]},	recover: 恢复的路线（原被删除路线）, remove: 从线路里删除的（原新增路线）
    Road.prototype.cancelAll = function(){
    	var recover = _.uniqBy(removeRoads, function(r){
			return r.id;
		});
    	this.extendRoad(recover);
    	removeRoads = [];
    	var _new = [];
    	_.forEach(this.roads, function(road){
    		if(isNew(road)){
    			_new.push(road);
    		}
    	});
    	if(_new.length > 0){
    		this.remove(_new);
    	}
    	return {
    		recover: recover,
    		remove: _new
    	};
    };
    //道路吸附，返回{point: 吸附点, roadId: 吸附的道路id}
    Road.prototype.roadAdsorb = function(point){
    	var roadId, p;
    	_.forEach(this.roads, function(r){
			var path = r.path;
			var near = closestPointOnLine(path, point, true);
			if(isNear(point, near)){
				p = near;
				roadId = r.id;
				if(isNear(point, path[0])){
					p = path[0];
				}else if(isNear(point, path[1])){
					p = path[1];
				}
				return false;
			}
		});
    	return {
    		point: p,
    		roadId : roadId
    	};
    };
    
    //从line创建新road
    function lineToRoad(line){
    	return {
    		id : getId(),
    		path : line,
    		latlng : lineToStr(line)
    	};
    }
    //是否是新路
    function isNew(road){
    	var id = road.id;
    	return _.startsWith(id, NEW_ID_PREFIX);
    }
    //直线上距离直线外一点最近的点, line: 直线上2点[[x1, y1], [x2, y2]]; point: 直线外的点[x3, y3], inner:范围限制在line线段上
	function closestPointOnLine(line, point, inner){
		if(!line || line.length < 2){
			return null;
		}
		var x1 = line[0][0];
		var y1 = line[0][1];
		var x2 = line[1][0];
		var y2 = line[1][1];
		var x3 = point[0];
		var y3 = point[1];
		
		var res = null;
		if(x1 == x2){
			res = [x1, y3];
		}else if(y1 == y2){
			res = [x3, y1];
		}else{
			var a = (y1 -y2) / (x1 - x2);
			var b = y1 - a * x1;
			var c = y3 + x3 / a;
			var x = (c - b) / (a + 1 / a);
			var y = c - x / a;
			res = [x, y];
		}
		if(inner){
			if(!inRange(res, line)){
				var l1 = lenOfLine(res, line[0]),
					l2 = lenOfLine(res, line[1]);
				res = l1 < l2 ? line[0] : line[1];
			}
		}
		return res;
	}
	//两条直线的交点, inner == true时，返回线段交点
	function pointOfIntersection(line1, line2, inner){
		var x, y;
		var x1 = line1[0][0], y1 = line1[0][1],
			x2 = line1[1][0], y2 = line1[1][1],
			x3 = line2[0][0], y3 = line2[0][1],
			x4 = line2[1][0], y4 = line2[1][1];
		
		var a1 = (y1 - y2) / (x1 -x2), a2 = (y3 - y4) / (x3 - x4);
		var b1 = y1 - a1 * x1, b2 = y3 - a2 * x3;
		
		var x = (b2 - b1) / (a1 - a2);
		var y = a1 * x + b1;
		if(isNaN(x) || isNaN(y)){
			return null;
		}
		var p = [x, y];
		if(inner){
			if((!inRange(p, line1) && !isNear(p, line1[0]) && !isNear(p, line1[1]))
					|| (!inRange(p, line2) && !isNear(p, line2[0]) && !isNear(p, line2[1]))){
				p = null;
			}
		}
		return p;
	}
	
	//点到直线的距离,line: 直线上2点[[x1, y1], [x2, y2]]; point: 直线外的点[x3, y3], inner:true时取线段上的点
	function lenOfPointToLine(line, point, inner){
		var p = closestPointOnLine(line, point, inner);
		var dis = lenOfLine(p, point);
		return dis;
	}
	//线段长度
	function lenOfLine(p1, p2){
		return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
	}
    //点是否在线段内, point是已确定在line所在直线上的点
	function inRange(point, line){
		var x1 = line[0][0],
			y1 = line[0][1],
			x2 = line[1][0],
			y2 = line[1][1],
			x = point[0],
			y = point[1];
		var	maxX = Math.max(x1, x2),
			minX = Math.min(x1, x2),
			maxY = Math.max(y1, y2),
			minY = Math.min(y1, y2);
		var res = (x >= minX) && (x <= maxX) && (y >= minY) && (y <= maxY);
		return res;
	}
    //两点距离是否在吸附范围内
	function isNear(p1, p2){
		var len = lenOfLine(p1, p2);
		return len <= ADSORB_LEN;
	}
	//点是否在线的吸附范围内
	function isNearLine(point, line){
		var len = lenOfPointToLine(line, point, true);
		return len <= ADSORB_LEN;
	}
	//line是否和已有roads有重合
	function isDuplicate(line, roads){
		var duplicate = false;
		_.forEach(roads, function(road){
			duplicate = isNearLine(line[0], road.path) && isNearLine(line[1], road.path);
			return !duplicate;
		});
		return duplicate;
	}
	//产生唯一ID, 用于new road
	function getId(){
		return _.uniqueId(NEW_ID_PREFIX);
	}
    //按坐标系排序
    function sortUniq(path){
    	var x = [Infinity, -Infinity], y = [Infinity, -Infinity];
    	_.forEach(path, function(p){
    		x[0] = Math.min(x[0], p[0]);
    		x[1] = Math.max(x[1], p[0]);
    		y[0] = Math.min(y[0], p[1]);
    		y[1] = Math.max(y[1], p[1]);
    	});
    	var index = (x[1] - x[0]) > (y[1] - y[0]) ? 0 : 1;
    	path = _.sortBy(path, function(p){
    		return p[index];
    	});
    	path = _.uniqBy(path, function(p){
    		return p[0] + "-" + p[1];
    	});
    	return path;
    }
    
    function pointToStr(point){
    	return point[0] + "," + point[1];
    }
    
    function lineToStr(line){
    	var str = "";
    	_.forEach(line, function(p){
    		str += pointToStr(p) + " "
		});
    	str = _.trim(str);
		return str;
    }
    
    

    return new Road();
});