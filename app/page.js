'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

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
      setFetchError(error.message);
    } else {
      setProducts(data || []);
      setFetchError(null);
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

      {fetchError && (
        <p style={{ color: 'red', marginBottom: '1rem', padding: '10px', background: '#fee2e2', borderRadius: '4px' }}>
          Error: {fetchError}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
        <input name="sku" placeholder="SKU" value={formData.sku} onChange={handleChange} required style={inputStyle} />
        <input name="name" placeholder="ชื่อสินค้า" value={formData.name} onChange={handleChange} required style={inputStyle} />
        <input name="price" type="number" step="0.01" placeholder="ราคา" value={formData.price} onChange={handleChange} required style={inputStyle} />
        <input name="stock" type="number" placeholder="คงเหลือ" value={formData.stock} onChange={handleChange} required style={inputStyle} />
        
