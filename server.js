require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static('public'));

// Store online users and admin status
const onlineUsers = {};
let adminOnline = false;
let adminSocketId = null;

// Products with new 10 categories
const products = [
    // LADIES WEAR
    { id: 1, name: 'African Print Maxi Dress', price: 19999, sold: 245, shippingDays: 3, category: "Ladies Wear", image: null, sizes: ['S', 'M', 'L', 'XL'] },
    { id: 5, name: "Women's Kaftan Gown", price: 24999, sold: 156, shippingDays: 3, category: "Ladies Wear", image: null, sizes: ['S', 'M', 'L'] },
    { id: 9, name: 'Ankara Skirt and Blouse Set', price: 29999, sold: 89, shippingDays: 4, category: "Ladies Wear", image: null, sizes: ['S', 'M', 'L', 'XL'] },
    { id: 10, name: 'Lapa Wax Print Wrapper', price: 17999, sold: 312, shippingDays: 2, category: "Ladies Wear", image: null, sizes: ['Free Size'] },
    { id: 11, name: 'Gara Tie-Dye Dress', price: 15999, sold: 203, shippingDays: 3, category: "Ladies Wear", image: null, sizes: ['S', 'M', 'L'] },
    { id: 12, name: "Women's Summer Floral Dress", price: 12999, sold: 178, shippingDays: 3, category: "Ladies Wear", image: null, sizes: ['XS', 'S', 'M', 'L'] },
    { id: 28, name: 'Wedding Guest Gown', price: 44999, sold: 45, shippingDays: 5, category: "Ladies Wear", image: null, sizes: ['S', 'M', 'L', 'XL'] },
    { id: 29, name: 'Church Dress (Lace)', price: 35999, sold: 78, shippingDays: 4, category: "Ladies Wear", image: null, sizes: ['S', 'M', 'L'] },
    { id: 30, name: 'T-Shirt Dress (Casual)', price: 9999, sold: 234, shippingDays: 2, category: "Ladies Wear", image: null, sizes: ['S', 'M', 'L', 'XL'] },
    
    // LADIES SHOES
    { id: 3, name: 'Leather Sandals (Women)', price: 8999, sold: 432, shippingDays: 2, category: "Ladies Shoes", image: null, sizes: ['36', '37', '38', '39', '40'] },
    { id: 17, name: "Women's Block Heels", price: 18999, sold: 156, shippingDays: 3, category: "Ladies Shoes", image: null, sizes: ['36', '37', '38', '39'] },
    { id: 31, name: 'Women\'s Sneakers (Canvas)', price: 24999, sold: 98, shippingDays: 4, category: "Ladies Shoes", image: null, sizes: ['36', '37', '38', '39', '40'] },
    { id: 32, name: 'Beaded Sandals (Traditional)', price: 12999, sold: 267, shippingDays: 3, category: "Ladies Shoes", image: null, sizes: ['36', '37', '38', '39'] },
    { id: 33, name: 'Women\'s Ankle Boots', price: 34999, sold: 56, shippingDays: 5, category: "Ladies Shoes", image: null, sizes: ['36', '37', '38', '39', '40'] },
    
    // LADIES BAGS
    { id: 4, name: 'Kente Print Handbag', price: 12999, sold: 98, shippingDays: 4, category: "Ladies Bags", image: null, sizes: ['One Size'] },
    { id: 19, name: "Women's Shoulder Bag (Beaded)", price: 15999, sold: 234, shippingDays: 3, category: "Ladies Bags", image: null, sizes: ['One Size'] },
    { id: 34, name: 'Tote Bag (Casual)', price: 18999, sold: 145, shippingDays: 3, category: "Ladies Bags", image: null, sizes: ['One Size'] },
    { id: 35, name: 'Clutch Evening Bag', price: 9999, sold: 312, shippingDays: 2, category: "Ladies Bags", image: null, sizes: ['One Size'] },
    { id: 36, name: 'Woven Raffia Bag', price: 14999, sold: 87, shippingDays: 4, category: "Ladies Bags", image: null, sizes: ['One Size'] },
    
    // LADIES ACCESSORIES
    { id: 7, name: 'Beaded Necklace', price: 4999, sold: 523, shippingDays: 2, category: "Ladies Accessories", image: null, sizes: ['One Size'] },
    { id: 21, name: 'African Waist Beads', price: 2999, sold: 892, shippingDays: 2, category: "Ladies Accessories", image: null, sizes: ['Adjustable'] },
    { id: 37, name: 'Headwrap (Gele)', price: 7999, sold: 456, shippingDays: 2, category: "Ladies Accessories", image: null, sizes: ['One Size'] },
    { id: 38, name: 'Silk Scarf', price: 5999, sold: 234, shippingDays: 2, category: "Ladies Accessories", image: null, sizes: ['One Size'] },
    { id: 39, name: 'Leather Belt (Women)', price: 6999, sold: 167, shippingDays: 2, category: "Ladies Accessories", image: null, sizes: ['S', 'M', 'L'] },
    
    // MEN WEAR
    { id: 2, name: "Men's Dashiki Shirt", price: 14999, sold: 187, shippingDays: 3, category: "Men Wear", image: null, sizes: ['M', 'L', 'XL'] },
    { id: 6, name: "Men's Agbada (Grand Boubou)", price: 59999, sold: 67, shippingDays: 5, category: "Men Wear", image: null, sizes: ['M', 'L', 'XL'] },
    { id: 13, name: "Men's Kaftan (Short Sleeve)", price: 24999, sold: 92, shippingDays: 3, category: "Men Wear", image: null, sizes: ['M', 'L', 'XL', 'XXL'] },
    { id: 14, name: "Men's Senator Wear", price: 44999, sold: 54, shippingDays: 4, category: "Men Wear", image: null, sizes: ['M', 'L', 'XL'] },
    { id: 15, name: "Men's Casual Polo Shirt", price: 9999, sold: 423, shippingDays: 2, category: "Men Wear", image: null, sizes: ['S', 'M', 'L', 'XL'] },
    { id: 40, name: "Men's Dress Shirt (Formal)", price: 19999, sold: 134, shippingDays: 3, category: "Men Wear", image: null, sizes: ['M', 'L', 'XL'] },
    { id: 41, name: "Men's Chino Trousers", price: 24999, sold: 98, shippingDays: 3, category: "Men Wear", image: null, sizes: ['30', '32', '34', '36', '38'] },
    
    // MEN SHOES
    { id: 8, name: "Men's Sneakers (Casual)", price: 34999, sold: 234, shippingDays: 4, category: "Men Shoes", image: null, sizes: ['39', '40', '41', '42', '43'] },
    { id: 18, name: "Men's Leather Loafers", price: 39999, sold: 87, shippingDays: 4, category: "Men Shoes", image: null, sizes: ['39', '40', '41', '42'] },
    { id: 42, name: "Men's Oxford Dress Shoes", price: 49999, sold: 56, shippingDays: 5, category: "Men Shoes", image: null, sizes: ['39', '40', '41', '42', '43'] },
    { id: 43, name: "Men's Leather Sandals", price: 15999, sold: 234, shippingDays: 3, category: "Men Shoes", image: null, sizes: ['39', '40', '41', '42'] },
    
    // MEN BAGS
    { id: 20, name: "Men's Backpack (Casual)", price: 27999, sold: 112, shippingDays: 4, category: "Men Bags", image: null, sizes: ['One Size'] },
    { id: 44, name: "Men's Messenger Bag", price: 32999, sold: 67, shippingDays: 4, category: "Men Bags", image: null, sizes: ['One Size'] },
    { id: 45, name: "Men's Duffel Bag (Gym)", price: 39999, sold: 45, shippingDays: 5, category: "Men Bags", image: null, sizes: ['One Size'] },
    { id: 46, name: "Men's Waist Pack (Fanny Pack)", price: 12999, sold: 178, shippingDays: 3, category: "Men Bags", image: null, sizes: ['One Size'] },
    
    // MEN ACCESSORIES
    { id: 16, name: "Men's Fila Cap (Traditional)", price: 4999, sold: 678, shippingDays: 2, category: "Men Accessories", image: null, sizes: ['One Size'] },
    { id: 47, name: "Men's Leather Belt", price: 8999, sold: 234, shippingDays: 2, category: "Men Accessories", image: null, sizes: ['M', 'L', 'XL'] },
    { id: 48, name: "Men's Beaded Bracelet", price: 3999, sold: 345, shippingDays: 2, category: "Men Accessories", image: null, sizes: ['One Size'] },
    { id: 49, name: "Men's Sunglasses", price: 12999, sold: 234, shippingDays: 3, category: "Men Accessories", image: null, sizes: ['One Size'] },
    
    // CHILDREN
    { id: 50, name: "Girls' Floral Dress", price: 8999, sold: 345, shippingDays: 3, category: "Children", image: null, sizes: ['2T', '3T', '4T', '5T'] },
    { id: 51, name: "Boys' Polo Shirt", price: 6999, sold: 234, shippingDays: 3, category: "Children", image: null, sizes: ['2T', '3T', '4T', '5T'] },
    { id: 52, name: "Kids' Sneakers", price: 9999, sold: 456, shippingDays: 3, category: "Children", image: null, sizes: ['20', '21', '22', '23', '24'] },
    { id: 53, name: "Kids' Backpack", price: 7999, sold: 234, shippingDays: 3, category: "Children", image: null, sizes: ['One Size'] },
    
    // UNISEX
    { id: 24, name: "Perfume (Women's Flower)", price: 24999, sold: 89, shippingDays: 4, category: "Unisex", image: null, sizes: ['50ml'] },
    { id: 25, name: "Perfume (Men's Musk)", price: 22999, sold: 76, shippingDays: 4, category: "Unisex", image: null, sizes: ['50ml'] },
    { id: 26, name: "Sunglasses (Unisex Classic)", price: 12999, sold: 345, shippingDays: 3, category: "Unisex", image: null, sizes: ['One Size'] },
    { id: 27, name: "Sunglasses (Unisex Aviator)", price: 15999, sold: 234, shippingDays: 3, category: "Unisex", image: null, sizes: ['One Size'] }
];

