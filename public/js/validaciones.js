function validarTelefono(input) {
  const errorSpan = document.getElementById("error-telefono");

  // Solo evalúa caracteres incorrectos si el campo tiene texto
  if (input.value && /[^0-9]/.test(input.value)) {
    errorSpan.style.display = "block";
    input.value = input.value.replace(/[^0-9]/g, "");
  } else {
    errorSpan.style.display = "none";
  }
}

function validarDNI(input) {
  const errorSpan = document.getElementById("error-dni");

  // Si el valor contiene algo que NO sea un número del 0 al 9
  if (/[^0-9]/.test(input.value)) {
    errorSpan.style.display = "block"; // Mostramos el cartel rojo
    input.value = input.value.replace(/[^0-9]/g, ""); // Limpiamos las letras
  } else {
    errorSpan.style.display = "none"; // Ocultamos el cartel si está limpio
  }
}

function validarEdad(input) {
  if (!input.value) {
    input.setCustomValidity("");
    return;
  }

  // Convertimos la fecha ingresada por el usuario
  const [anio, mes, dia] = input.value.split("-").map(Number);
  const fechaNacimiento = new Date(anio, mes - 1, dia);

  // Calculamos la fecha exacta de hoy menos 18 años
  const hoy = new Date();
  const fechaLimite = new Date(
    hoy.getFullYear() - 18,
    hoy.getMonth(),
    hoy.getDate(),
  );

  // Si la fecha de nacimiento es posterior a la límite, es menor de 18
  if (fechaNacimiento > fechaLimite) {
    input.setCustomValidity(
      "El alumno debe ser mayor de 18 años para inscribirse.",
    );
    input.reportValidity(); // Muestra el cartel de error nativo del navegador inmediatamente
  } else {
    input.setCustomValidity(""); // Remueve el error y permite enviar
  }
}