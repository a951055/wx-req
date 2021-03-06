var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { RequestMethod } from "./model/RequestMethod";
import { ResponseType } from "./model/ResponseType";
import { LogLevel } from "./ILogger";
import { TimeoutError, HttpError } from "./errors";
/**
 * 封装微信ajax请求工具
 * @author halo
 */
var Request = /** @class */ (function () {
    /**
     * Creates an instance of Request.
     * 实例化配置
     * @param {*} [config]
     * @memberof Request
     */
    function Request(config, logger) {
        if (config === void 0) { config = {}; }
        // 写入配置
        if (wx) {
            // Time: 继承 signalR logger. 日志统一维护
            this.logger = logger ? logger : { log: function () { } };
        }
        else {
            throw new Error("当前运行环境不是微信运行环境");
        }
        // custom wx request promise library.
        this.setConfig(config);
    }
    /**
     * merge config
     * @param config
     */
    Request.prototype.setConfig = function (config) {
        if (config === void 0) { config = {}; }
        // 合并默认配置和
        this.config = __assign({ baseUrl: "http://", headers: { "Content-Type": "application/json" }, forceEnableHttps: false, method: RequestMethod.GET, responseType: ResponseType.JSON, responseEncoding: "utf8", timeout: 60 * 1000, transformRequest: [], transformResponse: [] }, config);
        // 请求头默认附加response 解析器
        if (!this.config.transformResponse) {
            this.config.transformResponse = [];
        }
        this.logger.log(LogLevel.Information, "set config success.");
    };
    /**
     * 请求参数序列化
     *
     * @param {RequestOptions} options
     * @memberof Request
     *
     * @description 只支持普通get请求,和content-type = json 的 其他请求(post,put,delete,patch)
     */
    Request.prototype.handleRequestOptions = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, fun, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (options.method !== RequestMethod.CLOUD) {
                            // 请求地址处理,对于非<scene>:// 请求,附加baseUrl
                            if (options.url && !/:\/\/.+?/.test(options.url)) {
                                options.url = ((options.config ? options.config.baseUrl : "") + "/" + options.url).replace(/([^:])(\/\/)/g, "$1/");
                            }
                            this.logger.log(LogLevel.Trace, "checked request url");
                            // https 处理
                            if (options.config && options.config.forceEnableHttps) {
                                options.url = options.url.replace(/http:/, "https:");
                                this.logger.log(LogLevel.Trace, "execute fix [request.config.forceEnableHttps] " + options.url);
                            }
                            // header 合并
                            options.headers = Object.assign({}, options.config ? options.config.headers : {}, options.headers);
                            this.logger.log(LogLevel.Trace, "merge headers ", options.headers);
                            // 移除微信封锁参数
                            delete options.headers["Referer"];
                            this.logger.log(LogLevel.Trace, "try delete headers Referer.");
                            // 替换请求内的ResponseType
                            options.responseType = options.responseType ? options.responseType : options.config ? options.config.responseType : ResponseType.TEXT;
                            this.logger.log(LogLevel.Trace, "checked responseType [" + options.responseType + "]");
                        }
                        if (!(options.config && options.config.transformRequest)) return [3 /*break*/, 6];
                        this.logger.log(LogLevel.Trace, "execute transform request list. -result\n", options.config);
                        _i = 0, _a = options.config.transformRequest;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        fun = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, fun(options)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _b.sent();
                        throw e_1;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        // debug print handled request options
                        this.logger.log(LogLevel.Debug, "handled request options \n", options);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 验证响应结果,执行回调
     *
     * @param {*} resolve
     * @param {*} reject
     * @param {*} response
     * @memberof Request
     */
    Request.prototype.handleResponse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, fun, res_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(response.options.config && response.options.config.responseType == "json" && response.options.config.transformResponse)) return [3 /*break*/, 6];
                        _i = 0, _a = response.options.config.transformResponse;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        fun = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        // handler response
                        return [4 /*yield*/, fun(response)];
                    case 3:
                        // handler response
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        res_1 = _b.sent();
                        this.logger.log(LogLevel.Trace, "execute transform request list. -result \n ", res_1);
                        throw res_1;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        // debug print handled response context
                        this.logger.log(LogLevel.Debug, "handled response context \n", response);
                        return [2 /*return*/, Promise.resolve(response)];
                }
            });
        });
    };
    /**
     * 执行请求
     *
     * @param {RequestOptions} [options={
     *       url: this.config.baseUrl
     *     }]
     * @returns {Promise<any>}
     * @memberof Request
     */
    Request.prototype.executeRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, res, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(LogLevel.Trace, "execute request -options \n", options);
                        // 合并 baseConfig
                        options.config = options.config ? __assign(__assign({}, this.config), options.config) : __assign({}, this.config);
                        this.logger.log(LogLevel.Trace, "merged options \n", options);
                        this.checkAbout(options.config); // 中断检查
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // 序列化请求参数
                        return [4 /*yield*/, this.handleRequestOptions(options)];
                    case 2:
                        // 序列化请求参数
                        _a.sent();
                        this.logger.log(LogLevel.Debug, "fixed options \n", options);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        // 抛出异常.
                        throw __assign({ data: null, header: null, statusCode: -1, options: options }, error_1);
                    case 4:
                        this.checkAbout(options.config); // 中断检查
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 10, , 11]);
                        res = null;
                        if (!(options.method !== RequestMethod.CLOUD)) return [3 /*break*/, 7];
                        // execute request
                        this.logger.log(LogLevel.Trace, "invoke wx.request");
                        return [4 /*yield*/, this.sendRequest(options)];
                    case 6:
                        res = _a.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, this.invokeCloudFunction(options)];
                    case 8:
                        res = _a.sent();
                        _a.label = 9;
                    case 9: return [2 /*return*/, res];
                    case 10:
                        err_1 = _a.sent();
                        throw err_1; // 向上抛出异常
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 拆分 - 普通http请求
     */
    Request.prototype.sendRequest = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _a;
            var task = wx.request({
                url: options.url,
                data: options.data,
                dataType: options.responseType,
                header: options.headers,
                method: options.method != RequestMethod.CLOUD ? options.method : RequestMethod.GET,
                responseType: (function () {
                    switch (options.responseType) {
                        case "json":
                        case "text":
                            return "text";
                        case "arraybuffer":
                            return "arraybuffer";
                    }
                })(),
                success: function (res) { return __awaiter(_this, void 0, void 0, function () {
                    var data, header, statusCode, errMsg, responseOptions, res_2, err_2, httpError;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (this.checkAbout(options.config, reject))
                                    return [2 /*return*/];
                                this.logger.log(LogLevel.Debug, "origin response context \n", res);
                                data = res.data, header = res.header, statusCode = res.statusCode, errMsg = res.errMsg;
                                responseOptions = { data: data, header: header, statusCode: statusCode, options: options, errMsg: errMsg };
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, this.handleResponse(responseOptions)];
                            case 2:
                                res_2 = _a.sent();
                                // print debug
                                this.logger.log(LogLevel.Debug, "handle response context is success. \n", res_2);
                                // 用到cookies的话,需要自己实现一个 cookie的管理器
                                if (options.config.cookie)
                                    options.config.cookie.set(options.url, header);
                                // callback
                                resolve(res_2);
                                return [3 /*break*/, 4];
                            case 3:
                                err_2 = _a.sent();
                                // print log
                                this.logger.log(LogLevel.Error, "handle response context is fail. \n ", res);
                                httpError = new HttpError(err_2.errMsg, err_2.statusCode);
                                // callback  - 合并后,返回,可以被认定为 继承 HttpError对象.
                                reject(__assign(__assign({}, err_2), httpError));
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); },
                fail: function (resp) { return __awaiter(_this, void 0, void 0, function () {
                    var responseOptions, isTimeoutError, res, res_3, httpError;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                responseOptions = null;
                                isTimeoutError = resp && /request:fail socket time out timeout/.test(resp.errMsg);
                                responseOptions = { data: null, status: -1, errMsg: resp.errMsg };
                                if (isTimeoutError)
                                    responseOptions = __assign(__assign({}, responseOptions), new TimeoutError(resp.errMsg));
                                else
                                    responseOptions = __assign(__assign({}, responseOptions), new HttpError(resp.errMsg, 500));
                                return [4 /*yield*/, this.handleResponse(responseOptions)];
                            case 1:
                                res = _a.sent();
                                // print debug
                                this.logger.log(LogLevel.Debug, "handle response context is success. \n", res);
                                // 用到cookies的话,需要自己实现一个 cookie的管理器
                                if (options.config.cookie)
                                    options.config.cookie.set(options.url, {});
                                // callback
                                reject(res);
                                return [3 /*break*/, 3];
                            case 2:
                                res_3 = _a.sent();
                                // print log
                                this.logger.log(LogLevel.Error, "handle response context is fail. \n ", res_3);
                                httpError = new HttpError(resp.errMsg, res_3.statusCode);
                                // callback  - 合并后,返回,可以被认定为 继承 HttpError对象.
                                reject(__assign(__assign({}, resp), httpError));
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); }
            });
            // 监听 headers 变化
            (_a = task === null || task === void 0 ? void 0 : task.onHeadersReceived) === null || _a === void 0 ? void 0 : _a.call(task, function () {
                // 当检查到 about() 状态,中断请求
                if (_this.checkAbout(options.config, reject))
                    return task.abort();
            });
        });
    };
    /**
     * 拆分 - 云函数请求
     */
    Request.prototype.invokeCloudFunction = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var res, responseOptions, responseOptions, r, err_3, httpError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, wx.cloud.callFunction({
                                name: options.url,
                                data: options.data,
                                slow: options.slow
                            })];
                    case 1:
                        res = _a.sent();
                        if (!(typeof res.result == "string")) return [3 /*break*/, 2];
                        responseOptions = { data: res.result, header: null, statusCode: null, options: options, errMsg: null };
                        return [2 /*return*/, responseOptions];
                    case 2:
                        responseOptions = { data: res.result, header: null, statusCode: null, options: options, errMsg: null };
                        return [4 /*yield*/, this.handleResponse(responseOptions)];
                    case 3:
                        r = _a.sent();
                        // print debug
                        this.logger.log(LogLevel.Debug, "handle response context is success. \n", res);
                        return [2 /*return*/, r];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_3 = _a.sent();
                        // print log
                        this.logger.log(LogLevel.Error, "handle response context is fail. \n ", err_3);
                        httpError = new HttpError(err_3.errMsg || err_3, 500);
                        // callback  - 合并后,返回,可以被认定为 继承 HttpError对象.
                        throw __assign(__assign({}, err_3), httpError);
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查中断
     *
     * @memberof Request
     */
    Request.prototype.checkAbout = function (options, reject) {
        var _a, _b;
        var err = {
            data: null,
            header: options.headers,
            statusCode: 412,
            options: options,
            errMsg: "网络异常" // 直接自定义错误了.
        };
        if ((_a = options.config) === null || _a === void 0 ? void 0 : _a.about) {
            if (!reject)
                throw err;
            reject(err);
        }
        return (_b = options.config) === null || _b === void 0 ? void 0 : _b.about;
    };
    /**
     * GET 请求
     * @description 封装调用
     * @param url 请求地址
     * @param data 请求参数
     * @param options 请求配置
     */
    Request.prototype.get = function (url, data, options) {
        if (data === void 0) { data = {}; }
        // print execute step
        this.logger.log(LogLevel.Trace, "invoke request.get()");
        // merge config
        var requestOptions = __assign(__assign({}, (function () { return (options ? options : {}); })()), { method: RequestMethod.GET, url: url,
            data: data });
        // execute and response
        return this.executeRequest(requestOptions);
    };
    /**
     * POST 请求
     * @description 封装调用
     * @param url 请求地址
     * @param data 请求参数
     * @param options 请求配置
     */
    Request.prototype.post = function (url, data, options) {
        if (data === void 0) { data = {}; }
        // print execute step
        this.logger.log(LogLevel.Trace, "invoke request.post()");
        // merge config
        var requestOptions = __assign(__assign({}, (function () { return (options ? options : {}); })()), { method: RequestMethod.POST, url: url,
            data: data });
        // execute and response
        return this.executeRequest(requestOptions);
    };
    /**
     * PUT 请求
     * @description 封装调用
     * @param url 请求地址
     * @param data 请求参数
     * @param options 请求配置
     */
    Request.prototype.put = function (url, data, options) {
        if (data === void 0) { data = {}; }
        // print execute step
        this.logger.log(LogLevel.Trace, "invoke request.put()");
        // merge config
        var requestOptions = __assign(__assign({}, (function () { return (options ? options : {}); })()), { method: RequestMethod.PUT, url: url,
            data: data });
        // execute and response
        return this.executeRequest(requestOptions);
    };
    /**
     * DELETE 请求
     * @description 封装调用
     * @param url 请求地址
     * @param data 请求参数
     * @param options 请求配置
     */
    Request.prototype.delete = function (url, data, options) {
        if (data === void 0) { data = {}; }
        // print execute step
        this.logger.log(LogLevel.Trace, "invoke request.delete()");
        // merge config
        var requestOptions = __assign(__assign({}, (function () { return (options ? options : {}); })()), { method: RequestMethod.DELETE, url: url,
            data: data });
        // execute and response
        return this.executeRequest(requestOptions);
    };
    Request.prototype.cloud = function (path, data, options) {
        if (data === void 0) { data = {}; }
        // print execute step
        this.logger.log(LogLevel.Trace, "invoke request.cloud()");
        // merge config
        var requestOptions = __assign(__assign({}, (function () { return (options ? options : {}); })()), { method: RequestMethod.CLOUD, url: path, data: data });
        // execute and response
        return this.executeRequest(requestOptions);
    };
    /**
     * 多请求同步执行
     * @param taskQueue
     */
    Request.prototype.all = function (taskQueue) {
        // print execute step
        this.logger.log(LogLevel.Trace, "invoke request.all()");
        // merge config
        return Promise.all(taskQueue);
    };
    /**
     * 用于兼容 @aspnet/signalR 的 获取 cookie 方法
     *
     * @description 这里用内存对象来维护一个 在线 cookies
     * @param {string} url
     * @returns
     * @memberof Request
     */
    Request.prototype.getCookieString = function (url) {
        if (this.config && this.config.cookie) {
            return this.config.cookie.origin(url);
        }
        else {
            return "";
        }
    };
    Request.prototype.cookie = function (url, key) {
        if (this.config && this.config.cookie) {
            return this.config.cookie.get(url, key);
        }
        else {
            return "";
        }
    };
    return Request;
}());
export { Request };
