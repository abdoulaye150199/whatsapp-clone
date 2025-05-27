import { DatabaseManager } from './databaseManager.js';

export class GroupManager {
    static init() {
        DatabaseManager.initDatabase();
        this.renderGroups();
        this.initializeEventListeners();
    }

    static initializeEventListeners() {
        // Gestionnaire pour le bouton de création de groupe
        document.getElementById('createGroupBtn')?.addEventListener('click', () => {
            this.showCreateGroupModal();
        });
    }

    static showCreateGroupModal() {
        const modal = document.getElementById('newGroupModal');
        const contactsContainer = document.getElementById('contactsForGroup');
        
        // Charger la liste des contacts existants
        if (contactsContainer) {
            const users = DatabaseManager.getAllUsers();
            contactsContainer.innerHTML = users.map(user => `
                <div class="flex items-center gap-2 p-2 hover:bg-gray-50">
                    <input type="checkbox" 
                           id="contact-${user.id}" 
                           value="${user.id}"
                           class="rounded text-orange-500 focus:ring-orange-500">
                    <label for="contact-${user.id}" class="flex-1 cursor-pointer">
                        <div class="font-medium text-sm">${user.name}</div>
                        <div class="text-xs text-gray-500">${user.phone || ''}</div>
                    </label>
                </div>
            `).join('');
        }

        modal?.classList.remove('hidden');
    }

    static createGroup(name, memberIds = []) {
        // Créer le groupe
        const newGroup = DatabaseManager.addGroup({
            name: name
        });

        // Ajouter les membres
        memberIds.forEach(userId => {
            DatabaseManager.addGroupMember(newGroup.id, userId);
        });

        this.renderGroups();
        return newGroup;
    }

