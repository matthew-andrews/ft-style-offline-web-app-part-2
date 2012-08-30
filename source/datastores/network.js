APP.network = (function () {
	'use strict';

	function start(successCallback) {
		if (successCallback) {
			successCallback();
		}
	}

	function insertInto(model, data, successCallback) {
		if (successCallback) {
			successCallback();
		}
	}

	function deleteAllFrom(model, successCallback) {
		if (successCallback) {
			successCallback();
		}
	}

	function selectAll(model, successCallback, failureCallback) {
		$.ajax({
			dataType: 'json',
			url: 'api/' + model,
			success: successCallback || function () {},
			type: 'GET',
			error: failureCallback || function () {}
		});
	}

	function selectOne(model, id, successCallback, failureCallback) {
		$.ajax({
			dataType: 'json',
			url: 'api/' + model + '/?id=' + id,
			success: successCallback || function () {},
			type: 'GET',
			error: failureCallback || function () {}
		});
	}

	return {
		start: start,
		insertInto: insertInto,
		deleteAllFrom: deleteAllFrom,
		selectAll: selectAll,
		selectOne: selectOne
	};

}());
