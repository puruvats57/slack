const multer = require('multer');
const multerS3 = require('multer-s3-transform');
const aws = require('aws-sdk');
const path = require('path');
require('dotenv').config()

const s3 = new aws.S3({
    region: 'eu-north-1',
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    },
});


// Multer-S3 Configuration (AWS SDK v3)
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'slackchatty',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + path.extname(file.originalname));
        },
    }),
});

const deleteFile = (fileKey) => {
    const params = {
        Bucket: 'slackchatty',
        Key: fileKey,
    };

    s3.deleteObject(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log("successfullly deleted", data);
    });
};

module.exports = {
    upload: upload,
    deleteFile: deleteFile
};