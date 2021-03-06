const express = require('express');
const router = express.Router();
const products = require('../models/products-sequelize');
const { ensureAuthenticated, ensurePermissions } = require('./users'); 

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    let categories = await products.categories();
    let keylist = await products.keylist();
    let keyPromises = keylist.map(key => {
      return products.read(key)
    });
    let productlist = await Promise.all(keyPromises);
    
    res.render('product/list', { 
      title: 'Products', 
      productlist: productlist,
      cart: req.session.cart,
      user: req.user ? req.user : undefined,
      categories: categories
    });
  } catch (e) { next(e); }
});

router.get('/view/:key', async (req, res, next) => {
  const product = await products.read(req.params.key);
  res.render('product/view', {
      name: product ? product.name : "",
      productkey: req.params.key,
      user: req.user ? req.user : undefined, 
      product: product,
      cart: req.session.cart
  });
});

router.get('/add', ensureAuthenticated, ensurePermissions, (req, res, next) => {
  try {
      res.render('product/edit', {
          title: "Add a Product",
          docreate: true, productkey: "",
          user: req.user, product: undefined,
          cart: req.session.cart
      });
  } catch (e) { next(e); }
});

router.get('/edit/:key', ensureAuthenticated, ensurePermissions, async (req, res, next) => { 
  try {
      const product = await products.read(req.params.key);
      res.render('product/edit', {
          title: product ? ("Edit " + product.name) : "Add Product",
          docreate: false,
          productkey: req.params.key,
          user: req.user ? req.user : undefined, 
          product: product,
          cart: req.session.cart
      });
  } catch (e) { next(e); }
}); 

router.get('/destroy/:key', ensureAuthenticated, ensurePermissions, async (req, res, next) => { 
  try {
      const product = await products.read(req.params.key);
      res.render('product/destroy', {
          name: product ? `Delete ${product.name}` : "",
          productkey: req.params.key,
          user: req.user ? req.user : undefined, 
          product: product,
          cart: req.session.cart
      });
  } catch (e) { next(e); }
}); 

router.post('/destroy/:key', ensureAuthenticated, ensurePermissions, async (req, res, next) => { 
  try {
    await products.destroy(req.params.key);
    res.redirect('/products')
  } catch (e) { next(e); }
}); 

router.post('/search', (req, res) => {
  const term = req.body.term;
  if (!term) { res.redirect('/products'); }
  res.redirect(`/products/search/${term}`);
}) 

router.get('/search/:term', async (req, res) => {
  try {
    let categories = await products.categories();
    const productlist = await products.search(req.params.term);
    
    res.render('product/list', { 
      title: 'Products', 
      productlist: productlist,
      cart: req.session.cart,
      categories: categories,
      user: req.user ? req.user : undefined
    });
  } catch (e) { next(e); }
});

router.get('/:category', async (req, res, next) => {
  try {
    const categories = await products.categories();
    const productlist = await products.findByCategory(req.params.category);
    res.render('product/list', { 
      title: 'Products', 
      productlist: productlist,
      cart: req.session.cart,
      user: req.user ? req.user : undefined,
      categories: categories
    });
  } catch (e) { next(e); }
});

module.exports = router;