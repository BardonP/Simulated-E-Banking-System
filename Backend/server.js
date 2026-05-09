const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../Frontend')));

app.use(express.json());

app.get('/api/test', (req, res) => {
    res.json({ message: "Server is running" });
});

// GET /api/customers/names - List customer names for autocomplete
app.get('/api/customers/names', (req, res) => {
  db.all('SELECT name FROM users WHERE role = ?', ['customer'], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows.map((row) => row.name));
  });
});

// API endpoints for businesses

// GET /api/businesses - List all businesses
app.get('/api/businesses', (req, res) => {
  db.all('SELECT * FROM businesses', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /api/businesses/:id - Get a single business
app.get('/api/businesses/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM businesses WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(row);
  });
});

// POST /api/businesses - Create a new business
app.post('/api/businesses', (req, res) => {
  const { name, owner_name, tax_id, email, phone, address } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  db.run(
    `INSERT INTO businesses (name, owner_name, tax_id, email, phone, address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, owner_name, tax_id, email, phone, address],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

// PUT /api/businesses/:id - Update a business
app.put('/api/businesses/:id', (req, res) => {
  const { id } = req.params;
  const { name, owner_name, tax_id, email, phone, address } = req.body;
  db.run(
    `UPDATE businesses SET name = ?, owner_name = ?, tax_id = ?, email = ?, phone = ?, address = ? WHERE id = ?`,
    [name, owner_name, tax_id, email, phone, address, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Business not found' });
      }
      res.json({ message: 'Business updated' });
    }
  );
});

// DELETE /api/businesses/:id - Delete a business
app.delete('/api/businesses/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM businesses WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json({ message: 'Business deleted' });
  });
});

// API endpoints for users

// POST /api/login - Authenticate user
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ user });
  });
});

// GET /api/users - List all users (for admin)
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, role, name, email FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /api/users/search - Get user by name
app.get('/api/users/search', (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Name parameter required' });
  }
  db.get('SELECT * FROM users WHERE name = ?', [name], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// GET /api/accounts/:userId - Get accounts for a user
app.get('/api/accounts/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM accounts WHERE user_id = ?', [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /api/transactions/:userId - Get transactions for a user
app.get('/api/transactions/:userId', (req, res) => {
  const { userId } = req.params;
  db.all(`
    SELECT t.*, a1.type as from_type, a2.type as to_type
    FROM transactions t
    LEFT JOIN accounts a1 ON t.from_account_id = a1.id
    LEFT JOIN accounts a2 ON t.to_account_id = a2.id
    WHERE a1.user_id = ? OR a2.user_id = ?
  `, [userId, userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /api/bills/:userId - Get bills for a user
app.get('/api/bills/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM bills WHERE user_id = ?', [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /api/account-types/:userId - Get account types for a user
app.get('/api/account-types/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT id, type FROM accounts WHERE user_id = ?', [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /api/pending-transfers - Get all pending transfers
app.get('/api/pending-transfers', (req, res) => {
  db.all(`
    SELECT pt.*, u1.name as from_name, u2.name as to_name, a1.type as from_type, a2.type as to_type
    FROM pending_transfers pt
    JOIN users u1 ON pt.from_user_id = u1.id
    JOIN users u2 ON pt.to_user_id = u2.id
    JOIN accounts a1 ON pt.from_account_id = a1.id
    JOIN accounts a2 ON pt.to_account_id = a2.id
    WHERE pt.status = 'Pending'
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/pending-transfers - Create a pending transfer
app.post('/api/pending-transfers', (req, res) => {
  const { from_user_id, to_user_id, from_account_id, to_account_id, amount } = req.body;
  if (!from_user_id || !to_user_id || !from_account_id || !to_account_id || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Check if from_account has sufficient balance
  db.get('SELECT * FROM accounts WHERE id = ?', [from_account_id], (err, account) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!account) {
      return res.status(404).json({ error: 'From account not found' });
    }
    if (account.balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    db.run(
      `INSERT INTO pending_transfers (from_user_id, to_user_id, from_account_id, to_account_id, amount) VALUES (?, ?, ?, ?, ?)`,
      [from_user_id, to_user_id, from_account_id, to_account_id, amount],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: 'Transfer pending approval' });
      }
    );
  });
});

