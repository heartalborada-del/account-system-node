function ret(time){
    let t = time;
    let s = $("button#reSendEmail")[0];
    s.disabled = true;
    let i = setInterval(function (){
        s.innerText = t+'s后重新获取'
        if(t === 0) {
            s.disabled = false;
            clearInterval(i);
            return;
        }
        t--;
    },1000);
}
$("button#reSendEmail")
    .on('click', function (){
        $.post('/api/acc/emailVerify',function (data){
            if (data.code !== 0) {
                halfmoon.initStickyAlert({
                    content: data.msg,//不会写（
                    title: 'ERROR',
                    alertType: "alert-danger",
                    fillType: "filled"
                });
                if(data.code === -102){
                    ret(data.wait_time)
                }
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
    })