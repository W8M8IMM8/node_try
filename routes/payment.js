const { Payment } = require('../models/payments');
const { User } = require('../models/users');
const { Order } = require('../models/orders'); 
const { Basket } = require('../models/baskets'); 
const { Address } = require('../models/addresses');
const { Product } = require('../models/products');
const { Category } = require('../models/categories');
const config = require('config');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

router.get('/managePayment/:token', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    const payment = await Payment.find({ customer: decoded._id });

    res.render('managePayments', { token:token, payments: payment, count: 0 });
});

router.post('/editPayment/:token', async (req, res) => {
    const token = req.params.token;

    const payment = await Payment.findById(req.body.checkPayment);
    res.render('editPayment', { token: token, payment: payment });
});

router.post('/updatePayment/:token/:idPayment', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    const idPayment = req.params.idPayment;

    await Payment.findByIdAndUpdate(idPayment, {
        cardHolder: req.body.txtCardHolder,
        cardNumber: req.body.txtCardNumber,
        monthExpired: req.body.txtMonthExpired,
        yearExpired: req.body.txtYearExpired,
    }, { new: true });
    const payments = await Payment.find({ customer: decoded._id }); 

    res.render('managePayments', { token: token, payments: payments, count: 0 });
});

router.post('/deletePayment/:token/:idPayment', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    const idPayment = req.params.idPayment;

    await Payment.findByIdAndRemove(idPayment);
    const payments = await Payment.find({ customer: decoded._id });

    res.render('managePayments', { token: token, payments: payments, count: 0 });
});

router.post('/confirmPayment/:token', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    const products = await Product.find();
    const categories = await Category.find();

    let basket = await Basket.findOne({ customer: decoded._id }).populate('products');
    const user = await User.findById(decoded._id);

    let order = new Order({
        customer: decoded._id,
        price: basket.price,
        dateOrder: new Date(),
        dateEstimated: moment(new Date(), "DD-MM-YYYY").add(4, 'days'),
        products: basket.products
    });
    await order.save();

    basket.price = 0;
    basket.products = [];
    basket.count = 0;
    await basket.save();

    res.render('products', { token: token, user: user, categories: categories, products: products, basket: basket, count: 0 })
});

router.post('/pay/:token', async (req, res) => {
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    const basket = await Basket.findOne({ customer: decoded._id }).populate('products');
    const addresses = await Address.find({ customer: decoded._id });
    const payments = await Payment.find({ customer: decoded._id });


    res.render('pay', {token: token, basket: basket, addresses: addresses, payments: payments});
})

module.exports = router;