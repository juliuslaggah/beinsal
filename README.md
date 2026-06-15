BeinSal E-Commerce Platform

BeinSal is a full-functioning e-commerce website built for Sierra Leone, supporting multiple payment methods including Orange Money, AfriMoney, Visa, Mastercard, and Bank Transfers (SLCB).

Technology Stack

Backend: Node.js + Express
Frontend: HTML + Tailwind CSS + Lucide Icons
Database: SQLite (development)
Real-time Chat: Socket.io
Authentication: Phone + OTP (customers), Email + Password (staff)

Features

Customer Features:
- Product listing with 10 categories (Ladies Wear, Ladies Shoes, Ladies Bags, Ladies Accessories, Men Wear, Men Shoes, Men Bags, Men Accessories, Children, Unisex)
- Responsive design (mobile, tablet, desktop)
- Product detail page with image swiper
- Size selection per product
- Add to cart / Buy now
- Recently viewed products
- User registration (phone + OTP)
- Checkout with address and payment method selection
- My Account page (profile, orders, wallet)
- Order history with status filter
- Search with autocomplete
- Real-time customer support chat

Admin Features:
- Admin dashboard with statistics
- Order management (view, update status, generate delivery codes)
- Staff management (create Order Managers and Support Staff)
- Delivery person management (approve/reject applications)
- Customer support chat panel

Delivery Person Features:
- Self-registration with national ID and delivery zone
- Admin approval workflow
- Login with phone + PIN
- Dashboard to view shipped orders
- Enter delivery code to confirm delivery

Project Structure

beinsal/
├── public/
│   ├── index.html
│   ├── product.html
│   ├── cart.html
│   ├── checkout.html
│   ├── register.html
│   ├── account.html
│   ├── orders.html
│   ├── customer-chat.html
│   ├── admin/
│   │   ├── admin-dashboard.html
│   │   ├── orders.html
│   │   ├── support-chat.html
│   │   ├── manage-delivery-person.html
│   │   ├── manage-staff.html
│   │   └── staff-login.html
│   └── delivery/
│       ├── register.html
│       ├── login.html
│       └── dashboard.html
├── server.js
├── database.js
├── package.json
└── .env

Installation Instructions

Prerequisites:
- Node.js (v14 or higher)
- npm (v6 or higher)

Step 1: Clone the Repository
git clone https://github.com/juliuslaggah/beinsal.git
cd beinsal

Step 2: Install Dependencies
npm install

Step 3: Install Additional Packages
npm install express sqlite3 dotenv socket.io bcrypt

Step 4: Create .env File
Create a .env file in the root directory with: PORT=3000

Step 5: Start the Server
node server.js

You should see:
Database initialized: database.sqlite
Server running on http://localhost:3000
Default admin account created: admin@beinsal.com / BeinSal2024

Step 6: Open Browser
Navigate to http://localhost:3000

Access URLs

Customer Pages:
Homepage: http://localhost:3000/
Product Detail: http://localhost:3000/product.html?id=1
Cart: http://localhost:3000/cart.html
Checkout: http://localhost:3000/checkout.html
My Account: http://localhost:3000/account.html
My Orders: http://localhost:3000/orders.html
Customer Chat: http://localhost:3000/customer-chat.html
Registration: http://localhost:3000/register.html

Admin Pages:
Staff Login: http://localhost:3000/admin/staff-login.html
Admin Dashboard: http://localhost:3000/admin/admin-dashboard.html
Order Management: http://localhost:3000/admin/orders.html
Support Chat: http://localhost:3000/admin/support-chat.html
Manage Delivery Persons: http://localhost:3000/admin/manage-delivery-person.html
Manage Staff: http://localhost:3000/admin/manage-staff.html

Delivery Person Pages:
Delivery Registration: http://localhost:3000/delivery/register.html
Delivery Login: http://localhost:3000/delivery/login.html
Delivery Dashboard: http://localhost:3000/delivery/dashboard.html

Default Admin Account
Email: admin@beinsal.com
Password: BeinSal2024

Staff Roles
Admin: Full access to all features
Order Manager: View and update orders, generate delivery codes
Support Staff: Customer chat only

Delivery Code Flow
1. Admin changes order status to "Shipped" → 6-digit delivery code generated
2. Customer sees code in order history
3. Customer provides code to delivery person upon package receipt
4. Delivery person enters code in dashboard to confirm delivery

Known Issues / To Be Fixed
- Real-time chat sync with admin dashboard (messages stored in database but dashboard needs update)
- SMS integration (currently simulated in console)
- Payment integration with Monime
- Product image upload functionality

Future Roadmap
1. Integrate Monime payment gateway
2. Add real SMS service (Africa's Talking or Twilio)
3. Implement admin authentication
4. Add product image upload
5. Add favorites/wishlist
6. Migrate to PostgreSQL for production
7. Deploy to Vercel or Render

License
© 2026 BeinSal - All Rights Reserved

Support
For issues or feature requests, contact BeinSal support via the chat feature on the website.