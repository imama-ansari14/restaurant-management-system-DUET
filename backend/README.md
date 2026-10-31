# C++ Crow backend

Build instructions are in the root `README.md`.

- `GET /api/health`
- `GET /api/menu`
- `GET /api/menu?search=burger`
- `POST /api/orders`
- `GET /api/receipts/{receiptId}`

The order endpoint validates item IDs and quantities and calculates subtotal, 5% tax and total in C++.
Receipts are kept in memory for this initial project milestone and reset when the server restarts.
