APP.article = (function () {
    'use strict';

    function deleteArticles(successCallback) {
        APP.database.deleteAllFrom('articles', successCallback);
    }

    function insertArticles(articles, successCallback) {
        APP.database.insertInto('articles', articles, successCallback);
    }

    function selectBasicArticles(successCallback) {
        APP.database.selectAll('articles', successCallback);
    }

    function selectFullArticle(id, successCallback) {
        APP.database.selectOne('articles', id, successCallback);
    }

    return {
        insertArticles: insertArticles,
        selectBasicArticles: selectBasicArticles,
        selectFullArticle: selectFullArticle,
        deleteArticles: deleteArticles
    };
}());