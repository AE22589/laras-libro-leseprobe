export const groups = [
`sol|Brilla en el cielo de día.
pan|Lo comes con queso o con aceite.
mar|Tiene agua salada y olas.
pez|Nada y tiene aletas.
oso|Es un animal grande y tiene mucho pelo.
uva|Fruta pequeña que crece en racimos.
sal|Le da sabor salado a la comida.
luz|La encendemos para ver de noche.
ojo|Con él puedes ver.
pie|Lo metes dentro del zapato.
ala|Un pájaro tiene dos para volar.
río|Agua que corre por el campo.
mes|En un año hay doce.
rey|Lleva una corona y vive en un palacio.
gato|Hace miau, como yo.
luna|La vemos en el cielo de noche.
casa|Es el lugar donde vives.
mesa|Ponemos los platos encima de ella.
sopa|Se come con cuchara y está calentita.
pato|Hace cuac y nada en el estanque.
rana|Es verde, salta y hace croac.
mano|Tiene cinco dedos.
pelo|Crece en tu cabeza y lo peinas.
ropa|Te la pones para vestirte.
cama|En ella duermes por la noche.
flor|Tiene pétalos y puede oler muy bien.
tren|Viaja por las vías.
león|Es un felino con una gran melena.
azul|El color del cielo despejado.
rojo|El color de una fresa madura.
pera|Fruta verde con la parte de abajo más ancha.
hoja|Crece en la rama de un árbol.
beso|Te lo doy con los labios para mostrar cariño.
niña|Lara es una de seis años.`,
`amigo|Alguien con quien te gusta jugar.
amiga|Una compañera a la que quieres mucho.
perro|Mueve la cola y hace guau.
ratón|Animal pequeño al que le gusta mordisquear.
árbol|Tiene raíces, tronco y ramas.
libro|Tiene páginas y puedes leerlo.
lápiz|Escribes con él y puedes borrarlo.
papel|Sobre él dibujas o escribes.
silla|Tiene asiento y respaldo para sentarte.
leche|Bebida blanca que da la vaca.
queso|Se hace con leche y lo puedes comer en bocadillo.
huevo|Lo pone la gallina.
limón|Fruta amarilla de sabor muy ácido.
fresa|Fruta roja con pequeñas semillas por fuera.
playa|Tiene arena y está junto al mar.
nieve|Es blanca, fría y cae en copos.
nube|Flota en el cielo y puede traer lluvia.
verde|El color de la hierba.
barco|Nos lleva por el agua.
coche|Tiene cuatro ruedas y va por la carretera.
avión|Nos lleva por el cielo y tiene alas.
globo|Lo inflas con aire para una fiesta.
reloj|Te dice qué hora es.
llave|Sirve para abrir una cerradura.
puerta|La abres para entrar en una habitación.
nariz|Con ella hueles las flores.
boca|Con ella hablas y comes.
oreja|La tienes a un lado de la cabeza para oír.
brazo|Va del hombro hasta la mano.
baile|Mueves el cuerpo al ritmo de la música.
magia|En los cuentos hace que pasen cosas imposibles.
estrella|Brilla en el cielo de noche y está muy lejos.
tambor|Instrumento que suena cuando lo golpeas.`,
`música|Sonidos con ritmo que puedes escuchar y disfrutar.
canción|Tiene música y una letra para cantar.
corazón|Late dentro de tu pecho.
arcoíris|Aparece con muchos colores cuando hay sol y lluvia.
mariposa|Tiene alas de colores y antes fue una oruga.
elefante|Animal enorme con una larga trompa.
conejo|Tiene orejas largas y da saltitos.
tortuga|Camina despacio y lleva un caparazón.
caballo|Tiene crin, cuatro patas y hace hiiii.
ballena|Animal enorme que vive en el mar y respira aire.
jirafa|Animal con manchas y un cuello muy largo.
manzana|Fruta redonda que puede ser roja, verde o amarilla.
plátano|Fruta amarilla y alargada que pelas antes de comer.
naranja|Fruta redonda y jugosa del mismo nombre que su color.
galleta|Dulce crujiente que puedes mojar en leche.
helado|Dulce muy frío que se derrite.
zapato|Lo llevas en el pie para caminar por la calle.
camiseta|Prenda que te pones por la cabeza y cubre el cuerpo.
vestido|Prenda de una sola pieza con falda.
mochila|Llevas los libros dentro y te la pones a la espalda.
colegio|El lugar al que vas para aprender con tu clase.
ventana|Tiene cristal y puedes mirar fuera a través de ella.
pelota|Es redonda y sirve para jugar a lanzar o chutar.
bicicleta|Tiene dos ruedas y se mueve con pedales.
familia|Las personas con las que compartes tu hogar y tu vida.
hermana|Una hija de tus padres que comparte la familia contigo.
abuela|La madre de tu madre o de tu padre.
sonrisa|Aparece en tu cara cuando estás contenta.
abrazo|Rodeas con tus brazos a alguien que quieres.
bosque|Un lugar con muchos árboles juntos.
dragón|Criatura de cuento que puede volar y echar fuego.
princesa|En los cuentos puede ser la hija de una reina.
tesoro|Un cofre de cuento lleno de cosas valiosas.`
].map((group, level)=>group.split('\n').map(row=>{const [word,clue]=row.split('|');return {word:word.toLocaleUpperCase('es'),clue,level};}));
