import dotenv from "dotenv";
dotenv.config();

import {MongoClient,ObjectId} from "mongodb";

const urlMongo = process.env.MONGO_URL;

function conectar(){
    return MongoClient.connect(urlMongo);
}

export function leerColores(){
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.find({}).toArray();
        })
        .then( colores => {
            ok(colores);
        })
        .catch((e) => {
            console.error("ERROR Mongo (leerColores):", e);
            ko(e); // <-- devuelves el error REAL
        })
        .catch((e) => {
            console.error("ERROR Mongo leerColores:", e);
            ko(e);
        })
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}

export function crearColor(objColor){ //{r,g,b}
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.insertOne(objColor);
        })
        .then( ({insertedId}) => {
            ok(insertedId);
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}

export function borrarColor(id){
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.deleteOne({ _id : new ObjectId(id) });
        })
        .then( ({deletedCount}) => {
            ok(deletedCount);
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}

export function actualizarColor(id,objCambios){ //{r,g,b}||{r}||{g}||{b}||cualquier combinación
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.updateOne({ _id : new ObjectId(id) },{ $set : objCambios });
        })
        .then( ({modifiedCount,matchedCount}) => {
            ok({
                existe : matchedCount,
                cambio : modifiedCount
            });
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}
