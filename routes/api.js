const express = require("express");
const mongoose = require("mongoose");
const jwtAuth = require("../config/jwtConfig");


const Job = require("../models/Job");
const Application = require("../models/Applications");

const router = express.Router();



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
            console.log(err)
            res.status(400).json(err);
        });
});

router.get("/jobs", jwtAuth, (req, res) => {
    let user = req.user;

    let findParams = {};

    if (user.type === "recruiter" && req.query.myjobs) {
        findParams = {
            ...findParams,
            userId: user._id,
        };
    }

    let arr = [
        {
            $lookup: {
                from: "recruiterinfos",
                localField: "userId",
                foreignField: "userId",
                as: "recruiter",
            },
        },
        { $unwind: "$recruiter" },
        { $match: findParams },
    ];

    Job.aggregate(arr)
        .then((posts) => {
            if (posts == null) {
                res.status(404).json({
                    message: "No job found",
                });
                return;
            }
            res.json(posts);
        })
        .catch((err) => {
            res.status(400).json(err);
        });
});


router.get("/jobs/:id", jwtAuth, (req, res) => {
    Job.findOne({ _id: req.params.id })
        .then((job) => {
            if (job == null) {
                res.status(400).json({
                    message: "Job does not exist",
                });
                return;
            }
            res.json(job);
        })
        .catch((err) => {
            res.status(400).json(err);
        });
});


router.post("/jobs/:id/applications", jwtAuth, (req, res) => {
    const user = req.user;
    if (user.type != "applicant") {
        res.status(401).json({
            message: "You don't have permissions to apply for a job",
        });
        return;
    }
    const jobId = req.params.id;

    Application.findOne({
        userId: user._id,
        jobId: jobId,
    })
        .then((appliedApplication) => {
            console.log(appliedApplication);
            if (appliedApplication !== null) {
                res.status(400).json({
                    message: "You have already applied for this job",
                });
                return;
            }

            Job.findOne({ _id: jobId })
                .then((job) => {
                    if (job === null) {
                        res.status(404).json({
                            message: "Job does not exist",
                        });
                        return;
                    } const application = new Application({
                        userId: user._id,
                        recruiterId: job.userId,
                        jobId: job._id,
                    });
                    application
                        .save()
                        .then(() => {
                            res.json({
                                message: "Job application successful",
                            });
                        })
                        .catch((err) => {
                            res.status(400).json(err);
                        });
                }).catch((err) => {
                    res.status(400).json(err);
                });
        })
        .catch((err) => {
            res.json(400).json(err);
        });
});


router.get("/applicants", jwtAuth, (req, res) => {
    const user = req.user;
    if (user.type === "recruiter") {
        let findParams = {
            recruiterId: user._id,
        };
        if (req.query.jobId) {
            findParams = {
                ...findParams,
                jobId: new mongoose.Types.ObjectId(req.query.jobId),
            };
        }
        Application.aggregate([
            {
                $lookup: {
                    from: "jobapplicant",
                    localField: "userId",
                    foreignField: "userId",
                    as: "jobApplicant",
                },
            },
            { $unwind: "$jobApplicant" },
            {
                $lookup: {
                    from: "jobs",
                    localField: "jobId",
                    foreignField: "_id",
                    as: "job",
                },
            },
            { $unwind: "$job" },
            { $match: findParams },
        ])
            .then((applications) => {
                if (applications.length === 0) {
                    res.status(404).json({
                        message: "No applicants found",
                    });
                    return;
                }
                res.json(applications);
            })
            .catch((err) => {
                res.status(400).json(err);
            });
    } else {
        res.status(400).json({
            message: "You are not allowed to access applicants list",
        });
    }
});


module.exports = router;