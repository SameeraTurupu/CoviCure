var express = require('express');
var router = express.Router();
const { Connection, Request } = require("tedious");

const config = {
    authentication: {
        options: {
            userName: "", // update me
            password: "" // update me
        },
        type: "default"
    },
    server: "", // update me
    options: {
        database: "", //update me
        encrypt: true
    }
};

router.post('/login', function(request, response) {
    const userEmail = request.body.email;
    const userPass = request.body.password;
    console.log(userEmail);
    
    const connection = new Connection(config);
    connection.on("connect", err => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("CONNECTED!");
            queryDatabaseForUserName();
        }
    });
    function queryDatabaseForUserName() {
        //console.log("Reading rows from the Table...");
  
        // Read all rows from table
        const sql = `SELECT * FROM users WHERE email='` + userEmail + `'`;
        //console.log(sql);
        const request = new Request(sql,
        (err, rowCount) => {
            //console.log(rowCount);
            if (err) {
            console.error(err.message);
            } else if(rowCount > 0) {
                //console.log(`${rowCount} row(s) returned`);
            }
            else {
                response.status(400).send({"message": "Authentication Failed! Email doesn\'t exist.", "status": 400});
            }
        }
        );

        request.on("row", columns => {
            var role = "";
            var id = "";
            var name = "";
        columns.forEach(column => {
            if (column.metadata.colName == 'id')
                id = column.value;
            else if (column.metadata.colName == 'name')
                name = column.value;
            else if (column.metadata.colName == 'role')
                role = column.value;
            else if (column.metadata.colName == 'password') {
                if (column.value == userPass) {
                    response.status(200).send({"message": "Login Successful", "role": role, "status": 200, "userid": id, "username": name});
                }
                else {
                    response.status(400).send({"message": "Authentication Failed! Invalid password", "status": 400});
                }
            }
        });
        });
        
    connection.execSql(request);
  }    
});