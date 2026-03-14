import dotenv from "dotenv";
dotenv.config();
import dns from "dns";
dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);
import {MongoClient,ObjectId} from "mongodb";

const urlMongo = process.env.MONGO_URL;

function conectar(){
    return MongoClient.connect(urlMongo);
}
export function buscarUsuario(nombreUsuario){
   return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("colores").collection("usuarios");

            return coleccion.findOne({ usuario : nombreUsuario });
        })
        .then( usuario => {
            ok(usuario);
        })
        .catch((error) => {
            console.error("ERROR EN buscarUsuario:", error);
            ko({ error : "error en bbdd" });
        })
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}

export function leerColores(idUsuario){
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.find({ usuario : idUsuario }).toArray();
        })
        .then( colores => {
            ok(colores);
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}

export function crearColor(objColor){ //{r,g,b, usuario }
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

export function borrarColor(idColor,idUsuario){
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.deleteOne({ _id : new ObjectId(idColor), usuario : idUsuario });
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

export function actualizarColor(id,objCambios,idUsuario){ //{r,g,b}||{r}||{g}||{b}||cualquier combinación
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.updateOne({ _id : new ObjectId(id), usuario : idUsuario },{ $set : objCambios });
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

/*
buscarUsuario("celia")
.then( x => console.log(x) )
.catch( x => console.log(x) )
borrarColor("69b5449a9d92be07d20258cb", "69aea5ad70640c9f0e60384f")
.then( x => console.log(x) )
.catch( x => console.log(x) )
actualizarColor("69b5495745ce30a13fb95764", { r : 234}, "69aea5ad70640c9f0e603850"  )
.then( x => console.log(x) )
.catch( x => console.log(x) )*/