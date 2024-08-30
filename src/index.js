// require ('dotenv').config({path: './env'});
// we can write this also 

import dotenv from "dotenv"

dotenv.config({
  path:'./.env'
})

import connectDB from "./db/index.js";
import { app } from "./app.js";


connectDB() // return promise as it is async
.then(()=>{
  app.listen(process.env.PORT || 3000 ,()=>{
    console.log(`server is runinng at port :${process.env.PORT}`)
  })
})
.catch((err)=>{
  console.error("mongodb failed conection !!! " ,err);
})







/*

//  we can also add db like this but we can connetct in separate

import { DB_NAME } from './constants'
import mongoose from 'mongoose'

import express from 'express'
const app = express()
(async ()=>{
    try {
      await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

      //after db connect listener on app
      app.on("error",(error)=>{
        console.log("ERROR :",error);
        throw error;
      })

      app.listen(process.env.PORT,()=>{
        console.log(`app is listening on port ${process.env.PORT}`)
      })

    } catch (error) {
        console.error("error ",error)
        throw error;
    }
})()

*/