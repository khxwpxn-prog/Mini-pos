'use client'; // กำหนดให้เป็น Client Component ตามข้อกำหนด[span_1](start_span)[span_1](end_span)

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; // import ตาม path และชื่อที่กำหนดเป๊ะๆ[span_2](start_span)[span_2](end_span)[span_3](start_span)[span_3](end_span)

export default function SellPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลรายการสินค้าทั้งหมดมาใส่ Dropdown[span_4](start_span)[span_4](end_span)
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

  // ค้นหาสินค้าที่ถูกเลือกเพื่อนำมาคำนวณราคาและเช็ค stock[span_5](start_span)[span_5](end_span)
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // คำนวณยอดรวมอัตโนมัติ (ราคา x จำนวน)[span_6](start_span)[span_6](end_span)
  const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0;

  // จัดการการขายเมื่อกดปุ่ม "ขาย[span_7](start_span)"[span_7](end_span)
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

    // 1. ตรวจสอบว่าจำนวนคงเหลือ (stock) เพียงพอหรือไม่[span_8](start_span)[span_8](end_span)
    if (selectedProduct.stock < sellQty) {
      alert(`สินค้าไม่พอขาย! (คงเหลือในสต็อก: ${selectedProduct.stock} ${selectedProduct.unit})`);
      return;
    }

    setLoading(true);

    try {
      // 2. บันทึกรายการขายลงตาราง sales[span_9](start_span)[span_9](end_span)[span_10](start_span)[span_10](end_span)
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

      // 3. อัปเดต stock ในตาราง products ให้ลดลงตามจำนวนที่ขาย[span_11](start_span)[span_11](end_span)[span_12](start_span)[span_12](end_span)
      const newStock = selectedProduct.stock - sellQty;
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      // 4. แสดงข้อความยืนยันว่าขายสำเร็จ แล้วรีเซ็ตฟอร์ม[span_13](start_span)[span_13](end_span)
      alert('บันทึกการขายสำเร็จ!');
      setSelectedProductId('');
      setQuantity(1);
      fetchProducts(); // โหลดข้อมูลสินค้าใหม่เพื่ออัปเดต stock ล่าสุด
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
        {/* 1. Dropdown เลือกสินค้า[span_14](start_span)[span_14](end_span) */}
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

        {/* 2. ช่องกรอกจำนวนที่จะขาย[span_15](start_span)[span_15](end_span) */}
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

        {/* 3. แสดงยอดรวมอัตโนมัติก่อนกดยืนยัน[span_16](start_span)[span_16](end_span) */}
        <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '6px', textAlign: 'right' }}>
          <span style={{ fontSize: '1rem', color: '#4b5563' }}>ราคารวมทั้งหมด: </span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
            {Number(totalPrice).toLocaleString()} บาท
          </span>
        </div>

        {/* ปุ่มขาย[span_17](start_span)[span_17](end_span) */}
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

// Style พื้นฐาน[span_18](start_span)[span_18](end_span)[span_19](start_span)[span_19](end_span)
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' };
const btnStyle = { padding: '12px', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold' };
