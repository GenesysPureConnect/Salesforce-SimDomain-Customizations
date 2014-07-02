var APP_NAME = 'Statistics In Salesforce';


myApp.factory('restClient', function($http){

	return {
		setConnectionInformation: function(serverName, csrfToken1, sessionId1){
			csrfToken = csrfToken1;
			server = serverName;
			sessionId = sessionId1;
		},
		post: function(url, data, onSuccess, onError){
			$http({
                  method: 'POST',
                  withCredentials: true,
                  url: 'http://' + server + ":8018/icws/" + sessionId + url,
                  headers:{
                  	'Accept-Language' : 'en-US',
                    'ININ-ICWS-CSRF-Token' : csrfToken
                  } ,
                  timeout:2000,
                  data:data,
              }).success(function (data, status) {
              	if(onSuccess){
              		onSuccess(data,status);
              	}

			  }).error(function (data, status) {
                  if(onError){
              		onError(data,status);
              	}
              });
		},
		put: function(url, data, onSuccess, onError){
			$http({
                  method: 'PUT',
                  withCredentials: true,
                  url: 'http://' + server + ":8018/icws/" + sessionId + url,
                  headers:{
                  	'Accept-Language' : 'en-US',
                    'ININ-ICWS-CSRF-Token' : csrfToken
                  } ,
                  data:data,
              }).success(function (data, status) {
              	if(onSuccess){
              		onSuccess(data,status);
              	}

			  }).error(function (data, status) {
                  if(onError){
              		onError(data,status);
              	}
              });
		},
		get: function(url, onSuccess, onError){
			$http({
                  method: 'GET',
                  withCredentials: true,
                  url: 'http://' + server + ":8018/icws/" + sessionId + url,
                  headers:{
                  	'Accept-Language' : 'en-US',
                    'ININ-ICWS-CSRF-Token' : csrfToken
                  } ,
                  timeout: 3000,
              }).success(function (data, status) {
              	if(onSuccess){
              		onSuccess(data,status);
              	}

			  }).error(function (data, status) {
                  if(onError){
              		onError(data,status);
              	}
              });
		},
		delete: function(url, onSuccess, onError){
			$http({
                  method: 'delete',
                  withCredentials: true,
                  url: 'http://' + server + ":8018/icws/" + sessionId + url,
                  headers:{
                  	'Accept-Language' : 'en-US',
                    'ININ-ICWS-CSRF-Token' : csrfToken
                  } ,
                  timeout: 3000,
              }).success(function (data, status) {
              	if(onSuccess){
              		onSuccess(data,status);
              	}

			  }).error(function (data, status) {
                  if(onError){
              		onError(data,status);
              	}
              });
		}
	};
});

myApp.factory('messageService', function ($rootScope, $timeout, restClient, connectionService ) {
  	function pollMessages() {
  		if(connectionService.getIsConnected()){
          $timeout(function () {
              restClient.get('/messaging/messages', function(data){
              	for(var i = 0; i< data.length; i++){
              		var message = data[i];
              //		console.log(message);
              		$rootScope.$broadcast(message.__type, message);
              	}

              	 pollMessages();
              }, function(){
              	connectionService.disconnect();
              });

          }, 1500);
		}
      }

	  $rootScope.$on('connectionStateChanged', function(event, data){
	  	if(data===true){
	  	pollMessages();
	  	}
	  });

      return {};
   });


myApp.factory('connectionService', function($rootScope, $http, $window, restClient, guidService) {
   this._isConnected = false;
   this._disconnectReason = '';

   return {
   		getDisconnectReason: function(){
   			return this._disconnectReason;
   		},
    	getIsConnected:function(){
    		return this._isConnected;
    	},
    	getServer: function(){
    		return _server;
    	},
    	getUserId: function(){
    		return this._userId;
    	},
    	disconnect:function(){
    		$rootScope.$broadcast('connectionStateChanged', false);

    		localStorage.removeItem("csrfToken");
			localStorage.removeItem("sessionId");

    		restClient.delete("/connection");
    	},
        connect: function(user, password, server, onSuccess, onFailure) {
        	this._userId = user;
            $rootScope.userID = user;
        	that = this;

        	function onSuccessfulConnection(serverUrl, data){
        		that._disconnectReason = '';

        		restClient.setConnectionInformation(serverUrl, data.csrfToken, data.sessionId);

        		localStorage.csrfToken = data.csrfToken;
        		localStorage.sessionId = data.sessionId;

              	that._isConnected = true;
              	$rootScope.$broadcast('connectionStateChanged', true);
              	if(onSuccess){
              		onSuccess();
              	}
              	_server = serverUrl;
              	localStorage.user = user;
              	localStorage.server = _server;
             }

        	 var connectData =  {
				                  	'__type':'urn:inin.com:connection:icAuthConnectionRequestSettings',
				                  	'applicationName' :APP_NAME,
				                  	'userID': user,
				                  	'password' : password

				                 };


			//this connect logic is ugly as shit, here is what is going on.  We try to connect at first,
			// if the connection returns a 503, then we either neet to try to connect to another server
			// or an off server session manager.  With a 503, we are given the list of servers to connect to.

             $http({
                  method: 'POST',
                  withCredentials: true,
                  url: 'http://' + server + ":8018/icws/connection",
                  headers:{'Accept-Language' : 'en-US'} ,
                  data:connectData,
              }).success(function (data, status) {
              	onSuccessfulConnection(server, data);

              }).error(function (data, status) {
                  // Some error occurred
                  that._isConnected = false;
                  that._disconnectReason = data.message;

                  $rootScope.$broadcast('connectionStateChanged', false);

                  if(status == 503){
                  	//a 503 means we need to try a different server
                  	var serverList = data.alternateHostList;

                  	function tryNextServerInList(data, status){
                  		//if the server list is empty, we've tried all the servers we can, so we in fact have a connection error
                  		if(serverList.length > 0)
                  		{
                  			var nextServer = serverList.pop().toLowerCase();
                  			var nextServerUrl = "http://" + nextServer + ":8018";  //'http://' + nextServer + ":8018";
                  			 $http({
				                  method: 'POST',
				                  withCredentials: true,
				                  url: nextServerUrl + "/icws/connection",
				                  headers:{'Accept-Language' : 'en-US'} ,
				                  data:connectData

				              }).success(function (data, status) {
				              	onSuccessfulConnection(nextServerUrl, data);

				              }).error(function (data, status) {
				              	tryNextServerInList(data,status);
				              });
                  		}
                  		else
                  		{
                  			that._disconnectReason = data.message;

                  			$rootScope.$broadcast('connectionStateChanged', false);
                  			if(onFailure){
			              		onFailure(data, status);
			              	}
                  		}
                  	}

                  	tryNextServerInList(data,status);

                  }
              });
        }
    };
});


