/*
**
**
**
*/
;(function ($) {
	// 圆盘中的圆圈 - 内部类
	var Circle = function (x, y, value, selected) {
		this.x = x;
		this.y = y;
		this.value = value;
		this.selected = selected;
	};

	var GesturePassword = function (elemt, options) {
		// 手势插件的构造方法
		this.elemt = elemt;
		this.settings = $.extend(true, $.fn.GesturePassword.defaults, options || {});
		this.init();
	};

	// 手势插件的实例方法
	GesturePassword.prototype = {
		init: function () {
			var $this = this;
			this.usrPassword = localStorage.getItem('usrPassword') || "";
			this.canvas = $('<canvas id="plate" width=220 height=220>');
			this.elemt.append(this.canvas);
			this.ctx = this.canvas[0].getContext("2d");
			this.circleNumPerRow = 3;
			this.circleOffset = 10;
			this.circleRadius = (220 - this.circleOffset * 2) / (this.circleNumPerRow * 2 - 1) / 2;
			this.circles = [];
			this.selectCircles = [];
			this.password = "";
			this.istouch = false;
			if (this.settings.completeCallback) {
				this.elemt.on('complete.gesture', this.settings.completeCallback);
			}

			// 初始化手势密码表盘
			this.initDraw();
			// 绑定触摸事件，实现对手指滑动操作的监听
			this.canvas.on('showIfPos.gesture', function (e, $this, originalEvent) {
				if ($this.istouch) {
					var x = originalEvent.pageX || originalEvent.originalEvent.targetTouches[0].pageX;
					var y = originalEvent.pageY || originalEvent.originalEvent.targetTouches[0].pageY;
					[x, y] = convertToCanvas({x: x, y: y});
					var target = null;
					if ((target = $this.isInCircle(x, y)) && !target.selected) {
							target.selected = true;
							$this.selectCircles.push(target);
					}
					$this.repaint({x: x, y: y});
				}
			});
			this.canvas.on('touchstart mousedown', {obj: $this}, function (e) {
				e.stopPropagation();
				e.data.obj.istouch = true;
				e.data.obj.canvas.trigger('showIfPos.gesture', [e.data.obj, e]);
			});
			this.canvas.on('mousemove touchmove', {obj: $this}, function (e) {
				e.stopPropagation();
				e.data.obj.canvas.trigger('showIfPos.gesture', [e.data.obj, e]);
			});
			this.canvas.on('touchend mouseup', {obj: $this}, function (e) {
				e.stopPropagation();
				e.data.obj.istouch = false;
				// 获取用户设置的密码
				for (var index in e.data.obj.selectCircles) {
					e.data.obj.password += e.data.obj.selectCircles[index].value;
				}
				if (e.data.obj.password) {
					e.data.obj.elemt.trigger('complete.gesture', [e.data.obj.password]);
				}
				e.data.obj.resetPlate();
			});

			$('body').on('touchend mouseup', {obj: $this}, function (e) {
				e.stopPropagation();
				e.data.obj.canvas.trigger(e.type);
			});

			var convertToCanvas = function (point) {
				return [point.x - $this.canvas.offset().left, point.y - $this.canvas.offset().top];
			}
		},
		initDraw: function () {
			// 绘制手势密码盘中的初始的九个圆点
			// 设置圆圈颜色及边框
			this.ctx.fillStyle = this.settings.circleBgColor;
			this.ctx.strokeStyle = this.settings.circleBdColor;

			// 绘制九个圆点
			for (var i = 0; i < 3; i++) {
				for (var j = 0; j < 3; j++) {
					var x = this.circleRadius + j * 2 * (this.circleRadius * 2) + this.circleOffset;
					var y = this.circleRadius + i * 2 * (this.circleRadius * 2) + this.circleOffset;

					this.ctx.beginPath();
					this.ctx.arc(x, y, this.circleRadius, 0, Math.PI * 2);
					this.ctx.closePath();
					this.ctx.fill();
					this.ctx.stroke();

					this.circles.push(new Circle(x, y, i * 3 + j + 1, false));
				}
			}
			// 保存初始化密码盘
			this.initCanvas = this.ctx.getImageData(0, 0, 220, 220);
		},
		resetPlate: function () {
			this.ctx.clearRect(0, 0, 200, 200);
			this.ctx.putImageData(this.initCanvas, 0, 0);
			delete this.selectCircles;
			this.selectCircles = [];
			this.password = "";
			for (var index in this.circles) {
				this.circles[index].selected = false;
			}
		},
		isInCircle: function (x, y) {
			var target = null;
			for (var index in this.circles) {
				// 若点(x,y)与圆的圆心点(circle.x,circle.y)之间距离小于半径，则该点在圆内
				if (Math.sqrt(Math.pow(x - this.circles[index].x, 2) + Math.pow(y - this.circles[index].y, 2)) < this.circleRadius) {
					target = this.circles[index];
					break;
				}
			}
			return target;
		},
		drawSelectCircles: function () {
			// 设置选中圆圈的颜色，并在选中列表中遍历圆圈并绘制
			this.ctx.fillStyle = this.settings.circleSlColor;
			this.ctx.strokeStyle = this.settings.circleSlBdColor;
			this.ctx.lineWidth = 1;

			this.ctx.beginPath();
			for (var index in this.selectCircles) {
				this.ctx.moveTo(this.selectCircles[index].x + this.circleRadius, this.selectCircles[index].y);
				this.ctx.arc(
						this.selectCircles[index].x, 
						this.selectCircles[index].y, 
						this.circleRadius, 
						0, 
						Math.PI * 2,
						true
					);
			}
			this.ctx.closePath();
			this.ctx.fill();
			this.ctx.stroke();
			// 绘制选中圆圈的中心圈
			if (this.settings.circleSlCtrRadius) {
				this.ctx.fillStyle = this.settings.circleSlBdColor;
				this.ctx.beginPath();

				for (var index in this.selectCircles) {
					this.ctx.moveTo(this.selectCircles[index].x + this.settings.circleSlCtrRadius, this.selectCircles[index].y);
					this.ctx.arc(
						this.selectCircles[index].x, 
						this.selectCircles[index].y, 
						this.settings.circleSlCtrRadius, 
						0, 
						Math.PI * 2,
						true
					);
				}
				this.ctx.closePath();
				this.ctx.fill();
			}
		},
		drawLines: function (point) {
			// 设置画笔样式
			this.ctx.fillStyle = this.settings.lineColor;
			this.ctx.lineWidth = 5;
			if (this.settings.lineSyle === 'dash') {
				this.ctx.setLineDash([15, 5]);
			}
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';
			// 绘制连线
			this.ctx.beginPath();
			for (var index in this.selectCircles) {
				if (index == 0)
					this.ctx.moveTo(this.selectCircles[index].x, this.selectCircles[index].y);
				else
					this.ctx.lineTo(this.selectCircles[index].x, this.selectCircles[index].y);
			}
			if (point) {
				this.ctx.lineTo(point.x, point.y);
			}
			this.ctx.stroke();
		},
		repaint: function (point) {
			this.ctx.clearRect(0, 0, 220, 220);
			this.ctx.putImageData(this.initCanvas, 0, 0);
			this.drawSelectCircles();
			this.drawLines(point);
		},
	};

	$.fn.GesturePassword = function (options, args) {
		return this.each(function () {
			var $this = $(this);
			// 判断是否存在插件实例,
			// 若已存在，则不再重复创建实例  - 单例模式
			var instance = $this.data('GesturePsw');
			if (!instance) {
				$this.data('GesturePsw', (instance = new GesturePassword($this, options)));
			}
			if ($.type(options) === 'string') {
				instance[options](args);
			}
		});
	};

	/*
	** 定义插件默认参数
	** circleBgColor : white - 未选中圆圈的背景颜色
	** circleBdColor : lightgrey  - 未选中圆圈的边框颜色
	** circleSlColor : darkorange - 选中圆圈的背景颜色
	** circleSlBdColor : orange - 选中圆圈的边框颜色
	** circleSlCtrRadius: 5px - 选中圆圈的中心圆点半径长度
	** lineColor : darkorange - 连线颜色
	** lineSyle : solid - 连线样式
	** isDrawLine : true - 是否显示连线
	** completeCallback : null - 提供给complete事件的处理函数（用户输入有效的手势密码后触发complete事件）
	*/
	$.fn.GesturePassword.defaults = {
		circleBgColor : '#FFF',
		circleBdColor : '#B5B5B5',
		circleSlColor : '#FFB000',
		circleSlBdColor : '#FF8C00',
		circleSlCtrRadius : 8,
		lineColor : '#FF8C00',
		lineSyle : 'solid',
		isDrawLine : true,
		completeCallback: null,
	};

	// DOM结构创建完成后，对data-gesture创建手势密码实例
	$(function () {
		$('[data-gesture]').GesturePassword();
	});
})(jQuery);