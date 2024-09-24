const app = angular.module('album', ['ui.select', 'ngSanitize']);

app.controller("albumController", function ($scope, $http, $timeout) {
  $scope.items = [];
  $scope.form = {};
  $scope.currentPage = 0;
  $scope.itemsPerPage = 5;
  $scope.searchQuery = '';
  $scope.totalPages = 0;
  $scope.currentPageFalse = 0;
  $scope.artists = []; 
  $scope.currentPageAlbum = 0;
        $scope.totalPagesAlbum = 0;
        $scope.selectedSongs = [];
        $scope.albums = [];
        $scope.selectedAlbum = null;

  $scope.fileChanged = function (event) {
    var file = event.target.files[0];
    if (file) {
        $scope.form.imageFile = file;
    }
};


  const host = "http://localhost:8080/rest";
  $scope.notificationMessage = '';

  $scope.showNotification = function (message, isSuccess = true) {
    $scope.notificationMessage = message;
    const notificationModal = new bootstrap.Modal(document.getElementById('notificationModal'), {});
    notificationModal.show();
    if (isSuccess) {
      // Reload data after successful notification
      $timeout(function () {
        $scope.load_all();
      }, 1000);
    }
  };
  $scope.loadArtists = function () {
    const url = `${host}/Artist`;
    $http.get(url).then(resp => {
        $scope.artists = resp.data;
    }).catch(error => {
        console.error("Error loading artists", error);
    });
};
  $scope.loadPage = function (page) {
    const url = `${host}/Album/admin?page=${page}&size=${$scope.itemsPerPage}&search=${$scope.searchQuery}`;
    $http.get(url).then(resp => {
      $scope.items = resp.data.content;
      $scope.totalPages = resp.data.totalPages;
      $scope.currentPage = page;
      console.log("Successfully loaded", resp);
    }).catch(error => {
      console.error("Error loading artists", error);
      $scope.showNotification('Error loading artists', false);
    });
  };
  $scope.loadPageFalse = function (page) {
    const url = `${host}/Album/admin/khoiphuc?page=${page}&size=${$scope.itemsPerPage}&search=${$scope.searchQuery}`;
    $http.get(url).then(resp => {
      $scope.itemsFalse = resp.data.content;
      $scope.totalPages = resp.data.totalPages;
      $scope.currentPageFalse = page;
      console.log("Successfully loaded", resp);
    }).catch(error => {
      console.error("Error loading artists", error);
      $scope.showNotification('Error loading artists', false);
    });
  };
  $scope.load_all = function () {
    $scope.loadPage($scope.currentPage);
  };
  $scope.load_allFalse = function () {
    $scope.loadPageFalse($scope.currentPageFalse);
  };

  $scope.search = function () {
    $scope.loadPage(0);
  };
  $scope.searchFalse = function () {
    $scope.loadPageFalse(0);
  };
  $scope.load_allFalse();


  $scope.getPageNumbers = function () {
    return new Array($scope.totalPages).fill(0).map((_, i) => i);
  };

  $scope.getPageNumbersFalse = function () {
    return new Array($scope.totalPages).fill(0).map((_, i) => i);
  };

  $scope.toggleSongSelection = function(songId) {
    let idx = $scope.selectedSongs.indexOf(songId);
    if (idx > -1) {
        $scope.selectedSongs.splice(idx, 1);
    } else {
        $scope.selectedSongs.push(songId);
    }
};

$scope.updateAlbumSongs = function() {
    if ($scope.selectedSongs.length === 0 || !$scope.selectedAlbum) {
      
        $scope.showNotification('Vui lòng chọn ít nhất một bài hát và một album.', false);
      return;
       
    }

    let params = {
        songIds: $scope.selectedSongs,
        albumId: $scope.selectedAlbum.id
    };

    $http.put('/rest/Song/UpdateAlbumSongs', null, {params: params})
        .then(function(response) {
           
            $scope.showNotification('Cập nhật thành công');
     
            $scope.loadPageAlbum(0); 
            $scope.loadPage(0);
            $scope.selectedSongs = []; 
            $scope.selectedAlbum = null; 
        })
        .catch(function(error) {
            console.error("Lỗi khi cập nhật album:", error);
            alert("Đã xảy ra lỗi khi cập nhật album.");
        });
};
$scope.loadPageAlbum = function (page) {
          
  const url = `${host}/Song/UpdateAlbum/all?page=${page}&size=${$scope.itemsPerPage}&search=${$scope.searchQuery}`;
  $http.get(url).then(function (response) {
      $scope.itemsAlbum = response.data.content;
      $scope.totalPagesAlbum = response.data.totalPages;
      $scope.currentPageAlbum = page;

      const promises = $scope.itemsAlbum.map(song => {
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
          
          }).then(() => {
              return $scope.getArtistsBySongId(song.id).then(artists => {
                  song.artists = artists;
              }).catch(error => {

                  song.artists = [];
              });
          });
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


$scope.searchAlbum = function () {
  $scope.loadPageAlbum(0);
};
$scope.getPageNumbersAlbum = function () {
 
    let totalPages = $scope.totalPagesAlbum;
    let currentPage = $scope.currentPageAlbum;
    let visiblePages = 5;  // Số lượng trang hiển thị trước và sau trang hiện tại
    let startPage = Math.max(0, currentPage - Math.floor(visiblePages / 2));
    let endPage = Math.min(totalPages - 1, currentPage + Math.floor(visiblePages / 2));

    // Điều chỉnh start và end nếu chúng gần đầu hoặc cuối danh sách
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
$scope.loadAllAlbums = function () {
  $http.get(`${host}/Album`).then(function (response) {
      $scope.albums = response.data;
      console.log('Loaded albums:', $scope.albums);
  }).catch(function (error) {
      console.error('Error loading albums', error);
  });
};
$scope.loadAllAlbums();


$scope.load_allAlbum = function () {
  $scope.loadPageAlbum($scope.currentPageAlbum);

};
$scope.load_allAlbum();










  $scope.resetForm = function () {
    $scope.form = {
   
      imageFile: null
    };
    document.getElementById('uploadImage').value = '';
    document.getElementById('uploadedAvatar').src = '/asset/images/song/banner.png';
  };


 
  function formatDateString(dateString) {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date; 
  }

  $scope.items.forEach(function (item) {
    item.dateReleast = formatDateString(item.dateReleast);
  });

  $scope.edit = function (id) {
    const url = `${host}/Album/${id}`;
    $http.get(url).then(resp => {
        $scope.form = resp.data;
        $scope.form.dateReleast = formatDateString($scope.form.dateReleast);
        
      
        if(resp.data.artist) {
            $scope.form.artist = resp.data.artist.stageName; 
        }
    
    }).catch(error => {
       
        $scope.showNotification('Error loading album data', false);
    });
};


$scope.create = function() {
  if(!$scope.form.name){
      $scope.showNotification('Tên Album đang bỏ trống', false);
      return;
  }
  
  $http.get(`${host}/Album/exists`, { params: { name: $scope.form.name } }).then(function(response){
      if(response.data.exists){
          $scope.showNotification('Tên Album đã tồn tại');
      } else {
          if(!$scope.form.dateReleast){
              $scope.showNotification('Ngày ra mắt đang bỏ trống', false);
              return;
          }
          if(!$scope.form.description){
              $scope.showNotification('Miêu tả đang bỏ trống', false);
              return;
          }
          if(!$scope.form.artist){
              $scope.showNotification('Hãy chọn 1 nghệ sĩ', false);
              return;
          }

          const formData = new FormData();
          const imageFile = document.getElementById('uploadImage').files[0];
          if (!imageFile) {
              $scope.showNotification('Ảnh Album đang trống', false);
              return;
          }
          if (!$scope.isValidImageFile(imageFile)) {
              $scope.showNotification('File ảnh không đúng định dạng (.png, .jpg, .jpeg, hoặc .jfif.)', false);
              return;
          }

          formData.append('name', $scope.form.name);
          formData.append('dateReleast', $scope.form.dateReleast.toISOString().split('T')[0]); // Convert to 'yyyy-MM-dd'
          formData.append('description', $scope.form.description);

          if (imageFile) {
              formData.append('image', imageFile);
          } else {
              console.error("No file selected.");
          }

          formData.append('artist', $scope.form.artist.stageName);

          $http.post(`${host}/Album`, formData, {
              headers: { 'Content-Type': undefined }
          }).then(resp => {
              $scope.load_all();
              $scope.showNotification('Thêm Album thành công!');
              $scope.resetForm();
          }).catch(error => {
              console.error('Error creating album', error);
              $scope.showNotification('Error creating album', false);
          }); 
      }
  }).catch(function(error) {
      console.error('Error checking Album name', error);
  });  
};

  

  $scope.update = function(id) {
    if(!$scope.form.name){
        $scope.showNotification('Tên Album đang bỏ trống', false);
        return;
    }
    if(!$scope.form.dateReleast){
        $scope.showNotification('Ngày ra mắt đang bỏ trống', false);
        return;
    }  
    if(!$scope.form.description){
        $scope.showNotification('Miêu tả đang bỏ trống', false);
        return;
    }
    if(!$scope.form.artist){
      $scope.showNotification('Hãy chọn 1 nghệ sĩ', false);
      return;
  }
    // // Kiểm tra nếu ngày ra mắt lớn hơn hoặc bằng ngày hiện tại
    // const currentDate = new Date().setHours(0, 0, 0, 0); // Lấy ngày hiện tại với thời gian 00:00:00
    // const releaseDate = new Date($scope.form.dateReleast).setHours(0, 0, 0, 0); // Đặt thời gian 00:00:00 cho ngày ra mắt

    // if (releaseDate < currentDate) {
    //     $scope.showNotification('Ngày ra mắt phải lớn hơn hoặc bằng ngày hiện tại', false);
    //     return;
    // }

    // Kiểm tra tên album có trùng không (trong trường hợp cập nhật)
    $http.get(`${host}/Album/checkNameExistsForUpdate`, { params: { name: $scope.form.name, id: id } })
        .then(function(response) {
            if (response.data.exists) {
                $scope.showNotification('Tên Album đã tồn tại', false);
            } else {
                // Tiếp tục quá trình cập nhật nếu tên không trùng
                const url = `${host}/Album/${id}`;
                const formData = new FormData();
                formData.append('name', $scope.form.name);
                formData.append('dateReleast', new Date($scope.form.dateReleast).toISOString().split('T')[0]);
                formData.append('description', $scope.form.description);
                formData.append('artist', $scope.form.artist); // Assuming you're sending stageName

                const imageFile = document.getElementById('uploadImage2').files[0];
                if (imageFile) {
                    if (!$scope.isValidImageFile(imageFile)) {
                        $scope.showNotification('File ảnh không đúng định dạng(.png, .jpg, .jpeg, hoặc .jfif.)', false);
                        return;
                    }
                    formData.append('image', imageFile);
                }

                $http({
                    method: 'PUT',
                    url: url,
                    data: formData,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                }).then(function successCallback(response) {
                    console.log("Update successful", response.data);
                    
                    if (imageFile) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            document.getElementById('uploadedAvatar2').src = e.target.result;
                        };
                        reader.readAsDataURL(imageFile);
                    }
                    $scope.showNotification('Cập nhật thành công', true);
                }, function errorCallback(response) {
                    console.log("Error updating album", response);
                    $scope.showNotification('Error updating album', false);
                });
            }
        })
        .catch(function(error) {
            console.log("Error checking album name", error);
            $scope.showNotification('Error checking album name', false);
        });
};




$scope.resetForm = function () {
  $scope.form = {
      name: '',
      dateReleast: null,
      description: '',
      artist: null,
      imageFile: null
  };
  document.getElementById('uploadImage').value = '';
  document.getElementById('uploadedAvatar').src = '/asset/images/song/banner.png';
};


$scope.isValidImageFile = function (file) {
  if (!file) return false;
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/jfif'];
  return allowedTypes.includes(file.type);
};


$scope.delete = function (id) {
  Swal.fire({
    title: 'Bạn có chắc chắn muốn xóa Album này không?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Có, tôi chắc chắn',
    cancelButtonText: 'Hủy bỏ'
  }).then((result) => {
    if (result.isConfirmed) {
      $http.put(`${host}/Album/${id}/delete`).then(function (response) {
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Album đã được xóa thành công'
        });
        $scope.load_all();
     
      }).catch(function (error) {
        console.error('Error deleting song', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Xóa Album không thành công'
        });
      });
    }
  });
};
$scope.deleteFalse = function (id) {
  Swal.fire({
    title: 'Bạn có muốn khôi phục Album này không?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Có, tôi chắc chắn',
    cancelButtonText: 'Hủy bỏ'
  }).then((result) => {
    if (result.isConfirmed) {
      $http.put(`${host}/Album/${id}/khoiphuc`).then(function (response) {
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Album đã được khôi phục'
        });
        $scope.load_allFalse();
    
      }).catch(function (error) {
        console.error('Error deleting song', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Khôi phục Album không thành công'
        });
      });
    }
  });
};



