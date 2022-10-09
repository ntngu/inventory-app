const Item = require("../models/item");
const Type = require("../models/type");
const async = require("async");

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
        Item.findById(req.params.id)
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
        name: results.item.name,
        description: results.item.description,
      });
    }
  );
};

exports.item_create_get = (req, res, next) => {
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
    if (!Array.isArray(req.item.type)) {
      req.body.type =
        typeof req.body.type === undefined ? [] : [req.body.type];
    }
    next();
  },
];

exports.item_delete_get = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Item delete GET");
}

exports.item_delete_post = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Item delete POST");
}

exports.item_update_get = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Item update GET");
}

exports.item_update_post = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Item update POST");
}