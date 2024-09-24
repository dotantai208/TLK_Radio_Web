const app = angular.module("admin_song", ['ui.select', 'ngSanitize']);

app
    .controller("songController", function ($scope, $http, $timeout) {
        $scope.items = [];
        $scope.form = {};
        $scope.currentPage = 0;
        $scope.itemsPerPage = 5;
        $scope.searchQuery = '';
        $scope.totalPages = 0;
        $scope.artists = [];
        $scope.selectedArtists = [];
        $scope.topics = [];
        $scope.selectedTopics = [];
        $scope.albums = [];
        $scope.selectedAlbum = null;
        $scope.currentPageFalse = 0;
        $scope.totalPagesFalse = 0;

       
        const host = "http://localhost:8080/rest";

      
        $scope.notificationMessage = '';

        $scope.showNotification = function (message) {
            $scope.notificationMessage = message;
            var myModal = new bootstrap.Modal(document.getElementById('notificationModal'), {});
            myModal.show();

        };

        $scope.saveSong = function () {

            if (!$scope.form.name) {
                $scope.showNotification('Tên bài hát không được để trống');
                return;
            }



            $http.get(`${host}/Song/check-name`, { params: { name: $scope.form.name } })
                .then(function (response) {
                    if (response.data.exists) {
                        $scope.showNotification('Tên bài hát đã tồn tại');
                    } else {
                        const formData = new FormData();

                        const mp3File = document.getElementById('uploadMp3').files[0];
                        if (!mp3File) {
                            $scope.showNotification('Bạn phải tải lên tệp MP3');
                            return;
                        }


                        if (mp3File.type !== 'audio/mpeg') {
                            $scope.showNotification('Chỉ cho phép các tệp MP3');
                            return;
                        }




                        if (!$scope.selectedArtists || $scope.selectedArtists.length === 0) {
                            $scope.showNotification('Bạn phải chọn ít nhất một nghệ sĩ');
                            return;
                        }


                        if (!$scope.selectedTopics || $scope.selectedTopics.length === 0) {
                            $scope.showNotification('Bạn phải chọn ít nhất một chủ đề');
                            return;
                        }

                        const imageFile = document.getElementById('uploadImage').files[0];
                        if (!imageFile) {
                            $scope.showNotification('Bạn phải tải lên một tệp hình ảnh');
                            return;
                        }


                        const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/jfif'];
                        if (!allowedImageTypes.includes(imageFile.type)) {
                            $scope.showNotification('Chỉ cho phép các tệp hình ảnh .png, .jpg, .jpeg, .jfif');
                            return;
                        }
                        formData.append('song', new Blob([JSON.stringify($scope.form)], { type: 'application/json' }));
                        formData.append('image', imageFile);
                        formData.append('mp3', mp3File);

                        if ($scope.selectedAlbum && $scope.selectedAlbum.id) {
                            formData.append('selectedAlbumId', $scope.selectedAlbum.id);
                        } else {
                            formData.append('selectedAlbumId', '');
                        }
                        
                        console.log('FormData contents:');
                        for (let pair of formData.entries()) {
                            console.log(pair[0] + ':', pair[1]);
                        }

                        $http.post(`${host}/Song/admin`, formData, {
                            headers: { 'Content-Type': undefined },
                            transformRequest: angular.identity
                        }).then(function (response) {
                            const songId = response.data.id;
                            console.log('Song saved successfully', response.data);

                            saveEntities($scope.selectedArtists, songId, 'artist', `${host}/Song_Artist/bulk`);
                            saveEntities($scope.selectedTopics, songId, 'topic', `${host}/Song_Topic/bulk`);

                            $scope.showNotification('Bài hát đã được lưu thành công!');
                            $scope.ResetForm();
                            $scope.load_all();
                        }).catch(function (error) {
                            console.error('Lỗi khi lưu bài hát', error);
                        });
                    }
                }).catch(function (error) {
                    console.error('Lỗi khi kiểm tra tên bài hát', error);
                });
        };



        function saveEntities(entities, songId, entityType, url) {
            const dataToSave = entities.map(entity => ({
                song: { id: songId },
                [entityType]: { id: entity.id, ...(entityType === 'artist' ? { stageName: entity.stageName } : {}) }
            }));

            if (dataToSave.length > 0) {
                $http.post(url, dataToSave).then(function (response) {
                    console.log(`${entityType} saved successfully`, response.data);
                }).catch(function (error) {
                    console.error(`Error saving ${entityType}`, error);
                });
            }
        }

  

      
        
    
        $scope.isArtistSelected = function (artist) {
            return $scope.selectedArtists.indexOf(artist) !== -1;
        };

        $scope.toggleArtistSelection = function (event, artist) {
            const index = $scope.selectedArtists.indexOf(artist);
            if (index > -1) {
                $scope.selectedArtists.splice(index, 1);
            } else {
                $scope.selectedArtists.push(artist);
            }
        };

        $scope.isTopicSelected = function (topic) {
            return $scope.selectedTopics.indexOf(topic) !== -1;
        };

        $scope.toggleTopicSelection = function (event, topic) {
            const index = $scope.selectedTopics.findIndex(selectedTopic => selectedTopic.id === topic.id);
            if (index > -1) {
                $scope.selectedTopics.splice(index, 1);
            } else {
                $scope.selectedTopics.push(topic);
            }
        };

        $scope.loadAllAlbums = function () {
            $http.get(`${host}/Album`).then(function (response) {
                $scope.albums = response.data;
                console.log('Loaded albums:', $scope.albums);
            }).catch(function (error) {
                console.error('Error loading albums', error);
            });
        };

        $scope.loadAllArtists = function () {
            $http.get(`${host}/Artist`).then(function (response) {
                $scope.artists = response.data;
                console.log('Loaded artists:', $scope.artists);
                $scope.$applyAsync();
            }).catch(function (error) {
                console.error('Error loading artists', error);
            });
        };

        $scope.loadAllTopics = function () {
            $http.get(`${host}/topics`).then(function (response) {
                $scope.topics = response.data;
                console.log('Loaded topics:', $scope.topics);
                $scope.$applyAsync();
            }).catch(function (error) {
                console.error('Error loading topics', error);
            });
        };

        $scope.loadPage = function (page) {
            $scope.tableLoaded = false;

            const url = `${host}/Song/admin?page=${page}&size=${$scope.itemsPerPage}&search=${$scope.searchQuery}`;
            $http.get(url).then(function (response) {
                $scope.items = response.data.content;
                $scope.totalPages = response.data.totalPages;
                $scope.currentPage = page;

                const promises = $scope.items.map(song => {
                    return $scope.getAlbumBySongId(song.id).then(albumId => {
                        song.albumId = albumId;
                        if (albumId != null) {
                            return $scope.getAlbumDetails(albumId).then(album => {
                                song.album = album;
                            }).catch(error => {

                                song.album = null;
                            });
                        } else {
                            song.album = null;
                            return Promise.resolve();
                        }
                    }).catch(error => {

                        song.album = null;
                        return Promise.resolve();
                    }).then(() => {
                        return $scope.getTopicsBySongId(song.id).then(topics => {
                            song.topics = topics;
                        }).catch(error => {

                            song.topics = [];
                        });
                    }).then(() => {
                        return $scope.getArtistsBySongId(song.id).then(artists => {
                            song.artists = artists;
                        }).catch(error => {

                            song.artists = [];
                        });
                    });
                });

                Promise.all(promises).then(() => {
                    $timeout(function () {
                        $scope.tableLoaded = true;
                    }, 20);
                });
            }).catch(error => {
                console.error("Lỗi khi tải danh sách bài hát", error);
            });
        };

    

      
        $scope.loadPageFalse = function (page) {
            $scope.tableLoaded = false;

            const url = `${host}/Song/admin/khoiphuc?page=${page}&size=${$scope.itemsPerPage}&search=${$scope.searchQuery}`;
            $http.get(url).then(function (response) {
                $scope.itemsFalse = response.data.content;
                $scope.totalPagesFalse = response.data.totalPages;
                $scope.currentPageFalse = page;

                const promises = $scope.itemsFalse.map(song => {
                    return $scope.getAlbumBySongId(song.id).then(albumId => {
                        song.albumId = albumId;
                        if (albumId != null) {
                            return $scope.getAlbumDetails(albumId).then(album => {
                                song.album = album;
                            }).catch(error => {

                                song.album = null;
                            });
                        } else {
                            song.album = null;
                            return Promise.resolve();
                        }
                    }).catch(error => {

                        song.album = null;
                        return Promise.resolve();
                    }).then(() => {
                        return $scope.getTopicsBySongId(song.id).then(topics => {
                            song.topics = topics;
                        }).catch(error => {

                            song.topics = [];
                        });
                    }).then(() => {
                        return $scope.getArtistsBySongId(song.id).then(artists => {
                            song.artists = artists;
                        }).catch(error => {

                            song.artists = [];
                        });
                    });
                });

                Promise.all(promises).then(() => {
                    $timeout(function () {
                        $scope.tableLoaded = true;
                    }, 20);
                });
            }).catch(error => {
                console.error("Lỗi khi tải danh sách bài hát", error);
            });
        };

        $scope.getArtistsBySongId = function (songId) {
            return $http.get(`${host}/Song_Artist/SongId/admin/${songId}`).then(function (response) {
                return response.data;
            }).catch(function (error) {
                console.error(`Error loading artists for songId ${songId}`, error);
                return [];
            });
        };

        $scope.search = function () {
            $scope.loadPage(0);
        };
        $scope.getPageNumbers = function() {
            let totalPages = $scope.totalPages;
            let currentPage = $scope.currentPage;
            let visiblePages = 5; 
            let startPage = Math.max(0, currentPage - Math.floor(visiblePages / 2));
            let endPage = Math.min(totalPages - 1, currentPage + Math.floor(visiblePages / 2));
        
         
            if (currentPage <= Math.floor(visiblePages / 2)) {
                endPage = Math.min(totalPages - 1, visiblePages - 1);
            }
            if (currentPage + Math.floor(visiblePages / 2) >= totalPages - 1) {
                startPage = Math.max(0, totalPages - visiblePages);
            }
        
            let pageNumbers = [];
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        
            return pageNumbers;
        };
        
        $scope.searchAlbum = function () {
            $scope.loadPageAlbum(0);
        };
        $scope.getPageNumbersAlbum = function () {
            return new Array($scope.totalPagesAlbum).fill(0).map((_, i) => i);
        }; 
         $scope.searchFalse = function () {
            $scope.loadPageFalse(0);
        };
        $scope.getPageNumbersFalse = function () {
            return new Array($scope.totalPagesFalse).fill(0).map((_, i) => i);
        };
        $scope.getTopicsBySongId = function (songId) {
            return $http.get(`${host}/Song_Topic/SongId=${songId}`).then(function (response) {
                return response.data;
            }).catch(function (error) {
                console.error(`Error loading topics for songId ${songId}`, error);
                return [];
            });
        };

        $scope.getAlbumBySongId = function (songId) {
            return $http.get(`${host}/Song/albumId/${songId}`).then(function (response) {
                if (response.data != null) {
                    return response.data;
                } else {
                    return null;
                }
            }).catch(function (error) {

                return null;
            });
        };

        $scope.getAlbumDetails = function (albumId) {
            if (albumId == null) {
                return Promise.resolve(null);
            }



            return $http.get(`${host}/Album/admin/${albumId}`).then(function (response) {
                if (response.data != null) {
                    return response.data;
                } else {
                    console.warn(`No data returned for albumId: ${albumId}`);
                    return null;
                }
            }).catch(function (error) {

                return null;
            });
        };

      

        $scope.edit = function (songId) {
            $scope.selectedArtists = [];
            $scope.selectedTopics = [];
            $scope.selectedAlbum = null; 

          
            $http.get(`/rest/SongWithAlbum/${songId}`).then(function (response) {
                $scope.form = response.data.song;
                $scope.selectedAlbum = response.data.album;

                console.log('Loaded song:', $scope.form);
                console.log('Selected album:', $scope.selectedAlbum);

                
                $http.get('/rest/Album').then(function (response) {
                    $scope.albums = response.data;
                    console.log('Albums list:', $scope.albums);

                    
                    if ($scope.selectedAlbum) {
                        $scope.selectedAlbum = $scope.albums.find(album => album.id === $scope.selectedAlbum.id) || null;
                        console.log('Updated selected album:', $scope.selectedAlbum);
                    }
                }).catch(function (error) {
                    console.error('Error fetching albums', error);
                });

             
                $http.get(`/rest/Song_Artist/SongId/admin/${songId}`).then(function (response) {
                    $scope.selectedArtists = response.data.map(artist => artist.stageName);
                    console.log('Selected artists:', $scope.selectedArtists);
                }).catch(function (error) {
                    console.error('Error fetching artists', error);
                });

               
                $http.get(`/rest/Song_Topic/SongId=${songId}`).then(function (response) {
                    $scope.selectedTopics = response.data.map(topic => topic.id);
                    console.log('Selected topics:', $scope.selectedTopics);
                }).catch(function (error) {
                    if (error.status === 404) {
                        console.warn(`No topics found for songId ${songId}`);
                        $scope.selectedTopics = []; 
                    } else {
                        console.error(`Error fetching topics for songId ${songId}`, error);
                    }
                });

                $scope.$applyAsync();
            }).catch(function (error) {
                console.error('Error fetching song details', error);
            });
        };

        $scope.selectedArtists = $scope.selectedArtists || [];

        $scope.isArtistSelected2 = function (artist) {
            return $scope.selectedArtists.includes(artist.stageName);
        };

        $scope.toggleArtistSelection2 = function (artist) {
            const index = $scope.selectedArtists.indexOf(artist.stageName);
            if (index > -1) {
                $scope.selectedArtists.splice(index, 1);
            } else {
                $scope.selectedArtists.push(artist.stageName);
            }
        };
        $scope.isTopicSelected2 = function (topic) {
            return $scope.selectedTopics.includes(topic.id);
        };

        $scope.toggleTopicSelection2 = function (topic) {
            const index = $scope.selectedTopics.indexOf(topic.id);
            if (index > -1) {
                $scope.selectedTopics.splice(index, 1);
            } else {
                $scope.selectedTopics.push(topic.id);
            }
        };
        $scope.delete = function (songId) {
            Swal.fire({
                title: 'Bạn có chắc chắn muốn xóa bài hát này không?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Có, tôi chắc chắn',
                cancelButtonText: 'Hủy bỏ'
            }).then((result) => {
                if (result.isConfirmed) {
                    $http.put(`${host}/song/${songId}/delete`).then(function (response) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Thành công',
                            text: 'Bài hát đã được xóa thành công'
                        });

                        $scope.load_all();
                    }).catch(function (error) {
                        console.error('Error deleting song', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi',
                            text: 'Xóa bài hát không thành công'
                        });
                    });
                }
            });
        };


        $scope.deleteFalse = function (songId) {
            Swal.fire({
                title: 'Bạn có muốn khôi phuc bài hát này không?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Có, tôi chắc chắn',
                cancelButtonText: 'Hủy bỏ'
            }).then((result) => {
                if (result.isConfirmed) {
                    $http.put(`${host}/song/${songId}/khoiphuc`).then(function (response) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Thành công',
                            text: 'Bài hát đã khôi phục'
                        });

                        $scope.load_allFalse();
                    }).catch(function (error) {
                        console.error('Error deleting song', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi',
                            text: 'Xóa bài hát không thành công'
                        });
                    });
                }
            });
        };
        $scope.checkSongNameExists = function (name, excludeId) {
            return $http.get(`${host}/Song/check-name`, {
                params: { name: name, excludeId: excludeId }
            }).then(function (response) {
                return response.data.exists;
            }).catch(function (error) {
                console.error('Lỗi khi kiểm tra tên bài hát', error);
                return false;
            });
        };
        $scope.isValidImageFile = function (file) {
            if (!file) return false;
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/jfif'];
            return allowedTypes.includes(file.type);
          };
        
          $scope.updateSong = function (id) {
            $scope.isLoading = true;
        
            if (!$scope.form.name) {
                $scope.showNotification('Tên bài hát không được để trống');
                $scope.isLoading = false;
                return;
            }
        
            $http.get('/rest/Song/checkNameExistsForUpdate', {
                params: {
                    name: $scope.form.name,
                    id: id
                }
            }).then(function (response) {
                if (response.data.exists) {
                    $scope.showNotification('Tên bài hát đã tồn tại. Vui lòng chọn tên khác.');
                    $scope.isLoading = false;
                    return;
                }
        
                const mp3File = document.getElementById('uploadMp3Update').files[0];
                if (mp3File && mp3File.type !== 'audio/mpeg') {
                    $scope.showNotification('Chỉ cho phép các tệp MP3');
                    $scope.isLoading = false;
                    return;
                }
        
                if (!$scope.selectedArtists || $scope.selectedArtists.length === 0) {
                    $scope.showNotification('Bạn phải chọn ít nhất một nghệ sĩ');
                    $scope.isLoading = false;
                    return;
                }
        
                if (!$scope.selectedTopics || $scope.selectedTopics.length === 0) {
                    $scope.showNotification('Bạn phải chọn ít nhất một chủ đề');
                    $scope.isLoading = false;
                    return;
                }
        
                const formData = new FormData();
                const imageFile = document.getElementById('uploadImage2').files[0];
                if (imageFile) {
                    if (!$scope.isValidImageFile(imageFile)) {
                        $scope.showNotification('File ảnh không đúng định dạng(.png, .jpg, .jpeg, hoặc .jfif.)', false);
                        return;
                    }
                    formData.append('image', imageFile);
                }
        
                formData.append('name', $scope.form.name);
                if (mp3File) {
                    formData.append('mp3', mp3File);
                }
                if ($scope.selectedAlbum && $scope.selectedAlbum.id) {
                    formData.append('selectedAlbumId', $scope.selectedAlbum.id);
                } else {
                    formData.append('selectedAlbumId', '');
                }
        
                formData.append('topics', JSON.stringify($scope.selectedTopics || []));
                formData.append('artists', JSON.stringify($scope.selectedArtists || []));
        
                console.log("Updating song with FormData:");
                for (let pair of formData.entries()) {
                    console.log(pair[0] + ':', pair[1]);
                }
        
                $http.put(`/rest/Song/admin/${id}`, formData, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).then(function (response) {
                    console.log("Song updated successfully", response.data);
        
                    // Update image immediately
                    const updatedSong = response.data;
                    const imageElement = document.getElementById('uploadedAvatar3');
                    if (updatedSong.image) {
                        imageElement.src = `/asset/images/song/${updatedSong.image}`;
                    }
        
                    $scope.isLoading = false;
                    $scope.load_all2(); // Load updated data
                    $scope.showNotification('Cập nhật bài hát thành công!');
                }).catch(function (error) {
                    console.error("Error updating song", error);
                    $scope.isLoading = false;
                });
            }).catch(function (error) {
                console.error("Error checking song name", error);
                $scope.isLoading = false;
            });
        };
        


        $scope.ResetForm = function () {
            document.getElementById('uploadImage').value = null;
            document.getElementById('uploadMp3').value = null;
            $scope.selectedAlbum = null;
            $scope.selectedArtists = [];
            $scope.selectedTopics = [];
            $scope.artistSearch = '';
            $scope.topicSearch = '';
            document.getElementById('uploadedAvatar').src = '/asset/images/song/banner.png';
            $scope.form = {
                name: ''
            }
        };
        $scope.NameNull = function () {
            $scope.form = {
                name: ''
            }
            $scope.selectedAlbum = null;
        }

        $scope.load_all = function () {
            $scope.loadPage($scope.currentPage);
            $scope.loadAllArtists();
            $scope.loadAllTopics();
            $scope.loadAllAlbums();
        };

        $scope.load_all2 = function () {
            $scope.loadPage($scope.currentPage);

        };

        $scope.load_allFalse = function () {
            $scope.loadPageFalse($scope.currentPageFalse);

        };
      
        $scope.load_allFalse();
        $scope.load_all();

    }

    );
