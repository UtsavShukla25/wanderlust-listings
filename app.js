if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flask = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");  // ✔ correct

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;  // ✅ FIXED
console.log("DB URL:", dbUrl);
console.log("Cloud Name:", process.env.CLOUD_NAME);
console.log("Cloud Key:", process.env.CLOUD_API_KEY); //2lineuper

main()
.then(()=>{
    console.log("connected to mongoDB");
})
.catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     crypto:{
//       secret:"mysupersecretcode"
//     },touchAfter: 24*60*60,
// });

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: process.env.SECRET,   // 🔥 IMPORTANT
    touchAfter: 24 * 60 * 60,
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR:", err);
});

store.on("error",() =>{
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7,
        httpOnly:true,
    },
};

// app.get("/", (req, res) => {
//     res.send("Hello, i am root");
// });


app.use(session(sessionOptions));
app.use(flask());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currUser = req.user;  // ✅ VERY IMPORTANT
    next();
});

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/test", (req,res)=>{
    res.send("working");
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter);

app.use((req, res, next) => {
    res.locals.currUser = req.user;   
    next();
});

app.all("/listings/:id", (req,res,next) => {
    next(new ExpressError(404,"page not found!"));
});

// app.use((err,req,res,next) => {
//     let{statusCode=500,message="something went wrong!" } = err;
//     res.status(statusCode).render("error.ejs",{message});
// //  res.status(statusCode).send(message);
// });

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);   // 🔥 VERY IMPORTANT
    }

        console.error("ERROR =>", err);

    let { statusCode = 500, message = "something went wrong!" } = err;

    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");

});
