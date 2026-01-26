'use client';

import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { loadStripe } from '@stripe/stripe-js';
import { useSearchParams } from 'next/navigation';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import FormProvider from 'src/components/hook-form';
import { getCourseInfo } from 'src/queries/checkout';
import { useUserStore } from 'src/states/auth-store';
import { SplashScreen } from 'src/components/loading-screen';

import ElearningNewsletter from '../elearning-newsletter';
import ElearningCheckoutOrderSummary from '../checkout/elearning-checkout-order-summary';
import ElearningCheckoutPersonalDetails from '../checkout/elearning-checkout-personal-details';

// ----------------------------------------------------------------------

const stripePromise = loadStripe(
  'pk_test_51O14wJSGKNDRcuJuUqGzWCeftvJOpycOZUjVgL5BoNzq82clRNztJYpNZw2mdqFtZrkRCCZVbIpSHSqYTIRpJe6t00WaGaXnpK'
);

// ----------------------------------------------------------------------

export default function ElearningRenewalView() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course');

  const { UserData } = useUserStore();

  const queryRes = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseInfo(courseId),
    enabled: !!courseId,
  });
  const queryData = queryRes.data;
  const loading = queryRes.isLoading;

  const _courses = queryData ? [queryData] : [];

  const cost = _courses?.map((course) => course?.attributes?.price).reduce((a, b) => a + b, 0);
  const discountPercent = cost && 7;
  const taxPercent = cost && 18;

  const subTotal = cost;
  const discount = cost && cost * (discountPercent / -16.17);
  const tax = cost && cost * (taxPercent / 100);
  const total = cost && subTotal + discount + tax;

  const RenewalCheckoutSchema = Yup.object().shape({
    userName: Yup.string(),
    emailAddress: Yup.string(),
    phoneNumber: Yup.string().required('Phone number is required'),
  });

  const defaultValues = {
    userName: '',
    emailAddress: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    paymentMethods: '',
    newCard: {
      cardNumber: '',
      cardHolder: '',
      expirationDate: '',
      ccv: '',
    },
  };

  const methods = useForm({
    resolver: yupResolver(RenewalCheckoutSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      makePayment(data);
    } catch (error) {
      console.error(error);
    }
  });

  if (!courseId) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Invalid Renewal Link
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Please use the link provided in your certificate expiry email.
        </Typography>
      </Container>
    );
  }

  if (loading) return <SplashScreen />;

  const userToken = localStorage.getItem('token');

  async function makePayment(data) {
    const stripe = await stripePromise;
    const requestBody = {
      username: UserData.username,
      email: UserData.email,
      products: _courses.map(({ id, attributes }) => ({
        id,
        title: attributes.title,
        price: attributes.price,
      })),
    };

    const response = await fetch(process.env.NEXT_PUBLIC_ORDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(requestBody),
    });
    const session = await response.json();
    await stripe.redirectToCheckout({
      sessionId: session.id,
    });
  }

  return (
    <>
      <Container
        sx={{
          overflow: 'hidden',
          pt: 5,
          pb: { xs: 5, md: 10 },
        }}
      >
        <Typography variant="h3" sx={{ mb: 2 }}>
          Certificate Renewal
        </Typography>

        <Alert severity="warning" sx={{ mb: 4 }}>
          Your certificate for this course has expired or is about to expire. Re-enroll now to
          regain access and renew your certification.
        </Alert>

        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid container spacing={{ xs: 5, md: 8 }}>
            <Grid xs={12} md={8}>
              <Stack spacing={5} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                <div>
                  <StepLabel title="Personal Details" step="1" />
                  <ElearningCheckoutPersonalDetails />
                </div>
              </Stack>
            </Grid>

            <Grid xs={12} md={4}>
              <ElearningCheckoutOrderSummary
                taxPercent={taxPercent}
                total={total}
                subtotal={subTotal}
                discount={discount}
                courses={_courses}
                loading={isSubmitting}
                buttonLabel="Re-enroll Now"
              />
            </Grid>
          </Grid>
        </FormProvider>
      </Container>

      <ElearningNewsletter />
    </>
  );
}

// ----------------------------------------------------------------------

function StepLabel({ step, title }) {
  return (
    <Stack direction="row" alignItems="center" sx={{ mb: 3, typography: 'h6' }}>
      <Box
        sx={{
          mr: 1.5,
          width: 28,
          height: 28,
          flexShrink: 0,
          display: 'flex',
          typography: 'h6',
          borderRadius: '50%',
          alignItems: 'center',
          bgcolor: 'primary.main',
          justifyContent: 'center',
          color: 'primary.contrastText',
        }}
      >
        {step}
      </Box>
      {title}
    </Stack>
  );
}

StepLabel.propTypes = {
  step: PropTypes.string,
  title: PropTypes.string,
};
