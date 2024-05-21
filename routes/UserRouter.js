const express = require("express");
const User = require("../db/userModel");
const router = express.Router();


router.get("/list", async (req, res) => {
    try {
        const users = await User.find({}).select('_id first_name last_name');
        return res.status(200).json(users);
    } catch (err) {
        console.error('/user/list error: ', err.message);
        return res.status(500).json(err);
    }
});

router.get("/:id", async (req, res) => {
    var id = req.params.id;
    try {
        const user = await User.findById(id).select('_id first_name last_name location description occupation')
        return res.status(200).send(user)
    } catch (err) {
        console.error('/user/:id error', err.message)
        return res.status(400).json(err)
    }
   
});

module.exports = router;