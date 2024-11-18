/**
 * API Documentation
 * 
 * Request:
 * POST /api/auth/login
 * {
 *   "username": string,
 *   "password": string
 * }
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "token": string,
 *   "message": string
 * }
 * 
 * API Endpoints:
 * - POST /api/auth/login: /api/v1/auth/login
 * - POST /api/auth/validate: /api/v1/auth/validate
 */

(function ($) {
    "use strict";

    var input = $('.validate-input .input100');

    $('.validate-form').on('submit', function(e){
        e.preventDefault(); // 폼 제출 기본 동작 방지
        var check = true;
        var emptyFields = [];

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check = false;
                emptyFields.push($(input[i]).attr('placeholder'));
            }
        }

        if (!check) {
            alert("다음 필드를 입력해주세요: " + emptyFields.join(", "));
        } else {
            // 모든 필드가 유효하면 다음 페이지로 이동
            window.location.href = "main.html"; // 또는 로그인 성공 후 이동할 페이지
        }
    });

    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).val().trim() == ''){
            $(input).attr('data-validate', $(input).attr('placeholder') + ' 입력이 필요합니다');
            return false;
        }
        else if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                $(input).attr('data-validate', '유효한 이메일 주소를 입력해주세요');
                return false;
            }
        }
        return true; // 유효성 검사 통과 시 true 반환
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).removeClass('alert-validate');
    }
    
    

})(jQuery);