/**
 * API Documentation
 * 
 * Request:
 * GET /api/tabs
 * POST /api/tabs
 * {
 *   "name": string,
 *   "content": string
 * }
 * PUT /api/tabs/{id}/order
 * {
 *   "order": number
 * }
 * DELETE /api/tabs/{id}
 * 
 * Response:
 * GET /api/tabs:
 * {
 *   "tabs": [
 *     {
 *       "id": number,
 *       "name": string,
 *       "content": string,
 *       "order": number
 *     }
 *   ]
 * }
 * 
 * API Endpoints:
 * - GET /api/v1/tabs: /api/v1/tabs
 * - POST /api/v1/tabs: /api/v1/tabs
 * - PUT /api/v1/tabs/{id}: /api/v1/tabs/{id}
 * - DELETE /api/v1/tabs/{id}: /api/v1/tabs/{id}
 * - PUT /api/v1/tabs/reorder: /api/v1/tabs/reorder
 */

// Make tab UI activated using below script
var $tabs = $('#tabs').tabs();

// Open jQuery Dialog to open modal popup - here we ask for tab name from user
$("#showDialog").click(function () {
    $("#divDialog input").val("").focus();
    $("#divDialog").dialog({
        title: 'New Tab', modal: true, open: function () {
            $('.ui-widget-overlay').addClass('custom-overlay');
        }
    });
});

// Adding new Tab on button click
$("#addTabs").click(function () {

    // Checking textbox is empty or not
    if ($.trim($("#divDialog input").val()) == "") {
        $("#divDialog input").val("").focus();
    }
    else {

        // Checking tab name already exist or not
        var tabNameExists = false;
        $('#tabs ul li a').each(function (i) {
            if ($.trim(this.text.toLowerCase()) == $.trim($("#divDialog input").val().toLowerCase())) {
                tabNameExists = true;
            }
        });

        // code to insert new tab here if tab name does not exist
        if (!tabNameExists) {

            // Here we are getting max id so that we can assing new id to new tab
            var maxid = 0;
            $('#tabs ul li').each(function () {
                var value = parseInt($(this).attr('id'));
                maxid = (value > maxid) ? value : maxid;
            });

            var newid = maxid + 1;

            // Adding new "<li>" with anchor tag
            $("#tabs ul").append(
                "<li id='" + newid + "'><a href='#tab-" + newid + "'>" + $("#divDialog input").val() + "</a></li>"
            );

            // Adding Div for content for the above "li" tag
            $("#tabs").append(
                "<div style='display:none;' id='tab-" + newid + "'><p>Content for Tab: " + $("#divDialog input").val() + "</p></div>"
            );

            // Refreshing the tab as we have just added new tab
            $("#tabs").tabs("refresh");

            // Make added tab active
            $("#tabs").find('li a[href="#tab-' + newid + '"]').trigger("click");

            $("#divDialog").dialog("close");
        }
        else {
            // Showing message if tab name already exist
            alert("Sorry! Tab name already exist");
            $("#divDialog input").focus();
        }
    }
});


// Remove Active Tab on button click
$("#removeTabs").click(function () {

    // Confirm from user that he/she sure wants to delete this active tab
    if (window.confirm("Are you sure want to delete this active Tab?")) {
        // Find name of Tab by attribute id
        var tabIndex = $("#tabs .ui-tabs-panel:visible").attr("id");

        // Removing Li and as well as content Div for the specific Tab
        $("#tabs").find(".ui-tabs-nav li a[href='#" + tabIndex + "']").parent().remove();
        $("#tabs").find("div[id=" + tabIndex + "]").remove();

        // One removing process done we refresh the tab again
        $("#tabs").tabs("refresh");
    }
});

// Here we are making jQuery Tabs (li tag) Sortable
$(function () {
    $("#tabs ul").sortable({ containment: "#tabs ul" });
    $("#tabs ul").disableSelection();
});

// ************ 2 ways to getting sorting order *************

// We can get sort order directly once you done sort by drag & drop
$("#tabs ul").bind("sortupdate", function (event, ui) {
    event.stopPropagation();
    alert($("#tabs ul").sortable('toArray'));
});

// Another way of getting current sort order of tab using below script
$("#showSortable").click(function () {
    alert($("#tabs ul").sortable('toArray'));
});

// 서버 메뉴 토글 기능 추가
$(document).ready(function() {
    $(".server-menu-toggle").click(function(e) {
        e.stopPropagation();
        $(".server-menu-items").toggleClass("show");
    });

    // 메뉴 항목 클릭 시 동작
    $(".server-menu-items li").click(function() {
        var action = $(this).text();
        alert("선택한 동작: " + action);
        $(".server-menu-items").removeClass("show");
    });

    // 문서의 다른 부분 클릭 시 메뉴 닫기
    $(document).click(function() {
        $(".server-menu-items").removeClass("show");
    });
});

// 탭 클릭 시 서버 메뉴 표시
$(document).ready(function() {
    $("#tabs").tabs({
        activate: function(event, ui) {
            $(".server-menu-items").addClass("show");
        }
    });

    // 메뉴 항목 클릭 시 동작
    $(".server-menu-items li").click(function() {
        var action = $(this).text();
        alert("선택한 동작: " + action);
    });

    // 탭 영역 외 클릭 시 메뉴 닫기
    $(document).click(function(event) {
        if (!$(event.target).closest('#tabs, .server-menu-items').length) {
            $(".server-menu-items").removeClass("show");
        }
    });
});

// 탭 클릭 시 서버 메뉴 토글
$(document).ready(function() {
    $("#tabs > ul > li").click(function(e) {
        e.stopPropagation();
        $(this).find(".server-menu").toggleClass("show");
    });

    // 메뉴 항목 클릭 시 동작
    $(".server-menu-items li").click(function(e) {
        e.stopPropagation();
        var action = $(this).text();
        alert("선택한 동작: " + action);
        $(this).closest(".server-menu").removeClass("show");
    });

    // 문서의 다른 부분 클릭 시 메뉴 닫기
    $(document).click(function() {
        $(".server-menu").removeClass("show");
    });

    // 탭 기능 유지
    $("#tabs").tabs();
});