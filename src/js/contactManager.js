import { DatabaseManager } from './databaseManager.js';
import { MessageManager } from './messageManager.js';

export class ContactManager {
    static init() {
        DatabaseManager.initDatabase();
        this.renderContacts();
    }

    static addContact(name, phone) {
        const newUser = DatabaseManager.addUser({
            name: name,
            phone: phone,
            avatar: null,
            status: "online"
        });
        
        this.renderContacts();
        return newUser;
    }

    static renderContacts() {
        const contactsList = document.getElementById('contactsList');
        if (!contactsList) return;

        const users = DatabaseManager.getActiveUsers();
        
        contactsList.innerHTML = users.map(user => `
            <div class="flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-100" 
                 onclick="ContactManager.selectContact(${user.id})"
                 data-contact-id="${user.id}">
                <div class="w-11 h-11 bg-gray-400 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-gray-800 text-sm">${user.name}</div>
                    <div class="text-xs text-gray-500 truncate">${user.phone || ''}</div>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <div class="text-xs text-green-500">date</div>
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
            </div>
        `).join('');
    }

    static getContactById(id) {
        return DatabaseManager.getUserById(id);
    }

    static selectContact(id) {
        const contact = this.getContactById(id);
        if (contact) {
            // Activer la zone de saisie
            const inputArea = document.querySelector('.bg-white.p-5.border-t');
            if (inputArea) {
                inputArea.classList.remove('opacity-50', 'pointer-events-none');
            }

            // Mettre à jour l'interface
            MessageManager.activateChat(id);
            
            // Sélection visuelle du contact
            document.querySelectorAll('[data-contact-id]').forEach(el => 
                el.classList.remove('bg-gray-100'));
            document.querySelector(`[data-contact-id="${id}"]`)?.classList.add('bg-gray-100');
        }
    }
}