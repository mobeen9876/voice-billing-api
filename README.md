# 🎙️ Voice Billing AI — API

## What Is This?

This is a **REST API** built with **Node.js and Express** that acts as a smart billing system for mobile phone accessory shops.

Instead of typing product names manually, the shopkeeper can just speak or type naturally in **Hinglish** (Hindi + English mix) like:

> "Teen Oppo A56 Glass, Do Charger, Ek Type C Cable"

And the system will understand:
- **Teen** = 3 quantity
- **Do** = 2 quantity  
- **Ek** = 1 quantity
- Extract brand, model, category for each item
- Search the product database
- Generate a complete invoice automatically

---

## How Was It Built — Technology Used

| Technology | Why We Used It |
|-----------|----------------|
| **Node.js** | Server-side JavaScript runtime |
| **Express 4** | Web framework to create API routes |
| **MongoDB** | Database to store products, invoices, aliases |
| **Mongoose** | MongoDB ODM — makes database queries easier |
| **OpenAI GPT** | AI brain — understands Hinglish and extracts product info |
| **Nodemon** | Auto-restarts server when you change code |
| **dotenv** | Reads secret keys from .env file |

---

## Project Structure — What Each File Does

```
voice-billing-api/
│
├── server.js                  → Entry point. Starts the server, connects MongoDB, loads all routes
├── .env                       → Secret keys (MongoDB URL, OpenAI API key)
├── package.json               → Project info and installed packages
│
└── src/
    │
    ├── db/
    │   └── database.js        → Connects to MongoDB using Mongoose
    │
    ├── models/                → MongoDB data structures (like table schemas)
    │   ├── Product.js         → Product model: brand, model, category, name, price
    │   ├── Invoice.js         → Invoice model: invoice_no, items, subtotal, total
    │   └── Alias.js           → Alias model: alias word, what it maps to, type
    │
    ├── services/              → Core business logic (the brain of the app)
    │   ├── parserService.js   → Sends text to OpenAI, gets back structured products
    │   ├── productService.js  → Search products, score confidence, create/update products
    │   ├── invoiceService.js  → Build invoice preview, save invoice to DB
    │   └── aliasService.js    → Save/get/delete learned word aliases
    │
    ├── controllers/           → Handle HTTP requests and responses
    │   ├── parserController.js    → Receives text, calls parserService, returns JSON
    │   ├── productController.js   → CRUD for products + search endpoint
    │   ├── invoiceController.js   → Build and save invoices
    │   └── aliasController.js     → Add/list/delete aliases
    │
    └── routes/                → URL paths that connect to controllers
        ├── parserRoutes.js        → POST /api/parse
        ├── productRoutes.js       → GET|POST /api/products and /api/products/search
        ├── invoiceRoutes.js       → GET|POST /api/invoices
        └── aliasRoutes.js         → GET|POST|DELETE /api/aliases
```

---

## How the Code Flows — Step by Step

### When you POST to /api/parse:

```
Postman sends text
      ↓
parserRoutes.js         → receives the request at POST /api/parse
      ↓
parserController.js     → validates the request body has "text" field
      ↓
parserService.js        → sends text to OpenAI GPT with a prompt:
                          "Extract brand, model, category, quantity from this Hinglish text"
      ↓
OpenAI returns JSON     → [{brand:"Oppo", model:"A56", category:"Glass", quantity:3}, ...]
      ↓
Response sent back      → you see the parsed products in Postman
```

### When you POST to /api/products/search:

```
Postman sends text
      ↓
productController.js    → calls parseInput() then searchAllProducts()
      ↓
parserService.js        → OpenAI extracts products from text
      ↓
productService.js       → searches MongoDB for each product in PARALLEL
                          scores each result with confidence %:
                          - category match = 50 points
                          - brand match    = 30 points
                          - model match    = 20 points
      ↓
Confidence Engine       → ≥95% = auto selected
                          80-94% = show alternatives (clarify)
                          <80% = not found
      ↓
Response sent back      → you see decision + confidence for each product
```

