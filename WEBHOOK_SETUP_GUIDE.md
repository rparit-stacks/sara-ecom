# WhatsApp Webhook Setup Guide (Local Testing)

## Step 1: ngrok Install Karein

### Windows:
1. https://ngrok.com/download se download karein
2. Ya PowerShell mein:
   ```powershell
   winget install ngrok
   ```
3. Ya Chocolatey se:
   ```powershell
   choco install ngrok
   ```

### Mac:
```bash
brew install ngrok
```

### Linux:
```bash
# Download and extract
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

## Step 2: ngrok Account Banayein (Free)

1. https://ngrok.com/signup par jayein
2. Free account banayein
3. Dashboard se **authtoken** copy karein

## Step 3: ngrok Configure Karein

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

## Step 4: Backend Server Start Karein

Apna Spring Boot server start karein:
```bash
cd ecom-backend
./mvnw spring-boot:run
```

Ya IDE se run karein. Server `http://localhost:8080` par chalega.

## Step 5: ngrok Tunnel Start Karein

**Pehle check karein ki koi existing tunnel chal raha hai:**

### Option A: Existing Tunnel Stop Karein
```bash
# Windows PowerShell
Get-Process ngrok | Stop-Process

# Ya Task Manager mein ngrok process end karein
```

### Option B: Different Port Use Karein
Agar aapka backend different port par chal raha hai:
```bash
ngrok http 8081
```

### Option C: Pooling Enable Karein (Multiple Tunnels)
```bash
ngrok http 8080 --pooling-enabled
```

**New terminal/command prompt** mein:

```bash
ngrok http 8080
```

**Agar error aaye "endpoint already online":**
1. Pehle existing ngrok process stop karein
2. Ya different port use karein
3. Ya `--pooling-enabled` flag use karein

Output aayega:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:8080
```

**Important:** `https://abc123.ngrok-free.app` yeh aapka public URL hai.

## Step 6: WASender Website Pe Webhook Configure Karein

1. WASender dashboard mein jayein: https://wasenderapi.com
2. **Webhooks** ya **Settings** section mein jayein
3. Webhook URL add karein:
   ```
   https://YOUR_NGROK_URL.ngrok-free.app/api/whatsapp/webhook
   ```
   
   Example:
   ```
   https://abc123.ngrok-free.app/api/whatsapp/webhook
   ```

4. Webhook events select karein:
   - ✅ Incoming messages
   - ✅ Message received
   - ✅ Message status

5. **Save** karein

## Step 7: Webhook Test Karein

### Option 1: WASender Dashboard Se Test
- WASender dashboard mein "Test Webhook" button use karein

### Option 2: Manual Test
Postman ya curl se:
```bash
curl -X POST https://YOUR_NGROK_URL.ngrok-free.app/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+919876543210",
    "message": "hello"
  }'
```

### Option 3: WhatsApp Se Test
- Apne connected WhatsApp number se message bhejein
- Bot reply aana chahiye (agar chatbot enabled hai)

## Step 8: ngrok Web Interface (Optional)

ngrok tunnel chalne ke dauran, browser mein:
```
http://localhost:4040
```
Yeh ngrok web interface hai jahan aap:
- All requests dekh sakte hain
- Request/Response details dekh sakte hain
- Replay requests kar sakte hain

## Important Notes:

1. **ngrok URL Change Hota Hai:**
   - Free ngrok account mein har baar restart par URL change hota hai
   - Fixed URL ke liye paid plan le sakte hain
   - Ya har baar WASender mein update karna padega

2. **ngrok Tunnel Band Mat Karein:**
   - Tunnel band hone par webhook kaam nahi karega
   - Server restart karte waqt ngrok bhi restart karein

3. **Alternative: ngrok with Fixed Domain (Paid)**
   ```bash
   ngrok http 8080 --domain=your-fixed-domain.ngrok.app
   ```

4. **Production Ke Liye:**
   - Production mein ngrok use mat karein
   - Proper domain aur SSL certificate use karein
   - Webhook URL: `https://yourdomain.com/api/whatsapp/webhook`

## Troubleshooting:

### Webhook nahi aa raha:
1. ngrok tunnel running hai ya nahi check karein
2. Backend server running hai ya nahi check karein
3. ngrok web interface (localhost:4040) mein requests dekh sakte hain
4. WASender dashboard mein webhook status check karein

### 404 Error:
- Webhook URL sahi hai ya nahi verify karein
- `/api/whatsapp/webhook` endpoint public hai (SecurityConfig mein check karein)

### 500 Error:
- Backend logs check karein
- Database connection check karein
- Chatbot service properly configured hai ya nahi

## Quick Commands:

```bash
# ngrok start
ngrok http 8080

# ngrok with custom domain (paid)
ngrok http 8080 --domain=your-domain.ngrok.app

# ngrok status check
curl http://localhost:4040/api/tunnels
```

## Webhook URL Format:

**Local Testing:**
```
https://YOUR_NGROK_URL.ngrok-free.app/api/whatsapp/webhook
```

**Production:**
```
https://yourdomain.com/api/whatsapp/webhook
```
