$('img.captcha').height($('input.captchaInput').height()+4);

$(window).on("resize", (function(){
    $('img.captcha').height($('input.captchaInput').height()+4);
})).on('click', function () {
    let url = this.src.split("?")[0];
    url += '?' + Math.random()
    this.src = url;
});