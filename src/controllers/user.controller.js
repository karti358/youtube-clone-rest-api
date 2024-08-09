import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js";
import {uploadToCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";

const registerUser = asyncHandler(async (req,res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullname, email, username, password} = req.body
    if (
        [fullname, email, username, password].some((item) => item?.trim() === "")
    ) {
        throw new ApiError(400, "Please provide all details.")
    }

    if (! req.files) {
        throw new ApiError(400, "Provide avatar atleast.")
    }

    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if (existingUser) {
        throw new ApiError(409, "User already exists.")
    }


    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (! avatarLocalPath ) {
        throw new ApiError(400, "Please provide avatar image")
    }

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    const avatarRemoteURL = await uploadToCloudinary(avatarLocalPath)
    const coverImageRemoteURL = await uploadToCloudinary(coverImageLocalPath)

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatarRemoteURL.secure_url,
        coverImage: coverImageRemoteURL?.secure_url || "",
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(! createdUser) {
        throw new ApiError(500, "Could not register user properly.")
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered successfully.")
    )
})

const generateAccessAndRefereshTokens = async (userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        return new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
const loginUser = asyncHandler(async (req, res) => {
    //get data from req
    //check if required fields exist
    //check if username exists
    //validate password
    //return refresh token and access token

    const {email, username, password} = req.body
    if (! username && ! email) {
        throw new ApiError(400, `Missing username and email Data. Atleast one required...`)
    }

    
    const user = await User.findOne({
        $or: [{username}, {email}]
    }).select(
        //"-avatar -coverImage -watchHistory -createdAt -updatedAt -__v -_id"
        "username fullname email password"
    )
    if (! user) {
        throw new ApiError(400, "User does not exist.")
    } 
    if (! await user.isPasswordCorrect(password) ) {
        throw new ApiError(400, "Invalid credentials.")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
    // console.log(user._id, accessToken, refreshToken)
    const loggedInUser = await User.findById(user._id).select("username fullname email -_id")
    // console.log(loggedInUser)
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, 
                accessToken, 
                refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out.")
    )
})

export {registerUser, loginUser, logoutUser};