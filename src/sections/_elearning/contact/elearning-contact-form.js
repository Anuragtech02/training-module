import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import 'react-toastify/dist/ReactToastify.css';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast, ToastContainer } from 'react-toastify';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
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

export default function ElearningContactForm() {
  const mdUp = useResponsive('up', 'md');
  const theme = useTheme();

  const ElearningContactSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    email: Yup.string().required('Email is required').email('That is not an email'),
    subject: Yup.string().required('Subject is required'),
    message: Yup.string().required('Message is required'),
  });

  const defaultValues = {
    fullName: '',
    subject: '',
    email: '',
    message: '',
  };

  const methods = useForm({
    resolver: yupResolver(ElearningContactSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const requestBody = {
      data: {
        fullname: data.fullName,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    };
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
        body: JSON.stringify(requestBody),
      });
      toast.success('Thank you for contacting us', {
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
    <Box
      sx={{
        bgcolor: 'background.neutral',
        // ...bgGradient({
        //   endColor: '#FFCEBD',
        //   startColor: '#f7f5f4',
        //   color: alpha(theme.palette.background.default, 0.1),
        //   // imgUrl: '/assets/background/overlay_3.jpg',
        // }),
        py: { xs: 10, md: 10 },
      }}
    >
      <Container>
        <Grid container spacing={3} justifyContent="space-between">
          {mdUp && (
            <Grid xs={12} md={6} lg={5}>
              <Image
                alt="contact"
                src="/assets/illustrations/illustration_courses_contact.svg"
                sx={{ maxWidth: 260 }}
              />
            </Grid>
          )}

          <Grid xs={12} md={6} lg={6}>
            <Stack
              spacing={2}
              sx={{
                mb: 5,
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <Typography variant="h3">Drop us a line</Typography>

              <Typography>We normally respond within 2 business days</Typography>
            </Stack>

            <FormProvider methods={methods} onSubmit={onSubmit}>
              <Stack spacing={2.5} alignItems="flex-start">
                <RHFTextField name="fullName" label="Full name" />

                <RHFTextField name="email" label="Email" />

                <RHFTextField name="subject" label="Subject" />

                <RHFTextField name="message" multiline rows={4} label="Message" sx={{ pb: 2.5 }} />
              </Stack>

              <LoadingButton
                size="large"
                type="submit"
                variant="contained"
                color="secondary"
                loading={isSubmitting}
                sx={{
                  mx: { xs: 'auto !important', md: 'unset !important' },
                }}
              >
                Send Request
              </LoadingButton>
            </FormProvider>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
