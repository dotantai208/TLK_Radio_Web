const app = angular.module("admin_artist", []);

app.controller("artistController", function ($scope, $http, $timeout) {
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

  $scope.loadPage = function (page) {
    const url = `${host}/Artist/admin?page=${page}&size=${$scope.itemsPerPage}&search=${$scope.searchQuery}`;
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
    const url = `${host}/Artist/admin/khoiphuc?page=${page}&size=${$scope.itemsPerPage}&search=${$scope.searchQuery}`;
    $http.get(url).then(resp => {
      $scope.itemsFalse = resp.data.content;
      $scope.totalPagesFalse = resp.data.totalPages;
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

  $scope.search = function () {
    $scope.loadPage(0);
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


  $scope.getPageNumbersFalse = function () {
    return new Array($scope.totalPagesFalse).fill(0).map((_, i) => i);
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

 
  function formatDateString(dateString) {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date; // Convert to Date object or return null if invalid
  }

  $scope.items.forEach(function (item) {
    item.dateOfBirth = formatDateString(item.dateOfBirth);
  });

  $scope.edit = function (stageName) {
    const url = `${host}/Artist/${stageName}`;
    $http.get(url).then(resp => {
      $scope.form = resp.data;
      $scope.form.dateOfBirth = formatDateString($scope.form.dateOfBirth);
      console.log("Artist data loaded", resp.data);
    }).catch(error => {
      console.log("Error loading artist data", error);
      $scope.showNotification('Error loading artist data', false);
    });
  };

  $scope.isValidImageFile = function (file) {
    if (!file) return false;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/jfif'];
    return allowedTypes.includes(file.type);
  };

  $scope.update = function (stageName) {
    if (!$scope.form.realName && !$scope.form.stageName && !$scope.form.dateOfBirth && !$scope.form.story) {
      $scope.showNotification('Vui lòng nhập thông tin', false);
      return;
    }
    if(!$scope.form.realName){
      $scope.showNotification('Tên thật đang bỏ trống', false);
      return;
    }

    if(!$scope.form.dateOfBirth){
      $scope.showNotification('Ngày sinh đang bỏ trống', false);
      return;
    }

    // Kiểm tra ngày sinh phải từ 10 tuổi trở lên
    const today = new Date();
    const birthDate = new Date($scope.form.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 10) {
      $scope.showNotification('Nghệ sĩ phải từ 10 tuổi trở lên', false);
      return;
    }

    if(!$scope.form.story){
      $scope.showNotification('Câu chuyện nghệ sĩ đang bỏ trống', false);
      return;
    }

    const formData = new FormData();
    formData.append('realName', $scope.form.realName);
    formData.append('dateOfBirth', $scope.form.dateOfBirth.toISOString().split('T')[0]);
    formData.append('story', $scope.form.story);

    const imageFile = document.getElementById('uploadImage2').files[0];
    if (imageFile) {
      if (!$scope.isValidImageFile(imageFile)) {
        $scope.showNotification('File ảnh không đúng định dạng(.png, .jpg, .jpeg, hoặc .jfif.)', false);
        return;
      }
      formData.append('image', imageFile);
    }

    const url = `/rest/Artist/admin/${stageName}`;

    $http.put(url, formData, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    }).then(resp => {
      const index = $scope.items.findIndex(a => a.stageName === stageName);
      if (index !== -1) {
        $scope.items[index] = resp.data;
      }
      console.log("Cập nhật thành công", resp);

      if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
          document.getElementById('uploadedAvatar2').src = e.target.result;
        };
        reader.readAsDataURL(imageFile);
      }
      $scope.showNotification('Cập nhật thành công');
    }).catch(error => {
      console.log("Lỗi khi cập nhật", error);
      $scope.showNotification('Lỗi khi cập nhật', false);
    });
  };


  $scope.create = function () {
    if (!$scope.form.realName && !$scope.form.stageName && !$scope.form.dateOfBirth && !$scope.form.story) {
      $scope.showNotification('Vui lòng nhập thông tin', false);
      return;
    }
    if(!$scope.form.realName){
      $scope.showNotification('Tên thật đang bỏ trống', false);
      return;
    }
    if(!$scope.form.stageName){
      $scope.showNotification('Nghệ danh đang bỏ trống', false);
      return;
    }
    if(!$scope.form.dateOfBirth){
      $scope.showNotification('Ngày sinh đang bỏ trống', false);
      return;
    }

    // Kiểm tra ngày sinh phải từ 10 tuổi trở lên
    const today = new Date();
    const birthDate = new Date($scope.form.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 10) {
      $scope.showNotification('Nghệ sĩ phải từ 10 tuổi trở lên', false);
      return;
    }

    if(!$scope.form.story){
      $scope.showNotification('Câu chuyện nghệ sĩ đang bỏ trống', false);
      return;
    }

    const duplicate = $scope.items.some(artist => artist.stageName.toLowerCase() === $scope.form.stageName.toLowerCase());
    if (duplicate) {
      $scope.showNotification('Nghệ danh này đã tồn tại.', false);
      return;
    }

    const imageFile = document.getElementById('uploadImage').files[0];
    if (!imageFile) {
      $scope.showNotification('Ảnh nghệ sĩ đang trống', false);
      return;
    }

    if (!$scope.isValidImageFile(imageFile)) {
      $scope.showNotification('File ảnh không đúng định dạng(.png, .jpg, .jpeg, hoặc .jfif.)', false);
      return;
    }

    const formData = new FormData();
    const form = angular.copy($scope.form);

    formData.append('realName', form.realName);
    formData.append('stageName', form.stageName);
    formData.append('dateOfBirth', form.dateOfBirth);
    formData.append('story', form.story);
    formData.append('image', imageFile);

    const url = `${host}/Artist`;

    $http.post(url, formData, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    }).then(resp => {
      $scope.items.push(resp.data);
      console.log("Successfully created", resp);
      $scope.showNotification('Thêm nghệ sĩ thành công');
      $scope.resetForm();
    }).catch(error => {
      console.log("Error creating", error);
      $scope.showNotification('Lỗi khi tạo nghệ sĩ', false);
    });
  };

  
  $scope.delete = function (stageName) {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa Nghệ sĩ này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có, tôi chắc chắn',
      cancelButtonText: 'Hủy bỏ'
    }).then((result) => {
      if (result.isConfirmed) {
        $http.put(`${host}/Artist/${stageName}/delete`).then(function (response) {
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Nghệ sĩ đã được xóa thành công'
          });
          $scope.load_all();
        }).catch(function (error) {
          console.error('Error deleting song', error);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Xóa nghệ sĩ không thành công'
          });
        });
      }
    });
  };
  $scope.deleteFalse = function (stageName) {
    Swal.fire({
      title: 'Bạn có muốn khôi phục nghệ sĩ này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có, tôi chắc chắn',
      cancelButtonText: 'Hủy bỏ'
    }).then((result) => {
      if (result.isConfirmed) {
        $http.put(`${host}/Artist/${stageName}/khoiphuc`).then(function (response) {
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Nghệ sĩ đã được khôi phục'
          });
          $scope.load_allFalse();
        }).catch(function (error) {
          console.error('Error deleting song', error);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Khôi phục nghệ sĩ không thành công'
          });
        });
      }
    });
  };
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
