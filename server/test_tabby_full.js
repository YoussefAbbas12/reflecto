require('dotenv').config();
const axios = require('axios');

async function testTabbyFull() {
  const payload = {
    payment: {
      amount: "1500",
      currency: "SAR",
      description: "Test Order",
      buyer: { phone: "+966500000001", email: "test@reflecto.com.sa", name: "Test Client", dob: "1990-01-01" },
      shipping_address: { city: "Riyadh", address: "N/A", zip: "11564" },
      order: {
        reference_id: "TEST-" + Date.now(),
        items: [{ title: "Test PPF", quantity: 1, unit_price: "1500", category: "General", reference_id: "ITEM-1", discount_amount: "0.00" }],
        tax_amount: "0.00", shipping_amount: "0.00", discount_amount: "0.00"
      },
      buyer_history: { registered_since: new Date().toISOString(), loyalty_level: 0 }
    },
    lang: 'ar',
    merchant_code: process.env.TABBY_MERCHANT_CODE,
    merchant_urls: {
      success: "https://reflecto.com.sa/checkout/success",
      cancel: "https://reflecto.com.sa/checkout/cancel",
      failure: "https://reflecto.com.sa/checkout/cancel"
    }
  };

  try {
    const res = await axios.post("https://api.tabby.ai/api/v2/checkout", payload, {
      headers: { Authorization: `Bearer ${process.env.TABBY_SECRET_KEY}`, 'Content-Type': 'application/json' }
    });
    console.log('--- FULL TABBY KEYS ---');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Tabby FAILED:', err.response?.status, err.response?.data);
  }
}

testTabbyFull();
