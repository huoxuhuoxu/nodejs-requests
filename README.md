#### Node.js Requests库

##### Install
---
    npm install nodejs-requests --save


##### Params
----
- url
    - 必填, 完整的请求地址
    <br />
- data
    - 选填, 数据 .eg: { ... }
    <br />
- method
    - 选填, 方式 .eg: get、post、put...
    <br />
- request - headers
    - 选填, 发起请求的请求头
    - 默认 { "Content-Type": "application/json" }
    <br />
- handler - response data
    - 选填, 接收完响应后的处理
    - 目前包含字段: "Content-Type"、"handle"
        - "Content-Type" 检查响应内容的格式是否符合发起方要求
            - 默认 "", 任何格式都允许通过检查
        - "handle" requests执行完成后只返回响应体结果, 此字段接收一个函数, 增强处理响应头的功能
            - 默认 (data, res) => data
            


##### Download Page
----

    const requests = require("nodejs-requests");

    (async () => {
        const ret = await requests("https://xxx.com/xxx.html");
    })();

##### Request Data
----
    get:             await requests(url);
    post、put、...:  await requests("https://xxx.com/xxx", { page: 1 }, "POST");


##### Advanced Usage
----
    await requests(url, {}, "POST", {
        "Content-Type": "application/x-www-form-urlencoded"
    }, {
        "Content-Type": "application/json",
        "handle": async function (data, res){
            console.log(res.headers);
            await new Promise(resolve => {
                setTimeout(resolve, 1000);
            });
            return data;
        }
    });



