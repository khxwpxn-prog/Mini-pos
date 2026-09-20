  // ฟังก์ชันยิงผ่าน API ตัวกลาง (แก้ CORS และปลอดภัยขึ้น)
  const sendTelegramNotification = async (message) => {
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const resData = await res.json();

      if (!resData.ok) {
        alert(`❌ Telegram Error: ${resData.description}`);
      }
    } catch (err) {
      console.error('ส่งข้อความ Telegram ไม่สำเร็จ:', err);
      alert('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };
