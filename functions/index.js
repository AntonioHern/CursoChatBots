// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
//importar librerias
const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const AHBDialogLib = require("./AHBDialogLib");

//Variables globales
global.listaPersonajes = require("./personajes.json");
global.imagenes = "https://us-central1-michatbot-fkiy.cloudfunctions.net/curso/imagenes/";
global.ponentes= require("./ponentes.json");
const server = express();

//uso de express
server.use(bodyParser.urlencoded({
    extended: true
}));
//para analizar JSON
server.use(bodyParser.json());

//para cargar imagenes
server.use("/imagenes", express.static(path.join(__dirname, '/imagenes')));

//para acceder desde navegador web
server.get("/", (req, res) => {
    return res.json("Hola soy un bot, pero esta no es la forma de interactuar conmigo");
});

//Acceso correcto

server.post("/curso", (req, res) => {
    let resultado;
    let respuestaEnviada=false;
    let contexto = "";
    let textoEnviar = "";
    let opciones = AHBDialogLib.reducirAOcho(["Chistes", "Noticias", "Mi Equipo", "Personajes"]);

    try {
        contexto = req.body.queryResult.action;
        resultado = "Recibida petición de acción:" + contexto;
    } catch (e) {
        console.log("Error contexto vacío" + e);
    }
    if (req.body.queryResult.parameters) {
        console.log("parametros:" + req.body.queryResult.parameters);
    } else {
        console.log("sin parametros");
    }


    if (contexto === "input.welcome") {
        /*****Imput Welcome*****/
        textoEnviar = "Hola soy el primer webhook";
        resultado = AHBDialogLib.respuestaBasica(textoEnviar);
    } else if (contexto === "personaje") {
        /***** Personaje *****/
        let personaje = "";
        try {
            personaje = req.body.queryResult.parameters.personaje;
        } catch (e) {
            console.log("error personaje no leido: " + e);
        }
        if (personaje) {
            let arListaPersonajes = Object.keys(global.listaPersonajes).slice();
            //personalizar las opciones para que aparezcan sugerencias
            opciones = arListaPersonajes.slice();
            opciones.unshift("Menú");
            //si ha llegado el parametro personaje y está en la lista
            if (global.listaPersonajes[personaje]) {
                textoEnviar = global.listaPersonajes[personaje];
                let imagen = encodeURI(global.imagenes + personaje + ".jpg");
                let url = "https://www.google.com/search?q=" + personaje;
                resultado = AHBDialogLib.respuestaBasica("Me en canta el personaje " + personaje);
                AHBDialogLib.addCard(resultado, personaje, textoEnviar, imagen, url);
            } else {
                //si el personaje no existe en la base de datos listaPersonajes
                resultado = AHBDialogLib.respuestaBasica("Lo siento todavía no he aprendido nada de " + personaje);
            }
        } else {
            //pesonaje vacío
            resultado = AHBDialogLib.respuestaBasica("No se ha recibido el personaje");
        }


    }else if(contexto==="lista_personajes") {
        /****** lista_personajes ****/
        let arListaPersonajes = Object.keys(global.listaPersonajes).slice();
        //personalizar las opciones para que aparezcan sugerencias
        opciones = arListaPersonajes.slice();
        opciones.unshift("Menú");
        resultado = AHBDialogLib.respuestaBasica("Te muestro algunos personajes que conozco");

    }else if(contexto==="menu") {
        /***** menu ****/
        resultado = AHBDialogLib.respuestaBasica("Te muestro algunas cosas que se hacer");
    }else if(contexto==="recomendar_ordenador") {
        let tipopc;
        let memoria;
        let discoduro;
        let marca;

        try {
            tipopc = req.body.queryResult.parameters.tipoPc;
            memoria = req.body.queryResult.parameters.memoria;
            discoduro = req.body.queryResult.parameters.discoduro;
            marca = req.body.queryResult.parameters.marca;
        } catch (e) {
            console.log("error cargando variables" + e);
        }
        if (!tipopc) {
            textoEnviar = "Que tipo de dispositivo te gustaría elegir: ";
            opciones = ["Sobremesa", "Portátiles"];
            resultado = AHBDialogLib.respuestaBasica(textoEnviar);
        } else if (!memoria) {
            textoEnviar = "Es necesario elegir el tamaño de la memoria: ";
            opciones = ["4 Gb", "8 Gb", "16 Gb", "32 Gb"];
            resultado = AHBDialogLib.respuestaBasica(textoEnviar);
        } else if (!discoduro) {
            textoEnviar = "Ahora veremos el almacenamiento en disco: ";
            opciones = ["1 Tb", "2 Tb", "4 Tb"];
            resultado = AHBDialogLib.respuestaBasica(textoEnviar);
        } else if (!marca) {
            textoEnviar = "Que marca te gustaría consultar: ";
            opciones = ["hp", "lenovo", "acer", "dell"];
            resultado = AHBDialogLib.respuestaBasica(textoEnviar);
        } else {
            resultado = AHBDialogLib.respuestaBasica("Te ayudaré a encontrar un ordenador con esas características");
            let url = 'https://www.pccomponentes.com' + ((tipopc) ? "/" + tipopc : "") + ((discoduro) ? "/" + discoduro : "") + ((memoria) ? "/" + memoria : "") + ((marca) ? "/" + marca : "");
            AHBDialogLib.addEnlace(resultado, "Ver recomendación: ", url);
            opciones = ["Menú"];
        }
    }else if (contexto==="aparcamientos_contar") {
        respuestaEnviada = true;
        const reqUrl = 'http://datosabiertos.malaga.eu/api/3/action/datastore_search_sql?sql=SELECT count(*) from "0dcf7abd-26b4-42c8-af19-4992f1ee60c6"';
        AHBDialogLib.leerURLpromise(reqUrl).then((respuesta) => {
            let resultado;
            textoEnviar = respuesta.result.records[0].count + " aparcamientos";
            console.log("en malaga hay " + textoEnviar);
            resultado = AHBDialogLib.respuestaBasica(textoEnviar);
            AHBDialogLib.addSugerencias(resultado, opciones);
            res.json(resultado);
            return true;


        }).catch((error) => {
            console.log("error capturado en promise " + error);
            res.json(AHBDialogLib.respuestaBasica("Lo siento no se ha podido conectar al servidor externo"));
        });
    }else if (contexto==="aparcamientos_ocupacion") {
        respuestaEnviada = true;
        const aparcBuscado = req.body.queryResult.parameters.nombre;
        console.log("aparcbuscado " + aparcBuscado);
        const reqUrl = encodeURI(
            `http://datosabiertos.malaga.eu/api/3/action/datastore_search_sql?sql=SELECT * from "0dcf7abd-26b4-42c8-af19-4992f1ee60c6" WHERE upper(nombre) LIKE upper('%${aparcBuscado}%')`);

        AHBDialogLib.leerURLpromise(reqUrl).then((respuesta) => {
            let resultado;
            textoEnviar;
            console.log("leerURLpromise: " + JSON.stringify(respuesta));
            const aparcamiento = respuesta.result.records[0];
            console.log("leerURLpromise-aparcamiento: " + aparcamiento);
            if (aparcamiento.libres > 0) {
                textoEnviar += `${aparcamiento.nombre} situado en ${aparcamiento.direccion} dispone de ${aparcamiento.capacidad}
                y ahora tiene ${aparcamiento.libres} libres. Corre y no pierdas tu sitio`;
            } else {
                textoEnviar += `${aparcamiento.nombre} situado en ${aparcamiento.direccion} dispone de ${aparcamiento.capacidad}
                y ahora tiene ${aparcamiento.libres} libres. Espera un rato o prueba con otro aparcamiento`;
            }
            console.log("resultado aparcamientos" + textoEnviar);
            resultado = AHBDialogLib.respuestaBasica(textoEnviar);
            AHBDialogLib.addSugerencias(resultado, opciones);
            res.json(resultado);
            return true;
        }).catch((error) => {
            console.log("error capturado en promise " + error);
            res.json(AHBDialogLib.respuestaBasica("lo siento, no encuentro ese aparcamiento"));
        });
    }else if(contexto==="ponente"){
        try{
            let ponente=req.body.queryResult.parameters.ponente;
            textoEnviar=ponente + " es "+ global.ponentes[ponente].Cargo + " en "+global.ponentes[ponente].Institucion;
            let imagen= global.ponentes[ponente].Imagen;
            let url = global.ponentes[ponente].url;
            resultado= AHBDialogLib.respuestaBasica(textoEnviar);
            AHBDialogLib.addCard(resultado,ponente,textoEnviar,imagen,url);

            let arListaPonentes=Object.keys(global.ponentes).slice();
            opciones=AHBDialogLib.reducirAOcho(arListaPonentes);
            opciones.unshift("Menú");
        }catch (e) {
            textoEnviar="No conozco a ese ponente";
            resultado=AHBDialogLib.respuestaBasica(textoEnviar);
        }
    }


     else {
        //se recibe un action DESCONOCIDO
        resultado = AHBDialogLib.respuestaBasica("Tadavía no he aprendido a gestionar:" + contexto);
    }
    if(!respuestaEnviada){
        AHBDialogLib.addSugerencias(resultado, opciones);
        res.json(resultado);
    }

});

const local = false; // para ejecutar servidor local
if (local) {
    server.listen((process.env.PORT || 8000), () => {
        console.log("Servidor funcionando");
    });
} else {
    //para firebase
    exports.curso = functions.https.onRequest(server);
}


exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", {structuredData: true});
    response.send("Hello from Firebase!");
});
