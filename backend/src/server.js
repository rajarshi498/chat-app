import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import path from "path";
import {connectDB} from "./lib/db.js";
import { connect } from "http2";
import {ENV} from "./lib/env.js"
import cookieParser from "cookie-parser";
dotenv.config();
const app=express();
app.use(express.json()); // req.body
app.use(cookieParser());

const PORT = ENV.PORT || 3000;
const __dirname = path.resolve();




app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(ENV.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/build")));
    app.get("*",(_,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
    })
}

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})