export const coursesCertificatesFilter = (quizScore) => {
  const courseScores = {};

  quizScore.forEach((quizData) => {
    const { courseTitle, score } = quizData.attributes;

    const numericScore = Number(score);

    if (!courseScores[courseTitle] || numericScore > courseScores[courseTitle].numericScore) {
      courseScores[courseTitle] = {
        ...quizData,
        numericScore,
      };
    }
  });

  const completedCourses = Object.values(courseScores).filter((quizData) => {
    const { score, totalQuestions } = quizData.attributes;
    const total = totalQuestions || 10; // Fallback to 10 for older records
    const percentage = (Number(score) / total) * 100;
    return percentage >= 90;
  });

  return completedCourses;
};
