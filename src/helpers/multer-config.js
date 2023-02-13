import multer from "multer";
import util from "util";
import { v4 as uuid } from "uuid";
// import gc from "../../gcp-config/index";

// const bucket = gc.bucket("kidslikev2_bucket");
const bucket = "bucket";
export const multerMid = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

function imageFilter(req, file, cb) {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = "Only image files are allowed";
    return cb(null, false);
  }
  cb(null, true);
}

export const uploadImage = (file) => {
  if (!file) {
    return null;
  }
  return new Promise((resolve, reject) => {
    const { originalname, buffer } = file;
    const fileName = uuid();
    const blob = bucket.file(originalname.replace(/.*(?=\.)/, fileName));
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
    blobStream
      .on("finish", () => {
        const publicUrl = util.format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
        resolve(publicUrl);
      })
      .on("error", () => {
        reject(`Unable to upload image, something went wrong`);
      })
      .end(buffer);
  });
};
