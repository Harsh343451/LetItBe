const Shop = require("../modles/shop.js");

exports.getIndex =(req,res,next)=> {
    res.render("index.ejs",{})
};

exports.getAddShop = (req, res) => {
    console.log('getAddShop called');
    // Check if user is authenticated
    if (!req.session.isLoggedIn) {
        console.log('User not logged in, redirecting to login');
        return res.redirect('/login');
    }

    console.log('Rendering add-shop page');
    res.render("add-shop", {
        errorMessage: null,
        oldInput: {}
    });
};

exports.postAddShop = async (req, res) => {
    const { shopName, ownerName, email, phone, address, services, description, openingHours } = req.body;

    const lat = parseFloat(req.body.latitude);
    const lng = parseFloat(req.body.longitude);
    const location = (Number.isFinite(lat) && Number.isFinite(lng))
        ? { type: 'Point', coordinates: [lng, lat] }
        : undefined;

    const normalizedServices = Array.isArray(services)
        ? services.map(service => service.trim()).filter(Boolean)
        : String(services || '').split(',').map(service => service.trim()).filter(Boolean);

    try {
        // console.log(req.session);
        // console.log(req.session.user);
        // Create new shop
        const newShop = new Shop({
            shopName,
            ownerName,
            email,
            phone,
            address,
            services: normalizedServices,
            description,
            openingHours,
            // Link to logged-in user
            owner: req.session.user.id,
            ...(location ? { location } : {})
        });

        await newShop.save();

        // Redirect to dashboard after successful creation
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Add shop error:", err);
        res.status(500).render("add-shop", {
            errorMessage: "Something went wrong. Please try again.",
            oldInput: { shopName, ownerName, email, phone, address, services, description, openingHours }
        });
    }
};

exports.getMyShops = async (req, res) => {

    try {

        // Find shops created by logged-in user
        const shops = await Shop.find({
            owner: req.session.user.id
        });

        // Render page with shops
        res.render("my-shops", {
            shops: shops
        });

    } catch (err) {

        console.error("Error fetching shops:", err);

        res.status(500).send("Something went wrong");
    }
};

// Render nearby shops search page
exports.getNearbyShops = (req, res) => {
    res.render('nearby-shops', { shops: null, errorMessage: null });
};

// Handle POST /nearby-shops - return shops near provided coords
exports.postNearbyShops = async (req, res) => {
    try {
        const lat = parseFloat(req.body.latitude);
        const lng = parseFloat(req.body.longitude);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }

        
        const maxDistance = 10000;

   
        const results = await Shop.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [lng, lat] },
                    distanceField: 'dist.calculated',
                    spherical: true,
                    maxDistance: maxDistance
                }
            },
            { $limit: 50 },
            {
                $project: {
                    shopName: 1,
                    address: 1,
                    services: 1,
                    phone: 1,
                    owner: 1,
                    location: 1,
                    distanceMeters: '$dist.calculated'
                }
            }
        ]);

        // Return JSON array of shops
        res.json({ shops: results });
    } catch (err) {
        console.error('Error in postNearbyShops:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


exports.postDeleteShop = async (req, res) => {
    const shopId = req.params.shopId;

    try {
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).redirect('/my-shops');
        }

       
        if (!req.session.user || shop.owner.toString() !== req.session.user.id) {
            return res.status(403).send('Forbidden');
        }

        await Shop.findByIdAndDelete(shopId);

        return res.redirect('/my-shops');
    } catch (err) {
        console.error('Error deleting shop:', err);
        return res.status(500).send('Server error');
    }
};