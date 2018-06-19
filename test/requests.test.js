/**
 * @description
 *      测试 ..
 * 
 */

const assert = require("assert");
const requests = require("../index");
const service = require("../app/service");


describe ("测试requests - get", () => {

    it ("默认测试", (done) => {
        (async () => {
            const url = service.get("get/common_test");
            let ret = await requests(url);
            ret = JSON.parse(ret);
            assert(ret.errcode === 0, "content error");
            done();
        })();
    });

    it ("返回类型设定 application/json", (done) => {
        (async () => {
            const url = service.get("get/common_test");
            let ret = await requests(url, null, "GET", null, {
                "Content-Type": "application/json"
            });
            ret = JSON.parse(ret);
            assert(ret.errcode === 0, "content error");
            done();
        })();
    });

    it ("返回类型设定 text/plain", (done) => {
        (async () => {
            const url = service.get("get/text_test");
            let ret = await requests(`${url}`, null, "GET", null, {
                "Content-Type": "text/plain"
            });
            assert(ret === "OK", "content error");
            done();
        })();
    });

    it ("测试 是否能够获取请求的字段", (done) => {
        (async () => {

            const url = service.get("get/column_test");
            let ret = await requests(`${url}`, { test: true }, "GET", null, {
                "Content-Type": "text/plain"
            });
            assert(ret === "true", "content error");

            ret = await requests(`${url}`, { test: false }, "GET", null, {
                "Content-Type": "text/plain"
            });
            assert(ret === "false", "content error");

            ret = await requests(`${url}?test=true`, null, "GET", null, {
                "Content-Type": "text/plain"
            });
            assert(ret === "true", "content error");

            done();

        })();
    });

});


describe ("测试requests - post", () => {

    it ("默认测试", (done) => {
        (async () => {
            const url = service.get("post/common_test");
            let ret = await requests(url, {}, "POST");
            ret = JSON.parse(ret);
            assert(ret.errcode === 0, "content error");
            done();
        })();
    });

    it ("rest - PUT 测试", (done) => {
        (async () => {
            const url = service.get("put/common_test");
            let ret = await requests(url, {}, "PUT");
            ret = JSON.parse(ret);
            assert(ret.errcode === 0, "content error");
            done();
        })();
    });

    it ("测试数据返回", (done) => {
        (async () => {
            const url = service.get("post/get_data");
            let ret = await requests(url, { test: true }, "POST", {
                "Content-Type": "application/json"
            });
            ret = JSON.parse(ret);
            assert(ret.errcode === 0 && ret.msg === true, "content error");
            done();
        })();
    });

    it ("获取返回头其他信息", (done) => {
        (async () => {
            const url = service.get("post/get_headers");
            let ret = await requests(url, {}, "POST", undefined, {
                handle: function (data, res){
                    const ret = JSON.parse(data);
                    ret.headers = {
                        "test-column": res.headers["test-column"]
                    };
                    return ret;
                }
            });
            assert(ret.errcode === 0 && ret.headers["test-column"] === "xxxx", "content error");
            done();
        })();
    });

});


describe ("结束", () => {

    it ("测试结束", (done) => {
        done();
        process.exit(0);
    });

});

