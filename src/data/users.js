const savedUsers = localStorage.getItem('users');
const defaultUsers = [
    {
        id: 1,
        name: "Toto",
        avatar: null,
        status: "online",
        lastMessage: "Un exemple",
        lastMessageDate: "10:30",
        unread: 2
    },
    {
        id: 2,
        name: "MM",
        avatar: null,
        status: "online",
        lastMessage: "Mon dernier message",
        lastMessageDate: "09:45",
        unread: 1
    }
];

export const users = savedUsers ? JSON.parse(savedUsers) : defaultUsers;