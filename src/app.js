import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();
app.on("error",(error)=>{
    console.log("error in app :", error);
    throw error;
})

// configuration 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"20kb"}));
app.use(express.urlencoded({extended:true, limit:"20kb"}));
app.use(express.static("public"));
app.use(cookieParser());


// routes yahi pe import

import userRouter from './routes/user.routes.js';
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.route.js";

//routes declaration
app.use("/api/v1/users",userRouter);  // iss pe user router pe jayega  // ye prefix hai 

// url : http://localhost:8000/api/v1/users/register

app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("api/v1/subscriptions",subscriptionRouter);


export {app}