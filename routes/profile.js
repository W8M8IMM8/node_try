const express = require('express');
const router = express.Router();
const { User } = require('../models/users');
const { Address, validateAddress } = require('../models/addresses');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

router.get('/:token', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey')); 

    const user = await User.findById(decoded._id).select({ password: 0, isAdmin: 0});

    res.render('profile', { user: user, token: token });
});

router.get('/changeName/:token', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    const user = await User.findById(decoded._id).select({ isAdmin: 0, password: 0 });

    res.render('profileChangeName', { user: user, token: token });
});

router.get('/changeEmail/:token', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    const user = await User.findById(decoded._id).select({ isAdmin: 0, password: 0})

    res.render('profileChangeEmail', { user: user, token: token });
});

router.get('/changePassword/:token', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    const user = await User.findById(decoded._id).select({ isAdmin: 0, password: 0});
    res.render('profileChangePassword', { user: user, token: token });
});

/*router.get('/changeAddress/:token', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    const address = await Address.find({ customer: decoded._id });
    //const address = await Address.findOne({ customer: decoded._id });
    const user = await User.findOne({ _id: address.customer }).select({ password: 0, isAdmin: 0});

    
    //res.render('profileChangeAddress', { address: address, user: user, token: token });
    res.render('manageAddresses', { address: address, user: user, token: token });
});*/


router.get('/changeAddress/:token', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    const address = await Address.find({ customer: decoded._id });
    //const address = await Address.findOne({ customer: decoded._id });
    const user = await User.findOne({ _id: address.customer }).select({ password: 0, isAdmin: 0});

    
    //res.render('profileChangeAddress', { address: address, user: user, token: token });
    res.render('manageAddresses', { address: address, user: user, token: token });
});

router.get('/changeAddress/pick/:token/:id', async (req, res) => {
    const token = req.params.token;
    const id = req.params.id;

    const address = await Address.findOne({ _id: id });
    
    res.render('profileChangeAddress', { address: address, token: token });

});


router.post('/changeName/:token', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    let err = "";

    if(typeof req.body.txtFirstName !== "string" || req.body.txtFirstName.length < 2) {
        err = "First name error";
        let user = await User.findById(decoded._id).select({ isAdmin: 0, password: 0 });
        return res.render('profileChangeName', { err: err, token: token, user: user });
    }

    if(typeof req.body.txtLastName !== "string" || req.body.txtLastName.length < 2) {
        err = "Last name error";
        let user = await User.findById(decoded._id).select({ isAdmin: 0, password: 0 });
        return res.render('profileChangeName', { err: err, token: token, user: user });
    }

    const user = await User.findOneAndUpdate({ _id: decoded._id }, { firstName: req.body.txtFirstName, lastName: req.body.txtLastName }, { new: true });
    
    res.render('profile', { user: user, token: token });
});

router.post('/changeEmail/:token', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    let err = "";

    const user = await User.findById(decoded._id);

    if(req.body.txtNewEmail !== req.body.txtConfirmNewEmail) { 
        err = "Email no match";
        return res.render('profileChangeEmail', { token: token, err: err, user: user })
    }

    if(typeof req.body.txtNewEmail !== "string" || req.body.txtNewEmail.length < 6) {
        err = "Email few characters";
        return res.render('profileChangeEmail', { token: token, err: err, user: user});
    }

    const validPassword = await bcrypt.compare(req.body.txtPassword, user.password);
    if(!validPassword){
        err = "Email wrong password"
        return res.render('profileChangeEmail', { token: token, err: err, user: user});
    }

    user.email = req.body.txtNewEmail;
    await user.save();

    res.render('profile', { user: user, token: token });
});

router.post('/changePassword/:token', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    const hash = await bcrypt.genSalt(10);
    let err = "";

    if(req.body.txtPassword !== req.body.txtConfirmPassword) {
        err = "Password no match";
        return res.render('profileChangePassword', { token: token, err: err });
    }
    if(req.body.txtPassword.length < 6) {
        err = "Password too short";
        return res.render('profileChangePassword', { token: token, err: err });
    }

    const user = await User.findById(decoded._id);    
    const validPassword = await bcrypt.compare(req.body.txtOldPassword, user.password);
    if(!validPassword) {
        err = "Wrong current password";
        return res.render('profileChangePassword', { token: token, err: err });
    }
    user.password = await bcrypt.hash(req.body.txtPassword, hash);
    await user.save();

    res.render('profile', { user: user, token: token});
});

router.post('/changeAddress/:token/:id', async (req, res) => {
    const token = req.params.token;
    const id = req.params.id;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    let err = "";

    const { error } = validateAddress(req.body);
    if(error) {
        err = error.details[0].context.label;
        let address = await Address.findOne({ _id: id });
        return res.render("profileChangeAddress", { token: token, err: err, address: address });
    }

    let address = await Address.findOneAndUpdate({ customer: decoded._id, _id: id }, {
        name: req.body.txtName,
        street: req.body.txtStreet,
        city: req.body.txtCity,
        ZipCode: req.body.txtZipCode,
        PhoneNumber: req.body.txtPhoneNumber
    }, { new: true });
    
    //const user = await User.findById(address.customer);
    //res.render('profile', { user: user, token: token });
    address = await Address.find({ customer: decoded._id });

    res.render('manageAddresses', { address: address, token: token });
});


module.exports = router;