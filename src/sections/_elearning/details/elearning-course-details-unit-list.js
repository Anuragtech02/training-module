'use client';

import PropTypes from 'prop-types';

import Typography from '@mui/material/Typography';

import Quiz from 'src/sections/quiz';
// import { _questions } from 'src/_mock';

import ElearningCourseDetailsUnitItem from './elearning-course-details-unit-item';

// ----------------------------------------------------------------------

export default function ElearningCourseDetailsLessonList({
  units,
  quiz,
  hasBoughtCourse,
  courseName,
  courseId,
  refProp,
}) {
  const score = true;
  return (
    <div>
      <Typography ref={refProp} variant="h4" sx={{ mb: 3 }}>
        Units
      </Typography>

      {units?.map((unit, index) => (
        <ElearningCourseDetailsUnitItem
          hasBoughtCourse={hasBoughtCourse}
          courseName={courseName}
          key={index}
          unit={unit.attributes}
          index={index}
          unitId={unit.id}
        />
      ))}
      <Quiz
        _questions={quiz}
        courseName={courseName}
        courseId={courseId}
        score={score}
        hasBoughtCourse={hasBoughtCourse}
        finalQuiz
        title="Final Test"
      />
    </div>
  );
}

ElearningCourseDetailsLessonList.propTypes = {
  units: PropTypes.array,
  hasBoughtCourse: PropTypes.bool,
  quiz: PropTypes.any,
  courseName: PropTypes.any,
  courseId: PropTypes.string,
  refProp: PropTypes.any,
};
