let userNotPopup = document.getElementById('user-options-notifications-popup')

document.getElementById('user-options-notifications').addEventListener('click',(event)=>{
    userNotPopup.show()
    let userNotPopupCont = document.getElementById('user-options-notifications-popup-content')
    userNotPopupCont.css({
        left: event.clientX - userNotPopupCont.offsetWidth + 'px',
        top: event.clientY + 5 + 'px'
    })
})

document.getElementById('close-popup-notification').addEventListener('click',()=>{
    userNotPopup.hide()
})



document.querySelectorAll('.user-options-notifications-col-options-button').forEach(element=>{
    let box  = document.querySelector('.user-options-notifications-col-options-box')
    element.addEventListener('click',()=>{
        
        box.toggle('flex')
        box.css({
            width: element.offsetWidth + 'px',
            left:element.offsetLeft + 'px',
            top:element.offsetTop + element.offsetHeight + 'px',
        })
        const options = box.querySelectorAll('.user-options-notifications-col-options-box-col');
        function handleOptionClick() {
            const attribute = this.getAttribute('data-value');
            switch (attribute) {
                case 'sim':
                case 'nao':
                case 'fechar':
                    box.style.display = 'none';
                    options.forEach(opt => {
                        opt.removeEventListener('click', handleOptionClick);
                    });
                    break;
                default:
                    break;
            }
        }

        
        options.forEach(element2 => {
            element2.addEventListener('click', handleOptionClick);
        });
    })
    // const options = box.querySelectorAll('.user-options-notifications-col-options-box-col');
    // options.forEach(element2=>{
    //     element2.addEventListener('click',()=>{
    //         let atributte = element2.getAttribute('data-value')
    //         console.log(atributte);
    //         switch (atributte) {
    //             case 'sim':
    //                 box.hide()
    //                 options.forEach(opt => {
    //                     opt.removeEventListener('click', handleOptionClick);
    //                 });
    //                 break
    //             case 'nao':
    //                 box.hide()
    //                 options.forEach(opt => {
    //                     opt.removeEventListener('click', handleOptionClick);
    //                 });
    //                 break
    //             case 'fechar':
    //                 box.hide()
    //                 options.forEach(opt => {
    //                     opt.removeEventListener('click', handleOptionClick);
    //                 });
    //                 break;
            
    //             default:
    //                 break;
    //         }
    //     })
    
})