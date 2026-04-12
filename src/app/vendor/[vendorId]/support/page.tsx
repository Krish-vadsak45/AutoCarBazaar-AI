"use client";

import { useEffect, useState, useRef, use, useCallback, memo } from "react";
import axios from "axios";
import {
  Loader2,
  Send,
  ShieldAlert,
  CheckCheck,
  Check,
  User,
  Pencil,
  Trash2,
  X,
  Plus,
  Image as ImageIcon,
  Film,
  File as FileIcon,
  Mic,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { toast } from "react-toastify";
import Loading from "@/components/Loading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { canUseRichSupportChat } from "@/lib/vip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lock } from "lucide-react";

interface MessageType {
  _id: string;
  sender: "ADMIN" | "VENDOR";
  type: "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "AUDIO";
  content?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  isRead: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
}

const MessageBubble = memo(
  ({
    msg,
    startEditing,
    handleDeleteMessage,
  }: {
    msg: MessageType;
    startEditing: (msg: MessageType) => void;
    handleDeleteMessage: (id: string) => void;
  }) => {
    const isVendor = msg.sender === "VENDOR";

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
              className="flex items-center gap-2 p-2 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <FileIcon className="h-4 w-4" />
              <span className="truncate max-w-[180px] text-xs font-medium">
                {msg.fileName || "File"}
              </span>
            </a>
          );
        default:
          return (
            <span className="whitespace-pre-wrap leading-relaxed inline-block">
              {msg.content}
            </span>
          );
      }
    };

    return (
      <div
        className={`flex w-full mb-2 group ${
          isVendor ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`flex items-end gap-2 max-w-[85%] ${
            isVendor ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div
            className={`relative px-4 py-2 text-sm shadow-sm flex flex-col ${
              msg.type !== "TEXT" ? "p-1" : "px-4 py-2"
            } ${
              msg.isDeleted
                ? "bg-gray-100 dark:bg-gray-800 text-gray-500 italic rounded-2xl"
                : isVendor
                  ? "bg-[#D9FDD3] dark:bg-[#005C4B] text-foreground rounded-2xl rounded-tr-none"
                  : "bg-background border border-border rounded-2xl rounded-tl-none pl-10"
            }`}
          >
            {!isVendor && (
              <div className="absolute left-2 top-2 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                <img
                  src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {!isVendor && (
              <span className="text-[10px] font-bold uppercase text-[#075E54] dark:text-[#00A884] mb-1 block">
                Admin Team
              </span>
            )}

            <div className="mb-1">
              {renderContent()}
              {msg.isEdited && !msg.isDeleted && msg.type === "TEXT" && (
                <span className="ml-2 text-[10px] italic opacity-70">
                  (edited)
                </span>
              )}
            </div>

            {/* Timestamp & Read Receipts */}
            <div
              className={`text-[10px] flex items-center justify-end gap-1 px-1 ${isVendor ? "text-gray-500 dark:text-gray-300" : "text-gray-400"}`}
            >
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {isVendor && msg.isRead ? (
                <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" /> // WhatsApp Blue
              ) : isVendor && !msg.isRead ? (
                <Check className="h-3.5 w-3.5 text-gray-400" /> // Sent Gray Tick
              ) : null}
            </div>
          </div>

          {/* Action Menu (Delete/Edit) */}
          {!msg.isDeleted && isVendor && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mb-2">
              {msg.type === "TEXT" && (
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

export default function VendorSupportPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = use(params);

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [priority, setPriority] = useState<number>(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch priority
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const { data } = await axios.get(`/api/vendor/status`);
        setPriority(data.priority || 1);
      } catch (e) {
        console.error("Failed to fetch vendor priority", e);
      }
    };
    fetchVendor();
  }, []);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: MessageType["type"],
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!canUseRichSupportChat(priority)) {
      sonnerToast.error("Uploads are a VIP feature. Upgrade to Priority 2+");
      return;
    }

    try {
      setUploading(true);
      const uploadToast = sonnerToast.loading(
        `Uploading ${type.toLowerCase()}...`,
      );

      // 1. Get Authentication Parameters from your backend
      const authRes = await fetch("/api/imagekit-auth");
      if (!authRes.ok) throw new Error("ImageKit Auth failed");
      const authData = await authRes.json();

      // 2. Prepare Form Data for direct upload to ImageKit
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append(
        "publicKey",
        authData.publicKey || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
      );
      formData.append("signature", authData.authenticationParameters.signature);
      formData.append(
        "expire",
        authData.authenticationParameters.expire.toString(),
      );
      formData.append("token", authData.authenticationParameters.token);
      formData.append("useUniqueFileName", "true");
      formData.append("folder", "/vendor-support");

      // 3. Upload to ImageKit API directly to avoid large payloads to Next.js
      const uploadRes = await fetch(
        `https://upload.imagekit.io/api/v1/files/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.message || "Upload to ImageKit failed");
      }

      const uploadResult = await uploadRes.json();
      const fileUrl = uploadResult.url;

      // 4. Send Message to your backend
      const res = await axios.post(`/api/messages/${vendorId}`, {
        sender: "VENDOR",
        type,
        fileUrl: fileUrl,
        fileName: file.name,
      });

      // Optimistic/Immediate UI update
      setMessages((prev) => [...prev, res.data]);

      sonnerToast.dismiss(uploadToast);
      sonnerToast.success("Sent successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      sonnerToast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRichClick = (type: MessageType["type"]) => {
    if (!isRichEnabled) {
      toast.info(
        "Rich media (Images, Video, File, Audio) required VIP level 2 or higher (priority > 1).",
        { autoClose: 6000 },
      );
      return;
    }

    const idMap: Record<string, string> = {
      IMAGE: "img-upload",
      VIDEO: "vid-upload",
      FILE: "file-upload",
      AUDIO: "aud-upload",
    };

    (document.getElementById(idMap[type]) as HTMLInputElement)?.click();
  };

  const isRichEnabled = canUseRichSupportChat(priority);

  // Poll for messages
  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `/api/messages/${vendorId}?markRead=VENDOR`,
        );
        if (isMounted) setMessages(res.data);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMessages();

    // Establish Server-Sent Events (SSE) connection for instant messages (0 load push)
    const eventSource = new EventSource(`/api/messages/${vendorId}/stream`);

    eventSource.addEventListener("update", () => {
      if (isMounted) fetchMessages();
    });

    eventSource.onerror = (err) => {
      console.error("SSE Connection Error:", err);
      eventSource.close(); // Clean up if it fails, fallback to 15s polling below
    };

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchMessages();
      }
    }, 15000); // Polling every 15 seconds mostly when active

    return () => {
      isMounted = false;
      clearInterval(interval);
      eventSource.close();
    };
  }, [vendorId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim()) return;

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
          sonnerToast.success("Message edited");
        } else {
          // Handle Send
          const res = await axios.post(`/api/messages/${vendorId}`, {
            sender: "VENDOR",
            type: "TEXT",
            content: newMessage,
          });
          setMessages((prev) => [...prev, res.data]);
        }
        setNewMessage("");
      } catch (err) {
        sonnerToast.error(
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
        sonnerToast.success("Message deleted");
      } catch (err) {
        sonnerToast.error("Failed to delete message");
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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-primary" /> AI Support & Admin
          Q&A
        </h1>
        <p className="text-muted-foreground mt-2">
          Direct communication channel with AutoCarBazaar Platform
          Administrators.
        </p>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Chat History Window */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-muted/10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-70">
              <ShieldAlert className="h-12 w-12 mb-3 text-muted-foreground" />
              <p>
                No messages yet. Send a question to the admin to get started.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                msg={msg}
                startEditing={startEditing}
                handleDeleteMessage={handleDeleteMessage}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
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
        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-background border-t border-border flex items-center gap-3"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-blue-500 rounded-full hover:bg-black/5 flex-shrink-0 relative"
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    {!isRichEnabled && (
                      <div className="absolute top-0 right-0 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 p-0.5 pointer-events-none">
                        <Lock className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 mb-2">
              <DropdownMenuItem
                className="gap-3 cursor-pointer"
                onClick={() => handleRichClick("IMAGE")}
              >
                <div className="flex items-center gap-3 flex-1">
                  <ImageIcon className="h-4 w-4 text-purple-500" />
                  <span>Image</span>
                </div>
                {!isRichEnabled && (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-3 cursor-pointer"
                onClick={() => handleRichClick("VIDEO")}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Film className="h-4 w-4 text-pink-500" />
                  <span>Video</span>
                </div>
                {!isRichEnabled && (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-3 cursor-pointer"
                onClick={() => handleRichClick("FILE")}
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileIcon className="h-4 w-4 text-blue-500" />
                  <span>Document</span>
                </div>
                {!isRichEnabled && (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-3 cursor-pointer"
                onClick={() => handleRichClick("AUDIO")}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Mic className="h-4 w-4 text-orange-500" />
                  <span>Audio</span>
                </div>
                {!isRichEnabled && (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hidden functional inputs moved outside the dropdown for native reliability */}
          <input
            id="img-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, "IMAGE")}
          />
          <input
            id="vid-upload"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, "VIDEO")}
          />
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={(e) => handleFileUpload(e, "FILE")}
          />
          <input
            id="aud-upload"
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, "AUDIO")}
          />

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your question or issue here..."
            className="flex-1 bg-muted/20"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={
              sending || (!newMessage.trim() && !editingMsgId) || uploading
            }
            className="rounded-full shadow-md gap-2"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
