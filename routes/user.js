const { response } = require("express");
var express = require("express");
var router = express.Router();
var productSupport = require("../support/product-support");
var userSupport = require("../support/user-support");

const verifyLogin = (req, res, next) => {
   if (req.session.loggedIn) {
    next()
  } else {
    res.redirect("/login");
  }
};
/* GET home page. */
router.get("/", async (req, res, next) => {
  let user = req.session.user;
  let itemsCount = null

  if(req.session.user)
  {
    itemsCount = await userSupport.getItemsCount(req.session.user._id)
  }
  productSupport.getAllProducts().then((products) => {
    res.render("user/view-products", { admin: false, products, user, itemsCount});
  });
});

router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

router.get("/signup", (req, res) => {
  res.render("user/signup");
});

router.post("/signup", (req, res) => {
  userSupport.doSignup(req.body).then((response) => {
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect("/");
  });
});

router.post("/login", (req, res) => {
  userSupport.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.loginErr = "Invalid Username or Password";
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.get('/cart', verifyLogin, async(req, res) => {
  let products = await userSupport.getCartProducts(req.session.user._id)
  let itemsCount = await userSupport.getItemsCount(req.session.user._id)
  let totalAmount = await userSupport.getTotal(req.session.user._id)
  let emptyCart = false
  console.log(totalAmount);
  if(totalAmount === 0)
  {
    emptyCart = true
  }
  res.render('user/cart', {products, user: req.session.user, itemsCount, totalAmount, emptyCart})
});

router.get('/add-to-cart/:id', verifyLogin, (req, res) => {
  userSupport.addToCart(req.params.id, req.session.user._id).then(() => {
   res.json({status: true})
  })
})

router.post('/update-quantity', (req, res, next) => {
  userSupport.updateQuantity(req.body).then(async(response) => {
      response.total = await userSupport.getTotal(req.body.user)
      res.json(response)
  })
})

router.get('/place-order', verifyLogin, (req, res) => {
  res.render('user/place-order')
})

module.exports = router;
 