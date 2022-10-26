const resizeObserver = new ResizeObserver(entries => {
    //回调
    for(let a in entries) {
        let {width} = entries[a].contentRect
        let c = $(entries[a].target).children()
        if(width<=500) {
            for(let b=0;b<c.length;b++){
                let d =$(c[b])
                console.log(d.id)
                d.width(width*0.8)
                d.addClass('mt-20')
            }
        } else {
            for(let b=0;b<c.length;b++){
                let d =$(c[b])
                d.width('')
                d.removeClass('mt-20')
            }
        }
    }
});
resizeObserver.observe($('div.d-flex.flex-wrap#content01')[0])