// ============ HELPER FUNCTIONS ============

// Generate unique delivery code (ensures no duplicate)
function generateUniqueDeliveryCode(callback) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Check if code already exists in orders table
    db.get(`SELECT id FROM orders WHERE delivery_code = ?`, [code], (err, existing) => {
        if (err) {
            callback(code); // Return code anyway on error
        } else if (existing) {
            // Code exists, try again recursively
            generateUniqueDeliveryCode(callback);
        } else {
            callback(code);
        }
    });
}

// ============ CHAT DATABASE FUNCTIONS ============

// Save message to database
function saveMessage(userId, userName, sender, message, timestamp) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO chat_messages (user_id, user_name, sender, message, timestamp, read) VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, userName, sender, message, timestamp, sender === 'admin' ? 1 : 0],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
}

// Get chat history for a user
function getChatHistory(userId, callback) {
    db.all(
        `SELECT sender, message, timestamp FROM chat_messages WHERE user_id = ? ORDER BY timestamp ASC`,
        [userId],
        (err, rows) => {
            if (err) {
                callback([]);
            } else {
                callback(rows);
            }
        }
    );
}

// Get all conversations (unique users)
function getAllConversations(callback) {
    db.all(
        `SELECT user_id, user_name, MAX(timestamp) as last_timestamp,
         (SELECT message FROM chat_messages WHERE user_id = c.user_id ORDER BY timestamp DESC LIMIT 1) as last_message,
         COUNT(CASE WHEN sender = 'customer' AND read = 0 THEN 1 END) as unread_count
         FROM chat_messages c
         GROUP BY user_id, user_name
         ORDER BY last_timestamp DESC`,
        (err, rows) => {
            if (err) {
                callback([]);
            } else {
                callback(rows);
            }
        }
    );
}

