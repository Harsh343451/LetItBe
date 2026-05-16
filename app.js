const express = require("express");
const path = require("path");
const DB_path = "mongodb+srv://bhapkarhp_db_user:root@harsh.ivxpyfo.mongodb.net/letitgo?appName=Harsh";
const { default: mongoose } = require('mongoose');
const User = require("./modles/user.js");
const authRouter = require("./routes/authRouter.js");
const storeRouter = require("./routes/storeRouter.js");
const hostRouter = require("./routes/hostRouter.js");
const session = require("express-session");

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (VERY IMPORTANT)
app.use(express.static(path.join(__dirname, "public")));
//app.use(express.static(path.join(__dirname, "views")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Pass session data to all views
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.user = req.session.user || null;
    req.isLoggedIn = req.session.isLoggedIn;
    next();
});
require("dotenv").config();
// ===== Test Route =====
app.get("/api/test", (req, res) => {
    res.json({ message: "Server is working 🚀" });
});

app.use(authRouter);
app.use(storeRouter);
app.use(hostRouter);
app.get("/create-user", async (req, res) => {
    try {
        const user = new User({
            name: "Har",
            email: "hsh@test.com",
            password: "126",

        });

        await user.save();

        res.send("User created successfully");
    } catch (err) {
        res.send(err.message);
    }
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;

mongoose.connect(DB_path).then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log('Server is running on port' + PORT);
    });
}).catch((err) => {
    console.log("Error connecting to MongoDB", err.message);
});