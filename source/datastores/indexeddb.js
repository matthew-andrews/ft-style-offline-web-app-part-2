APP.indexedDB = (function () {
	'use strict';

	var db,
		indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
		IDBTransaction = window.hasOwnProperty('webkitIndexedDB') ? window.webkitIDBTransaction : window.IDBTransaction,
		IDBKeyRange = window.hasOwnProperty('webkitIndexedDB') ? window.webkitIDBKeyRange : window.IDBKeyRange;

	function indexedDBError(event) {
		if (typeof console !== "undefined") {
			console.error("An error occurred", event);
		}
	}

	function insertInto(model, data, successCallback) {
		var transaction = db.transaction([model], IDBTransaction.READ_WRITE || 'readwrite'), store, i, request, total = data.length;

		function successCallbackInner() {
			total = total - 1;
			if (total === 0) {
				successCallback();
			}
		}

		transaction.onerror = indexedDBError;
		store = transaction.objectStore(model);
		for (i in data) {
			if (data.hasOwnProperty(i)) {
				request = store.add(data[i]);
				request.onsuccess = successCallbackInner;
				request.onerror = indexedDBError;
			}
		}
	}

	function deleteAllFrom(model, successCallback) {
		var transaction = db.transaction([model], IDBTransaction.READ_WRITE || 'readwrite'), store, request;
		transaction.onerror = indexedDBError;
		store = transaction.objectStore(model);
		request = store.clear();
		request.onerror = indexedDBError;
		request.onsuccess = successCallback;
	}

	function selectAll(model, successCallback) {
		var transaction = db.transaction([model], IDBTransaction.READ_ONLY || 'readonly'), store, request, results = [], range;
		transaction.onerror = indexedDBError;
		store = transaction.objectStore(model);
		range = IDBKeyRange.lowerBound(0);
		request = store.openCursor();

		request.onerror = indexedDBError;
		request.onsuccess = function (event) {
			var result = event.target.result;

			// When result is null the end is reached
			if (!result) {
				successCallback(results);
				return;
			}
			results.push(result.value);

			// Weird to hack jslint
			result['continue']();
		};
	}

	function selectOne(model, id, successCallback) {
		var transaction = db.transaction([model], IDBTransaction.READ_WRITE || 'readwrite'), store, request;
		transaction.onerror = indexedDBError;
		store = transaction.objectStore(model);
		request = store.get(id);
		request.onerror = indexedDBError;
		request.onsuccess = function (event) {
			var result = event.target.result;
			successCallback(result);
		};
	}

	function start(successCallback, failureCallback) {
		if (!indexedDB) {
			failureCallback();
			return;
		}

		var request = indexedDB.open("APPDATA", 1),
			version = '5.0';

		function installModels(db) {

			// TODO This is strictly model logic, and ought not live inside the indexedDB library, should move.
			db.createObjectStore("articles", {keyPath: "id"});
		}

		request.onsuccess = function (event) {
			var setVersionRequest;

			db = event.target.result;
			if (db.setVersion && version !== db.version) {
				setVersionRequest = db.setVersion(version);
				setVersionRequest.onfailure = indexedDBError;
				setVersionRequest.onsuccess = function (event) {
					installModels(db);
					event.target.transaction.oncomplete = function () {
						if (successCallback) {
							successCallback();
						}
					};
				};

			} else {
				successCallback();
			}
		};
		request.onupgradeneeded = function (event) {
			var db = event.target.result;
			installModels(db);
		};
		request.onerror = function (event) {
			alert("You have chosen not to use offline storage");
			failureCallback();
		};
	}

	return {
		start: start,
		insertInto: insertInto,
		deleteAllFrom: deleteAllFrom,
		selectAll: selectAll,
		selectOne: selectOne
	};
}());
