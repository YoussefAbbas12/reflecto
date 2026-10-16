require('dotenv').config();
const axios = require('axios');

async function testTamaraProd() {
  const token = process.env.TAMARA_BEARER_TOKEN;
  console.log('Testing Tamara with https://api.tamara.co ...');
  const payload = {
    total_amount: { amount: 1500, currency: "SAR" },
    shipping_amount: { amount: 0, currency: "SAR" },
    tax_amount: { amount: 0, currency: "SAR" },
    order_reference_id: "TEST-TAM-" + Date.now(),
    order_number: "TEST-TAM-" + Date.now(),
    items: [{ name: "Test PPF", type: "Physical", reference_id: "ITEM-1", sku: "SKU-TEST", quantity: 1,
      unit_price: { amount: 1500, currency: "SAR" }, tax_amount: { amount: 0, currency: "SAR" },
      discount_amount: { amount: 0, currency: "SAR" }, total_amount: { amount: 1500, currency: "SAR" } }],
    consumer: { email: "test@reflecto.com.sa", first_name: "Test", last_name: "Client", phone_number: "+966500000001" },
    country_code: "SA",
    merchant_url: {
      success: "https://reflecto.com.sa/checkout/success",
      cancel: "https://reflecto.com.sa/checkout/cancel",
      failure: "https://reflecto.com.sa/checkout/cancel",
      notification: "https://reflecto.com.sa/webhooks/tamara"
    },
    billing_address: { city: "Riyadh", country_code: "SA", first_name: "Test", last_name: "Client", line1: "N/A", phone_number: "+966500000001" },
    shipping_address: { city: "Riyadh", country_code: "SA", first_name: "Test", last_name: "Client", line1: "N/A", phone_number: "+966500000001" },
    locale: "ar_SA"
  };

  try {
    const res = await axios.post("https://api.tamara.co/checkout", payload, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    console.log('Tamara SUCCESS:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Tamara FAILED Status:', err.response?.status);
    console.error('Tamara FAILED Data:', JSON.stringify(err.response?.data, null, 2));
  }
}

testTamaraProd();
