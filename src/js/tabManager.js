import { ContactManager } from './contactManager.js';

export class TabManager {
    static initializeTabs() {
        const messagesBtn = document.getElementById('messagesBtn');
        const groupsBtn = document.getElementById('groupsBtn');
        const contactsList = document.getElementById('contactsList');
        const groupsList = document.getElementById('groupsList');
        const panelTitle = document.getElementById('panelTitle');

        messagesBtn.addEventListener('click', () => {
            // Mise à jour des styles des boutons
            messagesBtn.classList.add('bg-yellow-600', 'border-orange-600');
            messagesBtn.querySelector('span').classList.add('text-white');
            groupsBtn.classList.remove('bg-yellow-600', 'border-orange-600');
            groupsBtn.querySelector('span').classList.remove('text-white');

            // Mise à jour du titre
            panelTitle.textContent = 'Messages';

            // Affichage/masquage des listes
            contactsList.classList.remove('hidden');
            groupsList.classList.add('hidden');

            // Force le rendu de la liste des contacts sans checkboxes
            ContactManager.renderContacts();
        });

        groupsBtn.addEventListener('click', () => {
            // Mise à jour des styles des boutons
            groupsBtn.classList.add('bg-yellow-600', 'border-orange-600');
            groupsBtn.querySelector('span').classList.add('text-white');
            messagesBtn.classList.remove('bg-yellow-600', 'border-orange-600');
            messagesBtn.querySelector('span').classList.remove('text-white');

            // Mise à jour du titre
            panelTitle.textContent = 'Groupes';

            // Affichage/masquage des listes
            groupsList.classList.remove('hidden');
            contactsList.classList.add('hidden');
        });
    }
}