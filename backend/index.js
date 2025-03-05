const express = require("express");


const rootRouter = require("./routes/index.js");

const app = express();

app.use("/api/v1", rootRouter);