// Mark messages as read for a user
function markMessagesAsRead(userId) {
    db.run(
        `UPDATE chat_messages SET read = 1 WHERE user_id = ? AND sender = 'customer' AND read = 0`,
        [userId]
    );
}

// ============ STAFF API ROUTES ============

// Initialize default admin account (run once)
function initDefaultAdmin() {
    const defaultEmail = 'admin@beinsal.com';
    const defaultPassword = 'BeinSal2024';
    const defaultName = 'Super Admin';
    
    db.get(`SELECT id FROM staff WHERE email = ?`, [defaultEmail], async (err, existing) => {
        if (err) {
            console.error('Error checking default admin:', err);
        } else if (!existing) {
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            db.run(
                `INSERT INTO staff (email, password_hash, full_name, role, created_at) VALUES (?, ?, ?, ?, ?)`,
                [defaultEmail, hashedPassword, defaultName, 'admin', new Date().toISOString()],
                (insertErr) => {
                    if (insertErr) {
                        console.error('Error creating default admin:', insertErr);
                    } else {
                        console.log('Default admin account created: admin@beinsal.com / BeinSal2024');
                    }
                }
            );
        }
    });
}

// Staff login
app.post('/api/staff/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    db.get(`SELECT id, email, password_hash, full_name, role FROM staff WHERE email = ?`, [email], async (err, staff) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!staff) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const validPassword = await bcrypt.compare(password, staff.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
        
        db.run(`INSERT INTO staff_sessions (staff_id, token, expires_at) VALUES (?, ?, ?)`,
            [staff.id, token, expiresAt],
            (err2) => {
                if (err2) {
                    return res.status(500).json({ error: err2.message });
                }
                res.json({
                    success: true,
                    token: token,
                    staff: {
                        id: staff.id,
                        email: staff.email,
                        full_name: staff.full_name,
                        role: staff.role
                    }
                });
            }
        );
    });
});

