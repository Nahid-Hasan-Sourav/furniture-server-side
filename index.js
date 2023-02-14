const express = require("express");
const cors = require("cors");
const port = process.env.port || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ksp2yp4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    console.log("DB CONNECTED");
  } catch (err) {
    console.log("Error", err);
  }
}

run();

const userCollection = client.db("furniture").collection("allUsers");

app.put("/create-user", async (req, res) => {
  try {
    const user = req.body;
    console.log("User :", req.body);
    const query = { email: req.body.email };
    console.log("QUERY : ", query);

    const find = await userCollection.findOne(query);

    if (find) {
      res.send({
        success: false,
        message: `This ${req.body.email} is already registered.
                         please go to login page try to login`,
      });
    } else {
      const result = await userCollection.insertOne(user);
      res.send({
        success: true,
        user: user,
        message: "User created succesfully!!",
      });
      // console.log("This is result ",result)
    }
  } catch (err) {
    console.log("Error is ", err.name);
    res.send({
      success: false,
      error: err.message,
    });
  }
});

app.post("/user-login", async (req, res) => {
  try {
    const loginInfo = req.body;
    const { email, password } = req.body;

    const queryOne = { email: req.body.email };
    const queryTwo = { password: req.body.password };
    const user = await userCollection.findOne(queryOne);

    const specificUser = await userCollection.findOne(queryTwo);
    // console.log("object",user);
    // console.log("queryTwo : ",queryOne);
    if (!user && !queryTwo) {
    }
    if (!user) {
      if (!user && !specificUser) {
        res.send({
          success: false,
          message: `Email And PAssword Both are incorrect`,
          anotherMessage: "Incorrect Password!",
        });
      } else {
        res.send({
          success: false,
          message: `The Email is no correct`,
          anotherMessage: "Wrong credentials!",
        });
      }
    } else if (!specificUser) {
      res.send({
        success: false,
        message: `The Password is incorrect`,
        anotherMessage: "Incorrect Password!",
      });
    } else {
      res.send({
        success: true,
        userInfo: loginInfo,
        message: `Successfully Login`,
        anotherMessage: "Congratulation",
      });
    }
  } catch (err) {
    console.log("Error is ", err);
    res.send({
      success: false,
      message: err.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Simple node server run");
});

app.listen(port, () => {
  console.log(`Simple node server running on ${port}`);
});
