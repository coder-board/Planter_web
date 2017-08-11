define(function (require) {
    var app = require('./app');


    app.run(['$state', '$stateParams', '$rootScope','$http', function ($state, $stateParams, $rootScope,$http) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }]);

    app.config(['$stateProvider', '$urlRouterProvider',function ($stateProvider, $urlRouterProvider) {
        
        $urlRouterProvider.otherwise('course');

        $stateProvider
		    .state('course', {
    			url: '/course',
    			templateUrl: 'page/course/view.html',
                controllerUrl: 'page/course/courseCtrl',
                controller: 'courseCtrl'
    		})
            .state('attendance', {
                url: '/attendance',
                templateUrl: 'page/attendance/view.html',
                controllerUrl: 'page/attendance/attendanceCtrl',
                controller: 'attendanceCtrl'
            })
            .state('question', {
                url: '/question',
                templateUrl: 'page/question/view.html',
                controllerUrl: 'page/question/questionCtrl',
                controller: 'questionCtrl'
            })
            .state('focus', {
                url: '/focus',
                templateUrl: 'page/focus/view.html',
                controllerUrl: 'page/focus/focusCtrl',
                controller: 'focusCtrl'
            })
            .state('group', {
                url: '/group',
                templateUrl: 'page/group/view.html',
                controllerUrl: 'page/group/groupCtrl',
                controller: 'groupCtrl'
            })
            .state('homework', {
                url: '/homework',
                templateUrl: 'page/homework/view.html',
                controllerUrl: 'page/homework/homeworkCtrl',
                controller: 'homeworkCtrl'
            })
            .state('resource', {
                url: '/resource',
                templateUrl: 'page/resource/view.html',
                controllerUrl: 'page/resource/resourceCtrl',
                controller: 'resourceCtrl'
            })
            .state('uploadHomework', {
                url: '/uploadHomework',
                templateUrl: 'page/uploadHomework/view.html',
                controllerUrl: 'page/uploadHomework/uploadHomeworkCtrl',
                controller: 'uploadHomeworkCtrl'
            })
            .state('downloadResource', {
                url: '/downloadResource',
                templateUrl: 'page/downloadResource/view.html',
                controllerUrl: 'page/downloadResource/downloadResourceCtrl',
                controller: 'downloadResourceCtrl'
            })
            .state('share', {
                url: '/share',
                templateUrl: 'page/share/view.html',
                controllerUrl: 'page/share/shareCtrl',
                controller: 'shareCtrl'
            })
            .state('userLogin', {
                url: './userLogin',
                templateUrl: './userLogin/Login.html',
            })
            .state('planManage', {
                url: '/planManage',
                templateUrl:'page/planManage/view.html',
                controllerUrl: 'page/planManage/planManageCtrl',
                controller: 'planManageCtrl'
            });
    }])


    .value("common", {
        Config: {
            Host: "http://118.89.48.183:8080/Planter",
            // Host: "http://192.168.235.50:8080",
            // Host: "http://10.173.8.165:8080",
            SignalSpan: 1000,//信号监听时间间隔  
            BeforSpan: 600,
            LoginUrl: "/login"
        },
        Session: {
            UserId: 0,
            UserName: "",
            LoginName: "",
            Power: 0,
            Token: "",
            Rank: 0,
            Plan: 0
        },
        //网络动作回调 1:发送数据 2：接收数据
        OnAction:function(flag){

        },
        //提示信息回调函数
        Message: function (title, content, showTime) {
            //...
            console.log(title, content, showTime);
        },
        //错误信息回调函数
        Error: function (err) {
            console.log(err);
        }
    })

    .service('WebApi', function ($http, $location, common) {
        
        var _host = common.Config.Host;
        var info = $.cookie("cookieInfo");
        this.Get = function (url, data, callback) {
            common.OnAction&&common.OnAction(1);            
            $http({                
                url: _host + url,
                params: data,
                method: 'GET',
                headers: {
                    "Authorization":info
                }
            })
                .success(function (data, StatusCode, config, status) {
                    common.OnAction&&common.OnAction(2); 
                    if (StatusCode == 200) {
                        callback && callback(data, StatusCode, config, status);
                    } else {
                        if (common.Message) {                            
                            var content,title;
                            if (StatusCode >= 500) {
                                 content = data && data.Message || "未知错误";
                                 data.ExceptionMessage&&(content +=data.ExceptionMessage);
                                 title="服务器内部错误[" + StatusCode + "]";
                            }else if(StatusCode==401){
                                content = data && data.Message || "用户身份未授权，请重新登陆！";
                                title="授权错误";
                            }else  if(StatusCode>=400){                                
                                content = data && data.Message || "请求出错,服务器不接受请求!";
                                title="请求错误[" + StatusCode + "]";
                            }
                            common.Message(title, content);
                        }
                    }

                })
                .error(function (data, StatusCode, config, status) {
                    //错误处理 
                    common.Error && common.Error(data);
                });
        }

        this.Post = function (url, data, callback) {
            $http({
                url: _host + url,
                method: 'POST',
                data: data,
                headers: {
                    // "Token": common.Session.Token
                    "Authorization":info
                }
            })
                .success(function (data, StatusCode, config, status) {
                    common.OnAction&&common.OnAction(2); 
                    if (StatusCode == 200) {
                        callback && callback(data, StatusCode, config, status);
                    } else {
                        if (common.Message) {                            
                            var content,title;
                            if (StatusCode >= 500) {
                                 content = data && data.Message || "未知错误";
                                 data.ExceptionMessage&&(content +=data.ExceptionMessage);
                                 title="服务器内部错误[" + StatusCode + "]";
                            }else if(StatusCode==401){
                                // content = data && data.Message || "用户身份未授权，请重新登陆！";
                                content = data && data.Message || "用户身份未授权，无法进行该操作！";
                                title="授权错误";
                            }else if(StatusCode>=400){                                
                                content = data && data.Message || "请求出错,服务器不接受请求!";
                                title="请求错误[" + StatusCode + "]";
                            }
                            common.Message(title, content);
                        }
                    }

                })
                .error(function (data, header, config, status) {
                    //错误处理 
                    common.ErrorHandle && common.ErrorHandle(data);
                });
        }

    })


});
