const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js"); 


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("connected to mongoDB");
})
.catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
};

const initDB = async() => {
    await Listing.deleteMany({});
    await Review.deleteMany({}); 
    initData.data = initData.data.map((obj) => ({
  ...obj,
    owner: new mongoose.Types.ObjectId("652d0081ae547c5d37e56b5f") 
}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();






























