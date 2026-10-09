'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import {
  MessageSquare,
  Send,
  Search,
  Phone,
  User,
  Clock,
  Circle,
  CheckCircle2,
  MoreVertical,
  Paperclip,
  Smile,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'admin' | 'customer';
  text: string;
  time: string;
  read: boolean;
}

interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerType: 'Personal' | 'Korporat / Kantor' | 'Keluarga';
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: ChatMessage[];
}

const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    customerName: 'Rian Kusuma',
    customerPhone: '+62 812-4491-0021',
    customerType: 'Personal',
    lastMessage: 'Kak, apakah pesanan saya sudah dikirim?',
    lastTime: '09:47',
    unreadCount: 2,
    isOnline: true,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Halo kak! Saya mau tanya pesanan saya nomor ORD-2025091.',
        time: '09:40',
        read: true,
      },
      {
        id: 'm2',
        sender: 'admin',
        text: 'Halo Kak Rian! Pesanan Anda sedang dalam proses pengiriman ya, kurir Budi Santoso sudah dalam perjalanan.',
        time: '09:42',
        read: true,
      },
      {
        id: 'm3',
        sender: 'customer',
        text: 'Oh oke, kira-kira sampai jam berapa ya kak?',
        time: '09:45',
        read: true,
      },
      {
        id: 'm4',
        sender: 'customer',
        text: 'Kak, apakah pesanan saya sudah dikirim?',
        time: '09:47',
        read: false,
      },
    ],
  },
  {
    id: 'conv-2',
    customerName: 'Amanda Wijaya',
    customerPhone: '+62 821-9980-1123',
    customerType: 'Korporat / Kantor',
    lastMessage: 'Kami butuh tambah 5 box untuk besok',
    lastTime: '09:30',
    unreadCount: 1,
    isOnline: true,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Selamat pagi NutriMeal! Saya dari PT Digita Kreasi Nusa.',
        time: '09:20',
        read: true,
      },
      {
        id: 'm2',
        sender: 'admin',
        text: 'Selamat pagi Kak Amanda! Ada yang bisa kami bantu untuk pesanan katering kantor?',
        time: '09:22',
        read: true,
      },
      {
        id: 'm3',
        sender: 'customer',
        text: 'Kami butuh tambah 5 box untuk besok',
        time: '09:30',
        read: false,
      },
    ],
  },
  {
    id: 'conv-3',
    customerName: 'Bambang Prakoso',
    customerPhone: '+62 813-7720-9944',
    customerType: 'Personal',
    lastMessage: 'Terima kasih, makanannya enak sekali!',
    lastTime: '08:15',
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Halo, pesanan saya sudah terima ya.',
        time: '08:10',
        read: true,
      },
      {
        id: 'm2',
        sender: 'admin',
        text: 'Alhamdulillah! Senang mendengarnya Kak Bambang. Selamat menikmati!',
        time: '08:12',
        read: true,
      },
      {
        id: 'm3',
        sender: 'customer',
        text: 'Terima kasih, makanannya enak sekali!',
        time: '08:15',
        read: true,
      },
    ],
  },
  {
    id: 'conv-4',
    customerName: 'dr. Hendra Salim',
    customerPhone: '+62 856-1109-3321',
    customerType: 'Personal',
    lastMessage: 'Tolong pastikan menu saya rendah natrium ya',
    lastTime: 'Kemarin',
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Halo admin, saya punya kondisi medis hipertensi.',
        time: '16:00',
        read: true,
      },
      {
        id: 'm2',
        sender: 'customer',
        text: 'Tolong pastikan menu saya rendah natrium ya',
        time: '16:02',
        read: true,
      },
      {
        id: 'm3',
        sender: 'admin',
        text: 'Tentu Dok! Kami sudah catat di catatan dapur: sangat rendah natrium, maksimal 2g per porsi. Akan kami prioritaskan.',
        time: '16:10',
        read: true,
      },
    ],
  },
  {
    id: 'conv-5',
    customerName: 'Citra Kirana (PT Maju)',
    customerPhone: '+62 821-6577-8898',
    customerType: 'Korporat / Kantor',
    lastMessage: 'Untuk event rapat besok 50 pax konfirmasi dulu',
    lastTime: 'Kemarin',
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Halo NutriMeal, kami dari PT Maju Bersama.',
        time: '14:00',
        read: true,
      },
      {
        id: 'm2',
        sender: 'customer',
        text: 'Untuk event rapat besok 50 pax konfirmasi dulu',
        time: '14:05',
        read: true,
      },
      {
        id: 'm3',
        sender: 'admin',
        text: 'Siap Kak Citra! Kami konfirmasi 50 pax prasmanan buffet set untuk event rapat PT Maju Bersama besok. Tim dapur sudah siap.',
        time: '14:20',
        read: true,
      },
    ],
  },
];

