const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/Listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const { listingSchema , reviewSchema} = require("./schema.js")
const Review = require("./models/review.js")

// Connection setup with mongoose
main()
.then(()=>{
    console.log('Connection successful');
})
.catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Wanderlust');
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    console.log(error);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    console.log(error);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}
// port setup 
app.listen(8080,()=>{
    console.log('server is listening on port 8080');
});


// position of req and res should be same as below otherwise error
app.get("/",(req,res)=>{
    res.send("Working");
})

app.get("/listings",wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

// new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

// show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params; // for this we need to write -
    // - app.use(express.urlencoded({ extended: true }));

    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
    
}));

// create route
// async as we are going to do changes in the database 
app.post("/listings",
    validateListing,
    wrapAsync(async(req,res,next)=>{
    // let listing = req.body.listing; instead-->        
        const newListing = new Listing(req.body.listing);
        // adding into the DB
        await newListing.save();
        res.redirect("/listings");
    
    
}));


// edit route 
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
    
}));

// update route 
app.put("/listings/:id",
    validateListing,
    wrapAsync(async(req,res)=>{
    let{id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));


// delete route 
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let{id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));


// As there is One to Many relationship between listings and reviews so we are using /listings/:id/review
// Reviews post request
app.post("/listings/:id/reviews", 
    validateReview, 
    wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}))













app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})

// middleware 
app.use((err,req,res,next)=>{
    let {status=500, message="Something went wrong!"} = err;
    // throw new ExpressError(status,message);
    // res.status(status).send(message);
    res.status(status).render("error.ejs",{message});
})


// app.get("/testListing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title:"My New Villa",
//         description:"By the Beach",
//         price:5000,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("sample was save");
//     res.send("successful testing");
// })