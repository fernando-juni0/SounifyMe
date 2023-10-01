let bannerContinner = document.getElementById('banner-continner')
if (bannerContinner.getAttribute('data-type') == 'color') {
    let color = document.getElementById('banner-color').getAttribute('data-color')
    document.getElementById('banner-color').style.backgroundColor = '#'+color
}
var url = window.location.pathname
var partes = url.split("/");
var uid = partes.pop();

let folowInfoPopup = document.getElementById('folow-info-popup-containner')


var pageinPageSeguidores = 1
var pageinPageSeguindo = 1

let isMyProfile = document.getElementsByTagName('body')[0].getAttribute('data-isMy')
document.getElementsByTagName('body')[0].removeAttribute('data-isMy')

function resetFolowPopups() {
    document.querySelector("#seguindo-popup .folow-info-row").innerHTML = ``
    document.querySelector("#seguidores-popup .folow-info-row").innerHTML = ``
    pageinPageSeguidores = 1
    pageinPageSeguindo = 1
    document.getElementById('seguidores-popup').setAttribute('data-page-seguidores',1)
    document.getElementById('seguindo-popup').setAttribute('data-page-seguindo',1)
}

document.getElementsByClassName('close-popup')[0].addEventListener('click',()=>{
    folowInfoPopup.hide()
    resetFolowPopups()
})
document.getElementsByClassName('close-popup')[1].addEventListener('click',()=>{
    folowInfoPopup.hide()
    resetFolowPopups()
})
document.getElementById('close-popup-out').addEventListener('click',()=>{
    folowInfoPopup.hide()
    resetFolowPopups()
})

if (document.getElementById('edit-profile-popup-containner')) {
    let popupEditContainner = document.getElementById('edit-profile-popup-containner')
    
    document.getElementById('button-editar').addEventListener('click',()=>{
        popupEditContainner.show('flex')
    })

    document.getElementById('close-popup-out-edit').addEventListener('click',()=>{
        popupEditContainner.hide()
    })

    document.getElementById('close-edit').addEventListener('click',()=>{
        popupEditContainner.hide()
    })
}

if (document.getElementById('close-popup-banner-edit')) {
    document.getElementById('close-popup-banner-edit').addEventListener('click',()=>{
        document.getElementById('edit-banner-containner').hide()
    })
}

if (document.getElementById('circle-img')) {
    document.getElementById('circle-img').addEventListener('click',()=>{
        document.getElementById('edit-banner-containner').hide()
    })
}
if (document.getElementById('circle-color')) {
    document.getElementById('circle-color').addEventListener('click',()=>{
        document.getElementById('edit-banner-containner').hide()
    })
}
if (document.getElementById('close-popup-banner')) {
    
    document.getElementById('close-popup-banner').addEventListener('click',()=>{
        document.getElementById('edit-banner-containner').hide()
    })
}
if (document.querySelector('.banner-profile-class')) {
    document.querySelector('.banner-profile-class').addEventListener('click',()=>{
        document.getElementById('edit-banner-containner').show("flex")
    })
    
}
if (isMyProfile == 'true') {
    document.getElementById('edit-banner-img').addEventListener('click',(event)=>{
        document.getElementById('profile-banner-input-img').click()
    })
    
}
if (document.getElementById('preview-color')) {
    document.getElementById('preview-color').addEventListener('click',(event)=>{
        document.getElementById('profile-banner-input-color').click()
    })
    
}
if (document.getElementById('edit-banner-color')) {
    document.getElementById('edit-banner-color').addEventListener('click',()=>{
        document.getElementById('edit-banner-color-containner').show("flex")
    })
    
}
if (document.getElementById('close-popup-banner-edit-color')) {
    document.getElementById('close-popup-banner-edit-color').addEventListener('click',()=>{
        document.getElementById('edit-banner-color-containner').hide()
    })
    
}
if ( document.getElementById('save-color-banner')) {
    document.getElementById('save-color-banner').addEventListener('click',()=>{
        document.getElementById('edit-banner-color-containner').hide()
    })
    
}

