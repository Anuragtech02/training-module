import { useState, useEffect } from 'react';
// eslint-disable-next-line perfectionist/sort-imports
import { toast } from 'react-toastify';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase, { inputBaseClasses } from '@mui/material/InputBase';

import Image from 'src/components/image';
import { axiosClient } from 'src/utils/axiosClient';

// ----------------------------------------------------------------------

export default function ElearningNewsletter() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');

  useEffect(() => {
    const getCouponDiscount = async () => {
      const response = await axiosClient.get('/api/configuration?populate=*');
      const { coupons } = response.data.data.attributes;
      setCouponDiscount(coupons.percentage);
    };

    getCouponDiscount();
  }, []);

  const handleSubmit = async () => {
    const requestBody = {
      data: {
        email,
        name,
        source: 'training',
      },
    };
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
        body: JSON.stringify(requestBody),
      });
      setName('');
      setEmail('');
      toast.success('Email sent successfully', {
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
    } catch (error) {
      console.error(error);
      toast.error('Somthing went wrong', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    }
  };

  return (
    <Box
      sx={{
        py: { xs: 10, md: 8 },
        overflow: 'hidden',
        bgcolor: 'primary.lighter',
      }}
    >
      <Container>
        <Grid
          container
          spacing={{ xs: 5, md: 3 }}
          alignItems={{ md: 'center' }}
          justifyContent={{ md: 'space-between' }}
          direction={{ xs: 'column-reverse', md: 'row' }}
        >
          <Grid xs={12} md={5} sx={{ textAlign: 'center', color: 'grey.800' }}>
            <Typography variant="h3">
              Register Now Get {couponDiscount}% Discount For Every Course
            </Typography>

            <Typography sx={{ mt: 2.5, mb: 5 }}>
              Embark on our Administrator/Manager Training programs in Texas, offering flexible
              durations of 8, 12, or 16 hours.
            </Typography>

            <InputBase
              fullWidth
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              // endAdornment={
              //   <InputAdornment position="end">
              //     <Button color="secondary" size="large" variant="contained">
              //       Register
              //     </Button>
              //   </InputAdornment>
              // }
              sx={{
                pr: 0.5,
                pl: 1.5,
                height: 56,
                maxWidth: 560,
                borderRadius: 1,
                bgcolor: 'common.white',
                transition: (theme) => theme.transitions.create(['box-shadow']),
                [`&.${inputBaseClasses.focused}`]: {
                  boxShadow: (theme) => theme.customShadows.z4,
                },
              }}
            />
            <InputBase
              fullWidth
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              sx={{
                pr: 0.5,
                mt: 1,
                pl: 1.5,
                height: 56,
                maxWidth: 560,
                borderRadius: 1,
                bgcolor: 'common.white',
                transition: (theme) => theme.transitions.create(['box-shadow']),
                [`&.${inputBaseClasses.focused}`]: {
                  boxShadow: (theme) => theme.customShadows.z4,
                },
              }}
            />
            <Button
              color="secondary"
              size="large"
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => handleSubmit()}
            >
              Register
            </Button>
          </Grid>

          <Grid xs={12} md={5}>
            <Image
              alt="newsletter"
              src="/assets/illustrations/illustration_newsletter.svg"
              sx={{ maxWidth: 366, mx: 'auto' }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
