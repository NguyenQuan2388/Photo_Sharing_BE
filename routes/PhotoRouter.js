const express = require("express");
const Photo = require("../db/photoModel");
const router = express.Router();
const async = require("async");
const { verifyToken } = require("../middleware/auth");
const upload = require("../utils/uploadFile");


router.post("/", async (request, response) => {
});

router.get("/:photo_id", verifyToken, async (request, response) => {
  const photoId = request.params.photo_id;
  try {
    const photoModel = await Photo.findById(photoId);
    if (!photoModel) return response.status(400).json("Photo not found");

    return response.status(200).json(photoModel);
  } catch (err) {
    console.error('Doing /:photo_id error: ', err);
    return response.status(400).json(err);
  }
})

router.get("/photosOfUser/:id", async (request, response) => {
  const id = request.params.id;

  try {
    const photoModel = await Photo
      .find({ user_id: id })
      .populate({
        path: 'comments',

        populate: {
          select: '_id first_name last_name',
          path: 'user_id',
          model: 'Users'
        },
      })
    if (photoModel == null || photoModel == undefined) {
      console.log('Photos witd _id:' + id + 'not found.');
      response.status(400).send('Not found.');
      return;
    }
    return response.status(200).json(photoModel)

  } catch (err) {
    console.error('Doing /photoOfUser/:id error: ', err);
    response.status(400).send(JSON.stringify(err));
    return;

  }
});

router.post("/commentsOfPhoto/:photo_id", verifyToken, async (request, response) => {
  const photoId = request.params.photo_id;
  const userId = request.userId;
  const { comment } = request.body;

  if (!comment) return response.status(400).json("Missing comment");
  try {
    const photoModel = await Photo.findById(photoId);
    if (!photoModel) return response.status(400).json("Photo not found");

    const newComment = { comment, user_id: userId };

    if (!photoModel.comments && !!photoModel.comments.length) photoModel.comments = [newComment];
    else photoModel.comments.unshift(newComment);
    await photoModel.save();

    return response.status(200).json(photoModel.comments[0]);
  } catch (error) {
    console.error('Doing /commentsOfPhoto/:photo_id error: ', err);
    return response.status(400).json(err);
  }
})

router.post("/photos/new", verifyToken, upload.single("image"), async (request, response) => {
  const userId = request.userId;
  if (!request.file)
    return response.status(400).json("No files to upload");
  const userPhoto = new Photo({
    file_name: `${request.file.filename}`,
    user_id: userId,
  });
  try {
    const newUserPhoto = await userPhoto.save();
    return response.status(200).json(newUserPhoto);
  } catch (err) {
    console.error('Doing /photos/new error: ', err);
    return response.status(400).json(err);
  }
})

module.exports = router;
