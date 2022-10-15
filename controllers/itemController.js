const Item = require("../models/item");
const Type = require("../models/type");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = (req, res) => {
  res.render("index", {
    title: "Inventory App Home",
  });
}

exports.count = (req, res, next) => {
  async.parallel(
    {
      item_count(callback) {
        Item.countDocuments({}, callback);
      },
      type_count(callback) {
        Type.countDocuments({}, callback);
      }
    },
    (err, results) => {
      res.render("count", {
        title: "Item Count",
        error: err,
        data: results,
      });
    }
  );
};

exports.item_list = function(req, res, next) {
  Item.find({}, "name description")
    .sort({ name: 1 })
    .populate("name")
    .exec(function(err, list_items) {
      if (err) {
        return next(err);
      }
      res.render("item_list", { title: "Item List", item_list: list_items });
    });
};

exports.item_detail = function(req, res, next) {
  async.parallel(
    {
      item(callback) {
        Item.findById({_id: req.params.id})
          .populate("name")
          .populate("type")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item === null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      res.render("item_detail", {
        item: results.item,
        type: results.item.type,
      });
    }
  );
};

exports.item_create_get = (req, res, next) => {
  async.parallel(
    {
      types(callback) {
        Type.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("item_form", {
        title: "Create item",
        descriptions: results.descriptions,
        types: results.types,
        quantities: results.quantities,
      });
    }
  );
};

exports.item_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.type)) {
      req.body.type = typeof req.body.type === undefined ? [] : [req.body.type];
    }
    next();
  },
  body("name", "Name must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("quantity", "Quantity must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("type.*").escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      quantity: req.body.quantity,
      type: req.body.type,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          items(callback) {
            Item.find(callback);
          },
          types(callback) {
            Type.find(callback);
          },
        },
        (err, results) => {
          for (const type of results.types) {
            if (item.type.includes(type._id)) {
              type.checked = "true";
            }
          }
          res.render("item_form", {
            title: "Create item",
            items: results.items,
            types: results.types, item,
            errors: errors.array(),
          });
          console.log(errors.array());
        }
      );
      return;
    }
    item.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(item.url);
    });
  },
];

exports.item_delete_get = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id).exec(callback);
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item === null) {
        res.redirect("/catalog/item");
      }
      res.render("item_delete", {
        item: results.item,
      });
    },
  );
};

exports.item_delete_post = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.body.itemid).exec(callback);
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      Item.findByIdAndRemove(req.body.itemid, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/catalog/item");
      });
    }
  )
};

exports.item_update_get = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id)
          .populate("name")
          .populate("description")
          .populate("quantity")
          .populate("type")
          .exec(callback);
      },
      types(callback) {
        Type.find(callback);
      }
    },
    (err, result) => {
      if (err) {
        return next(err);
      }

      if (result.item === null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }

      for (const type of result.types) {
        for (const itemType of result.item.type) {
          if (type._id.toString() === itemType._id.toString()) {
            type.checked = "true";
          }
        }
      }

      res.render("item_form", {
        title: "Update item",
        item: result.item,
        types: result.types
      });
    }
  );
};

exports.item_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.type)) {
      req.body.type = typeof req.body.type === "undefined" ? [] : req.body.type
    }
    next();
  },
  body("name", "Name must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("quantity", "Quantity must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("type.*").escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      _id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      quantity: req.body.quantity,
      type: typeof req.body.type === undefined ? [] : req.body.type,
    });
     
    if (!errors.isEmpty()) {
      async.parallel(
        {
          items(callback) {
            Item.find(callback);
          },
          types(callback) {
            Type.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          for (const type of results.types) {
            if (item.type.includes(type._id)) {
              type.checked = "true";
            }
          }
          res.render("item_form", {
            title: "Update item",
            item: results.item,
            type: results.types,
            errors: errors.array(),
          });
        }
      );
      return;
    }
    Item.findByIdAndUpdate({_id: req.params.id}, item, {}, (err, theitem) => {
      if (err) {
        return next(err);
      }

      res.redirect(theitem.url);
    });
  },
];

exports.item_search_get = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Item search GET");
};

exports.item_search_post = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Item search POST");
};