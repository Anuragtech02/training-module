import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import 'react-toastify/dist/ReactToastify.css';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast, ToastContainer } from 'react-toastify';

import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

import Image from 'src/components/image';
import { useResponsive } from 'src/hooks/use-responsive';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export function bgGradient(props) {
  const direction = props?.direction || 'to bottom';
  const startColor = props?.startColor;
  const endColor = props?.endColor;
  // const imgUrl = props?.imgUrl;
  // const color = props?.color;

  // if (imgUrl) {
  //   return {
  //     background: `linear-gradient(${direction}, ${startColor || color}, ${
  //       endColor || color
  //     }), url(${imgUrl})`,
  //     backgroundSize: 'cover',
  //     backgroundRepeat: 'no-repeat',
  //     backgroundPosition: 'center center',
  //   };
  // }

  return {
    background: `linear-gradient(${direction}, ${startColor}, ${endColor})`,
  };
}

export default function ElearningReviewForm({ setReviewOpen }) {
  const mdUp = useResponsive('up', 'md');
  const theme = useTheme();

  const ElearningContactSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    email: Yup.string().required('Email is required').email('That is not an email'),
    subject: Yup.string().required('Subject is required'),
    message: Yup.string().required('Message is required'),
  });

  const ELearningReviewSchema = Yup.object().shape({
    name: Yup.string().required('Full name is required'),
    company: Yup.string().required('Compnay is required'),
    review: Yup.string().required('Review is required'),
  });

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '1px solid #000',
    borderRadius: '10px',
    boxShadow: 10,
    p: 4,
  };
  const defaultValues = {
    fullName: '',
    subject: '',
    email: '',
    message: '',
  };

  const reviewDefaultValues = {
    name: '',
    company: '',
    designation: '',
    review: '',
  };

  const methods = useForm({
    resolver: yupResolver(ElearningContactSchema),
    defaultValues,
  });

  const reviewMethods = useForm({
    resolver: yupResolver(ELearningReviewSchema),
    reviewDefaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = reviewMethods;

  const onReviewSubmit = handleSubmit(async (data) => {
    const requestBody = {
      data: {
        name: data.name,
        company: data.company,
        designation: data.designation,
        review: data.review,
        source: 'training',
      },
    };
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
        body: JSON.stringify(requestBody),
      });
      toast.success('Thank you for submitting review', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
      const resData = await response.json();
      reset();
      setReviewOpen(false);
    } catch (error) {
      toast.error('error, please try again', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
      console.error(error);
    }
  });

  return (
    <Box style={style} sx={{ bgcolor: 'background.neutral', p: 4 }}>
      <Typography sx={{ mb: 4 }} variant="h3">
        Drop a Review For us
      </Typography>
      <FormProvider methods={reviewMethods} onSubmit={onReviewSubmit}>
        <Stack spacing={2.5} alignItems="flex-start">
          <RHFTextField name="name" label="Name" />

          <RHFTextField name="company" label="Company" />

          <RHFTextField name="designation" label="Designation" />

          <RHFTextField name="review" multiline rows={4} label="Review" sx={{ pb: 2.5 }} />
        </Stack>

        <Button
          // size="large"
          type="submit"
          variant="contained"
          color="secondary"
          // loading={isSubmitting}
          sx={{
            mx: 16,
          }}
        >
          submit
        </Button>
      </FormProvider>
    </Box>
  );
}

ElearningReviewForm.propTypes = {
  setReviewOpen: PropTypes.bool,
};
