/**
 * ui-ux.js
 * Manejo de la interfaz de usuario: Sidebar colapsable y estados de vista.
 */

const ui = {
    init() {
        this.appContainer = document.querySelector('.app-container');
        this.sidebar = document.querySelector('.sidebar');
        
        // Cargar estado previo
        const isSlim = localStorage.getItem('sidebar-slim') === 'true';
        if (isSlim) {
            this.appContainer.classList.add('app-container--slim');
            this.sidebar.classList.add('sidebar--slim');
        }

        this.addToggleButton();
    },

    addToggleButton() {
        if (document.querySelector('.sidebar__toggle')) return;

        const button = document.createElement('button');
        button.className = 'sidebar__toggle';
        button.innerHTML = '📂'; // Podría ser un icono SVG o emoji
        button.title = "Contraer/Expandir menú";
        
        button.onclick = () => {
            const isClosing = !this.sidebar.classList.contains('sidebar--slim');
            
            this.appContainer.classList.toggle('app-container--slim');
            this.sidebar.classList.toggle('sidebar--slim');
            
            localStorage.setItem('sidebar-slim', isClosing);
        };

        this.sidebar.appendChild(button);
    }
};

document.addEventListener('DOMContentLoaded', () => ui.init());
