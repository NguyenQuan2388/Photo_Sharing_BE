const express = require("express");
const Photo = require("../db/photoModel");
const router = express.Router();
const async = require("async");
const { verifyToken } = require("../middleware/auth");
const upload = require("../utils/uploadFile");


router.get("/:photo_id", verifyToken, async (req, res) => {
  const photoId = req.params.photo_id;
  try {
    const photoModel = await Photo.findById(photoId);
    if (!photoModel) return res.status(400).json("Photo not found");

    return res.status(200).json(photoModel);
  } catch (err) {
    console.error('/:photo_id error: ', err.message);
    return res.status(400).json(err);
  }
})

router.get("/photosOfUser/:id", async (req, res) => {
  const id = req.params.id;

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
      res.status(400).send('Not found.');
      return;
    }
    return res.status(200).json(photoModel)

  } catch (err) {
    console.error('/photoOfUser/:id error: ', err.message);
    res.status(400).send(JSON.stringify(er.messager));
    return;

  }
});

router.post("/commentsOfPhoto/:photo_id", verifyToken, async (req, res) => {
  const photoId = req.params.photo_id;
  const userId = req.userId;
  const { comment } = req.body;

  if (!comment) return res.status(400).json("Missing comment");
  try {
    const photoModel = await Photo.findById(photoId);
    if (!photoModel) return res.status(400).json("Photo not found");

    const newComment = { comment, user_id: userId };

    if (!photoModel.comments && !!photoModel.comments.length) photoModel.comments = [newComment];
    else photoModel.comments.unshift(newComment);
    await photoModel.save();

    return res.status(200).json(photoModel.comments[0]);
  } catch (error) {
    console.error('/commentsOfPhoto/:photo_id error: ', err.message);
    return res.status(400).json(err.message);
  }
})

router.post("/photos/new", verifyToken, upload.single("image"), async (req, res) => {
  const userId = req.userId;
  if (!req.file)
    return res.status(400).json("No files to upload");
  const userPhoto = new Photo({
    file_name: `${req.file.filename}`,
    user_id: userId,
  });
  try {
    const newUserPhoto = await userPhoto.save();
    return res.status(200).json(newUserPhoto);
  } catch (err) {
    console.error('/photos/new error: ', err.message);
    return res.status(400).json(err.message);
  }
})

module.exports = router;
