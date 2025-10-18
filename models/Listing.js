const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        filename: { type: String },
        url: { type: String }
    },
    price:{
        type:Number,
    },
    location: {
        type: String,
    },
    country: {
        type: String,
    },
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"Review"
    }]
});



// Model creation
const Listing = mongoose.model("Listing",listingSchema);
// exporting model
module.exports = Listing;