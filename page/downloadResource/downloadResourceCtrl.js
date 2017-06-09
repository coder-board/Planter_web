define(function (require) {
    var app = require('app');

    app.controller('downloadResourceCtrl', ['$scope','$http','WebApi','common', function($scope,$http,WebApi,common) {

        var studentId = $.cookie('cookieUserId');
        $scope.init = function () {
        	$scope.activeCourse = common.Session.activeCourse;
            getResourceList();
        }

        //获取资源列表
        function getResourceList() {
            var url = "/web/resource/getStudentResourceList";
            WebApi.Post(url,{
                c_id: $scope.activeCourse.c_id,
                s_id :studentId
            },function(d){
                if(d.data){
                    $scope.resourceList = d.data;
                }else{
                    $("#resourceList").html("暂无资源，请先点击上传资源按钮进行资源上传...");
                }
            });
        }

        //更新资源
        $scope.updateResource = function(){
            setTimeout(function(){
                // clearInterval(timer);
                // $("#randomStudent").html(d.data.student_name);
                getResourceList();
            },100);
        }

        //学生选择的课程
        $scope.selectedCourse = function (course){
            $scope.activeCourse = course;
            common.Session.activeCourse = course;
            getResourceList();
        }

    }]);

});
    