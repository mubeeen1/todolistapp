const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const ejs = require("ejs");
const app = express();
const _= require("lodash");
const port= process.env.PORT || 3000;
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://mubeen:todolistpwd@todolist.jucyib1.mongodb.net/todolistDB");
const itemSchema = {
    name: String,
};
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
    name: " Welcome to the ToDo List",
})
const item2 = new Item({
    name: "Hit the + button to add new item",
})
const item3 = new Item({
    name: "<--- Hit this to delete an item",
});
const defaultArray = [item1, item2, item3];
const listSchema = {
    name: String,
    items: [itemSchema],
};
const List = mongoose.model("List", listSchema);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
    Item.find({}).then(items => {
        if (items.length === 0) {
            Item.insertMany(defaultArray).then(() => { console.log("Succesfuly added the items into default array") })
                .catch(err => {
                    console.log(err)
                }
                )
            res.redirect("/")
        }
        else {
            res.render("list", { listHeading: "Today", listItem: items });
        }
    });
});
app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }).then((foundList) => {
        if (!foundList) {
            // create a new lists
            const list = new List({
                name: customListName,
                items: defaultArray,
            });
            list.save();
            res.redirect("/" + customListName)
        } else {
            // show an existing list
            res.render("list", { listHeading: foundList.name, listItem: foundList.items })
        }
    }).catch(err => {
        console.log(err);
    });
});
app.post("/", function (req, res) {
    const itemName = req.body.item;
    const listName = req.body.list;
    const newItem = new Item({
        name: itemName,
    });
    if (listName === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }).then((foundList) => {
            if (!foundList) {
                const newList = new List({
                    name: listName,
                    items: defaultArray,
                });
                newList.save();
                res.redirect("/" + listName);
            } else {
                foundList.items.push(newItem);
                foundList.save();
                res.redirect("/" + listName);
            }
        });
    }
});
app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.findByIdAndDelete(checkedItemId).catch(err => {
            console.log(err);
        })
        res.redirect("/");
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }).then(() => {
            res.redirect("/" + listName)
        })
    }

});

app.get("/work", function (req, res) {
    res.render("list", { listHeading: "Work List", listItem: workItems });
})

app.listen(port, function () {
    console.log("server is started and running on port"+ port);
});
app.get("/about", function (req, res) {
    res.render("about");
})