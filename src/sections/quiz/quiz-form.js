'use client';

import { PropTypes } from 'prop-types';
import { toast } from 'react-toastify';
import { useRef, useState, useEffect } from 'react';

// import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import { axiosClient } from 'src/utils/axiosClient';
import { useUserStore } from 'src/states/auth-store';
import { quizProgress } from 'src/states/quiz-progress';
import { useResponsive } from 'src/hooks/use-responsive';
import ElearningCourseDetailsLessonItem from 'src/sections/_elearning/details/elearning-course-details-quiz-item';

import QuizHookForm from './quiz-hook-form';
import { shuffleArray } from './utils/shuffle-array';
import { coursesCertificatesFilter } from './utils/quiz-score-filter';

export default function QuizForm(props) {
  const currentDate = new Date();

  const {
    _questions,
    hasBoughtCourse,
    courseName,
    courseId,
    score,
    finalQuiz,
    title,
    metaDataId,
    unitId,
    userLessonData,
  } = props;

  const [quizOpen, setOpen] = useState(false);

  const [startTime, setStartTime] = useState(0);

  const [popupOpen, setPopupOpen] = useState(false);

  const [quizScore, setQuizScore] = useState([]);

  const inputRef = useRef();

  const toggleQuiz = quizProgress((state) => state.toggleQuiz);
  const [userData, updateUserData] = useUserStore((state) => [
    state.UserData,
    state.updateUserData,
  ]);

  useEffect(() => {
    const fetchScore = async () => {
      const data = await axiosClient.get('/api/quiz-scores');

      setQuizScore(
        data?.data.data.filter((scoreData) => userData.username === scoreData.attributes.username)
      );
    };
    fetchScore();
  }, [userData.username]);

  const handlePopupOpen = () => {
    if (
      coursesCertificatesFilter(quizScore).filter(
        (data) => data.attributes.courseTitle === courseName.title
      ).length
    ) {
      toast.info('Course completed, no access to final test.', {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
      return;
    }
    setPopupOpen(true);
  };

  const handlePopupClose = () => {
    setPopupOpen(false);
  };

  const questions = shuffleArray(_questions).slice(0, 10);

  questions.forEach((question) => {
    question.options = shuffleArray(question.options);
  });

  const mdUp = useResponsive('up', 'md');

  const handleSubmit = async (formJson) => {
    updateUserData({
      ...userData,
      firstname: formJson.firstname,
      lastname: formJson.lastname,
    });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userData.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData.authToken}`,
          },
          body: JSON.stringify({
            firstname: formJson.firstname,
            lastname: formJson.lastname,
          }),
        }
      );
      console.log(response);
      if (response.ok) {
        handlePopupClose();
        handleClickOpen();
      } else {
        toast.error('Please try again');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClickOpen = () => {
    if (hasBoughtCourse) {
      toggleQuiz(true);
      setOpen(true);
      setStartTime(currentDate.toLocaleString());
    } else
      toast.error('Please buy the course to start the test', {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
  };
  const handleModalClose = () => {
    toggleQuiz(false);
    setOpen(false);
  };

  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiCard-root': {
      padding: theme.spacing(2),
      width: '100%',
      height: '100%',
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
    // '& .MuiDialog-container>.MuiPaper-root': mdUp && {
    //   minWidth: '600px',
    // },
  }));

  const bootstrapDialogProperties = {
    fullWidth: true,
  };

  return (
    <>
      <ElearningCourseDetailsLessonItem
        handleClickOpen={() => {
          if (finalQuiz) handlePopupOpen();
          else handleClickOpen();
        }}
        questionsLength={questions?.length}
        isTest
        quizIcon
        finalQuiz
        title={title}
      />
      {/* <img src="src/icons/note.svg" alt="quiz" height={20} width={20} />
        Start Test
      </ElearningCourseDetailsLessonItem> */}
      {/* {finalQuiz && ( */}
      <Dialog
        open={popupOpen}
        onClose={handlePopupClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            handleSubmit(formJson);
            handlePopupClose();
          },
        }}
      >
        <DialogTitle>Alert</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide first name and last name, This details will be displayed on certificate.
          </DialogContentText>

          <TextField
            autoFocus
            required
            margin="normal"
            id="firstname"
            name="firstname"
            label="First Name"
            type="text"
            fullWidth
            variant="outlined"
          />
          <TextField
            autoFocus
            required
            margin="normal"
            id="lastname"
            name="lastname"
            label="Last Name"
            type="text"
            fullWidth
            variant="outlined"
          />
          <DialogContentText color="red">
            *To successfully finish the course, a minimum score of 90% is required.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePopupClose}>Cancel</Button>
          <Button
            type="submit"
            // onClick={(e) => {
            //   handlePopupClose();
            //   handleClickOpen();
            // }}
            color="primary"
            variant="outlined"
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
      {/* )} */}
      <BootstrapDialog
        fullScreen
        aria-labelledby="customized-dialog-title"
        open={hasBoughtCourse && quizOpen}
        maxWidth="lg"
        {...(!mdUp && bootstrapDialogProperties)}
      >
        <QuizHookForm
          metaDataId={metaDataId}
          userLessonData={userLessonData}
          unitId={unitId}
          setPopupOpenOne={setPopupOpen}
          questions={questions}
          courseName={courseName}
          courseId={courseId}
          handleModalClose={handleModalClose}
          startTime={startTime}
          score={score}
          name={inputRef.current}
        />
      </BootstrapDialog>
    </>
  );
}

QuizForm.propTypes = {
  _questions: PropTypes.array,
  hasBoughtCourse: PropTypes.bool,
  courseName: PropTypes.any,
  courseId: PropTypes.string,
  score: PropTypes.bool,
  finalQuiz: PropTypes.bool,
  title: PropTypes.string,
  metaDataId: PropTypes.string,
  unitId: PropTypes.string,
  userLessonData: PropTypes.any,
};
