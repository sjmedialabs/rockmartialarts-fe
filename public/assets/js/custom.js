// AOS JS
AOS.init({
    easing: 'linear',
    duration: 500
});

function onElementHeightChange(elm, callback) {
    var lastHeight = elm.clientHeight
    var newHeight;

    (function run() {
        newHeight = elm.clientHeight;
        if (lastHeight !== newHeight) callback();
        lastHeight = newHeight;

        if (elm.onElementHeightChangeTimer) {
            clearTimeout(elm.onElementHeightChangeTimer);
        }

        elm.onElementHeightChangeTimer = setTimeout(run, 200);
    })();
}
onElementHeightChange(document.body, function () {
    AOS.refresh();
});
let samt = 0;
window.addEventListener('scroll', function () {
    samt <= 3 ? samt++ : AOS.refresh();
});
$(window).on('click', function () {
    AOS.refresh();
});



//Fancybox Config
$('[data-fancybox="gallery"]').fancybox({
    buttons: [
        "slideShow",
        "thumbs",
        "zoom",
        "fullScreen",
        "share",
        "close"
    ],
    loop: false,
    protect: true
});

$(document).on('click', 'a[href^="#"]', function (event) {
    event.preventDefault();

    const target = $($.attr(this, 'href'));
    if (target.length) {
        $('html, body').animate({
            scrollTop: target.offset().top - 0 // adjust this value for required gap
        }, 500);
    }
});

// filter
$(function () {
    var selectedClass = "";
    $(".filtro").click(function () {
        selectedClass = $(this).attr("data-rel");
        $("#portfolio").fadeTo(100, 0.1);
        $("#portfolio div").not("." + selectedClass).fadeOut().removeClass('scale-anm');
        setTimeout(function () {
            $("." + selectedClass).fadeIn().addClass('scale-anm');
            $("#portfolio").fadeTo(300, 1);
        }, 300);

    });
});








var offcanvasElementList = [].slice.call(document.querySelectorAll('.offcanvas'))
var offcanvasList = offcanvasElementList.map(function (offcanvasEl) {
    return new bootstrap.Offcanvas(offcanvasEl)
})




