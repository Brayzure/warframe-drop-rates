(function () {
    document.getElementById("themeButton").onclick = function () {
        if($(this).hasClass("light")) {
            $(this).removeClass("light");
            $(this).addClass("dark");
            document.getElementById("theme").href = "stylesheet-dark.css";
        }
        else {
            $(this).removeClass("dark");
            $(this).addClass("light");
            document.getElementById("theme").href = "stylesheet.css";
        }
    }
}());