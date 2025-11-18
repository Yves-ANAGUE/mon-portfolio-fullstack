import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // ✅ Ajout de l'import

const SkillCard = ({ skill }) => {
  const { t } = useTranslation(); // ✅ Récupère la fonction t()

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="card p-6 text-center"
    >
      {skill.icon && (
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <img
            src={skill.icon}
            alt={skill.name}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">{skill.name}</h3>

      {skill.level !== undefined && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t('skills.level')}
            </span>
            <span className="font-medium text-primary-600">{skill.level}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${skill.level}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-primary-500 to-purple-600 rounded-full"
            />
          </div>
        </div>
      )}

      {skill.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {skill.description}
        </p>
      )}

      {skill.category && (
        <span className="inline-block mt-3 px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {skill.category}
        </span>
      )}
    </motion.div>
  );
};

export default SkillCard;
