const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const productStore = require('../../db/productStore');

router.use(authMiddleware(['ADMIN'], process.env.JWT_ADMIN_SECRET));

router.get('/', async (req, res) => {
    var products = await productStore.findAll();

    res.status(200).json({
        products: products.map(product => {
            return {
                product_id: product.itemid,
                product_name: product.descr,
                product_barcode: product.barcode,
                quantity: parseInt(product.quantity || 0)
            };
        })
    });
});

router.get('/:barcode', async (req, res) => {
    var barcode = req.params.barcode;

    if (!barcode.match('(^[0-9]{13})+$')) {
        res.status(400).json({
            error_code: 'Bad _request',
            message: 'not a barcode'
        });
    
    } else {
        try {
            const product = await productStore.findByBarcode(barcode);

            if (product) {
                res.status(200).json({
                    product: product
                });
            } else {
                res.status(404).json({ 
                    error_code: 'Not_found',
                    messasge: 'item not found on database'     
                });
            }

        } catch (exception) {
            res.status(500).json({
                error_code: 'internal_error',
                message: 'Internal error'
            });
        }
    }
});

module.exports = router;
