const Type = require("../models/type");
const Item = require("../models/item");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.type_list = (req, res, next) => {
  Type.find()
    .sort([["name", "ascending"]])
    .exec(function(err, list_type) {
      if (err) {
        return next(err);
      }
      res.render("type_list", {
        title: "Type List",
        type_list: list_type,
      });
    });
};

exports.type_detail = (req, res) => {
  async.parallel(
    {
      type(callback) {
        Type.findById({ name: req.params.id }).exec(callback);
      },
      type_items(callback) {
        Item.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.type === null) {
        const err = new Error("Type not found");
        err.status = 404;
        return next(err);
      }
      res.render("type_detail", {
        title: "Type Detail",
        type: results.type,
        type_items: results.type_items,
      });
    }
  );
};

exports.type_create_get = (req, res) => {
  res.render("type_form", { title: "Create type" });
}

exports.type_create_post = [
  body("type", "Type name required").trim().isLength({ min: 1 }).escape(),
  body("description", "Description required").trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("type_form", {
        title: "Create Type",
        type: req.body,
        errors: errors.array(),
      });
      return;
    }
    const type = new Type(
      {
        name: req.body.name,
        description: req.body.description,
      }
    );
    type.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(type.url);
    });
  },
];