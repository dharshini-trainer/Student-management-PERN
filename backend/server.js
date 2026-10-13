const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Student Management API is running");
});

app.get("/api/students", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM students ORDER BY id"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Database error while fetching students:", error);
        res.status(500).json({
            error: "Failed to fetch students",
            details: error.message
        });
    }
});

app.get("/api/students/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid student ID"
            });
        }

        const result = await pool.query(
            "SELECT * FROM students WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Database error while fetching student:", error);

        res.status(500).json({
            error: "Failed to fetch student",
            details: error.message
        });
    }
});

app.post("/api/students", async (req, res) => {
    const { name, email, age, department } = req.body;

    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        age === undefined ||
        age === null ||
        age === "" ||
        typeof department !== "string" ||
        !department.trim()
    ) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    const numericAge = Number(age);

    if (
        !Number.isInteger(numericAge) ||
        numericAge < 1 ||
        numericAge > 120
    ) {
        return res.status(400).json({
            error: "Age must be a whole number between 1 and 120"
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO students (name, email, age, department)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                name.trim(),
                email.trim(),
                numericAge,
                department.trim()
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Database error while creating student:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                error: "This email already exists"
            });
        }

        res.status(500).json({
            error: "Failed to create student",
            details: error.message
        });
    }
});

app.put("/api/students/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { name, email, age, department } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid student ID"
        });
    }

    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        age === undefined ||
        age === null ||
        age === "" ||
        typeof department !== "string" ||
        !department.trim()
    ) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    const numericAge = Number(age);

    if (
        !Number.isInteger(numericAge) ||
        numericAge < 1 ||
        numericAge > 120
    ) {
        return res.status(400).json({
            error: "Age must be a whole number between 1 and 120"
        });
    }

    try {
        const result = await pool.query(
            `UPDATE students
             SET name = $1,
                 email = $2,
                 age = $3,
                 department = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING *`,
            [
                name.trim(),
                email.trim(),
                numericAge,
                department.trim(),
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Database error while updating student:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                error: "This email already exists"
            });
        }

        res.status(500).json({
            error: "Failed to update student",
            details: error.message
        });
    }
});

app.delete("/api/students/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid student ID"
            });
        }

        const result = await pool.query(
            "DELETE FROM students WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student deleted successfully",
            student: result.rows[0]
        });
    } catch (error) {
        console.error("Database error while deleting student:", error);

        res.status(500).json({
            error: "Failed to delete student",
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
    console.log("\nClosing server...");

    server.close(async () => {
        await pool.end();
        process.exit(0);
    });
});
