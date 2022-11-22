import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { VendorAttributes, VendorInstance } from "../model/vendorModel";
import {
  Generatesignature,
  loginSchema,
  option,
  validatePassword,
} from "../utils";
import { FoodInstance } from "../model/foodModel";
import { v4 as uuidv4 } from "uuid";

/** ================= Vendor Login ===================== **/
export const vendorLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const validateResult = loginSchema.validate(req.body, option);
    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    // check if the vendor exist
    const Vendor = (await VendorInstance.findOne({
      where: { email: email },
    })) as unknown as VendorAttributes;

    if (Vendor) {
      const validation = await validatePassword(
        password,
        Vendor.password,
        Vendor.salt
      );
      console.log(validation)
      if (validation) {
        //Generate signature for vendor
        let signature = await Generatesignature({
          id: Vendor.id,
          email: Vendor.email,
          serviceAvailable: Vendor.serviceAvailable,
        });

        return res.status(200).json({
          message: "You have successfully logged in",
          signature,
          email: Vendor.email,
          serviceAvailable: Vendor.serviceAvailable,
          role: Vendor.role,
        });
      }
    }
    return res.status(400).json({
      Error: "Wrong Username or password or not a verified vendor ",
    });
  } catch (err) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/vendors/login",
    });
  }
};

/** ================= Vendor Add Food ===================== **/

export const createFood = async (req: JwtPayload, res: Response) => {
  try {
    const id = req.vendor.id;
    const { name, description, category, foodType, readyTime, price } =
      req.body;

    // check if the vendor exist
    const Vendor = (await VendorInstance.findOne({
      where: { id: id },
    })) as unknown as VendorAttributes;
    const foodid = uuidv4();
    if (Vendor) {
      const createfood = await FoodInstance.create({
        id: foodid,
        name,
        description,
        category,
        foodType,
        readyTime,
        price,
        rating: 0,
        vendorId: id,
      });

      return res.status(201).json({
        message: "Food added successfully",
        createfood,
      });
    }
  } catch (err) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/vendors/create-food",
    });
  }
};
