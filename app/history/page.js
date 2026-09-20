 'use client'; // กำหนดให้เป็น Client Component ตามข้อกำหนด[span_1](start_span)[span_1](end_span)

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; // import ตาม path และชื่อที่กำหนดเป๊ะๆ[span_2](start_span)[span_2](end_span)[span_3](start_span)[span_3](end_span)

export default function HistoryPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลประวัติการขายจากตาราง sales เรียงจากล่าสุดไปเก่าสุด[span_4](start_span)[span_4](end_span)
  const fetchSalesHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('sold_at', { ascending: false }); // order by sold_at desc[span_5](start_span)[span_5](end_span)[span_6](start_span)[span_6](end_span)

    if (error) {
      console.error('Error fetching sales history:', error);
    } else {
      setSales(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  // คำนวณยอดขายรวมทั้งหมด (sum ของ total_price)[span_7](start_span)[span_7](end_span)
  const grandTotal = sales.reduce((sum, item) => sum + Number(item.total_price || 0), 0);

  // ฟังก์ชันจัดรูปแบบวันเวลาให้อ่านง่าย
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '1rem' }}>ประวัติการขาย</h2>

      {/* สรุปยอดขายรวมทั้งหมด แสดงไว้ด้านบนตาราง[span_8](start_span)[span_8](end_span) */}
      <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#166534' }}>ยอดขายรวมทั้งหมด</span>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>
          {grandTotal.toLocaleString()} บาท
        </span>
      </div>

      {/* ตารางแสดงประวัติการขาย[span_9](start_span)[span_9](end_span) */}
      {loading ? (
        <p>กำลังโหลดข้อมูลประวัติการขาย...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f3f4f6' }}>
              <th style={thStyle}>วันเวลาที่ขาย</th>
              <th style={thStyle}>ชื่อสินค้า</th>
              <th style={thStyle}>จำนวน</th>
              <th style={thStyle}>ยอดรวม (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>ยังไม่มีประวัติการขาย</td>
              </tr>
            ) : (
              sales.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>{formatDate(item.sold_at)}</td>
                  <td style={tdStyle}>{item.product_name}</td>
                  <td style={tdStyle}>{item.quantity}</td>
                  <td style={tdStyle}>{Number(item.total_price).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Style พื้นฐาน[span_10](start_span)[span_10](end_span)[span_11](start_span)[span_11](end_span)
const thStyle = { padding: '10px', fontWeight: 'bold' };
const tdStyle = { padding: '10px' };
export const dynamic = "force-dynamic";
