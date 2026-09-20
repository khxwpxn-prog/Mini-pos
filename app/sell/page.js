'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; // import ตาม path ที่กำหนด[span_1](start_span)[span_1](end_span)[span_2](start_span)[span_2](end_span)

export default function SellPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลรายการสินค้าทั้งหมดมาใส่ Dropdown[span_3](start_span)[span_3](end_span)
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ค้นหาสินค้าที่ถูกเลือก[span_4](start_span)[span_4](end_span)
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // คำนวณยอดรวมอัตโนมัติ[span_5](start_span)[span_5](end_span)
  const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0;

  // ฟังก์ชันยิงข้อความเข้า Telegram API
  const sendTelegramNotification = async (message) => {
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('ไม่ได้ตั้งค่า Telegram Bot Token หรือ Chat ID ใน Environment Variables');
      return;
    }

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
    } catch (err) {
      console.error('ส่งข้อความ Telegram ไม่สำเร็จ:', err);
    }
  };

  // จัดการการขายเมื่อกดปุ่ม "ขาย[span_6](start_span)"[span_6](end_span)
  const handleSell = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('กรุณาเลือกสินค้า');
      return;
    }

    const sellQty = parseInt(quantity, 10);

    if (isNaN(sellQty) || sellQty <= 0) {
      alert('กรุณากรอกจำนวนให้ถูกต้อง');
      return;
    }

    // 1. ตรวจสอบว่าสต๊อกเพียงพอหรือไม่[span_7](start_span)[span_7](end_span)
    if (selectedProduct.stock < sellQty) {
      alert(`สินค้าไม่พอขาย! (คงเหลือในสต็อก: ${selectedProduct.stock} ${selectedProduct.unit})`);
      return;
    }

    setLoading(true);

    try {
      // 2. บันทึกรายการขายลงตาราง sales[span_8](start_span)[span_8](end_span)[span_9](start_span)[span_9](end_span)
      const { error: saleError } = await supabase
        .from('sales')
        .insert([
          {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            quantity: sellQty,
            total_price: totalPrice,
            sold_at: new Date().toISOString()
          }
        ]);

      if (saleError) throw saleError;

      // 3. ตัดสต๊อกสินค้าในตาราง products[span_10](start_span)[span_10](end_span)[span_11](start_span)[span_11](end_span)
      const newStock = selectedProduct.stock - sellQty;
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      // 4. งานที่ 1: แจ้งเตือน Order เข้า (New Order Alert)
      const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
      const newOrderMessage = `🛍️ <b>มีรายการขายใหม่!</b>\n` +
        `- สินค้า: ${selectedProduct.name}\n` +
        `- จำนวน: ${sellQty} ${selectedProduct.unit || 'ชิ้น'}\n` +
        `- ราคารวม: ${Number(totalPrice).toLocaleString()} บาท\n` +
        `- สต๊อกคงเหลือปัจจุบัน: ${newStock} ${selectedProduct.unit || 'ชิ้น'}\n` +
        `- เวลา: ${now}`;

      await sendTelegramNotification(newOrderMessage);

      // 5. งานที่ 2: แจ้งเตือน Stock เหลือน้อย (Low Stock Alert)
      if (newStock <= 5) {
        const lowStockMessage = `🚨 <b>[เตือนภัย] สต๊อกสินค้าใกล้หมด!</b>\n` +
          `- สินค้า: ${selectedProduct.name}\n` +
          `- คงเหลือเพียง: ${newStock} ${selectedProduct.unit || 'ชิ้น'}\n` +
          `⚠️ กรุณาเติมสต๊อกสินค้าด่วน!`;

        await sendTelegramNotification(lowStockMessage);
      }

      // 6. แจ้งเตือนขายสำเร็จและรีเซ็ตฟอร์ม[span_12](start_span)[span_12](end_span)
      alert('บันทึกการขายและส่งการแจ้งเตือนสำเร็จ!');
      setSelectedProductId('');
      setQuantity(1);
      fetchProducts();
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการขาย: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>ระบบขายสินค้า (Sell)</h2>

      <form onSubmit={handleSell} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>เลือกสินค้า:</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">-- กรุณาเลือกสินค้า --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (ราคา: {Number(p.price).toLocaleString()} บาท | เหลือ: {p.stock} {p.unit})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>จำนวน:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '6px', textAlign: 'right' }}>
          <span style={{ fontSize: '1rem', color: '#4b5563' }}>ราคารวมทั้งหมด: </span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
            {Number(totalPrice).toLocaleString()} บาท
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...btnStyle,
            backgroundColor: loading ? '#9ca3af' : '#16a34a',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'กำลังบันทึก...' : 'ขายสินค้า'}
        </button>
      </form>
    </div>
  );
}

// Style พื้นฐาน[span_13](start_span)[span_13](end_span)[span_14](start_span)[span_14](end_span)
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' };
const btnStyle = { padding: '12px', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold' };
