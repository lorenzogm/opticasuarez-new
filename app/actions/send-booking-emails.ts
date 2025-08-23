interface BookingDetails {
  appointmentType: string;
  location: string;
  date: string;
  period: string;
  name: string;
  age: string;
  phone: string;
  email: string;
  observations: string;
}

const appointmentTypes = {
  'phone-consultation': 'Cita telefónica',
  'refraction-exam': 'Cita refracción',
  'visual-efficiency-eval': 'Cita Evaluación de eficacia visual',
  'child-exam': 'Cita Examen Infantil',
  'contact-lens': 'Cita Contactología',
  'sports-vision': 'Cita Visión Deportiva',
};

const appointmentDurations = {
  'phone-consultation': '10 minutos',
  'refraction-exam': '30 minutos',
  'visual-efficiency-eval': '60 minutos',
  'child-exam': '60 minutos',
  'contact-lens': '60 minutos',
  'sports-vision': '60 minutos',
};

const locations = {
  centro: {
    name: 'Óptica Suárez Centro',
    address: 'Paseo de la Estación 12, Jaén (23003-Jaén)',
    email: 'centro@opticasuarezjaen.es',
  },
  bulevar: {
    name: 'Óptica Suárez Bulevar',
    address: 'Calle Canarias 6, Jaén (23009 - Jaén)',
    email: 'bulevar@opticasuarezjaen.es',
  },
};

const periods = {
  morning: 'Mañana (9:00-12:00)',
  afternoon: 'Tarde (17:00-20:00)',
};

export async function sendBookingEmails(bookingDetails: BookingDetails) {
  try {
    const selectedLocation = locations[bookingDetails.location as keyof typeof locations];
    const selectedDate = new Date(bookingDetails.date);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // Email content for Óptica Suárez
    const opticaEmailContent = `
Nueva cita reservada en Óptica Suárez

Detalles de la cita:
- Tipo de servicio: ${appointmentTypes[bookingDetails.appointmentType as keyof typeof appointmentTypes]}
- Duración: ${appointmentDurations[bookingDetails.appointmentType as keyof typeof appointmentDurations]}
- Centro: ${selectedLocation?.name || 'No especificado'}
- Dirección: ${selectedLocation?.address || ''}
- Fecha: ${formatDate(selectedDate)}
- Horario: ${periods[bookingDetails.period as keyof typeof periods] || bookingDetails.period}

Datos del cliente:
- Nombre: ${bookingDetails.name}
- Edad: ${bookingDetails.age} años
- Teléfono: ${bookingDetails.phone}
- Email: ${bookingDetails.email}
${bookingDetails.observations ? `- Observaciones: ${bookingDetails.observations}` : ''}

Reserva realizada el: ${new Date().toLocaleString('es-ES')}
    `;

    // Email content for the customer
    const customerEmailContent = `
¡Gracias por tu reserva en Óptica Suárez!

Hola ${bookingDetails.name},

Tu cita ha sido confirmada exitosamente. Aquí tienes los detalles:

Detalles de tu cita:
- Tipo de servicio: ${appointmentTypes[bookingDetails.appointmentType as keyof typeof appointmentTypes]}
- Centro: ${selectedLocation?.name || 'No especificado'}
- Dirección: ${selectedLocation?.address || ''}
- Fecha: ${formatDate(selectedDate)}
- Horario: ${periods[bookingDetails.period as keyof typeof periods] || bookingDetails.period}

Información importante:
• Llega 10 minutos antes de tu cita
• Si necesitas cancelar o modificar tu cita, contacta con nosotros
• Recuerda traer tu DNI y cualquier gafa o lentilla que uses actualmente

Si tienes alguna pregunta, no dudes en contactarnos:
- Teléfono: ${bookingDetails.location === 'centro' ? '953 22 00 00' : '953 27 00 00'}
- Email: ${selectedLocation?.email}

¡Te esperamos!

Óptica Suárez
    `;

    // In a real implementation, you would send actual emails here
    // For now, we'll log them as the current system does
    console.log(`Email que se enviaría a optica@lorenzogm.com:`);
    console.log(opticaEmailContent);
    
    console.log(`\nEmail que se enviaría a ${bookingDetails.email}:`);
    console.log(customerEmailContent);

    // TODO: Replace with actual email sending service
    // Example:
    // await sendEmail({
    //   to: 'optica@lorenzogm.com',
    //   subject: 'Nueva cita reservada - Óptica Suárez',
    //   text: opticaEmailContent
    // });
    //
    // await sendEmail({
    //   to: bookingDetails.email,
    //   subject: 'Confirmación de cita - Óptica Suárez',
    //   text: customerEmailContent
    // });

    return { success: true };
  } catch (error) {
    console.error('Error sending booking emails:', error);
    return { 
      success: false, 
      error: 'Ha ocurrido un error al enviar los emails de confirmación.' 
    };
  }
}