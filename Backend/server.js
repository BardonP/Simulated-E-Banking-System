const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('../Frontend'));

app.get('/api/test', (req, res) => {
    res.json({ message: "Server is running" });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});