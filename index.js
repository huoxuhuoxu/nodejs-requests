/** 
 * @description 
 *      提供 请求方法
 * 
 */

// requests
const http = require("http");
const https = require("https");
const url = require("url");
const assert = require("assert");

const timeout = 10000;

/**
 * @description
 *      get 方式发起请求
 * 
 * @param {*} protocol          协议, .eg: http, https
 * @param {*} url               完整的请求地址
 * @param {*} callback          成功后的回调函数
 * 
 * @return Promise
 */
const get = (protocol, url, callback) => {
    return new Promise((resolve, reject) => {
        protocol.get(url, callback.bind(null, resolve, reject))
                .on("error", (e) => {
                    reject(e);
                });
    });
};



/**
 * @description 
 *      post 方式发起请求
 * 
 * @param {*} protocol 
 * @param {*} options           请求头信息
 * @param {*} data              需要发送的数据（请求体）
 * @param {*} callback          
 * 
 * @return Promise
 */
const post = (protocol, options, data, callback) => {
    return new Promise((resolve, reject) => {
        const req = protocol.request(options, callback.bind(null, resolve, reject));
        req.on("error", (e) => { reject(e); });
        req.write(data);
        req.end();
    }); 
};



/**
 * @description
 *      根据参数生成 请求头与请求体     
 * 
 * @param {*} url_info              URL对象
 * @param {*} body                  数据
 * @param {*} method                发请请求的方式, .eg: post, put, delete, option, ...
 * @param {*} headers               请求头对象
 * 
 * @return [ 请求头, 请求体 ]
 */
const getOptions = (url_info, body, method, headers) => {

    if (!headers["Content-Type"]){
        headers["Content-Type"] = "application/json";     
    }

    const postData = JSON.stringify(body);
    const options = {
        hostname: url_info.hostname,
        port: url_info.port,
        path: url_info.path,
        method,
        headers: Object.assign({}, headers, {
            "Content-Length": Buffer.byteLength(postData)
        })
    };
    return [ options,  postData];
};



/**
 * @description
 *      处理返回的数据
 * 
 * @param {*} response_handle   对返回结果的处理对象
 * @param {*} resolve           Promise.resolve
 * @param {*} reject            Promise.reject
 * @param {*} res               response object
 * 
 * @return undefined
 */
const callback = async (response_handle, resolve, reject, res) => {

    const { statusCode } = res;
    const contentType = res.headers["content-type"];
    const test_ct = response_handle["Content-Type"] || "";

    let error;
    if (statusCode !== 200){
        error = new Error("请求失败\n" + `状态码: ${statusCode}`);
    } else if ( ! (new RegExp(test_ct).test(contentType)) ){
        error = new Error("无效 content-type\n" + `期望: ${test_ct}, 实际获取: ${contentType}`);
    }

    if (error){
        res.resume();
        reject(error);
        return ;
    }

    const chunks = [];
    res.setEncoding("utf8");
    res.on("data", chunk => {
        if (chunk !== null){
            chunks.push(chunk);
        }
    });
    res.on("end", async () => {
        const { handle } = response_handle;
        let data = chunks.join("");
        if (handle && typeof handle === "function") data = await handle(data, res);
        resolve(data);
    });
    
};



/**
 * @description
 *      同一处理 协议, 发起请求的方法等
 * 
 * @param {*} real_url          完整的URL
 * @param {*} body              数据
 * @param {*} method            方法
 * @param {*} headers           请求头: 用于发起请求时设定请求头
 * @param {*} response_handle   对返回数据的处理与验证
 *  
 *  
 * @desc
 *      调用时只传了real_url, 直接执行 http(s).get(real_url)
 * 
 * 
 * @return Promise
 */

module.exports = (real_url, body = {}, method = "GET",
    headers = {
        "Content-Type": ""
    },
    response_handle = {
        timeout,
        "Content-Type": "",
        "handle": (data, res) => data
    }
) => {

    assert(real_url, "request arguments");

    const url_info = url.parse(real_url);
    assert(/https?:/.test(url_info.protocol), "origin-format error, can only be http, https");

    let protocol = http;
    /^https/.test(url_info.protocol) && (protocol = https);

    const cb = callback.bind(null, response_handle);

    return new Promise(async (resolve, reject) => {

        let timer = setTimeout(() => {
            clearTimeout(timer);
            timer = null;
            reject("request timeout");
        }, response_handle.timeout || timeout);

        if (method.toLowerCase() === "get") {

            if (JSON.stringify(body) === "{}" || !body){
                return resolve(await get(protocol, real_url, cb));
            } 
    
            let search = "";
            for (let [k, v] of Object.entries(body)){
                search += `&${k}=${v}`;
            }
            return resolve(await get(protocol, `${url_info.protocol}//${url_info.host}${url_info.pathname}?${search.substr(1)}`, cb));
        
        }
    
        const [ options, data ] = getOptions(url_info, body, method, headers);
        return resolve(await post(protocol, options, data, cb));
    });

}; 


