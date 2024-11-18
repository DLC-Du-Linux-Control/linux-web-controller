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
            return;
        }

        // 검증 통과시 main.html로 이동
        window.location.href = "main.html";
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
        return true;
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