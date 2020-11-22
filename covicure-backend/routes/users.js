var express = require('express');
var router = express.Router();
const { Connection, Request } = require("tedious");

// Create connection to database
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
/* GET users listing. */
router.get('/', function(context, req) {
  var queryResult = [];
  var res = {};
  
  const connection = new Connection(config);
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("CONNECTED!");
      queryDatabase();
    }
  });

  function queryDatabase() {
    console.log("Reading rows from the Table...");
  
    // Read all rows from table
    const request = new Request(
      `SELECT * FROM users`,
      (err, rowCount) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`${rowCount} row(s) returned`);
        }
      }
    );
  
    request.on("row", columns => {
      var rowVal = {}
      columns.forEach(column => {
        //console.log("%s\t%s", column.metadata.colName, column.value);
        rowVal[column.metadata.colName] = column.value;
        // console.log(rowVal);
      });
      queryResult.push(rowVal);
      console.log(queryResult);
    });
    
    request.on('requestCompleted', function() {
      context.res = {
        status: 200,
        body: queryResult
      };

      //context.done();
      req.send(queryResult);
    });

    connection.execSql(request);
  }
});

module.exports = router;
