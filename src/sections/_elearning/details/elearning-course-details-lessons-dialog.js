'use client';

import axios from 'axios';
import PropTypes from 'prop-types';
import { Global } from '@emotion/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from 'react-query';

import Stack from '@mui/material/Stack';
import { Box, styled } from '@mui/system';
import { grey } from '@mui/material/colors';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { Link, Button, Divider } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
// import Dialog from '@mui/material/Dialog';
import ListItemButton from '@mui/material/ListItemButton';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import AccordionDetails from '@mui/material/AccordionDetails';
import Accordion, { accordionClasses } from '@mui/material/Accordion';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import AccordionSummary, { accordionSummaryClasses } from '@mui/material/AccordionSummary';

import Quiz from 'src/sections/quiz';
import { paths } from 'src/routes/paths';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// import { paths } from 'src/routes/paths';
// import Player from 'src/components/player';
import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';
import { getUnitData } from 'src/queries/unit';
import { RouterLink } from 'src/routes/components';
import NumberDone from 'src/components/NumberDone';
import { useUserStore } from 'src/states/auth-store';
import { useDebounce } from 'src/hooks/use-debounce';
import { quizProgress } from 'src/states/quiz-progress';
import { useResponsive } from 'src/hooks/use-responsive';
import { useUserProgress } from 'src/states/user-progress';
// import PostTags from '../../blog/common/post-tags';

// ----------------------------------------------------------------------

const categoryMapping = {
  2: 'Basic',
  3: 'Advanced',
  4: 'Basic & Beyond',
};

