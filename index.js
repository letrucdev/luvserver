const express = require("express");
const mysql = require("mysql");
const fs = require("fs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const app = express();

require("dotenv").config();

app.use(express.urlencoded());
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

const configDB = fs.readFileSync("dbConfig.json", "utf8");

const db = mysql.createConnection(JSON.parse(configDB));

const generateToken = (payload) => {
  const token = jwt.sign(payload, process.env.PRIVATE_SERVER_KEY);
  return token;
};

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) res.sendStatus(403);

  try {
    const decoded = jwt.verify(token, process.env.PRIVATE_SERVER_KEY);
    req.data = decoded;
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};

const Login = (account, password, res) => {
  db.query(
    `SELECT * FROM user WHERE account='${account}' AND password='${password}'`,
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.status(200).json({
          status: 200,
          auth: true,
          token: generateToken({
            id: result[0].id,
            account: account,
            username: result[0].username,
            email: result[0].email,
            accountType: result[0].account_type,
          }),
        });
      } else {
        res.status(200).json({ status: 200, auth: false });
      }
    }
  );
};

db.connect(function (err) {
  if (err) throw err;
  console.log("Database: CONNECTED!");
});

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.post("/login", (req, res) => {
  const account = req.body.account;
  const password = crypto
    .createHash("sha1")
    .update(req.body.password)
    .digest("base64");
  Login(account, password, res);
});

app.get("/myInfomation", verifyToken, (req, res) => {
  res.status(200).json({
    id: req.data.id,
    username: req.data.username,
    email: req.data.email,
    accountType: req.data.accountType,
  });
});

app.get("/getMessage", verifyToken, (req, res) => {
  res.json([
    {
      listmessage: [
        { id: 1, content: "ok12312" },
        { id: 2, content: "ok12312" },
      ],
    },
  ]);
});

app.post("/register", async (req, res) => {
  const account = req.body.account;
  const username = req.body.username;
  const email = req.body.email;
  const password = crypto
    .createHash("sha1")
    .update(req.body.password)
    .digest("base64");
  db.query(`SELECT * FROM user where account='${account}'`, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.status(200).json({ status: 200, auth: false });
    } else {
      db.query(
        `INSERT INTO user(username, email, account, password) VALUES ('${username}','${email}','${account}','${password}')`,
        (err) => {
          if (err) throw err;
          res.status(200).json({ status: 200, auth: true });
        }
      );
    }
  });
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is listening on port ${process.env.SERVER_PORT}`);
});
