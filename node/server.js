const prometheusClient = require("prom-client");
const collectDefaultMetrics = prometheusClient.collectDefaultMetrics;

collectDefaultMetrics();  // デフォルトで組み込まれているメトリクスを、デフォルト10秒間隔で取得
// collectDefaultMetrics({ timeout: 5000 });  // デフォルトで組み込まれているメトリクスを、5秒おきに取得

const express = require("express");
const app = express();

let counter = 0;
const callCounter = new prometheusClient.Counter({
                        name: "method_call_counter",
                        help: "counter for method call count",
                        labelNames: ["method", "path"]
                    });
const incRequestSummary = new prometheusClient.Summary({
                        name: "inc_request_summary",
                        help: "summary for inc method call summary",
                    });

app.get("/metrics", (req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(prometheusClient.register.metrics());
});

app.get("/counter/current", (req, res) => {
    callCounter.labels("inc", "/counter/current").inc();
    res.send(`current counter = ${counter}`);
});

app.get("/counter/inc", (req, res) => {
    const end = incRequestSummary.startTimer();
    try {
        counter++;
        callCounter.labels("inc", "/counter/inc").inc();
        res.send(`increment counter = ${counter}`);
    } finally {
        end();
    }
});

app.listen(4000, () => console.log(`[${new Date()}] server startup.`));
