const Iyzipay = require("iyzipay");
const dotenv = require("dotenv");
dotenv.config();

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || "sandbox-apiKey-placeholder",
  secretKey: process.env.IYZICO_SECRET_KEY || "sandbox-secretKey-placeholder",
  uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com"
});

module.exports = iyzipay;
