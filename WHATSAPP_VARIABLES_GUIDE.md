# WhatsApp Order Notification Variables Guide

## ✅ Sab Features Kaam Kar Rahe Hain

1. ✅ **Order Status Messages** - Har order status update par WhatsApp notification
2. ✅ **Chatbot** - Incoming messages par automatic replies
3. ✅ **Manual Messages** - Admin se kisi bhi number par message
4. ✅ **Broadcast** - Bulk messages
5. ✅ **Message Templates** - Reusable templates
6. ✅ **Message History** - Sab sent messages ka record

---

## 📝 Order Notification Variables

Order status templates mein yeh variables use kar sakte hain:

### Basic Order Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{order_id}}` | Order number | `1234567` |
| `{{name}}` | Customer name | `John Doe` |
| `{{amount}}` | Order total amount | `₹1500.00` |
| `{{status}}` | Order status | `CONFIRMED`, `SHIPPED`, `DELIVERED` |
| `{{payment_status}}` | Payment status | `PAID`, `PENDING`, `FAILED` |
| `{{items_count}}` | Number of items | `3` |
| `{{order_date}}` | Order date | `17 Jan 2026` |

### Financial Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{subtotal}}` | Subtotal amount | `₹1300.00` |
| `{{gst}}` | GST amount | `₹200.00` |
| `{{shipping}}` | Shipping charges | `₹0.00` |
| `{{coupon_code}}` | Applied coupon code | `SAVE10` |
| `{{coupon_discount}}` | Discount amount | `₹100.00` |

### Shipping Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{tracking_number}}` | Tracking number | `TRACK123456` |
| `{{delivery_date}}` | Expected delivery date | `20 Jan 2026` |

---

## 📋 Order Status Types

Yeh sab order status ke liye templates available hain:

1. **ORDER_PLACED** - Order place hote hi
2. **ORDER_CONFIRMED** - Order confirm hote hi
3. **PAYMENT_SUCCESS** - Payment successful hote hi
4. **PAYMENT_FAILED** - Payment fail hote hi
5. **ORDER_SHIPPED** - Order ship hote hi
6. **OUT_FOR_DELIVERY** - Delivery ke liye nikalte hi
7. **DELIVERED** - Order deliver hote hi
8. **CANCELLED** - Order cancel hote hi
9. **REFUND_INITIATED** - Refund start hote hi
10. **REFUND_COMPLETED** - Refund complete hote hi

---

## 💬 Example Templates

### Order Placed Template
```
Hello {{name}}, your order #{{order_id}} has been placed successfully. 
Total amount: {{amount}}. 
Thank you for shopping with us!
```

### Order Confirmed Template
```
Hello {{name}}, your order #{{order_id}} has been confirmed. 
We're preparing your order for shipment.
```

### Payment Success Template
```
Hello {{name}}, payment of {{amount}} for order #{{order_id}} 
has been received successfully. 
Your order will be processed soon.
```

### Order Shipped Template
```
Hello {{name}}, your order #{{order_id}} has been shipped. 
Tracking: {{tracking_number}}
Expected delivery: {{delivery_date}}
```

### Delivered Template
```
Hello {{name}}, your order #{{order_id}} has been delivered. 
Thank you for shopping with us!
```

### Cancelled Template
```
Hello {{name}}, your order #{{order_id}} has been cancelled. 
If payment was made, refund will be processed within 5-7 business days.
```

### Refund Initiated Template
```
Hello {{name}}, refund of {{amount}} for order #{{order_id}} 
has been initiated. 
It will reflect in your account within 5-7 business days.
```

### Refund Completed Template
```
Hello {{name}}, refund of {{amount}} for order #{{order_id}} 
has been completed. 
Please check your account.
```

---

## 🤖 Chatbot Variables

Chatbot replies mein variables use nahi kar sakte (static messages hain), lekin:
- Keywords se match hoga
- Priority ke basis par check hoga
- Fallback reply agar koi match nahi hua

---

## 📤 Manual Message & Broadcast Variables

Manual messages aur broadcasts mein:
- Custom message directly type kar sakte hain
- Ya template use kar sakte hain
- Template variables manually fill kar sakte hain

---

## ⚙️ Configuration Steps

### 1. Order Status Templates Setup
1. Admin Panel → WhatsApp → Order Notifications tab
2. Har status ke liye template edit karein
3. Variables use karein (e.g., `{{name}}`, `{{order_id}}`)
4. Preview button se test karein
5. Enable toggle on karein
6. Save karein

### 2. Chatbot Setup
1. Admin Panel → WhatsApp → Chatbot tab
2. Enable Chatbot toggle on karein
3. Default Fallback Reply set karein
4. Rules add karein:
   - Keyword: `hello`, `hi`, `help`
   - Bot Reply: `Hello! How can I help you?`
   - Priority: `0`
   - Active: `Yes`

### 3. Test Karein
1. Order create karein → WhatsApp notification aayega
2. Order status update karein → WhatsApp notification aayega
3. WhatsApp se message bhejein → Bot reply aayega

---

## 🔒 Security: X-Webhook-Signature

WASender se webhook signature aata hai:
- Header: `X-Webhook-Signature: c02f8c8474723f5e2b3719af589c1781`
- Abhi optional hai (verification code commented hai)
- Production mein enable kar sakte hain

---

## ✅ Checklist

- [x] Order status notifications configured
- [x] Chatbot rules configured
- [x] Default templates available
- [x] Variables working
- [x] Webhook receiving messages
- [x] Manual messages working
- [x] Broadcast working
- [x] Message history tracking

---

## 🎯 Quick Reference

**Order Notification Variables:**
```
{{order_id}} - Order number
{{name}} - Customer name
{{amount}} - Order total
{{status}} - Order status
{{payment_status}} - Payment status
{{items_count}} - Number of items
{{subtotal}} - Subtotal
{{gst}} - GST
{{shipping}} - Shipping charges
{{coupon_code}} - Coupon code
{{tracking_number}} - Tracking number
{{delivery_date}} - Delivery date
{{order_date}} - Order date
```

**Status Types:**
```
ORDER_PLACED, ORDER_CONFIRMED, PAYMENT_SUCCESS, PAYMENT_FAILED,
ORDER_SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED,
REFUND_INITIATED, REFUND_COMPLETED
```

Sab kuch ready hai! 🚀
