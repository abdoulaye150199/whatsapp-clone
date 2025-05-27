import { DatabaseManager } from './databaseManager.js';

export class MessageManager {
    static activeContact = null;
    static activeGroup = null;

    static init() {
        const messagesArea = document.querySelector('.bg-[#efe7d7]');
        const inputArea = document.querySelector('.bg-white.p-5.border-t');
        const chatHeader = document.querySelector('.bg-white.p-4.border-b');

        if (messagesArea) messagesArea.innerHTML = '';
        if (inputArea) inputArea.classList.add('opacity-50', 'pointer-events-none');
        if (chatHeader) chatHeader.querySelector('.font-semibold').textContent = 'Sélectionnez un contact';
    }

    static activateChat(contactId) {
        this.activeContact = contactId;
        this.activeGroup = null;
        
        const contact = DatabaseManager.getUserById(contactId);
        if (contact) {
            // Activer la zone de saisie
            const inputArea = document.querySelector('.bg-white.p-5.border-t');
            if (inputArea) {
                inputArea.classList.remove('opacity-50', 'pointer-events-none');
            }
            
            // Mettre à jour le titre
            const headerTitle = document.querySelector('.bg-[#efe7d7] .font-semibold');
            if (headerTitle) {
                headerTitle.textContent = contact.name;
            }
            
            // Afficher les messages
            this.renderMessages(contactId);
        }
    }

    static renderMessages(contactId) {
        const messagesArea = document.getElementById('Discuter');
        if (!messagesArea) return;

        const messages = DatabaseManager.getMessagesByUserId(contactId);
        
        if (messages.length === 0) {
            messagesArea.innerHTML = `
                <div class="flex-1 flex items-center justify-center">
                    <p class="text-gray-500">Démarrer une conversation</p>
                </div>
            `;
            return;
        }
        
        messagesArea.innerHTML = `
            <div class="flex-1 overflow-y-auto p-4 space-y-1">
                ${messages.map(msg => `
                    <div class="flex ${msg.is_from_me ? 'justify-end' : 'justify-start'}">
                        <div class="message-bubble ${msg.is_from_me ? 'sent' : 'received'}">
                            <p class="text-sm">${msg.content}</p>
                            <div class="message-time">
                                ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                ${msg.is_from_me ? `
                                    <span class="message-status ${msg.is_read ? 'delivered' : 'sent'}">
                                        ${msg.is_read ? '✓✓' : '✓'}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Scroll vers le bas
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    static addMessage(contactId, content, isFromMe = true) {
        const messageData = {
            user_id: parseInt(contactId),
            content: content,
            is_from_me: isFromMe,
            is_read: isFromMe,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Sauvegarder le message dans la base de données
        DatabaseManager.addMessage(messageData);

        // Afficher immédiatement le nouveau message
        const messagesArea = document.getElementById('Discuter');
        if (messagesArea) {
            const messageHtml = `
                <div class="flex ${isFromMe ? 'justify-end' : 'justify-start'} mb-2">
                    <div class="${isFromMe ? 
                        'bg-green-500 text-white ml-12' : 
                        'bg-white text-gray-800 mr-12'} 
                        rounded-lg py-2 px-3 max-w-[70%] shadow-sm relative message-bubble ${
                            isFromMe ? 'sent' : 'received'
                        }">
                        <p class="text-sm">${content}</p>
                        <p class="text-[10px] ${isFromMe ? 'text-green-100' : 'text-gray-500'} text-right mt-1">
                            ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            `;
            
            // Ajouter le message à la fin de la zone de messages
            if (!messagesArea.querySelector('#messagesContainer')) {
                messagesArea.innerHTML = '<div class="flex-1 overflow-y-auto space-y-3" id="messagesContainer"></div>';
            }
            
            const container = messagesArea.querySelector('#messagesContainer');
            container.insertAdjacentHTML('beforeend', messageHtml);
            
            // Scroll vers le bas
            container.scrollTop = container.scrollHeight;
        }

        // Simuler une réponse
        if (isFromMe) {
            setTimeout(() => {
                const responses = [
                    "D'accord !", 
                    "Je comprends", 
                    "Merci !", 
                    "Parfait !", 
                    "👍",
                    "Ok, pas de souci",
                    "Bien reçu"
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                this.addMessage(contactId, randomResponse, false);
            }, 1000);
        }

        // Mettre à jour la liste des contacts
        import('./contactManager.js').then(({ ContactManager }) => {
            ContactManager.renderContacts();
        });
    }
}