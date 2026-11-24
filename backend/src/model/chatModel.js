const pool = require('../lib/db');

// In-Memory fallback store untuk menjamin ketersediaan data jika MySQL offline
let inMemoryConversations = [
  {
    id: 'conv-1',
    customer_id: 'cst-1',
    customer_name: 'Andi Pratama',
    customer_phone: '+62 812-4491-0021',
    customer_type: 'Personal',
    last_message: 'Siap Kak Andi!, catatan zero-waste sudah kami tambahkan 🌱',
    last_time: '10:21',
    unread_count: 0,
    is_online: 1,
    messages: [
      {
        id: 'm1',
        conversation_id: 'conv-1',
        customer_id: 'cst-1',
        sender: 'admin',
        text: 'Halo! 👋 Selamat datang di layanan Customer Care NutriMeal. Ada kendala jadwal pengiriman katering, perubahan alamat, atau konsultasi menu yang bisa kami bantu hari ini?',
        time: '10:15',
        is_read: 1,
      },
      {
        id: 'm2',
        conversation_id: 'conv-1',
        customer_id: 'cst-1',
        sender: 'customer',
        text: 'Halo Kak, besok siang jam 11:30 katering saya mau dialihkan ke kantor di SCBD Lot 18 lantai 12 apa masih sempat diproses? Soalnya pagi ada rapat dadakan.',
        time: '10:17',
        is_read: 1,
      },
      {
        id: 'm3',
        conversation_id: 'conv-1',
        customer_id: 'cst-1',
        sender: 'admin',
        text: 'Tentu bisa Kak Andi! Perubahan alamat makan siang untuk besok kami terima maksimal pukul 19:00 WIB malam ini. Sudah kami catat dan update ke sistem kurir katering ya.',
        time: '10:19',
        is_read: 1,
        ticket: {
          id: 'TKT-8842',
          category: 'Ubah Alamat',
          title: 'Tiket Perubahan Alamat Pengiriman SCBD',
          details: 'Gedung SCBD Lot 18, Lantai 12 (Rapat). Slot: 11:30 - 13:00 WIB',
          status: 'Terverifikasi',
        },
      },
      {
        id: 'm4',
        conversation_id: 'conv-1',
        customer_id: 'cst-1',
        sender: 'customer',
        text: 'Mantap, terima kasih banyak Kak! Kurirnya tolong ingatkan jangan pakai sendok plastik ya, di kantor sudah ada cutlery.',
        time: '10:20',
        is_read: 1,
      },
      {
        id: 'm5',
        conversation_id: 'conv-1',
        customer_id: 'cst-1',
        sender: 'admin',
        text: 'Siap Kak Andi!, catatan zero-waste (tanpa alat makan plastik) sudah kami tambahkan ke slip pengiriman kurir. Selamat beristirahat dan menikmati menu NutriMeal besok! 🌱',
        time: '10:21',
        is_read: 1,
      },
    ],
  },
  {
    id: 'conv-2',
    customer_id: 'cst-2',
    customer_name: 'Amanda Wijaya',
    customer_phone: '+62 821-9980-1123',
    customer_type: 'Korporat / Kantor',
    last_message: 'Kami butuh tambah 5 box untuk besok',
    last_time: '09:30',
    unread_count: 1,
    is_online: 1,
    messages: [
      {
        id: 'm2-1',
        conversation_id: 'conv-2',
        customer_id: 'cst-2',
        sender: 'customer',
        text: 'Selamat pagi NutriMeal! Saya dari PT Digita Kreasi Nusa.',
        time: '09:20',
        is_read: 1,
      },
      {
        id: 'm2-2',
        conversation_id: 'conv-2',
        customer_id: 'cst-2',
        sender: 'admin',
        text: 'Selamat pagi Kak Amanda! Ada yang bisa kami bantu untuk pesanan katering kantor?',
        time: '09:22',
        is_read: 1,
      },
      {
        id: 'm2-3',
        conversation_id: 'conv-2',
        customer_id: 'cst-2',
        sender: 'customer',
        text: 'Kami butuh tambah 5 box untuk besok',
        time: '09:30',
        is_read: 0,
      },
    ],
  },
  {
    id: 'conv-3',
    customer_id: 'cst-3',
    customer_name: 'Bambang Prakoso',
    customer_phone: '+62 813-7720-9944',
    customer_type: 'Personal',
    last_message: 'Terima kasih, makanannya enak sekali!',
    last_time: '08:15',
    unread_count: 0,
    is_online: 0,
    messages: [
      {
        id: 'm3-1',
        conversation_id: 'conv-3',
        customer_id: 'cst-3',
        sender: 'customer',
        text: 'Halo, pesanan saya sudah terima ya.',
        time: '08:10',
        is_read: 1,
      },
      {
        id: 'm3-2',
        conversation_id: 'conv-3',
        customer_id: 'cst-3',
        sender: 'admin',
        text: 'Alhamdulillah! Senang mendengarnya Kak Bambang. Selamat menikmati!',
        time: '08:12',
        is_read: 1,
      },
      {
        id: 'm3-3',
        conversation_id: 'conv-3',
        customer_id: 'cst-3',
        sender: 'customer',
        text: 'Terima kasih, makanannya enak sekali!',
        time: '08:15',
        is_read: 1,
      },
    ],
  },
];

