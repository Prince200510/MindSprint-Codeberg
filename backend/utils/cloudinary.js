import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { HttpError } from "./HttpError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (imageFileLocalPath) => {
  if (!imageFileLocalPath) {
    const error = new HttpError(
      "`imageFileLocalPath` is not present - cloudinary.js - uploadOnCloudinary()",
      400 // correct this code
    );
    console.log(`log> Error: ${error.message}`);

    throw error;
  }

  try {
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(imageFileLocalPath, {
      resource_type: "auto",
    });

    // file has been uploaded successfully
    console.log("log> Image file is uploaded on cloudinary successfully.");
    console.log("log> URL:", response.url);
    console.log("log> response:-");
    console.log(response);

    // removing the locally saved temporary file synchronously as the upload operation succeeded
    fs.unlinkSync(imageFileLocalPath);
    console.log(
      "log> Removed the locally saved temporary image file synchronously as the upload operation succeeded - cloudinary.js - uploadOnCloudinary()"
    );

    return response;
  } catch (err) {
    const error = new HttpError(
      `Something went wrong uploadOnCloudinary FAILED!!!\nError: ${err} - cloudinary.js - uploadOnCloudinary()`,
      400 // correct this code
    );

    console.log(`log> Error: ${error.message}`);

    // removing the locally saved temporary file synchronously as the upload operation got failed
    fs.unlinkSync(imageFileLocalPath);
    console.log(
      "log> Removed the locally saved temporary image file synchronously as the upload operation got failed - cloudinary.js - uploadOnCloudinary()"
    );

    throw error;
  }
};

const deleteFromCloudinary = async (imageUrl) => {
  let imageUrlArray = imageUrl.split("/");
  let imageFilename = imageUrlArray[imageUrlArray.length - 1]; // "tklrxe042qhb5kmu1n9n.jpg"
  const imageId = imageFilename.split(".")[0]; // "tklrxe042qhb5kmu1n9n"
  console.log("imageId:", imageId);

  if (!imageId) {
    const error = new HttpError(
      "Cloud not get imageId from imageUrl - cloudinary.js - deleteFromCloudinary()",
      400 // correct this code
    );
    console.log(`log> Error: ${error.message}`);

    throw error;
  }

  try {
    const response = await cloudinary.uploader.destroy(imageId);
    console.log("log> Cloudinary image deleted:", response);
    return response;
  } catch (err) {
    const error = new HttpError(
      `Something went wrong! failed to delete image from Cloudinary\nError: ${err} - cloudinary.js - deleteFromCloudinary()`,
      400 // correct this code
    );
    console.log(`log> Error: ${error.message}`);

    throw error;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
