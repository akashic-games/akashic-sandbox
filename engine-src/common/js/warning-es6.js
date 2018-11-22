function warningEs6OnConsole() {
	var objectNames = ["Map", "Set", "WeakMap", "WeakSet", "Promise", "Symbol", "SharedArrayBuffer", "Atomics", "Proxy"];
	var staticMethodNames = {
		"Array": ["from", "of"],
		"Math": ["imul", "clz32", "fround", "log10", "log2", "log1p", "expm1",
			"cosh", "sinh", "tanh", "acosh", "asinh", "atanh", "hypot", "trunc", "sign", "cbrt"],
		"Number": ["isNaN", "isFinite", "isInteger", "parseInt", "parseFloat",
			"EPSILON", "MAX_SAFE_INTEGER", "MIN_SAFE_INTEGER", "isSafeInteger"],
		"Object": ["is", "assign", "getOwnPropertySymbols", "values", "entries", "getOwnPropertyDescriptors"],
		"String": ["fromCodePoint", "raw"]
	};
	var methodNames = {
		"Array": ["fill", "find", "entries", "keys", "values", "copyWithin", "includes"],
		"String": ["codePointAt", "startsWith", "endsWith", "includes", "repeat", "normalize", "padEnd", "padStart"]
	};
	var noWarning = true;
	if (window.Proxy && window.Reflect) {
		objectNames.forEach(function (name) {
			if (!window[name]) {
				return;
			}
			window[name] = new Proxy(window[name], {
				construct: function (target, args) {
					if (noWarning) {
						displayFirstWarning();
						noWarning = false;
					}
					console.warn(name + "が使用されました。多くの環境で動作させるため、現在のところES6以降の機能を利用しないことを推奨します。特にニコニコ新市場対応コンテンツでは利用しないでください。");
					return Reflect.construct(target, args);
				}
			});
		});
	}
	Object.keys(staticMethodNames).forEach(function(name) {
		staticMethodNames[name].forEach(function(methodName) {
			if (!window[name] || !window[name][methodName]) {
				return;
			}
			var original = window[name][methodName];
			window[name][methodName] = function() {
				if (noWarning) {
					displayFirstWarning();
					noWarning = false;
				}
				var method = name + "." + methodName;
				console.warn(method + "が実行されました。多くの環境で動作させるため、現在のところES6以降の機能を利用しないことを推奨します。特にニコニコ新市場対応コンテンツでは利用しないでください。");
				return original.apply(this, arguments);
			};
		});
	});
	Object.keys(methodNames).forEach(function(name) {
		methodNames[name].forEach(function(methodName) {
			if (!window[name] || !window[name].prototype[methodName]) {
				return;
			}
			var original = window[name].prototype[methodName];
			window[name].prototype[methodName] = function() {
				if (noWarning) {
					displayFirstWarning();
					noWarning = false;
				}
				var method = name + ".prototype." + methodName;
				console.warn(method + "が実行されました。多くの環境で動作させるため、現在のところES6以降の機能を利用しないことを推奨します。特にニコニコ新市場対応コンテンツでは利用しないでください。");
				return original.apply(this, arguments);
			};
		});
	});
}

function displayFirstWarning() {
	console.debug("ES5でサポートされないオブジェクト・メソッドがコンテンツから呼ばれる毎に警告を出します。");
	console.debug("警告を非表示にする場合は、右上の歯車をクリックして「ES5でサポートされない機能が使用された場合警告を出力(リロードで適用)」にチェックを入れてリロードしてください。");
}
