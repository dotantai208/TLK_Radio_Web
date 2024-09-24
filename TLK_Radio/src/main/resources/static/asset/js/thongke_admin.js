const app =  angular.module('admin_thongke', [])
app.controller('ThongkeController', ['$scope', 'StatisticsService', function($scope, StatisticsService) {
        $scope.totals = {};
        $scope.artistStatistics = [];
        $scope.topSongsByViews = [];
        $scope.topSongsByFavorites = [];
        $scope.artistSearchQuery = '';

        // Load totals
        StatisticsService.getTotals().then(function(response) {
            $scope.totals = response.data;
        }).catch(function(error) {
            console.error('Error fetching totals:', error);
        });

        // Load artist statistics or search
        $scope.loadArtistStatistics = function(name) {
            StatisticsService.getArtistStatistics(name).then(function(response) {
                $scope.artistStatistics = response.data;
            }).catch(function(error) {
                console.error('Error fetching artist statistics:', error);
            });
        };

        // Initial load of all artist statistics
        $scope.loadArtistStatistics();

        // Search artist by name
        $scope.searchArtist = function() {
            $scope.loadArtistStatistics($scope.artistSearchQuery.trim());
        };

        // Load top 10 songs by views
        StatisticsService.getTop10SongsByViews().then(function(response) {
            $scope.topSongsByViews = response.data;
            renderChart($scope.topSongsByViews, 'viewsChart', 'Lượt nghe');
        }).catch(function(error) {
            console.error('Error fetching top 10 songs by views:', error);
        });

        // Load top 10 songs by favorites
        StatisticsService.getTop10SongsByFavorites().then(function(response) {
            $scope.topSongsByFavorites = response.data;
            renderChart($scope.topSongsByFavorites, 'favoritesChart', 'Yêu thích');
        }).catch(function(error) {
            console.error('Error fetching top 10 songs by favorites:', error);
        });

        // Function to render a chart
        function renderChart(data, chartId, label) {
            const canvas = document.getElementById(chartId);
            if (!canvas) {
                console.error(`Canvas with ID ${chartId} not found.`);
                return;
            }

            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(item => item[1]), // Assuming item[1] is the song name
                    datasets: [{
                        label: `Top 10 Bài hát theo ${label}`,
                        data: data.map(item => item[2]), // Assuming item[2] is the count
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(201, 203, 207, 0.2)',
                            'rgba(255, 233, 132, 0.2)',
                            'rgba(0, 191, 255, 0.2)',
                            'rgba(127, 255, 0, 0.2)',
                            'rgba(255, 140, 0, 0.2)',
                            'rgba(255, 215, 0, 0.2)',
                            'rgba(147, 112, 219, 0.2)',
                            'rgba(60, 179, 113, 0.2)',
                            'rgba(0, 128, 128, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(201, 203, 207, 1)',
                            'rgba(255, 233, 132, 1)',
                            'rgba(0, 191, 255, 1)',
                            'rgba(127, 255, 0, 1)',
                            'rgba(255, 140, 0, 1)',
                            'rgba(255, 215, 0, 1)',
                            'rgba(147, 112, 219, 1)',
                            'rgba(60, 179, 113, 1)',
                            'rgba(0, 128, 128, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    
]
);
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


    angular.module('admin_thongke').service('StatisticsService', ['$http', function($http) {
        this.getTotals = function() {
            return $http.get('/api/statistics/totals');
        };
    
        this.getArtistStatistics = function(name) {
            if (name) {
                return $http.get('/api/statistics/artist/' + encodeURIComponent(name));
            } else {
                return $http.get('/api/statistics/artists');
            }
        };
    
        this.getTop10SongsByViews = function() {
            return $http.get('/api/statistics/top-songs-by-views');
        };
    
        this.getTop10SongsByFavorites = function() {
            return $http.get('/api/statistics/top-songs-by-favorites');
        };
    }]);
   