APP.webSQL = (function () {
    'use strict';

    var smallDatabase;

    function runQuery(query, data, returnFirst, successCallback) {
        var i, l, remaining;


        if (!(data[0] instanceof Array)) {
            data = [data];
        }

        remaining = data.length;

        function innerSuccessCallback(tx, rs) {
            var i, l, output = [];
            remaining = remaining - 1;
            if (!remaining) {

                // HACK Convert row object to an array to make our lives easier
                for (i = 0, l = rs.rows.length; i < l; i = i + 1) {
                    output.push(rs.rows.item(i));
                }
                if (successCallback) {
                    successCallback(returnFirst ? output[0] : output);
                }
            }
        }

        function errorCallback(tx, e) {
          if (typeof console !== "undefined") {
            console.log("WebSQL error: ", tx, e);
          }
        }

        smallDatabase.transaction(function (tx) {
            for (i = 0, l = data.length; i < l; i = i + 1) {
                tx.executeSql(query, data[i], innerSuccessCallback, errorCallback);
            }
        });
    }

    function insertInto(model, data, successCallback) {
        var remaining = data.length, i, l, insertData = [];

        if (remaining === 0) {
            successCallback();
        }

        // Convert article array of objects to array of arrays
        for (i = 0, l = data.length; i < l; i = i + 1) {
            insertData[i] = [data[i].id, data[i].date, data[i].headline, data[i].author, data[i].body];
        }

        if (model === 'articles') {
            runQuery("INSERT INTO articles (id, date, headline, author, body) VALUES (?, ?, ?, ?, ?);", insertData, false, successCallback);
        }
    }

    function deleteAllFrom(model, successCallback) {
        runQuery("DELETE FROM " + model, [], false, successCallback);
    }

    function selectAll(model, successCallback) {
        if (model === "articles") {
            runQuery("SELECT id, headline, date, author FROM articles", [], false, successCallback);
        }
    }

    function selectOne(model, id, successCallback) {
        if (model === "articles") {
            runQuery("SELECT id, headline, date, author, body FROM articles WHERE id = ?", [id], true, successCallback);
        }
    }

    function start(successCallback, failureCallback) {
        try {
            smallDatabase = openDatabase("APP", "1.0", "Not The FT Web App", (5 * 1024 * 1024));
            runQuery("CREATE TABLE IF NOT EXISTS articles(id INTEGER PRIMARY KEY ASC, date TIMESTAMP, author TEXT, headline TEXT, body TEXT)", [], false, successCallback);
        } catch (e) {
            if (failureCallback){
                failureCallback();
            }
        }
    }

    return {
        start: start,
        insertInto: insertInto,
        deleteAllFrom: deleteAllFrom,
        selectAll: selectAll,
        selectOne: selectOne
    };
}());
