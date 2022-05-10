import express from "express";
const app = express();
import mongoose from "mongoose";
import bodyParser from "body-parser";

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res)
{
    res.send("express is working!");
});
// app post


app.listen(3000, function() 
{
    console.log("Server is running on 3000");
});