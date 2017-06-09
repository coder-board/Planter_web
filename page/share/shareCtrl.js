define(function (require) {
    var app = require('app');

    app.controller('shareCtrl', ['$scope','$http','WebApi','common', function($scope,$http,WebApi,common) {

        var studentId = $.cookie('cookieUserId');
        $scope.init = function () {


        }

        //发送帖子
        $scope.posting = function(){
            var url = "";
            WebApi.Get(url,{
                // : $scope.postTitle,
                // : $("#postContent").val(),

            },function(d){
                console.log(d);
                $scope.resourceList = d.Data;
            });
        }

        //上传图片
        $('#test').diyUpload({
	        // url:'server/fileupload.php',
	        url:'http://192.168.1.101:8016/api/Upload/UploadMenuFile',
	        success:function( data ) {
	            console.info( data );
	        },
	        error:function( err ) {
	            console.info( err );    
	        }
	    });

        $scope.showPublish = function () {
        	$("#modal-pubAssignments").modal("show");
        }


    }]);

});
    