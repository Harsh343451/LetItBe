const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../modles/user.js");


exports.getLogin = (req, res) => {
    res.render("login", { errorMessage: null, oldInput: {} });
};


exports.getSignup = (req, res) => {
    res.render("signup", { errorMessage: null, oldInput: {} });
};

// ─── POST Signup ──────────────────────────────────────────────────────────────
exports.postSignup = async (req, res) => {
    const { name, email, password } = req.body;

    // 1. express-validator errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("signup", {
            errorMessage: errors.array()[0].msg,
            oldInput: { name, email },
        });
    }

    try {
        // 2. Check if email already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(422).render("signup", {
                errorMessage: "E-Mail already in use. Please pick a different one.",
                oldInput: { name, email },
            });
        }

        // 3. Hash password (salt rounds = 12)
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4. Create & save user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: "user",
        });
        await newUser.save();

        // 5. Redirect to login after successful signup
        res.redirect("/login");
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).render("signup", {
            errorMessage: "Something went wrong. Please try again.",
            oldInput: { name, email },
        });
    }
};

// ─── POST Login ───────────────────────────────────────────────────────────────
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(422).render("login", {
                errorMessage: "Invalid email or password.",
                oldInput: { email },
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(422).render("login", {
                errorMessage: "Invalid email or password.",
                oldInput: { email },
            });
        }

        // Store user info in session
        req.session.isLoggedIn = true;
        req.session.user = { id: user._id, name: user.name, role: user.role };
        req.session.save((err) => {
            if (err) console.error("Session save error:", err);
            res.redirect("/");
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).render("login", {
            errorMessage: "Something went wrong. Please try again.",
            oldInput: { email },
        });
    }
};

// ─── POST Logout ──────────────────────────────────────────────────────────────
exports.postLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error("Logout error:", err);
        res.redirect("/login");
    });
};
