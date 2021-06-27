const express = require("express");
const mongoose = require("mongoose");
const jwtAuth = require("../config/jwtConfig");


const User = require("../models/User");
const Job = require("../models/Job");

const router = express.Router();


// To add new job
router.post("/jobs", jwtAuth, (req, res) => {
    const user = req.user;

    if (user.type != "recruiter") {
        res.status(401).json({
            message: "You don't have permissions to add jobs",
        });
        return;
    }

    const data = req.body;

    let job = new Job({
        userId: user._id,
        title: data.title,
        desc: data.desc,
        dateOfPosting: data.dateOfPosting,
        deadline: data.deadline,
        salary: data.salary,
    });

    job.save().then(() => {
        res.json({ message: "Created Job" });
    })
        .catch((err) => {
            res.status(400).json(err);
        });
});


module.exports = router;