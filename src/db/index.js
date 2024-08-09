import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const DATABASE_URI = process.env.DATABASE_URI
const connectDB = async ( ) => {
    try {
        const connectionInstance = mongoose.connect(
            `${DATABASE_URI}/${DB_NAME}`
        );
        console.log(`Database Connected...| Host ${connectionInstance}`);
    } catch (err) {
        console.log(`Database Connection failed...`);
        process.exit(1);
    }
}

export default connectDB;