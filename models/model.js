var mongoose = require('mongoose');

// User Schema
var ShareRing = mongoose.Schema({
	bnbAddress: {
		type: String,
	},
	ethAddress: {
		type: String
	},
	amount: {
		type: Number
    },
    state: {
        type:String,
        default:'pending'
    },
    txhash: {
        type:String
    },
    updateTime: {
        type: Date
    }
	
});

var ShareRing = module.exports = mongoose.model('ShareRing', ShareRing);


