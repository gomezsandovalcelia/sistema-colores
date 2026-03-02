import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { leerColores,crearColor,borrarColor,actualizarColor } from "./db.js";
import cors from "cors";

import dns from "dns";
dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

const servidor = express();

servidor.use(cors());

servidor.use(express.json());

//servidor.use(express.static("./front"));

servidor.get("/colores", async (peticion,respuesta) => {
    try{
        let colores = await leerColores();

        respuesta.json(colores);

    }catch (e) {
        console.error("ERROR /colores:", e);
        respuesta.status(500);
        respuesta.json({ error: "error en el servidor" });
        }
});

servidor.post("/nuevo", async (peticion,respuesta) => {
    try{
        let id = await crearColor(peticion.body);

        respuesta.json({id});

    }catch(e){

        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
});

servidor.delete("/borrar/:id", async (peticion,respuesta,siguiente) => {
    try{
        let cantidad = await borrarColor(peticion.params.id);

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
        let {existe,cambio} = await actualizarColor(peticion.params.id,peticion.body);

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