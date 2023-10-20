class AppController{

    constructor(){
        console.log('AppController: OK');

        this.elementsPrototype()
        this.loadElements()

    }

    loadElements() {

        this.el = {};

        document.querySelectorAll('[id]').forEach(element => {

            this.el[Format.getCamelcase(element.id)] = element;

        });

    }

    elementsPrototype(){
        String.prototype.toHHMMSS = function () {
            var sec_num = parseInt(this, 10); // don't forget the second param
            var hours   = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);
        
            if (hours   < 10) {hours   = "0"+hours;}
            if (minutes < 10) {minutes = "0"+minutes;}
            if (seconds < 10) {seconds = "0"+seconds;}
            var time    = hours+':'+minutes+':'+seconds;
            return time;
        }
        Element.prototype.hide = function () {
            //Esconde os elementos da pagina
            this.style.display = 'none ';
            return this
        }

        Element.prototype.show = function (res) {
            //Mostra os elementos da pagina
            if (res) {
                this.style.display = res;
            }else{
                this.style.display = 'block';
            }
            return this
        }

        Element.prototype.toggle = async function (res) {
            //Troca o estado dos elementos da pagina (caso esteja ativo ele desativa ou caso ele esteja desativado ele ativa)
            if (this.style.display === 'none' || this.style.display === '') {
                this.show(res);
            } else {
                this.hide();
            }
            return this
        }
        
        Element.prototype.on = function (event,fn) {
            //Cria Multiplos eventos
            event.split(' ').forEach(events=>{
                this.addEventListener(events, fn)
            })
            return this
        }

        Element.prototype.css = function (styles) {
            //muda os estilos
            for (let name in styles) {
                this.style[name] = styles[name]
            }
            return this
        }
    }
}