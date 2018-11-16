function warningEs6OnConsole() {
	console.debug("ES5でサポートされないオブジェクト・メソッドがコンテンツから呼ばれる毎に警告を出します。");
	console.debug("警告を非表示にする場合は、右上の歯車をクリックして「ES5でサポートされない機能が使用された場合警告を出力(リロードで適用)」にチェックを入れてリロードしてください。");
	var objectNames = ["Map", "Set", "WeakMap", "WeakSet", "Promise", "Symbol", "SharedArrayBuffer", "Atomics", "Proxy"];
	var staticMethodNames = {
		"Array": ["from", "of"],
		"Math": ["imul", "clz32", "fround", "log10", "log2", "log1p", "expm1",
			"cosh", "sinh", "tanh", "acosh", "asinh", "atanh", "hypot", "trunc", "sign", "cbrt"],
		"Number": ["isNaN", "isFinite", "isInteger", "parseInt", "parseFloat",
			"EPSILON", "MAX_SAFE_INTEGER", "MIN_SAFE_INTEGER", "isSafeInteger"],
		"Object": ["is", "setPrototypeOf", "assign", "getOwnPropertySymbols", "values", "entries", "getOwnPropertyDescriptors"],
		"String": ["fromCodePoint", "raw"]
	};
	var methodNames = {
		"Array": ["fill", "find", "entries", "keys", "values", "copyWithin", "includes"],
		"String": ["codePointAt", "startsWith", "endsWith", "includes", "repeat", "normalize", "padEnd", "padStart"]
	};
	if (window.Proxy && window.Reflect) {
		objectNames.forEach(function (name) {
			if (!window[name]) {
				console.debug(name + "はブラウザでサポートされていない機能です。");
				return;
			}
			window[name] = new Proxy(window[name], {
				construct: function (target, args) {
					console.warn(name + "が実行されました。akashic-engineでは" + name + "の動作が保証されていないので、使用しないことを推奨します。");
					return Reflect.construct(target, args);
				}
			});
		});
	} else {
		console.debug("Proxyがブラウザでサポートされていないため、ES5でサポートされないオブジェクトの検知はできません。検知を可能にするためには、Proxyをサポートしているブラウザを利用してください。");
	}
	Object.keys(staticMethodNames).forEach(function(name) {
		staticMethodNames[name].forEach(function(methodName) {
			var method = name + "." + methodName;
			if (!window[name] || !window[name][methodName]) {
				console.debug(method + "はブラウザでサポートされていない機能です。");
				return;
			}
			var original = window[name][methodName];
			window[name][methodName] = function() {
				console.warn(method + "が実行されました。akashic-engineでは" + method + "の動作が保証されていないので、使用しないことを推奨します。");
				return original.apply(this, arguments);
			};
		});
	});
	Object.keys(methodNames).forEach(function(name) {
		methodNames[name].forEach(function(methodName) {
			var method = name + ".prototype." + methodName;
			if (!window[name] || !window[name].prototype[methodName]) {
				console.debug(method + "はブラウザでサポートされていない機能です。");
				return;
			}
			var original = window[name].prototype[methodName];
			window[name].prototype[methodName] = function() {
				console.warn(method + "が実行されました。akashic-engineでは" + method + "の動作が保証されていないので、使用しないことを推奨します。");
				return original.apply(this, arguments);
			};
		});
	});
}
