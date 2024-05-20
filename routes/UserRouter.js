const express = require("express");
const User = require("../db/userModel");
const router = express.Router();


router.get("/list", async (request, response) => {
    try {
        const users = await User.find({}).select('_id first_name last_name');
        return response.status(200).json(users);
    } catch (err) {
        console.error('Doing /user/list error: ', err);
        return response.status(500).json(err);
    }
});

router.get("/:id", async (request, response) => {
    var id = request.params.id;
    try {
        const user = await User.findById(id).select('_id first_name last_name location description occupation')
        return response.status(200).send(user)
    } catch (err) {
        console.error('Doing /user/:id error', err)
        return response.status(400).json(err)
    }
   
});

module.exports = router;