app.factory('AccountService', ['$http', function ($http) {
    return {
        getLoggedInUser: function () {
            return $http.get('/rest/getUserLogin');
        },

        getAnotherUserData: function () {

            return $http.get('/rest/getAnotherUserData');
        }
    };
}]);


app.controller('AccountController', ['$scope', 'AccountService', '$http', '$timeout', function ($scope, AccountService, $http, $timeout) {
    $scope.loggedInUser = {};
    $scope.LoginAccount = {};
    $scope.user = {};
    const host = "http://localhost:8080/rest";

    $scope.updateProfile = function () {
        var accountData = angular.copy($scope.loggedInUser);

      
        if (!accountData.fullname || accountData.fullname.trim() === '') {
            $scope.errorMessage = 'Họ và tên không được để trống.';
            return;
        }

       
        if (accountData.dateOfBirth) {
            var birthDate = new Date(accountData.dateOfBirth);
            var today = new Date();
            var age = today.getFullYear() - birthDate.getFullYear();
            var monthDifference = today.getMonth() - birthDate.getMonth();

          
            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 18) {
                $scope.errorMessage = 'Ngày sinh không hợp lệ. Người dùng phải ít nhất 18 tuổi.';
                return;
            }

            accountData.dateOfBirth = birthDate.toISOString().split('T')[0];
        } else {
            $scope.errorMessage = 'Ngày sinh không được để trống.';
            return;
        }

       
        if (accountData.vip) {
            const currentVipDate = new Date($scope.loggedInUser.currentDateVip);
            const newVipDate = new Date(accountData.dateVip);

          
            if (newVipDate < currentVipDate) {
                $scope.errorMessage = 'Ngày VIP mới phải lớn hơn hoặc bằng ngày VIP hiện tại.';
                return; 
            }

            accountData.dateVip = newVipDate.toISOString().split('T')[0];
        } else {
        
            accountData.dateVip = new Date(accountData.dateVip);
        }

        console.log('Updating profile with data:', accountData);

       
        $http.put('/rest/account/updateprofile/admin', accountData)
            .then(function (response) {

                alert('Cập nhật thành công!');
                $scope.errorMessage = '';

                $timeout(function () {
                    location.reload();
                }, 10);
            })
            .catch(function (error) {
                console.error('Lỗi khi cập nhật tài khoản:', error);
                alert('Cập nhật thất bại: ' + (error.data.message || 'Unknown error'));
            });
    };
    $scope.loadLoggedInUser = function () {
        AccountService.getLoggedInUser().then(function (response) {
            $scope.loggedInUser = response.data;
            if ($scope.loggedInUser.dateOfBirth) {
                $scope.loggedInUser.dateOfBirth = new Date($scope.loggedInUser.dateOfBirth);
            }
            if ($scope.loggedInUser.dateVip) {
                $scope.loggedInUser.dateVip = new Date($scope.loggedInUser.dateVip);
                $scope.loggedInUser.currentDateVip = new Date($scope.loggedInUser.dateVip).toISOString().split('T')[0];
            }
            $scope.user.username = $scope.loggedInUser.username || '';
        }).catch(function (error) {
            console.error('Lỗi khi lấy thông tin người dùng đã đăng nhập:', error);
        });
    };

    $scope.loadLoggedInUser();

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
                    $scope.LoginAccount = data;
                    console.log($scope.LoginAccount);
                });
            })
            .catch(error => {
                console.error('Error fetching user login status:', error);
                $scope.LoginAccount = {};
            });
    };
    $scope.loadDataForLoginAccount();


    $scope.changePassWord = function () {
        var requestData = {
            username: $scope.user.username,
            currentPassword: $scope.user.currentPassword,
            newPassword: $scope.user.newPassword,
            confirmPassword: $scope.user.confirmPassword
        };

        $http.put('/rest/account/updatePassword', requestData)
            .then(function (response) {


                $scope.user.currentPassword = '';
                $scope.user.newPassword = '';
                $scope.user.confirmPassword = '';

                $scope.successMessage = '';

                $scope.changePassWordForm.$setPristine();
                $scope.changePassWordForm.$setUntouched();


                $scope.successMessage = 'Đổi mật khẩu thành công.';
                $scope.errorMessage = '';
            })
            .catch(function (error) {

                var errorMessage = error.data.message || 'Lỗi không xác định';
                if (typeof errorMessage !== 'string') {
                    errorMessage = JSON.stringify(errorMessage);
                }


                if (errorMessage.includes('Mật khẩu hiện tại không chính xác')) {
                    $scope.errorMessage = 'Mật khẩu hiện tại không chính xác.';
                } else if (errorMessage.includes('Mật khẩu mới và xác nhận mật khẩu không khớp')) {
                    $scope.errorMessage = 'Mật khẩu mới và xác nhận mật khẩu không khớp.';
                } else {
                    $scope.errorMessage = 'Đổi mật khẩu thất bại: ' + errorMessage;
                }
                $scope.successMessage = '';
            });
    };




}]);


app.controller('Account2Controller', ['$scope', 'AccountService', function ($scope, AccountService) {

    $scope.anotherUserData = {};

   
    $scope.loadAnotherUserData = function () {
        AccountService.getLoggedInUser().then(function (response) {
            $scope.anotherUserData = response.data;
        }).catch(function (error) {
            console.error('Error loading user data:', error);
        });
    };


    $scope.loadAnotherUserData();
}]);

