const express = require("express");
const cors=require ("cors")
const app = express();
app.use(express.json());
app.use(cors())


const rootRouter = require("./routes/index.js");



app.use("/api/v1", rootRouter);
app.listen(3000,()=>{
    console.log("Server running on port 3000")
});