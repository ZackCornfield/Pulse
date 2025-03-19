const imagesQueries = require("../queries/imagesQueries");
const usersQueries = require("../queries/usersQueries");
const cloudinary = require("../utils/configs/cloudinary-config");
const fs = require('fs');

module.exports = { 
    uploadPostImage: async (req, res) => {
        const ownerId = req.user.id;    
        const image = req.file;
        const id = req.body.id;
        console.log("Uploading image with ", req.body, req.file); 

        try {
            const result = await cloudinary.uploader.upload(image.path, {
                resource_type: "auto",
            });

            console.log("Result: " + result);

            imageData = ({
                id,
                ownerId,
                url: result.secure_url, // secure_url is the url to the image on cloudinary
                publicId: result.public_id, // public_id is the unique identifier for the image in cloudinary
            });

            const uploadImage = await imagesQueries.uploadImage(imageData); 
            res.status(200).json({
                message: "Image uploaded successfully",
                uploadImage
            });

            // Remove local file after upload
            fs.unlinkSync(image.path);
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    uploadExistingImage: async (req, res) => {
        const ownerId = req.user.id;
        const url = req.body.url;
        const id = req.body.id;
        console.log("Uploading image with", req.body);

        try {
            imageData = ({
                id,
                ownerId,
                url
            });

            const uploadImage = await imagesQueries.uploadImage(imageData);
            res.status(201).json({
                message: "Image uploaded successfully",
                uploadImage
            });
            fs.unlinkSync(image.path);  
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    deletePostImages: async (req, res) => { 
        const deleteIds = req.query.deleteIds;
        const deletePublicIds = req.query.deletePublicIds || null;

        // Convert coma-seperated query params to array
        const idsArray = deleteIds.split(",");
        const publicIdsArray = deletePublicIds.split(",");

        try {
            // Delete from cloudinary
            if (publicIdsArray && publicIdsArray.length > 0) {
                publicIdsArray.foreach(async (publicId) => {
                    await cloudinary.uploader.destroy(publicId);
                });
            }

            // Delete from database
            if (idsArray && idsArray.length > 0) {
                const deleteImages = await imagesQueries.deleteImagesArray(idsArray);
                res.status(200).json({
                    message: "Images deleted",
                    deleteImages
                });
            }
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    updateUserProfilePicture: async (req, res) => {
        const userId = req.user.id;
        const image = req.file; 
        try {
            // Get current profile picture public id
            const currentId = await usersQueries.getUserProfilePicturePublicId(userId);

            // Upload to cloudinary 
            const result = await cloudinary.uploader.upload(image.path, {
                resource_type: "auto",
            });

            // Update user profile picture
            await usersQueries.updateUserProfilePicture(userId, result.secure_url, result.public_id);

            // Delete old image if exists and is not default
            if (currentId !== process.env.DEFAULT_PROFILE_PICTURE_PUBLIC_ID){
                await cloudinary.uploader.destroy(currentId);
            }

            // Respond with success
            res.status(200).json({
                message: "Profile picture updated",
                profilePictureUrl: result.secure_url,
            });

            fs.unlinkSync(image.path);
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    uploadSocketImage: async (req, res) => {
        const image = req.file; 
        try {
            // Upload new image
            const result = await cloudinary.uploader.upload(image.path, {
                resource_type: "auto",
            });

            fs.unlinkSync(image.path);

            res.status(200).json({
                message: "Image uploaded",
                imageUrl: result.secure_url,
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
}