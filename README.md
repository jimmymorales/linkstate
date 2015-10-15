# LinkState - Lab9

Esta herramienta provee un interfaz grafica para crear una red de nodos y calcular su ruta optima. Asi mismo despliega la tabla de enrutamiento.

Es una aplicacion web por lo tanto es suficiente levantando un servidor para poder renderizar el html.

## Dependencias

* [nodejs](https://nodejs.org/en/download/)
* [bower](http://bower.io/#install-bower)
* [http-server](https://www.npmjs.com/package/http-server)

## Correr aplicacion

Primero es necesario instalar dependencias, eso es usando bower:
```
bower install
```

Luego para correr el app, es suficiente con usar el modulo de `http-server`:
```
http-server
```

y ahora puedes visitar la pagina [localhost:8080](localhost:8080)

## Manual

En la parte superior izquierda se puede ver un mapa, (un nodo A conectado con un nodo B), la interfaz permite agregar nodos, nombrarlos y tambien conectarlos con nodos y agregarles pesos. Luego se seleccion el nodo inicial y al hacer click en submit la aplicacion calcula la tabla y la ruta optima. Para reiniciar la app es suficiente haciendo click en el boton de Reset.