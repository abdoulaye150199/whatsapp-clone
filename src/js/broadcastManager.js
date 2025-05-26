import { users } from '../data/users.js';

export class BroadcastManager {
    static broadcasts = [];
    static selectedContacts = [];

    static init() {
        document.getElementById('broadcastBtn')?.addEventListener('click', () => {
            this.showBroadcastList();
            // Mettre à jour le titre
            document.getElementById('panelTitle').textContent = 'Diffusion';
        });
    }

    static showBroadcastList() {
        const contactsList = document.getElementById('contactsList');
        const groupsList = document.getElementById('groupsList');
        
        if (contactsList) {
            contactsList.innerHTML = `
                <div class="flex-1 overflow-y-auto">
                    ${users.map(user => `
                        <div class="flex items-center justify-between p-4 hover:bg-gray-100 border-b border-gray-100">
                            <label for="broadcast-contact-${user.id}" class="flex-1 cursor-pointer">
                                <div class="flex items-center gap-3">
                                    <div class="w-11 h-11 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                                        ${user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div class="font-medium text-sm">${user.name}</div>
                                        <div class="text-xs text-gray-500">${user.phone || ''}</div>
                                    </div>
                                </div>
                            </label>
                            <input type="checkbox" 
                                   id="broadcast-contact-${user.id}" 
                                   value="${user.id}"
                                   class="ml-4 rounded text-orange-500 focus:ring-orange-500">
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Cacher la liste des groupes si elle est visible
        if (groupsList) {
            groupsList.classList.add('hidden');
        }
        // Afficher la liste des contacts
        contactsList.classList.remove('hidden');
    }

    static startBroadcast() {
        const selectedContacts = Array.from(
            document.querySelectorAll('#contactsList input[type="checkbox"]:checked')
        ).map(checkbox => parseInt(checkbox.value));

        if (selectedContacts.length === 0) {
            alert('Veuillez sélectionner au moins un contact');
            return;
        }

        this.selectedContacts = selectedContacts;
    }
}