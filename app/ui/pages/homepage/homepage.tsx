import BookAppointment from '../../sections/book-appointment';
import content from '../../../content/homepage.json';

export default function Homepage() {
  return (
    <main>
      <BookAppointment
        title={content.bookAppointment.title}
        description={content.bookAppointment.description}
        buttonText={content.bookAppointment.buttonText}
      />
    </main>
  );
}
