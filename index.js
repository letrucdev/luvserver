const express = require("express");
const mysql = require("mysql2");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const compression = require("compression");
const { Server } = require("socket.io");
const { createServer } = require("https");

const app = express();
const httpServer = createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

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

db.on("connection", () => {
  console.log(`Number of database connections: ${db._allConnections.length}`);
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    db.promise()
      .query(`DELETE FROM user_online WHERE socket_room='${socket.id}'`)
      .then(([row, fields]) => {
        console.log(socket.id, "::disconnect");
      })
      .catch((err) => {
        console.error(err);
      });
  });

  socket.on("add_user_online", (data) => {
    const user_id = data.user_id;
    db.promise()
      .query(
        `INSERT INTO user_online(user_id, socket_room, ip_address) VALUES ('${user_id}','${socket.id}', '${socket.handshake.address}') ON DUPLICATE KEY UPDATE socket_room='${socket.id}', ip_address='${socket.handshake.address}'`
      )
      .then(([row, fields]) => {
        console.log("User::", user_id, "::logon");
      })
      .catch((err) => {
        console.error(err);
      });
  });

  socket.on("add_friend", (data) => {
    db.query(
      `SELECT * FROM user_friend_request WHERE from_user_id=${data.from_user_id} AND to_user_id=${data.to_user_id} OR from_user_id=${data.to_user_id} AND to_user_id=${data.from_user_id}`,
      (err, result) => {
        if (err) throw err;
        if (result[0] === undefined) {
          Promise.all([
            db
              .promise()
              .query(
                `INSERT INTO user_friend_request(from_user_id, to_user_id) VALUES('${data.from_user_id}', '${data.to_user_id}')`
              ),
            db
              .promise()
              .query(
                `INSERT INTO user_notification(to_user_id, from_user_id, from_user, content, image) VALUES ('${data.to_user_id}','${data.from_user_id}', '${data.from_user}' , '', '${data.user_avatar}')`
              ),
            db
              .promise()
              .query(
                `SELECT * from user_online where user_id='${data.to_user_id}'`
              ),
          ]).then(([result1, result2, result3]) => {
            if (result3[0][0] !== undefined) {
              socket.to(result3[0][0].socket_room).emit("new_notification");
            }
          });
        } else {
          socket.emit("is_sent_request");
        }
      }
    );
  });

  socket.on("accept_request", (data) => {
    Promise.all([
      db
        .promise()
        .query(`SELECT * from user_online where user_id='${data.to_user_id}'`),
      db
        .promise()
        .query(
          `INSERT INTO user_notification(to_user_id, from_user_id, from_user, content, image, type) VALUES ('${data.to_user_id}','${data.from_user_id}', '${data.from_user_name}' , '', '${data.from_user_avatar}', '1')`
        ),
      db
        .promise()
        .query(
          `DELETE FROM user_friend_request WHERE to_user_id=${data.to_user_id} OR to_user_id=${data.from_user_id}`
        ),
    ])
      .then(([result1]) => {
        if (result1[0][0] !== undefined) {
          socket.emit("accepted_request");
          socket.to(result1[0][0].socket_room).emit("accepted_request");
          socket.to(result1[0][0].socket_room).emit("new_notification");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });

  socket.on("read_notification", (data) => {
    db.promise()
      .query(
        `UPDATE user_notification SET isRead='1' WHERE to_user_id='${data.userId}'`
      )
      .then(() => {
        socket.emit("is_read_notification");
      })
      .catch((err) => {
        console.error(err);
      });
  });

  socket.on("send_private_message", (data) => {
    Promise.all([
      db
        .promise()
        .query(`SELECT * from user_online where user_id='${data.to_user_id}'`),
      db.promise().query(`SELECT CURRENT_TIMESTAMP`),
      db
        .promise()
        .query(
          `INSERT INTO user_chat(sent_id, recived_id, content, file) VALUES ('${data.from_user_id}', '${data.to_user_id}', '${data.content}', '${data.files}')`
        ),
    ]).then(async ([result1, result2, result3]) => {
      const message = {
        id: result3[0].insertId,
        at: result2[0][0].CURRENT_TIMESTAMP,
        sent_id: data.from_user_id,
        recived_id: data.to_user_id,
        content: data.content,
        file: data.files,
      };
      updateHistoryChat(
        data.from_user_id,
        data.to_user_id,
        data.content !== "" ? data.content : `sent 1 images`
      );
      if (result1[0][0] !== undefined) {
        socket
          .to(result1[0][0].socket_room)
          .emit("new_message_from_user", message);
        socket
          .to(result1[0][0].socket_room)
          .to(socket.id)
          .emit("new_history_chat");
      } else {
        socket.emit("new_history_chat");
      }
      socket.emit("return_message", message);
    });
  });

  socket.on("read_message", (data) => {
    db.promise()
      .query(
        `UPDATE user_chat_history SET isRead='1' where user_id='${data.user_id}' AND user_chat_id='${data.user_chat_id}'`
      )
      .then(([row]) => {
        socket.emit("new_history_chat");
      })
      .catch((err) => {
        throw err;
      });
  });
});

const updateHistoryChat = async (user_id, user_chat_id, last_message) => {
  await db
    .promise()
    .query(
      `SELECT * FROM user_chat_history where user_id='${user_id}' AND user_chat_id='${user_chat_id}' OR user_id='${user_chat_id}' AND user_chat_id='${user_id}'`
    )
    .then(([row]) => {
      if (row.length > 0) {
        db.promise()
          .query(
            `UPDATE user_chat_history SET last_message='${JSON.stringify({
              from_user_id: user_id,
              content: last_message,
            })}', at=CURRENT_TIMESTAMP, isRead='0' where user_id='${user_id}' AND user_chat_id='${user_chat_id}' OR user_id='${user_chat_id}' AND user_chat_id='${user_id}'`
          )
          .then(([result1]) => {
            /*  console.log(result1); */
          })
          .catch((err) => {
            throw err;
          });
      } else {
        db.promise()
          .query(
            `INSERT INTO user_chat_history(user_id, user_chat_id, last_message) VALUES ('${user_id}', '${user_chat_id}', '${JSON.stringify(
              {
                from_user_id: user_id,
                content: last_message,
              }
            )}'), ('${user_chat_id}', '${user_id}', '${JSON.stringify({
              from_user_id: user_id,
              content: last_message,
            })}')`
          )
          .then(([row]) => {
            /* console.log(row); */
          })
          .catch((err) => {
            throw err;
          });
      }
    });
};

const maxSize = 10 * 1000 * 1000;

const storageAvatar = multer.diskStorage({
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

const storageImages = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = `./public/cdn/images/${req.data.id}/`;
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
  storage: storageAvatar,
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

const uploadMultiFiles = multer({
  storage: storageImages,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    // Set the filetypes, it is optional
    var filetypes = /jpeg|jpg|png|gif/;
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
}).array("upload_files");

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
  db.promise()
    .query(
      `SELECT user_friend_list.user_id, user_friend_list.friend_id, user_friend_list.add_at, user.username, user.account_type, user_setting.setting FROM user_friend_list JOIN user on user.id = user_friend_list.friend_id JOIN user_setting on user.id=user_setting.user_id WHERE user_friend_list.user_id = '${userId}'`
    )
    .then(([row]) => {
      res.status(200).json(row);
    })
    .catch((err) => {
      throw err;
    });
});

app.get("/api/myInfomation", verifyToken, (req, res) => {
  res.status(200).json({
    id: req.data.id,
    username: req.data.username,
    email: req.data.email,
    accountType: req.data.accountType,
  });
});

app.get("/api/getChat/:id", verifyToken, (req, res) => {
  const userId = req.data.id;
  const recivedId = req.params.id;
  db.promise()
    .query(
      `SELECT * from user_chat where sent_id=${userId} AND recived_id=${recivedId} OR sent_id=${recivedId} AND recived_id=${userId}`
    )
    .then(([row]) => {
      res.status(200).json({ status: 200, list_message: row });
    })
    .catch((err) => {
      throw err;
    });
});

app.get("/api/getHistorychat/", verifyToken, (req, res) => {
  const userId = req.data.id;
  db.promise()
    .query(
      `SELECT uch.id, uch.user_id, uch.user_chat_id, uch.last_message, uch.isRead, uch.at , us.username, ust.setting  FROM user_chat_history as uch JOIN user as us on uch.user_chat_id=us.id JOIN user_setting as ust on uch.user_chat_id=ust.user_id where uch.user_id=${userId} ORDER BY uch.at DESC`
    )
    .then(([row]) => {
      /*  console.log(row); */
      res.status(200).json({ status: 200, history_chat: row });
    })
    .catch((err) => {
      throw err;
    });
});

app.get("/api/getNotification", verifyToken, (req, res) => {
  const userId = req.data.id;
  db.promise()
    .query(
      `SELECT * FROM user_notification where to_user_id= '${userId}' ORDER BY type ASC, at DESC`
    )
    .then(([row]) => {
      res.status(200).json({ notification: row });
    })
    .catch((err) => {
      console.error(err);
    });
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

app.post("/api/acceptFriend", verifyToken, (req, res) => {
  //accept friend request
  const userId = req.data.id;
  const friendId = req.body.friendId;
  const notifiId = req.body.notifiId;
  db.query(
    `INSERT INTO user_friend_list(user_id, friend_id) VALUES('${userId}', '${friendId}'), ('${friendId}', '${userId}')`,
    (err, result) => {
      if (err) throw err;
      db.query(
        `DELETE FROM user_notification where id=${notifiId}`,
        (err, result) => {
          if (err) throw err;
          res.status(200).json({
            status: 200,
            friend_id: friendId,
            from_user_id: userId,
            accept: true,
          });
        }
      );
    }
  );
});

app.delete("/api/unFriend/:id", verifyToken, (req, res) => {
  const friendId = req.params.id;
  const userId = req.data.id;
  Promise.all([
    db
      .promise()
      .query(
        `DELETE FROM user_friend_list where friend_id='${friendId}' AND user_id='${userId}'`
      ),
    db
      .promise()
      .query(
        `DELETE FROM user_friend_list where friend_id='${userId}' AND user_id='${friendId}'`
      ),
  ])
    .then(([result1, result2]) => {
      if (result1[0].affectedRows > 0 && result2[0].affectedRows > 0) {
        res.status(200).json({ status: 200, unfriend: 1 });
      } else {
        res.status(200).json({ status: 200, unfriend: 0 });
      }
    })
    .catch((err) => {
      throw err;
    });
});

app.delete("/api/deleteNotification/:id", (req, res) => {
  const notifiId = req.params.id;
  db.query(
    `DELETE FROM user_notification where id=${notifiId}`,
    (err, result) => {
      if (err) throw err;
      res.status(200).send("Delete ok");
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

app.post("/api/uploadMultiFiles", verifyToken, (req, res) => {
  uploadMultiFiles(req, res, (err) => {
    if (err instanceof multer.MulterError || err) {
      res.sendStatus(403);
    } else {
      res.status(200).json({
        status: 200,
        upload: { files: req.files },
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

httpServer.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is listening on port ${process.env.SERVER_PORT}`);
});