// PUT /api/pending-transfers/:id - Approve or deny a transfer
app.put('/api/pending-transfers/:id', (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'deny'
  if (!action || (action !== 'approve' && action !== 'deny')) {
    return res.status(400).json({ error: 'Invalid action' });
  }
  // Get the pending transfer
  db.get('SELECT * FROM pending_transfers WHERE id = ?', [id], (err, transfer) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    if (transfer.status !== 'Pending') {
      return res.status(400).json({ error: 'Transfer is not pending' });
    }
    if (action === 'approve') {
      // Update from_account balance
      db.run(
        'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        [transfer.amount, transfer.from_account_id],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          // Update to_account balance
          db.run(
            'UPDATE accounts SET balance = balance + ? WHERE id = ?',
            [transfer.amount, transfer.to_account_id],
            function (err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              // Record transaction
              db.run(
                'INSERT INTO transactions (from_account_id, to_account_id, amount, description) VALUES (?, ?, ?, ?)',
                [transfer.from_account_id, transfer.to_account_id, transfer.amount, 'Approved transfer'],
                function (err) {
                  if (err) {
                    return res.status(500).json({ error: err.message });
                  }
                  // Update transfer status and log to completed
                  db.run(
                    'UPDATE pending_transfers SET status = ? WHERE id = ?',
                    ['Approved', id],
                    function (err) {
                      if (err) {
                        return res.status(500).json({ error: err.message });
                      }
                      db.run(
                        'INSERT INTO completed_transfers (from_user_id, to_user_id, from_account_id, to_account_id, amount, status, action) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [transfer.from_user_id, transfer.to_user_id, transfer.from_account_id, transfer.to_account_id, transfer.amount, 'Approved', 'Approved'],
                        function (err) {
                          if (err) {
                            return res.status(500).json({ error: err.message });
                          }
                          res.json({ message: 'Transfer approved' });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    } else {
      // Deny the transfer
      db.run(
        'UPDATE pending_transfers SET status = ? WHERE id = ?',
        ['Denied', id],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          db.run(
            'INSERT INTO completed_transfers (from_user_id, to_user_id, from_account_id, to_account_id, amount, status, action) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [transfer.from_user_id, transfer.to_user_id, transfer.from_account_id, transfer.to_account_id, transfer.amount, 'Denied', 'Denied'],
            function (err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              res.json({ message: 'Transfer denied' });
            }
          );
        }
      );
    }
  });
});

// GET /api/completed-transfers - Get all completed transfers
app.get('/api/completed-transfers', (req, res) => {
  db.all(`
    SELECT ct.*, u1.name as from_name, u2.name as to_name
    FROM completed_transfers ct
    JOIN users u1 ON ct.from_user_id = u1.id
    JOIN users u2 ON ct.to_user_id = u2.id
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/bills/pay - Pay a bill
app.post('/api/bills/pay', (req, res) => {
  const { userId, payee, amount } = req.body;
  // Find the bill
  db.get('SELECT * FROM bills WHERE user_id = ? AND payee = ? AND status != ?', [userId, payee, 'Complete'], (err, bill) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found or already paid' });
    }
    if (parseFloat(amount) !== bill.amount) {
      return res.status(400).json({ error: 'Amount does not match bill amount' });
    }
    // Find checking account
    db.get('SELECT * FROM accounts WHERE user_id = ? AND type = ?', [userId, 'checking'], (err, account) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!account || account.balance < amount) {
        return res.status(400).json({ error: 'Insufficient funds in checking account' });
      }
      // Deduct from account
      db.run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, account.id], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        // Update bill status
        db.run('UPDATE bills SET status = ? WHERE id = ?', ['Complete', bill.id], function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          // Record transaction
          db.run('INSERT INTO transactions (from_account_id, amount, description) VALUES (?, ?, ?)', [account.id, amount, `Bill payment to ${payee}`], function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Payment successful', newBalance: account.balance - amount });
          });
        });
      });
    });
  });
});

// PUT /api/accounts/:id - Update account balance
app.put('/api/accounts/:id', (req, res) => {
  const { id } = req.params;
  const { balance } = req.body;
  db.run('UPDATE accounts SET balance = ? WHERE id = ?', [balance, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ message: 'Account updated' });
  });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Database setup using SQLite

const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'bank.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      owner_name TEXT,
      tax_id TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT,
      email TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      balance REAL DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id),
      UNIQUE(user_id, type)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_account_id INTEGER,
      to_account_id INTEGER,
      amount REAL NOT NULL,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      description TEXT,
      FOREIGN KEY(from_account_id) REFERENCES accounts(id),
      FOREIGN KEY(to_account_id) REFERENCES accounts(id)
    )
  `);

  // Drop existing bills table to clear data and recreate with UNIQUE constraint
  db.run(`DROP TABLE IF EXISTS bills`);
  db.run(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      payee TEXT NOT NULL,
      amount REAL NOT NULL,
      due_date TEXT,
      status TEXT DEFAULT 'Unpaid',
      FOREIGN KEY(user_id) REFERENCES users(id),
      UNIQUE(user_id, payee)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pending_transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      from_account_id INTEGER NOT NULL,
      to_account_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(from_user_id) REFERENCES users(id),
      FOREIGN KEY(to_user_id) REFERENCES users(id),
      FOREIGN KEY(from_account_id) REFERENCES accounts(id),
      FOREIGN KEY(to_account_id) REFERENCES accounts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS completed_transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      from_account_id INTEGER NOT NULL,
      to_account_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      action TEXT NOT NULL,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(from_user_id) REFERENCES users(id),
      FOREIGN KEY(to_user_id) REFERENCES users(id),
      FOREIGN KEY(from_account_id) REFERENCES accounts(id),
      FOREIGN KEY(to_account_id) REFERENCES accounts(id)
    )
  `);

  // Insert initial data
  db.run(`
    INSERT OR IGNORE INTO users (username, password, role, name, email) VALUES
    ('customer', '1234', 'customer', 'John Doe', 'john@example.com'),
    ('customer2', '1234', 'customer', 'Michael Brown', 'michael@example.com'),
    ('customer3', '1234', 'customer', 'Sarah Johnson', 'sarah@example.com'),
    ('banker', '1234', 'banker', 'Jane Smith', 'jane@example.com'),
    ('admin', '1234', 'admin', 'Admin User', 'admin@example.com')
  `);

  db.get('SELECT id FROM users WHERE username = ?', ['customer'], (err, user) => {
    if (user) {
      db.run(`
        INSERT OR IGNORE INTO accounts (user_id, type, balance) VALUES
        (?, 'checking', 5000),
        (?, 'savings', 10000)
      `, [user.id, user.id]);
    }
  });

  db.get('SELECT id FROM users WHERE username = ?', ['customer2'], (err, user) => {
    if (user) {
      db.run(`
        INSERT OR IGNORE INTO accounts (user_id, type, balance) VALUES
        (?, 'checking', 2500),
        (?, 'savings', 4000)
      `, [user.id, user.id]);
    }
  });

  db.get('SELECT id FROM users WHERE username = ?', ['customer3'], (err, user) => {
    if (user) {
      db.run(`
        INSERT OR IGNORE INTO accounts (user_id, type, balance) VALUES
        (?, 'checking', 7300),
        (?, 'savings', 1200)
      `, [user.id, user.id]);
    }
  });

  db.get('SELECT id FROM users WHERE username = ?', ['banker'], (err, user) => {
    if (user) {
      db.run(`
        INSERT OR IGNORE INTO accounts (user_id, type, balance) VALUES
        (?, 'checking', 15000)
      `, [user.id]);
    }
  });

  // Insert sample transactions
  db.all('SELECT id, type FROM accounts WHERE user_id = (SELECT id FROM users WHERE username = ?)', ['customer'], (err, accounts) => {
    if (accounts.length >= 2) {
      const checkingId = accounts.find(a => a.type === 'checking')?.id;
      const savingsId = accounts.find(a => a.type === 'savings')?.id;
      if (checkingId && savingsId) {
        db.run(`
          INSERT OR IGNORE INTO transactions (from_account_id, to_account_id, amount, description) VALUES
          (?, ?, 1000, 'Transfer to savings'),
          (?, ?, 500, 'Received from Jane')
        `, [checkingId, savingsId, savingsId, checkingId]);
      }
    }
  });

  db.all('SELECT id, type FROM accounts WHERE user_id = (SELECT id FROM users WHERE username = ?)', ['customer2'], (err, accounts) => {
    if (accounts.length >= 2) {
      const checkingId = accounts.find(a => a.type === 'checking')?.id;
      const savingsId = accounts.find(a => a.type === 'savings')?.id;
      if (checkingId && savingsId) {
        db.run(`
          INSERT OR IGNORE INTO transactions (from_account_id, to_account_id, amount, description) VALUES
          (?, ?, 300, 'Mobile deposit'),
          (?, ?, 150, 'Bill payment')
        `, [checkingId, savingsId, savingsId, checkingId]);
      }
    }
  });

  // Insert sample bills (uses UNIQUE constraint on user_id + payee to prevent duplicates)
  db.get('SELECT id FROM users WHERE username = ?', ['customer'], (err, user) => {
    if (user) {
      db.run(`
        INSERT OR IGNORE INTO bills (user_id, payee, amount, due_date, status) VALUES
        (?, 'Rent', 1200, '2026-05-01', 'Late'),
        (?, 'Electricity', 200, '2026-05-09', 'Unpaid'),
        (?, 'Water', 110, '2026-01-01', 'Complete'),
        (?, 'Internet', 30, '2026-05-07', 'Pending')
      `, [user.id, user.id, user.id, user.id]);
    }
  });

  db.get('SELECT id FROM users WHERE username = ?', ['customer2'], (err, user) => {
    if (user) {
      db.run(`
        INSERT OR IGNORE INTO bills (user_id, payee, amount, due_date, status) VALUES
        (?, 'Mortgage', 1500, '2026-05-15', 'Pending'),
        (?, 'Gas', 80, '2026-05-10', 'Unpaid'),
        (?, 'Insurance', 250, '2026-06-01', 'Unpaid')
      `, [user.id, user.id, user.id]);
    }
  });

  db.get('SELECT id FROM users WHERE username = ?', ['customer3'], (err, user) => {
    if (user) {
      db.run(`
        INSERT OR IGNORE INTO bills (user_id, payee, amount, due_date, status) VALUES
        (?, 'Car Payment', 400, '2026-05-20', 'Pending'),
        (?, 'Phone', 60, '2026-05-05', 'Complete'),
        (?, 'Credit Card', 300, '2026-05-25', 'Unpaid')
      `, [user.id, user.id, user.id]);
    }
  });

  // Insert sample pending transfers
  db.all(`SELECT u1.id as u1_id, u2.id as u2_id, a1.id as a1_id, a2.id as a2_id
           FROM users u1, users u2, accounts a1, accounts a2
           WHERE u1.username = ? AND u2.username = ? AND a1.user_id = u1.id AND a2.user_id = u2.id
           LIMIT 1`, ['customer', 'customer2'], (err, rows) => {
    if (rows && rows.length > 0) {
      const { u1_id, u2_id, a1_id, a2_id } = rows[0];
      db.run(`
        INSERT OR IGNORE INTO pending_transfers (from_user_id, to_user_id, from_account_id, to_account_id, amount, status) VALUES
        (?, ?, ?, ?, 2000, 'Pending'),
        (?, ?, ?, ?, 1500, 'Pending')
      `, [u1_id, u2_id, a1_id, a2_id, u2_id, u1_id, a2_id, a1_id]);
    }
  });
});