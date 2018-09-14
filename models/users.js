const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minlength: 4,
        maxlength: 255,
        required: true
    },
    lastName: {
        type: String,
        minlength: 4,
        maxlength: 255,
        required: true
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        requied: true,
        minlength: 5,
        maxlength: 1024
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('User', userSchema);



function validateUser(user){
    const schema = {
        txtFirstName: Joi.string().min(4).max(255).required(),
        txtLastName: Joi.string().min(4).max(255).required(),
        txtEmail: Joi.string().min(5).max(255).required().email(),
        txtPassword: Joi.string().min(5).max(255).required(),
        txtConfirmPassword: Joi.string().min(5).max(255).required(),
    }
    return Joi.validate(user, schema);
}


exports.User = User;
exports.validateUser = validateUser;