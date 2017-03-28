/*
** 定义一个Password类
** 
** 密码类的几种状态status：
** 		1.密码类尚未初始化 => 0
** 		2.密码类完成初始化，可调用checkPassword方法 => 1
** 		3.密码输入的有误，具体错误查看password.getStatus().message => 2
** 		4.密码输入有效 => 3
** 密码类的公共方法：
** 		init：用户设置密码类的模式（设置密码/验证密码）
** 		getStatus：获取密码类状态信息（包括操作是否成功及操作提示信息）
** 		checkPassword：根据密码类的模式对用户输入的密码进行检测
*/
;Password = {
	createNew: function (pwdName) {
		// password类的工厂方法
		var password = {};
		// password类的私有属性，记录用户手势密码及暂存密码
		var pwdKey = pwdName;
		var pwd = '';
		var tmpPassword = '';
		var tip = '密码尚未初始化';
		var mode = '';
		var status = 0;

		// password类的私有方法，用来获取、设置手势密码，显示状态信息
		var getPassword = function () {
			return localStorage.getItem(pwdKey);
		};
		var storePassword = function () {
			localStorage.setItem(pwdKey, pwd);
		};
		var showMessage = function () {
			$('[data-password]').text(tip);
		};
		var resetTip = function (tips) {
			setTimeout(function () {
				tip = tips;
				showMessage();
				tmpPassword = '';
			}, 500);
		}

		// 定义password类的公共方法
		password.init = function (usrMode) {
			pwd = getPassword() || '';
			mode = usrMode || 'set';
			tmpPassword = '';

			if (mode == 'check') {
				tip = pwd ? '等待用户输入' : '无密码，验证前请先设置密码';
			}
			else if (mode == 'set') {
				tip = '请输入手势密码';
			}
			status = 1;
			showMessage();
			return password.getStatus();
		};
		password.getStatus = function () {
			return {status: status, message: tip};
		}
		password.checkPassword = function (usrPwd) {
			if (!status) {
				showMessage();
				return password.getStatus();
			}
			if (mode == 'check') {
				if (!pwd) {
					tip = '无密码，验证前请先设置密码';
					status = 2;
				}
				else if (pwd !== usrPwd) {
					tip = '输入的密码不正确';
					status = 2;
					resetTip('等待用户输入');
				}
				else {
					tip = '密码正确！';
					status = 3;
				}
			}
			else if (mode == 'set') {
				if (!tmpPassword) {
					usrPwd.length > 4 ? ((tmpPassword = usrPwd), tip = '请再次输入手势密码') : tip = '密码太短，至少需要5个点';
					status = tmpPassword ? 3 : 2;
				}
				else if (tmpPassword !== usrPwd) {
					tip = '两次输入的不一致';
					status = 2;
					resetTip('请输入手势密码');
				}
				else {
					pwd = tmpPassword;
					tip = '密码设置成功';
					storePassword();
					tmpPassword = '';
					status = 3;
				}
			}
			showMessage();
			return password.getStatus();
		};

		return password;
	}
};
