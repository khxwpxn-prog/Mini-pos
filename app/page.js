'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
    stock: '',
    unit: ''
  });

  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingId);

      if (error) alert('แก้ไขสินค้าไม่สำเร็จ: ' + error.message);
      else setEditingId(null);
    } else {
      const { error } = await supabase
        .from('products')
        .insert([payload]);

      if (error) alert('เพิ่มสินค้าไม่สำเร็จ: ' + error.message);
    }

    setFormData({ sku: '', name: '', price: '', stock: '', unit: '' });
    fetchProducts();
  };

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

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ sku: '', name: '', price: '', stock: '', unit: '' });
  };

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
                    <button onClick={() => handleDelete(item.id)} style={btnDeleteStyle}>ลบ
