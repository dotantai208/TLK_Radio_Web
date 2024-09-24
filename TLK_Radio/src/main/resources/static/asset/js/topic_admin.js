const app = angular.module("topic", []);

app.controller("topicController", function($scope, $http,$timeout) {
  $scope.items = [];
  $scope.form = {};
  $scope.currentPage = 0;
  $scope.itemsPerPage = 5;
  $scope.searchQuery = '';
  $scope.totalPages = 0;

  $scope.totalPagesFalse = 0;
  $scope.currentPageFalse = 0;
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

  $scope.loadPage = function(page) {
    const url = `${host}/topics/admin?page=${page}&size=${$scope.itemsPerPage}&search=${$scope.searchQuery}`;
    $http.get(url).then(resp => {
      $scope.items = resp.data.content;
      $scope.totalPages = resp.data.totalPages;
      $scope.currentPage = page;
      console.log("Successfully loaded", resp);
    }).catch(error => {
      console.error("Error loading topics", error);
    });
  };
  $scope.loadPageFalse = function(page) {
    const url = `${host}/topics/admin/khoiphuc?page=${page}&size=${$scope.itemsPerPage}&search=${$scope.searchQuery}`;
    $http.get(url).then(resp => {
      $scope.itemsFalse = resp.data.content;
      $scope.totalPagesFalse = resp.data.totalPages;
      $scope.currentPageFalse = page;
      console.log("Successfully loaded", resp);
    }).catch(error => {
      console.error("Error loading topics", error);
    });
  };
  $scope.load_all = function() {
    $scope.loadPage($scope.currentPage);
  };
  $scope.load_allFalse = function() {
    $scope.loadPageFalse($scope.currentPageFalse);
  };
  $scope.search = function() {
    $scope.loadPage(0);
  };
  $scope.searchFalse = function() {
    $scope.loadPageFalse(0);
  };

  $scope.getPageNumbers = function() {
    return new Array($scope.totalPages).fill(0).map((_, i) => i);
  };
  $scope.getPageNumbersFalse = function() {
    return new Array($scope.totalPagesFalse).fill(0).map((_, i) => i);
  };

  function formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    const month = ("0" + (d.getMonth() + 1)).slice(-2);
    const day = ("0" + d.getDate()).slice(-2);
    const year = d.getFullYear();
    return [year, month, day].join("-");
  }

  $scope.resetForm = function() {
    $scope.form = {
      name: '',
      createUser: '',
      updateUser: '',
      createDate: '',
      updateDate: '',
      deleted: false
    };
    document.getElementById('uploadImage').value = '';
    document.getElementById('uploadedAvatar').src = '/asset/images/song/banner.png';
  };

  $scope.edit = function(id) {
    const url = `${host}/Topic/${id}`;
    $http.get(url).then(resp => {
      $scope.form = resp.data;
      $scope.form.createDate = formatDate($scope.form.createDate);
      console.log("Successfully loaded topic for edit", resp);
    }).catch(error => {
      console.error("Error loading topic details", error);
    });
  };

  $scope.update = function() {
    if (!$scope.form.name) {
        $scope.showNotification('Tên chủ đề đang bỏ trống', false);
        return;
    }

    // Gọi API kiểm tra tên trùng cho cập nhật
    $http.get(`${host}/topics/checkNameExistsForUpdate`, { params: { name: $scope.form.name, id: $scope.form.id } })
        .then(function(response) {
            if (response.data.exists) {
                $scope.showNotification('Tên Chủ đề đã tồn tại', false);
                return;
            } else {
                // Nếu không trùng, tiến hành cập nhật
                const url = `${host}/Topic/${$scope.form.id}`;
                const formData = new FormData();

                formData.append('topicDetails', JSON.stringify({
                    name: $scope.form.name,
                    updateUser: $scope.form.updateUser,
                    updateDate: new Date().toISOString().split('T')[0]
                }));

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
                    console.log("Cập nhật thành công", response.data);

                    if (imageFile) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            document.getElementById('uploadedAvatar2').src = e.target.result;
                        };
                        reader.readAsDataURL(imageFile);
                    }

                    $scope.load_all();
                    $scope.showNotification('Cập nhật chủ đề thành công', true);
                }, function errorCallback(response) {
                    console.log("Lỗi khi cập nhật chủ đề", response);
                    $scope.showNotification('Lỗi khi cập nhật chủ đề', false);
                });
            }
        }).catch(function(error) {
            console.log("Error checking topic existence:", error);
            $scope.showNotification('Error checking topic existence', false);
        });
};


