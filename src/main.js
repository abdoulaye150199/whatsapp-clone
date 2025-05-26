import { UserManager } from './js/userManager.js';
import { ContactManager } from './js/contactManager.js';
import { GroupManager } from './js/groupManager.js';
import { BroadcastManager } from './js/broadcastManager.js';
import { TabManager } from './js/tabManager.js';
import { users } from './data/users.js';
import { MessageManager } from './js/messageManager.js';

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des contacts
    ContactManager.init();
    
    // Initialisation des onglets
    TabManager.initializeTabs();

    // Gestionnaire pour le bouton "Nouveau"
    const newButton = document.querySelector('.bxs-plus').parentElement;
    newButton.addEventListener('click', () => {
        document.getElementById('addUserModal').classList.remove('hidden');
    });

    document.getElementById('newContactBtn').addEventListener('click', () => {
        document.getElementById('newContactModal').classList.remove('hidden');
    });

    // Gestionnaire pour le bouton de création de groupe
    document.getElementById('createGroupBtn')?.addEventListener('click', () => {
        // Remplir la liste des contacts pour le groupe
        const contactsContainer = document.getElementById('contactsForGroup');
        if (contactsContainer) {
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

    // Gestionnaire pour le bouton de diffusion
    document.getElementById('broadcastBtn')?.addEventListener('click', () => {
        BroadcastManager.showBroadcastModal();
    });

    // Désactiver initialement la zone de message
    document.querySelector('.bg-white.p-5.border-t').classList.add('opacity-50', 'pointer-events-none');

    // Gestionnaire pour l'envoi de messages
    const messageInput = document.querySelector('.bg-white.p-5.border-t input');
    const sendButton = document.querySelector('.bg-white.p-5.border-t button');

    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message && MessageManager.activeContact) {
            MessageManager.addMessage(MessageManager.activeContact, message, true);
            messageInput.value = '';

            // Simuler une réponse après 1 seconde
            setTimeout(() => {
                const responses = ["D'accord !", "Je comprends", "Merci pour le message", "Je vous réponds bientôt"];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                MessageManager.addMessage(MessageManager.activeContact, randomResponse, false);
            }, 1000);
        }
    });

    // Permettre l'envoi avec Enter
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    GroupManager.init();
    BroadcastManager.init();
});

// Fonctions globales pour la modal
window.closeAddUserModal = () => {
    document.getElementById('addUserModal').classList.add('hidden');
};

window.addNewUser = () => {
    const nameInput = document.getElementById('newUserName');
    const name = nameInput.value.trim();
    
    if (name) {
        UserManager.addUser(name);
        nameInput.value = '';
        closeAddUserModal();
    }
};

window.closeContactModal = () => {
    document.getElementById('newContactModal').classList.add('hidden');
    document.getElementById('contactName').value = '';
    document.getElementById('contactPhone').value = '';
};

window.addNewContact = () => {
    const nameInput = document.getElementById('contactName');
    const phoneInput = document.getElementById('contactPhone');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    
    if (name && phone) {
        ContactManager.addContact(name, phone);
        nameInput.value = '';
        phoneInput.value = '';
        document.getElementById('newContactModal').classList.add('hidden');
    }
};

window.closeGroupModal = () => {
    document.getElementById('createGroupModal').classList.add('hidden');
    document.getElementById('groupName').value = '';
};

window.createNewGroup = () => {
    const groupName = document.getElementById('groupName').value.trim();
    const selectedContacts = Array.from(document.querySelectorAll('#contactsForGroup input[type="checkbox"]:checked'))
        .map(checkbox => parseInt(checkbox.value));
    
    if (groupName && selectedContacts.length > 0) {
        const members = selectedContacts.map(id => {
            const user = users.find(u => u.id === id);
            return {
                id: user.id,
                name: user.name,
                phone: user.phone
            };
        });
        
        GroupManager.createGroup(groupName, members);
        closeGroupModal();
    }
};

// Ajouter ces fonctions à la fin du fichier
window.showGroupMembers = (groupId) => {
    const group = GroupManager.getGroupById(groupId);
    if (!group) return;

    const membersList = document.getElementById('groupMembersList');
    membersList.innerHTML = group.members.map(member => `
        <div class="flex items-center gap-3 p-2 border-b border-gray-100">
            <div class="w-8 h-8 bg-gray-400 rounded-full flex-shrink-0"></div>
            <div>
                <div class="font-medium text-sm">${member.name}</div>
                <div class="text-xs text-gray-500">${member.phone}</div>
            </div>
        </div>
    `).join('');

    document.getElementById('groupMembersModal').classList.remove('hidden');
};

window.closeGroupMembersModal = () => {
    document.getElementById('groupMembersModal').classList.add('hidden');
};

// Rendre les méthodes accessibles globalement
window.GroupManager = GroupManager;
window.BroadcastManager = BroadcastManager;