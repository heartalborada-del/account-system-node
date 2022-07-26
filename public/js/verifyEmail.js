function ret(time) {
    let t = time;
    let s =$("button#reSendEmail");
    s.disabled = true;
    let i = setInterval(function () {
        s.innerText = t + 's后重新获取'
        if (t === 0) {
            s.disabled = false;
            clearInterval(i);
            return;
        }
        t--;
    }, 1000);
}

$('form.verifyForm')
    .on('submit', function () {
        let json = {};//captcha
        $.each($(this).serializeArray(), function () {
            json[this.name] = this.value
        })
        if (!/^[A-Za-z0-9]{4}$/.test(json.captcha)) {
            halfmoon.initStickyAlert({
                content: 'Verifying captcha errors. Are you input right captcha?',//不会写（
                title: 'ERROR',
                alertType: "alert-danger",
                fillType: "filled"
            });
            let a = $('img.captcha')[0];
            let url = a.src.split("?")[0];
            url += '?' + Math.random()
            a.src = url;
        } else {
            $.post('/api/acc/emailVerify', json, function (data) {
                if (data.code !== 0) {
                    halfmoon.initStickyAlert({
                        content: data.msg,//不会写（
                        title: 'ERROR',
                        alertType: "alert-danger",
                        fillType: "filled"
                    });
                    if (data.code === -102) {
                        ret(data.wait_time)
                    }
                    let a = $('img.captcha')[0];
                    let url = a.src.split("?")[0];
                    url += '?' + Math.random()
                    a.src = url;
                } else {
                    halfmoon.initStickyAlert({
                        content: "Succeed to your mailbox, please check it",
                        title: "Success",
                        alertType: "alert-success",
                        fillType: "filled-lm"
                    });
                    ret(300);
                }
            })
        }
    })