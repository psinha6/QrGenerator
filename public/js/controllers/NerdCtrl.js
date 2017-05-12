angular.module('NerdCtrl', []).controller('NerdController', function($scope, $http, Nerd, $location) {

	$("#qrgenerator").css("display", "none");

	$scope.showStuff = function(){
		$http({
          method: 'GET',
          url: '/showQRCodes'
        }).then(function successCallback(response) {
            console.log("Image saved successfully :: " + JSON.stringify(response));
            $scope.qrcodes = response.data;
          }, function errorCallback(response) {
            console.log("Error could not save image::" + JSON.stringify(response));
          });
	}

  $scope.addMappingToImage = function(desc){
    console.log(desc);
    Nerd.imageid = desc;
    Nerd.printImageId();
    $location.path( 'geeks' );
  }
	$scope.zipDownload = function(filterData){
    $scope.filesZipped = "";
    $http({
          method: 'GET',
          url: '/downloadImages',
          params: {filterData: filterData}
        }).then(function successCallback(response) {
          console.log("Image saved successfully :: " + JSON.stringify(response));
          $scope.filesZipped = response.data.name;

        }, function errorCallback(response) {
          console.log("Error could not save image::" + JSON.stringify(response));
        });
  }

});