myApp.factory('agentStatsService', function($rootScope, restClient, $location) {

    queue = null;
    agentData= {};
    refreshToken = 0;

    queue = $location.search().queue;
    if(queue == null){
        queue = 'Marketing';
    }

    $rootScope.$on('connectionStateChanged', function(event,data){


        //get agents in that workgroup
        restClient.get('/configuration/workgroups/' + queue + '?select=members&rightsFilter=view', function(data){
                //start agent stat watch
                var statWatchData = [];
                for(var memberIndex = 0; memberIndex < data.members.length; memberIndex++){

                    var agentId = data.members[memberIndex].id;

                    var stats = ["inin.agent:InteractionsEntered", "inin.agent:InteractionsAnswered", "inin.agent:AverageTalkTime", "inin.agent:LongestTalkTime", "inin.agent:NonACDInteractions", "inin.agent:AverageHoldTime"]

                    for(var statKeyIndex = 0; statKeyIndex< stats.length; statKeyIndex++){
                        var statWatchParams = {
                                        "statisticIdentifier": stats[statKeyIndex],
                                            "parameterValueItems": [{
                                                                        "parameterTypeId": "ININ.People.WorkgroupStats:Workgroup",
                                                                            "value": queue //From the call attribute
                                                                    }, {
                                                                        "parameterTypeId": "ININ.People.AgentStats:User",
                                                                            "value": agentId
                                                                    }, {
                                                                        "parameterTypeId": "ININ.Queue:Interval",
                                                                            "value": "CurrentShift"
                                                                    }]
                                                                };

                            statWatchData.push(statWatchParams);

                    }


                }

                restClient.put("/messaging/subscriptions/statistics/statistic-values", {
                                    'statisticKeys': statWatchData
                                });





          }, function(){

          });



	  });

	$rootScope.$on('urn:inin.com:statistics:statisticValueMessage', function(event, data){
        for(var statIndex = 0; statIndex < data.statisticValueChanges.length; statIndex++){
            var stat = data.statisticValueChanges[statIndex];
            var userId = stat.statisticKey.parameterValueItems[1].value;

            if(agentData[userId] == null){
                agentData[userId] = {"id" : userId.replace("."," ")};
            }

            var statKey = stat.statisticKey.statisticIdentifier.substring(stat.statisticKey.statisticIdentifier.lastIndexOf(":") + 1);
            agentData[userId][statKey] = stat.statisticValue;

            if(!agentData[userId][statKey]){
                agentData[userId][statKey] = 0;
            }

            if(agentData[userId][statKey].value != null){
                if(agentData[userId][statKey].statisticValueType===6){
                    agentData[userId][statKey+"Raw"] = agentData[userId][statKey].value;

                    var sec_num = parseInt(agentData[userId][statKey].value, 10); // don't forget the second param
                    var hours   = Math.floor(sec_num / 3600);
                    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                    var seconds = sec_num - (hours * 3600) - (minutes * 60);

                    if (hours   < 10) {hours   = "0"+hours;}
                    if (minutes < 10) {minutes = "0"+minutes;}
                    if (seconds < 10) {seconds = "0"+seconds;}
                    var time    = hours+':'+minutes+':'+seconds;
                    agentData[userId][statKey] = time;



                }
                else{
                    agentData[userId][statKey] = agentData[userId][statKey].value;
                }
            }
        }

    //    console.log(agentData);
        refreshToken = (refreshToken + 1) % 3;
    //    console.log(refreshToken);
	});

   return{
       getQueue: function(){
           return queue;
       },

       getAgentStats: function(){
           return agentData;
       },

       getRefreshToken: function(){
           return refreshToken;
       }




    };

});


myApp.factory('guidService', function(){
	 function s4() {
	  return Math.floor((1 + Math.random()) * 0x10000)
	             .toString(16)
	             .substring(1);
	};

	function guid() {
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	         s4() + '-' + s4() + s4() + s4();
	}

	return{
		getGuid : guid
	}

});
