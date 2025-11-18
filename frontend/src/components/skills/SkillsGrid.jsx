import { motion } from 'framer-motion';
import SkillCard from './SkillCard';
import { ANIMATION_VARIANTS, STAGGER_CONTAINER } from '../../utils/constants';
import { useLanguage } from '../../hooks/useLanguage';

const SkillsGrid = ({ skills }) => {
  const { t } = useLanguage();

  if (skills.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('skills.noResults')}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {skills.map((skill) => (
        <motion.div key={skill.id} variants={ANIMATION_VARIANTS.slideUp}>
          <SkillCard skill={skill} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SkillsGrid;
