const app = angular.module("admin_quangcao", []);

app.controller("quangCaoController", function ($scope, $http, $timeout) {
  $scope.items = [];
  $scope.form = {};
  $scope.currentPage = 0;
  $scope.itemsPerPage = 5;
  $scope.searchQuery = '';
  $scope.totalPages = 0;



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

  $scope.loadPage = function (page) {
    const url = `${host}/Advertise/admin?page=${page}&size=${$scope.itemsPerPage}&search=${$scope.searchQuery}`;
    $http.get(url).then(resp => {
      $scope.items = resp.data.content;
      $scope.totalPages = resp.data.totalPages;
      $scope.currentPage = page;
      $scope.loadMP3Durations(); 
      console.log("Successfully loaded", resp);
    }).catch(error => {
      console.error("Error loading artists", error);
      $scope.showNotification('Error loading artists', false);
    });
  };

  $scope.load_all = function () {
    $scope.loadPage($scope.currentPage);
  };

  $scope.search = function () {
    $scope.loadPage(0);
  };

  $scope.resetForm = function () {
    $scope.form = {
      realName: '',
      stageName: '',
      dateOfBirth: '',
      story: '',
      imageFile: null
    };
    document.getElementById('uploadImage').value = '';
    document.getElementById('uploadedAvatar').src = '/asset/images/song/banner.png';
  };

  $scope.getPageNumbers = function () {
    return new Array($scope.totalPages).fill(0).map((_, i) => i);
  };

 

  $scope.isValidImageFile = function (file) {
    if (!file) return false;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/jfif'];
    return allowedTypes.includes(file.type);
  };

  $scope.create = function () {
    const imageFile = document.getElementById('uploadImage').files[0];
    const mp3File = document.getElementById('uploadMp3').files[0];
    
    if (!$scope.form.name) {
        $scope.showNotification('Tên quảng cáo đang trống', false);
        return;
    }
    
  
    $http.get(`${host}/Advertise/checkNameExists`, { params: { name: $scope.form.name } })
        .then(response => {
            if (response.data.exists) {
                $scope.showNotification('Tên quảng cáo đã tồn tại', false);
            } else {
             
                if (!mp3File) {
                    $scope.showNotification('File mp3 đang trống', false);
                    return;
                } else {
                    if (mp3File.type !== 'audio/mpeg') {
                        $scope.showNotification('Chỉ cho phép các tệp MP3', false);
                        return;
                    }
                }

                if (!imageFile) {
                    $scope.showNotification('Hình quảng cáo đang trống', false);
                    return;
                } else {
                    if (!$scope.isValidImageFile(imageFile)) {
                        $scope.showNotification('File ảnh không đúng định dạng(.png, .jpg, .jpeg, hoặc .jfif.)', false);
                        return;
                    }
                }

                const formData = new FormData();
                formData.append('name', $scope.form.name);
                formData.append('description', $scope.form.description);
                formData.append('image', imageFile);
                formData.append('mp3', mp3File);

                const url = `${host}/Advertise`;
                $http.post(url, formData, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).then(resp => {
                    $scope.items.push(resp.data);
                    console.log("Successfully created", resp);
                    $scope.showNotification('Thêm quảng cáo thành công');
                    $scope.load_all();
                    $scope.resetForm();
                }).catch(error => {
                    console.log("Error creating", error);
                    $scope.showNotification('Error creating advertisement', false);
                });
            }
        })
        .catch(error => {
            console.log("Error checking advertisement name", error);
            $scope.showNotification('Error checking advertisement name', false);
        });
};


$scope.resetForm = function () {
    $scope.form = {
        name: '',
        description: '',
        mp3: ''
    };

 
    document.getElementById('uploadImage').value = '';
    document.getElementById('uploadedAvatar').src = '/asset/images/song/banner.png';

   
    document.getElementById('uploadMp3').value = '';
    const audioPreview = document.getElementById('audioPreview');
    if (audioPreview) {
        audioPreview.src = '';
    }
};

$scope.edit = function (id) {
    const url = `${host}/Advertise/admin/${id}`;
    $http.get(url).then(resp => {
      $scope.form = resp.data;

      console.log("Artist data loaded", resp.data);
    }).catch(error => {
      console.log("Error loading artist data", error);
      $scope.showNotification('Error loading artist data', false);
    });
  };

  $scope.update = function (id) {
    const imageFile = document.getElementById('uploadImage2').files[0];
    const mp3File = document.getElementById('uploadMp3Update').files[0];

    if (!$scope.form.name) {
        $scope.showNotification('Tên quảng cáo đang trống', false);
        return;
    }
 
    if (mp3File) {
        if (mp3File.type !== 'audio/mpeg') {
            $scope.showNotification('Chỉ cho phép các tệp MP3');
       
            return;
        }
    }


    if (imageFile) {
        const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/jfif'];
        if (!allowedImageTypes.includes(imageFile.type)) {
            $scope.showNotification('Chỉ cho phép các tệp hình ảnh .png, .jpg, .jpeg, .jfif');
         
            return;
        }
    }
   
    $http.get(`${host}/Advertise/checkNameExistsForUpdate`, { params: { name: $scope.form.name, id: id } })
        .then(response => {
            if (response.data.exists) {
                $scope.showNotification('Tên quảng cáo đã tồn tại', false);
            } else {
              
                
                const formData = new FormData();
                formData.append('name', $scope.form.name);
                formData.append('description', $scope.form.description);
                formData.append('deleted', $scope.form.deleted); 
                if (imageFile) formData.append('image', imageFile);
                if (mp3File) formData.append('mp3', mp3File);

                const url = `${host}/Advertise/admin/${id}`;
                $http.put(url, formData, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).then(resp => {
                    const index = $scope.items.findIndex(item => item.id === id);
                    if (index !== -1) {
                        $scope.items[index] = resp.data;
                    }
                    console.log("Successfully updated", resp);
                    $scope.showNotification('Cập nhật quảng cáo thành công');
                    $scope.load_all();
                }).catch(error => {
                    console.log("Error updating", error);
                    $scope.showNotification('Error updating advertisement: ' + (error.data.message || 'Unknown error'), false);
                });
            }
        })
        .catch(error => {
            console.log("Error checking advertisement name", error);
            $scope.showNotification('Error checking advertisement name', false);
        });
};

$scope.loadMP3Durations = function () {
  $scope.items.forEach(function (art) {
    const audio = new Audio(`http://localhost:8080/rest/get-file-via-byte-array-resource?filename=${art.mp3}`);
    audio.onloadedmetadata = function () {
      $scope.$apply(function () {
        const totalSeconds = Math.round(audio.duration);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        art.duration = `${minutes} phút:${seconds < 10 ? '0' : ''}${seconds} giây`; 
      });
    };
  });
};




$scope.loadMP3Durations();

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
