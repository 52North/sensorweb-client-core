angular.module('n52.core.base')
    .service('favoriteService', ['localStorageService', '$translate', 'settingsService', 'seriesApiInterface',
        function(localStorageService, $translate, settingsService, seriesApiInterface) {
            var storageKey = 'favorites';
            this.favorites = {};
            var groupIdx = Object.keys(this.favorites).length;
            if (groupIdx === 0) groupIdx++;

            var saveFavorites = () => {
                localStorageService.set(storageKey, this.favorites);
            };

            this.addFavorite = (ts, label) => {
                label = label || ts.label;
                this.favorites[ts.apiUrl + ts.id] = {
                    id: ts.apiUrl + ts.id,
                    label: label,
                    type: 'single',
                    timeseries: angular.copy(ts)
                };
                saveFavorites();
                return label;
            };

            this.addFavoriteGroup = (tsColl, label) => {
                var collection = [];
                angular.forEach(tsColl, function(elem) {
                    collection.push(angular.copy(elem));
                });
                if (collection.length !== 0) {
                    label = label || $translate.instant('favorite.label') + ' ' + groupIdx;
                    this.favorites[groupIdx] = {
                        id: groupIdx,
                        label: label,
                        type: 'group',
                        collection: collection
                    };
                    saveFavorites();
                    groupIdx++;
                    return label;
                } else {
                    return null;
                }
            };

            this.removeFavorite = (fav) => {
                delete this.favorites[fav.id];
                saveFavorites();
            };

            this.removeTsAsFavorite = (ts) => {
                delete this.favorites[ts.apiUrl + ts.id];
                saveFavorites();
            };

            this.hasTimeseriesAsFavorite = (ts) => {
                return angular.isObject(this.favorites[ts.apiUrl + ts.id]);
            };

            this.hasFavorites = () => {
                return Object.keys(this.favorites).length > 0;
            };

            this.getFavoritesCount = () => {
                return Object.keys(this.favorites).length;
            };

            this.removeAllFavorites = () => {
                angular.forEach(this.favorites, function(elem) {
                    this.removeFavorite(elem);
                });
            };

            this.setFavorites = (newFavs) => {
                this.removeAllFavorites();
                angular.forEach(newFavs, (fav) => {
                    // single
                    if (fav.timeseries) {
                        // send request to get latest value
                        var oldTs = fav.timeseries;
                        seriesApiInterface.getTimeseries(oldTs.id, oldTs.apiUrl).then((newTs) => {
                            newTs.styles = oldTs.styles;
                            this.addFavorite(newTs, fav.label);
                        });
                    }
                    // group
                    if (fav.collection) {
                        var count = 0;
                        var newColl = [];
                        angular.forEach(fav.collection, (ts) => {
                            count++;
                            seriesApiInterface.getTimeseries(ts.id, ts.apiUrl).then((newTs) => {
                                newTs.styles = ts.styles;
                                newColl.push(newTs);
                                count--;
                                if (count === 0) {
                                    this.addFavoriteGroup(newColl, fav.label);
                                }
                            });
                        });
                    }
                });
                saveFavorites();
            };

            this.changeLabel = (favorite, label) => {
                this.favorites[favorite.id].label = label;
                saveFavorites();
            };

            // load favorites
            this.setFavorites(localStorageService.get(storageKey));
        }
    ])
    .service('favoriteImExportService', ['favoriteService', '$translate', 'alertService', 'utils',
        function(favoriteService, $translate, alertService, utils) {
            this.importFavorites = (event) => {
                if (utils.isFileAPISupported() && angular.isObject(event)) {
                    var override = true;
                    if (favoriteService.hasFavorites()) {
                        override = window.confirm($translate.instant('favorite.import.override'));
                    }
                    if (override) {
                        var files = event.target.files;
                        if (files && files.length > 0) {
                            var reader = new window.FileReader();
                            reader.readAsText(files[0]);
                            reader.onerror = function() {
                                alertService.error($translate.instant('favorite.import.wrongFile'));
                            };
                            reader.onload = $.proxy(function(e) {
                                favoriteService.setFavorites(angular.fromJson(e.target.result));
                            }, this);
                        }
                    }
                }
            };

            this.exportFavorites = () => {
                if (utils.isFileAPISupported()) {
                    var filename = 'favorites.json';
                    var content = angular.toJson(favoriteService.favorites, 2);
                    if (window.navigator.msSaveBlob) {
                        // IE version >= 10
                        var blob = new window.Blob([content], {
                            type: 'application/json;charset=utf-8;'
                        });
                        window.navigator.msSaveBlob(blob, filename);
                    } else {
                        // FF, Chrome ...
                        var a = document.createElement('a');
                        a.href = 'data:application/json,' + encodeURIComponent(content);
                        a.target = '_blank';
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                    }
                }
            };
        }
    ]);
