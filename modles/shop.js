const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: true
    },
    ownerName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    services: {
        type: [String],
        required: true
    },
    description: {
        type: String,
        required: false
    },
    openingHours: {
        type: String,
        required: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
    ,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number]
        }
    }
}, { timestamps: true });

shopSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Shop", shopSchema);
