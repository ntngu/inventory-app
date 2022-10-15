const express = require("express");
const router = express.Router();
const item_controller = require("../controllers/itemController");
const type_controller = require("../controllers/typeController");

router.get("/", item_controller.index);
router.get("/count", item_controller.count);
router.get("/item", item_controller.item_list);
router.get("/type", type_controller.type_list);

router.get("/item/create", item_controller.item_create_get);
router.post("/item/create", item_controller.item_create_post);
router.get("/type/create", type_controller.type_create_get);
router.post("/type/create", type_controller.type_create_post);

router.get("/item/:id", item_controller.item_detail);
router.get("/type/:id", type_controller.type_detail);

router.get("/search", item_controller.item_search_get);

router.get("/type/:id/delete", type_controller.type_delete_get);
router.post("/type/:id/delete", type_controller.type_delete_post);

router.get("/item/:id/delete", item_controller.item_delete_get);
router.post("/item/:id/delete", item_controller.item_delete_post);

router.get("/item/:id/edit", item_controller.item_update_get);
router.post("/item/:id/edit", item_controller.item_update_post);

module.exports = router;