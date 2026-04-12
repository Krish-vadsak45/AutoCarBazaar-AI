"use client";

import { useEffect, useState, useRef, useCallback, memo } from "react";
import axios from "axios";
import {
  Loader2,
  Send,
  MessageSquare,
  AlertCircle,
  Check,
  CheckCheck,
  Pencil,
  Trash2,
  X,
  File as FileIcon,
} from "lucide-react";
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
  type?: "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "AUDIO";
  content?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  isRead: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
}

interface AdminVendorChatSheetProps {
  vendorId: string | null;
  vendorName: string;
  isOpen: boolean;
  onClose: () => void;
}

const MessageBubble = memo(
  ({
    msg,
    vendorName,
    startEditing,
    handleDeleteMessage,
  }: {
    msg: MessageType;
    vendorName: string;
    startEditing: (msg: MessageType) => void;
    handleDeleteMessage: (id: string) => void;
  }) => {
    const isAdmin = msg.sender === "ADMIN";

    const renderContent = () => {
      if (msg.isDeleted)
        return <span className="italic text-gray-500">Deleted message</span>;

      switch (msg.type) {
        case "IMAGE":
          return (
            <div className="rounded-lg overflow-hidden border border-black/5 dark:border-white/5 cursor-pointer hover:opacity-95 transition-opacity">
              <img
                src={msg.fileUrl}
                alt={msg.fileName || "Image"}
                className="max-w-[280px] max-h-[400px] object-cover"
              />
            </div>
          );
        case "VIDEO":
          return (
            <video
              controls
              className="max-w-[280px] rounded-lg border border-black/5"
            >
              <source src={msg.fileUrl} />
            </video>
          );
        case "AUDIO":
          return (
            <audio controls className="max-w-[240px] scale-90 -ml-4">
              <source src={msg.fileUrl} />
            </audio>
          );
        case "FILE":
          return (
            <a
              href={msg.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-foreground"
            >
              <FileIcon className="h-4 w-4" />
              <span className="truncate max-w-[180px] text-xs font-medium">
                {msg.fileName || "File"}
              </span>
            </a>
          );
        default:
          return (
            <span className="whitespace-pre-wrap leading-relaxed inline-block mb-1 text-foreground">
              {msg.content}
            </span>
          );
      }
    };

    return (
      <div
        className={`flex w-full mb-2 group ${
          isAdmin ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`flex items-end gap-2 max-w-[85%] ${
            isAdmin ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div
            className={`relative px-4 py-2 text-sm shadow-sm flex flex-col ${
              msg.type && msg.type !== "TEXT" ? "p-1" : "px-4 py-2"
            } ${
              msg.isDeleted
                ? "bg-gray-100 dark:bg-gray-800 text-gray-500 italic rounded-2xl"
                : isAdmin
                  ? "bg-[#D9FDD3] dark:bg-[#005C4B] text-foreground rounded-2xl rounded-tr-none"
                  : "bg-muted border border-border rounded-2xl rounded-tl-none pl-10"
            }`}
          >
            {!msg.isDeleted && !isAdmin && (
              <div className="absolute left-2 top-2 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                <img
                  src={`https://ui-avatars.com/api/?name=${vendorName}&background=random&color=fff`}
                  alt={vendorName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {!msg.isDeleted && !isAdmin && (
              <span className="text-[10px] font-bold uppercase text-[#075E54] dark:text-[#00A884] mb-1 block">
                Vendor: {vendorName.split(" ")[0]}
              </span>
            )}

            <div className="mb-1">
              {renderContent()}
              {msg.isEdited &&
                !msg.isDeleted &&
                (!msg.type || msg.type === "TEXT") && (
                  <span className="ml-2 text-[10px] italic opacity-70 text-foreground">
                    (edited)
                  </span>
                )}
            </div>

            {/* Timestamp & Read Receipts */}
            <div
              className={`text-[10px] flex items-center justify-end gap-1 ${isAdmin ? "text-gray-500 dark:text-gray-300" : "text-gray-400"}`}
            >
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {isAdmin && msg.isRead ? (
                <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" /> // WhatsApp Blue
              ) : isAdmin && !msg.isRead ? (
                <Check className="h-3.5 w-3.5 text-gray-400" /> // Sent Gray Tick
              ) : null}
            </div>
          </div>

          {/* Action Menu (Delete/Edit) */}
          {!msg.isDeleted && isAdmin && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mb-2">
              {(!msg.type || msg.type === "TEXT") && (
                <button
                  onClick={() => startEditing(msg)}
                  className="p-1.5 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => handleDeleteMessage(msg._id)}
                className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

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
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
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

    // Setup active Server-Sent Events (SSE) connection for instant messages (0 load push)
    const eventSource = new EventSource(`/api/messages/${vendorId}/stream`);

    eventSource.addEventListener("update", () => {
      if (isMounted) fetchMessages();
    });

    eventSource.onerror = (err) => {
      console.error("SSE Connection Error:", err);
      eventSource.close(); // Clean up if it fails, fallback to 15s polling below
    };

    // Polling setup for active chat window
    interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchMessages();
      }
    }, 15000); // Poll every 15 seconds, only when tab is active

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
      eventSource.close();
    };
  }, [isOpen, vendorId]);

  // Handle message sending
  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !vendorId) return;

      setSending(true);
      try {
        if (editingMsgId) {
          // Handle Edit
          const res = await axios.patch(
            `/api/messages/${vendorId}/${editingMsgId}`,
            {
              action: "EDIT",
              content: newMessage,
            },
          );
          setMessages((prev) =>
            prev.map((m) => (m._id === editingMsgId ? res.data : m)),
          );
          setEditingMsgId(null);
          toast.success("Message edited");
        } else {
          // Handle Send
          const res = await axios.post(`/api/messages/${vendorId}`, {
            sender: "ADMIN",
            content: newMessage,
          });
          setMessages((prev) => [...prev, res.data]);
        }
        setNewMessage("");
      } catch (err) {
        toast.error(
          editingMsgId ? "Failed to edit message." : "Failed to send message.",
        );
      } finally {
        setSending(false);
      }
    },
    [newMessage, vendorId, editingMsgId],
  );

  const handleDeleteMessage = useCallback(
    async (msgId: string) => {
      if (!confirm("Are you sure you want to delete this message?")) return;

      try {
        const res = await axios.patch(`/api/messages/${vendorId}/${msgId}`, {
          action: "DELETE",
        });
        setMessages((prev) =>
          prev.map((m) => (m._id === msgId ? res.data : m)),
        );
        toast.success("Message deleted");
      } catch (err) {
        toast.error("Failed to delete message");
      }
    },
    [vendorId],
  );

  const startEditing = useCallback((msg: MessageType) => {
    setEditingMsgId(msg._id);
    setNewMessage(msg.content || "");
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingMsgId(null);
    setNewMessage("");
  }, []);

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
            messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                msg={msg}
                vendorName={vendorName}
                startEditing={startEditing}
                handleDeleteMessage={handleDeleteMessage}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Field */}
        {editingMsgId && (
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 flex items-center justify-between border-t border-blue-200 dark:border-blue-800">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Pencil className="h-3 w-3" /> Editing message
            </span>
            <button
              onClick={cancelEditing}
              className="text-gray-500 hover:text-gray-800 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
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