$scope.isValidImageFile = function (file) {
  if (!file) return false;
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/jfif'];
  return allowedTypes.includes(file.type);
};

$scope.create = function() {
  const formData = new FormData();
  const imageFile = document.getElementById('uploadImage').files[0];
  
  if (!$scope.form.name) {
      $scope.showNotification('Tên chủ đề đang bỏ trống', false);
      return;
  }

  $http.get(`${host}/topics/checkNameExists`, { params: { name: $scope.form.name } })
      .then(function(response) {
          if (response.data.exists) {
              $scope.showNotification('Tên Chủ đề đã tồn tại', false);
          } else {
              if (!imageFile) {
                  $scope.showNotification('Ảnh chủ đề đang trống', false);
                  return;
              }

              if (imageFile && !$scope.isValidImageFile(imageFile)) {
                  $scope.showNotification('File ảnh không đúng định dạng(.png, .jpg, .jpeg, hoặc .jfif.)', false);
                  return;
              }

              formData.append('image', imageFile);
              
              const topic = {
                  name: $scope.form.name,
                  createUser: $scope.form.createUser,
                  updateUser: $scope.form.updateUser,
                  createDate: $scope.form.createDate,
                  updateDate: $scope.form.updateDate,
              };

              formData.append('topic', JSON.stringify(topic));
              
              const url = `${host}/Topic`;
              console.log("Creating topic with data:", topic);
              
              $http.post(url, formData, {
                  headers: {'Content-Type': undefined} // Let the browser set the content type for FormData
              }).then(resp => {
                  $scope.items.push(resp.data);
                  console.log("Successfully created", resp);
                  $scope.load_all();
                  $scope.resetForm();
                  $scope.showNotification('Thêm chủ đề thành công', true);
              }).catch(error => {
                  console.log("Error creating", error);
                  $scope.showNotification('Error creating topic', false);
              });
          }
      }).catch(function(error) {
          console.log("Error checking album existence:", error);
          $scope.showNotification('Error checking album existence', false);
      });
};
  

 
  $scope.delete = function (id) {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa Chủ đề này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có, tôi chắc chắn',
      cancelButtonText: 'Hủy bỏ'
    }).then((result) => {
      if (result.isConfirmed) {
        $http.put(`${host}/Topic/${id}/softDelete`).then(function (response) {
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Chủ đề đã được xóa thành công'
          });
          $scope.load_all();
        }).catch(function (error) {
          console.error('Error deleting song', error);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Xóa Chủ đề không thành công'
          });
        });
      }
    });
  };

  $scope.deleteFalse = function (id) {
    Swal.fire({
      title: 'Bạn có muốn khôi phục chủ đề này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có, tôi chắc chắn',
      cancelButtonText: 'Hủy bỏ'
    }).then((result) => {
      if (result.isConfirmed) {
        $http.put(`${host}/Topic/${id}/khoiphuc`).then(function (response) {
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Chủ đề đã được khôi phục'
          });
          $scope.load_allFalse();
        }).catch(function (error) {
          console.error('Error deleting song', error);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Khôi phục Chủ đề không thành công'
          });
        });
      }
    });
  };

  $scope.load_all();
  $scope.resetForm();
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
