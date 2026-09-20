'use client'; // กำหนดให้เป็น Client Component ตามข้อกำหนด[span_1](start_span)[span_1](end_span)

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // import ตาม path และชื่อที่กำหนดเป๊ะๆ[span_2](start_span)[span_2](end_span)[span_3](start_span)[span_3](end_span)

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State สำหรับฟอร์มเพิ่ม/แก้ไขสินค้า[span_4](start_span)[span_4](end_span)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
    stock: '',
    unit: ''
  });

  // State สำหรับดักจับว่ากำลังแก้ไขสินค้า ID ไหนอยู่ (ถ้า null แสดงว่าเป็นโหมดเพิ่มสินค้า)[span_5](start_span)[span_5](end_span)
  const [editingId, setEditingId] = useState(null);

  // ดึงข้อมูลสินค้าทั้งหมดจาก Supabase[span_6](start_span)[span_6](end_span)
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // จัดการการเปลี่ยนแปลงค่าใน input ฟอร์ม
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // เพิ่ม หรือ แก้ไขสินค้า[span_7](start_span)[span_7](end_span)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      sku: formData.sku,
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      unit: formData.unit
    };

    if (editingId) {
      // โหมดแก้ไขสินค้า[span_8](start_span)[span_8](end_span)
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingId);

      if (error) alert('แก้ไขสินค้าไม่สำเร็จ: ' + error.message);
      else setEditingId(null);
    } else {
      // โหมดเพิ่มสินค้าใหม่[span_9](start_span)[span_9](end_span)
      const { error } = await supabase
        .from('products')
        .insert([payload]);

      if (error) alert('เพิ่มสินค้าไม่สำเร็จ: ' + error.message);
    }

    // ล้างฟอร์มและโหลดข้อมูลใหม่
    setFormData({ sku: '', name: '', price: '', stock: '', unit: '' });
    fetchProducts();
  };

  // เตรียมข้อมูลใส่ฟอร์มเพื่อทำการแก้ไข[span_10](start_span)[span_10](end_span)
  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      sku: product.sku || '',
      name: product.name || '',
      price: product.price || '',
      stock: product.stock || '',
      unit: product.unit || ''
    });
  };

  // ยกเลิกการแก้ไข
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ sku: '', name: '', price: '', stock: '', unit: '' });
  };

  // ลบสินค้า[span_11](start_span)[span_11](end_span)
  const handleDelete = async (id) => {
    if (!confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) alert('ลบสินค้าไม่สำเร็จ: ' + error.message);
    else fetchProducts();
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '1rem' }}>จัดการรายการสินค้า</h2>

      {/* ฟอร์มเพิ่ม/แก้ไขสินค้า อยู่ด้านบนตาราง[span_12](start_span)[span_12](end_span) */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
        <input name="sku" placeholder="SKU" value={formData.sku} onChange={handleChange} required style={inputStyle} />
        <input name="name" placeholder="ชื่อสินค้า" value={formData.name} onChange={handleChange} required style={inputStyle} />
        <input name="price" type="number" step="0.01" placeholder="ราคา" value={formData.price} onChange={handleChange} required style={inputStyle} />
        <input name="stock" type="number" placeholder="คงเหลือ" value={formData.stock} onChange={handleChange} required style={inputStyle} />
        <input name="unit" placeholder="หน่วย" value={formData.unit} onChange={handleChange} required style={inputStyle} />
        
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
          <button type="submit" style={btnPrimaryStyle}>
            {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={btnSecondaryStyle}>
              ยกเลิก
            </button>
          )}
        </div>
      </form>

      {/* ตารางแสดงรายการสินค้า[span_13](start_span)[span_13](end_span) */}
      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f3f4f6' }}>
              <th style={thStyle}>SKU</th>
              <th style={thStyle}>ชื่อสินค้า</th>
              <th style={thStyle}>ราคา</th>
              <th style={thStyle}>คงเหลือ</th>
              <th style={thStyle}>หน่วย</th>
              <th style={thStyle}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '1rem', textAlign: 'center' }}>ไม่มีข้อมูลสินค้า</td>
              </tr>
            ) : (
              products.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>{item.sku}</td>
                  <td style={tdStyle}>{item.name}</td>
                  <td style={tdStyle}>{Number(item.price).toLocaleString()}</td>
                  <td style={tdStyle}>{item.stock}</td>
                  <td style={tdStyle}>{item.unit}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEdit(item)} style={btnEditStyle}>แก้ไข</button>
                    <button onClick={() => handleDelete(item.id)} style={btnDeleteStyle}>ลบ</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Style พื้นฐาน[span_14](start_span)[span_14](end_span)
const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' };
const thStyle = { padding: '10px', fontWeight: 'bold' };
const tdStyle = { padding: '10px' };
const btnPrimaryStyle = { padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const btnSecondaryStyle = { padding: '8px 16px', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const btnEditStyle = { padding: '4px 8px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', marginRight: '6px', cursor: 'pointer' };
const btnDeleteStyle = { padding: '4px 8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
export const dynamic = "force-dynamic";