export default function ElearningCourseDetailsLessonsDialog({
  selectedLesson,
  onSelectedLesson,
  // open,
  onClose,
  playing,
  onReady,
  onEnded,
  onPlay,
  onPause,
  units,
  // pauseVideo,
  hasBoughtCourse,
  courseTitle,
  courseQuiz,
  params,
}) {
  const mdUp = useResponsive('up', 'md');
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState(Array(units?.length).fill(false));

  const [userLessonData, setUserLessonData] = useState([]);
  const [metaDataId, setMetaDataId] = useState(null);

  const searchParams = useSearchParams();

  const userLessons = useUserProgress((state) => state.lessons);
  const addToLessons = useUserProgress((state) => state.addToLessons);
  const updateLessons = useUserProgress((state) => state.updateLessons);

  const isQuizOpen = quizProgress((state) => state.isQuizOpen);

  // const query = router.query;
  // const reset = useUserProgress((state) => state.reset);
  // console.log({ userLessons });

  const scoreFinalQuiz = true; // Only final quiz creates records
  const scoreUnitQuiz = false; // Unit quizzes don't create records

  const { data: lessonData, isLoading } = useQuery({
    queryKey: ['unit', searchParams.get('unit'), searchParams.get('lesson')],
    queryFn: () =>
      getUnitData(Number(searchParams.get('unit')), String(searchParams.get('lesson'))),
    refetchOnWindowFocus: !isQuizOpen,
  });

  const { data: userProgressData } = useQuery({
    queryKey: ['userProgress'],
    queryFn: () => getUserProgress(),
    enabled: !!lessonData?.id,
    refetchOnWindowFocus: !isQuizOpen,
  });

  const { title, subtitle, content, id } = lessonData ?? {};
  const time = content && Math.round(content.replace(/<[^>]+>/g, '').split(' ').length / 250);
  const debouncedValue = useDebounce(id, 3000);

  const { data: addUserProgress, refetch } = useQuery({
    queryKey: ['userAddProgress', debouncedValue],
    queryFn: () => addingUserProgress(),
    enabled: false,
    refetchOnWindowFocus: !isQuizOpen,
  });

  const { data: updateUserProgress } = useQuery({
    queryKey: ['updateUserProgress', debouncedValue],
    queryFn: () => addingLessonToUser(),
    enabled: !!debouncedValue,
    refetchOnWindowFocus: !isQuizOpen,
  });

  useEffect(() => {
    if (!units) return;
    // reset();
    const idx = units?.findIndex((unit) => unit.id === searchParams.get('unit'));
    setExpandedUnits((prev) => prev.map((_, index) => index === idx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, searchParams]);

  // useEffect(() => {
  //   // addToLessons(debouncedValue);
  //   // if (debouncedValue) {b
  //   handleClick();
  //   // }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [debouncedValue]);

  const { UserData } = useUserStore();

  const toggleDrawer = (value) => {
    setDrawerOpen(value);
  };

  const userToken = localStorage.getItem('token');

  const getUserProgress = async (lesson) => {
    try {
      const res = await axios.get(process.env.NEXT_PUBLIC_METADATA_URL, {
        // method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });

      res?.data.forEach((list) => {
        setMetaDataId(list);
        setUserLessonData(
          list.data.map((l) => ({
            LessonTitle: l.LessonTitle,
            course_id: l.course_id,
            unitId: l.unitId,
          }))
        );
      });
      if (res.data.length === 0) {
        refetch();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const addingLessonToUser = async () => {
    // console.log({ lessonId });
    // const requiredData = [...new Set([...userLessonData, { LessonTitle: id }])];
    const isMetaDataExisting = userLessonData.filter((details) => details.LessonTitle === id);
    const requiredData = [...userLessonData, { LessonTitle: id, course_id: params.id }];
    if (isMetaDataExisting.length > 0 || !metaDataId) return;
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
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    } catch (error) {
      console.log(error);
    }
  };

  const addingUserProgress = async () => {
    // controller.abort();
    console.log('add user to data');

    const requestBody = {
      data: {
        users: {
          connect: [UserData.id],
        },
        data: [
          {
            LessonTitle: id,
            course_id: params.id,
          },
        ],
      },
    };

    try {
      await axios.post(
        process.env.NEXT_PUBLIC_METADATA_URL,
        requestBody,

        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    } catch (error) {
      console.log(error);
    }
  };

  const handleClick = () => {
    // const isMetaDataExisting = userLessons.filter((details) => details.LessonTitle === id);
    // if (!metaDataId) {
    //   console.log('1');
    //   console.log('lesson_1', id);
    //   // addingUserProgress();
    //   // refetch();
    // } else {
    //   // setMetaData([...metaData, { LessonTitle: lesson.title }]);
    //   console.log('2');
    //   console.log('lesson_2', id);
    //   addingLessonToUser();
    // }
    // addToLessons(debouncedValue);
  };

  const StyledBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
  }));

  const Puller = styled(Box)(({ theme }) => ({
    width: 30,
    height: 6,
    backgroundColor: theme.palette.mode === 'light' ? grey[300] : grey[900],
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 15px)',
  }));

  const drawerBleeding = 56;

  const totalLessons = units?.reduce(
    (count, unit) => (unit.attributes.lesson ? count + unit.attributes.lesson.length : count),
    0
  );

  const renderLesson = (
    <Container
      sx={{
        maxHeight: '100vh',
        overflowY: 'scroll',
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
          width: '0.4em',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#888',
          borderRadius: '6px',
          '&:hover': {
            backgroundColor: '#a0a0a0',
          },
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '6px',
          '&:hover': {
            backgroundColor: '#e6e6e6',
          },
        },
      }}
    >
      <Grid container spacing={3} justifyContent={{ md: 'center' }}>
        <Grid xs={12} md={10}>
          <Stack
            sx={{
              pb: 4,
              textAlign: 'center',
              pt: { xs: 6, md: 4 },
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              {time} mins read
            </Typography>

            <Typography
              variant="h2"
              component="h1"
              // onClick={() => handleClick()}
            >
              {title}
            </Typography>

            <Typography variant="h5">{subtitle}</Typography>
          </Stack>

          <Divider sx={{ mb: 6 }} />

          <Markdown content={content} />
        </Grid>
      </Grid>
    </Container>
  );

  const unitList = units?.map((unit, index) => {
    const idx = units?.findIndex((unitData) => unitData.id === searchParams.get('unit'));
    const hasUnit = Boolean(userLessonData.find((a) => a.unitId === unit.id));
    console.log(userLessonData);

    console.log('hasUnit', hasUnit);

    return (
      <Accordion
        key={unit.id}
        expanded={expandedUnits[index]}
        onChange={() => {
          const newExpandedUnits = [...expandedUnits];
          newExpandedUnits[index] = !expandedUnits[index];
          setExpandedUnits(newExpandedUnits);
        }}
        sx={{
          [`&.${accordionClasses.expanded}`]: {
            borderRadius: 0,
          },
        }}
      >
        <AccordionSummary
          sx={{
            pr: 1,
            pl: 2,
            minHeight: { xs: 40, md: 64 },
            // maxWidth: 450,
            mr: 2,
            ...(unit.attributes.lesson.includes(selectedLesson) && {
              color: '#0D5992',
            }),
            [`&.${accordionSummaryClasses.content}`]: {
              p: 0,
              m: 0,
            },
            [`&.${accordionSummaryClasses.expanded}`]: {
              bgcolor: 'action.selected',
            },
          }}
        >
          <img src="/icons/book.svg" alt="unit" />

          <Grid container direction="column" spacing={1}>
            <Grid item>
              <Typography
                variant="subtitle1"
                sx={{
                  pl: 2,
                  flexGrow: 1,
                }}
              >
                {unit.attributes.title}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1" sx={{ paddingLeft: 2, color: 'text.disabled' }}>
                {unit.attributes.time} minutes
              </Typography>
            </Grid>
          </Grid>

          <Iconify
            icon={expandedUnits[index] ? 'carbon:chevron-down' : 'carbon:chevron-right'}
            sx={{ ml: 2, minHeight: 16, minWidth: 16 }}
          />
        </AccordionSummary>

        <AccordionDetails
          sx={{
            p: 2,
            typography: 'body',
            color: 'text.secondary',
          }}
          className="ml-3"
        >
          {unit.attributes.lesson.map((lesson, value) => {
            const selected = selectedLesson?.id === lesson.id;

            lesson.unLocked = true;
            // const filterData = metaData?.filter((l) => l.LessonTitle !== lesson?.title);
            // const hasMatch = Boolean(userLessons.find((a) => a.LessonTitle === id));

            const hasMatch = Boolean(userLessonData.find((a) => a.LessonTitle === lesson.id));

            // console.log({ hasMatch });

            return (
              <Link
                component={RouterLink}
                href={`?unit=${unit.id}&lesson=${lesson.title}`}
                color="inherit"
                underline="none"
              >
                <ListItemButton
                  key={lesson.title}
                  selected={selected}
                  disabled={!lesson.unLocked}
                  onClick={() => onSelectedLesson(lesson)}
                  sx={{ borderRadius: 1, maxHeight: '6rem' }}
                >
                  <Typography sx={{ mr: 2, ...(selected && { color: 'primary.main' }) }}>
                    <NumberDone
                      index={value}
                      sx={{ ml: 2 }}
                      lessonComplete={hasMatch}

                      // lessonComplete={metaData?.filter((l) => l.LessonTitle === lesson?.title)}
                    />
                  </Typography>

                  <ListItemText
                    // onClick={() => handleClick(lesson)}
                    primary={lesson.title}
                    secondary={lesson.description}
                    primaryTypographyProps={{
                      typography: 'subtitle1',
                      sx: {
                        ...(selected && {
                          color: 'primary.main',
                        }),
                      },
                    }}
                    secondaryTypographyProps={{
                      noWrap: true,
                      component: 'span',
                    }}
                  />
                </ListItemButton>
              </Link>
            );
          })}
          {/* <div style={{ backgroundColor: hasUnit ? 'black' : 'white' }}> */}
          <Quiz
            unitId={unit.id}
            metaDataId={metaDataId}
            userLessonData={userLessonData}
            _questions={unit?.attributes?.quiz}
            courseName={courseTitle}
            score={scoreUnitQuiz}
            hasBoughtCourse={hasBoughtCourse}
            title={hasUnit ? 'Attempted. Click To Retry' : 'Start Test'}
          />
          {/* </div> */}
        </AccordionDetails>
      </Accordion>
    );
  });

  const renderListDesktop = (
    <Stack
      spacing={0.5}
      sx={{
        p: 1,
        overflowY: 'scroll',
        maxWidth: 450,
        maxHeight: '100vh',
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
          width: '0.4em',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#888',
          borderRadius: '6px',
          '&:hover': {
            backgroundColor: '#a0a0a0',
          },
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '6px',
          '&:hover': {
            backgroundColor: '#e6e6e6',
          },
        },
      }}
    >
      {unitList}
      <Quiz
        _questions={courseQuiz}
        courseName={courseTitle}
        score={scoreFinalQuiz}
        courseId={params.id}
        hasBoughtCourse={hasBoughtCourse}
        finalQuiz
        title="Final Test"
      />
    </Stack>
  );

  const renderListMobile = (
    <>
      <Global
        styles={{
          '.MuiDrawer-root > .MuiPaper-root': {
            height: `calc(80% - ${drawerBleeding}px)`,
            overflow: 'visible',
          },
        }}
      />
      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
        onOpen={() => toggleDrawer(true)}
        swipeAreaWidth={drawerBleeding}
        disableSwipeToOpen={false}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <StyledBox
          sx={{
            position: 'absolute',
            top: -drawerBleeding,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            visibility: 'visible',
            right: 0,
            left: 0,
          }}
        >
          <Puller />
          <Typography sx={{ p: 2, color: 'text.secondary' }}>
            {units.length} units, {totalLessons} lessons
          </Typography>
        </StyledBox>
        <StyledBox
          sx={{
            px: 2,
            pb: 2,
            height: '100%',
            overflow: 'auto',
          }}
        >
          {unitList}
        </StyledBox>
      </SwipeableDrawer>
    </>
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const LinearProgressWithLabel = (props) => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          // eslint-disable-next-line react/destructuring-assignment, react/prop-types
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );

  return (
    <Stack sx={{ height: '100%', overflow: 'hidden', mb: 8 }}>
      <Stack
        direction="row"
        // spacing={2}
        justifyContent="space-between"
        sx={{ py: 2, px: 4, pt: 0, pb: 1 }}
        // direction="column-reverse"
        // sx={{ position: 'fixed', top: 100, left: 24, height: '4rem', maxWidth: 1150, width: '21%' }}
      >
        <Box
          sx={{
            border: 1,
            borderRadius: 1,
            borderColor: '#ff541e',
            px: 2,
            py: 1,
            left: 24,
            width: '30%',
          }}
        >
          <Typography>
            <Box display="flex" alignItems="center">
              <Typography fontWeight={600} fontSize="1rem" paddingRight={1}>
                Progress:
              </Typography>
              <Typography color="#ff541e">
                {userLessonData.filter((data) => data.course_id === params.id).length}/
                {totalLessons}
              </Typography>
              <Typography fontSize="0.9rem" paddingLeft={1}>
                lessons finished
              </Typography>
            </Box>
          </Typography>
          <LinearProgressWithLabel
            value={
              (userLessonData.filter((data) => data.course_id === params.id).length /
                totalLessons) *
              100
            }
          />
        </Box>
        <Link component={RouterLink} href="../" color="inherit" sx={{}}>
          <Button
            onClick={onClose}
            // sx={{
            //   top: 66,
            //   right: { xs: 4, md: 28 },
            //   // zIndex: 9,
            //   // bgcolor: 'black',
            //   bgcolor: 'action.selected',
            //   // color: 'white',
            //   position: 'absolute',
            //   mt: 2,
            // }}
          >
            <ArrowBackIosNewOutlinedIcon fontSize="medium" sx={{ pr: 1 }} />
            {courseTitle.title}
          </Button>
        </Link>
      </Stack>

      <Stack direction={{ xs: 'column-reverse', md: 'row' }}>
        {mdUp ? renderListDesktop : renderListMobile}
        {!!lessonData && renderLesson}
      </Stack>
    </Stack>
  );
}

ElearningCourseDetailsLessonsDialog.propTypes = {
  onClose: PropTypes.func,
  onEnded: PropTypes.func,
  onPause: PropTypes.func,
  onPlay: PropTypes.func,
  onReady: PropTypes.func,
  onSelectedLesson: PropTypes.func,
  // open: PropTypes.bool,
  playing: PropTypes.bool,
  selectedLesson: PropTypes.object,
  units: PropTypes.array,
  // pauseVideo: PropTypes.func,
  hasBoughtCourse: PropTypes.bool,
  params: PropTypes.object,
  courseTitle: PropTypes.string,
  courseQuiz: PropTypes.array,
};