$scope.loadArtists();
  $scope.load_all();
});
app.factory('AccountService', ['$http', function($http) {
  return {
      getLoggedInUser: function() {
          return $http.get('/rest/getUserLogin');
      },
    
      getAnotherUserData: function() {
        
          return $http.get('/rest/getAnotherUserData');
      }
  };
}]);


app.controller('AccountController', ['$scope', 'AccountService', '$http', '$timeout', function($scope, AccountService, $http, $timeout) {
  $scope.loggedInUser = {};
  $scope.LoginAccount = {}; 
  $scope.user = {};
  const host = "http://localhost:8080/rest";
  
  $scope.updateProfile = function() {
      var accountData = angular.copy($scope.loggedInUser);
  
      // Validate fullname
      if (!accountData.fullname || accountData.fullname.trim() === '') {
          $scope.errorMessage = 'Họ và tên không được để trống.';
          return;
      }
  
      // Validate dateOfBirth (must be at least 18 years old)
      if (accountData.dateOfBirth) {
          var birthDate = new Date(accountData.dateOfBirth);
          var today = new Date();
          var age = today.getFullYear() - birthDate.getFullYear();
          var monthDifference = today.getMonth() - birthDate.getMonth();
  
          // Adjust age if birth month and day have not yet occurred this year
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
  
      // Check VIP status before applying date comparison
      if (accountData.vip) {
          const currentVipDate = new Date($scope.loggedInUser.currentDateVip);
          const newVipDate = new Date(accountData.dateVip);
  
          // Check if new VIP date is valid
          if (newVipDate < currentVipDate) {
              $scope.errorMessage = 'Ngày VIP mới phải lớn hơn hoặc bằng ngày VIP hiện tại.';
              return; // This should stop further execution
          }
  
          accountData.dateVip = newVipDate.toISOString().split('T')[0];
      } else {
          // Clear dateVip if not VIP
          accountData.dateVip = new Date(accountData.dateVip);
      }
  
      console.log('Updating profile with data:', accountData);
  
      // Perform the HTTP PUT request
      $http.put('/rest/account/updateprofile/admin', accountData)
          .then(function(response) {
            
              alert('Cập nhật thành công!');
              $scope.errorMessage = '';
            
              $timeout(function() {
                  location.reload();
              }, 10);
          })
          .catch(function(error) {
              console.error('Lỗi khi cập nhật tài khoản:', error);
              alert('Cập nhật thất bại: ' + (error.data.message || 'Unknown error'));
          });
  };
  $scope.loadLoggedInUser = function() {
      AccountService.getLoggedInUser().then(function(response) {
          $scope.loggedInUser = response.data;
          if ($scope.loggedInUser.dateOfBirth) {
              $scope.loggedInUser.dateOfBirth = new Date($scope.loggedInUser.dateOfBirth);
          }
          if ($scope.loggedInUser.dateVip) {
              $scope.loggedInUser.dateVip = new Date($scope.loggedInUser.dateVip);
              $scope.loggedInUser.currentDateVip = new Date($scope.loggedInUser.dateVip).toISOString().split('T')[0];
          }
          $scope.user.username = $scope.loggedInUser.username || '';
      }).catch(function(error) {
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
              $scope.LoginAccount = {}; // Initialize LoginAccount if there's an error
          });
  };
  $scope.loadDataForLoginAccount();


  $scope.changePassWord = function() {
      var requestData = {
          username: $scope.user.username,
          currentPassword: $scope.user.currentPassword,
          newPassword: $scope.user.newPassword,
          confirmPassword: $scope.user.confirmPassword
      };
    
      $http.put('/rest/account/updatePassword', requestData)
          .then(function(response) {
          
           
              $scope.user.currentPassword = '';
              $scope.user.newPassword = '';
              $scope.user.confirmPassword = '';
            
              $scope.successMessage = '';
            
              $scope.changePassWordForm.$setPristine();
              $scope.changePassWordForm.$setUntouched();
  
              
              $scope.successMessage = 'Đổi mật khẩu thành công.';
              $scope.errorMessage = '';
          })
          .catch(function(error) {
            
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


app.controller('Account2Controller', ['$scope', 'AccountService', function($scope, AccountService) {
  
  $scope.anotherUserData = {};

  // Function to load user data
  $scope.loadAnotherUserData = function() {
      AccountService.getLoggedInUser().then(function(response) {
          $scope.anotherUserData = response.data;
      }).catch(function(error) {
          console.error('Error loading user data:', error);
      });
  };

  // Call the function when controller initializes
  $scope.loadAnotherUserData();
}]);
