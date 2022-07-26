let fi = $('form.avatarInput')
let file = fi.find('input#picture')
let show = $('img.avatarShow')[0]
fi.on('submit', function () {
    let da = new FormData();
    da.append('files', file[0].files[0]);

    console.log(da.get('files'))
    $.ajax({
        url:'/api/avatar/upload',
        //contentType: 'multipart/form-data',
        contentType: false,
        data: da,
        type: 'POST',
        processData:false,
        success: function (data){
            if (data.code === 0) {
                halfmoon.initStickyAlert({
                    content: "Set your avatar successfully",
                    title: "Success",
                    alertType: "alert-success",
                    fillType: "filled-lm"
                });
            } else {
                halfmoon.initStickyAlert({
                    content: data.msg,//不会写（
                    title: 'ERROR',
                    alertType: "alert-danger",
                    fillType: "filled"
                });
            }
        }
    })
})

file.on('input',function () {
    let file = this.files[0];
    let read = new FileReader();
    read.readAsDataURL(file,'UTF-8');
    read.onload = function (e){
        show.src = e.target.result
    }
})