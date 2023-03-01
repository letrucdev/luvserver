const express = require("express");
const mysql = require("mysql");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const compression = require("compression");
const app = express();

require("dotenv").config();

app.use(express.urlencoded());
app.use(compression());
app.use(express.json());
app.use("/cdn", express.static("public/cdn"));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  next();
});

const configDB = fs.readFileSync("dbConfig.json", "utf8");

const db = mysql.createPool(JSON.parse(configDB));

/* db.on('acquire', (connection) => {
  console.log(`Connection ${connection.threadId} acquired`);
}); */

db.on("connection", () => {
  console.log(`Number of database connections: ${db._allConnections.length}`);
});

const maxSize = 10 * 1000 * 1000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = `./public/cdn/images/avatar/${req.data.id}/`;
    if (!fs.existsSync(uploadDir)) {
      // Kiểm tra xem folder đã tồn tại hay chưa
      fs.mkdirSync(uploadDir); // Tạo folder mới nếu folder chưa tồn tại
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

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

const generateSetting = async (userId) => {
  const setting = {
    avatar: "",
    status: 1,
    friendrequest: 1,
    autolock: 0,
    theme: "/bg2.jpg",
    typing: 1,
    hide_prev_image: 0,
    notification: 1,
    notification_sounds: 1,
    hide_notification_content: 0,
  };
  const settingEncoded = Buffer.from(JSON.stringify(setting)).toString(
    "base64"
  );
  db.query(
    `INSERT INTO user_setting(user_id, setting) VALUES('${userId}', '${settingEncoded}')`,
    (err) => {
      if (err) throw err;
      return true;
    }
  );
};

const getUserData = (userId, res) => {
  db.query(
    `SELECT * FROM user INNER JOIN user_setting on user.id = user_setting.user_id where user.id = ${userId}`,
    (err, result) => {
      if (err) throw err;
      res.status(200).json({
        id: result[0]?.user_id,
        username: result[0]?.username,
        email: result[0]?.email,
        account_type: result[0]?.account_type,
        setting: result[0]?.setting,
      });
    }
  );
};

const Login = (req, res, next) => {
  const account = req.body.account;
  const password = crypto
    .createHash("sha1")
    .update(req.body.password)
    .digest("base64");
  db.query(
    `SELECT * FROM user WHERE account='${account}' AND password='${password}'`,
    (err, result) => {
      if (err) return false;
      if (result.length > 0) {
        req.data = {
          status: 200,
          auth: true,
          token: generateToken({
            id: result[0].id,
          }),
        };
        next();
      } else {
        res.status(200).json({ status: 200, auth: false });
      }
    }
  );
};

const Register = (req, res, next) => {
  const account = req.body.account;
  const username = req.body.username;
  const email = req.body.email;
  const password = crypto
    .createHash("sha1")
    .update(req.body.password)
    .digest("base64");
  if (email.trim().match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
    db.query(`SELECT * FROM user where account='${account}'`, (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.status(200).json({ status: 200, auth: false });
      } else {
        db.query(
          `INSERT INTO user(username, email, account, password) VALUES ('${username}','${email}','${account}','${password}')`,
          async (err, result) => {
            if (err) throw err;
            await generateSetting(result.insertId);
            next();
          }
        );
      }
    });
  } else {
    res.status(200).json({ status: 200, auth: false });
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    // Set the filetypes, it is optional
    var filetypes = /jpeg|jpg|png/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Error: File upload only supports the " +
            "following filetypes - " +
            filetypes
        )
      );
    }
  },
}).single("upload_file");

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.post("/api/login", Login, (req, res) => {
  res.status(200).json(req.data);
});

app.get("/api/getUserData", verifyToken, (req, res) => {
  getUserData(req.data.id, res);
});

app.get("/api/getFriendList", verifyToken, (req, res) => {
  const userId = req.data.id;
  db.query(
    `SELECT * FROM user_friend_list WHERE user_id='${userId}'`,
    (err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    }
  );
});

app.get("/api/myInfomation", verifyToken, (req, res) => {
  res.status(200).json({
    id: req.data.id,
    username: req.data.username,
    email: req.data.email,
    accountType: req.data.accountType,
  });
});

app.get("/api/getMessage", verifyToken, (req, res) => {
  res.json([
    {
      listmessage: [
        { id: 1, content: "ok12312" },
        { id: 2, content: "ok12312" },
      ],
    },
  ]);
});

app.post("/api/searchUser", verifyToken, (req, res) => {
  const username = req.body.username;
  const userId = req.data.id;
  db.query(
    `SELECT id, username, email,account_type, setting FROM user INNER JOIN user_setting on user.id= user_setting.user_id WHERE user.username LIKE '%${username}%' AND id!=${userId} ORDER BY user.username ASC`,
    (err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    }
  );
});

app.post("/api/register", Register, (req, res) => {
  res.status(200).json({ status: 200, auth: true });
});

app.post("/api/upload", verifyToken, (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError || err) {
      res.sendStatus(403);
    } else {
      res.status(200).json({
        status: 200,
        upload: { filedir: `/${req.data.id}/${req.file.filename}` },
      });
    }
  });
});

app.put("/api/updateUsername", verifyToken, (req, res) => {
  const username = req.body.username;
  const password = crypto
    .createHash("sha1")
    .update(req.body.password)
    .digest("base64");
  const userId = req.data.id;
  db.query(
    `UPDATE user SET username='${username}' WHERE id = ${userId} AND password ='${password}'`,
    (err, result) => {
      if (err) res.sendStatus(403);
      if (result.affectedRows > 0) {
        res
          .status(200)
          .json({ status: 200, result: "Change username success!" });
      } else {
        res.status(200).json({ status: 200, result: "Password is incorrect!" });
      }
    }
  );
});

app.put("/api/updateUseremail", verifyToken, (req, res) => {
  const email = req.body.email;
  const password = crypto
    .createHash("sha1")
    .update(req.body.password)
    .digest("base64");
  const userId = req.data.id;
  db.query(
    `UPDATE user SET email='${email}' WHERE id = ${userId} AND password ='${password}'`,
    (err, result) => {
      if (err) res.sendStatus(403);
      if (result.affectedRows > 0) {
        res.status(200).json({ status: 200, result: "Change email success!" });
      } else {
        res.status(200).json({ status: 200, result: "Password is incorrect!" });
      }
    }
  );
});

app.put("/api/updateSetting", verifyToken, (req, res) => {
  const usersetting = req.body.setting;
  const userId = req.data.id;
  const settingEncoded = Buffer.from(usersetting).toString("base64");
  db.query(
    `UPDATE user_setting SET setting='${settingEncoded}' where user_id='${userId}'`,
    (err, result) => {
      if (err) throw err;
      if (result.affectedRows > 0) {
        res.status(200).json({ status: 200, update: true });
      } else {
        res.sendStatus(403);
      }
    }
  );
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is listening on port ${process.env.SERVER_PORT}`);
});