const chatModel = {
  // Ambil semua daftar percakapan (untuk Admin Web)
  async getAllConversations() {
    try {
      const [convRows] = await pool.query(`
        SELECT * FROM chat_conversations ORDER BY updated_at DESC
      `);

      if (convRows.length > 0) {
        // Ambil pesan untuk setiap percakapan
        const convsWithMessages = await Promise.all(
          convRows.map(async (conv) => {
            const [msgRows] = await pool.query(
              `SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC`,
              [conv.id]
            );

            return {
              id: conv.id,
              customerId: conv.customer_id,
              customerName: conv.customer_name,
              customerPhone: conv.customer_phone,
              customerType: conv.customer_type,
              lastMessage: conv.last_message || '',
              lastTime: conv.last_time || '',
              unreadCount: Number(conv.unread_count || 0),
              isOnline: Boolean(conv.is_online),
              messages: msgRows.map((m) => ({
                id: m.id,
                sender: m.sender,
                text: m.text,
                time: m.time,
                read: Boolean(m.is_read),
                ticket: m.ticket_id
                  ? {
                      id: m.ticket_id,
                      category: m.ticket_category,
                      title: m.ticket_title,
                      details: m.ticket_details,
                      status: m.ticket_status,
                    }
                  : undefined,
              })),
            };
          })
        );
        return convsWithMessages;
      }
    } catch (err) {
      console.warn('[chatModel] DB query fallback to memory:', err.message);
    }

    // Fallback format
    return inMemoryConversations.map((c) => ({
      id: c.id,
      customerId: c.customer_id,
      customerName: c.customer_name,
      customerPhone: c.customer_phone,
      customerType: c.customer_type,
      lastMessage: c.last_message,
      lastTime: c.last_time,
      unreadCount: c.unread_count,
      isOnline: Boolean(c.is_online),
      messages: c.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        time: m.time,
        read: Boolean(m.is_read),
        ticket: m.ticket,
      })),
    }));
  },

  // Ambil atau mulai percakapan spesifik untuk customerId (untuk Mobile & Admin)
  async getOrCreateConversation(customerId, customerName = 'Pelanggan NutriMeal', customerPhone = '') {
    const cleanCustId = customerId || 'cst-1';
    let convId = `conv-${cleanCustId}`;

    try {
      const [rows] = await pool.query(
        `SELECT * FROM chat_conversations WHERE customer_id = ? OR id = ? LIMIT 1`,
        [cleanCustId, cleanCustId]
      );

      let convData;
      if (rows.length > 0) {
        convData = rows[0];
        convId = convData.id;
      } else {
        // Buat conversation baru di DB
        await pool.query(
          `INSERT INTO chat_conversations (id, customer_id, customer_name, customer_phone, last_message, last_time, unread_count, is_online)
           VALUES (?, ?, ?, ?, 'Halo! Ada yang bisa kami bantu?', DATE_FORMAT(NOW(), '%H:%i'), 0, 1)`,
          [convId, cleanCustId, customerName, customerPhone]
        );

        // Tambah pesan sambutan awal dari admin
        const welcomeId = `m-${Date.now()}`;
        await pool.query(
          `INSERT INTO chat_messages (id, conversation_id, customer_id, sender, text, time, is_read)
           VALUES (?, ?, ?, 'admin', 'Halo! 👋 Selamat datang di layanan Customer Care NutriMeal. Ada kendala jadwal katering, perubahan alamat, atau konsultasi menu yang bisa kami bantu?', DATE_FORMAT(NOW(), '%H:%i'), 1)`,
          [welcomeId, convId, cleanCustId]
        );

        convData = {
          id: convId,
          customer_id: cleanCustId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_type: 'Personal',
          last_message: 'Halo! Ada yang bisa kami bantu?',
          last_time: 'Baru saja',
          unread_count: 0,
          is_online: 1,
        };
      }

      const [msgRows] = await pool.query(
        `SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC`,
        [convId]
      );

      return {
        id: convData.id,
        customerId: convData.customer_id,
        customerName: convData.customer_name,
        customerPhone: convData.customer_phone,
        customerType: convData.customer_type || 'Personal',
        lastMessage: convData.last_message || '',
        lastTime: convData.last_time || '',
        unreadCount: Number(convData.unread_count || 0),
        isOnline: Boolean(convData.is_online),
        messages: msgRows.map((m) => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          time: m.time,
          read: Boolean(m.is_read),
          ticket: m.ticket_id
            ? {
                id: m.ticket_id,
                category: m.ticket_category,
                title: m.ticket_title,
                details: m.ticket_details,
                status: m.ticket_status,
              }
            : undefined,
        })),
      };
    } catch (err) {
      console.warn('[chatModel] getOrCreateConversation DB fallback:', err.message);
    }

    // Fallback in-memory
    let memConv = inMemoryConversations.find(
      (c) => c.customer_id === cleanCustId || c.id === cleanCustId || c.id === convId
    );

    if (!memConv) {
      memConv = {
        id: convId,
        customer_id: cleanCustId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_type: 'Personal',
        last_message: 'Halo! Ada yang bisa kami bantu?',
        last_time: '10:00',
        unread_count: 0,
        is_online: 1,
        messages: [
          {
            id: `m-${Date.now()}`,
            conversation_id: convId,
            customer_id: cleanCustId,
            sender: 'admin',
            text: 'Halo! 👋 Selamat datang di layanan Customer Care NutriMeal. Ada kendala jadwal katering, perubahan alamat, atau konsultasi menu yang bisa kami bantu?',
            time: '10:00',
            is_read: 1,
          },
        ],
      };
      inMemoryConversations.unshift(memConv);
    }

    return {
      id: memConv.id,
      customerId: memConv.customer_id,
      customerName: memConv.customer_name,
      customerPhone: memConv.customer_phone,
      customerType: memConv.customer_type,
      lastMessage: memConv.last_message,
      lastTime: memConv.last_time,
      unreadCount: memConv.unread_count,
      isOnline: Boolean(memConv.is_online),
      messages: memConv.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        time: m.time,
        read: Boolean(m.is_read),
        ticket: m.ticket,
      })),
    };
  },

  // Simpan pesan baru (baik dari Customer di Mobile atau dari Admin di Web)
  async createMessage({ conversationId, customerId, sender, text, time, ticket, customerName, customerPhone }) {
    const msgId = `m-${Date.now()}`;
    const cleanTime =
      time ||
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    const cleanSender = sender === 'admin' ? 'admin' : 'customer';

    let targetConvId = conversationId;
    if (!targetConvId && customerId) {
      targetConvId = `conv-${customerId}`;
    }

    try {
      // Pastikan percakapan ada
      await this.getOrCreateConversation(customerId || 'cst-1', customerName, customerPhone);

      await pool.query(
        `INSERT INTO chat_messages (id, conversation_id, customer_id, sender, text, time, is_read, ticket_id, ticket_category, ticket_title, ticket_details, ticket_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          msgId,
          targetConvId,
          customerId || 'cst-1',
          cleanSender,
          text,
          cleanTime,
          cleanSender === 'admin' ? 1 : 0,
          ticket?.id || null,
          ticket?.category || null,
          ticket?.title || null,
          ticket?.details || null,
          ticket?.status || null,
        ]
      );

      // Update percakapan induk
      await pool.query(
        `UPDATE chat_conversations
         SET last_message = ?,
             last_time = ?,
             unread_count = CASE WHEN ? = 'customer' THEN unread_count + 1 ELSE unread_count END,
             updated_at = NOW()
         WHERE id = ? OR customer_id = ?`,
        [text, cleanTime, cleanSender, targetConvId, customerId]
      );

      return {
        id: msgId,
        conversationId: targetConvId,
        customerId: customerId || 'cst-1',
        sender: cleanSender,
        text,
        time: cleanTime,
        read: cleanSender === 'admin',
        ticket,
      };
    } catch (err) {
      console.warn('[chatModel] createMessage DB fallback:', err.message);
    }

    // In-memory update
    let memConv = inMemoryConversations.find(
      (c) => c.id === targetConvId || c.customer_id === customerId
    );

    if (!memConv) {
      memConv = {
        id: targetConvId || `conv-${customerId || 'cst-1'}`,
        customer_id: customerId || 'cst-1',
        customer_name: customerName || 'Pelanggan NutriMeal',
        customer_phone: customerPhone || '',
        customer_type: 'Personal',
        last_message: text,
        last_time: cleanTime,
        unread_count: cleanSender === 'customer' ? 1 : 0,
        is_online: 1,
        messages: [],
      };
      inMemoryConversations.unshift(memConv);
    }

    const newMsg = {
      id: msgId,
      conversation_id: memConv.id,
      customer_id: customerId || 'cst-1',
      sender: cleanSender,
      text,
      time: cleanTime,
      is_read: cleanSender === 'admin' ? 1 : 0,
      ticket,
    };

    memConv.messages.push(newMsg);
    memConv.last_message = text;
    memConv.last_time = cleanTime;
    if (cleanSender === 'customer') {
      memConv.unread_count += 1;
    }

    return {
      id: msgId,
      conversationId: memConv.id,
      customerId: memConv.customer_id,
      sender: cleanSender,
      text,
      time: cleanTime,
      read: cleanSender === 'admin',
      ticket,
    };
  },

  // Tandai pesan sebagai dibaca
  async markAsRead(conversationId, readerType = 'admin') {
    try {
      if (readerType === 'admin') {
        await pool.query(
          `UPDATE chat_messages SET is_read = 1 WHERE conversation_id = ? AND sender = 'customer'`,
          [conversationId]
        );
        await pool.query(
          `UPDATE chat_conversations SET unread_count = 0 WHERE id = ?`,
          [conversationId]
        );
      } else {
        await pool.query(
          `UPDATE chat_messages SET is_read = 1 WHERE conversation_id = ? AND sender = 'admin'`,
          [conversationId]
        );
      }
      return true;
    } catch (err) {
      console.warn('[chatModel] markAsRead DB fallback:', err.message);
    }

    const memConv = inMemoryConversations.find((c) => c.id === conversationId);
    if (memConv) {
      if (readerType === 'admin') {
        memConv.unread_count = 0;
        memConv.messages.forEach((m) => {
          if (m.sender === 'customer') m.is_read = 1;
        });
      } else {
        memConv.messages.forEach((m) => {
          if (m.sender === 'admin') m.is_read = 1;
        });
      }
    }
    return true;
  },
};

module.exports = chatModel;
