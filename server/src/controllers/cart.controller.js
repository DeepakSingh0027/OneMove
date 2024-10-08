import { asyncHandler } from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {Cart} from "../models/cart.model.js"
import {Product} from "../models/product.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const addToCart = asyncHandler(async(req,res)=>{
    const {productID, quantity} = req.body

    if(!productID || !quantity)
    {
        throw new ApiError(400, "fields missing")
    }

    const currentProduct = await Product.findById(productID);

    if (!currentProduct) {
        throw new ApiError(404, "Product not found");
    }

    // Check if the product has enough stock
    if (currentProduct.quantity < quantity) {
        throw new ApiError(400, "Insufficient product stock");
    }

    const listCart = await Cart.create({
        product: currentProduct._id,
        owner: req.user._id,
        quantity
    })

    if(!listCart)
    {
        throw new ApiError(500, "Cart listing failed");
    }

    return res.status(201).json(new ApiResponse(
        201,
        listCart,
        "Cart Updated"
    ));


})

const getCartDetails = asyncHandler(async(req,res)=>{
    const cartDetails = await Cart.find({
        owner: req.user._id
    })

    return res.status(200)
    .json(new ApiResponse(
        200,
        cartDetails,
        "Cart Details Fetched"
    ))

})


export {
    addToCart,
    getCartDetails
}