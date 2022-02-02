function addToCart(products) {
    axios.get(`/add-to-cart/${products}`)
    .then((response) =>{
        if(response.data.status)
        {
            let productCount = document.querySelector(".cart").innerHTML
            productCount = parseInt(productCount) + 1
            document.querySelector(".cart").innerHTML = productCount
        }
    })
}

function changeQuantity (cartId, prodId, userId, itemCount) {   
    let quantity = parseInt(document.getElementById(prodId).innerHTML)
    itemCount= parseInt(itemCount)
    axios({
        method: 'post',
        url: '/update-quantity/',
        data: {
            user: userId,
            cart: cartId,
            product: prodId,
            quantity: quantity,
            itemCount: itemCount
        }
      })
    .then((response) =>{

        if(response.data.emptyCart)
        {
            document.getElementById('buy').style.visibility = 'hidden'
            alert("Your Cart is empty")
            location.reload()
        }else if(response.data.removeProduct)
        {
            alert("This item is being removed from your Cart")
            location.reload()
        }else{
            document.getElementById(prodId).innerHTML = quantity + itemCount
            document.getElementById('total').innerHTML = response.data.total
        }
    })
}

function placeOrder() {
    var userResponse = confirm("Continue to place your Order?")
	if (userResponse){
		
        alert("Your Order has been placed, pl make the payment to our Delivery Executive")
		
    }else{
		
        alert("Go back and Enjoy your Shopping!")
	}
}