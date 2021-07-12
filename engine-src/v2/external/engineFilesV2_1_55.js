(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.engineFilesV2_1_55 = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require('./lib/main.node');
},{"./lib/main.node":2}],2:[function(require,module,exports){
(function() {
"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var g;
(function (g) {
    /**
     * アセット読み込み失敗時のエラーの種別。
     *
     * この値はあくまでもエラーメッセージ出力のための補助情報であり、
     * 網羅性・厳密性を追求したものではないことに注意。
     */
    var AssetLoadErrorType;
    (function (AssetLoadErrorType) {
        /**
         * 明示されていない(以下のいずれかかもしれないし、そうでないかもしれない)。
         */
        AssetLoadErrorType[AssetLoadErrorType["Unspecified"] = 0] = "Unspecified";
        /**
         * エンジンの再試行回数上限設定値を超えた。
         */
        AssetLoadErrorType[AssetLoadErrorType["RetryLimitExceeded"] = 1] = "RetryLimitExceeded";
        /**
         * ネットワークエラー。タイムアウトなど。
         */
        AssetLoadErrorType[AssetLoadErrorType["NetworkError"] = 2] = "NetworkError";
        /**
         * リクエストに問題があるエラー。HTTP 4XX など。
         */
        AssetLoadErrorType[AssetLoadErrorType["ClientError"] = 3] = "ClientError";
        /**
         * サーバ側のエラー。HTTP 5XX など。
         */
        AssetLoadErrorType[AssetLoadErrorType["ServerError"] = 4] = "ServerError";
    })(AssetLoadErrorType = g.AssetLoadErrorType || (g.AssetLoadErrorType = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 例外生成ファクトリ。
     * エンジン内部での例外生成に利用するもので、ゲーム開発者は通常本モジュールを利用する必要はない。
     */
    var ExceptionFactory;
    (function (ExceptionFactory) {
        function createAssertionError(message, cause) {
            var e = new Error(message);
            e.name = "AssertionError";
            e.cause = cause;
            return e;
        }
        ExceptionFactory.createAssertionError = createAssertionError;
        function createTypeMismatchError(methodName, expected, actual, cause) {
            var message = "Type mismatch on " + methodName + "," + " expected type is " + expected;
            if (arguments.length > 2) {
                // actual 指定時
                try {
                    var actualString;
                    if (actual && actual.constructor && actual.constructor.name) {
                        actualString = actual.constructor.name;
                    }
                    else {
                        actualString = typeof actual;
                    }
                    message += ", actual type is " + (actualString.length > 40 ? actualString.substr(0, 40) : actualString);
                }
                catch (ex) {
                    // メッセージ取得時に例外が発生したらactualの型情報出力はあきらめる
                }
            }
            message += ".";
            var e = new Error(message);
            e.name = "TypeMismatchError";
            e.cause = cause;
            e.expected = expected;
            e.actual = actual;
            return e;
        }
        ExceptionFactory.createTypeMismatchError = createTypeMismatchError;
        function createAssetLoadError(message, retriable, type, cause) {
            if (retriable === void 0) { retriable = true; }
            if (type === void 0) { type = g.AssetLoadErrorType.Unspecified; }
            var e = new Error(message);
            e.name = "AssetLoadError";
            e.cause = cause;
            e.retriable = retriable;
            e.type = type;
            return e;
        }
        ExceptionFactory.createAssetLoadError = createAssetLoadError;
    })(ExceptionFactory = g.ExceptionFactory || (g.ExceptionFactory = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * リソースの生成を行うクラス。
     *
     * このクラス (の実装クラス) のインスタンスはエンジンによって生成される。ゲーム開発者が生成する必要はない。
     * またこのクラスの各種アセット生成メソッドは、エンジンによって暗黙に呼び出されるものである。
     * 通常ゲーム開発者が呼び出す必要はない。
     */
    var ResourceFactory = /** @class */ (function () {
        function ResourceFactory() {
        }
        ResourceFactory.prototype.createSurfaceAtlas = function (width, height) {
            return new g.SurfaceAtlas(this.createSurface(width, height));
        };
        /**
         * 指定Surfaceから指定範囲を切り取ったSurfaceを返す。
         * 範囲を指定しない場合は、指定SurfaceをコピーしたSurfaceを返す。
         */
        ResourceFactory.prototype.createTrimmedSurface = function (targetSurface, targetArea) {
            var area = targetArea || { x: 0, y: 0, width: targetSurface.width, height: targetSurface.height };
            var surface = this.createSurface(area.width, area.height);
            var renderer = surface.renderer();
            renderer.begin();
            renderer.drawImage(targetSurface, area.x, area.y, area.width, area.height, 0, 0);
            renderer.end();
            return surface;
        };
        return ResourceFactory;
    }());
    g.ResourceFactory = ResourceFactory;
})(g || (g = {}));
var g;
(function (g) {
    var RequireCachedValue = /** @class */ (function () {
        function RequireCachedValue(value) {
            this._value = value;
        }
        /**
         * @private
         */
        RequireCachedValue.prototype._cachedValue = function () {
            return this._value;
        };
        return RequireCachedValue;
    }());
    g.RequireCachedValue = RequireCachedValue;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 乱数生成器。
     * `RandomGenerator#get()` によって、新しい乱数を生成することができる。
     */
    var RandomGenerator = /** @class */ (function () {
        function RandomGenerator(seed) {
            this.seed = seed;
            this[0] = this;
        }
        return RandomGenerator;
    }());
    g.RandomGenerator = RandomGenerator;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 各種リソースを表すクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
     * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
     * Scene#assets、またはGame#assetsによって取得して利用する。
     */
    var Asset = /** @class */ (function () {
        function Asset(id, path) {
            this.id = id;
            this.originalPath = path;
            this.path = this._assetPathFilter(path);
            this.onDestroyed = new g.Trigger();
        }
        Asset.prototype.destroy = function () {
            this.onDestroyed.fire(this);
            this.id = undefined;
            this.originalPath = undefined;
            this.path = undefined;
            this.onDestroyed.destroy();
            this.onDestroyed = undefined;
        };
        Asset.prototype.destroyed = function () {
            return this.id === undefined;
        };
        /**
         * 現在利用中で解放出来ない `Asset` かどうかを返す。
         * 戻り値は、利用中である場合真、でなければ偽である。
         *
         * 本メソッドは通常 `false` が返るべきである。
         * 例えば `Sprite` の元画像として使われているケース等では、その `Sprite` によって `Asset` は `Surface` に変換されているべきで、
         * `Asset` が利用中で解放出来ない状態になっていない事を各プラットフォームで保障する必要がある。
         *
         * 唯一、例外的に本メソッドが `true` を返すことがあるのは音楽を表す `Asset` である。
         * BGM等はシーンをまたいで演奏することもありえる上、
         * 演奏中のリソースのコピーを常に各プラットフォームに強制するにはコストがかかりすぎるため、
         * 本メソッドは `true` を返し、適切なタイミングで `Asset` が解放されるよう制御する必要がある。
         */
        Asset.prototype.inUse = function () {
            return false;
        };
        /**
         * @private
         */
        Asset.prototype._assetPathFilter = function (path) {
            // 拡張子の補完・読み替えが必要なassetはこれをオーバーライドすればよい。(対応形式が限定されるaudioなどの場合)
            return path;
        };
        return Asset;
    }());
    g.Asset = Asset;
    /**
     * 画像リソースを表すクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
     * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
     * Scene#assets、またはGame#assetsによって取得して利用する。
     *
     * width, heightでメタデータとして画像の大きさをとることは出来るが、
     * ゲーム開発者はそれ以外の情報を本クラスから直接は取得せず、Sprite等に本リソースを指定して利用する。
     */
    var ImageAsset = /** @class */ (function (_super) {
        __extends(ImageAsset, _super);
        function ImageAsset(id, assetPath, width, height) {
            var _this = _super.call(this, id, assetPath) || this;
            _this.width = width;
            _this.height = height;
            return _this;
        }
        ImageAsset.prototype.initialize = function (hint) {
            this.hint = hint;
        };
        return ImageAsset;
    }(Asset));
    g.ImageAsset = ImageAsset;
    /**
     * 動画リソースを表すクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
     * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
     * Scene#assets、またはGame#assetsによって取得して利用する。
     */
    var VideoAsset = /** @class */ (function (_super) {
        __extends(VideoAsset, _super);
        function VideoAsset(id, assetPath, width, height, system, loop, useRealSize) {
            var _this = _super.call(this, id, assetPath, width, height) || this;
            _this.realWidth = 0;
            _this.realHeight = 0;
            _this._system = system;
            _this._loop = loop;
            _this._useRealSize = useRealSize;
            return _this;
        }
        VideoAsset.prototype.play = function (_loop) {
            this.getPlayer().play(this);
            return this.getPlayer();
        };
        VideoAsset.prototype.stop = function () {
            this.getPlayer().stop();
        };
        VideoAsset.prototype.destroy = function () {
            this._system = undefined;
            _super.prototype.destroy.call(this);
        };
        return VideoAsset;
    }(ImageAsset));
    g.VideoAsset = VideoAsset;
    /**
     * 音リソースを表すクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
     * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
     * Scene#assets、またはGame#assetsによって取得して利用する。
     *
     * AudioAsset#playを呼び出す事で、その音を再生することが出来る。
     */
    var AudioAsset = /** @class */ (function (_super) {
        __extends(AudioAsset, _super);
        function AudioAsset(id, assetPath, duration, system, loop, hint) {
            var _this = _super.call(this, id, assetPath) || this;
            _this.duration = duration;
            _this.loop = loop;
            _this.hint = hint;
            _this._system = system;
            _this.data = undefined;
            return _this;
        }
        AudioAsset.prototype.play = function () {
            var player = this._system.createPlayer();
            player.play(this);
            this._lastPlayedPlayer = player;
            return player;
        };
        AudioAsset.prototype.stop = function () {
            var players = this._system.findPlayers(this);
            for (var i = 0; i < players.length; ++i)
                players[i].stop();
        };
        AudioAsset.prototype.inUse = function () {
            return this._system.findPlayers(this).length > 0;
        };
        AudioAsset.prototype.destroy = function () {
            if (this._system)
                this.stop();
            this.data = undefined;
            this._system = undefined;
            this._lastPlayedPlayer = undefined;
            _super.prototype.destroy.call(this);
        };
        return AudioAsset;
    }(Asset));
    g.AudioAsset = AudioAsset;
    /**
     * 文字列リソースを表すクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
     * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
     * Scene#assets、またはGame#assetsによって取得して利用する。
     *
     * TextAsset#dataによって、本リソースが保持する文字列を取得することが出来る。
     */
    var TextAsset = /** @class */ (function (_super) {
        __extends(TextAsset, _super);
        function TextAsset(id, assetPath) {
            var _this = _super.call(this, id, assetPath) || this;
            _this.data = undefined;
            return _this;
        }
        TextAsset.prototype.destroy = function () {
            this.data = undefined;
            _super.prototype.destroy.call(this);
        };
        return TextAsset;
    }(Asset));
    g.TextAsset = TextAsset;
    /**
     * スクリプトリソースを表すクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
     * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
     * Scene#assets、またはGame#assetsによって取得して利用する。
     *
     * ScriptAsset#executeによって、本リソースが表すスクリプトを実行し、その結果を受け取る事が出来る。
     * requireによる参照とは異なり、executeはキャッシュされないため、何度でも呼び出し違う結果を受け取ることが出来る。
     */
    var ScriptAsset = /** @class */ (function (_super) {
        __extends(ScriptAsset, _super);
        function ScriptAsset() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ScriptAsset.prototype.destroy = function () {
            this.script = undefined;
            _super.prototype.destroy.call(this);
        };
        return ScriptAsset;
    }(Asset));
    g.ScriptAsset = ScriptAsset;
})(g || (g = {}));
var g;
(function (g) {
    var AssetLoadingInfo = /** @class */ (function () {
        function AssetLoadingInfo(asset, handler) {
            this.asset = asset;
            this.handlers = [handler];
            this.errorCount = 0;
            this.loading = false;
        }
        return AssetLoadingInfo;
    }());
    function normalizeAudioSystemConfMap(confMap) {
        confMap = confMap || {};
        var systemDefaults = {
            music: {
                loop: true,
                hint: { streaming: true }
            },
            sound: {
                loop: false,
                hint: { streaming: false }
            }
        };
        for (var key in systemDefaults) {
            if (!(key in confMap)) {
                confMap[key] = systemDefaults[key];
            }
        }
        return confMap;
    }
    /**
     * `Asset` を管理するクラス。
     *
     * このクラスのインスタンスは `Game` に一つデフォルトで存在する(デフォルトアセットマネージャ)。
     * デフォルトアセットマネージャは、game.json に記述された通常のアセットを読み込むために利用される。
     *
     * ゲーム開発者は、game.json に記述のないリソースを取得するために、このクラスのインスタンスを独自に生成してよい。
     */
    var AssetManager = /** @class */ (function () {
        /**
         * `AssetManager` のインスタンスを生成する。
         *
         * @param game このインスタンスが属するゲーム
         * @param conf このアセットマネージャに与えるアセット定義。game.json の `"assets"` に相当。
         */
        function AssetManager(game, conf, audioSystemConfMap, moduleMainScripts) {
            this.game = game;
            this.configuration = this._normalize(conf || {}, normalizeAudioSystemConfMap(audioSystemConfMap));
            this._assets = {};
            this._liveAssetVirtualPathTable = {};
            this._liveAbsolutePathTable = {};
            this._moduleMainScripts = moduleMainScripts ? moduleMainScripts : {};
            this._refCounts = {};
            this._loadings = {};
        }
        /**
         * このインスタンスを破棄する。
         */
        AssetManager.prototype.destroy = function () {
            var assetIds = Object.keys(this._refCounts);
            for (var i = 0; i < assetIds.length; ++i) {
                this._releaseAsset(assetIds[i]);
            }
            this.game = undefined;
            this.configuration = undefined;
            this._assets = undefined;
            this._liveAssetVirtualPathTable = undefined;
            this._liveAbsolutePathTable = undefined;
            this._refCounts = undefined;
            this._loadings = undefined;
        };
        /**
         * このインスタンスが破棄済みであるかどうかを返す。
         */
        AssetManager.prototype.destroyed = function () {
            return this.game === undefined;
        };
        /**
         * `Asset` の読み込みを再試行する。
         *
         * 引数 `asset` は読み込みの失敗が (`Scene#assetLoadFail` で) 通知されたアセットでなければならない。
         * @param asset 読み込みを再試行するアセット
         */
        AssetManager.prototype.retryLoad = function (asset) {
            if (!this._loadings.hasOwnProperty(asset.id))
                throw g.ExceptionFactory.createAssertionError("AssetManager#retryLoad: invalid argument.");
            var loadingInfo = this._loadings[asset.id];
            if (loadingInfo.errorCount > AssetManager.MAX_ERROR_COUNT) {
                // DynamicAsset はエラーが規定回数超えた場合は例外にせず諦める。
                if (!this.configuration[asset.id])
                    return;
                throw g.ExceptionFactory.createAssertionError("AssetManager#retryLoad: too many retrying.");
            }
            if (!loadingInfo.loading) {
                loadingInfo.loading = true;
                asset._load(this);
            }
        };
        /**
         * このインスタンスに与えられた `AssetConfigurationMap` のうち、グローバルアセットのIDをすべて返す。
         */
        AssetManager.prototype.globalAssetIds = function () {
            var ret = [];
            var conf = this.configuration;
            for (var p in conf) {
                if (!conf.hasOwnProperty(p))
                    continue;
                if (conf[p].global)
                    ret.push(p);
            }
            return ret;
        };
        /**
         * アセットの取得を要求する。
         *
         * 要求したアセットが読み込み済みでない場合、読み込みが行われる。
         * 取得した結果は `handler` を通して通知される。
         * ゲーム開発者はこのメソッドを呼び出してアセットを取得した場合、
         * 同じアセットID(または取得したアセット)で `unrefAsset()` を呼び出さなければならない。
         *
         * @param assetIdOrConf 要求するアセットのIDまたは設定
         * @param handler 要求結果を受け取るハンドラ
         */
        AssetManager.prototype.requestAsset = function (assetIdOrConf, handler) {
            var assetId = typeof assetIdOrConf === "string" ? assetIdOrConf : assetIdOrConf.id;
            var waiting = false;
            var loadingInfo;
            if (this._assets.hasOwnProperty(assetId)) {
                ++this._refCounts[assetId];
                handler._onAssetLoad(this._assets[assetId]);
            }
            else if (this._loadings.hasOwnProperty(assetId)) {
                loadingInfo = this._loadings[assetId];
                loadingInfo.handlers.push(handler);
                ++this._refCounts[assetId];
                waiting = true;
            }
            else {
                var a = this._createAssetFor(assetIdOrConf);
                loadingInfo = new AssetLoadingInfo(a, handler);
                this._loadings[assetId] = loadingInfo;
                this._refCounts[assetId] = 1;
                waiting = true;
                loadingInfo.loading = true;
                a._load(this);
            }
            return waiting;
        };
        /**
         * アセットの参照カウントを減らす。
         * 引数の各要素で `unrefAsset()` を呼び出す。
         *
         * @param assetOrId 参照カウントを減らすアセットまたはアセットID
         */
        AssetManager.prototype.unrefAsset = function (assetOrId) {
            var assetId = typeof assetOrId === "string" ? assetOrId : assetOrId.id;
            if (--this._refCounts[assetId] > 0)
                return;
            this._releaseAsset(assetId);
        };
        /**
         * 複数のアセットの取得を要求する。
         * 引数の各要素で `requestAsset()` を呼び出す。
         *
         * @param assetIdOrConfs 取得するアセットのIDまたはアセット定義
         * @param handler 取得の結果を受け取るハンドラ
         */
        AssetManager.prototype.requestAssets = function (assetIdOrConfs, handler) {
            var waitingCount = 0;
            for (var i = 0, len = assetIdOrConfs.length; i < len; ++i) {
                if (this.requestAsset(assetIdOrConfs[i], handler)) {
                    ++waitingCount;
                }
            }
            return waitingCount;
        };
        /**
         * 複数のアセットを解放する。
         * 引数の各要素で `unrefAsset()` を呼び出す。
         *
         * @param assetOrIds 参照カウントを減らすアセットまたはアセットID
         * @private
         */
        AssetManager.prototype.unrefAssets = function (assetOrIds) {
            for (var i = 0, len = assetOrIds.length; i < len; ++i) {
                this.unrefAsset(assetOrIds[i]);
            }
        };
        AssetManager.prototype._normalize = function (configuration, audioSystemConfMap) {
            var ret = {};
            if (!(configuration instanceof Object))
                throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: invalid arguments.");
            for (var p in configuration) {
                if (!configuration.hasOwnProperty(p))
                    continue;
                var conf = Object.create(configuration[p]);
                if (!conf.path) {
                    throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: No path given for: " + p);
                }
                if (!conf.virtualPath) {
                    throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: No virtualPath given for: " + p);
                }
                if (!conf.type) {
                    throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: No type given for: " + p);
                }
                if (conf.type === "image") {
                    if (typeof conf.width !== "number")
                        throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong width given for the image asset: " + p);
                    if (typeof conf.height !== "number")
                        throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong height given for the image asset: " + p);
                }
                if (conf.type === "audio") {
                    // durationというメンバは後から追加したため、古いgame.jsonではundefinedになる場合がある
                    if (conf.duration === undefined)
                        conf.duration = 0;
                    var audioSystemConf = audioSystemConfMap[conf.systemId];
                    if (conf.loop === undefined) {
                        conf.loop = !!audioSystemConf && !!audioSystemConf.loop;
                    }
                    if (conf.hint === undefined) {
                        conf.hint = audioSystemConf ? audioSystemConf.hint : {};
                    }
                }
                if (conf.type === "video") {
                    if (!conf.useRealSize) {
                        if (typeof conf.width !== "number")
                            throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong width given for the video asset: " + p);
                        if (typeof conf.height !== "number")
                            throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong height given for the video asset: " + p);
                        conf.useRealSize = false;
                    }
                }
                if (!conf.global)
                    conf.global = false;
                ret[p] = conf;
            }
            return ret;
        };
        /**
         * @private
         */
        AssetManager.prototype._createAssetFor = function (idOrConf) {
            var id;
            var uri;
            var conf;
            if (typeof idOrConf === "string") {
                id = idOrConf;
                conf = this.configuration[id];
                uri = this.configuration[id].path;
            }
            else {
                var dynConf = idOrConf;
                id = dynConf.id;
                conf = dynConf;
                uri = dynConf.uri;
            }
            var resourceFactory = this.game.resourceFactory;
            if (!conf)
                throw g.ExceptionFactory.createAssertionError("AssetManager#_createAssetFor: unknown asset ID: " + id);
            switch (conf.type) {
                case "image":
                    var asset = resourceFactory.createImageAsset(id, uri, conf.width, conf.height);
                    asset.initialize(conf.hint);
                    return asset;
                case "audio":
                    var system = conf.systemId ? this.game.audio[conf.systemId] : this.game.audio[this.game.defaultAudioSystemId];
                    return resourceFactory.createAudioAsset(id, uri, conf.duration, system, conf.loop, conf.hint);
                case "text":
                    return resourceFactory.createTextAsset(id, uri);
                case "script":
                    return resourceFactory.createScriptAsset(id, uri);
                case "video":
                    // VideoSystemはまだ中身が定義されていなが、将来のためにVideoAssetにVideoSystemを渡すという体裁だけが整えられている。
                    // 以上を踏まえ、ここでは簡単のために都度新たなVideoSystemインスタンスを生成している。
                    return resourceFactory.createVideoAsset(id, uri, conf.width, conf.height, new g.VideoSystem(), conf.loop, conf.useRealSize);
                default:
                    throw g.ExceptionFactory.createAssertionError("AssertionError#_createAssetFor: unknown asset type " + conf.type + " for asset ID: " + id);
            }
        };
        AssetManager.prototype._releaseAsset = function (assetId) {
            var asset = this._assets[assetId] || (this._loadings[assetId] && this._loadings[assetId].asset);
            var path;
            if (asset) {
                path = asset.path;
                if (asset.inUse()) {
                    if (asset instanceof g.AudioAsset) {
                        asset._system.requestDestroy(asset);
                    }
                    else if (asset instanceof g.VideoAsset) {
                        // NOTE: 一旦再生完了を待たずに破棄することにする
                        // TODO: 再生中の動画を破棄するタイミングをどのように扱うか検討し実装
                        asset.destroy();
                    }
                    else {
                        throw g.ExceptionFactory.createAssertionError("AssetManager#unrefAssets: Unsupported in-use " + asset.id);
                    }
                }
                else {
                    asset.destroy();
                }
            }
            delete this._refCounts[assetId];
            delete this._loadings[assetId];
            delete this._assets[assetId];
            if (this.configuration[assetId]) {
                var virtualPath = this.configuration[assetId].virtualPath;
                if (virtualPath && this._liveAssetVirtualPathTable.hasOwnProperty(virtualPath))
                    delete this._liveAssetVirtualPathTable[virtualPath];
                if (path && this._liveAbsolutePathTable.hasOwnProperty(path))
                    delete this._liveAbsolutePathTable[path];
            }
        };
        /**
         * 現在ロード中のアセットの数。(デバッグ用; 直接の用途はない)
         * @private
         */
        AssetManager.prototype._countLoadingAsset = function () {
            return Object.keys(this._loadings).length;
        };
        /**
         * @private
         */
        AssetManager.prototype._onAssetError = function (asset, error) {
            // ロード中に Scene が破棄されていた場合などで、asset が破棄済みになることがある
            if (this.destroyed() || asset.destroyed())
                return;
            var loadingInfo = this._loadings[asset.id];
            var hs = loadingInfo.handlers;
            loadingInfo.loading = false;
            ++loadingInfo.errorCount;
            if (loadingInfo.errorCount > AssetManager.MAX_ERROR_COUNT && error.retriable) {
                error = g.ExceptionFactory.createAssetLoadError("Retry limit exceeded", false, g.AssetLoadErrorType.RetryLimitExceeded, error);
            }
            if (!error.retriable)
                delete this._loadings[asset.id];
            for (var i = 0; i < hs.length; ++i)
                hs[i]._onAssetError(asset, error, this);
        };
        /**
         * @private
         */
        AssetManager.prototype._onAssetLoad = function (asset) {
            // ロード中に Scene が破棄されていた場合などで、asset が破棄済みになることがある
            if (this.destroyed() || asset.destroyed())
                return;
            var loadingInfo = this._loadings[asset.id];
            loadingInfo.loading = false;
            delete this._loadings[asset.id];
            this._assets[asset.id] = asset;
            // DynamicAsset の場合は configuration に書かれていないので以下の判定が偽になる
            if (this.configuration[asset.id]) {
                var virtualPath = this.configuration[asset.id].virtualPath;
                if (!this._liveAssetVirtualPathTable.hasOwnProperty(virtualPath)) {
                    this._liveAssetVirtualPathTable[virtualPath] = asset;
                }
                else {
                    if (this._liveAssetVirtualPathTable[virtualPath].path !== asset.path)
                        throw g.ExceptionFactory.createAssertionError("AssetManager#_onAssetLoad(): duplicated asset path");
                }
                if (!this._liveAbsolutePathTable.hasOwnProperty(asset.path))
                    this._liveAbsolutePathTable[asset.path] = virtualPath;
            }
            var hs = loadingInfo.handlers;
            for (var i = 0; i < hs.length; ++i)
                hs[i]._onAssetLoad(asset);
        };
        AssetManager.MAX_ERROR_COUNT = 3;
        return AssetManager;
    }());
    g.AssetManager = AssetManager;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * node.js の require() ライクな読み込み処理を行い、その結果を返す。
     *
     * node.jsのrequireに限りなく近いモデルでrequireする。
     * ただしアセットIDで該当すればそちらを優先する。また node.js のコアモジュールには対応していない。
     * 通常、ゲーム開発者が利用するのは `Module#require()` であり、このメソッドはその内部実装を提供する。
     * @param game requireを実行するコンテキストを表すGameインスタンス
     * @param path requireのパス。相対パスと、Asset識別名を利用することが出来る。
     *              なお、./xxx.json のようにjsonを指定する場合、そのAssetはTextAssetである必要がある。
     *              その他の形式である場合、そのAssetはScriptAssetである必要がある。
     * @param currentModule このrequireを実行した Module
     * @returns {any} スクリプト実行結果。通常はScriptAsset#executeの結果。
     *                 例外的に、jsonであればTextAsset#dataをJSON.parseした結果が返る
     */
    function _require(game, path, currentModule) {
        // Node.js の require の挙動については http://nodejs.jp/nodejs.org_ja/api/modules.html も参照。
        var targetScriptAsset;
        var resolvedPath;
        var liveAssetVirtualPathTable = game._assetManager._liveAssetVirtualPathTable;
        var moduleMainScripts = game._assetManager._moduleMainScripts;
        // 0. アセットIDらしい場合はまず当該アセットを探す
        if (path.indexOf("/") === -1) {
            if (game._assetManager._assets.hasOwnProperty(path)) {
                targetScriptAsset = game._assetManager._assets[path];
                resolvedPath = game._assetManager._liveAbsolutePathTable[targetScriptAsset.path];
            }
        }
        // 1. If X is a core module,
        // (何もしない。コアモジュールには対応していない。ゲーム開発者は自分でコアモジュールへの依存を解決する必要がある)
        if (/^\.\/|^\.\.\/|^\//.test(path)) {
            // 2. If X begins with './' or '/' or '../'
            if (currentModule) {
                if (!currentModule._virtualDirname)
                    throw g.ExceptionFactory.createAssertionError("g._require: require from DynamicAsset is not supported");
                resolvedPath = g.PathUtil.resolvePath(currentModule._virtualDirname, path);
            }
            else {
                if (!/^\.\//.test(path))
                    throw g.ExceptionFactory.createAssertionError("g._require: entry point path must start with './'");
                resolvedPath = path.substring(2);
            }
            if (game._scriptCaches.hasOwnProperty(resolvedPath)) {
                return game._scriptCaches[resolvedPath]._cachedValue();
            }
            else if (game._scriptCaches.hasOwnProperty(resolvedPath + ".js")) {
                return game._scriptCaches[resolvedPath + ".js"]._cachedValue();
            }
            // 2.a. LOAD_AS_FILE(Y + X)
            if (!targetScriptAsset)
                targetScriptAsset = g.Util.findAssetByPathAsFile(resolvedPath, liveAssetVirtualPathTable);
            // 2.b. LOAD_AS_DIRECTORY(Y + X)
            if (!targetScriptAsset)
                targetScriptAsset = g.Util.findAssetByPathAsDirectory(resolvedPath, liveAssetVirtualPathTable);
        }
        else {
            // 3. LOAD_NODE_MODULES(X, dirname(Y))
            // `path` は node module の名前であると仮定して探す
            // akashic-engine独自仕様: 対象の `path` が `moduleMainScripts` に指定されていたらそちらを参照する
            if (moduleMainScripts[path]) {
                resolvedPath = moduleMainScripts[path];
                targetScriptAsset = game._assetManager._liveAssetVirtualPathTable[resolvedPath];
            }
            if (!targetScriptAsset) {
                var dirs = currentModule ? currentModule.paths : [];
                dirs.push("node_modules");
                for (var i = 0; i < dirs.length; ++i) {
                    var dir = dirs[i];
                    resolvedPath = g.PathUtil.resolvePath(dir, path);
                    targetScriptAsset = g.Util.findAssetByPathAsFile(resolvedPath, liveAssetVirtualPathTable);
                    if (targetScriptAsset)
                        break;
                    targetScriptAsset = g.Util.findAssetByPathAsDirectory(resolvedPath, liveAssetVirtualPathTable);
                    if (targetScriptAsset)
                        break;
                }
            }
        }
        if (targetScriptAsset) {
            if (game._scriptCaches.hasOwnProperty(resolvedPath))
                return game._scriptCaches[resolvedPath]._cachedValue();
            if (targetScriptAsset instanceof g.ScriptAsset) {
                var context = new g.ScriptAssetContext(game, targetScriptAsset);
                game._scriptCaches[resolvedPath] = context;
                return context._executeScript(currentModule);
            }
            else if (targetScriptAsset instanceof g.TextAsset) {
                // JSONの場合の特殊挙動をトレースするためのコード。node.jsの仕様に準ずる
                if (targetScriptAsset && g.PathUtil.resolveExtname(path) === ".json") {
                    // Note: node.jsではここでBOMの排除をしているが、いったんakashicでは排除しないで実装
                    var cache = (game._scriptCaches[resolvedPath] = new g.RequireCachedValue(JSON.parse(targetScriptAsset.data)));
                    return cache._cachedValue();
                }
            }
        }
        throw g.ExceptionFactory.createAssertionError("g._require: can not find module: " + path);
    }
    g._require = _require;
    /**
     * Node.js が提供する module の互換クラス。
     */
    var Module = /** @class */ (function () {
        function Module(game, id, path) {
            var _this = this;
            var dirname = g.PathUtil.resolveDirname(path);
            // `virtualPath` と `virtualDirname` は　`DynamicAsset` の場合は `undefined` になる。
            var virtualPath = game._assetManager._liveAbsolutePathTable[path];
            var virtualDirname = virtualPath ? g.PathUtil.resolveDirname(virtualPath) : undefined;
            var _g = Object.create(g, {
                game: {
                    value: game,
                    enumerable: true
                },
                filename: {
                    value: path,
                    enumerable: true
                },
                dirname: {
                    value: dirname,
                    enumerable: true
                },
                module: {
                    value: this,
                    writable: true,
                    enumerable: true,
                    configurable: true
                }
            });
            this.id = id;
            this.filename = path;
            this.exports = {};
            this.parent = null; // Node.js と互換
            this.loaded = false;
            this.children = [];
            this.paths = virtualDirname ? g.PathUtil.makeNodeModulePaths(virtualDirname) : [];
            this._dirname = dirname;
            this._virtualDirname = virtualDirname;
            this._g = _g;
            // メソッドとしてではなく単体で呼ばれるのでメソッドにせずここで実体を代入する
            this.require = function (path) {
                return path === "g" ? _g : g._require(game, path, _this);
            };
        }
        return Module;
    }());
    g.Module = Module;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * `ScriptAsset` の実行コンテキスト。
     * 通常スクリプトアセットを実行するためにはこのクラスを経由する。
     *
     * ゲーム開発者がこのクラスを利用する必要はない。
     * スクリプトアセットを実行する場合は、暗黙にこのクラスを利用する `require()` を用いること。
     */
    var ScriptAssetContext = /** @class */ (function () {
        function ScriptAssetContext(game, asset) {
            this._game = game;
            this._asset = asset;
            this._module = new g.Module(game, asset.path, asset.path);
            this._g = this._module._g;
            this._started = false;
        }
        /**
         * @private
         */
        ScriptAssetContext.prototype._cachedValue = function () {
            if (!this._started)
                throw g.ExceptionFactory.createAssertionError("ScriptAssetContext#_cachedValue: not executed yet.");
            return this._module.exports;
        };
        /**
         * @private
         */
        ScriptAssetContext.prototype._executeScript = function (currentModule) {
            if (this._started)
                return this._module.exports;
            if (currentModule) {
                // Node.js 互換挙動: Module#parent は一番最初に require() した module になる
                this._module.parent = currentModule;
                // Node.js 互換挙動: 親 module の children には自身が実行中の段階で既に追加されている
                currentModule.children.push(this._module);
            }
            this._started = true;
            this._asset.execute(this._g);
            this._module.loaded = true;
            return this._module.exports;
        };
        return ScriptAssetContext;
    }());
    g.ScriptAssetContext = ScriptAssetContext;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 変換行列を一般的なJavaScriptのみで表したクラス。
     * 通常ゲーム開発者が本クラスを直接利用する事はない。
     * 各フィールド、メソッドの詳細は `Matrix` インターフェースの説明を参照。
     */
    var PlainMatrix = /** @class */ (function () {
        function PlainMatrix(widthOrSrc, height, scaleX, scaleY, angle, anchorX, anchorY) {
            // TODO: (GAMEDEV-845) Float32Arrayの方が速いらしいので、polyfillして使うかどうか検討
            if (widthOrSrc === undefined) {
                this._modified = false;
                this._matrix = [1, 0, 0, 1, 0, 0];
            }
            else if (typeof widthOrSrc === "number") {
                this._modified = false;
                this._matrix = new Array(6);
                if (anchorX != null && anchorY != null) {
                    this.updateWithAnchor(widthOrSrc, height, scaleX, scaleY, angle, 0, 0, anchorX, anchorY);
                }
                else {
                    this.update(widthOrSrc, height, scaleX, scaleY, angle, 0, 0);
                }
            }
            else {
                this._modified = widthOrSrc._modified;
                this._matrix = [
                    widthOrSrc._matrix[0],
                    widthOrSrc._matrix[1],
                    widthOrSrc._matrix[2],
                    widthOrSrc._matrix[3],
                    widthOrSrc._matrix[4],
                    widthOrSrc._matrix[5]
                ];
            }
        }
        PlainMatrix.prototype.update = function (width, height, scaleX, scaleY, angle, x, y) {
            // ここで求める変換行列Mは、引数で指定された変形を、拡大・回転・平行移動の順に適用するものである。
            // 変形の原点は引数で指定された矩形の中心、すなわち (width/2, height/2) の位置である。従って
            //    M = A^-1 T R S A
            // である。ただしここでA, S, R, Tは、それぞれ以下を表す変換行列である:
            //    A: 矩形の中心を原点に移す(平行移動する)変換
            //    S: X軸方向にscaleX倍、Y軸方向にscaleY倍する変換
            //    R: angle度だけ回転する変換
            //    T: x, yの値だけ平行移動する変換
            // それらは次のように表せる:
            //           1    0   -w           sx    0    0            c   -s    0            1    0    x
            //    A = [  0    1   -h]    S = [  0   sy    0]    R = [  s    c    0]    T = [  0    1    y]
            //           0    0    1            0    0    1            0    0    1            0    0    1
            // ここで sx, sy は scaleX, scaleY であり、c, s は cos(theta), sin(theta)
            // (ただし theta = angle * PI / 180)、w = (width / 2), h = (height / 2) である。
            // 以下の実装は、M の各要素をそれぞれ計算して直接求めている。
            var r = (angle * Math.PI) / 180;
            var _cos = Math.cos(r);
            var _sin = Math.sin(r);
            var a = _cos * scaleX;
            var b = _sin * scaleX;
            var c = _sin * scaleY;
            var d = _cos * scaleY;
            var w = width / 2;
            var h = height / 2;
            this._matrix[0] = a;
            this._matrix[1] = b;
            this._matrix[2] = -c;
            this._matrix[3] = d;
            this._matrix[4] = -a * w + c * h + w + x;
            this._matrix[5] = -b * w - d * h + h + y;
        };
        PlainMatrix.prototype.updateWithAnchor = function (width, height, scaleX, scaleY, angle, x, y, anchorX, anchorY) {
            // ここで求める変換行列Mは、引数で指定された変形を、拡大・回転・平行移動の順に適用するものである。
            // 変形の原点は引数で指定された位置の原寸大、すなわち (anchorX * width, anchorY * height) の位置である。従って
            //    M = A^-1 T R S A
            // である。ただしここでA, S, R, Tは、それぞれ以下を表す変換行列である:
            //    A: アンカーを原点に移す(平行移動する)変換
            //    S: X軸方向にscaleX倍、Y軸方向にscaleY倍する変換
            //    R: angle度だけ回転する変換
            //    T: x, yの値だけ平行移動する変換
            // それらは次のように表せる:
            //           1    0   -w           sx    0    0            c   -s    0            1    0    x-w
            //    A = [  0    1   -h]    S = [  0   sy    0]    R = [  s    c    0]    T = [  0    1    y-h]
            //           0    0    1            0    0    1            0    0    1            0    0    1
            // ここで sx, sy は scaleX, scaleY であり、c, s は cos(theta), sin(theta)
            // (ただし theta = angle * PI / 180)、w = anchorX * width, h = anchorY * height である。
            // 以下の実装は、M の各要素をそれぞれ計算して直接求めている。
            var r = (angle * Math.PI) / 180;
            var _cos = Math.cos(r);
            var _sin = Math.sin(r);
            var a = _cos * scaleX;
            var b = _sin * scaleX;
            var c = _sin * scaleY;
            var d = _cos * scaleY;
            var w = anchorX * width;
            var h = anchorY * height;
            this._matrix[0] = a;
            this._matrix[1] = b;
            this._matrix[2] = -c;
            this._matrix[3] = d;
            this._matrix[4] = -a * w + c * h + x;
            this._matrix[5] = -b * w - d * h + y;
        };
        PlainMatrix.prototype.updateByInverse = function (width, height, scaleX, scaleY, angle, x, y) {
            // ここで求める変換行列は、update() の求める行列Mの逆行列、M^-1である。update() のコメントに記述のとおり、
            //    M = A^-1 T R S A
            // であるから、
            //    M^-1 = A^-1 S^-1 R^-1 T^-1 A
            // それぞれは次のように表せる:
            //              1    0    w             1/sx     0    0               c    s    0               1    0   -x
            //    A^-1 = [  0    1    h]    S^-1 = [   0  1/sy    0]    R^-1 = [ -s    c    0]    T^-1 = [  0    1   -y]
            //              0    0    1                0     0    1               0    0    1               0    0    1
            // ここで各変数は update() のコメントのものと同様である。
            // 以下の実装は、M^-1 の各要素をそれぞれ計算して直接求めている。
            var r = (angle * Math.PI) / 180;
            var _cos = Math.cos(r);
            var _sin = Math.sin(r);
            var a = _cos / scaleX;
            var b = _sin / scaleY;
            var c = _sin / scaleX;
            var d = _cos / scaleY;
            var w = width / 2;
            var h = height / 2;
            this._matrix[0] = a;
            this._matrix[1] = -b;
            this._matrix[2] = c;
            this._matrix[3] = d;
            this._matrix[4] = -a * (w + x) - c * (h + y) + w;
            this._matrix[5] = b * (w + x) - d * (h + y) + h;
        };
        PlainMatrix.prototype.updateByInverseWithAnchor = function (width, height, scaleX, scaleY, angle, x, y, anchorX, anchorY) {
            // ここで求める変換行列は、updateWithAnchor() の求める行列Mの逆行列、M^-1である。updateWithAnchor() のコメントに記述のとおり、
            //    M = A^-1 T R S A
            // であるから、
            //    M^-1 = A^-1 S^-1 R^-1 T^-1 A
            // それぞれは次のように表せる:
            //              1    0    w             1/sx     0    0               c    s    0               1    0   -x+w
            //    A^-1 = [  0    1    h]    S^-1 = [   0  1/sy    0]    R^-1 = [ -s    c    0]    T^-1 = [  0    1   -y+h]
            //              0    0    1                0     0    1               0    0    1               0    0    1
            // ここで各変数は updateWithAnchor() のコメントのものと同様である。
            // 以下の実装は、M^-1 の各要素をそれぞれ計算して直接求めている。
            var r = (angle * Math.PI) / 180;
            var _cos = Math.cos(r);
            var _sin = Math.sin(r);
            var a = _cos / scaleX;
            var b = _sin / scaleY;
            var c = _sin / scaleX;
            var d = _cos / scaleY;
            var w = anchorX * width;
            var h = anchorY * height;
            this._matrix[0] = a;
            this._matrix[1] = -b;
            this._matrix[2] = c;
            this._matrix[3] = d;
            this._matrix[4] = -a * x - c * y + w;
            this._matrix[5] = b * x - d * y + h;
        };
        PlainMatrix.prototype.multiply = function (matrix) {
            var m1 = this._matrix;
            var m2 = matrix._matrix;
            var m10 = m1[0];
            var m11 = m1[1];
            var m12 = m1[2];
            var m13 = m1[3];
            m1[0] = m10 * m2[0] + m12 * m2[1];
            m1[1] = m11 * m2[0] + m13 * m2[1];
            m1[2] = m10 * m2[2] + m12 * m2[3];
            m1[3] = m11 * m2[2] + m13 * m2[3];
            m1[4] = m10 * m2[4] + m12 * m2[5] + m1[4];
            m1[5] = m11 * m2[4] + m13 * m2[5] + m1[5];
        };
        PlainMatrix.prototype.multiplyNew = function (matrix) {
            var ret = this.clone();
            ret.multiply(matrix);
            return ret;
        };
        PlainMatrix.prototype.reset = function (x, y) {
            this._matrix[0] = 1;
            this._matrix[1] = 0;
            this._matrix[2] = 0;
            this._matrix[3] = 1;
            this._matrix[4] = x || 0;
            this._matrix[5] = y || 0;
        };
        PlainMatrix.prototype.clone = function () {
            return new PlainMatrix(this);
        };
        PlainMatrix.prototype.multiplyInverseForPoint = function (point) {
            var m = this._matrix;
            // id = inverse of the determinant
            var _id = 1 / (m[0] * m[3] + m[2] * -m[1]);
            return {
                x: m[3] * _id * point.x + -m[2] * _id * point.y + (m[5] * m[2] - m[4] * m[3]) * _id,
                y: m[0] * _id * point.y + -m[1] * _id * point.x + (-m[5] * m[0] + m[4] * m[1]) * _id
            };
        };
        PlainMatrix.prototype.scale = function (x, y) {
            var m = this._matrix;
            m[0] *= x;
            m[1] *= y;
            m[2] *= x;
            m[3] *= y;
            m[4] *= x;
            m[5] *= y;
        };
        PlainMatrix.prototype.multiplyPoint = function (point) {
            var m = this._matrix;
            var x = m[0] * point.x + m[2] * point.y + m[4];
            var y = m[1] * point.x + m[3] * point.y + m[5];
            return { x: x, y: y };
        };
        return PlainMatrix;
    }());
    g.PlainMatrix = PlainMatrix;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * ユーティリティ。
     */
    var Util;
    (function (Util) {
        /**
         * 2点間(P1..P2)の距離(pixel)を返す。
         * @param {number} p1x P1-X
         * @param {number} p1y P1-Y
         * @param {number} p2x P2-X
         * @param {number} p2y P2-Y
         */
        function distance(p1x, p1y, p2x, p2y) {
            return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
        }
        Util.distance = distance;
        /**
         * 2点間(P1..P2)の距離(pixel)を返す。
         * @param {CommonOffset} p1 座標1
         * @param {CommonOffset} p2 座標2
         */
        function distanceBetweenOffsets(p1, p2) {
            return Util.distance(p1.x, p1.y, p2.x, p2.y);
        }
        Util.distanceBetweenOffsets = distanceBetweenOffsets;
        /**
         * 2つの矩形の中心座標(P1..P2)間の距離(pixel)を返す。
         * @param {CommonArea} p1 矩形1
         * @param {CommonArea} p2 矩形2
         */
        function distanceBetweenAreas(p1, p2) {
            return Util.distance(p1.x + p1.width / 2, p1.y + p1.height / 2, p2.x + p2.width / 2, p2.y + p2.height / 2);
        }
        Util.distanceBetweenAreas = distanceBetweenAreas;
        // Note: オーバーロードされているのでjsdoc省略
        function createMatrix(width, height, scaleX, scaleY, angle, anchorX, anchorY) {
            // Note: asm.js対応環境ではasm.js対応のMatrixを生成するなどしたいため、オーバーヘッドを許容する
            if (width === undefined)
                return new g.PlainMatrix();
            return new g.PlainMatrix(width, height, scaleX, scaleY, angle, anchorX, anchorY);
        }
        Util.createMatrix = createMatrix;
        /**
         * e の描画内容を持つ Sprite を生成する。
         * @param scene 作成したSpriteを登録するScene
         * @param e Sprite化したいE
         * @param camera 使用カメラ
         */
        function createSpriteFromE(scene, e, camera) {
            var oldX = e.x;
            var oldY = e.y;
            var x = 0;
            var y = 0;
            var width = e.width;
            var height = e.height;
            var boundingRect = e.calculateBoundingRect(camera);
            if (!boundingRect) {
                throw g.ExceptionFactory.createAssertionError("Util#createSpriteFromE: camera must look e");
            }
            width = boundingRect.right - boundingRect.left;
            height = boundingRect.bottom - boundingRect.top;
            if (boundingRect.left < e.x)
                x = e.x - boundingRect.left;
            if (boundingRect.top < e.y)
                y = e.y - boundingRect.top;
            e.moveTo(x, y);
            // 再描画フラグを立てたくないために e._matrix を直接触っている
            if (e._matrix)
                e._matrix._modified = true;
            var surface = scene.game.resourceFactory.createSurface(Math.ceil(width), Math.ceil(height));
            var renderer = surface.renderer();
            renderer.begin();
            e.render(renderer, camera);
            renderer.end();
            var s = new g.Sprite({
                scene: scene,
                src: surface,
                width: width,
                height: height
            });
            s.moveTo(boundingRect.left, boundingRect.top);
            e.moveTo(oldX, oldY);
            if (e._matrix)
                e._matrix._modified = true;
            return s;
        }
        Util.createSpriteFromE = createSpriteFromE;
        /**
         * scene の描画内容を持つ Sprite を生成する。
         * @param toScene 作ったSpriteを登録するScene
         * @param fromScene Sprite化したいScene
         * @param camera 使用カメラ
         */
        function createSpriteFromScene(toScene, fromScene, camera) {
            var surface = toScene.game.resourceFactory.createSurface(Math.ceil(fromScene.game.width), Math.ceil(fromScene.game.height));
            var renderer = surface.renderer();
            renderer.begin();
            var children = fromScene.children;
            for (var i = 0; i < children.length; ++i)
                children[i].render(renderer, camera);
            renderer.end();
            return new g.Sprite({
                scene: toScene,
                src: surface,
                width: fromScene.game.width,
                height: fromScene.game.height
            });
        }
        Util.createSpriteFromScene = createSpriteFromScene;
        /**
         * 引数 `src` が `undefined` または `Surface` でそのまま返す。
         * そうでなくかつ `ImageAsset` であれば `Surface` に変換して返す。
         *
         * @param src
         */
        function asSurface(src) {
            // Note: TypeScriptのtype guardを活用するため、あえて1つのifで1つの型しか判定していない
            if (!src)
                return src;
            if (src instanceof g.Surface)
                return src;
            if (src instanceof g.ImageAsset)
                return src.asSurface();
            throw g.ExceptionFactory.createTypeMismatchError("Util#asSurface", "ImageAsset|Surface", src);
        }
        Util.asSurface = asSurface;
        /**
         * 与えられたパス文字列がファイルパスであると仮定して、対応するアセットを探す。
         * 見つかった場合そのアセットを、そうでない場合 `undefined` を返す。
         * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
         *
         * @param resolvedPath パス文字列
         * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
         */
        function findAssetByPathAsFile(resolvedPath, liveAssetPathTable) {
            if (liveAssetPathTable.hasOwnProperty(resolvedPath))
                return liveAssetPathTable[resolvedPath];
            if (liveAssetPathTable.hasOwnProperty(resolvedPath + ".js"))
                return liveAssetPathTable[resolvedPath + ".js"];
            return undefined;
        }
        Util.findAssetByPathAsFile = findAssetByPathAsFile;
        /**
         * 与えられたパス文字列がディレクトリパスであると仮定して、対応するアセットを探す。
         * 見つかった場合そのアセットを、そうでない場合 `undefined` を返す。
         * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
         * ディレクトリ内に package.json が存在する場合、package.json 自体もアセットとして
         * `liveAssetPathTable` から参照可能でなければならないことに注意。
         *
         * @param resolvedPath パス文字列
         * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
         */
        function findAssetByPathAsDirectory(resolvedPath, liveAssetPathTable) {
            var path;
            path = resolvedPath + "/package.json";
            if (liveAssetPathTable.hasOwnProperty(path) && liveAssetPathTable[path] instanceof g.TextAsset) {
                var pkg = JSON.parse(liveAssetPathTable[path].data);
                if (pkg && typeof pkg.main === "string") {
                    var asset = Util.findAssetByPathAsFile(g.PathUtil.resolvePath(resolvedPath, pkg.main), liveAssetPathTable);
                    if (asset)
                        return asset;
                }
            }
            path = resolvedPath + "/index.js";
            if (liveAssetPathTable.hasOwnProperty(path))
                return liveAssetPathTable[path];
            return undefined;
        }
        Util.findAssetByPathAsDirectory = findAssetByPathAsDirectory;
        /**
         * idx文字目の文字のchar codeを返す。
         *
         * これはString#charCodeAt()と次の点で異なる。
         * - idx文字目が上位サロゲートの時これを16bit左シフトし、idx+1文字目の下位サロゲートと論理和をとった値を返す。
         * - idx文字目が下位サロゲートの時nullを返す。
         *
         * @param str 文字を取り出される文字列
         * @param idx 取り出される文字の位置
         */
        // highly based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
        function charCodeAt(str, idx) {
            var code = str.charCodeAt(idx);
            if (0xd800 <= code && code <= 0xdbff) {
                var hi = code;
                var low = str.charCodeAt(idx + 1);
                return (hi << 16) | low;
            }
            if (0xdc00 <= code && code <= 0xdfff) {
                // Low surrogate
                return null;
            }
            return code;
        }
        Util.charCodeAt = charCodeAt;
        /**
         * サーフェスのアニメーティングイベントへのハンドラ登録。
         *
         * これはゲームエンジンが利用するものであり、ゲーム開発者が呼び出す必要はない。
         *
         * @param animatingHandler アニメーティングハンドラ
         * @param surface サーフェス
         */
        function setupAnimatingHandler(animatingHandler, surface) {
            if (surface.isDynamic) {
                surface.animatingStarted.add(animatingHandler._onAnimatingStarted, animatingHandler);
                surface.animatingStopped.add(animatingHandler._onAnimatingStopped, animatingHandler);
                if (surface.isPlaying()) {
                    animatingHandler._onAnimatingStarted();
                }
            }
        }
        Util.setupAnimatingHandler = setupAnimatingHandler;
        /**
         * アニメーティングハンドラを別のサーフェスへ移動する。
         *
         * これはゲームエンジンが利用するものであり、ゲーム開発者が呼び出す必要はない。
         *
         * @param animatingHandler アニメーティングハンドラ
         * @param beforeSurface ハンドラ登録を解除するサーフェス
         * @param afterSurface ハンドラを登録するサーフェス
         */
        function migrateAnimatingHandler(animatingHandler, beforeSurface, afterSurface) {
            animatingHandler._onAnimatingStopped();
            if (!beforeSurface.destroyed() && beforeSurface.isDynamic) {
                beforeSurface.animatingStarted.remove(animatingHandler._onAnimatingStarted, animatingHandler);
                beforeSurface.animatingStopped.remove(animatingHandler._onAnimatingStopped, animatingHandler);
            }
            if (afterSurface.isDynamic) {
                afterSurface.animatingStarted.add(animatingHandler._onAnimatingStarted, animatingHandler);
                afterSurface.animatingStopped.add(animatingHandler._onAnimatingStopped, animatingHandler);
                if (afterSurface.isPlaying()) {
                    animatingHandler._onAnimatingStarted();
                }
            }
        }
        Util.migrateAnimatingHandler = migrateAnimatingHandler;
    })(Util = g.Util || (g.Util = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * オブジェクトの衝突を表す。
     * - 矩形交差による衝突
     * - 2点間の距離による衝突
     */
    var Collision;
    (function (Collision) {
        /**
         * 矩形交差による衝突判定を行い、その結果を返す。
         * 戻り値は、矩形t1, t2が交差しているとき真、でなければ偽。
         * @param {number} x1 t1-X
         * @param {number} y1 t1-Y
         * @param {number} width1 t1幅
         * @param {number} height1 t1高さ
         * @param {number} x2 t2-X
         * @param {number} y2 t2-Y
         * @param {number} width2 t2幅
         * @param {number} height2 t2高さ
         */
        function intersect(x1, y1, width1, height1, x2, y2, width2, height2) {
            return x1 <= x2 + width2 && x2 <= x1 + width1 && y1 <= y2 + height2 && y2 <= y1 + height1;
        }
        Collision.intersect = intersect;
        /**
         * 矩形交差による衝突判定を行い、その結果を返す。
         * 戻り値は、矩形t1, t2が交差しているとき真、でなければ偽。
         * @param {CommonArea} t1 矩形1
         * @param {CommonArea} t2 矩形2
         */
        function intersectAreas(t1, t2) {
            return Collision.intersect(t1.x, t1.y, t1.width, t1.height, t2.x, t2.y, t2.width, t2.height);
        }
        Collision.intersectAreas = intersectAreas;
        /**
         * 2点間の距離による衝突判定を行い、その結果を返す。
         * 戻り値は、2点間の距離が閾値以内であるとき真、でなければ偽。
         * @param {number} t1x t1-X
         * @param {number} t1y t1-X
         * @param {number} t2x t1-X
         * @param {number} t2y t1-X
         * @param {number} [distance=1] 衝突判定閾値 [pixel]
         */
        function within(t1x, t1y, t2x, t2y, distance) {
            if (distance === void 0) { distance = 1; }
            return distance >= g.Util.distance(t1x, t1y, t2x, t2y);
        }
        Collision.within = within;
        /**
         * 2つの矩形の中心座標間距離による衝突判定を行い、その結果を返す。
         * 戻り値は、2点間の距離が閾値以内であるとき真、でなければ偽。
         * @param {CommonArea} t1 矩形1
         * @param {CommonArea} t2 矩形2
         * @param {number} [distance=1] 衝突判定閾値 [pixel]
         */
        function withinAreas(t1, t2, distance) {
            if (distance === void 0) { distance = 1; }
            return distance >= g.Util.distanceBetweenAreas(t1, t2);
        }
        Collision.withinAreas = withinAreas;
    })(Collision = g.Collision || (g.Collision = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * イベント通知機構クラス。
     */
    var Trigger = /** @class */ (function () {
        function Trigger() {
            this._handlers = [];
            this.length = 0;
        }
        Trigger.prototype.add = function (paramsOrFunc, owner) {
            if (typeof paramsOrFunc === "function") {
                this._handlers.push({
                    func: paramsOrFunc,
                    owner: owner,
                    once: false,
                    name: undefined
                });
            }
            else {
                var params = paramsOrFunc;
                if (typeof params.index === "number") {
                    this._handlers.splice(params.index, 0, {
                        func: params.func,
                        owner: params.owner,
                        once: false,
                        name: params.name
                    });
                }
                else {
                    this._handlers.push({
                        func: params.func,
                        owner: params.owner,
                        once: false,
                        name: params.name
                    });
                }
            }
            this.length = this._handlers.length;
        };
        Trigger.prototype.addOnce = function (paramsOrFunc, owner) {
            if (typeof paramsOrFunc === "function") {
                this._handlers.push({
                    func: paramsOrFunc,
                    owner: owner,
                    once: true,
                    name: undefined
                });
            }
            else {
                var params = paramsOrFunc;
                if (typeof params.index === "number") {
                    this._handlers.splice(params.index, 0, {
                        func: params.func,
                        owner: params.owner,
                        once: true,
                        name: params.name
                    });
                }
                else {
                    this._handlers.push({
                        func: params.func,
                        owner: params.owner,
                        once: true,
                        name: params.name
                    });
                }
            }
            this.length = this._handlers.length;
        };
        /**
         * このTriggerにハンドラを追加する。
         * @deprecated 互換性のために残されている。代わりに `add()` を利用すべきである。実装の変化のため、 `func` が `boolean` を返した時の動作はサポートされていない。
         */
        Trigger.prototype.handle = function (owner, func, name) {
            this.add(func ? { owner: owner, func: func, name: name } : { func: owner });
        };
        /**
         * このTriggerを発火する。
         *
         * 登録された全ハンドラの関数を、引数 `arg` を与えて呼び出す。
         * 呼び出し後、次のいずれかの条件を満たす全ハンドラの登録は解除される。
         * * ハンドラが `addOnce()` で登録されていた場合
         * * ハンドラが `add()` で登録される際に `once: true` オプションが与えられていた場合
         * * 関数がtruthyな値を返した場合
         *
         * @param arg ハンドラに与えられる引数
         */
        Trigger.prototype.fire = function (arg) {
            if (!this._handlers || !this._handlers.length)
                return;
            var handlers = this._handlers.concat();
            for (var i = 0; i < handlers.length; i++) {
                var handler = handlers[i];
                if (handler.func.call(handler.owner, arg) || handler.once) {
                    var index = this._handlers.indexOf(handler);
                    if (index !== -1)
                        this._handlers.splice(index, 1);
                }
            }
            if (this._handlers)
                // TODO 条件文は暫定対応
                this.length = this._handlers.length;
        };
        Trigger.prototype.contains = function (paramsOrFunc, owner) {
            var condition = typeof paramsOrFunc === "function" ? { func: paramsOrFunc, owner: owner } : paramsOrFunc;
            for (var i = 0; i < this._handlers.length; i++) {
                if (this._comparePartial(condition, this._handlers[i])) {
                    return true;
                }
            }
            return false;
        };
        Trigger.prototype.remove = function (paramsOrFunc, owner) {
            var condition = typeof paramsOrFunc === "function" ? { func: paramsOrFunc, owner: owner } : paramsOrFunc;
            for (var i = 0; i < this._handlers.length; i++) {
                var handler = this._handlers[i];
                if (condition.func === handler.func && condition.owner === handler.owner && condition.name === handler.name) {
                    this._handlers.splice(i, 1);
                    --this.length;
                    return;
                }
            }
        };
        /**
         * 指定した条件に部分一致するイベントハンドラを削除する。
         *
         * 本メソッドは引数に与えた条件に一致したイベントハンドラを全て削除する。
         * 引数の条件を一部省略した場合、その値の内容が登録時と異なっていても対象のイベントハンドラは削除される。
         * 引数に与えた条件と完全に一致したイベントハンドラのみを削除したい場合は `this.remove()` を用いる。
         * 引数を省略した場合は全てのイベントハンドラを削除する。
         *
         * @param params 削除するイベントハンドラの条件
         */
        Trigger.prototype.removeAll = function (params) {
            var handlers = [];
            if (params) {
                for (var i = 0; i < this._handlers.length; i++) {
                    var handler = this._handlers[i];
                    if (!this._comparePartial(params, handler)) {
                        handlers.push(handler);
                    }
                }
            }
            this._handlers = handlers;
            this.length = this._handlers.length;
        };
        /**
         * このTriggerを破棄する。
         */
        Trigger.prototype.destroy = function () {
            this._handlers = null;
            this.length = null;
        };
        /**
         * このTriggerが破棄されているかを返す。
         */
        Trigger.prototype.destroyed = function () {
            return this._handlers === null;
        };
        /**
         * @private
         */
        Trigger.prototype._comparePartial = function (target, compare) {
            if (target.func !== undefined && target.func !== compare.func)
                return false;
            if (target.owner !== undefined && target.owner !== compare.owner)
                return false;
            if (target.name !== undefined && target.name !== compare.name)
                return false;
            return true;
        };
        return Trigger;
    }());
    g.Trigger = Trigger;
    /**
     * 他のTriggerに反応して発火するイベント通知機構。
     */
    var ChainTrigger = /** @class */ (function (_super) {
        __extends(ChainTrigger, _super);
        /**
         * `ChainTrigger` のインスタンスを生成する。
         *
         * このインスタンスは、 `chain` がfireされたときに `filter` を実行し、真を返した場合に自身をfireする。
         * @param chain このインスタンスがfireするきっかけとなる Trigger
         * @param filter `chain` がfireされたときに実行される関数。省略された場合、または本関数の戻り値が真の場合、このインスタンスをfireする。
         * @param filterOwner `filter` 呼び出し時に使われる `this` の値。
         */
        function ChainTrigger(chain, filter, filterOwner) {
            var _this = _super.call(this) || this;
            _this.chain = chain;
            _this.filter = filter;
            _this.filterOwner = filterOwner;
            _this._isActivated = false;
            return _this;
        }
        ChainTrigger.prototype.add = function (paramsOrHandler, owner) {
            _super.prototype.add.call(this, paramsOrHandler, owner);
            if (!this._isActivated) {
                this.chain.add(this._onChainTriggerFired, this);
                this._isActivated = true;
            }
        };
        ChainTrigger.prototype.addOnce = function (paramsOrHandler, owner) {
            _super.prototype.addOnce.call(this, paramsOrHandler, owner);
            if (!this._isActivated) {
                this.chain.add(this._onChainTriggerFired, this);
                this._isActivated = true;
            }
        };
        ChainTrigger.prototype.remove = function (paramsOrFunc, owner) {
            _super.prototype.remove.call(this, paramsOrFunc, owner);
            if (this.length === 0 && this._isActivated) {
                this.chain.remove(this._onChainTriggerFired, this);
                this._isActivated = false;
            }
        };
        ChainTrigger.prototype.removeAll = function (params) {
            _super.prototype.removeAll.call(this, params);
            if (this.length === 0 && this._isActivated) {
                this.chain.remove(this._onChainTriggerFired, this);
                this._isActivated = false;
            }
        };
        ChainTrigger.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.chain.remove(this._onChainTriggerFired, this);
            this.filter = null;
            this.filterOwner = null;
            this._isActivated = false;
        };
        /**
         * @private
         */
        ChainTrigger.prototype._onChainTriggerFired = function (args) {
            if (!this.filter || this.filter.call(this.filterOwner, args)) {
                this.fire(args);
            }
        };
        return ChainTrigger;
    }(Trigger));
    g.ChainTrigger = ChainTrigger;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 一定時間で繰り返される処理を表すタイマー。
     *
     * ゲーム開発者が本クラスのインスタンスを直接生成することはなく、
     * 通常はScene#setTimeout、Scene#setIntervalによって間接的に利用する。
     */
    var Timer = /** @class */ (function () {
        function Timer(interval, fps) {
            this.interval = interval;
            // NOTE: intervalが浮動小数の場合があるため念のため四捨五入する
            this._scaledInterval = Math.round(interval * fps);
            this.elapsed = new g.Trigger();
            this._scaledElapsed = 0;
        }
        Timer.prototype.tick = function () {
            // NOTE: 1000 / fps * fps = 1000
            this._scaledElapsed += 1000;
            while (this._scaledElapsed >= this._scaledInterval) {
                // NOTE: this.elapsed.fire()内でdestroy()される可能性があるため、destroyed()を判定する
                if (!this.elapsed) {
                    break;
                }
                this.elapsed.fire();
                this._scaledElapsed -= this._scaledInterval;
            }
        };
        Timer.prototype.canDelete = function () {
            return !this.elapsed || this.elapsed.length === 0;
        };
        Timer.prototype.destroy = function () {
            this.interval = undefined;
            this.elapsed.destroy();
            this.elapsed = undefined;
            this._scaledInterval = 0;
            this._scaledElapsed = 0;
        };
        Timer.prototype.destroyed = function () {
            return this.elapsed === undefined;
        };
        return Timer;
    }());
    g.Timer = Timer;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * `Scene#setTimeout` や `Scene#setInterval` の実行単位を表す。
     * ゲーム開発者が本クラスのインスタンスを直接生成することはなく、
     * 本クラスの機能を直接利用することはない。
     */
    var TimerIdentifier = /** @class */ (function () {
        function TimerIdentifier(timer, handler, handlerOwner, fired, firedOwner) {
            this._timer = timer;
            this._handler = handler;
            this._handlerOwner = handlerOwner;
            this._fired = fired;
            this._firedOwner = firedOwner;
            this._timer.elapsed.add(this._fire, this);
        }
        TimerIdentifier.prototype.destroy = function () {
            this._timer.elapsed.remove(this._fire, this);
            this._timer = undefined;
            this._handler = undefined;
            this._handlerOwner = undefined;
            this._fired = undefined;
            this._firedOwner = undefined;
        };
        TimerIdentifier.prototype.destroyed = function () {
            return this._timer === undefined;
        };
        /**
         * @private
         */
        TimerIdentifier.prototype._fire = function () {
            if (this.destroyed())
                return;
            this._handler.call(this._handlerOwner);
            if (this._fired) {
                this._fired.call(this._firedOwner, this);
            }
        };
        return TimerIdentifier;
    }());
    g.TimerIdentifier = TimerIdentifier;
    /**
     * Timerを管理する機構を提供する。
     * ゲーム開発者が本クラスを利用する事はない。
     */
    var TimerManager = /** @class */ (function () {
        function TimerManager(trigger, fps) {
            this._timers = [];
            this._trigger = trigger;
            this._identifiers = [];
            this._fps = fps;
            this._registered = false;
        }
        TimerManager.prototype.destroy = function () {
            for (var i = 0; i < this._identifiers.length; ++i) {
                this._identifiers[i].destroy();
            }
            for (var i = 0; i < this._timers.length; ++i) {
                this._timers[i].destroy();
            }
            this._timers = undefined;
            this._trigger = undefined;
            this._identifiers = undefined;
            this._fps = undefined;
        };
        TimerManager.prototype.destroyed = function () {
            return this._timers === undefined;
        };
        /**
         * 定期間隔で処理を実行するTimerを作成する。
         * 本Timerはフレーム経過によって動作する疑似タイマーであるため、実時間の影響は受けない
         * @param interval Timerの実行間隔（ミリ秒）
         * @returns 作成したTimer
         */
        TimerManager.prototype.createTimer = function (interval) {
            if (!this._registered) {
                this._trigger.add(this._tick, this);
                this._registered = true;
            }
            if (interval < 0)
                throw g.ExceptionFactory.createAssertionError("TimerManager#createTimer: invalid interval");
            // NODE: intervalが0の場合に、Timer#tick()で無限ループとなるためintervalの最小値を1とする。
            if (interval < 1)
                interval = 1;
            // NOTE: Timerの_scaledElapsedと比較するため、this.fps倍した値を用いる
            // Math.min(1000 / this._fps * this.fps, interval * this._fps);
            var acceptableMargin = Math.min(1000, interval * this._fps);
            for (var i = 0; i < this._timers.length; ++i) {
                if (this._timers[i].interval === interval) {
                    if (this._timers[i]._scaledElapsed < acceptableMargin) {
                        return this._timers[i];
                    }
                }
            }
            var timer = new g.Timer(interval, this._fps);
            this._timers.push(timer);
            return timer;
        };
        /**
         * Timerを削除する。
         * @param timer 削除するTimer
         */
        TimerManager.prototype.deleteTimer = function (timer) {
            if (!timer.canDelete())
                return;
            var index = this._timers.indexOf(timer);
            if (index < 0)
                throw g.ExceptionFactory.createAssertionError("TimerManager#deleteTimer: can not find timer");
            this._timers.splice(index, 1);
            timer.destroy();
            if (!this._timers.length) {
                if (!this._registered)
                    throw g.ExceptionFactory.createAssertionError("TimerManager#deleteTimer: handler is not handled");
                this._trigger.remove(this._tick, this);
                this._registered = false;
            }
        };
        TimerManager.prototype.setTimeout = function (handler, milliseconds, owner) {
            var timer = this.createTimer(milliseconds);
            var identifier = new TimerIdentifier(timer, handler, owner, this._onTimeoutFired, this);
            this._identifiers.push(identifier);
            return identifier;
        };
        TimerManager.prototype.clearTimeout = function (identifier) {
            this._clear(identifier);
        };
        TimerManager.prototype.setInterval = function (handler, interval, owner) {
            var timer = this.createTimer(interval);
            var identifier = new TimerIdentifier(timer, handler, owner);
            this._identifiers.push(identifier);
            return identifier;
        };
        TimerManager.prototype.clearInterval = function (identifier) {
            this._clear(identifier);
        };
        /**
         * すべてのTimerを時間経過させる。
         * @private
         */
        TimerManager.prototype._tick = function () {
            var timers = this._timers.concat();
            for (var i = 0; i < timers.length; ++i)
                timers[i].tick();
        };
        /**
         * @private
         */
        TimerManager.prototype._onTimeoutFired = function (identifier) {
            var index = this._identifiers.indexOf(identifier);
            if (index < 0)
                throw g.ExceptionFactory.createAssertionError("TimerManager#_onTimeoutFired: can not find identifier");
            this._identifiers.splice(index, 1);
            var timer = identifier._timer;
            identifier.destroy();
            this.deleteTimer(timer);
        };
        /**
         * @private
         */
        TimerManager.prototype._clear = function (identifier) {
            var index = this._identifiers.indexOf(identifier);
            if (index < 0)
                throw g.ExceptionFactory.createAssertionError("TimerManager#_clear: can not find identifier");
            if (identifier.destroyed())
                throw g.ExceptionFactory.createAssertionError("TimerManager#_clear: invalid identifier");
            this._identifiers.splice(index, 1);
            var timer = identifier._timer;
            identifier.destroy();
            this.deleteTimer(timer);
        };
        return TimerManager;
    }());
    g.TimerManager = TimerManager;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * サウンド再生を行うクラス。
     *
     * 本クラスのインスタンスは、 `AudioSystem#createPlayer()` によって明示的に、
     * または `AudioAsset#play()` によって暗黙的に生成される。
     * ゲーム開発者は本クラスのインスタンスを直接生成すべきではない。
     */
    var AudioPlayer = /** @class */ (function () {
        /**
         * `AudioPlayer` のインスタンスを生成する。
         */
        function AudioPlayer(system) {
            this.played = new g.Trigger();
            this.stopped = new g.Trigger();
            this.currentAudio = undefined;
            this.volume = system.volume;
            this._muted = system._muted;
            this._playbackRate = system._playbackRate;
            this._system = system;
        }
        /**
         * `AudioAsset` を再生する。
         *
         * 再生後、 `this.played` がfireされる。
         * @param audio 再生するオーディオアセット
         */
        AudioPlayer.prototype.play = function (audio) {
            this.currentAudio = audio;
            this.played.fire({
                player: this,
                audio: audio
            });
        };
        /**
         * 再生を停止する。
         *
         * 停止後、 `this.stopped` がfireされる。
         * 再生中でない場合、何もしない(`stopped` もfireされない)。
         */
        AudioPlayer.prototype.stop = function () {
            var audio = this.currentAudio;
            if (!audio)
                return;
            this.currentAudio = undefined;
            this.stopped.fire({
                player: this,
                audio: audio
            });
        };
        /**
         * 音声の終了を検知できるか否か。
         * 通常、ゲーム開発者がこのメソッドを利用する必要はない。
         */
        AudioPlayer.prototype.canHandleStopped = function () {
            return true;
        };
        /**
         * 音量を変更する。
         *
         * @param volume 音量。0以上1.0以下でなければならない
         */
        // エンジンユーザが `AudioPlayer` の派生クラスを実装する場合は、
        // `_changeMuted()` などと同様、このメソッドをオーバーライドして実際に音量を変更する処理を行うこと。
        // オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
        AudioPlayer.prototype.changeVolume = function (volume) {
            this.volume = volume;
        };
        /**
         * ミュート状態を変更する。
         *
         * エンジンユーザが `AudioPlayer` の派生クラスを実装する場合は、
         * このメソッドをオーバーライドして実際にミュート状態を変更する処理を行うこと。
         * オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
         *
         * @param muted ミュート状態にするか否か
         * @private
         */
        AudioPlayer.prototype._changeMuted = function (muted) {
            this._muted = muted;
        };
        /**
         * 再生速度を変更する。
         *
         * エンジンユーザが `AudioPlayer` の派生クラスを実装し、
         * かつ `this._supportsPlaybackRate()` をオーバライドして真を返すようにするならば、
         * このメソッドもオーバーライドして実際に再生速度を変更する処理を行うこと。
         * オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
         *
         * @param rate 再生速度の倍率。0以上でなければならない。1.0で等倍である。
         * @private
         */
        AudioPlayer.prototype._changePlaybackRate = function (rate) {
            this._playbackRate = rate;
        };
        /**
         * 再生速度の変更に対応するか否か。
         *
         * エンジンユーザが `AudioPlayer` の派生クラスを実装し、
         * 再生速度の変更に対応する場合、このメソッドをオーバーライドして真を返さねばならない。
         * その場合 `_changePlaybackRate()` もオーバーライドし、実際の再生速度変更処理を実装しなければならない。
         *
         * なおここで「再生速度の変更に対応する」は、任意の速度で実際に再生できることを意味しない。
         * 実装は等倍速 (再生速度1.0) で実際に再生できなければならない。
         * しかしそれ以外の再生速度が指定された場合、実装はまるで音量がゼロであるかのように振舞ってもよい。
         *
         * このメソッドが偽を返す場合、エンジンは音声の非等倍速度再生に対するデフォルトの処理を実行する。
         * @private
         */
        AudioPlayer.prototype._supportsPlaybackRate = function () {
            return false;
        };
        /**
         * 音量の変更を通知する。
         * @deprecated このメソッドは実験的に導入されたが、利用されていない。将来的に削除される。
         */
        AudioPlayer.prototype._onVolumeChanged = function () {
            // nothing to do
        };
        return AudioPlayer;
    }());
    g.AudioPlayer = AudioPlayer;
})(g || (g = {}));
var g;
(function (g) {
    var AudioSystem = /** @class */ (function () {
        function AudioSystem(id, game) {
            var audioSystemManager = game._audioSystemManager;
            this.id = id;
            this.game = game;
            this._volume = 1;
            this._destroyRequestedAssets = {};
            this._muted = audioSystemManager._muted;
            this._playbackRate = audioSystemManager._playbackRate;
        }
        Object.defineProperty(AudioSystem.prototype, "volume", {
            // volumeの変更時には通知が必要なのでアクセサを使う。
            // 呼び出し頻度が少ないため許容。
            get: function () {
                return this._volume;
            },
            set: function (value) {
                if (value < 0 || value > 1 || isNaN(value) || typeof value !== "number")
                    throw g.ExceptionFactory.createAssertionError("AudioSystem#volume: expected: 0.0-1.0, actual: " + value);
                this._volume = value;
                this._onVolumeChanged();
            },
            enumerable: true,
            configurable: true
        });
        AudioSystem.prototype.requestDestroy = function (asset) {
            this._destroyRequestedAssets[asset.id] = asset;
        };
        /**
         * @private
         */
        AudioSystem.prototype._reset = function () {
            this.stopAll();
            this._volume = 1;
            this._destroyRequestedAssets = {};
            this._muted = this.game._audioSystemManager._muted;
            this._playbackRate = this.game._audioSystemManager._playbackRate;
        };
        /**
         * @private
         */
        AudioSystem.prototype._setMuted = function (value) {
            var before = this._muted;
            this._muted = !!value;
            if (this._muted !== before) {
                this._onMutedChanged();
            }
        };
        /**
         * @private
         */
        AudioSystem.prototype._setPlaybackRate = function (value) {
            if (value < 0 || isNaN(value) || typeof value !== "number")
                throw g.ExceptionFactory.createAssertionError("AudioSystem#playbackRate: expected: greater or equal to 0.0, actual: " + value);
            var before = this._playbackRate;
            this._playbackRate = value;
            if (this._playbackRate !== before) {
                this._onPlaybackRateChanged();
            }
        };
        return AudioSystem;
    }());
    g.AudioSystem = AudioSystem;
    var MusicAudioSystem = /** @class */ (function (_super) {
        __extends(MusicAudioSystem, _super);
        function MusicAudioSystem(id, game) {
            var _this = _super.call(this, id, game) || this;
            _this._player = undefined;
            _this._suppressingAudio = undefined;
            return _this;
        }
        Object.defineProperty(MusicAudioSystem.prototype, "player", {
            // Note: 音楽のないゲームの場合に無駄なインスタンスを作るのを避けるため、アクセサを使う
            get: function () {
                if (!this._player) {
                    this._player = this.game.resourceFactory.createAudioPlayer(this);
                    this._player.played.handle(this, this._onPlayerPlayed);
                    this._player.stopped.handle(this, this._onPlayerStopped);
                }
                return this._player;
            },
            set: function (v) {
                this._player = v;
            },
            enumerable: true,
            configurable: true
        });
        MusicAudioSystem.prototype.findPlayers = function (asset) {
            if (this.player.currentAudio && this.player.currentAudio.id === asset.id)
                return [this.player];
            return [];
        };
        MusicAudioSystem.prototype.createPlayer = function () {
            return this.player;
        };
        MusicAudioSystem.prototype.stopAll = function () {
            if (!this._player)
                return;
            this._player.stop();
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._reset = function () {
            _super.prototype._reset.call(this);
            if (this._player) {
                this._player.played.remove({ owner: this, func: this._onPlayerPlayed });
                this._player.stopped.remove({ owner: this, func: this._onPlayerStopped });
            }
            this._player = undefined;
            this._suppressingAudio = undefined;
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._onVolumeChanged = function () {
            this.player.changeVolume(this._volume);
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._onMutedChanged = function () {
            this.player._changeMuted(this._muted);
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._onPlaybackRateChanged = function () {
            var player = this.player;
            player._changePlaybackRate(this._playbackRate);
            if (!player._supportsPlaybackRate()) {
                this._onUnsupportedPlaybackRateChanged();
            }
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._onUnsupportedPlaybackRateChanged = function () {
            // 再生速度非対応の場合のフォールバック: 鳴らそうとしてミュートしていた音があれば鳴らし直す
            if (this._playbackRate === 1.0) {
                if (this._suppressingAudio) {
                    var audio = this._suppressingAudio;
                    this._suppressingAudio = undefined;
                    if (!audio.destroyed()) {
                        this.player._changeMuted(false);
                    }
                }
            }
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._onPlayerPlayed = function (e) {
            if (e.player !== this._player)
                throw g.ExceptionFactory.createAssertionError("MusicAudioSystem#_onPlayerPlayed: unexpected audio player");
            if (e.player._supportsPlaybackRate())
                return;
            // 再生速度非対応の場合のフォールバック: 鳴らさず即ミュートにする
            if (this._playbackRate !== 1.0) {
                e.player._changeMuted(true);
                this._suppressingAudio = e.audio;
            }
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._onPlayerStopped = function (e) {
            if (this._suppressingAudio) {
                this._suppressingAudio = undefined;
                this.player._changeMuted(false);
            }
            if (this._destroyRequestedAssets[e.audio.id]) {
                delete this._destroyRequestedAssets[e.audio.id];
                e.audio.destroy();
            }
        };
        return MusicAudioSystem;
    }(AudioSystem));
    g.MusicAudioSystem = MusicAudioSystem;
    var SoundAudioSystem = /** @class */ (function (_super) {
        __extends(SoundAudioSystem, _super);
        function SoundAudioSystem(id, game) {
            var _this = _super.call(this, id, game) || this;
            _this.players = [];
            return _this;
        }
        SoundAudioSystem.prototype.createPlayer = function () {
            var player = this.game.resourceFactory.createAudioPlayer(this);
            if (player.canHandleStopped())
                this.players.push(player);
            player.played.handle(this, this._onPlayerPlayed);
            player.stopped.handle(this, this._onPlayerStopped);
            return player;
        };
        SoundAudioSystem.prototype.findPlayers = function (asset) {
            var ret = [];
            for (var i = 0; i < this.players.length; ++i) {
                if (this.players[i].currentAudio && this.players[i].currentAudio.id === asset.id)
                    ret.push(this.players[i]);
            }
            return ret;
        };
        SoundAudioSystem.prototype.stopAll = function () {
            var players = this.players.concat();
            for (var i = 0; i < players.length; ++i) {
                players[i].stop(); // auto remove
            }
        };
        /**
         * @private
         */
        SoundAudioSystem.prototype._reset = function () {
            _super.prototype._reset.call(this);
            for (var i = 0; i < this.players.length; ++i) {
                var player = this.players[i];
                player.played.remove({ owner: this, func: this._onPlayerPlayed });
                player.stopped.remove({ owner: this, func: this._onPlayerStopped });
            }
            this.players = [];
        };
        /**
         * @private
         */
        SoundAudioSystem.prototype._onMutedChanged = function () {
            var players = this.players;
            for (var i = 0; i < players.length; ++i) {
                players[i]._changeMuted(this._muted);
            }
        };
        /**
         * @private
         */
        SoundAudioSystem.prototype._onPlaybackRateChanged = function () {
            var players = this.players;
            for (var i = 0; i < players.length; ++i) {
                players[i]._changePlaybackRate(this._playbackRate);
                // 再生速度非対応の場合のフォールバック: 即止める
                if (!players[i]._supportsPlaybackRate() && this._playbackRate !== 1.0) {
                    players[i].stop();
                }
            }
        };
        /**
         * @private
         */
        SoundAudioSystem.prototype._onPlayerPlayed = function (e) {
            if (e.player._supportsPlaybackRate())
                return;
            // 再生速度非対応の場合のフォールバック: 鳴らさず即止める
            if (this._playbackRate !== 1.0) {
                e.player.stop();
            }
        };
        /**
         * @private
         */
        SoundAudioSystem.prototype._onPlayerStopped = function (e) {
            var index = this.players.indexOf(e.player);
            if (index < 0)
                return;
            e.player.stopped.remove({ owner: this, func: this._onPlayerStopped });
            this.players.splice(index, 1);
            if (this._destroyRequestedAssets[e.audio.id]) {
                delete this._destroyRequestedAssets[e.audio.id];
                e.audio.destroy();
            }
        };
        /**
         * @private
         */
        SoundAudioSystem.prototype._onVolumeChanged = function () {
            for (var i = 0; i < this.players.length; ++i) {
                this.players[i].changeVolume(this._volume);
            }
        };
        return SoundAudioSystem;
    }(AudioSystem));
    g.SoundAudioSystem = SoundAudioSystem;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * ビデオ再生を行うクラス。
     *
     * ゲーム開発者は本クラスのインスタンスを直接生成すべきではない。
     */
    var VideoPlayer = /** @class */ (function () {
        /**
         * `VideoPlayer` のインスタンスを生成する。
         */
        function VideoPlayer(loop) {
            this._loop = !!loop;
            this.played = new g.Trigger();
            this.stopped = new g.Trigger();
            this.currentVideo = undefined;
            this.volume = 1.0;
        }
        /**
         * `VideoAsset` を再生する。
         *
         * 再生後、 `this.played` がfireされる。
         * @param Video 再生するビデオアセット
         */
        VideoPlayer.prototype.play = function (videoAsset) {
            this.currentVideo = videoAsset;
            this.played.fire({
                player: this,
                video: videoAsset
            });
            videoAsset.asSurface().animatingStarted.fire();
        };
        /**
         * 再生を停止する。
         *
         * 再生中でない場合、何もしない。
         * 停止後、 `this.stopped` がfireされる。
         */
        VideoPlayer.prototype.stop = function () {
            var videoAsset = this.currentVideo;
            this.stopped.fire({
                player: this,
                video: videoAsset
            });
            videoAsset.asSurface().animatingStopped.fire();
        };
        /**
         * 音量を変更する。
         *
         * エンジンユーザが `VideoPlayer` の派生クラスを実装する場合は、
         *  このメソッドをオーバーライドして実際に音量を変更する処理を行うこと。
         *  オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
         * @param volume 音量。0以上1.0以下でなければならない
         */
        VideoPlayer.prototype.changeVolume = function (volume) {
            this.volume = volume;
        };
        return VideoPlayer;
    }());
    g.VideoPlayer = VideoPlayer;
})(g || (g = {}));
var g;
(function (g) {
    // 将来 VideoPlayerインスタンスの一元管理（ボリューム設定などAudioSystemと似た役割）
    // を担うクラス。VideoAssetはVideoSystemを持つという体裁を整えるために(中身が空であるが)
    // 定義されている。
    // TODO: 実装
    var VideoSystem = /** @class */ (function () {
        function VideoSystem() {
        }
        return VideoSystem;
    }());
    g.VideoSystem = VideoSystem;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 二次元の幾何的オブジェクト。位置とサイズ (に加えて傾きや透明度も) を持つ。
     * ゲーム開発者は `E` を使えばよく、通常このクラスを意識する必要はない。
     */
    var Object2D = /** @class */ (function () {
        function Object2D(param) {
            if (!param) {
                this.x = 0;
                this.y = 0;
                this.width = 0;
                this.height = 0;
                this.opacity = 1;
                this.scaleX = 1;
                this.scaleY = 1;
                this.angle = 0;
                this.compositeOperation = undefined;
                this.anchorX = undefined;
                this.anchorY = undefined;
                this._matrix = undefined;
            }
            else {
                this.x = param.x || 0;
                this.y = param.y || 0;
                this.width = param.width || 0;
                this.height = param.height || 0;
                this.opacity = "opacity" in param ? param.opacity : 1;
                this.scaleX = "scaleX" in param ? param.scaleX : 1;
                this.scaleY = "scaleY" in param ? param.scaleY : 1;
                this.angle = param.angle || 0;
                this.compositeOperation = param.compositeOperation;
                this.anchorX = param.anchorX;
                this.anchorY = param.anchorY;
                this._matrix = undefined;
            }
        }
        Object2D.prototype.moveTo = function (posOrX, y) {
            if (typeof posOrX === "number" && typeof y !== "number") {
                throw g.ExceptionFactory.createAssertionError("Object2D#moveTo: arguments must be CommonOffset or pair of x and y as a number.");
            }
            if (typeof posOrX === "number") {
                this.x = posOrX;
                this.y = y;
            }
            else {
                this.x = posOrX.x;
                this.y = posOrX.y;
            }
        };
        /**
         * オブジェクトを相対的に移動する。
         * このメソッドは `x` と `y` を同時に加算するためのユーティリティメソッドである。
         * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
         * @param x X座標に加算する値
         * @param y Y座標に加算する値
         */
        Object2D.prototype.moveBy = function (x, y) {
            this.x += x;
            this.y += y;
        };
        Object2D.prototype.resizeTo = function (sizeOrWidth, height) {
            if (typeof sizeOrWidth === "number" && typeof height !== "number") {
                throw g.ExceptionFactory.createAssertionError("Object2D#resizeTo: arguments must be CommonSize or pair of width and height as a number.");
            }
            if (typeof sizeOrWidth === "number") {
                this.width = sizeOrWidth;
                this.height = height;
            }
            else {
                this.width = sizeOrWidth.width;
                this.height = sizeOrWidth.height;
            }
        };
        /**
         * オブジェクトのサイズを相対的に変更する。
         * このメソッドは `width` と `height` を同時に加算するためのユーティリティメソッドである。
         * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
         * @param width 加算する幅
         * @param height 加算する高さ
         */
        Object2D.prototype.resizeBy = function (width, height) {
            this.width += width;
            this.height += height;
        };
        /**
         * オブジェクトの拡大率を設定する。
         * このメソッドは `scaleX` と `scaleY` に同じ値を同時に設定するためのユーティリティメソッドである。
         * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
         * @param scale 拡大率
         */
        Object2D.prototype.scale = function (scale) {
            this.scaleX = scale;
            this.scaleY = scale;
        };
        /**
         * オブジェクトのアンカーの位置を設定する。
         * このメソッドは `anchorX` と `anchorY` を同時に設定するためのユーティリティメソッドである。
         * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
         */
        Object2D.prototype.anchor = function (x, y) {
            this.anchorX = x;
            this.anchorY = y;
        };
        /**
         * このオブジェクトの変換行列を得る。
         */
        Object2D.prototype.getMatrix = function () {
            if (!this._matrix) {
                this._matrix = g.Util.createMatrix();
            }
            else if (!this._matrix._modified) {
                return this._matrix;
            }
            this._updateMatrix();
            this._matrix._modified = false;
            return this._matrix;
        };
        /**
         * 公開のプロパティから内部の変換行列キャッシュを更新する。
         * @private
         */
        Object2D.prototype._updateMatrix = function () {
            if (this.anchorX != null && this.anchorY != null) {
                this._matrix.updateWithAnchor(this.width, this.height, this.scaleX, this.scaleY, this.angle, this.x, this.y, this.anchorX, this.anchorY);
            }
            else if (this.angle || this.scaleX !== 1 || this.scaleY !== 1) {
                this._matrix.update(this.width, this.height, this.scaleX, this.scaleY, this.angle, this.x, this.y);
            }
            else {
                this._matrix.reset(this.x, this.y);
            }
        };
        return Object2D;
    }());
    g.Object2D = Object2D;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * akashic-engineに描画される全てのエンティティを表す基底クラス。
     * 本クラス単体に描画処理にはなく、直接利用する場合はchildrenを利用したコンテナとして程度で利用される。
     */
    var E = /** @class */ (function (_super) {
        __extends(E, _super);
        /**
         * 各種パラメータを指定して `E` のインスタンスを生成する。
         * @param param 初期化に用いるパラメータのオブジェクト
         */
        function E(param) {
            var _this = _super.call(this, param) || this;
            _this.children = undefined;
            _this.parent = undefined;
            _this._touchable = false;
            _this.state = 0 /* None */;
            _this._hasTouchableChildren = false;
            _this._update = undefined;
            _this._message = undefined;
            _this._pointDown = undefined;
            _this._pointMove = undefined;
            _this._pointUp = undefined;
            _this._targetCameras = undefined;
            _this.tag = param.tag;
            _this.shaderProgram = param.shaderProgram;
            // local は Scene#register() や this.append() の呼び出しよりも先に立てなければならない
            // ローカルシーン・ローカルティック補間シーンのエンティティは強制的に local (ローカルティックが来て他プレイヤーとずれる可能性がある)
            _this.local = param.scene.local !== g.LocalTickMode.NonLocal || !!param.local;
            if (param.children) {
                for (var i = 0; i < param.children.length; ++i)
                    _this.append(param.children[i]);
            }
            if (param.parent) {
                param.parent.append(_this);
            }
            if (param.targetCameras)
                _this.targetCameras = param.targetCameras;
            if ("touchable" in param)
                _this.touchable = param.touchable;
            if (!!param.hidden)
                _this.hide();
            // set id, scene
            _this.id = param.id;
            param.scene.register(_this);
            return _this;
        }
        Object.defineProperty(E.prototype, "update", {
            /**
             * 時間経過イベント。本イベントの一度のfireにつき、常に1フレーム分の時間経過が起こる。
             */
            // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
            get: function () {
                if (!this._update)
                    this._update = new g.ChainTrigger(this.scene.update);
                return this._update;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(E.prototype, "message", {
            // updateは代入する必要がないのでsetterを定義しない
            /**
             * このエンティティのmessageイベント。
             */
            // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
            get: function () {
                if (!this._message)
                    this._message = new g.ChainTrigger(this.scene.message);
                return this._message;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(E.prototype, "pointDown", {
            // messageは代入する必要がないのでsetterを定義しない
            /**
             * このエンティティのpoint downイベント。
             */
            // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
            get: function () {
                if (!this._pointDown)
                    this._pointDown = new g.ChainTrigger(this.scene.pointDownCapture, this._isTargetOperation, this);
                return this._pointDown;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(E.prototype, "pointUp", {
            // pointDownは代入する必要がないのでsetterを定義しない
            /**
             * このエンティティのpoint upイベント。
             */
            // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
            get: function () {
                if (!this._pointUp)
                    this._pointUp = new g.ChainTrigger(this.scene.pointUpCapture, this._isTargetOperation, this);
                return this._pointUp;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(E.prototype, "pointMove", {
            // pointUpは代入する必要がないのでsetterを定義しない
            /**
             * このエンティティのpoint moveイベント。
             */
            // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
            get: function () {
                if (!this._pointMove)
                    this._pointMove = new g.ChainTrigger(this.scene.pointMoveCapture, this._isTargetOperation, this);
                return this._pointMove;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(E.prototype, "targetCameras", {
            // pointMoveは代入する必要がないのでsetterを定義しない
            /**
             * このエンティティを表示できるカメラの配列。
             *
             * 初期値は空配列である。
             * この値が `undefined` または空配列である場合、このエンティティとその子孫はカメラによらず描画される。
             * 空でない配列である場合、このエンティティとその子孫は、配列内に含まれるカメラでの描画の際にのみ表示される。
             *
             * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
             */
            // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
            get: function () {
                return this._targetCameras || (this._targetCameras = []);
            },
            set: function (v) {
                this._targetCameras = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(E.prototype, "touchable", {
            /**
             * プレイヤーにとって触れられるオブジェクトであるかを表す。
             *
             * この値が偽である場合、ポインティングイベントの対象にならない。
             * 初期値は `false` である。
             *
             * `E` の他のプロパティと異なり、この値の変更後に `this.modified()` を呼び出す必要はない。
             */
            get: function () {
                return this._touchable;
            },
            set: function (v) {
                if (this._touchable === v)
                    return;
                this._touchable = v;
                if (v) {
                    this._enableTouchPropagation();
                }
                else {
                    this._disableTouchPropagation();
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 自分自身と子孫の内容を描画する。
         *
         * このメソッドは、 `Renderer#draw()` からエンティティのツリー構造をトラバースする過程で暗黙に呼び出される。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         * @param renderer 描画先に対するRenderer
         * @param camera 対象のカメラ。省略された場合、undefined
         */
        E.prototype.render = function (renderer, camera) {
            this.state &= ~4 /* Modified */;
            if (this.state & 1 /* Hidden */)
                return;
            var cams = this._targetCameras;
            if (cams && cams.length > 0 && (!camera || cams.indexOf(camera) === -1))
                return;
            if (this.state & 8 /* ContextLess */) {
                renderer.translate(this.x, this.y);
                var goDown = this.renderSelf(renderer, camera);
                if (goDown && this.children) {
                    var children = this.children;
                    var len = children.length;
                    for (var i = 0; i < len; ++i)
                        children[i].render(renderer, camera);
                }
                renderer.translate(-this.x, -this.y);
                return;
            }
            renderer.save();
            if (this.angle || this.scaleX !== 1 || this.scaleY !== 1 || this.anchorX != null || this.anchorY != null) {
                // Note: this.scaleX/scaleYが0の場合描画した結果何も表示されない事になるが、特殊扱いはしない
                renderer.transform(this.getMatrix()._matrix);
            }
            else {
                // Note: 変形なしのオブジェクトはキャッシュもとらずtranslateのみで処理
                renderer.translate(this.x, this.y);
            }
            if (this.opacity !== 1)
                renderer.opacity(this.opacity);
            if (this.compositeOperation !== undefined)
                renderer.setCompositeOperation(this.compositeOperation);
            if (this.shaderProgram !== undefined && renderer.isSupportedShaderProgram())
                renderer.setShaderProgram(this.shaderProgram);
            var goDown = this.renderSelf(renderer, camera);
            if (goDown && this.children) {
                // Note: concatしていないのでunsafeだが、render中に配列の中身が変わる事はない前提とする
                var children = this.children;
                for (var i = 0; i < children.length; ++i)
                    children[i].render(renderer, camera);
            }
            renderer.restore();
        };
        /**
         * 自分自身の内容を描画する。
         *
         * このメソッドは、 `Renderer#draw()` からエンティティのツリー構造をトラバースする過程で暗黙に呼び出される。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         *
         * 戻り値は、このエンティティの子孫の描画をスキップすべきであれば偽、でなければ真である。
         * (この値は、子孫の描画方法をカスタマイズする一部のサブクラスにおいて、通常の描画パスをスキップするために用いられる)
         *
         * @param renderer 描画先に対するRenderer
         * @param camera 対象のカメラ
         */
        E.prototype.renderSelf = function (_renderer, _camera) {
            // nothing to do
            return true;
        };
        /**
         * このエンティティが属する `Game` を返す。
         */
        E.prototype.game = function () {
            return this.scene.game;
        };
        /**
         * 子を追加する。
         *
         * @param e 子エンティティとして追加するエンティティ
         */
        E.prototype.append = function (e) {
            this.insertBefore(e, undefined);
        };
        /**
         * 子を挿入する。
         *
         * `target` が`this` の子でない場合、`append(e)` と同じ動作となる。
         *
         * @param e 子エンティティとして追加するエンティティ
         * @param target 挿入位置にある子エンティティ
         */
        E.prototype.insertBefore = function (e, target) {
            if (e.parent)
                e.remove();
            if (!this.children)
                this.children = [];
            e.parent = this;
            var index = -1;
            if (target !== undefined && (index = this.children.indexOf(target)) > -1) {
                this.children.splice(index, 0, e);
            }
            else {
                this.children.push(e);
            }
            if (e._touchable || e._hasTouchableChildren) {
                this._hasTouchableChildren = true;
                this._enableTouchPropagation();
            }
            this.modified(true);
        };
        /**
         * 子を削除する。
         *
         * `e` が `this` の子でない場合、 `AssertionError` がthrowされる。
         * `e === undefined` であり親がない場合、 `AssertionError` がthrowされる。
         *
         * @param e 削除する子エンティティ。省略された場合、自身を親から削除する
         */
        E.prototype.remove = function (e) {
            if (e === undefined) {
                this.parent.remove(this);
                return;
            }
            var index = this.children ? this.children.indexOf(e) : -1;
            if (index < 0)
                throw g.ExceptionFactory.createAssertionError("E#remove: invalid child");
            this.children[index].parent = undefined;
            this.children.splice(index, 1);
            if (e._touchable || e._hasTouchableChildren) {
                if (!this._findTouchableChildren(this)) {
                    this._hasTouchableChildren = false;
                    this._disableTouchPropagation();
                }
            }
            this.modified(true);
        };
        /**
         * このエンティティを破棄する。
         *
         * 親がある場合、親からは `remove()` される。
         * 子孫を持っている場合、子孫も破棄される。
         */
        E.prototype.destroy = function () {
            if (this.parent)
                this.remove();
            if (this.children) {
                for (var i = this.children.length - 1; i >= 0; --i) {
                    this.children[i].destroy();
                }
                if (this.children.length !== 0)
                    throw g.ExceptionFactory.createAssertionError("E#destroy: can not destroy all children, " + this.children.length);
                this.children = undefined;
            }
            // この解放はstringとforeachを使って書きたいが、minifyする時は.アクセスの方がいいのでやむを得ない
            if (this._update) {
                this._update.destroy();
                this._update = undefined;
            }
            if (this._message) {
                this._message.destroy();
                this._message = undefined;
            }
            if (this._pointDown) {
                this._pointDown.destroy();
                this._pointDown = undefined;
            }
            if (this._pointMove) {
                this._pointMove.destroy();
                this._pointMove = undefined;
            }
            if (this._pointUp) {
                this._pointUp.destroy();
                this._pointUp = undefined;
            }
            this.scene.unregister(this);
        };
        /**
         * このエンティティが破棄済みであるかを返す。
         */
        E.prototype.destroyed = function () {
            return this.scene === undefined;
        };
        /**
         * このエンティティに対する変更をエンジンに通知する。
         *
         * このメソッドの呼び出し後、 `this` に対する変更が各 `Renderer` の描画に反映される。
         * ただし逆は真ではない。すなわち、再描画は他の要因によって行われることもある。
         * ゲーム開発者は、このメソッドを呼び出していないことをもって再描画が行われていないことを仮定してはならない。
         *
         * 本メソッドは、このオブジェクトの `Object2D` 由来のプロパティ (`x`, `y`, `angle` など) を変更した場合にも呼びだす必要がある。
         * 本メソッドは、描画キャッシュの無効化処理を含まない。描画キャッシュを持つエンティティは、このメソッドとは別に `invalidate()` を提供している。
         * 描画キャッシュの無効化も必要な場合は、このメソッドではなくそちらを呼び出す必要がある。
         * @param isBubbling 通常ゲーム開発者が指定する必要はない。この変更通知が、(このエンティティ自身のみならず)子孫の変更の通知を含む場合、真を渡さなければならない。省略された場合、偽。
         */
        E.prototype.modified = function (_isBubbling) {
            // _matrixの用途は描画に限らない(e.g. E#findPointSourceByPoint)ので、Modifiedフラグと無関係にクリアする必要がある
            if (this._matrix)
                this._matrix._modified = true;
            if (this.angle ||
                this.scaleX !== 1 ||
                this.scaleY !== 1 ||
                this.anchorX != null ||
                this.anchorY != null ||
                this.opacity !== 1 ||
                this.compositeOperation !== undefined ||
                this.shaderProgram !== undefined) {
                this.state &= ~8 /* ContextLess */;
            }
            else {
                this.state |= 8 /* ContextLess */;
            }
            if (this.state & 4 /* Modified */)
                return;
            this.state |= 4 /* Modified */;
            if (this.parent)
                this.parent.modified(true);
        };
        /**
         * このメソッドは、 `E#findPointSourceByPoint()` 内で子孫の探索をスキップすべきか判断するために呼ばれる。
         * 通常、子孫の描画方法をカスタマイズする一部のサブクラスにおいて、与えられた座標に対する子孫の探索を制御する場合に利用する。
         * ゲーム開発者がこのメソッドを呼び出す必要はない。
         *
         * 戻り値は、子孫の探索をスキップすべきであれば偽、でなければ真である。
         *
         * @param point このエンティティ（`this`）の位置を基準とした相対座標
         */
        E.prototype.shouldFindChildrenByPoint = function (_point) {
            // nothing to do
            return true;
        };
        /**
         * 自身と自身の子孫の中で、その座標に反応する `PointSource` を返す。
         *
         * 戻り値は、対象が見つかった場合、 `target` に見つかったエンティティを持つ `PointSource` である。
         * 対象が見つからなかった場合、 `undefined` である。戻り値が `undefined` でない場合、その `target` プロパティは次を満たす:
         * - このエンティティ(`this`) またはその子孫である
         * - `E#touchable` が真である
         * - カメラ `camera` から可視である中で最も手前にある
         *
         * @param point 対象の座標
         * @param m `this` に適用する変換行列。省略された場合、単位行列
         * @param force touchable指定を無視する場合真を指定する。省略された場合、偽
         * @param camera 対象のカメラ。指定されなかった場合undefined
         */
        E.prototype.findPointSourceByPoint = function (point, m, force, camera) {
            if (this.state & 1 /* Hidden */)
                return undefined;
            var cams = this._targetCameras;
            if (cams && cams.length > 0 && (!camera || cams.indexOf(camera) === -1))
                return undefined;
            m = m ? m.multiplyNew(this.getMatrix()) : this.getMatrix().clone();
            var p = m.multiplyInverseForPoint(point);
            if (this._hasTouchableChildren || (force && this.children && this.children.length)) {
                if (this.shouldFindChildrenByPoint(p)) {
                    for (var i = this.children.length - 1; i >= 0; --i) {
                        var child = this.children[i];
                        if (force || child._touchable || child._hasTouchableChildren) {
                            var target = child.findPointSourceByPoint(point, m, force, camera);
                            if (target)
                                return target;
                        }
                    }
                }
            }
            if (!(force || this._touchable))
                return undefined;
            // 逆行列をポイントにかけた結果がEにヒットしているかを計算
            if (0 <= p.x && this.width > p.x && 0 <= p.y && this.height > p.y) {
                return {
                    target: this,
                    point: p
                };
            }
            return undefined;
        };
        /**
         * このEが表示状態であるかどうかを返す。
         */
        E.prototype.visible = function () {
            return (this.state & 1 /* Hidden */) !== 1 /* Hidden */;
        };
        /**
         * このEを表示状態にする。
         *
         * `this.hide()` によって非表示状態にされたエンティティを表示状態に戻す。
         * 生成直後のエンティティは表示状態であり、 `hide()` を呼び出さない限りこのメソッドを呼び出す必要はない。
         */
        E.prototype.show = function () {
            if (!(this.state & 1 /* Hidden */))
                return;
            this.state &= ~1 /* Hidden */;
            if (this.parent) {
                this.parent.modified(true);
            }
        };
        /**
         * このEを非表示状態にする。
         *
         * `this.show()` が呼ばれるまでの間、このエンティティは各 `Renderer` によって描画されない。
         * また `Game#findPointSource()` で返されることもなくなる。
         * `this#pointDown`, `pointMove`, `pointUp` なども通常の方法ではfireされなくなる。
         */
        E.prototype.hide = function () {
            if (this.state & 1 /* Hidden */)
                return;
            this.state |= 1 /* Hidden */;
            if (this.parent) {
                this.parent.modified(true);
            }
        };
        /**
         * このEの包含矩形を計算する。
         *
         * @param c 使用カメラ。
         */
        E.prototype.calculateBoundingRect = function (c) {
            return this._calculateBoundingRect(undefined, c);
        };
        /**
         * @private
         */
        E.prototype._calculateBoundingRect = function (m, c) {
            var matrix = this.getMatrix();
            if (m) {
                matrix = m.multiplyNew(matrix);
            }
            if (!this.visible() || (c && (!this._targetCameras || this._targetCameras.indexOf(c) === -1))) {
                return undefined;
            }
            var thisBoundingRect = { left: 0, right: this.width, top: 0, bottom: this.height };
            var targetCoordinates = [
                { x: thisBoundingRect.left, y: thisBoundingRect.top },
                { x: thisBoundingRect.left, y: thisBoundingRect.bottom },
                { x: thisBoundingRect.right, y: thisBoundingRect.top },
                { x: thisBoundingRect.right, y: thisBoundingRect.bottom }
            ];
            var convertedPoint = matrix.multiplyPoint(targetCoordinates[0]);
            var result = { left: convertedPoint.x, right: convertedPoint.x, top: convertedPoint.y, bottom: convertedPoint.y };
            for (var i = 1; i < targetCoordinates.length; ++i) {
                convertedPoint = matrix.multiplyPoint(targetCoordinates[i]);
                if (result.left > convertedPoint.x)
                    result.left = convertedPoint.x;
                if (result.right < convertedPoint.x)
                    result.right = convertedPoint.x;
                if (result.top > convertedPoint.y)
                    result.top = convertedPoint.y;
                if (result.bottom < convertedPoint.y)
                    result.bottom = convertedPoint.y;
            }
            if (this.children !== undefined) {
                for (var i = 0; i < this.children.length; ++i) {
                    var nowResult = this.children[i]._calculateBoundingRect(matrix, c);
                    if (nowResult) {
                        if (result.left > nowResult.left)
                            result.left = nowResult.left;
                        if (result.right < nowResult.right)
                            result.right = nowResult.right;
                        if (result.top > nowResult.top)
                            result.top = nowResult.top;
                        if (result.bottom < nowResult.bottom)
                            result.bottom = nowResult.bottom;
                    }
                }
            }
            return result;
        };
        /**
         * @private
         */
        E.prototype._enableTouchPropagation = function () {
            var p = this.parent;
            while (p instanceof E && !p._hasTouchableChildren) {
                p._hasTouchableChildren = true;
                p = p.parent;
            }
        };
        /**
         * @private
         */
        E.prototype._disableTouchPropagation = function () {
            var p = this.parent;
            while (p instanceof E && p._hasTouchableChildren) {
                if (this._findTouchableChildren(p))
                    break;
                p._hasTouchableChildren = false;
                p = p.parent;
            }
        };
        /**
         * @private
         */
        E.prototype._isTargetOperation = function (e) {
            if (this.state & 1 /* Hidden */)
                return false;
            if (e instanceof g.PointEvent)
                return this._touchable && e.target === this;
            return false;
        };
        E.prototype._findTouchableChildren = function (e) {
            if (e.children) {
                for (var i = 0; i < e.children.length; ++i) {
                    if (e.children[i].touchable)
                        return e.children[i];
                    var tmp = this._findTouchableChildren(e.children[i]);
                    if (tmp)
                        return tmp;
                }
            }
            return undefined;
        };
        return E;
    }(g.Object2D));
    g.E = E;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 内部描画キャッシュを持つ `E` 。
     */
    var CacheableE = /** @class */ (function (_super) {
        __extends(CacheableE, _super);
        /**
         * 各種パラメータを指定して `CacheableE` のインスタンスを生成する。
         * @param param このエンティティに対するパラメータ
         */
        function CacheableE(param) {
            var _this = _super.call(this, param) || this;
            _this._shouldRenderChildren = true;
            _this._cache = undefined;
            _this._renderer = undefined;
            _this._renderedCamera = undefined;
            return _this;
        }
        /**
         * このエンティティの描画キャッシュ無効化をエンジンに通知する。
         * このメソッドを呼び出し後、描画キャッシュの再構築が行われ、各 `Renderer` に描画内容の変更が反映される。
         */
        CacheableE.prototype.invalidate = function () {
            this.state &= ~2 /* Cached */;
            this.modified();
        };
        /**
         * このエンティティ自身の描画を行う。
         * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
         */
        CacheableE.prototype.renderSelf = function (renderer, camera) {
            var padding = CacheableE.PADDING;
            if (this._renderedCamera !== camera) {
                this.state &= ~2 /* Cached */;
                this._renderedCamera = camera;
            }
            if (!(this.state & 2 /* Cached */)) {
                this._cacheSize = this.calculateCacheSize();
                var w = Math.ceil(this._cacheSize.width) + padding * 2;
                var h = Math.ceil(this._cacheSize.height) + padding * 2;
                var isNew = !this._cache || this._cache.width < w || this._cache.height < h;
                if (isNew) {
                    if (this._cache && !this._cache.destroyed()) {
                        this._cache.destroy();
                    }
                    this._cache = this.scene.game.resourceFactory.createSurface(w, h);
                    this._renderer = this._cache.renderer();
                }
                var cacheRenderer = this._renderer;
                cacheRenderer.begin();
                if (!isNew) {
                    cacheRenderer.clear();
                }
                cacheRenderer.save();
                cacheRenderer.translate(padding, padding);
                this.renderCache(cacheRenderer, camera);
                cacheRenderer.restore();
                this.state |= 2 /* Cached */;
                cacheRenderer.end();
            }
            if (this._cache && this._cacheSize.width > 0 && this._cacheSize.height > 0) {
                renderer.translate(-padding, -padding);
                this.renderSelfFromCache(renderer);
                renderer.translate(padding, padding);
            }
            return this._shouldRenderChildren;
        };
        /**
         * 内部キャッシュから自身の描画を行う。
         * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
         */
        CacheableE.prototype.renderSelfFromCache = function (renderer) {
            renderer.drawImage(this._cache, 0, 0, this._cacheSize.width + CacheableE.PADDING, this._cacheSize.height + CacheableE.PADDING, 0, 0);
        };
        /**
         * 利用している `Surface` を破棄した上で、このエンティティを破棄する。
         */
        CacheableE.prototype.destroy = function () {
            if (this._cache && !this._cache.destroyed()) {
                this._cache.destroy();
            }
            this._cache = undefined;
            _super.prototype.destroy.call(this);
        };
        /**
         * キャッシュのサイズを取得する。
         * 本クラスを継承したクラスでエンティティのサイズと異なるサイズを利用する場合、このメソッドをオーバーライドする。
         * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
         * このメソッドから得られる値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
         */
        CacheableE.prototype.calculateCacheSize = function () {
            return {
                width: this.width,
                height: this.height
            };
        };
        /**
         * _cache のパディングサイズ。
         *
         * @private
         */
        CacheableE.PADDING = 1;
        return CacheableE;
    }(g.E));
    g.CacheableE = CacheableE;
})(g || (g = {}));
var g;
(function (g) {
    // TODO: (GAMEDEV-1549) コメント整理
    /**
     * 操作対象とするストレージのリージョンを表す。
     */
    // サーバ仕様に則し、値を指定している。
    var StorageRegion;
    (function (StorageRegion) {
        /**
         * slotsを表す。
         */
        StorageRegion[StorageRegion["Slots"] = 1] = "Slots";
        /**
         * scoresを表す。
         */
        StorageRegion[StorageRegion["Scores"] = 2] = "Scores";
        /**
         * countsを表す。
         */
        StorageRegion[StorageRegion["Counts"] = 3] = "Counts";
        /**
         * valuesを表す。
         */
        StorageRegion[StorageRegion["Values"] = 4] = "Values";
    })(StorageRegion = g.StorageRegion || (g.StorageRegion = {}));
    /**
     * 一括取得を行う場合のソート順。
     */
    var StorageOrder;
    (function (StorageOrder) {
        /**
         * 昇順。
         */
        StorageOrder[StorageOrder["Asc"] = 0] = "Asc";
        /**
         * 降順。
         */
        StorageOrder[StorageOrder["Desc"] = 1] = "Desc";
    })(StorageOrder = g.StorageOrder || (g.StorageOrder = {}));
    /**
     * 条件を表す。
     */
    // サーバ仕様に則し、値を指定している。
    var StorageCondition;
    (function (StorageCondition) {
        /**
         * 等価を表す（==）。
         */
        StorageCondition[StorageCondition["Equal"] = 1] = "Equal";
        /**
         * 「より大きい」を表す（>）。
         */
        StorageCondition[StorageCondition["GreaterThan"] = 2] = "GreaterThan";
        /**
         * 「より小さい」を表す（<）。
         */
        StorageCondition[StorageCondition["LessThan"] = 3] = "LessThan";
    })(StorageCondition = g.StorageCondition || (g.StorageCondition = {}));
    /**
     * Countsリージョンへの書き込み操作種別を表す。
     */
    // サーバ仕様に則し、値を指定している。
    var StorageCountsOperation;
    (function (StorageCountsOperation) {
        /**
         * インクリメント操作を実行する。
         */
        StorageCountsOperation[StorageCountsOperation["Incr"] = 1] = "Incr";
        /**
         * デクリメント操作を実行する。
         */
        StorageCountsOperation[StorageCountsOperation["Decr"] = 2] = "Decr";
    })(StorageCountsOperation = g.StorageCountsOperation || (g.StorageCountsOperation = {}));
    /**
     * ストレージの値を保持するクラス。
     * ゲーム開発者がこのクラスのインスタンスを直接生成することはない。
     */
    var StorageValueStore = /** @class */ (function () {
        function StorageValueStore(keys, values) {
            this._keys = keys;
            this._values = values;
        }
        /**
         * 値の配列を `StorageKey` またはインデックスから取得する。
         * 通常、インデックスは `Scene` のコンストラクタに指定した `storageKeys` のインデックスに対応する。
         * @param keyOrIndex `StorageKey` 又はインデックス
         */
        StorageValueStore.prototype.get = function (keyOrIndex) {
            if (this._values === undefined) {
                return [];
            }
            if (typeof keyOrIndex === "number") {
                return this._values[keyOrIndex];
            }
            else {
                var index = this._keys.indexOf(keyOrIndex);
                if (index !== -1) {
                    return this._values[index];
                }
                for (var i = 0; i < this._keys.length; ++i) {
                    var target = this._keys[i];
                    if (target.region === keyOrIndex.region &&
                        target.regionKey === keyOrIndex.regionKey &&
                        target.userId === keyOrIndex.userId &&
                        target.gameId === keyOrIndex.gameId) {
                        return this._values[i];
                    }
                }
            }
            return [];
        };
        /**
         * 値を `StorageKey` またはインデックスから取得する。
         * 対応する値が複数ある場合は、先頭の値を取得する。
         * 通常、インデックスは `Scene` のコンストラクタに指定した `storageKeys` のインデックスに対応する。
         * @param keyOrIndex `StorageKey` 又はインデックス
         */
        StorageValueStore.prototype.getOne = function (keyOrIndex) {
            var values = this.get(keyOrIndex);
            if (!values)
                return undefined;
            return values[0];
        };
        return StorageValueStore;
    }());
    g.StorageValueStore = StorageValueStore;
    /**
     * ストレージの値をロードするクラス。
     * ゲーム開発者がこのクラスのインスタンスを直接生成することはなく、
     * 本クラスの機能を利用することもない。
     */
    var StorageLoader = /** @class */ (function () {
        function StorageLoader(storage, keys, serialization) {
            this._loaded = false;
            this._storage = storage;
            this._valueStore = new StorageValueStore(keys);
            this._handler = undefined;
            this._valueStoreSerialization = serialization;
        }
        /**
         * @private
         */
        StorageLoader.prototype._load = function (handler) {
            this._handler = handler;
            if (this._storage._load) {
                this._storage._load.call(this._storage, this._valueStore._keys, this, this._valueStoreSerialization);
            }
        };
        /**
         * @private
         */
        // 値の取得が完了したタイミングで呼び出される。
        // `values` は `this._valueStore._keys` に対応する値を表す `StorageValue` の配列。
        // 順番は `this._valueStore._keys` と同じでなければならない。
        StorageLoader.prototype._onLoaded = function (values, serialization) {
            this._valueStore._values = values;
            this._loaded = true;
            if (serialization)
                this._valueStoreSerialization = serialization;
            if (this._handler)
                this._handler._onStorageLoaded();
        };
        /**
         * @private
         */
        StorageLoader.prototype._onError = function (error) {
            if (this._handler)
                this._handler._onStorageLoadError(error);
        };
        return StorageLoader;
    }());
    g.StorageLoader = StorageLoader;
    /**
     * ストレージ。
     * ゲーム開発者がこのクラスのインスタンスを直接生成することはない。
     */
    var Storage = /** @class */ (function () {
        function Storage(game) {
            this._game = game;
        }
        /**
         * ストレージに値を書き込む。
         * @param key ストレージキーを表す `StorageKey`
         * @param value 値を表す `StorageValue`
         * @param option 書き込みオプション
         */
        Storage.prototype.write = function (key, value, option) {
            if (this._write) {
                this._write(key, value, option);
            }
        };
        /**
         * 参加してくるプレイヤーの値をストレージから取得することを要求する。
         * 取得した値は `JoinEvent#storageValues` に格納される。
         * @param keys ストレージキーを表す `StorageReadKey` の配列。`StorageReadKey#userId` は無視される。
         */
        Storage.prototype.requestValuesForJoinPlayer = function (keys) {
            this._requestedKeysForJoinPlayer = keys;
        };
        /**
         * @private
         */
        Storage.prototype._createLoader = function (keys, serialization) {
            return new StorageLoader(this, keys, serialization);
        };
        /**
         * @private
         */
        // ストレージに値の書き込むを行う関数を登録する。
        // 登録した関数内の `this` は `Storage` を指す。
        Storage.prototype._registerWrite = function (write) {
            this._write = write;
        };
        /**
         * @private
         */
        // ストレージから値の読み込みを行う関数を登録する。
        // 登録した関数内の `this` は `Storage` を指す。
        // 読み込み完了した場合は、登録した関数内で `loader._onLoaded(values)` を呼ばなければならない。
        // エラーが発生した場合は、登録した関数内で `loader._onError(error)` を呼ばなければならない。
        Storage.prototype._registerLoad = function (load) {
            this._load = load;
        };
        return Storage;
    }());
    g.Storage = Storage;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * シーンのアセットの読み込みと破棄を管理するクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var SceneAssetHolder = /** @class */ (function () {
        function SceneAssetHolder(param) {
            this.waitingAssetsCount = param.assetIds.length;
            this._scene = param.scene;
            this._assetManager = param.assetManager;
            this._assetIds = param.assetIds;
            this._assets = [];
            this._handler = param.handler;
            this._handlerOwner = param.handlerOwner || null;
            this._direct = !!param.direct;
            this._requested = false;
        }
        SceneAssetHolder.prototype.request = function () {
            if (this.waitingAssetsCount === 0)
                return false;
            if (this._requested)
                return true;
            this._requested = true;
            this._assetManager.requestAssets(this._assetIds, this);
            return true;
        };
        SceneAssetHolder.prototype.destroy = function () {
            if (this._requested) {
                this._assetManager.unrefAssets(this._assets);
            }
            this.waitingAssetsCount = 0;
            this._scene = undefined;
            this._assetIds = undefined;
            this._handler = undefined;
            this._requested = false;
        };
        SceneAssetHolder.prototype.destroyed = function () {
            return !this._scene;
        };
        SceneAssetHolder.prototype.callHandler = function () {
            this._handler.call(this._handlerOwner);
        };
        /**
         * @private
         */
        SceneAssetHolder.prototype._onAssetError = function (asset, error, _assetManager) {
            if (this.destroyed() || this._scene.destroyed())
                return;
            var failureInfo = {
                asset: asset,
                error: error,
                cancelRetry: false
            };
            this._scene.assetLoadFailed.fire(failureInfo);
            if (error.retriable && !failureInfo.cancelRetry) {
                this._assetManager.retryLoad(asset);
            }
            else {
                // game.json に定義されていればゲームを止める。それ以外 (DynamicAsset) では続行。
                if (this._assetManager.configuration[asset.id]) {
                    this._scene.game.terminateGame();
                    this._scene.game._abortGame();
                }
            }
            this._scene.assetLoadCompleted.fire(asset);
        };
        /**
         * @private
         */
        SceneAssetHolder.prototype._onAssetLoad = function (asset) {
            if (this.destroyed() || this._scene.destroyed())
                return;
            this._scene.assets[asset.id] = asset;
            this._scene.assetLoaded.fire(asset);
            this._scene.assetLoadCompleted.fire(asset);
            this._assets.push(asset);
            --this.waitingAssetsCount;
            if (this.waitingAssetsCount < 0)
                throw g.ExceptionFactory.createAssertionError("SceneAssetHolder#_onAssetLoad: broken waitingAssetsCount");
            if (this.waitingAssetsCount > 0)
                return;
            if (this._direct) {
                this.callHandler();
            }
            else {
                this._scene.game._callSceneAssetHolderHandler(this);
            }
        };
        return SceneAssetHolder;
    }());
    g.SceneAssetHolder = SceneAssetHolder;
    /**
     * そのSceneの状態を表す列挙子。
     *
     * - Destroyed: すでに破棄されているシーンで、再利用が不可能になっている状態を表す
     * - Standby: 初期化された状態のシーンで、シーンスタックへ追加されることを待っている状態を表す
     * - Active: シーンスタックの一番上にいるシーンで、ゲームのカレントシーンとして活性化されている状態を表す
     * - Deactive: シーンスタックにいるが一番上ではないシーンで、裏側で非活性状態になっていることを表す
     * - BeforeDestroyed: これから破棄されるシーンで、再利用が不可能になっている状態を表す
     */
    var SceneState;
    (function (SceneState) {
        SceneState[SceneState["Destroyed"] = 0] = "Destroyed";
        SceneState[SceneState["Standby"] = 1] = "Standby";
        SceneState[SceneState["Active"] = 2] = "Active";
        SceneState[SceneState["Deactive"] = 3] = "Deactive";
        SceneState[SceneState["BeforeDestroyed"] = 4] = "BeforeDestroyed";
    })(SceneState = g.SceneState || (g.SceneState = {}));
    var SceneLoadState;
    (function (SceneLoadState) {
        SceneLoadState[SceneLoadState["Initial"] = 0] = "Initial";
        SceneLoadState[SceneLoadState["Ready"] = 1] = "Ready";
        SceneLoadState[SceneLoadState["ReadyFired"] = 2] = "ReadyFired";
        SceneLoadState[SceneLoadState["LoadedFired"] = 3] = "LoadedFired";
    })(SceneLoadState = g.SceneLoadState || (g.SceneLoadState = {}));
    /**
     * シーンを表すクラス。
     */
    var Scene = /** @class */ (function () {
        /**
         * 各種パラメータを指定して `Scene` のインスタンスを生成する。
         * @param param 初期化に用いるパラメータのオブジェクト
         */
        function Scene(param) {
            var game;
            var local;
            var tickGenerationMode;
            var assetIds;
            game = param.game;
            assetIds = param.assetIds;
            if (!param.storageKeys) {
                this._storageLoader = undefined;
                this.storageValues = undefined;
            }
            else {
                this._storageLoader = game.storage._createLoader(param.storageKeys, param.storageValuesSerialization);
                this.storageValues = this._storageLoader._valueStore;
            }
            local =
                param.local === undefined
                    ? g.LocalTickMode.NonLocal
                    : param.local === false
                        ? g.LocalTickMode.NonLocal
                        : param.local === true
                            ? g.LocalTickMode.FullLocal
                            : param.local;
            tickGenerationMode = param.tickGenerationMode !== undefined ? param.tickGenerationMode : g.TickGenerationMode.ByClock;
            this.name = param.name;
            if (!assetIds)
                assetIds = [];
            this.game = game;
            this.local = local;
            this.tickGenerationMode = tickGenerationMode;
            this.loaded = new g.Trigger();
            this._ready = new g.Trigger();
            this.assets = {};
            this._loaded = false;
            this._prefetchRequested = false;
            this._loadingState = SceneLoadState.Initial;
            this.update = new g.Trigger();
            this._timer = new g.TimerManager(this.update, this.game.fps);
            this.assetLoaded = new g.Trigger();
            this.assetLoadFailed = new g.Trigger();
            this.assetLoadCompleted = new g.Trigger();
            this.message = new g.Trigger();
            this.pointDownCapture = new g.Trigger();
            this.pointMoveCapture = new g.Trigger();
            this.pointUpCapture = new g.Trigger();
            this.operation = new g.Trigger();
            this.children = [];
            this.state = SceneState.Standby;
            this.stateChanged = new g.Trigger();
            this._assetHolders = [];
            this._sceneAssetHolder = new SceneAssetHolder({
                scene: this,
                assetManager: this.game._assetManager,
                assetIds: assetIds,
                handler: this._onSceneAssetsLoad,
                handlerOwner: this,
                direct: true
            });
        }
        /**
         * このシーンが変更されたことをエンジンに通知する。
         *
         * このメソッドは、このシーンに紐づいている `E` の `modified()` を呼び出すことで暗黙に呼び出される。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         * @param isBubbling この関数をこのシーンの子の `modified()` から呼び出す場合、真を渡さなくてはならない。省略された場合、偽。
         */
        Scene.prototype.modified = function (_isBubbling) {
            this.game.modified = true;
        };
        /**
         * このシーンを破棄する。
         *
         * 破棄処理の開始時に、このシーンの `stateChanged` が引数 `BeforeDestroyed` でfireされる。
         * 破棄処理の終了時に、このシーンの `stateChanged` が引数 `Destroyed` でfireされる。
         * このシーンに紐づいている全ての `E` と全てのTimerは破棄される。
         * `Scene#setInterval()`, `Scene#setTimeout()` に渡された関数は呼び出されなくなる。
         *
         * このメソッドは `Scene#end` や `Game#popScene` などによって要求されたシーンの遷移時に暗黙に呼び出される。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         */
        Scene.prototype.destroy = function () {
            this.state = SceneState.BeforeDestroyed;
            this.stateChanged.fire(this.state);
            // TODO: (GAMEDEV-483) Sceneスタックがそれなりの量になると重くなるのでScene#dbが必要かもしれない
            var gameDb = this.game.db;
            for (var p in gameDb) {
                if (gameDb.hasOwnProperty(p) && gameDb[p].scene === this)
                    gameDb[p].destroy();
            }
            var gameDb = this.game._localDb;
            for (var p in gameDb) {
                if (gameDb.hasOwnProperty(p) && gameDb[p].scene === this)
                    gameDb[p].destroy();
            }
            this._timer.destroy();
            this.update.destroy();
            this.message.destroy();
            this.pointDownCapture.destroy();
            this.pointMoveCapture.destroy();
            this.pointUpCapture.destroy();
            this.operation.destroy();
            this.loaded.destroy();
            this.assetLoaded.destroy();
            this.assetLoadFailed.destroy();
            this.assetLoadCompleted.destroy();
            this.assets = {};
            // アセットを参照しているEより先に解放しないよう最後に解放する
            for (var i = 0; i < this._assetHolders.length; ++i)
                this._assetHolders[i].destroy();
            this._sceneAssetHolder.destroy();
            this._storageLoader = undefined;
            this.game = undefined;
            this.state = SceneState.Destroyed;
            this.stateChanged.fire(this.state);
            this.stateChanged.destroy();
        };
        /**
         * 破棄済みであるかを返す。
         */
        Scene.prototype.destroyed = function () {
            return this.game === undefined;
        };
        /**
         * 一定間隔で定期的に処理を実行するTimerを作成して返す。
         *
         * 戻り値は作成されたTimerである。
         * 通常は `Scene#setInterval` を利用すればよく、ゲーム開発者がこのメソッドを呼び出す必要はない。
         * `Timer` はフレーム経過処理(`Scene#update`)で実現される疑似的なタイマーである。実時間の影響は受けない。
         * @param interval Timerの実行間隔（ミリ秒）
         */
        Scene.prototype.createTimer = function (interval) {
            return this._timer.createTimer(interval);
        };
        /**
         * Timerを削除する。
         * @param timer 削除するTimer
         */
        Scene.prototype.deleteTimer = function (timer) {
            this._timer.deleteTimer(timer);
        };
        Scene.prototype.setInterval = function (handler, interval, owner) {
            var t = this._timer;
            if (typeof handler === "number") {
                this.game.logger.warn("[deprecated] Scene#setInterval(): this arguments ordering is now deprecated. Specify the function first.");
                return owner != null
                    ? t.setInterval(owner /* 2 */, handler /* 0 */, interval /* 1 */)
                    : t.setInterval(interval /* 1 */, handler /* 0 */, null);
            }
            return t.setInterval(handler, interval, owner);
        };
        /**
         * setIntervalで作成した定期処理を解除する。
         * @param identifier 解除対象
         */
        Scene.prototype.clearInterval = function (identifier) {
            this._timer.clearInterval(identifier);
        };
        Scene.prototype.setTimeout = function (handler, milliseconds, owner) {
            var t = this._timer;
            if (typeof handler === "number") {
                this.game.logger.warn("[deprecated] Scene#setTimeout(): this arguments ordering is now deprecated. Specify the function first.");
                return owner != null
                    ? t.setTimeout(owner /* 2 */, handler /* 0 */, milliseconds /* 1 */)
                    : t.setTimeout(milliseconds /* 1 */, handler /* 0 */, null);
            }
            return t.setTimeout(handler, milliseconds, owner);
        };
        /**
         * setTimeoutで作成した処理を削除する。
         * @param identifier 解除対象
         */
        Scene.prototype.clearTimeout = function (identifier) {
            this._timer.clearTimeout(identifier);
        };
        /**
         * このシーンが現在のシーンであるかどうかを返す。
         */
        Scene.prototype.isCurrentScene = function () {
            return this.game.scene() === this;
        };
        /**
         * 次のシーンへの遷移を要求する。
         *
         * このメソッドは、 `toPush` が真ならば `Game#pushScene()` の、でなければ `Game#replaceScene` のエイリアスである。
         * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
         * このシーンが現在のシーンでない場合、 `AssertionError` がthrowされる。
         * @param next 遷移後のシーン
         * @param toPush 現在のシーンを残したままにするなら真、削除して遷移するなら偽を指定する。省略された場合偽
         */
        Scene.prototype.gotoScene = function (next, toPush) {
            if (!this.isCurrentScene())
                throw g.ExceptionFactory.createAssertionError("Scene#gotoScene: this scene is not the current scene");
            if (toPush) {
                this.game.pushScene(next);
            }
            else {
                this.game.replaceScene(next);
            }
        };
        /**
         * このシーンの削除と、一つ前のシーンへの遷移を要求する。
         *
         * このメソッドは `Game#popScene()` のエイリアスである。
         * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
         * このシーンが現在のシーンでない場合、 `AssertionError` がthrowされる。
         */
        Scene.prototype.end = function () {
            if (!this.isCurrentScene())
                throw g.ExceptionFactory.createAssertionError("Scene#end: this scene is not the current scene");
            this.game.popScene();
        };
        /**
         * このSceneにエンティティを登録する。
         *
         * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に呼び出す必要はない。
         * @param e 登録するエンティティ
         */
        Scene.prototype.register = function (e) {
            this.game.register(e);
            e.scene = this;
        };
        /**
         * このSceneからエンティティの登録を削除する。
         *
         * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に呼び出す必要はない。
         * @param e 登録を削除するエンティティ
         */
        Scene.prototype.unregister = function (e) {
            e.scene = undefined;
            this.game.unregister(e);
        };
        /**
         * 子エンティティを追加する。
         *
         * `this.children` の末尾に `e` を追加する(`e` はそれまでに追加されたすべての子エンティティより手前に表示される)。
         *
         * @param e 子エンティティとして追加するエンティティ
         */
        Scene.prototype.append = function (e) {
            this.insertBefore(e, undefined);
        };
        /**
         * 子エンティティを挿入する。
         *
         * `this.children` の`target`の位置に `e` を挿入する。
         * `target` が`this` の子でない場合、`append(e)`と同じ動作となる。
         *
         * @param e 子エンティティとして追加するエンティティ
         * @param target 挿入位置にある子エンティティ
         */
        Scene.prototype.insertBefore = function (e, target) {
            if (e.parent)
                e.remove();
            e.parent = this;
            var index = -1;
            if (target !== undefined && (index = this.children.indexOf(target)) > -1) {
                this.children.splice(index, 0, e);
            }
            else {
                this.children.push(e);
            }
            this.modified(true);
        };
        /**
         * 子エンティティを削除する。
         * `this` の子から `e` を削除する。 `e` が `this` の子でない場合、何もしない。
         * @param e 削除する子エンティティ
         */
        Scene.prototype.remove = function (e) {
            var index = this.children.indexOf(e);
            if (index === -1)
                return;
            this.children[index].parent = undefined;
            this.children.splice(index, 1);
            this.modified(true);
        };
        /**
         * シーン内でその座標に反応する `PointSource` を返す。
         * @param point 対象の座標
         * @param force touchable指定を無視する場合真を指定する。指定されなかった場合偽
         * @param camera 対象のカメラ。指定されなかった場合undefined
         */
        Scene.prototype.findPointSourceByPoint = function (point, force, camera) {
            var mayConsumeLocalTick = this.local !== g.LocalTickMode.NonLocal;
            var children = this.children;
            var m = undefined;
            if (camera && camera instanceof g.Camera2D)
                m = camera.getMatrix();
            for (var i = children.length - 1; i >= 0; --i) {
                var ret = children[i].findPointSourceByPoint(point, m, force, camera);
                if (ret) {
                    ret.local = ret.target.local || mayConsumeLocalTick;
                    return ret;
                }
            }
            return { target: undefined, point: undefined, local: mayConsumeLocalTick };
        };
        /**
         * アセットの先読みを要求する。
         *
         * `Scene` に必要なアセットは、通常、`Game#pushScene()` などによるシーン遷移にともなって暗黙に読み込みが開始される。
         * ゲーム開発者はこのメソッドを呼び出すことで、シーン遷移前にアセット読み込みを開始する(先読みする)ことができる。
         * 先読み開始後、シーン遷移時までに読み込みが完了していない場合、通常の読み込み処理同様にローディングシーンが表示される。
         *
         * このメソッドは `StorageLoader` についての先読み処理を行わない点に注意。
         * ストレージの場合、書き込みが行われる可能性があるため、順序を無視して先読みすることはできない。
         */
        Scene.prototype.prefetch = function () {
            if (this._loaded) {
                // _load() 呼び出し後に prefetch() する意味はない(先読みではない)。
                return;
            }
            if (this._prefetchRequested)
                return;
            this._prefetchRequested = true;
            this._sceneAssetHolder.request();
        };
        /**
         * シーンが読み込んだストレージの値をシリアライズする。
         *
         * `Scene#storageValues` の内容をシリアライズする。
         */
        Scene.prototype.serializeStorageValues = function () {
            if (!this._storageLoader)
                return undefined;
            return this._storageLoader._valueStoreSerialization;
        };
        Scene.prototype.requestAssets = function (assetIds, handler) {
            if (this._loadingState < SceneLoadState.ReadyFired) {
                // このメソッドは読み込み完了前には呼び出せない。これは実装上の制限である。
                // やろうと思えば _load() で読み込む対象として加えることができる。が、その場合 `handler` を呼び出す方法が単純でないので対応を見送る。
                throw g.ExceptionFactory.createAssertionError("Scene#requestAsset(): can be called after loaded.");
            }
            var holder = new SceneAssetHolder({
                scene: this,
                assetManager: this.game._assetManager,
                assetIds: assetIds,
                handler: handler
            });
            this._assetHolders.push(holder);
            holder.request();
        };
        /**
         * @private
         */
        Scene.prototype._activate = function () {
            this.state = SceneState.Active;
            this.stateChanged.fire(this.state);
        };
        /**
         * @private
         */
        Scene.prototype._deactivate = function () {
            this.state = SceneState.Deactive;
            this.stateChanged.fire(this.state);
        };
        /**
         * @private
         */
        Scene.prototype._needsLoading = function () {
            return this._sceneAssetHolder.waitingAssetsCount > 0 || (this._storageLoader && !this._storageLoader._loaded);
        };
        /**
         * @private
         */
        Scene.prototype._load = function () {
            if (this._loaded)
                return;
            this._loaded = true;
            var needsWait = this._sceneAssetHolder.request();
            if (this._storageLoader) {
                this._storageLoader._load(this);
                needsWait = true;
            }
            if (!needsWait)
                this._notifySceneReady();
        };
        /**
         * @private
         */
        Scene.prototype._onSceneAssetsLoad = function () {
            if (!this._loaded) {
                // prefetch() で開始されたアセット読み込みを完了したが、_load() がまだ呼ばれていない。
                // _notifySceneReady() は _load() 呼び出し後まで遅延する。
                return;
            }
            if (this._storageLoader && !this._storageLoader._loaded) {
                // アセット読み込みを完了したが、ストレージの読み込みが終わっていない。
                // _notifySceneReady() は  _onStorageLoaded() 呼び出し後まで遅延する。
                return;
            }
            this._notifySceneReady();
        };
        /**
         * @private
         */
        Scene.prototype._onStorageLoadError = function (_error) {
            this.game.terminateGame();
            this.game._abortGame();
        };
        /**
         * @private
         */
        Scene.prototype._onStorageLoaded = function () {
            if (this._sceneAssetHolder.waitingAssetsCount === 0)
                this._notifySceneReady();
        };
        /**
         * @private
         */
        Scene.prototype._notifySceneReady = function () {
            // 即座に `_ready` をfireすることはしない。tick()のタイミングで行うため、リクエストをgameに投げておく。
            this._loadingState = SceneLoadState.Ready;
            this.game._fireSceneReady(this);
        };
        /**
         * @private
         */
        Scene.prototype._fireReady = function () {
            this._ready.fire(this);
            this._loadingState = SceneLoadState.ReadyFired;
        };
        /**
         * @private
         */
        Scene.prototype._fireLoaded = function () {
            this.loaded.fire(this);
            this._loadingState = SceneLoadState.LoadedFired;
        };
        return Scene;
    }());
    g.Scene = Scene;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * Assetの読み込み中に表示されるシーン。
     *
     * 本シーンは通常のシーンと異なり、ゲーム内時間(`Game#age`)と独立に実行される。
     * アセットやストレージデータを読み込んでいる間、ゲーム内時間が進んでいない状態でも、
     * `LoadingScene` は画面に変化を与えることができる(`update` がfireされる)。
     *
     * ゲーム開発者は、ローディング中の演出を実装した独自の `LoadingScene` を
     * `Game#loadingScene` に代入することでエンジンに利用させることができる。
     *
     * ゲーム内時間と独立に処理される `LoadingScene` での処理には再現性がない(他プレイヤーと状態が共有されない)。
     * そのため `Game` に対して副作用のある操作を行ってはならない点に注意すること。
     */
    var LoadingScene = /** @class */ (function (_super) {
        __extends(LoadingScene, _super);
        /**
         * `LoadingScene` のインスタンスを生成する。
         * @param param 初期化に用いるパラメータのオブジェクト
         */
        function LoadingScene(param) {
            var _this = this;
            param.local = true; // LoadingScene は強制的にローカルにする
            _this = _super.call(this, param) || this;
            _this.targetReset = new g.Trigger();
            _this.targetReady = new g.Trigger();
            _this.targetAssetLoaded = new g.Trigger();
            _this._explicitEnd = !!param.explicitEnd;
            _this._targetScene = undefined;
            return _this;
        }
        LoadingScene.prototype.destroy = function () {
            this._clearTargetScene();
            _super.prototype.destroy.call(this);
        };
        /**
         * アセットロード待ち対象シーンを変更する。
         *
         * このメソッドは、新たにシーンのロード待ちが必要になった場合にエンジンによって呼び出される。
         * (派生クラスはこの処理をオーバーライドしてもよいが、その場合その中で
         * このメソッド自身 (`g.LoadingScene.prototype.reset`) を呼び出す (`call()` する) 必要がある。)
         *
         * @param targetScene アセットロード待ちが必要なシーン
         */
        LoadingScene.prototype.reset = function (targetScene) {
            this._clearTargetScene();
            this._targetScene = targetScene;
            if (this._loadingState < g.SceneLoadState.LoadedFired) {
                this.loaded.addOnce(this._doReset, this);
            }
            else {
                this._doReset();
            }
        };
        /**
         * アセットロード待ち対象シーンの残りのロード待ちアセット数を取得する。
         */
        LoadingScene.prototype.getTargetWaitingAssetsCount = function () {
            return this._targetScene ? this._targetScene._sceneAssetHolder.waitingAssetsCount : 0;
        };
        /**
         * ローディングシーンを終了する。
         *
         * `Scene#end()` と異なり、このメソッドの呼び出しはこのシーンを破棄しない。(ローディングシーンは再利用される。)
         * このメソッドが呼び出される時、 `targetReady` がfireされた後でなければならない。
         */
        LoadingScene.prototype.end = function () {
            if (!this._targetScene || this._targetScene._loadingState < g.SceneLoadState.Ready) {
                var state = this._targetScene ? g.SceneLoadState[this._targetScene._loadingState] : "(no scene)";
                var msg = "LoadingScene#end(): the target scene is in invalid state: " + state;
                throw g.ExceptionFactory.createAssertionError(msg);
            }
            this.game.popScene(true);
            this.game._fireSceneLoaded(this._targetScene);
            this._clearTargetScene();
        };
        /**
         * @private
         */
        LoadingScene.prototype._clearTargetScene = function () {
            if (!this._targetScene)
                return;
            this._targetScene._ready.removeAll({ owner: this });
            this._targetScene.assetLoaded.removeAll({ owner: this });
            this._targetScene = undefined;
        };
        /**
         * @private
         */
        LoadingScene.prototype._doReset = function () {
            this.targetReset.fire(this._targetScene);
            if (this._targetScene._loadingState < g.SceneLoadState.ReadyFired) {
                this._targetScene._ready.add(this._fireTriggerOnTargetReady, this);
                this._targetScene.assetLoaded.add(this._fireTriggerOnTargetAssetLoad, this);
                this._targetScene._load();
            }
            else {
                this._fireTriggerOnTargetReady(this._targetScene);
            }
        };
        /**
         * @private
         */
        LoadingScene.prototype._fireTriggerOnTargetAssetLoad = function (asset) {
            this.targetAssetLoaded.fire(asset);
        };
        /**
         * @private
         */
        LoadingScene.prototype._fireTriggerOnTargetReady = function (scene) {
            this.targetReady.fire(scene);
            if (!this._explicitEnd) {
                this.end();
            }
        };
        return LoadingScene;
    }(g.Scene));
    g.LoadingScene = LoadingScene;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * カメラのtransformを戻すエンティティ。
     * LoadingSceneのインジケータがカメラの影響を受けないようにするための内部エンティティ。
     */
    var CameraCancellingE = /** @class */ (function (_super) {
        __extends(CameraCancellingE, _super);
        function CameraCancellingE(param) {
            var _this = _super.call(this, param) || this;
            _this._canceller = new g.Object2D();
            return _this;
        }
        CameraCancellingE.prototype.renderSelf = function (renderer, camera) {
            if (!this.children)
                return false;
            if (camera) {
                var c = camera;
                var canceller = this._canceller;
                if (c.x !== canceller.x ||
                    c.y !== canceller.y ||
                    c.angle !== canceller.angle ||
                    c.scaleX !== canceller.scaleX ||
                    c.scaleY !== canceller.scaleY) {
                    canceller.x = c.x;
                    canceller.y = c.y;
                    canceller.angle = c.angle;
                    canceller.scaleX = c.scaleX;
                    canceller.scaleY = c.scaleY;
                    if (canceller._matrix) {
                        canceller._matrix._modified = true;
                    }
                }
                renderer.save();
                renderer.transform(canceller.getMatrix()._matrix);
            }
            // Note: concatしていないのでunsafeだが、render中に配列の中身が変わる事はない前提とする
            var children = this.children;
            for (var i = 0; i < children.length; ++i)
                children[i].render(renderer, camera);
            if (camera) {
                renderer.restore();
            }
            return false;
        };
        return CameraCancellingE;
    }(g.E));
    /**
     * デフォルトローディングシーン。
     *
     * `Game#_defaultLoadingScene` の初期値として利用される。
     * このシーンはいかなるアセットも用いてはならない。
     */
    var DefaultLoadingScene = /** @class */ (function (_super) {
        __extends(DefaultLoadingScene, _super);
        /**
         * `DeafultLoadingScene` のインスタンスを生成する。
         * @param param 初期化に用いるパラメータのオブジェクト
         */
        function DefaultLoadingScene(param) {
            var _this = _super.call(this, { game: param.game, name: "akashic:default-loading-scene" }) || this;
            _this._barWidth = Math.min(param.game.width, Math.max(100, param.game.width / 2));
            _this._barHeight = 5;
            _this._gauge = undefined;
            _this._gaugeUpdateCount = 0;
            _this._totalWaitingAssetCount = 0;
            _this.loaded.handle(_this, _this._onLoaded);
            _this.targetReset.handle(_this, _this._onTargetReset);
            _this.targetAssetLoaded.handle(_this, _this._onTargetAssetLoaded);
            return _this;
        }
        /**
         * @private
         */
        DefaultLoadingScene.prototype._onLoaded = function () {
            var gauge;
            this.append(new CameraCancellingE({
                scene: this,
                children: [
                    new g.FilledRect({
                        scene: this,
                        width: this.game.width,
                        height: this.game.height,
                        cssColor: "rgba(0, 0, 0, 0.8)",
                        children: [
                            new g.FilledRect({
                                scene: this,
                                x: (this.game.width - this._barWidth) / 2,
                                y: (this.game.height - this._barHeight) / 2,
                                width: this._barWidth,
                                height: this._barHeight,
                                cssColor: "gray",
                                children: [
                                    (gauge = new g.FilledRect({
                                        scene: this,
                                        width: 0,
                                        height: this._barHeight,
                                        cssColor: "white"
                                    }))
                                ]
                            })
                        ]
                    })
                ]
            }));
            gauge.update.handle(this, this._onUpdateGuage);
            this._gauge = gauge;
            return true; // Trigger 登録を解除する
        };
        /**
         * @private
         */
        DefaultLoadingScene.prototype._onUpdateGuage = function () {
            var BLINK_RANGE = 50;
            var BLINK_PER_SEC = 2 / 3;
            ++this._gaugeUpdateCount;
            // 白を上限に sin 波で明滅させる (updateしていることの確認)
            var c = Math.round(255 - BLINK_RANGE + Math.sin((this._gaugeUpdateCount / this.game.fps) * BLINK_PER_SEC * (2 * Math.PI)) * BLINK_RANGE);
            this._gauge.cssColor = "rgb(" + c + "," + c + "," + c + ")";
            this._gauge.modified();
        };
        /**
         * @private
         */
        DefaultLoadingScene.prototype._onTargetReset = function (targetScene) {
            if (this._gauge) {
                this._gauge.width = 0;
                this._gauge.modified();
            }
            this._totalWaitingAssetCount = targetScene._sceneAssetHolder.waitingAssetsCount;
        };
        /**
         * @private
         */
        DefaultLoadingScene.prototype._onTargetAssetLoaded = function (_asset) {
            var waitingAssetsCount = this._targetScene._sceneAssetHolder.waitingAssetsCount;
            this._gauge.width = Math.ceil((1 - waitingAssetsCount / this._totalWaitingAssetCount) * this._barWidth);
            this._gauge.modified();
        };
        return DefaultLoadingScene;
    }(g.LoadingScene));
    g.DefaultLoadingScene = DefaultLoadingScene;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 画像を描画するエンティティ。
     */
    var Sprite = /** @class */ (function (_super) {
        __extends(Sprite, _super);
        /**
         * 各種パラメータを指定して `Sprite` のインスタンスを生成する。
         * @param param `Sprite` に設定するパラメータ
         */
        function Sprite(param) {
            var _this = _super.call(this, param) || this;
            _this.surface = g.Util.asSurface(param.src);
            if (!("width" in param))
                _this.width = _this.surface.width;
            if (!("height" in param))
                _this.height = _this.surface.height;
            _this.srcWidth = "srcWidth" in param ? param.srcWidth : _this.width;
            _this.srcHeight = "srcHeight" in param ? param.srcHeight : _this.height;
            _this.srcX = param.srcX || 0;
            _this.srcY = param.srcY || 0;
            _this._stretchMatrix = undefined;
            _this._beforeSurface = _this.surface;
            g.Util.setupAnimatingHandler(_this, _this.surface);
            _this._invalidateSelf();
            return _this;
        }
        /**
         * @private
         */
        Sprite.prototype._onUpdate = function () {
            this.modified();
        };
        /**
         * @private
         */
        Sprite.prototype._onAnimatingStarted = function () {
            if (!this.update.contains(this._onUpdate, this)) {
                this.update.add(this._onUpdate, this);
            }
        };
        /**
         * @private
         */
        Sprite.prototype._onAnimatingStopped = function () {
            if (!this.destroyed()) {
                this.update.remove(this._onUpdate, this);
            }
        };
        /**
         * このエンティティ自身の描画を行う。
         * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
         */
        Sprite.prototype.renderSelf = function (renderer, _camera) {
            if (this.srcWidth <= 0 || this.srcHeight <= 0) {
                return true;
            }
            if (this._stretchMatrix) {
                renderer.save();
                renderer.transform(this._stretchMatrix._matrix);
            }
            renderer.drawImage(this.surface, this.srcX, this.srcY, this.srcWidth, this.srcHeight, 0, 0);
            if (this._stretchMatrix)
                renderer.restore();
            return true;
        };
        /**
         * このエンティティの描画キャッシュ無効化をエンジンに通知する。
         * このメソッドを呼び出し後、描画キャッシュの再構築が行われ、各 `Renderer` に描画内容の変更が反映される。
         */
        Sprite.prototype.invalidate = function () {
            this._invalidateSelf();
            this.modified();
        };
        /**
         * このエンティティを破棄する。
         * デフォルトでは利用している `Surface` の破棄は行わない点に注意。
         * @param destroySurface trueを指定した場合、このエンティティが抱える `Surface` も合わせて破棄する
         */
        Sprite.prototype.destroy = function (destroySurface) {
            if (this.surface && !this.surface.destroyed()) {
                if (destroySurface) {
                    this.surface.destroy();
                }
                else if (this.surface.isDynamic) {
                    this.surface.animatingStarted.remove(this._onAnimatingStarted, this);
                    this.surface.animatingStopped.remove(this._onAnimatingStopped, this);
                }
            }
            this.surface = undefined;
            _super.prototype.destroy.call(this);
        };
        Sprite.prototype._invalidateSelf = function () {
            if (this.width === this.srcWidth && this.height === this.srcHeight) {
                this._stretchMatrix = undefined;
            }
            else {
                this._stretchMatrix = g.Util.createMatrix();
                this._stretchMatrix.scale(this.width / this.srcWidth, this.height / this.srcHeight);
            }
            if (this.surface !== this._beforeSurface) {
                g.Util.migrateAnimatingHandler(this, this._beforeSurface, this.surface);
                this._beforeSurface = this.surface;
            }
        };
        return Sprite;
    }(g.E));
    g.Sprite = Sprite;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * フレームとタイマーによるアニメーション機構を持つ `Sprite` 。
     *
     * このクラスは、コンストラクタで渡された画像を、
     * 幅 `srcWidth`, 高さ `srcHeight` 単位で区切られた小さな画像(以下、画像片)の集まりであると解釈する。
     * 各画像片は、左上から順に 0 から始まるインデックスで参照される。
     *
     * ゲーム開発者は、このインデックスからなる配列を `FrameSprite#frames` に設定する。
     * `FrameSprite` は、 `frames` に指定されたインデックス(が表す画像片)を順番に描画することでアニメーションを実現する。
     * アニメーションは `interval` ミリ秒ごとに進み、 `frames` の内容をループする。
     *
     * このクラスにおける `srcWidth`, `srcHeight` の扱いは、親クラスである `Sprite` とは異なっていることに注意。
     */
    var FrameSprite = /** @class */ (function (_super) {
        __extends(FrameSprite, _super);
        /**
         * 各種パラメータを指定して `FrameSprite` のインスタンスを生成する。
         * @param param `FrameSprite` に設定するパラメータ
         */
        function FrameSprite(param) {
            var _this = _super.call(this, param) || this;
            _this._lastUsedIndex = 0;
            _this.frameNumber = param.frameNumber || 0;
            _this.frames = "frames" in param ? param.frames : [0];
            _this.interval = param.interval;
            _this._timer = undefined;
            _this.loop = param.loop != null ? param.loop : true;
            _this.finished = new g.Trigger();
            _this._modifiedSelf();
            return _this;
        }
        /**
         * `Sprite` から `FrameSprite` を作成する。
         * @param sprite 画像として使う`Sprite`
         * @param width 作成されるエンティティの高さ。省略された場合、 `sprite.width`
         * @param hegith 作成されるエンティティの高さ。省略された場合、 `sprite.height`
         */
        FrameSprite.createBySprite = function (sprite, width, height) {
            var frameSprite = new FrameSprite({
                scene: sprite.scene,
                src: sprite.surface,
                width: width === undefined ? sprite.width : width,
                height: height === undefined ? sprite.height : height
            });
            frameSprite.srcHeight = height === undefined ? sprite.srcHeight : height;
            frameSprite.srcWidth = width === undefined ? sprite.srcWidth : width;
            return frameSprite;
        };
        /**
         * アニメーションを開始する。
         */
        FrameSprite.prototype.start = function () {
            if (this.interval === undefined)
                this.interval = 1000 / this.game().fps;
            if (this._timer)
                this._free();
            this._timer = this.scene.createTimer(this.interval);
            this._timer.elapsed.add(this._onElapsed, this);
        };
        /**
         * このエンティティを破棄する。
         * デフォルトでは利用している `Surface` の破棄は行わない点に注意。
         * @param destroySurface trueを指定した場合、このエンティティが抱える `Surface` も合わせて破棄する
         */
        FrameSprite.prototype.destroy = function (destroySurface) {
            this.stop();
            _super.prototype.destroy.call(this, destroySurface);
        };
        /**
         * アニメーションを停止する。
         */
        FrameSprite.prototype.stop = function () {
            if (this._timer)
                this._free();
        };
        /**
         * このエンティティに対する変更をエンジンに通知する。詳細は `E#modified()` のドキュメントを参照。
         */
        FrameSprite.prototype.modified = function (isBubbling) {
            this._modifiedSelf(isBubbling);
            _super.prototype.modified.call(this, isBubbling);
        };
        /**
         * @private
         */
        FrameSprite.prototype._onElapsed = function () {
            if (this.frameNumber === this.frames.length - 1) {
                if (this.loop) {
                    this.frameNumber = 0;
                }
                else {
                    this.stop();
                    this.finished.fire();
                }
            }
            else {
                this.frameNumber++;
            }
            this.modified();
        };
        /**
         * @private
         */
        FrameSprite.prototype._free = function () {
            if (!this._timer)
                return;
            this._timer.elapsed.remove(this._onElapsed, this);
            if (this._timer.canDelete())
                this.scene.deleteTimer(this._timer);
            this._timer = undefined;
        };
        /**
         * @private
         */
        FrameSprite.prototype._changeFrame = function () {
            var frame = this.frames[this.frameNumber];
            var sep = Math.floor(this.surface.width / this.srcWidth);
            this.srcX = (frame % sep) * this.srcWidth;
            this.srcY = Math.floor(frame / sep) * this.srcHeight;
            this._lastUsedIndex = frame;
        };
        FrameSprite.prototype._modifiedSelf = function (_isBubbling) {
            if (this._lastUsedIndex !== this.frames[this.frameNumber])
                this._changeFrame();
        };
        return FrameSprite;
    }(g.Sprite));
    g.FrameSprite = FrameSprite;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * イベントの種別。
     */
    var EventType;
    (function (EventType) {
        /**
         * 不明なイベント。
         * ゲーム開発者はこの値を利用してはならない。
         */
        EventType[EventType["Unknown"] = 0] = "Unknown";
        /**
         * プレイヤーの参加を表すイベント。
         */
        EventType[EventType["Join"] = 1] = "Join";
        /**
         * プレイヤーの離脱を表すイベント。
         */
        EventType[EventType["Leave"] = 2] = "Leave";
        /**
         * タイムスタンプを表すイベント。
         */
        EventType[EventType["Timestamp"] = 3] = "Timestamp";
        /**
         * 乱数生成器の生成を表すイベント。
         * この値は利用されていない。
         */
        EventType[EventType["Seed"] = 4] = "Seed";
        /**
         * ポイントダウンイベント。
         */
        EventType[EventType["PointDown"] = 5] = "PointDown";
        /**
         * ポイントムーブイベント。
         */
        EventType[EventType["PointMove"] = 6] = "PointMove";
        /**
         * ポイントアップイベント。
         */
        EventType[EventType["PointUp"] = 7] = "PointUp";
        /**
         * 汎用的なメッセージを表すイベント。
         */
        EventType[EventType["Message"] = 8] = "Message";
        /**
         * 操作プラグインが通知する操作を表すイベント。
         */
        EventType[EventType["Operation"] = 9] = "Operation";
    })(EventType = g.EventType || (g.EventType = {}));
    /**
     * ポインティング操作を表すイベント。
     * PointEvent#targetでそのポインティング操作の対象となったエンティティが、
     * PointEvent#pointでそのエンティティから見ての相対座標が取得できる。
     *
     * 本イベントはマルチタッチに対応しており、PointEvent#pointerIdを参照することで識別することが出来る。
     *
     * abstract
     */
    var PointEvent = /** @class */ (function () {
        function PointEvent(pointerId, target, point, player, local, priority) {
            this.priority = priority;
            this.local = local;
            this.player = player;
            this.pointerId = pointerId;
            this.target = target;
            this.point = point;
        }
        return PointEvent;
    }());
    g.PointEvent = PointEvent;
    /**
     * ポインティング操作の開始を表すイベント。
     */
    var PointDownEvent = /** @class */ (function (_super) {
        __extends(PointDownEvent, _super);
        function PointDownEvent(pointerId, target, point, player, local, priority) {
            var _this = _super.call(this, pointerId, target, point, player, local, priority) || this;
            _this.type = EventType.PointDown;
            return _this;
        }
        return PointDownEvent;
    }(PointEvent));
    g.PointDownEvent = PointDownEvent;
    /**
     * ポインティング操作の終了を表すイベント。
     * PointDownEvent後にのみ発生する。
     *
     * PointUpEvent#startDeltaによってPointDownEvent時からの移動量が、
     * PointUpEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
     * PointUpEvent#pointにはPointDownEvent#pointと同じ値が格納される。
     */
    var PointUpEvent = /** @class */ (function (_super) {
        __extends(PointUpEvent, _super);
        function PointUpEvent(pointerId, target, point, prevDelta, startDelta, player, local, priority) {
            var _this = _super.call(this, pointerId, target, point, player, local, priority) || this;
            _this.type = EventType.PointUp;
            _this.prevDelta = prevDelta;
            _this.startDelta = startDelta;
            return _this;
        }
        return PointUpEvent;
    }(PointEvent));
    g.PointUpEvent = PointUpEvent;
    /**
     * ポインティング操作の移動を表すイベント。
     * PointDownEvent後にのみ発生するため、MouseMove相当のものが本イベントとして発生することはない。
     *
     * PointMoveEvent#startDeltaによってPointDownEvent時からの移動量が、
     * PointMoveEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
     * PointMoveEvent#pointにはPointMoveEvent#pointと同じ値が格納される。
     *
     * 本イベントは、プレイヤーがポインティングデバイスを移動していなくても、
     * カメラの移動等視覚的にポイントが変化している場合にも発生する。
     */
    var PointMoveEvent = /** @class */ (function (_super) {
        __extends(PointMoveEvent, _super);
        function PointMoveEvent(pointerId, target, point, prevDelta, startDelta, player, local, priority) {
            var _this = _super.call(this, pointerId, target, point, player, local, priority) || this;
            _this.type = EventType.PointMove;
            _this.prevDelta = prevDelta;
            _this.startDelta = startDelta;
            return _this;
        }
        return PointMoveEvent;
    }(PointEvent));
    g.PointMoveEvent = PointMoveEvent;
    /**
     * 汎用的なメッセージを表すイベント。
     * MessageEvent#dataによってメッセージ内容を取得出来る。
     */
    var MessageEvent = /** @class */ (function () {
        function MessageEvent(data, player, local, priority) {
            this.type = EventType.Message;
            this.priority = priority;
            this.local = local;
            this.player = player;
            this.data = data;
        }
        return MessageEvent;
    }());
    g.MessageEvent = MessageEvent;
    /**
     * 操作プラグインが通知する操作を表すイベント。
     * プラグインを識別する `OperationEvent#code` と、プラグインごとの内容 `OperationEvent#data` を持つ。
     */
    var OperationEvent = /** @class */ (function () {
        function OperationEvent(code, data, player, local, priority) {
            this.type = EventType.Operation;
            this.priority = priority;
            this.local = local;
            this.player = player;
            this.code = code;
            this.data = data;
        }
        return OperationEvent;
    }());
    g.OperationEvent = OperationEvent;
    /**
     * プレイヤーの参加を表すイベント。
     * JoinEvent#playerによって、参加したプレイヤーを取得出来る。
     */
    var JoinEvent = /** @class */ (function () {
        function JoinEvent(player, storageValues, priority) {
            this.type = EventType.Join;
            this.priority = priority;
            this.player = player;
            this.storageValues = storageValues;
        }
        return JoinEvent;
    }());
    g.JoinEvent = JoinEvent;
    /**
     * プレイヤーの離脱を表すイベント。
     * LeaveEvent#playerによって、離脱したプレイヤーを取得出来る。
     */
    var LeaveEvent = /** @class */ (function () {
        function LeaveEvent(player, priority) {
            this.type = EventType.Leave;
            this.priority = priority;
            this.player = player;
        }
        return LeaveEvent;
    }());
    g.LeaveEvent = LeaveEvent;
    /**
     * タイムスタンプを表すイベント。
     */
    var TimestampEvent = /** @class */ (function () {
        function TimestampEvent(timestamp, player, priority) {
            this.type = EventType.Timestamp;
            this.priority = priority;
            this.player = player;
            this.timestamp = timestamp;
        }
        return TimestampEvent;
    }());
    g.TimestampEvent = TimestampEvent;
    /**
     * 新しい乱数の発生を表すイベント。
     * SeedEvent#generatorによって、本イベントで発生したRandomGeneratorを取得出来る。
     */
    var SeedEvent = /** @class */ (function () {
        function SeedEvent(generator, priority) {
            this.type = EventType.Seed;
            this.priority = priority;
            this.generator = generator;
        }
        return SeedEvent;
    }());
    g.SeedEvent = SeedEvent;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * ログレベル。
     *
     * - Error: サーバ側でも収集される、ゲーム続行不可能なクリティカルなエラーログ
     * - Warn: サーバ側でも収集される、ゲーム続行可能だが危険な状態であることを示す警告ログ
     * - Info: クライアントでのみ収集される情報ログ
     * - Debug: サンドボックス環境でのみ収集される開発時限定のログ。リリース時には本処理をすべて消してリリースすることが望ましい
     */
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["Error"] = 0] = "Error";
        LogLevel[LogLevel["Warn"] = 1] = "Warn";
        LogLevel[LogLevel["Info"] = 2] = "Info";
        LogLevel[LogLevel["Debug"] = 3] = "Debug";
    })(LogLevel = g.LogLevel || (g.LogLevel = {}));
    /**
     * デバッグ/エラー用のログ出力機構。
     */
    var Logger = /** @class */ (function () {
        /**
         * `Logger` のインスタンスを生成する。
         * @param game この `Logger` に紐づく `Game` 。
         */
        function Logger(game) {
            this.game = game;
            this.logging = new g.Trigger();
        }
        Logger.prototype.destroy = function () {
            this.game = undefined;
            this.logging.destroy();
            this.logging = undefined;
        };
        Logger.prototype.destroyed = function () {
            return !this.game;
        };
        /**
         * `LogLevel.Error` のログを出力する。
         * @param message ログメッセージ
         * @param cause 追加の補助情報。省略された場合、 `undefined`
         * @deprecated このメソッドは非推奨である。ゲーム開発者はこのメソッドではなく単に `console.error()` や `console.log()` を利用すべきである。
         */
        Logger.prototype.error = function (message, cause) {
            this.logging.fire({
                game: this.game,
                level: LogLevel.Error,
                message: message,
                cause: cause
            });
        };
        /**
         * `LogLevel.Warn` のログを出力する。
         * @param message ログメッセージ
         * @param cause 追加の補助情報。省略された場合、 `undefined`
         * @deprecated このメソッドは非推奨である。ゲーム開発者はこのメソッドではなく単に `console.warn()` や `console.log()` を利用すべきである。
         */
        Logger.prototype.warn = function (message, cause) {
            this.logging.fire({
                game: this.game,
                level: LogLevel.Warn,
                message: message,
                cause: cause
            });
        };
        /**
         * `LogLevel.Info` のログを出力する。
         * @param message ログメッセージ
         * @param cause 追加の補助情報。省略された場合、 `undefined`
         * @deprecated このメソッドは非推奨である。ゲーム開発者はこのメソッドではなく単に `console.info()` や `console.log()` を利用すべきである。
         */
        Logger.prototype.info = function (message, cause) {
            this.logging.fire({
                game: this.game,
                level: LogLevel.Info,
                message: message,
                cause: cause
            });
        };
        /**
         * `LogLevel.Debug` のログを出力する。
         * @param message ログメッセージ
         * @param cause 追加の補助情報。省略された場合、 `undefined`
         * @deprecated このメソッドは非推奨である。ゲーム開発者はこのメソッドではなく単に `console.debug()` や `console.log()` を利用すべきである。
         */
        Logger.prototype.debug = function (message, cause) {
            this.logging.fire({
                game: this.game,
                level: LogLevel.Debug,
                message: message,
                cause: cause
            });
        };
        return Logger;
    }());
    g.Logger = Logger;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * コンテンツそのものを表すクラス。
     *
     * 本クラスのインスタンスは暗黙に生成され、ゲーム開発者が生成することはない。
     * ゲーム開発者はg.gameによって本クラスのインスタンスを参照できる。
     *
     * 多くの機能を持つが、本クラスをゲーム開発者が利用するのは以下のようなケースである。
     * 1. Sceneの生成時、コンストラクタに引数として渡す
     * 2. Sceneに紐付かないイベント Game#join, Game#leave, Game#seed を処理する
     * 3. 乱数を発生させるため、Game#randomにアクセスしRandomGeneratorを取得する
     * 4. ログを出力するため、Game#loggerでコンテンツに紐付くLoggerを取得する
     * 5. ゲームのメタ情報を確認するため、Game#width, Game#height, Game#fpsにアクセスする
     * 6. グローバルアセットを取得するため、Game#assetsにアクセスする
     * 7. LoadingSceneを変更するため、Game#loadingSceneにゲーム開発者の定義したLoadingSceneを指定する
     * 8. スナップショット機能を作るため、Game#snapshotRequestにアクセスする
     * 9. 現在フォーカスされているCamera情報を得るため、Game#focusingCameraにアクセスする
     * 10.AudioSystemを直接制御するため、Game#audioにアクセスする
     * 11.Sceneのスタック情報を調べるため、Game#scenesにアクセスする
     */
    var Game = /** @class */ (function () {
        /**
         * `Game` のインスタンスを生成する。
         * @param gameConfiguration この `Game` の設定。典型的には game.json の内容をパースしたものを期待する
         * @param resourceFactory この `Game` が用いる、リソースのファクトリ
         * @param assetBase アセットのパスの基準となるディレクトリ。省略された場合、空文字列
         * @param selfId このゲームを実行するユーザのID。省略された場合、`undefined`
         * @param operationPluginViewInfo このゲームの操作プラグインに与えるviewの情報
         */
        function Game(gameConfiguration, resourceFactory, assetBase, selfId, operationPluginViewInfo) {
            gameConfiguration = this._normalizeConfiguration(gameConfiguration);
            this.fps = gameConfiguration.fps;
            this.width = gameConfiguration.width;
            this.height = gameConfiguration.height;
            this.renderers = [];
            this.scenes = [];
            this.random = null;
            this.age = 0;
            this.assetBase = assetBase || "";
            this.resourceFactory = resourceFactory;
            this.selfId = selfId || undefined;
            this.playId = undefined;
            this.isSkipping = false;
            this.joinedPlayerIds = [];
            this._audioSystemManager = new g.AudioSystemManager(this);
            this.audio = {
                music: new g.MusicAudioSystem("music", this),
                sound: new g.SoundAudioSystem("sound", this)
            };
            this.defaultAudioSystemId = "sound";
            this.storage = new g.Storage(this);
            this.assets = {};
            this.surfaceAtlasSet = undefined;
            // TODO: (GAMEDEV-666) この三つのイベントはGame自身がデフォルトのイベントハンドラを持って処理する必要があるかも
            this.join = new g.Trigger();
            this.leave = new g.Trigger();
            this.seed = new g.Trigger();
            this._eventTriggerMap = {};
            this._eventTriggerMap[g.EventType.Join] = this.join;
            this._eventTriggerMap[g.EventType.Leave] = this.leave;
            this._eventTriggerMap[g.EventType.Seed] = this.seed;
            this._eventTriggerMap[g.EventType.Message] = undefined;
            this._eventTriggerMap[g.EventType.PointDown] = undefined;
            this._eventTriggerMap[g.EventType.PointMove] = undefined;
            this._eventTriggerMap[g.EventType.PointUp] = undefined;
            this._eventTriggerMap[g.EventType.Operation] = undefined;
            this.resized = new g.Trigger();
            this.skippingChanged = new g.Trigger();
            this.isLastTickLocal = true;
            this.lastOmittedLocalTickCount = 0;
            this._loaded = new g.Trigger();
            this._started = new g.Trigger();
            this.isLoaded = false;
            this.snapshotRequest = new g.Trigger();
            this.external = {};
            this.logger = new g.Logger(this);
            this._main = gameConfiguration.main;
            this._mainParameter = undefined;
            this._configuration = gameConfiguration;
            this._assetManager = new g.AssetManager(this, gameConfiguration.assets, gameConfiguration.audio, gameConfiguration.moduleMainScripts);
            var operationPluginsField = (gameConfiguration.operationPlugins || []);
            this._operationPluginManager = new g.OperationPluginManager(this, operationPluginViewInfo, operationPluginsField);
            this._operationPluginOperated = new g.Trigger();
            this._operationPluginManager.operated.add(this._operationPluginOperated.fire, this._operationPluginOperated);
            this._sceneChanged = new g.Trigger();
            this._sceneChanged.add(this._updateEventTriggers, this);
            this._initialScene = new g.Scene({
                game: this,
                assetIds: this._assetManager.globalAssetIds(),
                local: true,
                name: "akashic:initial-scene"
            });
            this._initialScene.loaded.add(this._onInitialSceneLoaded, this);
            this._reset({ age: 0 });
        }
        Object.defineProperty(Game.prototype, "focusingCamera", {
            /**
             * 使用中のカメラ。
             *
             * `Game#draw()`, `Game#findPointSource()` のデフォルト値として使用される。
             * この値を変更した場合、変更を描画に反映するためには `Game#modified` に真を代入しなければならない。
             * (ただしこの値が非 `undefined` の時、`Game#focusingCamera.modified()` を呼び出す場合は
             * `Game#modified` の操作は省略できる。)
             */
            // focusingCameraが変更されても古いカメラをtargetCamerasに持つエンティティのEntityStateFlags.Modifiedを取りこぼすことが無いように、変更時にはrenderを呼べるようアクセサを使う
            get: function () {
                return this._focusingCamera;
            },
            set: function (c) {
                if (c === this._focusingCamera)
                    return;
                if (this.modified)
                    this.render(this._focusingCamera);
                this._focusingCamera = c;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * シーンスタックへのシーンの追加と、そのシーンへの遷移を要求する。
         *
         * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
         * 実際のシーン遷移は次のフレームまでに(次のupdateのfireまでに)行われる。
         * このメソッドの呼び出しにより、現在のシーンの `stateChanged` が引数 `SceneState.Deactive` でfireされる。
         * その後 `scene.stateChanged` が引数 `SceneState.Active` でfireされる。
         * @param scene 遷移後のシーン
         */
        Game.prototype.pushScene = function (scene) {
            this._sceneChangeRequests.push({ type: 0 /* Push */, scene: scene });
        };
        /**
         * 現在のシーンの置き換えを要求する。
         *
         * 現在のシーンをシーンスタックから取り除き、指定のシーンを追加することを要求する。
         * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
         * 実際のシーン遷移は次のフレームまでに(次のupdateのfireまでに)行われる。
         * 引数 `preserveCurrent` が偽の場合、このメソッドの呼び出しにより現在のシーンは破棄される。
         * またその時 `stateChanged` が引数 `SceneState.Destroyed` でfireされる。
         * その後 `scene.stateChanged` が引数 `SceneState.Active` でfireされる。
         *
         * @param scene 遷移後のシーン
         * @param preserveCurrent 真の場合、現在のシーンを破棄しない(ゲーム開発者が明示的に破棄せねばならない)。省略された場合、偽
         */
        Game.prototype.replaceScene = function (scene, preserveCurrent) {
            this._sceneChangeRequests.push({ type: 1 /* Replace */, scene: scene, preserveCurrent: preserveCurrent });
        };
        /**
         * 一つ前のシーンに戻ることを要求する。
         *
         * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
         * 実際のシーン遷移は次のフレームまでに(次のupdateのfireまでに)行われる。
         * 引数 `preserveCurrent` が偽の場合、このメソッドの呼び出しにより現在のシーンは破棄される。
         * またその時 `stateChanged` が引数 `SceneState.Destroyed` でfireされる。
         * その後一つ前のシーンの `stateChanged` が引数 `SceneState.Active` でfireされる。
         *
         * @param preserveCurrent 真の場合、現在のシーンを破棄しない(ゲーム開発者が明示的に破棄せねばならない)。省略された場合、偽
         */
        Game.prototype.popScene = function (preserveCurrent) {
            this._sceneChangeRequests.push({ type: 2 /* Pop */, preserveCurrent: preserveCurrent });
        };
        /**
         * 現在のシーンを返す。
         * ない場合、 `undefined` を返す。
         */
        Game.prototype.scene = function () {
            if (!this.scenes.length)
                return undefined;
            return this.scenes[this.scenes.length - 1];
        };
        /**
         * この `Game` の時間経過とそれに伴う処理を行う。
         *
         * 現在の `Scene` に対して `Scene#update` をfireし、 `this.events` に設定されたイベントを処理する。
         * このメソッドの呼び出し後、 `this.events.length` は0である。
         * このメソッドは暗黙に呼び出される。ゲーム開発者がこのメソッドを利用する必要はない。
         *
         * 戻り値は呼び出し前後でシーンが変わった(別のシーンに遷移した)場合、真。でなければ偽。
         * @param advanceAge 偽を与えた場合、`this.age` を進めない。
         * @param omittedTickCount タイムスタンプ待ちを省略する動作などにより、(前回の呼び出し以降に)省かれたローカルティックの数。省略された場合、 `0` 。
         */
        Game.prototype.tick = function (advanceAge, omittedTickCount) {
            var scene = undefined;
            if (this._isTerminated)
                return false;
            this.isLastTickLocal = !advanceAge;
            this.lastOmittedLocalTickCount = omittedTickCount || 0;
            if (this.scenes.length) {
                scene = this.scenes[this.scenes.length - 1];
                if (this.events.length) {
                    var events = this.events;
                    this.events = [];
                    for (var i = 0; i < events.length; ++i) {
                        var trigger = this._eventTriggerMap[events[i].type];
                        if (trigger)
                            trigger.fire(events[i]);
                    }
                }
                scene.update.fire();
                if (advanceAge)
                    ++this.age;
            }
            if (this._sceneChangeRequests.length) {
                this._flushSceneChangeRequests();
                return scene !== this.scenes[this.scenes.length - 1];
            }
            return false;
        };
        /**
         * このGameを描画する。
         *
         * このゲームに紐づけられた `Renderer` (`this.renderers` に含まれるすべての `Renderer` で、この `Game` の描画を行う。
         * このメソッドは暗黙に呼び出される。ゲーム開発者がこのメソッドを利用する必要はない。
         *
         * @param camera 対象のカメラ。省略された場合 `Game.focusingCamera`
         */
        Game.prototype.render = function (camera) {
            if (!camera)
                camera = this.focusingCamera;
            var renderers = this.renderers; // unsafe
            for (var i = 0; i < renderers.length; ++i)
                renderers[i].draw(this, camera);
            this.modified = false;
        };
        /**
         * その座標に反応する `PointSource` を返す。
         *
         * 戻り値は、対象が見つかった場合、 `target` に見つかった `E` を持つ `PointSource` である。
         * 対象が見つからなかった場合、 `undefined` である。
         *
         * 戻り値が `undefined` でない場合、その `target` プロパティは次を満たす:
         * - `E#touchable` が真である
         * - カメラ `camera` から可視である中で最も手前にある
         *
         * @param point 対象の座標
         * @param camera 対象のカメラ。指定しなければ `Game.focusingCamera` が使われる
         */
        Game.prototype.findPointSource = function (point, camera) {
            if (!camera)
                camera = this.focusingCamera;
            return this.scene().findPointSourceByPoint(point, false, camera);
        };
        /**
         * このGameにエンティティを登録する。
         *
         * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に利用する必要はない。
         * `e.id` が `undefined` である場合、このメソッドの呼び出し後、 `e.id` には `this` に一意の値が設定される。
         * `e.local` が偽である場合、このメソッドの呼び出し後、 `this.db[e.id] === e` が成立する。
         * `e.local` が真である場合、 `e.id` の値は不定である。
         *
         * @param e 登録するエンティティ
         */
        Game.prototype.register = function (e) {
            if (e.local) {
                if (e.id === undefined) {
                    e.id = --this._localIdx;
                }
                else {
                    // register前にidがある: スナップショットからの復元用パス
                    // スナップショットはローカルエンティティを残さないはずだが、実装上はできるようにしておく。
                    if (e.id > 0)
                        throw g.ExceptionFactory.createAssertionError("Game#register: invalid local id: " + e.id);
                    if (this._localDb.hasOwnProperty(String(e.id)))
                        throw g.ExceptionFactory.createAssertionError("Game#register: conflicted id: " + e.id);
                    if (this._localIdx > e.id)
                        this._localIdx = e.id;
                }
                this._localDb[e.id] = e;
            }
            else {
                if (e.id === undefined) {
                    e.id = ++this._idx;
                }
                else {
                    // register前にidがある: スナップショットからの復元用パス
                    if (e.id < 0)
                        throw g.ExceptionFactory.createAssertionError("Game#register: invalid non-local id: " + e.id);
                    if (this.db.hasOwnProperty(String(e.id)))
                        throw g.ExceptionFactory.createAssertionError("Game#register: conflicted id: " + e.id);
                    // _idxがユニークな値を作れるよう更新しておく
                    if (this._idx < e.id)
                        this._idx = e.id;
                }
                this.db[e.id] = e;
            }
        };
        /**
         * このGameからエンティティの登録を削除する。
         *
         * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に利用する必要はない。
         * このメソッドの呼び出し後、 `this.db[e.id]` は未定義である。
         * @param e 登録を削除するエンティティ
         */
        Game.prototype.unregister = function (e) {
            if (e.local) {
                delete this._localDb[e.id];
            }
            else {
                delete this.db[e.id];
            }
        };
        /**
         * @deprecated 現在このメソッドは呼び出しても何も行わない。
         *
         * このゲームを離脱する。
         *
         * 多人数プレイの場合、他のクライアントでは `Game#leave` イベントがfireされる。
         * このメソッドの呼び出し後、このクライアントの操作要求は送信されない。
         */
        Game.prototype.leaveGame = function () {
            this._leaveGame();
        };
        /**
         * このゲームを終了する。
         *
         * エンジンに対して続行の断念を通知する。
         * このメソッドの呼び出し後、このクライアントの操作要求は送信されない。
         * またこのクライアントのゲーム実行は行われない(updateを含むイベントのfireはおきない)。
         */
        Game.prototype.terminateGame = function () {
            this._leaveGame();
            this._isTerminated = true;
        };
        /**
         * @private
         */
        Game.prototype._fireSceneReady = function (scene) {
            this._sceneChangeRequests.push({ type: 3 /* FireReady */, scene: scene });
        };
        /**
         * @private
         */
        Game.prototype._fireSceneLoaded = function (scene) {
            if (scene._loadingState < g.SceneLoadState.LoadedFired) {
                this._sceneChangeRequests.push({ type: 4 /* FireLoaded */, scene: scene });
            }
        };
        /**
         * @private
         */
        Game.prototype._callSceneAssetHolderHandler = function (assetHolder) {
            this._sceneChangeRequests.push({ type: 5 /* CallAssetHolderHandler */, assetHolder: assetHolder });
        };
        /**
         * @private
         */
        Game.prototype._normalizeConfiguration = function (gameConfiguration) {
            if (!gameConfiguration)
                throw g.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: invalid arguments");
            if (!("assets" in gameConfiguration))
                gameConfiguration.assets = {};
            if (!("fps" in gameConfiguration))
                gameConfiguration.fps = 30;
            if (typeof gameConfiguration.fps !== "number")
                throw g.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: fps must be given as a number");
            if (!(0 <= gameConfiguration.fps && gameConfiguration.fps <= 60))
                throw g.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: fps must be a number in (0, 60].");
            if (typeof gameConfiguration.width !== "number")
                throw g.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: width must be given as a number");
            if (typeof gameConfiguration.height !== "number")
                throw g.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: height must be given as a number");
            return gameConfiguration;
        };
        /**
         * @private
         */
        Game.prototype._setAudioPlaybackRate = function (playbackRate) {
            this._audioSystemManager._setPlaybackRate(playbackRate);
        };
        /**
         * @private
         */
        Game.prototype._setMuted = function (muted) {
            this._audioSystemManager._setMuted(muted);
        };
        /**
         * g.OperationEventのデータをデコードする。
         * @private
         */
        Game.prototype._decodeOperationPluginOperation = function (code, op) {
            var plugins = this._operationPluginManager.plugins;
            if (!plugins[code] || !plugins[code].decode)
                return op;
            return plugins[code].decode(op);
        };
        /**
         * ゲーム状態のリセット。
         * @private
         */
        Game.prototype._reset = function (param) {
            this._operationPluginManager.stopAll();
            if (this.scene()) {
                while (this.scene() !== this._initialScene) {
                    this.popScene();
                    this._flushSceneChangeRequests();
                }
                if (!this.isLoaded) {
                    // _initialSceneの読み込みが終わっていない: _initialScene自体は使い回すので単にpopする。
                    this.scenes.pop();
                }
            }
            if (param) {
                if (param.age !== undefined)
                    this.age = param.age;
                if (param.randGen !== undefined)
                    this.random = param.randGen;
            }
            this._audioSystemManager._reset();
            this._loaded.removeAll({ func: this._start, owner: this });
            this.join.removeAll();
            this.leave.removeAll();
            this.seed.removeAll();
            this.resized.removeAll();
            this.skippingChanged.removeAll();
            this.isSkipping = false;
            this.skippingChanged.add(this._handleSkippingChanged, this);
            this.joinedPlayerIds = [];
            this.join.add(this._handleJoinEvent, this);
            this.leave.add(this._handleLeaveEvent, this);
            this._idx = 0;
            this._localIdx = 0;
            this._cameraIdx = 0;
            this.db = {};
            this._localDb = {};
            this.events = [];
            this.modified = true;
            this.loadingScene = undefined;
            this._focusingCamera = undefined;
            this._scriptCaches = {};
            this.snapshotRequest.removeAll();
            this._sceneChangeRequests = [];
            this._isTerminated = false;
            this.vars = {};
            if (this.surfaceAtlasSet)
                this.surfaceAtlasSet.destroy();
            this.surfaceAtlasSet = new g.SurfaceAtlasSet({ game: this });
            switch (this._configuration.defaultLoadingScene) {
                case "none":
                    // Note: 何も描画しない実装として利用している
                    this._defaultLoadingScene = new g.LoadingScene({ game: this });
                    break;
                default:
                    this._defaultLoadingScene = new g.DefaultLoadingScene({ game: this });
                    break;
            }
        };
        /**
         * ゲームを破棄する。
         * エンジンユーザとコンテンツに開放された一部プロパティ(external, vars)は維持する点に注意。
         * @private
         */
        Game.prototype._destroy = function () {
            // ユーザコードを扱う操作プラグインを真っ先に破棄
            this._operationPluginManager.destroy();
            // 到達できるシーンを全て破棄
            if (this.scene()) {
                while (this.scene() !== this._initialScene) {
                    this.popScene();
                    this._flushSceneChangeRequests();
                }
            }
            this._initialScene.destroy();
            if (this.loadingScene && !this.loadingScene.destroyed()) {
                this.loadingScene.destroy();
            }
            if (!this._defaultLoadingScene.destroyed()) {
                this._defaultLoadingScene.destroy();
            }
            // NOTE: fps, width, height, external, vars はそのまま保持しておく
            this.db = undefined;
            this.renderers = undefined;
            this.scenes = undefined;
            this.random = undefined;
            this.events = undefined;
            this.join.destroy();
            this.join = undefined;
            this.leave.destroy();
            this.leave = undefined;
            this.seed.destroy();
            this.seed = undefined;
            this.modified = false;
            this.age = 0;
            this.assets = undefined; // this._initialScene.assets のエイリアスなので、特に破棄処理はしない。
            this.isLoaded = false;
            this.loadingScene = undefined;
            this.assetBase = "";
            this.selfId = undefined;
            var audioSystemIds = Object.keys(this.audio);
            for (var i = 0; i < audioSystemIds.length; ++i)
                this.audio[audioSystemIds[i]].stopAll();
            this.audio = undefined;
            this.defaultAudioSystemId = undefined;
            this.logger.destroy();
            this.logger = undefined;
            this.snapshotRequest.destroy();
            this.snapshotRequest = undefined;
            // TODO より能動的にdestroy処理を入れるべきかもしれない
            this.resourceFactory = undefined;
            this.storage = undefined;
            this.playId = undefined;
            this.operationPlugins = undefined; // this._operationPluginManager.pluginsのエイリアスなので、特に破棄処理はしない。
            this.resized.destroy();
            this.resized = undefined;
            this.skippingChanged.destroy();
            this.skippingChanged = undefined;
            this._eventTriggerMap = undefined;
            this._initialScene = undefined;
            this._defaultLoadingScene = undefined;
            this._sceneChanged.destroy();
            this._sceneChanged = undefined;
            this._scriptCaches = undefined;
            this._loaded.destroy();
            this._loaded = undefined;
            this._started.destroy();
            this._started = undefined;
            this._main = undefined;
            this._mainParameter = undefined;
            this._assetManager.destroy();
            this._assetManager = undefined;
            this._audioSystemManager._game = undefined;
            this._audioSystemManager = undefined;
            this._operationPluginManager = undefined;
            this._operationPluginOperated.destroy();
            this._operationPluginOperated = undefined;
            this._idx = 0;
            this._localDb = {};
            this._localIdx = 0;
            this._cameraIdx = 0;
            this._isTerminated = true;
            this._focusingCamera = undefined;
            this._configuration = undefined;
            this._sceneChangeRequests = [];
            this.surfaceAtlasSet.destroy();
            this.surfaceAtlasSet = undefined;
        };
        /**
         * ゲームを開始する。
         *
         * 存在するシーンをすべて(_initialScene以外; あるなら)破棄し、グローバルアセットを読み込み、完了後ゲーム開発者の実装コードの実行を開始する。
         * このメソッドの二度目以降の呼び出しの前には、 `this._reset()` を呼び出す必要がある。
         * @param param ゲームのエントリポイントに渡す値
         * @private
         */
        Game.prototype._loadAndStart = function (param) {
            this._mainParameter = param || {};
            if (!this.isLoaded) {
                this._loaded.add(this._start, this);
                this.pushScene(this._initialScene);
                this._flushSceneChangeRequests();
            }
            else {
                this._start();
            }
        };
        /**
         * グローバルアセットの読み込みを開始する。
         * 単体テスト用 (mainSceneなど特定アセットの存在を前提にする_loadAndStart()はテストに使いにくい) なので、通常ゲーム開発者が利用することはない
         * @private
         */
        Game.prototype._startLoadingGlobalAssets = function () {
            if (this.isLoaded)
                throw g.ExceptionFactory.createAssertionError("Game#_startLoadingGlobalAssets: already loaded.");
            this.pushScene(this._initialScene);
            this._flushSceneChangeRequests();
        };
        /**
         * @private
         */
        Game.prototype._updateEventTriggers = function (scene) {
            this.modified = true;
            if (!scene) {
                this._eventTriggerMap[g.EventType.Message] = undefined;
                this._eventTriggerMap[g.EventType.PointDown] = undefined;
                this._eventTriggerMap[g.EventType.PointMove] = undefined;
                this._eventTriggerMap[g.EventType.PointUp] = undefined;
                this._eventTriggerMap[g.EventType.Operation] = undefined;
                return;
            }
            this._eventTriggerMap[g.EventType.Message] = scene.message;
            this._eventTriggerMap[g.EventType.PointDown] = scene.pointDownCapture;
            this._eventTriggerMap[g.EventType.PointMove] = scene.pointMoveCapture;
            this._eventTriggerMap[g.EventType.PointUp] = scene.pointUpCapture;
            this._eventTriggerMap[g.EventType.Operation] = scene.operation;
            scene._activate();
        };
        /**
         * @private
         */
        Game.prototype._onInitialSceneLoaded = function () {
            this._initialScene.loaded.remove(this._onInitialSceneLoaded, this);
            this.assets = this._initialScene.assets;
            this.isLoaded = true;
            this._loaded.fire();
        };
        /**
         * @private
         * エラーを出してゲームを途中終了させるメソッド。
         */
        Game.prototype._abortGame = function () {
            // do nothing.
        };
        /**
         * 要求されたシーン遷移を実行する。
         *
         * `pushScene()` 、 `replaceScene()` や `popScene()` によって要求されたシーン遷移を実行する。
         * 通常このメソッドは、毎フレーム一度、フレームの最後に呼び出されることを期待する (`Game#tick()` がこの呼び出しを行う)。
         * ただしゲーム開始時 (グローバルアセット読み込み・スナップショットローダ起動後またはmainScene実行開始時) に関しては、
         * シーン追加がゲーム開発者の記述によらない (`tick()` の外側である) ため、それぞれの箇所で明示的にこのメソッドを呼び出す。
         * @private
         */
        Game.prototype._flushSceneChangeRequests = function () {
            do {
                var reqs = this._sceneChangeRequests;
                this._sceneChangeRequests = [];
                for (var i = 0; i < reqs.length; ++i) {
                    var req = reqs[i];
                    switch (req.type) {
                        case 0 /* Push */:
                            var oldScene = this.scene();
                            if (oldScene) {
                                oldScene._deactivate();
                            }
                            this._doPushScene(req.scene);
                            break;
                        case 1 /* Replace */:
                            // Note: replaceSceneの場合、pop時点では_sceneChangedをfireしない。_doPushScene() で一度だけfireする。
                            this._doPopScene(req.preserveCurrent, false);
                            this._doPushScene(req.scene);
                            break;
                        case 2 /* Pop */:
                            this._doPopScene(req.preserveCurrent, true);
                            break;
                        case 3 /* FireReady */:
                            if (!req.scene.destroyed())
                                req.scene._fireReady();
                            break;
                        case 4 /* FireLoaded */:
                            if (!req.scene.destroyed())
                                req.scene._fireLoaded();
                            break;
                        case 5 /* CallAssetHolderHandler */:
                            if (!req.assetHolder.destroyed())
                                req.assetHolder.callHandler();
                            break;
                        default:
                            throw g.ExceptionFactory.createAssertionError("Game#_flushSceneChangeRequests: unknown scene change request.");
                    }
                }
            } while (this._sceneChangeRequests.length > 0); // flush中に追加される限りflushを続行する
        };
        Game.prototype._handleSkippingChanged = function (isSkipping) {
            this.isSkipping = isSkipping;
        };
        Game.prototype._handleJoinEvent = function (event) {
            if (this.joinedPlayerIds.indexOf(event.player.id) !== -1)
                return;
            this.joinedPlayerIds.push(event.player.id);
        };
        Game.prototype._handleLeaveEvent = function (event) {
            this.joinedPlayerIds = this.joinedPlayerIds.filter(function (id) { return id !== event.player.id; });
        };
        Game.prototype._doPopScene = function (preserveCurrent, fireSceneChanged) {
            var scene = this.scenes.pop();
            if (scene === this._initialScene)
                throw g.ExceptionFactory.createAssertionError("Game#_doPopScene: invalid call; attempting to pop the initial scene");
            if (!preserveCurrent)
                scene.destroy();
            if (fireSceneChanged)
                this._sceneChanged.fire(this.scene());
        };
        Game.prototype._start = function () {
            this._operationPluginManager.initialize();
            this.operationPlugins = this._operationPluginManager.plugins;
            // deprecated の挙動: エントリポイントの指定がない場合
            if (!this._main) {
                if (!this._mainParameter.snapshot) {
                    if (!this.assets.mainScene)
                        throw g.ExceptionFactory.createAssertionError("Game#_start: global asset 'mainScene' not found.");
                    var mainScene = g._require(this, "mainScene")();
                    this.pushScene(mainScene);
                    this._flushSceneChangeRequests();
                }
                else {
                    if (!this.assets.snapshotLoader)
                        throw g.ExceptionFactory.createAssertionError("Game#_start: global asset 'snapshotLoader' not found.");
                    var loader = g._require(this, "snapshotLoader");
                    loader(this._mainParameter.snapshot);
                    this._flushSceneChangeRequests(); // スナップショットローダもシーン遷移を要求する可能性がある(というかまずする)
                }
                this._started.fire();
                return;
            }
            var mainFun = g._require(this, this._main);
            if (!mainFun || typeof mainFun !== "function")
                throw g.ExceptionFactory.createAssertionError("Game#_start: Entry point '" + this._main + "' not found.");
            mainFun(this._mainParameter);
            this._flushSceneChangeRequests(); // シーン遷移を要求する可能性がある(というかまずする)
            this._started.fire();
        };
        Game.prototype._doPushScene = function (scene, loadingScene) {
            if (!loadingScene)
                loadingScene = this.loadingScene || this._defaultLoadingScene;
            this.scenes.push(scene);
            if (scene._needsLoading() && scene._loadingState < g.SceneLoadState.LoadedFired) {
                if (this._defaultLoadingScene._needsLoading())
                    throw g.ExceptionFactory.createAssertionError("Game#_doPushScene: _defaultLoadingScene must not depend on any assets/storages.");
                this._doPushScene(loadingScene, this._defaultLoadingScene);
                loadingScene.reset(scene);
            }
            else {
                // 読み込み待ちのアセットがなければその場で(loadingSceneに任せず)ロード、SceneReadyを発生させてからLoadingSceneEndを起こす。
                this._sceneChanged.fire(scene);
                if (!scene._loaded) {
                    scene._load();
                    this._fireSceneLoaded(scene);
                }
            }
            this.modified = true;
        };
        return Game;
    }());
    g.Game = Game;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 2D世界におけるカメラ。
     */
    var Camera2D = /** @class */ (function (_super) {
        __extends(Camera2D, _super);
        /**
         * 指定されたパラメータで `Camera2D` のインスタンスを生成する。
         * @param param 初期化に用いるパラメータのオブジェクト
         */
        function Camera2D(param) {
            var _this = _super.call(this, param) || this;
            _this.game = param.game;
            _this.local = !!param.local;
            _this.name = param.name;
            _this._modifiedCount = 0;
            // param の width と height は無視する
            _this.width = param.game.width;
            _this.height = param.game.height;
            _this.id = _this.local ? undefined : _this.game._cameraIdx++;
            return _this;
        }
        /**
         * 与えられたシリアリゼーションでカメラを復元する。
         *
         * @param ser `Camera2D#serialize()` の戻り値
         * @param game 復元されたカメラの属する Game
         */
        Camera2D.deserialize = function (ser, game) {
            var s = ser;
            s.param.game = game;
            var ret = new Camera2D(s.param);
            ret.id = s.id;
            return ret;
        };
        /**
         * カメラ状態の変更をエンジンに通知する。
         *
         * このメソッドの呼び出し後、このカメラのプロパティに対する変更が各 `Renderer` の描画に反映される。
         * ただし逆は真ではない。すなわち、再描画は他の要因によって行われることもある。
         * ゲーム開発者は、このメソッドを呼び出していないことをもって再描画が行われていないことを仮定してはならない。
         *
         * 本メソッドは、このオブジェクトの `Object2D` 由来のプロパティ (`x`, `y`, `angle` など) を変更した場合にも呼びだす必要がある。
         */
        Camera2D.prototype.modified = function () {
            this._modifiedCount = (this._modifiedCount + 1) % 32768;
            if (this._matrix)
                this._matrix._modified = true;
            this.game.modified = true;
        };
        /**
         * このカメラをシリアライズする。
         *
         * このメソッドの戻り値を `Camera2D#deserialize()` に渡すことで同じ値を持つカメラを復元することができる。
         */
        Camera2D.prototype.serialize = function () {
            var ser = {
                id: this.id,
                param: {
                    game: undefined,
                    local: this.local,
                    name: this.name,
                    x: this.x,
                    y: this.y,
                    width: this.width,
                    height: this.height,
                    opacity: this.opacity,
                    scaleX: this.scaleX,
                    scaleY: this.scaleY,
                    angle: this.angle,
                    compositeOperation: this.compositeOperation
                }
            };
            return ser;
        };
        /**
         * @private
         */
        Camera2D.prototype._applyTransformToRenderer = function (renderer) {
            if (this.angle || this.scaleX !== 1 || this.scaleY !== 1 || this.anchorX != null || this.anchorY != null) {
                // Note: this.scaleX/scaleYが0の場合描画した結果何も表示されない事になるが、特殊扱いはしない
                renderer.transform(this.getMatrix()._matrix);
            }
            else {
                renderer.translate(-this.x, -this.y);
            }
            if (this.opacity !== 1)
                renderer.opacity(this.opacity);
        };
        /**
         * @private
         */
        Camera2D.prototype._updateMatrix = function () {
            // カメラの angle, x, y はエンティティと逆方向に作用することに注意。
            if (this.anchorX != null && this.anchorY != null) {
                this._matrix.updateByInverseWithAnchor(this.width, this.height, this.scaleX, this.scaleY, this.angle, this.x, this.y, this.anchorX, this.anchorY);
            }
            else if (this.angle || this.scaleX !== 1 || this.scaleY !== 1) {
                this._matrix.updateByInverse(this.width, this.height, this.scaleX, this.scaleY, this.angle, this.x, this.y);
            }
            else {
                this._matrix.reset(-this.x, -this.y);
            }
        };
        return Camera2D;
    }(g.Object2D));
    g.Camera2D = Camera2D;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * ゲームの描画を行うクラス。
     *
     * 描画は各エンティティによって行われる。通常、ゲーム開発者が本クラスを利用する必要はない。
     */
    var Renderer = /** @class */ (function () {
        function Renderer() {
        }
        Renderer.prototype.draw = function (game, camera) {
            var scene = game.scene();
            if (!scene)
                return;
            this.begin();
            this.save();
            this.clear();
            if (camera) {
                this.save();
                camera._applyTransformToRenderer(this);
            }
            var children = scene.children;
            for (var i = 0; i < children.length; ++i)
                children[i].render(this, camera);
            if (camera) {
                this.restore();
            }
            this.restore();
            this.end();
        };
        Renderer.prototype.begin = function () {
            // nothing to do
        };
        Renderer.prototype.end = function () {
            // nothing to do
        };
        return Renderer;
    }());
    g.Renderer = Renderer;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 描画領域を表すクラス。
     *
     * このクラスのインスタンスは、エンジンによって暗黙に生成される。
     * ゲーム開発者はこのクラスのインスタンスを明示的に生成する必要はなく、またできない。
     */
    var Surface = /** @class */ (function () {
        /**
         * `Surface` のインスタンスを生成する。
         * @param width 描画領域の幅（整数値でなければならない）
         * @param height 描画領域の高さ（整数値でなければならない）
         * @param drawable 描画可能な実体。省略された場合、 `undefined`
         * @param isDynamic drawableが動画であることを示す値。動画である時、真を渡さなくてはならない。省略された場合、偽。
         */
        function Surface(width, height, drawable, isDynamic) {
            if (isDynamic === void 0) { isDynamic = false; }
            if (width % 1 !== 0 || height % 1 !== 0) {
                throw g.ExceptionFactory.createAssertionError("Surface#constructor: width and height must be integers");
            }
            this.width = width;
            this.height = height;
            if (drawable)
                this._drawable = drawable;
            // this._destroyedは破棄時に一度だけ代入する特殊なフィールドなため、コンストラクタで初期値を代入しない
            this.isDynamic = isDynamic;
            if (this.isDynamic) {
                this.animatingStarted = new g.Trigger();
                this.animatingStopped = new g.Trigger();
            }
            else {
                this.animatingStarted = undefined;
                this.animatingStopped = undefined;
            }
        }
        /**
         * このSurfaceの破棄を行う。
         * 以後、このSurfaceを利用することは出来なくなる。
         */
        Surface.prototype.destroy = function () {
            if (this.animatingStarted) {
                this.animatingStarted.destroy();
            }
            if (this.animatingStopped) {
                this.animatingStopped.destroy();
            }
            this._destroyed = true;
        };
        /**
         * このSurfaceが破棄済であるかどうかを判定する。
         */
        Surface.prototype.destroyed = function () {
            // _destroyedはundefinedかtrueなため、常にbooleanが返すように!!演算子を用いる
            return !!this._destroyed;
        };
        return Surface;
    }());
    g.Surface = Surface;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 単一行のテキストを描画するエンティティ。
     * 本クラスの利用には `BitmapFont` または `DynamicFont` が必要となる。
     */
    var Label = /** @class */ (function (_super) {
        __extends(Label, _super);
        /**
         * 各種パラメータを指定して `Label` のインスタンスを生成する。
         * @param param このエンティティに指定するパラメータ
         */
        function Label(param) {
            var _this = _super.call(this, param) || this;
            _this.text = param.text;
            _this.font = param.font;
            _this.textAlign = "textAlign" in param ? param.textAlign : g.TextAlign.Left;
            _this.glyphs = new Array(param.text.length);
            _this.fontSize = param.fontSize;
            _this.maxWidth = param.maxWidth;
            _this.widthAutoAdjust = "widthAutoAdjust" in param ? param.widthAutoAdjust : true;
            _this.textColor = param.textColor;
            _this._textWidth = 0;
            _this._game = undefined;
            _this._overhangLeft = 0;
            _this._overhangRight = 0;
            _this._invalidateSelf();
            return _this;
        }
        /**
         * `width` と `textAlign` を設定し、 `widthAutoAdjust` を `false` に設定する。
         *
         * このメソッドは `this.textAlign` を設定するためのユーティリティである。
         * `textAlign` を `TextAlign.Left` 以外に設定する場合には、通常 `width` や `widthAutoAdjust` も設定する必要があるため、それらをまとめて行う。
         * このメソッドの呼び出し後、 `this.invalidate()` を呼び出す必要がある。
         * @param width 幅
         * @param textAlign テキストの描画位置
         */
        Label.prototype.aligning = function (width, textAlign) {
            this.width = width;
            this.widthAutoAdjust = false;
            this.textAlign = textAlign;
        };
        /**
         * このエンティティの描画キャッシュ無効化をエンジンに通知する。
         * このメソッドを呼び出し後、描画キャッシュの再構築が行われ、各 `Renderer` に描画内容の変更が反映される。
         */
        Label.prototype.invalidate = function () {
            this._invalidateSelf();
            _super.prototype.invalidate.call(this);
        };
        /**
         * Label自身の描画を行う。
         */
        Label.prototype.renderSelfFromCache = function (renderer) {
            // glyphのはみ出し量に応じて、描画先のX座標を調整する。
            var destOffsetX;
            switch (this.textAlign) {
                case g.TextAlign.Center:
                    destOffsetX = this.widthAutoAdjust ? this._overhangLeft : 0;
                    break;
                case g.TextAlign.Right:
                    destOffsetX = this.widthAutoAdjust ? this._overhangLeft : this._overhangRight;
                    break;
                default:
                    destOffsetX = this._overhangLeft;
                    break;
            }
            renderer.drawImage(this._cache, 0, 0, this._cacheSize.width + g.CacheableE.PADDING, this._cacheSize.height + g.CacheableE.PADDING, destOffsetX, 0);
        };
        Label.prototype.renderCache = function (renderer) {
            if (!this.fontSize || this.height <= 0 || this._textWidth <= 0) {
                return;
            }
            var scale = this.maxWidth > 0 && this.maxWidth < this._textWidth ? this.maxWidth / this._textWidth : 1;
            var offsetX = 0;
            switch (this.textAlign) {
                case g.TextAlign.Center:
                    offsetX = this.width / 2 - ((this._textWidth + this._overhangLeft) / 2) * scale;
                    break;
                case g.TextAlign.Right:
                    offsetX = this.width - (this._textWidth + this._overhangLeft) * scale;
                    break;
                default:
                    offsetX -= this._overhangLeft * scale;
                    break;
            }
            renderer.translate(offsetX, 0);
            if (scale !== 1) {
                renderer.transform([scale, 0, 0, 1, 0, 0]);
            }
            renderer.save();
            var glyphScale = this.fontSize / this.font.size;
            for (var i = 0; i < this.glyphs.length; ++i) {
                var glyph = this.glyphs[i];
                var glyphWidth = glyph.advanceWidth * glyphScale;
                var code = glyph.code;
                if (!glyph.isSurfaceValid) {
                    glyph = this.font.glyphForCharacter(code);
                    if (!glyph) {
                        this._outputOfWarnLogWithNoGlyph(code, "renderCache()");
                        continue;
                    }
                }
                if (glyph.surface) {
                    // 非空白文字
                    renderer.save();
                    renderer.transform([glyphScale, 0, 0, glyphScale, 0, 0]);
                    renderer.drawImage(glyph.surface, glyph.x, glyph.y, glyph.width, glyph.height, glyph.offsetX, glyph.offsetY);
                    renderer.restore();
                }
                renderer.translate(glyphWidth, 0);
            }
            renderer.restore();
            renderer.save();
            if (this.textColor) {
                renderer.setCompositeOperation(g.CompositeOperation.SourceAtop);
                renderer.fillRect(0, 0, this._textWidth, this.height, this.textColor);
            }
            renderer.restore();
        };
        /**
         * このエンティティを破棄する。
         * 利用している `BitmapFont` の破棄は行わないため、 `BitmapFont` の破棄はコンテンツ製作者が明示的に行う必要がある。
         */
        Label.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        Label.prototype._invalidateSelf = function () {
            this.glyphs.length = 0;
            this._textWidth = 0;
            if (!this.fontSize) {
                this.height = 0;
                return;
            }
            var effectiveTextLastIndex = this.text.length - 1;
            // 右のはみだし量を求めるため、text内での有効な最後の glyph のindexを解決する。
            for (var i = this.text.length - 1; i >= 0; --i) {
                var code = g.Util.charCodeAt(this.text, i);
                if (!code) {
                    continue;
                }
                var glyph = this.font.glyphForCharacter(code);
                if (glyph && glyph.width !== 0 && glyph.advanceWidth !== 0) {
                    effectiveTextLastIndex = i;
                    break;
                }
            }
            var maxHeight = 0;
            var glyphScale = this.font.size > 0 ? this.fontSize / this.font.size : 0;
            for (var i = 0; i <= effectiveTextLastIndex; ++i) {
                var code_1 = g.Util.charCodeAt(this.text, i);
                if (!code_1) {
                    continue;
                }
                var glyph = this.font.glyphForCharacter(code_1);
                if (!glyph) {
                    this._outputOfWarnLogWithNoGlyph(code_1, "_invalidateSelf()");
                    continue;
                }
                if (glyph.width < 0 || glyph.height < 0) {
                    continue;
                }
                if (glyph.x < 0 || glyph.y < 0) {
                    continue;
                }
                this.glyphs.push(glyph);
                // Font に StrokeWidth が設定されている場合、文字の描画内容は、描画の基準点よりも左にはみ出る場合や、glyph.advanceWidth より右にはみ出る場合がある。
                // キャッシュサーフェスの幅は、最初の文字と最後の文字のはみ出し部分を考慮して求める必要がある。
                var overhang = 0;
                if (i === 0) {
                    this._overhangLeft = Math.min(glyph.offsetX, 0);
                    overhang = -this._overhangLeft;
                }
                if (i === effectiveTextLastIndex) {
                    this._overhangRight = Math.max(glyph.width + glyph.offsetX - glyph.advanceWidth, 0);
                    overhang += this._overhangRight;
                }
                this._textWidth += (glyph.advanceWidth + overhang) * glyphScale;
                var height = glyph.offsetY + glyph.height;
                if (maxHeight < height) {
                    maxHeight = height;
                }
            }
            if (this.widthAutoAdjust) {
                this.width = this._textWidth;
            }
            this.height = maxHeight * glyphScale;
        };
        Label.prototype._outputOfWarnLogWithNoGlyph = function (code, functionName) {
            var str = code & 0xffff0000 ? String.fromCharCode((code & 0xffff0000) >>> 16, code & 0xffff) : String.fromCharCode(code);
            this.game().logger.warn("Label#" +
                functionName +
                ": failed to get a glyph for '" +
                str +
                "' " +
                "(BitmapFont might not have the glyph or DynamicFont might create a glyph larger than its atlas).");
        };
        return Label;
    }(g.CacheableE));
    g.Label = Label;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * グリフ。
     */
    var Glyph = /** @class */ (function () {
        /**
         * `Glyph` のインスタンスを生成する。
         */
        function Glyph(code, x, y, width, height, offsetX, offsetY, advanceWidth, surface, isSurfaceValid) {
            if (offsetX === void 0) { offsetX = 0; }
            if (offsetY === void 0) { offsetY = 0; }
            if (advanceWidth === void 0) { advanceWidth = width; }
            if (isSurfaceValid === void 0) { isSurfaceValid = !!surface; }
            this.code = code;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.offsetX = offsetX;
            this.offsetY = offsetY;
            this.advanceWidth = advanceWidth;
            this.surface = surface;
            this.isSurfaceValid = isSurfaceValid;
            this._atlas = null;
        }
        /**
         * グリフの描画上の幅を求める。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         * @param fontSize フォントサイズ
         */
        Glyph.prototype.renderingWidth = function (fontSize) {
            if (!this.width || !this.height) {
                return 0;
            }
            return (fontSize / this.height) * this.width;
        };
        return Glyph;
    }());
    g.Glyph = Glyph;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 塗りつぶされた矩形を表すエンティティ。
     */
    var FilledRect = /** @class */ (function (_super) {
        __extends(FilledRect, _super);
        /**
         * 各種パラメータを指定して `FilledRect` のインスタンスを生成する。
         * @param param このエンティティに対するパラメータ
         */
        function FilledRect(param) {
            var _this = _super.call(this, param) || this;
            if (typeof param.cssColor !== "string")
                throw g.ExceptionFactory.createTypeMismatchError("ColorBox#constructor(cssColor)", "string", param.cssColor);
            _this.cssColor = param.cssColor;
            return _this;
        }
        /**
         * このエンティティ自身の描画を行う。
         * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
         */
        FilledRect.prototype.renderSelf = function (renderer) {
            renderer.fillRect(0, 0, this.width, this.height, this.cssColor);
            return true;
        };
        return FilledRect;
    }(g.E));
    g.FilledRect = FilledRect;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 枠を表すエンティティ。
     * クリッピングやパディング、バックグラウンドイメージの演出等の機能を持つため、
     * メニューやメッセージ、ステータスのウィンドウ等に利用されることが期待される。
     * このエンティティの子要素は、このエンティティの持つ `Surface` に描画される。
     */
    var Pane = /** @class */ (function (_super) {
        __extends(Pane, _super);
        /**
         * 各種パラメータを指定して `Pane` のインスタンスを生成する。
         * @param param このエンティティに指定するパラメータ
         */
        function Pane(param) {
            var _this = _super.call(this, param) || this;
            _this._oldWidth = param.width;
            _this._oldHeight = param.height;
            _this.backgroundImage = g.Util.asSurface(param.backgroundImage);
            _this.backgroundEffector = param.backgroundEffector;
            _this._shouldRenderChildren = false;
            _this._padding = param.padding;
            _this._initialize();
            _this._paddingChanged = false;
            _this._bgSurface = undefined;
            _this._bgRenderer = undefined;
            return _this;
        }
        Object.defineProperty(Pane.prototype, "padding", {
            get: function () {
                return this._padding;
            },
            /**
             * パディング。
             * このエンティティの子孫は、パディングに指定された分だけ右・下にずれた場所に描画され、またパディングの矩形サイズでクリッピングされる。
             */
            // NOTE: paddingの変更は頻繁に行われるものでは無いと思われるので、フラグを立てるためにアクセサを使う
            set: function (padding) {
                this._padding = padding;
                this._paddingChanged = true;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * このエンティティに対する変更をエンジンに通知する。
         * このメソッドの呼び出し後、 `this` に対する変更が各 `Renderer` の描画に反映される。
         * このメソッドは描画キャッシュの無効化を保証しない。描画キャッシュの無効化も必要な場合、 `invalidate()`を呼び出さなければならない。
         * 詳細は `E#modified()` のドキュメントを参照。
         */
        Pane.prototype.modified = function (isBubbling) {
            if (isBubbling)
                this.state &= ~2 /* Cached */;
            _super.prototype.modified.call(this);
        };
        Pane.prototype.shouldFindChildrenByPoint = function (point) {
            var p = this._normalizedPadding;
            if (p.left < point.x && this.width - p.right > point.x && p.top < point.y && this.height - p.bottom > point.y) {
                return true;
            }
            return false;
        };
        Pane.prototype.renderCache = function (renderer, camera) {
            if (this.width <= 0 || this.height <= 0) {
                return;
            }
            this._renderBackground();
            this._renderChildren(camera);
            if (this._bgSurface) {
                renderer.drawImage(this._bgSurface, 0, 0, this.width, this.height, 0, 0);
            }
            else if (this.backgroundImage) {
                renderer.drawImage(this.backgroundImage, 0, 0, this.width, this.height, 0, 0);
            }
            if (this._childrenArea.width <= 0 || this._childrenArea.height <= 0) {
                return;
            }
            renderer.save();
            if (this._childrenArea.x !== 0 || this._childrenArea.y !== 0) {
                renderer.translate(this._childrenArea.x, this._childrenArea.y);
            }
            renderer.drawImage(this._childrenSurface, 0, 0, this._childrenArea.width, this._childrenArea.height, 0, 0);
            renderer.restore();
        };
        /**
         * このエンティティを破棄する。また、バックバッファで利用している `Surface` も合わせて破棄される。
         * ただし、 `backgroundImage` に利用している `Surface` の破棄は行わない。
         * @param destroySurface trueを指定した場合、 `backgroundImage` に利用している `Surface` も合わせて破棄する。
         */
        Pane.prototype.destroy = function (destroySurface) {
            if (destroySurface && this.backgroundImage && !this.backgroundImage.destroyed()) {
                this.backgroundImage.destroy();
            }
            if (this._bgSurface && !this._bgSurface.destroyed()) {
                this._bgSurface.destroy();
            }
            if (this._childrenSurface && !this._childrenSurface.destroyed()) {
                this._childrenSurface.destroy();
            }
            this.backgroundImage = undefined;
            this._bgSurface = undefined;
            this._childrenSurface = undefined;
            _super.prototype.destroy.call(this);
        };
        /**
         * @private
         */
        Pane.prototype._renderBackground = function () {
            if (this.backgroundImage && this.backgroundEffector) {
                var bgSurface = this.backgroundEffector.render(this.backgroundImage, this.width, this.height);
                if (this._bgSurface !== bgSurface) {
                    if (this._bgSurface && !this._bgSurface.destroyed()) {
                        this._bgSurface.destroy();
                    }
                    this._bgSurface = bgSurface;
                }
            }
            else {
                this._bgSurface = undefined;
            }
        };
        /**
         * @private
         */
        Pane.prototype._renderChildren = function (camera) {
            var isNew = this._oldWidth !== this.width || this._oldHeight !== this.height || this._paddingChanged;
            if (isNew) {
                this._initialize();
                this._paddingChanged = false;
                this._oldWidth = this.width;
                this._oldHeight = this.height;
            }
            this._childrenRenderer.begin();
            if (!isNew) {
                this._childrenRenderer.clear();
            }
            if (this.children) {
                // Note: concatしていないのでunsafeだが、render中に配列の中身が変わる事はない前提とする
                var children = this.children;
                for (var i = 0; i < children.length; ++i) {
                    children[i].render(this._childrenRenderer, camera);
                }
            }
            this._childrenRenderer.end();
        };
        /**
         * @private
         */
        Pane.prototype._initialize = function () {
            var p = this._padding === undefined ? 0 : this._padding;
            var r;
            if (typeof p === "number") {
                r = { top: p, bottom: p, left: p, right: p };
            }
            else {
                r = this._padding;
            }
            this._childrenArea = {
                x: r.left,
                y: r.top,
                width: this.width - r.left - r.right,
                height: this.height - r.top - r.bottom
            };
            var resourceFactory = this.scene.game.resourceFactory;
            if (this._childrenSurface && !this._childrenSurface.destroyed()) {
                this._childrenSurface.destroy();
            }
            this._childrenSurface = resourceFactory.createSurface(Math.ceil(this._childrenArea.width), Math.ceil(this._childrenArea.height));
            this._childrenRenderer = this._childrenSurface.renderer();
            this._normalizedPadding = r;
        };
        /**
         * このPaneの包含矩形を計算する。
         * Eを継承する他のクラスと異なり、Paneは子要素の位置を包括矩形に含まない。
         * @private
         */
        Pane.prototype._calculateBoundingRect = function (m, c) {
            var matrix = this.getMatrix();
            if (m) {
                matrix = m.multiplyNew(matrix);
            }
            if (!this.visible() || (c && (!this._targetCameras || this._targetCameras.indexOf(c) === -1))) {
                return undefined;
            }
            var thisBoundingRect = { left: 0, right: this.width, top: 0, bottom: this.height };
            var targetCoordinates = [
                { x: thisBoundingRect.left, y: thisBoundingRect.top },
                { x: thisBoundingRect.left, y: thisBoundingRect.bottom },
                { x: thisBoundingRect.right, y: thisBoundingRect.top },
                { x: thisBoundingRect.right, y: thisBoundingRect.bottom }
            ];
            var convertedPoint = matrix.multiplyPoint(targetCoordinates[0]);
            var result = { left: convertedPoint.x, right: convertedPoint.x, top: convertedPoint.y, bottom: convertedPoint.y };
            for (var i = 1; i < targetCoordinates.length; ++i) {
                convertedPoint = matrix.multiplyPoint(targetCoordinates[i]);
                if (result.left > convertedPoint.x)
                    result.left = convertedPoint.x;
                if (result.right < convertedPoint.x)
                    result.right = convertedPoint.x;
                if (result.top > convertedPoint.y)
                    result.top = convertedPoint.y;
                if (result.bottom < convertedPoint.y)
                    result.bottom = convertedPoint.y;
            }
            return result;
        };
        return Pane;
    }(g.CacheableE));
    g.Pane = Pane;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 操作プラグインからの通知をハンドルするクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var OperationHandler = /** @class */ (function () {
        function OperationHandler(code, owner, handler) {
            this._code = code;
            this._handler = handler;
            this._handlerOwner = owner;
        }
        OperationHandler.prototype.onOperation = function (op) {
            var iop;
            if (op instanceof Array) {
                iop = { _code: this._code, data: op };
            }
            else {
                iop = op;
                iop._code = this._code;
            }
            this._handler.call(this._handlerOwner, iop);
        };
        return OperationHandler;
    }());
    /**
     * 操作プラグインを管理するクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var OperationPluginManager = /** @class */ (function () {
        function OperationPluginManager(game, viewInfo, infos) {
            this.operated = new g.Trigger();
            this.plugins = {};
            this._game = game;
            this._viewInfo = viewInfo;
            this._infos = infos;
            this._initialized = false;
        }
        /**
         * 初期化する。
         * このメソッドの呼び出しは、`this.game._loaded` のfire後でなければならない。
         */
        OperationPluginManager.prototype.initialize = function () {
            if (!this._initialized) {
                this._initialized = true;
                this._loadOperationPlugins();
            }
            this._doAutoStart();
        };
        OperationPluginManager.prototype.destroy = function () {
            this.stopAll();
            this.operated.destroy();
            this.operated = undefined;
            this.plugins = undefined;
            this._game = undefined;
            this._viewInfo = undefined;
            this._infos = undefined;
        };
        OperationPluginManager.prototype.stopAll = function () {
            if (!this._initialized)
                return;
            for (var i = 0; i < this._infos.length; ++i) {
                var info = this._infos[i];
                if (info._plugin)
                    info._plugin.stop();
            }
        };
        OperationPluginManager.prototype._doAutoStart = function () {
            for (var i = 0; i < this._infos.length; ++i) {
                var info = this._infos[i];
                if (!info.manualStart && info._plugin)
                    info._plugin.start();
            }
        };
        OperationPluginManager.prototype._loadOperationPlugins = function () {
            for (var i = 0; i < this._infos.length; ++i) {
                var info = this._infos[i];
                if (!info.script)
                    continue;
                var pluginClass = g._require(this._game, info.script);
                if (!pluginClass.isSupported())
                    continue;
                var plugin = new pluginClass(this._game, this._viewInfo, info.option);
                var code = info.code;
                if (this.plugins[code]) {
                    throw new Error("Plugin#code conflicted for code: " + code);
                }
                this.plugins[code] = plugin;
                info._plugin = plugin;
                var handler = new OperationHandler(code, this.operated, this.operated.fire);
                plugin.operationTrigger.handle(handler, handler.onOperation);
            }
        };
        return OperationPluginManager;
    }());
    g.OperationPluginManager = OperationPluginManager;
})(g || (g = {}));
var g;
(function (g) {
})(g || (g = {}));
var g;
(function (g) {
    /**
     * フォント。
     */
    var Font = /** @class */ (function () {
        function Font() {
        }
        /**
         * 対象の文字列を一行で描画した際の計測情報を返す。
         *
         * @param text 文字列
         */
        Font.prototype.measureText = function (text) {
            var width = 0;
            var actualBoundingBoxLeft = 0;
            var actualBoundingBoxRight = 0;
            var lastGlyph;
            for (var i = 0; i < text.length; i++) {
                var code = g.Util.charCodeAt(text, i);
                if (!code)
                    continue;
                var glyph = this.glyphForCharacter(code);
                if (!glyph || glyph.x < 0 || glyph.y < 0 || glyph.width < 0 || glyph.height < 0)
                    continue;
                if (i === 0) {
                    actualBoundingBoxLeft = -glyph.offsetX;
                }
                lastGlyph = glyph;
                width += glyph.advanceWidth;
            }
            if (lastGlyph) {
                actualBoundingBoxRight = width + lastGlyph.offsetX + lastGlyph.width - lastGlyph.advanceWidth;
            }
            return {
                width: width,
                actualBoundingBoxLeft: actualBoundingBoxLeft,
                actualBoundingBoxRight: actualBoundingBoxRight
            };
        };
        return Font;
    }());
    g.Font = Font;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 文字列描画のフォントウェイト。
     */
    var FontWeight;
    (function (FontWeight) {
        /**
         * 通常のフォントウェイト。
         */
        FontWeight[FontWeight["Normal"] = 0] = "Normal";
        /**
         * 太字のフォントウェイト。
         */
        FontWeight[FontWeight["Bold"] = 1] = "Bold";
    })(FontWeight = g.FontWeight || (g.FontWeight = {}));
    /**
     * ビットマップフォントを逐次生成するフォント。
     */
    var DynamicFont = /** @class */ (function (_super) {
        __extends(DynamicFont, _super);
        /**
         * 各種パラメータを指定して `DynamicFont` のインスタンスを生成する。
         * @param param `DynamicFont` に設定するパラメータ
         */
        function DynamicFont(param) {
            var _this = _super.call(this) || this;
            _this.fontFamily = param.fontFamily;
            _this.size = param.size;
            _this.hint = "hint" in param ? param.hint : {};
            _this.fontColor = "fontColor" in param ? param.fontColor : "black";
            _this.fontWeight = "fontWeight" in param ? param.fontWeight : FontWeight.Normal;
            _this.strokeWidth = "strokeWidth" in param ? param.strokeWidth : 0;
            _this.strokeColor = "strokeColor" in param ? param.strokeColor : "black";
            _this.strokeOnly = "strokeOnly" in param ? param.strokeOnly : false;
            _this._resourceFactory = param.game.resourceFactory;
            _this._glyphFactory = _this._resourceFactory.createGlyphFactory(_this.fontFamily, _this.size, _this.hint.baselineHeight, _this.fontColor, _this.strokeWidth, _this.strokeColor, _this.strokeOnly, _this.fontWeight);
            _this._glyphs = {};
            _this._destroyed = false;
            _this._isSurfaceAtlasSetOwner = false;
            // NOTE: hint の特定プロパティ(baselineHeight)を分岐の条件にした場合、後でプロパティを追加した時に
            // ここで追従漏れの懸念があるため、引数の hint が省略されているかで分岐させている。
            if (param.surfaceAtlasSet) {
                _this._atlasSet = param.surfaceAtlasSet;
            }
            else if (!!param.hint) {
                _this._isSurfaceAtlasSetOwner = true;
                _this._atlasSet = new g.SurfaceAtlasSet({
                    game: param.game,
                    hint: _this.hint
                });
            }
            else {
                _this._atlasSet = param.game.surfaceAtlasSet;
            }
            if (_this.hint.presetChars) {
                for (var i = 0, len = _this.hint.presetChars.length; i < len; i++) {
                    var code = g.Util.charCodeAt(_this.hint.presetChars, i);
                    if (!code) {
                        continue;
                    }
                    _this.glyphForCharacter(code);
                }
            }
            return _this;
        }
        /**
         * グリフの取得。
         *
         * 取得に失敗するとnullが返る。
         *
         * 取得に失敗した時、次のようにすることで成功するかもしれない。
         * - DynamicFont生成時に指定する文字サイズを小さくする
         * - アトラスの初期サイズ・最大サイズを大きくする
         *
         * @param code 文字コード
         */
        DynamicFont.prototype.glyphForCharacter = function (code) {
            var glyph = this._glyphs[code];
            if (!(glyph && glyph.isSurfaceValid)) {
                glyph = this._glyphFactory.create(code);
                if (glyph.surface) {
                    // 空白文字でなければアトラス化する
                    if (!this._atlasSet.addGlyph(glyph)) {
                        return null;
                    }
                }
                this._glyphs[code] = glyph;
            }
            this._atlasSet.touchGlyph(glyph);
            return glyph;
        };
        /**
         * BtimapFontの生成。
         *
         * 実装上の制限から、このメソッドを呼び出す場合、maxAtlasNum が 1 または undefined/null(1として扱われる) である必要がある。
         * そうでない場合、失敗する可能性がある。
         *
         * @param missingGlyph `BitmapFont#map` に存在しないコードポイントの代わりに表示するべき文字。最初の一文字が用いられる。
         */
        DynamicFont.prototype.asBitmapFont = function (missingGlyphChar) {
            var _this = this;
            if (this._atlasSet.getAtlasNum() !== 1) {
                return null;
            }
            var missingGlyphCharCodePoint;
            if (missingGlyphChar) {
                missingGlyphCharCodePoint = g.Util.charCodeAt(missingGlyphChar, 0);
                this.glyphForCharacter(missingGlyphCharCodePoint);
            }
            var glyphAreaMap = {};
            Object.keys(this._glyphs).forEach(function (_key) {
                var key = Number(_key);
                var glyph = _this._glyphs[key];
                var glyphArea = {
                    x: glyph.x,
                    y: glyph.y,
                    width: glyph.width,
                    height: glyph.height,
                    offsetX: glyph.offsetX,
                    offsetY: glyph.offsetY,
                    advanceWidth: glyph.advanceWidth
                };
                glyphAreaMap[key] = glyphArea;
            });
            // NOTE: (defaultGlyphWidth, defaultGlyphHeight)= (0, this.size) とする
            //
            // それぞれの役割は第一に `GlyphArea#width`, `GlyphArea#height` が与えられないときの
            // デフォルト値である。ここでは必ず与えているのでデフォルト値としては利用されない。
            // しかし defaultGlyphHeight は BitmapFont#size にも用いられる。
            // そのために this.size をコンストラクタの第４引数に与えることにする。
            var missingGlyph = glyphAreaMap[missingGlyphCharCodePoint];
            var surface = this._atlasSet.getAtlas(0).duplicateSurface(this._resourceFactory);
            var bitmapFont = new g.BitmapFont({
                src: surface,
                map: glyphAreaMap,
                defaultGlyphWidth: 0,
                defaultGlyphHeight: this.size,
                missingGlyph: missingGlyph
            });
            return bitmapFont;
        };
        DynamicFont.prototype.destroy = function () {
            if (this._isSurfaceAtlasSetOwner) {
                this._atlasSet.destroy();
            }
            this._glyphs = null;
            this._glyphFactory = null;
            this._destroyed = true;
        };
        DynamicFont.prototype.destroyed = function () {
            return this._destroyed;
        };
        return DynamicFont;
    }(g.Font));
    g.DynamicFont = DynamicFont;
})(g || (g = {}));
var g;
(function (g_1) {
    /**
     * ラスタ画像によるフォント。
     */
    var BitmapFont = /** @class */ (function (_super) {
        __extends(BitmapFont, _super);
        /**
         * 各種パラメータを指定して `BitmapFont` のインスタンスを生成する。
         * @param param `BitmapFont` に設定するパラメータ
         */
        function BitmapFont(param) {
            var _this = _super.call(this) || this;
            _this.surface = g_1.Util.asSurface(param.src);
            _this.map = param.map;
            _this.defaultGlyphWidth = param.defaultGlyphWidth;
            _this.defaultGlyphHeight = param.defaultGlyphHeight;
            _this.missingGlyph = param.missingGlyph;
            _this.size = param.defaultGlyphHeight;
            return _this;
        }
        /**
         * コードポイントに対応するグリフを返す。
         * @param code コードポイント
         */
        BitmapFont.prototype.glyphForCharacter = function (code) {
            var g = this.map[code] || this.missingGlyph;
            if (!g) {
                return null;
            }
            var w = g.width === undefined ? this.defaultGlyphWidth : g.width;
            var h = g.height === undefined ? this.defaultGlyphHeight : g.height;
            var offsetX = g.offsetX || 0;
            var offsetY = g.offsetY || 0;
            var advanceWidth = g.advanceWidth === undefined ? w : g.advanceWidth;
            var surface = w === 0 || h === 0 ? undefined : this.surface;
            return new g_1.Glyph(code, g.x, g.y, w, h, offsetX, offsetY, advanceWidth, surface, true);
        };
        /**
         * 利用している `Surface` を破棄した上で、このフォントを破棄する。
         */
        BitmapFont.prototype.destroy = function () {
            if (this.surface && !this.surface.destroyed()) {
                this.surface.destroy();
            }
            this.map = undefined;
        };
        /**
         * 破棄されたオブジェクトかどうかを判定する。
         */
        BitmapFont.prototype.destroyed = function () {
            // mapをfalsy値で作成された場合最初から破棄扱いになるが、仕様とする
            return !this.map;
        };
        return BitmapFont;
    }(g_1.Font));
    g_1.BitmapFont = BitmapFont;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * SurfaceAtlasの空き領域管理クラス。
     *
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var SurfaceAtlasSlot = /** @class */ (function () {
        function SurfaceAtlasSlot(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.prev = null;
            this.next = null;
        }
        return SurfaceAtlasSlot;
    }());
    g.SurfaceAtlasSlot = SurfaceAtlasSlot;
    function getSurfaceAtlasSlot(slot, width, height) {
        while (slot) {
            if (slot.width >= width && slot.height >= height) {
                return slot;
            }
            slot = slot.next;
        }
        return null;
    }
    function calcAtlasSize(hint) {
        var width = Math.ceil(Math.min(hint.initialAtlasWidth, hint.maxAtlasWidth));
        var height = Math.ceil(Math.min(hint.initialAtlasHeight, hint.maxAtlasHeight));
        return { width: width, height: height };
    }
    /**
     * サーフェスアトラス。
     *
     * 与えられたサーフェスの指定された領域をコピーし一枚のサーフェスにまとめる。
     *
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var SurfaceAtlas = /** @class */ (function () {
        function SurfaceAtlas(surface) {
            this._surface = surface;
            this._emptySurfaceAtlasSlotHead = new SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
            this._accessScore = 0;
            this._usedRectangleAreaSize = { width: 0, height: 0 };
        }
        SurfaceAtlas.prototype.reset = function () {
            var renderer = this._surface.renderer();
            renderer.begin();
            renderer.clear();
            renderer.end();
            this._emptySurfaceAtlasSlotHead = new SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
            this._accessScore = 0;
            this._usedRectangleAreaSize.width = 0;
            this._usedRectangleAreaSize.height = 0;
        };
        /**
         * @private
         */
        SurfaceAtlas.prototype._acquireSurfaceAtlasSlot = function (width, height) {
            // Renderer#drawImage()でサーフェス上の一部を描画するとき、
            // 指定した部分に隣接する画素がにじみ出る現象が確認されている。
            // ここれではそれを避けるため1pixelの余白を与えている。
            width += 1;
            height += 1;
            var slot = getSurfaceAtlasSlot(this._emptySurfaceAtlasSlotHead, width, height);
            if (!slot) {
                return null;
            }
            var remainWidth = slot.width - width;
            var remainHeight = slot.height - height;
            var left;
            var right;
            if (remainWidth <= remainHeight) {
                left = new SurfaceAtlasSlot(slot.x + width, slot.y, remainWidth, height);
                right = new SurfaceAtlasSlot(slot.x, slot.y + height, slot.width, remainHeight);
            }
            else {
                left = new SurfaceAtlasSlot(slot.x, slot.y + height, width, remainHeight);
                right = new SurfaceAtlasSlot(slot.x + width, slot.y, remainWidth, slot.height);
            }
            left.prev = slot.prev;
            left.next = right;
            if (left.prev === null) {
                // left is head
                this._emptySurfaceAtlasSlotHead = left;
            }
            else {
                left.prev.next = left;
            }
            right.prev = left;
            right.next = slot.next;
            if (right.next) {
                right.next.prev = right;
            }
            var acquiredSlot = new SurfaceAtlasSlot(slot.x, slot.y, width, height);
            this._updateUsedRectangleAreaSize(acquiredSlot);
            return acquiredSlot;
        };
        /**
         * @private
         */
        SurfaceAtlas.prototype._updateUsedRectangleAreaSize = function (slot) {
            var slotRight = slot.x + slot.width;
            var slotBottom = slot.y + slot.height;
            if (slotRight > this._usedRectangleAreaSize.width) {
                this._usedRectangleAreaSize.width = slotRight;
            }
            if (slotBottom > this._usedRectangleAreaSize.height) {
                this._usedRectangleAreaSize.height = slotBottom;
            }
        };
        /**
         * サーフェスの追加。
         *
         * @param glyph グリフのサーフェスが持つ情報をSurfaceAtlasへ配置
         */
        SurfaceAtlas.prototype.addSurface = function (glyph) {
            var slot = this._acquireSurfaceAtlasSlot(glyph.width, glyph.height);
            if (!slot) {
                return null;
            }
            var renderer = this._surface.renderer();
            renderer.begin();
            renderer.drawImage(glyph.surface, glyph.x, glyph.y, glyph.width, glyph.height, slot.x, slot.y);
            renderer.end();
            return slot;
        };
        /**
         * このSurfaceAtlasの破棄を行う。
         * 以後、このSurfaceを利用することは出来なくなる。
         */
        SurfaceAtlas.prototype.destroy = function () {
            this._surface.destroy();
        };
        /**
         * このSurfaceAtlasが破棄済であるかどうかを判定する。
         */
        SurfaceAtlas.prototype.destroyed = function () {
            return this._surface.destroyed();
        };
        /**
         * _surfaceを複製する。
         *
         * 複製されたSurfaceは文字を格納するのに必要な最低限のサイズになる。
         */
        SurfaceAtlas.prototype.duplicateSurface = function (resourceFactory) {
            var src = this._surface;
            var dst = resourceFactory.createSurface(this._usedRectangleAreaSize.width, this._usedRectangleAreaSize.height);
            var renderer = dst.renderer();
            renderer.begin();
            renderer.drawImage(src, 0, 0, this._usedRectangleAreaSize.width, this._usedRectangleAreaSize.height, 0, 0);
            renderer.end();
            return dst;
        };
        return SurfaceAtlas;
    }());
    g.SurfaceAtlas = SurfaceAtlas;
    /**
     * DynamicFont で使用される SurfaceAtlas を管理するクラス。
     *
     * 歴史的経緯のため、名前に反して DynamicFont 専用のクラスであり、汎用の SurfaceAtlas 管理クラスではない点に注意。
     */
    var SurfaceAtlasSet = /** @class */ (function () {
        function SurfaceAtlasSet(params) {
            this._surfaceAtlases = [];
            this._atlasGlyphsTable = [];
            this._resourceFactory = params.game.resourceFactory;
            this._currentAtlasIndex = 0;
            var hint = params.hint ? params.hint : {};
            this._maxAtlasNum = hint.maxAtlasNum ? hint.maxAtlasNum : SurfaceAtlasSet.INITIAL_MAX_SURFACEATLAS_NUM;
            // 指定がないとき、やや古いモバイルデバイスでも確保できると言われる
            // 縦横512pxのテクスチャ一枚のアトラスにまとめる形にする
            // 2048x2048で確保してしまうと、Edge, Chrome にて処理が非常に遅くなることがある
            hint.initialAtlasWidth = hint.initialAtlasWidth ? hint.initialAtlasWidth : 512;
            hint.initialAtlasHeight = hint.initialAtlasHeight ? hint.initialAtlasHeight : 512;
            hint.maxAtlasWidth = hint.maxAtlasWidth ? hint.maxAtlasWidth : 512;
            hint.maxAtlasHeight = hint.maxAtlasHeight ? hint.maxAtlasHeight : 512;
            this._atlasSize = calcAtlasSize(hint);
        }
        /**
         * @private
         */
        SurfaceAtlasSet.prototype._deleteAtlas = function (delteNum) {
            for (var i = 0; i < delteNum; ++i) {
                var atlas = this._spliceLeastFrequentlyUsedAtlas();
                if (!atlas)
                    return;
                atlas.destroy();
            }
        };
        /**
         * surfaceAtlases の最も利用されていない SurfaceAtlas を探し、 そのインデックスを返す。
         *
         * _surfaceAtlases の長さが 0 の場合、 -1 を返す。
         * @private
         */
        SurfaceAtlasSet.prototype._findLeastFrequentlyUsedAtlasIndex = function () {
            var minScore = Number.MAX_VALUE;
            var lowScoreAtlasIndex = -1;
            for (var i = 0; i < this._surfaceAtlases.length; ++i) {
                if (this._surfaceAtlases[i]._accessScore <= minScore) {
                    minScore = this._surfaceAtlases[i]._accessScore;
                    lowScoreAtlasIndex = i;
                }
            }
            return lowScoreAtlasIndex;
        };
        /**
         * surfaceAtlases の最も利用されていない SurfaceAtlas を切り離して返す。
         *
         * 返された SurfaceAtlas に紐づいていたすべての Glyph はサーフェスを失う (_isSurfaceValid が偽になる) 。
         * _surfaceAtlases の長さが 0 の場合、 何もせず null を返す。
         * @private
         */
        SurfaceAtlasSet.prototype._spliceLeastFrequentlyUsedAtlas = function () {
            var idx = this._findLeastFrequentlyUsedAtlasIndex();
            if (idx === -1)
                return null;
            if (this._currentAtlasIndex >= idx)
                --this._currentAtlasIndex;
            var spliced = this._surfaceAtlases.splice(idx, 1)[0];
            var glyphs = this._atlasGlyphsTable.splice(idx, 1)[0];
            for (var i = 0; i < glyphs.length; i++) {
                var glyph = glyphs[i];
                glyph.surface = undefined;
                glyph.isSurfaceValid = false;
                glyph._atlas = null;
            }
            return spliced;
        };
        /**
         * 空き領域のある SurfaceAtlas を探索する。
         * glyph が持つ情報を SurfaceAtlas へ移動し、移動した SurfaceAtlas の情報で glyph を置き換える。
         * glyph が持っていた surface は破棄される。
         *
         * 移動に成功した場合 `true` を、失敗した (空き領域が見つからなかった) 場合 `false` を返す。
         * @private
         */
        SurfaceAtlasSet.prototype._moveGlyphSurface = function (glyph) {
            for (var i = 0; i < this._surfaceAtlases.length; ++i) {
                var index = (this._currentAtlasIndex + i) % this._surfaceAtlases.length;
                var atlas = this._surfaceAtlases[index];
                var slot = atlas.addSurface(glyph);
                if (slot) {
                    this._currentAtlasIndex = index;
                    glyph.surface.destroy();
                    glyph.surface = atlas._surface;
                    glyph.x = slot.x;
                    glyph.y = slot.y;
                    glyph._atlas = atlas;
                    this._atlasGlyphsTable[index].push(glyph);
                    return true;
                }
            }
            return false;
        };
        /**
         * サーフェスアトラスの再割り当てを行う。
         * @private
         */
        SurfaceAtlasSet.prototype._reallocateAtlas = function () {
            var atlas = null;
            if (this._surfaceAtlases.length >= this._maxAtlasNum) {
                atlas = this._spliceLeastFrequentlyUsedAtlas();
                atlas.reset();
            }
            else {
                atlas = new SurfaceAtlas(this._resourceFactory.createSurface(this._atlasSize.width, this._atlasSize.height));
            }
            this._surfaceAtlases.push(atlas);
            this._atlasGlyphsTable.push([]);
            this._currentAtlasIndex = this._surfaceAtlases.length - 1;
        };
        /**
         * 引数で指定されたindexのサーフェスアトラスを取得する。
         *
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         * @param index 取得対象のインデックス
         */
        SurfaceAtlasSet.prototype.getAtlas = function (index) {
            return this._surfaceAtlases[index];
        };
        /**
         * サーフェスアトラスの保持数を取得する。
         *
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         */
        SurfaceAtlasSet.prototype.getAtlasNum = function () {
            return this._surfaceAtlases.length;
        };
        /**
         * 最大サーフェスアトラス保持数取得する。
         */
        SurfaceAtlasSet.prototype.getMaxAtlasNum = function () {
            return this._maxAtlasNum;
        };
        /**
         * 最大アトラス保持数設定する。
         *
         * 設定された値が、現在保持している_surfaceAtlasesの数より大きい場合、
         * removeLeastFrequentlyUsedAtlas()で設定値まで削除する。
         * @param value 設定値
         */
        SurfaceAtlasSet.prototype.changeMaxAtlasNum = function (value) {
            this._maxAtlasNum = value;
            if (this._surfaceAtlases.length > this._maxAtlasNum) {
                var diff = this._surfaceAtlases.length - this._maxAtlasNum;
                this._deleteAtlas(diff);
            }
        };
        /**
         * サーフェスアトラスのサイズを取得する。
         *
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         */
        SurfaceAtlasSet.prototype.getAtlasSize = function () {
            return this._atlasSize;
        };
        /**
         * グリフを追加する。
         *
         * glyph が持っていたサーフェスは破棄され、このクラスが管理するいずれかの (サーフェスアトラスの) サーフェスに紐づけられる。
         * 追加に成功した場合 `true` を、失敗した (空き領域が見つからなかった) 場合 `false` を返す。
         *
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         * @param glyph グリフ
         */
        SurfaceAtlasSet.prototype.addGlyph = function (glyph) {
            // グリフがアトラスより大きいとき、`_atlasSet.addGlyph()`は失敗する。
            // `_reallocateAtlas()`でアトラス増やしてもこれは解決できない。
            // 無駄な空き領域探索とアトラスの再確保を避けるためにここでリターンする。
            if (glyph.width > this._atlasSize.width || glyph.height > this._atlasSize.height) {
                return false;
            }
            if (this._moveGlyphSurface(glyph))
                return true;
            // retry
            this._reallocateAtlas();
            return this._moveGlyphSurface(glyph);
        };
        /**
         * グリフの利用を通知する。
         *
         * サーフェスが不足した時、このクラスは最も利用頻度の低いサーフェスを解放して再利用する。
         * このメソッドによるグリフの利用通知は、利用頻度の低いサーフェスを特定するために利用される。
         *
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         * @param glyph グリフ
         */
        SurfaceAtlasSet.prototype.touchGlyph = function (glyph) {
            // スコア更新
            // NOTE: LRUを捨てる方式なら単純なタイムスタンプのほうがわかりやすいかもしれない
            // NOTE: 正確な時刻は必要ないはずで、インクリメンタルなカウンタで代用すればDate()生成コストは省略できる
            if (glyph._atlas)
                glyph._atlas._accessScore += 1;
            for (var i = 0; i < this._surfaceAtlases.length; i++) {
                var atlas = this._surfaceAtlases[i];
                atlas._accessScore /= 2;
            }
        };
        /**
         * このインスタンスを破棄する。
         */
        SurfaceAtlasSet.prototype.destroy = function () {
            for (var i = 0; i < this._surfaceAtlases.length; ++i) {
                this._surfaceAtlases[i].destroy();
            }
            this._surfaceAtlases = undefined;
            this._resourceFactory = undefined;
            this._atlasGlyphsTable = undefined;
        };
        /**
         * このインスタンスが破棄済みであるかどうかを返す。
         */
        SurfaceAtlasSet.prototype.destroyed = function () {
            return this._surfaceAtlases === undefined;
        };
        /**
         * SurfaceAtlas最大保持数初期値
         */
        SurfaceAtlasSet.INITIAL_MAX_SURFACEATLAS_NUM = 10;
        return SurfaceAtlasSet;
    }());
    g.SurfaceAtlasSet = SurfaceAtlasSet;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * `Game#audio` の管理クラス。
     *
     * 複数の `AudioSystem` に一括で必要な状態設定を行う。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var AudioSystemManager = /** @class */ (function () {
        function AudioSystemManager(game) {
            this._game = game;
            this._muted = false;
            this._playbackRate = 1.0;
        }
        /**
         * @private
         */
        AudioSystemManager.prototype._reset = function () {
            this._muted = false;
            this._playbackRate = 1.0;
            var systems = this._game.audio;
            for (var id in systems) {
                if (!systems.hasOwnProperty(id))
                    continue;
                systems[id]._reset();
            }
        };
        /**
         * @private
         */
        AudioSystemManager.prototype._setMuted = function (muted) {
            if (this._muted === muted)
                return;
            this._muted = muted;
            var systems = this._game.audio;
            for (var id in systems) {
                if (!systems.hasOwnProperty(id))
                    continue;
                systems[id]._setMuted(muted);
            }
        };
        /**
         * @private
         */
        AudioSystemManager.prototype._setPlaybackRate = function (rate) {
            if (this._playbackRate === rate)
                return;
            this._playbackRate = rate;
            var systems = this._game.audio;
            for (var id in systems) {
                if (!systems.hasOwnProperty(id))
                    continue;
                systems[id]._setPlaybackRate(rate);
            }
        };
        return AudioSystemManager;
    }());
    g.AudioSystemManager = AudioSystemManager;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 描画時の合成方法。
     */
    var CompositeOperation;
    (function (CompositeOperation) {
        /**
         * 先に描画された領域の上に描画する。
         */
        CompositeOperation[CompositeOperation["SourceOver"] = 0] = "SourceOver";
        /**
         * 先に描画された領域と重なった部分のみを描画する。
         */
        CompositeOperation[CompositeOperation["SourceAtop"] = 1] = "SourceAtop";
        /**
         * 先に描画された領域と重なった部分の色を加算して描画する。
         */
        CompositeOperation[CompositeOperation["Lighter"] = 2] = "Lighter";
        /**
         * 先に描画された領域を全て無視して描画する。
         */
        CompositeOperation[CompositeOperation["Copy"] = 3] = "Copy";
        /**
         * 先に描画された領域と重なった部分に描画を行い、それ以外の部分を透明にする。
         * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
         */
        CompositeOperation[CompositeOperation["ExperimentalSourceIn"] = 4] = "ExperimentalSourceIn";
        /**
         * 先に描画された領域と重なっていない部分に描画を行い、それ以外の部分を透明にする。
         * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
         */
        CompositeOperation[CompositeOperation["ExperimentalSourceOut"] = 5] = "ExperimentalSourceOut";
        /**
         * 描画する領域だけを表示し、先に描画された領域と重なった部分は描画先を表示する。
         * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
         */
        CompositeOperation[CompositeOperation["ExperimentalDestinationAtop"] = 6] = "ExperimentalDestinationAtop";
        /**
         * 先に描画された領域と重なっていない部分を透明にし、重なった部分は描画先を表示する。
         * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
         */
        CompositeOperation[CompositeOperation["ExperimentalDestinationIn"] = 7] = "ExperimentalDestinationIn";
        /**
         * 描画する領域を透明にする。
         */
        CompositeOperation[CompositeOperation["DestinationOut"] = 8] = "DestinationOut";
        /**
         * 先に描画された領域の下に描画する。
         */
        CompositeOperation[CompositeOperation["DestinationOver"] = 9] = "DestinationOver";
        /**
         * 先に描画された領域と重なった部分のみ透明にする。
         */
        CompositeOperation[CompositeOperation["Xor"] = 10] = "Xor";
    })(CompositeOperation = g.CompositeOperation || (g.CompositeOperation = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * グリフファクトリ。
     *
     * `DynamicFont` はこれを利用してグリフを生成する。
     *
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var GlyphFactory = /** @class */ (function () {
        /**
         * `GlyphFactory` を生成する。
         *
         * @param fontFamily フォントファミリ。g.FontFamilyの定義する定数、フォント名、またはそれらの配列
         * @param fontSize フォントサイズ
         * @param baselineHeight ベースラインの高さ
         * @param strokeWidth 輪郭幅
         * @param strokeColor 輪郭色
         * @param strokeOnly 輪郭を描画するか否か
         * @param fontWeight フォントウェイト
         */
        function GlyphFactory(fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
            if (baselineHeight === void 0) { baselineHeight = fontSize; }
            if (fontColor === void 0) { fontColor = "black"; }
            if (strokeWidth === void 0) { strokeWidth = 0; }
            if (strokeColor === void 0) { strokeColor = "black"; }
            if (strokeOnly === void 0) { strokeOnly = false; }
            if (fontWeight === void 0) { fontWeight = g.FontWeight.Normal; }
            this.fontFamily = fontFamily;
            this.fontSize = fontSize;
            this.fontWeight = fontWeight;
            this.baselineHeight = baselineHeight;
            this.fontColor = fontColor;
            this.strokeWidth = strokeWidth;
            this.strokeColor = strokeColor;
            this.strokeOnly = strokeOnly;
        }
        return GlyphFactory;
    }());
    g.GlyphFactory = GlyphFactory;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * シーンに与えるローカルティックの種類
     */
    var LocalTickMode;
    (function (LocalTickMode) {
        /**
         * ローカルティックを受け取らない。
         * 通常の(非ローカル)シーン。
         */
        LocalTickMode[LocalTickMode["NonLocal"] = 0] = "NonLocal";
        /**
         * ローカルティックのみ受け取る。
         * ローカルシーン。
         */
        LocalTickMode[LocalTickMode["FullLocal"] = 1] = "FullLocal";
        /**
         * 消化すべきティックがない場合にローカルティックを受け取る。
         * ローカルティック補間シーン。
         */
        LocalTickMode[LocalTickMode["InterpolateLocal"] = 2] = "InterpolateLocal";
    })(LocalTickMode = g.LocalTickMode || (g.LocalTickMode = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * ナインパッチによる描画処理を提供するSurfaceEffector。
     *
     * このSurfaceEffectorは、画像素材の拡大・縮小において「枠」の表現を実現するものである。
     * 画像の上下左右の「枠」部分の幅・高さを渡すことで、上下の「枠」を縦に引き延ばすことなく、
     * また左右の「枠」を横に引き延ばすことなく画像を任意サイズに拡大・縮小できる。
     * ゲームにおけるメッセージウィンドウやダイアログの表現に利用することを想定している。
     */
    var NinePatchSurfaceEffector = /** @class */ (function () {
        /**
         * `NinePatchSurfaceEffector` のインスタンスを生成する。
         * @param game このインスタンスが属する `Game`
         * @param borderWidth 上下左右の「拡大しない」領域の大きさ。すべて同じ値なら数値一つを渡すことができる。省略された場合、 `4`
         */
        function NinePatchSurfaceEffector(game, borderWidth) {
            if (borderWidth === void 0) { borderWidth = 4; }
            this.game = game;
            if (typeof borderWidth === "number") {
                this.borderWidth = { top: borderWidth, bottom: borderWidth, left: borderWidth, right: borderWidth };
            }
            else {
                this.borderWidth = borderWidth;
            }
        }
        /**
         * 指定の大きさに拡大・縮小した描画結果の `Surface` を生成して返す。詳細は `SurfaceEffector#render` の項を参照。
         */
        NinePatchSurfaceEffector.prototype.render = function (srcSurface, width, height) {
            var isCreateSurface = true;
            if (!this._surface ||
                this._surface.width !== width ||
                this._surface.height !== height ||
                this._beforeSrcSurface !== srcSurface) {
                this._surface = this.game.resourceFactory.createSurface(Math.ceil(width), Math.ceil(height));
                this._beforeSrcSurface = srcSurface;
            }
            else {
                isCreateSurface = false;
            }
            var renderer = this._surface.renderer();
            renderer.begin();
            if (!isCreateSurface)
                renderer.clear();
            //    x0  x1                          x2
            // y0 +-----------------------------------+
            //    | 1 |             5             | 2 |
            // y1 |---+---------------------------+---|
            //    |   |                           |   |
            //    | 7 |             9             | 8 |
            //    |   |                           |   |
            // y2 |---+---------------------------+---|
            //    | 3 |             6             | 4 |
            //    +-----------------------------------+
            //
            // 1-4: 拡縮無し
            // 5-6: 水平方向へ拡縮
            // 7-8: 垂直方向へ拡縮
            // 9  : 全方向へ拡縮
            var sx1 = this.borderWidth.left;
            var sx2 = srcSurface.width - this.borderWidth.right;
            var sy1 = this.borderWidth.top;
            var sy2 = srcSurface.height - this.borderWidth.bottom;
            var dx1 = this.borderWidth.left;
            var dx2 = width - this.borderWidth.right;
            var dy1 = this.borderWidth.top;
            var dy2 = height - this.borderWidth.bottom;
            // Draw corners
            var srcCorners = [
                { x: 0, y: 0, width: this.borderWidth.left, height: this.borderWidth.top },
                { x: sx2, y: 0, width: this.borderWidth.right, height: this.borderWidth.top },
                { x: 0, y: sy2, width: this.borderWidth.left, height: this.borderWidth.bottom },
                { x: sx2, y: sy2, width: this.borderWidth.right, height: this.borderWidth.bottom }
            ];
            var destCorners = [
                { x: 0, y: 0 },
                { x: dx2, y: 0 },
                { x: 0, y: dy2 },
                { x: dx2, y: dy2 }
            ];
            var i = 0;
            for (i = 0; i < srcCorners.length; ++i) {
                var c = srcCorners[i];
                renderer.save();
                renderer.translate(destCorners[i].x, destCorners[i].y);
                renderer.drawImage(srcSurface, c.x, c.y, c.width, c.height, 0, 0);
                renderer.restore();
            }
            // Draw borders
            var srcBorders = [
                { x: sx1, y: 0, width: sx2 - sx1, height: this.borderWidth.top },
                { x: 0, y: sy1, width: this.borderWidth.left, height: sy2 - sy1 },
                { x: sx2, y: sy1, width: this.borderWidth.right, height: sy2 - sy1 },
                { x: sx1, y: sy2, width: sx2 - sx1, height: this.borderWidth.bottom }
            ];
            var destBorders = [
                { x: dx1, y: 0, width: dx2 - dx1, height: this.borderWidth.top },
                { x: 0, y: dy1, width: this.borderWidth.left, height: dy2 - dy1 },
                { x: dx2, y: dy1, width: this.borderWidth.right, height: dy2 - dy1 },
                { x: dx1, y: dy2, width: dx2 - dx1, height: this.borderWidth.bottom }
            ];
            for (i = 0; i < srcBorders.length; ++i) {
                var s = srcBorders[i];
                var d = destBorders[i];
                renderer.save();
                renderer.translate(d.x, d.y);
                renderer.transform([d.width / s.width, 0, 0, d.height / s.height, 0, 0]);
                renderer.drawImage(srcSurface, s.x, s.y, s.width, s.height, 0, 0);
                renderer.restore();
            }
            // Draw center
            var sw = sx2 - sx1;
            var sh = sy2 - sy1;
            var dw = dx2 - dx1;
            var dh = dy2 - dy1;
            renderer.save();
            renderer.translate(dx1, dy1);
            renderer.transform([dw / sw, 0, 0, dh / sh, 0, 0]);
            renderer.drawImage(srcSurface, sx1, sy1, sw, sh, 0, 0);
            renderer.restore();
            renderer.end();
            return this._surface;
        };
        return NinePatchSurfaceEffector;
    }());
    g.NinePatchSurfaceEffector = NinePatchSurfaceEffector;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * パスユーティリティ。
     * 通常、ゲーム開発者がファイルパスを扱うことはなく、このモジュールのメソッドを呼び出す必要はない。
     */
    var PathUtil;
    (function (PathUtil) {
        /**
         * 二つのパス文字列をつなぎ、相対パス表現 (".", "..") を解決して返す。
         * @param base 左辺パス文字列 (先頭の "./" を除き、".", ".." を含んではならない)
         * @param path 右辺パス文字列
         */
        function resolvePath(base, path) {
            function split(str) {
                var ret = str.split("/");
                if (ret[ret.length - 1] === "")
                    ret.pop();
                return ret;
            }
            if (path === "")
                return base;
            var baseComponents = PathUtil.splitPath(base);
            var parts = split(baseComponents.path).concat(split(path));
            var resolved = [];
            for (var i = 0; i < parts.length; ++i) {
                var part = parts[i];
                switch (part) {
                    case "..":
                        var popped = resolved.pop();
                        if (popped === undefined || popped === "" || popped === ".")
                            throw g.ExceptionFactory.createAssertionError("PathUtil.resolvePath: invalid arguments");
                        break;
                    case ".":
                        if (resolved.length === 0) {
                            resolved.push(".");
                        }
                        break;
                    case "": // 絶対パス
                        resolved = [""];
                        break;
                    default:
                        resolved.push(part);
                }
            }
            return baseComponents.host + resolved.join("/");
        }
        PathUtil.resolvePath = resolvePath;
        /**
         * パス文字列からディレクトリ名部分を切り出して返す。
         * @param path パス文字列
         */
        function resolveDirname(path) {
            var index = path.lastIndexOf("/");
            if (index === -1)
                return path;
            return path.substr(0, index);
        }
        PathUtil.resolveDirname = resolveDirname;
        /**
         * パス文字列から拡張子部分を切り出して返す。
         * @param path パス文字列
         */
        function resolveExtname(path) {
            for (var i = path.length - 1; i >= 0; --i) {
                var c = path.charAt(i);
                if (c === ".") {
                    return path.substr(i);
                }
                else if (c === "/") {
                    return "";
                }
            }
            return "";
        }
        PathUtil.resolveExtname = resolveExtname;
        /**
         * パス文字列から、node.js において require() の探索範囲になるパスの配列を作成して返す。
         * @param path ディレクトリを表すパス文字列
         */
        function makeNodeModulePaths(path) {
            var pathComponents = PathUtil.splitPath(path);
            var host = pathComponents.host;
            path = pathComponents.path;
            if (path[path.length - 1] === "/") {
                path = path.slice(0, path.length - 1);
            }
            var parts = path.split("/");
            var firstDir = parts.indexOf("node_modules");
            var root = firstDir > 0 ? firstDir - 1 : 0;
            var dirs = [];
            for (var i = parts.length - 1; i >= root; --i) {
                if (parts[i] === "node_modules")
                    continue;
                var dirParts = parts.slice(0, i + 1);
                dirParts.push("node_modules");
                var dir = dirParts.join("/");
                dirs.push(host + dir);
            }
            return dirs;
        }
        PathUtil.makeNodeModulePaths = makeNodeModulePaths;
        /**
         * 与えられたパス文字列に与えられた拡張子を追加する。
         * @param path パス文字列
         * @param ext 追加する拡張子
         */
        function addExtname(path, ext) {
            var index = path.indexOf("?");
            if (index === -1) {
                return path + "." + ext;
            }
            // hoge?query => hoge.ext?query
            return path.substring(0, index) + "." + ext + path.substring(index, path.length);
        }
        PathUtil.addExtname = addExtname;
        /**
         * 与えられたパス文字列からホストを切り出す。
         * @param path パス文字列
         */
        function splitPath(path) {
            var host = "";
            var doubleSlashIndex = path.indexOf("//");
            if (doubleSlashIndex >= 0) {
                var hostSlashIndex = path.indexOf("/", doubleSlashIndex + 2); // 2 === "//".length
                if (hostSlashIndex >= 0) {
                    host = path.slice(0, hostSlashIndex);
                    path = path.slice(hostSlashIndex); // 先頭に "/" を残して絶対パス扱いさせる
                }
                else {
                    host = path;
                    path = "/"; // path全体がホストだったので、絶対パス扱いさせる
                }
            }
            else {
                host = "";
            }
            return { host: host, path: path };
        }
        PathUtil.splitPath = splitPath;
    })(PathUtil = g.PathUtil || (g.PathUtil = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 文字列描画のフォントファミリ。
     * 現バージョンのakashic-engineの `SystemLabel` 及び `DynamicFont` において、この値の指定は参考値に過ぎない。
     * そのため、 それらにおいて 'fontFamily` プロパティを指定した際、実行環境によっては無視される事がありえる。
     */
    var FontFamily;
    (function (FontFamily) {
        /**
         * サンセリフ体。ＭＳ Ｐゴシック等
         */
        FontFamily[FontFamily["SansSerif"] = 0] = "SansSerif";
        /**
         * セリフ体。ＭＳ 明朝等
         */
        FontFamily[FontFamily["Serif"] = 1] = "Serif";
        /**
         * 等幅。ＭＳ ゴシック等
         */
        FontFamily[FontFamily["Monospace"] = 2] = "Monospace";
    })(FontFamily = g.FontFamily || (g.FontFamily = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 文字列描画のベースライン。
     */
    var TextBaseline;
    (function (TextBaseline) {
        /**
         * em squareの上。
         */
        TextBaseline[TextBaseline["Top"] = 0] = "Top";
        /**
         * em squareの中央。
         */
        TextBaseline[TextBaseline["Middle"] = 1] = "Middle";
        /**
         * 標準的とされるベースライン。Bottomよりやや上方。
         */
        TextBaseline[TextBaseline["Alphabetic"] = 2] = "Alphabetic";
        /**
         * em squareの下。
         */
        TextBaseline[TextBaseline["Bottom"] = 3] = "Bottom";
    })(TextBaseline = g.TextBaseline || (g.TextBaseline = {}));
    /**
     * システムフォントで文字列を描画するエンティティ。
     *
     * ここでいうシステムフォントとは、akashic-engine実行環境でのデフォルトフォントである。
     * システムフォントは実行環境によって異なる場合がある。したがって `SystemLabel` による描画結果が各実行環境で同一となることは保証されない。
     * その代わりに `SystemLabel` は、Assetの読み込みなしで文字列を描画する機能を提供する。
     *
     * 絵文字などを含むユニコード文字列をすべて `BitmapFont` で提供する事は難しいことから、
     * このクラスは、事実上akashic-engineにおいてユーザ入力文字列を取り扱う唯一の手段である。
     *
     * `SystemLabel` はユーザインタラクションの対象に含めるべきではない。
     * 上述のとおり、各実行環境で描画内容の同一性が保証されないためである。
     * ユーザ入力文字列を含め、 `SystemLabel` によって提示される情報は、参考程度に表示されるなどに留めるべきである。
     * 具体的には `SystemLabel` を `touchable` にする、 `Util.createSpriteFromE()` の対象に含めるなどを行うべきではない。
     * ボタンのようなエンティティのキャプション部分も出来る限り `Label` を用いるべきで、 `SystemLabel` を利用するべきではない。
     *
     * また、akashic-engineは `SystemLabel` の描画順を保証しない。
     * 実行環境によって、次のどちらかが成立する:
     * * `SystemLabel` は、他エンティティ同様に `Scene#children` のツリー構造のpre-order順で描かれる。
     * * `SystemLabel` は、他の全エンティティが描画された後に(画面最前面に)描画される。
     *
     * 実行環境に依存しないゲームを作成するためには、`SystemLabel` はこのいずれでも正しく動作するように利用される必要がある。
     */
    var SystemLabel = /** @class */ (function (_super) {
        __extends(SystemLabel, _super);
        /**
         * 各種パラメータを指定して `SystemLabel` のインスタンスを生成する。
         * @param param このエンティティに指定するパラメータ
         */
        function SystemLabel(param) {
            var _this = _super.call(this, param) || this;
            _this.text = param.text;
            _this.fontSize = param.fontSize;
            _this.textAlign = "textAlign" in param ? param.textAlign : g.TextAlign.Left;
            _this.textBaseline = "textBaseline" in param ? param.textBaseline : TextBaseline.Alphabetic;
            _this.maxWidth = param.maxWidth;
            _this.textColor = "textColor" in param ? param.textColor : "black";
            _this.fontFamily = "fontFamily" in param ? param.fontFamily : g.FontFamily.SansSerif;
            _this.strokeWidth = "strokeWidth" in param ? param.strokeWidth : 0;
            _this.strokeColor = "strokeColor" in param ? param.strokeColor : "black";
            _this.strokeOnly = "strokeOnly" in param ? param.strokeOnly : false;
            return _this;
        }
        SystemLabel.prototype.renderSelf = function (renderer, _camera) {
            if (this.text) {
                var offsetX;
                switch (this.textAlign) {
                    case g.TextAlign.Right:
                        offsetX = this.width;
                        break;
                    case g.TextAlign.Center:
                        offsetX = this.width / 2;
                        break;
                    default:
                        offsetX = 0;
                }
                renderer.drawSystemText(this.text, offsetX, 0, this.maxWidth, this.fontSize, this.textAlign, this.textBaseline, this.textColor, this.fontFamily, this.strokeWidth, this.strokeColor, this.strokeOnly);
            }
            return true;
        };
        return SystemLabel;
    }(g.E));
    g.SystemLabel = SystemLabel;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * テキストの描画位置。
     */
    var TextAlign;
    (function (TextAlign) {
        /**
         * 左寄せ。
         */
        TextAlign[TextAlign["Left"] = 0] = "Left";
        /**
         * 中央寄せ。
         */
        TextAlign[TextAlign["Center"] = 1] = "Center";
        /**
         * 右寄せ。
         */
        TextAlign[TextAlign["Right"] = 2] = "Right";
    })(TextAlign = g.TextAlign || (g.TextAlign = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 時間経過の契機(ティック)をどのように生成するか。
     * ただしローカルティック(ローカルシーンの間などの「各プレイヤー間で独立な時間経過処理」)はこのモードの影響を受けない。
     */
    var TickGenerationMode;
    (function (TickGenerationMode) {
        /**
         * 実際の時間経過に従う。
         */
        TickGenerationMode[TickGenerationMode["ByClock"] = 0] = "ByClock";
        /**
         * 時間経過は明示的に要求する。
         * この値を用いる `Scene` の間は、 `Game#raiseTick()` を呼び出さない限り時間経過が起きない。
         */
        TickGenerationMode[TickGenerationMode["Manual"] = 1] = "Manual";
    })(TickGenerationMode = g.TickGenerationMode || (g.TickGenerationMode = {}));
})(g || (g = {}));
var g;
(function (g) {
    // Copyright (c) 2014 Andreas Madsen & Emil Bay
    // From https://github.com/AndreasMadsen/xorshift
    // https://github.com/AndreasMadsen/xorshift/blob/master/LICENSE.md
    // Arranged by DWANGO Co., Ltd.
    var Xorshift = /** @class */ (function () {
        function Xorshift(seed) {
            this.initState(seed);
        }
        Xorshift.deserialize = function (ser) {
            var ret = new Xorshift(0);
            ret._state0U = ser._state0U;
            ret._state0L = ser._state0L;
            ret._state1U = ser._state1U;
            ret._state1L = ser._state1L;
            return ret;
        };
        // シード値が1つの場合にどのようにして初期状態を定義するかは特に定まっていない
        // このコードはロジック的な裏付けは無いが採用例が多いために採用した
        // 以下採用例
        // http://meme.biology.tohoku.ac.jp/klabo-wiki/index.php?cmd=read&page=%B7%D7%BB%BB%B5%A1%2FC%2B%2B#y919a7e1
        // http://hexadrive.sblo.jp/article/63660775.html
        // http://meme.biology.tohoku.ac.jp/students/iwasaki/cxx/random.html#xorshift
        Xorshift.prototype.initState = function (seed) {
            var factor = 1812433253;
            seed = factor * (seed ^ (seed >> 30)) + 1;
            this._state0U = seed;
            seed = factor * (seed ^ (seed >> 30)) + 2;
            this._state0L = seed;
            seed = factor * (seed ^ (seed >> 30)) + 3;
            this._state1U = seed;
            seed = factor * (seed ^ (seed >> 30)) + 4;
            this._state1L = seed;
        };
        Xorshift.prototype.randomInt = function () {
            var s1U = this._state0U;
            var s1L = this._state0L;
            var s0U = this._state1U;
            var s0L = this._state1L;
            this._state0U = s0U;
            this._state0L = s0L;
            var t1U = 0;
            var t1L = 0;
            var t2U = 0;
            var t2L = 0;
            var a1 = 23;
            var m1 = 0xffffffff << (32 - a1);
            t1U = (s1U << a1) | ((s1L & m1) >>> (32 - a1));
            t1L = s1L << a1;
            s1U = s1U ^ t1U;
            s1L = s1L ^ t1L;
            t1U = s1U ^ s0U;
            t1L = s1L ^ s0L;
            var a2 = 17;
            var m2 = 0xffffffff >>> (32 - a2);
            t2U = s1U >>> a2;
            t2L = (s1L >>> a2) | ((s1U & m2) << (32 - a2));
            t1U = t1U ^ t2U;
            t1L = t1L ^ t2L;
            var a3 = 26;
            var m3 = 0xffffffff >>> (32 - a3);
            t2U = s0U >>> a3;
            t2L = (s0L >>> a3) | ((s0U & m3) << (32 - a3));
            t1U = t1U ^ t2U;
            t1L = t1L ^ t2L;
            this._state1U = t1U;
            this._state1L = t1L;
            var sumL = (t1L >>> 0) + (s0L >>> 0);
            t2U = (t1U + s0U + ((sumL / 2) >>> 31)) >>> 0;
            t2L = sumL >>> 0;
            return [t2U, t2L];
        };
        Xorshift.prototype.random = function () {
            var t2 = this.randomInt();
            return (t2[0] * 4294967296 + t2[1]) / 18446744073709551616;
        };
        Xorshift.prototype.nextInt = function (min, sup) {
            return Math.floor(min + this.random() * (sup - min));
        };
        Xorshift.prototype.serialize = function () {
            return {
                _state0U: this._state0U,
                _state0L: this._state0L,
                _state1U: this._state1U,
                _state1L: this._state1L
            };
        };
        return Xorshift;
    }());
    g.Xorshift = Xorshift;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * Xorshiftを用いた乱数生成期。
     */
    var XorshiftRandomGenerator = /** @class */ (function (_super) {
        __extends(XorshiftRandomGenerator, _super);
        function XorshiftRandomGenerator(seed, xorshift) {
            var _this = this;
            if (seed === undefined) {
                throw g.ExceptionFactory.createAssertionError("XorshiftRandomGenerator#constructor: seed is undefined");
            }
            else {
                _this = _super.call(this, seed) || this;
                if (!!xorshift) {
                    _this._xorshift = g.Xorshift.deserialize(xorshift);
                }
                else {
                    _this._xorshift = new g.Xorshift(seed);
                }
            }
            return _this;
        }
        XorshiftRandomGenerator.deserialize = function (ser) {
            return new XorshiftRandomGenerator(ser._seed, ser._xorshift);
        };
        /**
         * 指定された範囲の整数の疑似乱数を生成する。
         * 生成される値は両端を含む(i.e. [min, max])ことに注意。
         *
         * @param min 生成する疑似乱数の最小値
         * @param max 生成する疑似乱数の最大値
         */
        XorshiftRandomGenerator.prototype.get = function (min, max) {
            return this._xorshift.nextInt(min, max + 1);
        };
        /**
         * 0 以上 1 未満の疑似乱数を生成する。
         */
        XorshiftRandomGenerator.prototype.generate = function () {
            return this._xorshift.random();
        };
        XorshiftRandomGenerator.prototype.serialize = function () {
            return {
                _seed: this.seed,
                _xorshift: this._xorshift.serialize()
            };
        };
        return XorshiftRandomGenerator;
    }(g.RandomGenerator));
    g.XorshiftRandomGenerator = XorshiftRandomGenerator;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * akashic-engineにおけるシェーダ機能を提供するクラス。
     * 現バージョンのakashic-engineではフラグメントシェーダのみをサポートする。
     */
    var ShaderProgram = /** @class */ (function () {
        /**
         * 各種パラメータを指定して `ShaderProgram` のインスタンスを生成する。
         * @param param `ShaderProgram` に設定するパラメータ
         */
        function ShaderProgram(param) {
            this.fragmentShader = param.fragmentShader;
            this.uniforms = param.uniforms;
        }
        return ShaderProgram;
    }());
    g.ShaderProgram = ShaderProgram;
})(g || (g = {}));
// ordered files
/// <reference path="AssetLoadErrorType.ts" />
/// <reference path="errors.ts" />
/// <reference path="ResourceFactory.ts" />
/// <reference path="commons.ts" />
/// <reference path="RequireCacheable.ts" />
/// <reference path="RequireCachedValue.ts" />
/// <reference path="Destroyable.ts" />
/// <reference path="Registrable.ts" />
/// <reference path="RandomGenerator.ts" />
/// <reference path="EntityStateFlags.ts" />
/// <reference path="AssetLoadHandler.ts" />
/// <reference path="Asset.ts" />
/// <reference path="AssetManagerLoadHandler.ts" />
/// <reference path="AssetLoadFailureInfo.ts" />
/// <reference path="AssetManager.ts" />
/// <reference path="Module.ts" />
/// <reference path="ScriptAssetExecuteEnvironment.ts" />
/// <reference path="ScriptAssetContext.ts" />
/// <reference path="Matrix.ts" />
/// <reference path="Util.ts" />
/// <reference path="Collision.ts" />
/// <reference path="Trigger.ts" />
/// <reference path="Timer.ts" />
/// <reference path="TimerManager.ts" />
/// <reference path="AudioPlayer.ts" />
/// <reference path="AudioSystem.ts" />
/// <reference path="VideoPlayer.ts" />
/// <reference path="VideoSystem.ts" />
/// <reference path="Object2D.ts" />
/// <reference path="E.ts" />
/// <reference path="CacheableE.ts" />
/// <reference path="Storage.ts" />
/// <reference path="Scene.ts" />
/// <reference path="LoadingScene.ts" />
/// <reference path="DefaultLoadingScene.ts" />
/// <reference path="Sprite.ts" />
/// <reference path="FrameSprite.ts" />
/// <reference path="Player.ts" />
/// <reference path="Event.ts" />
/// <reference path="Logger.ts" />
/// <reference path="GameConfiguration.ts" />
/// <reference path="Game.ts" />
/// <reference path="Camera.ts" />
/// <reference path="ImageData.ts" />
/// <reference path="Renderer.ts" />
/// <reference path="Surface.ts" />
/// <reference path="Label.ts" />
/// <reference path="Glyph.ts" />
/// <reference path="FilledRect.ts" />
/// <reference path="Pane.ts" />
/// <reference path="SurfaceEffector.ts" />
/// <reference path="OperationPluginOperation.ts" />
/// <reference path="OperationPlugin.ts" />
/// <reference path="OperationPluginStatic.ts" />
/// <reference path="OperationPluginInfo.ts" />
/// <reference path="OperationPluginView.ts" />
/// <reference path="OperationPluginViewInfo.ts" />
/// <reference path="OperationPluginManager.ts" />
/// <reference path="executeEnvironmentVariables.ts" />
/// <reference path="TextMetrix.ts" />
/// <reference path="Font.ts" />
/// <reference path="DynamicFont.ts" />
/// <reference path="BitmapFont.ts" />
/// <reference path="SurfaceAtlasSet.ts" />
// non-ordered files
/// <reference path="AudioSystemManager.ts" />
/// <reference path="CompositeOperation.ts" />
/// <reference path="EventFilter.ts" />
/// <reference path="GlyphFactory.ts" />
/// <reference path="GameMainParameterObject.ts" />
/// <reference path="LocalTickMode.ts" />
/// <reference path="NinePatchSurfaceEffector.ts" />
/// <reference path="PathUtil.ts" />
/// <reference path="FontFamily.ts" />
/// <reference path="SystemLabel.ts" />
/// <reference path="TextAlign.ts" />
/// <reference path="TickGenerationMode.ts" />
/// <reference path="Xorshift.ts" />
/// <reference path="XorshiftRandomGenerator.ts" />
/// <reference path="Shader.ts" />

module.exports = g;
}).call(this);

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],4:[function(require,module,exports){
module.exports = require("./lib/index");

},{"./lib/index":27}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clock = void 0;
var g = require("@akashic/akashic-engine");
/**
 * FPS管理用のクロック。
 *
 * `pdi.Looper` の定期または不定期の呼び出しを受け付け、指定されたFPSから求めた
 * 1フレーム分の時間(1フレーム時間)が経過するたびに `frameTrigger` をfireする。
 */
var Clock = /** @class */ (function () {
    function Clock(param) {
        this.fps = param.fps;
        this.scaleFactor = param.scaleFactor || 1;
        this.frameTrigger = new g.Trigger();
        this.rawFrameTrigger = new g.Trigger();
        this._platform = param.platform;
        this._maxFramePerOnce = param.maxFramePerOnce;
        this._deltaTimeBrokenThreshold = param.deltaTimeBrokenThreshold || Clock.DEFAULT_DELTA_TIME_BROKEN_THRESHOLD;
        if (param.frameHandler) {
            this.frameTrigger.add(param.frameHandler, param.frameHandlerOwner);
        }
        this.running = false;
        this._totalDeltaTime = 0;
        this._onLooperCall_bound = this._onLooperCall.bind(this);
        this._looper = this._platform.createLooper(this._onLooperCall_bound);
        this._waitTime = 0;
        this._waitTimeDoubled = 0;
        this._waitTimeMax = 0;
        this._skipFrameWaitTime = 0;
        this._realMaxFramePerOnce = 0;
    }
    Clock.prototype.start = function () {
        if (this.running)
            return;
        this._totalDeltaTime = 0;
        this._updateWaitTimes(this.fps, this.scaleFactor);
        this._looper.start();
        this.running = true;
    };
    Clock.prototype.stop = function () {
        if (!this.running)
            return;
        this._looper.stop();
        this.running = false;
    };
    /**
     * `scaleFactor` を変更する。
     * start()した後にも呼び出せるが、1フレーム以下の経過時間情報はリセットされる点に注意。
     */
    Clock.prototype.changeScaleFactor = function (scaleFactor) {
        if (this.running) {
            this.stop();
            this.scaleFactor = scaleFactor;
            this.start();
        }
        else {
            this.scaleFactor = scaleFactor;
        }
    };
    Clock.prototype._onLooperCall = function (deltaTime) {
        var rawDeltaTime = deltaTime;
        if (deltaTime <= 0) {
            // 時間が止まっているか巻き戻っている。初回呼び出しか、あるいは何かがおかしい。時間経過0と見なす。
            return this._waitTime - this._totalDeltaTime;
        }
        if (deltaTime > this._deltaTimeBrokenThreshold) {
            // 間隔が長すぎる。何かがおかしい。時間経過を1フレーム分とみなす。
            deltaTime = this._waitTime;
        }
        var totalDeltaTime = this._totalDeltaTime;
        totalDeltaTime += deltaTime;
        if (totalDeltaTime <= this._skipFrameWaitTime) {
            // 1フレーム分消化するほどの時間が経っていない。
            this._totalDeltaTime = totalDeltaTime;
            return this._waitTime - totalDeltaTime;
        }
        var frameCount = (totalDeltaTime < this._waitTimeDoubled) ? 1
            : (totalDeltaTime > this._waitTimeMax) ? this._realMaxFramePerOnce
                : (totalDeltaTime / this._waitTime) | 0;
        var fc = frameCount;
        var arg = {
            deltaTime: rawDeltaTime,
            interrupt: false
        };
        while (fc > 0 && this.running && !arg.interrupt) {
            --fc;
            this.frameTrigger.fire(arg);
            arg.deltaTime = 0; // 同ループによる2度目以降の呼び出しは差分を0とみなす。
        }
        totalDeltaTime -= ((frameCount - fc) * this._waitTime);
        this.rawFrameTrigger.fire();
        this._totalDeltaTime = totalDeltaTime;
        return this._waitTime - totalDeltaTime;
    };
    Clock.prototype._updateWaitTimes = function (fps, scaleFactor) {
        var realFps = fps * scaleFactor;
        this._waitTime = 1000 / realFps;
        this._waitTimeDoubled = Math.max((2000 / realFps) | 0, 1);
        this._waitTimeMax = Math.max(scaleFactor * (1000 * this._maxFramePerOnce / realFps) | 0, 1);
        this._skipFrameWaitTime = (this._waitTime * Clock.ANTICIPATE_RATE) | 0;
        this._realMaxFramePerOnce = this._maxFramePerOnce * scaleFactor;
    };
    /**
     * 経過時間先取りの比率。
     *
     * FPSから定まる「1フレーム」の経過時間が経っていなくても、この割合の時間が経過していれば1フレーム分の計算を進めてしまう。
     * その代わりに次フレームまでの所要時間を長くする。
     * 例えば20FPSであれば50msで1フレームだが、50*0.8 = 40ms 時点で1フレーム進めてしまい、次フレームまでの時間を60msにする。
     */
    Clock.ANTICIPATE_RATE = 0.8;
    /**
     * 異常値とみなして無視する `Looper` の呼び出し間隔[ms]のデフォルト値。
     */
    Clock.DEFAULT_DELTA_TIME_BROKEN_THRESHOLD = 150;
    return Clock;
}());
exports.Clock = Clock;

},{"@akashic/akashic-engine":1}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBuffer = void 0;
var pdi = require("@akashic/akashic-pdi");
var g = require("@akashic/akashic-engine");
var PointEventResolver_1 = require("./PointEventResolver");
/**
 * AMFlowとPDIから流れ込むイベントを蓄積するバッファ。
 *
 * AMFLowから受信するかどうか、AMFlowに送るかどうかは外部から切り替えることができる。
 * 状態によっては、`_amflow` の認証で `subscribeEvent` と `sendEvent` のいずれかまたは両方の権限を取得している必要がある。
 * 詳細は `setMode()` のコメントを参照。
 */
var EventBuffer = /** @class */ (function () {
    function EventBuffer(param) {
        this._amflow = param.amflow;
        this._isLocalReceiver = true;
        this._isReceiver = false;
        this._isSender = false;
        this._isDiscarder = false;
        this._defaultEventPriority = 0;
        this._buffer = [];
        this._joinLeaveBuffer = [];
        this._localBuffer = [];
        this._filters = null;
        this._unfilteredLocalEvents = [];
        this._unfilteredEvents = [];
        this._pointEventResolver = new PointEventResolver_1.PointEventResolver({ game: param.game });
        this._onEvent_bound = this.onEvent.bind(this);
    }
    EventBuffer.isEventLocal = function (pev) {
        switch (pev[0 /* Code */]) {
            case 0 /* Join */:
                return pev[5 /* Local */];
            case 1 /* Leave */:
                return pev[3 /* Local */];
            case 2 /* Timestamp */:
                return pev[4 /* Local */];
            case 32 /* Message */:
                return pev[4 /* Local */];
            case 33 /* PointDown */:
                return pev[7 /* Local */];
            case 34 /* PointMove */:
                return pev[11 /* Local */];
            case 35 /* PointUp */:
                return pev[11 /* Local */];
            case 64 /* Operation */:
                return pev[5 /* Local */];
            default:
                throw g.ExceptionFactory.createAssertionError("EventBuffer.isEventLocal");
        }
    };
    /**
     * モードを切り替える。
     *
     * この関数の呼び出す場合、最後に呼び出された _amflow#authenticate() から得た Permission は次の条件を満たさねばならない:
     * * 引数 `param.isReceiver` に真を渡す場合、次に偽を渡すまでの間、 `subscribeEvent` が真であること。
     * * 引数 `param.isSender` に真を渡す場合、次に偽を渡すまでの間、 `sendEvent` が真であること。
     */
    EventBuffer.prototype.setMode = function (param) {
        if (param.isLocalReceiver != null) {
            this._isLocalReceiver = param.isLocalReceiver;
        }
        if (param.isReceiver != null) {
            if (this._isReceiver !== param.isReceiver) {
                this._isReceiver = param.isReceiver;
                if (param.isReceiver) {
                    this._amflow.onEvent(this._onEvent_bound);
                }
                else {
                    this._amflow.offEvent(this._onEvent_bound);
                }
            }
        }
        if (param.isSender != null) {
            this._isSender = param.isSender;
        }
        if (param.isDiscarder != null) {
            this._isDiscarder = param.isDiscarder;
        }
        if (param.defaultEventPriority != null) {
            this._defaultEventPriority = 3 /* Priority */ & param.defaultEventPriority;
        }
    };
    EventBuffer.prototype.getMode = function () {
        return {
            isLocalReceiver: this._isLocalReceiver,
            isReceiver: this._isReceiver,
            isSender: this._isSender,
            isDiscarder: this._isDiscarder,
            defaultEventPriority: this._defaultEventPriority
        };
    };
    EventBuffer.prototype.onEvent = function (pev) {
        if (EventBuffer.isEventLocal(pev)) {
            if (this._isLocalReceiver && !this._isDiscarder) {
                this._unfilteredLocalEvents.push(pev);
            }
            return;
        }
        if (this._isReceiver && !this._isDiscarder) {
            this._unfilteredEvents.push(pev);
        }
        if (this._isSender) {
            if (pev[1 /* EventFlags */] == null) {
                pev[1 /* EventFlags */] = this._defaultEventPriority;
            }
            this._amflow.sendEvent(pev);
        }
    };
    EventBuffer.prototype.onPointEvent = function (e) {
        var pev;
        switch (e.type) {
            case 0 /* Down */:
                pev = this._pointEventResolver.pointDown(e);
                break;
            case 1 /* Move */:
                pev = this._pointEventResolver.pointMove(e);
                break;
            case 2 /* Up */:
                pev = this._pointEventResolver.pointUp(e);
                break;
        }
        if (!pev)
            return;
        this.onEvent(pev);
    };
    /**
     * filterを無視してイベントを追加する。
     */
    EventBuffer.prototype.addEventDirect = function (pev) {
        if (EventBuffer.isEventLocal(pev)) {
            if (!this._isLocalReceiver || this._isDiscarder)
                return;
            this._localBuffer.push(pev);
            return;
        }
        if (this._isReceiver && !this._isDiscarder) {
            if (pev[0 /* Code */] === 0 /* Join */ || pev[0 /* Code */] === 1 /* Leave */) {
                this._joinLeaveBuffer.push(pev);
            }
            else {
                this._buffer.push(pev);
            }
        }
        if (this._isSender) {
            if (pev[1 /* EventFlags */] == null) {
                pev[1 /* EventFlags */] = this._defaultEventPriority;
            }
            this._amflow.sendEvent(pev);
        }
    };
    EventBuffer.prototype.readEvents = function () {
        var ret = this._buffer;
        if (ret.length === 0)
            return null;
        this._buffer = [];
        return ret;
    };
    EventBuffer.prototype.readJoinLeaves = function () {
        var ret = this._joinLeaveBuffer;
        if (ret.length === 0)
            return null;
        this._joinLeaveBuffer = [];
        return ret;
    };
    EventBuffer.prototype.readLocalEvents = function () {
        var ret = this._localBuffer;
        if (ret.length === 0)
            return null;
        this._localBuffer = [];
        return ret;
    };
    EventBuffer.prototype.addFilter = function (filter, handleEmpty) {
        if (!this._filters)
            this._filters = [];
        this._filters.push({ func: filter, handleEmpty: !!handleEmpty });
    };
    EventBuffer.prototype.removeFilter = function (filter) {
        if (!this._filters)
            return;
        if (!filter) {
            this._filters = null;
            return;
        }
        for (var i = this._filters.length - 1; i >= 0; --i) {
            if (this._filters[i].func === filter)
                this._filters.splice(i, 1);
        }
    };
    EventBuffer.prototype.processEvents = function (isLocal) {
        var ulpevs = this._unfilteredLocalEvents;
        var upevs = this._unfilteredEvents;
        this._unfilteredLocalEvents = [];
        var pevs = ulpevs;
        if (!isLocal && upevs.length > 0) {
            pevs = (pevs.length > 0) ? pevs.concat(upevs) : upevs;
            this._unfilteredEvents = [];
        }
        if (this._filters) {
            for (var i = 0; i < this._filters.length; ++i) {
                var filter = this._filters[i];
                if (pevs.length > 0 || filter.handleEmpty)
                    pevs = this._filters[i].func(pevs) || [];
            }
        }
        for (var i = 0; i < pevs.length; ++i) {
            var pev = pevs[i];
            if (EventBuffer.isEventLocal(pev)) {
                this._localBuffer.push(pev);
            }
            else if (pev[0 /* Code */] === 0 /* Join */ || pev[0 /* Code */] === 1 /* Leave */) {
                this._joinLeaveBuffer.push(pev);
            }
            else {
                this._buffer.push(pev);
            }
        }
    };
    return EventBuffer;
}());
exports.EventBuffer = EventBuffer;

},{"./PointEventResolver":17,"@akashic/akashic-engine":1,"@akashic/akashic-pdi":3}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventConverter = void 0;
var g = require("@akashic/akashic-engine");
var EventConverter = /** @class */ (function () {
    function EventConverter(param) {
        this._game = param.game;
        this._playerTable = {};
    }
    /**
     * playlog.Eventからg.Eventへ変換する。
     */
    EventConverter.prototype.toGameEvent = function (pev) {
        var pointerId;
        var entityId;
        var target;
        var point;
        var startDelta;
        var prevDelta;
        var local;
        var timestamp;
        var eventCode = pev[0 /* Code */];
        // TODO: transient event 対応
        var prio = pev[1 /* EventFlags */];
        var playerId = pev[2 /* PlayerId */];
        var player = this._playerTable[playerId] || { id: playerId };
        switch (eventCode) {
            case 0 /* Join */:
                player = {
                    id: playerId,
                    name: pev[3 /* PlayerName */]
                };
                this._playerTable[playerId] = player;
                var store = undefined;
                if (pev[4 /* StorageData */]) {
                    var keys = [];
                    var values = [];
                    pev[4 /* StorageData */].map(function (data) {
                        keys.push(data.readKey);
                        values.push(data.values);
                    });
                    store = new g.StorageValueStore(keys, values);
                }
                return new g.JoinEvent(player, store, prio);
            case 1 /* Leave */:
                delete this._playerTable[player.id];
                return new g.LeaveEvent(player, prio);
            case 2 /* Timestamp */:
                timestamp = pev[3 /* Timestamp */];
                return new g.TimestampEvent(timestamp, player, prio);
            case 32 /* Message */:
                local = pev[4 /* Local */];
                return new g.MessageEvent(pev[3 /* Message */], player, local, prio);
            case 33 /* PointDown */:
                local = pev[7 /* Local */];
                pointerId = pev[3 /* PointerId */];
                entityId = pev[6 /* EntityId */];
                target = (entityId == null) ? undefined
                    : (entityId >= 0) ? this._game.db[entityId]
                        : this._game._localDb[entityId];
                point = {
                    x: pev[4 /* X */],
                    y: pev[5 /* Y */]
                };
                return new g.PointDownEvent(pointerId, target, point, player, local, prio);
            case 34 /* PointMove */:
                local = pev[11 /* Local */];
                pointerId = pev[3 /* PointerId */];
                entityId = pev[10 /* EntityId */];
                target = (entityId == null) ? undefined
                    : (entityId >= 0) ? this._game.db[entityId]
                        : this._game._localDb[entityId];
                point = {
                    x: pev[4 /* X */],
                    y: pev[5 /* Y */]
                };
                startDelta = {
                    x: pev[6 /* StartDeltaX */],
                    y: pev[7 /* StartDeltaY */]
                };
                prevDelta = {
                    x: pev[8 /* PrevDeltaX */],
                    y: pev[9 /* PrevDeltaY */]
                };
                return new g.PointMoveEvent(pointerId, target, point, prevDelta, startDelta, player, local, prio);
            case 35 /* PointUp */:
                local = pev[11 /* Local */];
                pointerId = pev[3 /* PointerId */];
                entityId = pev[10 /* EntityId */];
                target = (entityId == null) ? undefined
                    : (entityId >= 0) ? this._game.db[entityId]
                        : this._game._localDb[entityId];
                point = {
                    x: pev[4 /* X */],
                    y: pev[5 /* Y */]
                };
                startDelta = {
                    x: pev[6 /* StartDeltaX */],
                    y: pev[7 /* StartDeltaY */]
                };
                prevDelta = {
                    x: pev[8 /* PrevDeltaX */],
                    y: pev[9 /* PrevDeltaY */]
                };
                return new g.PointUpEvent(pointerId, target, point, prevDelta, startDelta, player, local, prio);
            case 64 /* Operation */:
                local = pev[5 /* Local */];
                var operationCode = pev[3 /* OperationCode */];
                var operationData = pev[4 /* OperationData */];
                var decodedData = this._game._decodeOperationPluginOperation(operationCode, operationData);
                return new g.OperationEvent(operationCode, decodedData, player, local, prio);
            default:
                // TODO handle error
                throw g.ExceptionFactory.createAssertionError("EventConverter#toGameEvent");
        }
    };
    /**
     * g.Eventからplaylog.Eventに変換する。
     */
    EventConverter.prototype.toPlaylogEvent = function (e, preservePlayer) {
        var targetId;
        var playerId;
        var priority = e.priority; // NOTE: このレイヤーでは priority (eventFlags) の中身を精査しないこととする
        switch (e.type) {
            case g.EventType.Join:
            case g.EventType.Leave:
                // game-driver は決して Join と Leave を生成しない
                throw g.ExceptionFactory.createAssertionError("EventConverter#toPlaylogEvent: Invalid type: " + g.EventType[e.type]);
            case g.EventType.Timestamp:
                var ts = e;
                playerId = preservePlayer ? ts.player.id : this._game.player.id;
                return [
                    2 /* Timestamp */,
                    priority,
                    playerId,
                    ts.timestamp // 3: タイムスタンプ
                ];
            case g.EventType.PointDown:
                var pointDown = e;
                targetId = pointDown.target ? pointDown.target.id : null;
                playerId = preservePlayer ? pointDown.player.id : this._game.player.id;
                return [
                    33 /* PointDown */,
                    priority,
                    playerId,
                    pointDown.pointerId,
                    pointDown.point.x,
                    pointDown.point.y,
                    targetId,
                    !!pointDown.local // 7?: 直前のポイントムーブイベントからのY座標の差
                ];
            case g.EventType.PointMove:
                var pointMove = e;
                targetId = pointMove.target ? pointMove.target.id : null;
                playerId = preservePlayer ? pointMove.player.id : this._game.player.id;
                return [
                    34 /* PointMove */,
                    priority,
                    playerId,
                    pointMove.pointerId,
                    pointMove.point.x,
                    pointMove.point.y,
                    pointMove.startDelta.x,
                    pointMove.startDelta.y,
                    pointMove.prevDelta.x,
                    pointMove.prevDelta.y,
                    targetId,
                    !!pointMove.local // 11?: 直前のポイントムーブイベントからのY座標の差
                ];
            case g.EventType.PointUp:
                var pointUp = e;
                targetId = pointUp.target ? pointUp.target.id : null;
                playerId = preservePlayer ? pointUp.player.id : this._game.player.id;
                return [
                    35 /* PointUp */,
                    priority,
                    playerId,
                    pointUp.pointerId,
                    pointUp.point.x,
                    pointUp.point.y,
                    pointUp.startDelta.x,
                    pointUp.startDelta.y,
                    pointUp.prevDelta.x,
                    pointUp.prevDelta.y,
                    targetId,
                    !!pointUp.local // 11?: 直前のポイントムーブイベントからのY座標の差
                ];
            case g.EventType.Message:
                var message = e;
                playerId = preservePlayer ? message.player.id : this._game.player.id;
                return [
                    32 /* Message */,
                    priority,
                    playerId,
                    message.data,
                    !!message.local // 4?: ローカル
                ];
            case g.EventType.Operation:
                var op = e;
                playerId = preservePlayer ? op.player.id : this._game.player.id;
                return [
                    64 /* Operation */,
                    priority,
                    playerId,
                    op.code,
                    op.data,
                    !!op.local // 5?: ローカル
                ];
            default:
                throw g.ExceptionFactory.createAssertionError("Unknown type: " + e.type);
        }
    };
    EventConverter.prototype.makePlaylogOperationEvent = function (op) {
        var playerId = this._game.player.id;
        var priority = (op.priority != null) ? 3 /* Priority */ & op.priority : 0;
        return [
            64 /* Operation */,
            priority,
            playerId,
            op._code,
            op.data,
            !!op.local // 5: ローカル
        ];
    };
    return EventConverter;
}());
exports.EventConverter = EventConverter;

},{"@akashic/akashic-engine":1}],8:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * `GameLoop` の実行モード。
 */
var ExecutionMode;
(function (ExecutionMode) {
    /**
     * `GameLoop` がactiveである。
     *
     * `GameLoop#_executionMode` がこの値である場合、そのインスタンスは:
     *  - playlog.Eventを外部から受け付ける
     *  - playlog.Tickを生成し外部へ送信する
     */
    ExecutionMode[ExecutionMode["Active"] = 0] = "Active";
    /**
     * `GameLoop` がpassiveである。
     *
     * `GameLoop#_executionMode` がこの値である場合、そのインスタンスは:
     *  - playlog.Eventを外部に送信する
     *  - playlog.Tickを受信し、それに基づいて `g.Game#tick()` を呼び出す
     */
    ExecutionMode[ExecutionMode["Passive"] = 1] = "Passive";
})(ExecutionMode || (ExecutionMode = {}));
exports.default = ExecutionMode;

},{}],10:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var g = require("@akashic/akashic-engine");
/**
 * Gameクラス。
 *
 * このクラスはakashic-engineに由来するクラスであり、
 * アンダースコアで始まるプロパティ (e.g. _foo) を外部から参照する場合がある点に注意。
 * (akashic-engine においては、_foo は「ゲーム開発者向けでない」ことしか意味しない。)
 */
var Game = /** @class */ (function (_super) {
    __extends(Game, _super);
    function Game(param) {
        var _this = _super.call(this, param.configuration, param.resourceFactory, param.assetBase, param.player.id, param.operationPluginViewInfo) || this;
        _this.agePassedTrigger = new g.Trigger();
        _this.targetTimeReachedTrigger = new g.Trigger();
        _this.skippingChangedTrigger = new g.Trigger();
        _this.abortTrigger = new g.Trigger();
        _this.player = param.player;
        _this.raiseEventTrigger = new g.Trigger();
        _this.raiseTickTrigger = new g.Trigger();
        _this.snapshotTrigger = new g.Trigger();
        _this.isSnapshotSaver = !!param.isSnapshotSaver;
        _this._getCurrentTimeFunc = null;
        _this._eventFilterFuncs = null;
        _this._notifyPassedAgeTable = {};
        _this._notifiesTargetTimeReached = false;
        _this._isSkipAware = false;
        _this._gameArgs = param.gameArgs;
        _this._globalGameArgs = param.globalGameArgs;
        _this.skippingChangedTrigger.add(_this._onSkippingChanged, _this);
        return _this;
    }
    /**
     * 特定age到達時の通知を要求する。
     * @param age 通知を要求するage
     */
    Game.prototype.requestNotifyAgePassed = function (age) {
        this._notifyPassedAgeTable[age] = true;
    };
    /**
     * 特定age到達時の通知要求を解除する。
     * @param age 通知要求を解除するage
     */
    Game.prototype.cancelNotifyAgePassed = function (age) {
        delete this._notifyPassedAgeTable[age];
    };
    /**
     * 次に目標時刻を到達した時点を通知するよう要求する。
     * 重複呼び出しはサポートしていない。すなわち、呼び出し後 `targetTimeReachedTrigger` がfireされるまでの呼び出しは無視される。
     */
    Game.prototype.requestNotifyTargetTimeReached = function () {
        this._notifiesTargetTimeReached = true;
    };
    /**
     * 目標時刻を到達した時点を通知要求を解除する。
     */
    Game.prototype.cancelNofityTargetTimeReached = function () {
        this._notifiesTargetTimeReached = false;
    };
    Game.prototype.fireAgePassedIfNeeded = function () {
        var age = this.age - 1; // 通過済みのageを確認するため -1 する。
        if (this._notifyPassedAgeTable[age]) {
            delete this._notifyPassedAgeTable[age];
            this.agePassedTrigger.fire(age);
            return true;
        }
        return false;
    };
    /**
     * `Game` が利用する時刻取得関数をセットする。
     * このメソッドは `Game#_load()` 呼び出しに先行して呼び出されていなければならない。
     */
    Game.prototype.setCurrentTimeFunc = function (fun) {
        this._getCurrentTimeFunc = fun;
    };
    /**
     * `Game` のイベントフィルタ関連実装をセットする。
     * このメソッドは `Game#_load()` 呼び出しに先行して呼び出されていなければならない。
     */
    Game.prototype.setEventFilterFuncs = function (funcs) {
        this._eventFilterFuncs = funcs;
    };
    Game.prototype.setStorageFunc = function (funcs) {
        this.storage._registerLoad(funcs.storageGetFunc);
        this.storage._registerWrite(funcs.storagePutFunc);
        // TODO: akashic-engine 側で書き換えられるようにする
        this.storage.requestValuesForJoinPlayer = funcs.requestValuesForJoinFunc;
    };
    Game.prototype.getIsSkipAware = function () {
        return this._isSkipAware;
    };
    Game.prototype.setIsSkipAware = function (aware) {
        this._isSkipAware = aware;
    };
    Game.prototype.getCurrentTime = function () {
        // GameLoopの同名メソッドとは戻り値が異なるが、 `Game.getCurrentTime()` は `Date.now()` の代替として使用されるため、整数値を返す。
        return Math.floor(this._getCurrentTimeFunc());
    };
    Game.prototype.raiseEvent = function (event) {
        this.raiseEventTrigger.fire(event);
    };
    // TODO: (WIP) playlog.Event[] をとるべきか検討し対応する。
    Game.prototype.raiseTick = function (events) {
        if (!this.scene() || this.scene().tickGenerationMode !== g.TickGenerationMode.Manual)
            throw g.ExceptionFactory.createAssertionError("Game#raiseTick(): tickGenerationMode for the current scene is not Manual.");
        this.raiseTickTrigger.fire(events);
    };
    Game.prototype.addEventFilter = function (filter, handleEmpty) {
        this._eventFilterFuncs.addFilter(filter, handleEmpty);
    };
    Game.prototype.removeEventFilter = function (filter) {
        this._eventFilterFuncs.removeFilter(filter);
    };
    Game.prototype.shouldSaveSnapshot = function () {
        return this.isSnapshotSaver;
    };
    // NOTE: 現状実装が `shouldSaveSnapshot()` と等価なので、簡易対応としてこの実装を用いる。
    Game.prototype.isActiveInstance = function () {
        return this.shouldSaveSnapshot();
    };
    Game.prototype.saveSnapshot = function (gameSnapshot, timestamp) {
        if (timestamp === void 0) { timestamp = this._getCurrentTimeFunc(); }
        if (!this.shouldSaveSnapshot())
            return;
        this.snapshotTrigger.fire({
            frame: this.age,
            timestamp: timestamp,
            data: {
                randGenSer: this.random[0].serialize(),
                gameSnapshot: gameSnapshot
            }
        });
    };
    Game.prototype._destroy = function () {
        this.agePassedTrigger.destroy();
        this.agePassedTrigger = null;
        this.targetTimeReachedTrigger.destroy();
        this.targetTimeReachedTrigger = null;
        this.skippingChangedTrigger.destroy();
        this.skippingChangedTrigger = null;
        this.abortTrigger.destroy();
        this.abortTrigger = null;
        this.player = null;
        this.raiseEventTrigger.destroy();
        this.raiseEventTrigger = null;
        this.raiseTickTrigger.destroy();
        this.raiseTickTrigger = null;
        this.snapshotTrigger.destroy();
        this.snapshotTrigger = null;
        this.isSnapshotSaver = false;
        this._getCurrentTimeFunc = null;
        this._eventFilterFuncs = null;
        this._notifyPassedAgeTable = null;
        this._gameArgs = null;
        this._globalGameArgs = null;
        _super.prototype._destroy.call(this);
    };
    Game.prototype._restartWithSnapshot = function (snapshot) {
        var data = snapshot.data;
        this._eventFilterFuncs.removeFilter();
        if (data.seed != null) {
            // 例外ケース: 第0スタートポイントでスナップショットは持っていないので特別対応
            var randGen = new g.XorshiftRandomGenerator(data.seed);
            this._reset({ age: snapshot.frame, randGen: randGen });
            this._loadAndStart({ args: this._gameArgs, globalArgs: this._globalGameArgs });
        }
        else {
            var randGen = new g.XorshiftRandomGenerator(0, data.randGenSer);
            this._reset({ age: snapshot.frame, randGen: randGen });
            this._loadAndStart({ snapshot: data.gameSnapshot });
        }
    };
    Game.prototype._leaveGame = function () {
        // do nothing.
    };
    Game.prototype._abortGame = function () {
        this.abortTrigger.fire();
    };
    Game.prototype._onRawTargetTimeReached = function (targetTime) {
        if (this._notifiesTargetTimeReached) {
            this._notifiesTargetTimeReached = false;
            this.targetTimeReachedTrigger.fire(targetTime);
        }
    };
    Game.prototype._onSkippingChanged = function (skipping) {
        if (this._isSkipAware) {
            this.skippingChanged.fire(skipping);
        }
    };
    return Game;
}(g.Game));
exports.Game = Game;

},{"@akashic/akashic-engine":1}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameDriver = void 0;
var es6_promise_1 = require("es6-promise");
var g = require("@akashic/akashic-engine");
var ExecutionMode_1 = require("./ExecutionMode");
var Game_1 = require("./Game");
var EventBuffer_1 = require("./EventBuffer");
var GameLoop_1 = require("./GameLoop");
var PdiUtil_1 = require("./PdiUtil");
var GAME_DESTROYED_MESSAGE = "GAME_DESTROYED";
var GameDriver = /** @class */ (function () {
    function GameDriver(param) {
        this.errorTrigger = new g.Trigger();
        if (param.errorHandler)
            this.errorTrigger.add(param.errorHandler, param.errorHandlerOwner);
        this.configurationLoadedTrigger = new g.Trigger();
        this.gameCreatedTrigger = new g.Trigger();
        this._platform = param.platform;
        this._loadConfigurationFunc = PdiUtil_1.PdiUtil.makeLoadConfigurationFunc(param.platform);
        this._player = param.player;
        this._rendererRequirement = null;
        this._playId = null;
        this._game = null;
        this._gameLoop = null;
        this._eventBuffer = null;
        this._openedAmflow = false;
        this._playToken = null;
        this._permission = null;
        this._hidden = false;
        this._destroyed = false;
    }
    /**
     * `GameDriver` を初期化する。
     */
    GameDriver.prototype.initialize = function (param, callback) {
        this.doInitialize(param).then(function () { callback(); }, callback);
    };
    /**
     * `GameDriver` の各種状態を変更する。
     *
     * 引数 `param` のうち、省略されなかった値が新たに設定される。
     * `startGame()` によりゲームが開始されていた場合、暗黙に `stopGame()` が行われ、完了後 `startGame()` される。
     */
    GameDriver.prototype.changeState = function (param, callback) {
        var _this = this;
        var pausing = this._gameLoop && this._gameLoop.running;
        if (pausing)
            this._gameLoop.stop();
        this.initialize(param, function (err) {
            if (err) {
                callback(err);
                return;
            }
            if (pausing)
                _this._gameLoop.start();
            callback();
        });
    };
    /**
     * ゲームを開始する。
     * このメソッドの呼び出しは、 `initialize()` の完了後でなければならない。
     */
    GameDriver.prototype.startGame = function () {
        if (!this._gameLoop) {
            this.errorTrigger.fire(new Error("Not initialized"));
            return;
        }
        this._gameLoop.start();
    };
    /**
     * ゲームを(一時的に)止める。
     *
     * このメソッドの呼び出し後、 `startGame()` が呼び出されるまで、 `Game#tick()` は呼び出されない。
     * Active であればティックの生成が行われず、 Passive であれば受信したティックは蓄積される。
     */
    GameDriver.prototype.stopGame = function () {
        if (this._gameLoop) {
            this._gameLoop.stop();
        }
    };
    /**
     * このドライバが次にティックを生成する場合の、ageの値を設定する。
     * `ExecutionMode.Active` でない場合、動作に影響を与えない。
     * このメソッドの呼び出しは、 `initialize()` の完了後でなければならない。
     *
     * @param age 次に生成されるティックのage
     */
    GameDriver.prototype.setNextAge = function (age) {
        this._gameLoop.setNextAge(age);
    };
    GameDriver.prototype.getPermission = function () {
        return this._permission;
    };
    GameDriver.prototype.getDriverConfiguration = function () {
        return {
            playId: this._playId,
            playToken: this._playToken,
            executionMode: this._gameLoop ? this._gameLoop.getExecutionMode() : undefined,
            eventBufferMode: this._eventBuffer ? this._eventBuffer.getMode() : undefined
        };
    };
    GameDriver.prototype.getLoopConfiguration = function () {
        return this._gameLoop ? this._gameLoop.getLoopConfiguration() : null;
    };
    GameDriver.prototype.getHidden = function () {
        return this._hidden;
    };
    /**
     * PDIに対してプライマリサーフェスのリセットを要求する。
     *
     * @param width プライマリサーフェスの幅。
     * @param height プライマリサーフェスの高さ。
     * @param rendererCandidates Rendererのタイプ。
     */
    GameDriver.prototype.resetPrimarySurface = function (width, height, rendererCandidates) {
        rendererCandidates = rendererCandidates ? rendererCandidates
            : this._rendererRequirement ? this._rendererRequirement.rendererCandidates
                : null;
        var game = this._game;
        var pf = this._platform;
        var primarySurface = pf.getPrimarySurface();
        game.renderers = game.renderers.filter(function (renderer) { return renderer !== primarySurface.renderer(); });
        pf.setRendererRequirement({
            primarySurfaceWidth: width,
            primarySurfaceHeight: height,
            rendererCandidates: rendererCandidates
        });
        this._rendererRequirement = {
            primarySurfaceWidth: width,
            primarySurfaceHeight: height,
            rendererCandidates: rendererCandidates
        };
        game.renderers.push(pf.getPrimarySurface().renderer());
        game.width = width;
        game.height = height;
        game.resized.fire({ width: width, height: height });
        game.modified = true;
    };
    GameDriver.prototype.doInitialize = function (param) {
        var _this = this;
        var p = new es6_promise_1.Promise(function (resolve, reject) {
            if (_this._gameLoop && _this._gameLoop.running) {
                return reject(new Error("Game is running. Must be stopped."));
            }
            if (_this._gameLoop && param.loopConfiguration) {
                _this._gameLoop.setLoopConfiguration(param.loopConfiguration);
            }
            if (param.hidden != null) {
                _this._hidden = param.hidden;
                if (_this._game) {
                    _this._game._setMuted(param.hidden);
                }
            }
            resolve();
        }).then(function () {
            _this._assertLive();
            return _this._doSetDriverConfiguration(param.driverConfiguration);
        });
        if (!param.configurationUrl)
            return p;
        return p.then(function () {
            _this._assertLive();
            return _this._loadConfiguration(param.configurationUrl, param.assetBase, param.configurationBase);
        }).then(function (conf) {
            _this._assertLive();
            return _this._createGame(conf, _this._player, param);
        });
    };
    GameDriver.prototype.destroy = function () {
        var _this = this;
        // NOTE: ここで破棄されるTriggerのfire中に呼ばれるとクラッシュするので、同期的処理だが念のためPromiseに包んで非同期で実行する
        return new es6_promise_1.Promise(function (resolve, reject) {
            _this.stopGame();
            if (_this._game) {
                _this._game._destroy();
                _this._game = null;
            }
            _this.errorTrigger.destroy();
            _this.errorTrigger = null;
            _this.configurationLoadedTrigger.destroy();
            _this.configurationLoadedTrigger = null;
            _this.gameCreatedTrigger.destroy();
            _this.gameCreatedTrigger = null;
            if (_this._platform.destroy) {
                _this._platform.destroy();
            }
            else {
                _this._platform.setRendererRequirement(undefined);
            }
            _this._platform = null;
            _this._loadConfigurationFunc = null;
            _this._player = null;
            _this._rendererRequirement = null;
            _this._playId = null;
            _this._gameLoop = null;
            _this._eventBuffer = null;
            _this._openedAmflow = false;
            _this._playToken = null;
            _this._permission = null;
            _this._hidden = false;
            _this._destroyed = true;
            resolve();
        });
    };
    GameDriver.prototype._doSetDriverConfiguration = function (dconf) {
        var _this = this;
        if (dconf == null) {
            return es6_promise_1.Promise.resolve();
        }
        // デフォルト値の補完
        if (dconf.playId === undefined)
            dconf.playId = this._playId;
        if (dconf.playToken === undefined)
            dconf.playToken = this._playToken;
        if (dconf.eventBufferMode === undefined) {
            if (dconf.executionMode === ExecutionMode_1.default.Active) {
                dconf.eventBufferMode = { isReceiver: true, isSender: false };
            }
            else if (dconf.executionMode === ExecutionMode_1.default.Passive) {
                dconf.eventBufferMode = { isReceiver: false, isSender: true };
            }
        }
        var p = es6_promise_1.Promise.resolve();
        if (this._playId !== dconf.playId) {
            p = p.then(function () {
                _this._assertLive();
                return _this._doOpenAmflow(dconf.playId);
            });
        }
        if (this._playToken !== dconf.playToken) {
            p = p.then(function () {
                _this._assertLive();
                return _this._doAuthenticate(dconf.playToken);
            });
        }
        return p.then(function () {
            _this._assertLive();
            if (dconf.eventBufferMode != null) {
                if (dconf.eventBufferMode.defaultEventPriority == null) {
                    dconf.eventBufferMode.defaultEventPriority = 3 /* Priority */ & _this._permission.maxEventPriority;
                }
                if (_this._eventBuffer) {
                    _this._eventBuffer.setMode(dconf.eventBufferMode);
                }
            }
            if (dconf.executionMode != null) {
                if (_this._gameLoop) {
                    _this._gameLoop.setExecutionMode(dconf.executionMode);
                }
            }
        });
    };
    GameDriver.prototype._doCloseAmflow = function () {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve, reject) {
            if (!_this._openedAmflow)
                return resolve();
            _this._platform.amflow.close(function (err) {
                _this._openedAmflow = false;
                var error = _this._getCallbackError(err);
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    };
    GameDriver.prototype._doOpenAmflow = function (playId) {
        var _this = this;
        if (playId === undefined) {
            return es6_promise_1.Promise.resolve();
        }
        var p = this._doCloseAmflow();
        return p.then(function () {
            _this._assertLive();
            return new es6_promise_1.Promise(function (resolve, reject) {
                if (playId === null)
                    return resolve();
                _this._platform.amflow.open(playId, function (err) {
                    var error = _this._getCallbackError(err);
                    if (error) {
                        return reject(error);
                    }
                    _this._openedAmflow = true;
                    _this._playId = playId;
                    if (_this._game)
                        _this._updateGamePlayId(_this._game);
                    resolve();
                });
            });
        });
    };
    GameDriver.prototype._doAuthenticate = function (playToken) {
        var _this = this;
        if (playToken == null)
            return es6_promise_1.Promise.resolve();
        return new es6_promise_1.Promise(function (resolve, reject) {
            _this._platform.amflow.authenticate(playToken, function (err, permission) {
                var error = _this._getCallbackError(err);
                if (error) {
                    return reject(error);
                }
                _this._playToken = playToken;
                _this._permission = permission;
                if (_this._game) {
                    _this._game.isSnapshotSaver = _this._permission.writeTick;
                }
                resolve();
            });
        });
    };
    GameDriver.prototype._loadConfiguration = function (configurationUrl, assetBase, configurationBase) {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve, reject) {
            _this._loadConfigurationFunc(configurationUrl, assetBase, configurationBase, function (err, conf) {
                var error = _this._getCallbackError(err);
                if (error) {
                    return reject(error);
                }
                _this.configurationLoadedTrigger.fire(conf);
                resolve(conf);
            });
        });
    };
    GameDriver.prototype._putZerothStartPoint = function (data) {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve, reject) {
            // AMFlowは第0スタートポイントに関して「書かれるまで待つ」という動作をするため、「なければ書き込む」ことはできない。
            var zerothStartPoint = { frame: 0, timestamp: data.startedAt, data: data };
            _this._platform.amflow.putStartPoint(zerothStartPoint, function (err) {
                var error = _this._getCallbackError(err);
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    };
    GameDriver.prototype._getZerothStartPointData = function () {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve, reject) {
            _this._platform.amflow.getStartPoint({ frame: 0 }, function (err, startPoint) {
                var error = _this._getCallbackError(err);
                if (error) {
                    return reject(error);
                }
                var data = startPoint.data;
                if (typeof data.seed !== "number") // 型がないので一応確認
                    return reject(new Error("GameDriver#_getRandomSeed: No seed found."));
                resolve(data);
            });
        });
    };
    GameDriver.prototype._createGame = function (conf, player, param) {
        var _this = this;
        var putSeed = (param.driverConfiguration.executionMode === ExecutionMode_1.default.Active) && this._permission.writeTick;
        var p;
        if (putSeed) {
            p = this._putZerothStartPoint({
                seed: Date.now(),
                globalArgs: param.globalGameArgs,
                fps: conf.fps,
                startedAt: Date.now()
            });
        }
        else {
            p = es6_promise_1.Promise.resolve();
        }
        p = p.then(function () {
            _this._assertLive();
            return _this._getZerothStartPointData();
        });
        return p.then(function (zerothData) {
            _this._assertLive();
            var pf = _this._platform;
            var driverConf = param.driverConfiguration || {
                eventBufferMode: { isReceiver: true, isSender: false },
                executionMode: ExecutionMode_1.default.Active
            };
            var seed = zerothData.seed;
            var args = param.gameArgs;
            var globalArgs = zerothData.globalArgs;
            var startedAt = zerothData.startedAt;
            var rendererRequirement = {
                primarySurfaceWidth: conf.width,
                primarySurfaceHeight: conf.height,
                rendererCandidates: conf.renderers // TODO: akashic-engineのGameConfigurationにrenderersの定義を加える
            };
            pf.setRendererRequirement(rendererRequirement);
            var game = new Game_1.Game({
                configuration: conf,
                player: player,
                resourceFactory: pf.getResourceFactory(),
                assetBase: param.assetBase,
                isSnapshotSaver: _this._permission.writeTick,
                operationPluginViewInfo: (pf.getOperationPluginViewInfo ? pf.getOperationPluginViewInfo() : null),
                gameArgs: args,
                globalGameArgs: globalArgs
            });
            var eventBuffer = new EventBuffer_1.EventBuffer({ game: game, amflow: pf.amflow });
            eventBuffer.setMode(driverConf.eventBufferMode);
            pf.setPlatformEventHandler(eventBuffer);
            game.setEventFilterFuncs({
                addFilter: eventBuffer.addFilter.bind(eventBuffer),
                removeFilter: eventBuffer.removeFilter.bind(eventBuffer)
            });
            game.renderers.push(pf.getPrimarySurface().renderer());
            var gameLoop = new GameLoop_1.GameLoop({
                game: game,
                amflow: pf.amflow,
                platform: pf,
                executionMode: driverConf.executionMode,
                eventBuffer: eventBuffer,
                configuration: param.loopConfiguration,
                startedAt: startedAt,
                profiler: param.profiler
            });
            gameLoop.rawTargetTimeReachedTrigger.add(game._onRawTargetTimeReached, game);
            game.setCurrentTimeFunc(gameLoop.getCurrentTime.bind(gameLoop));
            game._reset({ age: 0, randGen: new g.XorshiftRandomGenerator(seed) });
            _this._updateGamePlayId(game);
            if (_this._hidden)
                game._setMuted(true);
            game.snapshotTrigger.add(function (startPoint) {
                _this._platform.amflow.putStartPoint(startPoint, function (err) {
                    var error = _this._getCallbackError(err);
                    if (error) {
                        _this.errorTrigger.fire(error);
                    }
                });
            });
            _this._game = game;
            _this._eventBuffer = eventBuffer;
            _this._gameLoop = gameLoop;
            _this._rendererRequirement = rendererRequirement;
            _this.gameCreatedTrigger.fire(game);
            _this._game._loadAndStart({ args: param.gameArgs || undefined }); // TODO: Game#_restartWithSnapshot()と統合すべき
        });
    };
    GameDriver.prototype._updateGamePlayId = function (game) {
        var _this = this;
        game.playId = this._playId;
        game.external.send = function (data) {
            _this._platform.sendToExternal(_this._playId, data);
        };
    };
    // 非同期処理中にゲームがdestroy済みかどうか判定するためのメソッド
    GameDriver.prototype._assertLive = function () {
        if (this._destroyed) {
            throw new Error(GAME_DESTROYED_MESSAGE);
        }
    };
    // コールバック時にエラーが発生もしくはゲームがdestroy済みの場合はErrorを返す
    GameDriver.prototype._getCallbackError = function (err) {
        if (err) {
            return err;
        }
        else if (this._destroyed) {
            return new Error(GAME_DESTROYED_MESSAGE);
        }
        return null;
    };
    return GameDriver;
}());
exports.GameDriver = GameDriver;

},{"./EventBuffer":6,"./ExecutionMode":9,"./Game":10,"./GameLoop":12,"./PdiUtil":16,"@akashic/akashic-engine":1,"es6-promise":83}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameLoop = void 0;
var g = require("@akashic/akashic-engine");
var constants = require("./constants");
var LoopMode_1 = require("./LoopMode");
var LoopRenderMode_1 = require("./LoopRenderMode");
var ExecutionMode_1 = require("./ExecutionMode");
var Clock_1 = require("./Clock");
var ProfilerClock_1 = require("./ProfilerClock");
var EventConverter_1 = require("./EventConverter");
var TickController_1 = require("./TickController");
/**
 * ゲームのメインループ管理クラス。
 * clock frameの度にTickBufferに蓄積されたTickを元にゲームを動かす。
 *
 * start() から stop() までの間、最後に呼び出された _amflow.authenticate() は Permission#readTick を返していなければならない。
 */
var GameLoop = /** @class */ (function () {
    function GameLoop(param) {
        this.errorTrigger = new g.Trigger();
        this.rawTargetTimeReachedTrigger = new g.Trigger();
        this.running = false;
        this._currentTime = param.startedAt;
        this._frameTime = 1000 / param.game.fps;
        this._omittedTickDuration = 0;
        if (param.errorHandler) {
            this.errorTrigger.add(param.errorHandler, param.errorHandlerOwner);
        }
        var conf = param.configuration;
        this._startedAt = param.startedAt;
        this._targetTimeFunc = conf.targetTimeFunc || null;
        this._targetTimeOffset = conf.targetTimeOffset || null;
        this._originDate = conf.originDate || null;
        this._realTargetTimeOffset = (this._originDate != null) ? this._originDate : (this._targetTimeOffset || 0) + this._startedAt;
        this._delayIgnoreThreshold = conf.delayIgnoreThreshold || constants.DEFAULT_DELAY_IGNORE_THRESHOLD;
        this._skipTicksAtOnce = conf.skipTicksAtOnce || constants.DEFAULT_SKIP_TICKS_AT_ONCE;
        this._skipThreshold = conf.skipThreshold || constants.DEFAULT_SKIP_THRESHOLD;
        this._skipThresholdTime = this._skipThreshold * this._frameTime;
        // this._skipAwareGame はないことに注意 (Game#getIsSkipAware()) を使う
        this._jumpTryThreshold = conf.jumpTryThreshold || constants.DEFAULT_JUMP_TRY_THRESHOLD;
        this._jumpIgnoreThreshold = conf.jumpIgnoreThreshold || constants.DEFAULT_JUMP_IGNORE_THRESHOLD;
        this._pollingTickThreshold = conf._pollingTickThreshold || constants.DEFAULT_POLLING_TICK_THRESHOLD;
        this._playbackRate = conf.playbackRate || 1;
        var loopRenderMode = (conf.loopRenderMode != null) ? conf.loopRenderMode : LoopRenderMode_1.default.AfterRawFrame;
        this._loopRenderMode = null; // 後の_setLoopRenderMode()で初期化
        this._omitInterpolatedTickOnReplay = (conf.omitInterpolatedTickOnReplay != null) ? conf.omitInterpolatedTickOnReplay : true;
        this._loopMode = conf.loopMode;
        this._amflow = param.amflow;
        this._game = param.game;
        this._eventBuffer = param.eventBuffer;
        this._executionMode = param.executionMode;
        this._sceneTickMode = null;
        this._sceneLocalMode = null;
        this._targetAge = (conf.targetAge != null) ? conf.targetAge : null;
        this._waitingStartPoint = false;
        this._lastRequestedStartPointAge = -1;
        this._lastRequestedStartPointTime = -1;
        this._waitingNextTick = false;
        this._consumedLatestTick = false;
        this._skipping = false;
        this._lastPollingTickTime = 0;
        // todo: 本来は、パフォーマンス測定機構を含まないリリースモードによるビルド方式も提供すべき。
        if (!param.profiler) {
            this._clock = new Clock_1.Clock({
                fps: param.game.fps,
                scaleFactor: this._playbackRate,
                platform: param.platform,
                maxFramePerOnce: 5
            });
        }
        else {
            this._clock = new ProfilerClock_1.ProfilerClock({
                fps: param.game.fps,
                scaleFactor: this._playbackRate,
                platform: param.platform,
                maxFramePerOnce: 5,
                profiler: param.profiler
            });
        }
        this._tickController = new TickController_1.TickController({
            amflow: param.amflow,
            clock: this._clock,
            game: param.game,
            eventBuffer: param.eventBuffer,
            executionMode: param.executionMode,
            startedAt: param.startedAt,
            errorHandler: this.errorTrigger.fire,
            errorHandlerOwner: this.errorTrigger
        });
        this._eventConverter = new EventConverter_1.EventConverter({ game: param.game });
        this._tickBuffer = this._tickController.getBuffer();
        this._onGotStartPoint_bound = this._onGotStartPoint.bind(this);
        this._setLoopRenderMode(loopRenderMode);
        this._game.setIsSkipAware(conf.skipAwareGame != null ? conf.skipAwareGame : true);
        this._game.setStorageFunc(this._tickController.storageFunc());
        this._game.raiseEventTrigger.add(this._onGameRaiseEvent, this);
        this._game.raiseTickTrigger.add(this._onGameRaiseTick, this);
        this._game._started.add(this._onGameStarted, this);
        this._game._operationPluginOperated.add(this._onGameOperationPluginOperated, this);
        this._tickBuffer.gotNextTickTrigger.add(this._onGotNextFrameTick, this);
        this._tickBuffer.gotNoTickTrigger.add(this._onGotNoTick, this);
        this._tickBuffer.start();
        this._updateGamePlaybackRate();
        this._handleSceneChange();
    }
    GameLoop.prototype.start = function () {
        this.running = true;
        this._clock.start();
    };
    GameLoop.prototype.stop = function () {
        this._clock.stop();
        this.running = false;
    };
    GameLoop.prototype.setNextAge = function (age) {
        this._tickController.setNextAge(age);
    };
    GameLoop.prototype.getExecutionMode = function () {
        return this._executionMode;
    };
    GameLoop.prototype.setExecutionMode = function (execMode) {
        this._executionMode = execMode;
        this._tickController.setExecutionMode(execMode);
    };
    GameLoop.prototype.getLoopConfiguration = function () {
        return {
            loopMode: this._loopMode,
            delayIgnoreThreshold: this._delayIgnoreThreshold,
            skipTicksAtOnce: this._skipTicksAtOnce,
            skipThreshold: this._skipThreshold,
            skipAwareGame: this._game.getIsSkipAware(),
            jumpTryThreshold: this._jumpTryThreshold,
            jumpIgnoreThreshold: this._jumpIgnoreThreshold,
            playbackRate: this._playbackRate,
            loopRenderMode: this._loopRenderMode,
            targetTimeFunc: this._targetTimeFunc,
            targetTimeOffset: this._targetTimeOffset,
            originDate: this._originDate,
            omitInterpolatedTickOnReplay: this._omitInterpolatedTickOnReplay,
            targetAge: this._targetAge
        };
    };
    GameLoop.prototype.setLoopConfiguration = function (conf) {
        if (conf.loopMode != null)
            this._loopMode = conf.loopMode;
        if (conf.delayIgnoreThreshold != null)
            this._delayIgnoreThreshold = conf.delayIgnoreThreshold;
        if (conf.skipTicksAtOnce != null)
            this._skipTicksAtOnce = conf.skipTicksAtOnce;
        if (conf.skipThreshold != null) {
            this._skipThreshold = conf.skipThreshold;
            this._skipThresholdTime = this._skipThreshold * this._frameTime;
        }
        if (conf.skipAwareGame != null)
            this._game.setIsSkipAware(conf.skipAwareGame);
        if (conf.jumpTryThreshold != null)
            this._jumpTryThreshold = conf.jumpTryThreshold;
        if (conf.jumpIgnoreThreshold != null)
            this._jumpIgnoreThreshold = conf.jumpIgnoreThreshold;
        if (conf.playbackRate != null) {
            this._playbackRate = conf.playbackRate;
            this._clock.changeScaleFactor(this._playbackRate);
            this._updateGamePlaybackRate();
        }
        if (conf.loopRenderMode != null)
            this._setLoopRenderMode(conf.loopRenderMode);
        if (conf.targetTimeFunc != null) {
            this._targetTimeFunc = conf.targetTimeFunc;
        }
        if (conf.targetTimeOffset != null)
            this._targetTimeOffset = conf.targetTimeOffset;
        if (conf.originDate != null)
            this._originDate = conf.originDate;
        this._realTargetTimeOffset = (this._originDate != null) ? this._originDate : (this._targetTimeOffset || 0) + this._startedAt;
        if (conf.omitInterpolatedTickOnReplay != null)
            this._omitInterpolatedTickOnReplay = conf.omitInterpolatedTickOnReplay;
        if (conf.targetAge != null) {
            if (this._targetAge !== conf.targetAge) {
                // targetAgeの変化によって必要なティックが変化した可能性がある。
                // 一度リセットして _onFrame() で改めて _waitingNextTick を求め直す。
                this._waitingNextTick = false;
            }
            this._targetAge = conf.targetAge;
        }
    };
    GameLoop.prototype.addTickList = function (tickList) {
        this._tickBuffer.addTickList(tickList);
    };
    GameLoop.prototype.getCurrentTime = function () {
        return this._currentTime;
    };
    /**
     * 早送り状態に入る。
     *
     * すべての早回し(1フレームでの複数ティック消費)で早送り状態に入るわけではないことに注意。
     * 少々の遅れはこのクラスが暗黙に早回しして吸収する。
     * 早送り状態は、暗黙の早回しでは吸収しきれない規模の早回しの開始時に通知される。
     * 具体的な値との関連は `skipThreshold` など `LoopConfiguration` のメンバを参照のこと。
     */
    GameLoop.prototype._startSkipping = function () {
        this._skipping = true;
        this._updateGamePlaybackRate();
        this._game.skippingChangedTrigger.fire(true);
    };
    /**
     * 早送り状態を終える。
     */
    GameLoop.prototype._stopSkipping = function () {
        this._skipping = false;
        this._updateGamePlaybackRate();
        this._game.skippingChangedTrigger.fire(false);
    };
    /**
     * Gameの再生速度設定を変える。
     * 実際に再生速度(ティックの消費速度)を決めているのはこのクラスである点に注意。
     */
    GameLoop.prototype._updateGamePlaybackRate = function () {
        var realPlaybackRate = this._skipping ? (this._playbackRate * this._skipTicksAtOnce) : this._playbackRate;
        this._game._setAudioPlaybackRate(realPlaybackRate);
    };
    GameLoop.prototype._handleSceneChange = function () {
        var scene = this._game.scene();
        var localMode = scene ? scene.local : g.LocalTickMode.FullLocal; // シーンがない場合はローカルシーン同様に振る舞う(ティックは消化しない)
        var tickMode = scene ? scene.tickGenerationMode : g.TickGenerationMode.ByClock;
        if (this._sceneLocalMode !== localMode || this._sceneTickMode !== tickMode) {
            this._sceneLocalMode = localMode;
            this._sceneTickMode = tickMode;
            this._clock.frameTrigger.remove(this._onFrame, this);
            this._clock.frameTrigger.remove(this._onLocalFrame, this);
            switch (localMode) {
                case g.LocalTickMode.FullLocal:
                    // ローカルシーン: TickGenerationMode に関係なくローカルティックのみ
                    this._tickController.stopTick();
                    this._clock.frameTrigger.add(this._onLocalFrame, this);
                    break;
                case g.LocalTickMode.NonLocal:
                case g.LocalTickMode.InterpolateLocal:
                    if (tickMode === g.TickGenerationMode.ByClock) {
                        this._tickController.startTick();
                    }
                    else {
                        // Manual の場合: storageDataが乗る可能性がある最初のTickだけ生成させ、あとは生成を止める。(Manualの仕様どおりの挙動)
                        // storageDataがある場合は送らないとPassiveのインスタンスがローディングシーンを終えられない。
                        this._tickController.startTickOnce();
                    }
                    this._clock.frameTrigger.add(this._onFrame, this);
                    break;
                default:
                    this.errorTrigger.fire(new Error("Unknown LocalTickMode: " + localMode));
                    return;
            }
        }
    };
    /**
     * ローカルシーンのフレーム処理。
     *
     * `this._clock` の管理する時間経過に従い、ローカルシーンにおいて1フレーム時間につき1回呼び出される。
     */
    GameLoop.prototype._onLocalFrame = function () {
        this._doLocalTick();
    };
    GameLoop.prototype._doLocalTick = function () {
        var game = this._game;
        var pevs = this._eventBuffer.readLocalEvents();
        this._currentTime += this._frameTime;
        if (pevs) {
            for (var i = 0, len = pevs.length; i < len; ++i)
                game.events.push(this._eventConverter.toGameEvent(pevs[i]));
        }
        var sceneChanged = game.tick(false, Math.floor(this._omittedTickDuration / this._frameTime));
        this._omittedTickDuration = 0;
        if (sceneChanged)
            this._handleSceneChange();
    };
    /**
     * 非ローカルシーンのフレーム処理。
     *
     * `this._clock` の管理する時間経過に従い、非ローカルシーンにおいて1フレーム時間につき1回呼び出される。
     */
    GameLoop.prototype._onFrame = function (frameArg) {
        if (this._loopMode !== LoopMode_1.default.Replay || !this._targetTimeFunc) {
            this._onFrameNormal(frameArg);
        }
        else {
            var givenTargetTime = this._targetTimeFunc();
            var targetTime = givenTargetTime + this._realTargetTimeOffset;
            var prevTime = this._currentTime;
            this._onFrameForTimedReplay(targetTime, frameArg);
            // 目標時刻到達判定: 進めなくなり、あと1フレームで目標時刻を過ぎるタイミングを到達として通知する。
            // 時間進行を進めていっても目標時刻 "以上" に進むことはないので「過ぎた」タイミングは使えない点に注意。
            // (また、それでもなお (prevTime <= targetTime) の条件はなくせない点にも注意。巻き戻す時は (prevTime > targetTime) になる)
            if ((prevTime === this._currentTime) && (prevTime <= targetTime) && (targetTime <= prevTime + this._frameTime))
                this.rawTargetTimeReachedTrigger.fire(givenTargetTime);
        }
    };
    /**
     * 時刻関数が与えられている場合のフレーム処理。
     *
     * 通常ケース (`_onFrameNormal()`) とは主に次の点で異なる:
     *  1. `Replay` 時の実装しか持たない (`Realtime` は時刻関数を使わずとにかく最新ティックを目指すので不要)
     *  2. ローカルティック補間をタイムスタンプに従ってしか行わない
     * 後者は、ティック受信待ちなどの状況で起きるローカルティック補間がなくなることを意味する。
     */
    GameLoop.prototype._onFrameForTimedReplay = function (targetTime, frameArg) {
        var sceneChanged = false;
        var game = this._game;
        var timeGap = targetTime - this._currentTime;
        var frameGap = (timeGap / this._frameTime);
        if ((frameGap > this._jumpTryThreshold || frameGap < 0) &&
            (!this._waitingStartPoint) &&
            (this._lastRequestedStartPointTime < this._currentTime)) {
            // スナップショットを要求だけして続行する(スナップショットが来るまで進める限りは進む)。
            this._waitingStartPoint = true;
            this._lastRequestedStartPointTime = targetTime;
            this._amflow.getStartPoint({ timestamp: targetTime }, this._onGotStartPoint_bound);
        }
        if (frameGap <= 0) {
            if (this._skipping)
                this._stopSkipping();
            return;
        }
        if (!this._skipping) {
            if ((frameGap > this._skipThreshold || this._tickBuffer.currentAge === 0) &&
                (this._tickBuffer.hasNextTick() || (this._omitInterpolatedTickOnReplay && this._consumedLatestTick))) {
                // ここでは常に `frameGap > 0` であることに注意。0の時にskipに入ってもすぐ戻ってしまう
                this._startSkipping();
            }
        }
        var consumedFrame = 0;
        for (; consumedFrame < this._skipTicksAtOnce; ++consumedFrame) {
            var nextFrameTime = this._currentTime + this._frameTime;
            if (!this._tickBuffer.hasNextTick()) {
                if (!this._waitingNextTick) {
                    this._startWaitingNextTick();
                    if (!this._consumedLatestTick)
                        this._tickBuffer.requestTicks();
                }
                if (this._omitInterpolatedTickOnReplay && this._sceneLocalMode === g.LocalTickMode.InterpolateLocal) {
                    if (this._consumedLatestTick) {
                        // 最新のティックが存在しない場合は現在時刻を目標時刻に合わせる。
                        // (_doLocalTick() により現在時刻が this._frameTime 進むのでその直前まで進める)
                        this._currentTime = targetTime - this._frameTime;
                    }
                    // ティックがなく、目標時刻に到達していない場合、補間ティックを挿入する。
                    // (経緯上ここだけフラグ名と逆っぽい挙動になってしまっている点に注意。TODO フラグを改名する)
                    if (targetTime > nextFrameTime)
                        this._doLocalTick();
                }
                break;
            }
            var nextTickTime = this._tickBuffer.readNextTickTime();
            if (nextTickTime == null)
                nextTickTime = nextFrameTime;
            if (targetTime < nextFrameTime) {
                // 次フレームに進むと目標時刻を超過する＝次フレーム時刻までは進めない＝補間ティックは必要ない。
                if (nextTickTime <= targetTime) {
                    // 特殊ケース: 目標時刻より手前に次ティックがあるので、目標時刻までは進んで次ティックは消化してしまう。
                    // (この処理がないと、特にリプレイで「最後のティックの0.1フレーム時間前」などに来たときに進めなくなってしまう。)
                    nextFrameTime = targetTime;
                }
                else {
                    break;
                }
            }
            else {
                if (nextFrameTime < nextTickTime) {
                    if (this._omitInterpolatedTickOnReplay && this._skipping) {
                        // スキップ中、ティック補間不要なら即座に次ティック時刻(かその手前の目標時刻)まで進める。
                        // (_onFrameNormal()の対応箇所と異なり、ここでは「次ティック時刻の "次フレーム時刻"」に切り上げないことに注意。
                        //  時間ベースリプレイでは目標時刻 "以後" には進めないという制約がある。これを単純な実装で守るべく切り上げを断念している)
                        if (targetTime <= nextTickTime) {
                            // 次ティック時刻まで進めると目標時刻を超えてしまう: 目標時刻直前まで動いて抜ける(目標時刻直前までは来ないと目標時刻到達通知が永久にできない)
                            this._omittedTickDuration += targetTime - this._currentTime;
                            this._currentTime = Math.floor(targetTime / this._frameTime) * this._frameTime;
                            break;
                        }
                        nextFrameTime = nextTickTime;
                        this._omittedTickDuration += nextTickTime - this._currentTime;
                    }
                    else {
                        if (this._sceneLocalMode === g.LocalTickMode.InterpolateLocal) {
                            this._doLocalTick();
                        }
                        continue;
                    }
                }
            }
            this._currentTime = nextFrameTime;
            var tick = this._tickBuffer.consume();
            var consumedAge = -1;
            var plEvents = this._eventBuffer.readLocalEvents();
            if (plEvents) {
                for (var j = 0, len = plEvents.length; j < len; ++j) {
                    game.events.push(this._eventConverter.toGameEvent(plEvents[j]));
                }
            }
            if (typeof tick === "number") {
                consumedAge = tick;
                sceneChanged = game.tick(true, Math.floor(this._omittedTickDuration / this._frameTime));
            }
            else {
                consumedAge = tick[0 /* Age */];
                var pevs = tick[1 /* Events */];
                if (pevs) {
                    for (var j = 0, len = pevs.length; j < len; ++j) {
                        game.events.push(this._eventConverter.toGameEvent(pevs[j]));
                    }
                }
                sceneChanged = game.tick(true, Math.floor(this._omittedTickDuration / this._frameTime));
            }
            this._omittedTickDuration = 0;
            if (game._notifyPassedAgeTable[consumedAge]) {
                // ↑ 無駄な関数コールを避けるため汚いが外部から事前チェック
                if (game.fireAgePassedIfNeeded()) {
                    // age到達通知したらドライバユーザが何かしている可能性があるので抜ける
                    frameArg.interrupt = true;
                    break;
                }
            }
            if (sceneChanged) {
                this._handleSceneChange();
                break; // シーンが変わったらローカルシーンに入っているかもしれないので一度抜ける
            }
        }
        if (this._skipping && (targetTime - this._currentTime < this._frameTime))
            this._stopSkipping();
    };
    /**
     * 非ローカルシーンの通常ケースのフレーム処理。
     * 時刻関数が与えられていない、またはリプレイでない場合に用いられる。
     */
    GameLoop.prototype._onFrameNormal = function (frameArg) {
        var sceneChanged = false;
        var game = this._game;
        // NOTE: ブラウザが長時間非アクティブ状態 (裏タブに遷移していたなど) であったとき、長時間ゲームループが呼ばれないケースがある。
        // もしその期間がスキップの閾値を超えていたら、即座にスキップに入る。
        if (!this._skipping && frameArg.deltaTime > this._skipThresholdTime) {
            this._startSkipping();
            // ただしティック待ちが無ければすぐにスキップを抜ける。
            if (this._waitingNextTick)
                this._stopSkipping();
        }
        if (this._waitingNextTick) {
            if (this._sceneLocalMode === g.LocalTickMode.InterpolateLocal)
                this._doLocalTick();
            return;
        }
        var targetAge;
        var ageGap;
        var currentAge = this._tickBuffer.currentAge;
        if (this._loopMode === LoopMode_1.default.Realtime) {
            targetAge = this._tickBuffer.knownLatestAge + 1;
            ageGap = targetAge - currentAge;
        }
        else {
            if (this._targetAge === null) {
                // targetAgeがない: ただリプレイして見ているだけの状態。1フレーム時間経過 == 1age消化。
                targetAge = null;
                ageGap = 1;
            }
            else if (this._targetAge === currentAge) {
                // targetAgeに到達した: targetAgeなし状態になる。
                targetAge = this._targetAge = null;
                ageGap = 1;
            }
            else {
                // targetAgeがあり、まだ到達していない。
                targetAge = this._targetAge;
                ageGap = targetAge - currentAge;
            }
        }
        if ((ageGap > this._jumpTryThreshold || ageGap < 0) &&
            (!this._waitingStartPoint) &&
            (this._lastRequestedStartPointAge < currentAge)) {
            // スナップショットを要求だけして続行する(スナップショットが来るまで進める限りは進む)。
            //
            // 上の条件が _lastRequestedStartPointAge を参照しているのは、スナップショットで飛んだ後もなお
            // `ageGap` が大きい場合に、延々スナップショットをリクエストし続けるのを避けるためである。
            // 実際にはageが進めば新たなスナップショットが保存されている可能性もあるので、
            // `targetAge` が変わればリクエストし続けるのが全くの無駄というわけではない。
            // が、`Realtime` で実行している場合 `targetAge` は毎フレーム変化してしまうし、
            // スナップショットがそれほど頻繁に保存されるとは思えない(すべきでもない)。ここでは割り切って抑制しておく。
            this._waitingStartPoint = true;
            this._lastRequestedStartPointAge = targetAge;
            this._amflow.getStartPoint({ frame: targetAge }, this._onGotStartPoint_bound);
        }
        if (ageGap <= 0) {
            if (ageGap === 0) {
                if (currentAge === 0) {
                    // NOTE: Manualのシーンでは age=1 のティックが長時間受信できない場合がある。(TickBuffer#addTick()が呼ばれない)
                    // そのケースでは最初のティックの受信にポーリング時間(初期値: 10秒)かかってしまうため、ここで最新ティックを要求する。
                    // (初期シーンがNonLocalであってもティックの進行によりManualのシーンに移行してしまう可能性があるため、常に最新のティックを要求している。)
                    this._tickBuffer.requestTicks();
                }
                // 既知最新ティックに追いついたので、ポーリング処理により後続ティックを要求する。
                // NOTE: Manualのシーンでは最新ティックの生成そのものが長時間起きない可能性がある。
                // (Manualでなくても、最新ティックの受信が長時間起きないことはありうる(長いローディングシーンなど))
                this._startWaitingNextTick();
            }
            if (this._sceneLocalMode === g.LocalTickMode.InterpolateLocal) {
                // ティック待ちの間、ローカルティックを(補間して)消費: 上の暫定対処のrequestTicks()より後に行うべきである点に注意。
                // ローカルティックを消費すると、ゲームスクリプトがraiseTick()する(_waitingNextTickが立つのはおかしい)可能性がある。
                this._doLocalTick();
            }
            if (this._skipping)
                this._stopSkipping();
            return;
        }
        if (!this._skipping && (ageGap > this._skipThreshold || currentAge === 0) && this._tickBuffer.hasNextTick()) {
            // ここでは常に (ageGap > 0) であることに注意。(0の時にskipに入ってもすぐ戻ってしまう)
            this._startSkipping();
        }
        var loopCount = (!this._skipping && ageGap <= this._delayIgnoreThreshold) ? 1 : Math.min(ageGap, this._skipTicksAtOnce);
        var consumedFrame = 0;
        for (; consumedFrame < loopCount; ++consumedFrame) {
            // ティック時刻確認
            var nextFrameTime = this._currentTime + this._frameTime;
            var nextTickTime = this._tickBuffer.readNextTickTime();
            if (nextTickTime != null && nextFrameTime < nextTickTime) {
                if (this._loopMode === LoopMode_1.default.Realtime || (this._omitInterpolatedTickOnReplay && this._skipping)) {
                    // リアルタイムモード(と早送り中のリプレイでティック補間しない場合)ではティック時刻を気にせず続行するが、
                    // リプレイモードに切り替えた時に矛盾しないよう時刻を補正する(当該ティック時刻まで待った扱いにする)。
                    nextFrameTime = Math.ceil(nextTickTime / this._frameTime) * this._frameTime;
                    this._omittedTickDuration += nextFrameTime - this._currentTime;
                }
                else {
                    if (this._sceneLocalMode === g.LocalTickMode.InterpolateLocal) {
                        this._doLocalTick();
                        continue;
                    }
                    break;
                }
            }
            this._currentTime = nextFrameTime;
            var tick = this._tickBuffer.consume();
            var consumedAge = -1;
            if (tick != null) {
                var plEvents = this._eventBuffer.readLocalEvents();
                if (plEvents) {
                    for (var i = 0, len = plEvents.length; i < len; ++i) {
                        game.events.push(this._eventConverter.toGameEvent(plEvents[i]));
                    }
                }
                if (typeof tick === "number") {
                    consumedAge = tick;
                    sceneChanged = game.tick(true, Math.floor(this._omittedTickDuration / this._frameTime));
                }
                else {
                    consumedAge = tick[0 /* Age */];
                    var pevs = tick[1 /* Events */];
                    if (pevs) {
                        for (var j = 0, len = pevs.length; j < len; ++j) {
                            game.events.push(this._eventConverter.toGameEvent(pevs[j]));
                        }
                    }
                    sceneChanged = game.tick(true, Math.floor(this._omittedTickDuration / this._frameTime));
                }
                this._omittedTickDuration = 0;
            }
            else {
                // 時間は経過しているが消費すべきティックが届いていない
                this._tickBuffer.requestTicks();
                this._startWaitingNextTick();
                break;
            }
            if (game._notifyPassedAgeTable[consumedAge]) {
                // ↑ 無駄な関数コールを避けるため汚いが外部から事前チェック
                if (game.fireAgePassedIfNeeded()) {
                    // age到達通知したらドライバユーザが何かしている可能性があるので抜ける
                    frameArg.interrupt = true;
                    break;
                }
            }
            if (sceneChanged) {
                this._handleSceneChange();
                break; // シーンが変わったらローカルシーンに入っているかもしれないので一度抜ける
            }
        }
        if (this._skipping && (targetAge - this._tickBuffer.currentAge < 1))
            this._stopSkipping();
    };
    GameLoop.prototype._onGotNextFrameTick = function () {
        this._consumedLatestTick = false;
        if (!this._waitingNextTick)
            return;
        if (this._loopMode === LoopMode_1.default.FrameByFrame) {
            // コマ送り実行時、Tickの受信は実行に影響しない。
            return;
        }
        this._stopWaitingNextTick();
    };
    GameLoop.prototype._onGotNoTick = function () {
        if (this._waitingNextTick)
            this._consumedLatestTick = true;
    };
    GameLoop.prototype._onGotStartPoint = function (err, startPoint) {
        this._waitingStartPoint = false;
        if (err) {
            this.errorTrigger.fire(err);
            return;
        }
        if (!this._targetTimeFunc || this._loopMode === LoopMode_1.default.Realtime) {
            var targetAge = (this._loopMode === LoopMode_1.default.Realtime) ? this._tickBuffer.knownLatestAge + 1 : this._targetAge;
            if (targetAge === null || targetAge < startPoint.frame) {
                // 要求した時点と今で目標age(targetAge)が変わっている。
                // 現在の状況では飛ぶ必要がないか、得られたStartPointでは目標ageより未来に飛んでしまう。
                return;
            }
            var currentAge = this._tickBuffer.currentAge;
            if (currentAge <= targetAge && startPoint.frame < currentAge + this._jumpIgnoreThreshold) {
                // 今の目標age(targetAge)は過去でない一方、得られたStartPointは至近未来または過去のもの → 飛ぶ価値なし。
                return;
            }
        }
        else {
            var targetTime = this._targetTimeFunc() + this._realTargetTimeOffset;
            if (targetTime < startPoint.timestamp) {
                // 要求した時点と今で目標時刻(targetTime)が変わっている。得られたStartPointでは目標時刻より未来に飛んでしまう。
                return;
            }
            var currentTime = this._currentTime;
            if (currentTime <= targetTime && startPoint.timestamp < currentTime + (this._jumpIgnoreThreshold * this._frameTime)) {
                // 今の目標時刻(targetTime)は過去でない一方、得られたStartPointは至近未来または過去のもの → 飛ぶ価値なし。
                return;
            }
        }
        // リセットから `g.Game#_start()` まで(エントリポイント実行まで)の間、processEvents() は起こらないようにする。
        // すなわちこれ以降 `_onGameStarted()` までの間 EventBuffer からイベントは取得できない。しかしそもそもこの状態では
        // イベントを処理するシーンがいない = 非ローカルティックは生成されない = 非ローカルティック生成時にのみ行われるイベントの取得もない。
        this._clock.frameTrigger.remove(this._onEventsProcessed, this);
        if (this._skipping)
            this._stopSkipping();
        this._tickBuffer.setCurrentAge(startPoint.frame);
        this._currentTime = startPoint.timestamp || startPoint.data.timestamp || 0; // data.timestamp は後方互換性のために存在。現在は使っていない。
        this._waitingNextTick = false; // 現在ageを変えた後、さらに後続のTickが足りないかどうかは_onFrameで判断する。
        this._consumedLatestTick = false; // 同上。
        this._lastRequestedStartPointAge = -1; // 現在ageを変えた時はリセットしておく(場合によっては不要だが、安全のため)。
        this._lastRequestedStartPointTime = -1; // 同上。
        this._omittedTickDuration = 0;
        this._game._restartWithSnapshot(startPoint);
        this._handleSceneChange();
    };
    GameLoop.prototype._onGameStarted = function () {
        // 必ず先頭に挿入することで、同じClockを参照する `TickGenerator` のティック生成などに毎フレーム先行してイベントフィルタを適用する。
        // 全体的に `this._clock` のhandle順は動作順に直結するので注意が必要。
        this._clock.frameTrigger.add({ index: 0, owner: this, func: this._onEventsProcessed });
    };
    GameLoop.prototype._onEventsProcessed = function () {
        this._eventBuffer.processEvents(this._sceneLocalMode === g.LocalTickMode.FullLocal);
    };
    GameLoop.prototype._setLoopRenderMode = function (mode) {
        if (mode === this._loopRenderMode)
            return;
        this._loopRenderMode = mode;
        switch (mode) {
            case LoopRenderMode_1.default.AfterRawFrame:
                this._clock.rawFrameTrigger.add(this._renderOnRawFrame, this);
                break;
            case LoopRenderMode_1.default.None:
                this._clock.rawFrameTrigger.remove(this._renderOnRawFrame, this);
                break;
            default:
                this.errorTrigger.fire(new Error("GameLoop#_setLoopRenderMode: unknown mode: " + mode));
                break;
        }
    };
    GameLoop.prototype._renderOnRawFrame = function () {
        var game = this._game;
        if (game.modified && game.scenes.length > 0) {
            game.render();
        }
    };
    GameLoop.prototype._onGameRaiseEvent = function (e) {
        var pev = this._eventConverter.toPlaylogEvent(e);
        this._eventBuffer.onEvent(pev);
    };
    GameLoop.prototype._onGameRaiseTick = function (es) {
        if (this._executionMode !== ExecutionMode_1.default.Active)
            return;
        // TODO: イベントフィルタの中で呼ばれるとおかしくなる(フィルタ中のイベントがtickに乗らない)。
        if (es) {
            for (var i = 0; i < es.length; ++i)
                this._eventBuffer.addEventDirect(this._eventConverter.toPlaylogEvent(es[i]));
        }
        this._tickController.forceGenerateTick();
    };
    GameLoop.prototype._onGameOperationPluginOperated = function (op) {
        var pev = this._eventConverter.makePlaylogOperationEvent(op);
        this._eventBuffer.onEvent(pev);
    };
    GameLoop.prototype._onPollingTick = function () {
        // この関数が呼ばれる時、 `this._waitingNextTick` は必ず真である。
        // TODO: rawFrameTriggerのfire時に前回呼び出し時からの経過時間を渡せばnew Dateする必要はなくなる。
        var time = Date.now();
        if (time - this._lastPollingTickTime > this._pollingTickThreshold) {
            this._lastPollingTickTime = time;
            this._tickBuffer.requestTicks();
        }
    };
    GameLoop.prototype._startWaitingNextTick = function () {
        this._waitingNextTick = true;
        // TODO: Active時はポーリングしない (要 Active/Passive 切り替えの対応)
        this._clock.rawFrameTrigger.add(this._onPollingTick, this);
        this._lastPollingTickTime = Date.now();
        if (this._skipping)
            this._stopSkipping();
    };
    GameLoop.prototype._stopWaitingNextTick = function () {
        this._waitingNextTick = false;
        this._clock.rawFrameTrigger.remove(this._onPollingTick, this);
    };
    return GameLoop;
}());
exports.GameLoop = GameLoop;

},{"./Clock":5,"./EventConverter":7,"./ExecutionMode":9,"./LoopMode":14,"./LoopRenderMode":15,"./ProfilerClock":18,"./TickController":21,"./constants":26,"@akashic/akashic-engine":1}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinResolver = exports.JoinLeaveRequest = void 0;
var g = require("@akashic/akashic-engine");
var JoinLeaveRequest = /** @class */ (function () {
    function JoinLeaveRequest(pev, joinResolver, amflow, keys) {
        this.joinResolver = joinResolver;
        this.pev = pev;
        if (pev[0 /* Code */] === 0 /* Join */ && keys) {
            this.resolved = false;
            amflow.getStorageData(keys, this._onGotStorageData.bind(this));
        }
        else {
            this.resolved = true;
        }
    }
    JoinLeaveRequest.prototype._onGotStorageData = function (err, sds) {
        this.resolved = true;
        if (err) {
            this.joinResolver.errorTrigger.fire(err);
            return;
        }
        this.pev[4 /* StorageData */] = sds;
    };
    return JoinLeaveRequest;
}());
exports.JoinLeaveRequest = JoinLeaveRequest;
var JoinResolver = /** @class */ (function () {
    function JoinResolver(param) {
        this.errorTrigger = new g.Trigger();
        if (param.errorHandler)
            this.errorTrigger.add(param.errorHandler, param.errorHandlerOwner);
        this._amflow = param.amflow;
        this._keysForJoin = null;
        this._requested = [];
    }
    JoinResolver.prototype.request = function (pev) {
        this._requested.push(new JoinLeaveRequest(pev, this, this._amflow, this._keysForJoin));
    };
    JoinResolver.prototype.readResolved = function () {
        var len = this._requested.length;
        if (len === 0 || !this._requested[0].resolved)
            return null;
        var ret = [];
        for (var i = 0; i < len; ++i) {
            var req = this._requested[i];
            if (!req.resolved)
                break;
            ret.push(req.pev);
        }
        this._requested.splice(0, i);
        return ret;
    };
    JoinResolver.prototype.setRequestValuesForJoin = function (keys) {
        this._keysForJoin = keys;
    };
    return JoinResolver;
}());
exports.JoinResolver = JoinResolver;

},{"@akashic/akashic-engine":1}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * `GameLoop` のループ制御のモード。
 * `GameLoop` は、この値に応じて `g.Game#tick()` の呼び出し方法を変える。
 */
var LoopMode;
(function (LoopMode) {
    /**
     * 最新フレームに最大限追いつくモード。
     *
     * Passiveである場合、自分の現在フレームが取得済みの最新フレームから大きく遅れているなら、
     * 早送りやスナップショットによるジャンプを行う。
     *
     * ローカルティック補間シーンにおいては、ティックの受信を待っている間ティック補間を行う。すなわち:
     *  * 次ティックがある場合: ローカルティックを生成せず、ただちに次ティックを消化する(補間しない)
     *  * 次ティックがない場合: ローカルティックを生成して消化する(補間する)
     */
    LoopMode[LoopMode["Realtime"] = 0] = "Realtime";
    /**
     * 追いつこうとするフレームを自分で制御するモード。
     *
     * `Realtime` と同様早送りやスナップショットによるジャンプを行うが、
     * その基準フレームとして `LoopConfiguration#targetAge` (を保持する `GameLoop#_targetAge`) を使う。
     * 早送りやスナップショットによるジャンプを行う。
     *
     * ローカルティック補間シーンにおいては、ティックのタイムスタンプ情報にできるだけ忠実にティック補間を行う。すなわち:
     *  * 次ティックがある場合: 現在時刻が次ティックのタイムスタンプか目標時刻に至るまで、ローカルティックを生成して消化する(補間する)。
     *  * 次ティックがない場合: 何もしない(補間しない)。
     * ただし LoopConfiguration#omitInterpolatedTickOnReplay が真の場合は、次の規則が追加で適用される。
     *  * 次ティックがある場合、スキップ中ならば: ローカルティックを生成せず、ただちに次ティックを消化する(補間しない; Realtimeと同じになる)
     *  * 次ティックがない場合、目標時刻に到達していなければ: ローカルティックを生成して消化する(補間する; Realtimeと同じになる)
     */
    LoopMode[LoopMode["Replay"] = 1] = "Replay";
    /**
     * 正しく使っていない。削除する予定。
     *
     * コマ送りモード。
     * `GameLoop#step()` 呼び出し時に1フレーム進む。それ以外の方法では進まない。
     * 早送りやスナップショットによるジャンプは行わない。
     */
    LoopMode[LoopMode["FrameByFrame"] = 2] = "FrameByFrame";
})(LoopMode || (LoopMode = {}));
exports.default = LoopMode;

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * `GameLoop` が描画を行う基準。
 */
var LoopRenderMode;
(function (LoopRenderMode) {
    /**
     * 毎raw frame後に描画する。
     * raw frameの詳細についてはClock.tsのコメントを参照。
     */
    LoopRenderMode[LoopRenderMode["AfterRawFrame"] = 0] = "AfterRawFrame";
    /**
     * 描画をまったく行わない。
     */
    LoopRenderMode[LoopRenderMode["None"] = 1] = "None";
})(LoopRenderMode || (LoopRenderMode = {}));
exports.default = LoopRenderMode;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdiUtil = void 0;
var es6_promise_1 = require("es6-promise");
var g = require("@akashic/akashic-engine");
var PdiUtil;
(function (PdiUtil) {
    /**
     * 与えられた `Platform` の `loadGameConfiguration()` をラップした、`GameConfiguration` 読み込み関数を作成して返す。
     *
     * 戻り値の関数は、次の点で `Platform#loadGameConfiguration()` と異なる。
     * * "definitions" フィールドを解決する (再帰的に読み込みを行い、_mergeGameConfiguration() でカスケード解決する)
     * * "assetBase" を使って `GameConfiguration` 内のアセットのパスを絶対パスに変換する
     * * "configurationBase" を使って "definitions" フィールド内のパスを絶対パスに変換する
     *
     * @param pf ラップする `loadGameConfiguration()` を持つ `Platform`
     */
    function makeLoadConfigurationFunc(pf) {
        function loadResolvedConfiguration(url, assetBase, configurationBase, callback) {
            pf.loadGameConfiguration(url, function (err, conf) {
                if (err) {
                    callback(err, null);
                    return;
                }
                try {
                    conf = PdiUtil._resolveConfigurationBasePath(conf, ((assetBase != null) ? assetBase : g.PathUtil.resolveDirname(url)));
                }
                catch (e) {
                    callback(e, null);
                    return;
                }
                if (!conf.definitions) {
                    callback(null, conf);
                    return;
                }
                var defs = conf.definitions.map(function (def) {
                    if (typeof def === "string") {
                        var resolvedUrl = configurationBase != null ? g.PathUtil.resolvePath(configurationBase, def) : def;
                        return promisifiedLoad(resolvedUrl, undefined, configurationBase);
                    }
                    else {
                        var resolvedUrl = configurationBase != null ? g.PathUtil.resolvePath(configurationBase, def.url) : def.url;
                        return promisifiedLoad(resolvedUrl, def.basePath, configurationBase);
                    }
                });
                es6_promise_1.Promise.all(defs)
                    .then(function (confs) { return callback(null, confs.reduce(PdiUtil._mergeGameConfiguration)); })
                    .catch(function (e) { return callback(e, null); });
            });
        }
        function promisifiedLoad(url, assetBase, configurationBase) {
            return new es6_promise_1.Promise(function (resolve, reject) {
                loadResolvedConfiguration(url, assetBase, configurationBase, function (err, conf) {
                    err ? reject(err) : resolve(conf);
                });
            });
        }
        return loadResolvedConfiguration;
    }
    PdiUtil.makeLoadConfigurationFunc = makeLoadConfigurationFunc;
    /**
     * 与えられた `GameConfiguration` のパス(相対パスになっている)を絶対パスに変える。
     * @param configuration 対象の `GameConfiguration`
     * @param assetBase アセットの相対パスの基準となるパス
     */
    function _resolveConfigurationBasePath(configuration, assetBase) {
        function resolvePath(base, path) {
            var ret = g.PathUtil.resolvePath(base, path);
            if (ret.indexOf(base) !== 0)
                throw g.ExceptionFactory.createAssertionError("PdiUtil._resolveConfigurationBasePath: invalid path: " + path);
            return ret;
        }
        var assets = configuration.assets;
        if (assets instanceof Object) {
            for (var p in assets) {
                if (!assets.hasOwnProperty(p))
                    continue;
                if ("path" in assets[p]) {
                    assets[p].virtualPath = assets[p].virtualPath || assets[p].path;
                    assets[p].path = resolvePath(assetBase, assets[p].path);
                }
            }
        }
        if (configuration.globalScripts) {
            configuration.globalScripts.forEach(function (path) {
                if (assets.hasOwnProperty(path))
                    throw g.ExceptionFactory.createAssertionError("PdiUtil._resolveConfigurationBasePath: asset ID already exists: " + path);
                assets[path] = {
                    type: /\.json$/i.test(path) ? "text" : "script",
                    virtualPath: path,
                    path: resolvePath(assetBase, path),
                    global: true
                };
            });
            delete configuration.globalScripts;
        }
        return configuration;
    }
    PdiUtil._resolveConfigurationBasePath = _resolveConfigurationBasePath;
    /**
     * 与えられたオブジェクト二つを「マージ」する。
     * ここでマージとは、オブジェクトのフィールドをイテレートし、
     * プリミティブ値であれば上書き、配列であればconcat、オブジェクトであれば再帰的にマージする処理である。
     *
     * @param target マージされるオブジェクト。この値は破壊される
     * @param source マージするオブジェクト
     */
    function _mergeObject(target, source) {
        var ks = Object.keys(source);
        for (var i = 0, len = ks.length; i < len; ++i) {
            var k = ks[i];
            var sourceVal = source[k];
            var sourceValType = typeof sourceVal;
            var targetValType = typeof target[k];
            if (sourceValType !== targetValType) {
                target[k] = sourceVal;
                continue;
            }
            switch (typeof sourceVal) {
                case "string":
                case "number":
                case "boolean":
                    target[k] = sourceVal;
                    break;
                case "object":
                    if (sourceVal == null) {
                        target[k] = sourceVal;
                    }
                    else if (Array.isArray(sourceVal)) {
                        target[k] = target[k].concat(sourceVal);
                    }
                    else {
                        PdiUtil._mergeObject(target[k], sourceVal);
                    }
                    break;
                default:
                    throw new Error("PdiUtil._mergeObject(): unknown type");
            }
        }
        return target;
    }
    PdiUtil._mergeObject = _mergeObject;
    function _mergeGameConfiguration(target, source) {
        return PdiUtil._mergeObject(target, source);
    }
    PdiUtil._mergeGameConfiguration = _mergeGameConfiguration;
})(PdiUtil = exports.PdiUtil || (exports.PdiUtil = {}));

},{"@akashic/akashic-engine":1,"es6-promise":83}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointEventResolver = void 0;
/**
 * pdi.PointEventからg.Eventへの変換機構。
 *
 * ほぼ座標しか持たないpdi.PointEventに対して、g.Point(Down|Move|Up)Eventはその座標にあるエンティティや、
 * (g.Point(Move|Up)Eventの場合)g.PointDownEventからの座標の差分を持っている。
 * それらの足りない情報を管理・追加して、pdi.PointEventをg.Eventに変換するクラス。
 * PDI実装はpointDown()なしでpointMove()を呼び出してくることも考えられるため、
 * Down -> Move -> Up の流れを保証する機能も持つ。
 */
var PointEventResolver = /** @class */ (function () {
    function PointEventResolver(param) {
        this._game = param.game;
        this._pointEventMap = {};
    }
    PointEventResolver.prototype.pointDown = function (e) {
        var player = this._game.player;
        var source = this._game.findPointSource(e.offset);
        var point = source.point ? source.point : e.offset;
        var targetId = source.target ? source.target.id : null;
        this._pointEventMap[e.identifier] = {
            targetId: targetId,
            local: source.local,
            point: point,
            start: { x: e.offset.x, y: e.offset.y },
            prev: { x: e.offset.x, y: e.offset.y }
        };
        // NOTE: 優先度は機械的にJoinedをつけておく。Joinしていない限りPointDownEventなどはリジェクトされる。
        var ret = [
            33 /* PointDown */,
            2 /* Joined */,
            player.id,
            e.identifier,
            point.x,
            point.y,
            targetId // 6?: エンティティID
        ];
        if (source.local)
            ret.push(source.local); // 7?: ローカル
        return ret;
    };
    PointEventResolver.prototype.pointMove = function (e) {
        var player = this._game.player;
        var holder = this._pointEventMap[e.identifier];
        if (!holder)
            return null;
        var prev = { x: 0, y: 0 };
        var start = { x: 0, y: 0 };
        this._pointMoveAndUp(holder, e.offset, prev, start);
        var ret = [
            34 /* PointMove */,
            2 /* Joined */,
            player.id,
            e.identifier,
            holder.point.x,
            holder.point.y,
            start.x,
            start.y,
            prev.x,
            prev.y,
            holder.targetId // 10?: エンティティID
        ];
        if (holder.local)
            ret.push(holder.local); // 11?: ローカル
        return ret;
    };
    PointEventResolver.prototype.pointUp = function (e) {
        var player = this._game.player;
        var holder = this._pointEventMap[e.identifier];
        if (!holder)
            return null;
        var prev = { x: 0, y: 0 };
        var start = { x: 0, y: 0 };
        this._pointMoveAndUp(holder, e.offset, prev, start);
        delete this._pointEventMap[e.identifier];
        var ret = [
            35 /* PointUp */,
            2 /* Joined */,
            player.id,
            e.identifier,
            holder.point.x,
            holder.point.y,
            start.x,
            start.y,
            prev.x,
            prev.y,
            holder.targetId // 10?: エンティティID
        ];
        if (holder.local)
            ret.push(holder.local); // 11?: ローカル
        return ret;
    };
    PointEventResolver.prototype._pointMoveAndUp = function (holder, offset, prevDelta, startDelta) {
        startDelta.x = offset.x - holder.start.x;
        startDelta.y = offset.y - holder.start.y;
        prevDelta.x = offset.x - holder.prev.x;
        prevDelta.y = offset.y - holder.prev.y;
        holder.prev.x = offset.x;
        holder.prev.y = offset.y;
    };
    return PointEventResolver;
}());
exports.PointEventResolver = PointEventResolver;

},{}],18:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilerClock = void 0;
var Clock_1 = require("./Clock");
/**
 * プロファイラーを有するクロック。
 *
 * note: _onLooperCall()のみをオーバーライドし、 `this._profiler.~~` を追加しただけとなっています。
 */
var ProfilerClock = /** @class */ (function (_super) {
    __extends(ProfilerClock, _super);
    function ProfilerClock(param) {
        var _this = _super.call(this, param) || this;
        _this._profiler = param.profiler;
        return _this;
    }
    ProfilerClock.prototype._onLooperCall = function (deltaTime) {
        var rawDeltaTime = deltaTime;
        if (deltaTime <= 0) {
            // 時間が止まっているか巻き戻っている。初回呼び出しか、あるいは何かがおかしい。時間経過0と見なす。
            return this._waitTime - this._totalDeltaTime;
        }
        if (deltaTime > this._deltaTimeBrokenThreshold) {
            // 間隔が長すぎる。何かがおかしい。時間経過を1フレーム分とみなす。
            deltaTime = this._waitTime;
        }
        var totalDeltaTime = this._totalDeltaTime;
        totalDeltaTime += deltaTime;
        if (totalDeltaTime <= this._skipFrameWaitTime) {
            // 1フレーム分消化するほどの時間が経っていない。
            this._totalDeltaTime = totalDeltaTime;
            return this._waitTime - totalDeltaTime;
        }
        this._profiler.timeEnd(1 /* RawFrameInterval */);
        this._profiler.time(1 /* RawFrameInterval */);
        var frameCount = (totalDeltaTime < this._waitTimeDoubled) ? 1
            : (totalDeltaTime > this._waitTimeMax) ? this._realMaxFramePerOnce
                : (totalDeltaTime / this._waitTime) | 0;
        var fc = frameCount;
        var arg = {
            deltaTime: rawDeltaTime,
            interrupt: false
        };
        this._profiler.setValue(0 /* SkippedFrameCount */, fc - 1);
        while (fc > 0 && this.running && !arg.interrupt) {
            --fc;
            this._profiler.time(2 /* FrameTime */);
            this.frameTrigger.fire(arg);
            this._profiler.timeEnd(2 /* FrameTime */);
            arg.deltaTime = 0; // 同ループによる2度目以降の呼び出しは差分を0とみなす。
        }
        totalDeltaTime -= ((frameCount - fc) * this._waitTime);
        this._profiler.time(3 /* RenderingTime */);
        this.rawFrameTrigger.fire();
        this._profiler.timeEnd(3 /* RenderingTime */);
        this._totalDeltaTime = totalDeltaTime;
        this._profiler.flush();
        return this._waitTime - totalDeltaTime;
    };
    return ProfilerClock;
}(Clock_1.Clock));
exports.ProfilerClock = ProfilerClock;

},{"./Clock":5}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageResolver = void 0;
var g = require("@akashic/akashic-engine");
var ExecutionMode_1 = require("./ExecutionMode");
/**
 * ストレージの読み書きを担うクラス。
 * Gameのストレージアクセスはすべてこのクラスが一次受けする(一次受けする関数を提供する)。
 *
 * ただし読み込みに関しては、実際にはこのクラスでは行わない。
 * Activeモードの場合、ストレージから読み込んだデータはTickに乗せる必要がある。
 * このクラスはTickGeneratorにリクエストを通知し、読み込みはTickGeneratorが解決する。
 * Passiveモードやスナップショットからの復元の場合、ストレージのデータは `TickBuffer` で受信したTickから得られる。
 * このクラスは、読み込みリクエストを得られたストレージデータと付き合わせて完了を通知する役割を持つ。
 */
var StorageResolver = /** @class */ (function () {
    function StorageResolver(param) {
        this.errorTrigger = new g.Trigger();
        if (param.errorHandler)
            this.errorTrigger.add(param.errorHandler, param.errorHandlerOwner);
        this.getStorageFunc = this._getStorage.bind(this);
        this.putStorageFunc = this._putStorage.bind(this);
        this.requestValuesForJoinFunc = this._requestValuesForJoin.bind(this);
        this._game = param.game;
        this._amflow = param.amflow;
        this._tickGenerator = param.tickGenerator;
        this._tickBuffer = param.tickBuffer;
        this._executionMode = null; // 後続のsetExecutionMode()で設定する。
        this.setExecutionMode(param.executionMode);
        this._unresolvedLoaders = {};
        this._unresolvedStorages = {};
        this._onStoragePut_bound = this._onStoragePut.bind(this);
    }
    /**
     * ExecutionModeを変更する。
     */
    StorageResolver.prototype.setExecutionMode = function (executionMode) {
        if (this._executionMode === executionMode)
            return;
        this._executionMode = executionMode;
        var tickBuf = this._tickBuffer;
        var tickGen = this._tickGenerator;
        if (executionMode === ExecutionMode_1.default.Active) {
            tickBuf.gotStorageTrigger.remove(this._onGotStorageOnTick, this);
            tickGen.gotStorageTrigger.add(this._onGotStorageOnTick, this);
        }
        else {
            tickGen.gotStorageTrigger.remove(this._onGotStorageOnTick, this);
            tickBuf.gotStorageTrigger.add(this._onGotStorageOnTick, this);
        }
    };
    StorageResolver.prototype._onGotStorageOnTick = function (storageOnTick) {
        var resolvingAge = storageOnTick.age;
        var storageData = storageOnTick.storageData;
        var loader = this._unresolvedLoaders[resolvingAge];
        if (!loader) {
            this._unresolvedStorages[resolvingAge] = storageData;
            return;
        }
        delete this._unresolvedLoaders[resolvingAge];
        var serialization = resolvingAge;
        var values = storageData.map(function (d) { return d.values; });
        loader._onLoaded(values, serialization);
    };
    StorageResolver.prototype._getStorage = function (keys, loader, ser) {
        var resolvingAge;
        if (ser != null) {
            // akashic-engineにとって `ser' の型は単にanyである。実態は実装(game-driver)に委ねられている。
            // game-driverはシリアリゼーションとして「ストレージが含められていたTickのage」を採用する。
            resolvingAge = ser;
            this._tickBuffer.requestTicks(resolvingAge, 1); // request しておけば後は _onGotStorageOnTick() に渡ってくる
        }
        else {
            if (this._executionMode === ExecutionMode_1.default.Active) {
                resolvingAge = this._tickGenerator.requestStorageTick(keys);
            }
            else {
                resolvingAge = this._game.age; // TODO: gameを参照せずともageがとれるようにすべき。
                this._tickBuffer.requestTicks(resolvingAge, 1); // request しておけば後は _onGotStorageOnTick() に渡ってくる
            }
        }
        var sd = this._unresolvedStorages[resolvingAge];
        if (!sd) {
            this._unresolvedLoaders[resolvingAge] = loader;
            return;
        }
        delete this._unresolvedStorages[resolvingAge];
        var serialization = resolvingAge;
        var values = sd.map(function (d) { return d.values; });
        loader._onLoaded(values, serialization);
    };
    StorageResolver.prototype._putStorage = function (key, value, option) {
        if (this._executionMode === ExecutionMode_1.default.Active) {
            this._amflow.putStorageData(key, value, option, this._onStoragePut_bound);
        }
    };
    StorageResolver.prototype._requestValuesForJoin = function (keys) {
        this._tickGenerator.setRequestValuesForJoin(keys);
    };
    StorageResolver.prototype._onStoragePut = function (err) {
        if (err)
            this.errorTrigger.fire(err);
    };
    return StorageResolver;
}());
exports.StorageResolver = StorageResolver;

},{"./ExecutionMode":9,"@akashic/akashic-engine":1}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TickBuffer = void 0;
var g = require("@akashic/akashic-engine");
var ExecutionMode_1 = require("./ExecutionMode");
/**
 * AMFlowから流れ込むTickを蓄積するバッファ。
 *
 * 主に以下を行う。
 * * 受信済みのTickの管理
 * * 現在age・既知の最新age・直近の欠けているTickの管理
 * * 足りなそうなTickの先行リクエスト
 * * 処理済みTickの破棄
 */
var TickBuffer = /** @class */ (function () {
    function TickBuffer(param) {
        this.currentAge = 0;
        this.knownLatestAge = -1;
        this.gotNextTickTrigger = new g.Trigger();
        this.gotNoTickTrigger = new g.Trigger();
        this.gotStorageTrigger = new g.Trigger();
        this._amflow = param.amflow;
        this._prefetchThreshold = param.prefetchThreshold || TickBuffer.DEFAULT_PREFETCH_THRESHOLD;
        this._sizeRequestOnce = param.sizeRequestOnce || TickBuffer.DEFAULT_SIZE_REQUEST_ONCE;
        this._executionMode = param.executionMode;
        this._startedAt = param.startedAt || 0;
        this._oldTimestampThreshold = (param.startedAt != null) ? (param.startedAt - (86400 * 1000 * 10)) : 0; // 数字は適当な値(10日分)。
        this._receiving = false;
        this._tickRanges = [];
        this._nearestAbsentAge = this.currentAge;
        this._nextTickTimeCache = null;
        this._addTick_bound = this.addTick.bind(this);
        this._onTicks_bound = this._onTicks.bind(this);
    }
    TickBuffer.prototype.start = function () {
        this._receiving = true;
        this._updateAmflowReceiveState();
    };
    TickBuffer.prototype.stop = function () {
        this._receiving = false;
        this._updateAmflowReceiveState();
    };
    TickBuffer.prototype.setExecutionMode = function (execMode) {
        // TODO: getTickList()中にauthenticate()しなおした場合の挙動確認
        if (this._executionMode === execMode)
            return;
        this._dropUntil(this.knownLatestAge + 1); // 既存データは捨てる(特にPassive->Activeで既存Tickを上書きする必要がありうる)
        this.knownLatestAge = this.currentAge;
        this._nextTickTimeCache = null;
        this._nearestAbsentAge = this.currentAge;
        this._executionMode = execMode;
        this._updateAmflowReceiveState();
    };
    TickBuffer.prototype.setCurrentAge = function (age) {
        this._dropUntil(age);
        this._nextTickTimeCache = null;
        this.currentAge = age;
        this._nearestAbsentAge = this._findNearestAbscentAge(age);
    };
    TickBuffer.prototype.hasNextTick = function () {
        return this.currentAge !== this._nearestAbsentAge;
    };
    TickBuffer.prototype.consume = function () {
        if (this.currentAge === this._nearestAbsentAge)
            return null;
        var age = this.currentAge;
        var range = this._tickRanges[0];
        if (age === range.start) {
            this._nextTickTimeCache = null;
            ++this.currentAge;
            ++range.start;
            if (age + this._prefetchThreshold === this._nearestAbsentAge) {
                this.requestTicks(this._nearestAbsentAge, this._sizeRequestOnce);
            }
            if (range.start === range.end)
                this._tickRanges.shift();
            return (range.ticks.length > 0 && range.ticks[0][0 /* Age */] === age) ? range.ticks.shift() : age;
        }
        // range.start < age。外部から前に追加された場合。破棄してリトライする。
        this._dropUntil(this.currentAge);
        return this.consume();
    };
    TickBuffer.prototype.readNextTickTime = function () {
        if (this._nextTickTimeCache != null)
            return this._nextTickTimeCache;
        if (this.currentAge === this._nearestAbsentAge)
            return null;
        var age = this.currentAge;
        var range = this._tickRanges[0];
        if (age === range.start) {
            if (range.ticks.length === 0)
                return null;
            var tick = range.ticks[0];
            if (tick[0 /* Age */] !== age)
                return null;
            var pevs = tick[1 /* Events */];
            if (!pevs)
                return null;
            for (var i = 0; i < pevs.length; ++i) {
                if (pevs[i][0 /* Code */] === 2 /* Timestamp */) {
                    var nextTickTime = pevs[i][3 /* Timestamp */];
                    // 暫定処理: 旧仕様(相対時刻)用ワークアラウンド。小さすぎる時刻は相対とみなす
                    if (nextTickTime < this._oldTimestampThreshold)
                        nextTickTime += this._startedAt;
                    this._nextTickTimeCache = nextTickTime;
                    return nextTickTime;
                }
            }
            return null;
        }
        // range.start < age。外部から前に追加された場合。破棄してリトライする。
        this._dropUntil(this.currentAge);
        return this.readNextTickTime();
    };
    TickBuffer.prototype.requestTicks = function (from, len) {
        if (from === void 0) { from = this.currentAge; }
        if (len === void 0) { len = this._sizeRequestOnce; }
        if (this._executionMode !== ExecutionMode_1.default.Passive)
            return;
        this._amflow.getTickList(from, from + len, this._onTicks_bound);
    };
    TickBuffer.prototype.addTick = function (tick) {
        var age = tick[0 /* Age */];
        var gotNext = (this.currentAge === age) && (this._nearestAbsentAge === age);
        if (this.knownLatestAge < age) {
            this.knownLatestAge = age;
        }
        if (tick[2 /* StorageData */]) {
            this.gotStorageTrigger.fire({ age: tick[0 /* Age */], storageData: tick[2 /* StorageData */] });
        }
        var i = this._tickRanges.length - 1;
        for (; i >= 0; --i) {
            var range = this._tickRanges[i];
            if (age >= range.start)
                break;
        }
        var nextRange = this._tickRanges[i + 1];
        if (i < 0) {
            // 既知のどの tick よりも過去、または単に既知の tick がない。
            // NOTE: _tickRanges[0]を過去方向に拡張できるかもしれないが、
            //       addTickはほぼ最新フレームしか受信しないので気にせず新たにTickRangeを作る。
            this._tickRanges.unshift(this._createTickRangeFromTick(tick));
        }
        else {
            var range = this._tickRanges[i];
            if (age === range.end) {
                // 直近の TickRange のすぐ後に続く tick だった。
                ++range.end;
                if (tick[1 /* Events */]) {
                    range.ticks.push(tick);
                }
            }
            else if (age > range.end) {
                // 既存 TickList に続かない tick だった。新規に TickList を作って挿入
                this._tickRanges.splice(i + 1, 0, this._createTickRangeFromTick(tick));
            }
            else {
                // (start <= age < end) 既存 tick と重複している。何もしない。
            }
        }
        if (this._nearestAbsentAge === age) {
            ++this._nearestAbsentAge;
            if (nextRange && this._nearestAbsentAge === nextRange.start) {
                // 直近の欠けているageを追加したら前後のrangeが繋がってしまった。諦めて_nearestAbsentAgeを求め直す。
                this._nearestAbsentAge = this._findNearestAbscentAge(this._nearestAbsentAge);
            }
        }
        if (gotNext)
            this.gotNextTickTrigger.fire();
    };
    TickBuffer.prototype.addTickList = function (tickList) {
        var start = tickList[0 /* From */];
        var end = tickList[1 /* To */] + 1;
        var ticks = tickList[2 /* TicksWithEvents */];
        var origStart = start;
        var origEnd = end;
        if (this.knownLatestAge < end - 1) {
            this.knownLatestAge = end - 1;
        }
        // 今回挿入分の開始ageよりも「後」に開始される最初のrangeを探す
        var i = 0;
        var len = this._tickRanges.length;
        for (i = 0; i < len; ++i) {
            var range = this._tickRanges[i];
            if (start < range.start)
                break;
        }
        var insertPoint = i;
        // 左側が重複しうるrangeを探して重複を除く
        if (i > 0) {
            // 左側が重複しうるrangeは、今回挿入分の開始ageの直前に始まるもの
            --i;
            var leftEndAge = this._tickRanges[i].end;
            if (start < leftEndAge)
                start = leftEndAge;
        }
        // 右側で重複しうるrangeを探して重複を除く
        for (; i < len; ++i) {
            var range = this._tickRanges[i];
            if (end <= range.end)
                break;
        }
        if (i < len) {
            var rightStartAge = this._tickRanges[i].start;
            if (end > rightStartAge)
                end = rightStartAge;
        }
        if (start >= end) {
            // 今回挿入分はすべて重複だった。何もせずreturn
            return { start: start, end: start, ticks: [] };
        }
        if (!ticks)
            ticks = [];
        if (origStart !== start || origEnd !== end) {
            ticks = ticks.filter(function (tick) {
                var age = tick[0 /* Age */];
                return start <= age && age < end;
            });
        }
        for (var j = 0; j < ticks.length; ++j) {
            var tick = ticks[j];
            if (tick[2 /* StorageData */])
                this.gotStorageTrigger.fire({ age: tick[0 /* Age */], storageData: tick[2 /* StorageData */] });
        }
        var tickRange = { start: start, end: end, ticks: ticks };
        var delLen = Math.max(0, i - insertPoint);
        this._tickRanges.splice(insertPoint, delLen, tickRange);
        if (start <= this._nearestAbsentAge && this._nearestAbsentAge < end) {
            this._nearestAbsentAge = this._findNearestAbscentAge(this._nearestAbsentAge);
        }
        return tickRange;
    };
    TickBuffer.prototype._updateAmflowReceiveState = function () {
        if (this._receiving && this._executionMode === ExecutionMode_1.default.Passive) {
            this._amflow.onTick(this._addTick_bound);
        }
        else {
            this._amflow.offTick(this._addTick_bound);
        }
    };
    TickBuffer.prototype._onTicks = function (err, ticks) {
        if (err)
            throw new Error();
        if (!ticks) {
            this.gotNoTickTrigger.fire();
            return;
        }
        var mayGotNext = (this.currentAge === this._nearestAbsentAge);
        var inserted = this.addTickList(ticks);
        if (mayGotNext && (inserted.start <= this.currentAge && this.currentAge < inserted.end)) {
            this.gotNextTickTrigger.fire();
        }
        if (!inserted.ticks.length) {
            this.gotNoTickTrigger.fire();
        }
    };
    TickBuffer.prototype._findNearestAbscentAge = function (age) {
        var i = 0, len = this._tickRanges.length;
        for (; i < len; ++i) {
            if (age <= this._tickRanges[i].end)
                break;
        }
        for (; i < len; ++i) {
            var range = this._tickRanges[i];
            if (age < range.start)
                break;
            age = range.end;
        }
        return age;
    };
    TickBuffer.prototype._dropUntil = function (age) {
        // [start,end) が全部 age 以前のものを削除
        var i;
        for (i = 0; i < this._tickRanges.length; ++i) {
            if (age < this._tickRanges[i].end)
                break;
        }
        this._tickRanges = this._tickRanges.slice(i);
        if (this._tickRanges.length === 0)
            return;
        // start を書き換えることで、[start, age) の範囲を削除
        var range = this._tickRanges[0];
        if (age < range.start)
            return;
        range.start = age;
        for (i = 0; i < range.ticks.length; ++i) {
            if (age <= range.ticks[i][0 /* Age */])
                break;
        }
        range.ticks = range.ticks.slice(i);
    };
    TickBuffer.prototype._createTickRangeFromTick = function (tick) {
        var age = tick[0 /* Age */];
        var range = {
            start: age,
            end: age + 1,
            ticks: []
        };
        if (tick[1 /* Events */]) {
            range.ticks.push(tick);
        }
        return range;
    };
    TickBuffer.DEFAULT_PREFETCH_THRESHOLD = 30 * 60; // 数字は適当に30FPSで1分間分。30FPS * 60秒。
    TickBuffer.DEFAULT_SIZE_REQUEST_ONCE = 30 * 60 * 5; // 数字は適当に30FPSで5分間分。
    return TickBuffer;
}());
exports.TickBuffer = TickBuffer;

},{"./ExecutionMode":9,"@akashic/akashic-engine":1}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TickController = void 0;
var g = require("@akashic/akashic-engine");
var ExecutionMode_1 = require("./ExecutionMode");
var TickBuffer_1 = require("./TickBuffer");
var TickGenerator_1 = require("./TickGenerator");
var sr = require("./StorageResolver");
/**
 * `GameLoop` に流れるTickを管理するクラス。
 *
 * `GameLoop` に対して `TickGenerator` と `AMFlow` を隠蔽し、
 * Active/Passiveに(ほぼ)関係なくTickを扱えるようにする。
 */
var TickController = /** @class */ (function () {
    function TickController(param) {
        this.errorTrigger = new g.Trigger();
        if (param.errorHandler)
            this.errorTrigger.add(param.errorHandler, param.errorHandlerOwner);
        this._amflow = param.amflow;
        this._clock = param.clock;
        this._started = false;
        this._executionMode = param.executionMode;
        this._generator = new TickGenerator_1.TickGenerator({
            amflow: param.amflow,
            eventBuffer: param.eventBuffer,
            errorHandler: this.errorTrigger.fire,
            errorHandlerOwner: this.errorTrigger
        });
        this._buffer = new TickBuffer_1.TickBuffer({
            amflow: param.amflow,
            executionMode: param.executionMode,
            startedAt: param.startedAt
        });
        this._storageResolver = new sr.StorageResolver({
            game: param.game,
            amflow: param.amflow,
            tickGenerator: this._generator,
            tickBuffer: this._buffer,
            executionMode: param.executionMode,
            errorHandler: this.errorTrigger.fire,
            errorHandlerOwner: this.errorTrigger
        });
        this._generator.tickTrigger.add(this._onTickGenerated, this);
        this._clock.frameTrigger.add(this._generator.next, this._generator);
    }
    TickController.prototype.startTick = function () {
        this._started = true;
        this._updateGeneratorState();
    };
    TickController.prototype.stopTick = function () {
        this._started = false;
        this._updateGeneratorState();
    };
    TickController.prototype.startTickOnce = function () {
        this._started = true;
        this._generator.tickTrigger.addOnce(this._stopTriggerOnTick, this);
        this._updateGeneratorState();
    };
    TickController.prototype.setNextAge = function (age) {
        this._generator.setNextAge(age);
    };
    TickController.prototype.forceGenerateTick = function () {
        this._generator.forceNext();
    };
    TickController.prototype.getBuffer = function () {
        return this._buffer;
    };
    TickController.prototype.storageFunc = function () {
        return {
            storageGetFunc: this._storageResolver.getStorageFunc,
            storagePutFunc: this._storageResolver.putStorageFunc,
            requestValuesForJoinFunc: this._storageResolver.requestValuesForJoinFunc
        };
    };
    TickController.prototype.setExecutionMode = function (execMode) {
        if (this._executionMode === execMode)
            return;
        this._executionMode = execMode;
        this._updateGeneratorState();
        this._buffer.setExecutionMode(execMode);
        this._storageResolver.setExecutionMode(execMode);
    };
    TickController.prototype._stopTriggerOnTick = function () {
        this.stopTick();
    };
    TickController.prototype._updateGeneratorState = function () {
        var toGenerate = (this._started && this._executionMode === ExecutionMode_1.default.Active);
        this._generator.startStopGenerate(toGenerate);
    };
    TickController.prototype._onTickGenerated = function (tick) {
        this._amflow.sendTick(tick);
        this._buffer.addTick(tick);
    };
    return TickController;
}());
exports.TickController = TickController;

},{"./ExecutionMode":9,"./StorageResolver":19,"./TickBuffer":20,"./TickGenerator":22,"@akashic/akashic-engine":1}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TickGenerator = void 0;
var g = require("@akashic/akashic-engine");
var JoinResolver_1 = require("./JoinResolver");
/**
 * `playlog.Tick` の生成器。
 * `next()` が呼ばれる度に、EventBuffer に蓄積されたイベントを集めてtickを生成、`tickTrigger` で通知する。
 */
var TickGenerator = /** @class */ (function () {
    function TickGenerator(param) {
        this.tickTrigger = new g.Trigger();
        this.gotStorageTrigger = new g.Trigger();
        this.errorTrigger = new g.Trigger();
        if (param.errorHandler)
            this.errorTrigger.add(param.errorHandler, param.errorHandlerOwner);
        this._amflow = param.amflow;
        this._eventBuffer = param.eventBuffer;
        this._joinResolver = new JoinResolver_1.JoinResolver({
            amflow: param.amflow,
            errorHandler: this.errorTrigger.fire,
            errorHandlerOwner: this.errorTrigger
        });
        this._nextAge = 0;
        this._storageDataForNext = null;
        this._generatingTick = false;
        this._waitingStorage = false;
        this._onGotStorageData_bound = this._onGotStorageData.bind(this);
    }
    TickGenerator.prototype.next = function () {
        if (!this._generatingTick || this._waitingStorage)
            return;
        var joinLeaves = this._eventBuffer.readJoinLeaves();
        if (joinLeaves) {
            for (var i = 0; i < joinLeaves.length; ++i)
                this._joinResolver.request(joinLeaves[i]);
        }
        var evs = this._eventBuffer.readEvents();
        var resolvedJoinLeaves = this._joinResolver.readResolved();
        if (resolvedJoinLeaves) {
            if (evs) {
                evs.push.apply(evs, resolvedJoinLeaves);
            }
            else {
                evs = resolvedJoinLeaves;
            }
        }
        var sds = this._storageDataForNext;
        this._storageDataForNext = null;
        this.tickTrigger.fire([
            this._nextAge++,
            evs,
            sds // 2?: ストレージデータ
        ]);
    };
    TickGenerator.prototype.forceNext = function () {
        if (this._waitingStorage) {
            this.errorTrigger.fire(new Error("TickGenerator#forceNext(): cannot generate tick while waiting storage."));
            return;
        }
        var origValue = this._generatingTick;
        this._generatingTick = true;
        this.next();
        this._generatingTick = origValue;
    };
    TickGenerator.prototype.startStopGenerate = function (toGenerate) {
        this._generatingTick = toGenerate;
    };
    TickGenerator.prototype.startTick = function () {
        this._generatingTick = true;
    };
    TickGenerator.prototype.stopTick = function () {
        this._generatingTick = false;
    };
    TickGenerator.prototype.setNextAge = function (age) {
        if (this._waitingStorage) {
            // エッジケース: 次のtickにストレージを乗せるはずだったが、ageが変わってしまうのでできない。
            // Activeでストレージ要求(シーン切り替え)して待っている間にここに来るとこのパスにかかる。
            // 現実にはActiveで実行開始した後にageを変えるケースは想像しにくい(tickが飛び飛びになったり重複したりする)。
            this.errorTrigger.fire(new Error("TickGenerator#setNextAge(): cannot change the next age while waiting storage."));
            return;
        }
        this._nextAge = age;
    };
    /**
     * 次に生成するtickにstorageDataを持たせる。
     * 取得が完了するまで、次のtickは生成されない。
     */
    TickGenerator.prototype.requestStorageTick = function (keys) {
        if (this._waitingStorage) {
            var err = g.ExceptionFactory.createAssertionError("TickGenerator#requestStorageTick(): Unsupported: multiple storage request");
            this.errorTrigger.fire(err);
            return -1;
        }
        this._waitingStorage = true;
        this._amflow.getStorageData(keys, this._onGotStorageData_bound);
        return this._nextAge;
    };
    TickGenerator.prototype.setRequestValuesForJoin = function (keys) {
        this._joinResolver.setRequestValuesForJoin(keys);
    };
    TickGenerator.prototype._onGotStorageData = function (err, sds) {
        this._waitingStorage = false;
        if (err) {
            this.errorTrigger.fire(err);
            return;
        }
        this._storageDataForNext = sds;
        this.gotStorageTrigger.fire({ age: this._nextAge, storageData: sds });
    };
    return TickGenerator;
}());
exports.TickGenerator = TickGenerator;

},{"./JoinResolver":13,"@akashic/akashic-engine":1}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._cloneDeep = exports.MemoryAmflowClient = void 0;
var MemoryAmflowClient = /** @class */ (function () {
    function MemoryAmflowClient(param) {
        this._playId = param.playId;
        this._putStorageDataSyncFunc = param.putStorageDataSyncFunc || (function () { throw new Error("Implementation not given"); });
        this._getStorageDataSyncFunc = param.getStorageDataSyncFunc || (function () { throw new Error("Implementation not given"); });
        this._tickHandlers = [];
        this._eventHandlers = [];
        this._events = [];
        this._tickList = null;
        if (param.startPoints) {
            this._tickList = param.tickList;
            this._startPoints = param.startPoints;
        }
        else {
            this._startPoints = [];
        }
    }
    MemoryAmflowClient.prototype.dump = function () {
        return {
            tickList: this._tickList,
            startPoints: this._startPoints
        };
    };
    MemoryAmflowClient.prototype.open = function (playId, callback) {
        var _this = this;
        setTimeout(function () {
            if (playId !== _this._playId)
                return void callback(new Error("MemoryAmflowClient#open: unknown playId"));
            callback(null);
        }, 0);
    };
    MemoryAmflowClient.prototype.close = function (callback) {
        setTimeout(function () { callback(null); }, 0);
    };
    MemoryAmflowClient.prototype.authenticate = function (token, callback) {
        setTimeout(function () {
            switch (token) {
                case MemoryAmflowClient.TOKEN_ACTIVE:
                    callback(null, {
                        writeTick: true,
                        readTick: true,
                        subscribeTick: false,
                        sendEvent: false,
                        subscribeEvent: true,
                        maxEventPriority: 2
                    });
                    break;
                case MemoryAmflowClient.TOKEN_PASSIVE:
                    callback(null, {
                        writeTick: false,
                        readTick: true,
                        subscribeTick: true,
                        sendEvent: true,
                        subscribeEvent: false,
                        maxEventPriority: 2
                    });
                    break;
                default:
                    callback(null, {
                        writeTick: true,
                        readTick: true,
                        subscribeTick: true,
                        sendEvent: true,
                        subscribeEvent: true,
                        maxEventPriority: 2
                    });
                    break;
            }
        }, 0);
    };
    MemoryAmflowClient.prototype.sendTick = function (tick) {
        tick = _cloneDeep(tick); // 元の値が後から変更されてもいいようにコピーしておく
        if (!this._tickList) {
            this._tickList = [tick[0 /* Age */], tick[0 /* Age */], []];
        }
        else {
            // 既に存在するTickListのfrom~to間にtickが挿入されることは無い
            if (this._tickList[0 /* From */] <= tick[0 /* Age */] &&
                tick[0 /* Age */] <= this._tickList[1 /* To */])
                throw new Error("illegal age tick");
            this._tickList[1 /* To */] = tick[0 /* Age */];
        }
        if (!!tick[1 /* Events */] || !!tick[2 /* StorageData */]) {
            if (!!tick[1 /* Events */]) {
                tick[1 /* Events */] = tick[1 /* Events */]
                    .filter(function (event) { return !(event[1 /* EventFlags */] & 8 /* Transient */); });
            }
            this._tickList[2 /* TicksWithEvents */].push(tick);
        }
        this._tickHandlers.forEach(function (h) { return h(tick); });
    };
    MemoryAmflowClient.prototype.onTick = function (handler) {
        this._tickHandlers.push(handler);
    };
    MemoryAmflowClient.prototype.offTick = function (handler) {
        this._tickHandlers = this._tickHandlers.filter(function (h) { return (h !== handler); });
    };
    MemoryAmflowClient.prototype.sendEvent = function (pev) {
        pev = _cloneDeep(pev); // 元の値が後から変更されてもいいようにコピーしておく
        if (this._eventHandlers.length === 0) {
            this._events.push(pev);
            return;
        }
        this._eventHandlers.forEach(function (h) { return h(pev); });
    };
    MemoryAmflowClient.prototype.onEvent = function (handler) {
        var _this = this;
        this._eventHandlers.push(handler);
        if (this._events.length > 0) {
            this._events.forEach(function (pev) {
                _this._eventHandlers.forEach(function (h) { return h(pev); });
            });
            this._events = [];
        }
    };
    MemoryAmflowClient.prototype.offEvent = function (handler) {
        this._eventHandlers = this._eventHandlers.filter(function (h) { return (h !== handler); });
    };
    MemoryAmflowClient.prototype.getTickList = function (optsOrBegin, endOrCallback, callback) {
        if (!this._tickList)
            return void setTimeout(function () { return callback(null, null); }, 0);
        // TODO: @akashic/amflow@3.0.0 追従
        if (typeof optsOrBegin !== "number" ||
            typeof endOrCallback !== "number" ||
            typeof callback !== "function") {
            if (typeof endOrCallback === "function") {
                endOrCallback(new Error("not implemented"));
                return;
            }
            throw new Error("not implemented");
        }
        var from = Math.max(optsOrBegin, this._tickList[0 /* From */]);
        var to = Math.min(endOrCallback, this._tickList[1 /* To */]);
        var ticks = this._tickList[2 /* TicksWithEvents */].filter(function (tick) {
            var age = tick[0 /* Age */];
            return from <= age && age <= to;
        });
        var tickList = [from, to, ticks];
        setTimeout(function () { return callback(null, tickList); }, 0);
    };
    MemoryAmflowClient.prototype.putStartPoint = function (startPoint, callback) {
        var _this = this;
        setTimeout(function () {
            _this._startPoints.push(startPoint);
            callback(null);
        }, 0);
    };
    MemoryAmflowClient.prototype.getStartPoint = function (opts, callback) {
        var _this = this;
        setTimeout(function () {
            if (!_this._startPoints || _this._startPoints.length === 0)
                return void callback(new Error("no startpoint"));
            var index = 0;
            if (opts.frame != null) {
                var nearestFrame = _this._startPoints[0].frame;
                for (var i = 1; i < _this._startPoints.length; ++i) {
                    var frame = _this._startPoints[i].frame;
                    if (frame <= opts.frame && nearestFrame < frame) {
                        nearestFrame = frame;
                        index = i;
                    }
                }
            }
            else {
                var nearestTimestamp = _this._startPoints[0].timestamp;
                for (var i = 1; i < _this._startPoints.length; ++i) {
                    var timestamp = _this._startPoints[i].timestamp;
                    if (timestamp <= opts.timestamp && nearestTimestamp < timestamp) {
                        nearestTimestamp = timestamp;
                        index = i;
                    }
                }
            }
            callback(null, _this._startPoints[index]);
        }, 0);
    };
    MemoryAmflowClient.prototype.putStorageData = function (key, value, options, callback) {
        var _this = this;
        setTimeout(function () {
            try {
                _this._putStorageDataSyncFunc(key, value, options);
                callback(null);
            }
            catch (e) {
                callback(e);
            }
        }, 0);
    };
    MemoryAmflowClient.prototype.getStorageData = function (keys, callback) {
        var _this = this;
        setTimeout(function () {
            try {
                var data = _this._getStorageDataSyncFunc(keys);
                callback(null, data);
            }
            catch (e) {
                callback(e);
            }
        }, 0);
    };
    /**
     * 与えられていたティックリストを部分的に破棄する。
     * @param age ティックを破棄する基準のage(このageのティックも破棄される)
     */
    MemoryAmflowClient.prototype.dropAfter = function (age) {
        if (!this._tickList)
            return;
        var from = this._tickList[0 /* From */];
        var to = this._tickList[1 /* To */];
        if (age <= from) {
            this._tickList = null;
            this._startPoints = [];
        }
        else if (age <= to) {
            this._tickList[1 /* To */] = age - 1;
            this._tickList[2 /* TicksWithEvents */] = this._tickList[2 /* TicksWithEvents */].filter(function (tick) {
                var ta = tick[0 /* Age */];
                return from <= ta && ta <= (age - 1);
            });
            this._startPoints = this._startPoints.filter(function (sp) { return sp.frame < age; });
        }
    };
    /**
     * `writeTick` 権限を持つトークン。
     * この値は authenticate() の挙動以外は変更しない。
     * 他メソッド(sendEvent()など)の呼び出しは(権限に反していても)エラーを起こすとは限らない。
     */
    MemoryAmflowClient.TOKEN_ACTIVE = "mamfc-token:active";
    /**
     * `subscribeTick` 権限を持つトークン。
     * この値は authenticate() の挙動以外は変更しない。
     * 他メソッド(sendTick()など)の呼び出しは(権限に反していても)エラーを起こすとは限らない。
     */
    MemoryAmflowClient.TOKEN_PASSIVE = "mamfc-token:passive";
    return MemoryAmflowClient;
}());
exports.MemoryAmflowClient = MemoryAmflowClient;
function _cloneDeep(v) {
    if (v && typeof v === "object") {
        if (Array.isArray(v)) {
            return v.map(_cloneDeep);
        }
        else {
            return Object.keys(v).reduce(function (acc, k) { return (acc[k] = _cloneDeep(v[k]), acc); }, {});
        }
    }
    return v;
}
exports._cloneDeep = _cloneDeep;

},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplayAmflowProxy = void 0;
var ReplayAmflowProxy = /** @class */ (function () {
    function ReplayAmflowProxy(param) {
        this._amflow = param.amflow;
        this._tickList = param.tickList;
        this._startPoints = param.startPoints;
    }
    /**
     * 与えられていたティックリストを部分的に破棄する。
     * ReplayAmflowProxy の独自メソッド。
     * @param age ティックを破棄する基準のage(このageのティックも破棄される)
     */
    ReplayAmflowProxy.prototype.dropAfter = function (age) {
        if (!this._tickList)
            return;
        var givenFrom = this._tickList[0 /* From */];
        var givenTo = this._tickList[1 /* To */];
        var givenTicksWithEvents = this._tickList[2 /* TicksWithEvents */];
        if (age <= givenFrom) {
            this._tickList = null;
            this._startPoints = [];
        }
        else if (age <= givenTo) {
            this._tickList[1 /* To */] = age - 1;
            this._tickList[2 /* TicksWithEvents */] = this._sliceTicks(givenTicksWithEvents, givenTo, age - 1);
            this._startPoints = this._startPoints.filter(function (sp) { return sp.frame < age; });
        }
    };
    ReplayAmflowProxy.prototype.open = function (playId, callback) {
        this._amflow.open(playId, callback);
    };
    ReplayAmflowProxy.prototype.close = function (callback) {
        this._amflow.close(callback);
    };
    ReplayAmflowProxy.prototype.authenticate = function (token, callback) {
        this._amflow.authenticate(token, callback);
    };
    ReplayAmflowProxy.prototype.sendTick = function (tick) {
        this._amflow.sendTick(tick);
    };
    ReplayAmflowProxy.prototype.onTick = function (handler) {
        this._amflow.onTick(handler);
    };
    ReplayAmflowProxy.prototype.offTick = function (handler) {
        this._amflow.offTick(handler);
    };
    ReplayAmflowProxy.prototype.sendEvent = function (event) {
        this._amflow.sendEvent(event);
    };
    ReplayAmflowProxy.prototype.onEvent = function (handler) {
        this._amflow.onEvent(handler);
    };
    ReplayAmflowProxy.prototype.offEvent = function (handler) {
        this._amflow.offEvent(handler);
    };
    ReplayAmflowProxy.prototype.getTickList = function (optsOrBegin, endOrCallback, callback) {
        var _this = this;
        // TODO: @akashic/amflow@3.0.0 追従
        if (typeof optsOrBegin !== "number" ||
            typeof endOrCallback !== "number" ||
            typeof callback !== "function") {
            if (typeof endOrCallback === "function") {
                endOrCallback(new Error("not implemented"));
                return;
            }
            throw new Error("not implemented");
        }
        var from = optsOrBegin;
        var to = endOrCallback;
        if (!this._tickList) {
            // TODO: 後方互換性のため旧インタフェースを一時的に利用する
            this._amflow.getTickList(from, to, callback);
            return;
        }
        var givenFrom = this._tickList[0 /* From */];
        var givenTo = this._tickList[1 /* To */];
        var givenTicksWithEvents = this._tickList[2 /* TicksWithEvents */];
        var fromInGiven = givenFrom <= from && from <= givenTo;
        var toInGiven = givenFrom <= to && to <= givenTo;
        if (fromInGiven && toInGiven) { // 手持ちが要求範囲を包含
            setTimeout(function () {
                callback(null, [from, to, _this._sliceTicks(givenTicksWithEvents, from, to)]);
            }, 0);
        }
        else {
            this._amflow.getTickList(from, to, function (err, tickList) {
                if (err)
                    return void callback(err);
                if (!tickList) {
                    // 何も得られなかった。手持ちの重複範囲を返すだけ。
                    if (!fromInGiven && !toInGiven) {
                        if (to < givenFrom || givenTo < from) { // 重複なし
                            callback(null, tickList);
                        }
                        else { // 要求範囲が手持ちを包含
                            callback(null, [givenFrom, givenTo, _this._sliceTicks(givenTicksWithEvents, from, to)]);
                        }
                    }
                    else if (fromInGiven) { // 前半重複
                        callback(null, [from, givenTo, _this._sliceTicks(givenTicksWithEvents, from, to)]);
                    }
                    else { // 後半重複
                        callback(null, [givenFrom, to, _this._sliceTicks(givenTicksWithEvents, from, to)]);
                    }
                }
                else {
                    // 何かは得られた。手持ちとマージする。
                    if (!fromInGiven && !toInGiven) {
                        if (to < givenFrom || givenTo < from) { // 重複なし
                            callback(null, tickList);
                        }
                        else { // 要求範囲が手持ちを包含
                            var ticksWithEvents = tickList[2 /* TicksWithEvents */];
                            if (ticksWithEvents) {
                                var beforeGiven = _this._sliceTicks(ticksWithEvents, from, givenFrom - 1);
                                var afterGiven = _this._sliceTicks(ticksWithEvents, givenTo + 1, to);
                                ticksWithEvents = beforeGiven.concat(givenTicksWithEvents, afterGiven);
                            }
                            else {
                                ticksWithEvents = givenTicksWithEvents;
                            }
                            callback(null, [from, to, ticksWithEvents]);
                        }
                    }
                    else if (fromInGiven) { // 前半重複
                        var ticksWithEvents = _this._sliceTicks(givenTicksWithEvents, from, to).concat(tickList[2 /* TicksWithEvents */] || []);
                        callback(null, [from, tickList[1 /* To */], ticksWithEvents]);
                    }
                    else { // 後半重複
                        var ticksWithEvents = (tickList[2 /* TicksWithEvents */] || []).concat(_this._sliceTicks(givenTicksWithEvents, from, to));
                        callback(null, [tickList[0 /* From */], to, ticksWithEvents]);
                    }
                }
            });
        }
    };
    ReplayAmflowProxy.prototype.putStartPoint = function (startPoint, callback) {
        this._amflow.putStartPoint(startPoint, callback);
    };
    ReplayAmflowProxy.prototype.getStartPoint = function (opts, callback) {
        var _this = this;
        var index = 0;
        if (this._startPoints.length > 0) {
            if (opts.frame != null) {
                var nearestFrame = this._startPoints[0].frame;
                for (var i = 1; i < this._startPoints.length; ++i) {
                    var frame = this._startPoints[i].frame;
                    if (frame <= opts.frame && nearestFrame < frame) {
                        nearestFrame = frame;
                        index = i;
                    }
                }
            }
            else {
                var nearestTimestamp = this._startPoints[0].timestamp;
                for (var i = 1; i < this._startPoints.length; ++i) {
                    var timestamp = this._startPoints[i].timestamp;
                    if (timestamp <= opts.timestamp && nearestTimestamp < timestamp) {
                        nearestTimestamp = timestamp;
                        index = i;
                    }
                }
            }
        }
        var givenTo = this._tickList ? this._tickList[1 /* To */] : -1;
        if (opts.frame > givenTo) {
            this._amflow.getStartPoint(opts, function (err, startPoint) {
                if (err) {
                    callback(err);
                    return;
                }
                if (givenTo < startPoint.frame) {
                    callback(null, startPoint);
                }
                else {
                    // 与えられたティックリストの範囲内のスタートポイントが見つかったとしてもなかったかのように振る舞う
                    callback(null, _this._startPoints[index]);
                }
            });
        }
        else {
            setTimeout(function () {
                callback(null, _this._startPoints[index]);
            }, 0);
        }
    };
    ReplayAmflowProxy.prototype.putStorageData = function (key, value, options, callback) {
        this._amflow.putStorageData(key, value, options, callback);
    };
    ReplayAmflowProxy.prototype.getStorageData = function (keys, callback) {
        this._amflow.getStorageData(keys, callback);
    };
    ReplayAmflowProxy.prototype._sliceTicks = function (ticks, from, to) {
        return ticks.filter(function (t) {
            var age = t[0 /* Age */];
            return from <= age && age <= to;
        });
    };
    return ReplayAmflowProxy;
}());
exports.ReplayAmflowProxy = ReplayAmflowProxy;

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleProfiler = void 0;
var g = require("@akashic/akashic-engine");
var SimpleProfiler = /** @class */ (function () {
    function SimpleProfiler(param) {
        this._interval = param.interval != null ? param.interval : SimpleProfiler.DEFAULT_INTERVAL;
        if (param.limit != null) {
            this._limit = param.limit >= SimpleProfiler.DEFAULT_LIMIT ? param.limit : SimpleProfiler.DEFAULT_LIMIT;
        }
        else {
            this._limit = SimpleProfiler.DEFAULT_LIMIT;
        }
        this._calculateProfilerValueTrigger = new g.Trigger();
        if (param.getValueHandler) {
            this._calculateProfilerValueTrigger.add(param.getValueHandler, param.getValueHandlerOwner);
        }
        this._reset();
    }
    SimpleProfiler.prototype.time = function (type) {
        this._beforeTimes[type] = this._getCurrentTime();
    };
    SimpleProfiler.prototype.timeEnd = function (type) {
        var now = this._getCurrentTime();
        var value = this._beforeTimes[type] != null ? now - this._beforeTimes[type] : 0;
        this._values[type].push({
            time: now,
            value: value
        });
    };
    SimpleProfiler.prototype.flush = function () {
        var now = this._getCurrentTime();
        if (this._beforeFlushTime === 0)
            this._beforeFlushTime = now;
        if (this._beforeFlushTime + this._interval < now) {
            this._calculateProfilerValueTrigger.fire(this.getProfilerValue(this._interval));
            this._beforeFlushTime = now;
        }
        if (this._values[1 /* RawFrameInterval */].length > this._limit) {
            for (var i in this._values) {
                if (this._values.hasOwnProperty(i))
                    this._values[i] = this._values[i].slice(-SimpleProfiler.BACKUP_MARGIN);
            }
        }
    };
    SimpleProfiler.prototype.setValue = function (type, value) {
        this._values[type].push({
            time: this._getCurrentTime(),
            value: value
        });
    };
    /**
     * 現在時刻から、指定した時間までを遡った期間の `SimpleProfilerValue` を取得する。
     */
    SimpleProfiler.prototype.getProfilerValue = function (time) {
        var rawFrameInterval = this._calculateProfilerValue(1 /* RawFrameInterval */, time);
        return {
            skippedFrameCount: this._calculateProfilerValue(0 /* SkippedFrameCount */, time),
            rawFrameInterval: rawFrameInterval,
            framePerSecond: {
                ave: 1000 / rawFrameInterval.ave,
                max: 1000 / rawFrameInterval.min,
                min: 1000 / rawFrameInterval.max
            },
            frameTime: this._calculateProfilerValue(2 /* FrameTime */, time),
            renderingTime: this._calculateProfilerValue(3 /* RenderingTime */, time)
        };
    };
    SimpleProfiler.prototype._reset = function () {
        this._startTime = this._getCurrentTime();
        this._beforeFlushTime = 0;
        this._beforeTimes = [];
        this._beforeTimes[1 /* RawFrameInterval */] = 0;
        this._beforeTimes[2 /* FrameTime */] = 0;
        this._beforeTimes[3 /* RenderingTime */] = 0;
        this._beforeTimes[0 /* SkippedFrameCount */] = 0;
        this._values = [];
        this._values[1 /* RawFrameInterval */] = [];
        this._values[2 /* FrameTime */] = [];
        this._values[3 /* RenderingTime */] = [];
        this._values[0 /* SkippedFrameCount */] = [];
    };
    SimpleProfiler.prototype._calculateProfilerValue = function (type, time) {
        var limit = this._getCurrentTime() - time;
        var sum = 0;
        var num = 0;
        var max = 0;
        var min = Number.MAX_VALUE;
        for (var i = this._values[type].length - 1; i >= 0; --i) {
            if (0 < num && this._values[type][i].time < limit)
                break;
            var value = this._values[type][i].value;
            if (max < value)
                max = value;
            if (value < min)
                min = value;
            sum += value;
            ++num;
        }
        return {
            ave: sum / num,
            max: max,
            min: min
        };
    };
    SimpleProfiler.prototype._getCurrentTime = function () {
        return +new Date();
    };
    SimpleProfiler.DEFAULT_INTERVAL = 1000;
    SimpleProfiler.DEFAULT_LIMIT = 1000;
    SimpleProfiler.BACKUP_MARGIN = 100;
    return SimpleProfiler;
}());
exports.SimpleProfiler = SimpleProfiler;

},{"@akashic/akashic-engine":1}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_POLLING_TICK_THRESHOLD = exports.DEFAULT_JUMP_IGNORE_THRESHOLD = exports.DEFAULT_JUMP_TRY_THRESHOLD = exports.DEFAULT_SKIP_THRESHOLD = exports.DEFAULT_SKIP_TICKS_AT_ONCE = exports.DEFAULT_DELAY_IGNORE_THRESHOLD = void 0;
/**
 * 遅延を無視する域値のデフォルト。
 * `LoopConfiguration#delayIgnoreThreshold` のデフォルト値。
 * このフレーム以下の遅延は遅れてないものとみなす(常時コマが飛ぶのを避けるため)。
 */
exports.DEFAULT_DELAY_IGNORE_THRESHOLD = 6;
/**
 * 「早送り」時倍率のデフォルト値。
 * `LoopConfiguration#skipTicksAtOnce` のデフォルト値。
 */
exports.DEFAULT_SKIP_TICKS_AT_ONCE = 100;
/**
 * 「早送り」状態に移る域値のデフォルト。
 * `LoopConfiguration#skipThreshold` のデフォルト値。
 */
exports.DEFAULT_SKIP_THRESHOLD = 100;
/**
 * スナップショットジャンプを試みる域値のデフォルト。
 * `LoopConfiguration#jumpTryThreshold` のデフォルト値。
 */
exports.DEFAULT_JUMP_TRY_THRESHOLD = 30000; // 30FPSの100倍早送りで換算3000FPSで進めても10秒かかる閾値
/**
 * 取得したスナップショットを無視する域値のデフォルト。
 * `LoopConfiguration#jumpIgnoreThreshold` のデフォルト値。
 */
exports.DEFAULT_JUMP_IGNORE_THRESHOLD = 15000; // 30FPSの100倍早送りで換算3000FPSで進めて5秒で済む閾値
/**
 * 最新ティックをポーリングする間隔(ms)のデフォルト。
 */
exports.DEFAULT_POLLING_TICK_THRESHOLD = 10000;

},{}],27:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleProfiler = exports.MemoryAmflowClient = exports.ReplayAmflowProxy = exports.Game = exports.GameDriver = exports.ExecutionMode = exports.LoopRenderMode = exports.LoopMode = exports.EventIndex = void 0;
__exportStar(require("./constants"), exports);
var EventIndex = require("./EventIndex");
exports.EventIndex = EventIndex;
var LoopMode_1 = require("./LoopMode");
exports.LoopMode = LoopMode_1.default;
var LoopRenderMode_1 = require("./LoopRenderMode");
exports.LoopRenderMode = LoopRenderMode_1.default;
var ExecutionMode_1 = require("./ExecutionMode");
exports.ExecutionMode = ExecutionMode_1.default;
var GameDriver_1 = require("./GameDriver");
Object.defineProperty(exports, "GameDriver", { enumerable: true, get: function () { return GameDriver_1.GameDriver; } });
var Game_1 = require("./Game");
Object.defineProperty(exports, "Game", { enumerable: true, get: function () { return Game_1.Game; } });
var ReplayAmflowProxy_1 = require("./auxiliary/ReplayAmflowProxy");
Object.defineProperty(exports, "ReplayAmflowProxy", { enumerable: true, get: function () { return ReplayAmflowProxy_1.ReplayAmflowProxy; } });
var MemoryAmflowClient_1 = require("./auxiliary/MemoryAmflowClient");
Object.defineProperty(exports, "MemoryAmflowClient", { enumerable: true, get: function () { return MemoryAmflowClient_1.MemoryAmflowClient; } });
var SimpleProfiler_1 = require("./auxiliary/SimpleProfiler");
Object.defineProperty(exports, "SimpleProfiler", { enumerable: true, get: function () { return SimpleProfiler_1.SimpleProfiler; } });

},{"./EventIndex":8,"./ExecutionMode":9,"./Game":10,"./GameDriver":11,"./LoopMode":14,"./LoopRenderMode":15,"./auxiliary/MemoryAmflowClient":23,"./auxiliary/ReplayAmflowProxy":24,"./auxiliary/SimpleProfiler":25,"./constants":26}],28:[function(require,module,exports){
module.exports = require("./lib/full/index");

},{"./lib/full/index":63}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioManager = void 0;
var AudioManager = /** @class */ (function () {
    function AudioManager() {
        this.audioAssets = [];
        this._masterVolume = 1.0;
    }
    AudioManager.prototype.registerAudioAsset = function (asset) {
        if (this.audioAssets.indexOf(asset) === -1)
            this.audioAssets.push(asset);
    };
    AudioManager.prototype.removeAudioAsset = function (asset) {
        var index = this.audioAssets.indexOf(asset);
        if (index === -1)
            this.audioAssets.splice(index, 1);
    };
    AudioManager.prototype.setMasterVolume = function (volume) {
        this._masterVolume = volume;
        for (var i = 0; i < this.audioAssets.length; i++) {
            if (this.audioAssets[i]._lastPlayedPlayer) {
                this.audioAssets[i]._lastPlayedPlayer.notifyMasterVolumeChanged();
            }
        }
    };
    AudioManager.prototype.getMasterVolume = function () {
        return this._masterVolume;
    };
    return AudioManager;
}());
exports.AudioManager = AudioManager;

},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerController = void 0;
var g = require("@akashic/akashic-engine");
var InputHandlerLayer_1 = require("./InputHandlerLayer");
/*
 HTML要素のContainerを管理するクラス。
 CanvasやInputHandlerの実態となる要素の順番や追加済みなのかを管理する。
 ContainerはInput、Canvasを1つのセットとして扱う。

 以下のようなDOM構造を持つ

 ContainerController.rootView
 └── InputHandlerLayer
     └── CanvasSurface
 */
var ContainerController = /** @class */ (function () {
    function ContainerController(resourceFactory) {
        this.container = null;
        this.surface = null;
        this.inputHandlerLayer = null;
        this.rootView = null;
        this.useResizeForScaling = false;
        this.pointEventTrigger = new g.Trigger();
        this._rendererReq = null;
        this._disablePreventDefault = false;
        this.resourceFactory = resourceFactory;
    }
    ContainerController.prototype.initialize = function (param) {
        this._rendererReq = param.rendererRequirement;
        this._disablePreventDefault = !!param.disablePreventDefault;
        this._loadView();
    };
    ContainerController.prototype.setRootView = function (rootView) {
        if (rootView === this.rootView) {
            return;
        }
        // 一つのContainerは一つのrootしか持たないのでloadし直す
        if (this.rootView) {
            this.unloadView();
            this._loadView();
        }
        this.rootView = rootView;
        this._appendToRootView(rootView);
    };
    ContainerController.prototype.resetView = function (rendererReq) {
        this.unloadView();
        this._rendererReq = rendererReq;
        this._loadView();
        this._appendToRootView(this.rootView);
    };
    ContainerController.prototype.getRenderer = function () {
        if (!this.surface) {
            throw new Error("this container has no surface");
        }
        // TODO: should be cached?
        return this.surface.renderer();
    };
    ContainerController.prototype.changeScale = function (xScale, yScale) {
        if (this.useResizeForScaling) {
            this.surface.changePhysicalScale(xScale, yScale);
        }
        else {
            this.surface.changeVisualScale(xScale, yScale);
        }
        this.inputHandlerLayer._inputHandler.setScale(xScale, yScale);
    };
    ContainerController.prototype.unloadView = function () {
        // イベントを片付けてから、rootViewに所属するElementを開放する
        this.inputHandlerLayer.disablePointerEvent();
        if (this.rootView) {
            while (this.rootView.firstChild) {
                this.rootView.removeChild(this.rootView.firstChild);
            }
        }
    };
    ContainerController.prototype._loadView = function () {
        var _a = this._rendererReq, width = _a.primarySurfaceWidth, height = _a.primarySurfaceHeight;
        var disablePreventDefault = this._disablePreventDefault;
        // DocumentFragmentはinsertした時点で開放されているため毎回作る
        // https://dom.spec.whatwg.org/#concept-node-insert
        this.container = document.createDocumentFragment();
        // 入力受け付けレイヤー - DOM Eventの管理
        if (!this.inputHandlerLayer) {
            this.inputHandlerLayer = new InputHandlerLayer_1.InputHandlerLayer({ width: width, height: height, disablePreventDefault: disablePreventDefault });
        }
        else {
            // Note: 操作プラグインに与えた view 情報を削除しないため、 inputHandlerLayer を使いまわしている
            this.inputHandlerLayer.setViewSize({ width: width, height: height });
            this.inputHandlerLayer.pointEventTrigger.removeAll();
            if (this.surface && !this.surface.destroyed()) {
                this.inputHandlerLayer.view.removeChild(this.surface.canvas);
                this.surface.destroy();
            }
        }
        // 入力受け付けレイヤー > 描画レイヤー
        this.surface = this.resourceFactory.createPrimarySurface(width, height);
        this.inputHandlerLayer.view.appendChild(this.surface.getHTMLElement());
        // containerController -> input -> canvas
        this.container.appendChild(this.inputHandlerLayer.view);
    };
    ContainerController.prototype._appendToRootView = function (rootView) {
        rootView.appendChild(this.container);
        this.inputHandlerLayer.enablePointerEvent(); // Viewが追加されてから設定する
        this.inputHandlerLayer.pointEventTrigger.add(this.pointEventTrigger.fire, this.pointEventTrigger);
    };
    return ContainerController;
}());
exports.ContainerController = ContainerController;

},{"./InputHandlerLayer":31,"@akashic/akashic-engine":1}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputHandlerLayer = void 0;
var g = require("@akashic/akashic-engine");
var TouchHandler_1 = require("./handler/TouchHandler");
/**
 * ユーザの入力を受け付けるViewのレイヤー。
 *
 * 実行環境に適切なDOMイベントを設定し、DOMイベントから座標データへ変換した結果をGameに伝える。
 * InputHandlerLayerはあくまで一つのレイヤーであり、Containerではない。
 * 従ってこのViewの親子要素がどうなっているかを知る必要はない。
 */
var InputHandlerLayer = /** @class */ (function () {
    /**
     * @example
     *
     * var inputHandlerLayer = new InputHandlerLayer();
     * inputHandlerLayer.pointEventTrigger.add(function(pointEvent){
     *   console.log(pointEvent);
     * });
     * containerController.appendChild(inputHandlerLayer.view);
     */
    function InputHandlerLayer(param) {
        this.view = this._createInputView(param.width, param.height);
        this._inputHandler = undefined;
        this.pointEventTrigger = new g.Trigger();
        this._disablePreventDefault = !!param.disablePreventDefault;
    }
    // 実行環境でサポートしてるDOM Eventを使い、それぞれonPoint*Triggerを関連付ける
    InputHandlerLayer.prototype.enablePointerEvent = function () {
        var _this = this;
        this._inputHandler = new TouchHandler_1.TouchHandler(this.view, this._disablePreventDefault);
        // 各種イベントのTrigger
        this._inputHandler.pointTrigger.add(function (e) {
            _this.pointEventTrigger.fire(e);
        });
        this._inputHandler.start();
    };
    // DOMイベントハンドラを開放する
    InputHandlerLayer.prototype.disablePointerEvent = function () {
        if (this._inputHandler)
            this._inputHandler.stop();
    };
    InputHandlerLayer.prototype.setOffset = function (offset) {
        var inputViewStyle = "position:relative; left:" + offset.x + "px; top:" + offset.y + "px";
        this._inputHandler.inputView.setAttribute("style", inputViewStyle);
    };
    InputHandlerLayer.prototype.setViewSize = function (size) {
        var view = this.view;
        view.style.width = size.width + "px";
        view.style.height = size.height + "px";
    };
    InputHandlerLayer.prototype._createInputView = function (width, height) {
        var view = document.createElement("div");
        view.setAttribute("tabindex", "1");
        view.className = "input-handler";
        view.setAttribute("style", "display:inline-block; outline:none;");
        view.style.width = width + "px";
        view.style.height = height + "px";
        return view;
    };
    return InputHandlerLayer;
}());
exports.InputHandlerLayer = InputHandlerLayer;

},{"./handler/TouchHandler":62,"@akashic/akashic-engine":1}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = void 0;
var RafLooper_1 = require("./RafLooper");
var ResourceFactory_1 = require("./ResourceFactory");
var ContainerController_1 = require("./ContainerController");
var AudioPluginManager_1 = require("./plugin/AudioPluginManager");
var AudioManager_1 = require("./AudioManager");
var AudioPluginRegistry_1 = require("./plugin/AudioPluginRegistry");
var XHRTextAsset_1 = require("./asset/XHRTextAsset");
var Platform = /** @class */ (function () {
    function Platform(param) {
        this.containerView = param.containerView;
        this.audioPluginManager = new AudioPluginManager_1.AudioPluginManager();
        if (param.audioPlugins) {
            this.audioPluginManager.tryInstallPlugin(param.audioPlugins);
        }
        // TODO: make it deprecated
        this.audioPluginManager.tryInstallPlugin(AudioPluginRegistry_1.AudioPluginRegistry.getRegisteredAudioPlugins());
        this._audioManager = new AudioManager_1.AudioManager();
        this.amflow = param.amflow;
        this._platformEventHandler = null;
        this._resourceFactory = param.resourceFactory || new ResourceFactory_1.ResourceFactory({
            audioPluginManager: this.audioPluginManager,
            platform: this,
            audioManager: this._audioManager
        });
        this.containerController = new ContainerController_1.ContainerController(this._resourceFactory);
        this._rendererReq = null;
        this._disablePreventDefault = !!param.disablePreventDefault;
    }
    Platform.prototype.setPlatformEventHandler = function (handler) {
        if (this.containerController) {
            this.containerController.pointEventTrigger.removeAll({ owner: this._platformEventHandler });
            this.containerController.pointEventTrigger.add(handler.onPointEvent, handler);
        }
        this._platformEventHandler = handler;
    };
    Platform.prototype.loadGameConfiguration = function (url, callback) {
        var a = new XHRTextAsset_1.XHRTextAsset("(game.json)", url);
        a._load({
            _onAssetLoad: function (asset) { callback(null, JSON.parse(a.data)); },
            _onAssetError: function (asset, error) { callback(error, null); }
        });
    };
    Platform.prototype.getResourceFactory = function () {
        return this._resourceFactory;
    };
    Platform.prototype.setRendererRequirement = function (requirement) {
        if (!requirement) {
            if (this.containerController)
                this.containerController.unloadView();
            return;
        }
        this._rendererReq = requirement;
        this._resourceFactory._rendererCandidates = this._rendererReq.rendererCandidates;
        // Note: this.containerController.inputHandlerLayer の存在により this.containerController が初期化されているかを判定
        if (this.containerController && !this.containerController.inputHandlerLayer) {
            this.containerController.initialize({
                rendererRequirement: requirement,
                disablePreventDefault: this._disablePreventDefault
            });
            this.containerController.setRootView(this.containerView);
            if (this._platformEventHandler) {
                this.containerController.pointEventTrigger.add(this._platformEventHandler.onPointEvent, this._platformEventHandler);
            }
        }
        else {
            this.containerController.resetView(requirement);
        }
    };
    Platform.prototype.getPrimarySurface = function () {
        return this.containerController.surface;
    };
    Platform.prototype.getOperationPluginViewInfo = function () {
        var _this = this;
        return {
            type: "pdi-browser",
            view: this.containerController.inputHandlerLayer.view,
            getScale: function () { return _this.containerController.inputHandlerLayer._inputHandler.getScale(); }
        };
    };
    Platform.prototype.createLooper = function (fun) {
        return new RafLooper_1.RafLooper(fun);
    };
    Platform.prototype.sendToExternal = function (playId, data) {
        // Nothing to do.
    };
    Platform.prototype.registerAudioPlugins = function (plugins) {
        return this.audioPluginManager.tryInstallPlugin(plugins);
    };
    Platform.prototype.setScale = function (xScale, yScale) {
        this.containerController.changeScale(xScale, yScale);
    };
    Platform.prototype.notifyViewMoved = function () {
        // 既に役割のないメソッド(呼び出さなくても正しく動作する)。公開APIのため後方互換性のために残している。
    };
    /**
     * 最終的に出力されるマスター音量を変更する
     *
     * @param volume マスター音量
     */
    Platform.prototype.setMasterVolume = function (volume) {
        if (this._audioManager)
            this._audioManager.setMasterVolume(volume);
    };
    /**
     * 最終的に出力されるマスター音量を取得する
     */
    Platform.prototype.getMasterVolume = function () {
        if (this._audioManager)
            return this._audioManager.getMasterVolume();
    };
    Platform.prototype.destroy = function () {
        this.setRendererRequirement(undefined);
        this.setMasterVolume(0);
    };
    return Platform;
}());
exports.Platform = Platform;

},{"./AudioManager":29,"./ContainerController":30,"./RafLooper":33,"./ResourceFactory":34,"./asset/XHRTextAsset":39,"./plugin/AudioPluginManager":64,"./plugin/AudioPluginRegistry":65}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RafLooper = void 0;
var RafLooper = /** @class */ (function () {
    function RafLooper(fun) {
        this._fun = fun;
        this._timerId = undefined;
        this._prev = 0;
    }
    RafLooper.prototype.start = function () {
        var _this = this;
        var onAnimationFrame = function (deltaTime) {
            if (_this._timerId == null) {
                // NOTE: Firefox Quantum 57.0.2の不具合(？)(cancelAnimationFrame()が機能しないことがある)暫定対策
                return;
            }
            _this._timerId = requestAnimationFrame(onAnimationFrame);
            _this._fun(deltaTime - _this._prev);
            _this._prev = deltaTime;
        };
        var onFirstFrame = function (deltaTime) {
            _this._timerId = requestAnimationFrame(onAnimationFrame);
            _this._fun(0);
            _this._prev = deltaTime;
        };
        this._timerId = requestAnimationFrame(onFirstFrame);
    };
    RafLooper.prototype.stop = function () {
        cancelAnimationFrame(this._timerId);
        this._timerId = undefined;
        this._prev = 0;
    };
    return RafLooper;
}());
exports.RafLooper = RafLooper;

},{}],34:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceFactory = void 0;
var g = require("@akashic/akashic-engine");
var HTMLImageAsset_1 = require("./asset/HTMLImageAsset");
var HTMLVideoAsset_1 = require("./asset/HTMLVideoAsset");
var XHRTextAsset_1 = require("./asset/XHRTextAsset");
var XHRScriptAsset_1 = require("./asset/XHRScriptAsset");
var GlyphFactory_1 = require("./canvas/GlyphFactory");
var SurfaceFactory_1 = require("./canvas/shims/SurfaceFactory");
var ResourceFactory = /** @class */ (function (_super) {
    __extends(ResourceFactory, _super);
    function ResourceFactory(param) {
        var _this = _super.call(this) || this;
        _this._audioPluginManager = param.audioPluginManager;
        _this._audioManager = param.audioManager;
        _this._platform = param.platform;
        _this._surfaceFactory = new SurfaceFactory_1.SurfaceFactory();
        return _this;
    }
    ResourceFactory.prototype.createAudioAsset = function (id, assetPath, duration, system, loop, hint) {
        var activePlugin = this._audioPluginManager.getActivePlugin();
        var audioAsset = activePlugin.createAsset(id, assetPath, duration, system, loop, hint);
        if (audioAsset.onDestroyed) {
            this._audioManager.registerAudioAsset(audioAsset);
            audioAsset.onDestroyed.add(this._onAudioAssetDestroyed, this);
        }
        return audioAsset;
    };
    ResourceFactory.prototype.createAudioPlayer = function (system) {
        var activePlugin = this._audioPluginManager.getActivePlugin();
        return activePlugin.createPlayer(system, this._audioManager);
    };
    ResourceFactory.prototype.createImageAsset = function (id, assetPath, width, height) {
        return new HTMLImageAsset_1.HTMLImageAsset(id, assetPath, width, height);
    };
    ResourceFactory.prototype.createVideoAsset = function (id, assetPath, width, height, system, loop, useRealSize) {
        return new HTMLVideoAsset_1.HTMLVideoAsset(id, assetPath, width, height, system, loop, useRealSize);
    };
    ResourceFactory.prototype.createTextAsset = function (id, assetPath) {
        return new XHRTextAsset_1.XHRTextAsset(id, assetPath);
    };
    ResourceFactory.prototype.createScriptAsset = function (id, assetPath) {
        return new XHRScriptAsset_1.XHRScriptAsset(id, assetPath);
    };
    ResourceFactory.prototype.createPrimarySurface = function (width, height) {
        return this._surfaceFactory.createPrimarySurface(width, height, this._rendererCandidates);
    };
    ResourceFactory.prototype.createSurface = function (width, height) {
        return this._surfaceFactory.createBackSurface(width, height, this._rendererCandidates);
    };
    ResourceFactory.prototype.createGlyphFactory = function (fontFamily, fontSize, baseline, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
        return new GlyphFactory_1.GlyphFactory(fontFamily, fontSize, baseline, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight);
    };
    ResourceFactory.prototype._onAudioAssetDestroyed = function (asset) {
        this._audioManager.removeAudioAsset(asset);
    };
    return ResourceFactory;
}(g.ResourceFactory));
exports.ResourceFactory = ResourceFactory;

},{"./asset/HTMLImageAsset":35,"./asset/HTMLVideoAsset":36,"./asset/XHRScriptAsset":38,"./asset/XHRTextAsset":39,"./canvas/GlyphFactory":42,"./canvas/shims/SurfaceFactory":48,"@akashic/akashic-engine":1}],35:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLImageAsset = exports.ImageAssetSurface = void 0;
var g = require("@akashic/akashic-engine");
var ImageAssetSurface = /** @class */ (function (_super) {
    __extends(ImageAssetSurface, _super);
    function ImageAssetSurface(width, height, drawable) {
        return _super.call(this, width, height, drawable) || this;
    }
    ImageAssetSurface.prototype.renderer = function () {
        throw g.ExceptionFactory.createAssertionError("ImageAssetSurface cannot be rendered.");
    };
    ImageAssetSurface.prototype.isPlaying = function () {
        return false;
    };
    return ImageAssetSurface;
}(g.Surface));
exports.ImageAssetSurface = ImageAssetSurface;
var HTMLImageAsset = /** @class */ (function (_super) {
    __extends(HTMLImageAsset, _super);
    function HTMLImageAsset(id, path, width, height) {
        var _this = _super.call(this, id, path, width, height) || this;
        _this.data = undefined;
        _this._surface = undefined;
        return _this;
    }
    HTMLImageAsset.prototype.destroy = function () {
        if (this._surface && !this._surface.destroyed()) {
            this._surface.destroy();
        }
        this.data = undefined;
        this._surface = undefined;
        _super.prototype.destroy.call(this);
    };
    HTMLImageAsset.prototype._load = function (loader) {
        var _this = this;
        var image = new Image();
        if (this.hint && this.hint.untainted) {
            image.crossOrigin = "anonymous";
        }
        image.onerror = function () {
            loader._onAssetError(_this, g.ExceptionFactory.createAssetLoadError("HTMLImageAsset unknown loading error"));
        };
        image.onload = function () {
            _this.data = image;
            loader._onAssetLoad(_this);
        };
        image.src = this.path;
    };
    HTMLImageAsset.prototype.asSurface = function () {
        if (!this.data) {
            throw g.ExceptionFactory.createAssertionError("ImageAssetImpl#asSurface: not yet loaded.");
        }
        if (this._surface) {
            return this._surface;
        }
        this._surface = new ImageAssetSurface(this.width, this.height, this.data);
        return this._surface;
    };
    return HTMLImageAsset;
}(g.ImageAsset));
exports.HTMLImageAsset = HTMLImageAsset;

},{"@akashic/akashic-engine":1}],36:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLVideoAsset = void 0;
var g = require("@akashic/akashic-engine");
var HTMLVideoPlayer_1 = require("./HTMLVideoPlayer");
var VideoAssetSurface = /** @class */ (function (_super) {
    __extends(VideoAssetSurface, _super);
    function VideoAssetSurface(width, height, drawable) {
        return _super.call(this, width, height, drawable, true) || this;
    }
    VideoAssetSurface.prototype.renderer = function () {
        throw g.ExceptionFactory.createAssertionError("VideoAssetSurface cannot be rendered.");
    };
    VideoAssetSurface.prototype.isPlaying = function () {
        return false;
    };
    return VideoAssetSurface;
}(g.Surface));
var HTMLVideoAsset = /** @class */ (function (_super) {
    __extends(HTMLVideoAsset, _super);
    function HTMLVideoAsset(id, assetPath, width, height, system, loop, useRealSize) {
        var _this = _super.call(this, id, assetPath, width, height, system, loop, useRealSize) || this;
        _this._player = new HTMLVideoPlayer_1.HTMLVideoPlayer();
        _this._surface = new VideoAssetSurface(width, height, null);
        return _this;
    }
    HTMLVideoAsset.prototype.inUse = function () {
        return false;
    };
    HTMLVideoAsset.prototype._load = function (loader) {
        var _this = this;
        setTimeout(function () {
            loader._onAssetLoad(_this);
        }, 0);
    };
    HTMLVideoAsset.prototype.getPlayer = function () {
        return this._player;
    };
    HTMLVideoAsset.prototype.asSurface = function () {
        return this._surface;
    };
    return HTMLVideoAsset;
}(g.VideoAsset));
exports.HTMLVideoAsset = HTMLVideoAsset;

},{"./HTMLVideoPlayer":37,"@akashic/akashic-engine":1}],37:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLVideoPlayer = void 0;
var g = require("@akashic/akashic-engine");
var HTMLVideoPlayer = /** @class */ (function (_super) {
    __extends(HTMLVideoPlayer, _super);
    function HTMLVideoPlayer(loop) {
        var _this = _super.call(this, loop) || this;
        _this.isDummy = true;
        return _this;
    }
    HTMLVideoPlayer.prototype.play = function (videoAsset) {
        // not yet supported
    };
    HTMLVideoPlayer.prototype.stop = function () {
        // not yet supported
    };
    HTMLVideoPlayer.prototype.changeVolume = function (volume) {
        // not yet supported
    };
    return HTMLVideoPlayer;
}(g.VideoPlayer));
exports.HTMLVideoPlayer = HTMLVideoPlayer;

},{"@akashic/akashic-engine":1}],38:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.XHRScriptAsset = void 0;
var g = require("@akashic/akashic-engine");
var XHRLoader_1 = require("../utils/XHRLoader");
var XHRScriptAsset = /** @class */ (function (_super) {
    __extends(XHRScriptAsset, _super);
    function XHRScriptAsset(id, path) {
        var _this = _super.call(this, id, path) || this;
        _this.script = undefined;
        return _this;
    }
    XHRScriptAsset.prototype._load = function (handler) {
        var _this = this;
        var loader = new XHRLoader_1.XHRLoader();
        loader.get(this.path, function (error, responseText) {
            if (error) {
                handler._onAssetError(_this, error);
                return;
            }
            _this.script = responseText + "\n";
            handler._onAssetLoad(_this);
        });
    };
    XHRScriptAsset.prototype.execute = function (execEnv) {
        // TODO: この方式では読み込んだスクリプトがcookie参照できる等本質的な危険性がある
        // 信頼できないスクリプトを読み込むようなケースでは、iframeに閉じ込めて実行などの方式を検討する事。
        var func = this._wrap();
        func(execEnv);
        return execEnv.module.exports;
    };
    XHRScriptAsset.prototype._wrap = function () {
        var func = new Function("g", XHRScriptAsset.PRE_SCRIPT + this.script + XHRScriptAsset.POST_SCRIPT);
        return func;
    };
    XHRScriptAsset.PRE_SCRIPT = "(function(exports, require, module, __filename, __dirname) {";
    XHRScriptAsset.POST_SCRIPT = "\n})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);";
    return XHRScriptAsset;
}(g.ScriptAsset));
exports.XHRScriptAsset = XHRScriptAsset;

},{"../utils/XHRLoader":82,"@akashic/akashic-engine":1}],39:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.XHRTextAsset = void 0;
var g = require("@akashic/akashic-engine");
var XHRLoader_1 = require("../utils/XHRLoader");
var XHRTextAsset = /** @class */ (function (_super) {
    __extends(XHRTextAsset, _super);
    function XHRTextAsset(id, path) {
        var _this = _super.call(this, id, path) || this;
        _this.data = undefined;
        return _this;
    }
    XHRTextAsset.prototype._load = function (handler) {
        var _this = this;
        var loader = new XHRLoader_1.XHRLoader();
        loader.get(this.path, function (error, responseText) {
            if (error) {
                handler._onAssetError(_this, error);
                return;
            }
            _this.data = responseText;
            handler._onAssetLoad(_this);
        });
    };
    return XHRTextAsset;
}(g.TextAsset));
exports.XHRTextAsset = XHRTextAsset;

},{"../utils/XHRLoader":82,"@akashic/akashic-engine":1}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffineTransformer = void 0;
var AffineTransformer = /** @class */ (function () {
    function AffineTransformer(rhs) {
        if (rhs) {
            this.matrix = new Float32Array(rhs.matrix);
        }
        else {
            this.matrix = new Float32Array([1, 0, 0, 1, 0, 0]);
        }
    }
    AffineTransformer.prototype.scale = function (x, y) {
        var m = this.matrix;
        m[0] *= x;
        m[1] *= x;
        m[2] *= y;
        m[3] *= y;
        return this;
    };
    AffineTransformer.prototype.translate = function (x, y) {
        var m = this.matrix;
        m[4] += m[0] * x + m[2] * y;
        m[5] += m[1] * x + m[3] * y;
        return this;
    };
    AffineTransformer.prototype.transform = function (matrix) {
        var m = this.matrix;
        var a = matrix[0] * m[0] + matrix[1] * m[2];
        var b = matrix[0] * m[1] + matrix[1] * m[3];
        var c = matrix[2] * m[0] + matrix[3] * m[2];
        var d = matrix[2] * m[1] + matrix[3] * m[3];
        var e = matrix[4] * m[0] + matrix[5] * m[2] + m[4];
        var f = matrix[4] * m[1] + matrix[5] * m[3] + m[5];
        m[0] = a;
        m[1] = b;
        m[2] = c;
        m[3] = d;
        m[4] = e;
        m[5] = f;
        return this;
    };
    AffineTransformer.prototype.setTransform = function (matrix) {
        var m = this.matrix;
        m[0] = matrix[0];
        m[1] = matrix[1];
        m[2] = matrix[2];
        m[3] = matrix[3];
        m[4] = matrix[4];
        m[5] = matrix[5];
    };
    AffineTransformer.prototype.copyFrom = function (rhs) {
        this.matrix.set(rhs.matrix);
        return this;
    };
    return AffineTransformer;
}());
exports.AffineTransformer = AffineTransformer;

},{}],41:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasSurface = void 0;
var g = require("@akashic/akashic-engine");
var CanvasSurface = /** @class */ (function (_super) {
    __extends(CanvasSurface, _super);
    function CanvasSurface(width, height) {
        var _this = this;
        var canvas = document.createElement("canvas");
        _this = _super.call(this, width, height, canvas) || this;
        canvas.width = width;
        canvas.height = height;
        _this.canvas = canvas;
        _this._renderer = undefined;
        return _this;
    }
    CanvasSurface.prototype.destroy = function () {
        this.canvas.width = 1;
        this.canvas.height = 1;
        this.canvas = null;
        this._renderer = null;
        _super.prototype.destroy.call(this);
    };
    CanvasSurface.prototype.getHTMLElement = function () {
        return this.canvas;
    };
    /**
     * 表示上の拡大率を変更する。
     * `changeRawSize()` との差異に注意。
     */
    CanvasSurface.prototype.changeVisualScale = function (xScale, yScale) {
        /*
         Canvas要素のリサイズをCSS transformで行う。
         CSSのwidth/height styleによるリサイズはおかしくなるケースが存在するので、可能な限りtransformを使う。
         - https://twitter.com/uupaa/status/639002317576998912
         - http://havelog.ayumusato.com/develop/performance/e554-paint_gpu_acceleration_problems.html
         - http://buccchi.jp/blog/2013/03/android_canvas_deathpoint/
         */
        var canvasStyle = this.canvas.style;
        if ("transform" in canvasStyle) {
            canvasStyle.transformOrigin = "0 0";
            canvasStyle.transform = "scale(" + xScale + "," + yScale + ")";
        }
        else if ("webkitTransform" in canvasStyle) {
            canvasStyle.webkitTransformOrigin = "0 0";
            canvasStyle.webkitTransform = "scale(" + xScale + "," + yScale + ")";
        }
        else {
            canvasStyle.width = Math.floor(xScale * this.width) + "px";
            canvasStyle.height = Math.floor(yScale * this.width) + "px";
        }
    };
    return CanvasSurface;
}(g.Surface));
exports.CanvasSurface = CanvasSurface;

},{"@akashic/akashic-engine":1}],42:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlyphFactory = void 0;
var g = require("@akashic/akashic-engine");
var Context2DSurface_1 = require("./context2d/Context2DSurface");
function createGlyphRenderedSurface(code, fontSize, cssFontFamily, baselineHeight, marginW, marginH, needImageData, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
    // 要求されたフォントサイズが描画可能な最小フォントサイズ以下だった場合、必要なスケーリング係数
    var scale = fontSize < GlyphFactory._environmentMinimumFontSize ? fontSize / GlyphFactory._environmentMinimumFontSize : 1;
    var surfaceWidth = Math.ceil((fontSize + marginW * 2) * scale);
    var surfaceHeight = Math.ceil((fontSize + marginH * 2) * scale);
    var surface = new Context2DSurface_1.Context2DSurface(surfaceWidth, surfaceHeight);
    // NOTE: canvasを直接操作する
    // 理由:
    // * Renderer#drawSystemText()を廃止または非推奨にしたいのでそれを用いず文字列を描画する
    // * RenderingHelperがcontextの状態を復帰するためTextMetricsを取れない
    var canvas = surface.canvas;
    var context = canvas.getContext("2d");
    var str = (code & 0xFFFF0000) ? String.fromCharCode((code & 0xFFFF0000) >>> 16, code & 0xFFFF) : String.fromCharCode(code);
    var fontWeightValue = fontWeight === g.FontWeight.Bold ? "bold " : "";
    context.save();
    // CanvasRenderingContext2D.font
    // see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
    // > This string uses the same syntax as the CSS font specifier. The default font is 10px sans-serif.
    context.font = fontWeightValue + fontSize + "px " + cssFontFamily;
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.lineJoin = "bevel";
    // 描画可能な最小フォントサイズ以下のフォントサイズはスケーリングで実現する
    if (scale !== 1)
        context.scale(scale, scale);
    if (strokeWidth > 0) {
        context.lineWidth = strokeWidth;
        context.strokeStyle = strokeColor;
        context.strokeText(str, marginW, marginH + baselineHeight);
    }
    if (!strokeOnly) {
        context.fillStyle = fontColor;
        context.fillText(str, marginW, marginH + baselineHeight);
    }
    var advanceWidth = context.measureText(str).width;
    context.restore();
    var result = {
        surface: surface,
        advanceWidth: advanceWidth,
        imageData: needImageData ? context.getImageData(0, 0, canvas.width, canvas.height) : undefined
    };
    return result;
}
function calcGlyphArea(imageData) {
    var sx = imageData.width;
    var sy = imageData.height;
    var ex = 0;
    var ey = 0;
    var currentPos = 0;
    for (var y = 0, height = imageData.height; y < height; y = (y + 1) | 0) {
        for (var x = 0, width = imageData.width; x < width; x = (x + 1) | 0) {
            var a = imageData.data[currentPos + 3]; // get alpha value
            if (a !== 0) {
                if (x < sx) {
                    sx = x;
                }
                if (x > ex) {
                    ex = x;
                }
                if (y < sy) {
                    sy = y;
                }
                if (y > ey) {
                    ey = y;
                }
            }
            currentPos += 4; // go to next pixel
        }
    }
    var glyphArea = undefined;
    if (sx === imageData.width) { // 空白文字
        glyphArea = { x: 0, y: 0, width: 0, height: 0 }; // 空の領域に設定
    }
    else {
        // sx, sy, ex, eyは座標ではなく画素のメモリ上の位置を指す添字。
        // 故にwidth, heightを算出する時 1 加算する。
        glyphArea = { x: sx, y: sy, width: ex - sx + 1, height: ey - sy + 1 };
    }
    return glyphArea;
}
function isGlyphAreaEmpty(glyphArea) {
    return glyphArea.width === 0 || glyphArea.height === 0;
}
function fontFamily2FontFamilyName(fontFamily) {
    switch (fontFamily) {
        case g.FontFamily.Monospace:
            return "monospace";
        case g.FontFamily.Serif:
            return "serif";
        default:
            return "sans-serif";
    }
}
// ジェネリックフォントファミリとして定義されているキーワードのリスト
// see: https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
var genericFontFamilyNames = [
    "serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"
];
// ジェネリックフォントファミリでない時クォートする。
// > Font family names must either be given quoted as strings, or unquoted as a sequence of one or more identifiers.
// > Generic family names are keywords and must not be quoted.
// see: https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
function quoteIfNotGeneric(name) {
    if (genericFontFamilyNames.indexOf(name) !== -1) {
        return name;
    }
    else {
        return "\"" + name + "\"";
    }
}
function fontFamily2CSSFontFamily(fontFamily) {
    if (typeof fontFamily === "number") {
        return fontFamily2FontFamilyName(fontFamily);
    }
    else if (typeof fontFamily === "string") {
        return quoteIfNotGeneric(fontFamily);
    }
    else {
        return fontFamily.map(function (font) {
            if (typeof font === "string") {
                return quoteIfNotGeneric(font);
            }
            else {
                return fontFamily2FontFamilyName(font);
            }
        }).join(",");
    }
}
var GlyphFactory = /** @class */ (function (_super) {
    __extends(GlyphFactory, _super);
    function GlyphFactory(fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
        var _this = _super.call(this, fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) || this;
        _this._glyphAreas = {};
        _this._cssFontFamily = fontFamily2CSSFontFamily(fontFamily);
        // Akashicエンジンは指定されたフォントに利用可能なものが見つからない時
        // `g.FontFamily.SansSerif` を利用する、と仕様して定められている。
        var fallbackFontFamilyName = fontFamily2FontFamilyName(g.FontFamily.SansSerif);
        if (_this._cssFontFamily.indexOf(fallbackFontFamilyName) === -1) {
            _this._cssFontFamily += "," + fallbackFontFamilyName;
        }
        // `this.fontSize`の大きさの文字を描画するためのサーフェスを生成する。
        // 一部の文字は縦横が`this.fontSize`幅の矩形に収まらない。
        // そこで上下左右にマージンを設ける。マージン幅は`this.fontSize`に
        // 0.3 を乗じたものにする。0.3に確たる根拠はないが、検証した範囲では
        // これで十分であることを確認している。
        //
        // strokeWidthサポートに伴い、輪郭線の厚みを加味している。
        _this._marginW = Math.ceil(_this.fontSize * 0.3 + _this.strokeWidth / 2);
        _this._marginH = Math.ceil(_this.fontSize * 0.3 + _this.strokeWidth / 2);
        if (GlyphFactory._environmentMinimumFontSize === undefined) {
            GlyphFactory._environmentMinimumFontSize = _this.measureMinimumFontSize();
        }
        return _this;
    }
    GlyphFactory.prototype.create = function (code) {
        var result;
        var glyphArea = this._glyphAreas[code];
        if (!glyphArea) {
            result = createGlyphRenderedSurface(code, this.fontSize, this._cssFontFamily, this.baselineHeight, this._marginW, this._marginH, true, this.fontColor, this.strokeWidth, this.strokeColor, this.strokeOnly, this.fontWeight);
            glyphArea = calcGlyphArea(result.imageData);
            glyphArea.advanceWidth = result.advanceWidth;
            this._glyphAreas[code] = glyphArea;
        }
        if (isGlyphAreaEmpty(glyphArea)) {
            if (result) {
                result.surface.destroy();
            }
            return new g.Glyph(code, 0, 0, 0, 0, 0, 0, glyphArea.advanceWidth, undefined, true);
        }
        else {
            // g.Glyphに格納するサーフェスを生成する。
            // glyphAreaはサーフェスをキャッシュしないため、描画する内容を持つグリフに対しては
            // サーフェスを生成する。もし前段でcalcGlyphArea()のためのサーフェスを生成して
            // いればここでは生成せずにそれを利用する。
            if (!result) {
                result = createGlyphRenderedSurface(code, this.fontSize, this._cssFontFamily, this.baselineHeight, this._marginW, this._marginH, false, this.fontColor, this.strokeWidth, this.strokeColor, this.strokeOnly, this.fontWeight);
            }
            return new g.Glyph(code, glyphArea.x, glyphArea.y, glyphArea.width, glyphArea.height, glyphArea.x - this._marginW, glyphArea.y - this._marginH, glyphArea.advanceWidth, result.surface, true);
        }
    };
    // 実行環境の描画可能なフォントサイズの最小値を返す
    GlyphFactory.prototype.measureMinimumFontSize = function () {
        var fontSize = 1;
        var str = "M";
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.textAlign = "left";
        context.textBaseline = "alphabetic";
        context.lineJoin = "bevel";
        var preWidth;
        context.font = fontSize + "px sans-serif";
        var width = context.measureText(str).width;
        do {
            preWidth = width;
            fontSize += 1;
            context.font = fontSize + "px sans-serif";
            width = context.measureText(str).width;
        } while (preWidth === width || fontSize > 50); // フォントサイズに対応しない動作環境の場合を考慮して上限値を設ける
        return fontSize;
    };
    return GlyphFactory;
}(g.GlyphFactory));
exports.GlyphFactory = GlyphFactory;

},{"./context2d/Context2DSurface":47,"@akashic/akashic-engine":1}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderingHelper = void 0;
var RenderingHelper;
(function (RenderingHelper) {
    function toPowerOfTwo(x) {
        if ((x & (x - 1)) !== 0) {
            var y = 1;
            while (y < x) {
                y *= 2;
            }
            return y;
        }
        return x;
    }
    RenderingHelper.toPowerOfTwo = toPowerOfTwo;
    function clamp(x) {
        return Math.min(Math.max(x, 0.0), 1.0);
    }
    RenderingHelper.clamp = clamp;
    function usedWebGL(rendererCandidates) {
        var used = false;
        if (rendererCandidates && (0 < rendererCandidates.length)) {
            used = (rendererCandidates[0] === "webgl");
        }
        return used;
    }
    RenderingHelper.usedWebGL = usedWebGL;
})(RenderingHelper = exports.RenderingHelper || (exports.RenderingHelper = {}));

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasRenderingState = void 0;
var AffineTransformer_1 = require("../AffineTransformer");
var CanvasRenderingState = /** @class */ (function () {
    function CanvasRenderingState(crs) {
        if (crs) {
            this.fillStyle = crs.fillStyle;
            this.globalAlpha = crs.globalAlpha;
            this.globalCompositeOperation = crs.globalCompositeOperation;
            this.transformer = new AffineTransformer_1.AffineTransformer(crs.transformer);
        }
        else {
            this.fillStyle = "#000000";
            this.globalAlpha = 1.0;
            this.globalCompositeOperation = "source-over";
            this.transformer = new AffineTransformer_1.AffineTransformer();
        }
    }
    return CanvasRenderingState;
}());
exports.CanvasRenderingState = CanvasRenderingState;

},{"../AffineTransformer":40}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasSurfaceContext = void 0;
var CanvasRenderingState_1 = require("./CanvasRenderingState");
var CanvasSurfaceContext = /** @class */ (function () {
    function CanvasSurfaceContext(context) {
        this._stateStack = [];
        this._modifiedTransform = false;
        this._context = context;
        var state = new CanvasRenderingState_1.CanvasRenderingState();
        this._contextFillStyle = state.fillStyle;
        this._contextGlobalAlpha = state.globalAlpha;
        this._contextGlobalCompositeOperation = state.globalCompositeOperation;
        this.pushState(state);
    }
    Object.defineProperty(CanvasSurfaceContext.prototype, "fillStyle", {
        get: function () {
            return this.currentState().fillStyle;
        },
        set: function (fillStyle) {
            this.currentState().fillStyle = fillStyle;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CanvasSurfaceContext.prototype, "globalAlpha", {
        get: function () {
            return this.currentState().globalAlpha;
        },
        set: function (globalAlpha) {
            this.currentState().globalAlpha = globalAlpha;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CanvasSurfaceContext.prototype, "globalCompositeOperation", {
        get: function () {
            return this.currentState().globalCompositeOperation;
        },
        set: function (operation) {
            this.currentState().globalCompositeOperation = operation;
        },
        enumerable: false,
        configurable: true
    });
    CanvasSurfaceContext.prototype.getCanvasRenderingContext2D = function () {
        return this._context;
    };
    CanvasSurfaceContext.prototype.clearRect = function (x, y, width, height) {
        this.prerender();
        this._context.clearRect(x, y, width, height);
    };
    CanvasSurfaceContext.prototype.save = function () {
        var state = new CanvasRenderingState_1.CanvasRenderingState(this.currentState());
        this.pushState(state);
    };
    CanvasSurfaceContext.prototype.restore = function () {
        this.popState();
    };
    CanvasSurfaceContext.prototype.scale = function (x, y) {
        this.currentState().transformer.scale(x, y);
        this._modifiedTransform = true;
    };
    CanvasSurfaceContext.prototype.drawImage = function (image, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH) {
        this.prerender();
        this._context.drawImage(image, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
    };
    CanvasSurfaceContext.prototype.fillRect = function (x, y, width, height) {
        this.prerender();
        this._context.fillRect(x, y, width, height);
    };
    CanvasSurfaceContext.prototype.fillText = function (text, x, y, maxWidth) {
        this.prerender();
        this._context.fillText(text, x, y, maxWidth);
    };
    CanvasSurfaceContext.prototype.strokeText = function (text, x, y, maxWidth) {
        this.prerender();
        this._context.strokeText(text, x, y, maxWidth);
    };
    CanvasSurfaceContext.prototype.translate = function (x, y) {
        this.currentState().transformer.translate(x, y);
        this._modifiedTransform = true;
    };
    CanvasSurfaceContext.prototype.transform = function (m11, m12, m21, m22, dx, dy) {
        this.currentState().transformer.transform([m11, m12, m21, m22, dx, dy]);
        this._modifiedTransform = true;
    };
    CanvasSurfaceContext.prototype.setTransform = function (m11, m12, m21, m22, dx, dy) {
        this.currentState().transformer.setTransform([m11, m12, m21, m22, dx, dy]);
        this._modifiedTransform = true;
    };
    CanvasSurfaceContext.prototype.setGlobalAlpha = function (globalAlpha) {
        this.currentState().globalAlpha = globalAlpha;
    };
    CanvasSurfaceContext.prototype.getImageData = function (sx, sy, sw, sh) {
        return this._context.getImageData(sx, sy, sw, sh);
    };
    CanvasSurfaceContext.prototype.putImageData = function (imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
        this._context.putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
    };
    CanvasSurfaceContext.prototype.prerender = function () {
        var currentState = this.currentState();
        if (currentState.fillStyle !== this._contextFillStyle) {
            this._context.fillStyle = currentState.fillStyle;
            this._contextFillStyle = currentState.fillStyle;
        }
        if (currentState.globalAlpha !== this._contextGlobalAlpha) {
            this._context.globalAlpha = currentState.globalAlpha;
            this._contextGlobalAlpha = currentState.globalAlpha;
        }
        if (currentState.globalCompositeOperation !== this._contextGlobalCompositeOperation) {
            this._context.globalCompositeOperation = currentState.globalCompositeOperation;
            this._contextGlobalCompositeOperation = currentState.globalCompositeOperation;
        }
        if (this._modifiedTransform) {
            var transformer = currentState.transformer;
            this._context.setTransform(transformer.matrix[0], transformer.matrix[1], transformer.matrix[2], transformer.matrix[3], transformer.matrix[4], transformer.matrix[5]);
            this._modifiedTransform = false;
        }
    };
    CanvasSurfaceContext.prototype.pushState = function (state) {
        this._stateStack.push(state);
    };
    CanvasSurfaceContext.prototype.popState = function () {
        if (this._stateStack.length <= 1) {
            return;
        }
        this._stateStack.pop();
        this._modifiedTransform = true;
        // TODO: `_context` が外部(Context2DRenderer)で破壊されているのでここで値を反映している。本来 `_context` の操作は全てこのクラスに集約すべきである。
        this._contextFillStyle = this._context.fillStyle;
        this._contextGlobalAlpha = this._context.globalAlpha;
        this._contextGlobalCompositeOperation = this._context.globalCompositeOperation;
    };
    CanvasSurfaceContext.prototype.currentState = function () {
        return this._stateStack[this._stateStack.length - 1];
    };
    return CanvasSurfaceContext;
}());
exports.CanvasSurfaceContext = CanvasSurfaceContext;

},{"./CanvasRenderingState":44}],46:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context2DRenderer = void 0;
var g = require("@akashic/akashic-engine");
var Context2DRenderer = /** @class */ (function (_super) {
    __extends(Context2DRenderer, _super);
    function Context2DRenderer(surface) {
        var _this = _super.call(this) || this;
        _this.surface = surface;
        _this.context = surface.context();
        _this.canvasRenderingContext2D = _this.context.getCanvasRenderingContext2D();
        return _this;
    }
    Context2DRenderer.prototype.begin = function () {
        _super.prototype.begin.call(this);
        this.canvasRenderingContext2D.save();
        this.context.save();
    };
    Context2DRenderer.prototype.end = function () {
        this.canvasRenderingContext2D.restore();
        this.context.restore();
        _super.prototype.end.call(this);
    };
    Context2DRenderer.prototype.clear = function () {
        this.context.clearRect(0, 0, this.surface.width, this.surface.height);
    };
    Context2DRenderer.prototype.drawImage = function (surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY) {
        this.context.drawImage(surface._drawable, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, width, height);
    };
    Context2DRenderer.prototype.drawSprites = function (surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, count) {
        for (var i = 0; i < count; ++i) {
            this.drawImage(surface, offsetX[i], offsetY[i], width[i], height[i], canvasOffsetX[i], canvasOffsetY[i]);
        }
    };
    Context2DRenderer.prototype.drawSystemText = function (text, x, y, maxWidth, fontSize, textAlign, textBaseline, textColor, fontFamily, strokeWidth, strokeColor, strokeOnly) {
        var context = this.canvasRenderingContext2D;
        var fontFamilyValue;
        var textAlignValue;
        var textBaselineValue;
        this.context.prerender();
        context.save();
        switch (fontFamily) {
            case g.FontFamily.Monospace:
                fontFamilyValue = "monospace";
                break;
            case g.FontFamily.Serif:
                fontFamilyValue = "serif";
                break;
            default:
                fontFamilyValue = "sans-serif";
                break;
        }
        context.font = fontSize + "px " + fontFamilyValue;
        switch (textAlign) {
            case g.TextAlign.Right:
                textAlignValue = "right";
                break;
            case g.TextAlign.Center:
                textAlignValue = "center";
                break;
            default:
                textAlignValue = "left";
                break;
        }
        context.textAlign = textAlignValue;
        switch (textBaseline) {
            case g.TextBaseline.Top:
                textBaselineValue = "top";
                break;
            case g.TextBaseline.Middle:
                textBaselineValue = "middle";
                break;
            case g.TextBaseline.Bottom:
                textBaselineValue = "bottom";
                break;
            default:
                textBaselineValue = "alphabetic";
                break;
        }
        context.textBaseline = textBaselineValue;
        context.lineJoin = "bevel";
        if (strokeWidth > 0) {
            context.lineWidth = strokeWidth;
            context.strokeStyle = strokeColor;
            if (typeof maxWidth === "undefined") {
                context.strokeText(text, x, y);
            }
            else {
                context.strokeText(text, x, y, maxWidth);
            }
        }
        if (!strokeOnly) {
            context.fillStyle = textColor;
            context.fillText(text, x, y, maxWidth);
        }
        context.restore();
    };
    Context2DRenderer.prototype.translate = function (x, y) {
        this.context.translate(x, y);
    };
    Context2DRenderer.prototype.transform = function (matrix) {
        this.context.transform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
    };
    Context2DRenderer.prototype.opacity = function (opacity) {
        // Note:globalAlphaの初期値が1であることは仕様上保証されているため、常に掛け合わせる
        this.context.globalAlpha *= opacity;
    };
    Context2DRenderer.prototype.save = function () {
        this.context.save();
    };
    Context2DRenderer.prototype.restore = function () {
        this.context.restore();
    };
    Context2DRenderer.prototype.fillRect = function (x, y, width, height, cssColor) {
        this.context.fillStyle = cssColor;
        this.context.fillRect(x, y, width, height);
    };
    Context2DRenderer.prototype.setCompositeOperation = function (operation) {
        var operationText;
        switch (operation) {
            case g.CompositeOperation.SourceAtop:
                operationText = "source-atop";
                break;
            case g.CompositeOperation.Lighter:
                operationText = "lighter";
                break;
            case g.CompositeOperation.Copy:
                operationText = "copy";
                break;
            case g.CompositeOperation.ExperimentalSourceIn:
                operationText = "source-in";
                break;
            case g.CompositeOperation.ExperimentalSourceOut:
                operationText = "source-out";
                break;
            case g.CompositeOperation.ExperimentalDestinationAtop:
                operationText = "destination-atop";
                break;
            case g.CompositeOperation.ExperimentalDestinationIn:
                operationText = "destination-in";
                break;
            case g.CompositeOperation.DestinationOut:
                operationText = "destination-out";
                break;
            case g.CompositeOperation.DestinationOver:
                operationText = "destination-over";
                break;
            case g.CompositeOperation.Xor:
                operationText = "xor";
                break;
            default:
                operationText = "source-over";
                break;
        }
        this.context.globalCompositeOperation = operationText;
    };
    Context2DRenderer.prototype.setOpacity = function (opacity) {
        this.context.globalAlpha = opacity;
    };
    Context2DRenderer.prototype.setTransform = function (matrix) {
        this.context.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
    };
    Context2DRenderer.prototype.setShaderProgram = function (shaderProgram) {
        throw g.ExceptionFactory.createAssertionError("Context2DRenderer#setShaderProgram() is not implemented");
    };
    Context2DRenderer.prototype.isSupportedShaderProgram = function () {
        return false;
    };
    Context2DRenderer.prototype._getImageData = function (sx, sy, sw, sh) {
        return this.context.getImageData(sx, sy, sw, sh);
    };
    Context2DRenderer.prototype._putImageData = function (imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
        if (dirtyX === void 0) { dirtyX = 0; }
        if (dirtyY === void 0) { dirtyY = 0; }
        if (dirtyWidth === void 0) { dirtyWidth = imageData.width; }
        if (dirtyHeight === void 0) { dirtyHeight = imageData.height; }
        this.context.putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
    };
    return Context2DRenderer;
}(g.Renderer));
exports.Context2DRenderer = Context2DRenderer;

},{"@akashic/akashic-engine":1}],47:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context2DSurface = void 0;
var Context2DRenderer_1 = require("./Context2DRenderer");
var CanvasSurfaceContext_1 = require("./CanvasSurfaceContext");
var CanvasSurface_1 = require("../CanvasSurface");
var Context2DSurface = /** @class */ (function (_super) {
    __extends(Context2DSurface, _super);
    function Context2DSurface() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Context2DSurface.prototype.context = function () {
        if (!this._context) {
            this._context = new CanvasSurfaceContext_1.CanvasSurfaceContext(this.canvas.getContext("2d"));
        }
        return this._context;
    };
    Context2DSurface.prototype.renderer = function () {
        if (!this._renderer) {
            this._renderer = new Context2DRenderer_1.Context2DRenderer(this);
        }
        return this._renderer;
    };
    Context2DSurface.prototype.changePhysicalScale = function (xScale, yScale) {
        this.canvas.width = this.width * xScale;
        this.canvas.height = this.height * yScale;
        this._context.scale(xScale, yScale);
    };
    Context2DSurface.prototype.isPlaying = function () {
        return false;
    };
    return Context2DSurface;
}(CanvasSurface_1.CanvasSurface));
exports.Context2DSurface = Context2DSurface;

},{"../CanvasSurface":41,"./CanvasSurfaceContext":45,"./Context2DRenderer":46}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurfaceFactory = void 0;
var RenderingHelper_1 = require("../RenderingHelper");
var Context2DSurface_1 = require("../context2d/Context2DSurface");
var WebGLSharedObject_1 = require("../webgl/WebGLSharedObject");
var SurfaceFactory = /** @class */ (function () {
    function SurfaceFactory() {
    }
    SurfaceFactory.prototype.createPrimarySurface = function (width, height, rendererCandidates) {
        if (RenderingHelper_1.RenderingHelper.usedWebGL(rendererCandidates)) {
            if (!this._shared) {
                this._shared = new WebGLSharedObject_1.WebGLSharedObject(width, height);
            }
            return this._shared.getPrimarySurface();
        }
        else {
            return new Context2DSurface_1.Context2DSurface(width, height);
        }
    };
    SurfaceFactory.prototype.createBackSurface = function (width, height, rendererCandidates) {
        if (RenderingHelper_1.RenderingHelper.usedWebGL(rendererCandidates)) {
            return this._shared.createBackSurface(width, height);
        }
        else {
            return new Context2DSurface_1.Context2DSurface(width, height);
        }
    };
    return SurfaceFactory;
}());
exports.SurfaceFactory = SurfaceFactory;

},{"../RenderingHelper":43,"../context2d/Context2DSurface":47,"../webgl/WebGLSharedObject":57}],49:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLBackSurface = void 0;
var WebGLBackSurfaceRenderer_1 = require("./WebGLBackSurfaceRenderer");
var WebGLPrimarySurface_1 = require("./WebGLPrimarySurface");
var WebGLBackSurface = /** @class */ (function (_super) {
    __extends(WebGLBackSurface, _super);
    function WebGLBackSurface() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // override
    WebGLBackSurface.prototype.renderer = function () {
        if (!this._renderer) {
            this._renderer = new WebGLBackSurfaceRenderer_1.WebGLBackSurfaceRenderer(this, this._shared);
        }
        return this._renderer;
    };
    WebGLBackSurface.prototype.destroy = function () {
        if (this._renderer) {
            this._renderer.destroy();
        }
        this._renderer = undefined;
        this._drawable = undefined;
        _super.prototype.destroy.call(this);
    };
    return WebGLBackSurface;
}(WebGLPrimarySurface_1.WebGLPrimarySurface));
exports.WebGLBackSurface = WebGLBackSurface;

},{"./WebGLBackSurfaceRenderer":50,"./WebGLPrimarySurface":52}],50:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLBackSurfaceRenderer = void 0;
var WebGLRenderer_1 = require("./WebGLRenderer");
var WebGLRenderingState_1 = require("./WebGLRenderingState");
var WebGLBackSurfaceRenderer = /** @class */ (function (_super) {
    __extends(WebGLBackSurfaceRenderer, _super);
    function WebGLBackSurfaceRenderer(surface, shared) {
        var _this = _super.call(this, shared, shared.createRenderTarget(surface.width, surface.height)) || this;
        surface._drawable = {
            texture: _this._renderTarget.texture,
            textureOffsetX: 0,
            textureOffsetY: 0,
            textureWidth: surface.width,
            textureHeight: surface.height
        };
        return _this;
    }
    WebGLBackSurfaceRenderer.prototype.begin = function () {
        _super.prototype.begin.call(this);
        // Canvas座標系とWebGL座標系の相互変換
        // height は描画対象の高さを与える
        this.save();
        var rs = new WebGLRenderingState_1.WebGLRenderingState(this.currentState());
        var matrix = rs.transformer.matrix;
        matrix[1] *= -1;
        matrix[3] *= -1;
        matrix[5] = -matrix[5] + this._renderTarget.height;
        this.currentState().copyFrom(rs);
        this._shared.pushRenderTarget(this._renderTarget);
    };
    WebGLBackSurfaceRenderer.prototype.end = function () {
        this.restore();
        this._shared.popRenderTarget();
        _super.prototype.end.call(this);
    };
    return WebGLBackSurfaceRenderer;
}(WebGLRenderer_1.WebGLRenderer));
exports.WebGLBackSurfaceRenderer = WebGLBackSurfaceRenderer;

},{"./WebGLRenderer":54,"./WebGLRenderingState":55}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLColor = void 0;
var RenderingHelper_1 = require("../RenderingHelper");
var WebGLColor;
(function (WebGLColor) {
    WebGLColor.colorMap = {
        "ALICEBLUE": [0xF0 / 255.0, 0xF8 / 255.0, 0xFF / 255.0, 1.0],
        "ANTIQUEWHITE": [0xFA / 255.0, 0xEB / 255.0, 0xD7 / 255.0, 1.0],
        "AQUA": [0x00 / 255.0, 0xFF / 255.0, 0xFF / 255.0, 1.0],
        "AQUAMARINE": [0x7F / 255.0, 0xFF / 255.0, 0xD4 / 255.0, 1.0],
        "AZURE": [0xF0 / 255.0, 0xFF / 255.0, 0xFF / 255.0, 1.0],
        "BEIGE": [0xF5 / 255.0, 0xF5 / 255.0, 0xDC / 255.0, 1.0],
        "BISQUE": [0xFF / 255.0, 0xE4 / 255.0, 0xC4 / 255.0, 1.0],
        "BLACK": [0x00 / 255.0, 0x00 / 255.0, 0x00 / 255.0, 1.0],
        "BLANCHEDALMOND": [0xFF / 255.0, 0xEB / 255.0, 0xCD / 255.0, 1.0],
        "BLUE": [0x00 / 255.0, 0x00 / 255.0, 0xFF / 255.0, 1.0],
        "BLUEVIOLET": [0x8A / 255.0, 0x2B / 255.0, 0xE2 / 255.0, 1.0],
        "BROWN": [0xA5 / 255.0, 0x2A / 255.0, 0x2A / 255.0, 1.0],
        "BURLYWOOD": [0xDE / 255.0, 0xB8 / 255.0, 0x87 / 255.0, 1.0],
        "CADETBLUE": [0x5F / 255.0, 0x9E / 255.0, 0xA0 / 255.0, 1.0],
        "CHARTREUSE": [0x7F / 255.0, 0xFF / 255.0, 0x00 / 255.0, 1.0],
        "CHOCOLATE": [0xD2 / 255.0, 0x69 / 255.0, 0x1E / 255.0, 1.0],
        "CORAL": [0xFF / 255.0, 0x7F / 255.0, 0x50 / 255.0, 1.0],
        "CORNFLOWERBLUE": [0x64 / 255.0, 0x95 / 255.0, 0xED / 255.0, 1.0],
        "CORNSILK": [0xFF / 255.0, 0xF8 / 255.0, 0xDC / 255.0, 1.0],
        "CRIMSON": [0xDC / 255.0, 0x14 / 255.0, 0x3C / 255.0, 1.0],
        "CYAN": [0x00 / 255.0, 0xFF / 255.0, 0xFF / 255.0, 1.0],
        "DARKBLUE": [0x00 / 255.0, 0x00 / 255.0, 0x8B / 255.0, 1.0],
        "DARKCYAN": [0x00 / 255.0, 0x8B / 255.0, 0x8B / 255.0, 1.0],
        "DARKGOLDENROD": [0xB8 / 255.0, 0x86 / 255.0, 0x0B / 255.0, 1.0],
        "DARKGRAY": [0xA9 / 255.0, 0xA9 / 255.0, 0xA9 / 255.0, 1.0],
        "DARKGREEN": [0x00 / 255.0, 0x64 / 255.0, 0x00 / 255.0, 1.0],
        "DARKGREY": [0xA9 / 255.0, 0xA9 / 255.0, 0xA9 / 255.0, 1.0],
        "DARKKHAKI": [0xBD / 255.0, 0xB7 / 255.0, 0x6B / 255.0, 1.0],
        "DARKMAGENTA": [0x8B / 255.0, 0x00 / 255.0, 0x8B / 255.0, 1.0],
        "DARKOLIVEGREEN": [0x55 / 255.0, 0x6B / 255.0, 0x2F / 255.0, 1.0],
        "DARKORANGE": [0xFF / 255.0, 0x8C / 255.0, 0x00 / 255.0, 1.0],
        "DARKORCHID": [0x99 / 255.0, 0x32 / 255.0, 0xCC / 255.0, 1.0],
        "DARKRED": [0x8B / 255.0, 0x00 / 255.0, 0x00 / 255.0, 1.0],
        "DARKSALMON": [0xE9 / 255.0, 0x96 / 255.0, 0x7A / 255.0, 1.0],
        "DARKSEAGREEN": [0x8F / 255.0, 0xBC / 255.0, 0x8F / 255.0, 1.0],
        "DARKSLATEBLUE": [0x48 / 255.0, 0x3D / 255.0, 0x8B / 255.0, 1.0],
        "DARKSLATEGRAY": [0x2F / 255.0, 0x4F / 255.0, 0x4F / 255.0, 1.0],
        "DARKSLATEGREY": [0x2F / 255.0, 0x4F / 255.0, 0x4F / 255.0, 1.0],
        "DARKTURQUOISE": [0x00 / 255.0, 0xCE / 255.0, 0xD1 / 255.0, 1.0],
        "DARKVIOLET": [0x94 / 255.0, 0x00 / 255.0, 0xD3 / 255.0, 1.0],
        "DEEPPINK": [0xFF / 255.0, 0x14 / 255.0, 0x93 / 255.0, 1.0],
        "DEEPSKYBLUE": [0x00 / 255.0, 0xBF / 255.0, 0xFF / 255.0, 1.0],
        "DIMGRAY": [0x69 / 255.0, 0x69 / 255.0, 0x69 / 255.0, 1.0],
        "DIMGREY": [0x69 / 255.0, 0x69 / 255.0, 0x69 / 255.0, 1.0],
        "DODGERBLUE": [0x1E / 255.0, 0x90 / 255.0, 0xFF / 255.0, 1.0],
        "FIREBRICK": [0xB2 / 255.0, 0x22 / 255.0, 0x22 / 255.0, 1.0],
        "FLORALWHITE": [0xFF / 255.0, 0xFA / 255.0, 0xF0 / 255.0, 1.0],
        "FORESTGREEN": [0x22 / 255.0, 0x8B / 255.0, 0x22 / 255.0, 1.0],
        "FUCHSIA": [0xFF / 255.0, 0x00 / 255.0, 0xFF / 255.0, 1.0],
        "GAINSBORO": [0xDC / 255.0, 0xDC / 255.0, 0xDC / 255.0, 1.0],
        "GHOSTWHITE": [0xF8 / 255.0, 0xF8 / 255.0, 0xFF / 255.0, 1.0],
        "GOLD": [0xFF / 255.0, 0xD7 / 255.0, 0x00 / 255.0, 1.0],
        "GOLDENROD": [0xDA / 255.0, 0xA5 / 255.0, 0x20 / 255.0, 1.0],
        "GRAY": [0x80 / 255.0, 0x80 / 255.0, 0x80 / 255.0, 1.0],
        "GREEN": [0x00 / 255.0, 0x80 / 255.0, 0x00 / 255.0, 1.0],
        "GREENYELLOW": [0xAD / 255.0, 0xFF / 255.0, 0x2F / 255.0, 1.0],
        "GREY": [0x80 / 255.0, 0x80 / 255.0, 0x80 / 255.0, 1.0],
        "HONEYDEW": [0xF0 / 255.0, 0xFF / 255.0, 0xF0 / 255.0, 1.0],
        "HOTPINK": [0xFF / 255.0, 0x69 / 255.0, 0xB4 / 255.0, 1.0],
        "INDIANRED": [0xCD / 255.0, 0x5C / 255.0, 0x5C / 255.0, 1.0],
        "INDIGO": [0x4B / 255.0, 0x00 / 255.0, 0x82 / 255.0, 1.0],
        "IVORY": [0xFF / 255.0, 0xFF / 255.0, 0xF0 / 255.0, 1.0],
        "KHAKI": [0xF0 / 255.0, 0xE6 / 255.0, 0x8C / 255.0, 1.0],
        "LAVENDER": [0xE6 / 255.0, 0xE6 / 255.0, 0xFA / 255.0, 1.0],
        "LAVENDERBLUSH": [0xFF / 255.0, 0xF0 / 255.0, 0xF5 / 255.0, 1.0],
        "LAWNGREEN": [0x7C / 255.0, 0xFC / 255.0, 0x00 / 255.0, 1.0],
        "LEMONCHIFFON": [0xFF / 255.0, 0xFA / 255.0, 0xCD / 255.0, 1.0],
        "LIGHTBLUE": [0xAD / 255.0, 0xD8 / 255.0, 0xE6 / 255.0, 1.0],
        "LIGHTCORAL": [0xF0 / 255.0, 0x80 / 255.0, 0x80 / 255.0, 1.0],
        "LIGHTCYAN": [0xE0 / 255.0, 0xFF / 255.0, 0xFF / 255.0, 1.0],
        "LIGHTGOLDENRODYELLOW": [0xFA / 255.0, 0xFA / 255.0, 0xD2 / 255.0, 1.0],
        "LIGHTGRAY": [0xD3 / 255.0, 0xD3 / 255.0, 0xD3 / 255.0, 1.0],
        "LIGHTGREEN": [0x90 / 255.0, 0xEE / 255.0, 0x90 / 255.0, 1.0],
        "LIGHTGREY": [0xD3 / 255.0, 0xD3 / 255.0, 0xD3 / 255.0, 1.0],
        "LIGHTPINK": [0xFF / 255.0, 0xB6 / 255.0, 0xC1 / 255.0, 1.0],
        "LIGHTSALMON": [0xFF / 255.0, 0xA0 / 255.0, 0x7A / 255.0, 1.0],
        "LIGHTSEAGREEN": [0x20 / 255.0, 0xB2 / 255.0, 0xAA / 255.0, 1.0],
        "LIGHTSKYBLUE": [0x87 / 255.0, 0xCE / 255.0, 0xFA / 255.0, 1.0],
        "LIGHTSLATEGRAY": [0x77 / 255.0, 0x88 / 255.0, 0x99 / 255.0, 1.0],
        "LIGHTSLATEGREY": [0x77 / 255.0, 0x88 / 255.0, 0x99 / 255.0, 1.0],
        "LIGHTSTEELBLUE": [0xB0 / 255.0, 0xC4 / 255.0, 0xDE / 255.0, 1.0],
        "LIGHTYELLOW": [0xFF / 255.0, 0xFF / 255.0, 0xE0 / 255.0, 1.0],
        "LIME": [0x00 / 255.0, 0xFF / 255.0, 0x00 / 255.0, 1.0],
        "LIMEGREEN": [0x32 / 255.0, 0xCD / 255.0, 0x32 / 255.0, 1.0],
        "LINEN": [0xFA / 255.0, 0xF0 / 255.0, 0xE6 / 255.0, 1.0],
        "MAGENTA": [0xFF / 255.0, 0x00 / 255.0, 0xFF / 255.0, 1.0],
        "MAROON": [0x80 / 255.0, 0x00 / 255.0, 0x00 / 255.0, 1.0],
        "MEDIUMAQUAMARINE": [0x66 / 255.0, 0xCD / 255.0, 0xAA / 255.0, 1.0],
        "MEDIUMBLUE": [0x00 / 255.0, 0x00 / 255.0, 0xCD / 255.0, 1.0],
        "MEDIUMORCHID": [0xBA / 255.0, 0x55 / 255.0, 0xD3 / 255.0, 1.0],
        "MEDIUMPURPLE": [0x93 / 255.0, 0x70 / 255.0, 0xDB / 255.0, 1.0],
        "MEDIUMSEAGREEN": [0x3C / 255.0, 0xB3 / 255.0, 0x71 / 255.0, 1.0],
        "MEDIUMSLATEBLUE": [0x7B / 255.0, 0x68 / 255.0, 0xEE / 255.0, 1.0],
        "MEDIUMSPRINGGREEN": [0x00 / 255.0, 0xFA / 255.0, 0x9A / 255.0, 1.0],
        "MEDIUMTURQUOISE": [0x48 / 255.0, 0xD1 / 255.0, 0xCC / 255.0, 1.0],
        "MEDIUMVIOLETRED": [0xC7 / 255.0, 0x15 / 255.0, 0x85 / 255.0, 1.0],
        "MIDNIGHTBLUE": [0x19 / 255.0, 0x19 / 255.0, 0x70 / 255.0, 1.0],
        "MINTCREAM": [0xF5 / 255.0, 0xFF / 255.0, 0xFA / 255.0, 1.0],
        "MISTYROSE": [0xFF / 255.0, 0xE4 / 255.0, 0xE1 / 255.0, 1.0],
        "MOCCASIN": [0xFF / 255.0, 0xE4 / 255.0, 0xB5 / 255.0, 1.0],
        "NAVAJOWHITE": [0xFF / 255.0, 0xDE / 255.0, 0xAD / 255.0, 1.0],
        "NAVY": [0x00 / 255.0, 0x00 / 255.0, 0x80 / 255.0, 1.0],
        "OLDLACE": [0xFD / 255.0, 0xF5 / 255.0, 0xE6 / 255.0, 1.0],
        "OLIVE": [0x80 / 255.0, 0x80 / 255.0, 0x00 / 255.0, 1.0],
        "OLIVEDRAB": [0x6B / 255.0, 0x8E / 255.0, 0x23 / 255.0, 1.0],
        "ORANGE": [0xFF / 255.0, 0xA5 / 255.0, 0x00 / 255.0, 1.0],
        "ORANGERED": [0xFF / 255.0, 0x45 / 255.0, 0x00 / 255.0, 1.0],
        "ORCHID": [0xDA / 255.0, 0x70 / 255.0, 0xD6 / 255.0, 1.0],
        "PALEGOLDENROD": [0xEE / 255.0, 0xE8 / 255.0, 0xAA / 255.0, 1.0],
        "PALEGREEN": [0x98 / 255.0, 0xFB / 255.0, 0x98 / 255.0, 1.0],
        "PALETURQUOISE": [0xAF / 255.0, 0xEE / 255.0, 0xEE / 255.0, 1.0],
        "PALEVIOLETRED": [0xDB / 255.0, 0x70 / 255.0, 0x93 / 255.0, 1.0],
        "PAPAYAWHIP": [0xFF / 255.0, 0xEF / 255.0, 0xD5 / 255.0, 1.0],
        "PEACHPUFF": [0xFF / 255.0, 0xDA / 255.0, 0xB9 / 255.0, 1.0],
        "PERU": [0xCD / 255.0, 0x85 / 255.0, 0x3F / 255.0, 1.0],
        "PINK": [0xFF / 255.0, 0xC0 / 255.0, 0xCB / 255.0, 1.0],
        "PLUM": [0xDD / 255.0, 0xA0 / 255.0, 0xDD / 255.0, 1.0],
        "POWDERBLUE": [0xB0 / 255.0, 0xE0 / 255.0, 0xE6 / 255.0, 1.0],
        "PURPLE": [0x80 / 255.0, 0x00 / 255.0, 0x80 / 255.0, 1.0],
        "RED": [0xFF / 255.0, 0x00 / 255.0, 0x00 / 255.0, 1.0],
        "ROSYBROWN": [0xBC / 255.0, 0x8F / 255.0, 0x8F / 255.0, 1.0],
        "ROYALBLUE": [0x41 / 255.0, 0x69 / 255.0, 0xE1 / 255.0, 1.0],
        "SADDLEBROWN": [0x8B / 255.0, 0x45 / 255.0, 0x13 / 255.0, 1.0],
        "SALMON": [0xFA / 255.0, 0x80 / 255.0, 0x72 / 255.0, 1.0],
        "SANDYBROWN": [0xF4 / 255.0, 0xA4 / 255.0, 0x60 / 255.0, 1.0],
        "SEAGREEN": [0x2E / 255.0, 0x8B / 255.0, 0x57 / 255.0, 1.0],
        "SEASHELL": [0xFF / 255.0, 0xF5 / 255.0, 0xEE / 255.0, 1.0],
        "SIENNA": [0xA0 / 255.0, 0x52 / 255.0, 0x2D / 255.0, 1.0],
        "SILVER": [0xC0 / 255.0, 0xC0 / 255.0, 0xC0 / 255.0, 1.0],
        "SKYBLUE": [0x87 / 255.0, 0xCE / 255.0, 0xEB / 255.0, 1.0],
        "SLATEBLUE": [0x6A / 255.0, 0x5A / 255.0, 0xCD / 255.0, 1.0],
        "SLATEGRAY": [0x70 / 255.0, 0x80 / 255.0, 0x90 / 255.0, 1.0],
        "SLATEGREY": [0x70 / 255.0, 0x80 / 255.0, 0x90 / 255.0, 1.0],
        "SNOW": [0xFF / 255.0, 0xFA / 255.0, 0xFA / 255.0, 1.0],
        "SPRINGGREEN": [0x00 / 255.0, 0xFF / 255.0, 0x7F / 255.0, 1.0],
        "STEELBLUE": [0x46 / 255.0, 0x82 / 255.0, 0xB4 / 255.0, 1.0],
        "TAN": [0xD2 / 255.0, 0xB4 / 255.0, 0x8C / 255.0, 1.0],
        "TEAL": [0x00 / 255.0, 0x80 / 255.0, 0x80 / 255.0, 1.0],
        "THISTLE": [0xD8 / 255.0, 0xBF / 255.0, 0xD8 / 255.0, 1.0],
        "TOMATO": [0xFF / 255.0, 0x63 / 255.0, 0x47 / 255.0, 1.0],
        "TURQUOISE": [0x40 / 255.0, 0xE0 / 255.0, 0xD0 / 255.0, 1.0],
        "VIOLET": [0xEE / 255.0, 0x82 / 255.0, 0xEE / 255.0, 1.0],
        "WHEAT": [0xF5 / 255.0, 0xDE / 255.0, 0xB3 / 255.0, 1.0],
        "WHITE": [0xFF / 255.0, 0xFF / 255.0, 0xFF / 255.0, 1.0],
        "WHITESMOKE": [0xF5 / 255.0, 0xF5 / 255.0, 0xF5 / 255.0, 1.0],
        "YELLOW": [0xFF / 255.0, 0xFF / 255.0, 0x00 / 255.0, 1.0],
        "YELLOWGREEN": [0x9A / 255.0, 0xCD / 255.0, 0x32 / 255.0, 1.0]
    };
    function get(color) {
        var rgba = (typeof color === "string") ? WebGLColor._toColor(color) : [color[0], color[1], color[2], color[3]];
        rgba[3] = RenderingHelper_1.RenderingHelper.clamp(rgba[3]);
        rgba[0] = RenderingHelper_1.RenderingHelper.clamp(rgba[0]) * rgba[3];
        rgba[1] = RenderingHelper_1.RenderingHelper.clamp(rgba[1]) * rgba[3];
        rgba[2] = RenderingHelper_1.RenderingHelper.clamp(rgba[2]) * rgba[3];
        return rgba;
    }
    WebGLColor.get = get;
    function _hsl2rgb(hsl) {
        var h = hsl[0] % 360;
        var s = hsl[1];
        var l = (hsl[2] > 50) ? 100 - hsl[2] : hsl[2];
        var a = hsl[3];
        var max = l + l * s;
        var min = l - l * s;
        if (h < 60) {
            return [max, (h / 60.0) * (max - min) + min, min, a];
        }
        else if (h < 120) {
            return [((120 - h) / 60.0) * (max - min) + min, max, min, a];
        }
        else if (h < 180) {
            return [min, max, ((h - 120) / 60.0) * (max - min) + min, a];
        }
        else if (h < 240) {
            return [min, ((240 - h) / 60.0) * (max - min) + min, max, a];
        }
        else if (h < 300) {
            return [((h - 240) / 60.0) * (max - min) + min, min, max, a];
        }
        else {
            return [max, min, ((360 - h) / 60.0) * (max - min) + min, a];
        }
    }
    WebGLColor._hsl2rgb = _hsl2rgb;
    function _toColor(cssColor) {
        // 大文字化して空白を削除 (ncc: normalized css color)
        var ncc = cssColor.toUpperCase().replace(/\s+/g, "");
        var rgba = WebGLColor.colorMap[ncc];
        if (rgba) {
            return rgba;
        }
        if (ncc.match(/^#([\dA-F])([\dA-F])([\dA-F])$/)) {
            return [
                parseInt(RegExp.$1, 16) / 15.0,
                parseInt(RegExp.$2, 16) / 15.0,
                parseInt(RegExp.$3, 16) / 15.0, 1.0
            ];
        }
        else if (ncc.match(/^#([\dA-F]{2})([\dA-F]{2})([\dA-F]{2})$/)) {
            return [
                parseInt(RegExp.$1, 16) / 255.0,
                parseInt(RegExp.$2, 16) / 255.0,
                parseInt(RegExp.$3, 16) / 255.0, 1.0
            ];
        }
        else if (ncc.match(/^RGB\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/)) {
            return [
                parseInt(RegExp.$1, 10) / 255.0,
                parseInt(RegExp.$2, 10) / 255.0,
                parseInt(RegExp.$3, 10) / 255.0, 1.0
            ];
        }
        else if (ncc.match(/^RGBA\((\d{1,3}),(\d{1,3}),(\d{1,3}),(\d(\.\d*)?)\)$/)) {
            return [
                parseInt(RegExp.$1, 10) / 255.0,
                parseInt(RegExp.$2, 10) / 255.0,
                parseInt(RegExp.$3, 10) / 255.0,
                parseFloat(RegExp.$4)
            ];
        }
        else if (ncc.match(/^HSL\((\d{1,3}),(\d{1,3})%,(\d{1,3})%\)$/)) {
            return WebGLColor._hsl2rgb([
                parseInt(RegExp.$1, 10),
                RenderingHelper_1.RenderingHelper.clamp(parseInt(RegExp.$2, 10) / 100.0),
                RenderingHelper_1.RenderingHelper.clamp(parseInt(RegExp.$3, 10) / 100.0), 1.0
            ]);
        }
        else if (ncc.match(/^HSLA\((\d{1,3}),(\d{1,3})%,(\d{1,3})%,(\d(\.\d*)?)\)$/)) {
            return WebGLColor._hsl2rgb([
                parseInt(RegExp.$1, 10),
                RenderingHelper_1.RenderingHelper.clamp(parseInt(RegExp.$2, 10) / 100.0),
                RenderingHelper_1.RenderingHelper.clamp(parseInt(RegExp.$3, 10) / 100.0),
                parseFloat(RegExp.$4)
            ]);
        }
        else {
            throw Error("illigal cssColor format: " + ncc);
        }
    }
    WebGLColor._toColor = _toColor;
})(WebGLColor = exports.WebGLColor || (exports.WebGLColor = {}));

},{"../RenderingHelper":43}],52:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLPrimarySurface = void 0;
var CanvasSurface_1 = require("../CanvasSurface");
var WebGLPrimarySurfaceRenderer_1 = require("./WebGLPrimarySurfaceRenderer");
var WebGLPrimarySurface = /** @class */ (function (_super) {
    __extends(WebGLPrimarySurface, _super);
    function WebGLPrimarySurface(shared, width, height) {
        var _this = _super.call(this, width, height) || this;
        _this.canvas.style.position = "absolute";
        _this._shared = shared;
        return _this;
    }
    WebGLPrimarySurface.prototype.renderer = function () {
        if (!this._renderer) {
            this._renderer = new WebGLPrimarySurfaceRenderer_1.WebGLPrimarySurfaceRenderer(this._shared, this._shared.getPrimaryRenderTarget(this.width, this.height));
        }
        return this._renderer;
    };
    // override
    WebGLPrimarySurface.prototype.changePhysicalScale = function (xScale, yScale) {
        var width = Math.ceil(this.width * xScale);
        var height = Math.ceil(this.height * yScale);
        this.canvas.width = width;
        this.canvas.height = height;
        this.renderer().changeViewportSize(width, height);
    };
    WebGLPrimarySurface.prototype.isPlaying = function () {
        return false;
    };
    return WebGLPrimarySurface;
}(CanvasSurface_1.CanvasSurface));
exports.WebGLPrimarySurface = WebGLPrimarySurface;

},{"../CanvasSurface":41,"./WebGLPrimarySurfaceRenderer":53}],53:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLPrimarySurfaceRenderer = void 0;
var WebGLRenderer_1 = require("./WebGLRenderer");
var WebGLPrimarySurfaceRenderer = /** @class */ (function (_super) {
    __extends(WebGLPrimarySurfaceRenderer, _super);
    function WebGLPrimarySurfaceRenderer(shared, renderTarget) {
        var _this = _super.call(this, shared, renderTarget) || this;
        _this._shared.pushRenderTarget(_this._renderTarget);
        return _this;
    }
    WebGLPrimarySurfaceRenderer.prototype.begin = function () {
        _super.prototype.begin.call(this);
        this._shared.begin();
    };
    return WebGLPrimarySurfaceRenderer;
}(WebGLRenderer_1.WebGLRenderer));
exports.WebGLPrimarySurfaceRenderer = WebGLPrimarySurfaceRenderer;

},{"./WebGLRenderer":54}],54:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLRenderer = void 0;
var g = require("@akashic/akashic-engine");
var WebGLColor_1 = require("./WebGLColor");
var WebGLRenderingState_1 = require("./WebGLRenderingState");
var WebGLRenderer = /** @class */ (function (_super) {
    __extends(WebGLRenderer, _super);
    function WebGLRenderer(shared, renderTarget) {
        var _this = _super.call(this) || this;
        _this._stateStack = [];
        _this._stateStackPointer = 0;
        _this._capacity = 0;
        _this._reallocation(WebGLRenderer.DEFAULT_CAPACITY);
        _this._whiteColor = [1.0, 1.0, 1.0, 1.0];
        _this._shared = shared;
        _this._renderTarget = renderTarget;
        return _this;
    }
    WebGLRenderer.prototype.clear = function () {
        this._shared.clear();
    };
    WebGLRenderer.prototype.end = function () {
        this._shared.end();
    };
    WebGLRenderer.prototype.save = function () {
        this._pushState();
    };
    WebGLRenderer.prototype.restore = function () {
        this._popState();
    };
    WebGLRenderer.prototype.translate = function (x, y) {
        this.currentState().transformer.translate(x, y);
    };
    WebGLRenderer.prototype.transform = function (matrix) {
        this.currentState().transformer.transform(matrix);
    };
    WebGLRenderer.prototype.opacity = function (opacity) {
        this.currentState().globalAlpha *= opacity;
    };
    WebGLRenderer.prototype.setCompositeOperation = function (operation) {
        this.currentState().globalCompositeOperation = operation;
    };
    WebGLRenderer.prototype.currentState = function () {
        return this._stateStack[this._stateStackPointer];
    };
    WebGLRenderer.prototype.fillRect = function (x, y, width, height, cssColor) {
        this._shared.draw(this.currentState(), this._shared.getFillRectSurfaceTexture(), 0, 0, width, height, x, y, WebGLColor_1.WebGLColor.get(cssColor));
    };
    WebGLRenderer.prototype.drawSprites = function (surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, count) {
        for (var i = 0; i < count; ++i) {
            this.drawImage(surface, offsetX[i], offsetY[i], width[i], height[i], canvasOffsetX[i], canvasOffsetY[i]);
        }
    };
    WebGLRenderer.prototype.drawImage = function (surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY) {
        if (!surface._drawable) {
            throw g.ExceptionFactory.createAssertionError("WebGLRenderer#drawImage: no drawable surface.");
        }
        // WebGLTexture でないなら変換する (HTMLVideoElement は対応しない)
        // NOTE: 対象の surface が動画の場合、独立した framebuffer に描画した方がパフォーマンス上優位になり得る
        if (!(surface._drawable.texture instanceof WebGLTexture)) {
            this._shared.makeTextureForSurface(surface);
        }
        if (!surface._drawable.texture) {
            throw g.ExceptionFactory.createAssertionError("WebGLRenderer#drawImage: could not create a texture.");
        }
        this._shared.draw(this.currentState(), surface._drawable, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, this._whiteColor);
    };
    WebGLRenderer.prototype.drawSystemText = function (text, x, y, maxWidth, fontSize, textAlign, textBaseline, textColor, fontFamily, strokeWidth, strokeColor, strokeOnly) {
        // do nothing.
    };
    WebGLRenderer.prototype.setTransform = function (matrix) {
        this.currentState().transformer.setTransform(matrix);
    };
    WebGLRenderer.prototype.setOpacity = function (opacity) {
        this.currentState().globalAlpha = opacity;
    };
    WebGLRenderer.prototype.setShaderProgram = function (shaderProgram) {
        this.currentState().shaderProgram = this._shared.initializeShaderProgram(shaderProgram);
    };
    WebGLRenderer.prototype.isSupportedShaderProgram = function () {
        return true;
    };
    WebGLRenderer.prototype.changeViewportSize = function (width, height) {
        var old = this._renderTarget;
        this._renderTarget = {
            width: old.width,
            height: old.height,
            viewportWidth: width,
            viewportHeight: height,
            texture: old.texture,
            framebuffer: old.framebuffer
        };
    };
    WebGLRenderer.prototype.destroy = function () {
        this._shared.requestDeleteRenderTarget(this._renderTarget);
        this._shared = undefined;
        this._renderTarget = undefined;
        this._whiteColor = undefined;
    };
    WebGLRenderer.prototype._getImageData = function () {
        throw g.ExceptionFactory.createAssertionError("WebGLRenderer#_getImageData() is not implemented");
    };
    WebGLRenderer.prototype._putImageData = function (imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
        throw g.ExceptionFactory.createAssertionError("WebGLRenderer#_putImageData() is not implemented");
    };
    WebGLRenderer.prototype._pushState = function () {
        var old = this.currentState();
        ++this._stateStackPointer;
        if (this._isOverCapacity()) {
            this._reallocation(this._stateStackPointer + 1);
        }
        this.currentState().copyFrom(old);
    };
    WebGLRenderer.prototype._popState = function () {
        if (this._stateStackPointer > 0) {
            this.currentState().shaderProgram = null;
            --this._stateStackPointer;
        }
        else {
            throw g.ExceptionFactory.createAssertionError("WebGLRenderer#restore: state stack under-flow.");
        }
    };
    WebGLRenderer.prototype._isOverCapacity = function () {
        return this._capacity <= this._stateStackPointer;
    };
    WebGLRenderer.prototype._reallocation = function (newCapacity) {
        // 指数的成長ポリシーの再割当:
        var oldCapacity = this._capacity;
        if (oldCapacity < newCapacity) {
            if (newCapacity < (oldCapacity * 2)) {
                this._capacity *= 2;
            }
            else {
                this._capacity = newCapacity;
            }
            for (var i = oldCapacity; i < this._capacity; ++i) {
                this._stateStack.push(new WebGLRenderingState_1.WebGLRenderingState());
            }
        }
    };
    WebGLRenderer.DEFAULT_CAPACITY = 16;
    return WebGLRenderer;
}(g.Renderer));
exports.WebGLRenderer = WebGLRenderer;

},{"./WebGLColor":51,"./WebGLRenderingState":55,"@akashic/akashic-engine":1}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLRenderingState = void 0;
var g = require("@akashic/akashic-engine");
var AffineTransformer_1 = require("../AffineTransformer");
var WebGLRenderingState = /** @class */ (function () {
    function WebGLRenderingState(rhs) {
        if (rhs) {
            this.globalAlpha = rhs.globalAlpha;
            this.globalCompositeOperation = rhs.globalCompositeOperation;
            this.transformer = new AffineTransformer_1.AffineTransformer(rhs.transformer);
            this.shaderProgram = rhs.shaderProgram;
        }
        else {
            this.globalAlpha = 1.0;
            this.globalCompositeOperation = g.CompositeOperation.SourceOver;
            this.transformer = new AffineTransformer_1.AffineTransformer();
            this.shaderProgram = null;
        }
    }
    WebGLRenderingState.prototype.copyFrom = function (rhs) {
        this.globalAlpha = rhs.globalAlpha;
        this.globalCompositeOperation = rhs.globalCompositeOperation;
        this.transformer.copyFrom(rhs.transformer);
        this.shaderProgram = rhs.shaderProgram;
        return this;
    };
    return WebGLRenderingState;
}());
exports.WebGLRenderingState = WebGLRenderingState;

},{"../AffineTransformer":40,"@akashic/akashic-engine":1}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLShaderProgram = void 0;
var g = require("@akashic/akashic-engine");
var WebGLShaderProgram = /** @class */ (function () {
    function WebGLShaderProgram(context, fSrc, uniforms) {
        var vSrc = WebGLShaderProgram._DEFAULT_VERTEX_SHADER;
        var fSrc = fSrc || WebGLShaderProgram._DEFAULT_FRAGMENT_SHADER;
        var program = WebGLShaderProgram._makeShaderProgram(context, vSrc, fSrc);
        this.program = program;
        this._context = context;
        this._aVertex = context.getAttribLocation(this.program, "aVertex");
        this._uColor = context.getUniformLocation(this.program, "uColor");
        this._uAlpha = context.getUniformLocation(this.program, "uAlpha");
        this._uSampler = context.getUniformLocation(this.program, "uSampler");
        this._uniforms = uniforms;
        this._uniformCaches = [];
        this._uniformSetterTable = {
            "float": this._uniform1f.bind(this),
            "int": this._uniform1i.bind(this),
            "float_v": this._uniform1fv.bind(this),
            "int_v": this._uniform1iv.bind(this),
            "vec2": this._uniform2fv.bind(this),
            "vec3": this._uniform3fv.bind(this),
            "vec4": this._uniform4fv.bind(this),
            "ivec2": this._uniform2iv.bind(this),
            "ivec3": this._uniform3iv.bind(this),
            "ivec4": this._uniform4iv.bind(this),
            "mat2": this._uniformMatrix2fv.bind(this),
            "mat3": this._uniformMatrix3fv.bind(this),
            "mat4": this._uniformMatrix4fv.bind(this)
        };
    }
    WebGLShaderProgram._makeShader = function (gl, typ, src) {
        var shader = gl.createShader(typ);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            var msg = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(msg);
        }
        return shader;
    };
    WebGLShaderProgram._makeShaderProgram = function (gl, vSrc, fSrc) {
        var program = gl.createProgram();
        var vShader = WebGLShaderProgram._makeShader(gl, gl.VERTEX_SHADER, vSrc);
        gl.attachShader(program, vShader);
        gl.deleteShader(vShader);
        var fShader = WebGLShaderProgram._makeShader(gl, gl.FRAGMENT_SHADER, fSrc);
        gl.attachShader(program, fShader);
        gl.deleteShader(fShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            var msg = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(msg);
        }
        return program;
    };
    /**
     * シェーダの attribute 変数 aVertex にバッファを登録する。
     * use()/unuse() 間のみで効果がある。
     */
    WebGLShaderProgram.prototype.set_aVertex = function (buffer) {
        this._context.bindBuffer(this._context.ARRAY_BUFFER, buffer);
        this._context.enableVertexAttribArray(this._aVertex);
        this._context.vertexAttribPointer(this._aVertex, 4, this._context.FLOAT, false, 0, 0);
    };
    /**
     * シェーダの uniform 変数 uColor に値を設定する。
     * use()/unuse() 間のみで効果がある。
     */
    WebGLShaderProgram.prototype.set_uColor = function (rgba) {
        this._context.uniform4f(this._uColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    };
    /**
     * シェーダの uniform 変数 uAlpha に値を設定する。
     * use()/unuse() 間のみで効果がある。
     */
    WebGLShaderProgram.prototype.set_uAlpha = function (alpha) {
        this._context.uniform1f(this._uAlpha, alpha);
    };
    /**
     * シェーダの uniform 変数 uSampler にテクスチャステージ番号を設定する。
     * use()/unuse() 間のみで効果がある。
     */
    WebGLShaderProgram.prototype.set_uSampler = function (value) {
        this._context.uniform1i(this._uSampler, value);
    };
    /**
     * ユーザ定義された uniform 値を更新する。
     * use()/unuse() 間のみで効果がある。
     */
    WebGLShaderProgram.prototype.updateUniforms = function () {
        for (var i = 0; i < this._uniformCaches.length; ++i) {
            var cache = this._uniformCaches[i];
            var value = this._uniforms[cache.name].value;
            if (!cache.isArray && value === cache.beforeValue)
                continue;
            cache.update(cache.loc, value);
            cache.beforeValue = value;
        }
    };
    /**
     * ユーザ定義されたシェーダの uniform 変数を初期化する。
     */
    WebGLShaderProgram.prototype.initializeUniforms = function () {
        var _this = this;
        var uniformCaches = [];
        var uniforms = this._uniforms;
        if (uniforms != null) {
            Object.keys(uniforms).forEach(function (k) {
                var type = uniforms[k].type;
                var isArray = !(typeof uniforms[k].value === "number");
                // typeがfloatまたはintで、valueが配列であれば配列としてuniform値を転送する。
                if (isArray && (type === "int" || type === "float")) {
                    type += "_v";
                }
                var update = _this._uniformSetterTable[type];
                if (!update) {
                    throw g.ExceptionFactory.createAssertionError("WebGLShaderProgram#initializeUniforms: Uniform type '" + type + "' is not supported.");
                }
                uniformCaches.push({
                    name: k,
                    update: update,
                    beforeValue: null,
                    isArray: isArray,
                    loc: _this._context.getUniformLocation(_this.program, k)
                });
            });
        }
        this._uniformCaches = uniformCaches;
    };
    /**
     * シェーダを有効化する。
     */
    WebGLShaderProgram.prototype.use = function () {
        this._context.useProgram(this.program);
    };
    /**
     * シェーダを無効化する。
     */
    WebGLShaderProgram.prototype.unuse = function () {
        this._context.useProgram(null);
    };
    WebGLShaderProgram.prototype.destroy = function () {
        this._context.deleteProgram(this.program);
    };
    WebGLShaderProgram.prototype._uniform1f = function (loc, v) {
        this._context.uniform1f(loc, v);
    };
    WebGLShaderProgram.prototype._uniform1i = function (loc, v) {
        this._context.uniform1i(loc, v);
    };
    WebGLShaderProgram.prototype._uniform1fv = function (loc, v) {
        this._context.uniform1fv(loc, v);
    };
    WebGLShaderProgram.prototype._uniform1iv = function (loc, v) {
        this._context.uniform1iv(loc, v);
    };
    WebGLShaderProgram.prototype._uniform2fv = function (loc, v) {
        this._context.uniform2fv(loc, v);
    };
    WebGLShaderProgram.prototype._uniform3fv = function (loc, v) {
        this._context.uniform3fv(loc, v);
    };
    WebGLShaderProgram.prototype._uniform4fv = function (loc, v) {
        this._context.uniform4fv(loc, v);
    };
    WebGLShaderProgram.prototype._uniform2iv = function (loc, v) {
        this._context.uniform2iv(loc, v);
    };
    WebGLShaderProgram.prototype._uniform3iv = function (loc, v) {
        this._context.uniform3iv(loc, v);
    };
    WebGLShaderProgram.prototype._uniform4iv = function (loc, v) {
        this._context.uniform4iv(loc, v);
    };
    WebGLShaderProgram.prototype._uniformMatrix2fv = function (loc, v) {
        this._context.uniformMatrix2fv(loc, false, v);
    };
    WebGLShaderProgram.prototype._uniformMatrix3fv = function (loc, v) {
        this._context.uniformMatrix3fv(loc, false, v);
    };
    WebGLShaderProgram.prototype._uniformMatrix4fv = function (loc, v) {
        this._context.uniformMatrix4fv(loc, false, v);
    };
    WebGLShaderProgram._DEFAULT_VERTEX_SHADER = "#version 100\n" +
        "precision mediump float;\n" +
        "attribute vec4 aVertex;\n" +
        "varying vec2 vTexCoord;\n" +
        "varying vec4 vColor;\n" +
        "uniform vec4 uColor;\n" +
        "uniform float uAlpha;\n" +
        "void main() {" +
        "    gl_Position = vec4(aVertex.xy, 0.0, 1.0);" +
        "    vTexCoord = aVertex.zw;" +
        "    vColor = uColor * uAlpha;" +
        "}";
    WebGLShaderProgram._DEFAULT_FRAGMENT_SHADER = "#version 100\n" +
        "precision mediump float;\n" +
        "varying vec2 vTexCoord;\n" +
        "varying vec4 vColor;\n" +
        "uniform sampler2D uSampler;\n" +
        "void main() {" +
        "    gl_FragColor = texture2D(uSampler, vTexCoord) * vColor;" +
        "}";
    return WebGLShaderProgram;
}());
exports.WebGLShaderProgram = WebGLShaderProgram;

},{"@akashic/akashic-engine":1}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLSharedObject = void 0;
var g = require("@akashic/akashic-engine");
var WebGLShaderProgram_1 = require("./WebGLShaderProgram");
var WebGLTextureAtlas_1 = require("./WebGLTextureAtlas");
var WebGLPrimarySurface_1 = require("./WebGLPrimarySurface");
var WebGLBackSurface_1 = require("./WebGLBackSurface");
var WebGLSharedObject = /** @class */ (function () {
    function WebGLSharedObject(width, height) {
        var surface = new WebGLPrimarySurface_1.WebGLPrimarySurface(this, width, height);
        var context = surface.canvas.getContext("webgl", { depth: false, preserveDrawingBuffer: true });
        if (!context) {
            throw g.ExceptionFactory.createAssertionError("WebGLSharedObject#constructor: could not initialize WebGLRenderingContext");
        }
        this._surface = surface;
        this._context = context;
        this._init();
    }
    WebGLSharedObject.prototype.getFillRectSurfaceTexture = function () {
        return this._fillRectSurfaceTexture;
    };
    WebGLSharedObject.prototype.getPrimarySurface = function () {
        // NOTE: 一つの WebGLSharedObject は一つの primary surface のみを保持するものとする。
        return this._surface;
    };
    WebGLSharedObject.prototype.createBackSurface = function (width, height) {
        return new WebGLBackSurface_1.WebGLBackSurface(this, width, height);
    };
    WebGLSharedObject.prototype.pushRenderTarget = function (renderTarget) {
        this._commit();
        this._renderTargetStack.push(renderTarget);
        this._context.bindFramebuffer(this._context.FRAMEBUFFER, renderTarget.framebuffer);
        this._context.viewport(0, 0, renderTarget.viewportWidth, renderTarget.viewportHeight);
    };
    WebGLSharedObject.prototype.popRenderTarget = function () {
        this._commit();
        this._renderTargetStack.pop();
        var renderTarget = this.getCurrentRenderTarget();
        this._context.bindFramebuffer(this._context.FRAMEBUFFER, renderTarget.framebuffer);
        this._context.viewport(0, 0, renderTarget.viewportWidth, renderTarget.viewportHeight);
    };
    WebGLSharedObject.prototype.getCurrentRenderTarget = function () {
        return this._renderTargetStack[this._renderTargetStack.length - 1];
    };
    WebGLSharedObject.prototype.begin = function () {
        this.clear();
        this._currentShaderProgram.use();
        this._currentShaderProgram.set_aVertex(this._vertices);
        this._currentShaderProgram.set_uColor(this._currentColor);
        this._currentShaderProgram.set_uAlpha(this._currentAlpha);
        this._currentShaderProgram.set_uSampler(0);
        this._currentShaderProgram.updateUniforms();
    };
    WebGLSharedObject.prototype.clear = function () {
        this._context.clear(this._context.COLOR_BUFFER_BIT);
    };
    WebGLSharedObject.prototype.draw = function (state, surfaceTexture, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, color) {
        if (this._numSprites >= this._maxSpriteCount) {
            this._commit();
        }
        var shaderProgram;
        // fillRectの場合はデフォルトのシェーダを利用
        if (surfaceTexture === this._fillRectSurfaceTexture || state.shaderProgram == null || state.shaderProgram._program == null) {
            shaderProgram = this._defaultShaderProgram;
        }
        else {
            shaderProgram = state.shaderProgram._program;
        }
        // シェーダプログラムを設定
        if (this._currentShaderProgram !== shaderProgram) {
            this._commit();
            this._currentShaderProgram = shaderProgram;
            this._currentShaderProgram.use();
            this._currentShaderProgram.updateUniforms();
            // シェーダプログラム変更時は全ての設定をクリア
            this._currentCompositeOperation = null;
            this._currentAlpha = null;
            this._currentColor = [];
            this._currentTexture = null;
        }
        // テクスチャを設定
        if (this._currentTexture !== surfaceTexture.texture) {
            this._currentTexture = surfaceTexture.texture;
            this._commit();
            this._context.bindTexture(this._context.TEXTURE_2D, surfaceTexture.texture);
        }
        // 色を設定
        if (this._currentColor[0] !== color[0] ||
            this._currentColor[1] !== color[1] ||
            this._currentColor[2] !== color[2] ||
            this._currentColor[3] !== color[3]) {
            this._currentColor = color;
            this._commit();
            this._currentShaderProgram.set_uColor(color);
        }
        // アルファを指定
        if (this._currentAlpha !== state.globalAlpha) {
            this._currentAlpha = state.globalAlpha;
            this._commit();
            this._currentShaderProgram.set_uAlpha(state.globalAlpha);
        }
        // 合成モードを設定
        if (this._currentCompositeOperation !== state.globalCompositeOperation) {
            this._currentCompositeOperation = state.globalCompositeOperation;
            this._commit();
            var compositeOperation = this._compositeOps[this._currentCompositeOperation];
            this._context.blendFunc(compositeOperation[0], compositeOperation[1]);
        }
        var tw = 1.0 / surfaceTexture.textureWidth;
        var th = 1.0 / surfaceTexture.textureHeight;
        var ox = surfaceTexture.textureOffsetX;
        var oy = surfaceTexture.textureOffsetY;
        var s = tw * (ox + offsetX + width);
        var t = th * (oy + offsetY + height);
        var u = tw * (ox + offsetX);
        var v = th * (oy + offsetY);
        // 変換行列を設定
        this._register(this._transformVertex(canvasOffsetX, canvasOffsetY, width, height, state.transformer), [u, v, s, v, s, t, u, v, s, t, u, t]);
    };
    WebGLSharedObject.prototype.end = function () {
        this._commit();
        if (this._deleteRequestedTargets.length > 0) {
            for (var i = 0; i < this._deleteRequestedTargets.length; ++i) {
                this.deleteRenderTarget(this._deleteRequestedTargets[i]);
            }
            this._deleteRequestedTargets = [];
        }
    };
    WebGLSharedObject.prototype.makeTextureForSurface = function (surface) {
        this._textureAtlas.makeTextureForSurface(this, surface);
    };
    WebGLSharedObject.prototype.disposeTexture = function (texture) {
        if (this._currentTexture === texture) {
            this._commit();
        }
    };
    /**
     * image を GPU 上のテクスチャメモリ領域にコピーする.
     */
    WebGLSharedObject.prototype.assignTexture = function (image, x, y, texture) {
        this._context.bindTexture(this._context.TEXTURE_2D, texture);
        if (image instanceof HTMLVideoElement) {
            throw g.ExceptionFactory.createAssertionError("WebGLRenderer#assignTexture: HTMLVideoElement is not supported.");
        }
        this._context.texSubImage2D(this._context.TEXTURE_2D, 0, x, y, this._context.RGBA, this._context.UNSIGNED_BYTE, image);
        this._context.bindTexture(this._context.TEXTURE_2D, this._currentTexture);
    };
    /**
     * GPU 上のテクスチャメモリ領域を texturePixels でクリアする.
     *
     * NOTE: 本来はGPUデバイス上で領域をクリアすることが望ましく、ホストから都度領域を転送する texSubImage2D() は適当でない。
     * FBOをTextureにバインドさせる方式などを考慮すべきである。
     * ただし、以下の2点より本操作の最適化を見送っている。
     * - 処理速度上最良のケースは本操作の呼び出しを行わないことである
     * - 本操作の呼び出し頻度がWebGLTextureAtlas#TEXTURE_SIZEやWebGLTextureAtlas#TEXTURE_COUNTの値に依存するため、
     *   そちらをチューニングする方が優先度が高い
     */
    WebGLSharedObject.prototype.clearTexture = function (texturePixels, width, height, texture) {
        this._context.bindTexture(this._context.TEXTURE_2D, texture);
        this._context.texSubImage2D(this._context.TEXTURE_2D, 0, 0, 0, width, height, this._context.RGBA, this._context.UNSIGNED_BYTE, texturePixels);
        this._context.bindTexture(this._context.TEXTURE_2D, this._currentTexture);
    };
    WebGLSharedObject.prototype.makeTextureRaw = function (width, height, pixels) {
        if (pixels === void 0) { pixels = null; }
        var texture = this._context.createTexture();
        this._context.bindTexture(this._context.TEXTURE_2D, texture);
        this._context.pixelStorei(this._context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_WRAP_S, this._context.CLAMP_TO_EDGE);
        this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_WRAP_T, this._context.CLAMP_TO_EDGE);
        this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MAG_FILTER, this._context.NEAREST);
        this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MIN_FILTER, this._context.NEAREST);
        this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGBA, width, height, 0, this._context.RGBA, this._context.UNSIGNED_BYTE, pixels);
        this._context.bindTexture(this._context.TEXTURE_2D, this._currentTexture);
        return texture;
    };
    WebGLSharedObject.prototype.makeTexture = function (data) {
        var texture = this._context.createTexture();
        this._context.bindTexture(this._context.TEXTURE_2D, texture);
        this._context.pixelStorei(this._context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_WRAP_S, this._context.CLAMP_TO_EDGE);
        this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_WRAP_T, this._context.CLAMP_TO_EDGE);
        this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MAG_FILTER, this._context.NEAREST);
        this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MIN_FILTER, this._context.NEAREST);
        if (data instanceof HTMLImageElement) {
            this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGBA, this._context.RGBA, this._context.UNSIGNED_BYTE, data);
        }
        else if (data instanceof HTMLCanvasElement) {
            this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGBA, this._context.RGBA, this._context.UNSIGNED_BYTE, data);
        }
        else if (data instanceof ImageData) {
            this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGBA, this._context.RGBA, this._context.UNSIGNED_BYTE, data);
        }
        this._context.bindTexture(this._context.TEXTURE_2D, this._currentTexture);
        return texture;
    };
    WebGLSharedObject.prototype.getPrimaryRenderTarget = function (width, height) {
        return this._renderTarget;
    };
    WebGLSharedObject.prototype.createRenderTarget = function (width, height) {
        var context = this._context;
        var framebuffer = context.createFramebuffer();
        context.bindFramebuffer(context.FRAMEBUFFER, framebuffer);
        var texture = context.createTexture();
        context.bindTexture(context.TEXTURE_2D, texture);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
        context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, width, height, 0, context.RGBA, context.UNSIGNED_BYTE, null);
        context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, texture, 0);
        context.bindTexture(context.TEXTURE_2D, this._currentTexture);
        var renderTaget = this.getCurrentRenderTarget();
        context.bindFramebuffer(context.FRAMEBUFFER, renderTaget.framebuffer);
        return {
            width: width,
            height: height,
            viewportWidth: width,
            viewportHeight: height,
            framebuffer: framebuffer,
            texture: texture
        };
    };
    WebGLSharedObject.prototype.requestDeleteRenderTarget = function (renderTaget) {
        this._deleteRequestedTargets.push(renderTaget);
    };
    WebGLSharedObject.prototype.deleteRenderTarget = function (renderTaget) {
        var context = this._context;
        if (this.getCurrentRenderTarget() === renderTaget) {
            this._commit();
        }
        context.deleteFramebuffer(renderTaget.framebuffer);
        context.deleteTexture(renderTaget.texture);
    };
    WebGLSharedObject.prototype.getContext = function () {
        return this._context;
    };
    WebGLSharedObject.prototype.getDefaultShaderProgram = function () {
        return this._defaultShaderProgram;
    };
    WebGLSharedObject.prototype.initializeShaderProgram = function (shaderProgram) {
        if (shaderProgram) {
            if (!shaderProgram._program) {
                var program = new WebGLShaderProgram_1.WebGLShaderProgram(this._context, shaderProgram.fragmentShader, shaderProgram.uniforms);
                program.initializeUniforms();
                shaderProgram._program = program;
            }
        }
        return shaderProgram;
    };
    WebGLSharedObject.prototype._init = function () {
        var _a;
        var program = new WebGLShaderProgram_1.WebGLShaderProgram(this._context);
        // 描画用リソース
        this._textureAtlas = new WebGLTextureAtlas_1.WebGLTextureAtlas();
        this._fillRectTexture = this.makeTextureRaw(1, 1, new Uint8Array([255, 255, 255, 255]));
        this._fillRectSurfaceTexture = {
            texture: this._fillRectTexture,
            textureWidth: 1,
            textureHeight: 1,
            textureOffsetX: 0,
            textureOffsetY: 0
        };
        this._renderTarget = {
            width: this._surface.width,
            height: this._surface.height,
            viewportWidth: this._surface.width,
            viewportHeight: this._surface.height,
            framebuffer: null,
            texture: null
        };
        // 描画命令をため込んでおくバッファ
        this._maxSpriteCount = 1024;
        this._vertices = this._makeBuffer(this._maxSpriteCount * 24 * 4);
        this._verticesCache = new Float32Array(this._maxSpriteCount * 24);
        this._numSprites = 0; // the number of sprites
        this._currentTexture = null;
        this._currentColor = [1.0, 1.0, 1.0, 1.0];
        this._currentAlpha = 1.0;
        this._currentCompositeOperation = g.CompositeOperation.SourceOver;
        this._currentShaderProgram = program;
        this._defaultShaderProgram = program;
        this._renderTargetStack = [];
        this._deleteRequestedTargets = [];
        // シェーダの設定
        this._currentShaderProgram.use();
        try {
            this._currentShaderProgram.set_aVertex(this._vertices);
            this._currentShaderProgram.set_uColor(this._currentColor);
            this._currentShaderProgram.set_uAlpha(this._currentAlpha);
            this._currentShaderProgram.set_uSampler(0);
        }
        finally {
            this._currentShaderProgram.unuse();
        }
        // WebGL のパラメータを設定
        this._context.enable(this._context.BLEND);
        this._context.activeTexture(this._context.TEXTURE0);
        this._context.bindTexture(this._context.TEXTURE_2D, this._fillRectTexture);
        this._compositeOps = (_a = {},
            _a[g.CompositeOperation.SourceAtop] = [this._context.DST_ALPHA, this._context.ONE_MINUS_SRC_ALPHA],
            _a[g.CompositeOperation.ExperimentalSourceIn] = [this._context.DST_ALPHA, this._context.ZERO],
            _a[g.CompositeOperation.ExperimentalSourceOut] = [this._context.ONE_MINUS_DST_ALPHA, this._context.ZERO],
            _a[g.CompositeOperation.SourceOver] = [this._context.ONE, this._context.ONE_MINUS_SRC_ALPHA],
            _a[g.CompositeOperation.ExperimentalDestinationAtop] = [this._context.ONE_MINUS_DST_ALPHA, this._context.SRC_ALPHA],
            _a[g.CompositeOperation.ExperimentalDestinationIn] = [this._context.ZERO, this._context.SRC_ALPHA],
            _a[g.CompositeOperation.DestinationOut] = [this._context.ZERO, this._context.ONE_MINUS_SRC_ALPHA],
            _a[g.CompositeOperation.DestinationOver] = [this._context.ONE_MINUS_DST_ALPHA, this._context.ONE],
            _a[g.CompositeOperation.Lighter] = [this._context.ONE, this._context.ONE],
            _a[g.CompositeOperation.Copy] = [this._context.ONE, this._context.ZERO],
            _a[g.CompositeOperation.Xor] = [this._context.ONE_MINUS_DST_ALPHA, this._context.ONE_MINUS_SRC_ALPHA],
            _a);
        var compositeOperation = this._compositeOps[this._currentCompositeOperation];
        this._context.blendFunc(compositeOperation[0], compositeOperation[1]);
    };
    WebGLSharedObject.prototype._makeBuffer = function (data) {
        var buffer = this._context.createBuffer();
        this._context.bindBuffer(this._context.ARRAY_BUFFER, buffer);
        this._context.bufferData(this._context.ARRAY_BUFFER, data, this._context.DYNAMIC_DRAW);
        return buffer;
    };
    WebGLSharedObject.prototype._transformVertex = function (x, y, w, h, transformer) {
        var renderTaget = this.getCurrentRenderTarget();
        var cw = 2.0 / renderTaget.width;
        var ch = -2.0 / renderTaget.height;
        var m = transformer.matrix;
        var a = cw * w * m[0];
        var b = ch * w * m[1];
        var c = cw * h * m[2];
        var d = ch * h * m[3];
        var e = cw * (x * m[0] + y * m[2] + m[4]) - 1.0;
        var f = ch * (x * m[1] + y * m[3] + m[5]) + 1.0;
        return [
            e, f, a + e, b + f, a + c + e, b + d + f,
            e, f, a + c + e, b + d + f, c + e, d + f
        ];
    };
    WebGLSharedObject.prototype._register = function (vertex, texCoord) {
        var offset = this._numSprites * 6;
        ++this._numSprites;
        for (var i = 0; i < 6; ++i) {
            this._verticesCache[4 * (i + offset) + 0] = vertex[2 * i + 0];
            this._verticesCache[4 * (i + offset) + 1] = vertex[2 * i + 1];
            this._verticesCache[4 * (i + offset) + 2] = texCoord[2 * i + 0];
            this._verticesCache[4 * (i + offset) + 3] = texCoord[2 * i + 1];
        }
    };
    WebGLSharedObject.prototype._commit = function () {
        if (this._numSprites > 0) {
            this._context.bindBuffer(this._context.ARRAY_BUFFER, this._vertices);
            this._context.bufferSubData(this._context.ARRAY_BUFFER, 0, this._verticesCache.subarray(0, this._numSprites * 24));
            this._context.drawArrays(this._context.TRIANGLES, 0, this._numSprites * 6);
            this._numSprites = 0;
        }
    };
    return WebGLSharedObject;
}());
exports.WebGLSharedObject = WebGLSharedObject;

},{"./WebGLBackSurface":49,"./WebGLPrimarySurface":52,"./WebGLShaderProgram":56,"./WebGLTextureAtlas":58,"@akashic/akashic-engine":1}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLTextureAtlas = void 0;
var WebGLTextureMap_1 = require("./WebGLTextureMap");
var RenderingHelper_1 = require("../RenderingHelper");
var WebGLTextureAtlas = /** @class */ (function () {
    function WebGLTextureAtlas() {
        this._maps = [];
        this._insertPos = 0;
        this.emptyTexturePixels = new Uint8Array(WebGLTextureAtlas.TEXTURE_SIZE * WebGLTextureAtlas.TEXTURE_SIZE * 4);
    }
    /**
     * 新しいシーンに遷移したとき呼ぶ。
     */
    WebGLTextureAtlas.prototype.clear = function () {
        for (var i = 0; i < this._maps.length; ++i) {
            this._maps[i].dispose();
        }
    };
    /**
     * 現在のテクスチャ領域使用効率を表示する。
     */
    WebGLTextureAtlas.prototype.showOccupancy = function () {
        for (var i = 0; i < this._maps.length; ++i) {
            console.log("occupancy[" + i + "]: " + this._maps[i].occupancy());
        }
    };
    /**
     * g.Surface 用にテクスチャを作成する。
     */
    WebGLTextureAtlas.prototype.makeTextureForSurface = function (shared, surface) {
        var image = surface._drawable;
        if (!image || image.texture) {
            return;
        }
        var width = image.width;
        var height = image.height;
        // サイズが大きいので単体のテクスチャとして扱う
        if ((width >= WebGLTextureAtlas.TEXTURE_SIZE) || (height >= WebGLTextureAtlas.TEXTURE_SIZE)) {
            // 画像サイズが 2^n でないときはリサイズする
            var w = RenderingHelper_1.RenderingHelper.toPowerOfTwo(image.width);
            var h = RenderingHelper_1.RenderingHelper.toPowerOfTwo(image.height);
            if ((w !== image.width) || (h !== image.height)) {
                var canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                var canvasContext = canvas.getContext("2d");
                canvasContext.globalCompositeOperation = "copy";
                canvasContext.drawImage(image, 0, 0);
                image = canvasContext.getImageData(0, 0, w, h);
            }
            surface._drawable.texture = shared.makeTexture(image);
            surface._drawable.textureOffsetX = 0;
            surface._drawable.textureOffsetY = 0;
            surface._drawable.textureWidth = w;
            surface._drawable.textureHeight = h;
            return;
        }
        this._assign(shared, surface, this._maps);
    };
    /**
     * 適当なテクスチャアトラスにサーフィスを割り当てる
     */
    WebGLTextureAtlas.prototype._assign = function (shared, surface, maps) {
        // テクスチャアトラスに割り当てる
        var map;
        for (var i = 0; i < maps.length; ++i) {
            map = maps[(i + this._insertPos) % maps.length].insert(surface);
            if (map) {
                // 登録する
                this._register(shared, map, surface._drawable);
                this._insertPos = i;
                return;
            }
        }
        map = null;
        // テクスチャ容量があふれるので古いやつを消して再利用する
        if (maps.length >= WebGLTextureAtlas.TEXTURE_COUNT) {
            map = maps.shift();
            shared.disposeTexture(map.texture);
            map.dispose();
            shared.clearTexture(this.emptyTexturePixels, WebGLTextureAtlas.TEXTURE_SIZE, WebGLTextureAtlas.TEXTURE_SIZE, map.texture);
        }
        // 再利用できない場合は、新規生成する
        if (!map) {
            map = new WebGLTextureMap_1.WebGLTextureMap(shared.makeTextureRaw(WebGLTextureAtlas.TEXTURE_SIZE, WebGLTextureAtlas.TEXTURE_SIZE), 0, 0, WebGLTextureAtlas.TEXTURE_SIZE, WebGLTextureAtlas.TEXTURE_SIZE);
        }
        // 登録する
        maps.push(map);
        map = map.insert(surface);
        this._register(shared, map, surface._drawable);
    };
    /**
     * テクスチャを登録する。
     */
    WebGLTextureAtlas.prototype._register = function (shared, map, image) {
        image.texture = map.texture;
        image.textureOffsetX = map.offsetX;
        image.textureOffsetY = map.offsetY;
        image.textureWidth = WebGLTextureAtlas.TEXTURE_SIZE;
        image.textureHeight = WebGLTextureAtlas.TEXTURE_SIZE;
        shared.assignTexture(image, map.offsetX, map.offsetY, map.texture);
    };
    // 確保するテクスチャのサイズ (実際のゲームに合わせてチューニングする必要がある)
    WebGLTextureAtlas.TEXTURE_SIZE = 1024;
    // 確保するテクスチャの数 (実際のゲームに合わせてチューニングする必要がある)
    WebGLTextureAtlas.TEXTURE_COUNT = 16;
    return WebGLTextureAtlas;
}());
exports.WebGLTextureAtlas = WebGLTextureAtlas;

},{"../RenderingHelper":43,"./WebGLTextureMap":59}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLTextureMap = void 0;
var WebGLTextureMap = /** @class */ (function () {
    function WebGLTextureMap(texture, offsetX, offsetY, width, height) {
        this.texture = texture;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this._width = width;
        this._height = height;
    }
    WebGLTextureMap.prototype.dispose = function () {
        if (this._left) {
            this._left.dispose();
            this._left = null;
        }
        if (this._right) {
            this._right.dispose();
            this._right = null;
        }
        if (this._surface) {
            if (this._surface._drawable) {
                this._surface._drawable.texture = null;
            }
            this._surface = null;
        }
    };
    WebGLTextureMap.prototype.capacity = function () {
        return this._width * this._height;
    };
    WebGLTextureMap.prototype.area = function () {
        if (!this._surface) {
            return 0;
        }
        var image = this._surface._drawable;
        var a = image.width * image.height;
        if (this._left) {
            a += this._left.area();
        }
        if (this._right) {
            a += this._right.area();
        }
        return a;
    };
    WebGLTextureMap.prototype.occupancy = function () {
        return this.area() / this.capacity();
    };
    WebGLTextureMap.prototype.insert = function (surface) {
        var image = surface._drawable;
        // マージンを考慮した領域を確保
        var width = image.width + WebGLTextureMap.TEXTURE_MARGIN;
        var height = image.height + WebGLTextureMap.TEXTURE_MARGIN;
        // 再帰的にパッキング
        if (this._surface) {
            if (this._left) {
                var left = this._left.insert(surface);
                if (left) {
                    return left;
                }
            }
            if (this._right) {
                var right = this._right.insert(surface);
                if (right) {
                    return right;
                }
            }
            return null;
        }
        // 詰め込み不可能
        if ((this._width < width) || (this._height < height)) {
            return null;
        }
        var remainWidth = this._width - width;
        var remainHeight = this._height - height;
        if (remainWidth <= remainHeight) {
            this._left = new WebGLTextureMap(this.texture, this.offsetX + width, this.offsetY, remainWidth, height);
            this._right = new WebGLTextureMap(this.texture, this.offsetX, this.offsetY + height, this._width, remainHeight);
        }
        else {
            this._left = new WebGLTextureMap(this.texture, this.offsetX, this.offsetY + height, width, remainHeight);
            this._right = new WebGLTextureMap(this.texture, this.offsetX + width, this.offsetY, remainWidth, this._height);
        }
        this._surface = surface;
        return this;
    };
    // 各テクスチャを配置する際のマージンピクセル数
    // マージンを取らないと、隣接するテクスチャが滲んで描画される可能性がある。
    WebGLTextureMap.TEXTURE_MARGIN = 1;
    return WebGLTextureMap;
}());
exports.WebGLTextureMap = WebGLTextureMap;

},{}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputAbstractHandler = void 0;
var g = require("@akashic/akashic-engine");
var pdi = require("@akashic/akashic-pdi");
/**
 * 入力ハンドラ。
 *
 * コンストラクタで受け取ったViewに対してDOMイベントのハンドラを設定する。
 * DOMイベント情報から `PointEventResponse` へ変換したデータを `point{Down, Move, Up}Trigger` を通して通知する。
 * Down -> Move -> Up のフローにおける、Moveイベントのロックを管理する。
 */
var InputAbstractHandler = /** @class */ (function () {
    /**
     * @param inputView inputViewはDOMイベントを設定するHTMLElement
     */
    function InputAbstractHandler(inputView, disablePreventDefault) {
        if (Object.getPrototypeOf && (Object.getPrototypeOf(this) === InputAbstractHandler.prototype)) {
            throw new Error("InputAbstractHandler is abstract and should not be directly instantiated");
        }
        this.inputView = inputView;
        this.pointerEventLock = {};
        this._xScale = 1;
        this._yScale = 1;
        this._disablePreventDefault = !!disablePreventDefault;
        this.pointTrigger = new g.Trigger();
    }
    // `start()` で設定するDOMイベントをサポートしているかを返す
    InputAbstractHandler.isSupported = function () {
        return false;
    };
    // 継承したクラスにおいて、適切なDOMイベントを設定する
    InputAbstractHandler.prototype.start = function () {
        throw new Error("This method is abstract");
    };
    // start() に対応するDOMイベントを開放する
    InputAbstractHandler.prototype.stop = function () {
        throw new Error("This method is abstract");
    };
    InputAbstractHandler.prototype.setScale = function (xScale, yScale) {
        if (yScale === void 0) { yScale = xScale; }
        this._xScale = xScale;
        this._yScale = yScale;
    };
    InputAbstractHandler.prototype.pointDown = function (identifier, pagePosition) {
        this.pointTrigger.fire({
            type: 0 /* Down */,
            identifier: identifier,
            offset: this.getOffsetFromEvent(pagePosition)
        });
        // downのイベントIDを保存して、moveとupのイベントの抑制をする(ロックする)
        this.pointerEventLock[identifier] = true;
    };
    InputAbstractHandler.prototype.pointMove = function (identifier, pagePosition) {
        if (!this.pointerEventLock.hasOwnProperty(identifier + "")) {
            return;
        }
        this.pointTrigger.fire({
            type: 1 /* Move */,
            identifier: identifier,
            offset: this.getOffsetFromEvent(pagePosition)
        });
    };
    InputAbstractHandler.prototype.pointUp = function (identifier, pagePosition) {
        if (!this.pointerEventLock.hasOwnProperty(identifier + "")) {
            return;
        }
        this.pointTrigger.fire({
            type: 2 /* Up */,
            identifier: identifier,
            offset: this.getOffsetFromEvent(pagePosition)
        });
        // Upが完了したら、Down->Upが完了したとしてロックを外す
        delete this.pointerEventLock[identifier];
    };
    InputAbstractHandler.prototype.getOffsetFromEvent = function (e) {
        return { x: e.offsetX, y: e.offsetY };
    };
    InputAbstractHandler.prototype.getScale = function () {
        return { x: this._xScale, y: this._yScale };
    };
    InputAbstractHandler.prototype.getOffsetPositionFromInputView = function (position) {
        // windowの左上を0,0とした時のinputViewのoffsetを取得する
        var bounding = this.inputView.getBoundingClientRect();
        var scale = this.getScale();
        return {
            offsetX: (position.pageX - Math.round(window.pageXOffset + bounding.left)) / scale.x,
            offsetY: (position.pageY - Math.round(window.pageYOffset + bounding.top)) / scale.y
        };
    };
    return InputAbstractHandler;
}());
exports.InputAbstractHandler = InputAbstractHandler;

},{"@akashic/akashic-engine":1,"@akashic/akashic-pdi":3}],61:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseHandler = void 0;
var InputAbstractHandler_1 = require("./InputAbstractHandler");
var MouseHandler = /** @class */ (function (_super) {
    __extends(MouseHandler, _super);
    function MouseHandler(inputView, disablePreventDefault) {
        var _this = _super.call(this, inputView, disablePreventDefault) || this;
        var identifier = 1;
        _this.onMouseDown = function (e) {
            if (e.button !== 0)
                return; // NOTE: 左クリック以外を受け付けない
            _this.pointDown(identifier, _this.getOffsetPositionFromInputView(e));
            window.addEventListener("mousemove", _this.onMouseMove, false);
            window.addEventListener("mouseup", _this.onMouseUp, false);
            if (!_this._disablePreventDefault) {
                e.stopPropagation();
                e.preventDefault();
            }
        };
        _this.onMouseMove = function (e) {
            _this.pointMove(identifier, _this.getOffsetPositionFromInputView(e));
            if (!_this._disablePreventDefault) {
                e.stopPropagation();
                e.preventDefault();
            }
        };
        _this.onMouseUp = function (e) {
            _this.pointUp(identifier, _this.getOffsetPositionFromInputView(e));
            window.removeEventListener("mousemove", _this.onMouseMove, false);
            window.removeEventListener("mouseup", _this.onMouseUp, false);
            if (!_this._disablePreventDefault) {
                e.stopPropagation();
                e.preventDefault();
            }
        };
        return _this;
    }
    MouseHandler.prototype.start = function () {
        this.inputView.addEventListener("mousedown", this.onMouseDown, false);
    };
    MouseHandler.prototype.stop = function () {
        this.inputView.removeEventListener("mousedown", this.onMouseDown, false);
    };
    return MouseHandler;
}(InputAbstractHandler_1.InputAbstractHandler));
exports.MouseHandler = MouseHandler;

},{"./InputAbstractHandler":60}],62:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TouchHandler = void 0;
var MouseHandler_1 = require("./MouseHandler");
var TouchHandler = /** @class */ (function (_super) {
    __extends(TouchHandler, _super);
    function TouchHandler(inputView, disablePreventDefault) {
        var _this = _super.call(this, inputView, disablePreventDefault) || this;
        _this.onTouchDown = function (e) {
            var touches = e.changedTouches;
            for (var i = 0, len = touches.length; i < len; i++) {
                var touch = touches[i];
                _this.pointDown(touch.identifier, _this.getOffsetPositionFromInputView(touch));
            }
            if (!_this._disablePreventDefault) {
                e.stopPropagation();
                if (e.cancelable)
                    e.preventDefault();
            }
        };
        _this.onTouchMove = function (e) {
            var touches = e.changedTouches;
            for (var i = 0, len = touches.length; i < len; i++) {
                var touch = touches[i];
                _this.pointMove(touch.identifier, _this.getOffsetPositionFromInputView(touch));
            }
            if (!_this._disablePreventDefault) {
                e.stopPropagation();
                if (e.cancelable)
                    e.preventDefault();
            }
        };
        _this.onTouchUp = function (e) {
            var touches = e.changedTouches;
            for (var i = 0, len = touches.length; i < len; i++) {
                var touch = touches[i];
                _this.pointUp(touch.identifier, _this.getOffsetPositionFromInputView(touch));
            }
            if (!_this._disablePreventDefault) {
                e.stopPropagation();
                if (e.cancelable)
                    e.preventDefault();
            }
        };
        return _this;
    }
    TouchHandler.prototype.start = function () {
        _super.prototype.start.call(this);
        this.inputView.addEventListener("touchstart", this.onTouchDown);
        this.inputView.addEventListener("touchmove", this.onTouchMove);
        this.inputView.addEventListener("touchend", this.onTouchUp);
    };
    TouchHandler.prototype.stop = function () {
        _super.prototype.stop.call(this);
        this.inputView.removeEventListener("touchstart", this.onTouchDown);
        this.inputView.removeEventListener("touchmove", this.onTouchMove);
        this.inputView.removeEventListener("touchend", this.onTouchUp);
    };
    return TouchHandler;
}(MouseHandler_1.MouseHandler));
exports.TouchHandler = TouchHandler;

},{"./MouseHandler":61}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyAudioPlugin = exports.PostMessageAudioPlugin = exports.WebAudioPlugin = exports.HTMLAudioPlugin = exports.AudioPluginRegistry = exports.g = exports.ResourceFactory = exports.Platform = void 0;
var Platform_1 = require("./Platform");
Object.defineProperty(exports, "Platform", { enumerable: true, get: function () { return Platform_1.Platform; } });
var ResourceFactory_1 = require("./ResourceFactory");
Object.defineProperty(exports, "ResourceFactory", { enumerable: true, get: function () { return ResourceFactory_1.ResourceFactory; } });
// akashic-engine内部でresourceを使えるように初期設定
var g = require("@akashic/akashic-engine");
exports.g = g;
var AudioPluginRegistry_1 = require("./plugin/AudioPluginRegistry");
Object.defineProperty(exports, "AudioPluginRegistry", { enumerable: true, get: function () { return AudioPluginRegistry_1.AudioPluginRegistry; } });
var AudioPluginManager_1 = require("./plugin/AudioPluginManager");
Object.defineProperty(exports, "AudioPluginManager", { enumerable: true, get: function () { return AudioPluginManager_1.AudioPluginManager; } });
// TODO: Audio Pluginの実態は別リポジトリに切り出す事を検討する
var HTMLAudioPlugin_1 = require("./plugin/HTMLAudioPlugin/HTMLAudioPlugin");
Object.defineProperty(exports, "HTMLAudioPlugin", { enumerable: true, get: function () { return HTMLAudioPlugin_1.HTMLAudioPlugin; } });
var WebAudioPlugin_1 = require("./plugin/WebAudioPlugin/WebAudioPlugin");
Object.defineProperty(exports, "WebAudioPlugin", { enumerable: true, get: function () { return WebAudioPlugin_1.WebAudioPlugin; } });
// TODO 削除。誰も使っていない
var PostMessageAudioPlugin_1 = require("./plugin/PostMessageAudioPlugin/PostMessageAudioPlugin");
Object.defineProperty(exports, "PostMessageAudioPlugin", { enumerable: true, get: function () { return PostMessageAudioPlugin_1.PostMessageAudioPlugin; } });
var ProxyAudioPlugin_1 = require("./plugin/ProxyAudioPlugin/ProxyAudioPlugin");
Object.defineProperty(exports, "ProxyAudioPlugin", { enumerable: true, get: function () { return ProxyAudioPlugin_1.ProxyAudioPlugin; } });

},{"./Platform":32,"./ResourceFactory":34,"./plugin/AudioPluginManager":64,"./plugin/AudioPluginRegistry":65,"./plugin/HTMLAudioPlugin/HTMLAudioPlugin":69,"./plugin/PostMessageAudioPlugin/PostMessageAudioPlugin":72,"./plugin/ProxyAudioPlugin/ProxyAudioPlugin":76,"./plugin/WebAudioPlugin/WebAudioPlugin":81,"@akashic/akashic-engine":1}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPluginManager = void 0;
/*
 Audioプラグインを登録し、現在登録しているプラグインを管理するクラス

 TODO: 各Gameインスタンスが一つのAudioプラグインしか持たないので、
 PluginManagerが状態をもたずにGame自体にpluginを登録する方式もあり
 */
var AudioPluginManager = /** @class */ (function () {
    function AudioPluginManager() {
        this._activePlugin = null;
    }
    AudioPluginManager.prototype.getActivePlugin = function () {
        return this._activePlugin;
    };
    // Audioプラグインに登録を行い、どれか一つでも成功ならtrue、それ以外はfalseを返す
    AudioPluginManager.prototype.tryInstallPlugin = function (plugins) {
        for (var i = 0, len = plugins.length; i < len; i++) {
            var p = plugins[i];
            if (p.isSupported) {
                var PluginConstructor = p;
                if (PluginConstructor.isSupported()) {
                    this._activePlugin = new PluginConstructor();
                    return true;
                }
            }
            else {
                this._activePlugin = p;
                return true;
            }
        }
        return false;
    };
    return AudioPluginManager;
}());
exports.AudioPluginManager = AudioPluginManager;

},{}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPluginRegistry = void 0;
var audioPlugins = [];
exports.AudioPluginRegistry = {
    addPlugin: function (plugin) {
        if (audioPlugins.indexOf(plugin) === -1) {
            audioPlugins.push(plugin);
        }
    },
    getRegisteredAudioPlugins: function () {
        return audioPlugins;
    },
    clear: function () {
        audioPlugins = [];
    }
};

},{}],66:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLAudioAsset = void 0;
var g = require("@akashic/akashic-engine");
var HTMLAudioAsset = /** @class */ (function (_super) {
    __extends(HTMLAudioAsset, _super);
    function HTMLAudioAsset() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HTMLAudioAsset.prototype._load = function (loader) {
        var _this = this;
        if (this.path == null) {
            // 再生可能な形式がない。実際には鳴らない音声としてロード成功しておく
            this.data = null;
            setTimeout(function () { return loader._onAssetLoad(_this); }, 0);
            return;
        }
        var audio = new Audio();
        var startLoadingAudio = function (path, handlers) {
            // autoplay は preload よりも優先されるため明示的にfalseとする
            audio.autoplay = false;
            audio.preload = "none";
            audio.src = path;
            _this._attachAll(audio, handlers);
            /* tslint:disable */
            // Firefoxはpreload="auto"でないと読み込みされない
            // preloadはブラウザに対するHint属性なので、どう扱うかはブラウザの実装次第となる
            // https://html.spec.whatwg.org/multipage/embedded-content.html#attr-media-preload
            // https://developer.mozilla.org/ja/docs/Web/HTML/Element/audio#attr-preload
            // https://github.com/CreateJS/SoundJS/blob/e2d4842a84ff425ada861edb9f6e9b57f63d7caf/src/soundjs/htmlaudio/HTMLAudioSoundInstance.js#L147-147
            /* tslint:enable:max-line-length */
            audio.preload = "auto";
            setAudioLoadInterval(audio, handlers);
            audio.load();
        };
        var handlers = {
            success: function () {
                _this._detachAll(audio, handlers);
                _this.data = audio;
                loader._onAssetLoad(_this);
                window.clearInterval(_this._intervalId);
            },
            error: function () {
                _this._detachAll(audio, handlers);
                _this.data = audio;
                loader._onAssetError(_this, g.ExceptionFactory.createAssetLoadError("HTMLAudioAsset loading error"));
                window.clearInterval(_this._intervalId);
            }
        };
        var setAudioLoadInterval = function (audio, handlers) {
            // IE11において、canplaythroughイベントが正常に発火しない問題が確認されたため、その対処として以下の処理を行っている。
            // なお、canplaythroughはreadyStateの値が4になった時点で呼び出されるイベントである。
            // インターバルとして指定している100msに根拠は無い。
            _this._intervalCount = 0;
            _this._intervalId = window.setInterval(function () {
                if (audio.readyState === 4) {
                    handlers.success();
                }
                else {
                    ++_this._intervalCount;
                    // readyStateの値が4にならない状態が1分（100ms×600）続いた場合、
                    // 読み込みに失敗したとする。1分という時間に根拠は無い。
                    if (_this._intervalCount === 600) {
                        handlers.error();
                    }
                }
            }, 100);
        };
        // 暫定対応：後方互換性のため、aacファイルが無い場合はmp4へのフォールバックを試みる。
        // この対応を止める際には、HTMLAudioPluginのsupportedExtensionsからaacを除外する必要がある。
        var delIndex = this.path.indexOf("?");
        var basePath = delIndex >= 0 ? this.path.substring(0, delIndex) : this.path;
        if (basePath.slice(-4) === ".aac" && HTMLAudioAsset.supportedFormats.indexOf("mp4") !== -1) {
            var altHandlers = {
                success: handlers.success,
                error: function () {
                    _this._detachAll(audio, altHandlers);
                    window.clearInterval(_this._intervalId);
                    _this.path = g.PathUtil.addExtname(_this.originalPath, "mp4");
                    startLoadingAudio(_this.path, handlers);
                }
            };
            startLoadingAudio(this.path, altHandlers);
            return;
        }
        startLoadingAudio(this.path, handlers);
    };
    HTMLAudioAsset.prototype.cloneElement = function () {
        return this.data ? new Audio(this.data.src) : null;
    };
    HTMLAudioAsset.prototype._assetPathFilter = function (path) {
        if (HTMLAudioAsset.supportedFormats.indexOf("ogg") !== -1) {
            return g.PathUtil.addExtname(path, "ogg");
        }
        if (HTMLAudioAsset.supportedFormats.indexOf("aac") !== -1) {
            return g.PathUtil.addExtname(path, "aac");
        }
        // ここで検出されるのは最初にアクセスを試みるオーディオアセットのファイルパスなので、
        // supportedFormatsに(後方互換性保持で使う可能性がある)mp4が含まれていても利用しない
        return null;
    };
    HTMLAudioAsset.prototype._attachAll = function (audio, handlers) {
        if (handlers.success) {
            /* tslint:disable:max-line-length */
            // https://developer.mozilla.org/en-US/docs/Web/Events/canplaythrough
            // https://github.com/goldfire/howler.js/blob/1dad25cdd9d6982232050454e8b45411902efe65/howler.js#L372
            // https://github.com/CreateJS/SoundJS/blob/e2d4842a84ff425ada861edb9f6e9b57f63d7caf/src/soundjs/htmlaudio/HTMLAudioSoundInstance.js#L145-145
            /* tslint:enable:max-line-length */
            audio.addEventListener("canplaythrough", handlers.success, false);
        }
        if (handlers.error) {
            // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
            // stalledはfetchして取れなかった時に起きるイベント
            audio.addEventListener("stalled", handlers.error, false);
            audio.addEventListener("error", handlers.error, false);
            audio.addEventListener("abort", handlers.error, false);
        }
    };
    HTMLAudioAsset.prototype._detachAll = function (audio, handlers) {
        if (handlers.success) {
            audio.removeEventListener("canplaythrough", handlers.success, false);
        }
        if (handlers.error) {
            audio.removeEventListener("stalled", handlers.error, false);
            audio.removeEventListener("error", handlers.error, false);
            audio.removeEventListener("abort", handlers.error, false);
        }
    };
    return HTMLAudioAsset;
}(g.AudioAsset));
exports.HTMLAudioAsset = HTMLAudioAsset;

},{"@akashic/akashic-engine":1}],67:[function(require,module,exports){
"use strict";
/// chrome66以降などのブラウザに導入されるAutoplay Policyに対応する
// https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
var state = 0 /* Unknown */;
var suspendedAudioElements = [];
var HTMLAudioAutoplayHelper;
(function (HTMLAudioAutoplayHelper) {
    function setupChromeMEIWorkaround(audio) {
        function playHandler() {
            switch (state) {
                case 0 /* Unknown */:
                case 1 /* WaitingInteraction */: // 通常のケースではここには到達しないが、何らかの外因によって音を鳴らすことができた場合
                    playSuspendedAudioElements();
                    break;
                case 2 /* Ready */:
                    break;
                default:
                // do nothing
            }
            state = 2 /* Ready */;
            clearTimeout(timer);
        }
        function suspendedHandler() {
            audio.removeEventListener("play", playHandler);
            switch (state) {
                case 0 /* Unknown */:
                    suspendedAudioElements.push(audio);
                    state = 1 /* WaitingInteraction */;
                    setUserInteractListener();
                    break;
                case 1 /* WaitingInteraction */:
                    suspendedAudioElements.push(audio);
                    break;
                case 2 /* Ready */:
                    audio.play(); // suspendedHandler が呼ばれるまでに音が鳴らせるようになった場合
                    break;
                default:
                // do nothing;
            }
        }
        switch (state) {
            case 0 /* Unknown */:
                audio.addEventListener("play", playHandler, true);
                var timer = setTimeout(suspendedHandler, 100); // 明確な根拠はないが100msec待ってもplayされなければ再生できないと判断する
                break;
            case 1 /* WaitingInteraction */:
                suspendedAudioElements.push(audio);
                break;
            case 2 /* Ready */:
                break;
            default:
            // do nothing
        }
    }
    HTMLAudioAutoplayHelper.setupChromeMEIWorkaround = setupChromeMEIWorkaround;
})(HTMLAudioAutoplayHelper || (HTMLAudioAutoplayHelper = {}));
function resumeHandler() {
    playSuspendedAudioElements();
    clearUserInteractListener();
}
function setUserInteractListener() {
    document.addEventListener("keydown", resumeHandler, true);
    document.addEventListener("mousedown", resumeHandler, true);
    document.addEventListener("touchend", resumeHandler, true);
}
function clearUserInteractListener() {
    document.removeEventListener("keydown", resumeHandler);
    document.removeEventListener("mousedown", resumeHandler);
    document.removeEventListener("touchend", resumeHandler);
}
function playSuspendedAudioElements() {
    state = 2 /* Ready */;
    suspendedAudioElements.forEach(function (audio) { return audio.play(); });
    suspendedAudioElements = [];
}
module.exports = HTMLAudioAutoplayHelper;

},{}],68:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLAudioPlayer = void 0;
var g = require("@akashic/akashic-engine");
var autoPlayHelper = require("./HTMLAudioAutoplayHelper");
var HTMLAudioPlayer = /** @class */ (function (_super) {
    __extends(HTMLAudioPlayer, _super);
    function HTMLAudioPlayer(system, manager) {
        var _this = _super.call(this, system) || this;
        _this._manager = manager;
        _this._endedEventHandler = function () {
            _this._onAudioEnded();
        };
        _this._onPlayEventHandler = function () {
            _this._onPlayEvent();
        };
        _this._dummyDurationWaitTimer = null;
        return _this;
    }
    HTMLAudioPlayer.prototype.play = function (asset) {
        if (this.currentAudio) {
            this.stop();
        }
        var audio = asset.cloneElement();
        if (audio) {
            autoPlayHelper.setupChromeMEIWorkaround(audio);
            audio.volume = this._calculateVolume();
            audio.play().catch(function (err) { });
            audio.loop = asset.loop;
            audio.addEventListener("ended", this._endedEventHandler, false);
            audio.addEventListener("play", this._onPlayEventHandler, false);
            this._isWaitingPlayEvent = true;
            this._audioInstance = audio;
        }
        else {
            // 再生できるオーディオがない場合。duration後に停止処理だけ行う(処理のみ進め音は鳴らさない)
            this._dummyDurationWaitTimer = setTimeout(this._endedEventHandler, asset.duration);
        }
        _super.prototype.play.call(this, asset);
    };
    HTMLAudioPlayer.prototype.stop = function () {
        if (!this.currentAudio) {
            _super.prototype.stop.call(this);
            return;
        }
        this._clearEndedEventHandler();
        if (this._audioInstance) {
            if (!this._isWaitingPlayEvent) {
                // _audioInstance が再び play されることは無いので、 removeEventListener("play") する必要は無い
                this._audioInstance.pause();
                this._audioInstance = null;
            }
            else {
                this._isStopRequested = true;
            }
        }
        _super.prototype.stop.call(this);
    };
    HTMLAudioPlayer.prototype.changeVolume = function (volume) {
        _super.prototype.changeVolume.call(this, volume);
        if (this._audioInstance) {
            this._audioInstance.volume = this._calculateVolume();
        }
    };
    HTMLAudioPlayer.prototype._changeMuted = function (muted) {
        _super.prototype._changeMuted.call(this, muted);
        if (this._audioInstance) {
            this._audioInstance.volume = this._calculateVolume();
        }
    };
    HTMLAudioPlayer.prototype.notifyMasterVolumeChanged = function () {
        if (this._audioInstance) {
            this._audioInstance.volume = this._calculateVolume();
        }
    };
    HTMLAudioPlayer.prototype._onAudioEnded = function () {
        this._clearEndedEventHandler();
        _super.prototype.stop.call(this);
    };
    HTMLAudioPlayer.prototype._clearEndedEventHandler = function () {
        if (this._audioInstance)
            this._audioInstance.removeEventListener("ended", this._endedEventHandler, false);
        if (this._dummyDurationWaitTimer != null) {
            clearTimeout(this._dummyDurationWaitTimer);
            this._dummyDurationWaitTimer = null;
        }
    };
    // audio.play() は非同期なので、 play が開始される前に stop を呼ばれた場合はこのハンドラ到達時に停止する
    HTMLAudioPlayer.prototype._onPlayEvent = function () {
        if (!this._isWaitingPlayEvent)
            return;
        this._isWaitingPlayEvent = false;
        if (this._isStopRequested) {
            this._isStopRequested = false;
            // _audioInstance が再び play されることは無いので、 removeEventListener("play") する必要は無い
            this._audioInstance.pause();
            this._audioInstance = null;
        }
    };
    HTMLAudioPlayer.prototype._calculateVolume = function () {
        return this._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
    };
    return HTMLAudioPlayer;
}(g.AudioPlayer));
exports.HTMLAudioPlayer = HTMLAudioPlayer;

},{"./HTMLAudioAutoplayHelper":67,"@akashic/akashic-engine":1}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLAudioPlugin = void 0;
var HTMLAudioAsset_1 = require("./HTMLAudioAsset");
var HTMLAudioPlayer_1 = require("./HTMLAudioPlayer");
var HTMLAudioPlugin = /** @class */ (function () {
    function HTMLAudioPlugin() {
        this._supportedFormats = this._detectSupportedFormats();
        HTMLAudioAsset_1.HTMLAudioAsset.supportedFormats = this.supportedFormats;
    }
    // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio.js
    // https://github.com/CreateJS/SoundJS/blob/master/src/soundjs/htmlaudio/HTMLAudioPlugin.js
    HTMLAudioPlugin.isSupported = function () {
        // Audio要素を実際に作って、canPlayTypeが存在するかで確認する
        var audioElement = document.createElement("audio");
        var result = false;
        try {
            result = (audioElement.canPlayType !== undefined);
        }
        catch (e) {
            // ignore Error
        }
        return result;
    };
    Object.defineProperty(HTMLAudioPlugin.prototype, "supportedFormats", {
        get: function () {
            return this._supportedFormats;
        },
        // TSLintのバグ - setterはreturn typeを書くとコンパイルエラー
        /* tslint:disable:typedef */
        // HTMLAudioAssetへ反映させるためsetterとする
        set: function (supportedFormats) {
            this._supportedFormats = supportedFormats;
            HTMLAudioAsset_1.HTMLAudioAsset.supportedFormats = supportedFormats;
        },
        enumerable: false,
        configurable: true
    });
    /* tslint:enable:typedef */
    HTMLAudioPlugin.prototype.createAsset = function (id, assetPath, duration, system, loop, hint) {
        return new HTMLAudioAsset_1.HTMLAudioAsset(id, assetPath, duration, system, loop, hint);
    };
    HTMLAudioPlugin.prototype.createPlayer = function (system, manager) {
        return new HTMLAudioPlayer_1.HTMLAudioPlayer(system, manager);
    };
    HTMLAudioPlugin.prototype._detectSupportedFormats = function () {
        // Edgeは再生できるファイル形式とcanPlayTypeの結果が一致しないため、固定でAACを利用する
        if (navigator.userAgent.indexOf("Edge/") !== -1)
            return ["aac"];
        // Audio要素を実際に作って、canPlayTypeで再生できるかを判定する
        var audioElement = document.createElement("audio");
        var supportedFormats = [];
        try {
            var supportedExtensions = ["ogg", "aac", "mp4"];
            for (var i = 0, len = supportedExtensions.length; i < len; i++) {
                var ext = supportedExtensions[i];
                var canPlay = audioElement.canPlayType("audio/" + ext);
                var supported = (canPlay !== "no" && canPlay !== "");
                if (supported) {
                    supportedFormats.push(ext);
                }
            }
        }
        catch (e) {
            // ignore Error
        }
        return supportedFormats;
    };
    return HTMLAudioPlugin;
}());
exports.HTMLAudioPlugin = HTMLAudioPlugin;

},{"./HTMLAudioAsset":66,"./HTMLAudioPlayer":68}],70:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostMessageAudioAsset = void 0;
var g = require("@akashic/akashic-engine");
var PostMessageAudioPlugin_1 = require("./PostMessageAudioPlugin");
var PostMessageAudioAsset = /** @class */ (function (_super) {
    __extends(PostMessageAudioAsset, _super);
    function PostMessageAudioAsset() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PostMessageAudioAsset.prototype._load = function (loader) {
        var _this = this;
        var param = {
            id: this.id,
            assetPath: this.path,
            duration: this.duration,
            loop: this.loop,
            hint: this.hint
        };
        PostMessageAudioPlugin_1.PostMessageAudioPlugin.send("akashic:AudioAsset#_load", param);
        // TODO: 暫定対応。本来はPDI(iframeの親)側からの `akashic:AudioAsset#_load#success` または `akashic:AudioAsset#_load#failure` を待つ必要がある。
        setTimeout(function () { return loader._onAssetLoad(_this); });
    };
    PostMessageAudioAsset.prototype.destroy = function () {
        PostMessageAudioPlugin_1.PostMessageAudioPlugin.send("akashic:AudioAsset#destroy", { id: this.id });
        _super.prototype.destroy.call(this);
    };
    return PostMessageAudioAsset;
}(g.AudioAsset));
exports.PostMessageAudioAsset = PostMessageAudioAsset;

},{"./PostMessageAudioPlugin":72,"@akashic/akashic-engine":1}],71:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostMessageAudioPlayer = void 0;
var g = require("@akashic/akashic-engine");
var PostMessageAudioPlugin_1 = require("./PostMessageAudioPlugin");
var PostMessageAudioPlayer = /** @class */ (function (_super) {
    __extends(PostMessageAudioPlayer, _super);
    function PostMessageAudioPlayer(system, manager, id) {
        var _this = _super.call(this, system) || this;
        _this._manager = manager;
        _this.id = id;
        PostMessageAudioPlugin_1.PostMessageAudioPlugin.send("akashic:AudioPlayer#new", { id: id });
        return _this;
    }
    PostMessageAudioPlayer.prototype.play = function (asset) {
        PostMessageAudioPlugin_1.PostMessageAudioPlugin.send("akashic:AudioPlayer#play", { id: this.id, assetId: asset.id });
    };
    PostMessageAudioPlayer.prototype.stop = function () {
        PostMessageAudioPlugin_1.PostMessageAudioPlugin.send("akashic:AudioPlayer#stop", { id: this.id });
    };
    PostMessageAudioPlayer.prototype.changeVolume = function (volume) {
        _super.prototype.changeVolume.call(this, volume);
        PostMessageAudioPlugin_1.PostMessageAudioPlugin.send("akashic:AudioPlayer#changeVolume", { id: this.id, volume: this._calculateVolume() });
    };
    PostMessageAudioPlayer.prototype._changeMuted = function (muted) {
        _super.prototype._changeMuted.call(this, muted);
        PostMessageAudioPlugin_1.PostMessageAudioPlugin.send("akashic:AudioPlayer#changeVolume", { id: this.id, volume: this._calculateVolume() });
    };
    PostMessageAudioPlayer.prototype._changePlaybackRate = function (rate) {
        _super.prototype._changePlaybackRate.call(this, rate);
        PostMessageAudioPlugin_1.PostMessageAudioPlugin.send("akashic:AudioPlayer#changePlaybackRate", { id: this.id, rate: rate });
    };
    PostMessageAudioPlayer.prototype.notifyMasterVolumeChanged = function () {
        PostMessageAudioPlugin_1.PostMessageAudioPlugin.send("akashic:AudioPlayer#changeVolume", { id: this.id, volume: this._calculateVolume() });
    };
    PostMessageAudioPlayer.prototype._calculateVolume = function () {
        return this._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
    };
    return PostMessageAudioPlayer;
}(g.AudioPlayer));
exports.PostMessageAudioPlayer = PostMessageAudioPlayer;

},{"./PostMessageAudioPlugin":72,"@akashic/akashic-engine":1}],72:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostMessageAudioPlugin = void 0;
var PostMessageAudioAsset_1 = require("./PostMessageAudioAsset");
var PostMessageAudioPlayer_1 = require("./PostMessageAudioPlayer");
var PostMessageHandler_1 = require("./PostMessageHandler");
var postMessageHandler;
var PostMessageAudioPlugin = /** @class */ (function () {
    function PostMessageAudioPlugin() {
        // NOTE: `AudioPlugin` を継承しているため、ここでは仮に undefined を指定しておく
        // `AudioPlugin#supportedFormats` の削除も検討
        this.supportedFormats = undefined;
        this._playerIdx = 0;
    }
    PostMessageAudioPlugin.isSupported = function () {
        return typeof window !== "undefined" && !!window.postMessage;
    };
    /**
     * 本pluginを初期化する。
     * TODO: デバッグ用に `postMessageHandler` のインスタンスを返している
     * TODO: このI/Fは将来的に変更される可能性がある
     */
    PostMessageAudioPlugin.initialize = function (targetWindow, targetOrigin) {
        postMessageHandler = new PostMessageHandler_1.PostMessageHandler(targetWindow, targetOrigin);
        // NOTE: AudioPluginのライフサイクルが未定なのでここで開始
        postMessageHandler.start();
        return postMessageHandler;
    };
    /**
     * PostMessageを送信する。
     * `PostMessageAudioPlugin#initialize()` 以降に呼び出さなければならない。
     */
    PostMessageAudioPlugin.send = function (type, parameters) {
        postMessageHandler.send({
            type: type,
            parameters: parameters
        });
    };
    PostMessageAudioPlugin.prototype.createAsset = function (id, assetPath, duration, system, loop, hint) {
        return new PostMessageAudioAsset_1.PostMessageAudioAsset(id, assetPath, duration, system, loop, hint);
    };
    PostMessageAudioPlugin.prototype.createPlayer = function (system, manager) {
        return new PostMessageAudioPlayer_1.PostMessageAudioPlayer(system, manager, "" + this._playerIdx++);
    };
    return PostMessageAudioPlugin;
}());
exports.PostMessageAudioPlugin = PostMessageAudioPlugin;

},{"./PostMessageAudioAsset":70,"./PostMessageAudioPlayer":71,"./PostMessageHandler":73}],73:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostMessageHandler = void 0;
var g = require("@akashic/akashic-engine");
/**
 * PostMessageを利用したイベントエミッタ。
 * TODO: 暫定対応。このロジックを akashic-gameview-web 側に持たせる
 */
var PostMessageHandler = /** @class */ (function () {
    function PostMessageHandler(targetWindow, targetOrigin) {
        this.message = new g.Trigger();
        this.targetWindow = targetWindow;
        this.targetOrigin = targetOrigin;
        this.onMessage_bound = this.onMessage.bind(this);
    }
    PostMessageHandler.prototype.start = function () {
        window.addEventListener("message", this.onMessage_bound);
    };
    PostMessageHandler.prototype.stop = function () {
        window.removeEventListener("message", this.onMessage_bound);
    };
    PostMessageHandler.prototype.send = function (message) {
        this.targetWindow.postMessage(message, this.targetOrigin);
    };
    PostMessageHandler.prototype.onMessage = function (message) {
        if (message.origin !== this.targetOrigin) {
            return;
        }
        this.message.fire(message.data);
    };
    return PostMessageHandler;
}());
exports.PostMessageHandler = PostMessageHandler;

},{"@akashic/akashic-engine":1}],74:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyAudioAsset = void 0;
var g = require("@akashic/akashic-engine");
var ProxyAudioAsset = /** @class */ (function (_super) {
    __extends(ProxyAudioAsset, _super);
    function ProxyAudioAsset(handlerSet, id, assetPath, duration, system, loop, hint) {
        var _this = _super.call(this, id, assetPath, duration, system, loop, hint) || this;
        _this._handlerSet = handlerSet;
        return _this;
    }
    ProxyAudioAsset.prototype.destroy = function () {
        this._handlerSet.unloadAudioAsset(this.id);
        _super.prototype.destroy.call(this);
    };
    ProxyAudioAsset.prototype._load = function (loader) {
        var _this = this;
        this._handlerSet.loadAudioAsset({
            id: this.id,
            assetPath: this.path,
            duration: this.duration,
            loop: this.loop,
            hint: this.hint
        }, function (err) {
            if (err) {
                loader._onAssetError(_this, g.ExceptionFactory.createAssetLoadError(err));
            }
            else {
                loader._onAssetLoad(_this);
            }
        });
    };
    ProxyAudioAsset.prototype._assetPathFilter = function (path) {
        return path;
    };
    return ProxyAudioAsset;
}(g.AudioAsset));
exports.ProxyAudioAsset = ProxyAudioAsset;

},{"@akashic/akashic-engine":1}],75:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyAudioPlayer = void 0;
var g = require("@akashic/akashic-engine");
var ProxyAudioPlayer = /** @class */ (function (_super) {
    __extends(ProxyAudioPlayer, _super);
    function ProxyAudioPlayer(handlerSet, system, manager) {
        var _this = _super.call(this, system) || this;
        _this._audioPlayerId = null;
        _this._handlerSet = handlerSet;
        _this._manager = manager;
        return _this;
    }
    ProxyAudioPlayer.prototype.changeVolume = function (volume) {
        _super.prototype.changeVolume.call(this, volume);
        this._notifyVolumeToHandler();
    };
    ProxyAudioPlayer.prototype._changeMuted = function (muted) {
        _super.prototype._changeMuted.call(this, muted);
        this._notifyVolumeToHandler();
    };
    ProxyAudioPlayer.prototype.play = function (asset) {
        if (this._audioPlayerId != null) {
            this.stop();
        }
        this._audioPlayerId = "ap" + ProxyAudioPlayer._audioPlayerIdCounter++;
        this._handlerSet.createAudioPlayer({
            assetId: asset.id,
            audioPlayerId: this._audioPlayerId,
            isPlaying: true,
            volume: this._calculateVolume(),
            playbackRate: 1 // 未使用
        });
        _super.prototype.play.call(this, asset);
    };
    ProxyAudioPlayer.prototype.stop = function () {
        if (this._audioPlayerId != null) {
            this._handlerSet.stopAudioPlayer(this._audioPlayerId);
            this._handlerSet.destroyAudioPlayer(this._audioPlayerId);
            this._audioPlayerId = null;
        }
        _super.prototype.stop.call(this);
    };
    ProxyAudioPlayer.prototype.notifyMasterVolumeChanged = function () {
        this._notifyVolumeToHandler();
    };
    ProxyAudioPlayer.prototype._notifyVolumeToHandler = function () {
        if (this._audioPlayerId != null) {
            this._handlerSet.changeAudioVolume(this._audioPlayerId, this._calculateVolume());
        }
    };
    ProxyAudioPlayer.prototype._calculateVolume = function () {
        return this._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
    };
    ProxyAudioPlayer._audioPlayerIdCounter = 0;
    return ProxyAudioPlayer;
}(g.AudioPlayer));
exports.ProxyAudioPlayer = ProxyAudioPlayer;

},{"@akashic/akashic-engine":1}],76:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyAudioPlugin = void 0;
var ProxyAudioAsset_1 = require("./ProxyAudioAsset");
var ProxyAudioPlayer_1 = require("./ProxyAudioPlayer");
var ProxyAudioPlugin = /** @class */ (function () {
    function ProxyAudioPlugin(handlerSet) {
        this.supportedFormats = [];
        this._handlerSet = handlerSet;
    }
    ProxyAudioPlugin.isSupported = function () {
        return true;
    };
    ProxyAudioPlugin.prototype.createAsset = function (id, assetPath, duration, system, loop, hint) {
        return new ProxyAudioAsset_1.ProxyAudioAsset(this._handlerSet, id, assetPath, duration, system, loop, hint);
    };
    ProxyAudioPlugin.prototype.createPlayer = function (system, manager) {
        return new ProxyAudioPlayer_1.ProxyAudioPlayer(this._handlerSet, system, manager);
    };
    return ProxyAudioPlugin;
}());
exports.ProxyAudioPlugin = ProxyAudioPlugin;

},{"./ProxyAudioAsset":74,"./ProxyAudioPlayer":75}],77:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAudioAsset = void 0;
var g = require("@akashic/akashic-engine");
var XHRLoader_1 = require("../../utils/XHRLoader");
var helper = require("./WebAudioHelper");
var WebAudioAsset = /** @class */ (function (_super) {
    __extends(WebAudioAsset, _super);
    function WebAudioAsset() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WebAudioAsset.prototype._load = function (loader) {
        var _this = this;
        if (this.path == null) {
            // 再生可能な形式がない。実際には鳴らない音声としてロード成功しておく
            this.data = null;
            setTimeout(function () { return loader._onAssetLoad(_this); }, 0);
            return;
        }
        var successHandler = function (decodedAudio) {
            _this.data = decodedAudio;
            loader._onAssetLoad(_this);
        };
        var errorHandler = function () {
            loader._onAssetError(_this, g.ExceptionFactory.createAssetLoadError("WebAudioAsset unknown loading error"));
        };
        var onLoadArrayBufferHandler = function (response) {
            var audioContext = helper.getAudioContext();
            audioContext.decodeAudioData(response, successHandler, errorHandler);
        };
        var xhrLoader = new XHRLoader_1.XHRLoader();
        var loadArrayBuffer = function (path, onSuccess, onFailed) {
            xhrLoader.getArrayBuffer(path, function (error, response) {
                error ? onFailed(error) : onSuccess(response);
            });
        };
        var delIndex = this.path.indexOf("?");
        var basePath = delIndex >= 0 ? this.path.substring(0, delIndex) : this.path;
        if (basePath.slice(-4) === ".aac") {
            // 暫定対応：後方互換性のため、aacファイルが無い場合はmp4へのフォールバックを試みる。
            // この対応を止める際には、WebAudioPluginのsupportedExtensionsからaacを除外する必要がある。
            loadArrayBuffer(this.path, onLoadArrayBufferHandler, function (error) {
                var altPath = g.PathUtil.addExtname(_this.originalPath, "mp4");
                loadArrayBuffer(altPath, function (response) {
                    _this.path = altPath;
                    onLoadArrayBufferHandler(response);
                }, errorHandler);
            });
            return;
        }
        loadArrayBuffer(this.path, onLoadArrayBufferHandler, errorHandler);
    };
    WebAudioAsset.prototype._assetPathFilter = function (path) {
        if (WebAudioAsset.supportedFormats.indexOf("ogg") !== -1) {
            return g.PathUtil.addExtname(path, "ogg");
        }
        if (WebAudioAsset.supportedFormats.indexOf("aac") !== -1) {
            return g.PathUtil.addExtname(path, "aac");
        }
        // ここで検出されるのは最初にアクセスを試みるオーディオアセットのファイルパスなので、
        // supportedFormatsに(後方互換性保持で使う可能性がある)mp4が含まれていても利用しない
        return null;
    };
    // _assetPathFilterの判定処理を小さくするため、予めサポートしてる拡張子一覧を持つ
    WebAudioAsset.supportedFormats = [];
    return WebAudioAsset;
}(g.AudioAsset));
exports.WebAudioAsset = WebAudioAsset;

},{"../../utils/XHRLoader":82,"./WebAudioHelper":79,"@akashic/akashic-engine":1}],78:[function(require,module,exports){
"use strict";
var helper = require("./WebAudioHelper");
// chrome66以降などのブラウザに導入されるAutoplay Policyに対応する
// https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
var WebAudioAutoplayHelper;
(function (WebAudioAutoplayHelper) {
    function setupChromeMEIWorkaround() {
        var context = helper.getAudioContext();
        if (context && typeof context.resume !== "function")
            return;
        var gain = helper.createGainNode(context);
        // テスト用の音源を用意する
        var osc = context.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = 440; // 何でも良いがドの音
        osc.connect(gain);
        osc.start(0);
        var contextState = context.state;
        osc.disconnect();
        if (contextState !== "running")
            setUserInteractListener();
    }
    WebAudioAutoplayHelper.setupChromeMEIWorkaround = setupChromeMEIWorkaround;
})(WebAudioAutoplayHelper || (WebAudioAutoplayHelper = {}));
function resumeHandler() {
    var context = helper.getAudioContext();
    context.resume();
    clearUserInteractListener();
}
function setUserInteractListener() {
    document.addEventListener("keydown", resumeHandler, true);
    document.addEventListener("mousedown", resumeHandler, true);
    document.addEventListener("touchend", resumeHandler, true);
}
function clearUserInteractListener() {
    document.removeEventListener("keydown", resumeHandler);
    document.removeEventListener("mousedown", resumeHandler);
    document.removeEventListener("touchend", resumeHandler);
}
module.exports = WebAudioAutoplayHelper;

},{"./WebAudioHelper":79}],79:[function(require,module,exports){
"use strict";
// WebAudioのブラウザ間の差を吸収する
// Compatible Table: http://compatibility.shwups-cms.ch/en/home?&property=AudioParam.prototype
// http://qiita.com/mohayonao/items/d79e9fc56b4e9c157be1#polyfill
// https://github.com/cwilso/webkitAudioContext-MonkeyPatch
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Porting_webkitAudioContext_code_to_standards_based_AudioContext
var AudioContext = window.AudioContext || window.webkitAudioContext;
var WebAudioHelper;
(function (WebAudioHelper) {
    // AudioContextをシングルトンとして取得する
    // 一つのページに一つのContextが存在すれば良い
    function getAudioContext() {
        if (!window.__akashic__) {
            Object.defineProperty(window, "__akashic__", {
                value: {},
                enumerable: false,
                configurable: false,
                writable: false
            });
        }
        var ctx = window.__akashic__.audioContext;
        if (!(ctx instanceof AudioContext)) {
            ctx = window.__akashic__.audioContext = new AudioContext();
            WebAudioHelper._workAroundSafari();
        }
        return ctx;
    }
    WebAudioHelper.getAudioContext = getAudioContext;
    function createGainNode(context) {
        if (context.createGain) {
            return context.createGain();
        }
        return context.createGainNode();
    }
    WebAudioHelper.createGainNode = createGainNode;
    function createBufferNode(context) {
        var sourceNode = context.createBufferSource();
        // startがあるなら問題ないので、拡張しないで返す
        if (sourceNode.start) {
            return sourceNode;
        }
        // start/stopがない環境へのエイリアスを貼る
        sourceNode.start = sourceNode.noteOn;
        sourceNode.stop = sourceNode.noteOff;
        return sourceNode;
    }
    WebAudioHelper.createBufferNode = createBufferNode;
    // Safari対策ワークアラウンド
    function _workAroundSafari() {
        document.addEventListener("touchstart", function touchInitializeHandler() {
            document.removeEventListener("touchstart", touchInitializeHandler);
            WebAudioHelper.getAudioContext().createBufferSource().start(0);
        }, true);
    }
    WebAudioHelper._workAroundSafari = _workAroundSafari;
})(WebAudioHelper || (WebAudioHelper = {}));
module.exports = WebAudioHelper;

},{}],80:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAudioPlayer = void 0;
var g = require("@akashic/akashic-engine");
var helper = require("./WebAudioHelper");
var WebAudioPlayer = /** @class */ (function (_super) {
    __extends(WebAudioPlayer, _super);
    function WebAudioPlayer(system, manager) {
        var _this = _super.call(this, system) || this;
        _this._audioContext = helper.getAudioContext();
        _this._manager = manager;
        _this._gainNode = helper.createGainNode(_this._audioContext);
        _this._gainNode.connect(_this._audioContext.destination);
        _this._sourceNode = undefined;
        _this._dummyDurationWaitTimer = null;
        _this._endedEventHandler = function () {
            _this._onAudioEnded();
        };
        return _this;
    }
    WebAudioPlayer.prototype.changeVolume = function (volume) {
        _super.prototype.changeVolume.call(this, volume);
        this._gainNode.gain.value = this._calculateVolume();
    };
    WebAudioPlayer.prototype._changeMuted = function (muted) {
        _super.prototype._changeMuted.call(this, muted);
        this._gainNode.gain.value = this._calculateVolume();
    };
    WebAudioPlayer.prototype.play = function (asset) {
        if (this.currentAudio) {
            this.stop();
        }
        if (asset.data) {
            var bufferNode = helper.createBufferNode(this._audioContext);
            bufferNode.loop = asset.loop;
            bufferNode.buffer = asset.data;
            this._gainNode.gain.value = this._calculateVolume();
            bufferNode.connect(this._gainNode);
            this._sourceNode = bufferNode;
            // Chromeだとevent listerで指定した場合に動かないことがある
            // https://github.com/mozilla-appmaker/appmaker/issues/1984
            this._sourceNode.onended = this._endedEventHandler;
            this._sourceNode.start(0);
        }
        else {
            // 再生できるオーディオがない場合。duration後に停止処理だけ行う(処理のみ進め音は鳴らさない)
            this._dummyDurationWaitTimer = setTimeout(this._endedEventHandler, asset.duration);
        }
        _super.prototype.play.call(this, asset);
    };
    WebAudioPlayer.prototype.stop = function () {
        if (!this.currentAudio) {
            _super.prototype.stop.call(this);
            return;
        }
        this._clearEndedEventHandler();
        if (this._sourceNode)
            this._sourceNode.stop(0);
        _super.prototype.stop.call(this);
    };
    WebAudioPlayer.prototype.notifyMasterVolumeChanged = function () {
        this._gainNode.gain.value = this._calculateVolume();
    };
    WebAudioPlayer.prototype._onAudioEnded = function () {
        this._clearEndedEventHandler();
        _super.prototype.stop.call(this);
    };
    WebAudioPlayer.prototype._clearEndedEventHandler = function () {
        if (this._sourceNode)
            this._sourceNode.onended = null;
        if (this._dummyDurationWaitTimer != null) {
            clearTimeout(this._dummyDurationWaitTimer);
            this._dummyDurationWaitTimer = null;
        }
    };
    WebAudioPlayer.prototype._calculateVolume = function () {
        return this._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
    };
    return WebAudioPlayer;
}(g.AudioPlayer));
exports.WebAudioPlayer = WebAudioPlayer;

},{"./WebAudioHelper":79,"@akashic/akashic-engine":1}],81:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAudioPlugin = void 0;
var WebAudioAsset_1 = require("./WebAudioAsset");
var WebAudioPlayer_1 = require("./WebAudioPlayer");
var autoPlayHelper = require("./WebAudioAutoplayHelper");
var WebAudioPlugin = /** @class */ (function () {
    /* tslint:enable:typedef */
    function WebAudioPlugin() {
        this.supportedFormats = this._detectSupportedFormats();
        autoPlayHelper.setupChromeMEIWorkaround();
    }
    // AudioContextが存在するかどうかで判定する
    // http://mohayonao.hatenablog.com/entry/2012/12/12/103009
    // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio/webaudio.js
    WebAudioPlugin.isSupported = function () {
        if ("AudioContext" in window) {
            return true;
        }
        else if ("webkitAudioContext" in window) {
            return true;
        }
        return false;
    };
    Object.defineProperty(WebAudioPlugin.prototype, "supportedFormats", {
        get: function () {
            return this._supportedFormats;
        },
        // TSLintのバグ - setterはreturn typeを書くとコンパイルエラーとなる
        /* tslint:disable:typedef */
        // WebAudioAssetへサポートしているフォーマット一覧を渡す
        set: function (supportedFormats) {
            this._supportedFormats = supportedFormats;
            WebAudioAsset_1.WebAudioAsset.supportedFormats = supportedFormats;
        },
        enumerable: false,
        configurable: true
    });
    WebAudioPlugin.prototype.createAsset = function (id, assetPath, duration, system, loop, hint) {
        return new WebAudioAsset_1.WebAudioAsset(id, assetPath, duration, system, loop, hint);
    };
    WebAudioPlugin.prototype.createPlayer = function (system, manager) {
        return new WebAudioPlayer_1.WebAudioPlayer(system, manager);
    };
    WebAudioPlugin.prototype._detectSupportedFormats = function () {
        // Edgeは再生できるファイル形式とcanPlayTypeの結果が一致しないため、固定でAACを利用する
        if (navigator.userAgent.indexOf("Edge/") !== -1)
            return ["aac"];
        // Audio要素を実際に作って、canPlayTypeで再生できるかを判定する
        var audioElement = document.createElement("audio");
        var supportedFormats = [];
        try {
            var supportedExtensions = ["ogg", "aac", "mp4"];
            for (var i = 0, len = supportedExtensions.length; i < len; i++) {
                var ext = supportedExtensions[i];
                var canPlay = audioElement.canPlayType("audio/" + ext);
                var supported = (canPlay !== "no" && canPlay !== "");
                if (supported) {
                    supportedFormats.push(ext);
                }
            }
        }
        catch (e) {
            // ignore Error
        }
        return supportedFormats;
    };
    return WebAudioPlugin;
}());
exports.WebAudioPlugin = WebAudioPlugin;

},{"./WebAudioAsset":77,"./WebAudioAutoplayHelper":78,"./WebAudioPlayer":80}],82:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XHRLoader = void 0;
var g = require("@akashic/akashic-engine");
var XHRLoader = /** @class */ (function () {
    function XHRLoader(options) {
        if (options === void 0) { options = {}; }
        // デフォルトのタイムアウトは15秒
        // TODO: タイムアウト値はこれが妥当であるか後日詳細を検討する
        this.timeout = options.timeout || 15000;
    }
    XHRLoader.prototype.get = function (url, callback) {
        this._getRequestObject({
            url: url,
            responseType: "text"
        }, callback);
    };
    XHRLoader.prototype.getArrayBuffer = function (url, callback) {
        this._getRequestObject({
            url: url,
            responseType: "arraybuffer"
        }, callback);
    };
    XHRLoader.prototype._getRequestObject = function (requestObject, callback) {
        var request = new XMLHttpRequest();
        request.open("GET", requestObject.url, true);
        request.responseType = requestObject.responseType;
        request.timeout = this.timeout;
        request.addEventListener("timeout", function () {
            callback(g.ExceptionFactory.createAssetLoadError("loading timeout"));
        }, false);
        request.addEventListener("load", function () {
            if (request.status >= 200 && request.status < 300) {
                // "text" とそれ以外で取得方法を分類する
                var response = requestObject.responseType === "text" ? request.responseText : request.response;
                callback(null, response);
            }
            else {
                callback(g.ExceptionFactory.createAssetLoadError("loading error. status: " + request.status));
            }
        }, false);
        request.addEventListener("error", function () {
            callback(g.ExceptionFactory.createAssetLoadError("loading error. status: " + request.status));
        }, false);
        request.send();
    };
    return XHRLoader;
}());
exports.XHRLoader = XHRLoader;

},{"@akashic/akashic-engine":1}],83:[function(require,module,exports){
(function (process,global){(function (){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    var then$$1 = void 0;
    try {
      then$$1 = value.then;
    } catch (error) {
      reject(promise, error);
      return;
    }
    handleMaybeThenable(promise, value, then$$1);
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = true;

  if (hasCallback) {
    try {
      value = callback(detail);
    } catch (e) {
      succeeded = false;
      error = e;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (succeeded === false) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = void 0;
      var error = void 0;
      var didError = false;
      try {
        _then = entry.then;
      } catch (e) {
        didError = true;
        error = e;
      }

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        if (didError) {
          reject(promise, error);
        } else {
          handleMaybeThenable(promise, entry, _then);
        }
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));





}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":84}],84:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],85:[function(require,module,exports){
module.exports = {
	gameDriver: require("@akashic/game-driver"),
	akashicEngine: require("@akashic/akashic-engine"),
	pdiBrowser: require("@akashic/pdi-browser")
};

},{"@akashic/akashic-engine":1,"@akashic/game-driver":4,"@akashic/pdi-browser":28}]},{},[85])(85)
});
