const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");
const {setGlobalOptions} = require("firebase-functions/v2");
setGlobalOptions({maxInstances: 10});

const admin = require("firebase-admin");

const serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");

const app = express();
const cors = require("cors");
const db = admin.firestore();
app.use(cors({origin: true}));

// Routes
app.get("/hello-word", (req, res) => {
  return res.status(200).send("hello-word");
});
// post
app.post("/product/", (req, res) => {
  (async () => {
    try {
      await db.collection("product").doc("/" + req.body.id + "/").create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
      });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});
// read a specific product based on id
app.get("/product/:id", (req, res) => {
  (async () => {
    try {
      const document = db.collection("product").doc(req.params.id);
      const product = await document.get();
      const response = product.data();

      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});
// read all products
app.get("/product/", (req, res) => {
  (async () => {
    try {
      const query = db.collection("product");
      const response = [];
      await query.get().then((QuerySnapshot) => {
        const docs = QuerySnapshot.docs;
        for (const doc of docs) {
          const selectedItem = {
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description,
            price: doc.data().price,
          };
          response.push(selectedItem);
        }
        return response;
      });
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});
// update
app.put("/product/update/:id", (req, res) => {
  (async () => {
    try {
      const document = db.collection("product").doc(req.params.id);
      await document.update({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
      });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});
// delete
app.delete("/product/delete/:id", (req, res) => {
  (async () => {
    try {
      const document = db.collection("product").doc(req.params.id);
      await document.delete();
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

exports.app = onRequest(app);
