$.get('/api/admin/getAllUser').then(data => {
    let ele = $('tbody#account_list');
    for(let o in data){
        //console.log(updatedAt.getTime())
        ele.append(
            "<tr>" +
            "<th>"+o+"</th>" +
            "<td>"+data[o].UUID+"</td>" +
            "<td>"+data[o].email+"</td>" +
            //"<td>"+data[o].email_verify+"</td>" +
            //"<td>"+data[o].permission+"</td>" +
            //"<td>"+UTCtoLocal(data[o].createdAt).toLocaleString()+"</td>" +
            //"<td>"+UTCtoLocal(data[o].updatedAt).toLocaleString()+"</td>" +
            "<td><a href='/user/details?uuid=" + data[o].UUID + "' target='_blank'><button class='btn btn-primary'>Edit</button></a></td>" +
            "</tr>"
        );
    }
})

function UTCtoLocal(utcString){
    let da = new Date(utcString);
    let utc = Date.UTC(
        da.getFullYear(),
        da.getMonth(),
        da.getDay(),
        da.getHours(),
        da.getMinutes(),
        da.getSeconds());
    return new Date(utc);
}