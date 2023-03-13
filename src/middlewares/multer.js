import multer from "multer";

function imageFilter(req, file, cb) {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = "Only image files are allowed";
    return cb(null, false);
  }
  cb(null, true);
}

export const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: imageFilter,
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});
