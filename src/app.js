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



//routes declaration
app.use("/api/v1/users",userRouter);  // iss pe userrouter pe jayega  // ye prefix hai 

// url : http://localhost:8000/api/v1/users/register


export {app}