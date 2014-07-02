
myApp.controller('AgentStatsController', function ($scope, $filter, connectionService, agentStatsService) {
    $scope.queueName = agentStatsService.getQueue();
    $scope.isLoading = true;
    $scope.predicate = 'id';

    $scope.$watch(function(){
        return agentStatsService.getRefreshToken();
    }, function(data){

        var statDict = agentStatsService.getAgentStats();

        var stats =[];
        stats = Object.keys(statDict).map(function(key){
            return statDict[key];
        });

        $scope.agentStats = stats;
        $scope.isLoading = false;

    }, true);

});

myApp.controller('ConnectionController', function ($scope, $rootScope, $location, connectionService, restClient) {

    $scope.isConnected = true;

    var queryStringParams = $location.search();
    $scope.userName = queryStringParams.user;
    $scope.password = queryStringParams.password;
    $scope.server = queryStringParams.server;

    $scope.isConnected = connectionService.isConnected;
    $scope.disconnectReason = '';

    $rootScope.$on('connectionStateChanged', function(event,data){
        $scope.isConnected = data;
        if(!data){
            $scope.userName = localStorage.user;
        }
    });

    connectionService.connect($scope.userName, $scope.password, $scope.server, function(){
        $scope.isConnected = true;
        $scope.disconnectReason = '';
    },
    function(data, status){
        $scope.isConnected = false;
        var reason = '';
        if(data){
            reason = data.message;
        }
        else{
            reason = "Unknown Reason";
        }
        $scope.disconnectReason = "Unable to Connect: " + reason;
    });
});



myApp.controller('ServiceInitializationController', function (messageService) {
    //don't need to do anything, but we want these services created.
});
