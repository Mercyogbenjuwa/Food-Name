import express from "express";
import {authVendor} from '../middleware/authorization'
import {createFood, vendorLogin} from "../controller/vendorController";

const router = express.Router();
router.post('/login',vendorLogin)
router.post('/create-food',authVendor,createFood)


export default router;