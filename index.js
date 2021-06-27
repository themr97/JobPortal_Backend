const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passportConfig = require("./config/passportConfig");
const cors = require("cors");
const fs = require("fs");



const DB_CONNECTION = process.env.DB_CONNECTION;


mongoose
    .connect(DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then((res) => console.log("Connected to DB"))
    .catch((err) => console.log(err));

// initialising directories
if (!fs.existsSync("./public")) {
    fs.mkdirSync("./public");
}
if (!fs.existsSync("./public/resume")) {
    fs.mkdirSync("./public/resume");
}

const app = express();
const port = 4444;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Setting up middlewares
app.use(cors());
app.use(express.json());
app.use(passportConfig.initialize());

// Routing
app.use("/auth", require("./routes/auth"));
app.use("/api", require("./routes/api"));
app.use("/upload", require("./routes/upload"));
// app.use("/host", require("./routes/downloadRoutes"));

app.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});