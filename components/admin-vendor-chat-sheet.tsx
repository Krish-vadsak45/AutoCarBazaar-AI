"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Loader2, Send, MessageSquare, AlertCircle, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MessageType {
  _id: string;
  sender: "ADMIN" | "VENDOR";
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface AdminVendorChatSheetProps {
  vendorId: string | null;
  vendorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminVendorChatSheet({
  vendorId,
  vendorName,
  isOpen,
  onClose,
}: AdminVendorChatSheetProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically fetch messages on open & start polling
  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout | null = null;
    
    if (!isOpen || !vendorId) {
      if (interval) clearInterval(interval);
      return;
    }

    setLoading(true); // show loader instantly on open

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/messages/${vendorId}?markRead=ADMIN`);
        if (isMounted) setMessages(res.data);
      } catch (err) {
        console.error("Chat sync error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Initial fetch
    fetchMessages();
    
    // Polling setup for active chat window
    interval = setInterval(fetchMessages, 3000); // 3 seconds for admin responsiveness
    
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [isOpen, vendorId]);

  // Handle message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !vendorId) return;

    setSending(true);
    try {
      const res = await axios.post(`/api/messages/${vendorId}`, {
        sender: "ADMIN",
        content: newMessage,
      });
      // Append optimistically
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      toast.error("Failed to send message. Please check the console.");
    } finally {
      setSending(false);
    }
  };

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="w-full sm:max-w-md xl:max-w-lg p-0 flex flex-col shadow-2xl border-l border-border"
        side="right"
      >
        <SheetHeader className="p-6 border-b border-border bg-muted/20">
          <SheetTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            Support Q&A: {vendorName}
          </SheetTitle>
          <SheetDescription>
            Live bidirectional chat thread securely synced with {vendorName}.
          </SheetDescription>
        </SheetHeader>

        {/* Chat History Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-70">
              <AlertCircle className="h-10 w-10 mb-3 text-muted-foreground/50" />
              <p className="text-sm">No recorded questions or answers yet.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.sender === "ADMIN";
              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${
                    isAdmin ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-2 text-sm shadow-sm flex flex-col ${
                      isAdmin
                        ? "bg-[#D9FDD3] dark:bg-[#005C4B] text-foreground rounded-tr-none ml-auto"
                        : "bg-muted border border-border rounded-tl-none mr-auto relative pl-10"
                    }`}
                  >
                    {!isAdmin && (
                      <div className="absolute left-2 top-2 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                         <img src={`https://ui-avatars.com/api/?name=${vendorName}&background=random&color=fff`} alt={vendorName} className="w-full h-full object-cover" />
                      </div>
                    )}
                    {!isAdmin && (
                      <span className="text-[10px] font-bold uppercase text-[#075E54] dark:text-[#00A884] mb-1 block">
                        Vendor: {vendorName.split(' ')[0]}
                      </span>
                    )}
                    <span className="whitespace-pre-wrap leading-relaxed inline-block mb-1 text-foreground">
                      {msg.content}
                    </span>
                    
                    {/* Timestamp & Read Receipts */}
                    <div className={`text-[10px] flex items-center justify-end gap-1 ${isAdmin ? "text-gray-500 dark:text-gray-300" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isAdmin && msg.isRead ? (
                        <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" /> // WhatsApp Blue
                      ) : isAdmin && !msg.isRead ? (
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

        {/* Chat Input Field */}
        <div className="p-4 border-t border-border bg-card">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Provide an answer..."
              disabled={sending || loading}
              className="flex-1 shadow-sm bg-muted/20"
              autoFocus
            />
            <Button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 transform translate-x-0.5 -translate-y-0.5" />
              )}
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            The vendor will receive this message instantly on their dashboard.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