### When you POST to /api/invoices/save:

```
Postman sends items array with product_id and quantity
      ↓
invoiceController.js    → loops through each item
                          fetches product from MongoDB by _id
                          gets the price from DB (not from user input - secure)
      ↓
invoiceService.js       → calculates: quantity × price = line total
                          adds all line totals = subtotal = total
                          generates unique invoice number: INV-2026-07-03-4821
      ↓
MongoDB saves           → invoice document with all items embedded inside it
      ↓
Response sent back      → full invoice with invoice_no, items, total
```

---

## How OpenAI Is Used

The parser sends this kind of prompt to GPT:

```
You are a retail billing assistant for a mobile phone accessories shop in India.
The user speaks in Hinglish (Hindi + English mix).

Extract all products from: "Teen Oppo A56 Glass, Do Charger, Ek Type C Cable"

Return ONLY a JSON array like:
[{"brand":"Oppo","model":"A56","category":"Glass","quantity":3}]
```

GPT reads the Hinglish, understands the numbers, fixes spelling mistakes, and returns clean JSON.

If OpenAI fails or the key is missing, the system automatically falls back to a rule-based dictionary (Teen→3, Do→2, Opp→Oppo etc.).

---

## MongoDB Collections (What Gets Stored)

### products collection
```json
{
  "_id": "6a47be8737732965d9541de3",
  "brand": "Oppo",
  "model": "A56",
  "category": "Glass",
  "name": "Oppo A56 Glass",
  "price": 250,
  "createdAt": "2026-07-03T13:52:07.630Z"
}
```

### invoices collection
```json
{
  "_id": "...",
  "invoice_no": "INV-2026-07-03-4821",
  "items": [
    { "product_name": "Oppo A56 Glass", "quantity": 3, "price": 250, "total": 750 },
    { "product_name": "Charger 35W Original", "quantity": 2, "price": 650, "total": 1300 },
    { "product_name": "Type C Cable Original", "quantity": 1, "price": 120, "total": 120 }
  ],
  "subtotal": 2170,
  "total": 2170,
  "status": "saved"
}
```

### aliases collection
```json
{
  "alias": "opp",
  "mapped_to": "Oppo",
  "type": "brand"
}
```

---

## How to Run

### 1. Make sure MongoDB is running
Open **MongoDB Compass** and connect to `mongodb://localhost:27017`

### 2. Add your OpenAI key to .env
```
OPENAI_API_KEY=sk-your-key-here
```

### 3. Start the server
```bash
cd voice-billing-api
npm run server
```

You should see:
```
✅ MongoDB connected: localhost
🚀 Server running at http://localhost:3000
```

---

## Testing in Postman — Full Step by Step

> In Postman: always set Body → raw → JSON for POST requests

---

### STEP 1 — Health Check (confirm server is running)
```
Method: GET
URL: http://localhost:3000/
```
Expected response:
```json
{ "message": "🎙️ Voice Billing API is running!", "database": "MongoDB" }
```

---

### STEP 2 — Parse Text (test OpenAI understanding)
```
Method: POST
URL: http://localhost:3000/api/parse
```
```json
{
  "text": "Teen Oppo A56 Glass, Do Charger, Ek Type C Cable"
}
```
Expected response:
```json
{
  "success": true,
  "parsed_count": 3,
  "products": [
    { "brand": "Oppo", "model": "A56", "category": "Glass", "quantity": 3 },
    { "brand": null, "model": null, "category": "Charger", "quantity": 2 },
    { "brand": null, "model": null, "category": "Type C Cable", "quantity": 1 }
  ]
}
```

---

### STEP 3 — Add Product 1 (Oppo A56 Glass)
```
Method: POST
URL: http://localhost:3000/api/products
```
```json
{
  "brand": "Oppo",
  "model": "A56",
  "category": "Glass",
  "name": "Oppo A56 Glass",
  "price": 250
}
```

