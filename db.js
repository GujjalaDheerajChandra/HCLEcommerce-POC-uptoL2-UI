const { DataStore } = require("notarealdb");

const store = new DataStore("./data");

module.exports = {
  users: store.collection("users"),
  products: store.collection("products"),
  cart: store.collection("cart"),
  address: store.collection("address"),
  order: store.collection("order"),
};
