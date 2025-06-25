import React, { useState } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx';
    import { MessageSquare, Send } from 'lucide-react';
    import { format, parseISO } from 'date-fns';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const ChatInterface = ({ mockUsers, currentUser, initialMessages }) => {
      const { toast } = useToast();
      const [activeChat, setActiveChat] = useState(null); 
      const [chatMessages, setChatMessages] = useState(initialMessages);
      const [newMessage, setNewMessage] = useState("");

      const handleSendChatMessage = () => {
        if (!newMessage.trim() || !activeChat) return;
        const newMsg = {
            id: `MSG${Date.now()}`,
            from: currentUser.name, 
            to: activeChat.user.name, 
            text: newMessage,
            timestamp: new Date().toISOString(),
            read: false,
        };
        setChatMessages(prev => [...prev, newMsg]);
        setNewMessage("");
        toast({title: "Message Sent (Simulated)", description: `To: ${activeChat.user.name}`});
      };

      return (
        <div className="p-6">
          <div className="space-y-2 mb-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => setActiveChat({ user: mockUsers["doc001"], type: "Doctor <-> Pharmacy"})}>
                  <Avatar className="h-7 w-7 mr-2"> <AvatarFallback>{mockUsers["doc001"].avatar}</AvatarFallback> </Avatar> Chat with Pharmacy (Dr. Alice)
              </Button>
               <Button variant="outline" className="w-full justify-start" onClick={() => setActiveChat({ user: mockUsers["amb001"], type: "Admin <-> Ambulance"})}>
                  <Avatar className="h-7 w-7 mr-2"> <AvatarFallback>{mockUsers["amb001"].avatar}</AvatarFallback> </Avatar> Chat with Ambulance (Admin)
              </Button>
          </div>
          {activeChat ? (
              <div className="border rounded-lg p-3 h-[400px] flex flex-col bg-slate-50">
                  <div className="mb-2 text-center text-sm text-blue-700 font-medium">{activeChat.type} with {activeChat.user.name}</div>
                  <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                      {chatMessages.filter(msg => (msg.from === currentUser.name && msg.to === activeChat.user.name) || (msg.to === currentUser.name && msg.from === activeChat.user.name) ).map(msg => (
                          <div key={msg.id} className={`flex ${msg.from === currentUser.name ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] p-2 rounded-lg text-sm ${msg.from === currentUser.name ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                  {msg.text}
                                  <div className={`text-xs mt-1 ${msg.from === currentUser.name ? 'text-blue-200' : 'text-gray-500'}`}>{format(parseISO(msg.timestamp), 'p')}</div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="mt-3 flex">
                      <Input 
                          value={newMessage} 
                          onChange={(e) => setNewMessage(e.target.value)} 
                          placeholder="Type a message..." 
                          className="flex-grow mr-2"
                          onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                      />
                      <Button onClick={handleSendChatMessage} size="icon" className="bg-blue-600 hover:bg-blue-700"><Send className="h-4 w-4"/></Button>
                  </div>
              </div>
          ) : (
              <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                  <p>Select a chat to view messages.</p>
                  <p className="text-xs mt-2">Full chat functionality requires backend services.</p>
              </div>
          )}
        </div>
      );
    };

    export default ChatInterface;