define(function (require) {
    var app = require('app');

    app.controller('homeworkCtrl', ['$scope','$http','WebApi','common', function($scope,$http,WebApi,common) {

        var teacherId = $.cookie('cookieUserId');
    	//添加公告
        $scope.showNotice = function (){
        	$("#modal-addNotice").modal("show");
        }
        
        $scope.init = function () {
            $scope.activeCourse = common.Session.activeCourse;
            $scope.activeCourseTime = common.Session.activeCourseTime;
            $scope.isHomeworkList = false;
            getHomeworkList();
            getStudentList();
        }

        //获取学生列表
        function getStudentList() {
            var url = "/web/randomAsk/enterAskModule";
            WebApi.Post(url, {
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId
            }, function (d) {
                $scope.studentList = d.data;
            });
        }
        
        //显示发布作业界面
        $scope.showPublish = function () {
        	$("#modal-pubAssignments").modal("show");
        }

        //发布作业
        $scope.publishHomework = function(){
            var url = "/web/homework/publish";
            WebApi.Post(url, {
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId,
                homework_publish_time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                homework_submit_ddl: $("#homeworkEndTime").val(),
                homework_content: $("#homeworkContent").val(),
                homework_title: $scope.homeworkTitie,
            }, function (d) {
                if(d.data.homework_publish_status == 1){
                    returnMessage("作业发布成功！");
                    getHomeworkList();
                    $("#homeworkContent").html("");
                    $("#homeworkEndTime").html("");
                    $scope.homeworkTitie = null;
                }else{
                    returnMessage("作业发布失败，请重新发布！");
                }
            });
        }

        //显示作业详情
        $scope.showHomeworkContent = function(content){
            $scope.homeworkContent = content;
            $("#modal-homeworkContent").modal("show");
        }

        //查看已提交作业列表
        function getSubmitList(homework){
            var url = "/web/homework/getHomeworkSubmitInfoList";
            WebApi.Post(url, {
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId,
                homework_id: homework.homework_id
            }, function (d) {
                $scope.submitList = d.data;
            });
        }

        //获取作业列表
        function getHomeworkList(){
            var url = "/web/homework/getHomeworkInfoList";
            WebApi.Post(url, {
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId
            }, function (d) {
                if(d.data){
                    $scope.homeworkList = d.data;
                }else{
                    $("#homeworkList").html("暂无作业列表，请前往发布作业...");
                }
            });
        }

        //显示作业列表
        $scope.showHomeworkList = function (homework) {
        	$scope.isHomeworkList = true;
            getSubmitList(homework);

        }

        //老师作业打分
        $scope.homeworkScore = function(homework){
            var url = "/web/homework/score";
            WebApi.Post(url, {
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId,
                homework_submit_id: homework.homework_submit_id,
                homework_score: $("#"+homework.homework_submit_id).val(),
                s_id: homework.s_id
            }, function (d) {
                 if(d.data.group_teacher_score_status == 1){
                     returnMessage("打分成功，" + homework.student_name + "同学得到" + 
                        $("#"+homework.homework_submit_id).val() + "分！");
                    getSubmitList(homework); 
                }else{
                    returnMessage("打分失败，请重新打分！");
                }
            });
        }



        //返回作业
        $scope.backHomework = function () {
        	$scope.isHomeworkList = false;
        }

        // 对Date的扩展，将 Date 转化为指定格式的String
        // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
        // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
        // 例子： 
        // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
        // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
        Date.prototype.Format = function(fmt)   
        { //author: meizz   
          var o = {   
            "M+" : this.getMonth()+1,                 //月份   
            "d+" : this.getDate(),                    //日   
            "h+" : this.getHours(),                   //小时   
            "m+" : this.getMinutes(),                 //分   
            "s+" : this.getSeconds(),                 //秒   
            "q+" : Math.floor((this.getMonth()+3)/3), //季度   
            "S"  : this.getMilliseconds()             //毫秒   
          };   
          if(/(y+)/.test(fmt))   
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
          for(var k in o)   
            if(new RegExp("("+ k +")").test(fmt))   
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
          return fmt;   
        } 

        //用户提示弹出框
        function returnMessage(content){
            $("#modal-errorInfo").modal('show');
            $("#infoContent").html(content);
        }
    }]);

});
    