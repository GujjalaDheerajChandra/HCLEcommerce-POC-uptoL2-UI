const db = require("./db");
const usersData = require("./data/users.json");
const productsData = require("./data/products.json");
const cartData = require("./data/cart.json");
const addressData = require("./data/address.json");
const order = require("./data/order.json");
const { validateRegisterInput, validateLoginInput } = require("./validators");
const { UserInputError } = require("@apollo/server");
const Query = {
  userProfile: (root, args, context, info) => {
    return db.users.get(args.id);
  },
  oneProductData: (root, args, context, info) => {
    return db.products.get(args.id);
  },
  allProductsData: () => {
    return productsData;
  },
  allCartItems: () => {
    return cartData;
  },
  getAllAddress: () => {
    return addressData;
  },
  getAddressById: (root, args, context, info) => {
    return db.address.get(args.id);
  },
};
const Mutation = {
  userRegister: (root, args, context, info) => {
    const { valid, errors } = validateRegisterInput(
      args.firstName,
      args.lastName,
      args.phoneNumber,
      args.email,
      args.password
    );
    if (!valid) {
      throw new UserInputError("Errors", { errors });
    }
    const user = usersData.filter((item) => item.email === args.email);
    if (user.length > 0) {
      throw new UserInputError("user with this email exist", {
        errors: {
          email: "A User with this Email is already exist",
        },
      });
    } else {
      const id = db.users.create({
        firstName: args.firstName,
        lastName: args.lastName,
        phoneNumber: args.phoneNumber,
        email: args.email,
        password: args.password,
      });
      return db.users.get(id);
    }
  },
  userLogin: (root, { email, password }, context, info) => {
    const { errors, valid } = validateLoginInput(email, password);

    if (!valid) {
      throw new UserInputError("Errors", { errors });
    }

    const user = usersData.filter((item) => item.email === email);

    if (user.length === 0) {
      errors.general = "User not found";
      throw new UserInputError("User not found", { errors });
    }

    if (password !== user[0].password) {
      errors.general = "Wrong crendetials";
      throw new UserInputError("Wrong crendetials", { errors });
    }

    return db.users.get(user[0].id);
  },
  addCartItem: (root, args, context, info) => {
    const { productId, quantity } = args;
    const product = productsData.filter((item) => item.id == productId);
    const existingCartItem = cartData.filter(
      (item) => item.productId === productId
    );
    if (existingCartItem.length === 0) {
      const name = product[0].title;
      const price = product[0].price;
      const discpercent = product[0].discountPercentage;
      const description = product[0].description;
      const image = product[0].thumbnail;
      const finalPrice = ((price * (100 - discpercent)) / 100).toFixed(2);
      const id = db.cart.create({
        productId: productId,
        name: name,
        description: description,
        price: finalPrice,
        image: image,
        quantity: quantity,
      });
      return "Item Added to the cart!";
    } else {
      db.cart.update({
        ...existingCartItem[0],
        id: existingCartItem[0].id,
        quantity: existingCartItem[0].quantity + quantity,
      });
      return "Item Quantity Updated!";
    }
  },
  deleteCartItem: (root, { productId }, context, info) => {
    const existingCartItem = cartData.filter(
      (item) => item.productId === productId
    );
    db.cart.delete(existingCartItem[0].id);
    return "deleted successfully";
  },
  addAddress: (root, args, context, info) => {
    const id = db.address.create({
      name: args.name,
      address: args.address,
      cityname: args.cityname,
      state: args.state,
      zipcode: args.zipcode,
    });
    return db.address.get(id);
  },
  addOrder: (root, args, context, info) => {
    const id = db.order.create({
      order: args,
    });
    return "Order Placed successfully";
  },
  deleteAllCartItems: (root, args, context, info) => {
    cartData.map((item) => {
      db.cart.delete(item.id);
    });
    return "Delted All Cart Items successfully!";
  },
};
const User = {
  fullName: (root, args, context, info) => {
    return root.firstName + " " + root.lastName;
  },
};

module.exports = { Query, User, Mutation };
