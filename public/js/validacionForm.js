document.getElementById('formulario').addEventListener('submit', function(event) {
            // Validar campos vacíos
            const nombreInstitucion = document.querySelector('input[name="nombre_institucion"]').value.trim();
            const apellidosRepresentante = document.querySelector('input[name="apellidos_representante"]').value.trim();
            const nombresRepresentante = document.querySelector('input[name="nombres_representante"]').value.trim();
            const dniRepresentante = document.querySelector('input[name="dni_representante"]').value.trim();
            const correoElectronico = document.querySelector('input[name="correo_electronico"]').value.trim();
            const fichaPostulante = document.querySelector('input[name="ficha_postulante"]').files[0];
            const fichaInvencion = document.querySelector('input[name="ficha_invencion"]').files[0];
            const actaCompromiso = document.querySelector('input[name="acta_compromiso"]').files[0];

            if (!nombreInstitucion || !apellidosRepresentante || !nombresRepresentante || !dniRepresentante || !correoElectronico) {
                alert('Todos los campos obligatorios deben ser completados.');
                event.preventDefault();
                return;
            }

            // Validar DNI
            const dniRegex = /^\d{8}$/;
            if (!dniRegex.test(dniRepresentante)) {
                alert('El DNI debe contener 8 caracteres numéricos.');
                event.preventDefault();
                return;
            }

            // Validar correo electrónico
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correoElectronico)) {
                alert('El correo electrónico no es válido.');
                event.preventDefault();
                return;
            }

            // Validar formato de archivos
            if (fichaPostulante) {
                const allowedExtensionsFichaPostulante = /(\.xls|\.xlsx)$/i;
                if (!allowedExtensionsFichaPostulante.exec(fichaPostulante.name)) {
                    alert('La ficha del postulante debe estar en formato Excel (.xls, .xlsx).');
                    event.preventDefault();
                    return;
                }
            }

            if (fichaInvencion) {
                const allowedExtensionsFichaInvencion = /(\.pdf|\.doc|\.docx)$/i;
                if (!allowedExtensionsFichaInvencion.exec(fichaInvencion.name)) {
                    alert('La ficha de la invención debe estar en formato PDF o Word (.pdf, .doc, .docx).');
                    event.preventDefault();
                    return;
                }
            }

            if (actaCompromiso) {
                const allowedExtensionsActaCompromiso = /(\.pdf|\.doc|\.docx)$/i;
                if (!allowedExtensionsActaCompromiso.exec(actaCompromiso.name)) {
                    alert('El acta de compromiso debe estar en formato PDF o Word (.pdf, .doc, .docx).');
                    event.preventDefault();
                    return;
                }
            }
        });