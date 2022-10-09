const express = require("express");
const router = express.Router();
const item_controller = require("../controllers/itemController");
const type_controller = require("../controllers/typeController");

router.get("/", item_controller.index);
router.get("/count", item_controller.count);
router.get("/items", item_controller.item_list);
router.get("/types", type_controller.type_list);
router.get("/item/create", item_controller.item_create_get);

module.exports = router;