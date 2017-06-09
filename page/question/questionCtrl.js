define(function (require) {
    var app = require('app');

    app.controller('questionCtrl', ['$scope','$http','WebApi','common', function($scope,$http,WebApi,common) {

        var teacherId = $.cookie('cookieUserId');
        var timer 
    	//添加公告
        $scope.showNotice = function (){
        	$("#modal-addNotice").modal("show");
        }
        
        $scope.init = function () {
            $scope.activeCourse = common.Session.activeCourse;
            $scope.activeCourseTime = common.Session.activeCourseTime;
            $scope.isStart = common.Session.isStart;
            // $scope.randomImg();
            getStudentList();
        }

        //开课
        $scope.startClass = function(){
            var url = "/web/course/classBegin";
            WebApi.Post(url, {
                class_begin_time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId
            }, function (d) {
                /*class_begin_status
                public static final int CLASS_STATUS_OPEN = 1; // 表示已开课
                public static final int CLASS_STATUS_CLOSE = 0; // 表示已结课
                */
                if(d.data.class_begin_status == 1){
                    returnMessage("开课成功！");
                    $scope.isStart = true;
                    common.Session.isStart = $scope.isStart;
                    if(common.Session.openClassId){
                        return true;
                    }else{
                        common.Session.openClassId = d.data.open_class_id; 
                    }
                }else{
                    returnMessage("开课失败，请重新开课！");
                }
            });
        }

        //结课
        $scope.endClass = function () {
            var url = "/web/course/classEnd";
            WebApi.Post(url, {
                class_end_time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId,
                open_class_id : common.Session.openClassId
            }, function (d) {
                /*class_begin_status
                public static final int CLASS_STATUS_OPEN = 1; // 表示已开课
                public static final int CLASS_STATUS_CLOSE = 0; // 表示已结课
                */
                if(d.data.class_begin_status == 0){
                    returnMessage("结课成功！");
                    $scope.isStart = false;
                    common.Session.isStart = $scope.isStart;
                }else{
                    returnMessage("结课失败，请重新结课！");
                }
            });
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

        //开启随机提问
        $scope.startRandom = function(){
            if(!$scope.isStart){
                returnMessage("请先开课，再使用此功能！");
                return;
            }
            $scope.isStartRandom = true;
            $scope.randomImg();
            getRandomStudent();
        }

        //获取随机姓名
        function getRandomStudent(){
            var url = "/web/randomAsk/randomAskBegin";
            WebApi.Post(url, {
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId,
                random_ask_time : new Date().Format("yyyy-MM-dd hh:mm:ss"),
                open_class_id : common.Session.openClassId
            }, function (d) {
                if(d.data){
                    setTimeout(function(){
                        clearInterval(timer);
                        $("#randomStudent").html(d.data.student_name);
                    },2000);
                    $scope.randomStudent = d.data; 
                }

            });
        }

        //选择发放惊喜的学生
        $scope.choosenStudent = function(student){
            $scope.givenStudent = student;
        }

        //发放惊喜
        $scope.giveBonus = function(){
            if(!$scope.isStart){
                returnMessage("请先开课，再使用此功能！");
                return;
            }
            var url = "/web/randomAsk/giveBonus";
            WebApi.Post(url, {
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId,
                s_id : $scope.givenStudent.s_id,
                open_class_id : common.Session.openClassId
            }, function (d) {
                if(d.data.random_ask_bonus_status == 1){
                     returnMessage("发放惊喜成功，恭喜" + $scope.givenStudent.student_name + "同学得到此次奖励！");
                }else{
                    returnMessage("发放惊喜失败，请重新发放！");
                }
            });
        }

        //随机图像效果
        $scope.randomImg = function(){
            var images = $('.img');
            var pos = 0;
            var len = images.length;
             
            timer = setInterval(function(){
             
                images[pos].style.display = 'none';
                pos = ++pos == len ? 0 : pos;
                images[pos].style.display = 'inline';
             
            },300);
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
    