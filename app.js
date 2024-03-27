const express = require("express");

// whenever we send a request to our server and our server is running then we will be able to see like what endpoints be hitted what is the response that we send
// how much time it took all that login information will be available to us
const morgan = require("morgan"); // http request logger middleware for node.js

const rateLimit = require("express-rate-limit");

const helmet = require("helmet");

const mongosanitize = require("express-mongo-sanitize");

const bodyParser = require("body-parser");

const xss = require("xss");

const cors = require("cors");
const routes = require("./routes/index");

const app = express();

app.use(express.urlencoded({
    extended:true
}));

app.use(mongosanitize());

// app.use(xss())


app.use(cors({
    origin:"*",
    methods:["GET","PATCH","POST","DELETE","PUT"],
    credentials:true,
}))

app.use(express.json({limit:"10kb"}));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended:true}));

app.use(helmet())

if(process.env.NODE_ENV ===  "development"){
    app.use(morgan("dev"));
}

const limiter = rateLimit({
    max:3000,
    windowMs:60*60*1000, //In one hour
    message:"Too many request from this IP, Please try again in one hour",
});

app.use("/tawk",limiter);

app.use(routes)

module.exports = app;
