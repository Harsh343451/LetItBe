const path=require('path')

const express=require('express')
const storeRouter=express.Router();
const storeController=require('../controllers/storeController.js')

storeRouter.get("/",storeController.getIndex);
storeRouter.get("/add-shop",storeController.getAddShop);
storeRouter.post("/add-shop",storeController.postAddShop);
storeRouter.get("/my-shops", storeController.getMyShops);
storeRouter.get('/nearby-shops', storeController.getNearbyShops);
storeRouter.post('/nearby-shops', storeController.postNearbyShops);
storeRouter.post('/delete-shop/:shopId', storeController.postDeleteShop);


module.exports = storeRouter;