// Verify staff session
app.post('/api/staff/verify', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.json({ valid: false });
    }
    
    db.get(
        `SELECT s.staff_id, st.role, st.full_name, st.email
         FROM staff_sessions s
         JOIN staff st ON s.staff_id = st.id
         WHERE s.token = ? AND s.expires_at > ?`,
        [token, new Date().toISOString()],
        (err, session) => {
            if (err || !session) {
                return res.json({ valid: false });
            }
            res.json({
                valid: true,
                role: session.role,
                staff_id: session.staff_id,
                full_name: session.full_name,
                email: session.email
            });
        }
    );
});

app.post('/api/staff/logout', (req, res) => {
    const { token } = req.body;
    
    if (token) {
        db.run(`DELETE FROM staff_sessions WHERE token = ?`, [token]);
    }
    res.json({ success: true });
});

function checkStaffAuth(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    db.get(
        `SELECT s.staff_id, st.role
         FROM staff_sessions s
         JOIN staff st ON s.staff_id = st.id
         WHERE s.token = ? AND s.expires_at > ?`,
        [token, new Date().toISOString()],
        (err, session) => {
            if (err || !session) {
                return res.status(401).json({ error: 'Invalid or expired session' });
            }
            req.staffRole = session.role;
            req.staffId = session.staff_id;
            next();
        }
    );
}

app.get('/api/admin/staff', checkStaffAuth, (req, res) => {
    if (req.staffRole !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    db.all(`SELECT id, email, full_name, role, created_at FROM staff ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/admin/staff/create', checkStaffAuth, async (req, res) => {
    if (req.staffRole !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const { email, fullName, password, role } = req.body;
    
    if (!email || !fullName || !password || !role) {
        return res.status(400).json({ error: 'All fields required' });
    }
    
    const validRoles = ['admin', 'order_manager', 'support_staff'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
        `INSERT INTO staff (email, password_hash, full_name, role, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
        [email, hashedPassword, fullName, role, new Date().toISOString(), req.staffId],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    res.status(400).json({ error: 'Email already exists' });
                } else {
                    res.status(500).json({ error: err.message });
                }
            } else {
                res.json({ success: true, message: 'Staff created successfully', staffId: this.lastID });
            }
        }
    );
});

