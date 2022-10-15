const Type = require("../models/type");
const Item = require("../models/item");
const async = require("async");
const { body, validationResult } = require("express-validator");
const type = require("../models/type");

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

exports.type_detail = (req, res, next) => {
  async.parallel(
    {
      type(callback) {
        Type.findById({ _id: req.params.id }).exec(callback);
      },
      type_items(callback) {
        Item.find({ type: req.params.id }).exec(callback);
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
  body("name", "Type name required").trim().isLength({ min: 1 }).escape(),
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

exports.type_delete_get = (req, res, next) => {
  async.parallel(
    {
      type(callback) {
        Type.findById(req.params.id).exec(callback);
      },
      types_items(callback) {
        Item.find({ type: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.type === null) {
        res.redirect("/catalog/types");
      }
      res.render("type_delete", {
        title: "Delete item",
        type: results.type,
        type_items: results.types_items,
      });
    }
  );
};

exports.type_delete_post = (req, res, next) => {
  async.parallel(
    {
      type(callback) {
        Type.findById(req.body.typeid).exec(callback);
      },
      types_items(callback) {
        Item.find({ type: req.body.typeid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      if (results.types_items.length > 0) {
        res.render("type_delete", {
          title: "Delete type",
          type: results.type,
          type_items: results.types_items,
        });
        return;
      }

      Type.findByIdAndRemove(req.body.typeid, (err) => {
        if (err) {
          return next(err);
        }

        res.redirect("/catalog/type");
      })
    }
  );
};

exports.type_update_get = (req, res, next) => {
  async.parallel(
    {
      type(callback) {
        type.findById(req.params.id)
          .populate("name")
          .populate("description")
          .exec(callback);
      },
    },
    (err, result) => {
      if (err) {
        return next(err);
      }

      if (result.type === null) {
        const err = new Error("Type not found.");
        err.status = 404
        return next(err);
      }

      res.render("type_form", {
        title: "Update Type",
        type: result.type,
      });
    },
  );
};

exports.type_update_post = [
  body("name", "Type name required").trim().isLength({ min: 1 }).escape(),
  body("description", "Description required").trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("type_form", {
        title: "Update Type",
        type: req.body,
        errors: errors.array,
      })
    }

    const type = new Type({
      _id: req.params.id,
      name: req.body.name,
      description: req.body.description,
    });


    Type.findByIdAndUpdate({_id: req.params.id}, type, {}, (err, thetype) => {
      if (err) {
        return next(err);
      }

      res.redirect(thetype.url);
    });
  }
]