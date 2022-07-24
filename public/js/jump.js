function jump(url, time, message, hasA = true){
    let t = time;
    let p1 = 100/t;
    let s = document.getElementById('show');
    let p = document.getElementById('pg');
    let i = setInterval(function (){
        if(hasA) {
            if (t === time) {
                halfmoon.initStickyAlert({
                    content: message,
                    title: "Warning",
                    alertType: "alert-secondary",
                    fillType: "filled-dm"
                });
            }
        }
        s.innerText = 'Jump after ' + t + ' seconds'
        p.style.width = p1*(time-t)+'%'
        if(t === 0) {
            window.location.href=url;
            clearInterval(i);
            return;
        }
        t--;
    },1000);
}