app.delete('/api/admin/staff/:id', checkStaffAuth, (req, res) => {
    if (req.staffRole !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const staffId = req.params.id;
    
    if (parseInt(staffId) === req.staffId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    db.run(`DELETE FROM staff WHERE id = ?`, [staffId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Staff not found' });
        } else {
            res.json({ success: true, message: 'Staff deleted successfully' });
        }
    });
});

// ============ DELIVERY PERSON API ROUTES ============

app.post('/api/delivery/register', (req, res) => {
    const { fullName, phone, nationalId, deliveryZone } = req.body;
    
    const tempPin = Math.floor(100000 + Math.random() * 900000).toString();
    
    db.run(
        `INSERT INTO delivery_persons (full_name, phone, national_id, delivery_zone, status, pin, registered_at) 
         VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
        [fullName, phone, nationalId, deliveryZone, tempPin, new Date().toISOString()],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    res.status(400).json({ error: 'Phone number already registered' });
                } else {
                    res.status(500).json({ error: err.message });
                }
            } else {
                console.log(`[SIMULATED] Delivery person registered: ${fullName}, Phone: ${phone}, Temp PIN: ${tempPin}`);
                res.json({ 
                    success: true, 
                    message: 'Registration submitted. Awaiting admin approval.',
                    deliveryPersonId: this.lastID
                });
            }
        }
    );
});

app.get('/api/admin/delivery/pending', (req, res) => {
    db.all(`SELECT id, full_name, phone, national_id, delivery_zone, registered_at FROM delivery_persons WHERE status = 'pending'`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.get('/api/admin/delivery/all', (req, res) => {
    db.all(`SELECT id, full_name, phone, national_id, delivery_zone, status, registered_at FROM delivery_persons ORDER BY registered_at DESC`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/admin/delivery/approve', (req, res) => {
    const { deliveryPersonId } = req.body;
    
    db.get(`SELECT phone, pin FROM delivery_persons WHERE id = ? AND status = 'pending'`, [deliveryPersonId], (err, deliveryPerson) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!deliveryPerson) {
            res.status(404).json({ error: 'Delivery person not found or already processed' });
        } else {
            db.run(`UPDATE delivery_persons SET status = 'active', approved_at = ? WHERE id = ?`, 
                [new Date().toISOString(), deliveryPersonId],
                function(updateErr) {
                    if (updateErr) {
                        res.status(500).json({ error: updateErr.message });
                    } else {
                        console.log(`[SIMULATED] Delivery person approved. PIN: ${deliveryPerson.pin}`);
                        res.json({ 
                            success: true, 
                            message: 'Delivery person approved',
                            pin: deliveryPerson.pin
                        });
                    }
                }
            );
        }
    });
});

app.post('/api/admin/delivery/reject', (req, res) => {
    const { deliveryPersonId } = req.body;
    
    db.run(`DELETE FROM delivery_persons WHERE id = ? AND status = 'pending'`, [deliveryPersonId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Delivery person not found' });
        } else {
            res.json({ success: true, message: 'Delivery person rejected and removed' });
        }
    });
});

app.post('/api/admin/delivery/deactivate', (req, res) => {
    const { deliveryPersonId } = req.body;
    
    db.run(`UPDATE delivery_persons SET status = 'inactive' WHERE id = ?`, [deliveryPersonId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true, message: 'Delivery person deactivated' });
        }
    });
});

app.post('/api/delivery/login', (req, res) => {
    const { phone, pin } = req.body;
    
    db.get(`SELECT id, full_name, phone, delivery_zone, status FROM delivery_persons WHERE phone = ? AND pin = ? AND status = 'active'`, 
        [phone, pin], 
        (err, deliveryPerson) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (!deliveryPerson) {
                res.status(401).json({ error: 'Invalid credentials or account not approved' });
            } else {
                const token = crypto.randomBytes(32).toString('hex');
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                
                db.run(`INSERT INTO delivery_sessions (delivery_person_id, token, expires_at) VALUES (?, ?, ?)`,
                    [deliveryPerson.id, token, expiresAt],
                    (err2) => {
                        if (err2) {
                            res.status(500).json({ error: err2.message });
                        } else {
                            res.json({ 
                                success: true, 
                                token: token,
                                deliveryPerson: {
                                    id: deliveryPerson.id,
                                    name: deliveryPerson.full_name,
                                    phone: deliveryPerson.phone,
                                    zone: deliveryPerson.delivery_zone
                                }
                            });
                        }
                    }
                );
            }
        }
    );
});

app.get('/api/delivery/orders', (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    db.get(`SELECT delivery_person_id FROM delivery_sessions WHERE token = ? AND expires_at > ?`, 
        [token, new Date().toISOString()], 
        (err, session) => {
            if (err || !session) {
                return res.status(401).json({ error: 'Invalid or expired session' });
            }
            
            db.get(`SELECT delivery_zone FROM delivery_persons WHERE id = ?`, [session.delivery_person_id], (err2, deliveryPerson) => {
                if (err2 || !deliveryPerson) {
                    return res.status(500).json({ error: 'Delivery person not found' });
                }
                
                const orders = JSON.parse(fs.readFileSync('./orders.json', 'utf8') || '[]');
                const shippedOrders = orders.filter(o => o.status === 'shipped');
                res.json(shippedOrders);
            });
        }
    );
});

app.post('/api/delivery/confirm-delivery', (req, res) => {
    const { orderId, deliveryCode } = req.body;
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    db.get(`SELECT delivery_person_id FROM delivery_sessions WHERE token = ? AND expires_at > ?`, 
        [token, new Date().toISOString()], 
        (err, session) => {
            if (err || !session) {
                return res.status(401).json({ error: 'Invalid or expired session' });
            }
            
            let orders = [];
            const ordersJson = fs.readFileSync('./orders.json', 'utf8');
            if (ordersJson) {
                orders = JSON.parse(ordersJson);
            }
            
            const orderIndex = orders.findIndex(o => o.orderId === orderId);
            if (orderIndex === -1) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            const order = orders[orderIndex];
            
            if (order.deliveryCode !== deliveryCode) {
                return res.status(400).json({ error: 'Invalid delivery code' });
            }
            
            if (order.status !== 'shipped') {
                return res.status(400).json({ error: 'Order is not in shipped status' });
            }
            
            orders[orderIndex].status = 'delivered';
            orders[orderIndex].deliveredAt = new Date().toISOString();
            orders[orderIndex].deliveredBy = session.delivery_person_id;
            
            fs.writeFileSync('./orders.json', JSON.stringify(orders, null, 2));
            
            res.json({ success: true, message: 'Order marked as delivered' });
        }
    );
});

// ============ PRODUCT API ROUTES ============

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// ============ CUSTOMER API ROUTES ============

app.post('/api/register', (req, res) => {
    const { phone, fullName, city, street, landmark } = req.body;
    
    db.run(
        `INSERT INTO users (phone, full_name, city, street, landmark, registered_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [phone, fullName, city, street, landmark || '', new Date().toISOString()],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    res.status(400).json({ error: 'Phone number already registered' });
                } else {
                    res.status(500).json({ error: err.message });
                }
            } else {
                const token = crypto.randomBytes(32).toString('hex');
                const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                
                db.run(
                    `INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)`,
                    [this.lastID, token, expiresAt],
                    (err2) => {
                        if (err2) {
                            res.status(500).json({ error: err2.message });
                        } else {
                            res.json({ success: true, userId: this.lastID, token: token });
                        }
                    }
                );
            }
        }
    );
});

