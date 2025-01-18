const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = 3000;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname)));


const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'edushare'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});


app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { semester, regulation, status, title, userId, password } = req.body;
  const filePath = req.file.filename;

  if (!semester || !regulation || !status || !title || !userId || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check user credentials
  const userQuery = 'SELECT name FROM Users WHERE userID = ? AND password = ?';
  db.execute(userQuery, [userId, password], (err, userResults) => {
    if (err) {
      console.error('Error retrieving user from the database:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (userResults.length === 0) {
      return res.status(401).json({ message: 'Invalid UserId or Password' });
    }

    const uploadedBy = userResults[0].name;

    const query = 'INSERT INTO study_material (semester, regulation, status, title, file_path, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [semester, regulation, status, title, filePath, uploadedBy];

    db.execute(query, params, (err, results) => {
      if (err) {
        console.error('Error inserting data into the database:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.status(200).json({
        message: "File uploaded successfully",
        filename: req.file.filename,
      });
    });
  });
});


app.post("/upload-project", upload.single("projectFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { projectTitle, projectDescription, projectCategory, userId, password } = req.body;
  const filePath = req.file.filename;

  if (!projectTitle || !projectDescription || !projectCategory || !userId || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }


  const userQuery = 'SELECT name FROM Users WHERE userID = ? AND password = ?';
  db.execute(userQuery, [userId, password], (err, userResults) => {
    if (err) {
      console.error('Error retrieving user from the database:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (userResults.length === 0) {
      return res.status(401).json({ message: 'Invalid UserId or Password' });
    }

    const uploadedBy = userResults[0].name;

    const query = 'INSERT INTO projects (title, description, category, file_path, uploaded_by) VALUES (?, ?, ?, ?, ?)';
    const params = [projectTitle, projectDescription, projectCategory, filePath, uploadedBy];

    db.execute(query, params, (err, results) => {
      if (err) {
        console.error('Error inserting data into the database:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.status(200).json({
        message: "Project uploaded successfully",
        filename: req.file.filename,
      });
    });
  });
});


app.post("/upload-research", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { title, description, author, category, userId, password } = req.body;
  const filePath = req.file.filename;

  if (!title || !description || !author || !category || !userId || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }


  const userQuery = 'SELECT name FROM Users WHERE userID = ? AND password = ?';
  db.execute(userQuery, [userId, password], (err, userResults) => {
    if (err) {
      console.error('Error retrieving user from the database:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (userResults.length === 0) {
      return res.status(401).json({ message: 'Invalid UserId or Password' });
    }

    const uploadedBy = userResults[0].name;

    const query = 'INSERT INTO research_papers (title, description, author, category, file_path, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [title, description, author, category, filePath, uploadedBy];

    db.execute(query, params, (err, results) => {
      if (err) {
        console.error('Error inserting data into the database:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.status(200).json({
        message: "Research paper uploaded successfully",
        filename: req.file.filename,
      });
    });
  });
});


app.post("/verify-user", (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ message: "User ID and Password are required" });
  }

  const userQuery = 'SELECT name FROM Users WHERE userID = ? AND password = ?';
  db.execute(userQuery, [userId, password], (err, userResults) => {
    if (err) {
      console.error('Error retrieving user from the database:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (userResults.length === 0) {
      return res.status(401).json({ message: 'Invalid UserId or Password' });
    }

    res.status(200).json({ message: 'User verified successfully' });
  });
});

