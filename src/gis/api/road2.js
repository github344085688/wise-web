/**
 * Created by Giroux on 2016/11/24.
 */

'use strict';

define([
    'jquery',
    'lodash'
], function($, _){

    function Road() {
        this.mainRoadType = "Main Road";
        this.subRoadType = "Sub Road";

        // 下面几个参数需要调用的时候赋值
        this.map = null;
        this.overLay = null;

        // 两点间靠近的阈值（屏幕坐标）
        this.threshold = 20;
        this.precision = 6;

        // 主干道样式
        this.mainRoadDrawStyle = {
            strokeColor: '#aaa',
            strokeWeight: 10,
            icons: [{
                repeat: "1px",
                icon: {
                    path: 'M -0.5,0 z',
                    strokeColor: '#FF0000',
                    strokeWeight: 1
                }
            },{
                repeat: "20px",
                icon: {
                    path: 'M 0,-1 0,1',
                    strokeColor: '#FF0000',
                    strokeWeight: 1,
                    scale: 4
                }
            },{
                repeat: "1px",
                icon: {
                    path: 'M 0.5,0 z',
                    strokeColor: '#FF0000',
                    strokeWeight: 1
                }
            }],
            zIndex: 10
        };
        this.mainRoadStyle = {
            strokeColor: '#aaa',
            strokeWeight: 10,
            icons: [{
                repeat: "1px",
                icon: {
                    path: 'M -0.5,0 z',
                    strokeColor: '#0159cf',
                    strokeWeight: 1
                }
            },{
                repeat: "20px",
                icon: {
                    path: 'M 0,-1 0,1',
                    strokeColor: '#0159cf',
                    strokeWeight: 1,
                    scale: 4
                }
            },{
                repeat: "1px",
                icon: {
                    path: 'M 0.5,0 z',
                    strokeColor: '#0159cf',
                    strokeWeight: 1
                }
            }],
            zIndex: 10
        };
        // 次干道样式
        this.subRoadDrawStyle = {
            strokeColor: '#aaa',
            strokeWeight: 6,
            icons: [{
                repeat: "1px",
                icon: {
                    path: 'M -0.5,0 z',
                    strokeColor: '#FF0000',
                    strokeWeight: 1
                }
            },{
                repeat: "1px",
                icon: {
                    path: 'M 0.5,0 z',
                    strokeColor: '#FF0000',
                    strokeWeight: 1
                }
            }],
            zIndex: 9
        };
        this.subRoadStyle = {
            strokeColor: '#aaa',
            strokeWeight: 6,
            icons: [{
                repeat: "1px",
                icon: {
                    path: 'M -0.5,0 z',
                    strokeColor: '#0159cf',
                    strokeWeight: 1
                }
            },{
                repeat: "1px",
                icon: {
                    path: 'M 0.5,0 z',
                    strokeColor: '#0159cf',
                    strokeWeight: 1
                }
            }],
            zIndex: 9
        };

        this.pickRoadStyle = {
            strokeColor: '#4de0f8',
            strokeWeight: 6,
            zIndex: 11
        };
    }

    Road.prototype.numPrecisionFormat = function (num, len) {
        len = len || this.precision;
        var str = num + "";
        return str.substring(0, str.indexOf(".") + len);
    };

    // 校正坐标，处理 chrome 浏览器的光标定位在左上角的问题
    Road.prototype.JzLatlng = function(latlng) {
        if (!this.map) return latlng;

        var navigatorVersion = navigator.userAgent.toLowerCase();
        if (navigatorVersion.indexOf("chrome") == -1) {
            return latlng;
        }

        var scpoint = this.map.getProjection().fromLatLngToPoint(latlng);

        var zFactor = Math.pow(2, this.map.getZoom());
        scpoint.x = scpoint.x * zFactor + 9;
        scpoint.y = scpoint.y * zFactor + 9;

        var newPoint = new google.maps.Point(
            scpoint.x / zFactor,
            scpoint.y / zFactor
        );

        var newLatlng = this.map.getProjection().fromPointToLatLng(newPoint);
        return newLatlng;
    };

    // 经纬度坐标转屏幕坐标
    Road.prototype.latlngToPoint = function (point) {
        if (!this.overLay) return;

        var latlng = new google.maps.LatLng(point);
        var pixel = this.overLay.getProjection().fromLatLngToDivPixel(latlng);
        return pixel;
    };

    // 获取线路的点数组
    Road.prototype.getRoadPoints = function (road) {
        var points = [];
        if (road) {
            var pArr = road.getPath();
            for (var i = 0; i < pArr.length; i++) {
                var point = {};
                point.lng = pArr.getAt(i).lng();
                point.lat = pArr.getAt(i).lat();
                points.push(point);
            }
        }
        return points;
    };

    // 判断两点是否紧挨着
    Road.prototype.isTwoPointNear = function (point1, point2) {
        var pixel1 = this.latlngToPoint(point1);
        var pixel2 = this.latlngToPoint(point2);

        var xdiff = Math.abs(pixel1.x - pixel2.x);
        var ydiff = Math.abs(pixel1.y - pixel2.y);
        if (xdiff < this.threshold && ydiff < this.threshold) {
            return true;
        }

        var pointStr1 = this.numPrecisionFormat(point1.lng) + "," + this.numPrecisionFormat(point1.lat);
        var pointStr2 = this.numPrecisionFormat(point2.lng) + "," + this.numPrecisionFormat(point2.lat);
        if (pointStr1 == pointStr2) {
            return true;
        }
        return false;
    };

    // 获取靠近线的点
    Road.prototype.getClosePoint = function (roads, point) {
        var closePoint = {};
        closePoint.lat = point.lat();
        closePoint.lng = point.lng();

        var line, pedal;
        var distance = 10000000;

        for (var key in roads) {
            var lines = roads[key];
            if (!lines || lines.length == 0) continue;

            for (var i = 0; i < lines.length; i++) {
                var tempLine = lines[i];

                for (var j = 1; j < tempLine.data.points.length; j++) {
                    var tempPedal = this.getPointToLinesPedal(tempLine.data.points[j -1], tempLine.data.points[j], closePoint);
                    var tempDistance = this.getTwoPointsDistance(tempPedal, closePoint);

                    if (tempDistance < distance) {
                        distance = tempDistance;
                        line = tempLine;
                        pedal = tempPedal;
                    }
                }
            }
        }

        if (pedal && this.isTwoPointNear(closePoint, pedal)) {
            closePoint = pedal;
        }
        
        return closePoint;
    };

    // 计算点到线的垂足坐标
    Road.prototype.getPointToLinesPedal = function (lineStartPoint, lineEndPoint, point) {
        var pedal = {};
        if (lineStartPoint.lat == lineEndPoint.lat) {
            pedal.lat = lineStartPoint.lat;
            pedal.lng = point.lng;
        } else if (lineStartPoint.lng == lineEndPoint.lng) {
            pedal.lng = lineStartPoint.lng;
            pedal.lat = point.lat;
        } else {
            var k = (lineStartPoint.lat - lineEndPoint.lat) / (lineStartPoint.lng - lineEndPoint.lng);
            pedal.lng = (k * point.lat + k * k * lineStartPoint.lng - k * lineStartPoint.lat + point.lng) / (1 + k * k);
            pedal.lat = k * (pedal.lng - lineStartPoint.lng) + lineStartPoint.lat;
        }

        var distance1 = this.getTwoPointsDistance(lineStartPoint, point);
        var distance2 = this.getTwoPointsDistance(lineEndPoint, point);

        if (distance1 < distance2) {
            if (this.isTwoPointNear(pedal, lineStartPoint)) {
                pedal = lineStartPoint;
            } else if (!this.isPointInLine(lineStartPoint, lineEndPoint, pedal)) {
                pedal = lineStartPoint;
            }
        } else {
            if (this.isTwoPointNear(pedal, lineEndPoint)) {
                pedal = lineEndPoint;
            } else if (!this.isPointInLine(lineStartPoint, lineEndPoint, pedal)) {
                pedal = lineEndPoint;
            }
        }
        return pedal;
    };

    // 判断点是否在线段里面
    Road.prototype.isPointInLine = function (lineStartPoint, lineEndPoint, point) {
        if (lineStartPoint.lng > lineEndPoint.lng) {
            if (point.lng > lineStartPoint.lng || point.lng < lineEndPoint.lng) {
                return false;
            }

        } else if (point.lng > lineEndPoint.lng || point.lng < lineStartPoint.lng) {
            return false;
        }

        if (lineStartPoint.lat > lineEndPoint.lat) {
            if (point.lat > lineStartPoint.lat || point.lat < lineEndPoint.lat) {
                return false;
            }

        } else if (point.lat > lineEndPoint.lat || point.lat < lineStartPoint.lat) {
            return false;
        }

        return true;
    };

    // 计算两点间角度距离
    Road.prototype.getTwoPointsDistance = function (point1, point2) {
        var distance = Math.sqrt(
            Math.pow((point1.lat - point2.lat), 2) + Math.pow((point1.lng - point2.lng), 2)
        );
        return distance;
    };

    // 根据到某一点的距离进行排序点数组
    Road.prototype.pointsSortByDistance = function (points, point) {
        if (points == null || points.length == 0) return;

        var sort = [];
        for(var i = 0; i < points.length; i++) {
            var obj = {};
            obj.point = points[i];
            obj.distance = this.getTwoPointsDistance(points[i], point);
            sort.push(obj);
        }

        sort = _.sortBy(sort, 'distance');
        var newPoints = [];
        for(var i = 0; i < sort.length; i++) {
            newPoints.push(sort[i].point);
        }

        return newPoints;
    };

    // 计算两条路的交点
    Road.prototype.getTwoRoadsNode = function (road1, road2) {
        if (road1.data.points.length < 2) return null;
        if (road2.data.points.length < 2) return null;

        var x1 = road1.data.points[0].lng;
        var y1 = road1.data.points[0].lat;

        var x2 = road1.data.points[1].lng;
        var y2 = road1.data.points[1].lat;

        var x3 = road2.data.points[0].lng;
        var y3 = road2.data.points[0].lat;

        var x4 = road2.data.points[1].lng;
        var y4 = road2.data.points[1].lat;

        var k1 = 0;
        var k2 = 0;
        if (x1 != x2) {
            k1 = (y1 - y2)/(x1 - x2);
        }
        if (x3 != x4) {
            k2 = (y3 - y4)/(x3 - x4);
        }

        if (k1 == k2) return null;

        var point = {};
        point.lng = (y1 - y3 + k2 * x3 - k1 * x1)/(k2 - k1);
        point.lat = y1 - k1 * x1 + k1 * point.lng;

        var isInLine1 = this.isPointInLine(road1.data.points[0], road1.data.points[1], point);
        var isInLine2 = this.isPointInLine(road2.data.points[0], road2.data.points[1], point);

        var isNearLine1 = this.isTwoPointNear(road1.data.points[0], point);
        if (!isNearLine1) isNearLine1 = this.isTwoPointNear(road1.data.points[1], point);

        var isNearLine2 = this.isTwoPointNear(road2.data.points[0], point);
        if (!isNearLine2) isNearLine2 = this.isTwoPointNear(road2.data.points[1], point);

        if (!isInLine1 && !isNearLine1) {
            return null;
        }

        if (!isInLine2 && !isNearLine2) {
            return null;
        }

        return point;
    };

    // 复制一条路数据
    Road.prototype.newRoadByCopy = function (road, newPath) {
        var style;
        if (road.data.type == this.mainRoadType) {
            style = this.mainRoadDrawStyle;
        }
        if (road.data.type == this.subRoadType) {
            style = this.subRoadDrawStyle;
        }

        var newLine = new google.maps.Polyline(style);
        newLine.setPath(newPath);
        newLine.data = {};
        newLine.data.type = road.data.type;
        newLine.data._style = style;
        newLine.data._isNew = true;
        newLine.data._inEdit = true;
        //newLine.data.name = "NEW";
        newLine.data.points = this.getRoadPoints(newLine);

        return newLine;
    };

    // 获取点集合
    Road.prototype.getRoadsPointSet = function (roads) {
        var pointsSet = [];

        for (var key in roads) {
            var lines = roads[key];
            if (!lines || lines.length == 0) continue;

            for (var i = 0; i < lines.length; i++) {
                var points = lines[i].data.points;
                var point1 = this.numPrecisionFormat(points[0].lng) + "," + this.numPrecisionFormat(points[0].lat);
                var point2 = this.numPrecisionFormat(points[1].lng) + "," + this.numPrecisionFormat(points[1].lat);

                var hasPoint1 = false;
                var hasPoint2 = false;
                for (var j = 0; j < pointsSet.length; j++) {
                    if (pointsSet[j].key == point1) {
                        hasPoint1 = true;
                        pointsSet[j].roads.push(lines[i]);
                    }
                    if (pointsSet[j].key == point2) {
                        hasPoint2 = true;
                        pointsSet[j].roads.push(lines[i]);
                    }
                    if (hasPoint1 && hasPoint2) break;
                }

                if (!hasPoint1) {
                    var obj = {};
                    obj.key = point1;
                    obj.roads = [];
                    obj.roads.push(lines[i]);
                    pointsSet.push(obj);
                }
                if (!hasPoint2) {
                    var obj = {};
                    obj.key = point2;
                    obj.roads = [];
                    obj.roads.push(lines[i]);
                    pointsSet.push(obj);
                }
            }
        }

        return pointsSet;
    };

    // 获取某个点上的道路
    Road.prototype.getPointsRoads = function (pointsSet, point) {
        var pointStr = this.numPrecisionFormat(point.lng) + "," + this.numPrecisionFormat(point.lat);

        for (var i = 0; i < pointsSet.length; i++) {
            if (pointsSet[i].key == pointStr) return pointsSet[i].roads;
        }
        return [];
    };

    // 过滤重叠道路
    Road.prototype.roadIsExist = function (pointsSet, roadStartPoint, roadEndPoint) {
        var roads = this.getPointsRoads(pointsSet, roadStartPoint);
        if (roads.length == 0) {
            roads = this.getPointsRoads(pointsSet, roadEndPoint);
        }
        if (roads.length == 0) return false;

        var k = 0;
        if (roadStartPoint.lat != roadEndPoint.lat) {
            k = (roadStartPoint.lng - roadEndPoint.lng) / (roadStartPoint.lat - roadEndPoint.lat);
        }

        for (var i = 0; i < roads.length; i++) {
            var k1 = 0;
            if (roads[i].data.points[0].lat != roads[i].data.points[1].lat) {
                k1 = (roads[i].data.points[0].lng - roads[i].data.points[1].lng) /
                    (roads[i].data.points[0].lat - roads[i].data.points[1].lat);
            }

            if (this.numPrecisionFormat(k, 1) == this.numPrecisionFormat(k1, 1)) {
                if (this.isPointInLine(roadStartPoint, roadEndPoint, roads[i].data.points[0]) &&
                    this.isPointInLine(roadStartPoint, roadEndPoint, roads[i].data.points[1])) {
                    return true;
                }
                if (this.isPointInLine(roads[i].data.points[0], roads[i].data.points[1], roadStartPoint) &&
                    this.isPointInLine(roads[i].data.points[0], roads[i].data.points[1], roadEndPoint)) {
                    return true;
                }
            }
        }

        return false;
    };

    // 设置道路编辑状态
    Road.prototype.roadSetEdit = function (road) {
        if (road.data._isNew) return;

        if (!road.data.oldPoints) {
            road.data.oldPoints = road.data.points;
        }
        if (road.data.type == this.mainRoadType) {
            road.setOptions(this.mainRoadDrawStyle);
            road.data._style = this.mainRoadDrawStyle;
        }
        if (road.data.type == this.subRoadType) {
            road.setOptions(this.subRoadDrawStyle);
            road.data._style = this.subRoadDrawStyle;
        }
    };

    // 道路切割算法（某条路被另外一条路切割）
    Road.prototype.roadsCut = function (roads, road) {
        var points = [];
        var newroads = [];

        var pointsSet = this.getRoadsPointSet(roads);

        for (var key in roads) {
            var lines = roads[key];
            if (!lines || lines.length == 0) continue;

            for (var i = 0; i < lines.length; i++) {
                var tempLine = lines[i];
                var point = this.getTwoRoadsNode(tempLine, road);
                if (point == null) continue;
                var latLng = new google.maps.LatLng(point);
                var path = tempLine.getPath();

                if (this.isTwoPointNear(tempLine.data.points[0], point)) {
                    if (this.getPointsRoads(pointsSet, tempLine.data.points[0]).length > 1) {
                        points.push(tempLine.data.points[0]);
                    } else {
                        this.roadSetEdit(tempLine);

                        path.setAt(0, latLng);
                        tempLine.data.points = this.getRoadPoints(tempLine);
                        tempLine.data._inEdit = true;
                        points.push(point);
                    }
                    continue;
                }
                if (this.isTwoPointNear(tempLine.data.points[1], point)) {
                    if (this.getPointsRoads(pointsSet, tempLine.data.points[1]).length > 1) {
                        points.push(tempLine.data.points[1]);
                    } else {
                        this.roadSetEdit(tempLine);

                        path.setAt(1, latLng);
                        tempLine.data.points = this.getRoadPoints(tempLine);
                        tempLine.data._inEdit = true;
                        points.push(point);
                    }
                    continue;
                }

                points.push(point);

                var newPath = [];
                newPath.push(latLng);
                newPath.push(path.getAt(1));

                newroads.push(this.newRoadByCopy(tempLine, newPath));

                this.roadSetEdit(tempLine);

                path.setAt(1, latLng);
                tempLine.data.points = this.getRoadPoints(tempLine);
                tempLine.data._inEdit = true;
            }
        }

        if (points.length > 0) {

            for (var i = points.length - 1; i > 0; i--) {
                if (this.isTwoPointNear(road.data.points[0], points[i])
                    || this.isTwoPointNear(road.data.points[1], points[i])
                    || this.isTwoPointNear(points[i - 1], points[i])) {
                    points.splice(i, 1);
                }
            }
            if (this.isTwoPointNear(road.data.points[0], points[0])
                || this.isTwoPointNear(road.data.points[1], points[0])) {
                points.splice(0, 1);
            }

            if (points.length > 1) {
                points = this.pointsSortByDistance(points, road.data.points[0]);
            }

            for (var i = 1; i < points.length; i++) {
                if (this.roadIsExist(pointsSet, points[i - 1], points[i])) {
                    continue;
                }

                var newPath = [];
                newPath.push(new google.maps.LatLng(points[i - 1]));
                newPath.push(new google.maps.LatLng(points[i]));

                newroads.push(this.newRoadByCopy(road, newPath));
            }

            if (points.length > 0) {
                var path = road.getPath();
                if (!this.roadIsExist(pointsSet, road.data.points[0], points[points.length - 1])) {
                    var newPath = [];
                    newPath.push(new google.maps.LatLng(points[points.length - 1]));
                    newPath.push(path.getAt(1));
                    newroads.push(this.newRoadByCopy(road, newPath));
                }

                path.setAt(1, new google.maps.LatLng(points[0]));
                road.data.points = this.getRoadPoints(road);
            }
        }

        return newroads;
    };

    // 从数据创建道路
    Road.prototype.createRoadByData = function (data, style) {
        data._isNew = null;
        data._inEdit = false;
        if (data.oldPoints) {
            data.oldPoints = null;
        }
        if (style) {
            data._style = style;
        } else {
            if (data.type == this.mainRoadType) {
                data._style = this.mainRoadStyle;
            } else if (data.type == this.subRoadType) {
                data._style = this.subRoadStyle;
            }
        }
        
        var road = new google.maps.Polyline(data._style);
        road.data = data;

        var newPath = [];
        newPath.push(new google.maps.LatLng(data.points[0]));
        newPath.push(new google.maps.LatLng(data.points[1]));
        road.setPath(newPath);

        return road;
    };

    Road.prototype.createPickRoad = function (data) {
        return this.createRoadByData(data, this.pickRoadStyle);
    };

    return new Road();
});