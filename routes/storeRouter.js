const path=require('path')

const express=require('express')
const storeRouter=express.Router();
const storeController=require('../controllers/storeController.js')

storeRouter.get("/",storeController.getIndex);