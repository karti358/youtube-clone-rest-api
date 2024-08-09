import multer from "multer";
import {v4} from "uuid";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, `${v4()}${path.extname(file.originalname)}`)
    }
})

export const upload = multer({
    storage
});