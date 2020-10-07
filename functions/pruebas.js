'use strict'
const AHBDialogLib = require('./AHBDialogLib');
AHBDialogLib.hola("Antonio");
let respuesta = AHBDialogLib.respuestaBasica("bienvenido a DialogFlow");
console.log(respuesta);
console.log(JSON.stringify(respuesta));

let opciones = ["opcion1", "opcion2", "opcion3"];
AHBDialogLib.addSugerencias(respuesta, opciones);
AHBDialogLib.addCard(respuesta, "Antonio Banderas", "Es un actor", "Antonio Banderas.jpg", "https://www.google.com/search?q=Antonio+Banderas");
console.log(respuesta);
console.log(JSON.stringify(respuesta));

//opciones=["opcion1", "opcion2","opcion3","opcion4", "opcion5","opcion6",
// "opcion7", "opcion8","opcion9","opcion10", "opcion11","opcion12"];


const http = require('http');
const reqUrl=encodeURI(
    'http://datosabiertos.malaga.eu/api/3/action/datastore_search_sql?sql=SELECT count(*) from "0dcf7abd-26b4-42c8-af19-4992f1ee60c6"');

function accionPromise(respuesta){
    let textoEnviar ="";
    console.log("respuesta recibida: "+ JSON.stringify(respuesta));
    if(respuesta){
        textoEnviar= respuesta.result.records[0].count + " aparcamientos";
        console.log(textoEnviar);
    }
}




AHBDialogLib.leerURLpromise(reqUrl).then(accionPromise).catch((error)=>{
    console.log("error capturado en promise" + error);
})