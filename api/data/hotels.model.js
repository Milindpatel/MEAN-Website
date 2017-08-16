var mongoose = require('mongoose');

var hotelSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    stars :{
        type: Number,
        min : 0,
        max : 5,
        default : 0
    },
    services : [String],
    description : String,
    photos : [String],
    currency : String 
});

mongoose.model('Hotel', hotelSchema,'hotels');//if you dont want to define database collection then it will be okay bcz it will directly search out hotel database collection from that name in this case which is "Hotel" which is define first in this line