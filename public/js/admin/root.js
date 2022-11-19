$.get('/api/admin/getAllUser').then(data => {
    let ele = $('tbody#account_list')
    for(let o in data){
        ele.append(
            "<tr>" +
            "<th>"+o+"</th>" +
            "<td>"+data[o].UUID+"</td>" +
            "<td>"+data[o].email+"</td>" +
            "<td>"+data[o].email_verify+"</td>" +
            "<td>"+data[o].permission+"</td>" +
            "<td>"+data[o].createdAt+"</td>" +
            "<td>"+data[o].updatedAt+"</td>" +
            "</tr>"
        );
    }
})