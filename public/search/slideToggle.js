(function () {
    var isDragging = false;
    $(document).on("mousedown", ".expando", function () {
        isDragging = false;
    }).on("mousemove", ".expando", function () {
        isDragging = true;
    }).on("mouseup", ".expando", function () {
        if(!isDragging) {
            if($(this).hasClass("closed")) {
                $(this).removeClass("closed");
                $(this).addClass("open");
                $(this).next().stop(true, true);
                $(this).next().slideDown();
            }
            else {
                $(this).removeClass("open");
                $(this).addClass("closed");
                $(this).next().stop(true, true);
                $(this).next().slideUp();
            }
        }
        isDragging = false;
    });
}());