'use client';

import axios from 'axios';
// import axios from 'axios';
import PropTypes from 'prop-types';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Backdrop from '@mui/material/Backdrop';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import Iconify from 'src/components/iconify';
import { axiosClient } from 'src/utils/axiosClient';
import { useUserStore } from 'src/states/auth-store';
import { useResponsive } from 'src/hooks/use-responsive';
import ElearningCourseDetailsQuestionList from 'src/sections/_elearning/details/elearning-course-details-question-item';
import ElearningCourseDetailsQuestionSubmit from 'src/sections/_elearning/details/elearning-course-details-question-submit';

import Result from './result';
import QuestionCard from './question-card';

// ----------------------------------------------------------------------

export default function QuizHookForm(props) {
  const currentDate = new Date();

  const {
    questions,
    handleModalClose,
    courseName,
    courseId,
    score,
    startTime,
    setPopupOpenOne,
    unitId,
    metaDataId,
    userLessonData,
  } = props;

  const { UserData } = useUserStore();

  const [endTime, setEndTime] = useState(0);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([...Array(questions.length)]);
  const [areAllAnswersMarked, setAreAllAnswersMarked] = useState(false);
  useEffect(() => {
    setAreAllAnswersMarked(answers.filter((answer) => answer === undefined).length === 0);
  }, [answers]);

  const [finishedQuiz, setFinishedQuiz] = useState(false);
  const currentQuestion = questions[currentQuestionIndex];

  const [popupOpen, setPopupOpen] = useState(false);
  const handlePopupToggle = () => {
    setPopupOpen((prev) => !prev);
  };

  const [submitPopupOpen, setSubmitPopupOpen] = useState(false);
  const handleSubmitPopupToggle = () => {
    setSubmitPopupOpen((prev) => !prev);
  };

  const mdUp = useResponsive('up', 'md');
  const submitButtonScrollStyles = mdUp
    ? { maxHeight: '70vh', overflowY: 'scroll' }
    : { maxHeight: '30vh', overflowY: 'scroll' };

  const goToPrevious = () => {
    setCurrentQuestionIndex((prevState) => prevState - 1);
  };

  const capitalizeFirstLetter = (string) => string?.replace(/\b\w/g, (char) => char.toUpperCase()) || '';

  const goToNext = () => {
    if (currentQuestionIndex + 1 !== questions.length) {
      setCurrentQuestionIndex((prevState) => prevState + 1);
    }
  };

  const goToIndex = (index) => {
    setCurrentQuestionIndex(index);
  };

  const submitAnswer = (index, value) => {
    setAnswers((prevState) => {
      const newAnswers = [...prevState];
      newAnswers[index] = value;
      return newAnswers;
    });
  };

  const userToken = localStorage.getItem('token');

  const correctAnswers = useMemo(
    () =>
      questions.filter((q, i) =>
        typeof answers[i] === 'object'
          ? // eslint-disable-next-line no-undef
            areArraysEqual(q.correctAnswer, answers[i])
          : q.correctAnswer === answers[i]
      ).length,
    [answers, questions]
  );

  console.log('UserData', UserData);

  async function addScoreToStrapi() {
    // Ensure courseId is a number for Strapi relation
    const courseIdNum = courseId ? parseInt(courseId, 10) : null;

    console.log('addScoreToStrapi - courseId:', courseId, 'parsed:', courseIdNum);

    const requestBody = {
      data: {
        username: UserData.username,
        courseTitle: courseName.title,
        score: String(correctAnswers),
        email: UserData.email,
        firstname: capitalizeFirstLetter(UserData?.firstname),
        lastname: capitalizeFirstLetter(UserData?.lastname),
        user: UserData.id,
        course: courseIdNum,
        totalQuestions: questions.length,
      },
    };
    try {
      console.log('Submitting quiz score with data:', JSON.stringify(requestBody, null, 2));
      const response = await axiosClient.post('/api/quiz-scores', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  const addingUnitToUser = async () => {
    console.log({ unitId });
    console.log(userLessonData);
    console.log('add unit to user');
    // const requiredData = [...new Set([...userLessonData, { LessonTitle: id }])];
    // const isMetaDataExisting = userLessonData.filter((details) => details.LessonTitle === id);
    // eslint-disable-next-line object-shorthand
    const requiredData = [userLessonData, { unitId }];

    // if (isMetaDataExisting.length > 0 || !metaDataId) return;
    console.log({ requiredData });
    const requestBody = {
      data: {
        data: requiredData,
      },
    };
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_METADATA_URL}/${metaDataId.id}`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });
      // queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    } catch (error) {
      console.log(error);
    }
  };

  // console.log('correctAnswers', correctAnswers);
  const submitQuiz = () => {
    setFinishedQuiz(true);
    addingUnitToUser();

    setEndTime(currentDate.toLocaleString());

    if (score) {
      addScoreToStrapi();
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([...Array(questions.length)]);
    setFinishedQuiz(false);
    setPopupOpen(false);
    setSubmitPopupOpen(false);
    setAreAllAnswersMarked(false);
  };

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        onClick={finishedQuiz ? handleModalClose : handlePopupToggle}
        aria-label="close"
      >
        <Iconify icon="mdi:close" className="absolute left-5 top-3 z-10" />
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={popupOpen}
          onClick={handlePopupToggle}
        >
          <Dialog
            open={popupOpen}
            onClose={handlePopupToggle}
            aria-describedby="popup-confirmation"
          >
            <DialogTitle>Close Quiz?</DialogTitle>
            <DialogContent>
              <DialogContentText id="popup-confirmation">
                You will lose all your progress if you close the quiz.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleModalClose} variant="outlined" color="error">
                Close
              </Button>
              <Button onClick={handlePopupToggle} variant="outlined">
                Continue Quiz
              </Button>
            </DialogActions>
          </Dialog>
        </Backdrop>
      </IconButton>
      <div className="p-5">
        {finishedQuiz ? (
          <Result
            metaDataId={metaDataId}
            unitId={unitId}
            setPopupOpenOne={setPopupOpenOne}
            handleModalClose={handleModalClose}
            restartQuiz={restartQuiz}
            answers={answers}
            questions={questions}
            startTime={startTime}
            endTime={endTime}
          />
        ) : (
          <Grid direction={{ xs: 'column-reverse', md: 'row' }} container className="h-full">
            <Grid item md={4} className="md:px-5 h-fit">
              <Card variant="outlined">
                <Stack direction="column">
                  <Box className="mb-2">
                    <span className="text-lg font-bold">Questions</span>
                    <Box className="flex items-center">
                      <div className="bg-green-200 rounded-full h-4 w-4 mr-2" />
                      <span>Correct Answer</span>
                      <div className="bg-red-200 rounded-full h-4 w-4 mx-2" />
                      <span>Wrong Answer</span>
                    </Box>
                    <Box className="flex items-center">
                      <div className="bg-gray-200 rounded-full h-4 w-4 mr-2" />
                      <span>Unattempted</span>
                    </Box>
                  </Box>
                  <Box
                    style={submitButtonScrollStyles}
                    sx={{
                      scrollbarWidth: 'thin',
                      '&::-webkit-scrollbar': {
                        width: '0.2em',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#888',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: '#555',
                      },
                    }}
                  >
                    {questions.map((question, index) => (
                      <ElearningCourseDetailsQuestionList
                        key={question.id}
                        question={question}
                        answers={answers}
                        index={index}
                        goToIndex={goToIndex}
                        isCurrentQuestion={currentQuestionIndex === index}
                      />
                    ))}
                  </Box>
                  <ElearningCourseDetailsQuestionSubmit
                    areAllAnswersMarked={areAllAnswersMarked}
                    submitQuiz={submitQuiz}
                    submitPopupOpen={submitPopupOpen}
                    handleSubmitPopupToggle={handleSubmitPopupToggle}
                  />
                </Stack>
              </Card>
            </Grid>

            <Grid item md={8} className="h-fit">
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                submitAnswer={submitAnswer}
                islastQuestion={currentQuestionIndex + 1 === questions.length}
                goToPrevious={goToPrevious}
                selectedValue={answers[currentQuestionIndex] || null}
                goToNext={goToNext}
                areAllAnswersMarked={areAllAnswersMarked}
                handleSubmitPopupToggle={handleSubmitPopupToggle}
              />
            </Grid>
          </Grid>
        )}
      </div>
    </>
  );
}

QuizHookForm.propTypes = {
  questions: PropTypes.array.isRequired,
  handleModalClose: PropTypes.func.isRequired,
  courseName: PropTypes.any,
  courseId: PropTypes.string,
  score: PropTypes.bool,
  startTime: PropTypes.any,
  setPopupOpenOne: PropTypes.bool,
  metaDataId: PropTypes.string,
  unitId: PropTypes.string,
  userLessonData: PropTypes.any,
};
