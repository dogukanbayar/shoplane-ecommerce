const express = require("express");
const router = express.Router();
const {
  initializePayment,
  paymentCallback,
  mockPaymentSuccess
} = require("../controllers/paymentController");

router.post("/initialize/:orderId", initializePayment);
router.post("/callback", paymentCallback);
router.post("/mock-pay/:orderId", mockPaymentSuccess);

module.exports = router;
