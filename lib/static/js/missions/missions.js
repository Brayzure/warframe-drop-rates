(function() {
    $(".tab-header").each(function(i) {
        $(this).children().eq(0).addClass("active");
    });
    $(".tab-content").each(function(i) {
        $(this).children().eq(0).addClass("active");
    });
}());