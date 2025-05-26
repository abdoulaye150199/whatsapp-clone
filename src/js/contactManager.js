import { users } from '../data/users.js';
import { MessageManager } from './messageManager.js';

export class ContactManager {
    static init() {
        // Check if users exist in localStorage
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
            users.length = 0; // Clear existing array
            users.push(...JSON.parse(savedUsers));
        }
        this.renderContacts();
    }

    static addContact(name, phone) {
        // Find the highest ID currently in use
        const maxId = users.reduce((max, user) => Math.max(max, user.id), 0);
        
        const newUser = {
            id: maxId + 1,
            name: name,
            phone: phone,
            avatar: null,
            status: "online",
            lastMessage: "",
            lastMessageDate: new Date().toLocaleTimeString(),
            unread: 0,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users)); // Sauvegarde directe
        this.renderContacts();
        return newUser; // Assurez-vous de retourner le nouveau contact
    }

    static renderContacts() {
        const contactsList = document.getElementById('contactsList');
        if (!contactsList) return;

        contactsList.innerHTML = users.map(user => `
            <div class="flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-100" 
                 onclick="ContactManager.selectContact(${user.id})"
                 data-contact-id="${user.id}">
                <div class="w-11 h-11 bg-gray-400 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-gray-800 text-sm">${user.name}</div>
                    <div class="text-xs text-gray-500">${user.phone || ''}</div>
                    ${user.lastMessage ? `
                        <div class="text-xs text-gray-500 truncate">${user.lastMessage}</div>
                        <div class="text-xs text-green-500">${user.lastMessageDate}</div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    static getContactById(id) {
        return users.find(user => user.id === parseInt(id));
    }

    static selectContact(id) {
        const contact = this.getContactById(id);
        if (contact) {
            // Mettre à jour la sélection visuelle
            document.querySelectorAll('[data-contact-id]').forEach(el => 
                el.classList.remove('bg-gray-100'));
            document.querySelector(`[data-contact-id="${id}"]`)?.classList.add('bg-gray-100');
            
            // Activer le chat
            MessageManager.activateChat(id);
        }
    }
}