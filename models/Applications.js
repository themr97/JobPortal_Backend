const mongoose = require("mongoose");

let schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        recruiterId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        dateOfApplication: {
            type: Date,
            default: Date.now,
        },
    },
    { collation: { locale: "en" } }
);
module.exports = mongoose.model("applications", schema);