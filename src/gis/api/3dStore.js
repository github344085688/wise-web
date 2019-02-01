'use strict';
define(['jquery', 'lodash', 'three', './tween.min', './stats.min' /*, 'css3drenderer', 'stats'*/ ], 
function($, _, THREE) {
	//货架
	var Shelf = function(option) {
		this.id;

		this.object; //货架threejs对象

		this.thickness = 5; //隔板厚度
		this.base_height = 15; //架子脚高度
		this.height = 150; //层高度	y方向
		this.width = 120; //宽度	x方向
		this.length = 100; //长度	z方向
		this.floors = 5; //层数
		this.position = [0, 0];	//地面坐标 (x,z)
		
		this.ctnSize = [120, 130, 100];	//货物尺寸(x, y, z)
		this.ctnPosition = [];	//货物位置 {x: 12, y: 13, z: 14}
		this.currentPos = 0;	//当前可用货位索引

		this.ctnTop = 0; //container堆叠的高度
		
		this.creatShelf(option);
	}
	Shelf.prototype = {
		initCtnSize: function(){
			var d = this.width > this.length;
			var x, y, z;
			if(d){
				z = Math.floor(this.length * 0.9);
				y = Math.floor(z * 1.5);
				x = Math.floor(z * 1.2);
			}else{
				x = Math.floor(this.width * 0.9);
				y = Math.floor(x * 1.5);
				z = Math.floor(x * 1.2);
			}
			//3d库位 货物高度超过货架层高的，强制为层高的80%
			if(this.floors && y > this.height){
				y = Math.floor(this.height * 0.8);
			}
			/*
			//货物高于150cm的，强制为150cm
			if(y > 150){
				y = 150;
			}
			*/
			this.ctnSize = [x, y, z];
		},
		/**
		 * 初始化所有货位位置
		 * 两头留10cm，货位间隔10cm
		 * 2d库位默认堆叠4层
		 */
		initCtnPosition: function(){
			if(this.ctnPosition.length > 0){
				return;
			}
			var d = this.width > this.length;
			var size = this.ctnSize;
			var sx = size[0],
				sy = size[1],
				sz = size[2];
			var x, y, z, max;
			var floor = 1;
			var floors = this.floors || 4;
			var isShelf = this.floors > 0;
			
			if(d){
				y = isShelf ? (this.base_height + sy / 2) : sy / 2;
				x = this.position[0] - this.width / 2 + sx / 2 + 10;
				z = this.position[1];
				max = this.position[0] + this.width / 2 - sx / 2;
				
				while(floor <= floors){
					this.ctnPosition.push({ x : x, y : y, z : z});
					x += sx + 10;
					//上一层
					if(x > max){
						floor++;
						y += isShelf ? this.height : sy;
						x = this.position[0] - this.width / 2 + sx / 2 + 10;
					}
				}
			}else{
				y = isShelf ? (this.base_height + sy / 2) : sy / 2;
				x = this.position[0];
				z = this.position[1] - this.length / 2 + sz / 2 + 10;
				max = this.position[1] + this.length / 2 - sz / 2;
				while(floor <= floors){
					this.ctnPosition.push({ x : x, y : y, z : z});
					z += sz + 10;
					//上一层
					if(z > max){
						floor++;
						y += isShelf ? this.height : sy;
						z = this.position[1] - this.length / 2 + sz / 2 + 10;
					}
				}
			}
		},
		creatShelf: function(option) {
			if (!this.validation(option)) {
				return;
			}
			this.initCtnSize();
			this.initCtnPosition();
			
			var _this = this;
			//this.object = new THREE.Group();
			
			var x = this.position[0];
			var z = this.position[1];

			if (this.floors == 0) { //2D位置
				var plane = creatPlane(this.width, this.length, 1);
				plane.position.set(x, 0, z);
				this.object = plane;
			} else { //3D位置
				/*
				for (var i = 0; i <= this.floors; i++) {
					var plane = creatPlane(this.width, this.length, this.thickness);
					var y = this.base_height + i * this.height;
					plane.position.set(x, y, z);
					this.object.add(plane);
				}
				*/
				this.object = creatBrace(x, z);
			}
			//创建隔板
			function creatPlane(width, length, thickness) {
				var geometry = new THREE.BoxGeometry(width, thickness, length);
				var material = null;
				if (_this.floors) {
					material = new THREE.MeshLambertMaterial({
						color: 0xffffff,
						map: THREE.ImageUtils.loadTexture("assets/img/gis/3d/pic2.jpg")
					});
				} else {
					//2D用蓝色
					material = new THREE.MeshLambertMaterial({
						//color: 0x70B8FF
						color: 0xbdbdbd
					});
				}
				var cube = new THREE.Mesh(geometry, material);

				//产生影子
				cube.castShadow = true;
				//接收影子
				cube.receiveShadow = true;
				return cube;
			}
			//创建支架
			function creatBrace(_x, _z) {
				_x = _x || 0;
				_z = _z || 0;
				var group = new THREE.Group();
				var height = _this.base_height + _this.floors * _this.height + _this.thickness / 2;
				//主支架
				var pos = [{x: _this.width / 2, y: height / 2, z: _this.length / 2, h: height, w: 5, l: 5 }, 
				           {x: -_this.width / 2, y: height / 2, z: _this.length / 2, h: height, w: 5, l: 5 }, 
				           {x: _this.width / 2, y: height / 2, z: -_this.length / 2, h: height, w: 5, l: 5 }, 
				           {x: -_this.width / 2, y: height / 2, z: -_this.length / 2, h: height, w: 5, l: 5}];
				var lookat = [null, null, null, null];
				//支架
				var f = _this.width < _this.length;
				var len = Math.sqrt(_this.height * _this.height + (f ? _this.width * _this.width : _this.length * _this.length));
				var look_height = _this.base_height + len * len / _this.height / 2;

				for (var i = 0; i <= _this.floors; i++) {
					//斜
					var y_pos = _this.base_height + _this.height / 2 + _this.height * i;
					if (i < _this.floors) {
						var y_look = look_height + _this.height * i;
						if(f){
							var x_look = i % 2 == 1 ? _this.width / 2 : -_this.width / 2;
							pos.push({x: 0, y: y_pos, z: _this.length / 2, h: len, w: 4, l: 4});
							pos.push({x: 0, y: y_pos, z: -_this.length / 2, h: len, w: 4, l: 4});
							lookat.push({x: x_look, y: y_look, z: _this.length / 2});
							lookat.push({x: x_look, y: y_look, z: -_this.length / 2});
						}else{
							var z_look = i % 2 == 1 ? _this.length / 2 : -_this.length / 2;
							pos.push({x: _this.width / 2, y: y_pos, z: 0, h: len, w: 4, l: 4});
							pos.push({x: -_this.width / 2, y: y_pos, z: 0, h: len, w: 4, l: 4});
							lookat.push({x: _this.width / 2, y: y_look, z: z_look});
							lookat.push({x: -_this.width / 2, y: y_look, z: z_look});
						}
					}
					//侧
					var y_pos2 = _this.base_height + _this.height * i;
					pos.push({x: 0, y: y_pos2, z: _this.length / 2, h: 5, w: _this.width, l: 5});
					pos.push({x: 0, y: y_pos2, z: -_this.length / 2, h: 5, w: _this.width, l: 5});
					//正
					pos.push({x: _this.width / 2, y: y_pos2, z: 0, h: 5, w: 5, l: _this.length});
					pos.push({x: -_this.width / 2, y: y_pos2, z: 0, h: 5, w: 5, l: _this.length});

					lookat.push(null, null, null, null);
				}
				
				/*
				var repeat = Math.max(parseInt(height / 100 + 0.5), 1);
				var texture = THREE.ImageUtils.loadTexture("assets/img/gis/3d/shelf_brace.jpg");
				//texture.wrapS = texture.wrapT = THREE.RepeatWreapping;
				texture.repeat.set(1, repeat);
				var material = new THREE.MeshLambertMaterial({
					color: 0xffffff,
					map: texture
				});
				*/
				var material = new THREE.MeshLambertMaterial({
					color: 0x70b4f7	//浅蓝
				});
				for (var i = 0; i < pos.length; i++) {
					var geometry = new THREE.BoxGeometry(pos[i].w, pos[i].h, pos[i].l);
					var brace = new THREE.Mesh(geometry, material);
					brace.position.set(pos[i].x + _x, pos[i].y, pos[i].z + _z);
					if (lookat[i]) {
						lookat[i].x += _x;
						lookat[i].z += _z;
						brace.lookAt(lookat[i]);
					}
					//产生影子
					brace.castShadow = true;
					//接收影子
					brace.receiveShadow = true;
					group.add(brace);
				}
				return group;
			}
		},
		//参数验证
		validation: function(option) {
			//必选
			var required = ["floors"];
			//可选
			var optional = ["width", "height", "length", "base_height", "thickness", "position"];

			if (!option) {
				return required.length == 0;
			}

			for (var i = 0; i < required.length; i++) {
				var key = required[i];
				if (option[key] != null && option[key] != undefined) {
					this[key] = option[key];
				} else {
					console.error("Creat Shelf need [" + key + "] parameter");
					return false;
				}
			}
			for (var i = 0; i < optional.length; i++) {
				var key = optional[i];
				if (option[key] != null && option[key] != undefined) {
					this[key] = option[key];
				}
			}
			return true;
		},
		//货架中心坐标
		getCenter: function() {
			var y = this.base_height + this.floors * this.height + this.thickness / 2;
			y = Math.max(y, this.ctnTop);
			return {
				x: 0,
				y: y / 2,
				z: 0
			};
		},
		//获取货架尺寸
		getSize: function() {
			var y = this.base_height + this.floors * this.height + this.thickness / 2;
			y = Math.max(y, this.ctnTop);
			return {
				x: this.width,
				y: y,
				z: this.length
			};
		},
		//计算货架隔板每层高度
		getFloorPosition: function() {
			var data = {};
			data.width = this.width;
			data.length = this.length;
			data.height = [];

			if (this.floors == 0) {
				data.height.push(1);
			} else {
				for (var i = 0; i < this.floors; i++) {
					var h = this.base_height + this.floors * this.height + this.thickness / 2;
					data.height.push(h);
				}
			}
		},
		//是否有货位
		hasSpace: function(){
			return this.currentPos < this.ctnPosition.length;
		},
		//下一货位
		nextSpace: function(){
			var pos = this.hasSpace() ? this.ctnPosition[this.currentPos] : null
			var space =  {
				position : pos,
				size: this.ctnSize
			};
			this.currentPos++;
			return space;
		}
	};

/*	//容器
	var Container = function(option) {

		this.object; //容器threejs对象

		this.children; //子容器

		this.length = 100; //长度	z方向
		this.width = 120; //宽度	x方向
		this.height = 120; //层高度	y方向

		this.position = {
			x: 0,
			y: 0,
			z: 0
		}; //位置

		this.fillColor = 0xffffff; //默认填充色

		this.con_info = {}; //container信息

		this.init(option);
	}
	Container.prototype = {
		init: function(option) {
			if (!this.validation(option)) {
				return;
			}
			var _this = this;
			this.object = createContainer(this.width, this.length, this.height);

			function createContainer(width, length, height) {
				var geometry = new THREE.BoxGeometry(width, height, length);
				var damage = option.con_info.damage;
				if (damage && damage != 1) {
					_this.fillColor = 0xf2dede;
				}

				var cube = new THREE.Mesh(geometry, getMaterial());
				var pos = _this.position;
				cube.position.set(pos.x, pos.y, pos.z);

				if (_this.con_info) {
					cube.name = _this.con_info.container + '';
					cube.userData = _this.con_info;
				}

				cube.userData.fillColor = _this.fillColor;

				//产生影子
				cube.castShadow = true;
				//接收影子
				cube.receiveShadow = true;

				return cube;
			}
			//贴图

			function getMaterial() {
				var img;
				if (_this.con_info.level == 0) { //暂时用这个区分接地容器
					img = {
						top: "assets/img/gis/3d/default_top.png",
						left: "assets/img/gis/3d/default_left.png",
						front: "assets/img/gis/3d/default_front.png"
					};
				} else {
					img = {
						top: "assets/img/gis/3d/default_top2.png",
						left: "assets/img/gis/3d/default_left2.png",
						front: "assets/img/gis/3d/default_front2.png"
					};
				}


				function _m(img_src) {
					return new THREE.MeshLambertMaterial({
						color: _this.fillColor,
						transparent: true,
						map: THREE.ImageUtils.loadTexture(img_src)
					});
				}

				return new THREE.MeshFaceMaterial([_m(img.front), _m(img.front), _m(img.top), _m(img.top), _m(img.left), _m(img.left)]);
			}
		},

		//设置position
		setPosition: function(position) {
			this.position = position;
			this.object.position.set(position.x, position.y, position.z);;
		},
		//参数验证
		validation: function(option) {
			//必选
			var required = [];
			//可选
			var optional = ["width", "height", "length", "position", "con_info"];

			if (!option) {
				return required.length == 0;
			}

			for (var i = 0; i < required.length; i++) {
				var key = required[i];
				if (option[key] != null && option[key] != undefined) {
					this[key] = option[key];
				} else {
					console.error("Creat Container need [" + key + "] parameter");
					return false;
				}
			}
			for (var i = 0; i < optional.length; i++) {
				var key = optional[i];
				if (option[key] != null && option[key] != undefined) {
					this[key] = option[key];
				}
			}
			return true;
		}
	};*/

	//3d库存
	var _3d = function(option) {

		this.dom_el; //3D库存容器DOM标签

		this.renderer;
		this.camera;
		this.scene;
		this.light;

		this.css3drenderer;

		this.clock; // = new THREE.Clock();
		this.stats;
		
		this.range = {x : [0, 20000], y : [0, 2000], z : [0, 20000]};	//视野范围控制
		this.lookat = {x : 0, y : 0, z : 0}; //视野中心坐标
		this.mouse = {}; //鼠标	x,y  鼠标在div内的像素值,用于鼠标移动事件

		this.raycaster = new THREE.Raycaster(); //用于鼠标选中事件
		this.mouse_v2 = new THREE.Vector2(); //记录鼠标Vector2位置,用于鼠标选中事件

		this.locations;	//库存位置
		this.shelves = {};	//所有货架，对应locations， {loc_id : 3dObj}
		this.shelf = null; //货架
		this.containers = []; //container(货物)
		this.ctnByLoc = {};		//container按loc存放, {locId : [ctn, ...]}
		
		this.currCtn;		//当前鼠标所在的container uuid
		this.currLoctionId;		//当前鼠标所在的location
		this.selectedCtns = [];	//当前高亮的container集合

		//========== 废弃 ↓↓↓↓↓↓ =========
		this.selected_container;
		this.clickSelected_ctn; //双击时选中的ctn
		this.rotationCtn;
		this.animateFlag=true;
		this.store_info; //库存数据
		this.childrenCon = []; // 小盒子
		this.toPosition = {}; //container移动的目标位置
		
		this.removeObjArr=[];//被移除的scene中的obj对象格式为：[{},{}]
		this.cloneCanvas;//用来将3dcanvas 转换成2dCanvas，以便生成img使用
		//========== 废弃 ↑↑↑↑↑↑ =========

		this.material;//CTN面素材
		
		this.callbacks = {};	//业务层回调函数，moveoverLocation, moveoutLocation
		if (option) {
			this.init(option);
		}
	}
	_3d.prototype = {
		//初始化
		init: function(option) {
			if (!this.validation(option)) {
				return;
			}
			var _this = this;
			this.animateFlag=true;
			this.containers = []; //container(货物)
			this.childrenCon = []; // 小盒子
			this.toPosition = {}; //container移动的目标位置
			this.removeObjArr=[];//被移除的scene中的obj对象,格式为：[{},{}]
			this.mouse = {}; //鼠标	x,y

			this.raycaster = new THREE.Raycaster(); //用于鼠标选中事件
			this.mouse_v2 = new THREE.Vector2(); //记录鼠标Vector2位置
			var el = $(this.dom_el);
			var width = el.width();
			var height = el.height();

			//初始化渲染器
			if (this.renderer == null) {
				this.renderer = new THREE.WebGLRenderer({
					antialias: true,
					shadowMapEnabled: true
					//domElement : el[0]
				});
				this.renderer.setSize(width, height);
				this.renderer.setClearColor(0xFFFFFF, 1.0);

				el.append(this.renderer.domElement);
				//this.cloneCanvas=$("<canvas></canvas")[0];
				//this.cloneCanvas.width=this.renderer.domElement.width;
				//this.cloneCanvas.height=this.renderer.domElement.height;
				
				/*
				this.stats = new Stats();
		        this.stats.domElement.style.position = 'absolute';
		        this.stats.domElement.style.top = '0px';
		        el.append(this.stats.domElement);
		        */

				/*
				this.css3drenderer = new THREE.CSS3DRenderer();
				this.css3drenderer.setSize(width, height);
				this.css3drenderer.domElement.style.position = 'absolute';
				el.append(this.css3drenderer.domElement);
				*/
			}else{
				el.append(this.renderer.domElement);
			}

			//初始化相机
			if (this.camera == null) {
				//此处为设置透视投影的相机，默认情况下，相机的上方向为Y轴，右方向为X轴，沿着Z轴垂直朝里（视野角：fov； 纵横比：aspect； 相机离视最近的距离：near； 相机离视体积最远距离：far）
				this.camera = new THREE.PerspectiveCamera(45, width / height, 10, 100000);
				this.camera.position.set(100, 0, 0); //设置相机的位置坐标
				this.camera.up.set(0, 1, 0); //设置相机的上
				this.camera.lookAt(this.lookat); //设置视野的中心坐标
				
				//var controls= new THREE.FirstPersonControls(this.camera);
			}

			//初始化场景
			if (this.scene == null) {
				//初始化光源
				var light = new THREE.DirectionalLight(0xFFFFFF, 0.7); //设置平行光DirectionalLight
				light.position.set(1, 1, 1); //光源向量，即光源的位置
				light.castShadow = true; //该光源能产生影子
				light.shadowCameraVisible = true; //产生阴影的相机可见，调试用
				var light2 = new THREE.AmbientLight(0x808080); //环境光

				this.scene = new THREE.Scene();

				this.scene.add(light); //追加光源到场景
				this.scene.add(light2);
				this.scene.fog=new THREE.Fog(0xdddddd, 2, 20000);
			}
			this.removeObjInScene();
			
			
			//this.material=this.getMaterial(this.store_info.containers[0]);
			//材质&贴图和product对应
			this.materials = this.initMaterial();
			
			//仓库范围
			this.buildBase();
			this.buildShelves();
			this.buildContaners();
			
			//this.addContainer(this.store_info.containers, this.store_info.is_three_dimensional);

			//this.initView();

			//this.containers.push(new Container);

			//渲染
			this.render();

			//this.addMouseWheelEvent();
			
			//new mouseEvent(this);
			this.addMouseEvent();

			this.animate(_this);
		},
		
		animate:function(_this) {
			var obj=_this;
			if(this.animateFlag){
				obj.render();
				requestAnimationFrame(function(){
					obj.animate(obj);
				});
			}
		},
		//渲染
		render: function() {
			//TWEEN.update();
			/*THREE.Cache;
			THREE.Cache.clear();*/
			//this.stats.update();
			this.renderer.render(this.scene, this.camera);
			//this.cloneCanvas.getContext('2d').drawImage(this.renderer.domElement, 0, 0);
			//this.css3drenderer.render(this.scene,this.camera);
		},
		//重置画面大小
		resize: function() {
			if(!this.camera || !this.renderer){
				return;
			}
			var el = $(this.dom_el);
			var width = el.width();
			var height = el.height();
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(width, height);
			//this.render();
		},
		//参数验证
		validation: function(option) {
			if (!option) {
				return false;
			}
			var el = $("#" + option.el_id);
			if (el.length > 0) {
				this.dom_el = el[0];
				//信息栏
				el.append("<div id='info1'></div><div id='info'></div>");
			} else {
				alert("Not found element '" + option.el_id + "' for 3D store");
				return;
			}

			//必选
			var required = ["lp_count", "locations", "bound"];
			//可选
			var optional = ["lookat", "callbacks"];

			for (var i = 0; i < required.length; i++) {
				var key = required[i];
				if (option[key] != null && option[key] != undefined) {
					this[key] = option[key];
				} else {
					console.error("Creat 3D store need [" + key + "] parameter");
					return false;
				}
			}
			for (var i = 0; i < optional.length; i++) {
				var key = optional[i];
				if (option[key] != null && option[key] != undefined) {
					this[key] = option[key];
				}
			}
			return true;
		},
		buildBase: function(){
			var bound = this.bound;
			var x1 = bound[0][0];
			var x2 = bound[1][0];
			var y1 = bound[0][1];
			var y2 = bound[1][1];
			var sx = Math.abs(x2 - x1);
			var sz = Math.abs(y2 - y1);
			var px = Math.floor((x2 - x1) / 2);
			var pz = Math.floor((y2 - y1) / 2);
			
			this.addGrid({
				sizeX : sx,
				sizeZ : sz,
				step : 200,
				position : [px, 0, pz]
			});
			
			this.range.x = [Math.min(x1, x2), Math.max(x1, x2)];
			this.range.z = [Math.min(y1, y2), Math.max(y1, y2)];
			
			this.initView();
		},
		buildShelves: function(){
			var _this = this;
			var locs = this.locations || [];
			_.forEach(locs, function(loc){
				var shelf = new Shelf(loc);
				_this.scene.add(shelf.object);
				_this.shelves[loc.id] = shelf;
			});
		},
		buildContaners: function(){
			var _this = this;
			var ctns = this.lp_count || [];
			_.forEach(ctns, function(ctn){
				var qty = ctn.lpQty || 0;
				var locId = ctn.locationId;
				var shelf = _this.shelves[locId];
				if(!shelf){
					return true;
				}
				while(shelf.hasSpace() && qty > 0){
					var space = shelf.nextSpace();
					var pos = space.position;
					var size = space.size;
					var c = _this.putContainer(pos, size, locId);
					c.userData.locationId = locId;
					qty--;
				}
			});
/*
			//测试， 所有位置上放置随机数量的LP
			_.forEach(_this.shelves, function(shelf, locId){
				if(Math.random() > 0.1){
					return true;
				}
				var limit = shelf.ctnPosition.length;
				var qty = Math.floor(Math.random() * limit) + 1;
				while(shelf.hasSpace() && qty > 0){
					var space = shelf.nextSpace();
					var pos = space.position;
					var size = space.size;
					var c = _this.putContainer(pos, size, locId);
					c.userData.locationId = locId;
					qty--;
				}
			});
			*/
		},
		//创建ctn，并添加到场景中
		putContainer: function(pos, size, locId){
			var geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
			var material = this.getMaterial();
			var cube = new THREE.Mesh(geometry, material);
			cube.position.set(pos.x, pos.y, pos.z);
			//产生影子
			cube.castShadow = true;
			//接收影子
			cube.receiveShadow = true;
			this.scene.add(cube);
			this.containers.push(cube);
			if(locId){
				this.ctnByLoc[locId] = this.ctnByLoc[locId] || [];
				this.ctnByLoc[locId].push(cube);
			}
			return cube;
		},
		//初始化视野,将货架调整到视野中心
		initView: function() {
			var xr = this.range.x;
			var yr = this.range.y;
			var zr = this.range.z;
			
			this.lookat = {
					x : Math.floor(xr[0] + (xr[1] - xr[0]) / 3),
					y : Math.floor(yr[0] + (yr[1] - yr[0]) / 3), 
					z : Math.floor(zr[0] + (zr[1] - zr[0]) / 2)
			};
			var position = {
	                x : Math.floor(xr[0] + (xr[1] - xr[0]) * 2 / 3),
	                y : Math.floor(yr[0] + (yr[1] - yr[0]) * 2 / 3),
	                z : Math.floor(zr[0] + (zr[1] - zr[0]) / 2)
			};
			
			this.camera.position.set(position.x, position.y, position.z);
			this.camera.lookAt(this.lookat);
			/*
			if (!this.shelf) {
				return;
			}
			var lookat = this.shelf.getCenter();
			var cam_pos = this.camera.position;
			var shelf_size = this.shelf.getSize();
			var aspect = this.camera.aspect; //相机纵横比
			var obj_height = shelf_size.y / 2;
			if (shelf_size.z / shelf_size.y > aspect) {
				obj_height = shelf_size.z / aspect;
			}
			var distance = obj_height * 1.5 / Math.tan(Math.PI * 22.5 / 180);
			var x = distance + lookat.x;
			var y = Math.max(lookat.y, distance * Math.tan(Math.PI / 12)); //保证相机到货架地面俯角最小为15°
			var z = lookat.z;
			this.lookat = lookat;
			this.camera.position.set(x, y, z);
			this.camera.lookAt(this.lookat);
			//this.render();
			*/
		},
		//加载模型
		loadModel: function() {
			var _this = this;
			var loader = new THREE.ColladaLoader();
			var url = "./3d_model/avatar/avatar.dae";
			//url = "./3d_model/shelf/shelf.dae";
			loader.load(url, function(collada) {

				/*collada.scene.traverse( function ( child ) {
					if ( child instanceof THREE.SkinnedMesh) {
						var animation = new THREE.Animation( child, child.geometry.animation );
						animation.play();
					}
				});*/
				_this.scene.add(collada.scene);
				//_this.render();
				//animate();
			});
		},
		/**
		 * 添加网格
		 * options : 
		 * 		color : 颜色，默认0x000000
		 * 		opacity : 透明度，默认0.2
		 * 		sizeX : x方向长度
		 * 		sizeZ : z方向长度
		 * 		step : 网格间隔，>0有效，默认取50左右的长度等分值
		 * 		position : 中心位置,	 默认[0, 0, 0]
		 */
		addGrid: function(options) {
			options = $.extend({
				color: 0x000000,
				opacity: 0.2,
				position: [0, 0, 0],
				step: 50
			}, options);
			//没有尺寸退出
			if(!options.sizeX || options.sizeX < 0 || !options.sizeZ || options.sizeZ < 0){
				return;
			}
			var sizeX = Math.floor(options.sizeX / 2 + 0.5);
			var sizeZ = Math.floor(options.sizeZ / 2 + 0.5);
			var px = options.position[0];
			var py = options.position[1];
			var pz = options.position[2];
			
			var geometry = new THREE.Geometry();
			//坐标系
			geometry.vertices.push(new THREE.Vector3(0, 0, 0));
			geometry.vertices.push(new THREE.Vector3(10000, 0, 0));
			geometry.vertices.push(new THREE.Vector3(0, 0, 0));
			geometry.vertices.push(new THREE.Vector3(0, 10000, 0));
			geometry.vertices.push(new THREE.Vector3(0, 0, 0));
			geometry.vertices.push(new THREE.Vector3(0, 0, 10000));
			
			geometry.vertices.push(new THREE.Vector3(px - sizeX, py, pz - sizeZ));
			geometry.vertices.push(new THREE.Vector3(px - sizeX, py, pz + sizeZ));
			geometry.vertices.push(new THREE.Vector3(px + sizeX, py, pz - sizeZ));
			geometry.vertices.push(new THREE.Vector3(px + sizeX, py, pz + sizeZ));
			
			geometry.vertices.push(new THREE.Vector3(px - sizeX, py, pz - sizeZ));
			geometry.vertices.push(new THREE.Vector3(px + sizeX, py, pz - sizeZ));
			geometry.vertices.push(new THREE.Vector3(px - sizeX, py, pz + sizeZ));
			geometry.vertices.push(new THREE.Vector3(px + sizeX, py, pz + sizeZ));
			
			var step = options.step;
			if(step > 0){
				//等分长度
				var num = Math.floor(sizeX * 2 / step + 0.5);
				if(num > 1){
					var _step = Math.floor(sizeX * 2 / num);
					var start = px - sizeX + _step;
					var end = px + sizeX - _step;
					for(var i = start; i <= end; i += _step){
						geometry.vertices.push(new THREE.Vector3(i, py, pz - sizeZ));
						geometry.vertices.push(new THREE.Vector3(i, py, pz + sizeZ));
					}
				}
				num = Math.floor(sizeZ * 2 / step + 0.5);
				if(num > 1){
					var _step = Math.floor(sizeZ * 2 / num);
					var start = pz - sizeZ + _step;
					var end = pz + sizeZ - _step;
					for(var i = start; i <= end; i += _step){
						geometry.vertices.push(new THREE.Vector3(px - sizeX, py, i));
						geometry.vertices.push(new THREE.Vector3(px + sizeX, py, i));
					}
				}
			}
			//网格样式
			var material = new THREE.LineBasicMaterial({
				color: 0x000000,
				opacity: 0.2,
				transparent: true
			});
			//画出线
			var line = new THREE.Line(geometry, material, THREE.LinePieces);
			line.receiveShadow = true;
			this.scene.add(line);
		},
		//添加container
		addContainer: function(containers, is_three_dimensional) {
			var _this=this;
			var shelf = this.shelf;
			//var pos = this.shelf.getFloorPosition();
			//var ys = pos.height;
			var len = shelf.length;
			var height = shelf.height;
			var floor = 0;
			var base_y = shelf.base_height + shelf.thickness / 2;
			var z = len / 2; //初始位置在最左边

			for (var i = 0; i < containers.length; i++) {
				var con = _this.createContainer({
					con_info: containers[i]
				});
				//超出货架往上加一层
				if (z - con.geometry.parameters.depth < -len / 2) {
					floor++;
					z = len / 2;
				}
				z -= con.geometry.parameters.depth / 2 + 5;
				var y = base_y + floor * height + con.geometry.parameters.height / 2;
				//2D货架叠加放置	暂时考虑所有container尺寸一样
				if (shelf.floors == 0) {
					y = con.geometry.parameters.height * (floor + 1 / 2);
					shelf.ctnTop = con.geometry.parameters.height * (floor + 1);
				}
				
				//3D location详细位置算法
				if(is_three_dimensional==1 && containers[i].slc_position_detail){
					var _pos_detail = containers[i].slc_position_detail.split("-");
					var _floor = parseInt(_pos_detail[1])-1;
					var _col = parseInt(_pos_detail[2]);
					
					y = base_y + _floor * height + con.geometry.parameters.height / 2;
					z = -len / 2 + (con.geometry.parameters.depth) * (_col - 0.5) + _col * 5;
				}
				
				var position = {
					x: 0,
					y: y,
					z: z
				};
				con.position.set(position.x, position.y, position.z);
				z -= con.geometry.parameters.depth / 2; //z挪到container右侧
				/*if (con.object) {*/
					this.scene.add(con);
					this.containers.push(con);
				/*}*/
			}
			//先计算好所有position
			function calcPosition() {
				var shelf = this.shelf;
				//var pos = this.shelf.getFloorPosition();
				//var ys = pos.height;
				var len = shelf.length;
				var height = shelf.height;
				var floor = 0;
				var base_y = shelf.base_height + shelf.thickness / 2;
				var z = len / 2; //初始位置在最左边
			}
		},
		createContainer: function(option) {
			
			var _this = this;
			/*var position = {
				x: 0,
				y: 0,
				z: 0
			}; //位置*/
			var fillColor = 0xffffff; //默认填充色
			/*var length = 100; //长度	z方向
			var width = 120; //宽度	x方向
			var height = 120; //层高度	y方向*/
			var CTNDt={'length':100,'width':120,'height':120,'position':{
					x: 0,
					y: 0,
					z: 0
				}};
			$.extend(CTNDt, option);
			var CTN = _createContainer(CTNDt.width, CTNDt.length, CTNDt.height);

			function _createContainer(width, length, height) {
				var geometry = new THREE.BoxGeometry(width, height, length);
				var damage = option.con_info.damage;
				if (damage && damage != 1) {
					//fillColor = 0xf2dede;
					fillColor = 0x777777;	//damage的container变暗
				}
				//var materialClone=_this.material.clone();
				//根据pc_id确定贴图
				var materialClone=_this.getMaterial(option.con_info.products[0].pc_id);
				materialClone.uuid=option.con_info.container;
				var cube = new THREE.Mesh(geometry, materialClone);
				var pos = CTNDt.position;
				cube.position.set(pos.x, pos.y, pos.z);

				if (option.con_info) {
					cube.name = option.con_info.container + '';
					cube.userData = option.con_info;
				}
				_this.setContaierColor(cube, fillColor);
				cube.userData.fillColor = fillColor;

				//产生影子
				cube.castShadow = true;
				//接收影子
				cube.receiveShadow = true;

				return cube;
			}
			/*//贴图

			function getMaterial() {
				var img;
				if (option.con_info.level == 0) { //暂时用这个区分接地容器
					img = {
						top: "assets/img/gis/3d/default_top.png",
						left: "assets/img/gis/3d/default_left.png",
						front: "assets/img/gis/3d/default_front.png"
					};
				} else {
					img = {
						top: "assets/img/gis/3d/default_top2.png",
						left: "assets/img/gis/3d/default_left2.png",
						front: "assets/img/gis/3d/default_front2.png"
					};
				}


				function _m(img_src) {
					return new THREE.MeshLambertMaterial({
						color: fillColor,
						transparent: true,
						map: THREE.ImageUtils.loadTexture(img_src)
					});
				}

				return new THREE.MeshFaceMaterial([_m(img.front), _m(img.front), _m(img.top), _m(img.top), _m(img.left), _m(img.left)]);
			}*/
			return CTN;
		},
		//贴图
		/*
		getMaterial :function (con_info) {
			var img;
			var _this=this;
			var fillColor = 0xffffff; //默认填充色
			var damage = con_info.damage;
			if (damage && damage != 1) {
				fillColor = 0xf2dede;
			}
			
			if (con_info.level == 0) { //暂时用这个区分接地容器
				img = {
					top: "assets/img/gis/3d/default_top.png",
					left: "assets/img/gis/3d/default_left.png",
					front: "assets/img/gis/3d/default_front.png"
				};
			} else {
				img = {
					top: "assets/img/gis/3d/default_top2.png",
					left: "assets/img/gis/3d/default_left2.png",
					front: "assets/img/gis/3d/default_front2.png"
				};
			}

			var lambertMaterial=new THREE.MeshLambertMaterial({
					color: fillColor,
					transparent: true
				});
			function _m(img_src) {
				var clone_material= lambertMaterial.clone();
				clone_material.map=THREE.ImageUtils.loadTexture(img_src,'',function(){_this.render()});
				return clone_material;
			}
			var front=_m(img.front);
			var top= _m(img.top);
			var left= _m(img.left);
			return new THREE.MeshFaceMaterial([front, front, top, top, left, left]);
		},
		*/
		//获取产品材质和贴图
		getMaterial: function(pc_id){
			var material;
			if(this.materials[pc_id]){
				material = this.materials[pc_id].clone();
			}else{
				material =  this.materials["0"].clone();
			}
			return material;
		},
		//初始化产品材质和贴图
		initMaterial: function(cons_info){
			var _this = this;
			var materials = {};
			var imgs = {
					"0" : {//default
						top: "assets/img/gis/3d/default_top.png",
						left: "assets/img/gis/3d/default_left.png",
						front: "assets/img/gis/3d/default_front.png"
					}
			};
			
			var lambert = new THREE.MeshLambertMaterial({
				color: 0xffffff,
				transparent: true
			});
			materials[0] = _material(imgs[0]);
			/*
			for(var i=0; i<cons_info.length; i++){
				var con = cons_info[i];
				var pc_id = con.products[0].pc_id;
				
				if(imgs[pc_id] && !materials[pc_id]){
					materials[pc_id] = _material(imgs[pc_id]);
				}
			}
			*/
			//=====================
			function _img(img_src) {
				var clone_material= lambert.clone();
				clone_material.map=THREE.ImageUtils.loadTexture(img_src,'',function(){_this.render()});
				return clone_material;
			}
			function _material(img){
				var default_img = "assets/img/gis/3d/default.png";
				var front = img.front ? _img(img.front) : _img(default_img);
				var top= img.top ? _img(img.top) : _img(default_img);
				var left= img.left ? _img(img.left) : _img(default_img);
				return new THREE.MeshFaceMaterial([front, front, top, top, left, left]);
			}
			
			return materials;
		},
		/*
		//获取所有container THREE.JS对象
		getContainers: function() {
			var cons = this.containers;
			var objs = [];
			if (cons && cons.length > 0) {
				for (var i = 0; i < cons.length; i++) {
					if (cons[i].object) {
						objs.push(cons[i].object);
					}
				}
			}
			cons = this.obj;
			if (cons && cons.length > 0) {
				for (var i = 0; i < cons.length; i++) {
					if (cons[i].object) {
						objs.push(cons[i].object);
					}
				}
			}
			return objs;
		},
		*/
		
		//取消选中container
		unselect: function() {
			var cons = this.getContainers();

			var select = this.selected_container;
			for (var i = 0; i < cons.length; i++) {
				var con = cons[i];
				if (con.userData.trigger) {
					var color = 0xffffff;
					if (select && select.uuid == con.uuid) {
						color = 0xffaaaa;
					}
					var mat = con.material;
					this.setContaierColor(mat, color);
					/*
					if (mat instanceof THREE.MeshFaceMaterial) {
						for (var j = 0; j < mat.materials.length; j++) {
							mat.materials[j].color.set(color);
						}
					} else {
						mat.color.set(color);
					}
					*/
					con.userData.trigger = false;
				}
			}
			//this.render();
			$(this.dom_el).find("#info1").children().remove();
		},
		//添加鼠标滚轮事件
		addMouseWheelEvent: function() {
			var _this = this;

			_this.dom_el.oncontextmenu = function() {
				return false;
			}

			function onMouseWheel(e) {
				var far = 1; //相机远离物体，缩小
				e = e || window.event;
				if (e.wheelDelta) { //IE/Opera/Chrome
					if (e.wheelDelta > 0) { //前滚,放大
						far = -1;
					}
				} else if (e.detail) { //Firefox
					if (e.detail < 0) { //前滚,放大
						far = -1;
					}
				}
				_this.cameraFarAway(0.1 * far);
			}
			/*注册事件*/
			if (document.addEventListener) {
				_this.dom_el.addEventListener('DOMMouseScroll', onMouseWheel, false); //Firefox
			}
			_this.dom_el.onmousewheel = onMouseWheel; //IE/Opera/Chrome

		},
		addMouseEvent:function(){
			var _this = this;
			var selectColor = 0xffaaaa;
			var clickColor = 0xff6666;
			_this.addMouseWheelEvent();
			//鼠标移动事件（移动到container上）
			this.dom_el.addEventListener('mousemove', mouseOver, false);
			
			//鼠标放到对象上
			function mouseOver(event) {
				var x = event.layerX;
				var y = event.layerY;

				_this.mouse_v2.x = (event.layerX / _this.dom_el.clientWidth) * 2 - 1;
				_this.mouse_v2.y = -(event.layerY / _this.dom_el.clientHeight) * 2 + 1;

				_this.raycaster.setFromCamera(_this.mouse_v2, _this.camera);
				//renderSelectedContainer(event);
				mouseOvertObj(event);
			}
			function mouseOvertObj(){
				if(_this.containers.length == 0){
					return;
				}
				var intersects = _this.raycaster.intersectObjects(_this.containers);
				var ctn, locId;
				var unselect = false;	//移出当前loc取消选中
				if(intersects.length > 0){
					ctn = intersects[0].object;
					locId = ctn.userData.locationId;
					if(locId != _this.currLoctionId){
						unselect = true;
					}
				}
				if(intersects.length == 0){
					unselect = true;
				}
				if(unselect){
					unselectObj();
				}
				selectObj(ctn, locId);
			}
			function selectObj(ctn, locId){
				_this.selectedCtns = _this.ctnByLoc[locId] || [];
				if(locId){
					_this.setContaierColorByLoc(locId, selectColor);
					_this.callbacks.moveoverLocation && _this.callbacks.moveoverLocation(locId);
				}
				//_this.selectedCtns.push(ctn);
				var uuid = ctn ? ctn.uuid : null;
				_this.currCtn = uuid;
				_this.currLoctionId = locId;
			}
			function unselectObj(){
				_this.setContaierColorByLoc(_this.currLoctionId, 0xffffff);
				_this.currCtn = null;
				_this.currLoctionId = null;
				_this.callbacks.moveoutLocation && _this.callbacks.moveoutLocation();
			}
			// ============================================================
			// 双击事件
			//this.dom_el.addEventListener('dblclick', dblclickContainer, false);
			function mouseDbClick(event){
				//左键
				if (event.buttons != 0) {
					return;
				}
				if (_this.containers.length == 0) {
					return;
				}
				var intersects = _this.raycaster.intersectObjects(_this.containers);
				var ctn, locId;
				var unselect = false;	//仅点击其它loc时才取消旧的选中
				if(intersects.length > 0){
					ctn = intersects[0].object;
					locId = ctn.userData.locationId;
					if(locId != _this.currLoctionId){
						unselect = true;
					}
				}
				if(unselect){
					unselectObj();
				}
				selectObj(ctn, locId);
			}
			
			function dblclickContainer(event) {
				//左键
				if (event.buttons != 0) {
					return;
				}
				var cons = _this.getContainers();
				if (cons.length == 0) {
					return;
				}
				var render = false; //标记是否需要渲染，去掉鼠标移动过程中不必要的渲染
				var intersects = _this.raycaster.intersectObjects(cons);
				var select = _this.selected_container;
				if (!select || intersects.length == 0) {
					return false;
				};
				
				var level = select.userData.level; //container里的层级
				$(_this.dom_el).find("#info1").hide();
				var info1 = $(_this.dom_el).find("#info");
				if (level == 0) {
					//info1.html('');
				}
				//_this.showContainerInfo(select,intersects,info1);
				var min = select.userData.children; // 小盒子的个数
				//双击时将ctn6个面加上颜色，并把上一次选择的颜色还原
				if (_this.clickSelected_ctn) {
					var color = _this.clickSelected_ctn.userData.fillColor;
					_this.setContaierColor(_this.clickSelected_ctn, color);
					
				}
				var selectColor = 0xff6666;
				_this.setContaierColor(intersects[0].object, selectColor);
				_this.clickSelected_ctn = intersects[0].object;
				//_this.render();
				if (min != undefined) {
					//var lastEle = $("#context_3d").children().last();
					//var clone=lastEle.find("canvas");
					//var clone=$("#3d_canvas");

					var img=new Image;
					img.src=_this.cloneCanvas.toDataURL();
					var scrollWidth=0;
					if(select.userData.level==0){
						$("#canvasImgList_3d").prepend(img);
					}else{
						var ele=$("<li></li>").append('<span>level:'+level+'</span>').append(img);
						$("#childrenCTNList>ul").append(ele);
						scrollWidth=$("#childrenCTNList>ul")[0].clientWidth>=$("#childrenCTNList>ul")[0].scrollWidth?0:$("#childrenCTNList>ul")[0].scrollWidth;
						
					}
					if($("#zoomCanvasImgDiv").is(":hidden")){
						$("#zoomCanvasImgDiv").show('1000');
					}
					var dt=_this.removeObjInScene();
					dt['clickSelected_ctn']=_this.clickSelected_ctn;
					_this.removeObjArr.push(dt);
					_this.containers=[];

					var returnObj=_this.createChildrenCtn(min);
					var group=returnObj.group;
					_this.scene.add(group);
					//_this.render();
					_this.containers=returnObj.childrenCTN;
					_this.childrenCTNAnimation(returnObj.childrenCTN);
					_this.camera.lookAt({x: 0, y: 0, z: 0}); //设置视野的中心坐标
					_this.lookat={x: 0, y: 0, z: 0};
					
					$(img).click(function(evt){
						var _target=$(evt.target);
						var _targetParent=_target.parent();
						var _index=0;
						if(_targetParent.attr('id')=='canvasImgList_3d'){
							_target[0].parentNode.removeChild(_target[0]);
							_target.nextUntil().empty();
							$("#zoomCanvasImgDiv").hide('1000');
						}else{
							_index=_targetParent.parent().children().index(_targetParent);
							_targetParent.nextUntil().empty().remove();
							_targetParent[0].parentNode.removeChild(_targetParent[0])
							_index=_index+1;

						}
						_this.removeObjInScene();
						var data=_this.removeObjArr[_index];
						_this.removeObjArr.splice(_index,_this.removeObjArr.length);
						
						var addObj=data.removeCTN;
						for(var key in addObj){
							_this.scene.add(addObj[key]);
						}
						_this.camera.position.set(data.cameraPosition.x,data.cameraPosition.y,data.cameraPosition.z);
						_this.camera.lookAt(data.lookat);
						_this.lookat=data.lookat;
						_this.containers=data.containers;
						//_this.render();
						if(_this.clickSelected_ctn.uuid!=data.clickSelected_ctn.uuid){
							var color = _this.clickSelected_ctn.userData.fillColor;
							_this.setContaierColor(_this.clickSelected_ctn, color);
							_this.clickSelected_ctn=data.clickSelected_ctn;
							var selectColor = 0xff6666;
							_this.setContaierColor(_this.clickSelected_ctn, selectColor);
						}
						
					});
					$("#childrenCTNList")[0].scrollLeft=scrollWidth;	
				}
			}
			//=======================================================================
			//鼠标拖动事件
			this.dom_el.addEventListener('mousedown', onDocumentMouseDown, false);

			function onDocumentMouseMove(event) {
				var x = event.layerX;
				var y = event.layerY;
				var move_x = x - _this.mouse.x;
				var move_y = y - _this.mouse.y;
				if (move_x == 0 && move_y == 0) {
					return;
				}

				var abs = Math.abs(move_x / move_y);

				var move_on_x = abs > 1; //水平移动
				var move_right = move_x > 0; //鼠标右移
				var move_up = move_y < 0; //鼠标上移

				var clockwise = move_on_x ? move_right : move_up; //是否顺时针

				if (!event.ctrlKey && event.buttons == 2) {
					//右键时平移相机
					var sum = Math.abs(move_x) + Math.abs(move_y);
					var hw = move_x / sum;
					var vw = -move_y / sum;
					_this.cameraMove(hw, vw);
				} else if (!event.ctrlKey && event.buttons == 1) {
					//转动相机
					//move_on_x=false;
					_this.cameraRound(move_on_x, clockwise);
				} else if (event.ctrlKey && event.buttons == 1) {
					//垂直移动相机
					!move_on_x && _this.cameraElevate(move_up);
				}

				_this.mouse.x = x;
				_this.mouse.y = y;
			}

			function onDocumentMouseDown(event) {
				event.preventDefault();

				_this.dom_el.addEventListener('mousemove', onDocumentMouseMove, false);
				_this.dom_el.addEventListener('mouseup', onDocumentMouseUp, false);
				_this.dom_el.addEventListener('mouseout', onDocumentMouseOut, false);

				_this.mouse.x = event.layerX;
				_this.mouse.y = event.layerY;
			}

			function onDocumentMouseUp(event) {
				//鼠标释放卸载
				_this.dom_el.removeEventListener('mousemove', onDocumentMouseMove, false);
				_this.dom_el.removeEventListener('mouseup', onDocumentMouseUp, false);
				_this.dom_el.removeEventListener('mouseout', onDocumentMouseOut, false);
			}

			function onDocumentMouseOut(event) {
				//鼠标移出时卸载
				_this.dom_el.removeEventListener('mousemove', onDocumentMouseMove, false);
				_this.dom_el.removeEventListener('mouseup', onDocumentMouseUp, false);
				_this.dom_el.removeEventListener('mouseout', onDocumentMouseOut, false);
			}
		},
		/**
		 *改变ctn颜色
		 */
		setContaierColor: function(obj, color) {
			var mat = obj.material;
			//6面不同
			if (mat.isMultiMaterial) {
				for (var i = 0; i < mat.materials.length; i++) {
					mat.materials[i].color.set(color);
				}
			} else { //6面相同
				mat.color.set(color);
			}
			//this.render();
		},
		setContaierColorByLoc: function(locId, color){
			var _this = this;
			var ctns = this.ctnByLoc[locId];
			if(ctns){
				_.forEach(ctns, function(ctn){
					_this.setContaierColor(ctn, color);
				});
			}
		},
		//移除scene中的obj对象
		removeObjInScene:function(){
			var objectArray=this.scene.children;
			var _index=0;
			var removeObjJson=new Array();
			while(objectArray.length>_index){
				var obj=objectArray[_index];
				if(obj.type=='Group' || obj.type=='Mesh'){
					removeObjJson.push(obj);
					this.scene.remove(obj);
				}else{
					_index++;
				}
			}
			var cameraPosition=this.camera.position;
			var lookat=this.lookat;
			//this.render();
			return {'removeCTN':removeObjJson,'cameraPosition':cameraPosition,'lookat':lookat,'containers':this.containers};
		},
		/**
		*从containers里拿到CTN Object对象
		*/
		getContainers:function(){
			/*
			var cons = new Array();
			for(var i=0;i<this.containers.length;i++){
				cons.push(this.containers[i]);
			}
			return cons;
			*/
			return this.containers || [];
		},
		//相机远离		speed:移动速度，相对于camera_position到lookAt_position距离的百分比; >0远离，<0靠近。
		cameraFarAway: function(speed) {
			var far = this.camera.far; //最远距离
			var near = this.camera.near; //最近距离

			var p = this.camera.position;
			var l = this.lookat;

			var x = p.x + (p.x - l.x) * speed;
			var y = p.y + (p.y - l.y) * speed;
			var z = p.z + (p.z - l.z) * speed;

			var len = Math.sqrt((x - l.x) * (x - l.x) + (y - l.y) * (y - l.y) + (z - l.z) * (z - l.z));
			if (len < near || len > far) {
				return;
			}
			//控制移动范围
			if(!this.inViewRange(x, y, z)){
				return;
			}
			p.set(x, y, z);
			//this.render();
		},
		//相机绕视野中心转动		horizontal:true 绕Y轴转动（水平转动），false 绕Z轴转动（上下转动）；	 clockwise:是否逆时针方向旋转（沿指定轴负方向观察）
		cameraRound: function(horizontal, clockwise) {
			var p = this.camera.position;
			var l = this.lookat;
			//相机相对视野中心的坐标
			var x = p.x - l.x;
			var y = p.y - l.y;
			var z = p.z - l.z;
			//转动后的相机相对坐标
			var _x, _y, _z;

			var len; //相机到视野中心距离
			var m, n; //相机和原点所在平面,以视野中心为原点
			m = Math.sqrt(x * x + z * z);
			n = Math.abs(y);
			len = Math.sqrt(m * m + n * n);
			
			var r1 = Math.atan(n / m);	//len和m夹角
			var r2 = Math.atan(x / z);	//m和z夹角
			//y轴负半轴调整角度
			if(y < 0){
				r1 = -r1;
			}
			//第2、3象限调整角度
			if((r2 < 0 && x > 0) || (r2 > 0 && z < 0)){
				r2 += Math.PI;
			}
			if (horizontal) { //水平转动，m在xz平面转动
				var addFlag = clockwise ? -1 : 1;
				r2 += addFlag * Math.PI / 80;
				_x = m * Math.sin(r2);
				_y = y;
				_z = m * Math.cos(r2);
			} else { //上下转动，l在mn平面转动
				var addFlag = clockwise ? -1 : 1;
				r1 += addFlag * Math.PI / 100;
				var _m = Math.abs(len * Math.cos(r1));
				
				_x = _m * Math.sin(r2);
				_y = len * Math.sin(r1);
				_z = _m * Math.cos(r2);
				if(r1 > Math.PI / 2 || r1 < 0){
					return;
				}
			}
			var px = l.x + _x;
			var py = l.y + _y;
			var pz = l.z + _z;
			
			//控制移动范围
			if(!this.inViewRange(px, py, pz)){
				return;
			}
			p.x = px;
			p.y = py;
			p.z = pz;

			this.camera.lookAt(l);
			//this.render();
		},
		//相机平移		horizontal:是否水平移动; positive：是否正方向（向右或向上为正方向）。距离默认为货架长或高的百分比，禁止将物体移动到视野外
		//horWeight, verWeight : 水平和垂直方向移动比重，建议取值[-1, 1]
		cameraMove: function(horWeight, verWeight) {
			var p = this.camera.position;
			var l = this.lookat;
			//相机相对视野中心的坐标
			var x = p.x - l.x;
			var y = p.y - l.y;
			var z = p.z - l.z;
			//转动后的相机相对坐标
			var _x = x, _z = z;
			//相机在xz平面投影与z轴夹角（xz平面投影）
			var r = Math.atan(x / z);
			//第2、3象限调整角度
			if((r < 0 && x > 0) || (r > 0 && z < 0)){
				r += Math.PI;
			}
			
			var viewLen = Math.sqrt(x * x + y * y + z * z) * Math.sin(Math.PI / 50);
			var step = viewLen * horWeight;
			//水平移动距离
			_x -= step * Math.cos(r);
			_z += step * Math.sin(r);
			//垂直移动距离
			step = viewLen * verWeight;
			_x += step * Math.sin(r);
			_z += step * Math.cos(r);
			//结果
			var px = l.x + _x;
			var pz = l.z + _z;
			
			var lx = px - x;
			var lz = pz - z;
			
			//控制移动范围
			if(!this.inViewRange(px, null, pz) || !this.inViewRange(lx, null, lz)){
				return;
			}
				
			p.x = px;
			p.z = pz;
			
			l.x = lx;
			l.z = lz;

			this.camera.lookAt(l);
			//this.render();
		},
		//相机高度调节。positive：是否正方向（向上为正方向）
		cameraElevate: function(positive) {
			var p = this.camera.position;
			var l = this.lookat;
			//相机相对视野中心的坐标
			var x = p.x - l.x;
			var y = p.y - l.y;
			var z = p.z - l.z;
			//移动距离
			var viewLen = Math.sqrt(x * x + y * y + z * z) * Math.sin(Math.PI / 50);
			var step = positive ? viewLen : -viewLen;
			
			var py = p.y - step;
			var ly = l.y - step;
			//控制移动范围
			if(!this.inViewRange(null, py, null) || !this.inViewRange(null, ly, null)){
				return;
			}
			p.y = py;
			l.y = ly;
			this.camera.lookAt(l);
			//this.render();
		},
		inViewRange : function(x, y, z){
			/*var r;
			if(x != undefined){
				r = this.range.x;
				if(x < r[0] || x > r[1]){
					return false;
				}
			}
			if(y != undefined){
				r = this.range.y;
				if(y < r[0] || y > r[1]){
					return false;
				}
			}
			if(z != undefined){
				r = this.range.z;
				if(z < r[0] || z > r[1]){
					return false;
				}
			}*/
			return true;
		},
		createChildrenCtn: function(min) {//创建group，将childrenCTN加入到group中
			var children_index=0;
			var group=new THREE.Group();
			var childrenCTN=new Array();
			group.position.set(0,0,0);
			for(var h=0;h<2;h++){
				for(var w=0;w<2;w++){
					for(var l=0;l<2;l++){
						if(children_index==min.length){
							return {'group':group,'childrenCTN':childrenCTN};
						}
						var vector3_={
								x:85*w-30,
								y:85*(h+1)-30,
								z:75*l-25
							};
						var con_ =this.createContainer({con_info: min[children_index],
								width: 60,
								height: 60,
								length: 50,
								position: {
									x:60*w-30,
									y:60*(h+1)-30,
									z:50*l-25
									
								}
							});
						 /*new Container({
							con_info: min[children_index],
							width: 60,
							height: 60,
							length: 50,
							position: {
								x:60*w-30,
								y:60*(h+1)-30,
								z:50*l-25
								
							}
						});*/
						con_.userData.toPosition=vector3_;
						/*if (con_.object) {*/
							childrenCTN.push(con_);
							group.add(con_);
						/*}*/

						children_index++;
					}
				}
			}

			return {'group':group,'childrenCTN':childrenCTN};
		},
		childrenCTNAnimation:function(childrenCTN){//展开childrenCTN
			var consArray=childrenCTN;
			var _this=this;
			_this.animateFlag=true;
			_this.animate(_this);
			for(var i=0;i<consArray.length;i++){
				var animate= new TWEEN.Tween(consArray[i].position ).to(consArray[i].userData.toPosition, Math.random() * 1000 + 1000 )
					.easing( TWEEN.Easing.Exponential.InOut )
					.start();
				if(i==consArray.length-1){
					animate.onComplete(function(){
						_this.animateFlag=false;
					});
				}
			}
		},
		clreanObj:function(){
			var _this=this;
			_this.animateFlag=false;
			_this.animate(_this);
			_this.removeObjInScene();
			/*_this.dom_el.removeEventListener('DOMMouseScroll');
			_this.dom_el.removeEventListener('mousemove');
			_this.dom_el.removeEventListener('dblclick');
			_this.dom_el.removeEventListener('mousedown');*/
			for(var key in _this){
				if(key!='shelf' || key!=''){
					delete _this[key];
				}
				
			}
		}
	//};
	}
	return _3d;
});
