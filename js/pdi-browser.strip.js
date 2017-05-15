require = function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = "function" == typeof require && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f;
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    for (var i = "function" == typeof require && require, o = 0; o < r.length; o++) s(r[o]);
    return s;
}({
    "@akashic/pdi-browser": [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var Platform_1 = require("./Platform");
        exports.Platform = Platform_1.Platform;
        var ResourceFactory_1 = require("./ResourceFactory");
        exports.ResourceFactory = ResourceFactory_1.ResourceFactory;
        var g = require("@akashic/akashic-engine");
        exports.g = g;
        var AudioPluginRegistry_1 = require("./plugin/AudioPluginRegistry");
        exports.AudioPluginRegistry = AudioPluginRegistry_1.AudioPluginRegistry;
        var AudioPluginManager_1 = require("./plugin/AudioPluginManager");
        exports.AudioPluginManager = AudioPluginManager_1.AudioPluginManager;
        var HTMLAudioPlugin_1 = require("./plugin/HTMLAudioPlugin/HTMLAudioPlugin");
        exports.HTMLAudioPlugin = HTMLAudioPlugin_1.HTMLAudioPlugin;
        var WebAudioPlugin_1 = require("./plugin/WebAudioPlugin/WebAudioPlugin");
        exports.WebAudioPlugin = WebAudioPlugin_1.WebAudioPlugin;
    }, {
        "./Platform": 3,
        "./ResourceFactory": 5,
        "./plugin/AudioPluginManager": 34,
        "./plugin/AudioPluginRegistry": 35,
        "./plugin/HTMLAudioPlugin/HTMLAudioPlugin": 38,
        "./plugin/WebAudioPlugin/WebAudioPlugin": 42,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    1: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), RenderingHelper_1 = require("./canvas/RenderingHelper"), InputHandlerLayer_1 = require("./InputHandlerLayer"), ContainerController = function() {
            function ContainerController() {
                this.container = null, this.surface = null, this.inputHandlerLayer = null, this.rootView = null, 
                this.defaultSize = null, this.useResizeForScaling = !1, this.pointEventTrigger = new g.Trigger(), 
                this._rendererReq = null, this._disablePreventDefault = !1;
            }
            return ContainerController.prototype.initialize = function(param) {
                this._rendererReq = param.rendererRequirement, this._disablePreventDefault = !!param.disablePreventDefault, 
                this._loadView();
            }, ContainerController.prototype.setRootView = function(rootView) {
                var _this = this;
                rootView !== this.rootView && (this.rootView && (this.unloadView(), this._loadView()), 
                this.rootView = rootView, rootView.appendChild(this.container), this.inputHandlerLayer.enablePointerEvent(), 
                this.inputHandlerLayer.pointEventTrigger.handle(function(ev) {
                    _this.pointEventTrigger.fire(ev);
                }));
            }, ContainerController.prototype.getRenderer = function() {
                if (!this.surface) throw new Error("this container has no surface");
                return this.surface.renderer();
            }, ContainerController.prototype.fitToSize = function(viewportSize, noCenter) {
                var gameScale = Math.min(viewportSize.width / this._rendererReq.primarySurfaceWidth, viewportSize.height / this._rendererReq.primarySurfaceHeight), gameSize = {
                    width: Math.floor(this._rendererReq.primarySurfaceWidth * gameScale),
                    height: Math.floor(this._rendererReq.primarySurfaceHeight * gameScale)
                }, gameOffset = {
                    x: Math.floor((viewportSize.width - gameSize.width) / 2),
                    y: Math.floor((viewportSize.height - gameSize.height) / 2)
                };
                this.changeScale(gameScale, gameScale), noCenter && this.inputHandlerLayer.setOffset(gameOffset);
            }, ContainerController.prototype.revertSize = function() {
                this.fitToSize(this.defaultSize);
            }, ContainerController.prototype.changeScale = function(xScale, yScale) {
                this.useResizeForScaling ? this.surface.changeCanvasSize(this.defaultSize.width * xScale, this.defaultSize.height * yScale) : this.surface.changeCanvasScale(xScale, yScale, this.defaultSize), 
                this.inputHandlerLayer._inputHandler.setScale(xScale, yScale);
            }, ContainerController.prototype.unloadView = function() {
                if (this.inputHandlerLayer.disablePointerEvent(), this.rootView) for (;this.rootView.firstChild; ) this.rootView.removeChild(this.rootView.firstChild);
            }, ContainerController.prototype._loadView = function() {
                this.container = document.createDocumentFragment(), this.inputHandlerLayer = new InputHandlerLayer_1.InputHandlerLayer({
                    width: this._rendererReq.primarySurfaceWidth,
                    height: this._rendererReq.primarySurfaceHeight,
                    disablePreventDefault: this._disablePreventDefault
                }), this.surface = RenderingHelper_1.RenderingHelper.createPrimarySurface(this._rendererReq.primarySurfaceWidth, this._rendererReq.primarySurfaceHeight, this._rendererReq.rendererCandidates), 
                this.surface.setParentElement(this.inputHandlerLayer.view), this.container.appendChild(this.inputHandlerLayer.view), 
                this.defaultSize = {
                    width: this.surface.width,
                    height: this.surface.height
                };
            }, ContainerController;
        }();
        exports.ContainerController = ContainerController;
    }, {
        "./InputHandlerLayer": 2,
        "./canvas/RenderingHelper": 16,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    2: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), MouseHandler_1 = require("./handler/MouseHandler"), TouchHandler_1 = require("./handler/TouchHandler"), InputHandlerLayer = function() {
            function InputHandlerLayer(param) {
                this.view = this._createInputView(param.width, param.height), this._inputHandler = void 0, 
                this.pointEventTrigger = new g.Trigger(), this._disablePreventDefault = !!param.disablePreventDefault;
            }
            return InputHandlerLayer.prototype.enablePointerEvent = function() {
                var _this = this;
                TouchHandler_1.TouchHandler.isSupported() ? this._inputHandler = new TouchHandler_1.TouchHandler(this.view, this._disablePreventDefault) : this._inputHandler = new MouseHandler_1.MouseHandler(this.view, this._disablePreventDefault), 
                this._inputHandler.pointTrigger.handle(function(e) {
                    _this.pointEventTrigger.fire(e);
                }), this._inputHandler.start();
            }, InputHandlerLayer.prototype.disablePointerEvent = function() {
                this._inputHandler.stop();
            }, InputHandlerLayer.prototype.setOffset = function(offset) {
                var inputViewStyle = "position:relative; left:" + offset.x + "px; top:" + offset.y + "px";
                this._inputHandler.inputView.setAttribute("style", inputViewStyle), this._inputHandler.setOffset(offset);
            }, InputHandlerLayer.prototype.notifyViewMoved = function() {
                this._inputHandler.notifyViewMoved();
            }, InputHandlerLayer.prototype._createInputView = function(width, height) {
                var view = document.createElement("div");
                return view.setAttribute("tabindex", "1"), view.className = "input-handler", view.setAttribute("style", "display:inline-block; outline:none;"), 
                view.style.width = width + "px", view.style.height = height + "px", view;
            }, InputHandlerLayer;
        }();
        exports.InputHandlerLayer = InputHandlerLayer;
    }, {
        "./handler/MouseHandler": 32,
        "./handler/TouchHandler": 33,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    3: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var RafLooper_1 = require("./RafLooper"), ResourceFactory_1 = require("./ResourceFactory"), ContainerController_1 = require("./ContainerController"), AudioPluginManager_1 = require("./plugin/AudioPluginManager"), AudioPluginRegistry_1 = require("./plugin/AudioPluginRegistry"), XHRTextAsset_1 = require("./asset/XHRTextAsset"), Platform = function() {
            function Platform(param) {
                this.containerView = param.containerView, this.containerController = new ContainerController_1.ContainerController(), 
                this.audioPluginManager = new AudioPluginManager_1.AudioPluginManager(), param.audioPlugins && this.audioPluginManager.tryInstallPlugin(param.audioPlugins), 
                this.audioPluginManager.tryInstallPlugin(AudioPluginRegistry_1.AudioPluginRegistry.getRegisteredAudioPlugins()), 
                this.amflow = param.amflow, this._platformEventHandler = null, this._resourceFactory = param.resourceFactory || new ResourceFactory_1.ResourceFactory({
                    audioPluginManager: this.audioPluginManager,
                    platform: this
                }), this._rendererReq = null, this._disablePreventDefault = !!param.disablePreventDefault;
            }
            return Platform.prototype.setPlatformEventHandler = function(handler) {
                this.containerController && (this.containerController.pointEventTrigger.removeAll(this._platformEventHandler), 
                this.containerController.pointEventTrigger.handle(handler, handler.onPointEvent)), 
                this._platformEventHandler = handler;
            }, Platform.prototype.loadGameConfiguration = function(url, callback) {
                var a = new XHRTextAsset_1.XHRTextAsset("(game.json)", url);
                a._load({
                    _onAssetLoad: function(asset) {
                        callback(null, JSON.parse(a.data));
                    },
                    _onAssetError: function(asset, error) {
                        callback(error, null);
                    }
                });
            }, Platform.prototype.getResourceFactory = function() {
                return this._resourceFactory;
            }, Platform.prototype.setRendererRequirement = function(requirement) {
                if (!requirement) return void (this.containerController && this.containerController.unloadView());
                this._rendererReq = requirement, this._resourceFactory._rendererCandidates = this._rendererReq.rendererCandidates, 
                this.containerController.initialize({
                    rendererRequirement: this._rendererReq,
                    disablePreventDefault: this._disablePreventDefault
                }), this.containerController.setRootView(this.containerView), this._platformEventHandler && this.containerController.pointEventTrigger.handle(this._platformEventHandler, this._platformEventHandler.onPointEvent);
                var parentView = this.containerView.parentElement;
                this.defaultViewMargin = parentView.style.margin, this.defaultViewPadding = parentView.style.padding, 
                this.defaultViewOverflow = parentView.style.overflow;
            }, Platform.prototype.getPrimarySurface = function() {
                return this.containerController.surface;
            }, Platform.prototype.getOperationPluginViewInfo = function() {
                var _this = this;
                return {
                    type: "pdi-browser",
                    view: this.containerController.inputHandlerLayer.view,
                    getScale: function() {
                        return _this.containerController.inputHandlerLayer._inputHandler.getScale();
                    }
                };
            }, Platform.prototype.createLooper = function(fun) {
                return new RafLooper_1.RafLooper(fun);
            }, Platform.prototype.sendToExternal = function(playId, data) {}, Platform.prototype.registerAudioPlugins = function(plugins) {
                return this.audioPluginManager.tryInstallPlugin(plugins);
            }, Platform.prototype.setScale = function(xScale, yScale) {
                this.containerController.changeScale(xScale, yScale);
            }, Platform.prototype.fitToWindow = function(noCenter) {
                if (this.containerController) {
                    var parentView = this.containerView.parentElement;
                    parentView.style.margin = "0px", parentView.style.padding = "0px", parentView.style.overflow = "hidden";
                    var viewportSize = {
                        width: window.innerWidth || document.documentElement.clientWidth,
                        height: window.innerHeight || document.documentElement.clientHeight
                    };
                    this.containerController.fitToSize(viewportSize, noCenter);
                }
            }, Platform.prototype.revertViewSize = function() {
                var parentView = this.containerView.parentElement;
                parentView.style.margin = this.defaultViewMargin, parentView.style.padding = this.defaultViewPadding, 
                parentView.style.overflow = this.defaultViewOverflow, this.containerController.revertSize();
            }, Platform.prototype.notifyViewMoved = function() {
                this.containerController.inputHandlerLayer.notifyViewMoved();
            }, Platform;
        }();
        exports.Platform = Platform;
    }, {
        "./ContainerController": 1,
        "./RafLooper": 4,
        "./ResourceFactory": 5,
        "./asset/XHRTextAsset": 11,
        "./plugin/AudioPluginManager": 34,
        "./plugin/AudioPluginRegistry": 35
    } ],
    4: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var RafLooper = function() {
            function RafLooper(fun) {
                this._fun = fun, this._timerId = void 0, this._prev = 0;
            }
            return RafLooper.prototype.start = function() {
                var _this = this, onAnimationFrame = function(deltaTime) {
                    _this._timerId = requestAnimationFrame(onAnimationFrame), _this._fun(deltaTime - _this._prev), 
                    _this._prev = deltaTime;
                }, onFirstFrame = function(deltaTime) {
                    _this._timerId = requestAnimationFrame(onAnimationFrame), _this._fun(0), _this._prev = deltaTime;
                };
                this._timerId = requestAnimationFrame(onFirstFrame);
            }, RafLooper.prototype.stop = function() {
                cancelAnimationFrame(this._timerId), this._timerId = void 0, this._prev = 0;
            }, RafLooper;
        }();
        exports.RafLooper = RafLooper;
    }, {} ],
    5: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), HTMLImageAsset_1 = require("./asset/HTMLImageAsset"), HTMLVideoAsset_1 = require("./asset/HTMLVideoAsset"), XHRTextAsset_1 = require("./asset/XHRTextAsset"), XHRScriptAsset_1 = require("./asset/XHRScriptAsset"), RenderingHelper_1 = require("./canvas/RenderingHelper"), GlyphFactory_1 = require("./canvas/GlyphFactory"), SurfaceAtlas_1 = require("./canvas/SurfaceAtlas"), ResourceFactory = function(_super) {
            function ResourceFactory(param) {
                var _this = _super.call(this) || this;
                return _this._audioPluginManager = param.audioPluginManager, _this._platform = param.platform, 
                _this;
            }
            return __extends(ResourceFactory, _super), ResourceFactory.prototype.createAudioAsset = function(id, assetPath, duration, system, loop, hint) {
                var activePlugin = this._audioPluginManager.getActivePlugin();
                return activePlugin.createAsset(id, assetPath, duration, system, loop, hint);
            }, ResourceFactory.prototype.createAudioPlayer = function(system) {
                var activePlugin = this._audioPluginManager.getActivePlugin();
                return activePlugin.createPlayer(system);
            }, ResourceFactory.prototype.createImageAsset = function(id, assetPath, width, height) {
                return new HTMLImageAsset_1.HTMLImageAsset(id, assetPath, width, height);
            }, ResourceFactory.prototype.createVideoAsset = function(id, assetPath, width, height, system, loop, useRealSize) {
                return new HTMLVideoAsset_1.HTMLVideoAsset(id, assetPath, width, height, system, loop, useRealSize);
            }, ResourceFactory.prototype.createTextAsset = function(id, assetPath) {
                return new XHRTextAsset_1.XHRTextAsset(id, assetPath);
            }, ResourceFactory.prototype.createScriptAsset = function(id, assetPath) {
                return new XHRScriptAsset_1.XHRScriptAsset(id, assetPath);
            }, ResourceFactory.prototype.createSurface = function(width, height) {
                return RenderingHelper_1.RenderingHelper.createBackSurface(width, height, this._platform, this._rendererCandidates);
            }, ResourceFactory.prototype.createGlyphFactory = function(fontFamily, fontSize, baseline, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
                return new GlyphFactory_1.GlyphFactory(fontFamily, fontSize, baseline, RenderingHelper_1.RenderingHelper.usedWebGL(this._rendererCandidates), fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight);
            }, ResourceFactory.prototype.createSurfaceAtlas = function(width, height) {
                return new SurfaceAtlas_1.SurfaceAtlas(this.createSurface(width, height));
            }, ResourceFactory;
        }(g.ResourceFactory);
        exports.ResourceFactory = ResourceFactory;
    }, {
        "./asset/HTMLImageAsset": 7,
        "./asset/HTMLVideoAsset": 8,
        "./asset/XHRScriptAsset": 10,
        "./asset/XHRTextAsset": 11,
        "./canvas/GlyphFactory": 15,
        "./canvas/RenderingHelper": 16,
        "./canvas/SurfaceAtlas": 19,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    6: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var RuntimeInfo;
        !function(RuntimeInfo) {
            function pointerEnabled() {
                return "pointerEnabled" in window.navigator;
            }
            function msPointerEnabled() {
                return "msPointerEnabled" in window.navigator;
            }
            function touchEnabled() {
                return "ontouchstart" in window;
            }
            RuntimeInfo.pointerEnabled = pointerEnabled, RuntimeInfo.msPointerEnabled = msPointerEnabled, 
            RuntimeInfo.touchEnabled = touchEnabled;
        }(RuntimeInfo = exports.RuntimeInfo || (exports.RuntimeInfo = {}));
    }, {} ],
    7: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), ImageAssetSurface = function(_super) {
            function ImageAssetSurface(width, height, drawable) {
                return _super.call(this, width, height, drawable) || this;
            }
            return __extends(ImageAssetSurface, _super), ImageAssetSurface.prototype.renderer = function() {
                throw g.ExceptionFactory.createAssertionError("ImageAssetSurface cannot be rendered.");
            }, ImageAssetSurface.prototype.isPlaying = function() {
                return !1;
            }, ImageAssetSurface;
        }(g.Surface);
        exports.ImageAssetSurface = ImageAssetSurface;
        var HTMLImageAsset = function(_super) {
            function HTMLImageAsset(id, path, width, height) {
                var _this = _super.call(this, id, path, width, height) || this;
                return _this.data = void 0, _this._surface = void 0, _this;
            }
            return __extends(HTMLImageAsset, _super), HTMLImageAsset.prototype.destroy = function() {
                this._surface && !this._surface.destroyed() && this._surface.destroy(), this.data = void 0, 
                this._surface = void 0, _super.prototype.destroy.call(this);
            }, HTMLImageAsset.prototype._load = function(loader) {
                var _this = this, image = new Image();
                image.onerror = function() {
                    loader._onAssetError(_this, g.ExceptionFactory.createAssetLoadError("HTMLImageAsset unknown loading error"));
                }, image.onload = function() {
                    _this.data = image, loader._onAssetLoad(_this);
                }, image.src = this.path;
            }, HTMLImageAsset.prototype.asSurface = function() {
                if (!this.data) throw g.ExceptionFactory.createAssertionError("ImageAssetImpl#asSurface: not yet loaded.");
                return this._surface ? this._surface : (this._surface = new ImageAssetSurface(this.width, this.height, this.data), 
                this._surface);
            }, HTMLImageAsset;
        }(g.ImageAsset);
        exports.HTMLImageAsset = HTMLImageAsset;
    }, {
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    8: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), HTMLVideoPlayer_1 = require("./HTMLVideoPlayer"), VideoAssetSurface = function(_super) {
            function VideoAssetSurface(width, height, drawable) {
                return _super.call(this, width, height, drawable, !0) || this;
            }
            return __extends(VideoAssetSurface, _super), VideoAssetSurface.prototype.renderer = function() {
                throw g.ExceptionFactory.createAssertionError("VideoAssetSurface cannot be rendered.");
            }, VideoAssetSurface.prototype.isPlaying = function() {
                return !1;
            }, VideoAssetSurface;
        }(g.Surface), HTMLVideoAsset = function(_super) {
            function HTMLVideoAsset(id, assetPath, width, height, system, loop, useRealSize) {
                var _this = _super.call(this, id, assetPath, width, height, system, loop, useRealSize) || this;
                return _this._player = new HTMLVideoPlayer_1.HTMLVideoPlayer(), _this._surface = new VideoAssetSurface(width, height, null), 
                _this;
            }
            return __extends(HTMLVideoAsset, _super), HTMLVideoAsset.prototype.inUse = function() {
                return !1;
            }, HTMLVideoAsset.prototype._load = function(loader) {
                var _this = this;
                setTimeout(function() {
                    loader._onAssetLoad(_this);
                }, 0);
            }, HTMLVideoAsset.prototype.getPlayer = function() {
                return this._player;
            }, HTMLVideoAsset.prototype.asSurface = function() {
                return this._surface;
            }, HTMLVideoAsset;
        }(g.VideoAsset);
        exports.HTMLVideoAsset = HTMLVideoAsset;
    }, {
        "./HTMLVideoPlayer": 9,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    9: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), HTMLVideoPlayer = function(_super) {
            function HTMLVideoPlayer(loop) {
                var _this = _super.call(this, loop) || this;
                return _this.isDummy = !0, _this;
            }
            return __extends(HTMLVideoPlayer, _super), HTMLVideoPlayer.prototype.play = function(videoAsset) {}, 
            HTMLVideoPlayer.prototype.stop = function() {}, HTMLVideoPlayer.prototype.changeVolume = function(volume) {}, 
            HTMLVideoPlayer;
        }(g.VideoPlayer);
        exports.HTMLVideoPlayer = HTMLVideoPlayer;
    }, {
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    10: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), XHRLoader_1 = require("../utils/XHRLoader"), XHRScriptAsset = function(_super) {
            function XHRScriptAsset(id, path) {
                var _this = _super.call(this, id, path) || this;
                return _this.script = void 0, _this;
            }
            return __extends(XHRScriptAsset, _super), XHRScriptAsset.prototype._load = function(handler) {
                var _this = this, loader = new XHRLoader_1.XHRLoader();
                loader.get(this.path, function(error, responseText) {
                    return error ? void handler._onAssetError(_this, error) : (_this.script = responseText + "\n", 
                    void handler._onAssetLoad(_this));
                });
            }, XHRScriptAsset.prototype.execute = function(execEnv) {
                var func = this._wrap();
                return func(execEnv), execEnv.module.exports;
            }, XHRScriptAsset.prototype._wrap = function() {
                var func = new Function("g", XHRScriptAsset.PRE_SCRIPT + this.script + XHRScriptAsset.POST_SCRIPT);
                return func;
            }, XHRScriptAsset;
        }(g.ScriptAsset);
        XHRScriptAsset.PRE_SCRIPT = "(function(exports, require, module, __filename, __dirname) {", 
        XHRScriptAsset.POST_SCRIPT = "})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);", 
        exports.XHRScriptAsset = XHRScriptAsset;
    }, {
        "../utils/XHRLoader": 43,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    11: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), XHRLoader_1 = require("../utils/XHRLoader"), XHRTextAsset = function(_super) {
            function XHRTextAsset(id, path) {
                var _this = _super.call(this, id, path) || this;
                return _this.data = void 0, _this;
            }
            return __extends(XHRTextAsset, _super), XHRTextAsset.prototype._load = function(handler) {
                var _this = this, loader = new XHRLoader_1.XHRLoader();
                loader.get(this.path, function(error, responseText) {
                    return error ? void handler._onAssetError(_this, error) : (_this.data = responseText, 
                    void handler._onAssetLoad(_this));
                });
            }, XHRTextAsset;
        }(g.TextAsset);
        exports.XHRTextAsset = XHRTextAsset;
    }, {
        "../utils/XHRLoader": 43,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    12: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var AffineTransformer = function() {
            function AffineTransformer(rhs) {
                rhs ? this.matrix = new Float32Array(rhs.matrix) : this.matrix = new Float32Array([ 1, 0, 0, 1, 0, 0 ]);
            }
            return AffineTransformer.prototype.scale = function(x, y) {
                var m = this.matrix;
                return m[0] *= x, m[1] *= x, m[2] *= y, m[3] *= y, this;
            }, AffineTransformer.prototype.translate = function(x, y) {
                var m = this.matrix;
                return m[4] += m[0] * x + m[2] * y, m[5] += m[1] * x + m[3] * y, this;
            }, AffineTransformer.prototype.transform = function(matrix) {
                var m = this.matrix, a = matrix[0] * m[0] + matrix[1] * m[2], b = matrix[0] * m[1] + matrix[1] * m[3], c = matrix[2] * m[0] + matrix[3] * m[2], d = matrix[2] * m[1] + matrix[3] * m[3], e = matrix[4] * m[0] + matrix[5] * m[2] + m[4], f = matrix[4] * m[1] + matrix[5] * m[3] + m[5];
                return m[0] = a, m[1] = b, m[2] = c, m[3] = d, m[4] = e, m[5] = f, this;
            }, AffineTransformer.prototype.copyFrom = function(rhs) {
                return this.matrix.set(rhs.matrix), this;
            }, AffineTransformer;
        }();
        exports.AffineTransformer = AffineTransformer;
    }, {} ],
    13: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), Context2DRenderer_1 = require("./Context2DRenderer"), CanvasSurface = function(_super) {
            function CanvasSurface(width, height, rendererCandidates) {
                var _this = this, canvas = document.createElement("canvas");
                return _this = _super.call(this, width, height, canvas) || this, canvas.width = width, 
                canvas.height = height, _this._originalWidth = width, _this._originalHeight = height, 
                _this.canvas = canvas, _this._rendererCandidates = rendererCandidates, _this._renderer = void 0, 
                _this._imageDataCache = void 0, _this;
            }
            return __extends(CanvasSurface, _super), CanvasSurface.prototype.context = function() {
                return this.canvas.getContext("2d");
            }, CanvasSurface.prototype.renderer = function() {
                return this._renderer || (this._renderer = new Context2DRenderer_1.Context2DRenderer(this)), 
                this._renderer;
            }, CanvasSurface.prototype.destroy = function() {
                this._drawable = void 0, this._imageDataCache = void 0, _super.prototype.destroy.call(this);
            }, CanvasSurface.prototype.setParentElement = function(parent) {
                parent.appendChild(this.canvas);
            }, CanvasSurface.prototype.changeCanvasSize = function(width, height) {
                var context = this.context();
                this.canvas.width = width, this.canvas.height = height, context.scale(width / this._originalWidth, height / this._originalHeight), 
                this.width = width, this.height = height;
            }, CanvasSurface.prototype.changeCanvasScale = function(xScale, yScale, defaultSize) {
                var canvasStyle = this.canvas.style;
                "transform" in canvasStyle ? (canvasStyle.transformOrigin = "0 0", canvasStyle.transform = "scale(" + xScale + "," + yScale + ")") : "webkitTransform" in canvasStyle ? (canvasStyle.webkitTransformOrigin = "0 0", 
                canvasStyle.webkitTransform = "scale(" + xScale + "," + yScale + ")") : (canvasStyle.width = Math.floor(defaultSize.width * xScale) + "px", 
                canvasStyle.height = Math.floor(defaultSize.height * yScale) + "px");
            }, CanvasSurface;
        }(g.Surface);
        exports.CanvasSurface = CanvasSurface;
    }, {
        "./Context2DRenderer": 14,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    14: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), RenderingHelper_1 = require("./RenderingHelper"), Context2DRenderer = function(_super) {
            function Context2DRenderer(surface) {
                var _this = _super.call(this) || this;
                return _this.surface = surface, _this.context = _this.surface.context(), _this;
            }
            return __extends(Context2DRenderer, _super), Context2DRenderer.prototype.clear = function() {
                this.context.clearRect(0, 0, this.surface.width, this.surface.height);
            }, Context2DRenderer.prototype.begin = function() {}, Context2DRenderer.prototype.end = function() {
                this.surface._drawable._texture = void 0;
            }, Context2DRenderer.prototype.drawImage = function(surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY) {
                this.context.drawImage(surface._drawable, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, width, height);
            }, Context2DRenderer.prototype.drawSprites = function(surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, count) {
                for (var i = 0; i < count; ++i) this.drawImage(surface, offsetX[i], offsetY[i], width[i], height[i], canvasOffsetX[i], canvasOffsetY[i]);
            }, Context2DRenderer.prototype.drawSystemText = function(text, x, y, maxWidth, fontSize, textAlign, textBaseline, textColor, fontFamily, strokeWidth, strokeColor, strokeOnly) {
                RenderingHelper_1.RenderingHelper.drawSystemTextByContext2D(this.context, text, x, y, maxWidth, fontSize, textAlign, textBaseline, textColor, fontFamily, strokeWidth, strokeColor, strokeOnly);
            }, Context2DRenderer.prototype.translate = function(x, y) {
                this.context.translate(x, y);
            }, Context2DRenderer.prototype.transform = function(matrix) {
                this.context.transform.apply(this.context, matrix);
            }, Context2DRenderer.prototype.opacity = function(opacity) {
                this.context.globalAlpha *= opacity;
            }, Context2DRenderer.prototype.save = function() {
                this.context.save();
            }, Context2DRenderer.prototype.restore = function() {
                this.context.restore();
            }, Context2DRenderer.prototype.fillRect = function(x, y, width, height, cssColor) {
                var _fillStyle = this.context.fillStyle;
                this.context.fillStyle = cssColor, this.context.fillRect(x, y, width, height), this.context.fillStyle = _fillStyle;
            }, Context2DRenderer.prototype.setCompositeOperation = function(operation) {
                this.context.globalCompositeOperation = RenderingHelper_1.RenderingHelper.toTextFromCompositeOperation(operation);
            }, Context2DRenderer;
        }(g.Renderer);
        exports.Context2DRenderer = Context2DRenderer;
    }, {
        "./RenderingHelper": 16,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    15: [ function(require, module, exports) {
        "use strict";
        function createGlyphRenderedSurface(code, fontSize, cssFontFamily, baselineHeight, marginW, marginH, needImageData, cacheImageData, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
            var scale = fontSize < GlyphFactory._environmentMinimumFontSize ? fontSize / GlyphFactory._environmentMinimumFontSize : 1, surfaceWidth = Math.ceil((fontSize + 2 * marginW) * scale), surfaceHeight = Math.ceil((fontSize + 2 * marginH) * scale), surface = new CanvasSurface_1.CanvasSurface(surfaceWidth, surfaceHeight), canvas = surface.canvas, context = canvas.getContext("2d"), str = 4294901760 & code ? String.fromCharCode((4294901760 & code) >>> 16, 65535 & code) : String.fromCharCode(code), fontWeightValue = fontWeight === g.FontWeight.Bold ? "bold " : "";
            context.save(), context.font = fontWeightValue + fontSize + "px " + cssFontFamily, 
            context.textAlign = "left", context.textBaseline = "alphabetic", context.lineJoin = "bevel", 
            1 !== scale && context.scale(scale, scale), strokeWidth > 0 && (context.lineWidth = strokeWidth, 
            context.strokeStyle = strokeColor, context.strokeText(str, marginW, marginH + baselineHeight)), 
            strokeOnly || (context.fillStyle = fontColor, context.fillText(str, marginW, marginH + baselineHeight));
            var advanceWidth = context.measureText(str).width;
            context.restore();
            var result = {
                surface: surface,
                advanceWidth: advanceWidth,
                imageData: needImageData ? context.getImageData(0, 0, canvas.width, canvas.height) : void 0
            };
            return cacheImageData && (surface._imageDataCache = result.imageData), result;
        }
        function calcGlyphArea(imageData) {
            for (var sx = imageData.width, sy = imageData.height, ex = 0, ey = 0, currentPos = 0, y = 0, height = imageData.height; y < height; y = y + 1 | 0) for (var x = 0, width = imageData.width; x < width; x = x + 1 | 0) {
                var a = imageData.data[currentPos + 3];
                0 !== a && (x < sx && (sx = x), x > ex && (ex = x), y < sy && (sy = y), y > ey && (ey = y)), 
                currentPos += 4;
            }
            var glyphArea = void 0;
            return glyphArea = sx === imageData.width ? {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            } : {
                x: sx,
                y: sy,
                width: ex - sx + 1,
                height: ey - sy + 1
            };
        }
        function isGlyphAreaEmpty(glyphArea) {
            return 0 === glyphArea.width || 0 === glyphArea.height;
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
        function quoteIfNotGeneric(name) {
            return genericFontFamilyNames.indexOf(name) !== -1 ? name : '"' + name + '"';
        }
        function fontFamily2CSSFontFamily(fontFamily) {
            return "number" == typeof fontFamily ? fontFamily2FontFamilyName(fontFamily) : "string" == typeof fontFamily ? quoteIfNotGeneric(fontFamily) : fontFamily.map(function(font) {
                return "string" == typeof font ? quoteIfNotGeneric(font) : fontFamily2FontFamilyName(font);
            }).join(",");
        }
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), CanvasSurface_1 = require("./CanvasSurface"), genericFontFamilyNames = [ "serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui" ], GlyphFactory = function(_super) {
            function GlyphFactory(fontFamily, fontSize, baselineHeight, cacheImageData, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
                var _this = _super.call(this, fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) || this;
                _this._cacheImageData = cacheImageData, _this._glyphAreas = {}, _this._cssFontFamily = fontFamily2CSSFontFamily(fontFamily);
                var fallbackFontFamilyName = fontFamily2FontFamilyName(g.FontFamily.SansSerif);
                return _this._cssFontFamily.indexOf(fallbackFontFamilyName) === -1 && (_this._cssFontFamily += "," + fallbackFontFamilyName), 
                _this._marginW = Math.ceil(.3 * _this.fontSize + _this.strokeWidth / 2), _this._marginH = Math.ceil(.3 * _this.fontSize + _this.strokeWidth / 2), 
                void 0 === GlyphFactory._environmentMinimumFontSize && (GlyphFactory._environmentMinimumFontSize = _this.measureMinimumFontSize()), 
                _this;
            }
            return __extends(GlyphFactory, _super), GlyphFactory.prototype.create = function(code) {
                var result, glyphArea = this._glyphAreas[code];
                return glyphArea || (result = createGlyphRenderedSurface(code, this.fontSize, this._cssFontFamily, this.baselineHeight, this._marginW, this._marginH, !0, this._cacheImageData, this.fontColor, this.strokeWidth, this.strokeColor, this.strokeOnly, this.fontWeight), 
                glyphArea = calcGlyphArea(result.imageData), glyphArea.advanceWidth = result.advanceWidth, 
                this._glyphAreas[code] = glyphArea), isGlyphAreaEmpty(glyphArea) ? (result && result.surface.destroy(), 
                new g.Glyph(code, 0, 0, 0, 0, 0, 0, glyphArea.advanceWidth, void 0, !0)) : (result || (result = createGlyphRenderedSurface(code, this.fontSize, this._cssFontFamily, this.baselineHeight, this._marginW, this._marginH, this._cacheImageData, this._cacheImageData, this.fontColor, this.strokeWidth, this.strokeColor, this.strokeOnly, this.fontWeight)), 
                new g.Glyph(code, glyphArea.x, glyphArea.y, glyphArea.width, glyphArea.height, glyphArea.x - this._marginW, glyphArea.y - this._marginH, glyphArea.advanceWidth, result.surface, !0));
            }, GlyphFactory.prototype.measureMinimumFontSize = function() {
                var fontSize = 1, str = "M", canvas = document.createElement("canvas"), context = canvas.getContext("2d");
                context.textAlign = "left", context.textBaseline = "alphabetic", context.lineJoin = "bevel";
                var preWidth;
                context.font = fontSize + "px sans-serif";
                var width = context.measureText(str).width;
                do preWidth = width, fontSize += 1, context.font = fontSize + "px sans-serif", width = context.measureText(str).width; while (preWidth === width || fontSize > 50);
                return fontSize;
            }, GlyphFactory;
        }(g.GlyphFactory);
        exports.GlyphFactory = GlyphFactory;
    }, {
        "./CanvasSurface": 13,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    16: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var RenderingHelper, g = require("@akashic/akashic-engine"), SurfaceFactory_1 = require("./shims/SurfaceFactory");
        !function(RenderingHelper) {
            function toPowerOfTwo(x) {
                if (0 !== (x & x - 1)) {
                    for (var y = 1; y < x; ) y *= 2;
                    return y;
                }
                return x;
            }
            function clamp(x) {
                return Math.min(Math.max(x, 0), 1);
            }
            function toTextFromCompositeOperation(operation) {
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

                  default:
                    operationText = "source-over";
                }
                return operationText;
            }
            function toCompositeOperationFromText(operationText) {
                var operation;
                switch (operationText) {
                  case "source-atop":
                    operation = g.CompositeOperation.SourceAtop;
                    break;

                  case "lighter":
                    operation = g.CompositeOperation.Lighter;
                    break;

                  case "copy":
                    operation = g.CompositeOperation.Copy;
                    break;

                  default:
                    operation = g.CompositeOperation.SourceOver;
                }
                return operation;
            }
            function drawSystemTextByContext2D(context, text, x, y, maxWidth, fontSize, textAlign, textBaseline, textColor, fontFamily, strokeWidth, strokeColor, strokeOnly) {
                var fontFamilyValue, textAlignValue, textBaselineValue;
                switch (context.save(), fontFamily) {
                  case g.FontFamily.Monospace:
                    fontFamilyValue = "monospace";
                    break;

                  case g.FontFamily.Serif:
                    fontFamilyValue = "serif";
                    break;

                  default:
                    fontFamilyValue = "sans-serif";
                }
                switch (context.font = fontSize + "px " + fontFamilyValue, textAlign) {
                  case g.TextAlign.Right:
                    textAlignValue = "right";
                    break;

                  case g.TextAlign.Center:
                    textAlignValue = "center";
                    break;

                  default:
                    textAlignValue = "left";
                }
                switch (context.textAlign = textAlignValue, textBaseline) {
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
                }
                context.textBaseline = textBaselineValue, context.lineJoin = "bevel", strokeWidth > 0 && (context.lineWidth = strokeWidth, 
                context.strokeStyle = strokeColor, "undefined" == typeof maxWidth ? context.strokeText(text, x, y) : context.strokeText(text, x, y, maxWidth)), 
                strokeOnly || (context.fillStyle = textColor, "undefined" == typeof maxWidth ? context.fillText(text, x, y) : context.fillText(text, x, y, maxWidth)), 
                context.restore();
            }
            function usedWebGL(rendererCandidates) {
                var used = !1;
                return rendererCandidates && 0 < rendererCandidates.length && (used = "webgl" === rendererCandidates[0]), 
                used;
            }
            function transformCoordinateSystem(matrix, height) {
                matrix[1] *= -1, matrix[3] *= -1, matrix[5] = -matrix[5] + height;
            }
            function createPrimarySurface(width, height, rendererCandidates) {
                return SurfaceFactory_1.SurfaceFactory.createPrimarySurface(width, height, rendererCandidates);
            }
            function createBackSurface(width, height, platform, rendererCandidates) {
                return SurfaceFactory_1.SurfaceFactory.createBackSurface(width, height, platform, rendererCandidates);
            }
            RenderingHelper.toPowerOfTwo = toPowerOfTwo, RenderingHelper.clamp = clamp, RenderingHelper.toTextFromCompositeOperation = toTextFromCompositeOperation, 
            RenderingHelper.toCompositeOperationFromText = toCompositeOperationFromText, RenderingHelper.drawSystemTextByContext2D = drawSystemTextByContext2D, 
            RenderingHelper.usedWebGL = usedWebGL, RenderingHelper.transformCoordinateSystem = transformCoordinateSystem, 
            RenderingHelper.createPrimarySurface = createPrimarySurface, RenderingHelper.createBackSurface = createBackSurface;
        }(RenderingHelper = exports.RenderingHelper || (exports.RenderingHelper = {}));
    }, {
        "./shims/SurfaceFactory": 30,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    17: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var AffineTransformer_1 = require("./AffineTransformer"), RenderingState = function() {
            function RenderingState(rhs) {
                rhs ? (this.globalAlpha = rhs.globalAlpha, this.globalCompositeOperation = rhs.globalCompositeOperation, 
                this.transformer = new AffineTransformer_1.AffineTransformer(rhs.transformer)) : (this.globalAlpha = 1, 
                this.globalCompositeOperation = "source-over", this.transformer = new AffineTransformer_1.AffineTransformer());
            }
            return RenderingState.prototype.copyFrom = function(rhs) {
                return this.globalAlpha = rhs.globalAlpha, this.globalCompositeOperation = rhs.globalCompositeOperation, 
                this.transformer.copyFrom(rhs.transformer), this;
            }, RenderingState.prototype.updateFrom = function(rhs) {
                return this.globalAlpha *= rhs.globalAlpha, this.globalCompositeOperation = rhs.globalCompositeOperation, 
                this.transformer.transform(Array.prototype.slice.call(rhs.transformer.matrix)), 
                this;
            }, RenderingState;
        }();
        exports.RenderingState = RenderingState;
    }, {
        "./AffineTransformer": 12
    } ],
    18: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), RenderingHelper_1 = require("./RenderingHelper"), RenderingState_1 = require("./RenderingState"), StateHoldingRenderer = function(_super) {
            function StateHoldingRenderer(capacity) {
                var _this = _super.call(this) || this;
                return _this._stateStack = [], _this._stateStackPointer = 0, _this._capacity = 0, 
                _this._reallocation(0 < capacity ? capacity : StateHoldingRenderer.DEFAULT_CAPACITY), 
                _this;
            }
            return __extends(StateHoldingRenderer, _super), StateHoldingRenderer.prototype.save = function() {
                this._pushState();
            }, StateHoldingRenderer.prototype.restore = function() {
                this._popState();
            }, StateHoldingRenderer.prototype.translate = function(x, y) {
                this.currentState().transformer.translate(x, y);
            }, StateHoldingRenderer.prototype.transform = function(matrix) {
                this.currentState().transformer.transform(matrix);
            }, StateHoldingRenderer.prototype.opacity = function(opacity) {
                this.currentState().globalAlpha *= opacity;
            }, StateHoldingRenderer.prototype.setCompositeOperation = function(operation) {
                this.currentState().globalCompositeOperation = RenderingHelper_1.RenderingHelper.toTextFromCompositeOperation(operation);
            }, StateHoldingRenderer.prototype.currentState = function() {
                return this._stateStack[this._stateStackPointer];
            }, StateHoldingRenderer.prototype.capacity = function() {
                return this._capacity;
            }, StateHoldingRenderer.prototype._pushState = function() {
                var old = this.currentState();
                ++this._stateStackPointer, this._isOverCapacity && this._reallocation(this._stateStackPointer + 1), 
                this.currentState().copyFrom(old);
            }, StateHoldingRenderer.prototype._popState = function() {
                if (!(this._stateStackPointer > 0)) throw g.ExceptionFactory.createAssertionError("StateHoldingRenderer#restore: state stack under-flow.");
                --this._stateStackPointer;
            }, StateHoldingRenderer.prototype._isOverCapacity = function() {
                return this._capacity <= this._stateStackPointer;
            }, StateHoldingRenderer.prototype._reallocation = function(newCapacity) {
                var oldCapacity = this._capacity;
                if (oldCapacity < newCapacity) {
                    newCapacity < 2 * oldCapacity ? this._capacity *= 2 : this._capacity = newCapacity;
                    for (var i = oldCapacity; i < this._capacity; ++i) this._stateStack.push(new RenderingState_1.RenderingState());
                }
            }, StateHoldingRenderer;
        }(g.Renderer);
        StateHoldingRenderer.DEFAULT_CAPACITY = 16, exports.StateHoldingRenderer = StateHoldingRenderer;
    }, {
        "./RenderingHelper": 16,
        "./RenderingState": 17,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    19: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), SurfaceAtlas = function(_super) {
            function SurfaceAtlas() {
                return null !== _super && _super.apply(this, arguments) || this;
            }
            return __extends(SurfaceAtlas, _super), SurfaceAtlas.prototype.addSurface = function(surface, rect) {
                var renderer = this._surface.renderer();
                if (surface._imageDataCache && renderer._subImage) {
                    var slot = this._acquireSurfaceAtlasSlot(rect.width, rect.height);
                    if (!slot) return null;
                    var webGLBackSurfaceRenderer = renderer, canvasSurface = surface;
                    return webGLBackSurfaceRenderer._subImage(canvasSurface._imageDataCache, rect.x, rect.y, rect.width, rect.height, slot.x, slot.y), 
                    slot;
                }
                return _super.prototype.addSurface.call(this, surface, rect);
            }, SurfaceAtlas;
        }(g.SurfaceAtlas);
        exports.SurfaceAtlas = SurfaceAtlas;
    }, {
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    20: [ function(require, module, exports) {
        "use strict";
        function getSystemTextOperations(surface) {
            return surface._systemTextOps;
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.getSystemTextOperations = getSystemTextOperations;
    }, {} ],
    21: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), WebGLBackSurfaceRenderer_1 = require("./WebGLBackSurfaceRenderer"), WebGLBackSurface = function(_super) {
            function WebGLBackSurface(width, height, webGLRenderer) {
                var _this = _super.call(this, width, height) || this;
                _this._systemTextOps = [], _this._webGLRenderer = webGLRenderer;
                var texWidth = Math.ceil(width), texHeight = Math.ceil(height), renderTarget = webGLRenderer.createTextureFrameBuffer(texWidth, texHeight);
                return _this._frameBuffer = renderTarget.frameBuffer, _this._drawable = {}, _this._drawable._texture = renderTarget.texture, 
                _this._drawable._textureOffsetX = 0, _this._drawable._textureOffsetY = 0, _this._drawable._textureWidth = texWidth, 
                _this._drawable._textureHeight = texHeight, _this;
            }
            return __extends(WebGLBackSurface, _super), WebGLBackSurface.prototype.renderer = function() {
                return this._renderer || (this._renderer = new WebGLBackSurfaceRenderer_1.WebGLBackSurfaceRenderer(this)), 
                this._renderer;
            }, WebGLBackSurface.prototype.destroy = function() {
                this._webGLRenderer.context.deleteFramebuffer(this._frameBuffer), this._frameBuffer = void 0, 
                this._webGLRenderer._disposeTexture(this._drawable._texture), this._webGLRenderer.context.deleteTexture(this._drawable._texture), 
                this._drawable._texture = void 0, _super.prototype.destroy.call(this);
            }, WebGLBackSurface;
        }(g.Surface);
        exports.WebGLBackSurface = WebGLBackSurface;
    }, {
        "./WebGLBackSurfaceRenderer": 22,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    22: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), RenderingHelper_1 = require("./RenderingHelper"), RenderingState_1 = require("./RenderingState"), SystemText_1 = require("./SystemText"), WebGLBackSurfaceRenderer = function(_super) {
            function WebGLBackSurfaceRenderer(surface) {
                var _this = _super.call(this) || this;
                return _this._surface = surface, _this._renderer = surface._webGLRenderer, _this;
            }
            return __extends(WebGLBackSurfaceRenderer, _super), WebGLBackSurfaceRenderer.prototype.translate = function(x, y) {
                this._renderer.translate(x, y);
            }, WebGLBackSurfaceRenderer.prototype.transform = function(matrix) {
                this._renderer.transform(matrix);
            }, WebGLBackSurfaceRenderer.prototype.opacity = function(opacity) {
                this._renderer.opacity(opacity);
            }, WebGLBackSurfaceRenderer.prototype.save = function() {
                this._renderer.save();
            }, WebGLBackSurfaceRenderer.prototype.restore = function() {
                this._renderer.restore();
            }, WebGLBackSurfaceRenderer.prototype.setCompositeOperation = function(operation) {
                this._renderer.setCompositeOperation(operation);
            }, WebGLBackSurfaceRenderer.prototype.setTransform = function(matrix) {
                this._renderer.setTransform(matrix);
            }, WebGLBackSurfaceRenderer.prototype.setOpacity = function(opacity) {
                this._renderer.setOpacity(opacity);
            }, WebGLBackSurfaceRenderer.prototype.clear = function() {
                this._renderer.clear(), this._surface._systemTextOps = [];
            }, WebGLBackSurfaceRenderer.prototype.begin = function() {
                _super.prototype.begin.call(this), this._renderer.begin(), this._renderer.pushRenderTarget(this._surface);
            }, WebGLBackSurfaceRenderer.prototype.end = function() {
                this._renderer.popRenderTarget(), this._renderer.end(), _super.prototype.end.call(this);
            }, WebGLBackSurfaceRenderer.prototype.drawSprites = function(surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, count) {
                this._renderer.drawSprites(surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, count);
            }, WebGLBackSurfaceRenderer.prototype.drawSystemText = function(text, x, y, maxWidth, fontSize, textAlign, textBaseline, textColor, fontFamily, strokeWidth, strokeColor, strokeOnly) {
                var op = {
                    state: new RenderingState_1.RenderingState(this._renderer.currentState()),
                    parameter: arguments
                };
                RenderingHelper_1.RenderingHelper.transformCoordinateSystem(op.state.transformer.matrix, this._surface.height), 
                this._surface._systemTextOps.push(op);
            }, WebGLBackSurfaceRenderer.prototype.drawImage = function(surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY) {
                this._renderer._drawImageExcludingSystemText(surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY);
                var srcOps = SystemText_1.getSystemTextOperations(surface);
                if (srcOps) for (var i = 0; i < srcOps.length; i = i + 1 | 0) {
                    var op = {
                        state: new RenderingState_1.RenderingState(this._renderer.currentState()).updateFrom(srcOps[i].state),
                        parameter: srcOps[i].parameter
                    };
                    RenderingHelper_1.RenderingHelper.transformCoordinateSystem(op.state.transformer.matrix, this._surface.height), 
                    this._surface._systemTextOps.push(op);
                }
            }, WebGLBackSurfaceRenderer.prototype.fillRect = function(x, y, width, height, cssColor) {
                this._renderer.fillRect(x, y, width, height, cssColor);
            }, WebGLBackSurfaceRenderer.prototype._subImage = function(imageData, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY) {
                for (var src = imageData.data, dst = new Uint8Array(width * height * 4), j = 0, d = 0; j < height; j++) for (var s = 4 * (imageData.width * (offsetY + j) + offsetX), i = 0, len = 4 * width; i < len; i++) dst[d++] = src[s++];
                var gl = this._renderer.context;
                gl.bindTexture(gl.TEXTURE_2D, this._surface._drawable._texture), gl.texSubImage2D(gl.TEXTURE_2D, 0, canvasOffsetX, canvasOffsetY, width, height, gl.RGBA, gl.UNSIGNED_BYTE, dst), 
                this._renderer.context.bindTexture(this._renderer.context.TEXTURE_2D, this._renderer._currentTexture);
            }, WebGLBackSurfaceRenderer;
        }(g.Renderer);
        exports.WebGLBackSurfaceRenderer = WebGLBackSurfaceRenderer;
    }, {
        "./RenderingHelper": 16,
        "./RenderingState": 17,
        "./SystemText": 20,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    23: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var WebGLColor, RenderingHelper_1 = require("./RenderingHelper");
        !function(WebGLColor) {
            function get(color) {
                var rgba = "string" == typeof color ? WebGLColor._toColor(color) : [ color[0], color[1], color[2], color[3] ];
                return rgba[3] = RenderingHelper_1.RenderingHelper.clamp(rgba[3]), rgba[0] = RenderingHelper_1.RenderingHelper.clamp(rgba[0]) * rgba[3], 
                rgba[1] = RenderingHelper_1.RenderingHelper.clamp(rgba[1]) * rgba[3], rgba[2] = RenderingHelper_1.RenderingHelper.clamp(rgba[2]) * rgba[3], 
                rgba;
            }
            function _hsl2rgb(hsl) {
                var h = hsl[0] % 360, s = hsl[1], l = hsl[2] > 50 ? 100 - hsl[2] : hsl[2], a = hsl[3], max = l + l * s, min = l - l * s;
                return h < 60 ? [ max, h / 60 * (max - min) + min, min, a ] : h < 120 ? [ (120 - h) / 60 * (max - min) + min, max, min, a ] : h < 180 ? [ min, max, (h - 120) / 60 * (max - min) + min, a ] : h < 240 ? [ min, (240 - h) / 60 * (max - min) + min, max, a ] : h < 300 ? [ (h - 240) / 60 * (max - min) + min, min, max, a ] : [ max, min, (360 - h) / 60 * (max - min) + min, a ];
            }
            function _toColor(cssColor) {
                var ncc = cssColor.toUpperCase().replace(/\s+/g, ""), rgba = WebGLColor.colorMap[ncc];
                if (rgba) return rgba;
                if (ncc.match(/^#([\dA-F])([\dA-F])([\dA-F])$/)) return [ parseInt(RegExp.$1, 16) / 15, parseInt(RegExp.$2, 16) / 15, parseInt(RegExp.$3, 16) / 15, 1 ];
                if (ncc.match(/^#([\dA-F]{2})([\dA-F]{2})([\dA-F]{2})$/)) return [ parseInt(RegExp.$1, 16) / 255, parseInt(RegExp.$2, 16) / 255, parseInt(RegExp.$3, 16) / 255, 1 ];
                if (ncc.match(/^RGB\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/)) return [ parseInt(RegExp.$1, 10) / 255, parseInt(RegExp.$2, 10) / 255, parseInt(RegExp.$3, 10) / 255, 1 ];
                if (ncc.match(/^RGBA\((\d{1,3}),(\d{1,3}),(\d{1,3}),(\d(\.\d*)?)\)$/)) return [ parseInt(RegExp.$1, 10) / 255, parseInt(RegExp.$2, 10) / 255, parseInt(RegExp.$3, 10) / 255, parseFloat(RegExp.$4) ];
                if (ncc.match(/^HSL\((\d{1,3}),(\d{1,3})%,(\d{1,3})%\)$/)) return WebGLColor._hsl2rgb([ parseInt(RegExp.$1, 10), RenderingHelper_1.RenderingHelper.clamp(parseInt(RegExp.$2, 10) / 100), RenderingHelper_1.RenderingHelper.clamp(parseInt(RegExp.$3, 10) / 100), 1 ]);
                if (ncc.match(/^HSLA\((\d{1,3}),(\d{1,3})%,(\d{1,3})%,(\d(\.\d*)?)\)$/)) return WebGLColor._hsl2rgb([ parseInt(RegExp.$1, 10), RenderingHelper_1.RenderingHelper.clamp(parseInt(RegExp.$2, 10) / 100), RenderingHelper_1.RenderingHelper.clamp(parseInt(RegExp.$3, 10) / 100), parseFloat(RegExp.$4) ]);
                throw Error("illigal cssColor format: " + ncc);
            }
            WebGLColor.colorMap = {
                ALICEBLUE: [ 240 / 255, 248 / 255, 1, 1 ],
                ANTIQUEWHITE: [ 250 / 255, 235 / 255, 215 / 255, 1 ],
                AQUA: [ 0, 1, 1, 1 ],
                AQUAMARINE: [ 127 / 255, 1, 212 / 255, 1 ],
                AZURE: [ 240 / 255, 1, 1, 1 ],
                BEIGE: [ 245 / 255, 245 / 255, 220 / 255, 1 ],
                BISQUE: [ 1, 228 / 255, 196 / 255, 1 ],
                BLACK: [ 0, 0, 0, 1 ],
                BLANCHEDALMOND: [ 1, 235 / 255, 205 / 255, 1 ],
                BLUE: [ 0, 0, 1, 1 ],
                BLUEVIOLET: [ 138 / 255, 43 / 255, 226 / 255, 1 ],
                BROWN: [ 165 / 255, 42 / 255, 42 / 255, 1 ],
                BURLYWOOD: [ 222 / 255, 184 / 255, 135 / 255, 1 ],
                CADETBLUE: [ 95 / 255, 158 / 255, 160 / 255, 1 ],
                CHARTREUSE: [ 127 / 255, 1, 0, 1 ],
                CHOCOLATE: [ 210 / 255, 105 / 255, 30 / 255, 1 ],
                CORAL: [ 1, 127 / 255, 80 / 255, 1 ],
                CORNFLOWERBLUE: [ 100 / 255, 149 / 255, 237 / 255, 1 ],
                CORNSILK: [ 1, 248 / 255, 220 / 255, 1 ],
                CRIMSON: [ 220 / 255, 20 / 255, 60 / 255, 1 ],
                CYAN: [ 0, 1, 1, 1 ],
                DARKBLUE: [ 0, 0, 139 / 255, 1 ],
                DARKCYAN: [ 0, 139 / 255, 139 / 255, 1 ],
                DARKGOLDENROD: [ 184 / 255, 134 / 255, 11 / 255, 1 ],
                DARKGRAY: [ 169 / 255, 169 / 255, 169 / 255, 1 ],
                DARKGREEN: [ 0, 100 / 255, 0, 1 ],
                DARKGREY: [ 169 / 255, 169 / 255, 169 / 255, 1 ],
                DARKKHAKI: [ 189 / 255, 183 / 255, 107 / 255, 1 ],
                DARKMAGENTA: [ 139 / 255, 0, 139 / 255, 1 ],
                DARKOLIVEGREEN: [ 85 / 255, 107 / 255, 47 / 255, 1 ],
                DARKORANGE: [ 1, 140 / 255, 0, 1 ],
                DARKORCHID: [ .6, 50 / 255, .8, 1 ],
                DARKRED: [ 139 / 255, 0, 0, 1 ],
                DARKSALMON: [ 233 / 255, 150 / 255, 122 / 255, 1 ],
                DARKSEAGREEN: [ 143 / 255, 188 / 255, 143 / 255, 1 ],
                DARKSLATEBLUE: [ 72 / 255, 61 / 255, 139 / 255, 1 ],
                DARKSLATEGRAY: [ 47 / 255, 79 / 255, 79 / 255, 1 ],
                DARKSLATEGREY: [ 47 / 255, 79 / 255, 79 / 255, 1 ],
                DARKTURQUOISE: [ 0, 206 / 255, 209 / 255, 1 ],
                DARKVIOLET: [ 148 / 255, 0, 211 / 255, 1 ],
                DEEPPINK: [ 1, 20 / 255, 147 / 255, 1 ],
                DEEPSKYBLUE: [ 0, 191 / 255, 1, 1 ],
                DIMGRAY: [ 105 / 255, 105 / 255, 105 / 255, 1 ],
                DIMGREY: [ 105 / 255, 105 / 255, 105 / 255, 1 ],
                DODGERBLUE: [ 30 / 255, 144 / 255, 1, 1 ],
                FIREBRICK: [ 178 / 255, 34 / 255, 34 / 255, 1 ],
                FLORALWHITE: [ 1, 250 / 255, 240 / 255, 1 ],
                FORESTGREEN: [ 34 / 255, 139 / 255, 34 / 255, 1 ],
                FUCHSIA: [ 1, 0, 1, 1 ],
                GAINSBORO: [ 220 / 255, 220 / 255, 220 / 255, 1 ],
                GHOSTWHITE: [ 248 / 255, 248 / 255, 1, 1 ],
                GOLD: [ 1, 215 / 255, 0, 1 ],
                GOLDENROD: [ 218 / 255, 165 / 255, 32 / 255, 1 ],
                GRAY: [ 128 / 255, 128 / 255, 128 / 255, 1 ],
                GREEN: [ 0, 128 / 255, 0, 1 ],
                GREENYELLOW: [ 173 / 255, 1, 47 / 255, 1 ],
                GREY: [ 128 / 255, 128 / 255, 128 / 255, 1 ],
                HONEYDEW: [ 240 / 255, 1, 240 / 255, 1 ],
                HOTPINK: [ 1, 105 / 255, 180 / 255, 1 ],
                INDIANRED: [ 205 / 255, 92 / 255, 92 / 255, 1 ],
                INDIGO: [ 75 / 255, 0, 130 / 255, 1 ],
                IVORY: [ 1, 1, 240 / 255, 1 ],
                KHAKI: [ 240 / 255, 230 / 255, 140 / 255, 1 ],
                LAVENDER: [ 230 / 255, 230 / 255, 250 / 255, 1 ],
                LAVENDERBLUSH: [ 1, 240 / 255, 245 / 255, 1 ],
                LAWNGREEN: [ 124 / 255, 252 / 255, 0, 1 ],
                LEMONCHIFFON: [ 1, 250 / 255, 205 / 255, 1 ],
                LIGHTBLUE: [ 173 / 255, 216 / 255, 230 / 255, 1 ],
                LIGHTCORAL: [ 240 / 255, 128 / 255, 128 / 255, 1 ],
                LIGHTCYAN: [ 224 / 255, 1, 1, 1 ],
                LIGHTGOLDENRODYELLOW: [ 250 / 255, 250 / 255, 210 / 255, 1 ],
                LIGHTGRAY: [ 211 / 255, 211 / 255, 211 / 255, 1 ],
                LIGHTGREEN: [ 144 / 255, 238 / 255, 144 / 255, 1 ],
                LIGHTGREY: [ 211 / 255, 211 / 255, 211 / 255, 1 ],
                LIGHTPINK: [ 1, 182 / 255, 193 / 255, 1 ],
                LIGHTSALMON: [ 1, 160 / 255, 122 / 255, 1 ],
                LIGHTSEAGREEN: [ 32 / 255, 178 / 255, 170 / 255, 1 ],
                LIGHTSKYBLUE: [ 135 / 255, 206 / 255, 250 / 255, 1 ],
                LIGHTSLATEGRAY: [ 119 / 255, 136 / 255, .6, 1 ],
                LIGHTSLATEGREY: [ 119 / 255, 136 / 255, .6, 1 ],
                LIGHTSTEELBLUE: [ 176 / 255, 196 / 255, 222 / 255, 1 ],
                LIGHTYELLOW: [ 1, 1, 224 / 255, 1 ],
                LIME: [ 0, 1, 0, 1 ],
                LIMEGREEN: [ 50 / 255, 205 / 255, 50 / 255, 1 ],
                LINEN: [ 250 / 255, 240 / 255, 230 / 255, 1 ],
                MAGENTA: [ 1, 0, 1, 1 ],
                MAROON: [ 128 / 255, 0, 0, 1 ],
                MEDIUMAQUAMARINE: [ .4, 205 / 255, 170 / 255, 1 ],
                MEDIUMBLUE: [ 0, 0, 205 / 255, 1 ],
                MEDIUMORCHID: [ 186 / 255, 85 / 255, 211 / 255, 1 ],
                MEDIUMPURPLE: [ 147 / 255, 112 / 255, 219 / 255, 1 ],
                MEDIUMSEAGREEN: [ 60 / 255, 179 / 255, 113 / 255, 1 ],
                MEDIUMSLATEBLUE: [ 123 / 255, 104 / 255, 238 / 255, 1 ],
                MEDIUMSPRINGGREEN: [ 0, 250 / 255, 154 / 255, 1 ],
                MEDIUMTURQUOISE: [ 72 / 255, 209 / 255, .8, 1 ],
                MEDIUMVIOLETRED: [ 199 / 255, 21 / 255, 133 / 255, 1 ],
                MIDNIGHTBLUE: [ 25 / 255, 25 / 255, 112 / 255, 1 ],
                MINTCREAM: [ 245 / 255, 1, 250 / 255, 1 ],
                MISTYROSE: [ 1, 228 / 255, 225 / 255, 1 ],
                MOCCASIN: [ 1, 228 / 255, 181 / 255, 1 ],
                NAVAJOWHITE: [ 1, 222 / 255, 173 / 255, 1 ],
                NAVY: [ 0, 0, 128 / 255, 1 ],
                OLDLACE: [ 253 / 255, 245 / 255, 230 / 255, 1 ],
                OLIVE: [ 128 / 255, 128 / 255, 0, 1 ],
                OLIVEDRAB: [ 107 / 255, 142 / 255, 35 / 255, 1 ],
                ORANGE: [ 1, 165 / 255, 0, 1 ],
                ORANGERED: [ 1, 69 / 255, 0, 1 ],
                ORCHID: [ 218 / 255, 112 / 255, 214 / 255, 1 ],
                PALEGOLDENROD: [ 238 / 255, 232 / 255, 170 / 255, 1 ],
                PALEGREEN: [ 152 / 255, 251 / 255, 152 / 255, 1 ],
                PALETURQUOISE: [ 175 / 255, 238 / 255, 238 / 255, 1 ],
                PALEVIOLETRED: [ 219 / 255, 112 / 255, 147 / 255, 1 ],
                PAPAYAWHIP: [ 1, 239 / 255, 213 / 255, 1 ],
                PEACHPUFF: [ 1, 218 / 255, 185 / 255, 1 ],
                PERU: [ 205 / 255, 133 / 255, 63 / 255, 1 ],
                PINK: [ 1, 192 / 255, 203 / 255, 1 ],
                PLUM: [ 221 / 255, 160 / 255, 221 / 255, 1 ],
                POWDERBLUE: [ 176 / 255, 224 / 255, 230 / 255, 1 ],
                PURPLE: [ 128 / 255, 0, 128 / 255, 1 ],
                RED: [ 1, 0, 0, 1 ],
                ROSYBROWN: [ 188 / 255, 143 / 255, 143 / 255, 1 ],
                ROYALBLUE: [ 65 / 255, 105 / 255, 225 / 255, 1 ],
                SADDLEBROWN: [ 139 / 255, 69 / 255, 19 / 255, 1 ],
                SALMON: [ 250 / 255, 128 / 255, 114 / 255, 1 ],
                SANDYBROWN: [ 244 / 255, 164 / 255, 96 / 255, 1 ],
                SEAGREEN: [ 46 / 255, 139 / 255, 87 / 255, 1 ],
                SEASHELL: [ 1, 245 / 255, 238 / 255, 1 ],
                SIENNA: [ 160 / 255, 82 / 255, 45 / 255, 1 ],
                SILVER: [ 192 / 255, 192 / 255, 192 / 255, 1 ],
                SKYBLUE: [ 135 / 255, 206 / 255, 235 / 255, 1 ],
                SLATEBLUE: [ 106 / 255, 90 / 255, 205 / 255, 1 ],
                SLATEGRAY: [ 112 / 255, 128 / 255, 144 / 255, 1 ],
                SLATEGREY: [ 112 / 255, 128 / 255, 144 / 255, 1 ],
                SNOW: [ 1, 250 / 255, 250 / 255, 1 ],
                SPRINGGREEN: [ 0, 1, 127 / 255, 1 ],
                STEELBLUE: [ 70 / 255, 130 / 255, 180 / 255, 1 ],
                TAN: [ 210 / 255, 180 / 255, 140 / 255, 1 ],
                TEAL: [ 0, 128 / 255, 128 / 255, 1 ],
                THISTLE: [ 216 / 255, 191 / 255, 216 / 255, 1 ],
                TOMATO: [ 1, 99 / 255, 71 / 255, 1 ],
                TURQUOISE: [ 64 / 255, 224 / 255, 208 / 255, 1 ],
                VIOLET: [ 238 / 255, 130 / 255, 238 / 255, 1 ],
                WHEAT: [ 245 / 255, 222 / 255, 179 / 255, 1 ],
                WHITE: [ 1, 1, 1, 1 ],
                WHITESMOKE: [ 245 / 255, 245 / 255, 245 / 255, 1 ],
                YELLOW: [ 1, 1, 0, 1 ],
                YELLOWGREEN: [ 154 / 255, 205 / 255, 50 / 255, 1 ]
            }, WebGLColor.get = get, WebGLColor._hsl2rgb = _hsl2rgb, WebGLColor._toColor = _toColor;
        }(WebGLColor = exports.WebGLColor || (exports.WebGLColor = {}));
    }, {
        "./RenderingHelper": 16
    } ],
    24: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var CanvasSurface_1 = require("./CanvasSurface"), WebGLPrimarySurfaceRenderer_1 = require("./WebGLPrimarySurfaceRenderer"), WebGLPrimarySurface = function(_super) {
            function WebGLPrimarySurface(width, height, zIndexes) {
                var _this = _super.call(this, width, height, [ "webgl" ]) || this;
                return _this._upperSurface = new CanvasSurface_1.CanvasSurface(width, height), _this.setCanvasStyle(zIndexes), 
                _this;
            }
            return __extends(WebGLPrimarySurface, _super), WebGLPrimarySurface.prototype.renderer = function() {
                return this._renderer || (this._renderer = new WebGLPrimarySurfaceRenderer_1.WebGLPrimarySurfaceRenderer(this)), 
                this._renderer;
            }, WebGLPrimarySurface.prototype.setParentElement = function(parent) {
                _super.prototype.setParentElement.call(this, parent), parent.appendChild(this._upperSurface.canvas);
            }, WebGLPrimarySurface.prototype.changeCanvasSize = function(width, height) {
                var xScale = width / this.width, yScale = height / this.height, defaultSize = {
                    width: this.width,
                    height: this.height
                };
                _super.prototype.changeCanvasScale.call(this, xScale, yScale, defaultSize), this._upperSurface.changeCanvasScale(xScale, yScale, defaultSize);
            }, WebGLPrimarySurface.prototype.setCanvasStyle = function(zIndexes) {
                this._upperSurface.canvas.style.position = "absolute", this.canvas.style.position = "absolute", 
                zIndexes ? (this.canvas.style.zIndex = zIndexes.base || "0", this._upperSurface.canvas.style.zIndex = zIndexes.upper || "1") : (this.canvas.style.zIndex = "0", 
                this._upperSurface.canvas.style.zIndex = "1");
            }, WebGLPrimarySurface;
        }(CanvasSurface_1.CanvasSurface);
        exports.WebGLPrimarySurface = WebGLPrimarySurface;
    }, {
        "./CanvasSurface": 13,
        "./WebGLPrimarySurfaceRenderer": 25
    } ],
    25: [ function(require, module, exports) {
        "use strict";
        function applyRenderingState(renderer, state) {
            renderer.transform(Array.prototype.slice.call(state.transformer.matrix)), renderer.opacity(state.globalAlpha), 
            renderer.setCompositeOperation(RenderingHelper_1.RenderingHelper.toCompositeOperationFromText(state.globalCompositeOperation));
        }
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var WebGLRenderer_1 = require("./WebGLRenderer"), RenderingHelper_1 = require("./RenderingHelper"), SystemText_1 = require("./SystemText"), WebGLPrimarySurfaceRenderer = function(_super) {
            function WebGLPrimarySurfaceRenderer(surface) {
                var _this = _super.call(this, surface) || this;
                return _this._upperRenderer = surface._upperSurface.renderer(), _this;
            }
            return __extends(WebGLPrimarySurfaceRenderer, _super), WebGLPrimarySurfaceRenderer.prototype.clear = function() {
                _super.prototype.clear.call(this), this._upperRenderer.clear();
            }, WebGLPrimarySurfaceRenderer.prototype._drawImageExcludingSystemText = function(surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY) {
                _super.prototype.drawImage.call(this, surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY);
            }, WebGLPrimarySurfaceRenderer.prototype.drawImage = function(surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY) {
                _super.prototype.drawImage.call(this, surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY);
                var srcOps = SystemText_1.getSystemTextOperations(surface);
                if (srcOps) for (var i = 0; i < srcOps.length; i = i + 1 | 0) {
                    this._upperRenderer.save(), applyRenderingState(this._upperRenderer, this.currentState()), 
                    applyRenderingState(this._upperRenderer, srcOps[i].state);
                    var parameter = srcOps[i].parameter;
                    this._upperRenderer.drawSystemText.apply(this._upperRenderer, parameter), this._upperRenderer.restore();
                }
            }, WebGLPrimarySurfaceRenderer.prototype.drawSystemText = function(text, x, y, maxWidth, fontSize, textAlign, textBaseline, textColor, fontFamily, strokeWidth, strokeColor, strokeOnly) {
                this._upperRenderer.save(), applyRenderingState(this._upperRenderer, this.currentState()), 
                this._upperRenderer.drawSystemText(text, x, y, maxWidth, fontSize, textAlign, textBaseline, textColor, fontFamily, strokeWidth, strokeColor, strokeOnly), 
                this._upperRenderer.restore();
            }, WebGLPrimarySurfaceRenderer;
        }(WebGLRenderer_1.WebGLRenderer);
        exports.WebGLPrimarySurfaceRenderer = WebGLPrimarySurfaceRenderer;
    }, {
        "./RenderingHelper": 16,
        "./SystemText": 20,
        "./WebGLRenderer": 26
    } ],
    26: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), StateHoldingRenderer_1 = require("./StateHoldingRenderer"), RenderingHelper_1 = require("./RenderingHelper"), WebGLColor_1 = require("./WebGLColor"), WebGLShaderProgram_1 = require("./WebGLShaderProgram"), WebGLTextureAtlas_1 = require("./WebGLTextureAtlas"), RenderingState_1 = require("./RenderingState"), RenderTargetStack = function(_super) {
            function RenderTargetStack(width, height) {
                var _this = _super.call(this) || this;
                return _this.push({
                    width: width,
                    height: height,
                    _frameBuffer: null
                }), _this;
            }
            return __extends(RenderTargetStack, _super), RenderTargetStack.prototype.top = function() {
                return this[this.length - 1];
            }, RenderTargetStack;
        }(Array), WebGLRenderer = function(_super) {
            function WebGLRenderer(surface) {
                var _this = _super.call(this) || this;
                if (_this.surface = surface, _this.context = surface.canvas.getContext("webgl", {
                    depth: !1,
                    preserveDrawingBuffer: !0
                }), !_this.context) throw g.ExceptionFactory.createAssertionError("WebGLRenderer#constructor: could not initialize WebGLRenderingContext");
                return _this._init(), _this;
            }
            return __extends(WebGLRenderer, _super), WebGLRenderer.prototype.pushRenderTarget = function(surface) {
                this._commit(), this._renderTargetStack.push(surface), this.save();
                var rs = new RenderingState_1.RenderingState();
                RenderingHelper_1.RenderingHelper.transformCoordinateSystem(rs.transformer.matrix, surface.height), 
                this.currentState().copyFrom(rs), this.context.viewport(0, 0, surface.width, surface.height), 
                this._width = surface.width, this._height = surface.height, this.context.bindFramebuffer(this.context.FRAMEBUFFER, surface._frameBuffer);
            }, WebGLRenderer.prototype.popRenderTarget = function() {
                this._commit(), this._renderTargetStack.pop();
                var renderTarget = this._renderTargetStack.top();
                this.context.bindFramebuffer(this.context.FRAMEBUFFER, renderTarget._frameBuffer), 
                this._width = renderTarget.width, this._height = renderTarget.height, this.context.viewport(0, 0, this._width, this._height), 
                this.restore();
            }, WebGLRenderer.prototype.clear = function() {
                this.context.clear(this.context.COLOR_BUFFER_BIT);
            }, WebGLRenderer.prototype.begin = function() {
                ++this._beginCount, 1 === this._beginCount && (this._commitCount = 0, this.clear(), 
                this._program.use(), this._enableLighting ? (this._program.set_uLightType(this._lightTypes), 
                this._program.set_uLightColor(this._lightColors)) : (this._program.set_uLightType(this._lightTypesDisabled), 
                this._program.set_uLightColor(this._lightColorsDisabled)), this._program.set_uLightDirection(this._lightDirections), 
                this._program.set_uLightPosition(this._lightPositions), this._program.set_uLightDistanceAttenuation(this._lightDistanceAttenuation), 
                this._program.set_uLightAngleAttenuation(this._lightAngleAttenuation), this._inRendering = !0);
            }, WebGLRenderer.prototype.end = function() {
                --this._beginCount, 0 === this._beginCount && (this._inRendering = !1, this._commit(), 
                this._program.unuse());
            }, WebGLRenderer.prototype.setLighting = function(enable) {
                this._enableLighting = enable, this._inRendering && (this._commit(), enable ? (this._program.set_uLightType(this._lightTypes), 
                this._program.set_uLightColor(this._lightColors)) : (this._program.set_uLightType(this._lightTypesDisabled), 
                this._program.set_uLightColor(this._lightColorsDisabled)));
            }, WebGLRenderer.prototype.setNullLight = function(lightId) {
                lightId < 0 || lightId >= this._program.maxLightCount || (this._lightTypes[lightId] = 0);
            }, WebGLRenderer.prototype.setAmbientLight = function(lightId, lightColor) {
                lightId < 0 || lightId >= this._program.maxLightCount || (this._lightTypes[lightId] = 1, 
                this._setLightColor(lightId, lightColor));
            }, WebGLRenderer.prototype.setDirectionalLight = function(lightId, lightColor, lightDirection) {
                lightId < 0 || lightId >= this._program.maxLightCount || (this._lightTypes[lightId] = 2, 
                this._setLightColor(lightId, lightColor), this._setLightDirection(lightId, lightDirection));
            }, WebGLRenderer.prototype.setPointLight = function(lightId, lightColor, lightPosition, att0, att1, att2) {
                lightId < 0 || lightId >= this._program.maxLightCount || (this._lightTypes[lightId] = 3, 
                this._setLightColor(lightId, lightColor), this._setLightPosition(lightId, lightPosition), 
                this._setLightDistanceAttenuation(lightId, att0, att1, att2));
            }, WebGLRenderer.prototype.setSpotLight = function(lightId, lightColor, lightPosition, lightDirection, att0, att1, att2, theta, phi, falloff) {
                lightId < 0 || lightId >= this._program.maxLightCount || (this._lightTypes[lightId] = 4, 
                this._setLightColor(lightId, lightColor), this._setLightPosition(lightId, lightPosition), 
                this._setLightDirection(lightId, lightDirection), this._setLightDistanceAttenuation(lightId, att0, att1, att2), 
                this._setLightAngleAttenuation(lightId, theta, phi, falloff));
            }, WebGLRenderer.prototype.drawSprites = function(surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, count) {
                for (var i = 0; i < count; ++i) this.drawImage(surface, offsetX[i], offsetY[i], width[i], height[i], canvasOffsetX[i], canvasOffsetY[i]);
            }, WebGLRenderer.prototype.drawImage = function(surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY) {
                if (!surface._drawable) throw g.ExceptionFactory.createAssertionError("WebGLRenderer#drawImage: no drawable surface.");
                if (surface._drawable._texture instanceof WebGLTexture || this._textureAtlas._makeTextureForSurface(this, surface), 
                !surface._drawable._texture) throw g.ExceptionFactory.createAssertionError("WebGLRenderer#drawImage: could not create a texture.");
                var image = surface._drawable, tw = 1 / image._textureWidth, th = 1 / image._textureHeight, ox = image._textureOffsetX, oy = image._textureOffsetY, s = tw * (ox + offsetX + width), t = th * (oy + offsetY + height), u = tw * (ox + offsetX), v = th * (oy + offsetY);
                this._drawImage(image._texture, canvasOffsetX, canvasOffsetY, width, height, [ u, v, s, v, s, t, u, v, s, t, u, t ], this._drawImageColor);
            }, WebGLRenderer.prototype.fillRect = function(x, y, width, height, cssColor) {
                this._drawImage(this._fillRectTexture, x, y, width, height, [ 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1 ], WebGLColor_1.WebGLColor.get(cssColor));
            }, WebGLRenderer.prototype.createTextureFrameBuffer = function(width, height) {
                var context = this.context, frameBuffer = context.createFramebuffer();
                context.bindFramebuffer(context.FRAMEBUFFER, frameBuffer);
                var texture = context.createTexture();
                context.bindTexture(context.TEXTURE_2D, texture), context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR), 
                context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR), 
                context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE), 
                context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE), 
                context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, width, height, 0, context.RGBA, context.UNSIGNED_BYTE, null), 
                context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, texture, 0), 
                context.bindTexture(context.TEXTURE_2D, this._currentTexture);
                var renderTarget = this._renderTargetStack.top();
                return context.bindFramebuffer(context.FRAMEBUFFER, renderTarget._frameBuffer), 
                {
                    frameBuffer: frameBuffer,
                    texture: texture
                };
            }, WebGLRenderer.prototype._makeTextureForSurface = function(surface) {
                var image = surface._drawable, w = RenderingHelper_1.RenderingHelper.toPowerOfTwo(image.width), h = RenderingHelper_1.RenderingHelper.toPowerOfTwo(image.height);
                if (w !== image.width || h !== image.height) {
                    var canvas = document.createElement("canvas");
                    canvas.width = w, canvas.height = h;
                    var context = canvas.getContext("2d");
                    context.globalCompositeOperation = "copy", context.drawImage(image, 0, 0), image = context.getImageData(0, 0, w, h);
                }
                surface._drawable._texture = this._makeTexture(image), surface._drawable._textureOffsetX = 0, 
                surface._drawable._textureOffsetY = 0, surface._drawable._textureWidth = w, surface._drawable._textureHeight = h;
            }, WebGLRenderer.prototype._makeTextureRaw = function(width, height, pixels) {
                void 0 === pixels && (pixels = null);
                var texture = this.context.createTexture();
                return this.context.bindTexture(this.context.TEXTURE_2D, texture), this.context.pixelStorei(this.context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1), 
                this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE), 
                this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE), 
                this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST), 
                this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST), 
                this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, width, height, 0, this.context.RGBA, this.context.UNSIGNED_BYTE, pixels), 
                this.context.bindTexture(this.context.TEXTURE_2D, this._currentTexture), texture;
            }, WebGLRenderer.prototype._disposeTexture = function(texture) {
                this._currentTexture === texture && this._commit();
            }, WebGLRenderer.prototype._assignTexture = function(image, x, y, texture) {
                if (this.context.bindTexture(this.context.TEXTURE_2D, texture), image instanceof HTMLVideoElement) throw g.ExceptionFactory.createAssertionError("WebGLRenderer#_assignTexture: HTMLVideoElement is not supported.");
                this.context.texSubImage2D(this.context.TEXTURE_2D, 0, x, y, this.context.RGBA, this.context.UNSIGNED_BYTE, image), 
                this.context.bindTexture(this.context.TEXTURE_2D, this._currentTexture);
            }, WebGLRenderer.prototype._clearTexture = function(texturePixels, width, height, texture) {
                this.context.bindTexture(this.context.TEXTURE_2D, texture), this.context.texSubImage2D(this.context.TEXTURE_2D, 0, 0, 0, width, height, this.context.RGBA, this.context.UNSIGNED_BYTE, texturePixels), 
                this.context.bindTexture(this.context.TEXTURE_2D, this._currentTexture);
            }, WebGLRenderer.prototype._init = function() {
                this._width = this.surface.width, this._height = this.surface.height, this._renderTargetStack = new RenderTargetStack(this._width, this._height), 
                this._beginCount = 0, this._program = new WebGLShaderProgram_1.WebGLShaderProgram(this.context), 
                this._textureAtlas = new WebGLTextureAtlas_1.WebGLTextureAtlas(), this._fillRectTexture = this._makeTextureRaw(1, 1, new Uint8Array([ 255, 255, 255, 255 ])), 
                this._drawImageColor = WebGLColor_1.WebGLColor.get("white"), this._maxSpriteCount = 1024, 
                this._vertices = this._makeBuffer(24 * this._maxSpriteCount * 4), this._verticesCache = new Float32Array(24 * this._maxSpriteCount), 
                this._numSprites = 0, this._inRendering = !1, this._enableLighting = !1, this._lightTypesDisabled = new Int32Array([ 1, 0, 0, 0 ]), 
                this._lightColorsDisabled = new Float32Array([ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]), 
                this._lightTypes = new Int32Array([ 1, 0, 0, 0 ]), this._lightColors = new Float32Array([ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]), 
                this._lightDirections = new Float32Array([ 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1 ]), 
                this._lightPositions = new Float32Array([ 0, 0, 100, 0, 0, 100, 0, 0, 100, 0, 0, 100 ]), 
                this._lightDistanceAttenuation = new Float32Array([ .1, .005, 25e-6, .1, .005, 25e-6, .1, .005, 25e-6, .1, .005, 25e-6 ]), 
                this._lightAngleAttenuation = new Float32Array([ Math.cos(Math.PI / 4), Math.cos(Math.PI / 2), Math.cos(Math.PI / 4) - Math.cos(Math.PI / 2), 2, Math.cos(Math.PI / 4), Math.cos(Math.PI / 2), Math.cos(Math.PI / 4) - Math.cos(Math.PI / 2), 2, Math.cos(Math.PI / 4), Math.cos(Math.PI / 2), Math.cos(Math.PI / 4) - Math.cos(Math.PI / 2), 2, Math.cos(Math.PI / 4), Math.cos(Math.PI / 2), Math.cos(Math.PI / 4) - Math.cos(Math.PI / 2), 2 ]);
                var state = this.currentState();
                this._currentTexture = this._fillRectTexture, this._currentColor = this._drawImageColor, 
                this._currentAlpha = 1, this._currentCompositeOperation = state.globalCompositeOperation, 
                this._program.use();
                try {
                    this._program.set_aVertex(this._vertices), this._program.set_uColor(this._currentColor), 
                    this._program.set_uAlpha(this._currentAlpha), this._program.set_uSampler(0), this._program.set_uLightType(this._lightTypesDisabled), 
                    this._program.set_uLightColor(this._lightColorsDisabled);
                } finally {
                    this._program.unuse();
                }
                this.context.viewport(0, 0, this.surface.width, this.surface.height), this.context.enable(this.context.BLEND), 
                this.context.activeTexture(this.context.TEXTURE0), this.context.bindTexture(this.context.TEXTURE_2D, this._fillRectTexture), 
                this._compositeOps = {
                    "source-atop": [ this.context.DST_ALPHA, this.context.ONE_MINUS_SRC_ALPHA ],
                    "source-in": [ this.context.DST_ALPHA, this.context.ZERO ],
                    "source-out": [ this.context.ONE_MINUS_DST_ALPHA, this.context.ZERO ],
                    "source-over": [ this.context.ONE, this.context.ONE_MINUS_SRC_ALPHA ],
                    "destination-atop": [ this.context.ONE_MINUS_DST_ALPHA, this.context.SRC_ALPHA ],
                    "destination-in": [ this.context.ZERO, this.context.SRC_ALPHA ],
                    "destination-out": [ this.context.ZERO, this.context.ONE_MINUS_SRC_ALPHA ],
                    "destination-over": [ this.context.ONE_MINUS_DST_ALPHA, this.context.ONE ],
                    lighter: [ this.context.ONE, this.context.ONE ],
                    copy: [ this.context.ONE, this.context.ZERO ],
                    xor: [ this.context.ONE_MINUS_DST_ALPHA, this.context.ONE_MINUS_SRC_ALPHA ]
                };
                var compositeOperation = this._compositeOps[this._currentCompositeOperation];
                this.context.blendFunc(compositeOperation[0], compositeOperation[1]);
            }, WebGLRenderer.prototype._setLightColor = function(lightId, lightColor) {
                this._lightColors[3 * lightId + 0] = lightColor[0], this._lightColors[3 * lightId + 1] = lightColor[1], 
                this._lightColors[3 * lightId + 2] = lightColor[2];
            }, WebGLRenderer.prototype._setLightDirection = function(lightId, lightDirection) {
                this._lightDirections[3 * lightId + 0] = lightDirection[0], this._lightDirections[3 * lightId + 1] = -lightDirection[1], 
                this._lightDirections[3 * lightId + 2] = lightDirection[2];
            }, WebGLRenderer.prototype._setLightPosition = function(lightId, lightPosition) {
                this._lightPositions[3 * lightId + 0] = lightPosition[0], this._lightPositions[3 * lightId + 1] = this._height - lightPosition[1], 
                this._lightPositions[3 * lightId + 2] = lightPosition[2];
            }, WebGLRenderer.prototype._setLightDistanceAttenuation = function(lightId, att0, att1, att2) {
                this._lightDistanceAttenuation[3 * lightId + 0] = att0, this._lightDistanceAttenuation[3 * lightId + 1] = att1, 
                this._lightDistanceAttenuation[3 * lightId + 2] = att2;
            }, WebGLRenderer.prototype._setLightAngleAttenuation = function(lightId, theta, phi, falloff) {
                var cosTheta = Math.cos(.5 * theta), cosPhi = Math.cos(.5 * phi);
                this._lightAngleAttenuation[4 * lightId + 0] = cosTheta, this._lightAngleAttenuation[4 * lightId + 1] = cosPhi, 
                this._lightAngleAttenuation[4 * lightId + 2] = cosTheta - cosPhi, this._lightAngleAttenuation[4 * lightId + 3] = falloff;
            }, WebGLRenderer.prototype._drawImage = function(texture, x, y, w, h, texCoord, color) {
                this._numSprites >= this._maxSpriteCount && this._commit(), this._currentTexture !== texture && (this._currentTexture = texture, 
                this._commit(), this.context.bindTexture(this.context.TEXTURE_2D, texture)), this._currentColor[0] === color[0] && this._currentColor[1] === color[1] && this._currentColor[2] === color[2] && this._currentColor[3] === color[3] || (this._currentColor = color, 
                this._commit(), this._program.set_uColor(color));
                var state = this.currentState();
                if (this._currentAlpha !== state.globalAlpha && (this._currentAlpha = state.globalAlpha, 
                this._commit(), this._program.set_uAlpha(state.globalAlpha)), this._currentCompositeOperation !== state.globalCompositeOperation) {
                    this._currentCompositeOperation = state.globalCompositeOperation, this._commit();
                    var compositeOperation = this._compositeOps[this._currentCompositeOperation];
                    this.context.blendFunc(compositeOperation[0], compositeOperation[1]);
                }
                this._register(this._transformVertex(x, y, w, h, state.transformer), texCoord);
            }, WebGLRenderer.prototype._transformVertex = function(x, y, w, h, transformer) {
                var cw = 2 / this._width, ch = -2 / this._height, m = transformer.matrix, a = cw * w * m[0], b = ch * w * m[1], c = cw * h * m[2], d = ch * h * m[3], e = cw * (x * m[0] + y * m[2] + m[4]) - 1, f = ch * (x * m[1] + y * m[3] + m[5]) + 1;
                return [ e, f, a + e, b + f, a + c + e, b + d + f, e, f, a + c + e, b + d + f, c + e, d + f ];
            }, WebGLRenderer.prototype._register = function(vertex, texCoord) {
                var offset = 6 * this._numSprites;
                ++this._numSprites;
                for (var i = 0; i < 6; ++i) this._verticesCache[4 * (i + offset) + 0] = vertex[2 * i + 0], 
                this._verticesCache[4 * (i + offset) + 1] = vertex[2 * i + 1], this._verticesCache[4 * (i + offset) + 2] = texCoord[2 * i + 0], 
                this._verticesCache[4 * (i + offset) + 3] = texCoord[2 * i + 1];
            }, WebGLRenderer.prototype._commit = function() {
                this._numSprites > 0 && (this.context.bindBuffer(this.context.ARRAY_BUFFER, this._vertices), 
                this.context.bufferSubData(this.context.ARRAY_BUFFER, 0, this._verticesCache.subarray(0, 24 * this._numSprites)), 
                this.context.drawArrays(this.context.TRIANGLES, 0, 6 * this._numSprites), this._numSprites = 0, 
                ++this._commitCount);
            }, WebGLRenderer.prototype._makeTexture = function(data) {
                var texture = this.context.createTexture();
                return this.context.bindTexture(this.context.TEXTURE_2D, texture), this.context.pixelStorei(this.context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1), 
                this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE), 
                this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE), 
                this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST), 
                this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST), 
                data instanceof HTMLImageElement ? this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, data) : data instanceof HTMLCanvasElement ? this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, data) : data instanceof ImageData && this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, data), 
                this.context.bindTexture(this.context.TEXTURE_2D, this._currentTexture), texture;
            }, WebGLRenderer.prototype._makeBuffer = function(data) {
                var buffer = this.context.createBuffer();
                return this.context.bindBuffer(this.context.ARRAY_BUFFER, buffer), this.context.bufferData(this.context.ARRAY_BUFFER, data, this.context.DYNAMIC_DRAW), 
                buffer;
            }, WebGLRenderer;
        }(StateHoldingRenderer_1.StateHoldingRenderer);
        exports.WebGLRenderer = WebGLRenderer;
    }, {
        "./RenderingHelper": 16,
        "./RenderingState": 17,
        "./StateHoldingRenderer": 18,
        "./WebGLColor": 23,
        "./WebGLShaderProgram": 27,
        "./WebGLTextureAtlas": 28,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    27: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var WebGLShaderProgram = function() {
            function WebGLShaderProgram(context) {
                this.maxLightCount = 4;
                var vSrc = "#version 100\nattribute vec4 aVertex;\nvarying vec2 vTexCoord;\nvarying vec4 vColor;\nuniform vec4 uColor;\nuniform float uAlpha;\nvoid main() {gl_Position = vec4(aVertex.xy, 0.0, 1.0);vTexCoord = aVertex.zw;vColor = uColor * uAlpha;}", fSrc = "#version 100\nprecision mediump float;\nvarying vec2 vTexCoord;\nvarying vec4 vColor;\nuniform sampler2D uSampler;\nuniform int uLightType[4];\nuniform vec3 uLightColor[4];\nuniform vec3 uLightDirection[4];\nuniform vec3 uLightPosition[4];\nuniform vec3 uLightDistanceAttenuation[4];\nuniform vec4 uLightAngleAttenuation[4];\nvoid main() {gl_FragColor = texture2D(uSampler, vTexCoord) * vColor;}";
                this._context = context, this._program = WebGLShaderProgram._makeShaderProgram(context, vSrc, fSrc), 
                this._aVertex = context.getAttribLocation(this._program, "aVertex"), this._uColor = context.getUniformLocation(this._program, "uColor"), 
                this._uAlpha = context.getUniformLocation(this._program, "uAlpha"), this._uSampler = context.getUniformLocation(this._program, "uSampler"), 
                this._uLightType = context.getUniformLocation(this._program, "uLightType"), this._uLightColor = context.getUniformLocation(this._program, "uLightColor"), 
                this._uLightDirection = context.getUniformLocation(this._program, "uLightDirection"), 
                this._uLightPosition = context.getUniformLocation(this._program, "uLightPosition"), 
                this._uLightDistanceAttenuation = context.getUniformLocation(this._program, "uLightDistanceAttenuation"), 
                this._uLightAngleAttenuation = context.getUniformLocation(this._program, "uLightAngleAttenuation");
            }
            return WebGLShaderProgram._makeShader = function(gl, typ, src) {
                var shader = gl.createShader(typ);
                if (gl.shaderSource(shader, src), gl.compileShader(shader), !gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    var msg = gl.getShaderInfoLog(shader);
                    throw gl.deleteShader(shader), new Error(msg);
                }
                return shader;
            }, WebGLShaderProgram._makeShaderProgram = function(gl, vSrc, fSrc) {
                var program = gl.createProgram(), vShader = WebGLShaderProgram._makeShader(gl, gl.VERTEX_SHADER, vSrc);
                gl.attachShader(program, vShader), gl.deleteShader(vShader);
                var fShader = WebGLShaderProgram._makeShader(gl, gl.FRAGMENT_SHADER, fSrc);
                if (gl.attachShader(program, fShader), gl.deleteShader(fShader), gl.linkProgram(program), 
                !gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    var msg = gl.getProgramInfoLog(program);
                    throw gl.deleteProgram(program), new Error(msg);
                }
                return program;
            }, WebGLShaderProgram.prototype.set_aVertex = function(buffer) {
                this._context.bindBuffer(this._context.ARRAY_BUFFER, buffer), this._context.enableVertexAttribArray(this._aVertex), 
                this._context.vertexAttribPointer(this._aVertex, 4, this._context.FLOAT, !1, 0, 0);
            }, WebGLShaderProgram.prototype.set_uColor = function(rgba) {
                this._context.uniform4f(this._uColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            }, WebGLShaderProgram.prototype.set_uAlpha = function(alpha) {
                this._context.uniform1f(this._uAlpha, alpha);
            }, WebGLShaderProgram.prototype.set_uSampler = function(value) {
                this._context.uniform1i(this._uSampler, value);
            }, WebGLShaderProgram.prototype.set_uLightType = function(value) {
                this._context.uniform1iv(this._uLightType, value);
            }, WebGLShaderProgram.prototype.set_uLightColor = function(value) {
                this._context.uniform3fv(this._uLightColor, value);
            }, WebGLShaderProgram.prototype.set_uLightDirection = function(value) {
                this._context.uniform3fv(this._uLightDirection, value);
            }, WebGLShaderProgram.prototype.set_uLightPosition = function(value) {
                this._context.uniform3fv(this._uLightPosition, value);
            }, WebGLShaderProgram.prototype.set_uLightDistanceAttenuation = function(value) {
                this._context.uniform3fv(this._uLightDistanceAttenuation, value);
            }, WebGLShaderProgram.prototype.set_uLightAngleAttenuation = function(value) {
                this._context.uniform4fv(this._uLightAngleAttenuation, value);
            }, WebGLShaderProgram.prototype.use = function() {
                this._context.useProgram(this._program);
            }, WebGLShaderProgram.prototype.unuse = function() {
                this._context.useProgram(null);
            }, WebGLShaderProgram;
        }();
        exports.WebGLShaderProgram = WebGLShaderProgram;
    }, {} ],
    28: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var WebGLTextureMap_1 = require("./WebGLTextureMap"), WebGLTextureAtlas = function() {
            function WebGLTextureAtlas() {
                this._maps = [], this._insertPos = 0, this.emptyTexturePixels = new Uint8Array(WebGLTextureAtlas.TEXTURE_SIZE * WebGLTextureAtlas.TEXTURE_SIZE * 4);
            }
            return WebGLTextureAtlas.prototype.clear = function() {
                for (var i = 0; i < this._maps.length; ++i) this._maps[i].dispose();
            }, WebGLTextureAtlas.prototype.showOccupancy = function() {
                for (var i = 0; i < this._maps.length; ++i) console.log("occupancy[" + i + "]: " + this._maps[i].occupancy());
            }, WebGLTextureAtlas.prototype._makeTextureForSurface = function(renderer, surface) {
                var image = surface._drawable;
                if (image && !image._texture) {
                    var width = image.width, height = image.height;
                    return width >= WebGLTextureAtlas.TEXTURE_SIZE || height >= WebGLTextureAtlas.TEXTURE_SIZE ? void renderer._makeTextureForSurface(surface) : void this._assign(renderer, surface, this._maps);
                }
            }, WebGLTextureAtlas.prototype._assign = function(renderer, surface, maps) {
                for (var map, i = 0; i < maps.length; ++i) if (map = maps[(i + this._insertPos) % maps.length].insert(surface)) return this._register(renderer, map, surface._drawable), 
                void (this._insertPos = i);
                map = null, maps.length >= WebGLTextureAtlas.TEXTURE_COUNT && (map = maps.shift(), 
                renderer._disposeTexture(map.texture), map.dispose(), renderer._clearTexture(this.emptyTexturePixels, WebGLTextureAtlas.TEXTURE_SIZE, WebGLTextureAtlas.TEXTURE_SIZE, map.texture)), 
                map || (map = new WebGLTextureMap_1.WebGLTextureMap(renderer._makeTextureRaw(WebGLTextureAtlas.TEXTURE_SIZE, WebGLTextureAtlas.TEXTURE_SIZE), 0, 0, WebGLTextureAtlas.TEXTURE_SIZE, WebGLTextureAtlas.TEXTURE_SIZE)), 
                maps.push(map), map = map.insert(surface), this._register(renderer, map, surface._drawable);
            }, WebGLTextureAtlas.prototype._register = function(renderer, map, image) {
                image._texture = map.texture, image._textureOffsetX = map.offsetX, image._textureOffsetY = map.offsetY, 
                image._textureWidth = WebGLTextureAtlas.TEXTURE_SIZE, image._textureHeight = WebGLTextureAtlas.TEXTURE_SIZE, 
                renderer._assignTexture(image, map.offsetX, map.offsetY, map.texture);
            }, WebGLTextureAtlas;
        }();
        WebGLTextureAtlas.TEXTURE_SIZE = 1024, WebGLTextureAtlas.TEXTURE_COUNT = 16, exports.WebGLTextureAtlas = WebGLTextureAtlas;
    }, {
        "./WebGLTextureMap": 29
    } ],
    29: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var WebGLTextureMap = function() {
            function WebGLTextureMap(texture, offsetX, offsetY, width, height) {
                this.texture = texture, this.offsetX = offsetX, this.offsetY = offsetY, this._width = width, 
                this._height = height;
            }
            return WebGLTextureMap.prototype.dispose = function() {
                this._left && (this._left.dispose(), this._left = null), this._right && (this._right.dispose(), 
                this._right = null), this._surface && (this._surface._drawable && (this._surface._drawable._texture = null), 
                this._surface = null);
            }, WebGLTextureMap.prototype.capacity = function() {
                return this._width * this._height;
            }, WebGLTextureMap.prototype.area = function() {
                if (!this._surface) return 0;
                var image = this._surface._drawable, a = image.width * image.height;
                return this._left && (a += this._left.area()), this._right && (a += this._right.area()), 
                a;
            }, WebGLTextureMap.prototype.occupancy = function() {
                return this.area() / this.capacity();
            }, WebGLTextureMap.prototype.insert = function(surface) {
                var image = surface._drawable, width = image.width + WebGLTextureMap.TEXTURE_MARGIN, height = image.height + WebGLTextureMap.TEXTURE_MARGIN;
                if (this._surface) {
                    if (this._left) {
                        var left = this._left.insert(surface);
                        if (left) return left;
                    }
                    if (this._right) {
                        var right = this._right.insert(surface);
                        if (right) return right;
                    }
                    return null;
                }
                if (this._width < width || this._height < height) return null;
                var remainWidth = this._width - width, remainHeight = this._height - height;
                return remainWidth <= remainHeight ? (this._left = new WebGLTextureMap(this.texture, this.offsetX + width, this.offsetY, remainWidth, height), 
                this._right = new WebGLTextureMap(this.texture, this.offsetX, this.offsetY + height, this._width, remainHeight)) : (this._left = new WebGLTextureMap(this.texture, this.offsetX, this.offsetY + height, width, remainHeight), 
                this._right = new WebGLTextureMap(this.texture, this.offsetX + width, this.offsetY, remainWidth, this._height)), 
                this._surface = surface, this;
            }, WebGLTextureMap;
        }();
        WebGLTextureMap.TEXTURE_MARGIN = 1, exports.WebGLTextureMap = WebGLTextureMap;
    }, {} ],
    30: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var SurfaceFactory, RenderingHelper_1 = require("../RenderingHelper"), CanvasSurface_1 = require("../CanvasSurface"), WebGLPrimarySurface_1 = require("../WebGLPrimarySurface"), WebGLBackSurface_1 = require("../WebGLBackSurface");
        !function(SurfaceFactory) {
            function createPrimarySurface(width, height, rendererCandidates) {
                return RenderingHelper_1.RenderingHelper.usedWebGL(rendererCandidates) ? new WebGLPrimarySurface_1.WebGLPrimarySurface(width, height) : new CanvasSurface_1.CanvasSurface(width, height, rendererCandidates);
            }
            function createBackSurface(width, height, platform, rendererCandidates) {
                if (RenderingHelper_1.RenderingHelper.usedWebGL(rendererCandidates)) {
                    var renderer = platform.getPrimarySurface().renderer();
                    return new WebGLBackSurface_1.WebGLBackSurface(width, height, renderer);
                }
                return new CanvasSurface_1.CanvasSurface(width, height, rendererCandidates);
            }
            SurfaceFactory.createPrimarySurface = createPrimarySurface, SurfaceFactory.createBackSurface = createBackSurface;
        }(SurfaceFactory = exports.SurfaceFactory || (exports.SurfaceFactory = {}));
    }, {
        "../CanvasSurface": 13,
        "../RenderingHelper": 16,
        "../WebGLBackSurface": 21,
        "../WebGLPrimarySurface": 24
    } ],
    31: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), InputAbstractHandler = (require("@akashic/akashic-pdi"), 
        function() {
            function InputAbstractHandler(inputView, disablePreventDefault) {
                if (Object.getPrototypeOf && Object.getPrototypeOf(this) === InputAbstractHandler.prototype) throw new Error("InputAbstractHandler is abstract and should not be directly instantiated");
                this.inputView = inputView, this.pointerEventLock = {}, this._calculateOffsetForLazy = !0, 
                this._xScale = 1, this._yScale = 1, this._offset = {
                    x: 0,
                    y: 0
                }, this._disablePreventDefault = !!disablePreventDefault, this.pointTrigger = new g.Trigger();
            }
            return InputAbstractHandler.isSupported = function() {
                return !1;
            }, InputAbstractHandler.prototype.start = function() {
                throw new Error("This method is abstract");
            }, InputAbstractHandler.prototype.stop = function() {
                throw new Error("This method is abstract");
            }, InputAbstractHandler.prototype.setOffset = function(value) {
                this._offset = value;
            }, InputAbstractHandler.prototype.setScale = function(xScale, yScale) {
                void 0 === yScale && (yScale = xScale), this._xScale = xScale, this._yScale = yScale;
            }, InputAbstractHandler.prototype.pointDown = function(identifier, pagePosition) {
                this.pointTrigger.fire({
                    type: 0,
                    identifier: identifier,
                    offset: this.getOffsetFromEvent(pagePosition)
                }), this.pointerEventLock[identifier] = !0;
            }, InputAbstractHandler.prototype.pointMove = function(identifier, pagePosition) {
                identifier in this.pointerEventLock && this.pointTrigger.fire({
                    type: 1,
                    identifier: identifier,
                    offset: this.getOffsetFromEvent(pagePosition)
                });
            }, InputAbstractHandler.prototype.pointUp = function(identifier, pagePosition) {
                identifier in this.pointerEventLock && (this.pointTrigger.fire({
                    type: 2,
                    identifier: identifier,
                    offset: this.getOffsetFromEvent(pagePosition)
                }), delete this.pointerEventLock[identifier]);
            }, InputAbstractHandler.prototype.getOffsetFromEvent = function(e) {
                if (this._calculateOffsetForLazy) {
                    var bounding = this.inputView.getBoundingClientRect(), offsetOfWindow = {
                        x: Math.round(window.pageXOffset + bounding.left),
                        y: Math.round(window.pageYOffset + bounding.top)
                    };
                    this._offset = offsetOfWindow, this._calculateOffsetForLazy = !1;
                }
                return {
                    x: (e.pageX - this._offset.x) / this._xScale,
                    y: (e.pageY - this._offset.y) / this._yScale
                };
            }, InputAbstractHandler.prototype.getScale = function() {
                return {
                    x: this._xScale,
                    y: this._yScale
                };
            }, InputAbstractHandler.prototype.notifyViewMoved = function() {
                this._calculateOffsetForLazy = !0;
            }, InputAbstractHandler;
        }());
        exports.InputAbstractHandler = InputAbstractHandler;
    }, {
        "@akashic/akashic-engine": "@akashic/akashic-engine",
        "@akashic/akashic-pdi": 44
    } ],
    32: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var InputAbstractHandler_1 = require("./InputAbstractHandler"), MouseHandler = function(_super) {
            function MouseHandler(inputView, disablePreventDefault) {
                var _this = _super.call(this, inputView, disablePreventDefault) || this, identifier = 1;
                return _this.onPointDown = function(e) {
                    0 === e.button && (_this.pointDown(identifier, e), window.addEventListener("mousemove", _this.onPointMove, !1), 
                    window.addEventListener("mouseup", _this.onPointUp, !1), _this._disablePreventDefault || (e.stopPropagation(), 
                    e.preventDefault()));
                }, _this.onPointMove = function(e) {
                    _this.pointMove(identifier, e), _this._disablePreventDefault || (e.stopPropagation(), 
                    e.preventDefault());
                }, _this.onPointUp = function(e) {
                    _this.pointUp(identifier, e), window.removeEventListener("mousemove", _this.onPointMove, !1), 
                    window.removeEventListener("mouseup", _this.onPointUp, !1), _this._disablePreventDefault || (e.stopPropagation(), 
                    e.preventDefault());
                }, _this;
            }
            return __extends(MouseHandler, _super), MouseHandler.isSupported = function() {
                return !0;
            }, MouseHandler.prototype.start = function() {
                this.inputView.addEventListener("mousedown", this.onPointDown, !1);
            }, MouseHandler.prototype.stop = function() {
                this.inputView.removeEventListener("mousedown", this.onPointDown, !1);
            }, MouseHandler;
        }(InputAbstractHandler_1.InputAbstractHandler);
        exports.MouseHandler = MouseHandler;
    }, {
        "./InputAbstractHandler": 31
    } ],
    33: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var InputAbstractHandler_1 = require("./InputAbstractHandler"), RuntimeInfo_1 = require("../RuntimeInfo"), TouchHandler = function(_super) {
            function TouchHandler(inputView, disablePreventDefault) {
                var _this = _super.call(this, inputView, disablePreventDefault) || this;
                return _this.onPointDown = function(e) {
                    for (var touches = e.changedTouches, i = 0, len = touches.length; i < len; i++) {
                        var touch = touches[i];
                        _this.pointDown(touch.identifier, touch);
                    }
                    _this._disablePreventDefault || (e.stopPropagation(), e.preventDefault());
                }, _this.onPointMove = function(e) {
                    for (var touches = e.changedTouches, i = 0, len = touches.length; i < len; i++) {
                        var touch = touches[i];
                        _this.pointMove(touch.identifier, touch);
                    }
                    _this._disablePreventDefault || (e.stopPropagation(), e.preventDefault());
                }, _this.onPointUp = function(e) {
                    for (var touches = e.changedTouches, i = 0, len = touches.length; i < len; i++) {
                        var touch = touches[i];
                        _this.pointUp(touch.identifier, touch);
                    }
                    _this._disablePreventDefault || (e.stopPropagation(), e.preventDefault());
                }, _this;
            }
            return __extends(TouchHandler, _super), TouchHandler.isSupported = function() {
                return RuntimeInfo_1.RuntimeInfo.touchEnabled();
            }, TouchHandler.prototype.start = function() {
                this.inputView.addEventListener("touchstart", this.onPointDown), this.inputView.addEventListener("touchmove", this.onPointMove), 
                this.inputView.addEventListener("touchend", this.onPointUp);
            }, TouchHandler.prototype.stop = function() {
                this.inputView.removeEventListener("touchstart", this.onPointDown), this.inputView.removeEventListener("touchmove", this.onPointMove), 
                this.inputView.removeEventListener("touchend", this.onPointUp);
            }, TouchHandler;
        }(InputAbstractHandler_1.InputAbstractHandler);
        exports.TouchHandler = TouchHandler;
    }, {
        "../RuntimeInfo": 6,
        "./InputAbstractHandler": 31
    } ],
    34: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var AudioPluginManager = function() {
            function AudioPluginManager() {
                this._activePlugin = void 0;
            }
            return AudioPluginManager.prototype.getActivePlugin = function() {
                return void 0 === this._activePlugin ? null : this._activePlugin;
            }, AudioPluginManager.prototype.tryInstallPlugin = function(plugins) {
                var PluginConstructor = this.findFirstAvailablePlugin(plugins);
                return !!PluginConstructor && (this._activePlugin = new PluginConstructor(), !0);
            }, AudioPluginManager.prototype.findFirstAvailablePlugin = function(plugins) {
                for (var i = 0, len = plugins.length; i < len; i++) {
                    var plugin = plugins[i];
                    if (plugin.isSupported()) return plugin;
                }
            }, AudioPluginManager;
        }();
        exports.AudioPluginManager = AudioPluginManager;
    }, {} ],
    35: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var audioPlugins = [];
        exports.AudioPluginRegistry = {
            addPlugin: function(plugin) {
                audioPlugins.indexOf(plugin) === -1 && audioPlugins.push(plugin);
            },
            getRegisteredAudioPlugins: function() {
                return audioPlugins;
            },
            clear: function() {
                audioPlugins = [];
            }
        };
    }, {} ],
    36: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), HTMLAudioAsset = function(_super) {
            function HTMLAudioAsset() {
                return null !== _super && _super.apply(this, arguments) || this;
            }
            return __extends(HTMLAudioAsset, _super), HTMLAudioAsset.prototype._load = function(loader) {
                var _this = this, audio = new Audio(), startLoadingAudio = function(path, handlers) {
                    audio.autoplay = !1, audio.preload = "none", audio.src = path, _this._attachAll(audio, handlers), 
                    audio.preload = "auto", setAudioLoadInterval(audio, handlers), audio.load();
                }, handlers = {
                    success: function() {
                        _this._detachAll(audio, handlers), _this.data = audio, loader._onAssetLoad(_this), 
                        window.clearInterval(_this._intervalId);
                    },
                    error: function() {
                        _this._detachAll(audio, handlers), _this.data = audio, loader._onAssetError(_this, g.ExceptionFactory.createAssetLoadError("HTMLAudioAsset loading error")), 
                        window.clearInterval(_this._intervalId);
                    }
                }, setAudioLoadInterval = function(audio, handlers) {
                    _this._intervalCount = 0, _this._intervalId = window.setInterval(function() {
                        4 === audio.readyState ? handlers.success() : (++_this._intervalCount, 600 === _this._intervalCount && handlers.error());
                    }, 100);
                };
                if (".mp4" === this.path.slice(-4) && HTMLAudioAsset.supportedFormats.indexOf("aac") !== -1) {
                    var altHandlers = {
                        success: handlers.success,
                        error: function() {
                            _this._detachAll(audio, altHandlers), window.clearInterval(_this._intervalId);
                            var altPath = _this.path.slice(0, _this.path.length - 4) + ".aac";
                            startLoadingAudio(altPath, handlers);
                        }
                    };
                    return void startLoadingAudio(this.path, altHandlers);
                }
                startLoadingAudio(this.path, handlers);
            }, HTMLAudioAsset.prototype.createInstance = function() {
                var audio = new Audio(this.data.src), ret = new HTMLAudioAsset(this.id, this.path, this.duration, this._system, this.loop, this.hint);
                return ret.data = audio, ret;
            }, HTMLAudioAsset.prototype._assetPathFilter = function(path) {
                return HTMLAudioAsset.supportedFormats.indexOf("ogg") !== -1 ? g.PathUtil.addExtname(path, "ogg") : HTMLAudioAsset.supportedFormats.indexOf("mp4") !== -1 ? g.PathUtil.addExtname(path, "mp4") : void 0;
            }, HTMLAudioAsset.prototype._attachAll = function(audio, handlers) {
                handlers.success && audio.addEventListener("canplaythrough", handlers.success, !1), 
                handlers.error && (audio.addEventListener("stalled", handlers.error, !1), audio.addEventListener("error", handlers.error, !1), 
                audio.addEventListener("abort", handlers.error, !1));
            }, HTMLAudioAsset.prototype._detachAll = function(audio, handlers) {
                handlers.success && audio.removeEventListener("canplaythrough", handlers.success, !1), 
                handlers.error && (audio.removeEventListener("stalled", handlers.error, !1), audio.removeEventListener("error", handlers.error, !1), 
                audio.removeEventListener("abort", handlers.error, !1));
            }, HTMLAudioAsset;
        }(g.AudioAsset);
        exports.HTMLAudioAsset = HTMLAudioAsset;
    }, {
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    37: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), HTMLAudioPlayer = function(_super) {
            function HTMLAudioPlayer(system) {
                var _this = _super.call(this, system) || this;
                return _this._endedEventHandler = function() {
                    _this._onAudioEnded();
                }, _this;
            }
            return __extends(HTMLAudioPlayer, _super), HTMLAudioPlayer.prototype.play = function(asset) {
                this.currentAudio && this.stop();
                var instance = asset.createInstance(), audio = instance.data;
                audio.volume = this.volume, audio.play(), audio.loop = asset.loop, audio.addEventListener("ended", this._endedEventHandler, !1), 
                this._audioInstance = audio, _super.prototype.play.call(this, asset);
            }, HTMLAudioPlayer.prototype.stop = function() {
                this.currentAudio && (this._clearEndedEventHandler(), this._audioInstance.pause(), 
                this._audioInstance.currentTime = 0, _super.prototype.stop.call(this));
            }, HTMLAudioPlayer.prototype.changeVolume = function(volume) {
                this.currentAudio && (this._audioInstance.volume = volume), _super.prototype.changeVolume.call(this, volume);
            }, HTMLAudioPlayer.prototype._onAudioEnded = function() {
                this._clearEndedEventHandler(), _super.prototype.stop.call(this);
            }, HTMLAudioPlayer.prototype._clearEndedEventHandler = function() {
                this._audioInstance.removeEventListener("ended", this._endedEventHandler, !1);
            }, HTMLAudioPlayer;
        }(g.AudioPlayer);
        exports.HTMLAudioPlayer = HTMLAudioPlayer;
    }, {
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    38: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var HTMLAudioAsset_1 = require("./HTMLAudioAsset"), HTMLAudioPlayer_1 = require("./HTMLAudioPlayer"), HTMLAudioPlugin = function() {
            function HTMLAudioPlugin() {
                this._supportedFormats = this._detectSupportedFormats(), HTMLAudioAsset_1.HTMLAudioAsset.supportedFormats = this.supportedFormats;
            }
            return HTMLAudioPlugin.isSupported = function() {
                var audioElement = document.createElement("audio"), result = !1;
                try {
                    result = void 0 !== audioElement.canPlayType;
                } catch (e) {}
                return result;
            }, Object.defineProperty(HTMLAudioPlugin.prototype, "supportedFormats", {
                get: function() {
                    return this._supportedFormats;
                },
                set: function(supportedFormats) {
                    this._supportedFormats = supportedFormats, HTMLAudioAsset_1.HTMLAudioAsset.supportedFormats = supportedFormats;
                },
                enumerable: !0,
                configurable: !0
            }), HTMLAudioPlugin.prototype.createAsset = function(id, assetPath, duration, system, loop, hint) {
                return new HTMLAudioAsset_1.HTMLAudioAsset(id, assetPath, duration, system, loop, hint);
            }, HTMLAudioPlugin.prototype.createPlayer = function(system) {
                return new HTMLAudioPlayer_1.HTMLAudioPlayer(system);
            }, HTMLAudioPlugin.prototype._detectSupportedFormats = function() {
                var audioElement = document.createElement("audio"), supportedFormats = [];
                try {
                    for (var supportedExtensions = [ "ogg", "mp4", "aac" ], i = 0, len = supportedExtensions.length; i < len; i++) {
                        var ext = supportedExtensions[i], supported = "no" !== audioElement.canPlayType("audio/" + ext) && "" !== audioElement.canPlayType("audio/" + ext);
                        supported && supportedFormats.push(ext);
                    }
                } catch (e) {}
                return supportedFormats;
            }, HTMLAudioPlugin;
        }();
        exports.HTMLAudioPlugin = HTMLAudioPlugin;
    }, {
        "./HTMLAudioAsset": 36,
        "./HTMLAudioPlayer": 37
    } ],
    39: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), XHRLoader_1 = require("../../utils/XHRLoader"), helper = require("./WebAudioHelper"), WebAudioAsset = function(_super) {
            function WebAudioAsset() {
                return null !== _super && _super.apply(this, arguments) || this;
            }
            return __extends(WebAudioAsset, _super), WebAudioAsset.prototype._load = function(loader) {
                var _this = this, successHandler = function(decodedAudio) {
                    _this.data = decodedAudio, loader._onAssetLoad(_this);
                }, errorHandler = function() {
                    loader._onAssetError(_this, g.ExceptionFactory.createAssetLoadError("WebAudioAsset unknown loading error"));
                }, onLoadArrayBufferHandler = function(response) {
                    var audioContext = helper.getAudioContext();
                    audioContext.decodeAudioData(response, successHandler, errorHandler);
                }, xhrLoader = new XHRLoader_1.XHRLoader(), loadArrayBuffer = function(path, onSuccess, onFailed) {
                    xhrLoader.getArrayBuffer(path, function(error, response) {
                        error ? onFailed(error) : onSuccess(response);
                    });
                };
                return ".mp4" === this.path.slice(-4) ? void loadArrayBuffer(this.path, onLoadArrayBufferHandler, function(error) {
                    var altPath = _this.path.slice(0, _this.path.length - 4) + ".aac";
                    loadArrayBuffer(altPath, function(response) {
                        _this.path = altPath, onLoadArrayBufferHandler(response);
                    }, errorHandler);
                }) : void loadArrayBuffer(this.path, onLoadArrayBufferHandler, errorHandler);
            }, WebAudioAsset.prototype._assetPathFilter = function(path) {
                if (WebAudioAsset.supportedFormats.indexOf("ogg") !== -1) return g.PathUtil.addExtname(path, "ogg");
                if (WebAudioAsset.supportedFormats.indexOf("mp4") !== -1) return g.PathUtil.addExtname(path, "mp4");
                throw new Error("not available ogg or aac, The UA supported formats are " + WebAudioAsset.supportedFormats);
            }, WebAudioAsset;
        }(g.AudioAsset);
        WebAudioAsset.supportedFormats = [], exports.WebAudioAsset = WebAudioAsset;
    }, {
        "../../utils/XHRLoader": 43,
        "./WebAudioHelper": 40,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    40: [ function(require, module, exports) {
        (function(global) {
            "use strict";
            var WebAudioHelper, AudioContext = global.AudioContext || global.webkitAudioContext, singleContext = null;
            !function(WebAudioHelper) {
                function getAudioContext() {
                    return singleContext || (singleContext = new AudioContext()), singleContext;
                }
                function createGainNode(context) {
                    return context.createGain ? context.createGain() : context.createGainNode();
                }
                function createBufferNode(context) {
                    var sourceNode = context.createBufferSource();
                    return sourceNode.start ? sourceNode : (sourceNode.start = sourceNode.noteOn, sourceNode.stop = sourceNode.noteOff, 
                    sourceNode);
                }
                WebAudioHelper.getAudioContext = getAudioContext, WebAudioHelper.createGainNode = createGainNode, 
                WebAudioHelper.createBufferNode = createBufferNode;
            }(WebAudioHelper || (WebAudioHelper = {})), module.exports = WebAudioHelper;
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
    }, {} ],
    41: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), helper = require("./WebAudioHelper"), WebAudioPlayer = function(_super) {
            function WebAudioPlayer(system) {
                var _this = _super.call(this, system) || this;
                return _this._audioContext = helper.getAudioContext(), _this._gainNode = helper.createGainNode(_this._audioContext), 
                _this._gainNode.connect(_this._audioContext.destination), _this._gainNode.gain.value = system.volume, 
                _this._sourceNode = void 0, _this._endedEventHandler = function() {
                    _this._onAudioEnded();
                }, _this;
            }
            return __extends(WebAudioPlayer, _super), WebAudioPlayer.prototype.changeVolume = function(volume) {
                this._gainNode.gain.value = volume, _super.prototype.changeVolume.call(this, volume);
            }, WebAudioPlayer.prototype.play = function(asset) {
                this.currentAudio && this.stop();
                var bufferNode = helper.createBufferNode(this._audioContext);
                bufferNode.loop = asset.loop, bufferNode.buffer = asset.data, bufferNode.connect(this._gainNode), 
                this._sourceNode = bufferNode, this._sourceNode.onended = this._endedEventHandler, 
                this._sourceNode.start(0), _super.prototype.play.call(this, asset);
            }, WebAudioPlayer.prototype.stop = function() {
                this.currentAudio && (this._clearEndedEventHandler(), this._sourceNode.stop(0), 
                _super.prototype.stop.call(this));
            }, WebAudioPlayer.prototype._onAudioEnded = function() {
                this._clearEndedEventHandler(), _super.prototype.stop.call(this);
            }, WebAudioPlayer.prototype._clearEndedEventHandler = function() {
                this._sourceNode.onended = null;
            }, WebAudioPlayer;
        }(g.AudioPlayer);
        exports.WebAudioPlayer = WebAudioPlayer;
    }, {
        "./WebAudioHelper": 40,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    42: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var WebAudioAsset_1 = require("./WebAudioAsset"), WebAudioPlayer_1 = require("./WebAudioPlayer"), WebAudioPlugin = function() {
            function WebAudioPlugin() {
                this.supportedFormats = this._detectSupportedFormats();
            }
            return WebAudioPlugin.isSupported = function() {
                return "AudioContext" in window || "webkitAudioContext" in window;
            }, Object.defineProperty(WebAudioPlugin.prototype, "supportedFormats", {
                get: function() {
                    return this._supportedFormats;
                },
                set: function(supportedFormats) {
                    this._supportedFormats = supportedFormats, WebAudioAsset_1.WebAudioAsset.supportedFormats = supportedFormats;
                },
                enumerable: !0,
                configurable: !0
            }), WebAudioPlugin.prototype.createAsset = function(id, assetPath, duration, system, loop, hint) {
                return new WebAudioAsset_1.WebAudioAsset(id, assetPath, duration, system, loop, hint);
            }, WebAudioPlugin.prototype.createPlayer = function(system) {
                return new WebAudioPlayer_1.WebAudioPlayer(system);
            }, WebAudioPlugin.prototype._detectSupportedFormats = function() {
                var audioElement = document.createElement("audio"), supportedFormats = [];
                try {
                    for (var supportedExtensions = [ "ogg", "mp4", "aac" ], i = 0, len = supportedExtensions.length; i < len; i++) {
                        var ext = supportedExtensions[i], supported = "no" !== audioElement.canPlayType("audio/" + ext) && "" !== audioElement.canPlayType("audio/" + ext);
                        supported && supportedFormats.push(ext);
                    }
                } catch (e) {}
                return supportedFormats;
            }, WebAudioPlugin;
        }();
        exports.WebAudioPlugin = WebAudioPlugin;
    }, {
        "./WebAudioAsset": 39,
        "./WebAudioPlayer": 41
    } ],
    43: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), XHRLoader = function() {
            function XHRLoader(options) {
                void 0 === options && (options = {}), this.timeout = options.timeout || 15e3;
            }
            return XHRLoader.prototype.get = function(url, callback) {
                this._getRequestObject({
                    url: url,
                    responseType: "text"
                }, callback);
            }, XHRLoader.prototype.getArrayBuffer = function(url, callback) {
                this._getRequestObject({
                    url: url,
                    responseType: "arraybuffer"
                }, callback);
            }, XHRLoader.prototype._getRequestObject = function(requestObject, callback) {
                var request = new XMLHttpRequest();
                request.open("GET", requestObject.url, !0), request.responseType = requestObject.responseType, 
                request.timeout = this.timeout, request.addEventListener("timeout", function() {
                    callback(g.ExceptionFactory.createAssetLoadError("loading timeout"));
                }, !1), request.addEventListener("load", function() {
                    if (request.status >= 200 && request.status < 300) {
                        var response = "text" === requestObject.responseType ? request.responseText : request.response;
                        callback(null, response);
                    } else callback(g.ExceptionFactory.createAssetLoadError("loading error. status: " + request.status));
                }, !1), request.addEventListener("error", function() {
                    callback(g.ExceptionFactory.createAssetLoadError("loading error. status: " + request.status));
                }, !1), request.send();
            }, XHRLoader;
        }();
        exports.XHRLoader = XHRLoader;
    }, {
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    44: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
    }, {} ]
}, {}, []);