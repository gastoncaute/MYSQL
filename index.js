import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";

const app = express();

dotenv.config()
app.use(cors({ origin: "*" }))
app.use(express.json())

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    user: process.env.DATABASE_USER
})

app.get("/usuarios", (req, res) => {
    db.query("SELECT * FROM usuarios", (err, datos) => {
        if(err) return res.status(500).send(err)
        res.status(200).json(datos)
    })
})

app.post("/registrar", (req, res) => {
    const { username, email, completeName, password, avatar } = req.body
    db.query("INSERT INTO usuarios (username, email, completeName, password, avatar) VALUES (?, ?, ?, ?, ?)",
    [username, email, completeName, password, avatar],
    (err, resultado) => {
        if(err) return res.status(500).send(err)
        res.status(201).json(resultado)
    }
    )
})


//identifier hace referencia al mail y al nombre de usuario
app.post("/iniciar-sesion", (req, res) => {
    const { identifier, password } = req.body

    const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

    let usuario

    function passwordIsValid(passwordFromClient, passwordFromDB) {
        return passwordFromClient === passwordFromDB
    }

    if(emailRegex.test(identifier)) {
        db.query("SELECT * FROM usuarios WHERE email = ?",
            [identifier],
            (err, datos) => {
                if(err) return res.status(400).json(err)
                const usuario = {...datos[0]}
                if(passwordIsValid(password, usuario.password)) {
                    res.status(200).json(usuario)
                } else {
                    res.status(400).json("Contraseña incorrecta!")
                }
            }
        )
    } else {
        db.query("SELECT * FROM usuarios WHERE username = ?",
            [identifier],
            (err, datos) => {
                if(err) return res.status(400).json(err)
                const usuario = {...datos[0]}
                if(passwordIsValid(password, usuario.password)) {
                    res.status(200).json(usuario)
                } else {
                    res.status(400).json("Contraseña incorrecta!")
                }
            }
        )
    }
})

app.listen(3000, () => {
    console.log("Sistema de auteticacion levamtado en el puerto 3000")
})