import styles from './TestimonialsSection.module.css';

const TestimonialsSection = () => {
  const testimonials = [
    {
      text: "CodeSync has transformed how we conduct technical interviews. The real-time collaboration makes it easy to assess candidates' problem-solving skills.",
      name: "Sarah Johnson",
      role: "CTO at TechCorp",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      text: "As a coding instructor, CodeSync has been invaluable. My students can follow along in real-time and we can debug together instantly.",
      name: "Michael Chen",
      role: "Lead Instructor at CodeAcademy",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      text: "Our remote team uses CodeSync daily for pair programming. It's like we're sitting next to each other, even though we're continents apart.",
      name: "Emma Rodriguez",
      role: "Senior Developer at RemoteDev",  
      image: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];

  return (
    <section id="testimonials" className={`${styles.section} ${styles.bgDark} section`}>
      <div className="container">
        <h2 className={`${styles.sectionTitle} section-title text-center animate__animated animate__fadeIn`}>
          What Developers Say
        </h2>
        <div className="row g-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="col-md-4">
              <div className={`${styles.testimonialCard} animate__animated animate__fadeInUp ${styles[`delay-${index + 1}`]}`}>
                <p className={styles.testimonialText}>{testimonial.text}</p>
                <div className={styles.testimonialAuthor}>
                  <img src={testimonial.image} alt={testimonial.name} className={styles.testimonialAvatar} />
                  <div>
                    <h5 className="mb-0">{testimonial.name}</h5>
                    <small className="text-muted">{testimonial.role}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;