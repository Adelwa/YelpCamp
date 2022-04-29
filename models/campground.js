const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;  //a short way to refernce to object

const ImageSchema = new Schema({
    url: String,
    filename: String       //we save the file name bc it is simple in cloudinary to get to element by file name in case of deletion 
});

/** we use virtual bc we do not want to save it in database, we already had url in our DB */

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = {toJSON: {virtuals: true}};

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],  //enum declare our options, EX: type can be just Point
            required: true
        },
        coordinates: {             //[longitude, latitude]
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href= "/campgrounds/${this._id}">${this.title}</a></strong>`;
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    console.log(doc);
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);