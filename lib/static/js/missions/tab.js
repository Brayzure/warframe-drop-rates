(function() {
    $(".tab-tab").click(function() {
        // Determine which child it is
        var index = $(this).index();

        // Find parent (twice)
        var tabContainer = $(this).parent().parent();

        $(".active", tabContainer).removeClass("active");
        $(this).addClass("active");
        $("div.tab-content", tabContainer).children().eq(index).addClass("active");
    });
}());