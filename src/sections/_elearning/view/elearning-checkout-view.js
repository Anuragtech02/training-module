'use client';

// import axios from 'axios';
import * as Yup from 'yup';
// import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
// eslint-disable-next-line import/no-extraneous-dependencies
import { loadStripe } from '@stripe/stripe-js';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
// import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// import { paths } from 'src/routes/paths';
// import Iconify from 'src/components/iconify';
import { useState } from 'react';

// import { useRouter } from 'src/routes/hooks';
import { useCartStore } from 'src/states/cart';
import { axiosClient } from 'src/utils/axiosClient';
// import { useBoolean } from 'src/hooks/use-boolean';
import FormProvider from 'src/components/hook-form';
import { useUserStore } from 'src/states/auth-store';
import { getCourseInfo } from 'src/queries/checkout';
import { SplashScreen } from 'src/components/loading-screen';

import ElearningNewsletter from '../elearning-newsletter';
// import ElearningCheckoutNewCardForm from '../checkout/elearning-checkout-new-card-form';
import ElearningCheckoutOrderSummary from '../checkout/elearning-checkout-order-summary';
// import ElearningCheckoutPaymentMethod from '../checkout/elearning-checkout-payment-method';
import ElearningCheckoutPersonalDetails from '../checkout/elearning-checkout-personal-details';

// ----------------------------------------------------------------------

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY);

// ----------------------------------------------------------------------

export default function ElearningCheckoutView({ courseId }) {
  const { UserData } = useUserStore();

  // const couponDiscount = localStorage.getItem('coupon');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [coursesData, setCoursesData] = useState([]);
  const [taxAmount, setTaxAmount] = useState(0);

  const queryRes = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseInfo(courseId),
    enabled: !!courseId,
  });
  const queryData = queryRes.data;
  const loading = queryRes.isLoading;

  const cartCourses = useCartStore((state) => state.cart);
  // const emptyCart = useCartStore((state) => state.emptyCart);
  const cart = useCartStore((state) => state.cart);

  const _courses = courseId ? [queryData] : cartCourses;
  // setCoursesData(_courses, { title: 'tax', price: taxAmount });
  console.log('courses', _courses);

  const cost = _courses?.map((course) => course?.attributes.price).reduce((a, b) => a + b, 0);
  const discountPercent = cost && 7;
  const taxPercent = cost && 18;

  const subTotal = cost;
  const discount = cost && cost * (discountPercent / -16.17);
  const tax = cost && cost * (taxPercent / 100);
  const total = cost;

  const products = _courses.map(({ id, attributes }) => ({
    id,
    title: attributes.title,
    price: attributes.price,
  }));

  const updatedProducts = [...products, { id: 'tax', title: 'tax', price: taxAmount }];

  const ElearningCheckoutSchema = Yup.object().shape({
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
    resolver: yupResolver(ElearningCheckoutSchema),
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

  if (loading) return <SplashScreen />;

  const userToken = localStorage.getItem('token');

  async function makePayment(data) {
    const stripe = await stripePromise;
    const requestBody = {
      username: UserData.username,
      email: UserData.email,
      products: updatedProducts,
      discount: Number(couponDiscount),
      user: UserData,
    };

    const response = await axiosClient.post('/api/orders', requestBody, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    await stripe.redirectToCheckout({
      sessionId: response.data.id,
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
        <Typography variant="h3" sx={{ mb: 5 }}>
          Checkout
        </Typography>

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
                setTaxAmount={setTaxAmount}
                setCouponDiscountone={setCouponDiscount}
                taxPercent={taxPercent}
                total={total}
                subtotal={subTotal}
                discount={discount}
                courses={_courses}
                loading={isSubmitting}
              />
            </Grid>
          </Grid>
        </FormProvider>
      </Container>

      <ElearningNewsletter />
    </>
  );
}

ElearningCheckoutView.propTypes = {
  courseId: PropTypes.string,
};

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
