const express = require('express')
const cartRouter = express.Router({ mergeParams:true });

const {
    getCartByUser,
    checkoutCart,
} = require('../db/cart')

const {
  removeItemFromOrderByOrderId
} = require('../db/orderItems');

let cartOrderID

// GET /api/users/userId/cart
// GETS AND RETURNS CART BY USER ID
cartRouter.get('/', async (req, res, next) => {
  const {userId} = req.params
    try {

        const cart = await getCartByUser(userId);
        console.log(cart)
        if(cart === undefined || cart.length <= 0 || cart.length === undefined){
          return
        }


            console.log('your cart is', cart)
  
            cartOrderID = cart[0].orderId
            // sends an array of orderItem objects
            res.send ({cart})
        
        
    } catch(err) {
        console.error('Error while getting cart by user', err);
        throw err;
    }
})

// PATCH /api/users/userId/cart
// SETS CART OF USER ID TO FULLFILLED
cartRouter.patch('/', async (req, res, next) => {
  const {userId} = req.params
  try{
    const cart = await checkoutCart(userId);
    res.send({cart});
  }catch(err){
    console.log('Error during cart checkout of user id: ', req.params.id, err);
    next(err);
  }
})

cartRouter.delete('/', async (req, res, next) => {
  const userIdString = req.params
  const userID = parseInt(userIdString.userId)
  const productIdString = req.body
  const productID = productIdString.productId

  console.log('in route user id is: ', userID)
  console.log('in route product id is: ', productID)
  console.log('in route cart order id is: ', cartOrderID)

  try{
    
    const item = await removeItemFromOrderByOrderId(cartOrderID, productID)
    res.send(item)

  }catch(err){
    throw err
  }
})

module.exports = cartRouter;