// Edit project endpoint
app.post("/edit-project", (req, res) => {
  const { projectId, projectTitle, projectDescription, projectCategory, userId, password } = req.body;

  if (!projectId || !projectTitle || !projectDescription || !projectCategory || !userId || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check user credentials
  const userQuery = 'SELECT name FROM Users WHERE userID = ? AND password = ?';
  db.execute(userQuery, [userId, password], (err, userResults) => {
    if (err) {
      console.error('Error retrieving user from the database:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (userResults.length === 0) {
      return res.status(401).json({ message: 'Invalid UserId or Password' });
    }

    const query = 'UPDATE projects SET title = ?, description = ?, category = ? WHERE id = ? AND uploaded_by = ?';
    const params = [projectTitle, projectDescription, projectCategory, projectId, userResults[0].name];

    db.execute(query, params, (err, results) => {
      if (err) {
        console.error('Error updating project in the database:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (results.affectedRows === 0) {
        return res.status(403).json({ message: 'You do not have permission to edit this project' });
      }
      res.status(200).json({ message: "Project updated successfully" });
    });
  });
});

// Search endpoint
app.get("/search", (req, res) => {
  const { semester, regulation, status, search } = req.query;

  let query = `
    SELECT 'study_material' AS source, id, semester, regulation, status, title, file_path, uploaded_by, created_at
    FROM study_material
    WHERE 1=1
  `;
  const params = [];

  if (semester) {
    query += ' AND semester = ?';
    params.push(semester);
  }
  if (regulation) {
    query += ' AND regulation = ?';
    params.push(regulation);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    query += ' AND title LIKE ?';
    params.push(`%${search}%`);
  }

  query += `
    UNION ALL
    SELECT 'converted_files' AS source, id, semester, regulation, status, title, file_path, uploaded_by, created_at
    FROM converted_files
    WHERE 1=1
  `;

  if (semester) {
    query += ' AND semester = ?';
    params.push(semester);
  }
  if (regulation) {
    query += ' AND regulation = ?';
    params.push(regulation);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    query += ' AND title LIKE ?';
    params.push(`%${search}%`);
  }

  db.execute(query, params, (err, results) => {
    if (err) {
      console.error('Error retrieving data from the database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.status(200).json(results);
  });
});

// Search projects endpoint
app.get("/search-projects", (req, res) => {
  const { title, category } = req.query;

  let query = 'SELECT * FROM projects WHERE 1=1';
  const params = [];

  if (title) {
    query += ' AND title LIKE ?';
    params.push(`%${title}%`);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  db.execute(query, params, (err, results) => {
    if (err) {
      console.error('Error retrieving data from the database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.status(200).json(results);
  });
});

// Search research papers endpoint
app.get("/search-research", (req, res) => {
  const { title, category, year } = req.query;

  let query = 'SELECT * FROM research_papers WHERE 1=1';
  const params = [];

  if (title) {
    query += ' AND title LIKE ?';
    params.push(`%${title}%`);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (year) {
    query += ' AND YEAR(created_at) = ?';
    params.push(year);
  }

  db.execute(query, params, (err, results) => {
    if (err) {
      console.error('Error retrieving data from the database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.status(200).json(results);
  });
});

// Project details endpoint
app.get("/project-details", (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  const query = 'SELECT * FROM projects WHERE id = ?';
  db.execute(query, [id], (err, results) => {
    if (err) {
      console.error('Error retrieving project details from the database:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(results[0]);
  });
});

// Research details endpoint
app.get("/research-details", (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Research paper ID is required" });
  }

  const query = 'SELECT * FROM research_papers WHERE id = ?';
  db.execute(query, [id], (err, results) => {
    if (err) {
      console.error('Error retrieving research details from the database:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Research paper not found' });
    }
    res.status(200).json(results[0]);
  });
});

// Convert endpoint
app.post("/convert", upload.array("images", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  const { title, semester, regulation, status, userId, password } = req.body;

  if (!title || !semester || !regulation || !status || !userId || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check user credentials
  const userQuery = 'SELECT name FROM Users WHERE userID = ? AND password = ?';
  db.execute(userQuery, [userId, password], (err, userResults) => {
    if (err) {
      console.error('Error retrieving user from the database:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (userResults.length === 0) {
      return res.status(401).json({ message: 'Invalid UserId or Password' });
    }

    const uploadedBy = userResults[0].name;

    // Create PDF from images
    const pdfPath = path.join(uploadDir, `${Date.now()}-${title}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));

    req.files.forEach(file => {
      doc.addPage().image(file.path, {
        fit: [500, 700],
        align: 'center',
        valign: 'center'
      });
    });

    doc.end();

    const query = 'INSERT INTO converted_files (title, semester, regulation, status, file_path, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [title, semester, regulation, status, pdfPath, uploadedBy];

    db.execute(query, params, (err, results) => {
      if (err) {
        console.error('Error inserting data into the database:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.status(200).json({
        message: "Images converted to PDF successfully",
        filename: pdfPath,
      });
    });
  });
});

// Catch-all route to handle invalid endpoints
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