app.post('/api/check-user', (req, res) => {
    const { phone } = req.body;
    
    db.get(`SELECT id, phone, full_name, city, street, landmark FROM users WHERE phone = ?`, [phone], (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (user) {
            res.json({ exists: true, user: user });
        } else {
            res.json({ exists: false });
        }
    });
});

app.post('/api/verify-session', (req, res) => {
    const { token } = req.body;
    
    db.get(
        `SELECT u.id, u.phone, u.full_name, u.city, u.street, u.landmark 
         FROM sessions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.token = ? AND s.expires_at > ?`,
        [token, new Date().toISOString()],
        (err, user) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (user) {
                res.json({ valid: true, user: user });
            } else {
                res.json({ valid: false });
            }
        }
    );
});

app.get('/api/health', (req, res) => {
    res.json({ message: 'BeinSal server running' });
});

// ============ ORDER API ROUTES ============

app.get('/api/admin/orders', checkStaffAuth, (req, res) => {
    const orders = JSON.parse(fs.readFileSync('./orders.json', 'utf8') || '[]');
    res.json(orders);
});

app.put('/api/admin/orders/:orderId/status', checkStaffAuth, (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (req.staffRole === 'support_staff') {
        return res.status(403).json({ error: 'Support staff cannot update order status' });
    }
    
    let orders = JSON.parse(fs.readFileSync('./orders.json', 'utf8') || '[]');
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    orders[orderIndex].status = status;
    
    if (status === 'shipped' && !orders[orderIndex].deliveryCode) {
        generateUniqueDeliveryCode((code) => {
            orders[orderIndex].deliveryCode = code;
            fs.writeFileSync('./orders.json', JSON.stringify(orders, null, 2));
            console.log(`[SIMULATED] Delivery code for ${orderId}: ${code}`);
            res.json({ success: true, order: orders[orderIndex], deliveryCode: code });
        });
    } else {
        fs.writeFileSync('./orders.json', JSON.stringify(orders, null, 2));
        res.json({ success: true, order: orders[orderIndex] });
    }
});

