define(function (require) {
    var app = require('app');

    app.controller('groupCtrl', ['$scope','$http','WebApi','common', function($scope,$http,WebApi,common) {

        var teacherId = $.cookie('cookieUserId');
    	//添加公告
        $scope.showNotice = function (){
        	$("#modal-addNotice").modal("show");
        }
        
        $scope.init = function () {
            $scope.activeCourse = common.Session.activeCourse;
            $scope.activeCourseTime = common.Session.activeCourseTime;
            isOpenGroup();
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

        //是否开通分组并获取小组列表
        function isOpenGroup(){
            var url = "/web/group/enterGroupModule";
            WebApi.Post(url, {
                t_id :teacherId,
                c_id :$scope.activeCourse.c_id,
            }, function (d) {
                if(d.data.group_open){
                    $scope.isOpenGroup = true;
                    if(d.data.group_info_list.length == 0){
                        $("#group").html("等待学生分组...");
                    }else{
                        $scope.groupList = d.data.group_info_list;
                    }
                }
                else{
                    $scope.isOpenGroup = false;
                }
            });
        }

        //开通分组
        $scope.openGroup = function(){
            if((!$scope.groupMin) || (!$scope.groupMax)){
                returnMessage("请输入完整组别范围！");
                return;
            }
            var url = "/web/group/openGroup";
            WebApi.Post(url, {
                t_id :teacherId,
                c_id :$scope.activeCourse.c_id,
                group_open_time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                group_member_min :$scope.groupMin,
                group_member_max :$scope.groupMax
            }, function (d) {
                if(d.data.group_open){
                    returnMessage("开通分组成功！");
                    isOpenGroup();
                }
                else{
                    returnMessage("开通分组失败，请重新开通！");
                }
            });
        }
        
        //显示任务详情
        $scope.showTask = function(task){
            $("#modal-task").modal("show");
            $scope.task = task;
        }

        //显示小组所有成员
        $scope.showMember = function(member){
            var memberStr = ''
            for (var i = 1; i < member.length+1; i++) {
                memberStr += member[i-1] + '，';
            }
            returnMessage(memberStr.substring(0,memberStr.length-1));
        }

        //老师打分
        $scope.setScore = function(group){
            var groupScore = $('#'+ group.group_id).val();
            if(!groupScore){
                returnMessage("分数不能为空！");
                return false;
            }
            var url = "/web/group/teacherScore";
            WebApi.Post(url, {
                t_id :teacherId,
                c_id :$scope.activeCourse.c_id,
                group_id :group.group_id,
                group_teacher_score: parseInt(groupScore)
            }, function (d) {
                if(d.data.group_teacher_score_status){
                    returnMessage("打分成功！"+ group.group_name +'分数为' + groupScore +'分！');
                    isOpenGroup();
                }
                else{
                    returnMessage("打分失败，请重新提交！")
                }
            });
        }

        //显示添加任务界面
        $scope.showAddTask = function(group){
            $("#modal-publicTask").modal("show");
            $scope.groupName = group.group_name;
            $scope.groupId = group.group_id;
        }

        //添加任务
        $scope.addTask = function(){
            var url = "/web/group/publishTask";
            WebApi.Post(url, {
                t_id :teacherId,
                c_id :$scope.activeCourse.c_id,
                group_id :$scope.groupId,
                group_task_content: $scope.taskContent,
                group_publish_date: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                group_task_ddl: $("#taskDdl").val()
            }, function (d) {
                if(d.data.group_task_publish){
                    returnMessage("任务发布成功！");
                    isOpenGroup();
                }
                else{
                    returnMessage("任务发布失败，请重新发布！")
                }
            });
        }


        //用户提示弹出框
        function returnMessage(content){
            $("#modal-errorInfo").modal('show');
            $("#infoContent").html(content);
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

    }]);

});
    