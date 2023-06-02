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

        Element.prototype.hide = function () {
            //Esconde os elementos da pagina
            this.style.display = 'none';
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

        Element.prototype.toggle = function (res) {
            //Troca o estado dos elementos da pagina (caso esteja ativo ele desativa ou caso ele esteja desativado ele ativa)
            if (this.style.display === 'none') {
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