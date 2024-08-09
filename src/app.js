import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    limit: "16kb"
}));
app.use(express.json());
app.use(urlencoded({
    extended: true,
    limit: "16kb"
}));
app.use(express.static("public"))
app.use(cookieParser());

//router imports
import { router as userRouter} from "./routes/user.route.js";

//router declarations
app.use("/api/v1/user", userRouter)


export default app;
