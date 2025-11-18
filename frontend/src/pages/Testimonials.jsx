import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import testimonialsService from '../services/testimonials.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ANIMATION_VARIANTS, STAGGER_CONTAINER } from '../utils/constants';

const Testimonials = () => {
  const { t } = useLanguage();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await testimonialsService.getAll();
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        <motion.div
          variants={ANIMATION_VARIANTS.slideDown}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            {t('testimonials.title')}
          </h1>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        {testimonials.length === 0 ? (
          <div className="text-center py-16">
            <Quote className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('testimonials.noTestimonials')}
            </p>
          </div>
        ) : (
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                variants={ANIMATION_VARIANTS.slideUp}
                className="card p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold">
                      {testimonial.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold">{testimonial.name}</h3>
                    {testimonial.position && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.position}
                        {testimonial.company && ` - ${testimonial.company}`}
                      </p>
                    )}
                  </div>
                </div>

                {testimonial.rating && (
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <Quote className="w-8 h-8 text-primary-600 opacity-20 mb-2" />
                <p className="text-gray-700 dark:text-gray-300 italic">
                  {testimonial.message}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Testimonials;
