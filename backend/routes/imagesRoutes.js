const express = require('express');
const router = express.Router();
const upload = require('../utils/configs/multer-config');
const imagesControllers = require('../controllers/imagesControllers');
const isAuthorized = require('../utils/middlewares/isAuthorized');

// Upload post image + generate imageId (uuid) from front end
router.post("/", upload.single('image'), imagesControllers.uploadPostImage);

// Link existing image + generate imageId (uuid) from front end 
router.post("/existing", imagesControllers.uploadExistingImage);    

// Delete post images - take query array of publicId to delete from cloud + db
router.delete("/", imagesControllers.deletePostImages);

// Upload + Update profile photo url and public id for themselves
router.put("/profile-picture", upload.single('image'), imagesControllers.uploadProfilePicture);

// Endpoint for sender user to upload images for socket
router.post("/:id/socket/upload", isAuthorized("user"), upload.single('socketImage'), imagesControllers.uploadSocketImage); 

module.exports = router;