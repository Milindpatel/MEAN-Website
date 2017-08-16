var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    rating : {
        type : Number,
        min : 0,
        max : 5,
        required : true
    },
    review : {
        type : String,
        required : true
    },
    createdOn : {
        type : Date,
        "default" : Date.now
    }
});

var roomSchema = new mongoose.Schema({
    typpe : String,
    number : Number,
    description : String,
    photos : [String],
    price : Number
});

var hotelSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    stars :{
        type: Number,
        min : 0,
        max : 5,
        "default" : 0
    },
    services : [String],
    description : String,
    photos : [String],
    currency : String,
    reviews : [reviewSchema],
    rooms : [roomSchema],
    location : {
        address : String,
        // Always store coordinate longitude(E/W), latitude (N/S) order
        coordinates :{ 
            type  : [Number],
            index : '2dsphere'
        }
    } 
});

mongoose.model('Hotel', hotelSchema,'hotels');//if you dont want to define database collection then it will be okay bcz it will directly search out hotel database collection from that name in this case which is "Hotel" which is define first in this line