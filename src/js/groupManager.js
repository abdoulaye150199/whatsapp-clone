export class GroupManager {
    static groups = JSON.parse(localStorage.getItem('groups') || '[]');

    static init() {
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
            const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            contactsContainer.innerHTML = savedUsers.map(user => `
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

    static createGroup(name, members = []) {
        const newGroup = {
            id: Date.now(),
            name,
            members,
            createdAt: new Date().toISOString(),
            lastMessage: "",
            lastMessageDate: null
        };

        this.groups.push(newGroup);
        localStorage.setItem('groups', JSON.stringify(this.groups));
        this.renderGroups();
        return newGroup;
    }

    static renderGroups() {
        const groupsList = document.getElementById('groupsList');
        if (!groupsList) return;

        const groupsHtml = this.groups.map(group => `
            <div class="flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-100">
                <div class="w-11 h-11 bg-gray-400 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold">
                    ${group.name.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-gray-800 text-sm">${group.name}</div>
                    <div class="text-xs text-gray-500">${group.members.length} membres</div>
                </div>
            </div>
        `).join('');

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

        const members = selectedContacts.map(id => {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.id === id);
            return {
                id: user.id,
                name: user.name,
                phone: user.phone
            };
        });

        this.createGroup(groupName, members);
        this.closeModal();
    }
}