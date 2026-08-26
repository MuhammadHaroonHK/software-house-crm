import "dotenv/config";
const env = {
  PORT: process.env.PORT || "5000",

  DATABASE_URL: process.env.DATABASE_URL!,

  DIRECT_DATABASE_URL:
    process.env.DIRECT_DATABASE_URL!,

  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET!,

  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET!,

  CLOUDINARY_CLOUD_NAME:
    process.env.CLOUDINARY_CLOUD_NAME!,

  CLOUDINARY_API_KEY:
    process.env.CLOUDINARY_API_KEY!,

  CLOUDINARY_API_SECRET:
    process.env.CLOUDINARY_API_SECRET!,

  NODE_ENV:
    process.env.NODE_ENV || "development",
};

export default env;