import { asyncHandler } from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { Category } from "../models/category.model.js"
import {ProductSold} from "../models/productSold.model.js"
import {Product} from "../models/product.model.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const listProduct = asyncHandler(async(req,res)=>{
    const { title, description, specifications, quantity, price, categoryName, categoryDescription, categoryParentName } = req.body;
    const sellerId = req.user._id;
    //console.log(categoryName)
    if(!title || !description || !specifications || !quantity || !price || !categoryName || !categoryDescription){
        throw new ApiError(400, "Details are Missing")
    }

    let category = await Category.findOne({ name: categoryName });

    // If category does not exist, create a new one
    if (!category) {
        const newCategory = new Category({
            name: categoryName,
            description: categoryDescription,
            parent: await Category.findOne({ name: categoryParentName }) || null // Parent category can be optional
        });

        category = await newCategory.save();
    }

    const file = req.files?.image ? req.files.image[0] : null;

    if(!file)
    {
        throw new ApiError(400,"Image Missing")
    }
    
    const localPath = file?.path

    const imageUrl = await uploadOnCloudinary(localPath)

    if (!imageUrl || !imageUrl.url) {
        throw new ApiError(500, "Failed to upload image to Cloudinary");
    }
    
    const newProduct = await Product.create({
        title,
        description,
        specifications, // assuming it's an array of strings
        quantity,
        owner: sellerId, // The seller who uploaded the product
        category,
        price,
        image: imageUrl.url // Set image URL from Cloudinary
    });

    if(!newProduct){
        throw new ApiError(500,"Product not uploaded")
    }


    return res.status(201).json(new ApiResponse(
        200,
        newProduct,
        "Product Listed"
    ))

})

const getUserProducts = asyncHandler(async(req,res)=>{
    const sellerId = req.user._id; 

    const products = await Product.find({ owner: sellerId });

    return res.status(200)
    .json(new ApiResponse(200,products,"Products Fetched"))

})

const getProductSold = asyncHandler(async(req,res)=>{
    const user = req.user;

    const soldItems = await ProductSold.find({ owner: user._id });

    return res.status(200)
    .json(new ApiResponse(200,soldItems,"ProductSold Fetched"))
})

const getAllProducts = asyncHandler(async(req,res)=>{
    
    const products = await Product.find()
    
    return res.status(200)
    .json(new ApiResponse(200,
        products,
        "All Product Fetched"
    ))
})

const getProductAccToCategory = asyncHandler(async(req,res)=>{
    
    const { categoryName } = req.body;

    if (!categoryName) {
        throw new ApiError(400, "Category name is required");
    }

    const category = await Category.findOne({ name: categoryName });

    // If no category is found, return an error
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Find products that belong to the found category
    const products = await Product.aggregate([
        {
            $match: {
                category: category._id, // Match the products with the found category _id
            },
        },
        {
            $lookup: {
                from: "users", // Join with 'User' collection
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails", // Add owner details to the result
            },
        },
        {
            $unwind: "$ownerDetails", // Flatten the owner details array
        },
        {
            $lookup: {
                from: "categories", // Join with 'Category' collection
                localField: "category",
                foreignField: "_id",
                as: "categoryDetails", // Add category details to the result
            },
        },
        {
            $unwind: "$categoryDetails", // Flatten the category details array
        },
        {
            $project: {
                title: 1,
                description: 1,
                specifications: 1,
                quantity: 1,
                image: 1,
                "ownerDetails.name": 1,
                "ownerDetails.email": 1,
                "categoryDetails.name": 1,
            },
        },
    ]);

    return res.status(200)
    .json(new ApiResponse(
        200,
        products,
        "Category Products fetched"
    ))

})

export {
    getUserProducts,
    getProductSold,
    listProduct,
    getAllProducts,
    getProductAccToCategory
}