    static renderGroups() {
        const groupsList = document.getElementById('groupsList');
        if (!groupsList) return;

        const groups = DatabaseManager.getAllGroups();
        
        const groupsHtml = groups.map(group => {
            const members = DatabaseManager.getGroupMembers(group.id);
            const lastMessage = DatabaseManager.getLastGroupMessage(group.id);
            
            return `
                <div class="flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                     data-group-id="${group.id}">
                    <div class="w-11 h-11 bg-gray-400 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold">
                        ${group.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="flex-1 min-w-0" onclick="GroupManager.selectGroup(${group.id})">
                        <div class="font-semibold text-gray-800 text-sm">${group.name}</div>
                        <div class="text-xs text-gray-500">${members.length} membres</div>
                        ${lastMessage ? `
                            <div class="text-xs text-gray-500 truncate">${lastMessage.content}</div>
                        ` : ''}
                    </div>
                    <div class="flex flex-col items-end gap-1">
                        ${lastMessage ? `
                            <div class="text-xs text-green-500">date</div>
                            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        ` : ''}
                        <div class="flex gap-1 mt-1">
                            <button onclick="GroupManager.showAddMemberModal(${group.id})" 
                                    class="p-1 text-blue-500 hover:bg-blue-50 rounded">
                                <i class='bx bx-user-plus text-sm'></i>
                            </button>
                            <button onclick="GroupManager.showGroupMembers(${group.id})" 
                                    class="p-1 text-gray-500 hover:bg-gray-50 rounded">
                                <i class='bx bx-group text-sm'></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        groupsList.innerHTML = `
            <div class="p-4 border-b border-gray-200">
                <button id="createGroupBtn" 
                        class="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center gap-2">
                    <i class='bx bxs-plus-circle'></i>
                    <span>Créer un groupe</span>
                </button>
            </div>
            ${groupsHtml}
        `;

        // Réattacher les événements après le rendu
        this.initializeEventListeners();
    }

    static selectGroup(groupId) {
        const group = DatabaseManager.getGroupById(groupId);
        if (group) {
            // Mettre à jour la sélection visuelle
            document.querySelectorAll('[data-group-id]').forEach(el => 
                el.classList.remove('bg-gray-100'));
            document.querySelector(`[data-group-id="${groupId}"]`)?.classList.add('bg-gray-100');
            
            // Activer le chat pour le groupe
            this.activateGroupChat(groupId);
        }
    }

    static activateGroupChat(groupId) {
        const group = DatabaseManager.getGroupById(groupId);
        if (!group) return;

        // Activer la zone de message
        const inputArea = document.querySelector('.bg-white.p-5.border-t');
        inputArea.classList.remove('opacity-50', 'pointer-events-none');
        
        // Mettre à jour l'en-tête
        const chatHeader = document.querySelector('.bg-white.p-4.border-b');
        chatHeader.querySelector('.font-semibold').textContent = group.name;
        
        // Stocker l'ID du groupe actif
        window.MessageManager.activeGroup = groupId;
        window.MessageManager.activeContact = null;
        
        // Afficher les messages du groupe
        this.renderGroupMessages(groupId);
    }

    static addGroupMessage(groupId, content, isFromMe = true, senderName = 'Vous') {
        const messageData = {
            group_id: parseInt(groupId),
            content: content,
            is_from_me: isFromMe,
            sender_name: senderName
        };

        DatabaseManager.addGroupMessage(messageData);
        this.renderGroupMessages(groupId);
        this.renderGroups(); // Mettre à jour la liste des groupes
    }

    static renderGroupMessages(groupId) {
        const messagesArea = document.querySelector('.bg-[#efe7d7]');
        if (!messagesArea) return;

        const messages = DatabaseManager.getMessagesByGroupId(groupId);
        
        if (messages.length === 0) {
            messagesArea.innerHTML = `
                <div class="flex-1 flex items-center justify-center">
                    <p class="text-gray-500">Aucun message pour le moment</p>
                </div>
            `;
            return;
        }
        
        messagesArea.innerHTML = `
            <div class="flex-1 overflow-y-auto p-4 space-y-3" id="groupMessagesContainer">
                ${messages.map(msg => `
                    <div class="flex ${msg.is_from_me ? 'justify-end' : 'justify-start'} mb-2">
                        <div class="${msg.is_from_me ? 
                            'bg-green-500 text-white ml-12' : 
                            'bg-white text-gray-800 mr-12'} 
                            rounded-lg py-2 px-3 max-w-[70%] shadow-sm relative message-bubble ${
                                msg.is_from_me ? 'sent' : 'received'
                            }">
                            ${!msg.is_from_me ? `<p class="text-xs text-blue-600 font-semibold mb-1">${msg.sender_name}</p>` : ''}
                            <p class="text-sm">${msg.content}</p>
                            <p class="text-[10px] ${msg.is_from_me ? 'text-green-100' : 'text-gray-500'} text-right mt-1">${msg.timestamp}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Scroll to bottom
        const messageContainer = messagesArea.querySelector('#groupMessagesContainer');
        if (messageContainer) {
            setTimeout(() => {
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }, 100);
        }
    }

    static showAddMemberModal(groupId) {
        const group = DatabaseManager.getGroupById(groupId);
        if (!group) return;

        const existingMembers = DatabaseManager.getGroupMembers(groupId);
        const existingMemberIds = existingMembers.map(m => m.user_id);
        const allUsers = DatabaseManager.getAllUsers();
        const availableUsers = allUsers.filter(user => !existingMemberIds.includes(user.id));

        if (availableUsers.length === 0) {
            alert('Tous les contacts sont déjà membres de ce groupe');
            return;
        }

        // Créer et afficher le modal d'ajout de membre
        const modalHtml = `
            <div id="addMemberModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white p-6 rounded-xl w-96">
                    <h3 class="text-xl font-semibold mb-4">Ajouter un membre à "${group.name}"</h3>
                    <div class="max-h-60 overflow-y-auto mb-4 border rounded-lg" id="availableUsers">
                        ${availableUsers.map(user => `
                            <div class="flex items-center gap-2 p-2 hover:bg-gray-50">
                                <input type="checkbox" 
                                       id="user-${user.id}" 
                                       value="${user.id}"
                                       class="rounded text-blue-500 focus:ring-blue-500">
                                <label for="user-${user.id}" class="flex-1 cursor-pointer">
                                    <div class="font-medium text-sm">${user.name}</div>
                                    <div class="text-xs text-gray-500">${user.phone || ''}</div>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    <div class="flex justify-end gap-2">
                        <button onclick="GroupManager.closeAddMemberModal()" 
                                class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Annuler
                        </button>
                        <button onclick="GroupManager.addSelectedMembers(${groupId})" 
                                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    static addSelectedMembers(groupId) {
        const selectedUsers = Array.from(
            document.querySelectorAll('#availableUsers input[type="checkbox"]:checked')
        ).map(checkbox => parseInt(checkbox.value));

        if (selectedUsers.length === 0) {
            alert('Veuillez sélectionner au moins un utilisateur');
            return;
        }

        selectedUsers.forEach(userId => {
            DatabaseManager.addGroupMember(groupId, userId);
        });

        this.closeAddMemberModal();
        this.renderGroups();
        
        alert(`${selectedUsers.length} membre(s) ajouté(s) au groupe`);
    }

    static closeAddMemberModal() {
        const modal = document.getElementById('addMemberModal');
        if (modal) {
            modal.remove();
        }
    }

    static showGroupMembers(groupId) {
        const group = DatabaseManager.getGroupById(groupId);
        const members = DatabaseManager.getGroupMembers(groupId);
        
        const membersList = document.getElementById('groupMembersList');
        membersList.innerHTML = members.map(member => `
            <div class="flex items-center gap-3 p-2 border-b border-gray-100">
                <div class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    ${member.user.name.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1">
                    <div class="font-medium text-sm">${member.user.name}</div>
                    <div class="text-xs text-gray-500">${member.user.phone}</div>
                </div>
                <button onclick="GroupManager.removeMember(${groupId}, ${member.user_id})" 
                        class="p-1 text-red-500 hover:bg-red-50 rounded">
                    <i class='bx bx-user-minus text-sm'></i>
                </button>
            </div>
        `).join('');

        document.getElementById('groupMembersModal').classList.remove('hidden');
    }

    static removeMember(groupId, userId) {
        if (confirm('Êtes-vous sûr de vouloir retirer ce membre du groupe ?')) {
            DatabaseManager.removeGroupMember(groupId, userId);
            this.showGroupMembers(groupId); // Rafraîchir la liste
            this.renderGroups(); // Mettre à jour le compteur de membres
        }
    }

    static getGroupById(id) {
        return DatabaseManager.getGroupById(id);
    }

    static closeModal() {
        const modal = document.getElementById('newGroupModal');
        const groupNameInput = document.getElementById('groupName');
        
        if (modal) {
            modal.classList.add('hidden');
        }
        if (groupNameInput) {
            groupNameInput.value = '';
        }
        
        // Décocher toutes les cases
        document.querySelectorAll('#contactsForGroup input[type="checkbox"]')
            .forEach(checkbox => checkbox.checked = false);
    }

    static createNewGroup() {
        const groupName = document.getElementById('groupName')?.value.trim();
        const selectedContacts = Array.from(
            document.querySelectorAll('#contactsForGroup input[type="checkbox"]:checked')
        ).map(checkbox => parseInt(checkbox.value));

        if (!groupName || selectedContacts.length === 0) {
            alert('Veuillez saisir un nom de groupe et sélectionner au moins un contact');
            return;
        }

        this.createGroup(groupName, selectedContacts);
        this.closeModal();
    }
}