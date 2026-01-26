import { useMemo } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { areArraysEqual } from '@mui/base';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { paths } from 'src/routes/paths';

const Result = ({
  answers,
  restartQuiz,
  questions,
  endTime,
  startTime,
  setPopupOpenOne,
  handleModalClose,
  metaDataId,
  unitId,
}) => {
  console.log('startTime: ', startTime);
  console.log('endTime: ', endTime);
  const correctAnswers = useMemo(
    () =>
      questions.filter((q, i) =>
        typeof answers[i] === 'object'
          ? areArraysEqual(q.correctAnswer, answers[i])
          : q.correctAnswer === answers[i]
      ).length,
    [answers, questions]
  );

  const percentage = (correctAnswers / questions.length) * 100;
  const isPassing = percentage >= 90;
  let message = '';
  let messageColor = '';

  if (percentage >= 90) {
    message = 'Congratulations! You passed the course! Your certificate has been issued.';
    messageColor = 'success.main';
  } else if (percentage >= 75) {
    message = 'Good effort! You need 90% to pass and receive your certificate. Please try again.';
    messageColor = 'info.main';
  } else if (percentage >= 50) {
    message = 'You need 90% to pass and receive your certificate. Review the material and try again.';
    messageColor = 'warning.main';
  } else {
    message = 'You need 90% to pass and receive your certificate. Please review the material and try again.';
    messageColor = 'error.main';
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <Card
        variant="outlined"
        sx={{ maxWidth: 800, margin: 'auto', mt: 4, p: 2, boxShadow: 3, marginBottom: 4 }}
      >
        <CardContent sx={{ textAlign: 'center', backgroundColor: 'background.default' }}>
          <Typography variant="h3" gutterBottom>
            Result
            <Box className="flex items-center text-base">
              <div className="bg-green-200 rounded-full h-4 w-4 mr-2" />
              <span>Correct Answer</span>
              <div className="bg-red-200 rounded-full h-4 w-4 mx-2" />
              <span>Wrong Answer</span>
            </Box>
          </Typography>

          <Divider sx={{ my: 2, backgroundColor: 'divider' }} />
          <Typography variant="h5" gutterBottom>
            {correctAnswers} / {questions.length}
          </Typography>
          <Typography variant="body1" color={messageColor} sx={{ mt: 2, mb: 3 }}>
            {message}
          </Typography>

          {isPassing && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Your certificate is valid for 1 year. You can view it in your account under Certificates.
            </Alert>
          )}

          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex' }} textAlign="center">
              <Typography variant="h6">Started on : </Typography>
              <Typography sx={{ pt: 0.4, pl: 1 }} variant="body1">
                {' '}
                {startTime}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex' }} textAlign="center">
              <Typography variant="h6">Completed on : </Typography>
              <Typography sx={{ pt: 0.4, pl: 1 }} variant="body1">
                {' '}
                {endTime}
              </Typography>
            </Box>
          </Box>
          <List sx={{ backgroundColor: 'background.paper' }}>
            {questions.map((q, i) => (
              <Accordion key={i} sx={{ my: 1 }}>
                <div
                  className={`rounded ${
                    answers[i] === q.correctAnswer
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${i}-content`}
                    id={`panel${i}-header`}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'left' }}>
                      {q.title}
                    </Typography>
                  </AccordionSummary>
                </div>
                <AccordionDetails>
                  <Box sx={{ width: '100%', textAlign: 'left' }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Your answer: <strong>{answers[i]}</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Correct answer: <strong>{q.correctAnswer}</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Description: <strong>{q.description}</strong>
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </List>
        </CardContent>
        <CardActions
          sx={{
            justifyContent: 'center',
            borderTop: '1px solid #ccc',
            p: 2,
            backgroundColor: 'background.default',
          }}
        >
          {isPassing ? (
            <Button href={paths.eLearning.account.vouchers} variant="contained">
              Certificates
            </Button>
          ) : (
            <>
              <Button
                onClick={restartQuiz}
                sx={{ bgcolor: '#FF774B', color: 'white', '&:hover': { bgcolor: '#FF5722' } }}
                variant="contained"
              >
                Retry
              </Button>
              <Button
                onClick={handleModalClose}
                variant="contained"
              >
                Close
              </Button>
            </>
          )}
        </CardActions>
      </Card>
    </div>
  );
};

Result.propTypes = {
  answers: PropTypes.array.isRequired,
  restartQuiz: PropTypes.func.isRequired,
  questions: PropTypes.array.isRequired,
  startTime: PropTypes.any,
  endTime: PropTypes.any,
  setPopupOpenOne: PropTypes.bool,
  handleModalClose: PropTypes.any,
  metaDataId: PropTypes.string,
  unitId: PropTypes.string,
};

export default Result;