### STEP 4 — Add Product 2 (Charger)
```
Method: POST
URL: http://localhost:3000/api/products
```
```json
{
  "category": "Charger",
  "name": "Charger 35W Original",
  "price": 650
}
```

### STEP 5 — Add Product 3 (Type C Cable)
```
Method: POST
URL: http://localhost:3000/api/products
```
```json
{
  "category": "Type C Cable",
  "name": "Type C Cable Original",
  "price": 120
}
```

---

### STEP 6 — List All Products (copy the _id values)
```
Method: GET
URL: http://localhost:3000/api/products
```
You will get back all products with their `_id`. Copy those IDs — you need them for the invoice.

---

### STEP 7 — Search + Confidence Engine
```
Method: POST
URL: http://localhost:3000/api/products/search
```
```json
{
  "text": "Teen Oppo A56 Glass, Do Charger, Ek Type C Cable"
}
```
Expected: each product shows `"decision": "auto_selected"` with a confidence score.

---

### STEP 8 — Build Invoice Preview (does NOT save)
```
Method: POST
URL: http://localhost:3000/api/invoices/build
```
```json
{
  "items": [
    { "product_id": "PASTE_OPPO_GLASS_ID", "quantity": 3 },
    { "product_id": "PASTE_CHARGER_ID", "quantity": 2 },
    { "product_id": "PASTE_TYPEC_ID", "quantity": 1 }
  ]
}
```
Expected total: 3×250 + 2×650 + 1×120 = **2170**

---

### STEP 9 — Save Invoice
```
Method: POST
URL: http://localhost:3000/api/invoices/save
```
Same body as Step 8. This saves permanently to MongoDB.

---

### STEP 10 — View All Invoices
```
Method: GET
URL: http://localhost:3000/api/invoices
```

### STEP 11 — View Single Invoice
```
Method: GET
URL: http://localhost:3000/api/invoices/PASTE_INVOICE_ID
```

---

### STEP 12 — Teach the System a New Word (Alias)
```
Method: POST
URL: http://localhost:3000/api/aliases
```
```json
{
  "alias": "samsng",
  "mapped_to": "Samsung",
  "type": "brand"
}
```
Type options: `number` | `brand` | `category`

More examples:
```json
{ "alias": "paanch", "mapped_to": "5", "type": "number" }
{ "alias": "glss", "mapped_to": "Glass", "type": "category" }
```

### View All Aliases
```
Method: GET
URL: http://localhost:3000/api/aliases
```

### Delete an Alias
```
Method: DELETE
URL: http://localhost:3000/api/aliases/PASTE_ALIAS_ID
```

---

### Update a Product Price
```
Method: PUT
URL: http://localhost:3000/api/products/PASTE_PRODUCT_ID/price
```
```json
{ "price": 300 }
```

---

## All API Endpoints at a Glance

| Method | URL | What it does |
|--------|-----|-------------|
| GET | `/` | Health check |
| POST | `/api/parse` | Parse Hinglish text with OpenAI |
| GET | `/api/products` | List all products |
| POST | `/api/products` | Add new product |
| GET | `/api/products/:id` | Get single product |
| PUT | `/api/products/:id/price` | Update product price |
| POST | `/api/products/search` | Search + confidence engine |
| GET | `/api/invoices` | List all invoices |
| POST | `/api/invoices/build` | Preview invoice (no save) |
| POST | `/api/invoices/save` | Save invoice to DB |
| GET | `/api/invoices/:id` | Get single invoice with items |
| GET | `/api/aliases` | List all learned aliases |
| POST | `/api/aliases` | Add new alias |
| DELETE | `/api/aliases/:id` | Delete alias |

---

## Built-in Hinglish Number Words

| Word | Number |
|------|--------|
| Ek, Ik, One | 1 |
| Do, Two | 2 |
| Teen, Tin, Three | 3 |
| Char, Four | 4 |
| Paanch, Five | 5 |
| Chhe, Six | 6 |
| Saat, Seven | 7 |
| Aath, Eight | 8 |
| Nau, Nine | 9 |
| Das, Ten | 10 |
