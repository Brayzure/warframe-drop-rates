(function() {
    $(".tab-tab").click(function() {
        var index = $(this).index();
        $(".active").removeClass("active");
        $(this).addClass("active");
        $("div.tab-content").children().eq(index).addClass("active");
    });
}());