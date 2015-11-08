/*******core**********/
(function() {

	/**
	 *定义命名空间
	 */
	var $we = {
		version: '1.0.0',
		backCompat: document.compatMode == 'BackCompat' ? true : false
	};


	/****************定义基础方法********************************/

	/**
	 *@description 覆盖多个object的方法,scope将作为保留关键字,用于传递作用域
	 *@param o:目标对象
	 *@param c:源对象，注意：源对象可以为多个,分多个参数传递
	 */
	$we.apply = function(o, c) {
		if (!o || !c || typeof(c) != 'object') {
			return;
		}

		for (var p in c) {
			o[p] = c[p];
		}

		for (var i = 2; i < arguments.length; i++) {
			arguments.callee(o, arguments[i]);
		}
		return o;
	};

	/**
	 *@desc 将object对象，转换成字符串，排除function
	 *@param obj 许愿转换成字符串的对象
	 */
	var toJsonStr = function(obj) {
		if (obj === undefined) {
			return 'undefined';
		}
		if (obj === null) {
			return 'null';
		}
		var _str = [];
		switch (typeof(obj)) {
			case 'object':
				if (obj instanceof Array) {
					_str.push('[');
					for (var i = 0, len = obj.length; i < len; i++) {
						_str.push(toJsonStr(obj[i]));
						_str.push(',');
					}
					if (_str.length > 1) {
						_str.pop();
					}
					_str.push(']');
				} else {
					_str.push('{')
					for (var o in obj) {
						if (o != undefined) {
							_str.push('"' + o + '":');
							_str.push(toJsonStr(obj[o]));
							_str.push(',');
						}
					}
					if (_str.length > 1) {
						_str.pop();
					}
					_str.push('}');
				}
				break;
			case 'string':
				_str.push('"');
				_str.push(obj.replace(/"/g, '\"'));
				_str.push('"');
				break;
			case 'number':
				_str.push(obj);
				break;
			case 'boolean':
				_str.push('"');
				_str.push(obj);
				_str.push('"');
				break;
			case 'funciton':
				break;
			default:
				_str.push('"');
				_str.push(obj);
				_str.push('"');
				break;
		}
		return _str.join('');
	};
	$we.apply($we, {
		/**@desc 转换成JSON字符串
		 */
		toJson: function(obj) {
			return toJsonStr(obj);
		},
		/**@desc 将JSON字符串转换成对象
		 */
		parseJson: function(str) {
			try {
				var json = eval('(' + str + ')');
				return json;
			} catch (e) {
				return null;
			}
		}
	});

	/**
	 *@desc 对象克隆
	 *@param obj 需要克隆的目标对象
	 *@return 克隆后的对象
	 */
	$we.clone = function(obj) {
		var tar;
		switch (typeof(obj)) {
			case 'object':
				if (obj instanceof Array) {
					tar = [];
					for (var i = 0, len = obj.length; i < len; i++) {
						tar[i] = $we.clone(obj[i]);
					}
				} else {
					if (!obj) {
						return obj;
					} else {
						tar = {};
						for (var o in obj) {
							tar[o] = $we.clone(obj[o]);
						}
					}
				}
				break;
			default:
				tar = obj;
				break;
		}
		return tar;
	};


	/**
	 *@desc 类实例化时，遍历对象的所有属性，将对象类型的属性数据重新克隆一份，防止地址重用的问题
	 */
	var cloneObjProperties = function(obj) {
		for (var o in obj) {
			if (typeof(obj[o]) == 'object' && o != 'superclass' && o != 'scope') {
				obj[o] = $we.clone(obj[o]);
			}
		}
		return obj;
	};


	/**
	 *@desc 类继承
	 *@param superclass 父类
	 *@param exconfig 需要扩展到属性
	 *@return 新的类
	 */
	$we.extend = function(superclass, extend) {
		if (arguments.length == 1) {
			extend = superclass;
			superclass = null;
		}
		var clazz = function(config) {
			//克隆对象，防止地址公用
			cloneObjProperties(this);
			$we.apply(this, config);
			this.init = this.init || function() {};
			this.init(config);
		};
		if (!arguments.length) {
			return clazz;
		}
		var cp = clazz.prototype;

		if (superclass) {
			var sp = superclass.prototype;

			var f = function() {};
			f.prototype = sp;

			cp = new f();
			cp.constructor = clazz;
			clazz.superclass = sp;
			clazz.prototype.superclass = sp;
		}
		if (extend) {
			$we.apply(cp, extend);
		}

		$we.apply(clazz.prototype, cp);

		return clazz;
	};

	$we.apply($we, {
		/**@desc 清除选择
		 */
		clearSelection: function() {
			window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
		},

		/**@desc console日志
		 *@param msg 消息
		 */
		log: function(msg) {
			if (window['console']) {
				console.log(msg);
			}
		},

		/**@description 合并多个object的方法,本方法只将o中不存在（即值为undefined）的属性,将c中对应的属性进行覆盖
		 *@param o: 目标对象
		 *@param c:源对象，注意：源对象可以为多个，分多个参数传递
		 *@return null
		 */
		applyIf: function(o, c) {
			if (!o || !c || typeof(c) != 'object') {
				return;
			}
			for (var p in c) {
				if (o[p] == undefined) {
					o[p] = c[p];
				}
			}
			for (var i = 2; i < arguments.length; i++) {
				arguments.callee(o, arguments[i]);
			}
			return o;
		},


		/**@desc 命名空间定义函数
		 */
		ns: function() {
			var a = arguments,
				o = null,
				i, j, d, rt;
			for (i = 0; i < a.length; ++i) {
				d = a[i].split(".");
				rt = d[0];
				eval('if (typeof ' + rt + ' == "undefined"){' + rt + ' = {};} o = ' + rt + ';');
				for (j = 1; j < d.length; ++j) {
					o[d[j]] = o[d[j]] || {};
					o = o[d[j]];
				}
			}
		},

		/**@desc 类重写
		 *param ac
		 */
		override: function(ac, overrides, cover) {
			var p = ac.prototype;
			// var __attrs=ac.__attrs?ac.__attrs.split(','):[];
			// var __fns=ac.__fns?ac.__fns:{};
			// var __attrsMap=ac.__attrsMap?ac.__attrsMap:{};
			cover = cover === false ? false : true;
			for (var o in overrides) {
				if (!p[o] || cover) {
					var att = overrides[o];
					// if(typeof(att)!='function'){
					// __attrs.push(o);
					// __attrsMap[o.toLowerCase()]=o;
					// }else{
					// __fns[o.toLowerCase()]=o;
					// }
					p[o] = overrides[o];
				}
			}
			// ac.__attrs=__attrs.join(',');
			// ac.__fns=__fns;
			// ac.__attrsMap=__attrsMap;
		},

		/**@desc 生成ID
		 */
		createId: function(prix, length) {
			prix = prix || '';
			prix += (prix.substr(0, 2) == 'x_') ? '' : 'x_';
			prix += (prix.substr(prix.length - 1, 1) == '_') ? '' : '_';

			length = length || 5;
			var _x = Math.random() * Math.pow(10, length) + '';
			return prix + _x.substr(0, _x.indexOf('.'));
		},

		/**@desc 格式化，同C#的format
		 *@return 第一个参数是格式化的字符串，第二个参数是参数
		 */
		format: function(format) {
			var args = Array.prototype.slice.call(arguments, 1);
			if (format.length && format instanceof Array) {
				format = $we.join(format)
			}
			return format.replace(/\{(\d+)\}/g, function(m, i) {
				return args[i];
			});
		},

		/**@desc 格式化
		*@param p: <input id="{id}" name="{name}" class="{cls}"/>
		*@param d:{
			id:'a_email',
			name:'email',
			class:'mui-email'
		}
		*@return <input id="a_email" name="email" class="mui-email"/>
		*/
		parse: function(p, d) {
			var reg;
			if (typeof(p) == 'object' && p instanceof Array) {
				p = $we.join(p);
			}
			for (var i in d) {
				reg = new RegExp('{' + i + '}', 'g');

				p = p.replace(reg, d[i]);
			}
			return p;
		},

		/**@desc 获取浏览器信息
		 *@return 浏览器信息
		 */
		getNavInfo: function() {

			var ua = navigator.userAgent.toLowerCase(),
				check = function(r) {
					return r.test(ua);
				},
				navInfo = {};

			navInfo.isStrict = document.compatMode == "CSS1Compat";
			navInfo.isOpera = check(/opera/);
			navInfo.isChrome = check(/chrome/);
			navInfo.isWebKit = check(/webkit/);
			navInfo.isSafari = !navInfo.isChrome && check(/safari/);
			navInfo.isSafari2 = navInfo.isSafari && check(/applewebkit\/4/); // unique to Safari 2
			navInfo.isSafari3 = navInfo.isSafari && check(/version\/3/);
			navInfo.isSafari4 = navInfo.isSafari && check(/version\/4/);
			navInfo.isIE = !navInfo.isOpera && check(/msie/);
			navInfo.isIE7 = navInfo.isIE && check(/msie 7/);
			navInfo.isIE8 = navInfo.isIE && check(/msie 8/);
			navInfo.isIE6 = navInfo.isIE && !navInfo.isIE7 && !navInfo.isIE8;
			navInfo.isGecko = !navInfo.isWebKit && check(/gecko/);
			navInfo.isGecko2 = navInfo.isGecko && check(/rv:1\.8/);
			navInfo.isGecko3 = navInfo.isGecko && check(/rv:1\.9/);
			navInfo.isBorderBox = navInfo.isIE && !navInfo.isStrict;
			navInfo.isWindows = check(/windows|win32/);
			navInfo.isMac = check(/macintosh|mac os x/);
			navInfo.isAir = check(/adobeair/);
			navInfo.isLinux = check(/linux/);
			navInfo.isSecure = /^https/i.test(window.location.protocol);
			return navInfo;
		},

		/**@desc 获取页面内容尺寸*/
		getContentSize: function(doc) {
			doc = doc || document;
			var body = doc.body;
			return {
				height: body.scrollHeight,
				width: body.scrollWidth
			}
		},

		/**@desc 获取页面尺寸*/
		getPageSize: function(win) {
			win = win || window;
			var doc = win.document;
			if (win.innerHeight) {
				return {
					width: win.innerWidth,
					height: win.innerHeight
				}
			} else if (doc.documentElement && doc.documentElement.clientHeight) {
				return {
					width: doc.documentElement.clientWidth,
					height: doc.documentElement.clientHeight
				}
			} else {
				return {
					width: doc.body.offsetWidth,
					height: doc.body.offsetHeight
				}
			}
		},
		/**@desc 包含，字符串包含判断*/
		contains: function(s, v, split) {
			split = split === undefined ? ',' : '';
			s = split + s + split;
			v = split + v + split;

			return s.indexOf(v) == -1 ? false : true;
		},
		/**
		 * 首尾去空格
		 * @param str 需要去除空格的字符串
		 */
		trim: function(str) {
			return str.replace(/(^\s*)|(\s*$)/g, "");
		},
		/**
		 * 左去空格
		 * @param str 需要去除空格的字符串
		 */
		leftTrim: function(str) {
			return str.replace(/(^\s*)/g, "");
		},
		/**
		 * 右去空格
		 * @param str 需要去除空格的字符串
		 */
		rightTrim: function(str) {
			return str.replace(/(\s*$)/g, "");
		},
		/**
		 * 是否是数组
		 */
		isArray: function(value) {
			return Object.prototype.toString.apply(value) === '[object Array]';
		},
		/**
		 * 判断是否为数字
		 */
		isNumber: function(str) {
			return !isNaN(str);
		},
		/**
		 * 邮箱
		 */
		isEmail: function(str) {
			return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(str);
		},
		/**
		 * 电话号码
		 */
		isPhoneNo: function(str) {
			return /\d{3}-\d{8}|\d{4}-\d{7}/.test(str);
		},
		/**
		 * 邮编
		 */
		isPostNo: function(str) {
			return /[1-9]\d{5}(?!\d)/.test(str);
		},
		/**
		 * 身份证号码
		 */
		isIDNo: function(str) {
			return /\d{15}|\d{18}/.test(str);
		},
		/**
		 * 整数
		 */
		isInt: function(str) {
			return /^-?[1-9]\d*$/.test(str);
		},
		/**
		 * 正整数
		 */
		isPosInt: function(str) {
			return /^[1-9]\d*$/.test(str);
		},
		/**
		 * 负整数
		 */
		isNegInt: function(str) {
			return /^-[1-9]\d*$/.test(str);
		},
		/**
		 * 是否是手机号码
		 */
		isMobileNo: function(str) {
			return /^1[3|4|5|7|8][0-9]\d{4,8}$/.test(str);
		},
		/**
		 * 金额，2位有效数字
		 */
		isMoney: function(str) {
			return /^(-)?(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/.test(str);
		},
		/**
		 * 正金额，2位有效数字
		 */
		isPosMoney: function(str) {
			return /^(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/.test(str);
		},
		/**
		 * 负金额，2位有效数字
		 */
		isNegMoney: function(str) {
			return /^(-)(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/.test(str);
		}
	});

	$we.na = $we.getNavInfo();

	/**@desc 判断浏览器是否使用的是IE的盒子模型
	 */
	$we.ieBox = $we.na.isIE && $we.backCompat;

	/**************WeJS对象管理******************************/
	var __instance = {};
	$we.apply($we, {
		instance: {},
		add: function(ins) {
			if (!ins) {
				return;
			}
			ins.id = ins.id || $we.createId();
			__instance[ins.id] = ins;
		},
		get: function(id) {
			return __instance[id];
		},
		remove: function(ins) {
			if (!ins) {
				return;
			}
			$we.destory(ins);
			if (typeof(ins) == 'object') {
				ins = ins.___weId || ins.id;
			}
			delete __instance[ins.id];
		},
		destory: function(ins) {
			if (ins) {
				return;
			}
			if (typeof ins.destory == 'function') {
				ins.destory();
			}
			if (typeof ins.removeAllListeners == 'function') {
				ins.removeAllListeners();
			}
			var es = ins._events;
			for (var e in es) {
				delete es[e];
			}
			for (var c in ins) {
				delete ins[c];
			}
		}
	});

	/***@desc WeJS基础类，提供事件的监听、触发事件、移除事件监听等基础方法
	 */
	$we.Object = $we.extend({
		_events: {},
		/**@desc 事件监听器，如果子类和父类都配置了该属性，父类的事件监听器将会无效，建议该配置在不可继承的子类或者实例化中使用*/
		listeners: {},
		/**@desc 触发事件
		 *@param e 事件名称
		 *@param data 触发事件所传递的默认事件参数
		 *@return undefined
		 */
		fireEvent: function(e, data) {
			if (!arguments.length) {
				return;
			}
			var event = this._events[e];
			if (!event) {
				return;
			} else {
				for (var i = 0, len = event.handler.length; i < len; i++) {
					var h = event.handler[i];
					try {
						h.fn.call(h.scope || this, {
							e: e,
							eventData: data,
							data: h.data
						});
					} catch (e) {

					}
				}
			}
		},

		/**@desc 添加事件监听
		 *@param e 事件名称
		 *@param fn 处理事件的回调方法
		 *@param sc 处理事件的回调方法的作用域，默认为this
		 *@param data 添加事件监听是传递的处理参数
		 *@return undefined
		 */
		addEventListener: function(e, fn, sc, data) {
			if (arguments.length < 2) {
				return;
			}
			this._events[e] = this._events[e] || {
				name: e,
				handler: []
			}
			this._events[e].handler.push({
				fn: fn,
				data: data,
				scope: sc
			});
		},

		/**@desc 移除事件监听，该方法至少需要传递一个参数，
			   传递一个参数是，将会移除当前事件名称下的所有监听，两个参数都传递的时候会针对当前处理方法进行事件监听的移除
		*@param e 事件名称
		*@param fn 处理事件的回调方法
		*@return undefined
		*/
		removeEventListener: function(e, fn) {
			if (!arguments.length) {
				return;
			}
			if (!fn) {
				if (this._events[e]) {
					delete this._events[e];
				}
			} else {
				if (this._events[e]) {
					var h = this._events[e].handler;
					for (var i = 0, len = h.length; i < len; i++) {
						if (h[i] == fn) {
							h.splice(i, 1);
						}
					}
					//this._events[e].handler.remove(fn);
				}
			}
		},
		/**@desc 移除所有的事件监听器
		 */
		removeAllEventListener: function() {
			var es = this._events;
			for (var e in es) {
				this.removeEventListener(e);
			}
		},
		/**@desc fireEvent方法的简写
		 */
		fire: function() {
			this.fireEvent.apply(this, arguments);
		},
		/**@desc addEventListener方法的简写
		 */
		on: function() {
			this.addEventListener.apply(this, arguments);
		},
		/**@desc removeEventListener方法的简写
		 */
		un: function() {
			this.addEventListener.apply(this, arguments);
		},
		/**@desc 初始化Listeners
		 */
		initListener: function(listeners) {
			if (listeners) {
				for (var l in listeners) {
					var li = listeners[l];
					this.addEventListener(l, li.fn, li.scope, li.data)
				}
			}
		},
		/**@desc 销毁
		 */
		destory: function() {
			this.dieEvent();
			for (var t in this) {
				this[t] = null;
			}
		},
		/**@desc 所有类统一的调用入口
		 */
		doInit: function() {},
		/**@desc 所有类的统一初始化入口，用于个性化的设置
		 */
		init: function(config) {
			if (!this.id) { //ID是必须的
				this.id = $we.createId();
			}
			$we.add(this);
			this._events = {};
			this.initListener(this.listeners);
			this.doInit(config);
			this.fire('afterinit');
			// this.initEvent();
		}
	});

	/**@desc 日期相关操作的封装
	 */
	var DateUtil = {
		parse: function(str) {
			var date = null;
			try {
				date = new Date(str);
			} catch (e) {
				date = null;
			}
			return date;
		},
		format: function(date, format) {
			if (!date) {
				return '';
			}
			if (typeof(date) == 'string') {
				date = new Date(date);
			} else if (typeof(date) == 'object') {
				if (!(date instanceof Date)) {
					return '';
				}
			}
			format = format || 'yyyy-MM-dd HH:mm:ss';
			var o = {
				"M+": date.getMonth() + 1, //month
				"d+": date.getDate(), //day
				"h+": date.getHours(), //hour
				"H+": date.getHours(), //hour
				"m+": date.getMinutes(), //minute
				"s+": date.getSeconds(), //second
				"q+": Math.floor((date.getMonth() + 3) / 3), //quarter
				"S": date.getMilliseconds() //millisecond
			}

			if (/(y+)/.test(format)) {
				format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
			}

			for (var k in o) {
				if (new RegExp("(" + k + ")").test(format)) {
					format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
				}
			}
			return format;
		},
		addDay: function(date, day) {
			return DateUtil.addHour(date, 24);
		},
		addHour: function(date, hour) {
			return DateUtil.addMinute(date, hour * 60);
		},
		addMinute: function(date, minute) {
			return DateUtil.addSecond(date, minute * 60);
		},
		addSecond: function(date, second) {
			return DateUtil.addTime(date, second * 1000);
		},
		addTime: function(date, addTime) {
			var time = date.getTime() + addTime;
			date.setTime(time);
			return date;
		},
		/**
		 * 日期相减
		 * @param  {String} dayStart [description]
		 * @param  {String} dayEnd   [description]
		 * @param  {String} type     支持ms:毫秒,s:秒,m:分,H:时,d:天
		 * @return {Int}          [description]
		 */
		subDate: function(dayStart, dayEnd, type) {
			dayStart = new Date(dayStart);
			dayEnd = new Date(dayEnd);

			var ms = dayStart - dayEnd;
			var unit = 0;

			if (type == 'ms') {
				unit = 1;
			} else if (type == 's') {
				unit = 1000;
			} else if (type == 'm') {
				unit = 1000 * 60;
			} else if (type == 'H') {
				unit = 1000 * 60 * 60
			} else if (type == 'd') {
				unit = 1000 * 60 * 60 * 24;
			}

			if (unit) {
				return ms / unit;
			}
			return 0;
		}
	};
	$we.Date = DateUtil;
	$we.formatDate = DateUtil.format;
	$we.parseDate = DateUtil.parse;



	/**@desc HTML编码相关封装*/
	$we.apply($we, {
		htmlEncode: function(str) {
			var s = "";
			if (str.length == 0) return "";
			s = str.replace(/&/g, "&amp;");
			s = s.replace(/</g, "&lt;");
			s = s.replace(/>/g, "&gt;");
			s = s.replace(/\'/g, "&#39;");
			s = s.replace(/\"/g, "&quot;");
			return s;
		},
		htmlDecode: function(str) {
			var s = "";
			if (str.length == 0) return "";
			s = str.replace(/&amp;/g, "&");
			s = s.replace(/&lt;/g, "<");
			s = s.replace(/&gt;/g, ">");
			s = s.replace(/&#39;/g, "\'");
			s = s.replace(/&quot;/g, "\"");
			return s;
		}
	});


	/**************WeJS全局声明******************************/
	window['wejs'] = window['$we'] = $we;
})();;(function($we, $) {
	$we.ajax = function(config) {
		config = $.extend({}, {
			dataType: 'json',
			method: 'POST',
			headers: {
				isAjax: true
			},
			// contentType: 'application/json;charset=UTF-8',
			onComplete: function() {},
			onSuccess: function() {},
			onFail: function(ret) {
				$we.msg.error(ret.msg);
			},
			onError: function() {},
			success: function(ret) {
				if (ret.success) {
					this.onSuccess.call(this.scope || this, ret);
				} else {
					this.onFail.call(this.scope || this, ret);
				}
				this.onComplete.call(this.scope || this, ret);
			},
			error: function(ret) {
				this.onError.call(this.scope || this, ret);
				this.onComplete.call(this.scope || this, ret);
			}
		}, config);


		return $.ajax(config);
	};
})(wejs, jQuery);;(function($we, $) {
	if (!$we || !$) {
		return;
	}
	var getSetFnName = function(name) {
		var fc = name[0];
		upperFc = fc.toUpperCase();
		return ['set', upperFc, name.substr(1)].join('');
	};

	$we.Component = $we.extend($we.Object, {
		el: '',
		cls: '',
		id: '',
		events: [],
		__doInitEvents: function() {
			var events = this.events,
				_this = this;
			for (var i = 0, len = events.length; i < len; i++) {
				var eventConfig = events[i],
					name = eventConfig.event,
					selector = eventConfig.selector,
					fn = eventConfig.handler;

				if (typeof(fn) == 'string') {
					fn = this[fn];
				}
				if (fn && selector) {
					this.el.on(name, selector, {
						handler: fn,
						scope: this,
					}, function(e) {
						var data = e.data;
						data.handler.call(data.scope, e);
						e.stopPropagation();
					});
				} else {
					this.el.on(name, fn);
				}
			}
		},
		__doDestoryEvents: function() {
			var events = this.events,
				_this = this;
			for (var i = 0, len = events.length; i < len; i++) {
				var eventConfig = events[i],
					name = eventConfig.event,
					selector = eventConfig.selector,
					fn = eventConfig.handler;

				if (typeof(fn) == 'string') {
					fn = this[fn];
				}
				if (selector) {
					this.el.off(name, selector);
				} else {
					this.el.off(e);
				}
			}
		},
		$: function(selector) {
			return this.el.find(selector);
		},
		destroy: function() {
			this.__doDestoryEvents();
			this.el.empty();
		},
		initEvents: function() {},
		render: function() {},

		renderTo: function(el) {
			this.el.appendTo(el);
		},
		set: function(data) {
			for (var name in data) {
				var value = data[name],
					setFnName = getSetFnName(name);

				if (this[setFnName]) {
					this[setFnName](value);
				} else if (name !== 'el') {
					this[name] = value;
				}
			}
		},
		show: function() {
			this.el.show();
		},
		hide: function() {
			this.el.hide();
		},
		doInit: function() {
			if (!this.el) {
				this.el = $('<div></div>');
			} else {
				this.el = $(this.el);
			}
			this.id = (this.id || this.el.attr('id')) || $we.createId();

			this.el
				.attr('__weid', this.id)
				.addClass(this.cls);

			this.__doInitEvents();
			this.initEvents();

			$we.add(this);
		}
	});

	var extendFn = function(superclazz) {
		return function(extension) {
			//合并events
			var events = [].concat(extension.events || [], superclazz.prototype.events);
			extension.events = events;
			var clazz = $we.extend(superclazz, extension);
			clazz.extend = extendFn(clazz);

			return clazz;
		};
	};

	$we.Component.extend = extendFn($we.Component);
	var insMap = {};
	$we.add = function(comp) {
		insMap[comp.id] = comp;
	};

	$we.get = function(id) {
		return insMap[id];
	};

	var getAttrData = function(type, value) {
		var vv = value;

		//默认统一先按照方法执行
		try {
			switch (type) {
				case 'function': //这两种类型在第一次的try就会被执行成功
					// value = eval(value);
					break;
				case 'number':
					value -= 0;
					break;
				case 'object': //这两种类型在第一次的try就会被执行成功
					// value = eval(value);
					break;
				case 'bool':
					value = value === 'true' ? true : false;
					break;
				case 'boolean':
					value = value === 'true' ? true : false;
					break;
				default:
					value = value;
					break;
			}
			vv = value;
		} catch (e) {

		}
		return vv;
	};
	var getListeners = function(el, events) {
		var attributes = el.attributes,
			listeners = {};

		for (var i = 0, len = events.length; i < len; i++) {
			var eventName = events[i],
				attr = attributes.getNamedItem('on' + eventName);

			if (attr) {
				var attrValue = attr.value;
				listeners[eventName] = {
					fn: getAttrData('function', attrValue)
				};
			}
		}

		return listeners;
	};
	var getAttrs = function(el, attrs) {
		var data = {};
		for (var name in attrs) {
			var attr = null,
				type = attrs[name];

			if (name == 'events') { //事件
				data.listeners = getListeners(el, type);
			} else {
				attr = el.attributes.getNamedItem(name);
				if (attr) {
					var attrValue = attr.value;
					data[name] = getAttrData(type, attrValue);
				}
			}
		}
		return data;
	};

	var _autoRender = function(selector, Clazz, attrs, autoRender) {
		$(selector).each(function() {
			var config = getAttrs(this, attrs),
				el = $(this),
				__weid = el.attr('__weid');

			config.el = el;
			config.id = this.id;

			if (!__weid) { //已经渲染过的，不再渲染
				var ins = new Clazz(config);
				autoRender = autoRender === false ? false : true;
				if (autoRender) {
					ins.render();
				}
				if (config.id === "") {
					delete config.id;
				}
				ins.set(config);
			}
		});
	};

	var autoList = [];
	$we.autoRender = function(selector, Clazz, attrs, autoRender) {
		var argLen = arguments.length;

		if (argLen == 0) {
			for (var i = 0, len = autoList.length; i < len; i++) {
				autoList[i].autoRender();
			}
		} else if (argLen == 3 || argLen == 4) {
			//给每个累添加autoRender方法，支持传入selector
			Clazz.autoRender = (function(selector, Clazz, attrs, autoRender) {
				return function(cuSelector) {
					_autoRender(cuSelector || selector, Clazz, attrs, autoRender);
				}
			})(selector, Clazz, attrs, autoRender);

			autoList.push(Clazz);
		}
	};


	$(function() {
		$we.autoRender();
	});
})(wejs, jQuery);;(function() {
    var maskId = '';
    $we.mask = function(type) {
        if (!maskId) {
            maskId = $we.createId();

            var size = $we.getPageSize();

            $(document.body).append([
                '<div class="" id="', maskId, '" style="width:', size.width, 'px;height:', size.height, 'px;"></div>'
            ].join(''));
        }

        var el = $('#' + maskId);
        el.get(0).className = 'wejs-mask';

        switch (type) {
            case 'loading':
                el.addClass('wejs-mask-loading');
                break;
            case 'hide':
                break;
        }

        if (type == 'hide') {
            el.hide();
        } else {
            el.show();
        }
    };

})();
;(function($we, $) {
	if (!$we || !$) {
		return;
	}
	var VALIDATE_CLS = {
		"success": "success",
		"error": "error",
		"warring": "warring",
		"info": "info"
	};


	/**
	 * 根据传入的form，返回jq对象类型的form
	 *
	 * @param form
	 *            jq选择器，form的DOM对象，jq对象
	 * @returns jq对象的form
	 */
	var getJqForm = function(form) {
		if (!(form instanceof $)) {
			form = $(form);
		}
		return form;
	};

	/**
	 * 获取表单中的所有表单项，目前包括input select textarea
	 *
	 * @param form
	 *            jq的表单对象
	 */
	var getElements = function(form) {
		return form.find('input,select,textarea');
	};

	/**
	 * 获取input元素的值，并填充到data对象中
	 *
	 * @param el
	 *            input元素
	 * @param data
	 *            填充的数据对象
	 */
	var getInputVal = function(el, data) {
		var name = el.name;
		var val = el.value;
		switch (el.type) {
			case 'radio':
				if (el.checked) {
					data[name] = val;
				}
				break;
			case 'checkbox':
				if (el.checked) {
					if (data[name]) {
						data[name] = data[name].split(',');
						data[name].push(val);
					} else {
						data[name] = [val];
					}

					data[name] = data[name].join(',');
				}
				break;
			default:
				data[name] = val;
				break;
		}

		return data;
	};

	/**
	 * 设置input元素的值
	 *
	 * @param el
	 *            input元素
	 * @param val
	 *            需要设置的值
	 * @param data
	 *            填充表单的数据对象
	 */
	var setInputVal = function(el, val, data) {
		var name = el.name;
		val += '';
		switch (el.type) {
			case 'radio':
				if (el.value == val) {
					el.checked = true;
				}
				break;
			case 'checkbox':
				if ((',' + val + ',').indexOf(',' + el.value + ',') != -1) {
					el.checked = true;
				}
				break;
			default:
				el.value = val;
				break;
		}
	};

	var Form = {
		/**
		 * 获取表单的数据，该API不限于获取form元素的数据值，可以获取任何DOM结构中包裹的表单元素的数据对象
		 *
		 * @param el
		 *            DOM接口，可以是JQuery选择器，可以是jQuery的对象
		 * @param allowEmpty
		 *            返回的对象中，是否允许存在值为空的属性
		 * @returns 当前dom中表单项的录入值
		 */
		getData: function(form, allowEmpty) {
			var data = {};
			allowEmpty = allowEmpty === false ? false : true;
			form = getJqForm(form);

			var els = getElements(form);
			els.each(function() {
				var tagName = this.tagName.toLowerCase();
				var name = this.name;
				var value = this.value;

				if (name && (value || !allowEmpty)) {
					if (tagName == 'input') {
						getInputVal(this, data);
					} else {
						data[name] = value;
					}
				}
			});
			return data;
		},

		/**
		 * 获取表单数据，此处表单为虚拟表单，只要是一个DOM结构即可
		 *
		 * @param form
		 *            表单对象，可以为jquery选择器，可以为dom对象，也可以为jquery对象
		 * @param data
		 *            需要填充到表单的数据
		 * @param cover
		 *            当某个表单项的值不在data中时，是否覆盖
		 */
		setData: function(form, data, cover) {
			form = getJqForm(form);

			var els = getElements(form);
			els.each(function() {
				var tagName = this.tagName.toLowerCase();
				var name = this.name;
				var val = data[name];
				val = val === 0 ? '0' : val;
				if (name && (cover || val !== undefined)) {
					if (tagName == 'input') {
						setInputVal(this, val || '', data);
					} else {
						this.value = val || '';
					}
				}
			});
		},
		/**
		 * 校验表单，并展示校验错误信息
		 * @param  {[type]} form   [description]
		 * @return {[type]}        [description]
		 */
		validate: function(form) {
			form = getJqForm(form);
			var els = getElements(form),
				ret = true;

			els.each(function() {
				ret = Form.validateEl($(this)) && ret;
			});

			return ret;
		},
		/**
		 * 清理表单的校验信息
		 * @param  {[type]} form [description]
		 * @return {[type]}      [description]
		 */
		clearValidate: function(form) {
			form = getJqForm(form);
			var els = getElements(form),
				ret = true;

			els.each(function() {
				Form.hideValidateMsg($(this));
			});
		},
		/**
		 * 校验单个表单元素，并展示错误信息
		 * @param  {[type]} el [description]
		 * @return {[type]}    [description]
		 */
		validateEl: function(el) {
			var rule = el.data('rule'); //data-rule=""
			var msg = el.data('rule-message'); //data-rule-message=""
			var value = el.val();

			if (rule) {
				rule = rule.split(';');
				//循环遍历校验规则
				for (var i = 0, len = rule.length; i < len; i++) {
					var expr = rule[i];

					if (expr) {
						var validateItem = Verification.run(expr, value);

						if (validateItem.result) {
							Form.hideValidateMsg(el);
						} else {
							msg = Verification.getMessage(validateItem, msg);
							Form.showValidateMsg(el, msg, 'error');
							return false;
						}
					}
					// return validateItem.result;
				}
			}
			return true;
		},
		/**
		 * 展示校验提示信息
		 * @param  {[type]} el  [description]
		 * @param  {string} ret [description]
		 * @return {[type]}     [description]
		 */
		showValidateMsg: function(el, msg, messageType) {
			messageType = messageType;

			var validateCls = VALIDATE_CLS[messageType];

			Form.hideValidateMsg(el);

			//添加错误样式
			el.parents('.control-group:first').addClass(validateCls);

			el.tooltip({
				title: msg,
				placement: 'right',
				container: el.parent()
			});
			el.get(0).validateCls = validateCls;
			el.validateCls = validateCls;
			el.tooltip('show');
		},
		/**
		 * 隐藏校验提示信息
		 * @param  {[type]} el [description]
		 * @return {[type]}    [description]
		 */
		hideValidateMsg: function(el) {
			var validateCls = el.get(0).validateCls;
			if (validateCls) {
				el.parent().parent().removeClass(el.get(0).validateCls);
			}
			el.tooltip('destroy');
		},
		/**
		 * 初始化表单的校验
		 * @param  {[type]} form [description]
		 * @return {[type]}      [description]
		 */
		initValidate: function(form) {
			form = getJqForm(form);
			var els = getElements(form);
			els.each(function() {
				var el = $(this);

				//chanage之后，去掉校验信息
				el.on('change', function() {
					Form.hideValidateMsg(el);
				});
			});
		}
	};

	/**
	 * 校验相关
	 * @type {Object}
	 */
	var Verification = {
		/**
		 * 添加校验规则
		 * @param {[type]} name   [description]
		 * @param {[type]} config [description]
		 */
		add: function(name, config) {
			if (!name) {
				return;
			}
			name = name.toLowerCase();
			Verification.rules[name] = config;
		},
		/**
		 * 删除校验规则
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		delete: function(name) {
			name = name.toLowerCase();
			delete Verification.rules[name];
		},
		/**
		 * 运行单项校验规则
		 * @param  {string} expr 表达式，例如required,range:1,2
		 * @param  {string} val  控件的value值
		 * @return {object}     通过校验，返回true,否则返回false
		 */
		run: function(expr, val) {
			if (typeof(expr) == 'string') {
				var validateItem = Verification.readExpr(expr),
					validate = validateItem.validate,
					data = validateItem.data || [],
					ret = true;

				if (validate) {
					var checkData = [val].concat(data);
					ret = validate.check.apply(validate, checkData); //执行预定义的校验
				}
				validateItem.result = ret;
				return validateItem;
			}
		},
		/**
		 * 解析表单时为可用对象
		 * @param  {string} expr range:1,100;required;
		 * @return {object}
		 *         name:校验规则名称
		 *         data:配置的校验规则传入的参数
		 *         validate:校验器
		 */
		readExpr: function(expr) {
			expr = expr.split(':');
			var name = expr[0],
				data = expr.length > 1 ? expr[1] : '';

			data = data ? data.split(',') : [];
			name = name.toLowerCase();

			return {
				name: name,
				data: data,
				validate: Verification.rules[name]
			};
		},
		/**
		 * 解析msg的对象
		 * @param  {[type]} msg  [description]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		readMessage: function(msg, name) {
			if (!msg) {
				return null;
			}

			msg = msg.split(';');
			var data = {};

			for (var i = 0, len = msg.length; i < len; i++) {
				var item = msg[i];
				item = item.split(':');
				if (item.length > 1) {
					var key = item[0],
						val = item[1];

					data[key] = val;
				}
			}

			return data[name];
		},
		/**
		 * 获取校验规则的错误消息
		 * @param  {[type]} ret      [description]
		 * @param  {[type]} validate [description]
		 * @param  {[type]} data     [description]
		 * @return {[type]}          [description]
		 */
		getMessage: function(validateItem, msg) {
			if (msg) {
				//解析data-rule-message错误信息
				msg = Verification.readMessage(msg, validateItem.name);
			}

			msg = msg || validateItem.validate.errorMsg;
			msg = [msg].concat(validateItem.data);
			return $we.format.apply($we, msg);
		},
		rules: {
			"required": {
				errorMsg: '不能为空！',
				successMsg: '',
				infoMsg: '不能为空！',
				check: function(val) {
					return !!val;
				},
				message: function(ret) {
					return ret ? '' : this.errorMsg;
				}
			},
			"number": {
				errorMsg: '请填写数字！',
				successMsg: '',
				infoMsg: '请填写数字！',
				check: function(val) {
					return !val || $we.isNumber(val);
				}
			},
			"email": {
				errorMsg: '请填写邮箱！',
				successMsg: '',
				infoMsg: '请填写邮箱！',
				check: function(val) {
					return !val || $we.isEmail(val);
				}
			},
			"money": {
				errorMsg: '请填写金额！',
				successMsg: '',
				infoMsg: '请填写金额！',
				check: function(val) {
					return !val || $we.isMoney(val);
				}
			},
			"mobile": {
				errorMsg: '请填写手机号码！',
				successMsg: '',
				infoMsg: '请填写手机号码！',
				check: function(val) {
					return !val || $we.isMobileNo(val);
				}
			},
			"int": {
				errorMsg: '请填写整数！',
				successMsg: '',
				infoMsg: '请填写整数！',
				check: function(val) {
					return !val || $we.isInt(val);
				}
			},
			"idno": {
				errorMsg: '请填写正确的身份证号码，15位或18位！',
				successMsg: '',
				infoMsg: '15位或18位！',
				check: function(val) {
					return !val || $we.isIDNo(val);
				}
			},
			"phone": {
				errorMsg: '请填写电话号码！',
				successMsg: '',
				infoMsg: '请填写电话号码！',
				check: function(val) {
					return !val || $we.isPhoneNo(val);
				}
			},
			"post": {
				errorMsg: '请填写电话号码！',
				successMsg: '',
				infoMsg: '请填写电话号码！',
				check: function(val) {
					return !val || $we.isPostNo(val);
				}
			},
			"min": {
				errorMsg: '不能小于{0}！',
				successMsg: '',
				infoMsg: '不能小于{0}！',
				check: function(val, min) {
					if (val === '') {
						return true;
					}
					min -= 0;
					val -= 0;
					return min <= val;
				}
			},
			"max": {
				errorMsg: '不能大于{0}！',
				successMsg: '',
				infoMsg: '不能大于{0}！',
				check: function(val, max) {
					if (val === '') {
						return true;
					}
					max -= 0;
					val -= 0;
					return max >= 0;
				}
			},
			"range": {
				errorMsg: '大小范围在{0}-{1}之内！',
				successMsg: '',
				infoMsg: '大小范围在{0}-{1}之内！',
				check: function(val, min, max) {
					if (val === '') {
						return true;
					}
					val -= 0;
					min -= 0;
					max -= 0;
					return min <= val && max >= val;
				}
			},
			"rangelength": {
				errorMsg: '长度范围在{0}-{1}之内！',
				successMsg: '',
				infoMsg: '长度范围在{0}-{1}之内！',
				check: function(val, min, max) {
					if (!val) {
						return true;
					}
					var valLen = val.length;
					min -= 0;
					max -= 0;
					return min <= valLen && max >= valLen;
				}
			},
			"minlength": {
				errorMsg: '不能小于{0}个字符！',
				successMsg: '',
				infoMsg: '不能小于{0}个字符！',
				check: function(val, min) {
					if (!val) {
						return true;
					}
					var valLen = val.length;
					min -= 0;
					max -= 0;
					return min <= valLen;
				}
			},
			"maxlength": {
				errorMsg: '不能大于{0}个字符！',
				successMsg: '',
				infoMsg: '不能大于{0}个字符！',
				check: function(val, max) {
					if (!val) {
						return true;
					}
					var valLen = val.length;
					min -= 0;
					max -= 0;
					return max >= valLen;
				}
			},
			"compare": {
				errorMsg: '两次输入的结果不相同！',
				successMsg: '',
				check: function(val, cel) {
					return $(cel).val() == val;
				}
			}
		}
	};

	$we.Validate = Verification;

	$we.Verification = Verification;

	$we.Form = Form;
})(wejs, jQuery);;(function($we, $) {
	if (!$we || !$) {
		return;
	}

	$we.ns('wejs.msg');

	var msgId = '__wejs_msg',
		statusCls = {
			'info': 'alert-info',
			'success': 'alert-success',
			'warning': 'alert-block',
			'error': 'alert-error'
		},
		getMsgEl = function() {
			var el = $('#' + msgId);
			if (!el.length) {
				el = $('<div id="' + msgId + '"></div>');
				el.appendTo(document.body);
			}
			el.get(0).className = 'alert';
			return el;
		};

	$we.apply($we.msg, {
		show: function(msg, status) {
			var el = getMsgEl();
			el.addClass(statusCls[status]);
			el.html(msg).show().css({
				'z-index': 100000,
				'position': 'fixed',
			});

			var ps = $we.getPageSize();
			var left = (ps.width - el.width()) / 2;
			el.css({
				'top': -50,
				'left': left
			});
			el.animate({
				'top': 50
			});

			setTimeout(function() {
				$we.msg.hide();
			}, 3000);

			return el;
		},
		hide: function() {
			getMsgEl().animate({
				top: -50
			});
		},
		info: function(msg) {
			this.show(msg, 'info');
		},
		success: function(msg) {
			this.show(msg, 'success');
		},
		warning: function(msg) {
			this.show(msg, 'warning');
		},
		error: function(msg) {
			this.show(msg, 'error');
		}
	});

	$we.Msg = $we.msg;
})(wejs, jQuery);
;(function() {
	$we.ModeSelector = $we.Component.extend({
		data: [],
		valueField: 'value',
		textField: 'text',
		multiSelect: false,
		selectedCls: 'active',
		index: 0,
		name: '',
		events: [{
			event: 'click',
			selector: '[data-role="item"]',
			handler: '_onItemClick'
		}],
		_onItemClick: function(e) {
			var el = $(e.currentTarget);

			var index = this._selectItem(el);

			this.fire('select', {
				index: index,
				el: el
			});
		},
		_getItemsEl: function() {
			return this.$('[data-role="item"]');
		},
		select: function(index) {
			var els = this._getItemsEl();

			if (index < 0 || index >= els.length) {
				return;
			}

			var el = els.eq(index);
			this._selectItem(el);
		},
		setIndex: function(index) {
			this.select(index);
		},
		_selectItem: function(el) {
			var index = el.index();
			if (!this.multiSelect) {
				this.clearSelect();
			}

			el.addClass(this.selectedCls);

			var val = el.data('value');
			if (val !== undefined) {
				this._getNameEl().val(val);
			}
			return index;
		},
		_getNameEl: function() {
			return this.$('[name="' + this.name + '"]');
		},
		getSelctedIndex: function() {
			var indexList = [];

			this.getSelctedEls().each(function() {
				indexList.push($(this).index());
			});

			if (this.multiSelect) {
				return indexList;
			} else {
				return indexList.length ? indexList[0] : -1;
			}
		},
		getSelectedData: function() {
			var selectedIndex = this.getSelctedIndex();

			if (this.multiSelect) {
				var dataList = [];
				var data = this.data;

				for (var i = 0, len = selectedIndex.length; i < len; i++) {
					dataList.push(data[selectedIndex[i]]);
				}

				return dataList;
			}

			if (selectedIndex > -1 && selectedIndex < this.data.length) {
				return this.dataList[selectedIndex];
			}
		},
		getSelctedEls: function() {
			return this._getItemsEl().filter('.' + this.selectedCls);
		},
		clearSelect: function() {
			var cls = this.selectedCls;
			this.getSelctedEls().removeClass(cls);
		},
		render: function() {
			if (this.name && !this._getNameEl().length) {
				this.el.append('<input type="hidden" name="' + this.name + '" data-role="val"/>');
			}
		},
		renderList: function() {

		}
	});

	$we.autoRender('[data-role="wejs-mode-selector"]', $we.ModeSelector, {
		name: 'string',
		multiSelect: 'boolean',
		index: 'number',
		events: ['select']
	});

})();;(function() {
	var DR_NUMBER_INPUT = '[data-role="input"]',
		DR_SUB_BTN = '[data-role="sub-btn"]',
		DR_ADD_BTN = '[data-role="add-btn"]';

	$we.NumberEditor = $we.Component.extend({
		min: null,
		max: null,
		minGear: null,
		maxGear: null,
		cls: 'we-number-editor input-prepend input-append',
		inputSize: 'medium', //mini small medium large xlarge xxlarge
		inputAlign: 'center',
		name: '',
		value: 0,
		events: [{
			event: 'click',
			selector: DR_ADD_BTN,
			handler: '_doAdd'
		}, {
			event: 'click',
			selector: DR_SUB_BTN,
			handler: '_doSub'
		}, {
			event: 'keydown',
			selector: DR_NUMBER_INPUT,
			handler: '_doKeyup'
		}, {
			event: 'change',
			selector: DR_NUMBER_INPUT,
			handler: '_doInputChange'
		}],
		_doChange: function() {
			this.fire('change');
			var val = this.getValue();
			if (this.minGear) {
				$we.get(this.minGear).setMin(val);
			}
			if (this.maxGear) {
				$we.get(this.maxGear).setMax(val);
			}
		},
		_doSub: function() {
			var val = this.getValue(),
				min = this.min;

			val--;
			if (min === null || min <= val) {
				this.setValue(val);
			}

			this._doChange();
		},
		_doAdd: function() {
			var val = this.getValue(),
				max = this.max;
			val++;
			if (max === null || max >= val) {
				this.setValue(val);
			}

			this._doChange();
		},
		_doKeyup: function(e) {
			var keyCode = e.keyCode;
			if ((48 <= keyCode && keyCode <= 57) || keyCode == 190 || keyCode == 18) {

			} else {
				e.preventDefault();
			}
		},
		_doInputChange: function(e) {
			var val = this.getInputEl().val(),
				min = this.min,
				max = this.max;

			val -= 0;

			if (min !== null && val < min) {
				val = min;
			} else if (max !== null && val > max) {
				val = max;
			}
			this.getInputEl().val(val);
			this._doChange();
		},
		setMin: function(min) {
			this.min = min;
		},
		getMin: function() {
			return this.min;
		},
		setMax: function(max) {
			this.max = max;
		},
		getMax: function() {
			return this.max;
		},
		setInputSize: function(inputSize) {
			var el = this.getInputEl();
			el.removeClass('input-' + this.inputSize);

			this.inputSize = inputSize;
			if (inputSize) {
				el.addClass('input-' + this.inputSize);
			}
		},
		getInputSize: function() {
			return this.inputSize;
		},
		setName: function(name) {
			this.name = name;
			this.getInputEl().attr('name', name);
		},
		getName: function() {
			return this.name;
		},
		getInputEl: function() {
			return this.el.find(DR_NUMBER_INPUT);
		},
		setValue: function(val) {
			if (!isNaN(val)) {
				this.getInputEl().val(val);
			}
		},
		getValue: function() {
			return this.getInputEl().val() - 0;
		},
		setInputAlign: function(align) {
			this.align = align;
			this.getInputEl().css('text-align', align);
		},
		getInputAlign: function() {
			return this.inputAlign;
		},
		render: function() {
			var el = this.el,
				htmls = [
					'<button class="btn" type="button" data-role="sub-btn">-</button>',
					'<input type="text" class="" value="" name="" data-role="input">',
					'<button class="btn" type="button" data-role="add-btn">+</button>'
				];

			el.html(htmls.join(''));


			this.set({
				value: this.value,
				inputAlign: this.inputAlign,
				inputSize: this.inputSize
			});
		}
	});

	var selector = '[data-role="wejs-number-editor"]';
	$we.autoRender(selector, $we.NumberEditor, {
		name: 'string',
		inputSize: 'string',
		min: 'number',
		value: 'string',
		minGear: 'string',
		maxGear: 'string',
		events: ['change']
	});
})();
;(function() {
	var tpl = [
			'<input type="text" class="" value="" name="" data-role="input">',
			'<button class="btn" type="button" data-role="btn">',
			'<i class="icon-calendar"></i>',
			'</button>'
		].join(''),
		DR_INPUT = '[data-role="input"]',
		DR_BTN = '[data-role="btn"]';

	var getDateVal = function(val, format) {
		format = format || 'yyyy-MM-dd';
		if (val && val.indexOf('now') == 0) {
			val = (val.replace('now', '') || '0') - 0;
			val = val * 24 * 3600 * 1000;
			val = (new Date()).getTime() + val;
			val = new Date(val);
			val = $we.Date.format(val, format);
		}
		return val
	};

	$we.DatePicker = $we.Component.extend({
		format: 'yyyy-MM-dd',
		min: '',
		max: '',
		minGear: '', //最小值控件联动：这里是指将当前控件的值，作为minGear指定控件的最小值
		maxGear: '', //最大值控件联动：这里是指将当前控件的值，作为maxGear指定控件的最大值
		name: '',
		placeHolder: '',
		inputSize: 'medium',
		cls: 'we-date-picker input-append',
		doubleCalendar: false,
		events: [{
			event: 'click',
			selector: DR_BTN,
			handler: '_doShowCalendar'
		}],
		_onPicked: function() {
			var val = this.getValue();
			this.fire('change', val);
			if (this.minGear) {
				var minGear = $we.get(this.minGear);
				if (minGear) {
					minGear.setMin(val);
					minGear.showSelector();
				}
			}
			if (this.maxGear) {
				var maxGear = $we.get(this.maxGear);
				if (maxGear) {
					maxGear.setMax(val);
				}
			}
		},
		_doShowCalendar: function() {
			var ipt = this.getInputEl(),
				_this = this,
				config = {
					el: ipt.get(0),
					doubleCalendar: this.doubleCalendar,
					dateFmt: this.format,
					onpicked: function() {
						_this._onPicked();
					}
				};

			if (this.min) {
				config.minDate = this.min
			}
			if (this.max) {
				config.maxDate = this.max
			}

			WdatePicker(config);
		},
		showSelector: function() {
			this._doShowCalendar();
		},
		setInputSize: function(inputSize) {
			var el = this.getInputEl();
			el.removeClass('input-' + this.inputSize);

			this.inputSize = inputSize;
			if (inputSize) {
				if (isNaN(inputSize)) {
					el.addClass('input-' + this.inputSize);
				} else {
					el.width(inputSize);
				}
			}
		},
		getInputSize: function() {
			return this.inputSize;
		},
		getInputEl: function() {
			return this.el.find(DR_INPUT);
		},
		getName: function() {
			return this.name;
		},
		setName: function(name) {
			this.name = name;
			this.getInputEl().attr('name', this.name);
		},
		setPlaceHolder: function(placeHolder) {
			this.placeHolder = placeHolder;
			this.getInputEl().attr('placeHolder', this.placeHolder);
		},
		getValue: function() {
			return this.getInputEl().val();
		},
		setValue: function(val) {
			val = getDateVal(val, this.format);
			this.getInputEl().val(val);
		},
		setMin: function(min) {
			this.min = getDateVal(min, this.format);
		},
		getMin: function() {
			return this.min;
		},
		setMax: function(max) {
			this.max = getDateVal(max, this.format);
		},
		getMax: function() {
			return this.max;
		},
		render: function() {
			this.el.html(tpl);

			this.set({
				placeHolder: this.placeHolder,
				name: this.name,
				inputSize: this.inputSize
			});
		}
	});

	var selector = '[data-role="wejs-datepicker"]';
	$we.autoRender(selector, $we.DatePicker, {
		min: 'string',
		max: 'string',
		minGear: 'string',
		maxGear: 'string',
		name: 'string',
		placeHolder: 'string',
		value: 'string',
		inputSize: 'string',
		format: 'string',
		doubleCalendar: 'boolean',
		events: ['change']
	});
})();;(function($we, $) {
	var createPager = function(i) {
		var cls = i == this.getPageIndex() ? "active" : '';
		return [
			'<li i="', i, '" id="', this.id, '_page_', i, '" class="', cls, '">',
			'<a href="javascript:void(0);">' + (i + 1) + '</a>',
			'</li>'
		].join('');
	};

	$we.Pagebar = $we.extend($we.Component, {
		cls: 'pagination',
		total: 0,
		pageIndex: 0,
		pageSize: 20,
		__sizeShow: 10,
		infoTmpl: '<span class="info">第{pageIndex}页，每页{pageSize}条，共{total}条记录</span>',
		events: [{
			event: 'click',
			selector: 'li',
			handler: '__doClickPageIndex'
		}],
		__doClickPageIndex: function(e) {
			var i = $(e.currentTarget).attr('i');
			if (i) {
				this.__doChangeIndex(i);
			}
		},
		__doChangeIndex: function(i) {
			i -= 0;
			var oldIndex = this.getPageIndex();
			var newIndex = i;
			this.setPageIndex(i);
			this.__render();

			this.fire('change', {
				oldIndex: oldIndex,
				newIndex: newIndex,
				pageSize: this.getPageSize()
			});
		},
		__render: function() {
			var pageCount = this.getPageCount();
			var pageSize = this.getPageSize();
			var pageIndex = this.getPageIndex();
			var firstCls = pageIndex == 0 ? 'disabled' : '';
			var lastCls = pageIndex == pageCount - 1 ? 'disabled' : '';

			var htmls = [
				'<ul>'
			];
			htmls.push('<li class="' + firstCls + '" i="0"><a href="javascript:void(0);">&laquo;</a></li>');
			if (pageCount < this.__sizeShow) { //小于10条
				for (var i = 0; i < pageCount; i++) {
					htmls.push(createPager.call(this, i));
				}
			} else {

				var _sub = this.__sizeShow / 2; //5

				var start = pageIndex - _sub + 1;
				var end = pageIndex + _sub - 1;
				if (pageIndex >= _sub) {
					htmls.push('<li><a>...</a></li>');
				}

				if (start < 0) {
					end -= start;
					start = 0;
				}
				if (end >= pageCount) {
					start -= (end - pageCount + 1);
					end = pageCount - 1;
				}
				while (start <= end) {
					htmls.push(createPager.call(this, start));
					start++
				}
				if (pageIndex < pageCount - _sub) {
					htmls.push('<li><a>...</a></li>');
				}
			}
			htmls.push('<li class="' + lastCls + '" i="' + (pageCount - 1) + '"><a href="javascript:void(0);">&raquo;</a></li>');
			htmls.push('</ul>');

			if (this.infoTmpl) {
				htmls.push($we.parse(this.infoTmpl, {
					pageCount: pageCount,
					pageSize: pageSize,
					pageIndex: this.getPageIndex() + 1,
					total: this.getTotal(),
					start: start,
					end: end
				}));
			}

			return htmls.join('');
		},

		setTotal: function(total) {
			this.total = total;
			this.render();
		},
		getTotal: function() {
			return this.total;
		},
		setPageIndex: function(pageIndex) {
			if (pageIndex < this.getPageCount()) {
				this.pageIndex = pageIndex;
			}
		},
		getPageIndex: function() {
			return this.pageIndex;
		},
		setPageSize: function(pageSize) {
			this.pageSize = pageSize;
		},
		getPageSize: function() {
			return this.pageSize;
		},
		getParams: function() {
			return {
				pageIndex: this.pageIndex,
				pageSize: this.pageSize,
				total: this.total
			};
		},
		getPageCount: function() {
			return Math.ceil(this.getTotal() / this.getPageSize());
		},
		render: function() {
			var htmls = this.__render();
			this.el.html(htmls);

			var elList = this.__pelList || [];
			for (var i = 0, len = elList.length; i < len; i++) {
				elList[i].html(htmls);
			}
		},
		renderTo: function(element) {
			element = $(element);
			this.__pelList = this.__pelList || [];
			this.__pelList.push(element);


			var htmls = this.__render();
			element.html(htmls);
		}
	});

})(wejs, jQuery);;(function() {
    $we.Select = $we.Component.extend({
        url: '',
        textField: '',
        valueField: '',
        data: [],
        nullText: '请选择...',
        autoLoad: true,
        params: {},
        value: '', //初始化时的value
        isAsync: false, //是否是异步请求
        setData: function(data) {
            this.data = data;

            this._renderData(data);
        },
        getData: function() {
            return this.data;
        },
        getItem: function(value) {
            var valueField = this.valueField;
            var list = this.getDataBy(function(item, index, data) {
                return (item[valueField] == value)
            });

            if (list.length) {
                return list[0];
            }
            return null;
        },
        getDataBy: function(fn) {
            var data = this.data,
                list = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i];

                if (fn.call(this, item, i, data)) {
                    list.push(item);
                }
            }
            return list;
        },
        getValue: function() {
            return this._getSelectEl().val
        },
        load: function(params) {
            params = $.extend({}, this.params, params);

            $we.ajax({
                async: this.isAsync,
                url: this.url,
                data: params,
                type: 'POST',
                scope: this,
                onSuccess: this._loadSuccess,
                onFail: this._onFail
            });
        },
        _getSelectEl: function() {
            var el = this._selectEl;

            if (!el) {
                if (this.el.get(0).tagName.toLowerCase() == 'select') {
                    el = this.el;
                } else {
                    el = this.el.find('select:firset');
                }
                this._selectEl = el;
            }

            return el;
        },
        _renderData: function(data) {
            var el = this._getSelectEl().get(0),
                textField = this.textField,
                valueField = this.valueField,
                options = el.options;

            if (this.nullText) {
                options.add(new Option(this.nullText, ''));
            }
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i],
                    text = item[textField],
                    value = item[valueField];

                options.add(new Option(text, value));
            }
        },
        _loadSuccess: function(ret) {
            var data = ret.data.rows;

            this.setData(data);
        },
        _loadFail: function(ret) {
            this.setData([]);
        },

        doInit: function() {
            $we.Select.superclass.doInit.call(this);

            if (this.autoLoad) {
                this.load();
            }

            if (this.value) {
                this.setValue(value);
            }
        }
    });

    var selector = '[data-role="wejs-select"]';
    $we.autoRender(selector, $we.Select, {
        name: 'string',
        url: 'string',
        textField: 'string',
        valueField: 'string',
        autoLoad: 'boolean',
        isAsync: 'boolean',
        value: 'string',
        params: 'object',
        nullText: 'string',
        data: 'object'
    });
})();
;(function() {
    var Tabs = $we.Component.extend({
        el: '',
        index: 0,
        data: [],
        navTmpl: '',
        contentTmpl: '',
        _getNavEl: function() {
            return this.el.find('[data-role="nav"]');
        },
        _getNavEls: function() {
            return this.el.find('[data-toggle="tab"]');
        },
        _getCurrentIndex: function() {
            return this._getNavEl().find('.active').index();
        },
        _getTargetData: function(target) {
            target = $(target);

            return {
                flag: target.attr('data-flag'),
                id: target.attr('data-id')
            };
        },
        _onTabShown: function(e) {
            var data = {
                current: this._getTargetData(e.target),
                prev: this._getTargetData(e.relatedTarget)
            };

            this.fire('change', data);
        },
        setCurrentTitle: function(title) {
            var index = this._getCurrentIndex();
            this.setTitle(index, title);
        },
        setTitle: function(index, title) {
            this._getNavEls().eq(index).html(title);
        },
        initEvents: function() {
            var _this = this;
            this._getNavEls().on('shown', function(e) {
                _this._onTabShown(e);
            });
        },
        select: function(index) {
            if (isNaN(index)) {
                index = this.index;
            }
            this._getNavEls().eq(index).tab('show');
        },
        setData: function(data) {
            this.data = data;

            this.render();
        },
        getCurrentTabData: function() {
            var index = this._getCurrentIndex();
            return this.getTabData(index);
        },
        getTabData: function(index) {
            return this.data[index];
        },
        render: function() {
            var data = this.data;
            if (data.length) {
                var navHtmls = $(this.navTmpl).tmpl(data),
                    contentHtmls = $(this.contentTmpl).tmpl(data);

                this._getNavEl().html(navHtmls);
                this.el.find('[data-role="content"]').html(contentHtmls);
            }
        },
        doInit: function() {
            Tabs.superclass.doInit.apply(this, arguments);
            this.index = this.index || 0;

            this.select(this.index);
        }
    });

    $we.Tabs = Tabs;
    $we.autoRender('[data-role="tabs"]', Tabs, {
        index: 'number'
    }, true);
    $we.autoRender('[data-role="wejs-tabs"]', Tabs, {
        index: 'number'
    }, true);
})()
;(function() {
    var tmpl = '<div class="modal hide fade we-dialog" id="${id}" style="{{if width}}width:${width}px{{/if}}">\
                    <div class="modal-header" data-role="header">\
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\
                        <h4 data-role="title">${title}</h4>\
                    </div>\
                    <div class="modal-body" data-role="body" style="{{if height}}height:${height}px{{/if}}">\
                    </div>\
                    {{if hasFooter}}\
                    <div class="modal-footer" data-role="footer">\
                        {{each buttons}}\
                        <a href="javascript:void(0);" class="btn ${this.cls}" data-role="${this.name}">{{if this.icon}}<i class="icon ${this.icon}"</i>{{/if}}${this.text}</a>\
                        {{/each}}\
                    </div>\
                    {{/if}}\
                </div>';

    var TMPL_NAME = 'wejs_dialog_template';
    var DIALOG_TEMPLATE = $.template(TMPL_NAME, tmpl);
    $we.apply($we, {
        modalShow: function(el) {
            el = $(el);
            el.modal('show');

            var ps = $we.getPageSize();
            var ml = (el.width()) / 2;
            el.css({
                marginLeft: -ml
            });
        },
        modalHide: function(el) {
            $(el).modal('hide');
        }
    });

    var DEFAULT_BUTTONS = {
        'sure': {
            text: '确定',
            cls: 'btn-primary',
            handler: 'doSure'
        },
        'cancel': {
            text: '取消',
            handler: 'doCancel'
        },
        'yes': {
            text: '是',
            cls: 'btn-primary',
            handler: 'doSure'
        },
        'no': {
            text: '否',
            handler: 'doCancel'
        }
    }
    Dialog = $we.Component.extend({
        content: '', //内容，如果配置了contentTmpl，则编译contentTmpl
        hasFooter: true, //是否有footer
        width: 0, //窗体宽度
        height: 0, //内容高度
        title: 'Dialog', //title
        buttons: ['sure', 'cancel'], //默认按钮
        contentTmpl: '', //内容的模板
        contentData: {}, //内容模板编译的数据，默认在getContentData方法中返回
        /**
         * {
         *     text:'确认',
         *     handler:'doSure',
         *     cls:'icon-primary',
         *     icon:'',
         *     name:'sure'//
         * }
         */
        _initButtons: function() {
            var buttons = [],
                _buttons = this.buttons,
                events = this.events;

            for (var i = 0, len = _buttons.length; i < len; i++) {
                var item = _buttons[i],
                    btn = DEFAULT_BUTTONS[item];

                if (btn) {
                    events.push({
                        event: 'click',
                        handler: btn.handler,
                        selector: '[data-role="' + item + '"]'
                    });
                    item = {
                        text: btn.text,
                        name: item,
                        cls: btn.cls
                    };
                } else {
                    events.push({
                        event: 'click',
                        handler: item.handler,
                        selector: '[data-role="' + item.name + '"]'
                    });
                }

                buttons.push(item);
            }
            this.buttons = buttons;
        },
        getElBy: function(dataRole, el) {
            el = el || this.el;
            return el.find('[data-role="' + dataRole + '"]');
        },
        getBodyEl: function() {
            return this.getElBy('body');
        },
        getHeaderEl: function() {
            return this.getElBy('header');
        },
        getTitleEl: function() {
            var headerEl = this.getHeaderEl();
            return this.getElBy('title', headerEl);
        },
        getFooterEl: function() {
            return this.getElBy('footer');
        },
        getButtonElByFlag: function(dataRole) {
            var footerEl = this.getFooterEl();
            return this.getElBy(dataRole, footerEl);
        },
        getTitle: function() {
            return this.getTitleEl().text();
        },
        /**
         * 获取body区域的表单数据
         * @param  {boolean} convertEmpty 是否包含空数据
         * @return {[type]}              [description]
         */
        getFormData: function(convertEmpty) {
            return $we.Form.getData(this.getBodyEl(convertEmpty));
        },
        /**
         * 设置body区域的表单数据
         * @param {Object}  data    源数据
         * @param {Boolean} isCover 是否全覆盖，设置为全覆盖的时候，表单项的数据在data中找不但则置空
         */
        setFormData: function(data, isCover) {
            $we.Form.setData(this.getBodyEl(), data, isCover);
        },
        /**
         * 设置标题
         * @param {[type]} title [description]
         */
        setTitle: function(title) {
            this.getTitleEl().html(title);
        },
        /**
         * 设置内容
         * @param {[type]} content [description]
         */
        setContent: function(content) {
            this.content = content;
            this.getBodyEl().html(content);
        },
        getContent: function() {
            return this.getBodyEl().html();
        },
        show: function() {
            $we.modalShow(this.el);
        },
        hide: function() {
            $we.modalHide(this.el);
        },
        getContentData: function() {
            return this.contentData;
        },
        doInit: function() {
            if (!this.el) {
                this._initButtons();
                var htmls = $.tmpl(TMPL_NAME, {
                    id: this.id,
                    title: this.title,
                    width: this.width,
                    height: this.height,
                    hasFooter: this.hasFooter,
                    buttons: this.buttons
                });

                $(document.body).append(htmls);
                this.el = $('#' + this.id);
            }
            Dialog.superclass.doInit.apply(this, arguments);

            this.render();
        },
        doCancel: function(e) {
            this.hide();
        },
        doSure: function(e) {},
        render: function(data) {
            var content = this.content;
            if (this.contentTmpl) {
                var data = data || this.getContentData();
                content = $(this.contentTmpl).tmpl(data);
            }

            this.getBodyEl().html(content);

            $we.autoRender();
        }
    });
    /**
     * 创建并显示Dialog
     * @param  {[type]} config [description]
     * @return {[type]}        [description]
     */
    Dialog.create = function(config) {
        return new Dialog(config);
    };

    var alertIns = null;

    /**
     * 模态对话框的alert
     * @param  {String} config.title       标题
     * @param  {String} config.content     内容
     * @param  {String} config.contentTmpl 内容模板
     * @param  {Object} config.data        模板渲染数据
     * @param  {Function} config.callback    点击按钮的回调方法
     */
    Dialog.alert = function(config) {
        if (arguments.length > 1) {
            config = {
                title: '提示',
                content: arguments[0],
                callback: arguments[1]
            };
        }
        $we.apply(config, {
            buttons: ['sure'],
            doSure: function(e) {
                this.callback && this.callback();
                this.hide();
            }
        });
        config.content = '<div class="we-dialog-alert"><i class="we-icon we-icon-alert"></i><div class="content">' + config.content + '</div></div>';

        if (!alertIns) {
            alertIns = Dialog.create(config);
        } else {
            alertIns.set(config);
        }
        alertIns.show();
    };

    var confirmIns = null;
    /**
     * 模态对话框的confirm
     * @param  {String} config.title       标题
     * @param  {String} config.content     内容
     * @param  {String} config.contentTmpl 内容模板
     * @param  {Object} config.data        模板渲染数据
     * @param  {Function} config.callback    点击按钮的回调方法
     */
    Dialog.confirm = function(config) {
        $we.apply(config, {
            buttons: ['sure', 'cancel'],
            doCancel: function() {
                this.callback && this.callback(false);
                this.hide();
            },
            doSure: function(e) {
                this.callback && this.callback(true);
                this.hide();
            }
        });

        config.content = '<div class="we-dialog-confirm"><i class="we-icon we-icon-help"></i><div class="content">' + config.content + '</div></div>';

        if (!confirmIns) {
            confirmIns = Dialog.create(config);
        } else {
            confirmIns.set(config);
        }
        confirmIns.show();
    };

    $we.Dialog = Dialog;
})();;(function() {
    $we.AutoComplete = $we.Component.extend({
        url: '',
        data: '',
        delay: 500,
        name: '',
        valueName: '',
        paramName: 'key', //异步参数名称
        itemsCount: 10,
        textField: 'name',
        valueField: 'id',
        filterType: 'remote',
        _delayFilter: null,
        _currentIndex: -1,
        _onKeyup: function() {
            var _this = this;
            if (this._delayFilter) {
                clearTimeout(this._delayFilter);
                this._delayFilter = null;
            }
            this._delayFilter = setTimeout(function() {
                _this.filter();
            }, this.delay);
        },
        /**
         * 获取下拉菜单组件EL
         * @return {[type]} [description]
         */
        _getDDMenuEl: function() {
            return $('#' + this.id + '-ddmenu');
        },
        _getHiddenEl: function() {
            return $('#' + this.id + '-val');
        },
        _doSelect: function(event) {
            var target = $(event.currentTarget),
                index = target.attr('data-index'),
                txt = target.text(),
                val = target.attr('data-val');
            this.el.val(txt);
            this._getHiddenEl().val(val);
            this._currentIndex = index;
            this._getDDMenuEl().hide();
        },

        /**
         * 初始化DDMenu
         */
        _initDDMenu: function() {
            var ddmenu = this._getDDMenuEl();

            if (!ddmenu.length) {
                this.el.after(['<ul id="', this.id, '-ddmenu" class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu"></ul>'].join(''));

                this._getDDMenuEl().on('click', 'a', {
                        scope: this,
                    }, function(event) {
                        var scope = event.data.scope;

                        scope._doSelect(event);
                    })
                    .css({
                        'min-width': this.el.outerWidth()
                    })
            }
        },
        _initHidden: function() {
            // this.el.get(0).name = '';
            this.el.after(['<input type="hidden" value="" name="', this.valueName, '" id="', this.id, '-val"/>'].join(''));
        },
        /**
         * 获取选中的data
         * @return {[type]} [description]
         */
        getSelected: function() {
            return this._currentIndex !== -1 ? this.data[this._currentIndex] : null;
        },
        /**
         * 事件初始化
         * @return {[type]} [description]
         */
        initEvents: function() {
            var _this = this;
            this.el.on('keyup', function(event) {
                _this._onKeyup();
            });

            this.el.on('blur', function() {
                setTimeout(function() {
                    _this._getDDMenuEl().hide();
                }, 100);
            });
            this.el.on('focus', function() {
                _this.filter();
            });
        },
        /**
         * 过滤
         */
        filter: function() {
            var el = this.el,
                offset = el.offset();

            var val = el.val();
            if (!val) {
                return;
            }

            offset.top += el.outerHeight();

            switch (this.filterType) {
                case 'remote':
                    this.loadData();
                    break;
                default:
                    this.matchData();
                    break;
            }

            this._getDDMenuEl()
                .show()
                .offset(offset);
        },
        /**
         * 对即将渲染的数据进行排序
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        sorterData: function(data) {
            return data;
        },
        /**
         * 静态数据的过滤
         * @return {[type]} [description]
         */
        matchData: function() {
            var inputVal = this.el.val(),
                data = this.data,
                matchData = [],
                len = Math.min(data.length, this.itemsCount);

            for (var i = 0; i < len; i++) {
                var item = data[i],
                    typeItem = typeof(item),
                    txt = item[this.textField],
                    val = item[this.valueField];

                if (typeof(item) != 'object') {
                    txt = item;
                    val = item;
                }


                if (val.indexOf(inputVal) != -1) {
                    matchData.push(item);
                }
            }

            this.sorterData(matchData);

            this.renderData(matchData);
        },
        /**
         * 异步获取远程数据
         */
        loadData: function() {
            var data = {
                '__key': this.el.val()
            };

            this.data = [];
            $we.ajax({
                url: this.url,
                data: data,
                type: 'POST',
                scope: this,
                onSuccess: function(ret) {
                    this.data = ret.data;
                },
                onComplete: function() {
                    this.sorterData(this.data);
                    this.renderData(this.data);
                }
            });
        },
        /**
         * 渲染数据
         * @param  {[type]} data [description]
         */
        renderData: function(data) {
            this._initDDMenu();
            var len = Math.min(data.length, this.itemsCount),
                htmls = [];

            // htmls.push('<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu">');
            for (var i = 0; i < len; i++) {
                var item = data[i],
                    typeItem = typeof(item),
                    txt = item[this.textField],
                    val = item[this.valueField];

                if (typeof(item) != 'object') {
                    txt = item;
                    val = item;
                }

                htmls.push([
                    '<li><a tabindex="-1" href="#" data-val="', val, '" data-index="', i, '">', txt, '</a></li>'
                ].join(''));
            }
            // htmls.push('</ul>');
            htmls = htmls.join('');

            this._getDDMenuEl().html(htmls);

            this._getDDMenuEl().show();
        },
        /**
         * 初始化数据
         * @return {[type]} [description]
         */
        doInit: function() {
            $we.AutoComplete.superclass.doInit.apply(this);

            this._initDDMenu();
            if (this.valueName) {
                this._initHidden();
            }
        }
    });



    var selector = '[data-role="wejs-autocomplete"]';
    $we.autoRender(selector, $we.AutoComplete, {
        name: 'string',
        valueName: 'string',
        deploy: 'number',
        valueField: 'string',
        textField: 'string',
        data: 'object',
        url: 'string',
        filterType: 'string',
        events: ['change']
    });
})();(function() {
    var DR_GRID = '[data-role="grid"]', //grid list
        DR_GRID_LIST = '[data-role="grid-list"]', //list
        DR_GRID_ITEM = '[data-role="grid-item"]', //list
        DR_GRID_PAGEBAR = '[data-role="grid-pagebar"]',
        // DR_GRID_ROW_TMPL = '[data-role="grid-row-tmpl"]', //grid-row
        DR_EMPTY_INFO = '[data-role="empty-info"]', //empty

        DR_BTN_DEL = '[data-role="btn-del"]', //btn-del
        DR_ROW_CHECKBOX = '[data-role="row-checkbox"]',
        DR_ALL_CHECKBOX = '[data-role="all-checkbox"]',
        CLS_ROW_SELECTED = 'grid-row-selected';

    $we.Grid = $we.Component.extend({
        url: '',
        autoLoad: false,

        gridRowTmpl: '#grid_row_tmpl',
        hasPagebar: false,
        pageSize: 20,
        pageIndex: 0,
        keyField: 'id',
        data: [], //GRID的数据
        _dataMap: {}, //GRID的数据的MAP
        _ajaxRet: {}, //GRID加载数据时的异步结果

        events: [{
            event: 'click',
            selector: DR_BTN_DEL,
            handler: '_doDel'
        }, {
            event: 'click',
            selector: DR_GRID_ITEM,
            handler: '_doSelectRow'
        }, {
            event: 'click',
            selector: DR_ALL_CHECKBOX,
            handler: '_doSelectAllRow'
        }],
        _createMap: function(rows) {
            var map = {},
                keyField = this.keyField;

            for (var i = 0, len = rows.length; i < len; i++) {
                var row = rows[i];
                row[keyField] = row[keyField] || $we.createId();

                map[row[keyField]] = row;
            }
            return map;
        },
        _cacheData: function(rows) {
            this.data = rows;
            this._dataMap = this._createMap(rows);
        },
        _doSelectRow: function(e) {
            var data = this._getEventData(e),
                el = data.el,
                isSelected = !el.hasClass(CLS_ROW_SELECTED),
                chkEl = data.el.find(DR_ROW_CHECKBOX);


            if (chkEl.length) {
                chkEl = chkEl.get(0);
                chkEl.checked = isSelected;
            }

            if (isSelected) {
                el.addClass(CLS_ROW_SELECTED);
            } else {
                el.removeClass(CLS_ROW_SELECTED);
            }

            data.isSelected = isSelected;
            this.fire('select', data);
        },
        _doSelectAllRow: function(e) {
            var el = e.target;
            if (el.checked) {
                this.selectAll();
            } else {
                this.clearSelected();
            }
        },
        _getDataIdByEl: function(el) {
            return el.attr('data-id');
        },
        _getEventData: function(e) {
            var el = $(e.currentTarget),
                id = this._getDataIdByEl(el);

            return {
                el: el,
                id: id
            };
        },
        /**
         * 获取选中的行的DOM元素
         * @return {[type]} [description]
         */
        _getSelectedRowEl: function() {
            return this.el.find(DR_GRID_ITEM).filter('.' + CLS_ROW_SELECTED);
        },
        /**
         * 获取所有行元素
         * @return {[type]} [description]
         */
        _getAllRowEl: function() {
            return this.el.find(DR_GRID_ITEM);
        },
        /**
         * 获取选中的Checkbox的DOM元素
         * @return {[type]} [description]
         */
        _getSelectedCheckboxEl: function() {
            return this.el.find(DR_GRID_ITEM).find(DR_ROW_CHECKBOX + ':checked');
        },
        /**
         * 获取所有Checkbox元素
         * @return {[type]} [description]
         */
        _getAllCheckboxEl: function() {
            return this.el.find(DR_GRID_ITEM).find(DR_ROW_CHECKBOX);
        },
        _doDel: function(e) {},
        _renderList: function(rows) {
            var htmls = $(this.gridRowTmpl).tmpl(rows);
            this.el.find(DR_GRID_LIST).html(htmls);
        },
        getData: function() {
            return this.data;
        },
        setData: function(data, total) {
            //缓存数据
            this._cacheData(data);

            this.renderData(data);

            if (this.pagebar) {
                this.pagebar.setTotal(total);
            }
        },
        getRow: function(index) {
            if (this.data) {
                return this.data[index];
            }
            return null;
        },
        getRowById: function(id) {
            return this._dataMap[id];
        },
        /**
         * 获取选中行的数据
         * @return {[type]} [description]
         */
        getSelectedRow: function() {
            var dataList = [],
                _this = this;

            this._getSelectedRowEl().each(function() {
                var id = _this._getDataIdByEl($(this)),
                    data = _this.getRowById(id);

                if (data) {
                    dataList.push(data);
                }
            });

            return dataList;
        },
        getSelectedIds: function() {
            var ids = [],
                _this = this;

            this._getSelectedRowEl().each(function() {
                var id = _this._getDataIdByEl($(this));

                if (id) {
                    ids.push(id);
                }
            });

            return ids;
        },
        /**
         * 反选
         * @return {[type]} [description]
         */
        invertRow: function() {
            this._getAllRowEl().each(function() {
                var el = $(this);
                if (el.hasClass(CLS_ROW_SELECTED)) {
                    el.removeClass(CLS_ROW_SELECTED);
                    el.find(DR_ROW_CHECKBOX).attr('checked', false);
                } else {
                    el.addClass(CLS_ROW_SELECTED);
                    el.find(DR_ROW_CHECKBOX).attr('checked', true);
                }
            });
        },
        /**
         * 全选
         * @return {[type]} [description]
         */
        selectAll: function() {
            this._getAllRowEl().addClass(CLS_ROW_SELECTED);
            this._getAllCheckboxEl().attr('checked', true);
        },
        /**
         * 清除选择
         * @return {[type]} [description]
         */
        clearSelected: function() {
            this._getSelectedRowEl().removeClass(CLS_ROW_SELECTED);
            this._getSelectedCheckboxEl().attr('checked', false);
        },
        /**
         * 添加数据
         * @param {[type]} row [description]
         */
        addRow: function(row) {
            var keyField = this.keyField;
            this.data.push(row);
            row[keyField] = row[keyField] || $we.createId();
            this._dataMap[row[keyField]] = row;

            this.renderData(this.data);
        },
        /**
         * 移除数据
         * @param  {[type]} index [description]
         * @return {[type]}       [description]
         */
        removeRow: function(index) {
            var indexList = [].concat(index),
                keyField = this.keyField;

            for (var i = 0, len = indexList.length; i < len; i++) {
                var index = indexList[i],
                    row = this.getRow(index);

                if (row) {
                    this.data.splice(index, 1);
                    delete this._dataMap[row[keyField]];
                }
            }

            this.renderData(this.data);
        },
        /**
         * 移除数据根据ID
         * @param  {[type]} id [description]
         * @return {[type]}    [description]
         */
        removeRowById: function(id) {
            var data = this.data,
                idList = [].concat(id),
                idMap = {},
                keyField = this.keyField,
                dataList = [];

            for (var i = 0, len = idList.length; i < len; i++) {
                idMap[idList[i]] = true;
            }

            for (var i = 0, len = data.length; i < len; i++) {
                var row = data[i];
                if (idMap[row[keyField]]) {
                    delete this._dataMap[row[keyField]];
                } else {
                    dataList.push(row);
                }
            }
            this.data = dataList;

            this.renderData(this.data);
        },
        /**
         * 异步记载后的渲染方法
         * @param  {[type]} rows [description]
         * @return {[type]}      [description]
         */
        renderData: function(rows) {
            var el = this.el;
            if (rows.length) {
                el.find(DR_GRID).show();
                el.find(DR_EMPTY_INFO).hide();
                //render list
                this._renderList(rows);
            } else {
                el.find(DR_GRID).hide();
                el.find(DR_EMPTY_INFO).show();

                this._renderList([]);
            }
        },
        load: function(params) {
            $we.mask('loading');

            var data = {};

            $we.apply(data, params);

            if (this.hasPagebar) {
                $we.apply(data, {
                    pageSize: this.pageSize,
                    pageIndex: this.pageIndex
                });
            }

            $we.ajax({
                scope: this,
                data: data,
                dataType: 'json',
                url: this.url,
                type: 'POST',
                onSuccess: function(ret) {
                    this._ajaxRet = ret;

                    var rows = ret.data.rows,
                        total = ret.data.total;

                    this.setData(rows, total);

                    this.fire('load-succ', ret);
                },
                onFail: function(ret) {
                    this.fire('load-fail', ret);
                },
                onComplete: function() {
                    $we.mask('hide');
                }
            });
        },
        createPagebar: function() {
            if (!this.hasPagebar) {
                return;
            }
            if (!this.pagebar) {
                this.pagebar = new $we.Pagebar({
                    el: this.el.find(DR_GRID_PAGEBAR),
                    pageSize: this.pageSize,
                    pageIndex: this.pageIndex
                });

                this.pagebar.on('change', function(data) {

                    var pageData = data.eventData;

                    this.pageIndex = pageData.newIndex;

                    this.load();

                }, this);
            }
        },
        doInit: function() {
            $we.Grid.superclass.doInit.apply(this, arguments);
            this.createPagebar();

            if (this.autoLoad) {
                this.load();
            }
        }
    });

    $we.autoRender('[data-role="wejs-grid"]', $we.Grid, {
        autoLoad: 'boolean',
        url: 'string',
        autoLoad: 'boolean',
        gridRowTmpl: 'string',
        hasPagebar: 'boolean',
        pageSize: 'number',
        pageIndex: 'number',
        data: 'object', //GRID的数据
    });
})();
