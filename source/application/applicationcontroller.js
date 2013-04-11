APP.applicationController = (function () {
    'use strict';

    var fastClick;

    function offlineWarning() {
        alert("This feature is only available online.");
    }

    function pageNotFound() {
        alert("That page you were looking for cannot be found.");
    }

    function showHome() {
        $("#body").html(APP.templates.home());

        // Load up the last cached copy of the news
        APP.articlesController.showArticleList();

        $('#refreshButton').click(function () {

            // If the user is offline, don't bother trying to synchronize
            if (navigator && navigator.onLine === false) {
                offlineWarning();
            } else {
                APP.articlesController.synchronizeWithServer(function failureCallback() {
                    alert("This feature is not available offline");
                });
            }
        });
    }

    function showArticle(id) {
        $("#body").html(APP.templates.articleLoading());
        APP.articlesController.showArticle(id);
    }

    function route() {
        var page = window.location.hash;
        if (page) {
            page = page.substring(1);
        }
        if (page.length > 0) {
            if (parseInt(page, 10) > 0) {
                showArticle(parseInt(page, 10));
            } else {
                pageNotFound();
            }
        } else {
            showHome();
        }
    }

    function initialize(resources) {

        // Listen to the hash tag changing
        if ("onhashchange" in window) {
            $(window).bind("hashchange", route);

        // Support for old IE (which didn't have hash change)
        } else {
            (function () {
                var lastHash = window.location.hash;
                window.setInterval(function () {
                    if (window.location.hash !== lastHash) {
                        lastHash = window.location.hash;
                        route();
                    }
                }, 100);
            }());
        }

        // Set up FastClick
        fastClick = new FastClick(document.body);

        // Inject CSS Into the DOM
        $("head").append("<style>" + resources.css + "</style>");

        // Create app elements
        $("body").html(APP.templates.application());

        // Remove our loading splash screen
        $("#loading").remove();

        route();
    }

    // This is to our webapp what main() is to C, $(document).ready is to jQuery, etc
    function start(resources, storeResources) {
		var iOSPrivateBrowsing = false;

		// Try to detect whether iOS private browsing mode is enabled
		try {
			localStorage.test = '';
			localStorage.removeItem('item');
		} catch (exception) {
			if (exception.code === 22) {
				iOSPrivateBrowsing = true;
			}
		}
		
		if (iOSPrivateBrowsing) {
			return APP.network.start(function networkSuccess() {
                APP.database = APP.network;
                initialize(resources);
            });
		}

        // When indexedDB available, use it!
        APP.indexedDB.start(function indexedDBSuccess() {
            APP.database = APP.indexedDB;
            initialize(resources);

            // When indexedDB is not available, fallback to trying websql
        }, function indexedDBFailure() {
            APP.webSQL.start(function webSQLSuccess() {
                APP.database = APP.webSQL;
                initialize(resources);

            // When webSQL not available, fall back to using the network
            }, function webSQLFailure() {
                APP.network.start(function networkSuccess() {
                    APP.database = APP.network;
                    initialize(resources);
                });
            });
        });

        if (storeResources && window['localStorage']) {
            localStorage.resources = JSON.stringify(resources);
        }
    }

    return {
        start: start
    };
}());
