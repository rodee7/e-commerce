var express = require('express');
var router = express.Router();
var productSupport = require('../support/product-support')
const fs = require('fs')
/* GET users listing. */
router.get('/admin', function(req, res, next) {
  productSupport.getAllProducts().then((products) => {
  res.render('admin/view-products', {admin:true, products})  
  })
})

router.get('/admin/add-product', function(req, res){
res.render('admin/add-product', {admin:true})  
})

router.post('/admin/add-product', (req,res) => {
  productSupport.addProduct(req.body, (id) => {
    
    if(req.files != null)
    {
      let image = req.files.image
    
      image.mv(`./public/product-images/${id}.jpg`, (err) =>{
        if(!err)
          res.render('admin/add-product', {admin:true})
        else
          res.render(err)  
      })
    }
  })
})

router.get('/admin/edit-product/:id', async(req, res) => {
  let product = await productSupport.getProductDetails(req.params.id)
  res.render('admin/edit-product', {product})
})

router.get('/admin/delete-product/:id', (req, res) => {
  let prodId = req.params.id
  productSupport.deleteProduct(prodId).then((response) => {
  const path = `./public/product-images/${prodId}.jpg`    
  fs.unlink(path, (err) => {
  if (err) {
    console.error(err)
    return
  }
  })
    res.redirect('/admin')
  })
})

router.post('/admin/edit-product/:id', async (req, res) => {
  let id = req.params.id
  await productSupport.updateProduct(req.params.id, req.body).then( () =>{
    if(req.files != null)
    {
      let image = req.files.image
      image.mv(`./public/product-images/${id}.jpg`)      
    }
    res.redirect('/admin')
  })
})

module.exports = router
