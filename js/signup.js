(function($) {

	"use strict";

	$(".toggle-password").click(function() {

	  $(this).toggleClass("fa-eye fa-eye-slash");
	  var input = $($(this).attr("toggle"));
	  if (input.attr("type") == "password") {
	    input.attr("type", "text");
	  } else {
	    input.attr("type", "password");
	  }
	});

	// 비밀번호 확인 기능 추가
	$("#password, #password-confirm").on('keyup', function () {
	    var password = $("#password").val();
	    var confirmPassword = $("#password-confirm").val();
	    var message = $("#password-match-message");

	    if (password != confirmPassword) {
	        message.show();
	    } else {
	        message.hide();
	    }
	});

	// 폼 제출 처리
	$("#signup-form").submit(function(e) {
	    e.preventDefault();
	    
	    var username = $("#username").val();
	    var password = $("#password").val();
	    var confirmPassword = $("#password-confirm").val();
	    
	    var emptyFields = [];
	    
	    if (!username) emptyFields.push("아이디");
	    if (!password) emptyFields.push("비밀번호");
	    if (!confirmPassword) emptyFields.push("비밀번호 확인");
	    
	    if (emptyFields.length > 0) {
	        alert("다음 필드를 입력해주세요: " + emptyFields.join(", "));
	        return;
	    }
	    
	    if (password !== confirmPassword) {
	        alert("비밀번호가 일치하지 않습니다.");
	        return;
	    }
	    
	    // 모든 검증을 통과하면 login.html로 이동
	    window.location.href = "login.html";
	});

})(jQuery);