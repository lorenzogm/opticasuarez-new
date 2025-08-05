import { Text } from '../../components/text';
import ServicesGrid from '../../sections/services-grid';
import BookAppointment from '../../sections/book-appointment';
import Locations from '../../sections/locations';
import content from '../../../content/servicios.json';

export default function Servicios() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-white py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <Text
            as="h1"
            size="4xl"
            weight="bold"
            className="mb-6 text-gray-900 uppercase tracking-wide"
          >
            {content.title}
          </Text>
          <Text
            as="p"
            size="xl"
            className="text-gray-600 max-w-3xl mx-auto mb-4"
          >
            {content.subtitle}
          </Text>
          <Text
            as="p"
            size="lg"
            className="text-gray-600 max-w-4xl mx-auto"
          >
            {content.description}
          </Text>
        </div>
      </section>

      {/* Services Grid */}
      <ServicesGrid items={content.services} />

      {/* Call to Action */}
      <BookAppointment
        title="Agenda tu cita hoy"
        description="Obtén un examen visual completo con nuestros especialistas. Agenda tu cita y cuida tu salud visual."
        buttonText="Reservar Cita"
      />

      {/* Locations */}
      <Locations 
        title="¿DÓNDE ESTAMOS?"
        locations={[
          {
            name: "Óptica Bulevar",
            image: "/images/homepage/locations/optica-bulevar.jpg",
            address: "C. de Canarias, 6, 23009 Jaén",
            schedule: {
              weekdays: "Lunes a Viernes",
              weekdaysHours: "9:30 a 13:30 y 17:00 a 20:30",
              saturday: "Sábados",
              saturdayHours: "10:00 a 13:00"
            },
            phone: "953-093-062",
            phoneUrl: "https://api.whatsapp.com/send?phone=953093062",
            email: "bulevar@opticasuarezjaen.es",
            contactUrl: "/contacto"
          },
          {
            name: "Óptica Centro",
            image: "/images/homepage/locations/optica-centro.jpg",
            address: "P.º de la Estación, 12, 23003 Jaén",
            schedule: {
              weekdays: "Lunes a Viernes",
              weekdaysHours: "9:30 a 13:30 y 17:00 a 20:30",
              saturday: "Sábados",
              saturdayHours: "10:00 a 13:00"
            },
            phone: "953-223-180",
            phoneUrl: "https://api.whatsapp.com/send?phone=953223180",
            email: "centro@opticasuarezjaen.es",
            contactUrl: "/contacto"
          }
        ]} 
      />
    </main>
  );
}