const quickReplies = [
  'Pesanan Anda sedang diproses 🍱',
  'Kurir sedang dalam perjalanan ke lokasi Anda',
  'Terima kasih atas kepercayaan Anda kepada NutriMeal!',
  'Apakah ada catatan diet khusus yang perlu kami perhatikan?',
  'Konfirmasi pesanan berhasil! Estimasi pengiriman sesuai jadwal.',
];

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConvId, setSelectedConvId] = useState<string | null>('conv-1');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConv = conversations.find((c) => c.id === selectedConvId) || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv?.messages]);

  const handleSelectConv = (convId: string) => {
    setSelectedConvId(convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0, messages: c.messages.map((m) => ({ ...m, read: true })) } : c))
    );
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedConvId) return;
    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'admin',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvId
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              lastMessage: inputText.trim(),
              lastTime: newMessage.time,
            }
          : c
      )
    );
    setInputText('');
  };

  const filteredConvs = conversations.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerPhone.includes(searchQuery)
  );

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-800" />
            <span>Chat & CS Pelanggan</span>
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                {totalUnread} Baru
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tangani pertanyaan, konfirmasi pesanan, dan koordinasi pengiriman langsung dengan pelanggan.
          </p>
        </div>
      </div>

      {/* Chat Layout */}
      <div className="flex h-[calc(100vh-220px)] min-h-[500px] bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Sidebar: Conversation List */}
        <div className="w-72 shrink-0 border-r border-slate-100 flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pelanggan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConv(conv.id)}
                className={`w-full text-left px-4 py-3.5 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                  selectedConvId === conv.id ? 'bg-emerald-50 border-l-2 border-l-emerald-700' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-black">
                      {conv.customerName.slice(0, 2).toUpperCase()}
                    </div>
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">{conv.customerName}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">{conv.lastTime}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-1 shrink-0 w-4 h-4 rounded-full bg-emerald-700 text-white text-[9px] font-bold flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={`mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-block ${
                        conv.customerType === 'Korporat / Kantor'
                          ? 'bg-sky-50 text-sky-700'
                          : conv.customerType === 'Keluarga'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {conv.customerType}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        {selectedConv ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-black">
                    {selectedConv.customerName.slice(0, 2).toUpperCase()}
                  </div>
                  {selectedConv.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedConv.customerName}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{selectedConv.customerPhone}</span>
                    <span className="mx-1">•</span>
                    <span className={selectedConv.isOnline ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                      {selectedConv.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${selectedConv.customerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {selectedConv.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'customer' && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-black shrink-0 mr-2 mt-auto">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'admin'
                        ? 'bg-emerald-800 text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${
                        msg.sender === 'admin' ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{msg.time}</span>
                      {msg.sender === 'admin' && (
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" />
                      )}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(reply)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium hover:bg-emerald-50 hover:text-emerald-800 transition-colors border border-slate-200"
                >
                  {reply.length > 35 ? reply.slice(0, 35) + '...' : reply}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <input
                  type="text"
                  placeholder="Ketik balasan katering..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="w-8 h-8 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-400">Pilih percakapan</p>
              <p className="text-xs text-slate-300 mt-1">
                Klik salah satu pelanggan untuk membuka percakapan
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
