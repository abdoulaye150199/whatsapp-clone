import { UserManager } from './js/userManager.js';
import { ContactManager } from './js/contactManager.js';
import { GroupManager } from './js/groupManager.js';
import { BroadcastManager } from './js/broadcastManager.js';
import { TabManager } from './js/tabManager.js';
import { MessageManager } from './js/messageManager.js';
import { DatabaseManager } from './js/databaseManager.js';
import { ArchiveManager } from './js/archiveManager.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation de l\'application');

    DatabaseManager.initDatabase();
    console.log('✅ Base de données initialisée');
    
    ContactManager.init();
    console.log('✅ Contacts initialisés');
    
    TabManager.initializeTabs();
    console.log('✅ Onglets initialisés');

    document.getElementById('newContactBtn').addEventListener('click', () => {
        document.getElementById('addContactForm').classList.remove('hidden');
    });

    document.getElementById('createGroupBtn')?.addEventListener('click', () => {
        const contactsContainer = document.getElementById('contactsForGroup');
        if (contactsContainer) {
            const users = DatabaseManager.getAllUsers();
            contactsContainer.innerHTML = users.map(user => `
                <div class="flex items-center gap-2 p-2 hover:bg-gray-50">
                    <input type="checkbox" id="contact-${user.id}" value="${user.id}">
                    <label for="contact-${user.id}" class="flex-1 cursor-pointer">
                        <div class="font-medium text-sm">${user.name}</div>
                        <div class="text-xs text-gray-500">${user.phone || ''}</div>
                    </label>
                </div>
            `).join('');
        }
        document.getElementById('newGroupModal').classList.remove('hidden');
    });

    document.getElementById('broadcastBtn')?.addEventListener('click', () => {
        document.getElementById('contactsList').classList.add('hidden');
        document.getElementById('groupsList').classList.add('hidden');
        document.getElementById('addContactForm').classList.add('hidden');
        
        document.getElementById('broadcastList').classList.remove('hidden');
        
        document.getElementById('panelTitle').textContent = 'Diffusion';
        
        const broadcastContactsList = document.getElementById('broadcastContactsList');
        if (broadcastContactsList) {
            const users = DatabaseManager.getAllUsers();
            broadcastContactsList.innerHTML = users.map(user => `
                <div class="flex items-center gap-3 p-4 hover:bg-gray-100 border-b border-gray-100">
                    <div class="w-11 h-11 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <label for="broadcast-${user.id}" class="flex-1 cursor-pointer">
                        <div class="font-medium text-sm">${user.name}</div>
                        <div class="text-xs text-gray-500">${user.phone || ''}</div>
                    </label>
                    <input type="checkbox" 
                           id="broadcast-${user.id}" 
                           value="${user.id}"
                           class="rounded text-green-500 focus:ring-green-500 ml-2">
                </div>
            `).join('');
        }
    });

    GroupManager.init();
    BroadcastManager.init();
    MessageManager.init();
    
    setTimeout(() => {
        setupMessageSystem();
    }, 100);
});

function setupMessageSystem() {
    const messageInput = document.querySelector('input[placeholder="Tapez votre message..."]');
    const sendButton = messageInput?.nextElementSibling;
    const inputArea = messageInput?.parentElement;

    if (messageInput && sendButton && inputArea) {
        const sendMessage = () => {
            const message = messageInput.value.trim();
            if (message && MessageManager.activeContact) {
                const messagesArea = document.getElementById('Discuter');
                
                if (!messagesArea.innerHTML.includes('messagesContainer')) {
                    messagesArea.innerHTML = '<div class="flex-1 overflow-y-auto space-y-3" id="messagesContainer"></div>';
                }

                const container = messagesArea.querySelector('#messagesContainer');
                if (!container) return;
                
                // Ajouter le nouveau message
                const messageHtml = `
                    <div class="flex justify-end mb-2">
                        <div class="message-bubble sent">
                            <p class="text-sm">${message}</p>
                            <p class="text-[10px] text-gray-500 text-right mt-1">
                                ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <span class="message-status sent">✓</span>
                            </p>
                        </div>
                    </div>
                `;
                
                container.insertAdjacentHTML('beforeend', messageHtml);
                
                // Scroll vers le bas
                container.scrollTop = container.scrollHeight;
                
                // Enregistrer le message
                MessageManager.addMessage(MessageManager.activeContact, message, true);
                
                // Vider l'input
                messageInput.value = '';
                
                // Simuler une réponse après 1 seconde
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
                    
                    const replyHtml = `
                        <div class="flex justify-start mb-2">
                            <div class="message-bubble received">
                                <p class="text-sm">${randomResponse}</p>
                                <p class="text-[10px] text-gray-500 text-right mt-1">
                                    ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    `;
                    
                    container.insertAdjacentHTML('beforeend', replyHtml);
                    container.scrollTop = container.scrollHeight;
                    
                    MessageManager.addMessage(MessageManager.activeContact, randomResponse, false);
                }, 1000);
            }
        };

        // Gestionnaire pour le bouton d'envoi
        sendButton.addEventListener('click', () => {
            sendMessage();
        });

        // Gestionnaire pour la touche Entrée
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

