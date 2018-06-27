/**
 * @description
 *      启动测试服务器
 * 
 */

const Koa = require("koa");
const Router = require('koa-router');
const bodyParser = require("koa-bodyparser");

const app = new Koa();
const router = new Router();

app.use(bodyParser());

router.get("/get/timeout_test", async ctx => {
    await new Promise(resolve => {
        setTimeout(resolve, 20000);
    });
    ctx.body = "OK";
});
router.get("/get/timeout_test2", async ctx => {
    await new Promise(resolve => {
        setTimeout(resolve, 500);
    });
    ctx.body = "OK";
});


router.get("/get/common_test", ctx => {
    ctx.body = { errcode: 0, msg: "OK" };
});

router.get("/get/text_test", ctx => {
    ctx.body = "OK";
});

router.get("/get/column_test", ctx => {
    if (ctx.query.test === "true"){
        ctx.body = "true";
    } else {
        ctx.body = "false";
    }
});


router.post("/post/common_test", ctx => {
    ctx.body = { errcode: 0, msg: "OK" };
});
router.put("/put/common_test", ctx => {
    ctx.body = { errcode: 0, msg: "OK" };
});
router.post("/post/get_data", ctx => {
    const body = ctx.request.body;
    if (body.test === true){
        ctx.body = { errcode: 0, msg:  body.test};
    } else {
        ctx.body = { errcode: 1, msg: "request column error!"};
    }
});

router.post("/post/get_headers", ctx => {
    ctx.set("test-column", "xxxx");
    ctx.body = { errcode: 0, msg: "OK" };
});



app.use(router.routes()).use(router.allowedMethods());


const service = ((app) => {

    const port = Math.ceil(Math.random() * (65535 - 1000 + 1) + 1000);
    app.listen(port, () => {
        console.log(`  listening port: ${port} start ...\r\n`);
    });

    return {
        get: (url) => `http://127.0.0.1:${port}/${url}`
    };
})(app);


module.exports = service;
