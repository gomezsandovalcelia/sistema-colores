import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
import { leerColores,crearColor,borrarColor,actualizarColor, buscarUsuario } from "./db.js";
import cors from "cors";

import dns from "dns";
dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

async function verificar (peticion,respuesta,siguiente) {
    if(!peticion.headers.authorization){
        return respuesta.sendStatus(403);
    }

    let [,token] = peticion.headers.authorization.split(" ");

    try{

        let datos = await jwt.verify(token,process.env.SECRET_KEY);

        peticion.usuario = datos.id;

        siguiente();

    }catch(e){
        respuesta.sendStatus(403);
    }
}

const servidor = express();

servidor.use(cors());

servidor.use(express.json());

//servidor.use(express.static("./front"));

servidor.post("/login", async (peticion,respuesta) => {
    let {usuario, password} = peticion.body;

    if(!usuario || !usuario.trim() || !password || !password.trim()){
        return respuesta.sendStatus(403);
    }

    try{
        if (!process.env.SECRET) {
            throw new Error("SECRET_KEY no está definida");
        }

        let posibleUsuario = await buscarUsuario(usuario);

        //console.log("Usuario encontrado:", posibleUsuario);

        if(!posibleUsuario){
            return respuesta.sendStatus(403);
        }
        let coincide = await bcrypt.compare(password, posibleUsuario.password);
        //console.log("Coincide password:", coincide);
        
        if(!coincide){
            return respuesta.sendStatus(401);
        }

        let token = jwt.sign({ id : posibleUsuario._id }, process.env.SECRET);

        respuesta.json({ token });
        
    } catch(e){
        respuesta.status(500);
        respuesta.json({ error : "error en el servidor" });
    }
});

servidor.use(verificar);

servidor.get("/colores", async (peticion,respuesta) => {
    try{
        let colores = await leerColores(peticion.usuario);

        respuesta.json(colores);

    }catch (e) {
        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
});

servidor.post("/nuevo", async (peticion,respuesta) => {
    try{
        let {r,g,b} = peticion.body;
        let usuario = peticion.usuario;

        let id = await crearColor({r,g,b,usuario});

        respuesta.json({id});

    }catch(e){

        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
});

servidor.delete("/borrar/:id", async (peticion,respuesta,siguiente) => {
    try{
        let cantidad = await borrarColor(peticion.params.id,peticion.usuario);

        if(cantidad){
            return respuesta.sendStatus(204);
        }

        siguiente();

    }catch(e){

        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
});

servidor.patch("/actualizar/:id", async (peticion,respuesta,siguiente) => {
    try{
        let {existe,cambio} = await actualizarColor(peticion.params.id,peticion.body,peticion.usuario);

        if(cambio){
            return respuesta.sendStatus(204);
        }

        if(existe){
            return respuesta.json({ info : "no se actualizó el recurso" });
        }

        siguiente();
        

    }catch(e){

        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
});

servidor.use((error,peticion,respuesta,siguiente) => {
        respuesta.status(400);//bad request
        respuesta.json({ error : "error en la petición" });
});

servidor.use((peticion,respuesta) => {
        respuesta.status(404);
        respuesta.json({ error : "recurso no encontrado" });
});


servidor.listen(process.env.PORT);