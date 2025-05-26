import { users } from '../data/users.js';

export class MessageManager {
    static messages = JSON.parse(localStorage.getItem('messages') || '{}');
    static activeContact = null;

    static init() {
        // Réinitialiser l'interface au démarrage
        const messagesArea = document.querySelector('.bg-[#efe7d7]');
        const inputArea = document.querySelector('.bg-white.p-5.border-t');
        const chatHeader = document.querySelector('.bg-white.p-4.border-b');

        if (messagesArea) messagesArea.innerHTML = '';
        if (inputArea) inputArea.classList.add('opacity-50', 'pointer-events-none');
        if (chatHeader) chatHeader.querySelector('.font-semibold').textContent = 'Sélectionnez un contact';
    }

    static activateChat(contactId) {
        this.activeContact = contactId;
        const contact = users.find(u => u.id === contactId);
        
        if (contact) {
            // Activer la zone de message
            const inputArea = document.querySelector('.bg-white.p-5.border-t');
            inputArea.classList.remove('opacity-50', 'pointer-events-none');
            
            // Mettre à jour l'en-tête
            const chatHeader = document.querySelector('.bg-white.p-4.border-b');
            chatHeader.querySelector('.font-semibold').textContent = contact.name;
            
            // Afficher les messages existants
            this.renderMessages(contactId);
        }
    }

    static addMessage(contactId, content, isFromMe = true) {
        if (!this.messages[contactId]) {
            this.messages[contactId] = [];
        }

        const message = {
            id: Date.now(),
            content,
            timestamp: new Date().toLocaleTimeString(),
            isFromMe
        };

        this.messages[contactId].push(message);
        localStorage.setItem('messages', JSON.stringify(this.messages));
        this.renderMessages(contactId);

        // Mettre à jour le dernier message dans la liste des contacts
        const user = users.find(u => u.id === contactId);
        if (user) {
            user.lastMessage = content;
            user.lastMessageDate = message.timestamp;
            if (!isFromMe) user.unread = (user.unread || 0) + 1;
            localStorage.setItem('users', JSON.stringify(users));
            ContactManager.renderContacts();
        }
    }

    static renderMessages(contactId) {
        const messagesArea = document.querySelector('.bg-[#efe7d7]');
        if (!messagesArea) return;

        const messages = this.messages[contactId] || [];
        
        messagesArea.innerHTML = `
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
                ${messages.map(msg => `
                    <div class="flex ${msg.isFromMe ? 'justify-end' : 'justify-start'} mb-2">
                        <div class="${msg.isFromMe ? 
                            'bg-[#dcf8c6] ml-12' : 
                            'bg-white mr-12'} 
                            rounded-lg py-2 px-3 max-w-[70%] shadow-sm message-bubble ${
                                msg.isFromMe ? 'sent' : 'received'
                            }">
                            <p class="text-sm text-gray-800">${msg.content}</p>
                            <p class="text-[10px] text-gray-500 text-right mt-1">${msg.timestamp}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Scroll to bottom
        const messageContainer = messagesArea.querySelector('.overflow-y-auto');
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }
}