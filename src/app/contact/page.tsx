'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import emailjs from '@emailjs/browser';

const services = [
  { value: 'custom-design', label: 'Custom Kitchen Design' },
  { value: 'renovation', label: 'Kitchen Renovation' },
  { value: 'modular', label: 'Modular Solutions' },
  { value: 'material', label: 'Material Selection' },
];

// Create a separate component for the form content
const ContactForm = () => {
  const searchParams = useSearchParams();
  const [selectedService, setSelectedService] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam) {
      setSelectedService(serviceParam);
      const serviceName = services.find(s => s.value === serviceParam)?.label || '';
      setMessage(`I'm interested in your ${serviceName} service. Please provide more information.`);
    }
  }, [searchParams]);

  useEffect(() => {
    // Initialize EmailJS
    emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '');
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    const form = e.target as HTMLFormElement;
    const formData = {
      from_name: (form.elements.namedItem('name') as HTMLInputElement).value,
      from_email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone_number: (form.elements.namedItem('phone') as HTMLInputElement).value,
      service: services.find(s => s.value === selectedService)?.label || 'Not specified',
      message: message,
      to_email: 'rakshankitchenlimited@gmail.com',
      to_phone: '+91 9310123565'
    };

    try {
      // Send email via EmailJS
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
        formData
      );

      // Send SMS via our API route
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }

      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your message! We will get back to you soon.'
      });
      form.reset();
      setSelectedService('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus({
        type: 'error',
        message: 'There was an error sending your message. Please try again or contact us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name*
        </label>
        <input
          type="text"
          id="name"
          className="w-full px-4 py-3 border border-gray-200 rounded-none focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200 hover:border-primary"
          placeholder="Enter Your Name"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email*
        </label>
        <input
          type="email"
          id="email"
          className="w-full px-4 py-3 border border-gray-200 rounded-none focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200 hover:border-primary"
          placeholder="Enter Your Email"
          required
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-2">
          Phone Number*
        </label>
        <input
          type="tel"
          id="phone"
          className="w-full px-4 py-3 border border-gray-200 rounded-none focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200 hover:border-primary"
          placeholder="Enter Your Phone Number"
          pattern="[0-9]{10}"
          title="Please enter a valid 10-digit phone number"
          required
        />
      </div>
      <div>
        <label htmlFor="service" className="block text-sm font-medium mb-2">
          Service*
        </label>
        <select
          id="service"
          value={selectedService}
          onChange={(e) => {
            setSelectedService(e.target.value);
            const serviceName = services.find(s => s.value === e.target.value)?.label || '';
            if (serviceName) {
              setMessage(`I'm interested in your ${serviceName} service. Please provide more information.`);
            }
          }}
          className="w-full px-4 py-3 border border-gray-200 rounded-none focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200 hover:border-primary"
          required
        >
          <option value="">Select a Service</option>
          {services.map((service) => (
            <option key={service.value} value={service.value}>
              {service.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-none focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200 hover:border-primary"
          placeholder="Your message..."
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-[#C9A66B] text-white hover:bg-[#B08B57] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

// Main ContactPage component
export default function ContactPage() {
  const { ref: sectionRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <main className="min-h-screen">
      {/* Hero Section with Background */}
      <div className="relative h-[400px] bg-black/60 overflow-hidden">
        <Image
          src="/images/hero-bg.jpg"
          alt="Kitchen Design Background"
          fill
          className="object-cover mix-blend-overlay scale-110 animate-subtle-zoom"
          priority
        />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex flex-col justify-center items-center text-white"
        >
          <div className="container">
            <div className="flex items-center gap-2 text-sm mb-4">
              <Link href="/" className="text-primary hover:text-primary-hover transition-colors">
                HOME
              </Link>
              <span>/</span>
              <span>CONTACT US</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif">Contact Us</h1>
          </div>
        </motion.div>
      </div>

      {/* Contact Form Section */}
      <section className="py-20" ref={sectionRef}>
        <div className="container max-w-2xl mx-auto px-4">
          {/* Form Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-serif mb-4">Get in touch</h2>
            <p className="text-gray-600 mb-8">
              We will be delighted to answer any queries or questions you may have about our kitchen design services by sending this form.
            </p>

            <Suspense fallback={<div>Loading...</div>}>
              <ContactForm />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* Large Logo Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="py-20 bg-black relative overflow-hidden"
      >
        <div className="container relative">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.h2
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-[120px] md:text-[200px] font-serif text-[#C9A66B] text-center select-none relative"
            >
              RAKSHAN KITCHEN
              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-[#C9A66B]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl text-gray-300 mt-4 max-w-2xl mx-auto"
            >
              Crafting Luxury Kitchen Spaces Since 1999
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Footer Section */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-black text-white py-16 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A66B]/20 to-transparent" />
          <div className="grid grid-cols-6 gap-8 transform rotate-12 scale-150">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="h-32 bg-[#C9A66B]/10 rounded-full blur-2xl" />
            ))}
          </div>
        </div>

        <div className="container relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div>
              <h3 className="text-2xl font-serif mb-4 text-[#C9A66B]">RAKSHAN KITCHEN</h3>
              <p className="text-gray-400 mb-6">
                Crafting luxury kitchen spaces with precision and passion since 1999.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/rakshankitchen" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#C9A66B] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-[#C9A66B] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-[#C9A66B] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-[#C9A66B] transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-medium mb-4">Contact Us</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">
                  <a href="tel:+919310123565" className="hover:text-[#C9A66B] transition-colors">
                    +91 9310123565
                  </a>
                </li>
                <li className="text-gray-400">
                  <a href="mailto:rakshankitchenlimited@gmail.com" className="hover:text-[#C9A66B] transition-colors">
                    rakshankitchenlimited@gmail.com
                  </a>
                </li>
                <li className="text-gray-400">
                  <a href="https://maps.google.com/?q=RAKSHAN+KITCHEN+AND+LIGHT,+Sector+7,+Rohini,+Delhi,+110085" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A66B] transition-colors">
                    Sector 7, Rohini, Delhi, 110085
                  </a>
                </li>
              </ul>
            </div>

            {/* Business Hours */}
            <div>
              <h4 className="text-lg font-medium mb-4">Business Hours</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Monday - Saturday</li>
                <li>10:00 AM - 8:00 PM</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} RAKSHAN KITCHEN. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </main>
  );
} 