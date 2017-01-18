app.controller('maincontroller',['$scope','$http',function($scope,$http){

$scope.data=[];
var socket = io('http://localhost:3000');
$scope.fetchtwit=function(hastag){
	console.log(hastag)
	$http.get('/api?q='+hastag).then(function(data){
		//console.log(data)
		$scope.data=JSON.parse(data.data).statuses;
		console.log($scope.data);
	},function(error){
		console.log(error);
	})
}

socket.on('new', function (data) {
    new_data=JSON.parse(data).statuses;
    $scope.$apply(function(){
    	$scope.data=new_data.concat($scope.data)
    });
});

}])