// ============ SOCKET.IO CHAT (UPDATED WITH DATABASE) ============

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('admin-login', () => {
        adminOnline = true;
        adminSocketId = socket.id;
        console.log('Admin logged in');
        io.emit('admin-status', { online: true });
    });
    
    socket.on('admin-logout', () => {
        adminOnline = false;
        adminSocketId = null;
        console.log('Admin logged out');
        io.emit('admin-status', { online: false });
    });
    
    socket.on('user-login', (userId) => {
        onlineUsers[userId] = socket.id;
        console.log('User online:', userId);
    });
    
    // Customer sends message - save to database
    socket.on('customer-message', async (data) => {
        const { userId, userName, message, timestamp } = data;
        
        // Save to database
        await saveMessage(userId, userName, 'customer', message, timestamp);
        
        // Forward to admin if online
        if (adminOnline && adminSocketId) {
            io.to(adminSocketId).emit('new-customer-message', {
                userId: userId,
                userName: userName,
                message: message,
                timestamp: timestamp
            });
        } else {
            console.log('Admin offline, message stored for user:', userId);
        }
        
        socket.emit('message-sent', { success: true });
    });
    
    // Admin sends reply - save to database
    socket.on('admin-reply', async (data) => {
        const { userId, message, timestamp } = data;
        
        // Get user name from existing messages or use userId
        db.get(`SELECT user_name FROM chat_messages WHERE user_id = ? LIMIT 1`, [userId], async (err, row) => {
            const userName = row ? row.user_name : userId;
            
            // Save to database
            await saveMessage(userId, userName, 'admin', message, timestamp);
            
            // Send to customer if online
            const customerSocketId = onlineUsers[userId];
            if (customerSocketId) {
                io.to(customerSocketId).emit('admin-reply', {
                    message: message,
                    timestamp: timestamp
                });
            }
        });
    });
    
    // Get chat history for a user from database
    socket.on('get-chat-history', (userId, callback) => {
        getChatHistory(userId, callback);
    });
    
    // Get all conversations from database
    socket.on('get-all-conversations', (callback) => {
        getAllConversations(callback);
    });
    
    // Mark messages as read
    socket.on('mark-read', (userId) => {
        markMessagesAsRead(userId);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (adminSocketId === socket.id) {
            adminOnline = false;
            adminSocketId = null;
            io.emit('admin-status', { online: false });
        }
        for (const userId in onlineUsers) {
            if (onlineUsers[userId] === socket.id) {
                delete onlineUsers[userId];
                break;
            }
        }
    });
});

// Initialize default admin account
initDefaultAdmin();

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
