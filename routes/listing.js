const express = require ("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn,isOwner,validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upoload = multer({storage});


router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upoload.single('listing[image]'),validateListing, wrapAsync(listingController.createListing)
);


//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);


router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner, upoload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);


//edit route
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

module.exports = router;


