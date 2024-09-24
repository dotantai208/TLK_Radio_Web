var app = angular.module("app", []);
app.controller('MusicController', function ($scope, $http, $window, $location, $timeout) {
    var nowPlaying = document.querySelector('.now-playing');
    var trackArt = document.querySelector('.track-art');
    var trackName = document.querySelector('.track-name');
    var trackArtist = document.querySelector('.track-artist');

    var playpauseTrackBtn = document.querySelector('.playpause-track');
    var nextTrackBtn = document.querySelector('.next-track');
    var prevTrackBtn = document.querySelector('.prev-track');

    var seekSlider = document.querySelector('.seek_slider');
    var volumeSlider = document.querySelector('.volume_slider');
    var currentTime = document.querySelector('.current-time');
    var totalDuration = document.querySelector('.total-duration');
    var wave = document.getElementById('wave');
    var randomIcon = document.querySelector('.fa-random');
    var randomTrackBtn = document.querySelector('.random-track');
    var repeatTrackBtn = document.querySelector('.repeat-track');
    var musicPlayerColor = document.querySelector('.music-player');

    var audio = new Audio();
    var trackIndex = -1;
    var trackID = 0;
    var isPlaying = false;
    var isRandom = false;
    var updateTimer;
    var checkAd = false;
    var countAd = 3;
    $scope.checkSearch = false;
    $scope.searchText = '';
    $scope.tracks = [];
    $scope.artists = [];
    $scope.albums = [];
    $scope.paginatedTracks = [];
    $scope.currentPage = 0;
    $scope.pageSize = 8;
    $scope.path = $window.location.pathname;
    $scope.checkRecent = false;
    $scope.LoginAccount;
    $scope.memorySong;
    $scope.newPlaylist = {};
    $scope.tracksInPlaylist = [];


    var host = "http://localhost:8080/rest";
    var playCount = 0; // Counter for tracks played

    $scope.loadDataForLoginAccount = function () {
        var url = host + "/checkUserLogin";

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                $scope.$apply(function () {
                    if (data.loggedIn) {
                        $scope.LoginAccount = data;
                        console.log($scope.LoginAccount);


                    } else {
                        $scope.LoginAccount = data;
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching user login status:', error);
            });


    }

    $scope.loadDataForLoginAccount();


    $scope.pagination = {};
    $scope.pagination.Pager = { TotalItems: 0, PageSize: 8, CurrentPage: 1, TotalPages: 0 };
    $scope.pagination.Search = {};

    $scope.loadDataForPage = function (page) {
        $scope.setCurrentPage(page);
        $scope.pagination.currentPageSong = $scope.getCurrentSong();
        if ($scope.path.includes("artist")) {
            $scope.pagination.currentPageArtist = $scope.getCurrentArtist();
        } else if ($scope.path.includes("album")) {
            $scope.pagination.currentPageAlbum = $scope.getCurrentAlbum();
        } else if ($scope.path.includes("playlist")) {
            $scope.pagination.currentPagePlaylist = $scope.getCurrentPlaylist();
        } else if ($scope.path.includes("topic")) {
            $scope.pagination.currentPageTopic = $scope.getCurrentTopic();
        }

    };

    $scope.setCurrentPage = function (page) {
        if (page >= 1 && page <= $scope.pagination.Pager.TotalPages) {
            $scope.pagination.Pager.CurrentPage = page;
        }
    };

    function calculatePages() {
        $scope.pagination.Pager.TotalPages = Math.ceil($scope.pagination.Pager.TotalItems / $scope.pagination.Pager.PageSize);

        $scope.pagination.pages = Array.from(
            { length: $scope.pagination.Pager.TotalPages },
            (_, index) => index + 1
        );
        console.log($scope.pagination.pages);
    }

    $scope.getCurrentSong = function () {
        var startIndex = ($scope.pagination.Pager.CurrentPage - 1) * $scope.pagination.Pager.PageSize;
        var endIndex = startIndex + $scope.pagination.Pager.PageSize;
        return $scope.tracks.slice(startIndex, endIndex);
    };

    $scope.getCurrentArtist = function () {
        var startIndex = ($scope.pagination.Pager.CurrentPage - 1) * $scope.pagination.Pager.PageSize;
        var endIndex = startIndex + $scope.pagination.Pager.PageSize;
        return $scope.artists.slice(startIndex, endIndex);
    };


    $scope.getCurrentAlbum = function () {
        var startIndex = ($scope.pagination.Pager.CurrentPage - 1) * $scope.pagination.Pager.PageSize;
        var endIndex = startIndex + $scope.pagination.Pager.PageSize;
        return $scope.albums.slice(startIndex, endIndex);
    };

    $scope.getCurrentPlaylist = function () {
        var startIndex = ($scope.pagination.Pager.CurrentPage - 1) * $scope.pagination.Pager.PageSize;
        var endIndex = startIndex + $scope.pagination.Pager.PageSize;
        return $scope.playlists.slice(startIndex, endIndex);
    };

    $scope.getCurrentTopic = function () {
        var startIndex = ($scope.pagination.Pager.CurrentPage - 1) * $scope.pagination.Pager.PageSize;
        var endIndex = startIndex + $scope.pagination.Pager.PageSize;
        return $scope.topics.slice(startIndex, endIndex);
    };


    $scope.search = function () {
        var search = $scope.searchText;
        intPage = 1;
        if (search != '') {
            var url = host + "/Song/FindByName/" + search;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    $scope.checkSearch = true;

                    return Promise.all(data.map(track => {
                        var url2 = host + "/Song_Artist/SongId=" + track.id;
                        return fetch(url2)
                            .then(response => response.json())
                            .then(artists => {
                                track.artists = artists.map(artist => artist.stageName);
                            })
                            .catch(error => {
                                console.error('Error fetching artist data:', error);
                            });
                    }))
                        .then(() => {
                            $scope.$apply(function () {
                                $scope.tracks = data;

                                console.log(data);
                                console.log($scope.tracks);
                                $scope.pagination.Pager.TotalItems = $scope.tracks.length || 0;
                                $scope.pagination.Pager.CurrentPage = intPage;
                                calculatePages();
                                $scope.loadDataForPage($scope.pagination.Pager.CurrentPage);
                            });
                        });

                })
                .then(() => {
                    $scope.$apply(function () {


                    });

                });

        } else {
            $scope.checkSearch = true;
            $scope.loadTracksFromJSON();
        }


    };

    $scope.searchArtistName = function () {
        var search = $scope.searchText;
        intPage = 1;
        if (search != '') {
            var url = host + "/Artist/FindByName/" + search;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    $scope.checkSearch = true;
                    console.log(data);
                    $scope.$apply(function () {
                        $scope.artists = data;

                        console.log(data);

                        $scope.pagination.Pager.TotalItems = $scope.artists.length || 0;
                        $scope.pagination.Pager.CurrentPage = intPage;
                        calculatePages();
                        $scope.loadDataForPage($scope.pagination.Pager.CurrentPage);
                    });

                })
                .then(() => {

                });

        } else {
            $scope.checkSearch = true;
            $scope.loadDataForPageArtist();
        }

    };

    $scope.searchAlbumName = function () {
        var search = $scope.searchText;
        intPage = 1;
        if (search != '') {
            var url = host + "/Album/FindByName/" + search;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    $scope.checkSearch = true;
                    console.log(search);
                    $scope.$apply(function () {
                        $scope.albums = data;

                        console.log($scope.albums);

                        $scope.pagination.Pager.TotalItems = $scope.artists.length || 0;
                        $scope.pagination.Pager.CurrentPage = intPage;
                        calculatePages();
                        $scope.loadDataForPage($scope.pagination.Pager.CurrentPage);
                        console.log($scope.pagination.currentPageAlbum);
                    });
                })


        } else {
            $scope.checkSearch = true;
            $scope.loadDataForPageAlbum();
        }

    };

    $scope.searchPlaylistName = function () {
        var search = $scope.searchText;
        intPage = 1;
        if (search != '') {
            var url = host + "/Playlist/FindByName/" + search;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    $scope.checkSearch = true;
                    console.log(search);
                    $scope.$apply(function () {
                        $scope.playlists = data;

                        console.log($scope.playlists);
                        $scope.pagination.Pager.PageSize = 6;
                        $scope.pagination.Pager.TotalItems = $scope.playlists.length || 0;
                        $scope.pagination.Pager.CurrentPage = intPage;
                        calculatePages();
                        $scope.loadDataForPage($scope.pagination.Pager.CurrentPage);
                        console.log($scope.pagination.currentPageAlbum);
                    });
                })


        } else {
            $scope.checkSearch = true;
            $scope.loadDataForPagePlaylist();
        }

    };

    $scope.searchTopicName = function () {
        var search = $scope.searchText;
        intPage = 1;
        if (search != '') {
            var url = host + "/topics/searchbyname/" + search;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    $scope.checkSearch = true;
                    console.log(data);
                    $scope.$apply(function () {
                        $scope.topics = data;

                        console.log(data);

                        $scope.pagination.Pager.TotalItems = $scope.topics.length || 0;
                        $scope.pagination.Pager.CurrentPage = intPage;
                        calculatePages();
                        $scope.loadDataForPage($scope.pagination.Pager.CurrentPage);
                    });

                })
                .then(() => {

                });

        } else {
            $scope.checkSearch = true;
            $scope.loadDataForPageTopic();
        }

    };

    $scope.calculateTotalRows = function () {
        return $scope.tracks.length;
    };

    $scope.goToPage = function (page) {
        console.log('gotopage');
        $scope.loadDataForPage(page);
    };

    $scope.nextPage = function () {
        if ($scope.pagination.Pager.CurrentPage < $scope.pagination.Pager.TotalPages) {
            $scope.pagination.Pager.CurrentPage++;
            $scope.loadDataForPage($scope.pagination.Pager.CurrentPage);
        }
    };

    $scope.prevPage = function () {
        if ($scope.pagination.Pager.CurrentPage > 1) {
            $scope.pagination.Pager.CurrentPage--;
            $scope.loadDataForPage($scope.pagination.Pager.CurrentPage);
        }
    };


    $scope.searchByNameSong = function (name) {
        console.log(name);
        var url = host + "/Song/FindByName/" + name;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                return Promise.all(data.map(track => {
                    var url2 = host + "/Song_Artist/SongId=" + track.id;
                    return fetch(url2)
                        .then(response => response.json())
                        .then(artists => {
                            track.artists = artists.map(artist => artist.stageName);
                        })
                        .catch(error => {
                            console.error('Error fetching artist data:', error);
                        });
                }))
                    .then(() => {
                        $scope.$apply(function () {
                            $scope.paginatedTracks = data;

                            console.log(data);
                            console.log($scope.paginatedTracks);
                        });
                    });

            })
            .then(() => {
                $scope.$apply(function () {
                    $scope.updatePaginatedTracks();

                });


            });
    }

    $scope.loadDataNewSong = function(){
        var urlSong;
        if($scope.path.includes("/artist") || $scope.path.includes("/index")){
            urlSong = host + "/Song5New";
        }else{
            urlSong = host + "/Song4New";
        }
         
        intPage = 1;
        console.log(urlSong);
        fetch(urlSong)
            .then(response => response.json())
            .then(data => {
                $scope.track5new = data;
                console.log($scope.tracks);

                return Promise.all($scope.track5new.map(track => {
                    var url2 = host + "/Song_Artist/SongId=" + track.id;

                    return fetch(url2)
                        .then(response => response.json())
                        .then(artists => {
                            track.artists = artists.map(artist => artist.stageName);
                        })
                        .catch(error => {
                            console.error('Error fetching artist data:', error);
                        });
                }));
            })
            .catch(error => {
                console.error('Error loading new tracks:', error);
            });
    }

    $scope.loadDataNewSong();

    $scope.loadData5NewArtist = function(){
        var urlSong = host + "/Artist5New";
        intPage = 1;
        console.log(urlSong);
        fetch(urlSong)
            .then(response => response.json())
            .then(data => {
                $scope.artist5new = data;

            })
            .catch(error => {
                console.error('Error loading new artist:', error);
            });
    }

    $scope.loadData6NewArtist = function(){
        var urlSong = host + "/Artist6New";
        intPage = 1;
        console.log(urlSong);
        fetch(urlSong)
            .then(response => response.json())
            .then(data => {
                $scope.artist6new = data;

            })
            .catch(error => {
                console.error('Error loading new artist:', error);
            });
    }

    $scope.loadData5NewArtist();
    $scope.loadData6NewArtist();

    $scope.loadTracksFromJSON = function () {
        $scope.loadDataForLoginAccount();
        console.log($scope.LoginAccount);
        var url = host + "/checkUserLogin";
        
        //load danh sách playlist nếu đã đăng nhập
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                $scope.$apply(function () {
                    if (data.loggedIn) {
                        var urlUsername = host + "/Playlist/FindByUsername/" + data.account.username;
                        fetch(urlUsername)
                            .then(response => response.json())
                            .then(data => {
                                $scope.$apply(function () {
                                    $scope.playlistOfMyForSong = data;
                                    console.log($scope.playlistOfMyForSong);
                                });
                            })
                            .catch(error => {
                                console.error('Error fetching artists:', error);
                            });
                    }
                });
            });

        var urlSong = host + "/Song";

        //Load danh sách tất cả bài hát
        intPage = 1;
        console.log(urlSong);
        fetch(urlSong)
            .then(response => response.json())
            .then(data => {
                $scope.tracks = data;
                console.log($scope.tracks);

                return Promise.all($scope.tracks.map(track => {
                    var url2 = host + "/Song_Artist/SongId=" + track.id;

                    return fetch(url2)
                        .then(response => response.json())
                        .then(artists => {
                            track.artists = artists.map(artist => artist.stageName);
                        })
                        .catch(error => {
                            console.error('Error fetching artist data:', error);
                        });
                }));
            })
            .then(() => {
                if ($scope.path.includes("song")) {
                    $scope.$apply(function () {
                        $scope.pagination.Pager.TotalItems = $scope.tracks.length || 0;
                        console.log($scope.pagination.Pager.TotalItems);
                        $scope.pagination.Pager.CurrentPage = intPage;
                        calculatePages();
                        $scope.loadDataForPage($scope.pagination.Pager.CurrentPage);
                    });
                }
                $scope.$apply(function () {
                    if($scope.tracksInPlaylist.length != 0){
                        $scope.loadTrack($scope.tracksInPlaylist.length-1);
                        trackIndex = $scope.tracksInPlaylist.length-1;
                    }else {
                        //load lên quảng cáo nếu chưa có bài hát nào
                        var url = host + "/Advertise";
                        fetch(url)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.json();
                            })
                            .then(data => {
                                $scope.$apply(function () {
                                    $scope.dataAd = data;
                
                                    // Chọn một quảng cáo ngẫu nhiên từ danh sách
                                    if ($scope.dataAd.length > 0) {
                                        var randomIndex = Math.floor(Math.random() * $scope.dataAd.length);
                                        var randomAdvertise = $scope.dataAd[randomIndex];
                                        
                                            audio.removeEventListener('ended', handleAudioAdLoadFirstEnded);
                                        audio.src = host + '/get-file-via-byte-array-resource?filename=' + randomAdvertise.mp3;
                                        audio.load();
                
                                        trackArt.style.backgroundImage = 'url(/asset/images/ad/' + randomAdvertise.image + ')';
                                        trackName.textContent = randomAdvertise.name;
                                        trackArtist.textContent = randomAdvertise.description;
                                        nowPlaying.textContent = "Quảng cáo";
                
                                        updateTimer = setInterval($scope.setUpdate, 1000);
                                        console.log('do goi quang cao lan dau')
                                        // Remove any existing 'ended' event listener
                                        
                                        // Add the event listener only once
                                        audio.addEventListener('ended', handleAudioAdLoadFirstEnded);
                
                                        seekSlider.style.background = "#4286f4";
                                        seekSlider.setAttribute('disabled', true);
                                        randomBgColor();
                
                                        
                                    } else {
                                        console.log('Danh sách quảng cáo trống.');
                                    }
                                });
                            })
                            .catch(error => {
                                console.error('Error fetching user login status:', error);
                            });
                    }
                       
                });
            })
            .catch(error => {
                console.error('Error loading tracks:', error);
            });

    };

    // Declare the event handler function outside
    function handleAudioAdLoadFirstEnded() {
        console.log('goi lan thu ' + playCount);
        //trackIndex--;
        console.log('goi cua quang cao');
        
        //$scope.nextTrackWithTopic();
        console.log('bo chan dieu khien');
       
        seekSlider.removeAttribute('disabled');
        enableControls()
        seekSlider.style.background = "";
    }

    $scope.loadDataForPageAlbum = function () {
        if ($scope.path.includes("/album/detail/")) {
            var path = window.location.href;
            // Tách chuỗi để lấy stageName
            var albumName = $scope.path.split('/').pop();
            var decodedAlbumName = decodeURIComponent(albumName);

            // Đặt stageName vào scope để có thể sử dụng trong view
            console.log(decodedAlbumName);
            var urlArtist = host + "/Album/FindByNameExactly/" + decodedAlbumName;
            fetch(urlArtist)
                .then(response => response.json())
                .then(data => {
                    $scope.$apply(function () {
                        console.log(data);
                        $scope.AlbumDetail = data;
                        $scope.AlbumArtistDetail = data.artist; // Gán artist vào $scope.ArtistDetail
                       // Lọc danh sách bài hát, chỉ lấy những bài hát có thuộc tính deleted = false
                        $scope.AlbumSongs = data.song.filter(track => track.deleted);
                        return Promise.all($scope.AlbumSongs.map(track => {
                            var urlSongArtist = host + "/Song_Artist/SongId=" + track.id;

                            return fetch(urlSongArtist)
                                .then(response => response.json())
                                .then(artists => {
                                    track.artists = artists.map(artist => artist.stageName);
                                })
                                .catch(error => {
                                    console.error('Error fetching artist data:', error);
                                });
                        }));
                    });
                })
                .catch(error => {
                    console.error('Error fetching artists:', error);
                });
            var urlArtist = host + "/Album/FindByNameExactly/" + decodedAlbumName;
            fetch(urlArtist)
                .then(response => response.json())
                .then(data => {
                    $scope.$apply(function () {
                        console.log(data);
                        $scope.AlbumDetail = data;
                    });
                })
                .catch(error => {
                    console.error('Error fetching artists:', error);
                });
        } else if ($scope.path.includes("/album")) {
            var urlArtist = host + "/Album";
            fetch(urlArtist)
                .then(response => response.json())
                .then(data => {
                    $scope.$apply(function () {
                        $scope.albums = data;
                        console.log($scope.albums);
                        $scope.pagination.Pager.TotalItems = $scope.albums.length || 0;
                        console.log($scope.pagination.Pager.TotalItems);
                        $scope.pagination.Pager.CurrentPage = intPage;
                        calculatePages();
                        $scope.loadDataForPage($scope.pagination.Pager.CurrentPage);
                    });
                })
                .catch(error => {
                    console.error('Error fetching artists:', error);
                });
        }
    }

    $scope.loadDataForPageAlbum();

    $scope.loadDataForPageArtist = function () {
        if ($scope.path.includes("/artist/detail/")) {
            var path = window.location.href;
            // Tách chuỗi để lấy stageName
            var stageName = $scope.path.split('/').pop();
            var decodedStageName = decodeURIComponent(stageName);

            // Đặt stageName vào scope để có thể sử dụng trong view
            console.log(decodedStageName);

            var urlArtist = host + "/Artist/" + decodedStageName;

            fetch(urlArtist)
                .then(response => response.json())
                .then(data => {
                    $scope.$apply(function () {
                        console.log(data);
                        $scope.ArtistDetail = data;
                    });
                })
                .catch(error => {
                    console.error('Error fetching artists:', error);
                });


            var urlArtistSongs = host + "/Song_Artist/StageName=" + decodedStageName;
            fetch(urlArtistSongs)
                .then(response => response.json())
                .then(data => {
                    $scope.$apply(function () {

                        console.log(data);
                        $scope.ArtistSong = data;
                        return Promise.all($scope.ArtistSong.map(track => {
                            var urlSongArtist = host + "/Song_Artist/SongId=" + track.id;

                            return fetch(urlSongArtist)
                                .then(response => response.json())
                                .then(artists => {
                                    track.artists = artists.map(artist => artist.stageName);
                                })
                                .catch(error => {
                                    console.error('Error fetching artist data:', error);
                                });
                        }));
                    });
                })
                .catch(error => {
                    console.error('Error fetching artists:', error);
                });

            var urlArtistAlbum = host + "/Album/StageName/" + decodedStageName;
            fetch(urlArtistAlbum)
                .then(response => response.json())
                .then(data => {
                    $scope.$apply(function () {

                        console.log(data);
                        $scope.ArtistAlbum = data;
                    });
                })
                .catch(error => {
                    console.error('Error fetching artists:', error);
                });

        } else if ($scope.path.includes("/artist")) {
            var urlArtist = host + "/Artist";
            fetch(urlArtist)
                .then(response => response.json())
                .then(data => {
                    $scope.$apply(function () {
                        $scope.artists = data;
                        console.log($scope.artists);
                    });
                    $scope.$apply(function () {
                        $scope.pagination.Pager.PageSize = 6;
                        $scope.pagination.Pager.TotalItems = $scope.artists.length || 0;
                        console.log($scope.pagination.Pager.TotalItems);
                        $scope.pagination.Pager.CurrentPage = intPage;
                        calculatePages();
                        $scope.loadDataForPage($scope.pagination.Pager.CurrentPage);
                    });
                })
                .catch(error => {
                    console.error('Error fetching artists:', error);
                });
        }
    }

    $scope.loadDataForPageArtist();

    $scope.loadDataForPagePlaylist = function () {
        //Data for detail playlist
        if ($scope.path.includes("/playlist/detail/")) {
            var path = window.location.href;
            // Tách chuỗi để lấy stageName
            var playlistid = $scope.path.split('/').pop();
            console.log(playlistid);
            var urlArtist = host + "/Playlist/FindById/" + playlistid;

            fetch(urlArtist)
                .then(response => response.json())
                .then(data => {
                    $scope.$apply(function () {
                        $scope.detailPlayList = data;
                        console.log($scope.detailPlayList);
                        
                        var urlPlaylistSong = host + "/Playlist_Song/PlaylistID=" + $scope.detailPlayList.id;
                        return fetch(urlPlaylistSong)
                            .then(response => response.json())
                            .then(data => {
                                if (data.data === true) {
                                    console.log(data);
                                    $scope.detailPlaylistSong = data;
                                    console.log($scope.detailPlaylistSong.song);
                                    //$scope.detailPlayList.song.song = $scope.detailPlayList.song.song.filter(track => track.deleted);
                                    return Promise.all($scope.detailPlaylistSong.song.map(track => {
                                        var urlSongArtist = host + "/Song_Artist/SongId=" + track.song.id;

                                        return fetch(urlSongArtist)
                                            .then(response => response.json())
                                            .then(artists => {
                                                track.song.artists = artists.map(artist => artist.stageName);
                                            })
                                            .catch(error => {
                                                console.error('Error fetching artist data:', error);
                                            });
                                    }));
                                } else {
                                    console.log($scope.detailPlaylistSong);
                                    return Promise.resolve();  // Ensure a resolved promise if data.data is not true
                                }
                            })
                            .then(() => {
                                // Apply the changes after all promises are resolved
                                $scope.$apply();
                                console.log($scope.detailPlaylistSong);
                            })
                            .catch(error => {
                                console.error('Error fetching playlist songs:', error);
                            });
                    });
                })
                .catch(error => {
                    console.error('Error fetching playlist:', error);
                });
        }

        //Data for playlist
        else if ($scope.path.includes("playlist")) {
            var urlArtist = host + "/PlaylistPublic";
            fetch(urlArtist)
                .then(response => response.json())
                .then(data => {
                    $scope.$apply(function () {
                        $scope.playlists = data;
                        console.log($scope.playlists);
                        $scope.pagination.Pager.PageSize = 6;
                        $scope.pagination.Pager.TotalItems = $scope.playlists.length || 0;
                        console.log($scope.pagination.Pager.TotalItems);
                        $scope.pagination.Pager.CurrentPage = intPage;
                        calculatePages();
                        $scope.loadDataForPage($scope.pagination.Pager.CurrentPage);
                    });
                })
                .catch(error => {
                    console.error('Error fetching artists:', error);
                });

            var url = host + "/checkUserLogin";
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    $scope.$apply(function () {
                        if (data.loggedIn) {
                            var urlUsername = host + "/Playlist/FindByUsername/" + data.account.username;
                            fetch(urlUsername)
                                .then(response => response.json())
                                .then(data => {
                                    $scope.$apply(function () {
                                        $scope.playlistOfMy = data;
                                        console.log($scope.playlistOfMy);
                                    });
                                })
                                .catch(error => {
                                    console.error('Error fetching artists:', error);
                                });
                        }
                    });
                });


        }
    }

    $scope.isVipValid = function (account) {
        if (!account || !account.dateVip) return false;

        var currentDate = new Date();
        var dateVip = new Date(account.dateVip);

        return account.vip && dateVip >= currentDate;
    };


    $scope.addNewPlaylist = function () {

        $scope.newPlaylist.image = 'playlist_defaul.jpg';

        var currentDate = new Date();
        var formattedDate = currentDate.toISOString(); // ISO 8601 format
        $scope.newPlaylist.createDate = formattedDate;
        console.log($scope.newPlaylist);
        if (!$scope.newPlaylist.share) {
            $scope.newPlaylist.share = false;
        }
        $scope.newPlaylist.deleted = true;
        var url = host + "/checkUserLogin";
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                $scope.$apply(function () {
                    if (data.loggedIn) {
                        $scope.newPlaylist.account = data.account;
                        console.log($scope.newPlaylist);
                        var postUrl = host + "/Playlist";
                        let cleanPlaylist = JSON.parse(JSON.stringify($scope.newPlaylist));
                        fetch(postUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(cleanPlaylist)
                        })
                            .then(response => {
                                if (response.ok) {
                                    return response.text(); // Chuyển đổi thành văn bản nếu không cần dữ liệu JSON
                                } else if (response.status === 409) {
                                    return response.text(); // Xử lý thông báo xung đột
                                } else {
                                    throw new Error('Unexpected response status: ' + response.status);
                                }
                            })
                            .then(data => {
                                $scope.$apply(function () {
                                    console.log(data);
                                    $scope.loadDataForPagePlaylist()
                                    $('#modal_form_vertical').modal('hide');
                                    new Noty({
                                        text: 'Đã thêm playlist',
                                        type: 'success',
                                        timeout: 3000
                                    }).show();
                                });
                            })
                            .catch(error => {
                                console.error('Error posting favorite:', error);
                            });
                    } else {

                    }
                });
            });
    }

    $scope.updatePlaylist = function () {
        var postUrl = host + "/Playlist/image/" + $scope.detailPlayList.id;

        var formData = new FormData();
        formData.append("playlist", new Blob([JSON.stringify($scope.detailPlayList)], {
            type: 'application/json'
        }));

        var imageFile = document.getElementById('uploadImage2').files[0];
        if (imageFile) {
            formData.append("image", imageFile);
        }

        fetch(postUrl, {
            method: 'PUT',
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 409) {
                    return response.text();
                } else {
                    throw new Error('Unexpected response status: ' + response.status);
                }
            })
            .then(data => {
                $scope.$apply(function () {
                    // Cập nhật ảnh mới trong scope
                    $scope.detailPlayList.image = data.image;
                    if (imageFile) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            document.getElementById('uploadedAvatar2').src = e.target.result;
                        };
                        reader.readAsDataURL(imageFile);

                    }
                    $scope.loadDataForPagePlaylist();
                    console.log(data);
                    
                    new Noty({
                        text: 'Cập nhật thành công',
                        type: 'success',
                        timeout: 3000
                    }).show();
                });
            })
            .catch(error => {
                console.error('Error updating playlist:', error);
            });
    }

    $scope.deletePlaylist = function(id) {
        var urlBack = "http://localhost:8080/playlist";
        var url = host + "/Playlist/" + id;
    
        // Hiển thị popup xác nhận
        if (window.confirm("Bạn có chắc chắn muốn xóa playlist này?")) {
            fetch(url, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                if (response.status === 204) {
                    return null;
                }
                return response.text();
            })
            .then(data => {
                alert("Xoá thành công");
                $window.location.href = urlBack;
                $scope.loadDataForPagePlaylist();
                $scope.$apply();
            })
            .catch(error => {
                console.error("Error deleting playlist:", error);
            });
        }
    }
    


    $scope.memorySongs = function (song) {
        delete song.artists;
        console.log(song);
        $scope.memorySong = song;
        console.log($scope.memorySong);
    }

    $scope.addSongForPlaylist = function (playlist) {
        var url = host + "/Playlist_Song";
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
            })

        delete playlist.account;
        console.log(playlist);
        var url = host + "/checkUserLogin";
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                $scope.$apply(function () {
                    if (data.loggedIn) {
                        var currentDate = new Date();
                        var formattedDate = currentDate.toISOString(); // ISO 8601 format

                        var playlist_song = {
                            createDate: formattedDate,
                            song: $scope.memorySong,
                            playlist: playlist
                        };
                        delete playlist_song.playlist.$$hashKey;
                        delete playlist_song.song.$$hashKey;
                        console.log(playlist_song);
                        var postUrl = host + "/Playlist_Song";
                        fetch(postUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(playlist_song)
                        })
                            .then(response => {
                                if (response.ok) {
                                    return response.text(); // Chuyển đổi thành văn bản nếu không cần dữ liệu JSON
                                } else if (response.status === 409) {
                                    return response.text(); // Xử lý thông báo xung đột
                                } else {
                                    throw new Error('Unexpected response status: ' + response.status);
                                }
                            })
                            .then(data => {
                                $scope.$apply(function () {
                                    console.log(data);

                                    
                                    new Noty({
                                        text: 'Đã thêm vào playlist',
                                        type: 'success',
                                        timeout: 3000
                                    }).show();


                                });
                            })
                            .catch(error => {
                                console.error('Error posting favorite:', error);
                            });
                    }
                });
            });
    }

    $scope.deleteSongInPlaylist = function (id) {
        var url = host + "/Playlist_Song/" + id;
        console.log(id);
        fetch(url, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // Kiểm tra nếu phản hồi có nội dung
                if (response.status === 204) {
                    return null;
                }
                return response.text();
            })
            .then(data => {
                $scope.loadDataForPagePlaylist();
                console.log("Delete successful:", data);

                // Áp dụng $scope.$apply() để cập nhật lại view nếu cần
                $scope.$apply();
            })
            .catch(error => {
                console.error("Error deleting playlist song:", error);
            });
    }





    
    $scope.loadDataForPagePlaylist();


    $scope.loadTrack = function (trackIndex) {
        seekSlider.removeAttribute('disabled');
        console.log('load track');
        //console.log(trackIndex);
        var track = $scope.tracksInPlaylist[trackIndex];
        $scope.reset();

        if (!track) {
            console.error('Track not found');
            return;
        }

        audio.src = host + '/get-file-via-byte-array-resource?filename=' + track.mp3;
        audio.load();
        
        audio.removeEventListener('ended', $scope.nextTrackWithTopic);

        trackArt.style.backgroundImage = 'url(/asset/images/song/' + track.image + ')';
        trackName.textContent = track.name;
        trackArtist.textContent = track.artists;
        nowPlaying.textContent = "" + (trackIndex + 1) + " của " + $scope.tracksInPlaylist.length;

        updateTimer = setInterval($scope.setUpdate, 1000);

        
        audio.addEventListener('ended', $scope.nextTrackWithTopic);
        randomBgColor();
        $scope.addRecentSong(track.id);
        $scope.updateCountViewTrack(track);
        $scope.checkRecent = false;
        console.log('end loadtrack');
        $timeout(function() {
            var allItems = document.querySelectorAll('.playlist-song-item-area');

            if (allItems.length > 0) {
                allItems.forEach(function (item) {
                    item.classList.remove('active');
                });
    
                // Thêm lớp 'active' vào mục được chọn
                var selectedItem = document.querySelectorAll('.playlist-song-item-area')[trackIndex];
                if (selectedItem) {
                    selectedItem.classList.add('active');
                } else {
                    console.error('Selected item not found');
                }
            }
        }, 0);

    }

    $scope.loadTrackID = function (songId) {
        seekSlider.removeAttribute('disabled');
        console.trace('Trace loadTrackID');
        
        var track = null;
        var check = true;
        console.log('loadtrackID');
        // Vòng lặp qua các track để tìm track có ID tương ứng

        for (var i = 0; i < $scope.tracks.length; i++) {
            if ($scope.tracks[i].id === songId) {
                track = $scope.tracks[i];
                trackID = songId;
                trackIndex = i;
                break;
            }
        }

        for (var i = 0; i < $scope.tracksInPlaylist.length; i++) {
            if ($scope.tracksInPlaylist[i].id === songId) {
                trackIndex = i;
                check = false;
                break;
            }
        }

        if(check){
            $scope.tracksInPlaylist.push(track);
            trackIndex = $scope.tracksInPlaylist.length -1;
        }



        if (!track) {
            console.error('Không tìm thấy bài hát');
            return;
        }

        $scope.reset();

        //console.log(trackID);
        //console.log(trackIndex);

        audio.removeEventListener('ended', $scope.nextTrackWithTopic);
        audio.src = host + '/get-file-via-byte-array-resource?filename=' + track.mp3;
        audio.load();

        trackArt.style.backgroundImage = 'url(/asset/images/song/' + track.image + ')';
        trackName.textContent = track.name;
        trackArtist.textContent = track.artists;
        nowPlaying.textContent = "" + (trackIndex + 1) + " của " + $scope.tracksInPlaylist.length;

        updateTimer = setInterval($scope.setUpdate, 1000);

        audio.addEventListener('ended', $scope.nextTrackWithTopic);
        randomBgColor();

        //add recent track
        $scope.addRecentSong(track.id);
        $scope.updateCountViewTrack(track);
        $scope.checkRecent = false;

        
        //Lưu danh sách vào session
        $scope.savePlaylistToSession();
        console.log('end loadtrackID');

        $timeout(function() {
            var allItems = document.querySelectorAll('.playlist-song-item-area');
            console.log(allItems);
            if (allItems.length > 0) {
                allItems.forEach(function(item) {
                    item.classList.remove('active');
                });
    
                var selectedItem = allItems[trackIndex];
                if (selectedItem) {
                    selectedItem.classList.add('active');
                } else {
                    console.error('Không tìm thấy mục được chọn');
                }
            }
        }, 1000);

    };

    $scope.savePlaylistToSession = function() {
        if ($scope.tracksInPlaylist && $scope.tracksInPlaylist.length > 0) {
            // Chuyển đổi danh sách track thành chuỗi JSON để lưu trữ
            sessionStorage.setItem('tracksInPlaylist', JSON.stringify($scope.tracksInPlaylist));
        } else {
            console.warn('Không có bài hát nào trong danh sách để lưu.');
        }
    };

    $scope.loadPlaylistFromSession = function() {
        var savedPlaylist = sessionStorage.getItem('tracksInPlaylist');
        if (savedPlaylist) {
            $scope.tracksInPlaylist = JSON.parse(savedPlaylist);
        } else {
            $scope.tracksInPlaylist = [];
        }
    };
    
    // Gọi hàm load danh sách phát khi khởi tạo
    $scope.loadPlaylistFromSession();

    $scope.clearPlaylistFromSession = function() {
        // Xóa danh sách phát khỏi session storage
        sessionStorage.removeItem('tracksInPlaylist');
        // Đặt lại danh sách phát trong scope
        $scope.tracksInPlaylist = [];

        trackIndex = -1;
        console.log('length: '+ $scope.tracksInPlaylist.length);
        console.log('clear: '+trackIndex);
    };


    $scope.updateCountViewTrack = function (track) {
        // console.log(track);
        // // Tăng số lượt xem lên 1
        // console.log(track);

        if ($scope.checkRecent == true) {
            var updateSongUrl = host + "/Song/UpdateCouview/" + track.id;
            fetch(updateSongUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    $scope.$apply(function () {
                        console.log(data);
                        // Thực hiện các hành động tiếp theo sau khi bài hát được cập nhật
                    });
                })
                .catch(error => {
                    console.error('Error updating song:', error);
                });
        }

    }


    function randomBgColor() {
        let hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e'];
        let a = "";

        function populate(a) {
            for (let i = 0; i < 6; i++) {
                let x = Math.round(Math.random() * 14);
                let y = hex[x];
                a += y;
            }
            return a;
        }

        let Color1 = populate('#');
        let Color2 = populate('#');
        var angle = 'to right';

        let gradient = 'linear-gradient(' + angle + ',' + Color1 + ', ' + Color2 + ")";
        //  document.body.style.background = gradient;
    }

    $scope.reset = function () {
        currentTime.textContent = "00:00";
        totalDuration.textContent = "00:00";
        seekSlider.value = 0;
    }

    $scope.randomTrack = function () {
        isRandom ? pauseRandom() : playRandom();
    }

    function playRandom() {
        isRandom = true;
        randomIcon.classList.add('randomActive');
        randomIcon.style.color = "#5705a9";
    }

    function pauseRandom() {
        isRandom = false;
        randomIcon.classList.remove('randomActive');
        randomIcon.style.color = "";
    }

    $scope.repeatTrack = function repeatTrack() {
        let current_index = trackIndex;
        $scope.loadTrack(current_index);
        $scope.playTrack();
    }

    playpauseTrackBtn.addEventListener('click', function () {
        isPlaying ? $scope.pauseTrack() : $scope.playTrack();
    });

    $scope.playTrack = function () {
        audio.play();
        isPlaying = true;
        trackArt.classList.add('rotate');
        playpauseTrackBtn.innerHTML = '<i class="fa fa-pause-circle fa-2x"></i>';
    }

    $scope.pauseTrack = function () {
        audio.pause();
        isPlaying = false;
        trackArt.classList.remove('rotate');
        playpauseTrackBtn.innerHTML = '<i class="fa fa-play-circle fa-2x"></i>';
    }

    $scope.nextTrackWithTopic = function(){
        $timeout(function() {
            var allItems = document.querySelectorAll('.playlist-song-item-area');
            console.log(allItems);
            if (allItems.length > 0) {
                allItems.forEach(function(item) {
                    item.classList.remove('active');
                });
    
                var selectedItem = allItems[trackIndex];
                if (selectedItem) {
                    selectedItem.classList.add('active');
                } else {
                    //console.error('Không tìm thấy mục được chọn');
                }
            }
        }, 1000);

        //Kiểm tra đã đăng nhập chưa
        var url = host + "/checkUserLogin";
        var excludedSongIds = $scope.tracksInPlaylist.map(track => track.id);
        
        console.log('batdau ' + playCount);
        console.log('clear: '+trackIndex);
        //-----------
       
        if (playCount === countAd || playCount > countAd) {
            
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('dem' + playCount);
                    if (data.loggedIn && $scope.isVipValid(data.account)) {
                        playCount = 0;

                    } else {
                        playCount = 0;
                        playAdTrack();
                        $scope.disableControls();
                        if(countAd > 1){
                            countAd --;
                        }
                        return;
                    }
                })
                .catch(error => {
                    console.error("Error checking user login:", error);
                });

        } else{
            
            fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                $scope.$apply(function () {
                    console.log('length: '+ $scope.tracksInPlaylist.length);
                    console.log('clear: '+trackIndex);
                    //Xử lý khi đã đăng nhập
                    if(trackIndex === -1 && $scope.tracksInPlaylist.length != 0){
                        console.log('cjeck');
                        trackIndex = 0;
                        $scope.loadTrack(trackIndex);
                        $scope.playTrack();
                        playCount++;
                        return;
                    }
                    else if(trackIndex != $scope.tracksInPlaylist.length -1 && $scope.tracksInPlaylist.length != 0){
                        trackIndex = trackIndex +1;
                        $scope.loadTrack(trackIndex);
                        $scope.playTrack();
                        playCount++;
                        return;
                    } else
                    if (data.loggedIn) {
                        var url = `${host}/Song/suggest?excludedIds=${excludedSongIds.join(',')}`;
        
                        fetch(url)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data) {
                                console.log(data);
                                trackIndex = trackIndex +1;
                                $scope.checkRecent = true;
                                $scope.loadTrackID(data.id);
                                $scope.playTrack();
                                playCount++;
                                return;
                            } else {
                                console.error("Không tìm thấy bài hát");
                            }
                        })
                        .catch(error => {
                            console.error("Error:", error);
                        });
                    } else{
                        console.log(trackIndex);
                        console.log($scope.tracksInPlaylist.length);

                        if($scope.tracksInPlaylist.length === 0){
                            var url = `${host}/Song/NextSongNoData`;
                        
                            fetch(url)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.json();
                            })
                            .then(data => {
                                if (data) {
                                    console.log(data);
                                    trackIndex = trackIndex +1;
                                    $scope.loadTrackID(data.id);
                                    $scope.playTrack();
                                    playCount++;
                                    return;
                                } else {
                                    console.error("Không tìm thấy bài hát");
                                }
                            })
                            .catch(error => {
                                console.error("Error:", error);
                            });
                        }else if(trackIndex === $scope.tracksInPlaylist.length -1 || $scope.tracksInPlaylist.length ===0){
                            

                            var url = `${host}/Song/NextSongWithTopic/${$scope.tracksInPlaylist[trackIndex].id}?excludedIds=${excludedSongIds.join(',')}`;
                        
                            fetch(url)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.json();
                            })
                            .then(data => {
                                if (data) {
                                    console.log(data);
                                    trackIndex = trackIndex +1;
                                    $scope.loadTrackID(data.id);
                                    $scope.playTrack();
                                    playCount++;
                                    return;
                                    
                                } else {
                                    console.error("Không tìm thấy bài hát");
                                }
                            })
                            .catch(error => {
                                console.error("Error:", error);
                            });
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching user login status:', error);
            });
        }
        //-----------
    
        
    }

    $scope.nextTrack = function () {
        

        console.log('batdau ' + playCount);
        if (playCount === 3) {
            var urlUsername = host + "/checkUserLogin";
            fetch(urlUsername)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('dem' + playCount);
                    if (data.loggedIn && $scope.isVipValid(data.account)) {
                        playCount = 0;

                    } else {
                        playCount = 0;
                        playAdTrack();
                        $scope.disableControls();
                    }
                })
                .catch(error => {
                    console.error("Error checking user login:", error);
                });

        } else {
            console.log(trackIndex);
            enableControls();
            if (trackIndex < $scope.tracks.length - 1 && !isRandom) {
                trackIndex += 1;
            } else if (trackIndex < $scope.tracks.length - 1 && isRandom) {
                let random_index = Number.parseInt(Math.random() * $scope.tracks.length);
                trackIndex = random_index;
            } else {
                trackIndex = 0;
            }
            playCount++;
            console.log(trackIndex);
            $scope.checkRecent = true;
            $scope.loadTrack(trackIndex);
            $scope.playTrack();
            console.log(playCount);

        }
    }

    $scope.tracksClickPlaylist = function (Index) {
        if (trackIndex === Index) {
            if (isPlaying) {
                $scope.pauseTrack();
            } else {
                $scope.playTrack();
            }
        } else {
            $scope.checkRecent = true;
            trackIndex = Index;
            console.log(trackIndex);
            $scope.loadTrack(trackIndex);
            $scope.playTrack();
        }
        $scope.updateIcons();
    }

    $scope.tracksClickID = function (ID) {
        console.log(ID);
        if (trackID === ID) {
            if (isPlaying) {
                $scope.pauseTrack();
            } else {
                $scope.playTrack();
            }
        } else {
            $scope.checkRecent = true;
            trackID = ID;
            console.log(trackID);
            $scope.loadTrackID(trackID);
            $scope.playTrack();
        }
        $scope.updateIcons();
    }

    $scope.tracksClick = function (Index) {
        if (trackIndex === Index) {
            if (isPlaying) {
                $scope.pauseTrack();
            } else {
                $scope.playTrack();
            }
        } else {
            $scope.checkRecent = true;
            trackIndex = Index;
            console.log(trackIndex);
            $scope.loadTrack(trackIndex);
            $scope.playTrack();
        }
        $scope.updateIcons();
    }

    $scope.updateIcons = function () {
        var allItemsPlaylist = document.querySelectorAll('.playlist-song-item-area');
        var allItems = document.querySelectorAll('.song-item-area');
        if (allItemsPlaylist != null) {
            allItemsPlaylist.forEach(function (item, index) {
                var playIcon = item.querySelector('.play i');
                if (index === trackIndex && isPlaying) {
                    playIcon.classList.remove('fa-play');
                    playIcon.classList.add('fa-pause');
                } else {
                    playIcon.classList.remove('fa-pause');
                    playIcon.classList.add('fa-play');
                }
            });
        }

        // Cập nhật icon trong danh sách bài hát
        if (allItems.length > 0) {
            allItems.forEach(function (item) {
                var playIcon = item.querySelector('.play i');
                var trackId = item.getAttribute('data-track-id'); // Lấy ID từ thuộc tính dữ liệu
                var trackIdNumber = Number(trackId); // Chuyển đổi trackId thành kiểu số
                var trackIDNumber = Number(trackID); // Chuyển đổi trackID thành kiểu số

                if (trackIdNumber === trackIDNumber && isPlaying) {
                    playIcon.classList.remove('fa-play');
                    playIcon.classList.add('fa-pause');
                } else {
                    playIcon.classList.remove('fa-pause');
                    playIcon.classList.add('fa-play');
                }
            });
        }

    }

    $scope.addRecentSong = function (SongID) {
        var url = host + "/checkUserLogin";
        console.log($scope.checkRecent);
        if ($scope.checkRecent == true) {
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    $scope.$apply(function () {
                        if (data.loggedIn) {
                            console.log(data.account);
                            console.log('User is logged in. Recent');
                            // Thực hiện tiếp hành động ở đây nếu người dùng đã đăng nhập
                            var musicnow = $scope.tracks.find(a => a.id === SongID);
                            var currentDate = new Date();
                            var formattedDate = currentDate.toISOString(); // ISO 8601 format
                            var recent = {
                                createDate: formattedDate,
                                account: data.account,
                                song: {
                                    id: musicnow.id,
                                    countView: musicnow.countView || 0,
                                    createDate: musicnow.createDate,
                                    createUser: musicnow.createUser,
                                    deleted: musicnow.deleted || false,
                                    download: musicnow.download || 0,
                                    image: musicnow.image,
                                    mp3: musicnow.mp3,
                                    name: musicnow.name,
                                    updateDate: musicnow.updateDate,
                                    updateUser: musicnow.updateUser
                                }
                            };
                            console.log(recent);
                            var postUrl = host + "/Recent";
                            fetch(postUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(recent)
                            })
                                .then(response => {
                                    if (response.ok) {
                                        return response.text(); // Chuyển đổi thành văn bản nếu không cần dữ liệu JSON
                                    } else if (response.status === 409) {
                                        return response.text(); // Xử lý thông báo xung đột
                                    } else {
                                        throw new Error('Unexpected response status: ' + response.status);
                                    }
                                })
                                .then(data => {
                                    $scope.$apply(function () {
                                        console.log(data);

                                    });
                                })
                                .catch(error => {
                                    console.error('Error posting favorite:', error);
                                });


                        } else {
                            console.log('User is not logged in.');
                            // Không làm gì nếu người dùng chưa đăng nhập
                        }
                    });
                })
                .catch(error => {
                    console.error('Error fetching user login status:', error);
                });
        }

    }




    $scope.disableControls = function () {
        nextTrackBtn.style.pointerEvents = 'none';
        nextTrackBtn.style.color = 'grey';
        prevTrackBtn.style.pointerEvents = 'none';
        prevTrackBtn.style.color = 'grey';
        randomTrackBtn.style.pointerEvents = 'none';
        randomTrackBtn.style.color = 'grey';
        repeatTrackBtn.style.pointerEvents = 'none';
        repeatTrackBtn.style.color = 'grey';
    }

    function enableControls() {
        nextTrackBtn.style.pointerEvents = 'auto';
        nextTrackBtn.style.color = 'black';
        prevTrackBtn.style.pointerEvents = 'auto';
        prevTrackBtn.style.color = 'black';
        randomTrackBtn.style.pointerEvents = 'auto';
        randomTrackBtn.style.color = 'black';
        repeatTrackBtn.style.pointerEvents = 'auto';
        repeatTrackBtn.style.color = 'black';
    }

    $scope.prevTrack = function () {
        if (trackIndex > 0) {
            trackIndex--;
        } else {
            trackIndex = $scope.tracks.length - 1;
        }
        $scope.checkRecent = true;
        $scope.loadTrack(trackIndex);
        $scope.playTrack();


    }


    // Declare the event handler function outside
    function handleAudioEnded() {
        console.log('goi lan thu ' + playCount);
        //trackIndex--;
        console.log('goi cua quang cao');
        
        //$scope.nextTrackWithTopic();
        console.log('bo chan dieu khien');
       
        seekSlider.removeAttribute('disabled');
        enableControls()
        seekSlider.style.background = "";
    }

    function playAdTrack() {
        $scope.reset();
        playCount = 0;

        var url = host + "/Advertise";
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                $scope.$apply(function () {
                    $scope.dataAd = data;

                    // Chọn một quảng cáo ngẫu nhiên từ danh sách
                    if ($scope.dataAd.length > 0) {
                        var randomIndex = Math.floor(Math.random() * $scope.dataAd.length);
                        var randomAdvertise = $scope.dataAd[randomIndex];

                        

                        console.log('Quảng cáo ngẫu nhiên:', randomAdvertise);

                        audio.src = host + '/get-file-via-byte-array-resource?filename=' + randomAdvertise.mp3;
                        audio.load();

                        trackArt.style.backgroundImage = 'url(/asset/images/ad/' + randomAdvertise.image + ')';
                        trackName.textContent = randomAdvertise.name;
                        trackArtist.textContent = randomAdvertise.description;
                        nowPlaying.textContent = "Quảng cáo";

                        updateTimer = setInterval($scope.setUpdate, 1000);
                        console.log('do goi quang cao lan sau')
                        // Remove any existing 'ended' event listener
                        audio.removeEventListener('ended', handleAudioEnded);
                        // Add the event listener only once
                        audio.addEventListener('ended', handleAudioEnded);

                        seekSlider.style.background = "#4286f4";
                        seekSlider.setAttribute('disabled', true);
                        randomBgColor();
                        checkAd = true;
                        $scope.playTrack();
                    } else {
                        console.log('Danh sách quảng cáo trống.');
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching user login status:', error);
            });
    }


    seekSlider.addEventListener('change', function () {
        let seekTo = audio.duration * (seekSlider.value / 100);
        audio.currentTime = seekTo;
    });

    volumeSlider.addEventListener('change', function () {
        audio.volume = volumeSlider.value / 100;
    });

    $scope.setUpdate = function () {
        let seekPosition = 0;
        if (!isNaN(audio.duration)) {
            seekPosition = audio.currentTime * (100 / audio.duration);
            seekSlider.value = seekPosition;

            let currentMinutes = Math.floor(audio.currentTime / 60);
            let currentSeconds = Math.floor(audio.currentTime - currentMinutes * 60);
            let durationMinutes = Math.floor(audio.duration / 60);
            let durationSeconds = Math.floor(audio.duration - durationMinutes * 60);

            if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
            if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
            if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
            if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

            currentTime.textContent = currentMinutes + ":" + currentSeconds;
            totalDuration.textContent = durationMinutes + ":" + durationSeconds;
        }
    }

    function isUserLoggedIn() {
        // Kiểm tra sự tồn tại của cookie hoặc token
        return document.cookie.split(';').some((item) => item.trim().startsWith('yourLoginCookie='));
    }

    $scope.addFavorite = function (SongID) {
        var all = host + "/Favorite";
        console.log(SongID);
        var musicnow = $scope.tracks.find(a => a.id === SongID);
        console.log(musicnow);

        var url = host + "/getUserLogin";
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                $scope.$apply(function () {
                    console.log(data);
                    $scope.AccountLogin = data;

                    // Tiếp tục thực hiện POST yêu cầu sau khi đã nhận được dữ liệu người dùng đăng nhập
                    var currentDate = new Date();
                    var formattedDate = currentDate.toISOString(); // ISO 8601 format

                    var favorite = {
                        createDate: formattedDate,
                        account: $scope.AccountLogin,
                        song: {
                            id: musicnow.id,
                            countView: musicnow.countView || 0,
                            createDate: musicnow.createDate,
                            createUser: musicnow.createUser,
                            deleted: musicnow.deleted || false,
                            download: musicnow.download || 0,
                            image: musicnow.image,
                            mp3: musicnow.mp3,
                            name: musicnow.name,
                            updateDate: musicnow.updateDate,
                            updateUser: musicnow.updateUser
                        }
                    };
                    console.log(favorite);

                    var postUrl = host + "/Favorite";
                    fetch(postUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(favorite)
                    })
                        .then(response => {
                            if (response.ok) {
                                return response.text(); // Chuyển đổi thành văn bản nếu không cần dữ liệu JSON
                            } else if (response.status === 409) {
                                return response.text(); // Xử lý thông báo xung đột
                            } else {
                                throw new Error('Unexpected response status: ' + response.status);
                            }
                        })
                        .then(data => {
                            $scope.$apply(function () {
                                console.log(data);
                                // Thông báo cho người dùng về trạng thái
                                if (data === "Favorite added successfully.") {
                                    $('#modal_form_vertical').modal('hide');
                                    new Noty({
                                        text: 'Đã thêm vào danh sách yêu thích',
                                        type: 'success',
                                        timeout: 3000
                                    }).show();
                                } else if (data === "Favorite already exists.") {
                                    $('#modal_form_vertical').modal('hide');
                                    new Noty({
                                        text: 'Bạn đã thích bài hát này trước đó',
                                        type: 'error',
                                        timeout: 3000
                                    }).show();
                                } else {
                                    alert('Unexpected response: ' + data);
                                }
                            });
                        })
                        .catch(error => {
                            console.error('Error posting favorite:', error);
                        });
                });
            })
            .catch(error => {
                console.error('Error fetching user login status:', error);
            });
    };

    $scope.loadDataForPageFavotite = function () {
        if ($scope.path.includes("/favorite")) {
            var username;
            var urlUsername = host + "/checkUserLogin";
            fetch(urlUsername)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.loggedIn) {
                        username = data.account.username;
                        var url = host + "/Favorite/GetByAccount/" + username;
                        fetch(url)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                if (response.status === 204) {
                                    return null;
                                }
                                return response.json();
                            })
                            .then(data => {
                                $scope.$apply(() => {
                                    $scope.dataFavorite = data;
                                    console.log($scope.dataFavorite);
                                });

                                return Promise.all($scope.dataFavorite.map(track => {
                                    var urlSongArtist = host + "/Song_Artist/SongId=" + track.song.id;
                                    return fetch(urlSongArtist)
                                        .then(response => response.json())
                                        .then(artists => {
                                            track.song.artists = artists.map(artist => artist.stageName);
                                        })
                                        .catch(error => {
                                            console.error('Error fetching artist data:', error);
                                        });
                                }));
                            })
                            .then(() => {
                                // Trigger another digest cycle after all artist data is fetched
                                $scope.$apply(() => {
                                    console.log('Artist data loaded', $scope.dataFavorite);
                                });
                            })
                            .catch(error => {
                                console.error("Error loading favorite songs:", error);
                            });
                    }
                })
                .catch(error => {
                    console.error("Error checking user login:", error);
                });
        }
    };

    $scope.loadDataForPageRecent = function () {
        if ($scope.path.includes("/recent")) {
            console.log('recent');
            var username;
            var urlUsername = host + "/checkUserLogin";
            fetch(urlUsername)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.loggedIn) {
                        username = data.account.username;
                        var url = host + "/Recent/GetByAccount/" + username;
                        fetch(url)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                if (response.status === 204) {
                                    return null;
                                }
                                return response.json();
                            })
                            .then(data => {
                                $scope.$apply(() => {
                                    $scope.dataRecent = data;
                                    console.log($scope.dataRecent);
                                });

                                return Promise.all($scope.dataRecent.map(track => {
                                    var urlSongArtist = host + "/Song_Artist/SongId=" + track.song.id;
                                    return fetch(urlSongArtist)
                                        .then(response => response.json())
                                        .then(artists => {
                                            track.song.artists = artists.map(artist => artist.stageName);
                                        })
                                        .catch(error => {
                                            console.error('Error fetching artist data:', error);
                                        });
                                }));
                            })
                            .then(() => {
                                // Trigger another digest cycle after all artist data is fetched
                                $scope.$apply(() => {
                                    console.log('Artist data loaded', $scope.dataFavorite);
                                });
                            })
                            .catch(error => {
                                console.error("Error loading favorite songs:", error);
                            });
                    }
                })
                .catch(error => {
                    console.error("Error checking user login:", error);
                });
        }
    };

    $scope.deleteRecent = function (id) {
        var url = host + "/Recent/" + id;
        console.log(id);
        fetch(url, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // Kiểm tra nếu phản hồi có nội dung
                if (response.status === 204) {
                    return null;
                }
                return response.text();
            })
            .then(data => {
                $scope.loadDataForPageRecent();
                console.log("Delete successful:", data);

                // Áp dụng $scope.$apply() để cập nhật lại view nếu cần
                $scope.$apply();
            })
            .catch(error => {
                console.error("Error deleting playlist song:", error);
            });
    }

    $scope.loadDataForPageRecent();


    $scope.deleteFavorite = function (id) {
        var url = host + "/Favorite/" + id;
        console.log(id);
        fetch(url, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // Kiểm tra nếu phản hồi có nội dung
                if (response.status === 204) {
                    return null;
                }
                return response.text();
            })
            .then(data => {
                $scope.loadDataForPageFavotite();
                console.log("Delete successful:", data);

                // Áp dụng $scope.$apply() để cập nhật lại view nếu cần
                $scope.$apply();
            })
            .catch(error => {
                console.error("Error deleting playlist song:", error);
            });
    }
    $scope.loadDataForPageFavotite();

    $scope.loadDataForPageTopic = function () {
        //Data for detail playlist
        if ($scope.path.includes("/topic/detail/")) {
            var path = window.location.href;
            // Tách chuỗi để lấy stageName
            var topicname = $scope.path.split('/').pop();
            console.log(topicname);
            var urlArtist = host + "/topics/getbyname/" + topicname;

            fetch(urlArtist)
                .then(response => response.json())
                .then(data => {
                    $scope.$apply(function () {
                        $scope.detailTopic = data;
                        console.log($scope.detailTopic);

                        var urlPlaylistSong = host + "/Song_Topic/TopicId=" + $scope.detailTopic.id;
                        return fetch(urlPlaylistSong)
                            .then(response => response.json())
                            .then(data => {
                                
                                    console.log(data);
                                    $scope.detailTopicSong = data;
                                    console.log($scope.detailTopicSong);
                                    $scope.detailTopicSong = $scope.detailTopicSong.filter(track => track.deleted);
                                    return Promise.all($scope.detailTopicSong.map(track => {
                                        var urlSongArtist = host + "/Song_Artist/SongId=" + track.id;

                                        return fetch(urlSongArtist)
                                            .then(response => response.json())
                                            .then(artists => {
                                                track.artists = artists.map(artist => artist.stageName);
                                            })
                                            .catch(error => {
                                                console.error('Error fetching artist data:', error);
                                            });
                                    }));
                                
                            })
                            .then(() => {
                                // Apply the changes after all promises are resolved
                                $scope.$apply();
                                console.log($scope.detailTopicSong);
                            })
                            .catch(error => {
                                console.error('Error fetching playlist songs:', error);
                            });
                    });
                })
                .catch(error => {
                    console.error('Error fetching playlist:', error);
                });
        }

        //Data for playlist
        else if ($scope.path.includes("/topic")) {
            var urlArtist = host + "/topics";
            fetch(urlArtist)
                .then(response => response.json())
                .then(data => {
                    $scope.$apply(function () {
                        $scope.topics = data;
                        console.log($scope.playlists);
                        $scope.pagination.Pager.PageSize = 8;
                        $scope.pagination.Pager.TotalItems = $scope.topics.length || 0;
                        console.log($scope.pagination.Pager.TotalItems);
                        $scope.pagination.Pager.CurrentPage = intPage;
                        calculatePages();
                        $scope.loadDataForPage($scope.pagination.Pager.CurrentPage);
                    });
                })
                .catch(error => {
                    console.error('Error fetching artists:', error);
                });

            var url = host + "/checkUserLogin";
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    $scope.$apply(function () {
                        if (data.loggedIn) {
                            var urlUsername = host + "/Playlist/FindByUsername/" + data.account.username;
                            fetch(urlUsername)
                                .then(response => response.json())
                                .then(data => {
                                    $scope.$apply(function () {
                                        $scope.playlistOfMy = data;
                                        console.log($scope.playlistOfMy);
                                    });
                                })
                                .catch(error => {
                                    console.error('Error fetching artists:', error);
                                });
                        }
                    });
                });


        }
    }

    $scope.loadDataForPageTopic();

    $scope.payment = function (money) {
        $scope.urlPayment;
        console.log($scope.LoginAccount.account);
        var url = host + "/Payment/" + money;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                $scope.$apply(function () {
                    $scope.urlPayment = data;
                    $window.location.href = $scope.urlPayment;
                });
            })
            .catch(error => {
                console.error('Error fetching user login status:', error);
            });


    }

    $scope.registerNewAccount = function () {
        if ($scope.registrationForm.$valid) {
            var username = $scope.newAccount.username.trim();
            var url = host + "/account/checkUsername/" + username;

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    if (data === 'false') {
                        // Username không tồn tại, có thể đăng ký
                        console.log($scope.newAccount.username);
                        console.log($scope.newAccount.pass);
                        console.log($scope.newAccount.fullname);
                        console.log($scope.newAccount.birthday);
                        console.log($scope.newAccount.gender);

                        // Thực hiện logic đăng ký mới ở đây
                        // Ví dụ: Gửi dữ liệu đến API đăng ký

                        var dateOfBirth = new Date($scope.newAccount.birthday);
                        var formattedDateOfBirth = dateOfBirth.toISOString().split('T')[0]; // Chuyển đổi sang định dạng YYYY-MM-DD
                        console.log(formattedDateOfBirth);
                        var urlPost = host + "/account";
                        var accountData = {
                            username: $scope.newAccount.username,
                            password: $scope.newAccount.pass,
                            fullname: $scope.newAccount.fullname,
                            dateOfBirth: formattedDateOfBirth,
                            gender: $scope.newAccount.gender,
                            dateVip: null,
                            role: false,
                            vip: null
                        };

                        fetch(urlPost, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(accountData)
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('Account registered successfully:', data);
                                alert('Đăng ký tài khoản thành công!');
                                // Thực hiện các hành động khác sau khi đăng ký thành công (nếu cần)
                            })
                            .catch(error => {
                                console.error('Error registering account:', error);
                                alert('Đăng ký tài khoản thất bại, vui lòng thử lại.');
                            });
                    } else {
                        // Username đã tồn tại
                        alert("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác.");
                    }
                })
                .catch(error => {
                    console.error('Error fetching user login status:', error);
                });
        } else {
            alert("Vui lòng điền đầy đủ thông tin vào các trường bắt buộc.");
        }
    }

    $scope.loadDataForPageProfile = function () {
        if ($scope.path.includes("/profile")) {
            var url = host + "/checkUserLogin";

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    $scope.$apply(function () {
                        if (data.loggedIn) {
                            if (data.account.dateOfBirth) {
                                data.account.dateOfBirth = new Date(data.account.dateOfBirth);
                            }
                            $scope.ProfileAccount = data;
                            console.log($scope.ProfileAccount);
                        } else {
                            $scope.ProfileAccount = data;
                        }
                    });
                })
                .catch(error => {
                    console.error('Error fetching user login status:', error);
                });

        }
    }


    $scope.loadDataForPageProfile();

    $scope.updateProfile = function () {
        console.log($scope.ProfileAccount.account);

        var dateOfBirth = new Date($scope.ProfileAccount.account.dateOfBirth);
        var formattedDateOfBirth = dateOfBirth.toISOString().split('T')[0];

        // Chuyển đổi sang định dạng YYYY-MM-DD
        var accountData = {
            username: $scope.ProfileAccount.account.username,
            password: $scope.ProfileAccount.account.password,
            fullname: $scope.ProfileAccount.account.fullname,
            dateOfBirth: formattedDateOfBirth,
            gender: $scope.ProfileAccount.account.gender,
            dateVip: $scope.ProfileAccount.account.dateVip,
            role: $scope.ProfileAccount.account.role,
            vip: $scope.ProfileAccount.account.vip
        };
        console.log(accountData);
        var postUrl = host + "/account/" + accountData.username;
        let cleanPlaylist = JSON.parse(JSON.stringify($scope.newPlaylist));
        fetch(postUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(accountData)
        })
            .then(response => {
                if (response.ok) {
                    return response.text(); // Chuyển đổi thành văn bản nếu không cần dữ liệu JSON
                } else if (response.status === 409) {
                    return response.text(); // Xử lý thông báo xung đột
                } else {
                    throw new Error('Unexpected response status: ' + response.status);
                }
            })
            .then(data => {
                $scope.loadDataForPageProfile();
                $scope.$apply(function () {
                    console.log(data);
                    alert('Cập nhật thành công!');
                });
            })
            .catch(error => {
                console.error('Error update account:', error);
            });
    }

    $scope.addSongInDSP = function(songId){
        var check = true;
        for (var i = 0; i < $scope.tracks.length; i++) {
            if ($scope.tracks[i].id === songId) {
                track = $scope.tracks[i];
                trackID = songId;
                break;
            }
        }

        for (var i = 0; i < $scope.tracksInPlaylist.length; i++) {
            if ($scope.tracksInPlaylist[i].id === songId) {
                check = false;
                break;
            }
        }

        if(check){
            $scope.tracksInPlaylist.push(track);
            $('#modal_form_vertical').modal('hide');
            new Noty({
                text: 'Đã thêm vào danh sách phát',
                type: 'success',
                timeout: 3000
            }).show(); 
        }else{
            new Noty({
                text: 'Bài hát đã có trong danh sách phát',
                type: 'error',
                timeout: 3000
            }).show(); 
        }

        $scope.savePlaylistToSession();
    }

    $scope.playAllAlbum = function(){
        $scope.tracksInPlaylist = angular.copy($scope.AlbumSongs);
        trackIndex = 0;
        $scope.loadTrack(trackIndex);
        $scope.playTrack();
        $scope.savePlaylistToSession();
    }

    $scope.playAllSongInArtist = function(){
        $scope.tracksInPlaylist = angular.copy($scope.ArtistSong);
        trackIndex = 0;
        $scope.loadTrack(trackIndex);
        $scope.playTrack();
        $scope.savePlaylistToSession();
    }

    $scope.playAllSongInPlaylist = function(){
        var songDetails = $scope.detailPlaylistSong.song.map(function(detail) {
            return detail.song;
        });
        
        // Kết quả: songDetails sẽ chứa mảng chỉ với thông tin của các bài hát
        console.log(songDetails);
        $scope.tracksInPlaylist = angular.copy(songDetails);
        trackIndex = 0;
        $scope.loadTrack(trackIndex);
        $scope.playTrack();
        $scope.savePlaylistToSession();
    }

    $scope.playAllSongInFavorite = function(){
        var songDetails = $scope.dataFavorite.map(function(detail) {
            return detail.song;
        });
        
        // Kết quả: songDetails sẽ chứa mảng chỉ với thông tin của các bài hát
        console.log(songDetails);
        
        $scope.tracksInPlaylist = angular.copy(songDetails);
        trackIndex = 0;
        $scope.loadTrack(trackIndex);
        $scope.playTrack();
        $scope.savePlaylistToSession();
    }


});

app.filter('range', function () {
    return function (input, total) {
        total = parseInt(total);
        for (var i = 0; i < total; i++) {
            input.push(i);
        }
        return input;
    };
});
