"use client";

import { useEffect, useState, useRef, use } from "react";
import axios from "axios";
import { Loader2, Send, ShieldAlert, CheckCheck, Check, User } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MessageType {
  _id: string;
  sender: "ADMIN" | "VENDOR";
  content: string;
  createdAt: string;
  isRead: boolean;
}

export default function VendorSupportPage({ params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = use(params);
  
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for messages
  useEffect(() => {
    let isMounted = true;
    
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/messages/${vendorId}?markRead=VENDOR`);
        if (isMounted) setMessages(res.data);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Polling every 5 seconds
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [vendorId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await axios.post(`/api/messages/${vendorId}`, {
        sender: "VENDOR",
        content: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-primary" /> AI Support & Admin Q&A
        </h1>
        <p className="text-muted-foreground mt-2">
          Direct communication channel with AutoCarBazaar Platform Administrators.
        </p>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Chat History Window */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-muted/10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-70">
              <ShieldAlert className="h-12 w-12 mb-3 text-muted-foreground" />
              <p>No messages yet. Send a question to the admin to get started.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isVendor = msg.sender === "VENDOR";
              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isVendor ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm flex flex-col ${
                      isVendor
                        ? "bg-[#D9FDD3] dark:bg-[#005C4B] text-foreground rounded-tr-none ml-auto"
                        : "bg-background border border-border rounded-tl-none mr-auto relative pl-10"
                    }`}
                  >
                    {!isVendor && (
                      <div className="absolute left-2 top-2 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                        <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Admin" className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    {!isVendor && (
                      <span className="text-[10px] font-bold uppercase text-[#075E54] dark:text-[#00A884] mb-1 block">
                        Admin Team
                      </span>
                    )}

                    <span className="whitespace-pre-wrap leading-relaxed inline-block mb-1">
                      {msg.content}
                    </span>
                    
                    {/* Timestamp & Read Receipts */}
                    <div className={`text-[10px] flex items-center justify-end gap-1 ${isVendor ? "text-gray-500 dark:text-gray-300" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isVendor && msg.isRead ? (
                        <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" /> // WhatsApp Blue
                      ) : isVendor && !msg.isRead ? (
                        <Check className="h-3.5 w-3.5 text-gray-400" /> // Sent Gray Tick
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-background border-t border-border flex items-center gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your question or issue here..."
            className="flex-1 bg-muted/20"
            disabled={sending}
          />
          <Button 
            type="submit" 
            disabled={sending || !newMessage.trim()} 
            className="rounded-full shadow-md gap-2"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
