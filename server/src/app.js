import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app =express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "20kb"}))
app.use(express.urlencoded({extended: true, limit: "20kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import

import userRouter from "./routes/user.routes.js"
import productRouter from "./routes/product.route.js"
import productSold from "./routes/productSold.route.js"
import cart from "./routes/cart.route.js"

//routes declaration
app.use("/api/v1/users", userRouter)

app.use("/api/v1/products", productRouter)

app.use("/api/v1/productSold",productSold)

app.use("/api/v1/cart",cart)


export { app }