import Servicios from '../ui/pages/servicios/servicios';

export function meta() {
  return [
    { title: 'Servicios | Óptica Suárez - Especialistas en salud visual' },
    {
      name: 'description',
      content:
        'Descubre todos nuestros servicios especializados en salud visual: examen visual, terapia visual, contactología, visión pediátrica, control de miopía y visión deportiva.',
    },
  ];
}

export default function ServiciosPage() {
  return <Servicios />;
}