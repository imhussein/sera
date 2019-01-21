const path = require('path');

module.exports = (file, callback) => {
  // Allowed File Extensions
  const filesTypes = /jpg|jpeg|png|gif/;
  // Check For Extension
  const extname = filesTypes.test(path.extname(file.originalname).toLowerCase());
  // Check For MimeType
  const mimetype = filesTypes.test(file.mimetype);
  if(extname && mimetype){
    return callback(null, true);
  } else {
    callback('Please Only Upload Images!!!');
  }
}