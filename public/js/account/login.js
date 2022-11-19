$('form.loginForm')
    .on('submit', function () {
        let json = {};//email password captcha
        $.each($(this).serializeArray(), function () {
            json[this.name] = this.value
        })
        if (!/^[A-Za-z0-9]{4}$/.test(json.captcha)) {
            halfmoon.initStickyAlert({
                content: 'Verifying captcha errors. Are you input right captcha ?',//不会写（
                title: 'ERROR',
                alertType: "alert-danger",
                fillType: "filled"
            });
            let a = $('img.captcha')[0];
            let url = a.src.split("?")[0];
            url += '?' + Math.random()
            a.src = url;
        } else if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(json.email)) {
            halfmoon.initStickyAlert({
                content: 'Are you input right email?',//不会写（
                title: 'ERROR',
                alertType: "alert-danger",
                fillType: "filled"
            });
        } else if (!/^(?=.*[a-zA-Z])(?=.*[0-9])[\x00-\xff][^:;'",\s]{8,20}$/.test(json.password)) {
            halfmoon.initStickyAlert({
                content: 'Are you input right password?',//不会写（
                title: 'ERROR',
                alertType: "alert-danger",
                fillType: "filled"
            });
        } else {
            $.get('/api/acc/getPubKey').then(function (data) {
                let en = new JSEncrypt();
                en.setPublicKey(data.key);
                let enpw = en.encrypt(json.password);
                $.post('/api/acc/login', {...json, password: enpw}, function (data) {
                    if (data.code !== 0) {
                        halfmoon.initStickyAlert({
                            content: data.msg,//不会写（
                            title: 'ERROR',
                            alertType: "alert-danger",
                            fillType: "filled"
                        });
                        let a = $('img.captcha')[0];
                        let url = a.src.split("?")[0];
                        url += '?' + Math.random();
                        a.src = url;
                    } else {
                        halfmoon.initStickyAlert({
                            content: "Login Success",
                            title: "Success",
                            alertType: "alert-success",
                            fillType: "filled-lm"
                        });
                        localStorage.setItem("loginToken", data.token);
                        window.location.href='/my';
                    }
                })
            })
        }
    });