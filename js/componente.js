/*
 * PasosJS
 * Divide un formulario largo en pasos cortos.
 * Cada <fieldset data-paso="Nombre"> del formulario es un paso.
 *
 * Uso:  crearPasos("#miFormulario");
 * Autor: Osvaldo Jose Jose
 */
function crearPasos(selector, opciones = {}) {
    const form = document.querySelector(selector);
    const pasos = form.querySelectorAll("fieldset");
    let actual = 0;   // el paso que se está viendo (empieza en 0)

    // 1. Dibujar los círculos de arriba, uno por paso
    const circulos = document.createElement("div");
    circulos.className = "pasos-circulos";
    pasos.forEach(function (paso, i) {
        circulos.innerHTML += `
            <div class="pasos-circulo">
                <span>${i + 1}</span>
                <small>${paso.dataset.paso}</small>
            </div>`;
    });
    form.prepend(circulos);

    // 2. Agregar los botones Atrás y Siguiente
    const botones = document.createElement("div");
    botones.className = "pasos-botones";
    botones.innerHTML = `
        <button type="button" class="pasos-atras">← Atrás</button>
        <button type="submit" class="pasos-siguiente"></button>`;
    form.append(botones);

    const btnAtras = botones.querySelector(".pasos-atras");
    const btnSiguiente = botones.querySelector(".pasos-siguiente");

    // 3. Mostrar solo el paso actual y pintar los círculos
    function mostrar() {
        pasos.forEach(function (paso, i) {
            paso.hidden = i !== actual;
        });
        circulos.querySelectorAll(".pasos-circulo").forEach(function (circulo, i) {
            circulo.classList.toggle("hecho", i < actual);
            circulo.classList.toggle("activo", i === actual);
        });
        btnAtras.hidden = actual === 0;
        const esElUltimo = actual === pasos.length - 1;
        btnSiguiente.textContent = esElUltimo
            ? (opciones.textoEnviar || "Enviar")
            : (opciones.textoSiguiente || "Siguiente") + " →";
    }

    // 4. Revisar los campos del paso actual antes de avanzar
    function pasoCorrecto() {
        let todoBien = true;
        pasos[actual].querySelectorAll("input, select, textarea").forEach(function (campo) {
            const valor = campo.value.trim();
            const revisar = window[campo.dataset.validar];   // ej. validarCorreo de utileria.js
            let error = "";

            if (campo.required && valor === "") {
                error = "Este campo es obligatorio";
            } else if (revisar && valor !== "" && !revisar(valor)) {
                error = campo.dataset.error || "Revisa este dato";
            }

            // Mensaje debajo del campo (se crea la primera vez)
            let mensaje = campo.nextElementSibling;
            if (!mensaje || !mensaje.classList.contains("pasos-error")) {
                mensaje = document.createElement("small");
                mensaje.className = "pasos-error";
                campo.after(mensaje);
            }
            mensaje.textContent = error;
            campo.classList.toggle("pasos-mal", error !== "");
            if (error) todoBien = false;
        });
        return todoBien;
    }

    // 5. Botón Siguiente: si todo está bien, avanza o termina
    form.addEventListener("submit", function (evento) {
        evento.preventDefault();          // que la página no se recargue
        if (!pasoCorrecto()) return;

        if (actual < pasos.length - 1) {
            actual++;
            mostrar();
        } else {
            terminar();
        }
    });

    // 6. Botón Atrás
    btnAtras.addEventListener("click", function () {
        actual--;
        mostrar();
    });

    // 7. Al terminar: todo palomeado y un mensaje de gracias
    function terminar() {
        const datos = Object.fromEntries(new FormData(form));
        console.log("Datos enviados:", datos);

        pasos.forEach(function (paso) { paso.hidden = true; });
        botones.hidden = true;
        circulos.querySelectorAll(".pasos-circulo").forEach(function (c) {
            c.classList.add("hecho");
            c.classList.remove("activo");
        });

        const final = document.createElement("p");
        final.className = "pasos-final";
        final.textContent = opciones.mensajeFinal || "¡Listo! Tus datos se enviaron.";
        form.append(final);

        if (opciones.alTerminar) opciones.alTerminar(datos);
    }

    mostrar();   // arrancar mostrando el primer paso
}
