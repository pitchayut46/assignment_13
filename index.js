const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const port = 3000;
const app = express();
const bcrypt = require("bcrypt");

const connection = mysql.createConnection({
  host: "server2.bsthun.com",
  port: "6105",
  user: "lab_25xoex",
  password: "gZFHrWH47IJg13oN",
  database: "lab_todo02_255nops",
});

connection.connect();

console.log("Database is connected");

app.use(bodyParser.json({ type: "application/json" }));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/basic/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	var sql = mysql.format(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password]
	);
	console.log("DEBUG: /basic/login => " + sql);
	connection.query(sql, (err, rows) => {
		if (err) {
			return res.json({
				success: false,
				data: null,
				error: err.message,
			});
		}

		numRows = rows.length;
		if (numRows == 0) {
			res.json({
				success: false,
				message: "Login credential is incorrect",
			});
		} else {
			res.json({
				success: true,
				message: "Login credential is correct",
				user: rows[0],
			});
		}
	});
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    
    var sql = mysql.format(
        "SELECT * FROM users WHERE username = ?",
        [username]
    );
    console.log("DEBUG: /login => " + sql);

    connection.query(sql,async (err, rows) => {
        if (err) {
            return res.json({
                success: false,
                data: null,
                error: err.message,
            });
        }
        
        rowsLength = rows.length;
        if (rowsLength == 0) {
            res.json({
                success: false,
                message: "Username Not found",
            })
        }

        else {
            const validPass = await bcrypt.compare(password, rows[0].hashed_password);
            if (!validPass) {
                res.json({
                    success: false,
                    message: "Password Incorrect",
                })
            }
            else {
                res.json({
                    success: true,
                    message: "Authentication Successed",
                })
            }
        }

    });
    

});

function validPassword(password) {
    return (
        password.length >= 8 &&
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /\d/.test(password)
    );
}

app.post("/register",async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!validPassword(password)) {
        return res.json({
            success: false,
            message: "Password does not match requirements",
        })
    }

    const hashed_password = await bcrypt.hash(password, 10);

    var sql = mysql.format(
        "INSERT INTO users (username,password,hashed_password) VALUES (?,?,?)",
        [username, password, hashed_password],
    );

    console.log("/register => " + sql);

    connection.query(sql,(err, rows) => {
            if (err) {
                return res.json({
                    success: false,
                    error: err.message,
                })
            }

            console.log(rows);
            if (rows) {
                res.json({
                    success: true,
                    error: null,
                    message: "Create Successed",
                })
            }
        }
    );

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});