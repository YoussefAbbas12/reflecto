require('dotenv').config();
const axios = require('axios');

const TABBY_BASE_URL = process.env.TABBY_BASE_URL || 'https://api.tabby.ai';
const TAMARA_BASE_URL = process.env.TAMARA_BASE_URL || 'https://api-sandbox.tamara.co';

console.log('=== ENV ===');
console.log('TABBY_BASE_URL:', TABBY_BASE_URL);
console.log('TABBY_SECRET_KEY:', process.env.TABBY_SECRET_KEY ? process.env.TABBY_SECRET_KEY.substring(0, 15) + '...' : 'MISSING');
console.log('TABBY_MERCHANT_CODE:', process.env.TABBY_MERCHANT_CODE);
console.log('TAMARA_BASE_URL:', TAMARA_BASE_URL);
console.log('TAMARA_BEARER_TOKEN:', process.env.TAMARA_BEARER_TOKEN ? process.env.TAMARA_BEARER_TOKEN.substring(0, 15) + '...' : 'MISSING');
console.log('BASE_URL:', process.env.BASE_URL);

async function testTabby() {
  console.log('\n--- Testing Tabby ---');
  const payload = {
    payment: {
      amount: "1500",
      currency: "SAR",
      description: "Test Order",
      buyer: { phone: "+966500000001", email: "test@reflecto.com.sa", name: "Test Client", dob: "1990-01-01" },
      shipping_address: { city: "Riyadh", address: "N/A", zip: "11564" },
      order: {
        reference_id: "TEST-" + Date.now(),
        items: [{ title: "Test PPF", quantity: 1, unit_price: "1500", category: "General", reference_id: "ITEM-1", discount_amount: "0.00", image_url: undefined, product_url: undefined }],
        tax_amount: "0.00", shipping_amount: "0.00", discount_amount: "0.00"
      },
      buyer_history: { registered_since: new Date().toISOString(), loyalty_level: 0 }
    },
    lang: 'ar',
    merchant_code: process.env.TABBY_MERCHANT_CODE,
    merchant_urls: {
      success: `${process.env.BASE_URL}checkout/success`,
      cancel: `${process.env.BASE_URL}checkout/cancel`,
      failure: `${process.env.BASE_URL}checkout/cancel`
    }
  };

  try {
    const res = await axios.post(`${TABBY_BASE_URL}/api/v2/checkout`, payload, {
      headers: { Authorization: `Bearer ${process.env.TABBY_SECRET_KEY}`, 'Content-Type': 'application/json' }
    });
    console.log('Tabby SUCCESS:', JSON.stringify(res.data, null, 2).substring(0, 500));
  } catch (err) {
    console.error('Tabby FAILED:', err.response?.status, JSON.stringify(err.response?.data, null, 2));
  }
}

async function testTamara() {
  console.log('\n--- Testing Tamara ---');
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
      success: `${process.env.BASE_URL}checkout/success`,
      cancel: `${process.env.BASE_URL}checkout/cancel`,
      failure: `${process.env.BASE_URL}checkout/cancel`,
      notification: `${process.env.BASE_URL}webhooks/tamara`
    },
    billing_address: { city: "Riyadh", country_code: "SA", first_name: "Test", last_name: "Client", line1: "N/A", phone_number: "+966500000001" },
    shipping_address: { city: "Riyadh", country_code: "SA", first_name: "Test", last_name: "Client", line1: "N/A", phone_number: "+966500000001" },
    locale: "ar_SA"
  };

  try {
    const res = await axios.post(`${TAMARA_BASE_URL}/checkout`, payload, {
      headers: { Authorization: `Bearer ${process.env.TAMARA_BEARER_TOKEN}`, 'Content-Type': 'application/json' }
    });
    console.log('Tamara SUCCESS:', JSON.stringify(res.data, null, 2).substring(0, 500));
  } catch (err) {
    console.error('Tamara FAILED:', err.response?.status, JSON.stringify(err.response?.data, null, 2));
  }
}

(async () => { await testTabby(); await testTamara(); })();
