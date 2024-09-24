const app = angular.module("admin", []);

app.controller("accountController", function($scope, $http) {
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
  
  
    



  $scope.loadPage = function(page) {
    const url = `${host}/account?page=${page}&size=${$scope.itemsPerPage}&search=${$scope.searchQuery}`;
    $http.get(url).then(resp => {
      $scope.items = resp.data.content;
      $scope.totalPages = resp.data.totalPages;
      $scope.currentPage = page;
      console.log("Successfully loaded", resp);

    }).catch(error => {
      console.error("Error loading songs", error);
    });
  };



  $scope.load_all = function() {
    $scope.loadPage($scope.currentPage);
  };

  $scope.search = function() {
    $scope.loadPage(0);
  };



  $scope.getPageNumbers = function() {
    return new Array($scope.totalPages).fill(0).map((_, i) => i);
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
      username: '',
      password: '',
      fullname: '',
      dateOfBirth: '',
      role: false,
      vip: null
    }};

    $scope.edit = function(username) {
      const url = `${host}/account/${username}`;
      $http.get(url).then(resp => {
        $scope.form = resp.data;
        if ( $scope.form.dateOfBirth) {
          $scope.form.dateOfBirth = new Date( $scope.form.dateOfBirth);
      }
       
      
      }).catch(error => {
        console.error("Error loading song details", error);
      });
    }
  
    $scope.updateVip = function() {
      $scope.form.vip = $scope.form.vipString === "" ? null : $scope.form.vipString === "Vàng";
    }

    $scope.update = function() {
      if (!$scope.form.username) {
        $scope.showNotification('Tên đăng nhập đang bỏ trống', false);
        return;
    }
    if (!$scope.form.fullname) {
      $scope.showNotification('Họ và tên đang bỏ trống', false);
      return;
  }

  if (!$scope.form.dateOfBirth) {
      $scope.showNotification('Ngày sinh đang bỏ trống', false);
      return;
  } else{
    if (!isAtLeast18YearsOld(new Date($scope.form.dateOfBirth))) {
      $scope.showNotification('Bạn phải từ 18 tuổi trở lên để đăng ký', false);
      return;
  }
  }
      const url = `${host}/account/${$scope.form.username}`;
      $http.put(url, $scope.form).then(resp => {
        $scope.showNotification('Cập nhật tài khoản thành công', false);
        $scope.load_all(); // Reload the list after saving
      }).catch(error => {
        console.log("Error saving", error);
      });
    }

    $scope.create = function() {
      if (!$scope.form.username) {
          $scope.showNotification('Tên đăng nhập đang bỏ trống', false);
          return;
      }
      
      // Check if the username already exists
      $http.get(`${host}/account/checkUsername/${encodeURIComponent($scope.form.username)}`)
          .then(function(response) {
              if (response.data.exists) {
                  $scope.showNotification('Tên đăng nhập đã tồn tại', false);
              } else {
                  // Check other required fields
                  if (!$scope.form.fullname) {
                      $scope.showNotification('Họ và tên đang bỏ trống', false);
                      return;
                  }
                  if (!$scope.form.password) {
                      $scope.showNotification('Mật khẩu đang bỏ trống', false);
                      return;
                  }
                  if (!$scope.form.dateOfBirth) {
                      $scope.showNotification('Ngày sinh đang bỏ trống', false);
                      return;
                  } else{
                    if (!isAtLeast18YearsOld(new Date($scope.form.dateOfBirth))) {
                      $scope.showNotification('Bạn phải từ 18 tuổi trở lên để đăng ký', false);
                      return;
                  }
                  }
                
                  // Prepare data for account creation
                  const item = angular.copy($scope.form);
                  const url = `${host}/account`;
                  $scope.updateVip(); // Ensure VIP status is updated
                  
                  console.log("Creating account with data:", item);
                  $http.post(url, item).then(resp => {
                      $scope.items.push(resp.data); // Add newly created account to the list
                      $scope.showNotification('Thêm tài khoản thành công', false);
                      $scope.load_all(); 
                      $scope.resetForm();
                  }).catch(error => {
                      console.log("Error creating", error);
                  });
              }
          })
          .catch(function(error) {
              console.error("Error checking username availability:", error);
              $scope.showNotification('Có lỗi xảy ra khi kiểm tra tên đăng nhập', false);
          });
  };


  function isAtLeast18YearsOld(dateOfBirth) {
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDifference = today.getMonth() - dateOfBirth.getMonth();
    const dayDifference = today.getDate() - dateOfBirth.getDate();
    
    // Check if birthday has passed in the current year
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        return age - 1 >= 18;
    }
    return age >= 18;
}
  $scope.delete = function(username) {
    if (!username) {
      console.error("Username is required for deletion.");
      return;
    }

    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa Tài khoản này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có, tôi chắc chắn',
      cancelButtonText: 'Hủy bỏ'
    }).then((result) => {
      if (result.isConfirmed) {
        $http.delete(`${host}/account/${username}`).then(function (response) {
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Tài khoản đã được xóa thành công'
          });
          $scope.items = $scope.items.filter(item => item.username !== username); 
          console.log("Successfully deleted", response);
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

  $scope.load_all();

  $scope.resetForm = function() {
    $scope.form = {
      username: '',
      password: '',
      fullname: '',
      dateOfBirth: '',
      role: false,
      vip: null
    };
  }
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
