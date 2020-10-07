const http=require('http');

/**
 * Crea una respuesta básica a partir de un texto
 * @param textoEnviar
 * @return respuesta en json
 */
function respuestaBasica(textoEnviar) {
    let respuesta = {
        "fulfillmentText": textoEnviar,
        "fulfillmentMessages": [
            {
                "platform": "ACTIONS_ON_GOOGLE",
                "simpleResponses": {
                    "simpleResponses": [
                        {
                            "textToSpeech": textoEnviar
                        }
                    ]
                }
            },
            {
                "text": {
                    "text": [
                        textoEnviar
                    ]
                }
            }
        ],
    }
    return  respuesta;
}

/**
 *
 * @param res Añade una rspuesta básica la lista de sugerencias
 * @param opciones Es la lista de sugerencias a añadir a res con el formato
 */
function addSugerencias(res, opciones){
    res.fulfillmentMessages.push(  {
            "platform": "ACTIONS_ON_GOOGLE",
            "suggestions": {
                "suggestions": listaOpcionesGoogle(opciones)
            }
        });
}

/**
 *
 * @param res respuesta básica de un card
 * @param titulo titulo del card
 * @param texto texto del card
 * @param imagen imagen asociada
 * @param url rul a la que se redirecciona
 */
function addCard(res, titulo,texto, imagen, url){
    res.fulfillmentMessages.push({
        "platform": "ACTIONS_ON_GOOGLE",
        "basicCard": {
            "title": titulo,
            "subtitle": titulo,
            "formattedText":texto,
            "image": {
                "imageUri": imagen,
                "accessibilityText": titulo
            },
            "buttons": [
                {
                    "title": `Más información de ${titulo}`,
                    "openUriAction": {
                        "uri": url
                    }
                }
            ]
        }
    });
}

/**
 *
 * @param opciones recibe lista de opciones
 * @return {[]} Devuelve la lista en formato suggestions de googele
 */
function listaOpcionesGoogle(opciones){
    let res=[];
    for(let i=0; i<opciones.length;i++){
        res.push({"title":opciones[i]})
    }
    return res;
}

/**
 *
 * @param res respuesta a la que se añade al enlace
 * @param texto texto a añadir en el enlace
 * @param url dirección a la que apunta el enlace
 */
function addEnlace(res, texto, url) {
    res.fulfillmentMessages.push({
        "platform": "ACTIONS_ON_GOOGLE",
        "linkOutSuggestion": {
            "destinationName": texto,
            "uri":url
        }
    });
}

/**
 *
 * @param reqUrl recibe una dirección y crea una promesa que si es correcta devuelve
 * la respusta como parámetro y si no lo es genera un Error
 * @return {Promise<unknown>}
 */
function leerURLpromise(reqUrl) {
    return new Promise((resolve, reject) => {
        let textoEnviar = "";
        http.get(reqUrl, (respuestaDeApi) => {
            let respuestaCompleta = "";
            let respuestaJSON = "";

            respuestaDeApi.on('data', (chunk) => {
                respuestaCompleta += chunk;
            });
            respuestaDeApi.on('end', () => {
                try {
                    respuestaJSON = JSON.parse(respuestaCompleta);
                    resolve(respuestaJSON);
                } catch (e) {
                    console.log("Error al cargar los datos del servidor" + e);
                    reject(new Error("Error al cargar datos del servidor"));

                }
            })
        }).on('error',(error)=>{
            console.log("Error al cargar los datos del servidor" + e);
            reject(new Error("Error al cargar datos del servidor"));

        })
        console.log("leerURL promise texto a enviar"+ JSON.stringify(textoEnviar));
    })
}




/**
 *
 * @param opciones recibe lista de sugerencias
 * @return {[]} devuleve una lista aleatoria con 8 de maximo
 */
function reducirAOcho(opciones){
    let res=[]; //array resultado con 8 opciones de forma aleatoria
    let i=0; //contador
    let pos; //posicion seleccionada

    while (i<8&&opciones.length>0){
        pos=Math.floor(Math.random()*opciones.length);
        res.push(opciones[pos]);
        opciones.splice(pos,1);
        i++;
    }
    return res;
}












function hola(nombre){
    console.log("Encantado de conocerte "+nombre);
}

module.exports = {
    respuestaBasica:respuestaBasica,
    hola:hola,
    addSugerencias:addSugerencias,
    addCard:addCard,
    reducirAOcho:reducirAOcho,
    addEnlace:addEnlace,
    leerURLpromise
}