// Fonctions globales
window.cancelAddContact = () => {
    document.getElementById('addContactForm').classList.add('hidden');
    document.getElementById('contactName').value = '';
    document.getElementById('contactPhone').value = '';
};

window.validatePhoneNumber = (input) => {
    const phoneError = document.getElementById('phoneError');
    const value = input.value.trim();
    
    input.value = value.replace(/\D/g, '');
    
    const isValid = /^(7[0578])\d{7}$/.test(value);
    
    if (value.length > 0) {
        if (!value.startsWith('7')) {
            phoneError.textContent = 'Le numéro doit commencer par 7';
            phoneError.classList.remove('hidden');
            input.classList.add('border-red-500');
        }
        else if (!'05678'.includes(value[1])) {
            phoneError.textContent = 'Le deuxième chiffre doit être 0, 5, 6, 7 ou 8';
            phoneError.classList.remove('hidden');
            input.classList.add('border-red-500');
        }
        else if (value.length !== 9) {
            phoneError.textContent = 'Le numéro doit contenir exactement 9 chiffres';
            phoneError.classList.remove('hidden');
            input.classList.add('border-red-500');
        }
        else {
            phoneError.classList.add('hidden');
            input.classList.remove('border-red-500');
            input.classList.add('border-green-500');
        }
    } else {
        phoneError.classList.add('hidden');
        input.classList.remove('border-red-500', 'border-green-500');
    }
    
    return isValid;
};

window.addNewContact = () => {
    const nameInput = document.getElementById('contactName');
    const phoneInput = document.getElementById('contactPhone');
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    
    if (!name) {
        alert('Veuillez saisir un nom');
        return;
    }
    
    if (!validatePhoneNumber(phoneInput)) {
        alert('Numéro de téléphone invalide');
        return;
    }

    const existingUsers = DatabaseManager.getAllUsers();
    const phoneExists = existingUsers.some(user => user.phone === phone);
    
    if (phoneExists) {
        alert('Ce numéro existe déjà');
        phoneInput.classList.add('border-red-500');
        return;
    }
    
    ContactManager.addContact(name, phone);
    nameInput.value = '';
    phoneInput.value = '';
    document.getElementById('addContactForm').classList.add('hidden');
    phoneInput.classList.remove('border-red-500', 'border-green-500');
};

window.startBroadcast = () => {
    const selectedContacts = Array.from(
        document.querySelectorAll('#broadcastContactsList input[type="checkbox"]:checked')
    ).map(checkbox => parseInt(checkbox.value));

    if (selectedContacts.length === 0) {
        alert('Veuillez sélectionner au moins un contact');
        return;
    }

    alert(`Diffusion préparée pour ${selectedContacts.length} contact(s)`);
};

window.closeGroupMembersModal = () => {
    document.getElementById('groupMembersModal').classList.add('hidden');
};

window.GroupManager = GroupManager;
window.BroadcastManager = BroadcastManager;
window.ContactManager = ContactManager;
window.MessageManager = MessageManager;
window.DatabaseManager = DatabaseManager;
window.ArchiveManager = ArchiveManager;