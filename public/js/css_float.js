const resizeObserver = new ResizeObserver(entries => {
    //回调
    for(let a in entries) {
        let {width,height} = entries[a].contentRect
        let c = $(entries[a].target).children()
        if(width<465) {
            for(let b=0;b<c.length;b++){
                let d =$(c[b])
                d.width('100%')
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