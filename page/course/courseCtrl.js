define(function (require) {
    var app = require('app');

    app.controller('courseCtrl', ['$scope','$http','WebApi','common', function($scope,$http,WebApi,common) {
        var teacherId = 1234;
        $scope.init = function () {
            getCourseList();
            $scope.isCourse = false;
        }

        //获取已有课程列表
        function getCourseList(){
            //获取课程列表
            // var d = {
            //     "error_code": 200, 
            //     "reason": "desc", 
            //     "data": [
            //         {
            //             "c_id": "course789", 
            //             "course_code": "145845", 
            //             "course_name": "影视英语", 
            //             "course_open_count": 6, 
            //             "course_open_time_list": [
            //                 "星期二 09:10", 
            //                 "星期三 10:10", 
            //                 "星期四 08:30"
            //             ]
            //         }, 
            //         {
            //             "c_id": "course789", 
            //             "course_code": "635303", 
            //             "course_name": "影视英语", 
            //             "course_open_count": 6, 
            //             "course_open_time_list": [
            //                 "星期二 09:10", 
            //                 "星期三 10:10", 
            //                 "星期四 08:30"
            //             ]
            //         }, 
            //         {
            //             "c_id": "course789", 
            //             "course_code": "490849", 
            //             "course_name": "影视英语", 
            //             "course_open_count": 6, 
            //             "course_open_time_list": [
            //                 "星期二 09:10", 
            //                 "星期三 10:10", 
            //                 "星期四 08:30"
            //             ]
            //         }, 
            //         {
            //             "c_id": "course789", 
            //             "course_code": "802359", 
            //             "course_name": "影视英语", 
            //             "course_open_count": 6, 
            //             "course_open_time_list": [
            //                 "星期二 09:10", 
            //                 "星期三 10:10", 
            //                 "星期四 08:30"
            //             ]
            //         }
            //     ]
            // }
            // $scope.courseList = d.data;
            var url = "/web/getCourseList";
            WebApi.Post(url, {
                t_id :teacherId 
            }, function (d) {
                $scope.courseList = d.data;
            });
        }

        //显示添加课程界面，并获取课程码
        //{"error_code":200,"reason":"desc","data":{"course_code":"340770","t_id":"tea123"}}
        $scope.showAdd = function () {
            var url = "/web/getCourseCode";
            WebApi.Post(url, {
                t_id :teacherId 
            }, function (d) {
                $scope.courseCode = d.data.course_code;
            });
            $("#modal-addCourse").modal("show");
        }

        //获取当前选择课程信息
        $scope.getActiveCourse = function (activeCourse,time) {
            common.Session.activeCourse = activeCourse;
        	common.Session.activeCourseTime = time;
            // common.Session.activeCourse && ($scope.isCourse = true)
        }
        
        
        //添加课程类别
        //{"error_code":200,"reason":"desc","data":{"c_id":"course789","result":1}}
        $scope.addCourse = function () {
            var url = "/web/addCourse";
            WebApi.Post(url, {
                course_name: $scope.courseType=='new'?$scope.newType:$scope.courseType,
                course_date: $scope.courseDay,
                course_time: $scope.courseStratTime + ':' + $scope.courseEndTime,
                course_code: $scope.courseCode,
                t_id :teacherId
            }, function (d) {
                if(d.data.result == 1){
                    returnMessage("课程添加成功！");
                    getCourseList();
                    // common.Config.courseId = d.data.c_id;
                }
                else{
                    returnMessage("课程添加失败，请重新添加！");
                }
            });
        }

        //用户提示弹出框
        function returnMessage(content){
            $("#modal-errorInfo").modal('show');
            $("#infoContent").html(content);
        }

        // common.Config.returnMessage = returnMessage();

    }]);

});
    