async function folowInfoPopupUserAdd(users,page,plus) {
    await users.forEach(element => {
        document.querySelector("#"+page+"-popup .folow-info-row").innerHTML += `
            <a href="/user/${element.uid}">
                <div class="folow-info-col flex-center" >
                    <div class="profileImg-col-containner flex-center" >
                        <img class="profileImg-col" src="${element.profilePic == null ? "../public/img/logo_icon.png" : element.profilePic}">
                    </div>
                    <div class="usernameProfile-col">
                        <span>${element.displayName}</span>
                    </div>
                    <div class="optionsUser-col">
                        <img class="options-button" src="../public/assets/svg/menu_l2y2ye71lkcy.svg" alt="">
                    </div>
                </div>
            </a>
        `
    });
    if (document.getElementById(`plus-${page}`)) {
        document.querySelector("#"+page+"-popup .folow-info-row").removeChild(document.getElementById(`plus-${page}`))
    }
    if (plus == true) {
        document.querySelector("#"+page+"-popup .folow-info-row").innerHTML += `
            <div id='plus-${page}' class="plus-users"><span class="plus-users-span">Ver Mais</span></div>
        `
    }
}





document.getElementById('seguidores').addEventListener('click',async()=>{
    document.getElementById('folow-info-popup-containner').show('flex')
    document.getElementById('seguidores-popup').show('flex')
    document.getElementById('seguindo-popup').hide()

    await $.ajax({
        traditional: true,
        url: '/findUser',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify( {
            pageinPage: 1,
            pageIndex:'seguidores',
            userUid: uid
        } ),
        dataType: 'json',
        success: function(response) {
            if (response.success == true) {
                folowInfoPopupUserAdd(response.data,'seguidores',response.plus)
            }   
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })
    
    document.querySelector('#plus-seguidores span').addEventListener('click',async()=>{
        let atr = document.getElementById('seguidores-popup').getAttribute('data-page-seguidores')
        pageinPageSeguidores = parseInt(atr) + 1
        document.getElementById('seguidores-popup').setAttribute('data-page-seguidores',pageinPageSeguidores)
        await $.ajax({
            traditional: true,
            url: '/findUser',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( {
                pageinPage: pageinPageSeguidores,
                pageIndex:'seguidores',
                userUid: uid
            } ),
            dataType: 'json',
            success: function(response) {
                if (response.success == true) {
                    folowInfoPopupUserAdd(response.data,'seguidores',response.plus)
                }   
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        })
    })
    
})

document.getElementById('seguindo').addEventListener('click',async()=>{
    document.getElementById('folow-info-popup-containner').show('flex')
    document.getElementById('seguidores-popup').hide()
    document.getElementById('seguindo-popup').show('flex')

    await $.ajax({
        traditional: true,
        url: '/findUser',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify( {
            pageinPage: 1,
            pageIndex:'seguindo',
            userUid: uid
        } ),
        dataType: 'json',
        success: function(response) {
            if (response.success == true) {
                
                folowInfoPopupUserAdd(response.data,'seguindo',response.plus)
            }
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })
    
    
    document.querySelector('#plus-seguindo span').addEventListener('click',async()=>{
        let atr = document.getElementById('seguindo-popup').getAttribute('data-page-seguindo')
        pageinPageSeguindo = parseInt(atr) + 1
        document.getElementById('seguindo-popup').setAttribute('data-page-seguindo',pageinPageSeguindo)
        await $.ajax({
            traditional: true,
            url: '/findUser',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( {
                pageinPage: pageinPageSeguindo,
                pageIndex:'seguindo',
                userUid: uid
            } ),
            dataType: 'json',
            success: function(response) {
                if (response.success == true) {
                    folowInfoPopupUserAdd(response.data,'seguindo',response.plus)
                }   
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        })
    })

})

if (document.getElementById('button-seguir')) {
    let buttonSeguir = document.getElementById('button-seguir')
    let optionsFolow = document.getElementById('options-folow-user-content')
    let optionsContainner = document.getElementById('options-folow-user-containner')
    buttonSeguir.addEventListener('click',()=>{
        if (buttonSeguir.getAttribute('data-folow') == "false") {
            $.ajax({
                traditional: true,
                url: '/folow/' + uid,
                type: 'POST',
                success: function(response) {
                    if (response.success == true) {
                        buttonSeguir.setAttribute('data-folow',true)
                        buttonSeguir.classList.add('seguindo')
                        let seguidores = document.querySelector('#seguidores .number-info')
                        seguidores.innerHTML =  parseInt(seguidores.innerHTML) + 1
                    }
                },
                error: function(xhr, status, error) {
                    console.error(error);
                }
            })
        }else{

            optionsFolow.css({
                left: buttonSeguir.offsetLeft - 10 + "px" ,
                top: buttonSeguir.offsetTop + buttonSeguir.offsetHeight + 10 + 'px',
            })
            optionsContainner.show('block')
            
            document.getElementById('bloquearUser').addEventListener('click',()=>{
                $.ajax({
                    traditional: true,
                    url: '/userBlock/' + uid,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify( {

                    } ),
                    dataType: 'json',
                    success: function(response) {
                        if (response.success == true) {
                            location.reload()
                        }
                        
                    },
                    error: function(xhr, status, error) {
                        console.error(error);
                    }
                })
            })

            document.getElementById('denunciarUser').addEventListener('click',()=>{
                location.href = '/denunciar/' + uid
            })
            
            document.getElementById('pararDeSeguir').addEventListener('click',()=>{
                optionsContainner.hide()
                $.ajax({
                    traditional: true,
                    url: '/unfolow/' + uid,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify( {

                    } ),
                    dataType: 'json',
                    success: function(response) {
                        if (response.success == true) {
                            buttonSeguir.setAttribute('data-folow',false)
                            buttonSeguir.classList.remove('seguindo')
                            let seguidores = document.querySelector('#seguidores .number-info')
                            seguidores.innerHTML =  parseInt(seguidores.innerHTML) - 1

                        }
                        
                    },
                    error: function(xhr, status, error) {
                        console.error(error);
                    }
                })
                
            })
            
            document.getElementById('close-options-folow-user').addEventListener('click',()=>{
                optionsContainner.hide()
            })
            
        }
    })
}

if (document.getElementById('desblock')) {
    document.getElementById('desblock').addEventListener('click',()=>{
        $.ajax({
            traditional: true,
            url: '/userUnBlock/' + uid,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( {

            } ),
            dataType: 'json',
            success: function(response) {
                if (response.success == true) {
                    location.reload()
                }
                
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        })
    })
}


if (isMyProfile == 'true') {
    document.getElementById('edit-photo').addEventListener('click',()=>{
        document.getElementById('inputFile-profileImg').click()
     })
    var Imgfile = null
    let imgInputFile = document.getElementById('inputFile-profileImg')
    let previewImage = document.getElementById('imgDisplayUser')
    imgInputFile.addEventListener('change',(event)=>{
        let file = event.target.files[0]
        Imgfile = file
        if (file) {
          var reader = new FileReader();
          reader.onload = function(e) {
            previewImage.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
    
    })
    
    document.getElementById('save-edit').addEventListener('click',async()=>{
        let displayNameValue = document.getElementById('input-displayName').value
        if (Imgfile) {
            var formData = new FormData();
            formData.append('file', Imgfile);
            formData.append('inputValue', displayNameValue);
            $.ajax({
                traditional: true,
                url: '/editProfile/' + uid,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,  
                success: function(response) {
                    if (response.success == true) {
                        if (response.displayName) {
                            document.getElementsByTagName('title')[0].innerHTML = `Perfil - ${response.displayName}`
                            document.getElementById("displayName-profile").innerHTML = response.displayName
                            document.querySelector('#displayName span').innerHTML = response.displayName 
                        }
                        
                        if (Imgfile) {
                            var reader = new FileReader();
                            reader.onload = function(e) {
                                document.querySelector('#profile-pic img').src = e.target.result;
                                document.querySelector('#profile-image-miniheader img').src = e.target.result;
                                document.querySelector('#profile-image img').src = e.target.result;
                            };
                            reader.readAsDataURL(Imgfile);
                            
                        }else{
                            location.reload()
                        }
                        
                        
                    }
                    
                },
                error: function(xhr, status, error) {
                    console.error(error);
                }
            })
        }else{
            $.ajax({
                traditional: true,
                url: '/editProfile/' + uid,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify( {
                    inputValue: displayNameValue
                } ),
                dataType: 'json', 
                success: function(response) {
                    if (response.success == true) {
                        if (response.displayName) {
                            document.getElementsByTagName('title')[0].innerHTML = `Perfil - ${response.displayName}`
                            document.getElementById("displayName-profile").innerHTML = response.displayName
                            document.querySelector('#displayName span').innerHTML = response.displayName
                        }

                    }
                    
                },
                error: function(xhr, status, error) {
                    console.error(error);
                }
            })
        }
        document.getElementById('edit-profile-popup-containner').hide()   
        successNotify('Perfil Editado!')
    })




    document.getElementById('profile-banner-input-img').addEventListener('change',(event)=>{
        let Imgfile = event.target.files[0]
        var formData = new FormData();
            formData.append('file', Imgfile);
            formData.append('type', "image");
            $.ajax({
                traditional: true,
                url: '/editProfileBanner/' + uid,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,  
                success: function(response) {
                    if (response.success == true) {
                        if (Imgfile) {
                            if (isMyProfile == 'true') {
                                document.getElementById("banner-continner").innerHTML = ` 
                                    <div id="banner-img"> 
                                        <div class="banner-profile-class"></div>
                                        <img src="">
                                    </div>
                                `
                            }else{
                                document.getElementById("banner-continner").innerHTML = ` 
                                    <div id="banner-img">
                                        <img src="">
                                    </div>
                                `
                            }
                            document.querySelector('.banner-profile-class').addEventListener('click',()=>{
                                document.getElementById('edit-banner-containner').show("flex")
                            })
                            var reader = new FileReader();
                            reader.onload = function(e) {
                                document.querySelector('#banner-img img').src = e.target.result;
                            };
                            reader.readAsDataURL(Imgfile);
                            successNotify('Banner Editado!')
                        }else{
                            setTimeout(()=>{
                                location.reload()
                            },3000)
                        }

                    }
                    
                },
                error: function(xhr, status, error) {
                    console.error(error);
                }
            })
    })
    if (document.getElementById('banner-color')) {
        document.getElementById('banner-color').style.backgroundColor =  document.getElementById('banner-color').getAttribute('data-color')
        
        
    }
    document.getElementById('profile-banner-input-color').value = document.getElementById('banner-color').getAttribute('data-color')
    document.getElementById('preview-color').style.backgroundColor = document.getElementById('banner-color').getAttribute('data-color')
    document.getElementById('profile-banner-input-color').addEventListener('change',(event)=>{
        document.getElementById('preview-color').style.backgroundColor = document.getElementById('profile-banner-input-color').value
    })
    document.getElementById('save-color-banner').addEventListener('click',(event)=>{
        let colorInput = document.getElementById('profile-banner-input-color').value
        $.ajax({
            traditional: true,
            url: '/editProfileBanner/' + uid,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( {
                type: "color",
                color: colorInput
            } ), 
            success: function(response) {
                if (response.success == true) {
                    if (isMyProfile == 'true') {
                        document.getElementById("banner-continner").innerHTML = ` 
                            <div id="banner-color" data-color="${colorInput}"> 
                                <div class="banner-profile-class"></div>
                            </div>
                        `
                    }else{
                        document.getElementById("banner-continner").innerHTML = ` 
                            <div id="banner-color" data-color="${colorInput}"></div>
                        `
                    }
                    document.querySelector('.banner-profile-class').addEventListener('click',()=>{
                        document.getElementById('edit-banner-containner').show("flex")
                    })
                    document.getElementById('banner-color').style.backgroundColor =  colorInput
                    document.getElementById('preview-color').style.backgroundColor = colorInput
                    successNotify('Banner Editado!')
                }
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        })
    })
}



