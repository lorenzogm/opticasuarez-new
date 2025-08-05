import BookAppointment from '../../sections/book-appointment';
import Hero from '../../sections/hero';
import ServicesGrid from '../../sections/services-grid';
import Navigation from '../../components/navigation';
import content from '../../../content/homepage.json';

export default function Homepage() {
  return (
    <>
      <Navigation />
      <main>
        <Hero
          title={content.hero.title}
          subtitle={content.hero.subtitle}
          description={content.hero.description}
          cta={content.hero.cta}
        />
        <ServicesGrid items={content.servicesGrid.items} />
        <BookAppointment
          title={content.bookAppointment.title}
          description={content.bookAppointment.description}
          buttonText={content.bookAppointment.buttonText}
        />
      </main>
    </>
  );
}
