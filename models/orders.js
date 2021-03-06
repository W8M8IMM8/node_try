const mongoose = require('mongoose');
const Joi = require('joi');

const ordersSchema = new mongoose.Schema({
    dateOrder: {
        type: Date,
        default: Date.now
    },
    dateEstimated: {
        type: Date
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    price: {
        type: Number,
        min: 0,
        default: 0
    }
});

const Order = mongoose.model('Order', ordersSchema);

exports.ordersSchema = ordersSchema;
exports.Order = Order;